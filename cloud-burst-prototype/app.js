// Application data with emergency alerts
const systemData = {
  "system_info": {
    "title": "National Cloudburst Early Warning System",
    "ministry": "Ministry of Earth Sciences | Government of India",
    "status": "OPERATIONAL",
    "active_nodes": 1247,
    "monitored_states": 23,
    "current_time": "2025-10-04T21:27:00+05:30"
  },
  "emergency_alerts": [
    {
      "id": "EMRG_001",
      "level": "EMERGENCY",
      "region": "Kerala Western Ghats",
      "location": "Wayanad",
      "message": "CLOUDBURST IN PROGRESS - Immediate evacuation required for downstream areas",
      "rainfall": 58.5,
      "confidence": 92.8,
      "timestamp": "2025-10-04T21:26:00+05:30",
      "actions": [
        "Evacuate downstream areas immediately",
        "Alert local authorities and emergency services", 
        "Activate emergency broadcast systems",
        "Monitor situation continuously"
      ],
      "priority": "critical",
      "auto_show": true,
      "delay": 10000
    },
    {
      "id": "EMRG_002", 
      "level": "EMERGENCY",
      "region": "Northeast Hills",
      "location": "Cherrapunji",
      "message": "EXTREME RAINFALL DETECTED - Landslide risk critical",
      "rainfall": 82.1,
      "confidence": 95.2,
      "timestamp": "2025-10-04T21:25:00+05:30",
      "actions": [
        "Issue landslide warnings immediately",
        "Evacuate high-risk slope areas",
        "Block access to vulnerable roads",
        "Deploy rescue teams on standby"
      ],
      "priority": "critical",
      "auto_show": true,
      "delay": 25000
    },
    {
      "id": "WARN_001",
      "level": "WARNING",
      "region": "Maharashtra Western Ghats",
      "location": "Mahabaleshwar",
      "message": "HEAVY RAINFALL WARNING - Road closures advised",
      "rainfall": 38.2,
      "confidence": 87.5,
      "timestamp": "2025-10-04T21:24:00+05:30",
      "actions": [
        "Close non-essential roads",
        "Issue travel advisories",
        "Monitor water levels closely",
        "Prepare emergency response teams"
      ],
      "priority": "high",
      "auto_show": true,
      "delay": 40000
    }
  ],
  "regions": {
    "kerala_ghats": {
      "name": "Kerala Western Ghats",
      "status": "EMERGENCY",
      "status_color": "#dc3545",
      "sensors": [
        {"location": "Wayanad", "rainfall": 58.5, "temp": 20.1, "humidity": 98, "pressure": 1001.2, "status": "emergency"},
        {"location": "Munnar", "rainfall": 52.8, "temp": 18.5, "humidity": 96, "pressure": 1003.2, "status": "critical"},
        {"location": "Idukki", "rainfall": 48.2, "temp": 19.2, "humidity": 95, "pressure": 1004.1, "status": "critical"}
      ]
    },
    "northeast": {
      "name": "Northeast Hills", 
      "status": "EMERGENCY",
      "status_color": "#dc3545",
      "sensors": [
        {"location": "Cherrapunji", "rainfall": 82.1, "temp": 17.5, "humidity": 98, "pressure": 1000.8, "status": "emergency"},
        {"location": "Shillong", "rainfall": 35.8, "temp": 19.8, "humidity": 92, "pressure": 1006.5, "status": "warning"}
      ]
    },
    "maharashtra_ghats": {
      "name": "Maharashtra Western Ghats",
      "status": "WARNING",
      "status_color": "#fd7e14", 
      "sensors": [
        {"location": "Mahabaleshwar", "rainfall": 38.2, "temp": 21.5, "humidity": 94, "pressure": 1005.1, "status": "warning"},
        {"location": "Lonavala", "rainfall": 32.5, "temp": 24.8, "humidity": 91, "pressure": 1006.8, "status": "warning"}
      ]
    },
    "uttarakhand": {
      "name": "Uttarakhand Himalayas",
      "status": "WATCH",
      "status_color": "#ffc107",
      "sensors": [
        {"location": "Dehradun Hills", "rainfall": 16.8, "temp": 23.8, "humidity": 84, "pressure": 1010.2, "status": "watch"},
        {"location": "Mussoorie", "rainfall": 19.2, "temp": 19.8, "humidity": 87, "pressure": 1008.5, "status": "watch"}
      ]
    },
    "himachal": {
      "name": "Himachal Pradesh",
      "status": "NORMAL", 
      "status_color": "#28a745",
      "sensors": [
        {"location": "Shimla", "rainfall": 3.2, "temp": 17.2, "humidity": 67, "pressure": 1016.5, "status": "normal"},
        {"location": "Manali", "rainfall": 2.1, "temp": 14.8, "humidity": 64, "pressure": 1019.1, "status": "normal"}
      ]
    }
  },
  "live_alerts": [
    {
      "id": 1,
      "timestamp": "2025-10-04T21:18:00+05:30",
      "level": "CRITICAL",
      "region": "Kerala Western Ghats",
      "location": "Wayanad",
      "message": "Extreme rainfall: 58.5 mm/hr - Flash flood imminent",
      "confidence": 0.928,
      "priority": "urgent"
    },
    {
      "id": 2,
      "timestamp": "2025-10-04T21:15:00+05:30",
      "level": "CRITICAL",
      "region": "Northeast Hills",
      "location": "Cherrapunji",
      "message": "Record rainfall: 82.1 mm/hr - Landslide warning issued",
      "confidence": 0.952,
      "priority": "urgent"
    },
    {
      "id": 3,
      "timestamp": "2025-10-04T21:12:00+05:30",
      "level": "WARNING",
      "region": "Maharashtra Western Ghats",
      "location": "Mahabaleshwar",
      "message": "Heavy rainfall: 38.2 mm/hr - Road closure advised",
      "confidence": 0.875,
      "priority": "high"
    },
    {
      "id": 4,
      "timestamp": "2025-10-04T21:08:00+05:30",
      "level": "WATCH",
      "region": "Uttarakhand",
      "location": "Mussoorie",
      "message": "Moderate rainfall: 19.2 mm/hr - Monitoring situation",
      "confidence": 0.82,
      "priority": "medium"
    }
  ],
  "analytics": {
    "alerts_today": 28,
    "critical_alerts": 8,
    "warning_alerts": 12,
    "watch_alerts": 8,
    "accuracy_rate": 94.2,
    "avg_response_time": 2.1,
    "peak_rainfall_location": "Cherrapunji",
    "peak_rainfall_amount": 82.1
  }
};

