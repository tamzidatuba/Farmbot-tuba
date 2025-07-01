import { token } from "./auth.js";

// Seeding Job Management
let jobCount = 0;
const seedingJobBtn = document.getElementById('seedingJobBtn');
const jobContainer = document.getElementById('jobContainer');
const modal = document.getElementById('seedingModal');
const addPlantBtn = document.getElementById('addPlantBtn');
const executeBtn = document.getElementById('executeBtn');
const jobNameError = document.getElementById('jobNameError');
let isEditMode = false;
const closeModal = document.getElementById('closeModal');
const viewJobsModal = document.getElementById('viewJobsModal');
let jobBeingEdited = null;
const viewJobsBtn = document.getElementById('viewSeedingJobsBtn');
const jobsList = document.getElementById('jobsList');
const jobCountDisplay = document.getElementById('jobCountDisplay');
const closeViewJobsModal = document.getElementById('closeViewJobsModal');



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

seedingJobBtn.addEventListener('click', () => {
  jobContainer.innerHTML = '';
  jobCount = 0;
  createJobRow(); // Add first row by default
  modal.style.display = 'block';
});

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
      const plant = row.querySelector('.plantType').value.toLowerCase();
      const x = Number(row.querySelector('.xCoord').value);
      const y = Number(row.querySelector('.yCoord').value);
      const depth = Number(row.querySelector('.depth').value);
      const errorMsg = row.querySelector('.errorMsg');
      errorMsg.textContent = '';

      const coordKey = `${x},${y}`;

      if (x == '' || y == '') {
        errorMsg.textContent = 'Please fill the above values.';
        isValid = false;
      }
      if (!plant || isNaN(x) || isNaN(y) || x < 0 || x > 395 || y < 0 || y > 650) {
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
  if (jobname === '') {
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

  try {
    if (isEditMode) {
      // 🔁 UPDATE mode
      const response = await fetch('/api/jobs/Seeding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, token })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update job.");
      alert("Seeding Job Updated ✅");
    } else {
      // ➕ CREATE mode
      const response = await fetch('/api/jobs/Seeding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, token })
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
    const depth = p.depth;
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
                body: JSON.stringify({ token })
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

              const res = await fetch(`/api/jobs/queue/${encodeURIComponent(job.jobname)}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
              });

              // Check if response is JSON
              const contentType = res.headers.get("content-type");
              let message = "Unknown server response";

              if (contentType && contentType.includes("application/json")) {
                const result = await res.json();

                if (res.ok) {
                  message = `✅ ${result.message || "Job queued successfully"}`;
                } else {
                  message = `❌ ${result.error || result.message || "Job queueing failed"}`;
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