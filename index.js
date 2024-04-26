const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "760c66363b3107bb580135523ea00895";
const createWeatherCard = (cityName,weatherItem,index) => {
   
    if(index===0){
    const fdate= weatherItem.dt_txt.split(" ")[0];
   let day=toDayWeek(fdate);
   const dateTime = new Date(weatherItem.dt_txt);
    const localTime = dateTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return `<div class="details">
                    <h2>${cityName} (${day} ${localTime})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                   
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    } else{
        const fdate= weatherItem.dt_txt.split(" ")[0];
   let DAYT=toDayWeek(fdate);
  
        return ` <li class="card">
        <h3>${DAYT}</h3>
        <img src="http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
        <h6>Temp:${(weatherItem.main.temp-273.15).toFixed(2)}°C</h6>
        <h6>Wind:${weatherItem.wind.speed}M/S</h6>
        <h6>Humidity:${weatherItem.main.humidity}%</h6>
      </li>`;
    } 
    
    }
    let chartInstance = null;
    const getWeatherDetails = (cityName, latitude, longitude) => {
        const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
    
        fetch(WEATHER_API_URL)
            .then(response => response.json())
            .then(data => {
                const uniqueForecastDays = [];
                const fiveDaysForecast = data.list.filter(forecast => {
                    const forecastDate = new Date(forecast.dt_txt).getDate();
                    if (!uniqueForecastDays.includes(forecastDate)) {
                        uniqueForecastDays.push(forecastDate);
                        return true;
                    }
                    return false;
                });
                
               
                const daysOfWeek = fiveDaysForecast.map(forecast => {
                    const date = new Date(forecast.dt_txt);
                    return date.toLocaleString('fr-FR', { weekday: 'long' });
                });
    
                const temperatures = fiveDaysForecast.map(forecast => {
                    return forecast.main.temp - 273.15; 
                });
    
                // Créez un graphique avec Chart.js
                if (chartInstance) {
                    chartInstance.destroy();
                }
                const ctx = document.getElementById('weatherChart').getContext('2d');
                chartInstance = new Chart(ctx, {
                    type: 'line', 
                    data: {
                        labels: daysOfWeek,
                        datasets: [{
                            label: 'Température (°C)',
                            data: temperatures,
                            borderColor: 'blue',
                            borderWidth: 2,
                            fill: false,
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Température (°C)',
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Jour de la semaine',
                                }
                            }
                        }
                    }
                });
                const avgTemperature = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
changeBackgroundColorBasedOnTemperature(avgTemperature);

    
               
                cityInput.value = "";
                currentWeatherDiv.innerHTML = "";
                weatherCardsDiv.innerHTML = "";
    
                console.log(fiveDaysForecast);
                fiveDaysForecast.forEach((weatherItem, index) => {
                    if (index === 0) {
                        currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                    } else {
                        weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                    }
                });
            })
            .catch((exception) => {
                alert("An error occurred while fetching the weather forecast!  "+ exception);
            });
    };

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}





window.addEventListener("DOMContentLoaded", () => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords; 
                
                const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
                fetch(API_URL).then(response => response.json()).then(data => {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                }).catch(() => {
                    alert("An error occurred while fetching the city name!");
                });
            },
            error => { 
                if (error.code === error.PERMISSION_DENIED) {
                    alert("Geolocation request denied. Please reset location permission to grant access again.");
                } else {
                    alert("Geolocation request error. Please reset location permission.");
                }
            });
    } else {
        console.log("La géolocalisation n'est pas prise en charge par ce navigateur.");
    }
});


function toDayWeek(dChart){

    let fdate;
    fdate = new Date(dChart);
    let dayOfWeek=fdate.toLocaleDateString("en-US",{
    weekday:'long'
    
    });
    return dayOfWeek;
    
    
    }
    function changeBackgroundColorBasedOnTemperature(temperature) {
        if (temperature >30) {
            document.body.style.backgroundColor = '#FFBB70';
        } else {
            document.body.style.backgroundColor = '#ACE2E1'; 
        }
    }
    





searchButton.addEventListener("click",getCityCoordinates);

cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());





