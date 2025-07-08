import { getTranslation } from './scripts/translation.js';

document.addEventListener("DOMContentLoaded", () => {
  const demoBtn = document.getElementById("wateringDemoBtn");
  const modal = document.getElementById("wateringDemoModal");
  const closeModalBtn = document.getElementById("closeModalWateringDemo");
  const plantDropdown = document.getElementById("plantDropdown");
  const executeBtn = document.getElementById("executeBtnWateringDemo");
  var plants = [];

  demoBtn.addEventListener("click", () => {
    modal.style.display = "block";
    populatePlantDropdown();
  });

  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  executeBtn.addEventListener("click", async () => {
    const selectedPlantId = plants[plantDropdown.value];
    try {
      if (selectedPlantId !== getTranslation("loading")) {
        const plantstobewatered = [{plant: selectedPlantId, wateringcapacity: 10, wateringheight: 70}];
        const payload = {jobname: "Watering Demo", plantstobewatered: plantstobewatered, is_scheduled: false, scheduleData: null};
        const token = "";
        const response = await fetch('/api/demo/watering', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({payload, token})
        });
      } else {
        console.error("No plant selected or plants are still loading.");
      }
    } catch (error) {
      console.error("Error executing watering demo:", error);
    }
    modal.style.display = "none";
  });

  //use predefined plants for demo
  const predefinedPlants = {
    "1": {planttype: "lettuce", xcoordinate: 10, ycoordinate: 20},
    "2": {planttype: "lettuce", xcoordinate: 20, ycoordinate: 30},
    "3": {planttype: "tomato", xcoordinate: 30, ycoordinate: 40},
    "4": {planttype: "tomato", xcoordinate: 40, ycoordinate: 50},
    "5": {planttype: "radish", xcoordinate: 50, ycoordinate: 60},
    "6": {planttype: "radish", xcoordinate: 60, ycoordinate: 70}
  };

  // Populate the dropdown with predefined plants
  function populatePlantDropdown() {
    plantDropdown.innerHTML = "";
    for (const plantId in predefinedPlants) {
      const plant = predefinedPlants[plantId];
      const option = document.createElement("option");
      option.value = plantId;
      option.textContent = `${getTranslation(plant.planttype)} ${getTranslation("at")} X: ${plant.xcoordinate}, Y: ${plant.ycoordinate}`;
      plantDropdown.appendChild(option);
    }
    plants = predefinedPlants; // Store the predefined plants
  }  
});