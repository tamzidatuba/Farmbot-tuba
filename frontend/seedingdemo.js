document.addEventListener("DOMContentLoaded", () => {
    const demoBtn       = document.getElementById("seedingDemoBtn");
    const modal         = document.getElementById("seedingDemoModal");
    const closeModalBtn = document.getElementById("closeModalSeedingDemo");
    const plantDropdown = document.getElementById("plantDropdown");
    const executeBtn    = document.getElementById("executeBtnSeedingDemo");
    let plants          = [];
  
    // map plant types → default seeding depths (in mm)
    const depthMap = {
      Tomato: 6,
      Radish: 10,
      Lettuce: 3,
      default: 5
    };
  
    // Open modal & fetch plants
    demoBtn.addEventListener("click", () => {
      modal.style.display = "block";
      getPlants();
    });
  
    // Close handlers
    closeModalBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
    window.addEventListener("click", e => {
      if (e.target === modal) modal.style.display = "none";
    });
  
    // Execute Seeding Demo
    executeBtn.addEventListener("click", async () => {
      const sel = plants[plantDropdown.value];
      if (!sel) {
        console.error("No plant selected or still loading.");
        return modal.style.display = "none";
      }
  
      // choose a random spot (1–100)
      const x = Math.floor(Math.random()*100) + 1;
      const y = Math.floor(Math.random()*100) + 1;
  
      // derive depth by plant type
      const depth = depthMap[sel.planttype.toLowerCase()] ?? depthMap.default;
  
      const payload = {
        jobname: "Seeding Demo",
        seeds: [{
          xcoordinate: x,
          ycoordinate: y,
          depth:       depth,
          seedtype:    sel.planttype
        }]
      };
  
      try {
        const res = await fetch("/api/demo/seeding", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ payload, token: "" })
        });
        if (!res.ok) console.error("Seeding demo failed:", res.statusText);
      } catch (err) {
        console.error("Error executing seeding demo:", err);
      }
  
      modal.style.display = "none";
    });
  
    // fetch available plants
    async function getPlants() {
      plantDropdown.innerHTML = "<option>Loading…</option>";
      try {
        const res  = await fetch("/api/plants");
        const data = await res.json();
        plants = data;
        plantDropdown.innerHTML = "";
        data.forEach((p, i) => {
          const opt = document.createElement("option");
          opt.value = i;
          opt.textContent = 
            `${capitalize(p.planttype)} @ (${p.xcoordinate}, ${p.ycoordinate})`;
          plantDropdown.appendChild(opt);
        });
      } catch (e) {
        console.error("Error fetching plants:", e);
        plantDropdown.innerHTML = "<option>Error loading</option>";
      }
    }
  
    function capitalize(s) {
      return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }
  });
  