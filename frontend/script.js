const toggle = document.getElementById('createTaskToggle');
const viewJobs = document.getElementById('viewJobs');
const subtask = document.getElementById('subtaskContainer');
const subtaskView = document.getElementById('subtaskView');
const arrow = document.getElementById('arrow');
const arrowView = document.getElementById('arrowView');
const modal = document.getElementById('seedingModal');
const modalWatering = document.getElementById('wateringModal');
const closeModal = document.getElementById('closeModal');
const closeModalWatering = document.getElementById('closeModalWatering');
const seedingJobBtn = document.getElementById('seedingJobBtn');
const jobNameError = document.getElementById('jobNameError');
const jobNameErrorWatering = document.getElementById('jobNameErrorWatering');
const wateringJobBtn = document.getElementById('wateringJobBtn');

//const body = document.querySelector("body");
//body.requestFullscreen();

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

var token = "";


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

//Watering Schedule
const scheduleFields = document.getElementById("scheduleFields");
const scheduleRadios = document.querySelectorAll('input[name="scheduleOption"]');
scheduleRadios.item(1).checked = true; // Default to "Not Scheduled""


//farmbot status
const statusBox = document.getElementById('farmbot-status');
const statusHistory = document.getElementById('status-history');
const title = statusHistory.querySelector('.history-header');
let maxHistoryEntries = 10;
const historyBox = document.getElementById('notification-history');
const entryLimitSelect = document.getElementById('entry-limit');
entryLimitSelect.value = maxHistoryEntries;


 window.addEventListener('DOMContentLoaded', () => {
    toggle.style.display = 'none';
    //subtask.style.display='none';
    viewJobs.style.display='none';
  });
 

let isEditMode = false;
let jobBeingEdited = null;
let editingJobName = '';  


viewJobs.addEventListener('click', () => {
  const isVisible = subtaskView.style.display === 'block';
  subtaskView.style.display = isVisible ? 'none' : 'block';
  arrowView.classList.toggle('open', !isVisible);
});

toggle.addEventListener('click', () => {
  const isVisible = subtask.style.display === 'block';
  subtask.style.display = isVisible ? 'none' : 'block';
  arrow.classList.toggle('open', !isVisible);
});

seedingJobBtn.addEventListener('click', () => {
  jobContainer.innerHTML = '';
  jobCount = 0;
  createJobRow(); // Add first row by default
  modal.style.display = 'block';
});

/*seedingJobBtn.addEventListener('click', () => {
  modal.style.display = 'block';
});*/

wateringJobBtn.addEventListener('click',async () => {
  // Reset to creation mode
  isEditMode = false;
  editingJobName = '';
  scheduleRadios.item(1).checked = true;
  scheduleFields.style.display = "none";

  document.getElementById('modalTitleWatering').textContent = 'Create Watering Job';
  document.getElementById('executeBtnWatering').textContent = 'Create & Save';
  document.getElementById('WateringJobName').value = '';
  document.getElementById('WateringJobName').disabled = false;

  jobContainerWatering.innerHTML = '';
  modalWatering.style.display = 'block';
  jobCountWatering = 0;
  createJobRowWatering(plants); // Add first row by default
});

closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
  document.getElementById('SeedingJobName').value = '';
  document.getElementById('jobNameError').textContent = '';
});

closeModalWatering.addEventListener('click', () => {
  modalWatering.style.display = 'none';
  document.getElementById('WateringJobName').value = '';
  document.getElementById('jobNameErrorWatering').textContent = '';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
    document.getElementById('SeedingJobName').value = '';
    document.getElementById('jobNameError').textContent = '';
  }
});

window.addEventListener('click', (e) => {
  if (e.target === modalWatering) {
    modalWatering.style.display = 'none';
    document.getElementById('WateringJobName').value = '';
    document.getElementById('jobNameErrorWatering').textContent = '';
  }
});

// Watering Job Management
scheduleRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    if (document.querySelector('input[name="scheduleOption"]:checked').value === "scheduled") {
      scheduleFields.style.display = "flex";
    } else {
      scheduleFields.style.display = "none";
    }
  });
});


// Watering Job Management
let jobCountWatering = 0;

