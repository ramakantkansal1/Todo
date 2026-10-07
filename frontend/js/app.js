/**
 * Todo Application — Premium UI/UX
 * Handles communication with Flask REST API and dynamic UI updates
 */

// API Base URL
const API_BASE = '/api';

// ==========================================================================
// STATE MANAGEMENT
// ==========================================================================
const state = {
    allTodos: [],
    currentFilter: 'all',
    currentPriorityFilter: 'all',
    searchTerm: '',
    editingId: null,
    deleteTargetId: null,
    isLoading: false
};

// ==========================================================================
// DOM ELEMENTS (cached)
// ==========================================================================
const elements = {};

// Initialize DOM references
function cacheElements() {
    elements.todoForm = document.getElementById('todoForm');
    elements.taskTitle = document.getElementById('taskTitle');
    elements.taskDescription = document.getElementById('taskDescription');
    elements.taskPriority = document.getElementById('taskPriority');
    elements.taskDueDate = document.getElementById('taskDueDate');
    elements.searchInput = document.getElementById('searchInput');
    elements.searchClear = document.getElementById('searchClear');
    elements.clearSearchBtn = document.getElementById('clearSearchBtn');
    elements.todoList = document.getElementById('todoList');
    elements.emptyState = document.getElementById('emptyState');
    elements.searchEmptyState = document.getElementById('searchEmptyState');
    elements.totalCount = document.getElementById('totalCount');
    elements.pendingCount = document.getElementById('pendingCount');
    elements.completedCount = document.getElementById('completedCount');
    elements.highPriorityCount = document.getElementById('highPriorityCount');
    elements.formTitle = document.getElementById('formTitle');
    elements.submitBtn = document.getElementById('submitBtn');
    elements.submitBtnText = document.getElementById('submitBtnText');
    elements.cancelBtn = document.getElementById('cancelBtn');
    elements.formBadge = document.getElementById('formBadge');
    elements.listMeta = document.getElementById('listMeta');
    elements.filterAllCount = document.getElementById('filterAllCount');
    elements.filterPendingCount = document.getElementById('filterPendingCount');
    elements.filterCompletedCount = document.getElementById('filterCompletedCount');
    elements.deleteModal = document.getElementById('deleteModal');
    elements.modalClose = document.getElementById('modalClose');
    elements.modalCancel = document.getElementById('modalCancel');
    elements.modalConfirm = document.getElementById('modalConfirm');
    elements.toastContainer = document.getElementById('toastContainer');
    elements.themeToggle = document.getElementById('themeToggle');
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    setupEventListeners();
    loadTodos();
    initTheme();
});

// ==========================================================================
// THEME HANDLING (optional enhancement)
// ==========================================================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    document.documentElement.classList.toggle('dark', isDark);
    elements.themeToggle.setAttribute('aria-pressed', isDark);

    elements.themeToggle.addEventListener('click', () => {
        const newDark = !document.documentElement.classList.contains('dark');
        document.documentElement.classList.toggle('dark', newDark);
        localStorage.setItem('theme', newDark ? 'dark' : 'light');
        elements.themeToggle.setAttribute('aria-pressed', newDark);
    });
}

// ==========================================================================
// API COMMUNICATION
// ==========================================================================
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };

    const response = await fetch(`${API_BASE}${url}`, mergedOptions);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
}

// ==========================================================================
// DATA FETCHING
// ==========================================================================
async function loadTodos() {
    if (state.isLoading) return;

    setLoading(true);

    try {
        const result = await apiRequest('/todos');
        state.allTodos = result.data || [];
        renderAll();
    } catch (error) {
        console.error('Error loading todos:', error);
        showToast('error', 'Unable to load tasks', 'Please refresh and try again.');
    } finally {
        setLoading(false);
    }
}

// ==========================================================================
// RENDERING
// ==========================================================================
function renderAll() {
    renderTasks();
    renderStatistics();
    renderFilterCounts();
    renderListMeta();
}

function getFilteredTodos() {
    let filtered = [...state.allTodos];

    // Apply search
    if (state.searchTerm) {
        const term = state.searchTerm.toLowerCase();
        filtered = filtered.filter(todo =>
            todo.title.toLowerCase().includes(term) ||
            (todo.description && todo.description.toLowerCase().includes(term))
        );
    }

    // Apply status filter
    if (state.currentFilter !== 'all') {
        filtered = filtered.filter(todo => todo.status === state.currentFilter);
    }

    // Apply priority filter
    if (state.currentPriorityFilter !== 'all') {
        filtered = filtered.filter(todo => todo.priority === state.currentPriorityFilter);
    }

    return filtered;
}

