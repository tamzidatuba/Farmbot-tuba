import { token } from './auth.js';    
import { getTranslation } from './translation.js';

// 1) Create the modal HTML and append to body
const modalHtml = `
  <div id="deletePlantModal" class="modal" style="display:none;">
    <div class="modal-content">
      <span class="close" id="closeDeleteModal">&times;</span>
      <h2 data-i18n="plantDelete">${getTranslation("plantDelete")}</h2>
      <div>
        <label data-i18n="plantChoose" for="plantSelect">${getTranslation("plantChoose")}</label>
        <select id="plantSelect" style="width:100%; box-sizing:border-box; padding:0.5em;"></select>
      </div>
      <div style="margin-top:1em;">
        <button data-i18n="delete" id="confirmDeleteBtn">${getTranslation("delete")}</button>
      </div>
      <div id="deleteError" class="errorMsg" style="color:red; margin-top:0.5em;"></div>
    </div>
  </div>
`;
document.body.insertAdjacentHTML('beforeend', modalHtml);

// 2) Grab all the elements we need
const deleteBtn     = document.getElementById('deleteplants');
const deleteModal   = document.getElementById('deletePlantModal');
const closeDelete   = document.getElementById('closeDeleteModal');
const plantSelect   = document.getElementById('plantSelect');
const confirmDelete = document.getElementById('confirmDeleteBtn');
const deleteError   = document.getElementById('deleteError');

// 3) Open the modal and load plants
deleteBtn.addEventListener('click', async () => {
  deleteError.textContent = '';
  plantSelect.innerHTML  = `<option>Loading…</option>`;
  deleteModal.style.display = 'block';

  plantSelect.innerHTML = ''; // clear previous options
  plantSelect.innerHTML = window.plants.map(p => {
    // label for user, value as "x,y"
      const label = `${p.plantname}: ${getTranslation(p.planttype)} ${getTranslation("at")}  X:${p.xcoordinate}  Y:${p.ycoordinate}`;
      const value = `${p.xcoordinate},${p.ycoordinate}`;
      return `<option value="${value}">${label}</option>`;
    }).join('');
  /*try {
    const res = await fetch('/api/plants');
    if (!res.ok) throw new Error('Failed to fetch plants');
    const plants = await res.json();

    plantSelect.innerHTML = plants.map(p => {
      // label for user, value as "x,y"
      const label = `${p.planttype}  X:${p.xcoordinate}  Y:${p.ycoordinate}`;
      const value = `${p.xcoordinate},${p.ycoordinate}`;
      return `<option value="${value}">${label}</option>`;
    }).join('');

  } catch (err) {
    plantSelect.innerHTML = `<option disabled>Error loading plants</option>`;
    console.error(err);
  }*/
});

// 4) Close handlers
closeDelete.addEventListener('click', () => deleteModal.style.display = 'none');
window.addEventListener('click', e => {
  if (e.target === deleteModal) deleteModal.style.display = 'none';
});

// 5) Confirm delete
confirmDelete.addEventListener('click', async () => {
  deleteError.textContent = '';

  // split the "x,y" into two numbers
  const [xcoordinate, ycoordinate] = plantSelect.value
    .split(',')
    .map(val => Number(val.trim()));

  console.log('Deleting plant at:', { xcoordinate, ycoordinate, token });

  try {
    const res = await fetch('/api/plant', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, xcoordinate, ycoordinate })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Delete failed');

    alert(data.message || 'Plant deleted');
    deleteModal.style.display = 'none';

    // Remove the option from the select
    const opt = plantSelect.querySelector(
      `option[value="${xcoordinate},${ycoordinate}"]`
    );
    if (opt) opt.remove();

  } catch (err) {
    deleteError.textContent = err.message;
    console.error('deletePlant error:', err);
  }
});
