const toggle = document.getElementById('createTaskToggle');
const subtask = document.getElementById('subtaskContainer');
const arrow = document.getElementById('arrow');
const modal = document.getElementById('seedingModal');
const closeModal = document.getElementById('closeModal');
const executeBtn = document.getElementById('executeBtn');
const seedingJobBtn = document.getElementById('seedingJobBtn');

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
});