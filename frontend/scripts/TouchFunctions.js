import { pixelToCoord, coordToPixel, drawGrid, clearCanvas } from "./canvas.js";
import { token, isLoggedIn } from "./auth.js";
import { getTranslation } from "./translation.js";
import { DisplayCreateSeedingJobForTouchedBased } from "./seeding.js";

let selectedPlant = null;
const canvas = document.getElementById('gridCanvas');

function GetDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}

canvas.addEventListener('click', async (e) => {
  if (isLoggedIn || !isLoggedIn) {
    let coordDisplay = pixelToCoord(e.offsetX, e.offsetY);
    let x = coordDisplay.x;
    let y = coordDisplay.y;

    // Find the clicked plant
    selectedPlant = null;
    for (let plant of window.plants) {
      const distance = GetDistance(x, y, plant.xcoordinate, plant.ycoordinate);

      // const radius = PlantRadii[plant.planttype];
      const radius = 15;
      if (radius !== undefined && distance <= radius) {
        selectedPlant = plant;
        break; // Stop at the first match
      }
    }

    let innerCanvasCoordinateInPixel = coordToPixel(x, y);
    const canvasRect = canvas.getBoundingClientRect();
    let positiononscreen = {
      x: canvasRect.left + innerCanvasCoordinateInPixel.x,
      y: canvasRect.top + innerCanvasCoordinateInPixel.y
    };



    // Remove any existing delete button
    let oldButton = document.getElementById('tempDeleteBtn');
    if (oldButton) oldButton.remove();

    if (selectedPlant) {
      const deleteBtn = document.createElement('button');
      deleteBtn.id = 'tempDeleteBtn';
      deleteBtn.textContent = 'X';
      deleteBtn.style.position = 'absolute';
      deleteBtn.style.left = `${positiononscreen.x}px`;
      deleteBtn.style.top = `${positiononscreen.y}px`;
      deleteBtn.style.zIndex = 1000;
      deleteBtn.style.backgroundColor = 'red';
      deleteBtn.style.color = 'white';
      deleteBtn.style.fontSize = '24px';
      deleteBtn.style.width = '25px';
      deleteBtn.style.height = '25px';
      deleteBtn.style.borderRadius = '50%'; // Circle
      deleteBtn.style.display = 'flex';
      deleteBtn.style.justifyContent = 'center';
      deleteBtn.style.alignItems = 'center';
      deleteBtn.style.cursor = 'pointer';

      deleteBtn.addEventListener('click', async () => {
        await deletePlant(selectedPlant);
        deleteBtn.remove();
      });

      document.body.appendChild(deleteBtn);

      // Hide the button when clicking outside of it
      const outsideClickListener = (event) => {
        if (!deleteBtn.contains(event.target)) {
          deleteBtn.remove();
          document.removeEventListener('click', outsideClickListener);
        }
      };

      setTimeout(() => {
        document.addEventListener('click', outsideClickListener);
      }, 0);
    }
    else // show watering emoji
    {
      // DisplayCreateSeedingJobForTouchedBased(x,y);

      // const wateringBtn = document.createElement('button');
      // wateringBtn.id = 'tempWateringBtn';
      // wateringBtn.textContent = '🚿';
      // wateringBtn.style.position = 'absolute';
      // wateringBtn.style.left = `${positiononscreen.x}px`;
      // wateringBtn.style.top = `${positiononscreen.y}px`;
      // wateringBtn.style.zIndex = 1000;
      // wateringBtn.style.backgroundColor = 'white';
      // wateringBtn.style.color = 'white';
      // wateringBtn.style.fontSize = '24px';
      // wateringBtn.style.width = '25px';
      // wateringBtn.style.height = '25px';
      // wateringBtn.style.borderRadius = '50%'; // Circle
      // wateringBtn.style.display = 'flex';
      // wateringBtn.style.justifyContent = 'center';
      // wateringBtn.style.alignItems = 'center';
      // wateringBtn.style.cursor = 'pointer';

      // wateringBtn.addEventListener('click', async () => {
      //   await deletePlant(selectedPlant);
      //   wateringBtn.remove();
      // });

      // document.body.appendChild(wateringBtn);

      // // Hide the button when clicking outside of it
      // const outsideClickListener = (event) => {
      //   if (!wateringBtn.contains(event.target)) {
      //     wateringBtn.remove();
      //     document.removeEventListener('click', outsideClickListener);
      //   }
      // };

      // setTimeout(() => {
      //   document.addEventListener('click', outsideClickListener);
      // }, 0);
    }
  }
});

async function deletePlant(plant) {
  let xcoordinate = plant.xcoordinate;
  let ycoordinate = plant.ycoordinate;
  const res = await fetch('/api/plant', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, xcoordinate, ycoordinate })
    });
  const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Delete failed');
  alert(data.message || 'Plant deleted');
  clearCanvas();
  await getPlants(); //TODO:  remove it from variable instead of fetching again
  drawGrid();
}


async function getPlants() {
  await fetch('/api/plants', {
    method: 'GET',
  })
    .then(response => response.json())
    .then(data => {
        window.plants.length = 0; // Clear the existing plants array
        for (const plant of data) {
          window.plants.push(new Plant(plant.planttype, Number(plant.xcoordinate), Number(plant.ycoordinate)));
        }
    })
    .catch(error => console.error('Error fetching plants:', error));
}

class Plant {
  constructor(type, x, y) {
    this.planttype = type;
    this.xcoordinate = x;
    this.ycoordinate = y;
  }
}