const apiKey = 'f5090d3c467fb911889a4e2847046b35'; // Ganti dengan API Key yang valid
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const allergyIndex = document.getElementById('allergyIndex'); // Allergy index
const weatherIcon = document.getElementById('weatherIcon'); // Icon for weather
const ctx = document.getElementById('weatherChart').getContext('2d'); // Context for temperature chart
const themeSwitch = document.getElementById('themeSwitch');

let weatherChart;
let weatherIcons = [];

function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
        // Menyembunyikan gambar setelah pencarian
        const img = document.getElementById('loadingImage');
        if (img) {
            img.style.display = 'none';
        }
        // Menyembunyikan elemen searchCity setelah pencarian
        const searchCity = document.getElementById('searchCity');
        if (searchCity) {
            searchCity.style.display = 'none';
        }
    } else {
        alert('Please enter a city name!');
        
    }
}

searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

// Check saved theme in localStorage
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeSwitch.checked = true;
} else {
    document.body.classList.add('light-mode');
}

function updateChartLabelsColor(theme) {
    if (weatherChart) {
        const textColor = theme === 'dark' ? '#ffffff' : '#000000'; // Warna teks berdasarkan tema
        weatherChart.options.scales.x.ticks.color = textColor; // Warna label sumbu X
        weatherChart.options.scales.y.ticks.color = textColor; // Warna label sumbu Y
        weatherChart.options.plugins.legend.labels.color = textColor; // Warna legenda
        weatherChart.update();
    }
}

// Toggle theme on switch change
themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        updateChartLabelsColor('dark'); // Perbarui warna label chart
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
        updateChartLabelsColor('light'); // Perbarui warna label chart
    }
});

function getWeather(city) {
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    
    fetch(forecastURL)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('City not found!');
            }
        })
        .then(data => {
            if (data.cod === "200") {
                // Perbarui elemen informasi cuaca
                cityName.textContent = `City: ${data.city.name}`;
                temperature.textContent = `${data.list[0].main.temp}°C`;
                description.textContent = `${data.list[0].weather[0].description}`;
                humidity.textContent = `${data.list[0].main.humidity}%`;
                windSpeed.textContent = `${data.list[0].wind.speed} m/s`;
                pressure.textContent = `${data.list[0].main.pressure} hPa`;

                // Perbarui ikon cuaca
                const iconCode = data.list[0].weather[0].icon;
                weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
                weatherIcon.alt = data.list[0].weather[0].description;

                // Tampilkan elemen #weatherResult
                document.getElementById('weatherResult').style.display = 'block';

                // Grafik suhu
                const labels = [];
                const temps = [];
                weatherIcons = []; // Bersihkan ikon sebelumnya

                const now = new Date();
                labels.push("Sekarang");
                temps.push(Math.round(data.list[0].main.temp)); // Suhu saat ini
                weatherIcons.push(data.list[0].weather[0].icon); // Ikon cuaca saat ini

                // Tentukan kelipatan 2 jam terdekat
                let nextTime = new Date(now);
                if (nextTime.getMinutes() > 0) {
                    nextTime.setHours(nextTime.getHours() + 1);
                }
                nextTime.setMinutes(0);
                while (nextTime.getHours() % 2 !== 0) {
                    nextTime.setHours(nextTime.getHours() + 1);
                }

                // Tambahkan data suhu dan ikon ke grafik
                for (let i = 0; i < 11; i++) {
                    const timeLabel = nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    labels.push(timeLabel);

                    const dataIndex = Math.floor((i * 2) / 3);
                    if (data.list[dataIndex]) {
                        temps.push(Math.round(data.list[dataIndex].main.temp));
                        weatherIcons.push(data.list[dataIndex].weather[0].icon);
                    } else {
                        temps.push(null);
                        weatherIcons.push(null);
                    }

                    nextTime.setHours(nextTime.getHours() + 2);
                }

                updateChart(labels, temps);
            } else {
                alert('City not found!');
            }
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            alert('Something went wrong. Please try again later.');
        });
}


function updateChart(labels, data) {
    if (weatherChart) {
        weatherChart.destroy();
    }

    weatherChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: "Ramalan 24 Jam",
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: true,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)', // Warna titik
                pointBorderColor: 'rgba(75, 192, 192, 1)',
                pointRadius: 5, // Ukuran titik
                pointHoverRadius: 7,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    enabled: true, // Menampilkan tooltip saat hover
                },
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                    }
                },
                y: {
                    display: false, // Remove y-axis labels
                    beginAtZero: false,
                    suggestedMin: data.length > 0 ? Math.min(...data) - 2 : 0,
                    suggestedMax: data.length > 0 ? Math.max(...data) + 2 : 40,
                }
            }
        },
        plugins: [{
            id: 'customLabels',
            afterDatasetsDraw(chart, args, options) {
                const { ctx } = chart;
                const dataset = chart.data.datasets[0];
                const theme = localStorage.getItem('theme') || 'light'; // Ambil tema dari localStorage
                const textColor = theme === 'dark' ? '#d4d4d4' : '#000000'; // Warna teks berdasarkan tema
        
                chart.getDatasetMeta(0).data.forEach((point, index) => {
                    const value = dataset.data[index];
                    const iconCode = weatherIcons[index]; // Dapatkan ikon cuaca untuk setiap titik
        
                    ctx.save();
                    // Ganti warna teks sesuai tema
                    ctx.font = 'bold 14px "Poppins", Arial, sans-serif';
                    ctx.fillStyle = textColor;
                    ctx.textAlign = 'center';
                    ctx.fillText(`${value}°C`, point.x, point.y - 15); // Menempatkan label suhu di atas titik
        
                    // Gambar ikon cuaca tepat di atas waktu
                    const iconImage = new Image();
                    iconImage.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
                    iconImage.onload = () => {
                        const iconX = point.x - 15; // Posisi horizontal ikon
                        const iconY = point.y - 50; // Posisi vertikal ikon (di atas waktu)
                        ctx.drawImage(iconImage, iconX, iconY, 30, 30); // Gambar ikon cuaca
                    };
        
                    ctx.restore();
                });
            }
        }]        
    });
}
