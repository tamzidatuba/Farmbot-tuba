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


class Backend {
  constructor(farmbot, statusManager) {
    this.notification_history = new Array();

    this.farmbot = farmbot;
    this.statusManager = statusManager;
    this.statusManager.backend = this;
    this.scheduleManager = new ScheduleManager();
  }

  appendNotification(notification) {
    // TODO put notification in database
    let date = new Date();
    // append date to the end of the string
    notification += date.getDate() +'.'+ (date.getMonth() + 1) +'.'+ date.getFullYear() +' '+ date.getHours() +':'+ date.getMinutes() +':'+ date.getSeconds();;
    this.notification_history.push(notification);
    while (this.notification_history.length > 10) {
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
    this.appendNotification("Job " + this.statusManager.currentJob.name + " finished at ");
    if (!this.checkForNextJob() && this.statusManager.currentJob.name != "GoHome") {
      this.statusManager.startJob(new GoHomeJob());
      this.appendNotification("Job GoHome started at ");
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
      this.appendNotification("Job " + nextJob.name + " started at ");
      return true
    }
    return false
  }

  pauseJob() {
    if (this.statusManager.runningJob && !this.statusManager.isPaused) {
      this.statusManager.pauseJob()
      res.status(200).json({ message: 'Paused a running job' });
    } else {
      res.status(500).json({ error: 'There is no job currently running' });
    }
  }

  continueJob() {
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
async function initalizeBackend() {
  let farmbot = await getFarmbot()
  let statusManager = new StatusManager(farmbot);
  console.log("Farmbot Initialised!");

  await waitForFirstStatus(farmbot);
  console.log("StatusManager Initialized");
  
  return new Backend(farmbot, statusManager);
}
/*
let seedingArgs = {"position": {"x": 100, "y": 100}}
let seedingJob = new SeedingJob(seedingArgs);

statusManager.startJob(seedingJob);

let WateringArgs ={"position": {"x": 100, "y": 100,"z": -50}, "duration":10}
let wateringJob = new WateringJob(WateringArgs);

statusManager.startJob(wateringJob);
*/

export {initalizeBackend};