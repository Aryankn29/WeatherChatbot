import os
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS

# load env
load_dotenv()

# Initialize Flask application
app = Flask(__name__)

# allow frontend to call app by cors
CORS(app)

# get variables
API_KEY = os.getenv('OPENWEATHER_API_KEY')
BASE_URL = "http://api.openweathermap.org/data/2.5/weather"


@app.route('/api/weather', methods=['GET'])
def get_weather():
    """
    This is the main API endpoint.
    it uses a city
    """

    # get from request quiery
    city = request.args.get('city')

    if not city:
        return jsonify({"error": "City parameter is required"}), 400

    # store parameters
    params = {
        'q': city,
        'appid': API_KEY,
        'units': 'metric'  # Uses 'imperial' for Fahrenheit
    }

    try:
        # Make the API request
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()

        # For now only take what frontend needs
        weather_info = {
            "city": data["name"],
            "temperature": data["main"]["temp"],
            "description": data["weather"][0]["description"],
            "icon": data["weather"][0]["icon"]
        }

        return jsonify(weather_info)

    except requests.exceptions.HTTPError:
        return jsonify({"error": f"City not found: {city}"}), 404
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"API request failed: {e}"}), 500


# direct run
if __name__ == '__main__':
    app.run(debug=True)