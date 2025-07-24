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

// Optional: Close on background click
window.addEventListener('click', (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = 'none';
  }
});

// Get elements
const infoModal = document.getElementById('infoModal');
const openInfoBtn = document.getElementById('openInfoModal');

// Open modal
openInfoBtn.addEventListener('click', () => {
  infoModal.style.display = 'block';
});

// Close when clicking outside
window.addEventListener('click', (event) => {
  if (event.target === infoModal) {
    infoModal.style.display = 'none';
  }
});

const url = './customization/info_EN.pdf'; // the file in your /public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const loadingTask = pdfjsLib.getDocument(url);
loadingTask.promise.then(pdf => {
  const container = document.getElementById('infocontainer');

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    pdf.getPage(pageNumber).then(page => {
      const scale = 1.6;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      container.appendChild(canvas);

      page.render({ canvasContext: context, viewport });
    });
  }
});