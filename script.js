const apiKey = 'AIzaSyCJUpx3d2aRxgOnbbB73WBpcZ1oI2YAauc'; 
const sheetId2 = '1sAMNYYz1C2wIRcYA9RqKjKGprR3Lu6DLK0xBm-Rg4EA';

document.addEventListener('DOMContentLoaded', function(){
    // Establish WebSocket connection
    const ws = new WebSocket('ws://lucky-shell-honeycrisp.glitch.me/');
    ws.onopen = function(){
        console.log("WebSocket connection established.");
    };
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        const { date, time, power, voltage, current } = data;
        // Update Voltage and Current boxes
        document.getElementById('voltage').innerText = `${voltage} V`;
        document.getElementById('current').innerText = `${current} A`;
        // Display Date in top left
        document.getElementById('dateDisplay').innerText = `Date: ${date}`;
    };
    socket.onerror = function(event) {
        console.error("WebSocket error observed:", event);
        alert("Failed to connect to the ESP32 WebSocket server. Please check if the ESP32 is powered on.");
    };
    socket.onclose = function(event) {
        console.log("WebSocket connection closed");
        alert("Connection to ESP32 was lost. Please ensure it is running.");
    };
    
    document.getElementById('mainPowerBtn').addEventListener('click', function() {
    document.getElementById('chartTitle').innerText = 'Main Power Consumption';
    fetchPowerData('main'); // Pass a parameter to indicate fetching main power data});
        
    document.getElementById('devicePowerBtn').addEventListener('click', function() {
    document.getElementById('chartTitle').innerText = 'Device Power Consumption';
    fetchPowerData('device'); // Pass a parameter to indicate fetching device power data
});
        
    // Fetch power data for the chart
    function fetchPowerData() {
        const sheetId2 = '1sAMNYYz1C2wIRcYA9RqKjKGprR3Lu6DLK0xBm-Rg4EA';
        const powerDataUrl = `https://docs.google.com/spreadsheets/d/${sheetId2}/pub?output=csv`;
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
                    const time = new Date(parseInt(timeMs)); // Convert milliseconds to Date
                    
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
                updatePowerChart(labels, MainPower, device1, device2, device3, device4);
            })
            .catch(error => console.error('Error fetching power data:', error));}
    
    let chart;
    function updatePowerChart(labels, device0, device1, device2, device3, device4){
        const ctx = document.getElementById('powerChart').getContext('2d');
        
        if (chart) {chart.destroy(); // Destroy the previous chart before creating a new one
                   }

    chart = new Chart(ctx, {
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
                x: {
                    title: { display: true, text: 'Time (24 Hours)' },
                    ticks: {
                        callback: (value) => {
                            // Format x-axis labels as HH:MM
                            return value;
                        }}},
                y: {
                    min: 0,
                    max: 3000,
                    title: { display: true, text: 'Power (W)'}
                }}}});}

   document.getElementById('logoutBtn').addEventListener('click', function(){
        window.location.href = 'index.html';});
    
    document.getElementById('loginForm').addEventListener('submit', function(event){
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === 'admin' && password === 'admin'){
            window.location.href = 'dashboard.html'; // Ensure the file path is correct
        }else{
            alert('Invalid User Credentials');
        }});
