🌧️ Overview
The Cloudburst Early Warning System is a real-time, AI-driven multi-node weather monitoring platform designed to predict cloudburst conditions using:
🛰 Satellite + Sensor Fusion
🤖 ConvLSTM Deep Learning Model
☁️ Tomorrow.io Real-time Weather API
📡 LoRaWAN Sensor Nodes
🔁 InfluxDB time-series storage
🔔 Smart alerts + MQTT relay triggering
🗺️ Live map dashboard with ISRO theme
The system supports multiple sensor nodes—currently Node 1: Pune and Node 2: Uttarkashi.

🚀 Features
✔ Real-time data ingestion
Reads temperature, humidity, pressure, rainfall, wind, cloud cover, visibility, gusts from:
Local sensors (BMP280 / LoRaWAN)
External APIs (Tomorrow.io Weather)

✔ AI-based cloudburst prediction
Uses past 47 hours of weather history
Runs ConvLSTM model to predict cloudburst probability
Risk enhancement based on cloud base/ceiling, visibility & wind gusts

✔ Automatic risk alerts
Dashboard alerts
Marquee notifications
MQTT relay activation if risk > 50%

✔ Full Dashboard
Live Satellite Map (Leaflet + Google tiles)
Node details
Charts (probability + temperature/humidity/pressure)
Real-time altitudes computed from pressure
Auto-updating Marquee ticker
✔ Data storage
Each prediction logged into InfluxDB (predictions measurement)

🏗️ System Architecture
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

🧰 Requirements
Hardware

Node 1 (Pune): Full sensor set

Node 2 (Uttarkashi): FUll sensor set

Optional: Relay device controlled via MQTT

Software
Install these:

Python 3.10+
Flask
TensorFlow / Keras
InfluxDB Client
Paho MQTT
Requests
NumPy
Pandas
joblib
⚙️ Backend Setup
1️⃣ Install dependencies
pip install flask flask-cors requests numpy pandas tensorflow joblib influxdb-client paho-mqtt

2️⃣ Place model files
cloudburst_model_v4.keras
cloudburst_scaler_v4.gz

3️⃣ Configure credentials inside live2.py
Edit:
INFLUX_URL
INFLUX_TOKEN
MQTT_USERNAME
MQTT_PASSWORD
TOMORROW_KEY

4️⃣ Run backend
python3 live2.py


Backend available at:

http://localhost:5003/node/1/latest
http://localhost:5003/node/2/latest

🖥️ Frontend Setup
1️⃣ Files needed in frontend folder:
index.html
app.js
style.css
alert.mp3

2️⃣ Start any simple HTTP server:
python3 -m http.server 8000


Then open:

http://localhost:8000/index.html

🔌 API Endpoints
Get latest node readings
GET /node/<id>/latest


Returns:

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

📡 MQTT Alerts

Backend publishes:

node_id=1   → HIGH RISK (relay ON)


Published 5 times for reliability.

🧭 Deployment Recommendations
✔ Run Backend on a Server (Linux)

Use:

gunicorn --bind 0.0.0.0:5003 live2:app


Optional: Nginx reverse proxy.

✔ Host Frontend on Netlify / Vercel / Nginx

Just upload the static files.

✔ InfluxDB Cloud Already Used (No server needed)
🛠️ Troubleshooting
❌ Node 2 data not updating

Cause: BMP280 has no humidity → humidity becomes None → dew becomes None → frontend stops updating.

Fix: Updated backend now includes:

sensor["humidity"] = ext.get("humidity_api") or 50.0

❌ Marquee not showing

Triggered when values like dew/humidity/cloud_base are null.

Updated backend includes FULL sanitization:

if ext[key] is None: ext[key] = 0.0
if dew is None: dew = 0.0

❌ Charts stop updating

Usually caused by:

pressure = null


Backend now guarantees no nulls.

❌ Influx history empty

Check:

Token & org correct

Bucket names match Node 1/Node 2

🧪 Testing Node Data

Check Node 1:

curl http://localhost:5003/node/1/latest


Check Node 2:

curl http://localhost:5003/node/2/latest


If JSON prints correctly, frontend will work.

📦 Folder Structure
Cloudburst-System/
│
├── backend/
│   ├── live2.py
│   ├── cloudburst_model_v4.keras
│   ├── cloudburst_scaler_v4.gz
│
├── frontend/
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   ├── alert.mp3
│
└── README.md

🙌 Credits

Developed by Logamanyan (CodeForNation)
Built for Multi-Node Cloudburst Detection Hackathon

Backend, AI Model, Frontend Dashboard — Fully Integrated Solution.
