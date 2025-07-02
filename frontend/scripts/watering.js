import { token } from "./auth.js";
import { getTranslation } from "./translation.js";
import { setLanguage } from "./translation.js";
import { Plant } from "../script.js";

const modalWatering = document.getElementById('wateringModal');
const closeModalWatering = document.getElementById('closeModalWatering');
const jobNameErrorWatering = document.getElementById('jobNameErrorWatering');
const wateringJobBtn = document.getElementById('wateringJobBtn');
let isEditMode = false;
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
      <label for="plant-${jobCountWatering}" data-i18n="plantRowHeader">Plant</label>
      <span class="delete-job" data-i18n-title="removePlant" title="Remove this plant job">&#128465;</span>
    </div>
    <select id="plant-${jobCountWatering}" class="plant-select"></select>
    </div>
    <div class="coord-row">
      <div>
        <label data-i18n="water">Water (mm)</label>
        <input type="number" class="watering amount" placeholder="2-200 ml">
      </div>
      <div>
        <label data-i18n="height">Watering height</label>
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
  defaultOption.dataset.i18n = "selectDefault";
  defaultOption.textContent = "--Choose Plant--";
  select.appendChild(defaultOption);


  // actual plants
  window.plants.forEach(plant => {
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
  setLanguage(document.documentElement.lang);
}


addPlantBtnWatering.addEventListener('click', () => {
  createJobRowWatering();
});

wateringJobBtn.addEventListener('click', async () => {
  // Reset to creation mode
  isEditMode = false;
  scheduleRadios.item(1).checked = true;
  scheduleFields.style.display = "none";

  document.getElementById('modalTitleWatering').textContent = getTranslation('wateringJob');
  document.getElementById('executeBtnWatering').textContent = getTranslation('createAndSave');
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
        errorMsg.textContent = getTranslation("fillValues");
        isValid = false;
      } else if (seenCoordinates.has(coordKey)) {
        errorMsg.textContent = getTranslation("duplicates");
        isValid = false;
      } else if (!selectedOption.value) {
        errorMsg.textContent = getTranslation("selectPlant");
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
    jobNameErrorWatering.textContent = getTranslation("specialChars");
    isValid = false;
  }
  if (jobname === '') {
    jobNameErrorWatering.textContent = getTranslation("fillJobname");
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
      errorMsg.textContent = getTranslation("correctSchedule");
      isValid = false;
    }
  }

  if (!isValid) {
    console.warn(getTranslation("formValidation"));
    return;
  }

  if (plantstobewatered.length === 0) {
    alert(getTranslation("noPlant"));
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
      if (!response.ok) throw new Error(data.error || getTranslation("updateFail"));
      alert(getTranslation("wateringUpdated"));
    } else {
      // ➕ CREATE mode
      const response = await fetch('/api/jobs/Watering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, token })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || getTranslation("createFail"));
      alert(getTranslation("wateringcreated"));
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

  // Clear UI and show modal
  document.getElementById("WateringJobName").value = job.jobname;
  document.getElementById("WateringJobName").disabled = true;
  document.getElementById("jobContainerWatering").innerHTML = '';
  modalWatering.style.display = 'block';

  document.getElementById('executeBtnWatering').textContent = getTranslation('updateJob');

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
    createJobRowWatering(jobData);
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
  jobsListWatering.innerHTML =getTranslation('loadingJobs');
  jobCountDisplayWatering.textContent = '';
  viewJobsModalWatering.style.display = 'block';

  try {
    const response = await fetch('/api/jobs/Watering');
    const jobs = await response.json();

    jobCountDisplayWatering.textContent = `✅ You have created ${jobs.length} watering job${jobs.length !== 1 ? 's' : ''}.`;

    if (jobs.length === 0) {
      jobsListWatering.innerHTML = getTranslation('notFound');
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
          if (confirm(getTranslation("deleteConfirm") +  `${job.jobname}`)) {
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
                alert(getTranslation("jobDeleted"));
                viewJobsBtnWatering.click();
              } else {
                const errorText = await res.text();
                throw new Error("Non JSON response: " + errorText);
              }
            } catch (err) {
              console.error(err);
              alert(getTranslation("deleteError") + err.message);
            }

          }
        });

        // optional placeholder for future Execute
        jobDiv.querySelector('.execute-job-btn').addEventListener('click', async () => {
          if (confirm(getTranslation("executeConfirm") + `${job.jobname}`)) {
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
              let message = getTranslation("unkownError");

              if (contentType && contentType.includes("application/json")) {
                const result = await res.json();

                if (res.ok) {
                  message = `✅ ${result.message || getTranslation("queueSuccess")}`;
                } else {
                  message = `❌ ${result.error || result.message || getTranslation("queueFail")}`;
                }
              } else {
                const text = await res.text();
                message = getTranslation("unexpectedResponse") + "${text}";
              }

              alert(message);
            } catch (err) {
              console.error(getTranslation("executeFail"), err);
              alert(getTranslation("networkError"));
            }
          }
        });
      });
    }
  } catch (err) {
    jobsListWatering.innerHTML = getTranslation("loadingError");
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