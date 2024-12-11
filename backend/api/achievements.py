from flask import Blueprint, request, jsonify
from ..database.database_manager import DatabaseManager

achievements_bp = Blueprint("achievements", __name__)
db_manager = DatabaseManager()


@achievements_bp.route("/", methods=["POST"])
def add_achievement():
    data = request.json
    user_id = data.get("user_id")
    name = data.get("achievement_name")
    description = data.get("achievement_description")

    if not all([user_id, name, description]):
        return jsonify({"status": "error", "message": "All fields are required"}), 400

    try:
        db_manager.execute_query(
            "INSERT INTO Achievements (user_id, achievement_name, achievement_description) VALUES (%s, %s, %s)",
            (user_id, name, description),
        )
        return (
            jsonify(
                {"status": "success", "message": "Achievement added successfully."}
            ),
            201,
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
