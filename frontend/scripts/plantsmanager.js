import { token } from './auth.js'; // your auth token binding
import { getTranslation } from './translation.js';
import { customAlert, customConfirm } from './popups.js';
import { drawGrid, clearCanvas } from "./canvas.js";

const managePlantsBtn = document.getElementById('managePlants');
const managePlantsModal = document.getElementById('managePlantsModal');
const plantsList = document.getElementById('plantsList');
const plantCountDisplay = document.getElementById('plantCountDisplay');
const closeManagePlantsBtn = document.getElementById('closeManagePlantsModal');

// Modify modal
const modifyModal = document.getElementById('modifyPlantModal');
const modifyPlantBtn = document.getElementById("modifyPlantBtn");
const closeModifyPlantsBtn = document.getElementById('closeModifyPlantModal');
const modifyNameInput = document.getElementById('modifyPlantName');
const modifyNameError = document.getElementById('modifyPlantNameError');
const originalName = document.getElementById('originalPlantName');
const plantTypeImage = document.getElementById('plantTypeImage');
const plantCoordinates = document.getElementById('plantCoordinates');
const returnBtn = document.getElementById('returnToOverviewPlants');

let xcoordinate;
let ycoordinate;

// ——— View‐Jobs Logic ———
managePlantsBtn.addEventListener('click', async () => {
  plantsList.innerHTML = getTranslation('loading');
  plantCountDisplay.textContent = '';
  managePlantsModal.style.display = 'block';

  const plants = window.plants;

  plantCountDisplay.textContent = `${getTranslation('plantsSoFar')}${plants.length}`;

  if (plants.length === 0) {
    plantsList.innerHTML = getTranslation('noPlantsFound');
    return;
  }

  plantsList.innerHTML = '';
  plants.forEach(plant => {
    const div = document.createElement('div');
    div.className = 'plant-row';
    div.dataset.plantname = plant.plantname;
    div.innerHTML = `
      <div class="job-header-row">
      <img src="assets/icons/${plant.planttype}.png" alt="${plant.planttype}" style="width:50px;height:50px;">
      <strong>${plant.plantname}</strong>
        <div class="icon-actions">
          <p>X: ${plant.xcoordinate}, Y: ${plant.ycoordinate}</p>
          <span class="icon-btn edit-plant-btn" title="${getTranslation('edit')}">✏️</span>
          <span class="icon-btn delete-plant-btn" title="${getTranslation('delete')}">🗑️</span>
        </div>
      </div>
    `;
    plantsList.appendChild(div);

    // Edit
    div.querySelector('.edit-plant-btn').addEventListener('click', () => {
      // prepare and show modify modal
      modifyNameInput.value = plant.plantname;
      modifyNameError.textContent = '';
      originalName.textContent = plant.plantname;
      plantTypeImage.src = "assets/icons/"+ plant.planttype + ".png";
      plantCoordinates.textContent = "X: " + plant.xcoordinate + ", Y: " +plant.ycoordinate;

      xcoordinate = plant.xcoordinate;
      ycoordinate = plant.ycoordinate;
      
      returnBtn.style.visibility = 'visible';
      managePlantsModal.style.display = 'none';
      modifyModal.style.display = 'block';
    });

    // Delete
    div.querySelector('.delete-plant-btn').addEventListener('click', async () => {
      const confirmed = await customConfirm(getTranslation("deleteConfirmPlant"));
      if (!confirmed) return;

      console.log('Deleting plant at:', plant.xcoordinate, plant.ycoordinate);
      deletePlant(plant.xcoordinate, plant.ycoordinate);
      modifyModal.style.display = "none";
    });

  });
});

closeManagePlantsBtn.addEventListener('click', () => {
  managePlantsModal.style.display = 'none';
});

returnBtn.addEventListener('click', () => {
  modifyModal.style.display = 'none';
  managePlantsModal.style.display = 'block';
})

window.addEventListener('click', (e) => {
    if (e.target === managePlantsModal || e.target === modifyModal) {
      managePlantsModal.style.display = 'none';
      modifyModal.style.display = 'none';
    }
  });

closeModifyPlantsBtn.addEventListener('click', () => {
  modifyModal.style.display = 'none';
});

modifyPlantBtn.addEventListener('click', async () => {
  let plantname = modifyNameInput.value;
  if (plantname === "") {
    modifyNameError.textContent = getTranslation("noPlantName");
    return;
  }
  if (plantname === originalName.textContent) {
    modifyNameError.textContent = getTranslation("sameName");
    return;
  }
  const confirmed = await customConfirm(getTranslation("changeConfirm"));
  if(!confirmed) return;
  const res = await fetch('/api/plant/rename', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plantname, xcoordinate, ycoordinate, token })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Changing failed');
  else customAlert(getTranslation("plantRenamed"));
  modifyModal.style.display = 'none';
});

export async function deletePlant(x, y) {
  let xcoordinate = x;
  let ycoordinate = y;
  const res = await fetch('/api/plant', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, xcoordinate, ycoordinate })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Delete failed');
  clearCanvas();
  drawGrid();
}

// get plants from server
export async function getPlants() {
  await fetch('/api/plants', {
    method: 'GET',
  })
    .then(response => response.json())
    .then(data => {
      //if (plants.toString() != data.toString()) {
      window.plants.length = 0; // Clear the existing plants array
      for (const plant of data) {
        window.plants.push({ planttype: plant.planttype, plantname: plant.plantname, xcoordinate: plant.xcoordinate, ycoordinate: plant.ycoordinate });
      }
    })
    .catch(error => console.error('Error fetching plants:', error));
}

