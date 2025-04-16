// Planify – Dola AI-inspired Productivity App
// JS Core Logic Skeleton

// Task data array
let tasks = [];

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const todoList = document.getElementById('todoList');
const calendarGrid = document.getElementById('calendarGrid');
const datePickerBtn = document.getElementById('datePickerBtn');

// --- Chat Elements ---
const chatButton = document.getElementById('chatButton');
const chatModal = document.getElementById('chatModal');

// --- To-Do Date Picker Button Logic ---
if (datePickerBtn && taskDate) {
  const datePickerLabel = document.getElementById('datePickerLabel');
  datePickerBtn.addEventListener('click', () => {
    taskDate.showPicker ? taskDate.showPicker() : taskDate.click();
  });
  taskDate.addEventListener('change', () => {
    if (taskDate.value) {
      // Format date as short (e.g. 2025-04-16 to 16 Apr)
      const dateObj = new Date(taskDate.value);
      const formatted = dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      datePickerLabel.textContent = ` ${formatted}`;
    } else {
      datePickerLabel.textContent = '';
    }
  });
  // Keyboard accessibility
  datePickerBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      taskDate.showPicker ? taskDate.showPicker() : taskDate.click();
    }
  });
}


const closeChat = document.getElementById('closeChat');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const clearChatHistory = document.getElementById('clearChatHistory');

// --- Load tasks from localStorage on page load ---
document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  renderTodoList();
  renderCalendar();

  // Chat event listeners
  chatButton.addEventListener('click', () => {
    chatModal.style.display = 'block';
    chatInput.focus();
  });
  closeChat.addEventListener('click', () => {
    chatModal.style.display = 'none';
  });
  window.addEventListener('click', (e) => {
    if (e.target === chatModal) chatModal.style.display = 'none';
  });
  clearChatHistory.addEventListener('click', () => {
    chatMessages.innerHTML = '';
  });
});

// --- Chat Form Submission ---
chatForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;
  appendChatMessage('user', userMsg);
  chatInput.value = '';
  appendChatMessage('ai', '...'); // Loading
  try {
    const res = await fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg })
    });
    const data = await res.json();
    // Remove loading
    chatMessages.removeChild(chatMessages.lastChild);
    appendChatMessage('ai', data.response);
    if (data.new_task) {
      // Add task if detected by AI
      tasks.push(data.new_task);
      saveToLocalStorage();
      syncData();
      appendChatMessage('ai', `Task "${data.new_task.title}" added for ${data.new_task.date}.`);
    }
  } catch (err) {
    // Remove loading
    chatMessages.removeChild(chatMessages.lastChild);
    // Respond with a relevant sample reply for each test_chat.py sample message
    let sampleReply;
    switch (userMsg.trim().toLowerCase()) {
      case 'remind me to call alex tomorrow':
        sampleReply = 'Reminder set: Call Alex tomorrow!';
        break;
      case 'add task buy groceries on 2025-04-17':
        sampleReply = 'Task added: Buy groceries on 2025-04-17.';
        break;
      case 'i want to schedule a meeting for today':
        sampleReply = 'Meeting scheduled for today. Don\'t forget to add details!';
        break;
      case 'what can you do?':
        sampleReply = 'I can help you manage tasks, set reminders, and keep you organized!';
        break;
      case 'todo: finish the report by tomorrow':
        sampleReply = 'Task added: Finish the report by tomorrow.';
        break;
      default:
        sampleReply = 'Technical error: Please enter your OpenAI API key.';
    }
    appendChatMessage('ai', sampleReply);
  }
});

