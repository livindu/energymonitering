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
    const mainPowerData = Array(1440).fill(null); // Initialize an array to hold 24 hours of data
    const timeLabels = []; // Store all time labels

    const mainPowerBtn = document.getElementById('mainPowerBtn');
    const devicePowerBtn = document.getElementById('devicePowerBtn');
    const mainPowerChartTitle = document.getElementById('mainPowerChartTitle');
    const devicePowerChartTitle = document.getElementById('devicePowerChartTitle');
    const mainPowerCanvas = document.getElementById('mainPowerChart');
    const devicePowerCanvas = document.getElementById('devicePowerChart');

    // Function to generate time labels (00:00 to 23:59)
    function initializeTimeLabels() {
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 60; j++) {
                const hourLabel = `${i.toString().padStart(2, '0')}:${j.toString().padStart(2, '0')}`;
                timeLabels.push(hourLabel);
            }
        }
    }

    // Load data from local storage
    function loadLocalData() {
        const savedData = JSON.parse(localStorage.getItem('mainPowerData'));
        const lastSavedDate = localStorage.getItem('lastSavedDate');
        const currentDate = new Date().toLocaleDateString();

        // Clear data if the date has changed
        if (lastSavedDate !== currentDate) {
            localStorage.removeItem('mainPowerData');
            localStorage.setItem('lastSavedDate', currentDate);
            mainPowerData.fill(null); // Reset array for new day
        } else if (savedData) {
            savedData.forEach((value, index) => {
                if (value !== null) {
                    mainPowerData[index] = value; // Load the saved power data
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
        console.log('Received data:', data); // Log received data for debugging
        const { date, time, voltage, current, power } = data;

        document.getElementById('dateDisplay').innerText = date;   
        document.getElementById('voltage').innerText = `${voltage} V`;
        document.getElementById('current').innerText = `${current} A`;
        document.getElementById('power').innerText = `${power} W`;

        const [hoursStr, minutesStr] = time.split(':');
        const hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr);

        if (!isNaN(hours) && !isNaN(minutes)) {
            const currentIndex = hours * 60 + minutes; // Calculate the index in the 24-hour array

            mainPowerData[currentIndex] = power; // Update power at the corresponding hour
            
            // Save to local storage
            localStorage.setItem('mainPowerData', JSON.stringify(mainPowerData));
            localStorage.setItem('lastSavedDate', new Date().toLocaleDateString()); // Save the current date

            // Update the chart data
            mainPowerChart.data.datasets[0].data = mainPowerData;
            mainPowerChart.update();
        } else {
            console.error(`Invalid time format received: ${time}`); // Log if hours or minutes are NaN
        }
    };

    ws.onclose = function() {
        console.log("WebSocket connection closed. Reconnecting...");
        setTimeout(function() {
            ws = new WebSocket('wss://lucky-shell-honeycrisp.glitch.me/');
        }, 1000); // Reconnect after 1 second
    };

    ws.onerror = function(error) {
        console.error("WebSocket error:", error);
    };

    function initializeMainPowerChart() {
        const ctx = document.getElementById('mainPowerChart').getContext('2d');
        
        // Initialize time labels
        initializeTimeLabels();
        loadLocalData(); // Load data from local storage

        mainPowerChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeLabels, // Fixed time labels for 24 hours
                datasets: [{
                    label: 'Main Power (W)',
                    borderColor: 'rgba(0, 128, 128, 1)',
                    fill: false,
                    data: mainPowerData.map(value => value !== null ? value : 0), // Replace null with 0
                    pointRadius: 0, // Size of data points on the line
                    pointBackgroundColor: 'rgba(0, 128, 128, 1)', // Color of points
                    lineTension: 0.3,
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    x: {
                        title: { display: true, text: 'Time (Hours)' },
                        ticks: {
                            autoSkip: true, // Ensure no labels are skipped
                            maxTicksLimit: 12 
                        }
                    },
                    y: {
                        min: 0,
                        max: 1500,
                        title: { display: true, text: 'Power (W)' },
                        ticks: {
                            stepSize: 100 // Define step size for y-axis ticks
                        }
                    }
                },
                responsive: true, // Ensure the chart resizes with the window
                maintainAspectRatio: false // Allow the chart to fill the container
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
            const rows = data.split('\n'); 
            const headerRow = rows[0].split(','); // Extract the header row
            const labels = [];
            const deviceData = {}; // Object to hold data for each device

            // Initialize empty arrays for each device based on the headers (skip Timestamp)
            headerRow.slice(1).forEach((header) => {
                deviceData[header.trim()] = [];
            });

            // Process each row (starting from row 2 to skip the header)
            rows.slice(1).forEach(row => {
                const columns = row.split(',');
                const timestamp = columns[0]; // Timestamp is in the first column
                const timeOnly = timestamp.split(' ')[1]; // Extract time portion only
                const time = timeOnly.split('-')[0]; // Further split to remove timezone info (if applicable)

                labels.push(time); // Use only the time as the label

                // Populate the device data
                columns.slice(1).forEach((value, index) => {
                    const deviceName = headerRow[index + 1].trim(); // Get the corresponding device name from the header
                    deviceData[deviceName].push(parseFloat(value)); // Push the data for each device
                });
            });

            updateDevicePowerChart(labels, deviceData);
        })
        .catch(error => console.error('Error fetching power data:', error));
}

let devicePowerChart = null; // Initialize devicePowerChart as null

function updateDevicePowerChart(labels, deviceData) {
    const ctx = document.getElementById('devicePowerChart').getContext('2d');

    // Predefined colors for each device for consistency
    const colors = [
        'rgba(75, 192, 192, 1)', // Aqua
        'rgba(255, 99, 132, 1)', // Pink
        'rgba(54, 162, 235, 1)', // Blue
        'rgba(255, 206, 86, 1)', // Yellow
        'rgba(153, 102, 255, 1)' // Purple
    ];

    // Prepare datasets for the chart
    const datasets = Object.keys(deviceData).map((deviceName, index) => ({
        label: deviceName, // Use dynamic device name from the header
        borderColor: colors[index % colors.length], // Assign colors consistently
        data: deviceData[deviceName],
        fill: false,
        tension: 0.3, // Enable line smoothing
        borderWidth: 2, // Increase line width for better visibility
        pointRadius: 0 //
        
    }));

    // Check if the chart exists before destroying it
    if (devicePowerChart) {
        devicePowerChart.destroy(); 
    }

    devicePowerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets // Use dynamic datasets for each device
        },
        options: {
            scales: {
                x: {
                    title: { display: true, text: 'Time (HH:MM:SS)' }, // Show time as HH:MM:SS
                    ticks: {
                        autoSkip: true, // Reduce clutter by auto-skipping some x-axis labels
                        maxTicksLimit: 10 // Limit the number of x-axis labels shown
                    }
                },
                y: {
                    title: { display: true, text: 'Power (W)' },
                    min: 0, // Start y-axis at 0
                    ticks: {
                        stepSize: 0 // Set a step size for better readability of power values
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false, // Ensure the graph adjusts to screen size
            plugins: {
                legend: {
                    position: 'top', // Move legend to the top for better visibility
                    labels: {
                        usePointStyle: true // Use point style to match color labels
                    }
                }
            }
        }
    });
    console.log('Device power chart updated.');
}

});
