import { drawGrid } from "./scripts/canvas.js";
import { updateRobot } from "./scripts/notification_status.js";
import "./scripts/watering.js";
import "./scripts/seeding.js";
import "./scripts/TouchFunctions.js";

const toggle = document.getElementById('createTaskToggle');
const viewJobs = document.getElementById('viewJobs');
const subtask = document.getElementById('subtaskContainer');
const subtaskView = document.getElementById('subtaskView');
const arrow = document.getElementById('arrow');
const arrowView = document.getElementById('arrowView');
const managePlants = document.getElementById('managePlants');
const subtaskManage = document.getElementById('subtaskManage');
const arrowmanageView = document.getElementById('arrowmanageView');

window.addEventListener('DOMContentLoaded', () => {
  toggle.style.display = 'none';
  viewJobs.style.display = 'none';
  managePlants.style.display = 'none';
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

await updateRobot();
setInterval(async () => await updateRobot(), 1000); // Update every 1 second
drawGrid(); // draw plants

// Close #questionSection when clicking outside of it
document.addEventListener('click', function (event) {
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
// Close the question form when close button is clicked
document.getElementById('closeQuestionSection').addEventListener('click', () => {
  document.getElementById('questionSection').style.display = 'none';
});



// Handle form submission 

document.getElementById('questionForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const emailInput = document.getElementById('email');
  const questionInput = document.getElementById('question');
  const statusDiv = document.getElementById('questionStatus');

  const email = emailInput.value.trim();
  const question = questionInput.value.trim();

  try {
    const res = await fetch('/api/ask-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, question })
    });

    const result = await res.json();

    if (res.ok) {
      statusDiv.textContent = result.message;
      emailInput.value = '';
      questionInput.value = '';
    } else {
      statusDiv.textContent = result.error || 'Something went wrong.';
    }
  } catch (error) {
    console.error('Submission error:', error);
    statusDiv.textContent = 'Server error. Please try again later.';
  }
});


// Optional: Close on background click
window.addEventListener('click', (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = 'none';
  }
});

  // Get elements
  const infoModal = document.getElementById('infoModal');
  const openInfoBtn = document.getElementById('openInfoModal');
  const closeInfoModal = document.getElementById('closeInfoModal');

  // Open modal
  openInfoBtn.addEventListener('click', () => {
    infoModal.style.display = 'block';
  });

  // Close modal
  closeInfoModal.addEventListener('click', () => {
    infoModal.style.display = 'none';
  });

  // Close when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === infoModal) {
      infoModal.style.display = 'none';
    }
  });

