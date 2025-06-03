import { StatusManager } from "./statusManager.js";
import {getFarmbot} from './farmbotInitializer.js';
import { ScheduleManager } from "./scheduleManager.js";
import DatabaseService from '../databaseservice.js';
import { GoHomeJob } from '../jobs/GoHomeJob.js';
import { SeedingJob} from '../jobs/SeedingJob.js';
import { WateringJob} from '../jobs/WateringJob.js';

// TODO delete
const JobNotification = Object.freeze({
    JOB_CREATED: "Job created",
    JOB_MODIFIED: "Job modified",
    JOB_DELETED: "Job deleted",
    JOB_STARTED: "Job started",
    JOB_FINISHED: "Job finished"
});

const MAX_NOTIFICATIONS = 50;

class Backend {
  constructor() {
    this.notification_history = new Array();
    this.scheduleManager = new ScheduleManager();
  }

  init(farmbot, statusManager) {
    this.farmbot = farmbot;
    this.statusManager = statusManager;
    this.statusManager.backend = this;
  }

  generateFrontendData() {
    return {
      "status": this.statusManager.status,
      "notifications": this.notification_history,
      "executionPipeline": this.scheduleManager.jobsToExecute
    }
  }

  appendNotification(notification) {
    // TODO put notification in database
    let date = new Date();
    // append date to the end of the string
    let dateString = '[' + date.getDate().toString().padStart(2, "0") +'-'+ (date.getMonth() + 1).toString().padStart(2, "0") +'-'+ date.getFullYear() +'|'+ date.getHours().toString().padStart(2, "0") +':'+ date.getMinutes().toString().padStart(2, "0") +':'+ date.getSeconds().toString().padStart(2, "0") + "] ";
    notification = dateString + notification
    this.notification_history.push(notification);
    while (this.notification_history.length > MAX_NOTIFICATIONS) {
      this.notification_history.shift();
    }
  }

  async queueJob(job_id, res) {
    try {
      // TODO wait for get-job method
      let job = await DatabaseService.getJob(job_id);
      this.scheduleManager.appendJob(job);
      this.checkForNextJob();
      res.status(200).json({ message: 'Job queued' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to queue job' });
    }
  }

  finishJob() {
    console.log("Finished a Job");
    this.appendNotification("Job " + this.statusManager.currentJob.name + " finished.");
    if (!this.checkForNextJob() && this.statusManager.currentJob.name != "GoHome") {
      this.statusManager.startJob(new GoHomeJob());
      this.appendNotification("Job GoHome started.");
    }
  }

  checkForNextJob() {
    if (this.statusManager.runningJob) {
      return false
    }
    if (this.scheduleManager.isJobScheduled()) {
      let nextJob = this.scheduleManager.getScheduledJob();
      if ("nextExecution" in nextJob) {
        this.scheduleManager.calculateNextSchedule(nextJob);
      }
      // translate job-dictionary into job-object
      let jobObject;
      switch(nextJob.jobType) {
        case "seeding": 
          jobObject = new SeedingJob(nextJob);
          break;
        case "watering":
          jobObject = new WateringJob(nextJob);
          break;
        default:
          console.log("Job has no valid Job-Type. Cancelling...");
          return
      }
      this.statusManager.startJob(jobObject);
      this.appendNotification("Job " + nextJob.name + " started.");
      return true
    }
    return false
  }

  pauseJob(res) {
    if (this.statusManager.runningJob && !this.statusManager.isPaused) {
      console.log(this.statusManager.runningJob);
      this.statusManager.pauseJob()
      res.status(200).json({ message: 'Paused a running job' });
    } else {
      res.status(500).json({ error: 'There is no job currently running' });
    }
  }

  continueJob(res) {
    if (this.statusManager.runningJob && this.statusManager.isPaused) {
      this.statusManager.continueJob()
      res.status(200).json({ message: 'Resumed a paused job' });
    } else {
      res.status(500).json({ error: 'There is no job currently paused' });
    }
  }

  cancelJob() {
    this.statusManager.cancelJob();
  }


}

// Method necessary to get the current state of the farmbot. Awaits the status-callback
function waitForFirstStatus(farmbot) {
  return new Promise((resolve) => {
    farmbot.on("status", (status) => {
      resolve(status);
    }, true);
  });
}
async function initalizeBackend(backend) {
  let farmbot = await getFarmbot()
  let statusManager = new StatusManager(farmbot);
  console.log("Farmbot Initialised!");

  await waitForFirstStatus(farmbot);
  console.log("StatusManager Initialized");
  
  backend.init(farmbot, statusManager);
}

export {initalizeBackend, Backend};