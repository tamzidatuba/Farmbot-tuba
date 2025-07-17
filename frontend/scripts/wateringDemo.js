import { predefinedPlants, predefinedWatering } from '../customization/demo_plants.js'; // predefined plants for demo
import { getTranslation } from './translation.js';
import { token } from './auth.js';
import { customAlert,customConfirm } from './popups.js';

const wateringCapacity = predefinedWatering.wateringCapacity;
const wateringHeight = predefinedWatering.wateringHeight;

document.addEventListener("DOMContentLoaded", () => {
  const demoBtn = document.getElementById("wateringDemoBtn");

  demoBtn.addEventListener("click", async () => {
    const confirmed = await customConfirm(getTranslation("wateringDemoText"));
    if (!confirmed) return;
    startDemo();
  });

  async function startDemo() {
    const randomPlant = Math.floor(Math.random() * predefinedPlants.length);
    const plantstobewatered = [{ plant: predefinedPlants[randomPlant], wateringcapacity: wateringCapacity, wateringheight:wateringHeight}];
    
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
});