// Global variables for live updates
let updateInterval;
let tickerInterval;
let alertSoundEnabled = false;
let lastAlertCount = systemData.live_alerts.length;
let currentEmergencyAlertIndex = 0;
let emergencyAlertsShown = [];

// DOM Elements
const alertsContainer = document.getElementById('alertsContainer');
const regionsGrid = document.getElementById('regionsGrid');
const regionModal = document.getElementById('regionModal');
const emergencyModal = document.getElementById('emergencyModal');
const currentTimeElement = document.getElementById('currentTime');
const alertTicker = document.getElementById('alertTicker');
const alertSound = document.getElementById('alertSound');

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏛️ National Cloudburst Early Warning System - LIVE MODE');
    
    initializeSystemStatus();
    initializeNavigation();
    initializeRegionMarkers();
    initializeLiveAlerts();
    initializeRegionalMonitoring();
    initializeAnalyticsCharts();
    initializeLiveTicker();
    startRealTimeUpdates();
    updateCurrentTime();
    
    // Schedule emergency alerts to auto-show
    scheduleEmergencyAlerts();
    
    // Start live time updates every second
    setInterval(updateCurrentTime, 1000);
    
    // Enable sound alerts after 5 seconds (user interaction)
    setTimeout(() => {
        alertSoundEnabled = true;
        console.log('🔊 Sound alerts enabled');
    }, 5000);
});

// Schedule emergency alerts based on data
function scheduleEmergencyAlerts() {
    systemData.emergency_alerts.forEach((alert, index) => {
        if (alert.auto_show) {
            setTimeout(() => {
                showEmergencyAlert(alert);
            }, alert.delay);
        }
    });
}

