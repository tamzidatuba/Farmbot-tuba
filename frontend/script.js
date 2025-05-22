const toggle = document.getElementById('createTaskToggle');
const subtask = document.getElementById('subtaskContainer');
const arrow = document.getElementById('arrow');
const modal = document.getElementById('seedingModal');
const closeModal = document.getElementById('closeModal');
const seedingJobBtn = document.getElementById('seedingJobBtn');
const jobNameError = document.getElementById('jobNameError');



//grid ids
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const coordDisplay = document.getElementById('hover-coordinates');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

var dataList = [];

var plants = [];


//plant class
class Plant {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
  }
}


// Farm-robot coordinate system
const coordWidth = 395;
const coordHeight = 650;

//coordinate system
const axisPadding = 30;
const majorTickX = 50;
const majorTickY = 100;

//farmbot status
const statusBox = document.getElementById('farmbot-status');
const statusHistory = document.getElementById('status-history');
const statusContainer = document.getElementById('robot-status-container');
let isHistoryVisible = false;
const title = statusHistory.querySelector('.history-title');


const settingsBtn = document.querySelector('.settings-btn');
const logoutBtn = document.getElementById('logoutBtn');
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeLoginModal = document.getElementById('closeLoginModal');


toggle.addEventListener('click', () => {
  const isVisible = seedingSubtask.style.display === 'block';
  const display = isVisible ? 'none' : 'block';

  seedingSubtask.style.display = display;
  arrow.classList.toggle('open', !isVisible);
});

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginBtn').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'none';
});

settingsBtn.addEventListener('click', () => {
  const isVisible = loginBtn.style.display === 'block';

  loginBtn.style.display = isVisible ? 'none' : 'block';
  logoutBtn.style.display = isVisible ? 'none' : 'block';
});


loginBtn.addEventListener('click', () => {
  loginModal.style.display = 'block';
});

closeLoginModal.addEventListener('click', () => {
  loginModal.style.display = 'none';
});

const form = document.getElementById('loginForm');
    form.addEventListener('submit', function(e) {
      let valid = true;
      const username = document.getElementById('username');
      const password = document.getElementById('password');
      const usernameError = document.getElementById('usernameError');
      const passwordError = document.getElementById('passwordError');

      usernameError.textContent = '';
      passwordError.textContent = '';

      if (username.value.trim() === '') {
        usernameError.textContent = 'Username is required.';
        valid = false;
      } else if (username.value.trim().length < 3) {
        usernameError.textContent = 'Username must be at least 3 characters.';
        valid = false;
      }

      if (password.value.trim() === '') {
        passwordError.textContent = 'Password is required.';
        valid = false;
      } else if (password.value.trim().length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters.';
        valid = false;
      }

      if (!valid) e.preventDefault();
    });
// Optional: Close on background click
window.addEventListener('click', (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = 'none';
  }
});




toggle.addEventListener('click', () => {
  const isVisible = subtask.style.display === 'block';
  subtask.style.display = isVisible ? 'none' : 'block';
  arrow.classList.toggle('open', !isVisible);
});

seedingJobBtn.addEventListener('click', () => {
  modal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
  document.getElementById('SeedingJobName').value = '';
  document.getElementById('jobNameError').textContent = '';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
    document.getElementById('SeedingJobName').value = '';
    document.getElementById('jobNameError').textContent = '';
  }
});

let jobCount = 0;

const jobContainer = document.getElementById('jobContainer');
const addPlantBtn = document.getElementById('addPlantBtn');
const executeBtn = document.getElementById('executeBtn');

function createJobRow() {
  jobCount++;

  const row = document.createElement('div');
  row.classList.add('job-row');
  row.setAttribute('data-index', jobCount);
  row.innerHTML = `
  <div class="job-header">
      <span class="delete-job" title="Remove this plant job">&#128465;</span>
    </div>
    <div class="plant-row">
      <label for="plant-${jobCount}">Plant Type</label>
      <select id="plant-${jobCount}" class="plantType">
        <option value="">--Choose Plant--</option>
        <option value="Tomato">Tomato</option>
        <option value="Carrot">Carrot</option>
        <option value="Lettuce">Lettuce</option>
      </select>
    </div>
    <div class="coord-row">
      <div>
        <label>X Coordinate</label>
        <input type="number" class="coord-input xCoord" placeholder="0 - 395">
      </div>
      <div>
        <label>Y Coordinate</label>
        <input type="number" class="coord-input yCoord" placeholder="0 - 650">
      </div>
      <div>
        <label>Depth (mm)</label>
        <input type="number" class="coord-input depth" placeholder="> 0">
      </div>
    </div>
    <div class="errorMsg"></div>
  `;

  // Add delete event
  row.querySelector('.delete-job').addEventListener('click', () => {
    row.remove();
  });

  jobContainer.appendChild(row);
}

