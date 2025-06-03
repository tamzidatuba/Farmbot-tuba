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

// List to compare history with data base
var historyList = [];

// List to compare plants with data base
var plantsList = [];

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

let isEditMode = false;
let jobBeingEdited = null;
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
  <div class="plant-row">
    <div class="plant-row-header">
      <label for="plant-${jobCount}">Plant Type</label>
      <span class="delete-job" title="Remove this plant job">&#128465;</span>
    </div>
    <select id="plant-${jobCount}" class="plantType">
      <option value="">--Choose Plant--</option>
      <option value="Tomato">Tomato</option>
      <option value="Radish">Radish</option>
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
const plantSelect = row.querySelector('.plantType');
const depthInput = row.querySelector('.depth');

// Set depth and disable field based on selected plant
function setDepthFromPlant(type) {
  switch (type.toLowerCase()) {
    case 'tomato':
      depthInput.value = 6;
      break;
    case 'lettuce':
      depthInput.value = 3;
      break;
    case 'radish':
      depthInput.value = 10;
      break;
    default:
      depthInput.value = '';
      break;
  }
}

// Set up listener to update depth
plantSelect.addEventListener('change', () => {
  setDepthFromPlant(plantSelect.value);
});

// Disable user editing
depthInput.disabled = true;




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

  const seeds = [];

  for (const row of jobRows) {
    const plant = row.querySelector('.plantType').value;
    const x = Number(row.querySelector('.xCoord').value);
    const y = Number(row.querySelector('.yCoord').value);
    const depth = Number(row.querySelector('.depth').value);
    const errorMsg = row.querySelector('.errorMsg');
    errorMsg.textContent = '';

    const coordKey = `${x},${y}`;

    if (!plant || isNaN(x) || isNaN(y) || x < 0 || x > 395 || y < 0 || y > 650 ) {
      errorMsg.textContent = 'Please correct the above values.';
      isValid = false;
    } else if (seenCoordinates.has(coordKey)) {
      errorMsg.textContent = 'Duplicate coordinates detected. Please re-enter.';
      isValid = false;
    } else {
      seenCoordinates.add(coordKey);
      seeds.push({ planttype: plant, x, y, depth });
      results.push(`Plant: ${plant}, X: ${x}, Y: ${y}, Depth: ${depth}mm`);
    }
  }

  const jobname = document.getElementById("SeedingJobName").value.trim();
  jobNameError.textContent = '';
  const regex = /^[a-zA-Z0-9 ]*$/;

  if (!regex.test(jobname)) {
    jobNameError.textContent = 'Special characters are not allowed in the job name.';
    isValid = false;
  }
  if(jobname===''){
    jobNameError.textContent = 'Please fill the Jobname';
    isValid = false;
  }

  if (!isValid) return;
  console.warn("🚫 Form validation failed. Not sending job.");

  if (seeds.length === 0) {
    alert("❌ Please add at least one plant before creating a job.");
    return;
  }

  const payload = { jobname, seeds };

  try {
    if (isEditMode) {
      // 🔁 UPDATE mode
      const response = await fetch('/api/updatejob/Seeding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update job.");
      alert("Seeding Job Updated ✅");
    } else {
      // ➕ CREATE mode
      const response = await fetch('/api/insertjob/Seeding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create job.");
      alert("Seeding Job Created ✅");
    }

    modal.style.display = 'none';
    jobContainer.innerHTML = '';
    document.getElementById("SeedingJobName").value = '';
    jobCount = 0;

  } catch (err) {
    console.error(err);
    alert("❌ Error: " + err.message);
  }
});


const viewJobsBtn = document.getElementById('viewJobsBtn');
const viewJobsModal = document.getElementById('viewJobsModal');
const closeViewJobsModal = document.getElementById('closeViewJobsModal');
const jobsList = document.getElementById('jobsList');
const jobCountDisplay = document.getElementById('jobCountDisplay'); 

function capitalizeFirstLetter(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
}

