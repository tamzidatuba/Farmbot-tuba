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

let xcoordinate;
let ycoordinate;

// ——— View‐Jobs Logic ———
managePlantsBtn.addEventListener('click', async () => {
  plantsList.innerHTML = getTranslation('loadingPlants');
  plantCountDisplay.textContent = '';
  managePlantsModal.style.display = 'block';

  const plants = window.plants;

  plantCountDisplay.textContent = `${getTranslation('existingPlants')}${plants.length}`;

  if (plants.length === 0) {
    plantsList.innerHTML = getTranslation('notFound');
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
      
      managePlantsModal.style.display = 'none';
      modifyModal.style.display = 'block';
    });

    // Delete
    div.querySelector('.delete-plant-btn').addEventListener('click', async () => {
      const confirmed = await customConfirm("Are you sure you want to delete this plant?");
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

closeModifyPlantsBtn.addEventListener('click', () => {
  modifyModal.style.display = 'none';
  managePlantsModal.style.display = 'block';
});

modifyPlantBtn.addEventListener('click', async () => {
  let plantname = modifyNameInput.value;
  if (plantname === "") {
    modifyNameError.textContent = 'Plant name cant be empty';
    return;
  }
  const confirmed = await customConfirm("Are you sure you want to change the plantname?");
  if(!confirmed) return;
  const res = await fetch('/api/plant/rename', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plantname, xcoordinate, ycoordinate, token })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Changing failed');
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
  await getPlants(); //TODO:  remove it from variable instead of fetching again
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

export const predefinedPlants = [
  { id:1, planttype: "lettuce", plantname: "Luna", xcoordinate: 20, ycoordinate: 20 },
  { id:2, planttype: "lettuce", plantname: "Leafy", xcoordinate: 40, ycoordinate: 20 },
  { id:3, planttype: "tomato", plantname: "Ruby", xcoordinate: 20, ycoordinate: 40 },
  { id:4, planttype: "tomato", plantname: "Sunny", xcoordinate: 40, ycoordinate: 40 },
  { id:5, planttype: "radish", plantname: "Spicy", xcoordinate: 20, ycoordinate: 60 },
  { id:6, planttype: "radish", plantname: "Crunch", xcoordinate: 40, ycoordinate: 60 }
];