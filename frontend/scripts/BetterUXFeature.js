import { pixelToCoord, coordToPixel } from "./scripts/canvas.js";
import { token } from "./scripts/auth.js";

let selectedPlant = null;
const canvas = document.getElementById('gridCanvas');

function GetDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}
const PlantRadii = {
  lettuce: 15,
  tomato: 30,
  radish: 2,
}
canvas.addEventListener('click', (e) => {
  let coordDisplay = pixelToCoord(e.offsetX, e.offsetY);
  //alert("x is: " + coordDisplay.x + " and y is:" + coordDisplay.y);
  let x = coordDisplay.x;
  let y = coordDisplay.y;

  // Find the clicked plant
  selectedPlant = null;
  for (let plant of window.plants) {
    const distance = GetDistance(x, y, plant.xcoordinate, plant.ycoordinate);

    const radius = PlantRadii[plant.planttype];
    if (radius !== undefined && distance <= radius) {
      selectedPlant = plant;
      break; // Stop at the first match
    }
  }

  if (selectedPlant) {
    //alert(`Selected plant: ${selectedPlant.planttype} at (${selectedPlant.xcoordinate}, ${selectedPlant.ycoordinate})`);
  } else {
    //alert("No plant selected.");
  }

  let innerCanvasCoordinateInPixel = coordToPixel(x, y);
  //alert("real coordinates x:" + innerCanvasCoordinateInPixel.x + " real coordinate y:" + innerCanvasCoordinateInPixel.y);
  //alert("real position on screen x:" + (innerCanvasCoordinateInPixel.x + canvas.width) + " real position on screen y:" + (innerCanvasCoordinateInPixel.y + canvas.height));

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

    deleteBtn.addEventListener('click', () => {
      deletePlant(selectedPlant); 
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


});

function deletePlant(plant) {
  fetch('/api/plant', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, plant.xcoordinate, plant.ycoordinate })
  })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        alert(data.message);
        // Remove the plant from the local array
        window.plants = window.plants.filter(p => p !== plant);
        drawGrid(); // Redraw the grid without the deleted plant
      } else {
        alert(getTranslation("somethingWrong"));
      }
    })
    .catch(error => console.error('Error deleting plant:', error));
}