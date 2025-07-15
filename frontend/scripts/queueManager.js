
import { isLoggedIn, token } from "./auth.js";
import { setLanguage, getTranslation } from "./translation.js";
import { customAlert } from "./popups.js";
import { customConfirm } from "./popups.js";

// View‐jobs modal
const viewQueueBtn = document.getElementById('viewQueueBtn');
const viewQueueModal = document.getElementById('viewQueueModal');
const queueList = document.getElementById('jobsListQueued');
const jobCountDisplay = document.getElementById('jobCountDisplayQueued');
const closeViewQueueBtn = document.getElementById('closeViewQueueModal');
const queueNameError = document.getElementById('jobQueueError');

let queue = new Array();
let job_progress = 0.0;
let open = false;
updateViewButton();

const JOB_VISUALS = {
    "Seeding": {icon: "🌱", color: "#195632"},
    "Watering": {icon: "💧", color: "#006ba1"}
}

closeViewQueueBtn.addEventListener('click', () => {
    viewQueueModal.style.display = 'none';
    open = false;
});

viewQueueBtn.addEventListener('click', () => {
    if (!isLoggedIn) return
    viewQueueModal.style.display = 'block';
    open = true;
    queueNameError.textContent = "";
    generateGUI();
});

function generateGUI() {
    queue = [{jobType: 'Seeding', job: {jobname: "MyJobName"}}, {jobType: 'Watering', job: {jobname: "MyWateringJobName"}}]
    jobCountDisplay.textContent = `${getTranslation('queuedJobs')}${queue.length}`;
    if (queue.length === 0) {
        jobsList.innerHTML = getTranslation('notFound');
        return;
    };
    queueList.innerHTML = '';
    queue.forEach((job, index) => {
        const isLast = index === queue.length - 1;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'queue-row';

        const job_element = document.createElement("div");
        job_element.className = "queue-element";
        job_element.style.backgroundColor = JOB_VISUALS[job.jobType].color;

        const icon_element = document.createElement("div");
        icon_element.className = "queue-icon";
        icon_element.textContent = JOB_VISUALS[job.jobType].icon;

        const title = document.createElement("div");
        title.className = "queue-title";
        title.textContent = job.job.jobname;
        
        job_element.appendChild(icon_element);
        job_element.appendChild(title);
        wrapper.appendChild(job_element);

        if (!isLast) {
            const dequeueBtn = document.createElement("button");
            dequeueBtn.className = "dequeue-btn";
            dequeueBtn.innerHTML = "❌";
            dequeueBtn.onclick = () => dequeueJob(job.job.jobname);
            wrapper.appendChild(dequeueBtn);
        } else {
            // Fortschrittsbalken einfügen
            const progressFill = document.createElement("div");
            progressFill.className = "progress-fill";
            progressFill.style.width = `${job_progress * 100}%`;
            progressFill.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
            job_element.appendChild(progressFill);
        }

        queueList.appendChild(wrapper);
    });
}

async function dequeueJob(jobname) {
    console.log(jobname);
    const res = await fetch(`/api/jobs/dequeue/${encodeURIComponent(jobname)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });
    const data = await res.json();
    if (!res.ok) queueNameError.textContent = data.error
    else {
        customAlert(jobname + " dequeued");
        queueNameError.textContent = "";
    }
}

function updateViewButton() {
    if (queue.length == 0) {
        viewQueueBtn.style.backgroundColor = "#ae1757";
        viewQueueBtn.innerHTML = `
        <div class="queue-icon">📆</div>
        <div class="queue-title">View Queue</div>
        <div class="progress-fill" style="width: 0%;"></div>
        `;
    }
    else {
        let job = queue[queue.length-1];
        viewQueueBtn.style.backgroundColor = JOB_VISUALS[job.jobType].color;
        viewQueueBtn.innerHTML = `
        <div class="queue-icon">${JOB_VISUALS[job.jobType].icon}</div>
        <div class="queue-title">View Queue</div>
        <div class="progress-fill" style="width: ${job.progress * 100}%;"></div>
        `;
    }
}

function updateQueue(new_queue, progress) {
    queue = new_queue;
    queue.reverse()
    job_progress = progress;
    if (open) {
        generateGUI();
    }
    updateViewButton();

};



export {
    updateQueue
};