function renderTasks() {
    const filteredTodos = getFilteredTodos();
    const hasSearch = state.searchTerm.length > 0;

    // Clear list
    elements.todoList.innerHTML = '';

    // Show/hide empty states
    if (filteredTodos.length === 0) {
        elements.emptyState.hidden = hasSearch;
        elements.searchEmptyState.hidden = !hasSearch;
        return;
    }

    elements.emptyState.hidden = true;
    elements.searchEmptyState.hidden = true;

    // Render tasks
    const fragment = document.createDocumentFragment();
    filteredTodos.forEach(todo => {
        fragment.appendChild(createTaskElement(todo));
    });
    elements.todoList.appendChild(fragment);
}

function createTaskElement(todo) {
    const div = document.createElement('div');
    div.className = 'task-card';
    div.dataset.id = todo.id;
    div.dataset.status = todo.status;
    div.dataset.priority = todo.priority;

    if (isOverdue(todo)) {
        div.dataset.overdue = 'true';
    }

    const priorityClass = `priority-badge--${todo.priority}`;
    const dueDateText = todo.due_date ? formatDate(todo.due_date) : 'No due date';
    const dueDateFormatted = todo.due_date ? formatDateFull(todo.due_date) : '';

    div.innerHTML = `
        <div class="task-content">
            <h4 class="task-title">${escapeHtml(todo.title)}</h4>
            ${todo.description ? `<p class="task-description">${escapeHtml(todo.description)}</p>` : ''}
            <div class="task-meta">
                <span class="priority-badge ${priorityClass}">${todo.priority}</span>
                <span class="task-due-date">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>${dueDateText}</span>
                </span>
            </div>
        </div>
        <div class="task-actions">
            <button
                type="button"
                class="task-action-btn task-action-btn--complete"
                data-action="toggle"
                aria-label="${todo.status === 'pending' ? 'Mark as complete' : 'Mark as pending'}"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                    ${todo.status === 'pending'
                        ? '<polyline points="20 6 9 17 4 12"></polyline>'
                        : '<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path>'
                    }
                </svg>
            </button>
            <button
                type="button"
                class="task-action-btn"
                data-action="edit"
                aria-label="Edit task"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            <button
                type="button"
                class="task-action-btn task-action-btn--delete"
                data-action="delete"
                aria-label="Delete task"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `;

    // Add event listeners to action buttons
    div.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleTaskAction(btn.dataset.action, todo.id);
        });
    });

    return div;
}

function renderStatistics() {
    const total = state.allTodos.length;
    const pending = state.allTodos.filter(t => t.status === 'pending').length;
    const completed = state.allTodos.filter(t => t.status === 'completed').length;
    const highPriority = state.allTodos.filter(t => t.priority === 'high').length;

    animateCount(elements.totalCount, total);
    animateCount(elements.pendingCount, pending);
    animateCount(elements.completedCount, completed);
    animateCount(elements.highPriorityCount, highPriority);
}

function renderFilterCounts() {
    const all = state.allTodos.length;
    const pending = state.allTodos.filter(t => t.status === 'pending').length;
    const completed = state.allTodos.filter(t => t.status === 'completed').length;

    elements.filterAllCount.textContent = all;
    elements.filterPendingCount.textContent = pending;
    elements.filterCompletedCount.textContent = completed;
}

function renderListMeta() {
    const filtered = getFilteredTodos();
    const total = state.allTodos.length;

    if (state.searchTerm || state.currentFilter !== 'all' || state.currentPriorityFilter !== 'all') {
        elements.listMeta.textContent = `${filtered.length} of ${total} tasks`;
    } else {
        elements.listMeta.textContent = `${total} task${total !== 1 ? 's' : ''}`;
    }
}

// ==========================================================================
// TASK ACTIONS
// ==========================================================================
function handleTaskAction(action, id) {
    switch (action) {
        case 'toggle':
            toggleTodo(id);
            break;
        case 'edit':
            editTodo(id);
            break;
        case 'delete':
            confirmDelete(id);
            break;
    }
}

