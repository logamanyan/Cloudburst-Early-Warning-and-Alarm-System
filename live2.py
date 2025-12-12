#!/usr/bin/env python3
"""
Live prediction backend (live2.py) — updated:
- Node 2: BMP280 (temp+pressure) uses API humidity
- Adds humidity_api from Tomorrow.io
- Calculates altitude from pressure for both nodes
- Writes prediction records to Influx (predictions)
- Returns altitude in JSON
Port: 5003
"""

import os
import time
import requests
import numpy as np
import pandas as pd
from datetime import datetime
from threading import Lock
from flask import Flask, jsonify
from flask_cors import CORS

from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
import paho.mqtt.client as mqtt
from tensorflow.keras.models import load_model
import joblib

# ----------------- CONFIG -----------------
MODEL_PATH = "cloudburst_model_v4.keras"
SCALER_PATH = "cloudburst_scaler_v4.gz"

INFLUX_URL = "https://us-east-1-1.aws.cloud2.influxdata.com"
INFLUX_TOKEN = "JwUmRiAPzZqy6MebKnCknAEeqM8DuLDQIcskxKeMwUmD1elxsCHRKoU0D4PYAhEEbkVhVmP3cRVz3nf6-8Le2g=="
INFLUX_ORG = "cloudburst"

NODE_CONFIG = {
    "1": {"bucket": "node1", "measurement": "lorawan_data", "lat": 18.495277, "lon": 74.021388, "name": "Node 1 - Pune"},
    "2": {"bucket": "node2", "measurement": "lorawan_node", "lat": 30.7280, "lon": 78.4430, "name": "Node 2 - Uttarkashi"}
}

# HiveMQ Cloud Secure Broker (fill in real credentials)
MQTT_BROKER = "d797988ab08841459e366cdaa3ab7482.s1.eu.hivemq.cloud"
MQTT_PORT = 8883
MQTT_USERNAME = "telegraf_user"      # <<< replace if needed
MQTT_PASSWORD = "Codefornation1$"    # <<< replace if needed
MQTT_TOPIC = "lorawan/prediction"

FEATURES = [
    "surface_pressure","rain","temperature_2m","relative_humidity_2m",
    "dew_point_2m","cloud_cover","wind_direction_10m","wind_speed_10m"
]

# ----------------- APP INIT -----------------
app = Flask(__name__)
CORS(app)

