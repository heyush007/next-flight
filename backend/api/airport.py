from flask import Blueprint, jsonify
from ..database import DatabaseManager
import logging

airport_bp = Blueprint("airport", __name__)
db_manager = DatabaseManager()


@airport_bp.route("/airports", methods=["GET", "OPTIONS"])
def get_airports():
    try:
        query = "SELECT id, name FROM Airport LIMIT 10"
        airports = db_manager.fetch_all(query)
        return jsonify({"status": "success", "data": airports}), 200
    except Exception as e:
        logging.error(f"Error fetching airports: {str(e)}")
        return jsonify({"status": "error", "message": "Failed to fetch airports."}), 500


@airport_bp.route("/airports", methods=["OPTIONS"])
def options_airports():
    return jsonify({"status": "success"}), 200


@airport_bp.route("/airports/<int:id>", methods=["GET", "OPTIONS"])
def get_airport_by_id(id):
    try:
        query = (
            "SELECT id, name, latitude_deg, longitude_deg FROM Airport WHERE id = %s"
        )
        airport = db_manager.fetch_one(query, (id,))
        if airport:
            return (
                jsonify(
                    {
                        "status": "success",
                        "data": {
                            "id": airport[0],
                            "name": airport[1],
                            "latitude_deg": airport[2],
                            "longitude_deg": airport[3],
                        },
                    }
                ),
                200,
            )
        else:
            return jsonify({"status": "error", "message": "Airport not found."}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
