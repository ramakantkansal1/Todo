# Todo Application - Complete Guide

## What This Project Does

A clean, responsive Todo application built with Python Flask backend, MySQL database, and a modern HTML/CSS/JavaScript frontend. Users can create, view, edit, complete, and delete tasks with priority filtering and search functionality.

## Technology Stack

### Frontend
- **HTML5**: Structure and semantics
- **CSS3**: Styling with modern design patterns, responsive layout, and professional color palette
- **JavaScript**: API communication, dynamic UI updates, and interactivity

### Backend
- **Python 3**: Server-side logic
- **Flask**: Web framework for REST API
- **MySQL**: Relational database management system

### Database
- **MySQL**: Stores all Todo data with proper schema and relationships

## Project Structure

```
Todo_App/
├── backend/
│   ├── app.py              # Flask application entry point
│   ├── config.py           # Configuration and environment variables
│   ├── database.py         # MySQL database connection management
│   ├── requirements.txt    # Python dependencies
│   ├── models/
│   │   └── todo.py         # Todo data model with database operations
│   └── routes/
│       └── todo_routes.py  # REST API endpoint definitions
├── frontend/
│   ├── index.html          # Main application shell
│   ├── css/
│   │   └── style.css       # Responsive styling
│   └── js/
│       └── app.js          # Frontend logic and API communication
├── database/
│   └── schema.sql          # Database initialization SQL
├── .env                    # Environment variables (DO NOT commit)
├── .gitignore              # Git ignore rules
├── run.sh                  # Shell script to run the application
└── README.md               # This file
```

## Prerequisites

Before running the application, ensure you have installed:

1. **Python 3.8+** - Download from python.org
2. **MySQL Community Server** - Install via Homebrew or official installer
3. **Code Editor** - VS Code or your preferred editor
4. **Terminal** - macOS Terminal or iTerm2

## Python Installation

```bash
# Check Python version
python3 --version

# Pip should be included with Python
pip3 --version
```

## MySQL Setup

1. **Install MySQL Community Server:**
   ```bash
   # Using Homebrew (recommended)
   brew install mysql
   
   # Or download from mysql.com
   ```

2. **Start MySQL Server:**
   ```bash
   # Start MySQL using the init script
   /usr/local/mysql-26.7.0-macos15-arm64/bin/mysqld --user=root &
   
   # Or using Homebrew services
   brew services start mysql
   ```

3. **Create Database and User:**
   ```bash
   mysql -u root -e "CREATE DATABASE IF NOT EXISTS todo_app;
   CREATE USER IF NOT EXISTS 'todo_user'@'localhost' IDENTIFIED BY 'todo_pass';
   GRANT ALL PRIVILEGES ON todo_app.* TO 'todo_user'@'localhost';
   FLUSH PRIVILEGES;"
   ```

4. **Initialize Database Schema:**
   ```bash
   mysql -u root todo_app < database/schema.sql
   ```

## Virtual Environment Setup

```bash
# Navigate to project directory
cd ~/Desktop/Development/Todo_App

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Verify activation
which python3
# Should show: ~/Desktop/Development/Todo_App/venv/bin/python3
```

## Installing Dependencies

```bash
# Activate virtual environment first
source venv/bin/activate

# Install Python packages
pip3 install -r backend/requirements.txt

# Verify installation
pip3 list | grep -E "Flask|mysql|python-dotenv"
```

Expected installed packages:
- Flask (web framework)
- flask-cors (CORS support)
- mysql-connector-python (MySQL database connector)
- python-dotenv (environment variable loading)

## Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
# Or create manually:
```

Edit the `.env` file with your MySQL credentials:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=todo_app
```

**Important**: Never commit the `.env` file to version control. It is listed in `.gitignore`.

## Running the Application

### Method 1: Using run.sh (Recommended)

```bash
# Make run.sh executable (if not already)
chmod +x run.sh

# Start the application
./run.sh
```

The terminal will show **all accessible URLs**:
```
=========================================
Starting Todo Application...
=========================================

🌐 Access URLs:
   Local:    http://localhost:5000
   Network:  http://192.168.1.XXX:5000

📱 For mobile/other devices on same WiFi, use the Network URL

Starting Flask server on http://0.0.0.0:5000
Press Ctrl+C to stop
=========================================
```

**Important**: The Network URL (e.g., `http://192.168.1.XXX:5000`) works from any device on the same WiFi network. When you switch WiFi networks, just re-run `./run.sh` and it will show the new Network URL for the current network.

### Method 2: Manual Start

```bash
# Navigate to backend directory
cd ~/Desktop/Development/Todo_App/backend

# Activate virtual environment
source venv/bin/activate

# Start Flask application
python3 app.py
```

### Method 3: Using Python Directly

```bash
cd ~/Desktop/Development/Todo_App
source venv/bin/activate
python3 backend/app.py
```

## API Endpoints

### GET /api/todos
- **Purpose**: Return all todos
- **Success Response**: `200` with JSON array of todos
- **Error Response**: `500` if server error

### GET /api/todos/<id>
- **Purpose**: Return a specific todo by ID
- **Success Response**: `200` with todo object
- **Error Response**: `404` if not found, `500` if server error

