document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("taskInput");
    const addTaskButton = document.getElementById("addTask");
    const taskList = document.getElementById("taskList");
    const clearCompletedButton = document.getElementById("clearCompleted");
    const exportTasksButton = document.getElementById("exportTasks");
    const emptyState = document.getElementById("emptyState");
    const themeToggle = document.getElementById("themeToggle");

    // Filter buttons
    const filterAllButton = document.getElementById("filterAll");
    const filterActiveButton = document.getElementById("filterActive");
    const filterCompletedButton = document.getElementById("filterCompleted");

    // Edit variables
    let editingTaskIndex = null;
    let originalTaskText = "";

    // Theme management
    function applyTheme(theme) {
        document.body.classList.toggle("dark-theme", theme === "dark");
        localStorage.setItem("puretask-theme", theme);
        updateThemeToggleIcon(theme);
    }

    function updateThemeToggleIcon(theme) {
        const themeToggleSvg = themeToggle.querySelector("svg");
        themeToggleSvg.innerHTML =
            theme === "dark" ?
            '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"></path>' :
            '<circle cx="12" cy="12" r="5"></circle>\
         <line x1="12" y1="1" x2="12" y2="3"></line>\
         <line x1="12" y1="21" x2="12" y2="23"></line>\
         <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>\
         <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>\
         <line x1="1" y1="12" x2="3" y2="12"></line>\
         <line x1="21" y1="12" x2="23" y2="12"></line>\
         <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>\
         <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    }

    // Initialize theme
    const savedTheme =
        localStorage.getItem("puretask-theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ?
            "dark" :
            "light");
    applyTheme(savedTheme);

    themeToggle.addEventListener("click", () => {
        const currentTheme = document.body.classList.contains("dark-theme") ?
            "light" :
            "dark";
        applyTheme(currentTheme);
    });

    // Task management
    let tasks = JSON.parse(localStorage.getItem("puretask-tasks")) || [];
    let currentFilter = "all";

    function saveTasks() {
        localStorage.setItem("puretask-tasks", JSON.stringify(tasks));
        updateTaskStats();
        renderTasks();
    }

    function updateTaskStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((task) => task.completed).length;
        const activeTasks = totalTasks - completedTasks;

        emptyState.style.display = totalTasks === 0 ? "block" : "none";
        taskList.style.display = totalTasks > 0 ? "block" : "none";
        clearCompletedButton.style.display = completedTasks > 0 ? "block" : "none";
        exportTasksButton.style.display = totalTasks > 0 ? "block" : "none";

        const progressPercentage =
            totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        updateProgressBar(progressPercentage);
    }

    function updateProgressBar(percentage) {
        const progressFill = document.querySelector(".progress-fill");
        const progressText = document.querySelector(".progress-text");

        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}% Complete`;

        // Update stats numbers
        document.getElementById("totalTasks").textContent = tasks.length;
        document.getElementById("completedTasks").textContent = tasks.filter(
            (task) => task.completed
        ).length;
        document.getElementById("activeTasks").textContent = tasks.filter(
            (task) => !task.completed
        ).length;
    }

    function renderTasks() {
        taskList.innerHTML = "";

        const filteredTasks = tasks.filter((task) => {
            switch (currentFilter) {
                case "active":
                    return !task.completed;
                case "completed":
                    return task.completed;
                default:
                    return true;
            }
        });

        filteredTasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.classList.add("task-item");
            if (task.completed) li.classList.add("completed");

            const originalIndex = tasks.indexOf(task);

            li.innerHTML = `
        <span class="task-text">${task.text}</span>
        <div class="task-actions">
          <button class="task-edit" data-index="${originalIndex}" aria-label="Edit Task">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
          </button>
          <button class="task-complete" data-index="${originalIndex}" aria-label="Toggle Task">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${
                task.completed
                  ? '<path d="M20 6L9 17L4 12"></path>'
                  : '<circle cx="12" cy="12" r="10"></circle>'
              }
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

        document.querySelectorAll(".task-delete").forEach((button) => {
            button.addEventListener("click", deleteTask);
        });

        document.querySelectorAll(".task-complete").forEach((button) => {
            button.addEventListener("click", toggleTaskCompletion);
        });

        document.querySelectorAll(".task-edit").forEach((button) => {
            button.addEventListener("click", editTask);
        });

        updateTaskStats();
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText) {
            if (editingTaskIndex !== null) {
                // Save the edited task
                tasks[editingTaskIndex].text = taskText;
                editingTaskIndex = null;
                addTaskButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        `;
            } else {
                // Add a new task
                tasks.push({
                    text: taskText,
                    completed: false,
                });
            }

            taskInput.value = "";
            currentFilter = "all";
            updateFilterButtons();
            saveTasks();
            taskInput.classList.add("task-added-animation");
            setTimeout(() => {
                taskInput.classList.remove("task-added-animation");
            }, 300);
        } else if (editingTaskIndex !== null) {
            // If editing but empty, cancel edit
            cancelEdit();
        }
    }

    function editTask(e) {
        const index = parseInt(
            e.target.closest("button").getAttribute("data-index")
        );
        editingTaskIndex = index;
        originalTaskText = tasks[index].text;

        // Set input to current task text
        taskInput.value = originalTaskText;
        taskInput.focus();

        // Change add button to save button
        addTaskButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
      </svg>
    `;

        // Add escape key listener to cancel edit
        document.addEventListener("keydown", handleEscapeKey);
    }

    function cancelEdit() {
        taskInput.value = "";
        editingTaskIndex = null;
        addTaskButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    `;
        document.removeEventListener("keydown", handleEscapeKey);
    }

    function handleEscapeKey(e) {
        if (e.key === "Escape" && editingTaskIndex !== null) {
            cancelEdit();
        }
    }

    function deleteTask(e) {
        const index = e.target.closest("button").getAttribute("data-index");
        const taskItem = e.target.closest(".task-item");

        // If we're currently editing this task, cancel the edit
        if (editingTaskIndex === parseInt(index)) {
            cancelEdit();
        }

        taskItem.classList.add("task-delete-animation");
        setTimeout(() => {
            tasks.splice(index, 1);
            saveTasks();
        }, 300);
    }

    function toggleTaskCompletion(e) {
        const index = e.target.closest("button").getAttribute("data-index");
        const taskItem = e.target.closest(".task-item");
        taskItem.classList.add("task-toggle-animation");
        setTimeout(() => {
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            taskItem.classList.remove("task-toggle-animation");
        }, 200);
    }

    function clearCompletedTasks() {
        const completedTasksCount = tasks.filter((task) => task.completed).length;
        if (
            completedTasksCount > 0 &&
            confirm(`Clear ${completedTasksCount} completed tasks?`)
        ) {
            // If we're editing a task that's about to be deleted, cancel edit
            if (editingTaskIndex !== null && tasks[editingTaskIndex].completed) {
                cancelEdit();
            }

            tasks = tasks.filter((task) => !task.completed);
            saveTasks();
        }
    }

    function exportTasks() {
        const tasksJson = JSON.stringify(tasks, null, 2);
        const blob = new Blob([tasksJson], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split("T")[0];
        const a = document.createElement("a");
        a.href = url;
        a.download = `PureTask_Export_${date}_${tasks.length}tasks.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function uploadTasks(event) {
        const file = event.target.files[0];
        if (file && file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const uploadedTasks = JSON.parse(e.target.result);
                    if (Array.isArray(uploadedTasks)) {
                        tasks = uploadedTasks;
                        saveTasks();
                        alert("Tasks uploaded successfully!");
                    } else {
                        alert("Invalid file format. Please upload a valid JSON file.");
                    }
                } catch (error) {
                    alert("Error reading file. Please upload a valid JSON file.");
                }
            };
            reader.readAsText(file);
        } else {
            alert("Please upload a JSON file.");
        }
    }

    function updateFilterButtons() {
        filterAllButton.classList.toggle("active", currentFilter === "all");
        filterActiveButton.classList.toggle("active", currentFilter === "active");
        filterCompletedButton.classList.toggle(
            "active",
            currentFilter === "completed"
        );
        renderTasks();
    }

    // Event Listeners
    addTaskButton.addEventListener("click", addTask);
    clearCompletedButton.addEventListener("click", clearCompletedTasks);
    exportTasksButton.addEventListener("click", exportTasks);

    const uploadTasksInput = document.getElementById("uploadTasks");
    uploadTasksInput.addEventListener("change", uploadTasks);

    taskInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            addTask();
        }
    });

    filterAllButton.addEventListener("click", () => {
        currentFilter = "all";
        updateFilterButtons();
    });

    filterActiveButton.addEventListener("click", () => {
        currentFilter = "active";
        updateFilterButtons();
    });

    filterCompletedButton.addEventListener("click", () => {
        currentFilter = "completed";
        updateFilterButtons();
    });

    // Initial render
    updateFilterButtons();
});