import os
import mysql.connector
from dotenv import load_dotenv
import logging

load_dotenv()


class DatabaseManager:
    def __init__(self):
        try:
            self.connection = mysql.connector.connect(
                host=os.getenv("DB_HOST"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASS"),
                database=os.getenv("DB_NAME"),
                charset="utf8mb4",
                collation="utf8mb4_general_ci",
                autocommit=True,
            )
            self.cursor = self.connection.cursor(buffered=True)
        except mysql.connector.Error as err:
            logging.error(f"Database connection failed: {str(err)}")
            raise

    def __del__(self):
        if hasattr(self, "cursor") and self.cursor:
            self.cursor.close()
        if hasattr(self, "connection") and self.connection:
            self.connection.close()

    def execute_query(self, query, params=None):
        try:
            self.cursor.execute(query, params)
            self.connection.commit()
            return self.cursor
        except Exception as e:
            self.connection.rollback()
            raise e

    def fetch_one(self, query, params=None):
        self.execute_query(query, params)
        return self.cursor.fetchone()

    def fetch_all(self, query, params=None):
        self.execute_query(query, params)
        return self.cursor.fetchall()