const jobContainerWatering = document.getElementById('jobContainerWatering');
const addPlantBtnWatering = document.getElementById('addPlantBtnWatering');
const executeBtnWatering = document.getElementById('executeBtnWatering');

function createJobRowWatering(plants, jobData = null) {
  jobCountWatering++;

  const row = document.createElement('div');
  row.classList.add('job-row-watering');
  row.setAttribute('data-index', jobCountWatering);
  row.innerHTML = `
  <div class="plant-row">
    <div class="plant-row-header">
      <label for="plant-${jobCountWatering}">Plant</label>
      <span class="delete-job" title="Remove this plant job">&#128465;</span>
    </div>
    <select id="plant-${jobCountWatering}" class="plant-select"></select>
    </div>
    <div class="coord-row">
      <div>
        <label>Water (mm)</label>
        <input type="number" class="watering amount" placeholder="2-200 ml">
      </div>
      <div>
        <label>Watering height</label>
        <input type="number" class="coord-input zCoord" placeholder="5 - 100">
      </div>
    </div>
    <div class="errorMsg"></div>
  `;

  // Add delete event
  row.querySelector('.delete-job').addEventListener('click', () => {
    row.remove();
  });

  // integrate plant selection
  // default text
  const select = row.querySelector('.plant-select');
  const defaultOption = document.createElement('option');
  defaultOption.value = "";
  defaultOption.textContent = "--Choose Plant--";
  select.appendChild(defaultOption);
  

  // actual plants
  plants.forEach(plant => {
    const option = document.createElement('option');
    option.value = {plant: plant}; // value is the plant
    option.textContent = `${plant.type} at X: ${plant.x}, Y: ${plant.y}`;
    option.dataset.x = plant.x;
    option.dataset.y = plant.y;
    option.dataset.type = plant.type;

    // Preselect if matching
    if (jobData && jobData.plant.xcoordinate === plant.x && jobData.plant.ycoordinate === plant.y) {
      option.selected = true;
    }
    

    select.appendChild(option);
  });

  // Pre-fill other fields if jobData exists
  if (jobData) {
    row.querySelector('.watering.amount').value = jobData.amount || '';
    row.querySelector('.coord-input.yCoord').value = jobData.yCoordinate || '';
  }
  jobContainerWatering.appendChild(row);
}

addPlantBtnWatering.addEventListener('click', () => {
  createJobRowWatering(plants);
});

