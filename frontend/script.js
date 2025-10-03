// Wait until page load
document.addEventListener('DOMContentLoaded', () => {

    // get our html elements
    const cityInput = document.getElementById('city-input');
    const getWeatherBtn = document.getElementById('get-weather-btn');
    const chatDisplay = document.getElementById('weather-display');

    // The URL of our backend API
    const API_URL = 'http://127.0.0.1:5000/api/weather';

    // main function
    const fetchWeather = async () => {
        const message = cityInput.value.trim();
        if (!message) return;

        // 1. Ddisplay the user's message in a message bubble'
        appendMessage(message, 'user-message');
        cityInput.value = '';

        try {
            // 2. call backend API
            const response = await fetch(`${API_URL}?message=${encodeURIComponent(message)}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error);
            }

            // 3. If successful, display the weather data in its own message bubble
            const weatherData = await response.json();
            appendWeatherMessage(weatherData);

        } catch (error) {
            // 4.  error handling
            appendMessage(error.message, 'bot-message');
            console.error('Fetch error:', error);
        }
    };

    // simple text functon
    function appendMessage(text, className) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${className}`;
        messageDiv.textContent = text;
        chatDisplay.appendChild(messageDiv);
        scrollToBottom();
    }

    // This function is ONLY for the complex weather card response from the bot
    function appendWeatherMessage(data) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message'; // It's a bot message

        // new other function
        messageDiv.innerHTML = `
            <div class="weather-info">
                <h2>${data.city}</h2>
                <img src="http://openweathermap.org/img/wn/${data.icon}@2x.png" alt="${data.description}">
                <p>${Math.round(data.temperature)}°C</p>
                <p>${data.description}</p>
            </div>
        `;
        chatDisplay.appendChild(messageDiv);
        scrollToBottom();
    }

    // Helper function to scroll the chat window down
    function scrollToBottom() {
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    // Event listeners
    getWeatherBtn.addEventListener('click', fetchWeather);
    cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            fetchWeather();
        }
    });
});