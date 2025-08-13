// js/script.js
document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const taskInput = document.getElementById('task-input')
  const addTaskButton = document.getElementById('add-task-button')
  const taskList = document.getElementById('task-list')
  const clearAllButton = document.getElementById('clear-all-button')

  // Load tasks from localStorage when page loads
  loadTasks()

  // Add task when button is clicked
  addTaskButton.addEventListener('click', addTask)

  // Add task when Enter key is pressed
  taskInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      addTask()
    }
  })

  // Clear all tasks
  clearAllButton.addEventListener('click', clearAllTasks)

  function addTask() {
    const taskText = taskInput.value.trim()

    if (taskText !== '') {
      // Create new task item
      const taskItem = document.createElement('li')
      taskItem.innerHTML = `
                <span>${taskText}</span>
                <div class="task-actions">
                    <button class="complete-btn">✓</button>
                    <button class="delete-btn">✗</button>
                </div>
            `

      // Add to the list
      taskList.appendChild(taskItem)

      // Clear input field
      taskInput.value = ''

      // Save tasks to localStorage
      saveTasks()

      // Add event listeners to new buttons
      const completeBtn = taskItem.querySelector('.complete-btn')
      const deleteBtn = taskItem.querySelector('.delete-btn')

      completeBtn.addEventListener('click', function () {
        taskItem.classList.toggle('completed')
        saveTasks()
      })

      deleteBtn.addEventListener('click', function () {
        taskItem.remove()
        saveTasks()
      })
    }
  }

  function clearAllTasks() {
    if (confirm('Are you sure you want to clear all tasks?')) {
      taskList.innerHTML = ''
      saveTasks()
    }
  }

  function saveTasks() {
    const tasks = []
    document.querySelectorAll('#task-list li').forEach((task) => {
      tasks.push({
        text: task.querySelector('span').textContent,
        completed: task.classList.contains('completed'),
      })
    })
    localStorage.setItem('honeyDoTasks', JSON.stringify(tasks))
  }

  function loadTasks() {
    const savedTasks = localStorage.getItem('honeyDoTasks')
    if (savedTasks) {
      JSON.parse(savedTasks).forEach((task) => {
        const taskItem = document.createElement('li')
        if (task.completed) {
          taskItem.classList.add('completed')
        }
        taskItem.innerHTML = `
                    <span>${task.text}</span>
                    <div class="task-actions">
                        <button class="complete-btn">✓</button>
                        <button class="delete-btn">✗</button>
                    </div>
                `
        taskList.appendChild(taskItem)

        // Add event listeners to loaded buttons
        const completeBtn = taskItem.querySelector('.complete-btn')
        const deleteBtn = taskItem.querySelector('.delete-btn')

        completeBtn.addEventListener('click', function () {
          taskItem.classList.toggle('completed')
          saveTasks()
        })

        deleteBtn.addEventListener('click', function () {
          taskItem.remove()
          saveTasks()
        })
      })
    }
  }
})