function editJob(job) {
  viewJobsModal.style.display = 'none';
  setTimeout(() => {
    modal.style.display = 'block';
  }, 200);

  isEditMode = true;
  jobBeingEdited = job.jobname;

  // Update modal heading and button
  document.getElementById('modalTitle').textContent = 'Modify Seeding Job';
  document.getElementById('executeBtn').textContent = 'Update Job';

  // Disable editing job name
  const jobNameInput = document.getElementById('SeedingJobName');
  jobNameInput.value = job.jobname;
  jobNameInput.disabled = true;

  // Clear old plant rows
  jobContainer.innerHTML = '';
  jobCount = 0;

  // Add rows from the existing job data
  job.seeds.forEach(p => {
    createJobRow(); // creates empty row
    const row = jobContainer.lastChild;
  
    const seedtype = p.seedtype; // fallback
    const x = p.xcoordinate;
    const y = p.ycoordinate;
    const depth = p.depth ;
  
    row.querySelector('.plantType').value = capitalizeFirstLetter(seedtype);
    row.querySelector('.xCoord').value = x;
    row.querySelector('.yCoord').value = y;
    row.querySelector('.depth').value = depth;
  });
  

  modal.style.display = 'block';
}
//VIEW JOBS BUTTON LOGIC
viewJobsBtn.addEventListener('click', async () => {
  jobsList.innerHTML = '<p>Loading jobs...</p>';
  jobCountDisplay.textContent = '';
  viewJobsModal.style.display = 'block';

  try {
    const response = await fetch('/api/getjobs/Seeding');
    const jobs = await response.json();

    jobCountDisplay.textContent = `✅ You have created ${jobs.length} seeding job${jobs.length !== 1 ? 's' : ''}.`;

    if (jobs.length === 0) {
      jobsList.innerHTML = '<p>No jobs found.</p>';
    } else {
      jobsList.innerHTML = '';
      jobs.forEach((job, index) => {
        const jobDiv = document.createElement('div');
        jobDiv.className = 'job-row';
        jobDiv.innerHTML = `
  <div class="job-header-row">
    <strong>${job.jobname}</strong>
    <div class="icon-actions">
      <span class="icon-btn edit-job-btn" title="Edit" data-index="${index}">✏️</span>
      <span class="icon-btn delete-job-btn" title="Delete" data-index="${index}">🗑️</span>
    </div>
  </div>
  <div>Plants: ${job.seeds?.length || 0}</div>
  <button class="execute-job-btn">🚜 Execute</button>
`;


        jobsList.appendChild(jobDiv);

        // edit logic
    jobDiv.querySelector('.edit-job-btn').addEventListener('click', () => {
      editJob(job);
      });

      // new delete logic
    jobDiv.querySelector('.delete-job-btn').addEventListener('click', async () => {
      if (confirm(`Are you sure you want to delete job "${job.jobname}"?`)) {
    try {
      const res = await fetch(`/api/deletejob/Seeding?jobname=${encodeURIComponent(job.jobname)}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to delete job.");
      alert("Job deleted ✅");
      viewJobsBtn.click(); // Refresh list
    } catch (err) {
      console.error(err);
      alert("❌ Could not delete job: " + err.message);
    }
  }
});

// optional placeholder for future Execute
jobDiv.querySelector('.execute-job-btn').addEventListener('click', () => {
  alert("🚜 Execute job feature coming soon!");
});

      });
    }
  } catch (err) {
    jobsList.innerHTML = '<p>Error loading jobs.</p>';
    console.error(err);
  }
});

closeViewJobsModal.addEventListener('click', () => {
  viewJobsModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === viewJobsModal) {
    viewJobsModal.style.display = 'none';
  }
});


//PAUSE BUTTON LOGIC
function updatePauseButtonVisibility() {
  const pauseBtn = document.getElementById('pauseJobBtn');
  const isRunning = window.statusManager?.runningJob;

  if (isRunning) {
    pauseBtn.style.display = 'inline-block'; // show when job is running
  } else {
    pauseBtn.style.display = 'none'; // hide otherwise
  }
}

const pauseBtn = document.getElementById('pauseJobBtn');
const errorMessageBox = document.getElementById('errorMessage');

pauseBtn.addEventListener('click', async () => {
  const isCurrentlyPaused = pauseBtn.textContent.includes('Resume');
  const endpoint = isCurrentlyPaused ? '/api/resumejob' : '/api/pausejob';

  try {
    const res = await fetch(endpoint, { method: 'PUT' });
    const data = await res.json();

    if (res.status === 200) {
      if (data.message && data.message.includes('No job')) {
        showError(data.message); // 👈 Show user-friendly error
      } else {
        pauseBtn.textContent = isCurrentlyPaused ? '⏸ Pause Job' : '▶ Resume Job';
        hideError(); // hide if previously shown
      }
    } else {
      showError(data.error || 'Failed to process the request.');
    }
  } catch (err) {
    console.error(err);
    showError('Network error: ' + err.message);
  }
});

function showError(message) {
  const errorBox = document.getElementById('errorMessage');
  errorBox.textContent = `⚠️ ${message}`;
  errorBox.classList.add('show');

  setTimeout(() => {
    errorBox.classList.remove('show');
  }, 3000);
}





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
  // Reset to creation mode
  isEditMode = false;
  jobBeingEdited = null;

  document.getElementById('modalTitle').textContent = 'Create Seeding Job';
  document.getElementById('executeBtn').textContent = 'Create & Save';
  document.getElementById('SeedingJobName').value = '';
  document.getElementById('SeedingJobName').disabled = false;

  jobContainer.innerHTML = '';
  jobCount = 0;
  createJobRow(); // Add one row by default
  modal.style.display = 'block';
});


// get plants from server
function getPlants() {
  fetch('/api/plants', {method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    if (plantsList.toString() != data.toString()) {
    //if (plants.toString() != data.toString()) {
      plants = [];
      for (const plant of data) {
        plants.push(new Plant(Number(plant.xcoordinate), Number(plant.ycoordinate), plant.planttype));
      }
    }
  })
  .catch(error => console.error('Error fetching plants:', error));
}

//draw plants
function drawPlant(plant) {
  //ctx.save();
  const coord = coordToPixel(plant.x, plant.y);
  if (plant.type == 'lettuce') {
    const img = new Image();
    img.src = './icons/lettuce.png';
    img.onload = () => {
      const size = 50;
      ctx.drawImage(img, coord.x - size / 2, coord.y - size / 2, size, size);
    }
  } else if (plant.type == 'radish') {
    const img = new Image();
    img.src = './icons/radish.png';
    img.onload = () => {
      const size = 50;
      ctx.drawImage(img, coord.x - size / 2, coord.y - size / 2, size, size);
    }
  } else if (plant.type == 'tomato') {
    const img = new Image();
    img.src = './icons/tomato.png';
    img.onload = () => {
      const size = 50;
      ctx.drawImage(img, coord.x - size / 2, coord.y - size / 2, size, size);
    }
  }

  //add the radius
  if (plant.type == 'lettuce') {
    ctx.beginPath();
    ctx.arc(coord.x, coord.y, 30, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (plant.type == 'raddish') {
    ctx.beginPath();
    ctx.arc(coord.x, coord.y, 15, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (plant.type == 'tomato') {
    ctx.beginPath();
    ctx.arc(coord.x, coord.y, 15, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
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
    if (historyList.toString() != data.toString()) {
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
      historyList = data;
      }
    })
  }


// Simulate robot moving
function updateRobot() {
  updateStatus();//change this to actually get status

  //robot.x = Math.floor(Math.random() * coordWidth);
  //robot.y = Math.floor(Math.random() * coordHeight);
  //clearCanvas();
  //drawGrid();
  //drawRobot();

  updateStatusHistory();

  updatePauseButtonVisibility();

  //just for testing
}

//plants.push(new Plant(100, 100, 'lettuce'));
//plants.push(new Plant(200, 200, 'radish'));
//plants.push(new Plant(300, 300, 'tomato'));

// Initial draw
drawGrid();
//drawRobot();
setTimeout (() => {
  clearCanvas();
  drawGrid();
}, 100);
getPlants();

// Update every 1 second
setInterval(updateRobot, 2500);




