import { token,isLoggedIn } from "./auth.js";
import { Plant } from "../script.js";
import { getTranslation } from "./translation.js";

let maxHistoryEntries = 10;
// button for max history entries
const entryLimitSelect = document.getElementById('entry-limit');
entryLimitSelect.value = maxHistoryEntries;

// List to compare history with data base
var historyList = [];

//farmbot status
const statusBox = document.getElementById('farmbot-status');
const statusHistory = document.getElementById('status-history');
const pauseBtn = document.getElementById('pauseJobBtn');


const title = statusHistory.querySelector('.history-header');
const historyBox = document.getElementById('notification-history');


// Update robot status, notifications and execution
export async function updateRobot() {
  //updateStatus();//change this to actually get status
  await fetch('/api/frontendData', {method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    // Update robot Status
    statusBox.textContent = getTranslation("status") + getTranslation(data.status.replace(/\s/g, '').toLowerCase());
    // Update Status History
    var temp = historyList.slice().reverse();
    if (temp.toString() != data.notifications.toString()) {
      // Clear the current status history
      while (statusHistory.children.length > 1) {
        statusHistory.removeChild(statusHistory.lastChild);
      }
      // Add new entries to the status history
      for (const status in data.notifications.reverse()) {  
        if (statusHistory.children.length < maxHistoryEntries + 1) {
          const entry = document.createElement('div');
          console.log("Status:", data.notifications[status].key.replace(/\s/g, ''))
          var textInput = data.notifications[status].date +" " + getTranslation(data.notifications[status].key.replace(/\s/g, ''))  + " , " + getTranslation("jobname") + data.notifications[status].jobname;
          entry.textContent = textInput;
          statusHistory.appendChild(entry);
        }
      }
      historyList = data.notifications;
    }
    // Update Pause Button visibility
    const pauseBtn = document.getElementById('pauseJobBtn');
    if (!isLoggedIn) {
      // always hidden if  not logged in
      pauseBtn.style.display = 'none';
    } else {
      // otherwise show/hide per the robot status
      pauseBtn.style.display =
        data.status === 'Ready' || data.status === 'Offline'
          ? 'none'
          : 'inline-block';
    }
    // Update button text depending on paused state
    pauseBtn.textContent = data.paused ? '▶' : '⏸';

    //Update plants
    if (!(arraysEqual(window.plants, removeId(data.plants)))) {
    //if (plants.toString() != data.toString()) {
      window.plants.length = 0; // clear it
      for (const plant of data.plants) {
        window.plants.push(new Plant(plant.planttype, Number(plant.xcoordinate), Number(plant.ycoordinate)));
      }
    }
    })
    .catch(err => {
      console.error("Failed to fetch frontend data:", err);
      pauseBtn.style.display = 'none'; // hide on error
    });
    //ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    //drawGrid();
  }

  function removeId(obj) {
    const { _id, ...rest } = obj;
    return rest;
  }

function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;

  return arr1.every((obj1, index) => {
    const obj2 = arr2[index];
    console.log("Comparing objects:", obj1, obj2);
    console.log("Check objects:", JSON.stringify(obj1) === JSON.stringify(removeId(obj2)));
    return JSON.stringify(obj1) === JSON.stringify(removeId(obj2));
  });
}


  entryLimitSelect.addEventListener('change', () => {
  if (maxHistoryEntries < parseInt(entryLimitSelect.value)) {
    maxHistoryEntries = parseInt(entryLimitSelect.value);
    // Clear the current status history
    while (statusHistory.children.length > 1) {
      statusHistory.removeChild(statusHistory.lastChild);
    }
    // Add new entries to the status history
    for (const status in historyList) {  
      if (statusHistory.children.length < maxHistoryEntries + 1) {
        const entry = document.createElement('div');
        entry.textContent = historyList[status];
        statusHistory.appendChild(entry);
      }
    }
  } else {
    maxHistoryEntries = parseInt(entryLimitSelect.value);
    while (statusHistory.children.length > 1) {
      statusHistory.removeChild(statusHistory.lastChild);
    }
    // Add new entries to the status history
    for (const status in historyList) {  
      if (statusHistory.children.length < maxHistoryEntries + 1) {
        const entry = document.createElement('div');
        entry.textContent = historyList[status];
        statusHistory.appendChild(entry);
      }
    }
  }  
});


pauseBtn.addEventListener('click', async () => {
  const isCurrentlyPaused = pauseBtn.textContent.includes('▶');
  const endpoint = isCurrentlyPaused ? '/api/jobs/resume' : '/api/jobs/pause';

  try {
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const data = await res.json();

    if (res.status === 200) {
      if (data.message && data.message.includes('No job')) {
        showError(data.message); // 👈 Show user-friendly error
      } else {
        pauseBtn.textContent = isCurrentlyPaused ? '⏸' : '▶';
        //hideError(); // hide if previously shown
      }
    } else {
      showError(data.error || 'Failed to process the request.');
    }
  } catch (err) {
    console.error(err);
    showError('Network error: ' + err.message);
  }
});

function showError(message) {
  const errorBox = document.getElementById('errorMessage');
  errorBox.textContent = `⚠️ ${message}`;
  errorBox.classList.add('show');

  setTimeout(() => {
    errorBox.classList.remove('show');
  }, 3000);
}