import { pixelToCoord, coordToPixel, drawGrid, clearCanvas } from "./canvas.js";
import { isLoggedIn } from "./auth.js";
import { getTranslation } from "./translation.js";
import { DisplayCreateSeedingJobForTouchedBased } from "./seeding.js";
import { DisplayCreateWateringJobForTouchBased } from "./watering.js";
import { GetDistance } from "./tools.js"; // Function to fetch plants
import { getPlants } from "./plantsmanager.js";
import { deletePlant } from "./plantsmanager.js";


const dialogContent = document.getElementById("dialogContent");
const dialogBox = document.getElementById("dialogBox");
const dialogHeader = document.getElementById("dialog-header");
const canvas = document.getElementById('gridCanvas');

let selectedPlant = null;



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


    if (selectedPlant) {
      console.log(window.plants);

      console.log(selectedPlant);


      dialogHeader.textContent = `${selectedPlant.plantname === undefined ? "" : selectedPlant.plantname}: ${getTranslation(selectedPlant.planttype)} ${getTranslation("at")}  X: ${selectedPlant.xcoordinate}  Y: ${selectedPlant.ycoordinate}`;

      AddDeleteButtonToDialogContent();
      // AddWateringButtonToDialogContent();
      // DisplayCreateWateringJobForTouchBased(selectedPlant);
      showDialogOnCanvas(positiononscreen.x, positiononscreen.y);
    }
    else {
      // DisplayCreateSeedingJobForTouchedBased(x,y);
    }
  }
});

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
      deletePlant(selectedPlant.xcoordinate, selectedPlant.ycoordinate);
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