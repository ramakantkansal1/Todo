"""
Todo routes for the Flask REST API.
Handles all Todo-related API endpoints.
"""

from flask import Blueprint, request, jsonify
from models.todo import Todo
from database import DatabaseConnection

# Create blueprint for todo routes
todo_bp = Blueprint('todo', __name__)


@todo_bp.route('/todos', methods=['GET'])
def get_all_todos():
    """GET /api/todos - Return all todos."""
    try:
        todos = Todo.get_all()
        return jsonify({
            'success': True,
            'data': [todo.to_dict() for todo in todos],
            'count': len(todos)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@todo_bp.route('/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    """GET /api/todos/<id> - Return a specific todo."""
    try:
        todo = Todo.get_by_id(todo_id)
        if todo is None:
            return jsonify({
                'success': False,
                'message': 'Todo not found'
            }), 404
        return jsonify({
            'success': True,
            'data': todo.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@todo_bp.route('/todos', methods=['POST'])
def create_todo():
    """POST /api/todos - Create a new todo."""
    try:
        data = request.get_json()
        
        # Validate required fields
        title = data.get('title', '') if data else ''
        description = data.get('description', '') if data else ''
        priority = data.get('priority', 'medium') if data else 'medium'
        due_date = data.get('due_date', None) if data else None
        
        # Validate title
        if not title or title.strip() == '':
            return jsonify({
                'success': False,
                'message': 'Task title is required'
            }), 400
        
        if len(title) < 3:
            return jsonify({
                'success': False,
                'message': 'Task title must be at least 3 characters'
            }), 400
        
        # Validate priority
        valid_priorities = ['low', 'medium', 'high']
        if priority not in valid_priorities:
            priority = 'medium'
        
        # Set default status
        status = data.get('status', 'pending') if data else 'pending'
        
        todo = Todo.create(title, description, status, priority, due_date)
        return jsonify({
            'success': True,
            'data': todo.to_dict()
        }), 201
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to create todo: ' + str(e)
        }), 500


@todo_bp.route('/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """PUT /api/todos/<id> - Update a todo."""
    try:
        data = request.get_json()
        
        title = data.get('title', '') if data else ''
        description = data.get('description', '') if data else ''
        priority = data.get('priority', 'medium') if data else 'medium'
        status = data.get('status', 'pending') if data else 'pending'
        due_date = data.get('due_date', None) if data else None
        
        # Validate title
        if not title or title.strip() == '':
            return jsonify({
                'success': False,
                'message': 'Task title is required'
            }), 400
        
        if len(title) < 3:
            return jsonify({
                'success': False,
                'message': 'Task title must be at least 3 characters'
            }), 400
        
        # Validate priority
        valid_priorities = ['low', 'medium', 'high']
        if priority not in valid_priorities:
            priority = 'medium'
        
        success = Todo.update(todo_id, title, description, status, priority, due_date)
        if not success:
            return jsonify({
                'success': False,
                'message': 'Todo not found'
            }), 404
        
        todo = Todo.get_by_id(todo_id)
        return jsonify({
            'success': True,
            'data': todo.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to update todo: ' + str(e)
        }), 500


@todo_bp.route('/todos/<int:todo_id>/complete', methods=['PATCH'])
def toggle_complete(todo_id):
    """PATCH /api/todos/<id>/complete - Toggle todo completion status."""
    try:
        success = Todo.toggle_complete(todo_id)
        if not success:
            return jsonify({
                'success': False,
                'message': 'Todo not found'
            }), 404
        
        todo = Todo.get_by_id(todo_id)
        return jsonify({
            'success': True,
            'data': todo.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to toggle todo: ' + str(e)
        }), 500


@todo_bp.route('/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """DELETE /api/todos/<id> - Delete a todo."""
    try:
        success = Todo.delete(todo_id)
        if not success:
            return jsonify({
                'success': False,
                'message': 'Todo not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Todo deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to delete todo: ' + str(e)
        }), 500