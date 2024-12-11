from flask import Flask
from flask_cors import CORS
from backend.config import Config
from backend.api import (
    user_bp,
    flight_bp,
    airport_bp,
    weather_bp,
    achievements_bp,
    leaderboard_bp,
    hurdles_bp,
)

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Register Blueprints
app.register_blueprint(user_bp, url_prefix="/api/user")
app.register_blueprint(flight_bp, url_prefix="/api/flight")
app.register_blueprint(airport_bp, url_prefix="/api/airport")
app.register_blueprint(weather_bp, url_prefix="/api/weather")
app.register_blueprint(achievements_bp, url_prefix="/api/achievements")
app.register_blueprint(leaderboard_bp, url_prefix="/api/leaderboard")
app.register_blueprint(hurdles_bp, url_prefix="/api/hurdles")


if __name__ == "__main__":
    app.run(host="localhost", port=5001, debug=True)
