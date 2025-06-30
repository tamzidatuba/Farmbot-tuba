document.addEventListener("DOMContentLoaded", () => {
    const demoBtn        = document.getElementById("seedingDemoBtn");
    const modal          = document.getElementById("seedingDemoModal");
    const closeModalBtn  = document.getElementById("closeModalSeedingDemo");
    const seedDropdown   = document.getElementById("seedDropdown");
    const executeBtn     = document.getElementById("executeBtnSeedingDemo");
    let seeds            = [];
  
    // Open modal & load seed options
    demoBtn.addEventListener("click", () => {
      modal.style.display = "block";
      getSeeds();
    });
  
    // Close modal
    closeModalBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
    window.addEventListener("click", e => {
      if (e.target === modal) modal.style.display = "none";
    });
  
    // Execute Seeding Demo
    executeBtn.addEventListener("click", async () => {
      const selected = seeds[seedDropdown.value];
      if (selected) {
        const seedsToPlant = [{
          xcoordinate: selected.xcoordinate,
          ycoordinate: selected.ycoordinate,
          depth:       selected.depth ?? 5,
          seedtype:    selected.seedtype
        }];
  
        const payload = {
          jobname: "Seeding Demo",
          seeds:   seedsToPlant
        };
  
        try {
          const response = await fetch("/api/demo/seeding", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ payload, token: "" })
          });
          if (!response.ok) {
            console.error("Seeding demo failed:", response.statusText);
          }
        } catch (err) {
          console.error("Error executing seeding demo:", err);
        }
      } else {
        console.error("No seed selected or seeds still loading.");
      }
      modal.style.display = "none";
    });
  
    // Fetch seed options
    async function getSeeds() {
      seedDropdown.innerHTML = "<option>Loading…</option>";
      try {
        const res  = await fetch("/api/seeds");
        const data = await res.json();
        seeds = data;
        seedDropdown.innerHTML = "";
        data.forEach((sd, idx) => {
          const opt = document.createElement("option");
          opt.value = idx;
          opt.textContent = `${capitalizeFirstLetter(sd.seedtype)} @ (${sd.xcoordinate}, ${sd.ycoordinate})`;
          seedDropdown.appendChild(opt);
        });
      } catch (e) {
        console.error("Error fetching seeds:", e);
        seedDropdown.innerHTML = "<option>Error loading</option>";
      }
    }
  
    function capitalizeFirstLetter(str) {
      return str
        ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
        : "";
    }
  });
  