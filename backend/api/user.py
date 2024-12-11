from flask import Blueprint, request, jsonify, make_response
from backend.database import DatabaseManager
import mysql.connector
from flask_cors import cross_origin
import logging

user_bp = Blueprint("user", __name__)
db_manager = DatabaseManager()


@user_bp.route("/", methods=["POST", "OPTIONS"])
@cross_origin()
def create_user():
    logging.debug(f"Request method: {request.method}, Headers: {request.headers}")

    if request.method == "OPTIONS":
        # Handle the preflight request
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response, 200

    # Ensure that the request contains JSON data
    if not request.is_json:
        return (
            jsonify({"status": "error", "message": "Invalid input, JSON required"}),
            400,
        )

    data = request.json
    username = data.get("username")

    # Check if username is provided
    if not username:
        return jsonify({"status": "error", "message": "Username is required"}), 400

    # Ensure username is a string and not empty
    if not isinstance(username, str) or username.strip() == "":
        return jsonify({"status": "error", "message": "Invalid username"}), 400

    # Check if the username already exists
    existing_user = db_manager.fetch_one(
        "SELECT * FROM User WHERE username = %s", (username,)
    )
    if existing_user:
        return jsonify({"status": "error", "message": "Username already exists."}), 400

    try:
        user_id = db_manager.execute_query(
            "INSERT INTO User (username) VALUES (%s)", (username,)
        ).lastrowid
        return (
            jsonify(
                {
                    "status": "success",
                    "data": {
                        "user_id": user_id,
                        "message": f"User {username} created successfully.",
                    },
                }
            ),
            201,
        )
    except mysql.connector.IntegrityError as ie:
        logging.error(f"Integrity error: {str(ie)}")  # Log the error for debugging
        return jsonify({"status": "error", "message": "Username already exists."}), 400
    except mysql.connector.Error as e:
        logging.error(f"Database error: {str(e)}")  # Log the error for debugging
        return jsonify({"status": "error", "message": "Database error occurred."}), 500
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")  # Log the error for debugging
        return (
            jsonify({"status": "error", "message": "An unexpected error occurred."}),
            500,
        )
