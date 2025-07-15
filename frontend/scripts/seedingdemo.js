// This script handles the "Seeding Demo" modal and demo job submission
import { getTranslation } from "./translation.js";
import { token } from "./auth.js"; // your auth token binding
import { customConfirm, customAlert } from "./popups.js";
import { predefinedPlants } from "../customization/demo_plants.js";


document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const demoBtn = document.getElementById("seedingDemoBtn");
  const modal = document.getElementById("seedingDemoModal");
  const closeModal = document.getElementById("closeModalSeedingDemo");

  demoBtn.addEventListener("click", async () => {
    const confirmed = await customConfirm(getTranslation("seedingDemoText"));
    if (!confirmed) return;
    startDemo();
  });

  // Close modal on × or outside click
  closeModal.addEventListener("click", () => (modal.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  async function startDemo() {
    console.log("Array length " + predefinedPlants.length);
    const randomPlant = Math.floor(Math.random() * predefinedPlants.length);
    console.log(randomPlant);
    const chosenPlant = predefinedPlants[randomPlant];
    console.log(chosenPlant);
    
    const payload = {
      jobname: "Seeding Demo",
      seeds: [{
        xcoordinate: chosenPlant.xcoordinate,
        ycoordinate: chosenPlant.ycoordinate,
        depth: 5,                 // adjust as needed
        seedtype: chosenPlant.planttype,
        seedname: chosenPlant.plantname
      }]
    };

    try {
      const response = await fetch("/api/demo/seeding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload, token })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Seeding demo failed");
      customAlert(getTranslation(data.message) || "Seeding demo queued");
    } catch (err) {
      console.error("Seeding demo error:", err);
      customAlert(getTranslation(err.message));
    }
  }  
});