addPlantBtn.addEventListener('click', () => {
  createJobRow();
});

executeBtn.addEventListener('click', async () => {
  const jobRows = document.querySelectorAll('.job-row');
  const results = [];
  let isValid = true;
  const seenCoordinates = new Set();

  for (const row of jobRows) {
    const plant = row.querySelector('.plantType').value;
    const x = Number(row.querySelector('.xCoord').value);
    const y = Number(row.querySelector('.yCoord').value);
    const depth = Number(row.querySelector('.depth').value);
    const errorMsg = row.querySelector('.errorMsg');
    errorMsg.textContent = '';

    const coordKey = `${x},${y}`;

    if (!plant || isNaN(x) || isNaN(y) || isNaN(depth) ||
        x < 0 || x > 395 || y < 0 || y > 650 || depth <= 0) {
      errorMsg.textContent = 'Please correct the above values.';
      isValid = false;
    } else if (seenCoordinates.has(coordKey)) {
      errorMsg.textContent = 'Duplicate coordinates detected. Please re-enter.';
      isValid = false;
    } else {
      seenCoordinates.add(coordKey);
      results.push(`Plant: ${plant}, X: ${x}, Y: ${y}, Depth: ${depth}mm`);
    }
    results.push(`Plant: ${plant}, X: ${x}, Y: ${y}, Depth: ${depth}mm`);

      try {
        var obj= {
        x: x,
        y: y,
        planttype: plant,
        depth: depth
        };
        await InsertSeedingJob(x, y, plant, depth);
      } catch (error) {
        errorMsg.textContent = 'Failed to save job.';
        console.error(error);
        isValid = false;
      }
    }

    const input = document.getElementById("SeedingJobName").value.trim(); // Get the latest value
    jobNameError.textContent = ''; // Clear old error
    const regex = /^[a-zA-Z0-9 ]*$/;

    if (!regex.test(input)) {
      jobNameError.textContent = 'Special characters are not allowed in the job name.';
      isValid = false;
    }

  if (!isValid) return;

  if (jobCount !== 0 && Array.isArray(results) && results.length > 0) {
    alert("Seeding Jobs Created:\n\n" + results.join("\n"));
  } else {
    alert("Seeding Job Task Empty");
  }
  alert("Seeding Jobs Created:\n\n" + results.join("\n"));
  jobContainer.innerHTML = '';
  jobCount = 0;
  modal.style.display = 'none';
});

async function InsertSeedingJob(x, y, plant, depth) {
  const response = await fetch('/api/insertjob/Seeding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ x, y, planttype: plant, depth })
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  console.log(result.message);
}

seedingJobBtn.addEventListener('click', () => {
  jobContainer.innerHTML = '';
  jobCount = 0;
  createJobRow(); // Add first row by default
  modal.style.display = 'block';
});

// Draw grid lines for visual reference
function drawGrid() {
  ctx.strokeStyle = '#ddd';
  ctx.linewidth = 1;

  for (let x = 0; x <= canvasWidth; x += majorTickX) {
    ctx.beginPath();
    ctx.moveTo(coordToPixel(x, 0).x, 0);
    ctx.lineTo(coordToPixel(x, 0).x, canvasHeight);
    ctx.stroke();
  }

  for (let y = 0; y <= canvasHeight; y += majorTickY) {
    ctx.beginPath();
    ctx.moveTo(0, coordToPixel(0, y).y);
    ctx.lineTo(canvasWidth, coordToPixel(0, y).y);
    ctx.stroke();
  }

  drawAxesAndLabels();
  for (const plant in plants) {
    drawPlant(plants[plant]);
  }
}

function drawAxesAndLabels() {
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;

  // Draw X-axis
  ctx.beginPath();
  ctx.moveTo(0,canvasHeight);
  ctx.lineTo(canvasWidth, canvasHeight);
  ctx.stroke();

  // Draw Y-axis
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, canvasHeight);
  ctx.stroke();

  ctx.fillStyle = '#000';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // X-axis labels
  for (let x = 0; x <= coordWidth; x += majorTickX) {
    const px = (x / coordWidth) * canvasWidth;
    ctx.beginPath();
    ctx.moveTo(px, canvasHeight - 5);
    ctx.lineTo(px, canvasHeight);
    ctx.stroke();
    ctx.fillText(x.toString(), px, canvasHeight + 2);
  }

  // Y-axis labels
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let y = 0; y <= coordHeight; y += majorTickY) {
    const py = (y / coordHeight) * canvasHeight;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(5, py);
    ctx.stroke();
    ctx.fillText((coordHeight - y).toString(), -5, py);
  }

  // Axis titles
  ctx.textAlign = 'right';
  ctx.fillText("Y", 15, 10);
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText("X", canvasWidth - 10, canvasHeight - 5);
}


