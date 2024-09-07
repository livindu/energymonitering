

const apiKey = 'AIzaSyCJUpx3d2aRxgOnbbB73WBpcZ1oI2YAauc'; 

const sheetId1 = '14g5GswUj6mj411o2dYOPghzJthp97hfz5DZvOU3O5Ww'; 
const sheetId2 = '1sAMNYYz1C2wIRcYA9RqKjKGprR3Lu6DLK0xBm-Rg4EA'; 


document.addEventListener('DOMContentLoaded', function() {
    

    // fetch data  sheet 1
function fetchVoltageCurrentData() {
    const sheetId1 = '14g5GswUj6mj411o2dYOPghzJthp97hfz5DZvOU3O5Ww';
    const voltageCurrentUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`;
    
    fetch(voltageCurrentUrl)
        .then(response => response.text())
        .then(data => {
            const [header, values] = data.split('\n');
            const [voltage, current] = values.split(',');

            // Display voltage and cuurent boxes
            document.getElementById('voltage').innerText = `${voltage} V`;
            document.getElementById('current').innerText = `${current} A`;
        })
        .catch(error => console.error('Error fetching voltage/current data:', error));
}


//  fetch data sheet2
function fetchPowerData() {
    const sheetId2 = '1sAMNYYz1C2wIRcYA9RqKjKGprR3Lu6DLK0xBm-Rg4EA'; 
    const powerDataUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`;

    fetch(powerDataUrl)
        .then(response => response.text())
        .then(data => {
            console.log('Fetched power data:', data); // Debugging log
            const rows = data.split('\n').slice(1); 
            const labels = [];
            const mainPower = [];
            const device1 = [];
            const device2 = [];
            const device3 = [];
            const device4 = [];

            rows.forEach(row => {
                const [time, main, dev1, dev2, dev3, dev4] = row.split(',');
                labels.push(time);
                mainPower.push(parseFloat(main));
                device1.push(parseFloat(dev1));
                device2.push(parseFloat(dev2));
                device3.push(parseFloat(dev3));
                device4.push(parseFloat(dev4));
            });

            console.log('Parsed labels:', labels); // Debugging log
            console.log('Parsed main power data:', mainPower); // Debugging log
            updatePowerChart(labels, mainPower, device1, device2, device3, device4);
        })
        .catch(error => console.error('Error fetching power data:', error));
}



function updatePowerChart(labels, mainPower, device1, device2, device3, device4) {
    const ctx = document.getElementById('powerChart').getContext('2d');
    if (ctx) {
        const powerChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels, 
                datasets: [
                    { label: 'Main Power', borderColor: 'rgba(0, 128, 128, 1)', data: mainPower },
                    { label: 'Device 1', borderColor: 'rgba(255, 99, 132, 1)', data: device1 },
                    { label: 'Device 2', borderColor: 'rgba(54, 162, 235, 1)', data: device2 },
                    { label: 'Device 3', borderColor: 'rgba(255, 206, 86, 1)', data: device3 },
                    { label: 'Device 4', borderColor: 'rgba(153, 102, 255, 1)', data: device4 }
                ]
            },
            options: {
                scales: {
                    x: {
                        title: { display: true, text: 'Time (24 Hours)' }
                    },
                    y: {
                        min: 0,
                        max: 230,
                        title: { display: true, text: 'Power (W)' }
                    }
                }
            }
        });
    } else {
        console.error('Canvas element for the chart not found');
    }
}



// Logout function
function logout() {
    window.location.href = 'index.html';
}

// login form 
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