async function toggleTodo(id) {
    const todo = state.allTodos.find(t => t.id === id);
    if (!todo) return;

    const btn = document.querySelector(`.task-card[data-id="${id}"] [data-action="toggle"]`);
    const originalHtml = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '<span class="btn-loader"></span>';

    try {
        const result = await apiRequest(`/todos/${id}/complete`, { method: 'PATCH' });
        state.allTodos = state.allTodos.map(t => t.id === id ? result.data : t);
        renderAll();
        showToast('success', 'Task updated', todo.status === 'pending' ? 'Task marked as complete' : 'Task marked as pending');
    } catch (error) {
        console.error('Error toggling todo:', error);
        showToast('error', 'Unable to update task', 'Please try again.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }
}

function editTodo(id) {
    const todo = state.allTodos.find(t => t.id === id);
    if (!todo) return;

    // Populate form
    elements.taskTitle.value = todo.title;
    elements.taskDescription.value = todo.description || '';
    elements.taskPriority.value = todo.priority;
    elements.taskDueDate.value = todo.due_date ? todo.due_date.split('T')[0] : '';

    // Set editing state
    state.editingId = id;
    elements.todoForm.dataset.editing = 'true';
    elements.todoForm.dataset.editingStatus = todo.status;

    // Update UI
    elements.formTitle.textContent = 'Edit Task';
    elements.submitBtnText.textContent = 'Update Task';
    elements.formBadge.textContent = 'Editing';
    elements.formBadge.style.display = 'inline-flex';
    elements.cancelBtn.style.display = 'inline-flex';

    // Clear any previous errors
    clearValidationErrors();

    // Scroll to form smoothly
    elements.taskTitle.scrollIntoView({ behavior: 'smooth', block: 'center' });
    elements.taskTitle.focus({ preventScroll: true });
}

function cancelEdit() {
    state.editingId = null;
    elements.todoForm.dataset.editing = 'false';
    delete elements.todoForm.dataset.editingStatus;
    elements.formTitle.textContent = 'Add Task';
    elements.submitBtnText.textContent = 'Add Task';
    elements.formBadge.style.display = 'none';
    elements.cancelBtn.style.display = 'none';
    elements.todoForm.reset();
    clearValidationErrors();
}

function confirmDelete(id) {
    state.deleteTargetId = id;
    elements.deleteModal.hidden = false;
    elements.modalConfirm.focus();
    // Trap focus
    trapFocus(elements.deleteModal);
}

async function deleteTodo(id) {
    const btn = document.querySelector(`.task-card[data-id="${id}"] [data-action="delete"]`);
    const originalHtml = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '<span class="btn-loader"></span>';

    try {
        await apiRequest(`/todos/${id}`, { method: 'DELETE' });
        state.allTodos = state.allTodos.filter(t => t.id !== id);
        renderAll();
        showToast('success', 'Task deleted', 'The task has been removed permanently.');
    } catch (error) {
        console.error('Error deleting todo:', error);
        showToast('error', 'Unable to delete task', 'Please try again.');
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }
}

async function createTodoFromForm() {
    const title = elements.taskTitle.value.trim();
    const description = elements.taskDescription.value.trim();
    const priority = elements.taskPriority.value;
    const dueDate = elements.taskDueDate.value || null;

    // Validate
    if (!validateForm(title)) return false;

    setSubmitLoading(true);

    try {
        const result = await apiRequest('/todos', {
            method: 'POST',
            body: JSON.stringify({ title, description, priority, due_date: dueDate })
        });
        state.allTodos.unshift(result.data);
        renderAll();
        showToast('success', 'Task created', 'Your new task has been added.');
        return true;
    } catch (error) {
        console.error('Error creating todo:', error);
        showToast('error', 'Unable to create task', error.message || 'Please try again.');
        return false;
    } finally {
        setSubmitLoading(false);
    }
}

async function updateTodoFromForm(id) {
    const title = elements.taskTitle.value.trim();
    const description = elements.taskDescription.value.trim();
    const priority = elements.taskPriority.value;
    const dueDate = elements.taskDueDate.value || null;
    const status = elements.todoForm.dataset.editingStatus || 'pending';

    // Validate
    if (!validateForm(title)) return false;

    setSubmitLoading(true);

    try {
        const result = await apiRequest(`/todos/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ title, description, priority, status, due_date: dueDate })
        });
        state.allTodos = state.allTodos.map(t => t.id === id ? result.data : t);
        renderAll();
        showToast('success', 'Task updated', 'Your changes have been saved.');
        return true;
    } catch (error) {
        console.error('Error updating todo:', error);
        showToast('error', 'Unable to update task', error.message || 'Please try again.');
        return false;
    } finally {
        setSubmitLoading(false);
    }
}

// ==========================================================================
// FORM VALIDATION
// ==========================================================================
function validateForm(title) {
    clearValidationErrors();

    if (!title || title.length < 3) {
        showFieldError('taskTitle', 'Task title must be at least 3 characters');
        elements.taskTitle.focus();
        return false;
    }

    if (title.length > 200) {
        showFieldError('taskTitle', 'Task title cannot exceed 200 characters');
        elements.taskTitle.focus();
        return false;
    }

    return true;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}Error`);
    field.setAttribute('aria-invalid', 'true');
    field.classList.add('error');
    if (errorEl) errorEl.textContent = message;
}

function clearValidationErrors() {
    elements.todoForm.querySelectorAll('[aria-invalid="true"]').forEach(el => {
        el.removeAttribute('aria-invalid');
        el.classList.remove('error');
    });
    elements.todoForm.querySelectorAll('.form-error').forEach(el => {
        el.textContent = '';
    });
}

// ==========================================================================
// SEARCH & FILTER
// ==========================================================================
let searchTimeout = null;

function handleSearch(e) {
    const term = e.target.value.trim();
    state.searchTerm = term;
    elements.searchClear.hidden = !term;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        renderTasks();
        renderListMeta();
    }, 300);
}

function clearSearch() {
    elements.searchInput.value = '';
    state.searchTerm = '';
    elements.searchClear.hidden = true;
    renderTasks();
    renderListMeta();
    elements.searchInput.focus();
}

function setStatusFilter(filter) {
    state.currentFilter = filter;
    updateFilterButtons('filter-btn--status', filter);
    renderTasks();
    renderListMeta();
}

function setPriorityFilter(filter) {
    state.currentPriorityFilter = filter;
    updateFilterButtons('filter-btn--priority', filter);
    renderTasks();
    renderListMeta();
}

function updateFilterButtons(className, activeValue) {
    document.querySelectorAll(`.${className}`).forEach(btn => {
        const isActive = btn.dataset[className === 'filter-btn--status' ? 'filter' : 'priority'] === activeValue;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
    });
}

// ==========================================================================
// EVENT LISTENERS
// ==========================================================================
function setupEventListeners() {
    // Search
    elements.searchInput.addEventListener('input', handleSearch);
    elements.searchClear.addEventListener('click', clearSearch);
    elements.clearSearchBtn.addEventListener('click', clearSearch);

    // Filters
    document.querySelectorAll('.filter-btn--status').forEach(btn => {
        btn.addEventListener('click', () => setStatusFilter(btn.dataset.filter));
    });

    document.querySelectorAll('.filter-btn--priority').forEach(btn => {
        btn.addEventListener('click', () => setPriorityFilter(btn.dataset.priority));
    });

    // Form
    elements.cancelBtn.addEventListener('click', cancelEdit);

    // Form Submission
    elements.todoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const editingId = state.editingId;
        let success = false;

        if (editingId) {
            success = await updateTodoFromForm(editingId);
        } else {
            success = await createTodoFromForm();
        }

        if (success) {
            cancelEdit();
        }
    });

    // Modal
    elements.modalClose.addEventListener('click', closeModal);
    elements.modalCancel.addEventListener('click', closeModal);
    elements.modalConfirm.addEventListener('click', () => {
        if (state.deleteTargetId) {
            deleteTodo(state.deleteTargetId);
            closeModal();
        }
    });

    // Close modal on overlay click
    elements.deleteModal.addEventListener('click', (e) => {
        if (e.target === elements.deleteModal) closeModal();
    });

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !elements.deleteModal.hidden) {
            closeModal();
        }
    });

    // Enter key in search to clear
    elements.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            elements.searchInput.blur();
            if (state.searchTerm) clearSearch();
        }
    });
}

