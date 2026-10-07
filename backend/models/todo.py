"""
Todo model representing a single Todo item.
Defines the data structure and database operations for todos.
"""

from database import DatabaseConnection


class Todo:
    """Model class for Todo objects."""
    
    def __init__(self, id=None, title='', description='', status='pending', 
                 priority='medium', due_date=None, created_at=None, updated_at=None):
        self.id = id
        self.title = title
        self.description = description
        self.status = status
        self.priority = priority
        self.due_date = due_date
        self.created_at = created_at
        self.updated_at = updated_at
    
    def to_dict(self):
        """Convert Todo object to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'due_date': str(self.due_date) if self.due_date else None,
            'created_at': str(self.created_at) if self.created_at else None,
            'updated_at': str(self.updated_at) if self.updated_at else None
        }
    
    @staticmethod
    def _get_all():
        """Retrieve all todos from the database."""
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        
        # Execute query based on database type
        if DatabaseConnection._use_sqlite:
            cursor.execute("SELECT * FROM todos ORDER BY created_at DESC")
        else:
            cursor.execute("SELECT * FROM todos ORDER BY created_at DESC")
        
        rows = cursor.fetchall()
        todos = []
        
        # Convert rows to Todo objects
        for row in rows:
            # For SQLite, row might be a tuple or Row object
            if DatabaseConnection._use_sqlite and hasattr(row, 'keys'):
                # It's a sqlite3.Row object
                row_dict = dict(row)
            elif not DatabaseConnection._use_sqlite:
                # MySQL cursor returns tuples, need to map by position
                row_dict = {
                    'id': row[0],
                    'title': row[1],
                    'description': row[2] if len(row) > 2 else '',
                    'status': row[3] if len(row) > 3 else 'pending',
                    'priority': row[4] if len(row) > 4 else 'medium',
                    'due_date': row[5] if len(row) > 5 else None,
                    'created_at': row[6] if len(row) > 6 else None,
                    'updated_at': row[7] if len(row) > 7 else None
                }
            else:
                # Tuple from SQLite
                row_dict = {
                    'id': row[0],
                    'title': row[1],
                    'description': row[2] if len(row) > 1 else '',
                    'status': row[3] if len(row) > 3 else 'pending',
                    'priority': row[4] if len(row) > 4 else 'medium',
                    'due_date': row[5] if len(row) > 5 else None,
                    'created_at': row[6] if len(row) > 6 else None,
                    'updated_at': row[7] if len(row) > 7 else None
                }
            
            todo = Todo(
                id=row_dict.get('id'),
                title=row_dict.get('title', ''),
                description=row_dict.get('description', ''),
                status=row_dict.get('status', 'pending'),
                priority=row_dict.get('priority', 'medium'),
                due_date=row_dict.get('due_date'),
                created_at=row_dict.get('created_at'),
                updated_at=row_dict.get('updated_at')
            )
            todos.append(todo)
        
        DatabaseConnection.close_connection()
        return todos
    
    @staticmethod
    def get_all():
        """Retrieve all todos from the database."""
        return Todo._get_all()
    
    @staticmethod
    def get_by_id(todo_id):
        """Retrieve a single todo by ID."""
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        
        # Execute query based on database type
        if DatabaseConnection._use_sqlite:
            cursor.execute("SELECT * FROM todos WHERE id = ?", (todo_id,))
        else:
            cursor.execute("SELECT * FROM todos WHERE id = %s", (todo_id,))
        
        row = cursor.fetchone()
        DatabaseConnection.close_connection()
        
        if row:
            # For SQLite, row might be a tuple or Row object
            if DatabaseConnection._use_sqlite and hasattr(row, 'keys'):
                row_dict = dict(row)
            elif DatabaseConnection._use_sqlite:
                row_dict = {
                    'id': row[0],
                    'title': row[1],
                    'description': row[2] if len(row) > 1 else '',
                    'status': row[3] if len(row) > 3 else 'pending',
                    'priority': row[4] if len(row) > 4 else 'medium',
                    'due_date': row[5] if len(row) > 5 else None,
                    'created_at': row[6] if len(row) > 6 else None,
                    'updated_at': row[7] if len(row) > 7 else None
                }
            else:
                # MySQL tuple
                row_dict = {
                    'id': row[0],
                    'title': row[1],
                    'description': row[2] if len(row) > 1 else '',
                    'status': row[3] if len(row) > 3 else 'pending',
                    'priority': row[4] if len(row) > 4 else 'medium',
                    'due_date': row[5] if len(row) > 5 else None,
                    'created_at': row[6] if len(row) > 6 else None,
                    'updated_at': row[7] if len(row) > 7 else None
                }
            
            return Todo(
                id=row_dict.get('id'),
                title=row_dict.get('title', ''),
                description=row_dict.get('description', ''),
                status=row_dict.get('status', 'pending'),
                priority=row_dict.get('priority', 'medium'),
                due_date=row_dict.get('due_date'),
                created_at=row_dict.get('created_at'),
                updated_at=row_dict.get('updated_at')
            )
        return None
    
    @staticmethod
    def create(title, description='', status='pending', priority='medium', due_date=None):
        """Create a new todo in the database."""
        if not title or title.strip() == '':
            raise ValueError("Task title is required")
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        
        if DatabaseConnection._use_sqlite:
            cursor.execute(
                "INSERT INTO todos (title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?)",
                (title, description, status, priority, due_date)
            )
        else:
            cursor.execute(
                "INSERT INTO todos (title, description, status, priority, due_date) VALUES (%s, %s, %s, %s, %s)",
                (title, description, status, priority, due_date)
            )
        
        conn.commit()
        todo_id = cursor.lastrowid
        DatabaseConnection.close_connection()
        return Todo(id=todo_id, title=title, description=description, 
                    status=status, priority=priority, due_date=due_date)
    
    @staticmethod
    def update(todo_id, title, description, status, priority, due_date):
        """Update an existing todo."""
        if not title or title.strip() == '':
            raise ValueError("Task title is required")
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        
        if DatabaseConnection._use_sqlite:
            cursor.execute(
                "UPDATE todos SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (title, description, status, priority, due_date, todo_id)
            )
        else:
            cursor.execute(
                "UPDATE todos SET title = %s, description = %s, status = %s, priority = %s, due_date = %s, updated_at = NOW() WHERE id = %s",
                (title, description, status, priority, due_date, todo_id)
            )
        
        conn.commit()
        DatabaseConnection.close_connection()
        return cursor.rowcount > 0
    
    @staticmethod
    def toggle_complete(todo_id):
        """Toggle the completion status of a todo."""
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        
        # Get current status first
        if DatabaseConnection._use_sqlite:
            cursor.execute("SELECT status FROM todos WHERE id = ?", (todo_id,))
        else:
            cursor.execute("SELECT status FROM todos WHERE id = %s", (todo_id,))
        
        row = cursor.fetchone()
        if row:
            new_status = 'completed' if row[0] == 'pending' else 'pending'
            if DatabaseConnection._use_sqlite:
                cursor.execute(
                    "UPDATE todos SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (new_status, todo_id)
                )
            else:
                cursor.execute(
                    "UPDATE todos SET status = %s, updated_at = NOW() WHERE id = %s",
                    (new_status, todo_id)
                )
            conn.commit()
            DatabaseConnection.close_connection()
            return True
        else:
            DatabaseConnection.close_connection()
            return False
    
    @staticmethod
    def delete(todo_id):
        """Delete a todo from the database."""
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        
        if DatabaseConnection._use_sqlite:
            cursor.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
        else:
            cursor.execute("DELETE FROM todos WHERE id = %s", (todo_id,))
        
        conn.commit()
        DatabaseConnection.close_connection()
        return cursor.rowcount > 0