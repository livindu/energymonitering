const apiKey = 'AIzaSyCJUpx3d2aRxgOnbbB73WBpcZ1oI2YAauc'; 
const sheetId = '1sAMNYYz1C2wIRcYA9RqKjKGprR3Lu6DLK0xBm-Rg4EA'; 


// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    
    const mainPowerBtn = document.getElementById('mainPowerBtn');
    const devicePowerBtn = document.getElementById('devicePowerBtn');
    const chartTitle = document.getElementById('chartTitle');
    let powerChart; // We'll use this to store the chart instance

    // WebSocket connection for ESP32 real-time data
    const ws = new WebSocket('ws://lucky-shell-honeycrisp.glitch.me/');
    
    ws.onopen = function() {
        console.log("WebSocket connection established.");
    };

    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        const { power, voltage, current } = data;
        
        // Update Voltage and Current display
        document.getElementById('voltage').innerText = `${voltage} V`;
        document.getElementById('current').innerText = `${current} A`;
        
        // If the graph is displaying main power data, update the chart
        if (chartTitle.innerText === 'Main Power Consumption') {
            const time = new Date().toLocaleTimeString();
            updateChart([time], [power], 'Main Power (W)');
        }
    };

    ws.onclose = function() {
        console.log("WebSocket connection closed.");
    };

    ws.onerror = function(error) {
        console.error("WebSocket error:", error);
    };
    
    // Fetch power data for devices from Google Sheets
    function fetchDevicePowerData() {
        const sheetId = 'your-google-sheet-id';
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
                    const time = new Date(parseInt(timeMs)).toLocaleTimeString(); // Convert milliseconds to readable time

                    labels.push(time);
                    device0.push(parseFloat(dev0));
                    device1.push(parseFloat(dev1));
                    device2.push(parseFloat(dev2));
                    device3.push(parseFloat(dev3));
                    device4.push(parseFloat(dev4));
                });

                // Update chart with device power data
                updateChart(labels, [device0, device1, device2, device3, device4], 'Device Power Consumption (W)', [
                    'Device 0', 'Device 1', 'Device 2', 'Device 3', 'Device 4'
                ]);
            })
            .catch(error => console.error('Error fetching power data:', error));
    }

    // Function to update chart
    function updateChart(labels, datasets, chartLabel, datasetLabels = []) {
        const ctx = document.getElementById('powerChart').getContext('2d');

        // Destroy existing chart if present
        if (powerChart) {
            powerChart.destroy();
        }

        // Create new datasets for the chart
        const chartDatasets = datasets.map((data, index) => ({
            label: datasetLabels[index] || chartLabel,
            borderColor: ['rgba(0, 128, 128, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(153, 102, 255, 1)'][index],
            data: data,
            fill: false,
        }));

        // Create a new chart
        powerChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: chartDatasets
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time (HH:MM:SS)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Power (W)'
                        }
                    }
                }
            }
        });
    }

    // Event listeners for the buttons
    mainPowerBtn.addEventListener('click', function() {
        chartTitle.innerText = 'Main Power Consumption';
        // Power data will automatically update from WebSocket
    });

    devicePowerBtn.addEventListener('click', function() {
        chartTitle.innerText = 'Device Power Consumption';
        fetchDevicePowerData(); // Fetch and display device power data
    });

});



document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === 'admin' && password === 'admin') {
            window.location.href = 'dashboard.html'; // Ensure the file path is correct
        } else {
            alert('Invalid User Credentials');
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', function() {
        window.location.href = 'index.html'; // Make sure 'index.html' is the correct file path
    });
});