function closeModal() {
    elements.deleteModal.hidden = true;
    state.deleteTargetId = null;
    // Return focus to the delete button that opened the modal
    const deleteBtn = document.querySelector(`.task-card[data-id="${state.deleteTargetId}"] [data-action="delete"]`);
    if (deleteBtn) deleteBtn.focus();
}

// Focus trap for modal
function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    function handleTab(e) {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    modal.addEventListener('keydown', handleTab);
    modal._focusTrap = handleTab;
}

// ==========================================================================
// UI HELPERS
// ==========================================================================
function setSubmitLoading(loading) {
    elements.submitBtn.disabled = loading;
    elements.cancelBtn.disabled = loading;
    elements.submitBtn.setAttribute('aria-busy', loading);
}

function setLoading(loading) {
    state.isLoading = loading;
    // Could add a global loading indicator here if needed
}

function animateCount(element, target) {
    const current = parseInt(element.textContent) || 0;
    if (current === target) return;

    const duration = 300;
    const start = performance.now();

    function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const value = Math.round(current + (target - current) * eased);
        element.textContent = value;
        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateFull(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(todo) {
    if (!todo.due_date || todo.status === 'completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(todo.due_date + 'T00:00:00');
    return due < today;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================
function showToast(type, title, message) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.role = 'alert';
    toast.ariaLive = 'polite';

    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    toast.innerHTML = `
        <span class="toast-icon" aria-hidden="true">${icons[type]}</span>
        <div class="toast-content">
            <div class="toast-title">${escapeHtml(title)}</div>
            <div class="toast-message">${escapeHtml(message)}</div>
        </div>
        <button type="button" class="toast-close" aria-label="Dismiss">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => hideToast(toast));
    elements.toastContainer.appendChild(toast);

    // Force reflow then show
    requestAnimationFrame(() => toast.classList.add('show'));

    // Auto-dismiss
    setTimeout(() => hideToast(toast), 4000);
}

function hideToast(toast) {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove());
}