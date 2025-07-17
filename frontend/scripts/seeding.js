import { token } from "./auth.js";
import { setLanguage, getTranslation } from "./translation.js";
import { customAlert } from "./popups.js";
import { customConfirm } from "./popups.js";


// ——— DOM References ———
// Create modal
const seedingJobBtn = document.getElementById('seedingJobBtn');
const createModal = document.getElementById('seedingModal');
const createNameInput = document.getElementById('SeedingJobName');
const createNameError = document.getElementById('jobNameError');
const jobContainer = document.getElementById('jobContainer');
const addPlantBtn = document.getElementById('addPlantBtn');
const executeBtn = document.getElementById('executeBtn');
const closeCreateBtn = document.getElementById('closeModal');

// Modify modal
const modifyModal = document.getElementById('modifySeedingModal');
const closeModifyBtn = document.getElementById('closeModifyModal');
const modifyNameInput = document.getElementById('modifySeedingJobName');
const modifyNameError = document.getElementById('modifyJobNameError');
const modifyJobContainer = document.getElementById('modifyJobContainer');
const modifyAddPlantBtn = document.getElementById('modifyAddPlantBtn');
const modifyExecuteBtn = document.getElementById('modifyExecuteBtn');
const returnToOverviewSeeding = document.getElementById('returnToOverviewSeeding');

// View‐jobs modal
const viewJobsBtn = document.getElementById('viewSeedingJobsBtn');
const viewJobsModal = document.getElementById('viewJobsModal');
const jobsList = document.getElementById('jobsList');
const jobCountDisplay = document.getElementById('jobCountDisplay');
const closeViewJobsBtn = document.getElementById('closeViewJobsModal');


// ——— State Counters ———
let createJobCount = 0;
let modifyJobCount = 0;

// ——— Helpers ———
function capitalizeFirstLetter(str) {
  return str
    ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    : '';
}

// ——— Row Constructors ———
function createJobRow() {
  createJobCount++;
  const idx = createJobCount;
  const row = document.createElement('div');
  row.classList.add('job-row');
  row.dataset.index = idx;
  row.innerHTML = `
    <div class="plant-row">
      <div class="plant-row-header">
        <label data-i18n="plantType" for="plant-${idx}">Plant Type</label>
        <span class="delete-job" data-i18n-title="removePlant" title="Remove">&#128465;</span>
      </div>
      <select id="plant-${idx}" class="plantType">
        <option data-i18n="selectDefault" value="">--Choose Plant--</option>
        <option data-i18n="tomato" value="Tomato">Tomato</option>
        <option data-i18n="radish" value="Radish">Radish</option>
        <option data-i18n="lettuce" value="Lettuce">Lettuce</option>
      </select>
      <input type="text" data-i18n-placeholder="plantName" class="plantName" placeholder="Plant Name">
    </div>
    <div class="coord-row">
      <div>
        <label data-i18n="x">X Coordinate</label>
        <input type="number" class="coord-input xCoord" placeholder="0 - 395">
      </div>
      <div>
        <label data-i18n="y">Y Coordinate</label>
        <input type="number" class="coord-input yCoord" placeholder="0 - 650">
      </div>
      <div>
        <label data-i18n="depth">Depth (mm)</label>
        <input type="number" class="coord-input depth" placeholder="> 0" disabled>
      </div>
    </div>
    <div class="errorMsg"></div>
  `;

  // depth logic
  const plantSelect = row.querySelector('.plantType');
  const depthInput = row.querySelector('.depth');
  const deleteBtn = row.querySelector('.delete-job');

  plantSelect.addEventListener('change', () => {
    const t = plantSelect.value.toLowerCase();
    depthInput.value =
      t === 'tomato' ? 6 :
        t === 'lettuce' ? 3 :
          t === 'radish' ? 10 : '';
  });

  deleteBtn.addEventListener('click', () => row.remove());
  jobContainer.appendChild(row);
  setLanguage(document.documentElement.lang);
}