function clearCanvas() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

// Map pixel to real-world coordinate
function pixelToCoord(x, y) {
  const coordX = Math.round((x / canvasWidth) * coordWidth);
  const coordY = Math.round((y / canvasHeight) * coordHeight);
  return { x: coordX, y: coordY };
}

// Map real-world coordinate to pixel
function coordToPixel(x, y) {
  const px = (x / coordWidth) * canvasWidth;
  const py = (y / coordHeight) * canvasHeight;
  return { x: px, y: py };
}

// Handle hover
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const hoverX = e.clientX - rect.left;
  const hoverY = e.clientY - rect.top;

  //position of the display box for the coordinates
  const coords = pixelToCoord(hoverX, hoverY);
  coordDisplay.style.left = `${e.clientX - 200}px`;
  coordDisplay.style.top = `${e.clientY + 15}px`;
  coordDisplay.textContent = `(${coords.x}, ${coords.y})`;
  coordDisplay.style.display = 'block';
});

//box disappears when mouse leaves the canvas
canvas.addEventListener('mouseleave', () => {
  coordDisplay.style.display = 'none';
});

// Handle extension of status box
statusBox.addEventListener('click', () => {
  isHistoryVisible = !isHistoryVisible;
  statusHistory.classList.toggle('hidden', !isHistoryVisible);
});


//draw plants
function drawPlant(plant) {
  //ctx.save();
  const coord = coordToPixel(plant.x, plant.y);

  if (plant.type == 'salad') {
    ctx.fillStyle = 'green';
    ctx.strokeStyle = 'green';
    ctx.beginPath();
    ctx.arc(coord.x, coord.y, 8, 0, 2 * Math.PI);
    ctx.fill();
  } else if (plant.type == 'raddish') {
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(coord.x, coord.y - 10);
    ctx.lineTo(coord.x - 10, coord.y + 8);
    ctx.lineTo(coord.x + 10, coord.y + 8);
    ctx.closePath();
    ctx.fill();
  }

  //ctx.restore();
}

// Draw robot
let robot = { x: 0, y: 0 };

function drawRobot() {
  const pos = coordToPixel(robot.x, robot.y);
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#4caf50';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.stroke();
}


// Update status box
function updateStatus() {
  fetch('/api/status', {method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    statusBox.textContent = 'Status: ' + data.status;
  })
}

// Update status history
function updateStatusHistory() {
  fetch('/api/notifications', {method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    // Check if the data has changed
    if (dataList.toString() != data.toString()) {
      // Clear the current status history
      while (statusHistory.children.length > 1) {
        statusHistory.removeChild(statusHistory.lastChild);
      }
      // Add new entries to the status history
      for (const status in data) {
        const entry = document.createElement('div');
        entry.textContent = data[status];
        statusHistory.insertBefore(entry, title.nextSibling);
      }
      dataList = data;
      }
    })
  }


// Simulate robot moving
function updateRobot() {
  updateStatus();//change this to actually get status

  //robot.x = Math.floor(Math.random() * coordWidth);
  //robot.y = Math.floor(Math.random() * coordHeight);
  console.log("Update");
  clearCanvas();
  drawGrid();
  //drawRobot();

  updateStatusHistory();

  //just for testing
  setTimeout(() => {
    updateStatus("Idle");
  }, 500);
}

plants.push(new Plant(100, 100, 'salad'));
plants.push(new Plant(200, 200, 'raddish'));

// Initial draw
drawGrid();
//drawRobot();

// Update every 1 second
setInterval(updateRobot, 2500);




