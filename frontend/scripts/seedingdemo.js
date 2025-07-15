// This script handles the "Seeding Demo" modal and demo job submission
import { getTranslation } from "./translation.js";
import { token } from "./auth.js"; // your auth token binding
import { customConfirm, customAlert } from "./popups.js";

// Predefined plants matching your Seeding schema
export const predefinedPlants = [
  { id:1, planttype: "lettuce", plantname: "Luna", xcoordinate: 20, ycoordinate: 20 },
  { id:2, planttype: "lettuce", plantname: "Leafy", xcoordinate: 40, ycoordinate: 20 },
  { id:3, planttype: "tomato", plantname: "Ruby", xcoordinate: 20, ycoordinate: 40 },
  { id:4, planttype: "tomato", plantname: "Sunny", xcoordinate: 40, ycoordinate: 40 },
  { id:5, planttype: "radish", plantname: "Spicy", xcoordinate: 20, ycoordinate: 60 },
  { id:6, planttype: "radish", plantname: "Crunch", xcoordinate: 40, ycoordinate: 60 }
];

document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const demoBtn = document.getElementById("seedingDemoBtn");
  const modal = document.getElementById("seedingDemoModal");
  const closeModal = document.getElementById("closeModalSeedingDemo");
  const plantSelect = document.getElementById("plantDropdownSeeding");
  const execBtn = document.getElementById("executeBtnSeedingDemo");

  // Local store for predefined plants
  let plants = {};


  let i = 0;


  demoBtn.addEventListener("click", async () => {
    const confirmed = await customConfirm(getTranslation("seedingDemoText"));
    if (!confirmed) return;
    startDemo();
    //populateDropdown();
    //modal.style.display = "block";
  });

  // Close modal on × or outside click
  closeModal.addEventListener("click", () => (modal.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // Fill the <select> with predefined plant entries
  function populateDropdown() {
    plantSelect.innerHTML = "";
    for (const id in predefinedPlants) {
      const p = predefinedPlants[id];
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = `${p.plantname}: ${capitalize(getTranslation(p.planttype))} ${getTranslation("at")} X: ${p.xcoordinate}, Y: ${p.ycoordinate}`;
      plantSelect.appendChild(opt);
    }
    plants = predefinedPlants;
  }

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

  // Handle demo submission
  /*
  execBtn.addEventListener("click", async () => {
    const selected = plants[plantSelect.value];
    if (!selected) {
      console.error("No plant selected");
      modal.style.display = "none";
      return;
    }

    // Build payload matching your Seeding model: jobname + seeds array
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
      customAlert(data.message || "Seeding demo queued");
    } catch (err) {
      console.error("Seeding demo error:", err);
      customAlert(err.message);
    }
  });

  // Utility: capitalize first letter
  function capitalize(str) {
    return String(str).charAt(0).toUpperCase() + str.slice(1);
  }*/
});

