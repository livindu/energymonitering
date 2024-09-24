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
        const { date, time, voltage, current, power } = data;

 
        document.getElementById('dateDisplay').innerText = date;

   
        document.getElementById('voltage').innerText = `${voltage} V`;
        document.getElementById('current').innerText = `${current} A`;


        const timeObj = new Date(time);
        const formattedTime = `${timeObj.getHours().toString().padStart(2, '0')}:${timeObj.getMinutes().toString().padStart(2, '0')}`;

    
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


    function initializeMainPowerChart() {
        const ctx = document.getElementById('mainPowerChart').getContext('2d');
        mainPowerChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [], 
                datasets: [{
                    label: 'Main Power (W)',
                    borderColor: 'rgba(0, 128, 128, 1)',
                    data: [] 
                }]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'Time (24 Hours)' } },
                    y: { min: 0, max: 1500, title: { display: true, text: 'Power (W)' } }
                }
            }
        });
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
                    y: { min: 0, max: 1500, title: { display: true, text: 'Power (W)' } }
                }
            }
        });
    }


});
