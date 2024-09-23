const apiKey = 'AIzaSyCJUpx3d2aRxgOnbbB73WBpcZ1oI2YAauc';
const sheetId = '1sAMNYYz1C2wIRcYA9RqKjKGprR3Lu6DLK0xBm-Rg4EA';

    // Logout button functionality
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', function () {
        window.location.href = 'index.html';
    });

    // Login form functionality
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', function (event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === 'admin' && password === 'admin') {
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid User Credentials');
        }
    });

    
document.addEventListener('DOMContentLoaded', function() {
    // WebSocket connection for main power (ESP32)
    const ws = new WebSocket('ws://lucky-shell-honeycrisp.glitch.me/');
    let mainPowerChart;
    let devicePowerChart;

    const mainPowerBtn = document.getElementById('mainPowerBtn');
    const devicePowerBtn = document.getElementById('devicePowerBtn');
    const mainPowerChartTitle = document.getElementById('mainPowerChartTitle');
    const devicePowerChartTitle = document.getElementById('devicePowerChartTitle');
    const mainPowerCanvas = document.getElementById('mainPowerChart');
    const devicePowerCanvas = document.getElementById('devicePowerChart');

    if (mainPowerChartTitle && mainPowerCanvas && devicePowerChartTitle && devicePowerCanvas) {
        // Initially, show Main Power chart and hide Device Power chart and heading
        mainPowerChartTitle.style.display = 'block';
        mainPowerCanvas.style.display = 'block';
        devicePowerChartTitle.style.display = 'none';
        devicePowerCanvas.style.display = 'none';

        // Show Main Power chart and hide Device Power chart when Main Power button is clicked
        mainPowerBtn?.addEventListener('click', function () {
            mainPowerChartTitle.style.display = 'block';
            mainPowerCanvas.style.display = 'block';
            devicePowerChartTitle.style.display = 'none';
            devicePowerCanvas.style.display = 'none';
        });

        // Show Device Power chart and hide Main Power chart when Device Power button is clicked
        devicePowerBtn?.addEventListener('click', function () {
            mainPowerChartTitle.style.display = 'none';
            mainPowerCanvas.style.display = 'none';
            devicePowerChartTitle.style.display = 'block';
            devicePowerCanvas.style.display = 'block';

            fetchDevicePowerData();
        });
    }

    ws.onopen = function() {
        console.log("WebSocket connection established.");
    };

    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        const { date, time, power, voltage, current } = data;

        // Display the date from the WebSocket (ESP32)
        document.getElementById('dateDisplay').innerText = date;

        // Update Voltage and Current boxes
        document.getElementById('voltage').innerText = `${voltage} V`;
        document.getElementById('current').innerText = `${current} A`;

        // Format the time from WebSocket (assuming time is in ISO format or standard Date string)
        const timeObj = new Date(time);
        const formattedTime = `${timeObj.getHours().toString().padStart(2, '0')}:${timeObj.getMinutes().toString().padStart(2, '0')}`;

        // Update Main Power Chart with new data
        if (mainPowerChart) {
            mainPowerChart.data.labels.push(formattedTime);
            mainPowerChart.data.datasets[0].data.push(power); // Add the power data point
            mainPowerChart.update();
        }
    };

    ws.onclose = function() {
        console.log("WebSocket connection closed.");
    };

    ws.onerror = function(error) {
        console.error("WebSocket error:", error);
    };

    // Initialize the Main Power Chart
    initializeMainPowerChart();

    // Fetch power data for devices from Google Sheets
    function fetchDevicePowerData() {
        const powerDataUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`;

        fetch(powerDataUrl)
            .then(response => response.text())
            .then(data => {
                const rows = data.split('\n').slice(1);
                const labels = [];
                const device0 = [];
                const device1 = [];
                const device2 = [];
                const device3 = [];
                const device4 = [];

                rows.forEach(row => {
                    const [timeMs, dev0, dev1, dev2, dev3, dev4] = row.split(',');
                    const time = new Date(parseInt(timeMs));
                    const hours = time.getUTCHours();
                    const minutes = time.getUTCMinutes();
                    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

                    labels.push(formattedTime);
                    device0.push(parseFloat(dev0));
                    device1.push(parseFloat(dev1));
                    device2.push(parseFloat(dev2));
                    device3.push(parseFloat(dev3));
                    device4.push(parseFloat(dev4));
                });

                updateDevicePowerChart(labels, device0, device1, device2, device3, device4);
            })
            .catch(error => console.error('Error fetching power data:', error));
    }

    // Initialize or update the Main Power Chart (ESP32)
    function initializeMainPowerChart() {
        const ctx = document.getElementById('mainPowerChart').getContext('2d');
        mainPowerChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [], // Time labels will be added dynamically
                datasets: [{
                    label: 'Main Power (W)',
                    borderColor: 'rgba(0, 128, 128, 1)',
                    data: [] // Power data will be added dynamically
                }]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'Time (24 Hours)' } },
                    y: { min: 0, max: 3000, title: { display: true, text: 'Power (W)' } }
                }
            }
        });
    }

    // Update the Device Power Chart (Google Sheets)
    function updateDevicePowerChart(labels, device0, device1, device2, device3, device4) {
        const ctx = document.getElementById('devicePowerChart').getContext('2d');
        if (devicePowerChart) {
            devicePowerChart.destroy(); // Clear old chart
        }
        devicePowerChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Device 0', borderColor: 'rgba(0, 128, 128, 1)', data: device0 },
                    { label: 'Device 1', borderColor: 'rgba(255, 99, 132, 1)', data: device1 },
                    { label: 'Device 2', borderColor: 'rgba(54, 162, 235, 1)', data: device2 },
                    { label: 'Device 3', borderColor: 'rgba(255, 206, 86, 1)', data: device3 },
                    { label: 'Device 4', borderColor: 'rgba(153, 102, 255, 1)', data: device4 }
                ]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'Time (24 Hours)' } },
                    y: { min: 0, max: 3000, title: { display: true, text: 'Power (W)' } }
                }
            }
        });
    }


});
