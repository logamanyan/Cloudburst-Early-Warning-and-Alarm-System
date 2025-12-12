// ======================= ALERT SOUND ==========================
const alertSound = new Audio("alert.mp3");   // Place alert.mp3 in same folder
alertSound.volume = 1.0;

// ======================= WARNING BANNER ========================
let warningBanner = document.createElement("div");
warningBanner.id = "warningBanner";
warningBanner.style.display = "none";
warningBanner.style.background = "rgba(255,0,0,0.2)";
warningBanner.style.border = "2px solid red";
warningBanner.style.padding = "12px";
warningBanner.style.margin = "15px 0";
warningBanner.style.fontSize = "18px";
warningBanner.style.fontWeight = "900";
warningBanner.style.color = "white";
warningBanner.style.textAlign = "center";
warningBanner.style.borderRadius = "10px";
warningBanner.style.animation = "blink 1s infinite";

document.body.prepend(warningBanner);

// Blinking animation
const style = document.createElement("style");
style.innerHTML = `
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.2; }
  100% { opacity: 1; }
}
`;
document.head.appendChild(style);


// ======================= MAIN BUTTON HANDLER ======================
document.getElementById("btnGenerate").addEventListener("click", async () => {

    const lat = document.getElementById("lat").value;
    const lon = document.getElementById("lon").value;
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;

    if (!lat || !lon || !start || !end) {
        alert("Enter all fields!");
        return;
    }

    try {
        const url = `http://localhost:5004/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        // ------------------ PROBABILITY VISUAL ENHANCEMENT ------------------
        let probColor = data.probability >= 50 ? "red" : "#00d1ff";

        const summaryDiv = document.getElementById("summary");
        summaryDiv.innerHTML = `
            <div style="
                font-size: 32px;
                font-weight: 900;
                color: ${probColor};
                margin-bottom: 15px;
                text-shadow: 0 0 12px ${probColor};
            ">
                Cloudburst Probability: ${data.probability}%
            </div>

            <b>Temperature:</b> ${data.temperature} °C<br>
            <b>Humidity:</b> ${data.humidity} %<br>
            <b>Pressure:</b> ${data.pressure} hPa<br>
            <b>Rain:</b> ${data.rain} mm<br>
            <b>Cloud Cover:</b> ${data.cloud} %<br>
            <b>Wind:</b> ${data.wind_speed} km/h @ ${data.wind_dir}°<br>
        `;

        // ------------------ SHOW ALERT + SOUND IF HIGH RISK ------------------
        if (data.probability >= 50) {
            warningBanner.innerText = "⚠ HIGH CLOUD BURST RISK DETECTED — IMMEDIATE ACTION REQUIRED ⚠";
            warningBanner.style.display = "block";

            alertSound.play().catch(() => {
                console.log("Sound auto-play blocked, user interaction needed.");
            });
        } else {
            warningBanner.style.display = "none";
        }

        // ------------------ Insert chart image ------------------
        const chartImg = document.getElementById("chartImg");
        chartImg.src = "data:image/png;base64," + data.chart;

        document.getElementById("summaryCard").style.display = "block";
        document.getElementById("chartCard").style.display = "block";

    } catch (err) {
        alert("Error connecting to backend: " + err);
    }
});
