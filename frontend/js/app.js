/*
 * Todo Application JavaScript
 * Handles communication with Flask REST API and dynamic UI updates
 */

// API Base URL
const API_BASE = '/api';

// DOM Elements
const todoForm = document.getElementById('todoForm');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const taskPriority = document.getElementById('taskPriority');
const taskDueDate = document.getElementById('taskDueDate');
const searchInput = document.getElementById('searchInput');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const totalStats = document.getElementById('totalCount');
const pendingStats = document.getElementById('pendingCount');
const completedStats = document.getElementById('completedCount');
const highPriorityStats = document.getElementById('highPriorityCount');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');

// State
let allTodos = [];
let currentFilter = 'all';
let currentPriorityFilter = 'all';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    setupEventListeners();
    updateStatistics();
});

// Load all todos from API
async function loadTodos() {
    try {
        const response = await fetch(`${API_BASE}/todos`);
        if (!response.ok) {
            throw new Error('Failed to load todos');
        }
        const result = await response.json();
        // Extract the data array from the response { success, data, count }
        allTodos = result.data;
        renderTodos();
    } catch (error) {
        console.error('Error loading todos:', error);
        showError('Failed to load tasks. Please try again.');
    }
}

// Render todos to the UI
function renderTodos() {
    // Apply filters
    let filteredTodos = [...allTodos];
    
    // Apply status filter
    if (currentFilter !== 'all') {
        filteredTodos = filteredTodos.filter(todo => todo.status === currentFilter);
    }
    
    // Apply priority filter
    if (currentPriorityFilter !== 'all') {
        filteredTodos = filteredTodos.filter(todo => todo.priority === currentPriorityFilter);
    }
    
    // Clear existing list
    todoList.innerHTML = '';
    
    // If no todos match filters
    if (filteredTodos.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Render each todo
    filteredTodos.forEach(todo => {
        const todoElement = createTodoElement(todo);
        todoList.appendChild(todoElement);
    });
    
    updateStatistics();
}

// Create a todo card element
function createTodoElement(todo) {
    const div = document.createElement('div');
    div.className = `todo-card${todo.status === 'completed' ? ' completed' : ''}`;
    div.setAttribute('data-id', todo.id);
    div.setAttribute('data-status', todo.status);
    
    const priorityClass = `priority-badge.${todo.priority}`;
    
    div.innerHTML = `
        <div class="todo-info">
            <h3 class="todo-title">${escapeHtml(todo.title)}</h3>
            <p class="todo-description">${todo.description ? escapeHtml(todo.description) : ''}</p>
            <div class="todo-meta">
                <span>Priority: <span class="priority-badge ${todo.priority}">${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}</span></span>
                <span>Due: ${todo.due_date ? formatDate(todo.due_date) : 'No due date'}</span>
            </div>
        </div>
        <div class="todo-actions">
            <button class="btn-complete" onclick="toggleTodo(${todo.id})">${todo.status === 'pending' ? 'Complete' : 'Undo'}</button>
            <button class="btn-edit" onclick="editTodo(${todo.id})">Edit</button>
            <button class="btn-delete" onclick="deleteTodo(${todo.id})">Delete</button>
        </div>
    `;
    
    return div;
}

// Escape HTML special characters
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format date from YYYY-MM-DD to DD MMM
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Toggle todo completion
async function toggleTodo(id) {
    const btn = document.querySelector(`.todo-card[data-id="${id}"] .btn-complete`);
    const originalText = btn ? btn.textContent : '';
    
    if (btn) {
        btn.textContent = 'Updating...';
        btn.disabled = true;
    }
    
    try {
        const response = await fetch(`${API_BASE}/todos/${id}/complete`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to update todo');
        }
        
        const data = await response.json();
        allTodos = allTodos.map(todo => todo.id === id ? data.data : todo);
        renderTodos();
        showSuccess('Task status updated!');
    } catch (error) {
        console.error('Error toggling todo:', error);
        showError('Failed to update task status.');
    } finally {
        if (btn) {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }
}

// Edit a todo
function editTodo(id) {
    const todo = allTodos.find(t => t.id === id);
    if (!todo) return;
    
    // Pre-fill form with current todo data
    taskTitle.value = todo.title;
    taskDescription.value = todo.description || '';
    taskPriority.value = todo.priority;
    taskDueDate.value = todo.due_date ? todo.due_date.split('T')[0] : '';
    
    // Store the current status for update
    todoForm.dataset.editingStatus = todo.status;
    
    // Set todo ID for update
    todoForm.dataset.editingId = id;
    
    // Switch UI to edit mode
    setEditMode(true);
    
    // Scroll to form
    taskTitle.scrollIntoView({ behavior: 'smooth' });
}

// Cancel edit mode
function cancelEdit() {
    todoForm.reset();
    delete todoForm.dataset.editingId;
    delete todoForm.dataset.editingStatus;
    setEditMode(false);
}

// Set form to edit mode or add mode
function setEditMode(isEditing) {
    if (isEditing) {
        formTitle.textContent = '✎ EDIT TASK';
        submitBtn.textContent = 'Update Task';
        cancelBtn.style.display = 'inline-block';
    } else {
        formTitle.textContent = '+ Add Task';
        submitBtn.textContent = '+ Add Task';
        cancelBtn.style.display = 'none';
    }
}

// Delete a todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    const btn = document.querySelector(`.todo-card[data-id="${id}"] .btn-delete`);
    const originalText = btn ? btn.textContent : '';
    
    if (btn) {
        btn.textContent = 'Deleting...';
        btn.disabled = true;
    }
    
    try {
        const response = await fetch(`${API_BASE}/todos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete todo');
        }
        
        allTodos = allTodos.filter(todo => todo.id !== id);
        renderTodos();
        showSuccess('Task deleted successfully!');
    } catch (error) {
        console.error('Error deleting todo:', error);
        showError('Failed to delete task.');
    } finally {
        if (btn) {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }
}

// Search todos
function searchTodos() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    let filteredTodos = [...allTodos];
    
    if (searchTerm) {
        filteredTodos = filteredTodos.filter(todo => 
            todo.title.toLowerCase().includes(searchTerm) || 
            (todo.description && todo.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply filters
    if (currentFilter !== 'all') {
        filteredTodos = filteredTodos.filter(todo => todo.status === currentFilter);
    }
    
    if (currentPriorityFilter !== 'all') {
        filteredTodos = filteredTodos.filter(todo => todo.priority === currentPriorityFilter);
    }
    
    todoList.innerHTML = '';
    
    if (filteredTodos.length === 0) {
        emptyState.style.display = 'block';
        emptyState.textContent = 'No tasks found matching your search.';
        return;
    }
    
    emptyState.style.display = 'none';
    
    filteredTodos.forEach(todo => {
        const todoElement = createTodoElement(todo);
        todoList.appendChild(todoElement);
    });
    
    updateStatistics();
}

// Filter todos by status
function filterTodos(status) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === status);
    });
    
    currentFilter = status;
    renderTodos();
    updateStatistics();
}

// Filter todos by priority
function filterPriorities(priority) {
    // Update active priority button
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.priority === priority);
    });
    
    currentPriorityFilter = priority;
    renderTodos();
    updateStatistics();
}

// Update statistics display
function updateStatistics() {
    const total = allTodos.length;
    const pending = allTodos.filter(todo => todo.status === 'pending').length;
    const completed = allTodos.filter(todo => todo.status === 'completed').length;
    const highPriority = allTodos.filter(todo => todo.priority === 'high').length;
    
    totalStats.textContent = total;
    pendingStats.textContent = pending;
    completedStats.textContent = completed;
    highPriorityStats.textContent = highPriority;
}

// Show error message
function showError(message) {
    // Create error toast or display
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-toast';
    errorDiv.textContent = message;
    errorDiv.style.position = 'fixed';
    errorDiv.style.bottom = '20px';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translateX(-50%)';
    errorDiv.style.background = '#e53e3e';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '10px 20px';
    errorDiv.style.borderRadius = '6px';
    errorDiv.style.zIndex = '1000';
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-toast';
    successDiv.textContent = message;
    successDiv.style.position = 'fixed';
    successDiv.style.bottom = '20px';
    successDiv.style.left = '50%';
    successDiv.style.transform = 'translateX(-50%)';
    successDiv.style.background = '#42b983';
    successDiv.style.color = 'white';
    successDiv.style.padding = '10px 20px';
    successDiv.style.borderRadius = '6px';
    successDiv.style.zIndex = '1000';
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Setup all event listeners
function setupEventListeners() {
    // Form submission
    todoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const editingId = todoForm.dataset.editingId;
        let success = false;
        
        if (editingId) {
            // Update existing todo
            success = await updateTodoFromForm(editingId);
        } else {
            // Create new todo
            success = await createTodoFromForm();
        }
        
        // Only reset form and UI on success
        if (success) {
            todoForm.reset();
            delete todoForm.dataset.editingId;
            delete todoForm.dataset.editingStatus;
            setEditMode(false);
        }
        // On failure, keep form in edit mode with user's changes
    });
    
    // Cancel button
    cancelBtn.addEventListener('click', cancelEdit);
    
    // Search input - debounced
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(searchTodos, 300);
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            filterTodos(btn.dataset.filter);
        });
    });
    
    document.querySelectorAll('.priority-btn[data-priority]').forEach(btn => {
        btn.addEventListener('click', () => {
            filterPriorities(btn.dataset.priority);
        });
    });
}

// Create todo from form
async function createTodoFromForm() {
    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const priority = taskPriority.value;
    const dueDate = taskDueDate.value;
    
    if (!title || title.length < 3) {
        showError('Task title must be at least 3 characters');
        return false;
    }
    
    // Set loading state
    setSubmitLoading(true);
    
    // Debug: log the data being sent
    console.log('Creating todo with data:', { title, description, priority, due_date: dueDate || null });
    
    try {
        const response = await fetch(`${API_BASE}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                description: description || '',  // Ensure description is never null
                priority,
                due_date: dueDate || null
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API error response:', errorData);
            throw new Error(errorData.message || 'Failed to create todo');
        }
        
        const data = await response.json();
        console.log('API response:', data);
        allTodos.push(data.data);
        renderTodos();
        showSuccess('Task created successfully!');
        return true;
    } catch (error) {
        console.error('Error creating todo:', error);
        showError(error.message || 'Failed to create task.');
        return false;
    } finally {
        setSubmitLoading(false);
    }
}

// Update todo from form
async function updateTodoFromForm(id) {
    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const priority = taskPriority.value;
    const dueDate = taskDueDate.value;
    const status = todoForm.dataset.editingStatus || 'pending';
    
    if (!title || title.length < 3) {
        showError('Task title must be at least 3 characters');
        return false;
    }
    
    // Set loading state
    setSubmitLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                description,
                priority,
                status,
                due_date: dueDate || null
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update todo');
        }
        
        const data = await response.json();
        allTodos = allTodos.map(todo => todo.id === id ? data.data : todo);
        renderTodos();
        showSuccess('Task updated successfully!');
        return true;
    } catch (error) {
        console.error('Error updating todo:', error);
        showError(error.message || 'Failed to update task.');
        return false;
    } finally {
        setSubmitLoading(false);
    }
}

// Set submit button loading state
function setSubmitLoading(isLoading) {
    if (isLoading) {
        submitBtn.textContent = 'Updating...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.style.cursor = 'not-allowed';
        if (cancelBtn) cancelBtn.disabled = true;
    } else {
        const editingId = todoForm.dataset.editingId;
        submitBtn.textContent = editingId ? 'Update Task' : '+ Add Task';
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
        if (cancelBtn) cancelBtn.disabled = false;
    }
}