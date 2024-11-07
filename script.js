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

document.addEventListener('DOMContentLoaded', function() {
    let ws = new WebSocket('wss://lucky-shell-honeycrisp.glitch.me/');
    let mainPowerChart;
    const mainPowerData = Array(1440).fill(null); // Start Array data 24 hours
    const timeLabels = []; // Store time labels

    const mainPowerBtn = document.getElementById('mainPowerBtn');
    const devicePowerBtn = document.getElementById('devicePowerBtn');
    const mainPowerChartTitle = document.getElementById('mainPowerChartTitle');
    const devicePowerChartTitle = document.getElementById('devicePowerChartTitle');
    const mainPowerCanvas = document.getElementById('mainPowerChart');
    const devicePowerCanvas = document.getElementById('devicePowerChart');

    
    function initializeTimeLabels() {   // 24 h time function
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 60; j++) {
                const hourLabel = `${i.toString().padStart(2, '0')}:${j.toString().padStart(2, '0')}`;
                timeLabels.push(hourLabel);
            }
        }
    }

    
    function loadLocalData() {   // Load local storage data
        const savedData = JSON.parse(localStorage.getItem('mainPowerData'));
        const lastSavedDate = localStorage.getItem('lastSavedDate');
        const currentDate = new Date().toLocaleDateString();

        
        if (lastSavedDate !== currentDate) {  // Clear data 
            localStorage.removeItem('mainPowerData');
            localStorage.setItem('lastSavedDate', currentDate);
            mainPowerData.fill(null); // Reset array 
        } else if (savedData) {
            savedData.forEach((value, index) => {
                if (value !== null) {
                    mainPowerData[index] = value; // Load local storage power data
                }
            });
        }
    }

    if (mainPowerChartTitle && mainPowerCanvas && devicePowerChartTitle && devicePowerCanvas) {
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

            fetchDevicePowerData();
        });
    }

    ws.onopen = function() {
        console.log("WebSocket connection established.");
    };

    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log('Received data:', data); 
        const { date, time, voltage, current, power } = data;

        document.getElementById('dateDisplay').innerText = date;   
        document.getElementById('voltage').innerText = `${voltage} V`;
        document.getElementById('current').innerText = `${current} A`;
        document.getElementById('power').innerText = `${power} W`;

        const [hoursStr, minutesStr] = time.split(':');
        const hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr);

        if (!isNaN(hours) && !isNaN(minutes)) {
            const currentIndex = hours * 60 + minutes; // index value for 24-hour array

            mainPowerData[currentIndex] = power; // Update power and hour
            
            // Save to local storage
            localStorage.setItem('mainPowerData', JSON.stringify(mainPowerData));
            localStorage.setItem('lastSavedDate', new Date().toLocaleDateString()); // current date saved

            // Update the chart data
            mainPowerChart.data.datasets[0].data = mainPowerData;
            mainPowerChart.update();
        } else {
            console.error(`Invalid time format received: ${time}`); // time value NaN
        }
    };

    ws.onclose = function() {
        console.log("WebSocket connection closed. Reconnecting...");
        setTimeout(function() {
            ws = new WebSocket('wss://lucky-shell-honeycrisp.glitch.me/');
        }, 1000); // Reconnection
    };

    ws.onerror = function(error) {
        console.error("WebSocket error:", error);
    };

    function initializeMainPowerChart() {
        const ctx = document.getElementById('mainPowerChart').getContext('2d');
        
        
        initializeTimeLabels();
        loadLocalData(); // Load local storage data

        mainPowerChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeLabels, // 24h formation
                datasets: [{
                    label: 'Main Power (W)',
                    borderColor: 'rgba(0, 128, 128, 1)',
                    fill: false,
                    data: mainPowerData.map(value => value !== null ? value : 0), 
                    pointRadius: 0, // line
                    pointBackgroundColor: 'rgba(0, 128, 128, 1)', 
                    lineTension: 1,
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    x: {
                        title: { display: true, text: 'Time (Hours)' },
                        ticks: {
                            autoSkip: true, 
                            maxTicksLimit: 12 
                        }
                    },
                    y: {
                        min: 0,
                        max: 1500,
                        title: { display: true, text: 'Power (W)' },
                        ticks: {
                            stepSize: 100 
                        }
                    }
                },
                responsive: true, // Auto chart resize
                maintainAspectRatio: false 
            }
        });

        console.log('Main power chart initialized.');
    }

    // Main power chart
    initializeMainPowerChart();

function fetchDevicePowerData() {
    const powerDataUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`;

    fetch(powerDataUrl)
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n'); 
            const headerRow = rows[0].split(','); 
            const labels = [];
            const deviceData = {}; // Hold device power data

            // Initialize empty arrays for each device 
            headerRow.slice(1).forEach((header) => { // select header
                deviceData[header.trim()] = [];
            });

            // select row 
            rows.slice(1).forEach(row => {
                const columns = row.split(',');
                const timestamp = columns[0]; // Timestamp 
                const timeOnly = timestamp.split(' ')[1]; 
                const time = timeOnly.split('-')[0]; // split 

                labels.push(time); 

                
                columns.slice(1).forEach((value, index) => {
                    const deviceName = headerRow[index + 1].trim(); // Device name 
                    deviceData[deviceName].push(parseFloat(value)); // Push device data 
                });
            });

            updateDevicePowerChart(labels, deviceData);
        })
        .catch(error => console.error('Error fetching power data:', error));
}

let devicePowerChart = null; 

function updateDevicePowerChart(labels, deviceData) {
    const ctx = document.getElementById('devicePowerChart').getContext('2d');

    // Device color setting 
    const colors = [
        'rgba(75, 192, 192, 1)', // Aqua
        'rgba(255, 99, 132, 1)', // Pink
        'rgba(54, 162, 235, 1)', // Blue
        'rgba(255, 206, 86, 1)', // Yellow
        'rgba(153, 102, 255, 1)' // Purple
    ];

    // data
    const datasets = Object.keys(deviceData).map((deviceName, index) => ({
        label: deviceName, // Header name
        borderColor: colors[index % colors.length], // Assign color
        data: deviceData[deviceName],
        fill: false,
        tension: 0.3, 
        borderWidth: 2, 
        pointRadius: 0
        
    }));

    
    if (devicePowerChart) {
        devicePowerChart.destroy(); 
    }

    devicePowerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets 
        },
        options: {
            scales: {
                x: {
                    title: { display: true, text: 'Time (HH:MM:SS)' }, // HH:MM:SS
                    ticks: {
                        autoSkip: true, 
                        maxTicksLimit: 10 
                    }
                },
                y: {
                    title: { display: true, text: 'Power (W)' },
                    min: 0, 
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false, // Auto chart resize
            plugins: {
                legend: {
                    position: 'top', 
                    labels: {
                        usePointStyle: true 
                    }
                }
            }
        }
    });
    console.log('Device power chart updated.');
}

});
