document.addEventListener('DOMContentLoaded', () => {
    
    // get html elements
    const cityInput = document.getElementById('city-input');
    const getWeatherBtn = document.getElementById('get-weather-btn');
    const weatherDisplay = document.getElementById('weather-display');

    //we use port 5000
    const API_URL = 'http://127.0.0.1:5000/api/weather';

    // fetch weather data
    const fetchWeather = async () => {
        const city = cityInput.value.trim();
        if (!city) {
            weatherDisplay.innerHTML = '<p class="error-message">Please enter a city name.</p>';
            return;
        }

        // Show a loading message 
        weatherDisplay.innerHTML = '<p>Loading...</p>';

        try {
            const response = await fetch(`${API_URL}?city=${encodeURIComponent(city)}`);

            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }

            // parsing
            const weatherData = await response.json();
            // Call the function to display the weather
            displayWeather(weatherData);

        } catch (error) {
           
            weatherDisplay.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
            console.error('Fetch error:', error);
        }
    };

    // create html display
    const displayWeather = (data) => {
        // Clear previous content
        weatherDisplay.innerHTML = '';
        
        const weatherCard = document.createElement('div');
        weatherCard.className = 'weather-info';
        
        // create data
        weatherCard.innerHTML = `
            <h2>${data.city}</h2>
            <img src="http://openweathermap.org/img/wn/${data.icon}@2x.png" alt="${data.description}">
            <p>${Math.round(data.temperature)}°C</p>
            <p>${data.description}</p>
        `;
        
        weatherDisplay.appendChild(weatherCard);
    };

    // event listeners
    getWeatherBtn.addEventListener('click', fetchWeather);
    // trigger search
    cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            fetchWeather();
        }
    });
});