const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "760c66363b3107bb580135523ea00895";
const createWeatherCard = (cityName,weatherItem,index) => {
   
    if(index===0){
    const fdate= weatherItem.dt_txt.split(" ")[0];
   let day=toDayWeek(fdate);
        return `<div class="details">
                    <h2>${cityName} (${day})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    } else{
        return ` <li class="card">
        <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
        <img src="http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
        <h6>Temp:${(weatherItem.main.temp-273.15).toFixed(2)}°C</h6>
        <h6>Wind:${weatherItem.wind.speed}M/S</h6>
        <h6>Humidity:${weatherItem.main.humidity}%</h6>
      </li>`;
    } 
    
    }

const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => { 
            const dttext=forecast.dt_txt;
            let colday=toDayWeek(dttext);
            console.log(colday)
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });
        cityInput.value="";
        currentWeatherDiv.innerHTML="";
        weatherCardsDiv.innerHTML="";


console.log(fiveDaysForecast);
fiveDaysForecast.forEach((weatherItem, index) =>{
if(index==0){
    currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName,weatherItem,index));

}else{
    weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName,weatherItem,index));
}
});
        
       
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}
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





searchButton.addEventListener("click",getCityCoordinates);

cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());

let metric = "units=metric";
function displayForCast(cityName){
const forcastUrl =`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${ApiKey}&${metric}`;
fetch(forcastUrl)
.then(response => response.json())
.then(data =>{
   console.log(data);
   const forecastByDate=[];
   const fiveForecastDay=data.list.filter(responseLigne=>{
       const date = new Date(responseLigne.dt_txt).getDate()
       if(!forecastByDate.includes(date)){
         return  forecastByDate.push(date)
       }
   })
   // filtrer les dates
   const forecastsDays = fiveForecastDay.map(el => {
       const date = new Date(el.dt_txt).toLocaleString('fr-FR',{weekday:'long'});
       return date;
   });
   // console.log(forecastsDays)
   forecastsDays.forEach(el => {
       console.log("Date:", el.date);
   })
   //filtrer par température
   const forecastsTemp = fiveForecastDay.map(el => {
       const temperature = el.main.temp;
       return temperature;
   })
   forecastsTemp.forEach(el => {
       console.log("Température:", el.temperature);
   })
   const ctx = document.getElementById('myChart');
   console.log(ctx);
   new Chart(ctx, {
       type: 'line',
       data: {
         labels: forecastsDays,
         datasets: [{
           label: 'Température',
           data: forecastsTemp,
           borderWidth: 1,
           borderColor:'black',
           backgroundColor:'blue dark'
         }]
       },
       options: {
         scales: {
           y: {
             beginAtZero: true
           }
         }
       }
     });
})
.catch(error => {
    console.error('Error fetching weather data:', error);
    alert('City not found. Please try again.');
});
}