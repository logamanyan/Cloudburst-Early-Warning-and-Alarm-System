#!/usr/bin/env python3
"""
Historical Cloudburst Prediction Backend (predict.py) — FINAL STABLE VERSION
Fast2SMS bulkV2 SMS (DLT-free) + working prediction + chart + MQTT relay
"""

import os, io, time, json, base64, urllib.parse
import requests
import numpy as np
import pandas as pd
from threading import Lock
from flask import Flask, request, jsonify
from flask_cors import CORS

# Matplotlib non-GUI backend
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# ML
from tensorflow.keras.models import load_model
import joblib

# MQTT TLS
import paho.mqtt.client as mqtt


# =========================================================
# CONFIG
# =========================================================
MODEL_PATH = "cloudburst_model_v4.keras"
SCALER_PATH = "cloudburst_scaler_v4.gz"

PORT = 5004

MQTT_BROKER = "d797988ab08841459e366cdaa3ab7482.s1.eu.hivemq.cloud"
MQTT_PORT = 8883
MQTT_USERNAME = "telegraf_user"
MQTT_PASSWORD = "Codefornation1$"
MQTT_TOPIC = "lorawan/prediction"

NODE_LOC = {
    1: {"lat": 30.7280, "lon": 78.4430, "name": "Node 1 - Uttarkashi"},
    2: {"lat": 18.4953, "lon": 74.0214, "name": "Node 2 - Pune"},
}

FEATURES = [
    "surface_pressure","rain","temperature_2m","relative_humidity_2m",
    "dew_point_2m","cloud_cover","wind_direction_10m","wind_speed_10m"
]

# --------------------- FAST2SMS CONFIG -------------------------
FAST2SMS_API_KEY = "bm90StEMBuuklI0rEvIvX9hIAkhqNVFUBHwajUojTARlQRHAG9C1EKGPNUNT"
ALERT_NUMBERS = ["919363621511"]       # comma-separated list of India numbers
SMS_ALERT_THRESHOLD = 0.50             # alert above 50%

# one-time alert per node
sms_sent_flag = {1: False, 2: False}


# --------------------- FLASK INIT -------------------------
app = Flask(__name__)
CORS(app)

predict_lock = Lock()


