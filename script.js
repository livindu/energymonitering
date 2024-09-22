const apiKey = 'AIzaSyCJUpx3d2aRxgOnbbB73WBpcZ1oI2YAauc'; 
const sheetId2 = '1sAMNYYz1C2wIRcYA9RqKjKGprR3Lu6DLK0xBm-Rg4EA'; 


document.addEventListener('DOMContentLoaded', function () {
    // WebSocket connection for ESP32 data (Main Power)
    const socket = new WebSocket('ws://lucky-shell-honeycrisp.glitch.me/');

    let chartInstance;  // To hold the chart object

    // WebSocket message event
    socket.onmessage = function (event) {
        const data = JSON.parse(event.data); // Assuming data is JSON
        const labels = data.map(entry => entry.time);
        const mainPower = data.map(entry => entry.power);

        if (chartInstance) {
            chartInstance.destroy(); // Destroy the previous chart if any
        }
        updateChart(labels, mainPower, 'Main Power');
    };

    // Fetch power data for devices from Sheet 2
    function fetchDevicePowerData() {
        const sheetId2 = '1sAMNYYz1C2wIRcYA9RqKjKGprR3Lu6DLK0xBm-Rg4EA';
        const powerDataUrl = `https://docs.google.com/spreadsheets/d/${sheetId2}/pub?output=csv`;

        fetch(powerDataUrl)
            .then(response => response.text())
            .then(data => {
                const rows = data.split('\n').slice(1);
                const labels = [];
                const device1 = [];
                const device2 = [];
                const device3 = [];
                const device4 = [];

                rows.forEach(row => {
                    const [timeMs, , dev1, dev2, dev3, dev4] = row.split(',');
                    const time = new Date(parseInt(timeMs));
                    const formattedTime = `${time.getUTCHours()}:${time.getUTCMinutes()}`;

                    labels.push(formattedTime);
                    device1.push(parseFloat(dev1));
                    device2.push(parseFloat(dev2));
                    device3.push(parseFloat(dev3));
                    device4.push(parseFloat(dev4));
                });

                if (chartInstance) {
                    chartInstance.destroy(); // Destroy the previous chart if any
                }
                updateDevicePowerChart(labels, device1, device2, device3, device4);
            })
            .catch(error => console.error('Error fetching device power data:', error));
    }

    // Function to update Main Power chart
    function updateChart(labels, data, label) {
        const ctx = document.getElementById('powerChart').getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    borderColor: 'rgba(0, 128, 128, 1)',
                    data: data,
                }],
            },
            options: {
                scales: {
                    x: {
                        title: { display: true, text: 'Time (24 Hours)' },
                    },
                    y: {
                        title: { display: true, text: 'Power (W)' },
                    },
                },
            },
        });
    }

    // Function to update Device Power chart
    function updateDevicePowerChart(labels, device1, device2, device3, device4) {
        const ctx = document.getElementById('powerChart').getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Device 1', borderColor: 'rgba(255, 99, 132, 1)', data: device1 },
                    { label: 'Device 2', borderColor: 'rgba(54, 162, 235, 1)', data: device2 },
                    { label: 'Device 3', borderColor: 'rgba(255, 206, 86, 1)', data: device3 },
                    { label: 'Device 4', borderColor: 'rgba(153, 102, 255, 1)', data: device4 },
                ],
            },
            options: {
                scales: {
                    x: {
                        title: { display: true, text: 'Time (24 Hours)' },
                    },
                    y: {
                        title: { display: true, text: 'Power (W)' },
                    },
                },
            },
        });
    }

    // Add event listeners for buttons
    document.getElementById('mainPowerBtn').addEventListener('click', function () {
        socket.send('fetchMainPower'); // Trigger fetching of main power data
    });

    document.getElementById('devicePowerBtn').addEventListener('click', function () {
        fetchDevicePowerData(); // Fetch device power data
    });

    // Fetch device power data initially to display on load
    fetchDevicePowerData();
});




    // Logout function
    document.getElementById('logoutButton').addEventListener('click', function() {
        window.location.href = 'index.html';
    });

    // Login form functionality
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === 'admin' && password === 'admin') {
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid User Credentials');
        }
    });
});
