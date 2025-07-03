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
const managePlants=document.getElementById('managePlants');
const subtaskManage=document.getElementById('subtaskManage');
// List to compare plants with data base
window.plants = [];

//plant class
class Plant {
  constructor(type, x, y) {
    this.planttype = type;
    this.xcoordinate = x;
    this.ycoordinate = y;
  }
}


window.addEventListener('DOMContentLoaded', () => {
  toggle.style.display = 'none';
  //subtask.style.display='none';
  viewJobs.style.display = 'none';
  managePlants.style.display='none';
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

managePlants.addEventListener('click', () => {
  const isVisible = subtaskManage.style.display === 'block';
  subtaskManage.style.display = isVisible ? 'none' : 'block';
  arrow.classList.toggle('open', !isVisible);
});


// get plants from server
async function getPlants() {
  await fetch('/api/plants', {
    method: 'GET',
  })
    .then(response => response.json())
    .then(data => {
        //if (plants.toString() != data.toString()) {
        window.plants.length = 0; // Clear the existing plants array
        for (const plant of data) {
          window.plants.push(new Plant(plant.planttype, Number(plant.xcoordinate), Number(plant.ycoordinate)));
        }
    })
    .catch(error => console.error('Error fetching plants:', error));
}

await getPlants(); // get data of plants
await updateRobot();
setInterval(async () => await updateRobot(), 2500); // Update every 1 second
drawGrid(); // draw plants
//drawRobot();

// Close #questionSection when clicking outside of it
  document.addEventListener('click', function(event) {
    const questionSection = document.getElementById('questionSection');

    // Only proceed if it's currently visible
    if (questionSection.style.display !== 'none' && event.target.id !== 'openQuestionFormBtn') {
      const isClickInside = questionSection.contains(event.target);
      // If the click was outside the questionSection, hide it
      if (!isClickInside) {
        questionSection.style.display = 'none';
      }
    }
  });

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

// Optional: Close on background click
window.addEventListener('click', (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = 'none';
  }
});
//end of login and logout feature

export {
  Plant
}

