import { pixelToCoord, coordToPixel } from "./canvas.js";
import { isLoggedIn } from "./auth.js";
import { getTranslation } from "./translation.js";
import { DisplayCreateSeedingJobForTouchedBased } from "./seeding.js";
import { DisplayCreateWateringJobForTouchBased } from "./watering.js";
import { GetDistance } from "./tools.js"; // Function to fetch plants
import { deletePlant } from "./plantsmanager.js";
import { customConfirm } from "./popups.js";
import { PlantRadii } from "./tools.js"; // Import PlantRadii from tools.js


const dialogContent = document.getElementById("dialogContent");
const dialogBox = document.getElementById("dialogBox");
const dialogHeader = document.getElementById("dialog-header");
const canvas = document.getElementById('gridCanvas');

let selectedPlant = null;

canvas.addEventListener('click', async (e) => {
  if (isLoggedIn) {
    let coordDisplay = pixelToCoord(e.offsetX, e.offsetY);
    let x = coordDisplay.x; // x of the click with respect to grid coordinate system
    let y = coordDisplay.y; // y of the click with respect to grid coordinate system

    // Find the clicked plant
    selectedPlant = null;
    let isSeedingPossible = true;

    for (let plant of window.plants) { // this loop will decide if seeding is possible or not
      const distance = GetDistance(x, y, plant.xcoordinate, plant.ycoordinate);
      if (distance < PlantRadii[plant.planttype]) {
        isSeedingPossible = false; // If any plant is too close, seeding is not possible
      }      
    }

    for(let plant of window.plants) { // this loop will find the plant that is clicked
      const distance = GetDistance(x, y, plant.xcoordinate, plant.ycoordinate);
      if (distance < 15) {
        selectedPlant = plant; // Set the selected plant
        break; // Stop at the first match
      }
    }

    for (let job of window.seedingjobs) { // this loop will check if there is a seed at the clicked position
      for (let seed of job.seeds) {
        const distance = GetDistance(x, y, seed.xcoordinate, seed.ycoordinate);
        if (distance <= PlantRadii[seed.seedtype]) { // Assuming a radius of 15 for seeds
          isSeedingPossible = false; // If a seed is found, seeding is not possible
          break; // Stop at the first match
        }
      }
    }

    // remove any existing dialogbox
    dialogBox.style.display = "none"; // Hide the dialog box if it exists


    dialogContent.innerHTML = ""; // Clear previous content
    dialogHeader.textContent = ""; // Clear previous header

    if (selectedPlant) {
      dialogHeader.textContent = `${selectedPlant.plantname === undefined ? "" : selectedPlant.plantname}: ${getTranslation(selectedPlant.planttype)} ${getTranslation("at")}  X: ${selectedPlant.xcoordinate}  Y: ${selectedPlant.ycoordinate}`;

      AddDeleteButtonToDialogContent();
      AddWateringButtonToDialogContent();
    }
    else {
      if (!isSeedingPossible) return;
      dialogHeader.textContent = `Position: X:${x} , Y:${y}`;
      AddSeedingButtonToDialogContent(x, y);
    }

    showDialogOnCanvas(e.clientX, e.clientY);
  }
});

function showDialogOnCanvas(x, y) {
  // STEP 1: Temporarily make it visible but hidden for measurement
  dialogBox.style.visibility = "hidden";
  dialogBox.style.display = "block";

  // STEP 2: Measure size
  const dialogWidth = dialogBox.offsetWidth;
  const dialogHeight = dialogBox.offsetHeight;

  const offsetX = -dialogWidth / 2;
  const offsetY = -dialogHeight;

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

  deleteButton.addEventListener("click", async () => {
    const confirmed = await customConfirm("Are you sure you want to delete this plant?");
    if (selectedPlant && confirmed) {
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

function AddSeedingButtonToDialogContent(x, y) {
  const seedingButton = document.createElement("button");
  seedingButton.textContent = "🌱";

  seedingButton.addEventListener("click", () => {
    DisplayCreateSeedingJobForTouchedBased(x, y);

    dialogBox.style.display = "none"; // Hide the dialog after seeding
  });
  dialogContent.appendChild(seedingButton);
}