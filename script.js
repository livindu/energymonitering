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


            saveDataToGoogleSheet(mainPowerData);

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



// Function to send data to Google Sheet
function saveDataToGoogleSheet(dataArray) {
   const apiUrl = 'https://script.google.com/macros/s/AKfycbxx_bzpQemX-iiA9X1LnZVy6IGEM72IxInVZQ_4N_98c7Z6hi51IxYrmoFkxNPqnTNEXA/exec';
                
    console.log('Sending data:', dataArray);  // Debugging line to verify the data being sent

    fetch(apiUrl, {
        method: 'POST',  // Use POST method to send data
        headers: {
            'Content-Type': 'application/json',  // Sending JSON data
        },
        body: JSON.stringify(dataArray),  // Convert the data array to a JSON string
    })
    .then(response => response.json())  // Parse the response as JSON
    .then(data => {
        console.log('Data saved to Google Sheet:', data);  // Log the success message from the server
    })
    .catch(error => {
        console.error('Error saving data to Google Sheet:', error);  // Log any errors that occur
    });
}

// Example of testing static data
saveDataToGoogleSheet([100, 200, 300]);  // Test with static data


           initializeMainPowerChart();

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

let devicePowerChart = null; // Initialize devicePowerChart as null

function updateDevicePowerChart(labels, device0, device1, device2, device3, device4) {
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
                    title: { display: true, text: 'Time (24 Hours)' },
                    ticks: {
                        autoSkip: false
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