# ----------------- Model Load -----------------
predict_lock = Lock()
try:
    model = load_model(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("✅ Live: Model & Scaler loaded")
except Exception as e:
    model = None
    scaler = None
    print("⚠️ Live: Running with mock predictions:", e)

# ----------------- Influx Init -----------------
try:
    influx = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
    write_api = influx.write_api(write_options=SYNCHRONOUS)
    query_api = influx.query_api()
    print("✅ Live: Influx connected")
except Exception as e:
    influx = None
    write_api = None
    query_api = None
    print("❌ Influx init failed:", e)

# ----------------- MQTT (TLS ENABLED) -----------------
mqtt_client = mqtt.Client(client_id="live_predictor", clean_session=True)
try:
    mqtt_client.tls_set()
    mqtt_client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
    mqtt_client.loop_start()
    print("✅ Live: Secure MQTT Connected (TLS 8883)")
except Exception as e:
    print("❌ Live MQTT connection failed:", e)

# ----------------- Helper Functions -----------------
def dew_point(T, RH):
    try:
        b, c = 17.625, 243.04
        gamma = (b*T)/(c+T) + np.log(RH/100.0)
        return (c*gamma)/(b-gamma)
    except Exception:
        return None

def _pick_value(values, candidates, default=0.0):
    for key in candidates:
        if key in values and values[key] is not None:
            try:
                return float(values[key])
            except:
                try:
                    return float(values[key].get("value", default))
                except:
                    pass
    return default

def get_sensor_from_influx(node_id):
    """
    Read latest sensor row for the given node.
    Node 2 (BMP280) lacks humidity — we return humidity=None so caller can override with API humidity.
    """
    cfg = NODE_CONFIG.get(str(node_id))
    if not cfg or query_api is None:
        return None

    q = f'''
    from(bucket: "{cfg["bucket"]}")
      |> range(start: -20m)
      |> filter(fn: (r) => r._measurement == "{cfg["measurement"]}")
      |> last()
    '''
    try:
        res = query_api.query(q)
        if not res:
            return None

        values = {}
        for table in res:
            for rec in table.records:
                try:
                    f = rec.get_field()
                    v = rec.get_value()
                    values[f] = v
                except:
                    rv = getattr(rec, "values", None) or {}
                    _field = rv.get("_field")
                    _val = rv.get("_value")
                    if _field:
                        values[_field] = _val
                    else:
                        for k, vv in rv.items():
                            if not k.startswith("_"):
                                values[k] = vv

        temp = _pick_value(values, ["temperature", "temp", "tempC", "temperature_C", "t"], default=0.0)
        hum = _pick_value(values, ["humidity", "hum", "relative_humidity", "rh", "humidity_pct"], default=None)
        pres = _pick_value(values, ["pressure", "pres", "baro", "pressure_hpa"], default=0.0)

        # If node 2 uses BMP280 (no humidity), return humidity=None to force API humidity replacement
        if str(node_id) == "2":
            return {
                "temp": float(temp),
                "humidity": None,
                "pressure": float(pres)
            }

        return {
            "temp": float(temp),
            "humidity": float(hum) if hum is not None else None,
            "pressure": float(pres)
        }
    except Exception as e:
        print("Influx error:", e)
        return None

# -------------- Tomorrow.io Integration ----------------
TOMORROW_KEY = os.environ.get("TOMORROW_KEY", "H3xGnfgLw4OgmMZIIWuag0kBbVBqxMKJ")

def get_openweather(lat, lon):
    """
    Realtime call to Tomorrow.io returning core + extra fields.
    Includes humidity (as humidity_api), cloudBase/cloudCeiling/visibility converted to meters.
    """
    try:
        fields = ",".join([
            "cloudCover", "precipitationIntensity",
            "windSpeed", "windDirection",
            "cloudBase", "cloudCeiling", "visibility", "windGust",
            "humidity"  # request humidity from API
        ])

        url = (
            "https://api.tomorrow.io/v4/weather/realtime?"
            f"location={lat},{lon}&fields={fields}&apikey={TOMORROW_KEY}"
        )

        r = requests.get(url, timeout=6)
        r.raise_for_status()
        js = r.json()
        data = js.get("data", {}).get("values", {})

        def km_to_m(v):
            if v is None:
                return None
            try:
                return float(v) * 1000.0
            except:
                return None

        cloud_base_km = data.get("cloudBase", None)
        cloud_ceiling_km = data.get("cloudCeiling", None)
        visibility_km = data.get("visibility", None)

        cloud_base_m = km_to_m(cloud_base_km)
        cloud_ceiling_m = km_to_m(cloud_ceiling_km)
        visibility_m = km_to_m(visibility_km)

        humidity_api = data.get("humidity", None)

        return {
            "cloud_cover": data.get("cloudCover", 0),
            "rain": data.get("precipitationIntensity", 0),
            "wind_speed": data.get("windSpeed", 0),
            "wind_dir": data.get("windDirection", 0),
            "cloud_base_m": cloud_base_m,
            "cloud_ceiling_m": cloud_ceiling_m,
            "visibility_m": visibility_m,
            "wind_gust": data.get("windGust", 0),
            "humidity_api": humidity_api
        }
    except Exception as e:
        print("Tomorrow.io API error:", e)
        return {"cloud_cover":0, "rain":0, "wind_speed":0, "wind_dir":0,
                "cloud_base_m": None, "cloud_ceiling_m": None, "visibility_m": None, "wind_gust": 0,
                "humidity_api": None}

def get_openmeteo_history(lat, lon):
    try:
        end = pd.Timestamp.utcnow().floor("h")
        start = end - pd.Timedelta(hours=47)
        url = (
            "https://archive-api.open-meteo.com/v1/archive?"
            f"latitude={lat}&longitude={lon}"
            f"&start_date={start.date()}&end_date={end.date()}"
            "&hourly=surface_pressure,rain,temperature_2m,"
            "relative_humidity_2m,dew_point_2m,cloud_cover,"
            "wind_direction_10m,wind_speed_10m"
        )
        r = requests.get(url, timeout=6)
        r.raise_for_status()
        js = r.json()
        if "hourly" not in js:
            return pd.DataFrame()
        df = pd.DataFrame(js["hourly"])
        df["time"] = pd.to_datetime(df["time"])
        df = df.interpolate().ffill().bfill()
        return df.tail(47)
    except Exception as e:
        print("Open-Meteo history error:", e)
        return pd.DataFrame()

def prepare_model_input(df_hist, live_row):
    df48 = pd.concat([df_hist, live_row]).tail(48).reset_index(drop=True)
    dfnum = df48[FEATURES].apply(pd.to_numeric, errors="coerce").fillna(0)

    if scaler is None:
        return np.zeros((1,48,1,1,len(FEATURES))), df48

    scaled = scaler.transform(dfnum.values)
    x = scaled.reshape(1,48,1,1,len(FEATURES))
    return x, df48

def model_predict(x):
    if model is None:
        return float(0.1)
    with predict_lock:
        return float(model.predict(x, verbose=0)[0][0])

# ----------------- Risk Adjustment (post-processing) -----------------
def adjust_risk(base_prob, cloud_base_m=None, cloud_ceiling_m=None, visibility_m=None, wind_gust=None):
    risk = float(base_prob)

    if cloud_base_m is not None:
        if cloud_base_m < 1000:
            risk += 0.10
        elif cloud_base_m < 1500:
            risk += 0.05

    if cloud_ceiling_m is not None:
        if cloud_ceiling_m < 2000:
            risk += 0.08
        elif cloud_ceiling_m < 3000:
            risk += 0.04

    if visibility_m is not None:
        if visibility_m < 1000:
            risk += 0.10
        elif visibility_m < 3000:
            risk += 0.05

    if wind_gust is not None:
        try:
            wg = float(wind_gust)
            if wg > 15:
                risk += 0.12
            elif wg > 10:
                risk += 0.06
        except:
            pass

    risk = min(max(risk, 0.0), 1.0)
    return risk

# ----------------- Altitude Calculation -----------------
def calculate_altitude(pressure_hpa):
    """
    Barometric formula (approx):
    altitude (m) = 44330 * (1 - (P / P0)^(1/5.255))
    where P0 = 1013.25 hPa (sea level standard)
    """
    try:
        if pressure_hpa is None or pressure_hpa <= 0:
            return None
        return 44330.0 * (1.0 - (pressure_hpa / 1013.25) ** 0.1903)
    except Exception:
        return None

# ----------------- Influx logger for calibration -----------------
def write_prediction_to_influx(node_id, base_prob, final_prob, ext, altitude):
    """
    Writes a small prediction record to the node's bucket under measurement 'predictions'
    """
    if write_api is None:
        return

    cfg = NODE_CONFIG.get(str(node_id))
    if not cfg:
        return

    try:
        point = (
            Point("predictions")
            .tag("node", str(node_id))
            .field("base_prob", float(base_prob))
            .field("final_prob", float(final_prob))
        )
        # optional fields only if not None
        if ext.get("cloud_base_m") is not None:
            point.field("cloud_base_m", float(ext.get("cloud_base_m")))
        if ext.get("cloud_ceiling_m") is not None:
            point.field("cloud_ceiling_m", float(ext.get("cloud_ceiling_m")))
        if ext.get("visibility_m") is not None:
            point.field("visibility_m", float(ext.get("visibility_m")))
        if ext.get("wind_gust") is not None:
            point.field("wind_gust", float(ext.get("wind_gust")))
        if altitude is not None:
            point.field("altitude_m", float(altitude))

        write_api.write(bucket=cfg["bucket"], record=point)
    except Exception as e:
        print("Influx write error (predictions):", e)

# ----------------- API ROUTE -----------------
@app.route("/node/<node_id>/latest")
def latest(node_id):
    try:
        cfg = NODE_CONFIG.get(str(node_id))
        if not cfg:
            return jsonify({"error":"Invalid node"}), 400

        # 1. Influx sensor data (temp/pressure; humidity may be None for Node 2)
        sensor = get_sensor_from_influx(node_id)
        if sensor is None:
            return jsonify({"error":"No sensor data"}), 503

        # 2. Tomorrow.io external weather (includes humidity_api)
        ext = get_openweather(cfg["lat"], cfg["lon"])

        # If sensor humidity missing (Node 2), replace from API humidity
        if sensor.get("humidity") is None:
            # ext["humidity_api"] may be None; fallback to 0 if still None
            sensor["humidity"] = ext.get("humidity_api") if ext.get("humidity_api") is not None else 0.0

        # 3. Historical 47 hours for model input
        hist = get_openmeteo_history(cfg["lat"], cfg["lon"])

        # 4. Build live row for model input
        dew = dew_point(sensor["temp"], sensor["humidity"])
        live = pd.DataFrame([{
            "surface_pressure": sensor["pressure"],
            "rain": ext["rain"],
            "temperature_2m": sensor["temp"],
            "relative_humidity_2m": sensor["humidity"],
            "dew_point_2m": dew or 0,
            "cloud_cover": ext["cloud_cover"],
            "wind_direction_10m": ext["wind_dir"],
            "wind_speed_10m": ext["wind_speed"],
            "time": pd.Timestamp.utcnow()
        }])

        # 5. Model prediction (base)
        x, df48 = prepare_model_input(hist, live)
        base_prob = model_predict(x)

        # 6. Adjust using extra parameters
        final_prob = adjust_risk(
            base_prob,
            cloud_base_m = ext.get("cloud_base_m"),
            cloud_ceiling_m = ext.get("cloud_ceiling_m"),
            visibility_m = ext.get("visibility_m"),
            wind_gust = ext.get("wind_gust")
        )

        risk_flag = 1 if final_prob >= 0.50 else 0

        # 7. Altitude calculation (from pressure)
        altitude = calculate_altitude(sensor.get("pressure"))

        # 8. Write prediction to Influx for calibration
        try:
            write_prediction_to_influx(node_id, base_prob, final_prob, ext, altitude)
        except Exception as e:
            print("Prediction logger error:", e)

        # 9. Send MQTT relay command based on final_prob
        try:
            if final_prob >= 0.50:
                relay_msg = f"{node_id}=1"
                for i in range(5):
                    mqtt_client.publish(MQTT_TOPIC, relay_msg, qos=1)
                    print(f"⚡ MQTT Sent {i+1}/5 → {relay_msg}")
                    time.sleep(0.2)
            else:
                print("ℹ Final probability < 50% → No MQTT message sent")
        except Exception as e:
            print("❌ MQTT publish error:", e)

        # 10. Return JSON with full fields (altitude added)
        return jsonify({
            "node": node_id,
            "name": cfg["name"],
            "temp": sensor["temp"],
            "humidity": sensor["humidity"],
            "pressure": sensor["pressure"],
            "dew": dew,
            "cloud_cover": ext.get("cloud_cover"),
            "rain": ext.get("rain"),
            "wind_speed": ext.get("wind_speed"),
            "wind_dir": ext.get("wind_dir"),
            "cloud_base_m": ext.get("cloud_base_m"),
            "cloud_ceiling_m": ext.get("cloud_ceiling_m"),
            "visibility_m": ext.get("visibility_m"),
            "wind_gust": ext.get("wind_gust"),
            "base_probability": base_prob,
            "final_probability": final_prob,
            "risk": risk_flag,
            "altitude_m": altitude,
            "time": datetime.utcnow().isoformat()
        })

    except Exception as e:
        print("Live error:", e)
        return jsonify({"error": str(e)}), 500

# ----------------- SERVER RUN -----------------
if __name__ == "__main__":
    print("🚀 Live backend running at http://localhost:5003")
    app.run(host="0.0.0.0", port=5003, threaded=True)