function createModifyJobRow() {
  modifyJobCount++;
  const idx = modifyJobCount;
  const row = document.createElement('div');
  row.classList.add('job-row');
  row.dataset.index = idx;
  row.innerHTML = `
    <div class="plant-row">
      <div class="plant-row-header">
        <label data-i18n="plantType" for="m-plant-${idx}">Plant Type</label>
        <span class="delete-job" title="Remove">&#128465;</span>
      </div>
      <select id="m-plant-${idx}" class="plantType">
        <option data-i18n="selectDefault" value="">--Choose Plant--</option>
        <option data-i18n="tomato" value="Tomato">Tomato</option>
        <option data-i18n="radish" value="Radish">Radish</option>
        <option data-i18n="lettuce" value="Lettuce">Lettuce</option>
      </select>
      <div>
        <input type="text" data-i18n-placeholder="plantName" class="plantName" placeholder="Plant Name">
      </div>
    </div>
    <div class="coord-row">
      <div>
        <label data-i18n="x">X Coordinate</label>
        <input type="number" class="coord-input xCoord" placeholder="0 - 395">
      </div>
      <div>
        <label data-i18n="y">Y Coordinate</label>
        <input type="number" class="coord-input yCoord" placeholder="0 - 650">
      </div>
      <div>
        <label data-i18n="depth">Depth (mm)</label>
        <input type="number" class="coord-input depth" placeholder="> 0" disabled>
      </div>
    </div>
    <div class="errorMsg"></div>
  `;

  const plantSelect = row.querySelector('.plantType');
  const depthInput = row.querySelector('.depth');
  const deleteBtn = row.querySelector('.delete-job');

  plantSelect.addEventListener('change', () => {
    const t = plantSelect.value.toLowerCase();
    depthInput.value =
      t === 'tomato' ? 6 :
        t === 'lettuce' ? 3 :
          t === 'radish' ? 10 : '';
  });

  deleteBtn.addEventListener('click', () => row.remove());
  modifyJobContainer.appendChild(row);
  setLanguage(document.documentElement.lang);
}


// ——— Create‐Modal Event Listeners ———
seedingJobBtn.addEventListener('click', () => {
  DisplayCreateSeedingJob();
});

addPlantBtn.addEventListener('click', createJobRow);

