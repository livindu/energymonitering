const apiKey = 'AIzaSyCJUpx3d2aRxgOnbbB73WBpcZ1oI2YAauc';
const sheetId = '1sAMNYYz1C2wIRcYA9RqKjKGprR3Lu6DLK0xBm-Rg4EA';

const logoutBtn = document.getElementById('logoutBtn');
logoutBtn?.addEventListener('click', function () {
    window.location.href = 'index.html';
});

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

document.addEventListener('DOMContentLoaded', function () {
    const ws = new WebSocket('ws://lucky-shell-honeycrisp.glitch.me/');
    let mainPowerChart;
    const mainPowerData = []; // Store all power data
    const timeLabels = []; // Store all time labels

    const mainPowerBtn = document.getElementById('mainPowerBtn');
    const devicePowerBtn = document.getElementById('devicePowerBtn');
    const mainPowerChartTitle = document.getElementById('mainPowerChartTitle');
    const devicePowerChartTitle = document.getElementById('devicePowerChartTitle');
    const mainPowerCanvas = document.getElementById('mainPowerChart');
    const devicePowerCanvas = document.getElementById('devicePowerChart');

    // Initialize a fixed time range for 0 to 60 minutes
    function initializeTimeLabels() {
        for (let i = 0; i <= 60; i++) {
            timeLabels.push(i.toString()); // Push 0 to 60 minutes
        }
    }

    if (mainPowerChartTitle && mainPowerCanvas && devicePowerChartTitle && devicePowerCanvas) {
        // Initially display the main power chart
        mainPowerChartTitle.style.display = 'block';
        mainPowerCanvas.style.display = 'block';
        devicePowerChartTitle.style.display = 'none';
        devicePowerCanvas.style.display = 'none';

        mainPowerBtn?.addEventListener('click', function () {
            mainPowerChartTitle.style.display = 'block';
            mainPowerCanvas.style.display = 'block';
            devicePowerChartTitle.style.display = 'none';
            devicePowerCanvas.style.display = 'none';
        });

        devicePowerBtn?.addEventListener('click', function () {
            mainPowerChartTitle.style.display = 'none';
            mainPowerCanvas.style.display = 'none';
            devicePowerChartTitle.style.display = 'block';
            devicePowerCanvas.style.display = 'block';

            fetchDevicePowerData(); // Fetch device power data when button is clicked
        });
    }

    ws.onopen = function () {
        console.log("WebSocket connection established.");
    };

    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);
        console.log('Received data:', data); // Log received data for debugging
        const { date, time, voltage, current, power } = data;

        // Update the voltage and current displays
        document.getElementById('dateDisplay').innerText = date;
        document.getElementById('voltage').innerText = `${voltage} V`;
        document.getElementById('current').innerText = `${current} A`;
        document.getElementById('power').innerText = `${power} W`;

        // Convert ESP32 time (formatted as HH:mm:ss) to a timestamp for 24-hour format
        const [hoursStr, minutesStr] = time.split(':');
        let hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr);

        if (!isNaN(hours) && !isNaN(minutes)) {
            // Calculate the elapsed time in minutes since the data was received
            const now = new Date();
            const elapsedTimeInMinutes = Math.floor((now - new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes)) / 60000);

            // Push the power data to the array
            mainPowerData.push(power);

            // Ensure the length of data arrays does not exceed 61 (0 to 60)
            if (mainPowerData.length > 61) {
                mainPowerData.shift(); // Remove the oldest entry
            }

            // Update the chart data
            mainPowerChart.data.labels = timeLabels; // Always keep labels from 0 to 60
            mainPowerChart.data.datasets[0].data = mainPowerData.slice(-61); // Only keep the latest 61 data points
            mainPowerChart.update(); // Redraw chart
        } else {
            console.error(`Invalid time format received: ${time}`); // Log if hours or minutes are NaN
        }
    };

    ws.onclose = function () {
        console.log("WebSocket connection closed.");
    };

    ws.onerror = function (error) {
        console.error("WebSocket error:", error);
    };

    // Initialize the main power chart
    function initializeMainPowerChart() {
        const ctx = document.getElementById('mainPowerChart').getContext('2d');

        // Initialize time labels
        initializeTimeLabels();

        mainPowerChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeLabels, // Initialize with time labels from 0 to 60 minutes
                datasets: [{
                    label: 'Main Power (W)',
                    borderColor: 'rgba(0, 128, 128, 1)',
                    fill: false,
                    data: [] // Initialize with empty data
                }]
            },
            options: {
                scales: {
                    x: {
                        title: { display: true, text: 'Time (Minutes)' },
                        ticks: {
                            autoSkip: false // Ensure no labels are skipped
                        }
                    },
                    y: {
                        min: 0,
                        max: 1500,
                        title: { display: true, text: 'Power (W)' }
                    }
                }
            }
        });

        console.log('Main power chart initialized.');
    }

    // Initialize the main power chart
    initializeMainPowerChart();

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

    function updateDevicePowerChart(labels, device0, device1, device2, device3, device4) {
        const ctx = document.getElementById('devicePowerChart').getContext('2d');
        if (devicePowerChart) {
            devicePowerChart.destroy();
        }
        devicePowerChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Device 0', borderColor: 'rgba(0, 128, 128, 1)', data: device0, fill: false },
                    { label: 'Device 1', borderColor: 'rgba(128, 0, 128, 1)', data: device1, fill: false },
                    { label: 'Device 2', borderColor: 'rgba(0, 128, 0, 1)', data: device2, fill: false },
                    { label: 'Device 3', borderColor: 'rgba(128, 128, 0, 1)', data: device3, fill: false },
                    { label: 'Device 4', borderColor: 'rgba(0, 0, 128, 1)', data: device4, fill: false },
                ]
            },
            options: {
                scales: {
                    x: {
                        title: { display: true, text: 'Time (Minutes)' },
                        ticks: {
                            autoSkip: false // Ensure no labels are skipped
                        }
                    },
                    y: {
                        title: { display: true, text: 'Power (W)' }
                    }
                }
            }
        });
        console.log('Device power chart updated.');
    }
});
