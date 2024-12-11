from flask import Blueprint, request, jsonify
from ..database import DatabaseManager

flight_bp = Blueprint("flight", __name__)
db_manager = DatabaseManager()


@flight_bp.route("/", methods=["POST"])
def schedule_flight():
    data = request.json
    departure_airport_id = data.get("departure_airport_id")
    arrival_airport_id = data.get("arrival_airport_id")
    scheduled_departure_time = data.get("scheduled_departure_time")
    scheduled_arrival_time = data.get("scheduled_arrival_time")
    level = data.get("level", 1)

    if not all(
        [
            departure_airport_id,
            arrival_airport_id,
            scheduled_departure_time,
            scheduled_arrival_time,
        ]
    ):
        return jsonify({"status": "error", "message": "All fields are required"}), 400

    try:
        flight_id = db_manager.execute_query(
            """
            INSERT INTO Flight (departure_airport_id, arrival_airport_id, 
                                scheduled_departure_time, scheduled_arrival_time)
            VALUES (%s, %s, %s, %s)
            """,
            (
                departure_airport_id,
                arrival_airport_id,
                scheduled_departure_time,
                scheduled_arrival_time,
            ),
        ).lastrowid
        return (
            jsonify(
                {
                    "status": "success",
                    "data": {
                        "flight_id": flight_id,
                        "message": "Flight scheduled successfully.",
                    },
                }
            ),
            201,
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