executeBtnWatering.addEventListener('click', async () => {
  const jobRows = document.querySelectorAll('.job-row-watering');
  const results = [];
  let isValid = true;

  const plantstobewatered = [];
  const seenCoordinates = new Set();

  console.log(jobRows.length);
  for (const row of jobRows) {
    const inputs = row.querySelectorAll('input, select, textarea');
    const hasValue = Array.from(inputs).some(input => input.value.trim() !== '');
    if (hasValue) {
      const plant = row.querySelector('.plant-select');
      const selectedOption = plant.querySelector('option:checked');
      const z = Number(row.querySelector('.zCoord').value);
      const watering = Number(row.querySelector('.watering.amount').value);
      const errorMsg = row.querySelector('.errorMsg');
      const x = selectedOption.dataset.x;
      const y = selectedOption.dataset.y;
      const type = selectedOption.dataset.type;
      errorMsg.textContent = '';
      
      const coordKey = `${x},${y}`;
      
      console.log("Selected Plant:", selectedOption.value);
      console.log("Selected Plant 2:", selectedOption.dataset);
      if (!plant || isNaN(z) || isNaN(watering) || z < 5 || z > 100 || watering < 2 || watering > 200 ) {
        errorMsg.textContent = 'Please correct the above values.';
        isValid = false;
      } else if (seenCoordinates.has(coordKey)) {
        errorMsg.textContent = 'Duplicate coordinates detected. Please re-enter.';
        isValid = false;
      } else if (!selectedOption.value) {
        errorMsg.textContent = 'Please select a plant.';
        isValid = false;
      } else {
        seenCoordinates.add(coordKey);
        plantstobewatered.push({plant:{ planttype: type, xcoordinate: Number(x), ycoordinate: Number(y)}, wateringheight: z, wateringcapacity: watering });
        const newPlant = new Plant(Number(x), Number(y), type);
        results.push(`Plant: ${newPlant}, Z: ${z}, Watering Amount: ${watering}`);
      }
    }
  }

  const jobname = document.getElementById("WateringJobName").value.trim();
  jobNameErrorWatering.textContent = '';
  const regex = /^[a-zA-Z0-9 ]*$/;

  if (!regex.test(jobname)) {
    jobNameErrorWatering.textContent = 'Special characters are not allowed in the job name.';
    isValid = false;
  }
  if(jobname===''){
    jobNameErrorWatering.textContent = 'Please fill the Jobname';
    isValid = false;
  }

  const scheduleOption = document.querySelector('input[name="scheduleOption"]:checked').value;

  const scheduleData = {
    enabled: scheduleOption === "scheduled",
    time: null,
    interval: null
  };
  
  if (scheduleOption === "scheduled") {
    const executionTime = document.getElementById("executionTime").value;
    const repeatInterval = document.getElementById("repeatInterval").value;
    scheduleData.time = executionTime;
    scheduleData.interval = repeatInterval;
    if (!scheduleData.time|| !scheduleData.interval || isNaN(scheduleData.interval)) {
      const errorMsg = document.getElementById("jobScheduleError");
      errorMsg.textContent = 'Please enter a correct schedule.';
      isValid = false;
    }
  }

  if (!isValid) {
    console.warn("🚫 Form validation failed. Not sending job.");
    return;
  }

  if (plantstobewatered.length === 0) {
    alert("❌ Please add at least one plant before creating a job.");
    return;
  }


  const payload = { jobname, plantstobewatered}; // TODO add scheduleData

  try {
    if (isEditMode) {
      // 🔁 UPDATE mode
      const response = await fetch('/api/jobs/Watering', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({payload, token})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update job.");
      alert("Watering Job Updated ✅");
    } else {
      // ➕ CREATE mode
      const response = await fetch('/api/jobs/Watering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({payload, token})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create job.");
      alert("Watering Job Created ✅");
    }

    modalWatering.style.display = 'none';
    jobContainerWatering.innerHTML = '';
    document.getElementById("WateringJobName").value = '';
    jobCount = 0;

  } catch (err) {
    console.error(err);
    alert("❌ Error: " + err.message);
  }
});

// Seeding Job Management
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
  console.log(jobRows.length);
  console.log("Job Rows:", jobRows);
  for (const row of jobRows) {
    const inputs = row.querySelectorAll('input, select, textarea');
    const hasValue = Array.from(inputs).some(input => input.value.trim() !== '');
    if (hasValue) {
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
        seeds.push({ seedtype: plant, xcoordinate: x, ycoordinate: y, depth });
        results.push(`Plant: ${plant}, X: ${x}, Y: ${y}, Depth: ${depth}mm`);
      }
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

  if (!isValid) {
    console.warn("🚫 Form validation failed. Not sending job.");
    return;
  }
  if (seeds.length === 0) {
    alert("❌ Please add at least one plant before creating a job.");
    return;
  }

  const payload = { jobname, seeds };
  console.log("Payload to send:", payload);

  try {
    if (isEditMode) {
      // 🔁 UPDATE mode
      const response = await fetch('/api/jobs/Seeding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({payload, token})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update job.");
      alert("Seeding Job Updated ✅");
    } else {
      // ➕ CREATE mode
      const response = await fetch('/api/jobs/Seeding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({payload, token})
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

const viewJobsBtnWatering = document.getElementById('viewWateringJobsBtn');
const viewJobsModalWatering = document.getElementById('viewJobsModalWatering');
const closeViewJobsModalWatering = document.getElementById('closeViewJobsModalWatering');
const jobsListWatering = document.getElementById('jobsListWatering');
const jobCountDisplayWatering = document.getElementById('jobCountDisplayWatering'); 

//VIEW WATERING JOBS BUTTON LOGIC
viewJobsBtnWatering.addEventListener('click', async () => {
  jobsListWatering.innerHTML = '<p>Loading jobs...</p>';
  jobCountDisplayWatering.textContent = '';
  viewJobsModalWatering.style.display = 'block';

  try {
    const response = await fetch('/api/jobs/Watering');
    const jobs = await response.json();

    jobCountDisplayWatering.textContent = `✅ You have created ${jobs.length} watering job${jobs.length !== 1 ? 's' : ''}.`;

    if (jobs.length === 0) {
      jobsListWatering.innerHTML = '<p>No jobs found.</p>';
    } else {
      jobsListWatering.innerHTML = '';
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


        jobsListWatering.appendChild(jobDiv);

        // edit logic
    jobDiv.querySelector('.edit-job-btn').addEventListener('click', () => {
      editWateringJob(job);
      });

      // new delete logic
    jobDiv.querySelector('.delete-job-btn').addEventListener('click', async () => {
      if (confirm(`Are you sure you want to delete job "${job.jobname}"?`)) {
        try {
          const res = await fetch(`/api/jobs/Watering/${job.jobname}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({token})
          });
        
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            alert("Job deleted ✅");
            viewJobsBtnWatering.click();
          } else {
            const errorText = await res.text();
            throw new Error("Non-JSON response: " + errorText);
          }
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
    jobsListWatering.innerHTML = '<p>Error loading jobs.</p>';
    console.error(err);
  }
});

function editWateringJob(job) {
  viewJobsModalWatering.style.display = 'none';
  setTimeout(() => {
    modalWatering.style.display = 'block';
  }, 200);

  isEditMode = true;
  editingJobName = job.jobname;

  // Clear UI and show modal
  document.getElementById("WateringJobName").value = job.jobname;
  document.getElementById("WateringJobName").disabled = true;
  document.getElementById("jobContainerWatering").innerHTML = '';
  modalWatering.style.display = 'block';

  document.getElementById('executeBtnWatering').textContent = 'Update Job';

  // Fill in plant rows
  job.plantstobewatered.forEach(seed => {
    const jobData = {
      plant: {
        xcoordinate: seed.xcoordinate,
        ycoordinate: seed.ycoordinate,
        type: seed.planttype
      },
      amount: seed.wateringcapacity,
      yCoordinate: seed.wateringheight
    };
    createJobRowWatering(plants, jobData);
  });

  // Fill in schedule
  if (job.scheduleData?.enabled) {
    scheduleRadios.item(0).checked = true;
    document.getElementById("executionTime").value = job.scheduleData.time || '';
    document.getElementById("repeatInterval").value = job.scheduleData.interval || '';
  } else {
    scheduleRadios.item(1).checked = true;
  }
}

closeViewJobsModalWatering.addEventListener('click', () => {
  viewJobsModalWatering.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === viewJobsModalWatering) {
    viewJobsModalWatering.style.display = 'none';
  }
});



const viewJobsBtn = document.getElementById('viewSeedingJobsBtn');
const viewJobsModal = document.getElementById('viewJobsModal');
const closeViewJobsModal = document.getElementById('closeViewJobsModal');
const jobsList = document.getElementById('jobsList');
const jobCountDisplay = document.getElementById('jobCountDisplay'); 

function capitalizeFirstLetter(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
}

function editSeedingJob(job) {
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
    const response = await fetch('/api/jobs/Seeding');
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
  <button class="execute-job-btnseed">🚜 Execute</button>
`;


        jobsList.appendChild(jobDiv);

        // edit logic
    jobDiv.querySelector('.edit-job-btn').addEventListener('click', () => {
      editSeedingJob(job);
      });
      // new delete logic
    jobDiv.querySelector('.delete-job-btn').addEventListener('click', async () => {
      if (confirm(`Are you sure you want to delete job "${job.jobname}"?`)) {
        try {
          const res = await fetch(`/api/jobs/Seeding/${job.jobname}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({token})
          });
        
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            alert("Job deleted ✅");
            viewJobsBtn.click();
          } else {
            const errorText = await res.text();
            throw new Error("Non-JSON response: " + errorText);
          }
        } catch (err) {
          console.error(err);
          alert("❌ Could not delete job: " + err.message);
        }
        
  }
});

// optional placeholder for future Execute
jobDiv.querySelector('.execute-job-btnseed').addEventListener('click', async () => {
  if (confirm(`Are you sure you want to execute job "${job.jobname}"?`)) {
    try {
      
      const res = await fetch(`/api/jobs/execute/${encodeURIComponent(job.jobname)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({token})
      });

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      let message = "Unknown server response";

      if (contentType && contentType.includes("application/json")) {
        const result = await res.json();

        if (res.ok) {
          message = `✅ ${result.message || "Job executed successfully"}`;
        } else {
          message = `❌ ${result.error || result.message || "Job execution failed"}`;
        }
      } else {
        const text = await res.text();
        message = `❌ Unexpected server response: ${text}`;
      }

      alert(message);
    } catch (err) {
      console.error("Execution failed:", err);
      alert("❌ Could not execute job due to a network or system error.");
    }
  }
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


const pauseBtn = document.getElementById('pauseJobBtn');
const errorMessageBox = document.getElementById('errorMessage');

pauseBtn.addEventListener('click', async () => {
  const isCurrentlyPaused = pauseBtn.textContent.includes('▶');
  const endpoint = isCurrentlyPaused ? '/api/jobs/resume' : '/api/jobs/pause';

  try {
    const res = await fetch(endpoint, { method: 'PUT' });
    const data = await res.json();

    if (res.status === 200) {
      if (data.message && data.message.includes('No job')) {
        showError(data.message); // 👈 Show user-friendly error
      } else {
        pauseBtn.textContent = isCurrentlyPaused ? '⏸' : '▶';
        //hideError(); // hide if previously shown
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
async function getPlants() {
  await fetch('/api/plants', {method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    if (plants.toString() != data.toString()) {
    //if (plants.toString() != data.toString()) {
      plants = [];
      console.log("Plants fetched from server:", data);
      for (const plant of data) {
        plants.push(new Plant(Number(plant.xcoordinate), Number(plant.ycoordinate), plant.planttype));
      }
      //console.log(plants);
    }
  })
  .catch(error => console.error('Error fetching plants:', error));
}

//draw plants
function drawPlant(plant) {
  //ctx.save();
  const img = new Image();
  const coord = coordToPixel(plant.x, plant.y);
  switch (plant.type) {
    case "lettuce":
      img.src = './icons/lettuce.png';
      drawRadius(coord, 15);
      break;
    case "radish":
      img.src = './icons/radish.png';
      drawRadius(coord, 2);
      break;
    case "tomato":
      img.src = './icons/tomato.png';
      drawRadius(coord, 30);
      break;
  }
  img.onload = () => {
    const size = 50;
    ctx.drawImage(img, coord.x - size / 2, coord.y - size / 2, size, size);
  }

} 
// Draws the radius
function drawRadius(coord, radius) {
  ctx.beginPath();
  ctx.arc(coord.x, coord.y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgb(10, 120, 210)'//'rgba(255, 0, 0, 0.5)';
  ctx.lineWidth = 3;
  ctx.stroke()
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
  ctx.strokeStyle = 'rgb(102, 68, 40)'//'#ddd';
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


// button for max history entries
entryLimitSelect.addEventListener('change', () => {
  if (maxHistoryEntries < parseInt(entryLimitSelect.value)) {
    maxHistoryEntries = parseInt(entryLimitSelect.value);
    // Clear the current status history
    while (statusHistory.children.length > 1) {
      statusHistory.removeChild(statusHistory.lastChild);
    }
    // Add new entries to the status history
    for (const status in historyList) {  
      if (statusHistory.children.length < maxHistoryEntries + 1) {
        const entry = document.createElement('div');
        entry.textContent = historyList[status];
        statusHistory.appendChild(entry);
      }
    }
  } else {
    maxHistoryEntries = parseInt(entryLimitSelect.value);
    while (statusHistory.children.length > 1) {
      statusHistory.removeChild(statusHistory.lastChild);
    }
    // Add new entries to the status history
    for (const status in historyList) {  
      if (statusHistory.children.length < maxHistoryEntries + 1) {
        const entry = document.createElement('div');
        entry.textContent = historyList[status];
        statusHistory.appendChild(entry);
      }
    }
  }
  
});


// Update robot status, notifications and execution
function updateRobot() {
  //updateStatus();//change this to actually get status
  fetch('/api/frontendData', {method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    // Update robot Status
    statusBox.textContent = 'Status: ' + data.status;
    // Update Status History
    var temp = historyList.slice().reverse();
    if (temp.toString() != data.notifications.toString()) {
      // Clear the current status history
      while (statusHistory.children.length > 1) {
        statusHistory.removeChild(statusHistory.lastChild);
      }
      // Add new entries to the status history
      for (const status in data.notifications.reverse()) {  
        if (statusHistory.children.length < maxHistoryEntries + 1) {
          const entry = document.createElement('div');
          entry.textContent = data.notifications[status];
          statusHistory.appendChild(entry);
        }
      }
      historyList = data.notifications;
    }
    // Update Pause Button visibility
    const pauseBtn = document.getElementById('pauseJobBtn');
    pauseBtn.style.display = data.status === 'Ready' || data.status === 'Offline' ? 'none' : 'inline-block';

    // Update button text depending on paused state
    pauseBtn.textContent = data.paused ? '▶' : '⏸';

    //Update plants
    if (plants.toString() != data.plants.toString()) {
    //if (plants.toString() != data.toString()) {
      plants = [];
      console.log("Plants fetched from server:", data);
      for (const plant of data.plants) {
        plants.push(new Plant(Number(plant.xcoordinate), Number(plant.ycoordinate), plant.planttype));
      }
      //console.log(plants);
    }
    })
    .catch(err => {
      console.error("Failed to fetch frontend data:", err);
      pauseBtn.style.display = 'none'; // hide on error
    });
    //ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    //drawGrid();
  }

  
// Initial draw
getPlants();
drawGrid();
//drawRobot();
setTimeout (() => {
  clearCanvas();
  drawGrid();
}, 100);

// Update every 1 second
setInterval(updateRobot, 2500);

//for login and logout
const settingsBtn = document.querySelector('.settings-btn');
const logoutBtn = document.getElementById('logoutBtn');
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeLoginModal = document.getElementById('closeLoginModal');
 const farmbotMenu = document.getElementById('farmbotMenu');



//login features
let isLoggedIn = false;

   window.addEventListener('DOMContentLoaded', () => {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'none';
  });

    
  settingsBtn.addEventListener('click', () => {
    if (isLoggedIn) {
      loginBtn.style.display = 'none';
      logoutBtn.style.display = logoutBtn.style.display === 'block' ? 'none' : 'block';
    } else {
      logoutBtn.style.display = 'none';
      loginBtn.style.display = loginBtn.style.display === 'block' ? 'none' : 'block';
    }
  });

loginBtn.addEventListener('click', () => {
  loginModal.style.display = 'block';
});
logoutBtn.addEventListener('click', () => {
    isLoggedIn = false;
    logoutBtn.style.display = 'none';
    loginBtn.style.display = 'block';
    alert('Successfully Logged Out');
    farmbotMenu.textContent = 'Farmbot Menu ';
    toggle.style.display = 'none';
    subtask.style.display='none';
    viewJobs.style.display='none';
    subtaskView.style.display='none';
    fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "token": token
      })
    });
    token = "";
  });

closeLoginModal.addEventListener('click', () => {
  loginModal.style.display = 'none';
});



const form = document.getElementById('loginForm');

form.addEventListener('submit', async function(e) {
  e.preventDefault(); // Prevent default form submission

  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const usernameError = document.getElementById('usernameError');
  const passwordError = document.getElementById('passwordError');



  // Send to API
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value.trim(),
        password: password.value.trim()
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Success - Login passed
      alert('Login successful!');
      isLoggedIn = true;

      if (loginModal) loginModal.style.display = 'none';
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-block';
      if (farmbotMenu) farmbotMenu.textContent = 'Farmbot Menu Admin';
      toggle.style.display = 'flex';
      //subtask.style.display='none';
      viewJobs.style.display='flex';
      //viewJobsBtn.style.display='block';
      
      token = data.token;
  
    } else {
      // API rejected credentials
      if (data.message?.toLowerCase().includes('username')) {
        usernameError.textContent = data.message;
      } else if (data.message?.toLowerCase().includes('password')) {
        passwordError.textContent = data.message;
      } else {
        alert(data.message || 'Invalid login. Please try again.');
      }
    }
  } catch (error) {
    console.error('Error logging in:', error);
    alert('Server error. Please try again later.');
  }
});


// Optional: Close on background click
window.addEventListener('click', (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = 'none';
  }
});
//end of login and logout feature


