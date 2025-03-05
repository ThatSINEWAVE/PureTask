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
                        ${task.completed ? '↩️' : '✔️'}
                    </button>
                    <button class="task-delete" data-index="${originalIndex}" aria-label="Delete Task">🗑️</button>
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
        }
    }

    // Delete a task
    function deleteTask(e) {
        const index = e.target.getAttribute('data-index');
        tasks.splice(index, 1);
        saveTasks();
    }

    // Toggle task completion
    function toggleTaskCompletion(e) {
        const index = e.target.getAttribute('data-index');
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
    }

    // Clear completed tasks
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
    }

    // Export tasks
    function exportTasks() {
        const tasksJson = JSON.stringify(tasks, null, 2);
        const blob = new Blob([tasksJson], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `PureTask_Export_${new Date().toISOString().split('T')[0]}.json`;
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