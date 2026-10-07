"""
Database connection module for the Todo Application.
Handles SQLite/MySQL database connections and provides connection functionality.
"""

import os
import sqlite3
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import threading

# Load environment variables
load_dotenv()

# Thread-local storage for connections
_local = threading.local()


class DatabaseConnection:
    """Manages database connections (SQLite or MySQL)."""
    
    _use_sqlite = os.getenv('DB_USE_SQLITE', 'False').lower() == 'true'
    
    @classmethod
    def _get_connection(cls):
        """
        Get a thread-local database connection, creating one if needed.
        Returns the existing connection for the current thread if already open.
        """
        if not hasattr(_local, 'connection') or _local.connection is None:
            try:
                if cls._use_sqlite:
                    # Use SQLite (file-based, no server needed)
                    db_path = os.getenv('SQLITE_DB_PATH', 'database/todo_app.db')
                    _local.connection = sqlite3.connect(db_path)
                    # Use Row factory to get dictionary-like access
                    _local.connection.row_factory = sqlite3.Row
                    print("✓ SQLite connection established (thread-local)")
                else:
                    # Use MySQL
                    _local.connection = mysql.connector.connect(
                        host=os.getenv('DB_HOST', 'localhost'),
                        port=int(os.getenv('DB_PORT', 3306)),
                        user=os.getenv('DB_USER', 'root'),
                        password=os.getenv('DB_PASSWORD', ''),
                        database=os.getenv('DB_NAME', 'todo_app')
                    )
                    if not _local.connection.is_connected():
                        raise Error("Connection not established")
                    print("✓ MySQL connection established")
                    _local.connection.row_factory = None
            except Error as e:
                print(f"✗ Database connection failed: {e}")
                # Fallback to SQLite if MySQL fails
                cls._use_sqlite = True
                if hasattr(_local, 'connection'):
                    _local.connection.close()
                _local.connection = None
                return cls._get_connection()
        return _local.connection
    
    @classmethod
    def get_connection(cls):
        """
        Get a database connection for the current thread.
        Returns a new connection if one doesn't exist for this thread.
        """
        return cls._get_connection()
    
    @classmethod
    def close_connection(cls):
        """Close the database connection for the current thread."""
        if hasattr(_local, 'connection') and _local.connection:
            _local.connection.close()
            _local.connection = None
            print("✓ Database connection closed")
    
    @classmethod
    def ping(cls):
        """Ping the server to check if connection is alive."""
        if hasattr(_local, 'connection') and _local.connection:
            if cls._use_sqlite:
                return _local.connection is not None
            else:
                try:
                    _local.connection.ping(reconnect=True)
                    return True
                except:
                    return False
        return False
    
    @classmethod
    def get_cursor(cls):
        """Get a cursor for the current connection."""
        if hasattr(_local, 'connection') and _local.connection:
            if cls._use_sqlite:
                return _local.connection.cursor()
            else:
                return _local.connection.cursor()
        return None