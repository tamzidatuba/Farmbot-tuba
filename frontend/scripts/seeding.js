import { token } from "./auth.js";
import { setLanguage } from "./translation.js";
import { getTranslation } from "./translation.js";

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
  setLanguage(document.documentElement.lang); // Set correct language
}

seedingJobBtn.addEventListener('click', () => {
  // Reset to creation mode
  isEditMode = false;
  jobBeingEdited = null;

  document.getElementById('modalTitle').textContent = getTranslation("seedingJob");
  document.getElementById('executeBtn').textContent = getTranslation("createAndSave");
  document.getElementById('SeedingJobName').value = '';
  document.getElementById('SeedingJobName').disabled = false;

  jobContainer.innerHTML = '';
  jobCount = 0;
  createJobRow(); // Add one row by default
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
        errorMsg.textContent = getTranslation("fillValues");
        isValid = false;
      }
      if (!plant || isNaN(x) || isNaN(y) || x < 0 || x > 395 || y < 0 || y > 650) {
        errorMsg.textContent = getTranslation("correctValues");
        isValid = false;
      } else if (seenCoordinates.has(coordKey)) {
        errorMsg.textContent = getTranslation("duplicates");
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
    jobNameError.textContent = getTranslation("specialChars");
    isValid = false;
  }
  if (jobname === '') {
    jobNameError.textContent = getTranslation("fillJobname");
    isValid = false;
  }

  if (!isValid) {
    console.warn(getTranslation("formValidation"));
    return;
  }
  if (seeds.length === 0) {
    alert(getTranslation("noPlant"));
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
      if (!response.ok) throw new Error(data.error || getTranslation("updateFail"));
      alert(getTranslation("seedingUpdated"));
    } else {
      // ➕ CREATE mode
      const response = await fetch('/api/jobs/Seeding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, token })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || getTranslation("createFail"));
      alert(getTranslation("seedingcreated"));
    }

    modal.style.display = 'none';
    jobContainer.innerHTML = '';
    document.getElementById("SeedingJobName").value = '';
    jobCount = 0;

  } catch (err) {
    console.error(err);
    alert(getTranslation("error") + err.message);
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

  // Update modal heading and button
  document.getElementById('modalTitle').textContent = getTranslation("modifyJob");
  document.getElementById('executeBtn').textContent = getTranslation("updateJob");

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
  jobsList.innerHTML = getTranslation("loadingJobs");;
  jobCountDisplay.textContent = '';
  viewJobsModal.style.display = 'block';

  try {
    const response = await fetch('/api/jobs/Seeding');
    const jobs = await response.json();

    jobCountDisplay.textContent = `✅ You have created ${jobs.length} seeding job${jobs.length !== 1 ? 's' : ''}.`;

    if (jobs.length === 0) {
      jobsList.innerHTML = getTranslation("notFound");
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
                alert(getTranslation("jobDeleted"));
                viewJobsBtn.click();
              } else {
                const errorText = await res.text();
                throw new Error(getTranslation("nonJSON") + errorText);
              }
            } catch (err) {
              console.error(err);
              alert(getTranslation("error") + err.message);
            }

          }
        });

        // optional placeholder for future Execute
        jobDiv.querySelector('.execute-job-btnseed').addEventListener('click', async () => {
          if (confirm(getTranslation("executeConfirm") + "${job.jobname} ?")) {
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
              alert(getTranslation("networkError"));
            }
          }
        });


      });
    }
  } catch (err) {
    jobsList.innerHTML = getTranslation("loadingError");
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

  document.getElementById('modalTitle').textContent = getTranslation("seedingJob");
  document.getElementById('executeBtn').textContent = getTranslation("createAndSave");
  document.getElementById('SeedingJobName').value = '';
  document.getElementById('SeedingJobName').disabled = false;

  jobContainer.innerHTML = '';
  jobCount = 0;
  createJobRow(); // Add one row by default
  modal.style.display = 'block';
});