# =========================================================
# LOAD MODEL
# =========================================================
try:
    model = load_model(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("✅ Model & Scaler Loaded.")
except Exception as e:
    print("❌ Model load error:", e)
    model = None
    scaler = None


# =========================================================
# MQTT INIT
# =========================================================
mqtt_client = mqtt.Client(client_id="history_predictor", clean_session=True)
try:
    mqtt_client.tls_set()
    mqtt_client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
    mqtt_client.loop_start()
    print("✅ Connected to HiveMQ Cloud")
except Exception as e:
    print("❌ MQTT connection error:", e)



# =========================================================
# NEW FAST2SMS BULK-V2 FUNCTION  (DLT-FREE)
# =========================================================
def send_fast2sms_sms(message):
    """
    Send SMS using Fast2SMS bulkV2 (GET method - simplest, DLT free)
    """

    try:
        # Build URL
        base = "https://www.fast2sms.com/dev/bulkV2"
        params = {
            "authorization": FAST2SMS_API_KEY,
            "route": "q",  # quick route
            "message": message,
            "numbers": "919363621511".join(ALERT_NUMBERS),
            "flash": "0"
        }

        url = base + "?" + urllib.parse.urlencode(params, safe=",")
        print("📨 Sending SMS GET:", url[:180], "...")

        r = requests.get(url, timeout=12)
        print("📨 Fast2SMS Response:", r.status_code, r.text)

        if r.status_code == 200:
            print("✅ SMS delivered through bulkV2")
            return True

        print("❌ SMS failed:", r.text)
        return False

    except Exception as e:
        print("❌ Fast2SMS Error:", e)
        return False



# =========================================================
# ALTITUDE CALCULATION
# =========================================================
def calculate_altitude(pressure_hpa):
    try:
        return 44330 * (1 - (pressure_hpa / 1013.25) ** 0.1903)
    except:
        return None



# =========================================================
# FETCH WEATHER HISTORY
# =========================================================
def fetch_history(lat, lon, start, end):
    try:
        url = (
            "https://archive-api.open-meteo.com/v1/archive?"
            f"latitude={lat}&longitude={lon}&start_date={start}&end_date={end}"
            "&hourly=surface_pressure,rain,temperature_2m,"
            "relative_humidity_2m,dew_point_2m,cloud_cover,"
            "wind_direction_10m,wind_speed_10m"
        )

        r = requests.get(url, timeout=15).json()

        if "hourly" not in r:
            return None, "No weather data returned."

        df = pd.DataFrame(r["hourly"])
        df["time"] = pd.to_datetime(df["time"])
        df = df.interpolate().ffill().bfill()

        if len(df) < 48:
            return None, "Insufficient data (<48 rows)."

        return df.tail(48).reset_index(drop=True), None

    except Exception as e:
        return None, str(e)



# =========================================================
# MODEL PREDICT
# =========================================================
def model_predict(x):
    if model is None:
        return 0.4
    with predict_lock:
        return float(model.predict(x, verbose=0)[0][0])



# =========================================================
# PLOT GENERATOR
# =========================================================
def make_plot(df, prob):
    try:
        required = ["time", "temperature_2m", "relative_humidity_2m",
                    "surface_pressure", "dew_point_2m", "cloud_cover", "rain"]

        for c in required:
            if c not in df.columns:
                print("❌ Missing column:", c)
                return ""

        plt.style.use("seaborn-v0_8-whitegrid")
        fig, axs = plt.subplots(6, 1, figsize=(15, 28), sharex=True)
        fig.suptitle(f"Cloudburst Analysis — Probability {prob*100:.1f}%", fontsize=18)

        times = pd.to_datetime(df["time"])
        risk_mask = (df["relative_humidity_2m"] > 85) & (df["cloud_cover"] > 80)

        def highlight(ax):
            ymin, ymax = ax.get_ylim()
            ax.fill_between(times, ymin, ymax, where=risk_mask, color="#ffcccc", alpha=0.25)

        axs[0].plot(times, df["temperature_2m"]); axs[0].set_title("Temperature (°C)"); highlight(axs[0])
        axs[1].plot(times, df["relative_humidity_2m"]); axs[1].set_title("Humidity (%)"); highlight(axs[1])
        axs[2].plot(times, df["surface_pressure"]); axs[2].set_title("Pressure (hPa)"); highlight(axs[2])
        axs[3].plot(times, df["dew_point_2m"]); axs[3].set_title("Dew Point (°C)"); highlight(axs[3])
        axs[4].plot(times, df["cloud_cover"]); axs[4].fill_between(times, df["cloud_cover"], alpha=0.4); axs[4].set_title("Cloud Cover (%)"); highlight(axs[4])
        axs[5].bar(times, df["rain"]); axs[5].set_title("Rainfall (mm/hr)"); highlight(axs[5])

        plt.tight_layout(rect=[0, 0.03, 1, 0.95])

        buf = io.BytesIO()
        plt.savefig(buf, format="png", dpi=140)
        buf.seek(0)
        img_b64 = base64.b64encode(buf.read()).decode()
        plt.close(fig)
        return img_b64

    except Exception as e:
        print("❌ Plot error:", e)
        return ""



# =========================================================
# HISTORY API
# =========================================================
@app.route("/history")
def history_api():
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lon"))
        start = request.args.get("start")
        end = request.args.get("end")
    except:
        return jsonify({"error": "Invalid parameters"}), 400

    # Identify nearest node
    d1 = abs(lat - NODE_LOC[1]["lat"]) + abs(lon - NODE_LOC[1]["lon"])
    d2 = abs(lat - NODE_LOC[2]["lat"]) + abs(lon - NODE_LOC[2]["lon"])
    node = 1 if d1 < d2 else 2

    df, err = fetch_history(lat, lon, start, end)
    if err:
        return jsonify({"error": err}), 400

    df_num = df[FEATURES].apply(pd.to_numeric, errors="coerce").fillna(0)
    scaled = scaler.transform(df_num.values)
    x = scaled.reshape(1, 48, 1, 1, 8)

    prob = model_predict(x)
    last = df.iloc[-1]

    altitude = calculate_altitude(float(last["surface_pressure"]))

    # ------------------- MQTT Relay -------------------
    try:
        msg = f"{node}=1" if prob >= 0.50 else f"{node}=0"
        for _ in range(5):
            mqtt_client.publish(MQTT_TOPIC, msg.encode(), qos=1)
    except Exception as e:
        print("MQTT Error:", e)

    # ------------------- SMS ALERT -------------------
    try:
        if prob >= SMS_ALERT_THRESHOLD:
            if not sms_sent_flag[node]:

                sms_text = (
                    f"Cloudburst Risk {prob*100:.1f}%. "
                    f"T:{last['temperature_2m']:.1f}C "
                    f"H:{last['relative_humidity_2m']:.0f}% "
                    f"R:{last['rain']:.2f}mm "
                    f"C:{last['cloud_cover']:.0f}% "
                    f"Alt:{altitude:.1f}m"
                )

                ok = send_fast2sms_sms(sms_text)
                if ok:
                    sms_sent_flag[node] = True
        else:
            sms_sent_flag[node] = False

    except Exception as e:
        print("SMS Error:", e)

    chart = make_plot(df, prob)

    return jsonify({
        "node": node,
        "node_name": NODE_LOC[node]["name"],
        "probability": round(prob * 100, 2),
        "temperature": float(last["temperature_2m"]),
        "humidity": float(last["relative_humidity_2m"]),
        "pressure": float(last["surface_pressure"]),
        "altitude_m": altitude,
        "rain": float(last["rain"]),
        "cloud": float(last["cloud_cover"]),
        "wind_speed": float(last["wind_speed_10m"]),
        "wind_dir": float(last["wind_direction_10m"]),
        "chart": chart
    })



# =========================================================
# RUN SERVER
# =========================================================
if __name__ == "__main__":
    print(f"🚀 Prediction backend running on http://localhost:{PORT}")
    app.run(host="0.0.0.0", port=PORT, threaded=True)
