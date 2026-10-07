# Todo Application - Final Output

## A. Final Project Structure

Todo_App/
│
├── backend/
│   ├── app.py              # Flask application entry point
│   ├── config.py           # Configuration and environment variables
│   ├── database.py         # Database connection management (SQLite/MySQL)
│   ├── requirements.txt    # Python dependencies
│   ├── models/
│   │   └── todo.py         # Todo data model with database operations
│   │
│   └── routes/
│       └── todo_routes.py  # REST API endpoint definitions
│
├── frontend/
│   ├── index.html          # Main application shell
│   ├── css/
│   │   └── style.css       # Responsive styling
│   └── js/
│       └── app.js          # Frontend logic and API communication
│
├── database/
│   ├── schema.sql          # Database initialization SQL
│   └── todo_app.db         # SQLite database file
│
├── .env                    # Environment variables (DO NOT commit)
├── .gitignore              # Git ignore rules
├── README.md               # Project documentation
└── run.sh                  # Shell script to run the application

## b. Technologies Used

### Frontend
- HTML5: Structure and semantics
- CSS3: Responsive styling, color palette, layout
- JavaScript (ES6+): API communication, dynamic UI updates
- Google Fonts: 'Inter' font family for typography
- Fetch API: REST API communication

### Backend
- Python 3.14: Server-side logic
- Flask 3.0.3: Web framework for REST API
- Flask-CORS 5.0.0: Cross-Origin Resource Sharing
- mysql-connector-python 8.2.0: MySQL database connector (configured)
- python-dotenv 1.0.1: Environment variable loading

### Database
- SQLite 3: Lightweight file-based database (Version 1)
- MySQL: Configured and ready (Version 2+)
- SQL schema with todos table

## c. Database Details

SQLite (Version 1 - current working setup):
- Database file: ~/Desktop/Development/Todo_App/database/todo_app.db
- Table: todos
- Fields:
  - id INTEGER PRIMARY KEY AUTOINCREMENT
  - title VARCHAR(200) NOT NULL
  - description TEXT
  - status VARCHAR(20) DEFAULT 'pending'
  - priority VARCHAR(10) DEFAULT 'medium'
  - due_date DATE
  - created_at TIMESTAMP
  - updated_at TIMESTAMP

MySQL (Version 2+ - configured but limited by Mac permissions):
- Database: todo_app
- User: todo_user@localhost
- Password: todo_pass (configured in .env)
- Host: localhost:3306
- Table: todos with same fields as SQLite
- ENUM types for status (pending, completed) and priority (low, medium, high)

Sample data inserted (4 initial records):
1. Learn Python - Study Flask and MySQL fundamentals - pending - high - 2026-10-15
2. Build Todo App - Create a complete Todo application - pending - medium - 2026-10-20
3. Study CSS - Learn responsive design and styling - completed - low - 2026-10-08
4. Practice SQL - Database queries and optimization - pending - high - 2026-10-25

## d. API Endpoint List

| Method | Endpoint | Purpose | Status Codes |
|--------|----------|---------|-------------|
| GET | /api/todos | Return all todos | 200 |
| GET | /api/todos/<id> | Return a specific todo | 200/404 |
| POST | /api/todos | Create a new todo | 201/400 |
| PUT | /api/todos/<id> | Update a todo | 200/400/404 |
| PATCH | /api/todos/<id>/complete | Toggle completion | 200/404 |
| DELETE | /api/todos/<id> | Delete a todo | 200/404 |

Error responses:
- 400: Bad request (missing title, title < 3 chars)
- 404: Todo not found
- 500: Server error

Response format (success):
```json
{
    "success": true,
    "data": { ... todo object ... }
}
```

Response format (error):
```json
{
    "success": false,
    "message": "Todo not found"
}
```

## e. Commands to Run the Project

### Using run.sh (recommended):
```bash
cd ~/Desktop/Development/Todo_App
chmod +x run.sh
./run.sh
```

### Manual setup:
```bash
cd ~/Desktop/Development/Todo_App
python3 -m venv venv
source venv/bin/activate
pip3 install -r backend/requirements.txt
python3 backend/app.py
```

### Using run.sh script:
```bash
./run.sh
```

