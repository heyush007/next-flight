from flask import Blueprint, jsonify
from ..database import DatabaseManager

hurdles_bp = Blueprint("hurdles", __name__)
db_manager = DatabaseManager()


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


@hurdles_bp.route("/<int:level>", methods=["GET", "OPTIONS"])
def get_hurdles_for_level(level):
    """
    Retrieve hurdles for a given level from the database.

    Args:
        level (int): The level for which to retrieve hurdles.

    Returns:
        list: A list of hurdle dictionaries for the given level.

    Raises:
        ValueError: If the level has no hurdles defined.
    """
    try:
        hurdles = db_manager.fetch_all(
            """
            SELECT description, correct_option, result, complexity
            FROM Hurdles
            WHERE level = %s
            ORDER BY RAND()
            LIMIT 5
            """,
            (level,),
        )

        if not hurdles:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": f"No hurdles defined for level {level}. Please select a valid level.",
                    }
                ),
                404,
            )

        return [
            {
                "description": h[0],
                "correct_option": h[1],
                "result": h[2],
                "complexity": h[3],
            }
            for h in hurdles
        ]
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
