import { token } from "./auth.js";

const modalWatering = document.getElementById('wateringModal');
const closeModalWatering = document.getElementById('closeModalWatering');
const jobNameErrorWatering = document.getElementById('jobNameErrorWatering');
const wateringJobBtn = document.getElementById('wateringJobBtn');
let isEditMode = false;
let editingJobName = '';
const jobContainerWatering = document.getElementById('jobContainerWatering');
let jobCountWatering = 0;
let plants = window.plants || []; // Ensure plants is initialized
const scheduleFields = document.getElementById("scheduleFields");
const scheduleRadios = document.querySelectorAll('input[name="scheduleOption"]');
scheduleRadios.item(1).checked = true; // Default to "Not Scheduled""
const viewJobsModalWatering = document.getElementById('viewJobsModalWatering');
const addPlantBtnWatering = document.getElementById('addPlantBtnWatering');
const viewJobsBtnWatering = document.getElementById('viewWateringJobsBtn');
const jobsListWatering = document.getElementById('jobsListWatering');
const jobCountDisplayWatering = document.getElementById('jobCountDisplayWatering');
const executeBtnWatering = document.getElementById('executeBtnWatering');
const closeViewJobsModalWatering = document.getElementById('closeViewJobsModalWatering');



function createJobRowWatering(jobData = null) {
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
    option.value = { plant: plant }; // value is the plant
    option.textContent = `${plant.type} at X: ${plant.x}, Y: ${plant.y}`;
    option.dataset.x = plant.x;
    option.dataset.y = plant.y;
    option.dataset.type = plant.type;

    // Preselect if matching
    if (jobData && jobData.plant.xcoordinate == plant.x && jobData.plant.ycoordinate == plant.y) {
      option.selected = true;
    }


    select.appendChild(option);
  });

  // Pre-fill other fields if jobData exists
  if (jobData) {
    row.querySelector('.watering.amount').value = jobData.amount || '';
    row.querySelector('.coord-input.zCoord').value = jobData.yCoordinate || '';
  }
  jobContainerWatering.appendChild(row);
}


addPlantBtnWatering.addEventListener('click', () => {
  createJobRowWatering();
});

wateringJobBtn.addEventListener('click', async () => {
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
  createJobRowWatering(); // Add first row by default
});


closeModalWatering.addEventListener('click', () => {
  modalWatering.style.display = 'none';
  document.getElementById('WateringJobName').value = '';
  document.getElementById('jobNameErrorWatering').textContent = '';
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
      if (!plant || isNaN(z) || isNaN(watering) || z < 5 || z > 100 || watering < 2 || watering > 200) {
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
        plantstobewatered.push({ plant: { planttype: type, xcoordinate: Number(x), ycoordinate: Number(y) }, wateringheight: z, wateringcapacity: watering });
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
  if (jobname === '') {
    jobNameErrorWatering.textContent = 'Please fill the Jobname';
    isValid = false;
  }

  const scheduleOption = document.querySelector('input[name="scheduleOption"]:checked').value;

  const scheduleData = {
    enabled: scheduleOption === "scheduled",
    next_execution_time: Number.MAX_SAFE_INTEGER,
    interval: Number.MAX_SAFE_INTEGER
  };
  let is_scheduled = false;
  if (scheduleOption === "scheduled") {
    is_scheduled = true;
    const executionTime = document.getElementById("executionTime").value;
    const repeatInterval = document.getElementById("repeatInterval").value;
    scheduleData.next_execution_time = new Date(executionTime).getTime();
    console.log(scheduleData.next_execution_time);
    scheduleData.interval = Number(repeatInterval) * 3600000; // convert hours to milliseconds
    if (!scheduleData.next_execution_time || !scheduleData.interval || isNaN(scheduleData.interval)) {
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


  const payload = { jobname, plantstobewatered, is_scheduled, scheduleData };

  try {
    if (isEditMode) {
      // 🔁 UPDATE mode
      const response = await fetch('/api/jobs/Watering', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, token })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update job.");
      alert("Watering Job Updated ✅");
    } else {
      // ➕ CREATE mode
      const response = await fetch('/api/jobs/Watering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, token })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create job.");
      alert("Watering Job Created ✅");
    }

    modalWatering.style.display = 'none';
    jobContainerWatering.innerHTML = '';
    document.getElementById("WateringJobName").value = '';
    jobCountWatering = 0;

  } catch (err) {
    console.error(err);
    alert("❌ Error: " + err.message);
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
        xcoordinate: seed.plant.xcoordinate,
        ycoordinate: seed.plant.ycoordinate,
        type: seed.plant.planttype
      },
      amount: seed.wateringcapacity,
      yCoordinate: seed.wateringheight
    };
    createJobRowWatering(plants, jobData);
  });

  // Fill in schedule
  if (job?.is_scheduled) {
    scheduleRadios.item(0).checked = true;
    scheduleFields.style.display = "flex";
    let execution_date = new Date(job.ScheduleData.next_execution_time);
    // convert to local-time
    execution_date.setMinutes(execution_date.getMinutes() - execution_date.getTimezoneOffset());
    document.getElementById("executionTime").value = execution_date.toISOString().slice(0, 16) || '';
    // convert from millisceonds to hours
    document.getElementById("repeatInterval").value = job.ScheduleData.interval / 3600000 || '';
  } else {
    scheduleRadios.item(1).checked = true;
    scheduleFields.style.display = "none";
  }
}

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
  <div>Plants: ${job.plantstobewatered?.length || 0}</div>
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
                body: JSON.stringify({ token })
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
        jobDiv.querySelector('.execute-job-btn').addEventListener('click', async () => {
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
    jobsListWatering.innerHTML = '<p>Error loading jobs.</p>';
    console.error(err);
  }
});


closeViewJobsModalWatering.addEventListener('click', () => {
  viewJobsModalWatering.style.display = 'none';
});


window.addEventListener('click', (e) => {
  if (e.target === viewJobsModalWatering) {
    viewJobsModalWatering.style.display = 'none';
  }
});