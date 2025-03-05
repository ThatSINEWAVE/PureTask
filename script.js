document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');
    const clearCompletedButton = document.getElementById('clearCompleted');
    const exportTasksButton = document.getElementById('exportTasks');
    const emptyState = document.getElementById('emptyState');
    const themeToggle = document.getElementById('themeToggle');

    // Filter buttons
    const filterAllButton = document.getElementById('filterAll');
    const filterActiveButton = document.getElementById('filterActive');
    const filterCompletedButton = document.getElementById('filterCompleted');

    // Theme management
    function applyTheme(theme) {
        document.body.classList.toggle('dark-theme', theme === 'dark');
        localStorage.setItem('puretask-theme', theme);
        updateThemeToggleIcon(theme);
    }

    // Update theme toggle icon
    function updateThemeToggleIcon(theme) {
        const themeToggleSvg = themeToggle.querySelector('svg');
        themeToggleSvg.innerHTML = theme === 'dark'
            ? `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"></path>`
            : `<circle cx="12" cy="12" r="5"></circle>
               <line x1="12" y1="1" x2="12" y2="3"></line>
               <line x1="12" y1="21" x2="12" y2="23"></line>
               <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
               <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
               <line x1="1" y1="12" x2="3" y2="12"></line>
               <line x1="21" y1="12" x2="23" y2="12"></line>
               <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
               <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
    }

    // Initialize theme
    const savedTheme = localStorage.getItem('puretask-theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);

    // Theme toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
        applyTheme(currentTheme);
    });

    // Load tasks from local storage
    let tasks = JSON.parse(localStorage.getItem('puretask-tasks')) || [];
    let currentFilter = 'all';

    // Save tasks to local storage
    function saveTasks() {
        localStorage.setItem('puretask-tasks', JSON.stringify(tasks));
        updateTaskStats();
        renderTasks();
    }

    // Update task statistics and empty state
    function updateTaskStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;

        taskCount.textContent = `${totalTasks} task${totalTasks !== 1 ? 's' : ''}`;

        emptyState.style.display = totalTasks === 0 ? 'block' : 'none';
        taskList.style.display = totalTasks > 0 ? 'block' : 'none';

        clearCompletedButton.style.display = completedTasks > 0 ? 'block' : 'none';
        exportTasksButton.style.display = totalTasks > 0 ? 'block' : 'none';
    }

    // Render tasks based on current filter
    function renderTasks() {
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            switch (currentFilter) {
                case 'active':
                    return !task.completed;
                case 'completed':
                    return task.completed;
                default:
                    return true;
            }
        });

        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.classList.add('task-item');

            if (task.completed) {
                li.classList.add('completed');
            }

            // Find the actual index in the original tasks array
            const originalIndex = tasks.indexOf(task);

            li.innerHTML = `
                <span>${task.text}</span>
                <div class="task-actions">
                    <button class="task-complete" data-index="${originalIndex}" aria-label="Toggle Task">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            ${task.completed
                                ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
                                : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="8"></line>'}
                        </svg>
                    </button>
                    <button class="task-delete" data-index="${originalIndex}" aria-label="Delete Task">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            `;

            taskList.appendChild(li);
        });

        // Re-add event listeners
        document.querySelectorAll('.task-delete').forEach(button => {
            button.addEventListener('click', deleteTask);
        });

        document.querySelectorAll('.task-complete').forEach(button => {
            button.addEventListener('click', toggleTaskCompletion);
        });

        updateTaskStats();
    }

    // Add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText) {
            tasks.push({
                text: taskText,
                completed: false
            });
            taskInput.value = '';
            currentFilter = 'all';
            updateFilterButtons();
            saveTasks();
            // Add a subtle animation
            taskInput.classList.add('task-added-animation');
            setTimeout(() => {
                taskInput.classList.remove('task-added-animation');
            }, 300);
        }
    }

    // Delete a task
    function deleteTask(e) {
        const index = e.target.closest('button').getAttribute('data-index');
        const taskItem = e.target.closest('.task-item');

        // Add delete animation
        taskItem.classList.add('task-delete-animation');

        setTimeout(() => {
            tasks.splice(index, 1);
            saveTasks();
        }, 300);
    }

    // Toggle task completion with animation
    function toggleTaskCompletion(e) {
        const index = e.target.closest('button').getAttribute('data-index');
        const taskItem = e.target.closest('.task-item');

        // Add toggle animation
        taskItem.classList.add('task-toggle-animation');

        setTimeout(() => {
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            taskItem.classList.remove('task-toggle-animation');
        }, 200);
    }

    // Clear completed tasks with confirmation
    function clearCompletedTasks() {
        const completedTasksCount = tasks.filter(task => task.completed).length;

        if (completedTasksCount > 0) {
            const confirmClear = confirm(`Are you sure you want to clear ${completedTasksCount} completed task${completedTasksCount !== 1 ? 's' : ''}?`);

            if (confirmClear) {
                tasks = tasks.filter(task => !task.completed);
                saveTasks();
            }
        }
    }

    // Export tasks with custom filename
    function exportTasks() {
        const tasksJson = JSON.stringify(tasks, null, 2);
        const blob = new Blob([tasksJson], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);

        const date = new Date();
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        const a = document.createElement('a');
        a.href = url;
        a.download = `PureTask_Export_${formattedDate}_${tasks.length}tasks.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Update filter buttons active state
    function updateFilterButtons() {
        filterAllButton.classList.toggle('active', currentFilter === 'all');
        filterActiveButton.classList.toggle('active', currentFilter === 'active');
        filterCompletedButton.classList.toggle('active', currentFilter === 'completed');
        renderTasks();
    }

    // Event Listeners
    addTaskButton.addEventListener('click', addTask);
    clearCompletedButton.addEventListener('click', clearCompletedTasks);
    exportTasksButton.addEventListener('click', exportTasks);

    // Filter buttons
    filterAllButton.addEventListener('click', () => {
        currentFilter = 'all';
        updateFilterButtons();
    });

    filterActiveButton.addEventListener('click', () => {
        currentFilter = 'active';
        updateFilterButtons();
    });

    filterCompletedButton.addEventListener('click', () => {
        currentFilter = 'completed';
        updateFilterButtons();
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Initial render
    updateFilterButtons();
});