executeBtn.addEventListener('click', async () => {
  // collect and validate
  const rows = jobContainer.querySelectorAll('.job-row');
  const seeds = [];
  const seen = new Set();
  let valid = true;
  rows.forEach(row => {
    const plant = row.querySelector('.plantType').value.toLowerCase();
    const plantName = row.querySelector('.plantName').value.trim();
    const x = (row.querySelector('.xCoord').value);
    const y = (row.querySelector('.yCoord').value);
    const depth = Number(row.querySelector('.depth').value);
    const key = `${x},${y}`;
    const err = row.querySelector('.errorMsg');
    err.textContent = '';

    if (!plant) {
      err.textContent = getTranslation('noPlant');
      valid = false;
    } else if (x === '' || y === '') {
      err.textContent = getTranslation('fillValues');
      valid = false;
    }else if (plantName=== '') {
      err.textContent = getTranslation('noPlantName');
      valid = false;
    } else if (isNaN(x) || isNaN(y) || x <= 0 || x >= 395 || y <= 0 || y >= 650) {
      err.textContent = getTranslation('correctValues');
      valid = false;
    } else {
      seen.add(key);
      seeds.push({ seedname: plantName, seedtype: plant, xcoordinate: x, ycoordinate: y, depth });
    }
    
  });

  const name = createNameInput.value.trim();
  createNameError.textContent = '';
  if (!/^[\w ]+$/.test(name)) {
    createNameError.textContent = getTranslation('specialChars');
    valid = false;
  }
  if (name === '') {
    createNameError.textContent = getTranslation('fillJobname');
    valid = false;
  }
  if (!valid) return;
  if (seeds.length === 0) {
    customAlert(getTranslation('noPlant'));
    return;
  }

  // POST
  try {
    const res = await fetch('/api/jobs/Seeding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: { jobname: name, seeds }, token })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || getTranslation('createFail'));
    customAlert(getTranslation('seedingcreated'));
    createModal.style.display = 'none';
  } catch (e) {
    customAlert(getTranslation('error') + e.message);
  }
});

closeCreateBtn.addEventListener('click', () => {
  createModal.style.display = 'none';
});

// close on backdrop
window.addEventListener('click', e => {
  if (e.target === createModal) createModal.style.display = 'none';
});

// ——— Modify‐Modal Event Listeners ———
modifyAddPlantBtn.addEventListener('click', createModifyJobRow);

modifyExecuteBtn.addEventListener('click', async () => {
  const rows = modifyJobContainer.querySelectorAll('.job-row');
  const seeds = [];
  const seen = new Set();
  let valid = true;

  rows.forEach(row => {
    const plant = row.querySelector('.plantType').value.toLowerCase();
    const plantName = row.querySelector('.plantName').value.trim();
    const x = (row.querySelector('.xCoord').value);
    const y = (row.querySelector('.yCoord').value);
    const depth = Number(row.querySelector('.depth').value);
    const key = `${x},${y}`;
    const err = row.querySelector('.errorMsg');
    err.textContent = '';
    console.log("x: " +x);

    if (!plant) {
      err.textContent = getTranslation('noPlant');
      valid = false;
    } else if (x === '' || y === '') {
      err.textContent = getTranslation('fillValues');
      valid = false;
    }else if (plantName=== '') {
      err.textContent = getTranslation('noPlantName');
      valid = false;
    } else if (isNaN(x) || isNaN(y) || x <= 0 || x >= 395 || y <= 0 || y >= 650) {
      err.textContent = getTranslation('correctValues');
      valid = false;
    } else {
      seen.add(key);
      seeds.push({ seedname: plantName, seedtype: plant, xcoordinate: x, ycoordinate: y, depth });
    }
    
  });

  if (!valid) return;

  // PUT
  try {
    const name = modifyNameInput.value;
    const res = await fetch('/api/jobs/Seeding', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: { jobname: name, seeds }, token })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    customAlert(getTranslation('seedingUpdated'));
    modifyModal.style.display = 'none';
  } catch (e) {
    customAlert(getTranslation('error') + e.message);
  }
});

closeModifyBtn.addEventListener('click', () => {
  modifyModal.style.display = 'none';
});

window.addEventListener('click', e => {
  if (e.target === modifyModal) modifyModal.style.display = 'none';
});

