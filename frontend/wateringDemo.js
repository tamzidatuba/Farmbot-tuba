document.addEventListener("DOMContentLoaded", () => {
  const demoBtn = document.getElementById("wateringDemoBtn");
  const modal = document.getElementById("wateringDemoModal");
  const closeModalBtn = document.getElementById("closeModalWateringDemo");
  const plantDropdown = document.getElementById("plantDropdown");
  const executeBtn = document.getElementById("executeBtn");
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
    const selectedPlantId = plantDropdown.value;
    try {
      if (!selectedPlantId == "Loading...") {
        payload = {jobname: "Watering Demo", plantstobewatered: [selectedPlantId], is_scheduled: false, scheduleData: null};
        const token = "";
        const response = await fetch('/api/demo/watering', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload, token)
    });
      } else {
        console.error("No plant selected or plants are still loading.");
      }
    } catch (error) {
      console.error("Error executing watering demo:", error);
    }
  });

  // get plants from server
  async function getPlants() {
    await fetch('/api/plants', {method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
      if (plants.toString() != data.toString()) {
      //if (plants.toString() != data.toString()) {
        plants = [];
        console.log("Plants fetched from server:", data);
        plantDropdown.innerHTML = "";
        for (const plant of data) {
          console.log("Plant:", plant);
          //plants.push(new Plant(Number(plant.xcoordinate), Number(plant.ycoordinate), plant.planttype));
          const option = document.createElement("option");
          option.value = {plant: plant};
          option.textContent = `${capitalizeFirstLetter(plant.planttype)} at X: ${plant.xcoordinate}, Y: ${plant.ycoordinate}`;
          plantDropdown.appendChild(option);
        }
        //console.log(plants);
      }
    })
    .catch(error => console.error('Error fetching plants:', error));
  }

  function capitalizeFirstLetter(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
  }
});