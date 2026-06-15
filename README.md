# 🌧️ Cloudburst Early Warning System

An 🤖 AI-driven, ⏱️ real-time multi-node weather monitoring platform designed to predict cloudburst conditions using 🛰️ sensor fusion and 🧠 deep learning.

---

## 📌 Project Overview
The system aggregates 🔌 local sensor inputs with 🌍 global weather data to run predictive models for early cloudburst warnings.

* 🛰️ **Data Fusion:** Satellite data, Tomorrow.io API, and LoRaWAN sensor nodes.
* 🧠 **Core Engine:** ConvLSTM deep learning framework.
* 🗺️ **Visualization:** ISRO-themed live map dashboard with real-time telemetry.

Currently deployed across two critical monitoring stations: 📍 **Node 1 (Pune)** and 📍 **Node 2 (Uttarkashi)**.

---

## 🏗️ System Architecture

```text
+--------------------+

|   LoRaWAN Nodes    |
| (Temp/Hum/Pres)    |
+---------+----------+
          |
          v
+--------------------+       +---------------------+

|   live2.py Backend | <-->  | Tomorrow.io Weather |
| Flask + ML Model   |       +---------------------+
+--------------------+
          |
          v
+--------------------+       +--------------------+

| InfluxDB (TS Data) | <---> | MQTT Broker (TLS)  |
+--------------------+       +--------------------+
          |
          v
+------------------------------+

| Frontend Dashboard (index.js)|
| Map • Charts • Alerts        |
+------------------------------+
```

---

## 🚀 Key Features

* 📊 **Real-Time Data Ingestion:** Collects parameters like temperature, humidity, pressure, rainfall, wind, cloud cover, visibility, and gusts from local BMP280 sensors and Tomorrow.io API.
* 🔮 **AI-Powered Predictions:** Leverages a 47-hour historical lookback window using a ConvLSTM model to evaluate real-time risk.
* 🚨 **Automatic Risk Mitigation:** Automatically triggers marquee UI alerts, audible alarms, and hardware relays via MQTT if risk levels breach 50%.
* 🖥️ **Dynamic UI Canvas:** Visualizes data using Leaflet, Google map tiles, multi-parameter time-series charts, and dynamically computed altitudes.

---

## 📦 Folder Structure

```text
Cloudburst-System/
├── backend/
│   ├── live2.py
│   ├── cloudburst_model_v4.keras
│   └── cloudburst_scaler_v4.gz
├── frontend/
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   └── alert.mp3
└── README.md
```

---

## 🧰 Requirements

### 🔌 Hardware
* 📍 **Node 1 (Pune):** Primary telemetry sensor array.
* 📍 **Node 2 (Uttarkashi):** High-altitude telemetry sensor array.
* 🎛️ **Optional:** MQTT-compatible relay device for automation triggering.

### 💻 Software
* 🐍 Python 3.10+
* ☁️ InfluxDB Cloud Account

---

## ⚙️ Installation & Setup

### 1. 🖥️ Backend Deployment

Navigate to the backend directory and install the necessary dependencies:
```bash
pip install flask flask-cors requests numpy pandas tensorflow joblib influxdb-client paho-mqtt
```

Place your trained weights and scaling parameters into the root of your `backend/` directory:
* 🧠 `cloudburst_model_v4.keras`
* 📐 `cloudburst_scaler_v4.gz`

Open `live2.py` and input your environmental credentials:
```python
INFLUX_URL = "your_influxdb_url"
INFLUX_TOKEN = "your_influxdb_token"
MQTT_USERNAME = "your_mqtt_username"
MQTT_PASSWORD = "your_mqtt_password"
TOMORROW_KEY = "your_tomorrow_io_api_key"
```

Boot up the local Flask server:
```bash
python3 live2.py
```
*💡 The API engine will spin up on port 5003.*

### 2. 🌐 Frontend Deployment

Ensure the following assets reside inside your `frontend/` directory: `index.html`, `app.js`, `style.css`, and `alert.mp3`.

Spin up a simple HTTP static web server:
```bash
python3 -m http.server 8000
```
Open your browser and navigate to: `http://localhost:8000/index.html`

---

## 🔌 API Reference

### 📡 Get Latest Telemetry Metrics
```http
GET /node/<id>/latest
```

#### 📄 Response Example (`200 OK`)
```json
{
  "temp": 29.4,
  "humidity": 55.1,
  "pressure": 953.2,
  "dew": 14.8,
  "cloud_cover": 27,
  "rain": 0.2,
  "wind_speed": 1.3,
  "final_probability": 0.37,
  "risk": 0,
  "altitude_m": 2251.4
}
```

### 🔔 MQTT Alert Interface
When the AI prediction exceeds the high-risk limit (>50%), the backend transmits five redundancy messages over the following broker channel:
* 🏷️ **Topic:** `node_id=1` (or relevant node ID)
* 📦 **Payload:** `HIGH RISK (relay ON)`

---

## 🧭 Production Recommendations

* ⚙️ **Backend WSGI Execution:** Run production backends under a standard Linux daemon using Gunicorn:
  ```bash
  gunicorn --bind 0.0.0.0:5003 live2:app
  ```
* 🚀 **Frontend Hosting:** Deploy static UI assets directly to fast CDNs like Netlify, Vercel, or a local Nginx server instance.

---

## 🛠️ Troubleshooting

### ❌ Node 2 Data Stream Drops Out
* ⚠️ **Cause:** BMP280 sensors lack hardware humidity logs. Null variables halt script computations downstream.
* ✅ **Resolution:** The backend now injects a secondary Tomorrow.io fallback structure: `sensor["humidity"] = ext.get("humidity_api") or 50.0`.

### ❌ UI Canvas or Marquee Ticker Freeze
* ⚠️ **Cause:** Empty values passed for structural items like dew point, pressure, or cloud base ceilings.
* ✅ **Resolution:** The active version implements programmatic checking: `if ext[key] is None: ext[key] = 0.0`.

### ❌ Missing InfluxDB Dashboards
* 🔍 Verify your organizations, authorization tokens, and individual bucket configurations match your designated node parameters exactly.

---

## 🙌 Credits
* 👨‍💻 **Lead Developer:** Logamanyan ([CodeForNation](https://github.com))
* 🏆 **Occasion:** Built for the **Multi-Node Cloudburst Detection Hackathon**.
