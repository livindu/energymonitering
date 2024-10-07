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

            // Update the chart data
            mainPowerChart.data.datasets[0].data = mainPowerData;
            mainPowerChart.update();

            // Reset the array every 24 hours
            if (hours === 0 && minutes === 0) {
                mainPowerData = Array(24).fill(null); // Clear previous data
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
                        title: { display: true, text: 'Time (Hours)'  },
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
            const rows = data.split('\n').slice(1); // Skip header row
            const labels = [];
            const house1Dishw = [];
            const house3Dishw = [];

            rows.forEach(row => {
                const [timestamp, house1, house3] = row.split(',');
                const timeOnly = timestamp.split(' ')[1]; // Extract time portion only
                const time = timeOnly.split('-')[0]; // Further split to remove timezone info (if applicable)
                
                labels.push(time); // Use only the time as the label

                house1Dishw.push(parseFloat(house1)); // Push data for House 1 - Dishw
                house3Dishw.push(parseFloat(house3)); // Push data for House 3 - Dishwasher
            });

            updateDevicePowerChart(labels, house1Dishw, house3Dishw);
        })
        .catch(error => console.error('Error fetching power data:', error));
}

let devicePowerChart = null; // Initialize devicePowerChart as null

function updateDevicePowerChart(labels, house1Dishw, house3Dishw) {
    const ctx = document.getElementById('devicePowerChart').getContext('2d');
    
    // Check if the chart exists before destroying it
    if (devicePowerChart) {
        devicePowerChart.destroy(); 
    }

    devicePowerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'House 1 - Dishwasher', borderColor: 'rgba(0, 128, 128, 1)', data: house1Dishw, fill: false },
                { label: 'House 3 - Dishwasher', borderColor: 'rgba(128, 0, 128, 1)', data: house3Dishw, fill: false }
            ]
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
            responsive: true,
            maintainAspectRatio: false // Ensure the graph adjusts to screen size
        }
    });
    console.log('Device power chart updated.');
}



});
