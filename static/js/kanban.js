// Obtener la lista de usuarios activos
fetch('http://localhost:5000/users')
  .then(response => response.json())
  .then(users => {
    const userList = document.getElementById('user-list');
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.text = user.name;
      userList.add(option);
    });
  })
  .catch(error => console.error('Error fetching users:', error));

// Crear nueva tarea
function createTask() {
  const taskName = document.getElementById('task-name').value;
  const assignedTo = document.getElementById('user-list').value;

  const taskData = {
    task_name: taskName,
    assigned_to: assignedTo
  };

  fetch('http://localhost:5000/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Task created:', data);
    loadTasks();
  })
  .catch(error => console.error('Error creating task:', error));
}

// Cargar tareas al iniciar
function loadTasks() {
  fetch('http://localhost:5000/tasks')
    .then(response => response.json())
    .then(tasks => {
      document.getElementById('todo-items').innerHTML = '';
      document.getElementById('in-progress-items').innerHTML = '';
      document.getElementById('done-items').innerHTML = '';

      tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'kanban-item';
        taskDiv.draggable = true;
        taskDiv.ondragstart = drag;
        taskDiv.id = `task-${task.id}`; // ID de la tarea
        
        // Mostrar el nombre de la tarea y el responsable
        taskDiv.innerHTML = `<strong>${task.task_name}</strong><br/>Responsable: ${task.assigned_to}`;

        if (task.status === 'To Do') {
          document.getElementById('todo-items').appendChild(taskDiv);
        } else if (task.status === 'In Progress') {
          document.getElementById('in-progress-items').appendChild(taskDiv);
        } else {
          document.getElementById('done-items').appendChild(taskDiv);
        }
      });
    })
    .catch(error => console.error('Error loading tasks:', error));
}

// Cargar las tareas al cargar la página
document.addEventListener('DOMContentLoaded', loadTasks);

// Funciones para arrastrar y soltar
function allowDrop(event) {
  event.preventDefault();
}

function drag(event) {
  event.dataTransfer.setData('text', event.target.id);
}

function drop(event) {
  event.preventDefault();
  const taskId = event.dataTransfer.getData('text');
  const taskElement = document.getElementById(taskId);
  event.target.closest('.kanban-items').appendChild(taskElement);

  // Aquí se puede actualizar el estado de la tarea en la base de datos
}

let currentTaskId = null;

// Función para abrir el modal
function openModal(task) {
  document.getElementById('modal-task-details').innerHTML = `
    <strong>Tarea:</strong> ${task.task_name}<br/>
    <strong>Descripción:</strong> <input type="text" id="task-description" maxlength="150" value="${task.description || ''}">
  `;
  document.getElementById('priority').value = task.priority || 'Baja'; // Establecer valor por defecto
  document.getElementById('user-points').value = task.user_points || 1; // Establecer valor por defecto
  currentTaskId = task.id; // Guardar el ID de la tarea actual
  document.getElementById('task-modal').style.display = 'block';
}

// Función para cerrar el modal
function closeModal() {
  document.getElementById('task-modal').style.display = 'none';
}

// Función para actualizar los detalles de la tarea
function updateTaskDetails() {
  const description = document.getElementById('task-description').value;
  const priority = document.getElementById('priority').value;
  const userPoints = document.getElementById('user-points').value;

  fetch(`http://localhost:5000/tasks/${currentTaskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ description, priority, user_points: userPoints })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Task updated:', data);
    closeModal(); // Cerrar el modal después de guardar
    loadTasks(); // Recargar las tareas para mostrar cambios
  })
  .catch(error => console.error('Error updating task:', error));
}

// Al cargar las tareas, agrega un evento de clic para abrir el modal
tasks.forEach(task => {
  const taskDiv = document.createElement('div');
  taskDiv.className = 'kanban-item';
  taskDiv.draggable = true;
  taskDiv.ondragstart = drag;
  taskDiv.id = `task-${task.id}`;
  
  // Mostrar el nombre de la tarea y el responsable
  taskDiv.innerHTML = `<strong>${task.task_name}</strong><br/>Responsable: ${task.assigned_to}`;
  
  // Evento de clic para abrir el modal
  taskDiv.onclick = () => openModal(task);

  // Añadir la tarea al estado correspondiente
  if (task.status === 'To Do') {
    document.getElementById('todo-items').appendChild(taskDiv);
  } else if (task.status === 'In Progress') {
    document.getElementById('in-progress-items').appendChild(taskDiv);
  } else {
    document.getElementById('done-items').appendChild(taskDiv);
  }
});