### POST /api/todos
- **Purpose**: Create a new todo
- **Request Body**: `{ "title": "Task title", "description": "Optional description", "priority": "medium", "due_date": "2026-10-10" }`
- **Success Response**: `201` with created todo object
- **Error Response**: `400` for invalid input, `500` if server error

### PUT /api/todos/<id>
- **Purpose**: Update an existing todo
- **Request Body**: Same as POST with updated values
- **Success Response**: `200` with updated todo object
- **Error Response**: `400` for invalid input, `404` if not found, `500` if server error

### PATCH /api/todos/<id>/complete
- **Purpose**: Toggle todo completion status
- **Success Response**: `200` with updated todo object
- **Error Response**: `404` if not found, `500` if server error

### DELETE /api/todos/<id>
- **Purpose**: Delete a todo
- **Success Response**: `200` with success message
- **Error Response**: `404` if not found, `500` if server error

## Testing the APIs

### Using curl

```bash
# Start the server first, then test:

# Get all todos
curl http://localhost:5000/api/todos

# Get a specific todo (replace 1 with your todo ID)
curl http://localhost:5000/api/todos/1

# Create a new todo
curl -X POST http://localhost:5000/api/todos \
     -H "Content-Type: application/json" \
     -d '{"title":"Learn Flask", "description":"Study Flask framework", "priority":"high", "due_date":"2026-10-15"}'

# Update a todo
curl -X PUT http://localhost:5000/api/todos/1 \
     -H "Content-Type: application/json" \
     -d '{"title":"Learn Flask Updated", "priority":"high"}'

# Toggle completion
curl -X PATCH http://localhost:5000/api/todos/1/complete

# Delete a todo
curl -X DELETE http://localhost:5000/api/todos/1
```

### Using Browser

Open your browser and navigate to:
- `http://localhost:5000/api/todos` - View all todos in JSON format
- `http://localhost:5000/api/todos/1` - View specific todo

## Common Errors and Solutions

### "MySQL server has gone away"
- **Cause**: Database connection timeout or query too large
- **Solution**: Increase `max_allowed_packet` in MySQL config, or split large queries

### "404 Not Found - Todo not found"
- **Cause**: Invalid todo ID or todo was already deleted
- **Solution**: Refresh the page to get current todos, or create a new todo

### "400 Bad Request - Task title is required"
- **Cause**: Empty or too short title (< 3 characters)
- **Solution**: Provide a title with at least 3 characters

### "500 Internal Server Error"
- **Cause**: Database connection failure or server issue
- **Solution**: Check MySQL is running, verify .env credentials, check terminal output for details

### "Cannot connect to localhost:3306"
- **Cause**: MySQL server not running
- **Solution**: Start MySQL server using `brew services start mysql` or the mysqld command

### "Error: .env file not found"
- **Cause**: Missing environment variable configuration
- **Solution**: Create a `.env` file in the project root with required variables

## How to Stop the Server

If the server is running in the foreground (Method 1 or 2):
- Press `Ctrl+C` in the terminal where the server is running

If using background mode:
```bash
# Find the process
ps aux | grep python3

# Kill the process
kill <PID>
```

## How to Restart the Project

```bash
# Full restart sequence
cd ~/Desktop/Development/Todo_App

# 1. Stop any running server (Ctrl+C)

# 2. Activate virtual environment
source venv/bin/activate

# 3. Restart MySQL if needed
brew services start mysql

# 4. Start the application
./run.sh
```

## Network Access (Multi-Device / WiFi Changes)

The app binds to **all network interfaces** (`0.0.0.0:5000`). When you run `./run.sh`, it detects and displays:

| URL Type | Example | Use Case |
|----------|---------|----------|
| **Local** | `http://localhost:5000` | Browser on the same Mac |
| **Network** | `http://192.168.1.42:5000` | Phone, tablet, other computers on same WiFi |

### When WiFi Changes
1. Stop the server (`Ctrl+C`)
2. Run `./run.sh` again
3. It will show the **new Network URL** for the current WiFi
4. Use that new URL on your mobile/other devices

### Troubleshooting Network Access
- **Can't connect from phone?** Ensure both devices are on the **same WiFi network** (not guest network)
- **Firewall blocking?** On macOS: System Settings → Network → Firewall → Allow Python/Flask
- **Wrong IP shown?** The script auto-detects; if wrong, run `ifconfig | grep "inet "` manually
- **Mobile Safari "can't connect"?** Use the **Network URL** (not localhost) from mobile devices

## API Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/todos | Get all todos |
| GET | /api/todos/{id} | Get single todo |
| POST | /api/todos | Create new todo |
| PUT | /api/todos/{id} | Update todo |
| PATCH | /api/todos/{id}/complete | Toggle completion |
| DELETE | /api/todos/{id} | Delete todo |

## Version 2 Ideas

Potential improvements for future versions:
- User registration and authentication (JWT)
- Multiple user support with data isolation
- Categories and tags for better organization
- Recurring tasks with frequency options
- Email notifications and reminders
- Dark mode support
- Calendar view for due dates
- Task attachments and file uploads
- Dashboard analytics and reporting
- Drag-and-drop task reordering
- Mobile application version