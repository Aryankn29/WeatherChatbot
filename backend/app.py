import os
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS

# Load environment variables
load_dotenv()
app = Flask(__name__)
CORS(app)

# API Keys and URLs
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
OPENWEATHER_URL = "http://api.openweathermap.org/data/2.5/weather"
WIT_SERVER_TOKEN = os.getenv('WIT_SERVER_TOKEN')
WIT_API_VERSION = "20240524"
WIT_URL = "https://api.wit.ai/message"


def get_location_from_wit(message):
    """
    This sends a message to Wit.ai and returns the detected location, if any.
    """
    headers = {'Authorization': f'Bearer {WIT_SERVER_TOKEN}'}
    params = {'v': WIT_API_VERSION, 'q': message}

    response = requests.get(WIT_URL, headers=headers, params=params)
    response.raise_for_status()
    data = response.json()

    try:
        location = data['entities']['wit$location:location'][0]['body']
        return location
    except (KeyError, IndexError):
        return None


@app.route('/api/weather', methods=['GET'])
def get_weather():
    user_message = request.args.get('message')
    if not user_message:
        return jsonify({"error": "Message parameter is required"}), 400

    try:
        city = get_location_from_wit(user_message)

        if not city:
            return jsonify({"error": "I'm sorry, I didn't understand the location. Could you be more specific?"}), 400

        weather_params = {
            'q': city,
            'appid': OPENWEATHER_API_KEY,
            'units': 'metric'
        }
        weather_response = requests.get(OPENWEATHER_URL, params=weather_params)
        weather_response.raise_for_status()
        weather_data = weather_response.json()

        weather_info = {
            "city": weather_data["name"],
            "temperature": weather_data["main"]["temp"],
            "description": weather_data["weather"][0]["description"],
            "icon": weather_data["weather"][0]["icon"]
        }
        return jsonify(weather_info)

    except requests.exceptions.HTTPError as http_err:
        if http_err.response.status_code == 404:
            return jsonify({"error": f"Sorry, I couldn't find weather data for '{city}'."}), 404
        return jsonify({"error": f"An API error occurred: {http_err}"}), 500
    except requests.exceptions.RequestException as req_err:
        return jsonify({"error": f"A network error occurred: {req_err}"}), 500


if __name__ == '__main__':
    app.run(debug=True)