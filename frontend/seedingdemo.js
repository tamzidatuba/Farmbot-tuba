document.addEventListener("DOMContentLoaded", () => {
    const demoBtn       = document.getElementById("seedingDemoBtn");
    const modal         = document.getElementById("seedingDemoModal");
    const closeModal    = document.getElementById("closeModalSeedingDemo");
    const executeBtn    = document.getElementById("executeBtnSeedingDemo");
    const depthMap      = { Tomato: 6, Radish: 10, Lettuce: 3, default: 5 };
    let plants          = [];
  
    // 1) Open & populate
    demoBtn.addEventListener("click", () => {
      modal.style.display = "block";
      getPlants();
    });
  
    // 2) Close modal
    closeModal.addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", e => {
      if (e.target === modal) modal.style.display = "none";
    });
  
    // 3) Execute the Seeding Demo POST
    executeBtn.addEventListener("click", async () => {
      const select = document.getElementById("plantDropdownSeeding");
      const idx    = parseInt(select.value, 10);
      const sel    = plants[idx];
  
      if (!sel) {
        console.error("Nothing selected or still loading.");
        modal.style.display = "none";
        return;
      }
  
      // pick a random spot (1–100)
      const x = Math.floor(Math.random() * 100) + 1;
      const y = Math.floor(Math.random() * 100) + 1;
  
      // derive depth
      const depth = depthMap[ capitalize(sel.planttype) ] 
                  ?? depthMap.default;
  
      // build payload
      const payload = {
        jobname: "Seeding Demo",
        seeds: [{
          xcoordinate: x,
          ycoordinate: y,
          depth:       depth,
          seedtype:    sel.planttype
        }]
      };
  
      // TODO: swap in your real auth token here
      const token = ""; 
  
      try {
        const res = await fetch("/api/demo/seeding", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ payload, token })
        });
        if (!res.ok) {
          console.error("Seeding demo failed:", res.status, res.statusText);
        } else {
          console.log("Seeding demo queued successfully!");
        }
      } catch (err) {
        console.error("Error executing seeding demo:", err);
      }
  
      modal.style.display = "none";
    });
  
    // 4) Fetch + fill dropdown
    async function getPlants() {
      const select = document.getElementById("plantDropdownSeeding");
      if (!select) {
        console.error("No #plantDropdownSeeding in DOM");
        return;
      }
      select.innerHTML = "";
  
      try {
        const res  = await fetch("/api/plants");
        const data = await res.json();
        plants      = Array.isArray(data) ? data : [];
  
        if (plants.length === 0) {
          select.innerHTML = "<option>(no plants found)</option>";
          return;
        }
  
        plants.forEach((p, i) => {
          const label = [
            capitalize(p.planttype),
            `X : ${p.xcoordinate}`,
            `Y : ${p.ycoordinate}`
          ].join(" ");
  
          select.add(new Option(label, i));
        });
      }
      catch (err) {
        console.error("Error fetching plants:", err);
        select.innerHTML = "<option>Error loading plants</option>";
      }
    }
  
    function capitalize(s) {
      return String(s).charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }
  });
  