## f. Test Results

| # | Test | Result |
|---|------|--------|
| 1 | Create Todo | PASS ✓ |
| 2 | Read all todos | PASS ✓ |
| 3 | Read single todo | PASS ✓ |
| 4 | Update todo | PASS ✓ |
| 5 | Complete todo | PASS ✓ |
| 6 | Uncomplete todo | PASS ✓ |
| 7 | Delete todo | PASS ✓ |
| 8 | Search | PASS ✓ |
| 9 | Error - invalid ID | PASS ✓ |
| 10 | Error - empty title | PASS ✓ |

## g. Errors Encountered and How They Were Fixed

1. **MySQL root access denied**
   - Cause: Mac MySQL installation has permission issues with data directory owned by root
   - Fix: Fell back to SQLite for Version 1. MySQL configuration is fully prepared (database/schema.sql, .env, database.py, models/todo.py all support MySQL)
   - User can migrate to MySQL by updating DB_USE_SQLITE env var to 'false'

2. **Flask before_first_request removed in Flask 3.0**
   - Cause: Flask 3.0 removed the before_first_request decorator
   - Fix: Changed to manual table creation within app.app_context()

3. **SQLite cursor factory dictionary issue**
   - Cause: SQLite default cursor returns tuples, not dictionaries
   - Fix: Added row_factory = sqlite3.Row and conversion logic in model layer

4. **Virtual environment path in run.sh**
   - Cause: Script was looking for venv in backend/ but it's in project root
   - Fix: Updated run.sh to source venv/bin/activate from project root

5. **Port 5000 already in use**
   - Cause: Existing processes on port 5000
   - Fix: Added process kill command before starting server

## h. Beginner Explanation of How the Application Works

### 1. Frontend (what the user sees)
- index.html: Page structure with header, form, list, stats
- style.css: Colors, layout, responsive design, hover states
- app.js: JavaScript that runs in the browser
  - Makes fetch() calls to /api endpoints
  - Updates UI dynamically without page reload
  - Handles form submission, search, filtering
  - Shows/hides todo cards based on status/priority

### 2. Backend (Python Flask)
- app.py: Creates Flask app, registers API routes
- config.py: Reads settings from .env file
- database.py: Manages database connection
- routes/todo_routes.py: defines 6 API endpoints
- models/todo.py: SQL queries and data operations

### 3. Flow: User types in form → JavaScript sends POST to /api/todos → Flask receives → database.py saves to SQLite → Flask returns JSON → JavaScript updates the todo list

### 4. How a Todo is Created
User fills form → JavaScript sends POST /api/todos with {title, description, priority, due_date} → Flask validates title ≥ 3 chars → database.py.create() inserts row → returns new todo ID → JavaScript adds card to UI, updates stats

### 5. How a Todo is Updated
User clicks Edit → form pre-fills with current data → user modifies → JavaScript sends PUT /api/todos/{id} → Flask updates row → returns updated todo → UI updates card

### 6. How a Todo is Deleted
User clicks Delete → confirmation dialog → JavaScript sends DELETE /api/todos/{id} → Flask deletes row → returns success → JavaScript removes card, updates stats

### 7. How Completion Toggles
User clicks "Complete" button → JavaScript sends PATCH /api/todos/{id}/complete → Flask toggles status field → returns updated todo → UI strikes through card, changes color

### 8. Frontend-Backend Communication
All communication uses fetch() with JSON
- Endpoints: /api/todos (CRUD) + /api/todos/{id}/complete
- Responses include "success" boolean and "data" or "message"
- Error handling shows user-friendly messages

## i. Suggestions for Version 2

- User registration and login with JWT authentication
- Multiple users with data isolation
- Categories and tags for better organization
- Recurring tasks with frequency options
- Email notifications and reminders
- Dark mode support
- Calendar view for due dates
- Task attachments and file uploads
- Dashboard analytics and reporting
- Drag-and-drop task reordering
- Mobile application version
- React or Vue.js frontend for richer interactivity
- Deployment to cloud (Heroku, Render, PythonAnywhere)
- Advanced filtering (date ranges, completed/pending counts)
- Export/Import data functionality
- Recurring task generation
- Pomodoro timer integration
- Time tracking per task