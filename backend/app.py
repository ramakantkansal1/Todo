"""
Flask Todo Application.
REST API backend for the Todo application.
"""

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
import os

# Import blueprints
from routes.todo_routes import todo_bp

from config import SECRET_KEY, DEBUG
from database import DatabaseConnection


def create_app():
    """Application factory function."""
    app = Flask(__name__)
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['DEBUG'] = DEBUG
    
    # Enable CORS
    CORS(app, origins=os.getenv('CORS_ORIGINS', 'http://localhost'))
    
    # Register blueprints
    app.register_blueprint(todo_bp, url_prefix='/api')
    
    # Serve frontend static files
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        # Block access to backend/database/tests directories
        if path.startswith('backend') or path.startswith('database') or path.startswith('tests'):
            return jsonify({'success': False, 'message': 'Not found'}), 404
        
        # Strip query parameters for extension check
        path_without_query = path.split('?')[0]
        
        # Serve static files (css, js, images) from frontend directory
        if path_without_query and '.' in path_without_query:
            # Extract file extension
            ext = path_without_query.rsplit('.', 1)[1].lower()
            static_extensions = {'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'json'}
            if ext in static_extensions:
                return send_from_directory('../frontend', path_without_query)
        
        # Serve index.html for root or non-static paths
        return send_from_directory('../frontend', 'index.html')
    
    # Create database tables on first request - manually ensure tables exist
    with app.app_context():
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()
            # Check if table exists, create if not
            if DatabaseConnection._use_sqlite:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS todos (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title VARCHAR(200) NOT NULL,
                        description TEXT,
                        status VARCHAR(20) DEFAULT 'pending',
                        priority VARCHAR(10) DEFAULT 'medium',
                        due_date DATE,
                        created_at TIMESTAMP,
                        updated_at TIMESTAMP
                    )
                """)
            else:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS todos (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        title VARCHAR(200) NOT NULL,
                        description TEXT,
                        status ENUM('pending', 'completed') DEFAULT 'pending',
                        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
                        due_date DATE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                """)
            conn.commit()
            DatabaseConnection.close_connection()
            print("✓ Database tables ensured")
        except Exception as e:
            print(f"✗ Failed to create tables: {e}")
    
    return app


# Run the application
if __name__ == '__main__':
    app = create_app()
    
    # Print access URLs
    import socket
    def get_local_ip():
        try:
            # Connect to a public DNS to determine the local IP
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return None
    
    local_ip = get_local_ip()
    print("\n" + "="*50)
    print("🚀 Todo Application Running!")
    print("="*50)
    print(f"   Local:    http://localhost:5000")
    if local_ip:
        print(f"   Network:  http://{local_ip}:5000")
        print(f"   📱 Use Network URL for phone/tablet on same WiFi")
    print("="*50)
    print("Press Ctrl+C to stop\n")
    
    app.run(host='0.0.0.0', port=5000, debug=DEBUG)