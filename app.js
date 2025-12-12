// ======================================================
// LIVE DASHBOARD FRONTEND (index.html)
// Full Working Version with Map, Markers, Charts & Live Data
// Now displays altitude and uses humidity from API for Node 2
// ======================================================

const API_NODE1 = "http://localhost:5003/node/1/latest";
const API_NODE2 = "http://localhost:5003/node/2/latest";
const POLL_MS = 6000;

let map, marker1, marker2;
let probChart, thpChart;

// ======================================================
// 1. MAP INITIALIZATION (Leaflet)
// ======================================================
function initMap() {
    map = L.map("map").setView([20.5937, 78.9629], 5);

    // Google Satellite Tiles
    L.tileLayer("http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"]
    }).addTo(map);

    // Node markers
    marker1 = L.marker([18.495277, 74.021388]).addTo(map)
        .bindPopup("<b>Node 1 — Pune</b><br>Loading...");

    marker2 = L.marker([30.7280, 78.4430]).addTo(map)
        .bindPopup("<b>Node 2 — Uttarkashi</b><br>Loading...");
}

// ======================================================
// 2. CHART INITIALIZATION
// ======================================================
function initCharts() {
    // Probability chart
    probChart = new Chart(document.getElementById("probChart"), {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Cloudburst Probability (%)",
                data: [],
                borderColor: "#ff8a00",
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: { y: { min: 0, max: 100 } }
        }
    });

    // Temp/Humidity/Pressure chart
    thpChart = new Chart(document.getElementById("thpChart"), {
        type: "line",
        data: {
            labels: [],
            datasets: [
                { label: "Temperature (°C)", data: [], borderColor: "#ff4d00", borderWidth: 2, tension: 0.3 },
                { label: "Humidity (%)", data: [], borderColor: "#00d1ff", borderWidth: 2, tension: 0.3 },
                { label: "Pressure (hPa)", data: [], borderColor: "#ff8a00", borderWidth: 2, tension: 0.3 }
            ]
        },
        options: { responsive: true }
    });
}

// ======================================================
// 3. UPDATE NODE UI + MAP POPUP
// ======================================================
function updateNodeUI(node, data) {
    // Basic weather data
    document.getElementById(`n${node}_temp`).innerText = data.temp ?? "--";
    // humidity may come from sensor or API (backend already handles that)
    document.getElementById(`n${node}_hum`).innerText = (data.humidity !== null && data.humidity !== undefined) ? Number(data.humidity).toFixed(1) : "--";
    document.getElementById(`n${node}_pres`).innerText = data.pressure ?? "--";
    document.getElementById(`n${node}_dew`).innerText = data.dew !== null ? Number(data.dew).toFixed(1) : "--";

    document.getElementById(`n${node}_rain`).innerText = data.rain ?? "--";
    document.getElementById(`n${node}_cloud_ext`).innerText = data.cloud_cover ?? "--";
    // backend returns wind_speed in m/s; convert to km/h for display
    const windSpeedKmh = data.wind_speed ? (Number(data.wind_speed) * 3.6).toFixed(1) : "--";
    document.getElementById(`n${node}_wind_speed_ext`).innerText = windSpeedKmh;
    document.getElementById(`n${node}_wind_dir_ext`).innerText = data.wind_dir ?? "--";

    // NEW Tomorrow.io Fields
    document.getElementById(`n${node}_cloud_base`).innerText = data.cloud_base_m ?? "--";
    document.getElementById(`n${node}_cloud_ceiling`).innerText = data.cloud_ceiling_m ?? "--";
    document.getElementById(`n${node}_visibility`).innerText = data.visibility_m ?? "--";
    document.getElementById(`n${node}_wind_gust`).innerText = data.wind_gust ?? "--";

    // Altitude (m)
    document.getElementById(`n${node}_alt`).innerText = data.altitude_m !== null && data.altitude_m !== undefined ? Number(data.altitude_m).toFixed(1) : "--";

    // Probability + Risk UI (use final_probability if present)
    const p = ((data.final_probability ?? data.base_probability ?? data.probability ?? 0) * 100);
    document.getElementById(`n${node}_prob`).innerText = p.toFixed(1) + "%";

    const riskBox = document.getElementById(`n${node}_risk`);
    riskBox.innerText = data.risk === 1 ? "HIGH" : "NORMAL";
    riskBox.className = `risk-badge ${data.risk === 1 ? "risk-high" : "risk-low"}`;

    // Alerts Section
    const alerts = document.getElementById("alerts");
    if (data.risk === 1) {
        alerts.innerHTML = `
            <div class="alert-item">
                ⚠️ HIGH RISK Cloudburst Detected at Node ${node} — 
                ${new Date().toLocaleTimeString()}
            </div>
        `;
    }

    // Update marker popup
    const popupHTML = `
        <b>Node ${node}</b><br>
        Temp: ${data.temp} °C<br>
        Humidity: ${(data.humidity !== null && data.humidity !== undefined) ? Number(data.humidity).toFixed(1) + "%" : "--"}<br>
        Pressure: ${data.pressure} hPa<br>
        Altitude: ${data.altitude_m ? Number(data.altitude_m).toFixed(1) + " m" : "--"}<br>
        Cloud Base: ${data.cloud_base_m ?? "--"} m<br>
        Visibility: ${data.visibility_m ?? "--"} m<br>
        Wind Gust: ${data.wind_gust ?? "--"} m/s<br><br>
        Probability: ${p.toFixed(1)}%<br>
        Risk: ${data.risk === 1 ? "HIGH" : "NORMAL"}
    `;

    if (node === 1 && marker1) marker1.setPopupContent(popupHTML);
    if (node === 2 && marker2) marker2.setPopupContent(popupHTML);
}

// ======================================================
// 4. PUSH TO CHARTS (Node 1 only)
// ======================================================
function pushCharts(data) {
    const ts = new Date().toLocaleTimeString();
    const prob = ((data.final_probability ?? data.base_probability ?? data.probability ?? 0) * 100).toFixed(1);

    // Probability chart
    probChart.data.labels.push(ts);
    probChart.data.datasets[0].data.push(prob);

    if (probChart.data.labels.length > 20) {
        probChart.data.labels.shift();
        probChart.data.datasets[0].data.shift();
    }
    probChart.update();

    // Temp/Hum/Pressure chart
    thpChart.data.labels.push(ts);
    thpChart.data.datasets[0].data.push(data.temp);
    thpChart.data.datasets[1].data.push(data.humidity);
    thpChart.data.datasets[2].data.push(data.pressure);

    if (thpChart.data.labels.length > 20) {
        thpChart.data.labels.shift();
        thpChart.data.datasets.forEach(ds => ds.data.shift());
    }

    thpChart.update();
}

// ======================================================
// 5. FETCH LIVE NODE DATA
// ======================================================
async function pollNode(node, url) {
    try {
        const res = await fetch(url);
        const data = await res.json();

        // backend returns error objects sometimes
        if (data.error) {
            console.error("API error for node", node, data.error);
            return;
        }

        updateNodeUI(node, data);

        if (node === 1) pushCharts(data); // history uses node 1
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

// ======================================================
// 6. AUTO POLLING SYSTEM
// ======================================================
function startPolling() {
    pollNode(1, API_NODE1);
    pollNode(2, API_NODE2);

    setInterval(() => {
        pollNode(1, API_NODE1);
        pollNode(2, API_NODE2);
    }, POLL_MS);
}

// ======================================================
// 7. INIT WHEN PAGE LOADS
// ======================================================
window.onload = () => {
    initMap();
    initCharts();
    startPolling();
};