// Show emergency alert modal (RECTANGULAR, NOT ROUND)
function showEmergencyAlert(alertData) {
    if (!emergencyModal) return;
    
    console.log(`🚨 EMERGENCY ALERT TRIGGERED for ${alertData.location}`);
    
    // Update modal content
    document.getElementById('emergencyLevel').textContent = alertData.level;
    document.getElementById('emergencyRegion').textContent = alertData.region;
    document.getElementById('emergencyLocation').textContent = alertData.location;
    document.getElementById('emergencyMessage').textContent = alertData.message;
    
    // Format timestamp
    const alertTime = new Date(alertData.timestamp);
    document.getElementById('emergencyTimestamp').textContent = alertTime.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.getElementById('emergencyConfidence').textContent = alertData.confidence.toFixed(1) + '%';
    document.getElementById('emergencyRainfall').textContent = alertData.rainfall + ' mm/hr';
    
    // Populate actions list
    const actionsList = document.getElementById('emergencyActionsList');
    actionsList.innerHTML = alertData.actions.map(action => `<li>${action}</li>`).join('');
    
    // Show the modal with proper rectangular styling
    emergencyModal.classList.remove('hidden');
    
    // Play emergency sound
    if (alertSoundEnabled) {
        playEmergencySound();
    }
    
    // Add to shown alerts
    emergencyAlertsShown.push(alertData.id);
    
    // Update ticker with emergency info
    updateTicker();
}

// Close emergency modal
function closeEmergencyModal() {
    if (emergencyModal) {
        emergencyModal.classList.add('hidden');
    }
}

// Acknowledge emergency
function acknowledgeEmergency() {
    console.log('✅ Emergency alert acknowledged by user');
    closeEmergencyModal();
    
    // Log acknowledgment (in real system, this would send to server)
    const timestamp = new Date().toISOString();
    console.log(`Emergency acknowledged at: ${timestamp}`);
}

// Update current IST time
function updateCurrentTime() {
    if (currentTimeElement) {
        const now = new Date();
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        currentTimeElement.textContent = istTime.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

// Initialize system status with live counters
function initializeSystemStatus() {
    animateCounter('activeNodes', systemData.system_info.active_nodes);
    animateCounter('monitoredStates', systemData.system_info.monitored_states);
    document.getElementById('responseTime').textContent = '2.1';
    document.getElementById('systemUptime').textContent = '99.8%';
}

// Animate counter with realistic increment
function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let currentValue = 0;
    const increment = Math.ceil(targetValue / 50);
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        element.textContent = currentValue.toLocaleString();
    }, 30);
}