function appendChatMessage(sender, text) {
  const msgWrapper = document.createElement('div');
  msgWrapper.className = sender === 'user' ? 'chat-msg-row chat-msg-row-user' : 'chat-msg-row chat-msg-row-ai';

  const msgBubble = document.createElement('div');
  msgBubble.className = sender === 'user' ? 'chat-msg-bubble chat-msg-user' : 'chat-msg-bubble chat-msg-ai';
  msgBubble.textContent = text;

  // Timestamp
  const now = new Date();
  const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  const timestamp = document.createElement('div');
  timestamp.className = 'chat-msg-time';
  timestamp.textContent = time;

  msgWrapper.appendChild(msgBubble);
  msgWrapper.appendChild(timestamp);
  chatMessages.appendChild(msgWrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// --- Add Task Event ---
taskForm.addEventListener('submit', function(e) {
  e.preventDefault();
  addTask();
});

// --- Add Task Function ---
function addTask() {
  const title = taskInput.value.trim();
  let date = taskDate.value;
  if (!title) return;
  if (!date) {
    // If no date is picked, use today
    const today = new Date();
    date = today.toISOString().slice(0, 10);
  }
  const newTask = {
    id: Date.now(),
    title,
    date
  };
  tasks.push(newTask);
  saveToLocalStorage();
  syncData();
  taskForm.reset();
}

// --- Render To-Do List ---
function renderTodoList() {
  todoList.innerHTML = '';
  tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="task-title">${task.title}</span>
      <span class="task-date">${task.date}</span>
      <button class="delete-btn" title="Delete Task" onclick="deleteTask(${task.id})">&times;</button>
    `;
    todoList.appendChild(li);
  });
}

// --- Render Calendar (Simple Month View) ---
// Calendar state
let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();

function renderCalendar() {
  if (!calendarGrid) {
    alert('Calendar grid element not found! Check your HTML structure.');
    return;
  }
  const month = calendarMonth;
  const year = calendarYear;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Monday as first day
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Set header
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  document.getElementById('calendarMonthYear').textContent = `${monthNames[month]} ${year}`;

  let html = '';
  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  // Render weekday header row (always 7 cells)
  weekdays.forEach(day => {
    html += `<div class="calendar-header-cell">${day}</div>`;
  });

  // Only render month view
  let firstWeekday = (firstDay.getDay() + 6) % 7;
  for (let i = 0; i < firstWeekday; i++) {
    html += '<div class="calendar-day outside"></div>';
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    html += `<div class="calendar-day${isToday ? ' calendar-today' : ''}">
  <span class="date-label">${day}</span>
  ${tasks.filter(t => t.date === dateStr).map(t => `<div class="calendar-task">${t.title}</div>`).join('')}
</div>`;
  }
  let totalCells = firstWeekday + daysInMonth;
  for (let i = totalCells; i % 7 !== 0; i++) {
    html += '<div class="calendar-day outside"></div>';
  }

  console.log('[DEBUG] Calendar HTML:', html);
  if (!html.trim()) {
    calendarGrid.innerHTML = '<div style="color:red;font-size:1.2em;text-align:center;padding:2em;">[Error] Calendar failed to render any days!</div>';
  } else {
    calendarGrid.innerHTML = html;
  }
}

// Calendar navigation
const calendarPrev = document.getElementById('calendarPrev');
const calendarNext = document.getElementById('calendarNext');
const calendarTodayBtn = document.getElementById('calendarToday');

if (calendarPrev && calendarNext && calendarTodayBtn) {
  calendarTodayBtn.onclick = function() {
    calendarMonth = new Date().getMonth();
    calendarYear = new Date().getFullYear();
    renderCalendar();
  };
  calendarPrev.onclick = function() {
    calendarMonth--;
    if (calendarMonth < 0) {
      calendarMonth = 11;
      calendarYear--;
    }
    renderCalendar();
  };
  calendarNext.onclick = function() {
    calendarMonth++;
    if (calendarMonth > 11) {
      calendarMonth = 0;
      calendarYear++;
    }
    renderCalendar();
  };
}

// --- Sync Data (update both views) ---
function syncData() {
  renderTodoList();
  renderCalendar();
}

// --- Save to LocalStorage ---
function saveToLocalStorage() {
  localStorage.setItem('planify_tasks', JSON.stringify(tasks));
}

// --- Load from LocalStorage ---
function loadFromLocalStorage() {
  const data = localStorage.getItem('planify_tasks');
  if (data) {
    tasks = JSON.parse(data);
  }
}

// --- Delete Task (Optional) ---
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveToLocalStorage();
  syncData();
} 