// ——— View‐Jobs Logic ———
viewJobsBtn.addEventListener('click', async () => {
  viewJobsModal.style.display = 'block';
  jobsList.innerHTML = '';
  jobCountDisplay.textContent = '';

  try {
    const jobsRes = await fetch('/api/jobs/Seeding');
    if (!jobsRes.ok) throw new Error('Failed to load jobs');
    const allJobs = await jobsRes.json();

    for(const queued_job of window.queue) {
      for(const job_idx in allJobs) {
        if (queued_job.job.jobname == allJobs[job_idx].jobname) {
          allJobs.splice(job_idx, 1);
          break;
        }
      }
    }
    jobCountDisplay.textContent = `${getTranslation('seedingSoFar')}${allJobs.length}`;

    if (allJobs.length === 0) {
      jobsList.innerHTML = `<p>${getTranslation('notFound')}</p>`;
      return;
    }

    allJobs.forEach(job => {
      const row = document.createElement('div');
      row.className = 'job-row';
      row.innerHTML = `
        <div class="job-header-row">
          <strong>${job.jobname}</strong>
          <div class="icon-actions">
            <span class="icon-btn edit-job-btn">✏️</span>
            <span class="icon-btn delete-job-btn">🗑️</span>
          </div>
        </div>
        <div>${getTranslation('plants')}: ${job.seeds?.length || 0}</div>
        <button class="execute-job-btnseed">${getTranslation('execute')}</button>
      `;
      jobsList.appendChild(row);
      // Edit
      row.querySelector('.edit-job-btn').addEventListener('click', () => {
        // prepare and show modify modal
        modifyNameInput.value = job.jobname;
        modifyNameError.textContent = '';
        modifyJobContainer.innerHTML = '';
        modifyJobCount = 0;
        job.seeds.forEach(seed => {
          createModifyJobRow();
          const row = modifyJobContainer.lastChild;
          row.querySelector('.plantType').value = capitalizeFirstLetter(seed.seedtype);
          row.querySelector('.plantName').value = seed.seedname || '';
          row.querySelector('.xCoord').value = seed.xcoordinate;
          row.querySelector('.yCoord').value = seed.ycoordinate;
          row.querySelector('.depth').value = seed.depth;
        });
        viewJobsModal.style.display = 'none';
        returnToOverviewSeeding.style.visibility = 'visible';
        modifyModal.style.display = 'block';
      });

      // Delete
      row.querySelector('.delete-job-btn').addEventListener('click', async () => {
        //if (!confirm(getTranslation('deleteConfirm') + job.jobname)) return;
        const confirmed = await customConfirm(getTranslation('deleteConfirm') + job.jobname + '?');
        if (!confirmed) return;
        try {
          const res2 = await fetch(`/api/jobs/Seeding/${encodeURIComponent(job.jobname)}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });
          const json2 = await (res2.headers.get('content-type')?.includes('application/json')
            ? res2.json()
            : Promise.reject(await res2.text()));
          if (!res2.ok) throw new Error(json2.error || json2.message);
          customAlert(getTranslation('jobDeleted'));
          viewJobsBtn.click();
        } catch (e) {
          customAlert(getTranslation('error') + e.message);
        }
      });

      // Execute

      row.querySelector('.execute-job-btnseed').addEventListener('click', async () => {
        const ok = await customConfirm(getTranslation('executeConfirm') + job.jobname + '?');
        if (!ok) return;

        // queue on the backend
        const qRes = await fetch(
          `/api/jobs/queue/${encodeURIComponent(job.jobname)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          }
        );
        const qJson = await qRes.json();
        if (!qRes.ok) {
          throw new Error(qJson.error || getTranslation('queueFail'));
        }

        // immediately remove this row from the DOM
        row.remove();

        // decrement the count
        const prev = parseInt(jobCountDisplay.textContent.match(/\d+/)[0], 10);
        jobCountDisplay.textContent = `${getTranslation('seedingSoFar')}${prev - 1}`;

        customAlert(`✅ ${getTranslation('queueSuccess')}`);
      });
    });

  } catch (err) {
    console.error(err);
    jobsList.innerHTML = `<div class="error">${getTranslation('loadingError')}</div>`;
  }
});

closeViewJobsBtn.addEventListener('click', () => {
  viewJobsModal.style.display = 'none';
});

returnToOverviewSeeding.addEventListener('click', () => {
  modifyModal.style.display = 'none';
  returnToOverviewSeeding.style.visibility = 'hidden';
  viewJobsModal.style.display = 'block';
});

window.addEventListener('click', e => {
  if (e.target === viewJobsModal) viewJobsModal.style.display = 'none';
});

function DisplayCreateSeedingJob() {
  // Reset
  createJobCount = 0;
  jobContainer.innerHTML = '';
  createNameError.textContent = '';
  createNameInput.value = '';
  createNameInput.disabled = false;

  // initial row
  createJobRow();
  createModal.style.display = 'block';
}


export function DisplayCreateSeedingJobForTouchedBased(x, y) {
  DisplayCreateSeedingJob();
  const rows = jobContainer.querySelectorAll('.job-row');
  rows[0].querySelector('.xCoord').value = x;
  rows[0].querySelector('.yCoord').value = y;
}
