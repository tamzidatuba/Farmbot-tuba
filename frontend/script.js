import { drawGrid } from "./scripts/canvas.js";
import { updateRobot } from "./scripts/notification_status.js";
import "./scripts/watering.js";
import "./scripts/seeding.js";
import { getTranslation } from "./scripts/translation.js";

const toggle = document.getElementById('createTaskToggle');
const viewJobs = document.getElementById('viewJobs');
const subtask = document.getElementById('subtaskContainer');
const subtaskView = document.getElementById('subtaskView');
const arrow = document.getElementById('arrow');
const arrowView = document.getElementById('arrowView');

// List to compare plants with data base
window.plants = [];

//plant class
export class Plant {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
  }
}


window.addEventListener('DOMContentLoaded', () => {
  toggle.style.display = 'none';
  //subtask.style.display='none';
  viewJobs.style.display = 'none';
});

viewJobs.addEventListener('click', () => {
  const isVisible = subtaskView.style.display === 'block';
  subtaskView.style.display = isVisible ? 'none' : 'block';
  arrowView.classList.toggle('open', !isVisible);
});

toggle.addEventListener('click', () => {
  const isVisible = subtask.style.display === 'block';
  subtask.style.display = isVisible ? 'none' : 'block';
  arrow.classList.toggle('open', !isVisible);
});

// get plants from server
async function getPlants() {
  await fetch('/api/plants', {
    method: 'GET',
  })
    .then(response => response.json())
    .then(data => {
      if (window.plants.toString() != data.toString()) {
        //if (plants.toString() != data.toString()) {
        window.plants.length = 0; // Clear the existing plants array
        console.log("Plants fetched from server:", data);
        for (const plant of data) {
          window.plants.push(new Plant(Number(plant.xcoordinate), Number(plant.ycoordinate), plant.planttype));
        }
      }
    })
    .catch(error => console.error('Error fetching plants:', error));
}

await getPlants(); // get data of plants
await updateRobot();
setInterval(async () => await updateRobot(), 2500); // Update every 1 second
drawGrid(); // draw plants
//drawRobot();


//ask questions
document.getElementById('openQuestionFormBtn').addEventListener('click', () => {
  const section = document.getElementById('questionSection');
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
});

// Handle form submission 

const form = document.getElementById('questionForm');

form.addEventListener('submit', async function(e) {
  e.preventDefault();


  const email = document.getElementById('email').value.trim();
  const question = document.getElementById('question').value.trim();

  const response = await fetch('/api/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, question })
  });

  const data = await response.json();

  if (response.ok) {
    alert(data.message);
    form.reset(); // clears fields after successful submission
  } else {
    alert(data.message || getTranslation("somethingWrong"));
  }
});

export {
  Plant
}