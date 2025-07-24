import { token, isLoggedIn } from "./auth.js";
import { getTranslation } from "./translation.js";
import { languageSelector } from "./translation.js";
import { updateGrid, setbotposition } from "./canvas.js";
import { updateQueue } from "./queueManager.js";

let maxHistoryEntries = 10;
// button for max history entries
const entryLimitSelect = document.getElementById('entry-limit');
entryLimitSelect.value = maxHistoryEntries;

let previousChild = null;

// List to compare history with data base
var historyList = [];

//farmbot status
const statusBox = document.getElementById('farmbot-status');
const statusHistory = document.getElementById('status-history');
const pauseBtn = document.getElementById('pauseJobBtn');

// Update robot status, notifications and execution
export async function updateRobot() {
  //updateStatus();//change this to actually get status
  await fetch('/api/frontendData', {
    method: 'GET',
  })
    .then(response => response.json())
    .then(data => {
      setbotposition(data.farmbotPosition);
      updateQueue(data.executionPipeline, data.job_progress);

      // Update robot Status
      statusBox.textContent = getTranslation("status") + getTranslation(data.status.replace(/\s/g, '').toLowerCase());
      // Update Status History
      var temp = historyList.slice();
      if (temp.toString() != data.notifications.toString()) {
        // Clear the current status history
        while (statusHistory.children.length > 1) {
          statusHistory.removeChild(statusHistory.lastChild);
        }
        // Add new entries to the status history
        historyList = data.notifications;
        fillHistory(data.notifications.reverse());


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
      pauseBtn.textContent = data.paused ? '▶' : 'II';

      // Update plants
      window.plants = data.plants;
    })
    .catch(err => {
      console.error("Failed to fetch frontend data:", err);
      pauseBtn.style.display = 'none'; // hide on error
    });

  const res = await fetch('/api/jobs/Seeding'); // update seeding jobs
  const jobs = await res.json();
  window.seedingjobs = jobs;
  //ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  updateGrid(); // Update the grid on the canvas
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

function fillHistory (entries) {
  for (const status in entries) {
    if (statusHistory.children.length < maxHistoryEntries + 1) {
      const entry = document.createElement('div');
      if (historyList[status].key === "plant_deleted" || historyList[status].key === "plant_name_changed") {
        var textInput = historyList[status].date + " " + getTranslation(historyList[status].key) + historyList[status].jobname;
      } else {
        var textInput = historyList[status].date + " " + getTranslation(historyList[status].key.replace(/\s/g, '')) + " , " + getTranslation("jobname") + historyList[status].jobname;
      }
      entry.textContent = textInput;
      statusHistory.insertBefore(entry, previousChild);
      previousChild = entry;
    }
  }
  previousChild = null;
}


entryLimitSelect.addEventListener('change', () => {
  maxHistoryEntries = parseInt(entryLimitSelect.value);
  // Clear the current status history
  while (statusHistory.children.length > 1) {
    statusHistory.removeChild(statusHistory.lastChild);
  }
  // Add new entries to the status history
  fillHistory(historyList);
});

function translateHistory() {
  while (statusHistory.children.length > 1) {
    statusHistory.removeChild(statusHistory.lastChild);
  }
  // Add new entries to the status history
  fillHistory(historyList);
}

languageSelector.addEventListener('change', () => {
  translateHistory(); // Update history translations
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

    if (res.ok) {
      if (data.message && data.message.includes('No job')) {
        showError(data.message); // 👈 Show user-friendly error
      } else {
        pauseBtn.textContent = isCurrentlyPaused ? 'II' : '▶';
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