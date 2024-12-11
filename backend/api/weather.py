import os
import requests
from flask import Blueprint, jsonify
from ..database import DatabaseManager

weather_bp = Blueprint("weather", __name__)
db_manager = DatabaseManager()
API_KEY = os.getenv("OPENWEATHER_API_KEY")
BASE_URL = "http://api.openweathermap.org/data/2.5/weather"


@weather_bp.route("/<string:city>", methods=["GET"])
def get_weather(city):
    try:
        response = requests.get(
            BASE_URL, params={"q": city, "appid": API_KEY, "units": "metric"}
        )
        response.raise_for_status()
        data = response.json()
        return jsonify({"status": "success", "data": data}), 200
    except requests.RequestException as e:
        return jsonify({"status": "error", "message": str(e)}), 503
