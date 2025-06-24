document.addEventListener("DOMContentLoaded", () => {
  const demoBtn = document.getElementById("wateringDemoBtn");
  const modal = document.getElementById("wateringDemoModal");
  const closeModalBtn = document.getElementById("closeModalWateringDemo");
  const plantDropdown = document.getElementById("plantDropdown");
  const executeBtn = document.getElementById("executeBtnWateringDemo");
  var plants = [];

  demoBtn.addEventListener("click", () => {
    modal.style.display = "block";
    getPlants();
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
      if (selectedPlantId !== "Loading...") {
        const plantstobewatered = [{plant: selectedPlantId, wateringcapacity: 10, wateringheight: 10}];
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

  // get plants from server
  async function getPlants() {
    await fetch('/api/plants', {method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
      if (plants.toString() != data.toString()) {
        plants = data;
        console.log("Plants fetched from server:", data);
        plantDropdown.innerHTML = "";
        for (const plant_data in data) {
          const plant = data[plant_data];
          console.log("Plant:", plant);
          const option = document.createElement("option");
          option.value = plant_data;
          option.textContent = `${capitalizeFirstLetter(plant.planttype)} at X: ${plant.xcoordinate}, Y: ${plant.ycoordinate}`;
          plantDropdown.appendChild(option);
        }
      }
    })
    .catch(error => console.error('Error fetching plants:', error));
  }

  function capitalizeFirstLetter(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
  }
});