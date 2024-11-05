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
    const ws = new WebSocket('wss://lucky-shell-honeycrisp.glitch.me/');
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
        if (savedData) {
            savedData.forEach((value, index) => {
                if (value !== null) {
                    mainPowerData[index] = value; // Load the saved power data
                }
            });
        }
    }


    // Function to save data with a timestamp
function saveDataWithExpiration(key, value) {
    const data = {
        value: value,
        timestamp: new Date().getTime() // Current timestamp in milliseconds
    };
    localStorage.setItem(key, JSON.stringify(data));
}

// Function to check for expired data
function checkForExpiredData(key) {
    const data = JSON.parse(localStorage.getItem(key));

    if (data) {
        const currentTime = new Date().getTime();
        const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // One day in milliseconds
        
        // Check if the data is older than one day
        if (currentTime - data.timestamp > oneDayInMilliseconds) {
            localStorage.removeItem(key); // Remove expired data
            console.log(`${key} has been removed from local storage due to expiration.`);
        }
    }
}

// Function to periodically check for expired data
function startPeriodicExpirationCheck(key, interval) {
    setInterval(() => {
        checkForExpiredData(key);
    }, interval); // Check for expired data every `interval` milliseconds
}

// Example usage
const key = 'mainPowerData';
const value = [/* your power data */];

// Save data
saveDataWithExpiration(key, value);

// Start periodic check for expired data every hour (3600000 milliseconds)
startPeriodicExpirationCheck(key, 3600000); // Adjust interval as needed


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

            // Update the chart data
            mainPowerChart.data.datasets[0].data = mainPowerData;
            mainPowerChart.update();

            // Reset the array every 24 hours
            if (hours === 0 && minutes === 0) {
                mainPowerData.fill(null); // Clear previous data
                localStorage.removeItem('mainPowerData'); // Clear local storage data
            }
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
                    pointRadius: 2, // Size of data points on the line
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

    // Prepare datasets for the chart
    const datasets = Object.keys(deviceData).map((deviceName, index) => ({
        label: deviceName, // Use dynamic device name from the header
        borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`, // Random color for each device
        backgroundColor: `rgba(255, 255, 255, 0)`, // Transparent background for each line
        data: deviceData[deviceName], 
        fill: false,
        borderWidth: 2, // Increase line width
        pointRadius: 5, // Increase point size
        lineTension: 0.3 // Smooth out the curves
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
                        maxTicksLimit: 20 // Limit the number of x-axis labels shown
                    }
                },
                y: {
                    title: { display: true, text: 'Power (W)' },
                    min: 0, // Start y-axis at 0
                    ticks: {
                        stepSize: 1 // Set a step size for better readability of power values
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index', // Show tooltips for all datasets at the hovered index
                    intersect: false // Allow tooltips to appear when hovering near a point
                }
            },
            responsive: true,
            maintainAspectRatio: false, // Ensure the graph adjusts to screen size
            elements: {
                line: {
                    tension: 0.3 // Add a slight tension to lines for smoother curves
                },
                point: {
                    radius: 5, // Increase the radius of points on the line
                }
            }
        }
    });
    console.log('Device power chart updated.');
}


