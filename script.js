// Local Storage Initialization
let items = JSON.parse(localStorage.getItem('app_workspace_tasks')) || [
    { id: 1, text: "Finalize Quarterly Presentation", priority: "high", completed: false },
    { id: 2, text: "Schedule team sync meeting", priority: "medium", completed: true }
];

let activeFilter = 'all';
let searchQuery = '';

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const prioritySelect = document.getElementById('priority-select');
const todoList = document.getElementById('todo-list');
const taskCounter = document.getElementById('task-counter');
const searchInput = document.getElementById('search-input');
const segmentBtns = document.querySelectorAll('.segment-btn');
const clearCompletedBtn = document.getElementById('clear-completed');
const syncBtn = document.getElementById('sync-btn');
const toast = document.getElementById('toast');

document.addEventListener('DOMContentLoaded', () => {
    render();

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = todoInput.value.trim();
        if (value) {
            addItem(value, prioritySelect.value);
            todoInput.value = '';
        }
    });

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        render();
    });

    segmentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            segmentBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            render();
        });
    });

    clearCompletedBtn.addEventListener('click', clearDone);
    syncBtn.addEventListener('click', executeSync);
});

function saveState() {
    localStorage.setItem('app_workspace_tasks', JSON.stringify(items));
}

function addItem(text, priority) {
    items.unshift({ id: Date.now(), text, priority, completed: false });
    saveState();
    render();
    showToast('Task added successfully');
}

function toggleItem(id) {
    items = items.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
    saveState();
    render();
}

function removeItem(id) {
    items = items.filter(item => item.id !== id);
    saveState();
    render();
    showToast('Task removed');
}

function clearDone() {
    items = items.filter(item => !item.completed);
    saveState();
    render();
    showToast('Cleared completed tasks');
}

function render() {
    todoList.innerHTML = '';

    const filtered = items.filter(item => {
        const matches = item.text.toLowerCase().includes(searchQuery);
        if (activeFilter === 'pending') return matches && !item.completed;
        if (activeFilter === 'completed') return matches && item.completed;
        return matches;
    });

    if (filtered.length === 0) {
        todoList.innerHTML = `<li style="text-align:center; color: var(--text-muted); padding: 20px; font-size: 0.85rem;">No tasks found</li>`;
    } else {
        filtered.forEach(item => {
            const li = document.createElement('li');
            li.className = `task-item ${item.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <div class="item-left">
                    <input type="checkbox" class="check-input" ${item.completed ? 'checked' : ''} onchange="toggleItem(${item.id})">
                    <span class="task-title">${escapeHtml(item.text)}</span>
                    <span class="tag-priority p-${item.priority}">${item.priority}</span>
                </div>
                <button class="btn-remove" onclick="removeItem(${item.id})"><i class="fa-solid fa-trash-can"></i></button>
            `;
            todoList.appendChild(li);
        });
    }

    const count = items.filter(i => !i.completed).length;
    taskCounter.textContent = `${count} ${count === 1 ? 'task' : 'tasks'} remaining`;
}

function executeSync() {
    showToast('Syncing workspace...');
    new Promise(resolve => setTimeout(resolve, 800))
        .then(() => showToast('Cloud sync complete'))
        .catch(() => showToast('Sync failed'));
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2000);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}