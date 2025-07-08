import { pixelToCoord, coordToPixel, drawGrid, clearCanvas } from "./canvas.js";
import { token, isLoggedIn } from "./auth.js";
import { getTranslation } from "./translation.js";
import { DisplayCreateSeedingJobForTouchedBased } from "./seeding.js";
import { DisplayCreateWateringJobForTouchBased } from "./watering.js";


const dialogContent = document.getElementById("dialogContent");
const dialogBox = document.getElementById("dialogBox");
const dialogHeader = document.getElementById("dialog-header");
const canvas = document.getElementById('gridCanvas');

let selectedPlant = null;

function GetDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}

canvas.addEventListener('click', async (e) => {
  if (isLoggedIn) {
    let coordDisplay = pixelToCoord(e.offsetX, e.offsetY);
    let x = coordDisplay.x;
    let y = coordDisplay.y;

    // Find the clicked plant
    selectedPlant = null;
    for (let plant of window.plants) {
      const distance = GetDistance(x, y, plant.xcoordinate, plant.ycoordinate);

      // const radius = PlantRadii[plant.planttype];
      const radius = 15;
      if (radius !== undefined && distance <= radius) {
        selectedPlant = plant;
        break; // Stop at the first match
      }
    }

    let innerCanvasCoordinateInPixel = coordToPixel(x, y);
    const canvasRect = canvas.getBoundingClientRect();
    let positiononscreen = {
      x: canvasRect.left + innerCanvasCoordinateInPixel.x,
      y: canvasRect.top + innerCanvasCoordinateInPixel.y
    };

    console.log(`Clicked at (${x}, ${y}) which is at screen position (${positiononscreen.x}, ${positiononscreen.y})`);

    // remove any existing dialogbox
    dialogBox.style.display = "none"; // Hide the dialog box if it exists


    dialogContent.innerHTML = ""; // Clear previous content
    dialogHeader.textContent = `${translatePlantType(selectedPlant.planttype)} ${getTranslation("at")} X: ${selectedPlant.xcoordinate}, Y: ${selectedPlant.ycoordinate}`;

    if (selectedPlant) {
      AddDeleteButtonToDialogContent();
      // AddWateringButtonToDialogContent();
      // DisplayCreateWateringJobForTouchBased(selectedPlant);
      showDialogOnCanvas(positiononscreen.x, positiononscreen.y);      
    }
    else // show watering emoji
    {
      // DisplayCreateSeedingJobForTouchedBased(x,y);
    }

  }
});

async function deletePlant(plant) {
  let xcoordinate = plant.xcoordinate;
  let ycoordinate = plant.ycoordinate;
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


async function getPlants() {
  await fetch('/api/plants', {
    method: 'GET',
  })
    .then(response => response.json())
    .then(data => {
      window.plants.length = 0; // Clear the existing plants array
      for (const plant of data) {
        window.plants.push(new Plant(plant.planttype, Number(plant.xcoordinate), Number(plant.ycoordinate)));
      }
    })
    .catch(error => console.error('Error fetching plants:', error));
}

class Plant {
  constructor(type, x, y) {
    this.planttype = type;
    this.xcoordinate = x;
    this.ycoordinate = y;
  }
}

function showDialogOnCanvas(x, y) {
  console.log(`Showing dialog at (${x}, ${y})`);

  // STEP 1: Temporarily make it visible but hidden for measurement
  dialogBox.style.visibility = "hidden";
  dialogBox.style.display = "block";

  // STEP 2: Measure size
  const dialogWidth = dialogBox.offsetWidth;
  const dialogHeight = dialogBox.offsetHeight;
  const arrowHeight = 10;

  const offsetX = -dialogWidth / 2;
  const offsetY = -dialogHeight - arrowHeight;

  // STEP 3: Set position
  dialogBox.style.left = `${x + offsetX}px`;
  dialogBox.style.top = `${y + offsetY}px`;

  // STEP 4: Make it fully visible
  dialogBox.style.visibility = "visible";


  // --- OUTSIDE CLICK HANDLER ---
  const outsideClickListener = (event) => {
    if (
      !dialogBox.contains(event.target) &&
      !canvas.contains(event.target)
    ) {
      dialogBox.style.display = "none";
      document.removeEventListener("click", outsideClickListener);
    }
  };

  // Delay listener setup to avoid immediately closing the dialog
  setTimeout(() => {
    document.addEventListener("click", outsideClickListener);
  }, 0);
}

function AddDeleteButtonToDialogContent() {
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "❌";

  deleteButton.addEventListener("click", () => {
    if (selectedPlant) {
      deletePlant(selectedPlant);
    }
    dialogBox.style.display = "none"; // Hide the dialog after deletion
  });
  dialogContent.appendChild(deleteButton);
}

function AddWateringButtonToDialogContent() {
  const wateringButton = document.createElement("button");
  wateringButton.textContent = "💧";

  wateringButton.addEventListener("click", () => {
    if (selectedPlant) {
      DisplayCreateWateringJobForTouchBased(selectedPlant);
    }

    dialogBox.style.display = "none"; // Hide the dialog after watering
  });
  dialogContent.appendChild(wateringButton);
}

function translatePlantType(plantType) {
  switch (plantType) {
    case 'tomato':
      return getTranslation('tomato');
    case 'radish':
      return getTranslation('radish');
    case 'lettuce':
      return getTranslation('lettuce');
    default:
      return plantType; // Fallback to original if no translation found
  }
}