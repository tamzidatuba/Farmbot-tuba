// seedingDemo.js
// This script handles the "Seeding Demo" modal and demo job submission
import { getTranslation } from "./scripts/translation.js";
import { token } from "./scripts/auth.js"; // your auth token binding

document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const demoBtn     = document.getElementById("seedingDemoBtn");
  const modal       = document.getElementById("seedingDemoModal");
  const closeModal  = document.getElementById("closeModalSeedingDemo");
  const plantSelect = document.getElementById("plantDropdownSeeding");
  const execBtn     = document.getElementById("executeBtnSeedingDemo");

  // Local store for predefined plants
  let plants = {};

  // Predefined plants matching your Seeding schema
  const predefinedPlants = {
    "1": { planttype: "lettuce", xcoordinate: 10, ycoordinate: 20 },
    "2": { planttype: "lettuce", xcoordinate: 20, ycoordinate: 30 },
    "3": { planttype: "tomato",  xcoordinate: 30, ycoordinate: 40 },
    "4": { planttype: "tomato",  xcoordinate: 40, ycoordinate: 50 },
    "5": { planttype: "radish",  xcoordinate: 50, ycoordinate: 60 },
    "6": { planttype: "radish",  xcoordinate: 60, ycoordinate: 70 }
  };

  // Open modal and populate dropdown
  demoBtn.addEventListener("click", () => {
    populateDropdown();
    modal.style.display = "block";
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
      opt.textContent = `${capitalize(getTranslation(p.planttype))} at X: ${p.xcoordinate}, Y: ${p.ycoordinate}`;
      plantSelect.appendChild(opt);
    }
    plants = predefinedPlants;
  }

  // Handle demo submission
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
        xcoordinate: selected.xcoordinate,
        ycoordinate: selected.ycoordinate,
        depth:       5,                 // adjust as needed
        seedtype:    selected.planttype
      }]
    };

    try {
      const response = await fetch("/api/demo/seeding", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ payload, token })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Seeding demo failed");
      alert(data.message || "Seeding demo queued");
    } catch (err) {
      console.error("Seeding demo error:", err);
      alert(err.message);
    } finally {
      modal.style.display = "none";
    }
  });

  // Utility: capitalize first letter
  function capitalize(str) {
    return String(str).charAt(0).toUpperCase() + str.slice(1);
  }
});