// Initialize navigation
function initializeNavigation() {
    document.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight + 32; // Include ticker
        const targetPosition = section.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Initialize region markers with click handlers
function initializeRegionMarkers() {
    const regionMarkers = document.querySelectorAll('.region-marker');
    
    regionMarkers.forEach(marker => {
        marker.addEventListener('click', function() {
            const regionKey = this.getAttribute('data-region');
            showRegionDetails(regionKey);
        });
        
        // Add hover effects
        marker.addEventListener('mouseenter', function() {
            this.style.transform = 'translate(-50%, -50%) scale(1.1)';
        });
        
        marker.addEventListener('mouseleave', function() {
            this.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });
}

// Show region details in modal
function showRegionDetails(regionKey) {
    const region = systemData.regions[regionKey];
    if (!region || !regionModal) return;

    const modalTitle = document.getElementById('modalRegionName');
    const modalStatus = document.getElementById('modalRegionStatus');
    const modalSensorDetails = document.getElementById('modalSensorDetails');

    modalTitle.textContent = region.name;
    
    modalStatus.innerHTML = `
        <div class="region-status-header">
            <h4>Current Status: <span class="region-status ${region.status.toLowerCase()}">${region.status}</span></h4>
            <div class="priority-indicator" style="margin-top: 12px;">
                <span style="color: #495057; font-size: 14px;">Active Sensors: </span>
                <span style="color: #003f7f; font-weight: bold;">${region.sensors.length}</span>
            </div>
        </div>
    `;

    modalSensorDetails.innerHTML = `
        <h4 style="color: #212529; margin-bottom: 16px;">Sensor Network Details</h4>
        <div class="region-sensors">
            ${region.sensors.map(sensor => `
                <div class="sensor-detail">
                    <div class="sensor-location">${sensor.location}</div>
                    <div class="sensor-status" style="color: #495057; font-size: 12px; margin-bottom: 12px;">
                        Status: <span style="color: ${getSensorStatusColor(sensor.status)}; font-weight: bold; text-transform: uppercase;">${sensor.status}</span>
                    </div>
                    <div class="sensor-readings-grid">
                        <div class="sensor-reading-item">
                            <span style="color: #495057;">Temperature:</span>
                            <span><strong>${sensor.temp}°C</strong></span>
                        </div>
                        <div class="sensor-reading-item">
                            <span style="color: #495057;">Humidity:</span>
                            <span><strong>${sensor.humidity}%</strong></span>
                        </div>
                        <div class="sensor-reading-item">
                            <span style="color: #495057;">Rainfall:</span>
                            <span><strong>${sensor.rainfall} mm/hr</strong></span>
                        </div>
                        <div class="sensor-reading-item">
                            <span style="color: #495057;">Pressure:</span>
                            <span><strong>${sensor.pressure} hPa</strong></span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    regionModal.classList.remove('hidden');
}

function getSensorStatusColor(status) {
    switch(status) {
        case 'normal': return '#28a745';
        case 'watch': return '#ffc107';
        case 'warning': return '#fd7e14';
        case 'critical': return '#dc3545';
        case 'emergency': return '#dc3545';
        default: return '#6c757d';
    }
}

function closeModal() {
    if (regionModal) {
        regionModal.classList.add('hidden');
    }
}

// Initialize live alerts with sound
function initializeLiveAlerts() {
    if (!alertsContainer) return;
    updateAlertsDisplay();
    updateAlertStats();
}

function updateAlertsDisplay() {
    if (!alertsContainer) return;

    alertsContainer.innerHTML = systemData.live_alerts.map(alert => {
        const alertTime = new Date(alert.timestamp).toLocaleTimeString('en-IN', { hour12: false });
        const alertDate = new Date(alert.timestamp).toLocaleDateString('en-IN');
        
        return `
            <div class="alert-item ${alert.level.toLowerCase()}" data-level="${alert.level}">
                <div class="alert-timestamp">${alertDate} ${alertTime}</div>
                <div class="alert-level ${alert.level.toLowerCase()}">${alert.level}</div>
                <div class="alert-location">${alert.location}, ${alert.region}</div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-confidence" style="font-size: 11px; color: #6c757d; margin-top: 4px;">
                    Confidence: ${(alert.confidence * 100).toFixed(1)}%
                </div>
            </div>
        `;
    }).join('');
}

function updateAlertStats() {
    const activeAlertsCount = document.getElementById('activeAlertsCount');
    const criticalCount = document.getElementById('criticalCount');
    
    if (activeAlertsCount) {
        activeAlertsCount.textContent = systemData.live_alerts.length;
    }
    
    if (criticalCount) {
        const criticalAlerts = systemData.live_alerts.filter(alert => alert.level === 'CRITICAL').length;
        criticalCount.textContent = criticalAlerts;
    }
}

// Initialize regional monitoring with live data
function initializeRegionalMonitoring() {
    if (!regionsGrid) return;

    regionsGrid.innerHTML = Object.entries(systemData.regions).map(([key, region]) => {
        const avgRainfall = (region.sensors.reduce((sum, s) => sum + s.rainfall, 0) / region.sensors.length).toFixed(1);
        const avgHumidity = Math.round(region.sensors.reduce((sum, s) => sum + s.humidity, 0) / region.sensors.length);
        const avgTemp = (region.sensors.reduce((sum, s) => sum + s.temp, 0) / region.sensors.length).toFixed(1);
        const avgPressure = (region.sensors.reduce((sum, s) => sum + s.pressure, 0) / region.sensors.length).toFixed(1);
        const now = new Date().toLocaleTimeString('en-IN', { hour12: false });

        return `
            <div class="region-card card ${region.status.toLowerCase()}" data-region="${key}">
                <div class="card__body">
                    <div class="region-header">
                        <h3 class="region-name">${region.name}</h3>
                        <span class="region-status ${region.status.toLowerCase()}">${region.status}</span>
                    </div>
                    <div class="live-readings">
                        <div class="reading-card">
                            <div class="reading-label">Avg Rainfall</div>
                            <div class="reading-value updating">${avgRainfall} mm/hr</div>
                        </div>
                        <div class="reading-card">
                            <div class="reading-label">Avg Humidity</div>
                            <div class="reading-value updating">${avgHumidity}%</div>
                        </div>
                        <div class="reading-card">
                            <div class="reading-label">Avg Temperature</div>
                            <div class="reading-value updating">${avgTemp}°C</div>
                        </div>
                        <div class="reading-card">
                            <div class="reading-label">Avg Pressure</div>
                            <div class="reading-value updating">${avgPressure} hPa</div>
                        </div>
                    </div>
                    <div class="region-alert">
                        <strong>Status:</strong> ${region.status} - Click for detailed sensor information
                    </div>
                    <div class="sensor-count">
                        📡 ${region.sensors.length} active sensors
                        <span class="live-badge small" style="margin-left: 8px;">🔴 LIVE</span>
                    </div>
                    <div class="update-time">Last updated: ${now}</div>
                </div>
            </div>
        `;
    }).join('');

    // Add click handlers to region cards
    document.querySelectorAll('.region-card').forEach(card => {
        card.addEventListener('click', function() {
            const regionKey = this.getAttribute('data-region');
            showRegionDetails(regionKey);
        });
    });
}

// Initialize analytics charts
function initializeAnalyticsCharts() {
    createRainfallTrendsChart();
    createAlertsDistributionChart();
    updateAnalyticsSummary();
}

function createRainfallTrendsChart() {
    const ctx = document.getElementById('rainfallChart');
    if (!ctx) return;

    const hours = Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`);
    const regions = Object.keys(systemData.regions);
    
    const datasets = regions.map((regionKey, index) => {
        const region = systemData.regions[regionKey];
        const avgRainfall = region.sensors.reduce((sum, s) => sum + s.rainfall, 0) / region.sensors.length;
        
        const data = hours.map((_, i) => {
            const baseValue = avgRainfall;
            const variation = Math.sin((i / 24) * Math.PI * 2) * baseValue * 0.3;
            const randomVariation = (Math.random() - 0.5) * baseValue * 0.2;
            return Math.max(0, baseValue + variation + randomVariation);
        });

        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];
        
        return {
            label: region.name,
            data: data,
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length] + '30',
            fill: false,
            tension: 0.4
        };
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Rainfall (mm/hr)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time (24-hour format)'
                    }
                }
            }
        }
    });
}

function createAlertsDistributionChart() {
    const ctx = document.getElementById('alertsChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Critical Alerts', 'Warning Alerts', 'Watch Alerts'],
            datasets: [{
                data: [
                    systemData.analytics.critical_alerts,
                    systemData.analytics.warning_alerts,
                    systemData.analytics.watch_alerts
                ],
                backgroundColor: ['#dc3545', '#fd7e14', '#ffc107'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateAnalyticsSummary() {
    animateCounter('alertsToday', systemData.analytics.alerts_today);
    document.getElementById('accuracyRate').textContent = systemData.analytics.accuracy_rate + '%';
    document.getElementById('peakRainfall').textContent = systemData.analytics.peak_rainfall_amount;
}

// Initialize live ticker
function initializeLiveTicker() {
    updateTicker();
    tickerInterval = setInterval(updateTicker, 5000); // Update every 5 seconds
}

function updateTicker() {
    if (!alertTicker) return;
    
    const criticalAlerts = systemData.live_alerts.filter(alert => alert.level === 'CRITICAL');
    const warningAlerts = systemData.live_alerts.filter(alert => alert.level === 'WARNING');
    
    let tickerText = '';
    
    if (criticalAlerts.length > 0) {
        const alert = criticalAlerts[0];
        tickerText += `🚨 CRITICAL: ${alert.location} - ${alert.message}`;
    }
    
    if (warningAlerts.length > 0) {
        const alert = warningAlerts[0];
        if (tickerText) tickerText += ' • ';
        tickerText += `⚠️ WARNING: ${alert.location} - ${alert.message}`;
    }
    
    if (!tickerText) {
        tickerText = '✅ All systems operational - No active critical alerts';
    }
    
    alertTicker.innerHTML = `
        <span class="ticker-text">🔴 LIVE ALERTS</span>
        <span class="ticker-separator">•</span>
        <span class="ticker-alert">${tickerText}</span>
        <span class="ticker-separator">•</span>
        <span class="ticker-alert">System Status: OPERATIONAL • Active Sensors: ${systemData.system_info.active_nodes}</span>
    `;
}

// Start real-time updates
function startRealTimeUpdates() {
    console.log('🔄 Starting real-time updates...');
    
    // Update sensor data every 5 seconds
    updateInterval = setInterval(() => {
        simulateLiveSensorUpdates();
        initializeRegionalMonitoring();
        console.log('📊 Sensor data updated');
    }, 5000);
    
    // Generate new alerts every 15 seconds
    setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance of new alert
            generateNewAlert();
        }
    }, 15000);
    
    // Update weather overlay every 3 seconds
    setInterval(updateWeatherOverlay, 3000);
}

function simulateLiveSensorUpdates() {
    Object.keys(systemData.regions).forEach(regionKey => {
        const region = systemData.regions[regionKey];
        region.sensors.forEach(sensor => {
            // Add realistic variations based on current status
            const variation = sensor.status === 'emergency' ? 0.8 :
                            sensor.status === 'critical' ? 0.5 : 
                            sensor.status === 'warning' ? 0.3 : 
                            sensor.status === 'watch' ? 0.2 : 0.1;
            
            sensor.temp += (Math.random() - 0.5) * variation;
            sensor.humidity += Math.floor((Math.random() - 0.5) * variation * 10);
            sensor.rainfall += (Math.random() - 0.5) * variation * 5;
            sensor.pressure += (Math.random() - 0.5) * variation * 2;
            
            // Keep values within realistic ranges
            sensor.temp = Math.max(10, Math.min(40, sensor.temp));
            sensor.humidity = Math.max(30, Math.min(100, sensor.humidity));
            sensor.rainfall = Math.max(0, Math.min(100, sensor.rainfall));
            sensor.pressure = Math.max(990, Math.min(1030, sensor.pressure));
            
            // Round values
            sensor.temp = Math.round(sensor.temp * 10) / 10;
            sensor.humidity = Math.round(sensor.humidity);
            sensor.rainfall = Math.round(sensor.rainfall * 10) / 10;
            sensor.pressure = Math.round(sensor.pressure * 10) / 10;
        });
    });
    
    // Update system metrics
    systemData.system_info.active_nodes += Math.floor((Math.random() - 0.5) * 5);
    systemData.system_info.active_nodes = Math.max(1240, Math.min(1250, systemData.system_info.active_nodes));
}

function generateNewAlert() {
    const regions = Object.keys(systemData.regions);
    const randomRegion = regions[Math.floor(Math.random() * regions.length)];
    const region = systemData.regions[randomRegion];
    const randomSensor = region.sensors[Math.floor(Math.random() * region.sensors.length)];
    
    const levels = ['WATCH', 'WARNING'];
    const level = Math.random() < 0.1 ? 'CRITICAL' : levels[Math.floor(Math.random() * levels.length)];
    
    const messages = [
        `${level === 'CRITICAL' ? 'Extreme' : level === 'WARNING' ? 'Heavy' : 'Moderate'} rainfall: ${randomSensor.rainfall.toFixed(1)} mm/hr detected`,
        `Atmospheric pressure anomaly: ${randomSensor.pressure} hPa in ${randomSensor.location}`,
        `High humidity levels: ${randomSensor.humidity}% with rising trend`,
        `Weather conditions ${level === 'CRITICAL' ? 'critical' : 'deteriorating'} in ${randomSensor.location}`
    ];
    
    const newAlert = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        level: level,
        region: region.name,
        location: randomSensor.location,
        message: messages[Math.floor(Math.random() * messages.length)],
        confidence: 0.75 + Math.random() * 0.2,
        priority: level === 'CRITICAL' ? 'urgent' : level === 'WARNING' ? 'high' : 'medium'
    };
    
    // Add to beginning and keep latest 10
    systemData.live_alerts.unshift(newAlert);
    systemData.live_alerts = systemData.live_alerts.slice(0, 10);
    
    // Update displays
    updateAlertsDisplay();
    updateAlertStats();
    updateTicker();
    
    // Play sound for critical alerts
    if (level === 'CRITICAL' && alertSoundEnabled) {
        playAlertSound();
    }
    
    // Update analytics
    systemData.analytics.alerts_today++;
    if (level === 'CRITICAL') systemData.analytics.critical_alerts++;
    if (level === 'WARNING') systemData.analytics.warning_alerts++;
    if (level === 'WATCH') systemData.analytics.watch_alerts++;
    
    console.log(`🚨 New ${level} alert generated for ${newAlert.location}`);
}

function playAlertSound() {
    if (alertSound && alertSoundEnabled) {
        alertSound.volume = 0.5;
        alertSound.play().catch(e => {
            console.log('Sound play failed:', e);
        });
    }
}

function playEmergencySound() {
    if (alertSound && alertSoundEnabled) {
        alertSound.volume = 0.7;
        // Play multiple times for emergency
        alertSound.play().catch(e => {
            console.log('Emergency sound play failed:', e);
        });
        
        setTimeout(() => {
            if (alertSound) alertSound.play().catch(() => {});
        }, 500);
    }
}

function updateWeatherOverlay() {
    const overlay = document.getElementById('weatherOverlay');
    if (overlay) {
        // Create animated weather effect
        const intensity = Math.random() * 0.3 + 0.2;
        const hue = Math.random() * 60 + 200; // Blue tones
        overlay.style.background = `radial-gradient(circle at ${Math.random() * 100}% ${Math.random() * 100}%, rgba(${hue}, 144, 255, ${intensity}) 0%, transparent 30%)`;
    }
}

// Event handlers
document.addEventListener('click', function(e) {
    if (e.target === regionModal || e.target.classList.contains('modal-backdrop')) {
        closeModal();
    }
    
    if (e.target === emergencyModal || e.target.classList.contains('emergency-backdrop')) {
        closeEmergencyModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (emergencyModal && !emergencyModal.classList.contains('hidden')) {
            closeEmergencyModal();
        } else if (regionModal && !regionModal.classList.contains('hidden')) {
            closeModal();
        }
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideIn 0.6s ease-out';
            fadeObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animations
document.addEventListener('DOMContentLoaded', function() {
    const elementsToAnimate = document.querySelectorAll('.card, .metric-card, .region-card');
    elementsToAnimate.forEach(el => {
        fadeObserver.observe(el);
    });
});

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (updateInterval) clearInterval(updateInterval);
    if (tickerInterval) clearInterval(tickerInterval);
});

// Export functions for global access
window.showRegionDetails = showRegionDetails;
window.closeModal = closeModal;
window.closeEmergencyModal = closeEmergencyModal;
window.acknowledgeEmergency = acknowledgeEmergency;
window.scrollToSection = scrollToSection;

// Console startup message
console.log('🏛️ National Cloudburst Early Warning System - OPERATIONAL');
console.log('📡 Active Sensor Nodes:', systemData.system_info.active_nodes);
console.log('🗺️ Regions Monitored:', systemData.system_info.monitored_states);
console.log('⚡ System Status: LIVE & OPERATIONAL');
console.log('🔊 Sound alerts will be enabled after user interaction');
console.log('🚨 Emergency alerts scheduled to auto-show');