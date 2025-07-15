import { predefinedPlants } from '../customization/demo_plants.js'; // predefined plants for demo
import { getTranslation } from './translation.js';
import { token } from './auth.js';
import { customAlert,customConfirm } from './popups.js';

document.addEventListener("DOMContentLoaded", () => {
  const demoBtn = document.getElementById("wateringDemoBtn");
  const modal = document.getElementById("wateringDemoModal");
  const closeModalBtn = document.getElementById("closeModalWateringDemo");
  const plantDropdown = document.getElementById("plantDropdown");
  const executeBtn = document.getElementById("executeBtnWateringDemo");
  var plants = [];

  demoBtn.addEventListener("click", async () => {
    const confirmed = await customConfirm(getTranslation("wateringDemoText"));
    if (!confirmed) return;
    startDemo();
  });

  /*
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  */

  async function startDemo() {
    const randomPlant = Math.floor(Math.random() * predefinedPlants.length);
    const plantstobewatered = [{ plant: predefinedPlants[randomPlant], wateringcapacity: 10, wateringheight:50}];
    
    const payload = {
          jobname: "Watering Demo",
          plantstobewatered: plantstobewatered,
          is_scheduled: false,
          scheduleData: null
        };

    try {
      const response = await fetch('/api/demo/watering', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ payload, token })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Watering demo failed");
        customAlert(getTranslation(data.message) || "Watering demo queued");
    } catch (err) {
      console.error("Error executing watering demo:", err);
      customAlert(getTranslation(err.message));
    }
  }
  /* executeBtn.addEventListener("click", async () => {
    const selectedPlantId = plants[plantDropdown.value];
    try {
      if (selectedPlantId !== getTranslation("loading")) {
        const plantstobewatered = [{ plant: selectedPlantId, wateringcapacity: 10, wateringheight: 70 }];

        const payload = {
          jobname: "Watering Demo",
          plantstobewatered: plantstobewatered,
          is_scheduled: false,
          scheduleData: null
        };
        const token = "";

        const response = await fetch('/api/demo/watering', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ payload, token })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Watering demo failed");
        customAlert(getTranslation(data.message) || "Watering demo queued");
      } else {
        console.error("No plant selected or plants are still loading.");
      }
    } catch (err) {
      console.error("Error executing watering demo:", err);
      customAlert(getTranslation(err.message));
    }
    modal.style.display = "none";
  });

  // Populate the dropdown with predefined plants
  function populatePlantDropdown() {
    plantDropdown.innerHTML = "";
    for (const plantId in predefinedPlants) {
      const plant = predefinedPlants[plantId];
      const option = document.createElement("option");
      option.value = plantId;
      option.textContent = `${plant.plantname}: ${getTranslation(plant.planttype)} ${getTranslation("at")} X: ${plant.xcoordinate}, Y: ${plant.ycoordinate}`;
      plantDropdown.appendChild(option);
    }
    plants = predefinedPlants; // Store the predefined plants
  }
  */
});