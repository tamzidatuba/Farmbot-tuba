const toggle = document.getElementById('createTaskToggle');
const subtask = document.getElementById('subtaskContainer');
const arrow = document.getElementById('arrow');
const modal = document.getElementById('seedingModal');
const closeModal = document.getElementById('closeModal');
const executeBtn = document.getElementById('executeBtn');
const seedingJobBtn = document.getElementById('seedingJobBtn');
//grid ids
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const coordDisplay = document.getElementById('hover-coordinates');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Farm-robot coordinate system
const coordWidth = 395;
const coordHeight = 650;

toggle.addEventListener('click', () => {
  const isVisible = subtask.style.display === 'block';
  subtask.style.display = isVisible ? 'none' : 'block';
  arrow.classList.toggle('open', !isVisible);
});

seedingJobBtn.addEventListener('click', () => {
  modal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

executeBtn.addEventListener('click', () => {
  const plant = document.getElementById('plantType').value;
  const x = Number(document.getElementById('xCoord').value);
  const y = Number(document.getElementById('yCoord').value);
  const depth = Number(document.getElementById('depth').value);

  let isValid = true;

  // Clear all errors
  document.getElementById('plantError').textContent = '';
  document.getElementById('xError').textContent = '';
  document.getElementById('yError').textContent = '';
  document.getElementById('depthError').textContent = '';

  // Validate Plant
  if (!plant) {
    document.getElementById('plantError').textContent = 'Please select a plant type.';
    isValid = false;
  }

  // Validate X
  if (isNaN(x) || x < 0 || x > 395 || x=='') {
    document.getElementById('xError').textContent = 'X must be between 0 and 395.';
    isValid = false;
  }

  // Validate Y
  if (isNaN(y) || y < 0 || y > 650 || y=='') {
    document.getElementById('yError').textContent = 'Y must be between 0 and 650.';
    isValid = false;
  }

  // Validate Depth
  if (isNaN(depth) || depth <= 0 || depth===' ') {
    document.getElementById('depthError').textContent = 'Depth must be greater than 0.';
    isValid = false;
  }

  if (!isValid) return;

  // If all inputs are valid
  alert(`Seeding Job Created:\nPlant: ${plant}\nCoordinates: (${x}, ${y})\nDepth: ${depth}mm`);
  modal.style.display = 'none';
})

// Draw grid lines for visual reference
function drawGrid() {
  const stepX = canvasWidth / 10;
  const stepY = canvasHeight / 10;
  ctx.strokeStyle = '#ddd';

  for (let x = 0; x <= canvasWidth; x += stepX) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }

  for (let y = 0; y <= canvasHeight; y += stepY) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

// Map pixel to real-world coordinate
function pixelToCoord(x, y) {
  const coordX = Math.round((x / canvasWidth) * coordWidth);
  const coordY = Math.round((y / canvasHeight) * coordHeight);
  return { x: coordX, y: coordY };
}

// Map real-world coordinate to pixel
function coordToPixel(x, y) {
  const px = (x / coordWidth) * canvasWidth;
  const py = (y / coordHeight) * canvasHeight;
  return { x: px, y: py };
}

// Handle hover
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const hoverX = e.clientX - rect.left;
  const hoverY = e.clientY - rect.top;

  const coords = pixelToCoord(hoverX, hoverY);
  coordDisplay.style.left = `${e.clientX - 200}px`;
  coordDisplay.style.top = `${e.clientY + 15}px`;
  coordDisplay.textContent = `(${coords.x}, ${coords.y})`;
  coordDisplay.style.display = 'block';
});

canvas.addEventListener('mouseleave', () => {
  coordDisplay.style.display = 'none';
});

// Draw robot
let robot = { x: 0, y: 0 };

function drawRobot() {
  const pos = coordToPixel(robot.x, robot.y);
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#4caf50';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.stroke();
}

// Simulate robot moving
function updateRobot() {
  robot.x = Math.floor(Math.random() * coordWidth);
  robot.y = Math.floor(Math.random() * coordHeight);

  clearCanvas();
  drawGrid();
  drawRobot();
}

// Initial draw
drawGrid();
drawRobot();

// Update every 1 second
setInterval(updateRobot, 1000);