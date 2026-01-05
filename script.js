class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('honeyDoTasks')) || [];
        this.currentFilter = 'all';
        this.currentPriority = 'low';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
        this.updateProgress();
    }

    setupEventListeners() {
        // Add task
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Priority buttons
        document.querySelectorAll('.priority-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPriority = e.target.dataset.priority;
            });
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // Clear all button
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllTasks());
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();

        if (!text) {
            this.showNotification('Please enter a task!', 'error');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            priority: this.currentPriority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
        this.updateProgress();
        
        input.value = '';
        input.focus();
        
        this.showNotification('Task added successfully!', 'success');
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.render();
        this.updateProgress();
        
        this.showNotification('Task deleted!', 'info');
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
            this.updateProgress();
        }
    }

    clearAllTasks() {
        if (this.tasks.length === 0) {
            this.showNotification('No tasks to clear!', 'info');
            return;
        }

        if (confirm('Are you sure you want to clear all tasks?')) {
            this.tasks = [];
            this.saveTasks();
            this.render();
            this.updateProgress();
            this.showNotification('All tasks cleared!', 'info');
        }
    }

    saveTasks() {
        localStorage.setItem('honeyDoTasks', JSON.stringify(this.tasks));
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    render() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '';
            taskList.appendChild(emptyState);
            document.getElementById('taskCount').textContent = '0 tasks';
            return;
        }

        const tasksHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
        taskList.innerHTML = tasksHTML;

        // Add event listeners to new task elements
        filteredTasks.forEach(task => {
            const checkbox = document.querySelector(`[data-id="${task.id}"] .task-checkbox`);
            const deleteBtn = document.querySelector(`[data-id="${task.id}"] .delete-btn`);
            
            if (checkbox) {
                checkbox.addEventListener('click', () => this.toggleTask(task.id));
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
            }
        });

        document.getElementById('taskCount').textContent = 
            `${filteredTasks.length} ${filteredTasks.length === 1 ? 'task' : 'tasks'}`;
    }

    createTaskHTML(task) {
        const priorityClass = {
            high: 'high-priority',
            medium: 'medium-priority',
            low: 'low-priority'
        }[task.priority];

        const priorityText = {
            high: 'High',
            medium: 'Medium',
            low: 'Low'
        }[task.priority];

        return `
            <div class="task-item ${priorityClass}" data-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}"></div>
                <div class="task-content">
                    <div class="task-text ${task.completed ? 'completed' : ''}">
                        ${this.escapeHtml(task.text)}
                    </div>
                    <span class="task-priority ${task.priority}">${priorityText}</span>
                </div>
                <div class="task-actions">
                    <button class="delete-btn" title="Delete task">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }

    updateProgress() {
        if (this.tasks.length === 0) {
            document.getElementById('progressFill').style.width = '0%';
            document.getElementById('progressText').textContent = '0% Complete';
            return;
        }

        const completedTasks = this.tasks.filter(task => task.completed).length;
        const percentage = Math.round((completedTasks / this.tasks.length) * 100);
        
        document.getElementById('progressFill').style.width = `${percentage}%`;
        document.getElementById('progressText').textContent = `${percentage}% Complete`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
                animation: slideInRight 0.3s ease;
                border-left: 4px solid #fbbf24;
            }
            
            .notification.success {
                border-left-color: #10b981;
            }
            
            .notification.error {
                border-left-color: #ef4444;
            }
            
            .notification.info {
                border-left-color: #3b82f6;
            }
            
            .notification i {
                font-size: 1.2rem;
            }
            
            .notification.success i {
                color: #10b981;
            }
            
            .notification.error i {
                color: #ef4444;
            }
            
            .notification.info i {
                color: #3b82f6;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});
