from flask import Blueprint, jsonify
from backend.database import DatabaseManager

leaderboard_bp = Blueprint("leaderboard", __name__)
db_manager = DatabaseManager()


@leaderboard_bp.route("/", methods=["GET"])
def get_leaderboard():
    try:
        query = """
        SELECT username, total_time, flights_completed
        FROM User
        ORDER BY total_time DESC
        LIMIT 10
        """
        result = db_manager.fetch_all(query)
        leaderboard = [{"username": row[0], "score": row[1]} for row in result]
        return jsonify({"status": "success", "data": leaderboard}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
