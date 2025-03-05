document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');
    const clearCompletedButton = document.getElementById('clearCompleted');
    const emptyState = document.getElementById('emptyState');

    // Load tasks from local storage
    let tasks = JSON.parse(localStorage.getItem('puretask-tasks')) || [];

    // Save tasks to local storage
    function saveTasks() {
        localStorage.setItem('puretask-tasks', JSON.stringify(tasks));
        updateTaskStats();
    }

    // Update task statistics and empty state
    function updateTaskStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;

        taskCount.textContent = `${totalTasks} task${totalTasks !== 1 ? 's' : ''}`;

        emptyState.style.display = totalTasks === 0 ? 'block' : 'none';
        taskList.style.display = totalTasks > 0 ? 'block' : 'none';

        clearCompletedButton.style.display = completedTasks > 0 ? 'block' : 'none';
    }

    // Render tasks
    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.classList.add('task-item');

            if (task.completed) {
                li.classList.add('completed');
            }

            li.innerHTML = `
                <span>${task.text}</span>
                <div class="task-actions">
                    <button class="task-complete" data-index="${index}" aria-label="Toggle Task">
                        ${task.completed ? '↩️' : '✔️'}
                    </button>
                    <button class="task-delete" data-index="${index}" aria-label="Delete Task">🗑️</button>
                </div>
            `;

            taskList.appendChild(li);
        });

        // Add event listeners
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
            tasks.push({ text: taskText, completed: false });
            taskInput.value = '';
            saveTasks();
            renderTasks();
        }
    }

    // Delete a task
    function deleteTask(e) {
        const index = e.target.getAttribute('data-index');
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }

    // Toggle task completion
    function toggleTaskCompletion(e) {
        const index = e.target.getAttribute('data-index');
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }

    // Clear completed tasks
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    }

    // Event Listeners
    addTaskButton.addEventListener('click', addTask);
    clearCompletedButton.addEventListener('click', clearCompletedTasks);

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Initial render
    renderTasks();
});