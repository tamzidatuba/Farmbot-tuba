import { StatusManager } from "./statusManager.js";
import {getFarmbot} from './farmbotInitializer.js';
import { ScheduleManager } from "./scheduleManager.js";
import DatabaseService from '../databaseservice.js';
import { GoHomeJob } from './jobs/GoHomeJob.js';
import { SeedingJob} from './jobs/SeedingJob.js';
import { WateringJob} from './jobs/WateringJob.js';

const MAX_NOTIFICATIONS = 50;

const FieldConstants = Object.freeze({
    FIELD_START_X: 0,
    FIELD_START_Y: 0,
    FIELD_END_X: 490,
    FIELD_END_Y: 640,
    SAFETY_HEIGHT: 0,
    FIELD_HEIGHT: -285,
    SEED_CONTAINER_Y: 800,
    SEED_CONTAINER_HEIGHT: -110
});

class Backend {
  constructor() {
    this.notification_history = new Array();
    this.scheduleManager = new ScheduleManager(this);
    this.statusManager = new StatusManager(this);
    this.currentJobData;
    this.plants = new Array();
  }

  generateFrontendData() {
    return {
      "status": this.statusManager.status,
      "paused": this.statusManager.isPaused,
      "notifications": this.notification_history,
      "executionPipeline": this.scheduleManager.jobsToExecute,
      "farmbotPosition": this.statusManager.lastState.location_data.position,
      "plants": this.plants
    }
  }

  appendNotification(notification) {
    let date = new Date();
    // append date to the front of the string
    let dateString = '[' + date.getDate().toString().padStart(2, "0") +'-'+ (date.getMonth() + 1).toString().padStart(2, "0") +'-'+ date.getFullYear() +'|'+ date.getHours().toString().padStart(2, "0") +':'+ date.getMinutes().toString().padStart(2, "0") +':'+ date.getSeconds().toString().padStart(2, "0") + "] ";
    notification = dateString + notification
    
    // put notification in DB
    DatabaseService.InsertNotificationToDB(notification)

    this.notification_history.push(notification);
    while (this.notification_history.length > MAX_NOTIFICATIONS) {
      this.notification_history.shift();
    }
  }

  async finishJob() {
    console.log("Finished a Job");
    this.appendNotification("Job '" + this.statusManager.currentJob.name + "' finished.");
    if (this.currentJobData.jobType !== DatabaseService.JobType.HOME) {

      if (this.currentJobData.jobType !== DatabaseService.JobType.WATERING || !this.currentJobData.job.is_scheduled) {
        try {
          await DatabaseService.DeleteJobFromDB(this.currentJobData.jobType, this.currentJobData.job.jobname)
        } catch (e) {
          console.log("Failed to delete executed Job from DB!")
        }
      }

      if (!this.checkForNextJob()) {
        this.currentJobData = {jobType: DatabaseService.JobType.HOME}
        this.statusManager.startJob(new GoHomeJob());
        this.appendNotification("Job 'GoHome' started.");
      }
    }
  }

  checkForNextJob() {
    if (this.statusManager.runningJob) {
      return false
    }
    if (this.scheduleManager.isJobScheduled()) {
      this.currentJobData = this.scheduleManager.getScheduledJob();
      // translate job-dictionary into job-object
      let jobObject;
      switch(this.currentJobData.jobType) {
        case DatabaseService.JobType.SEEDING: 
          jobObject = new SeedingJob(this.currentJobData.job);
          break;
        case DatabaseService.JobType.WATERING:
          if (this.currentJobData.job.is_scheduled) {
            // Calculate next schedule before executing
            this.scheduleManager.calculateNextSchedule(this.currentJobData);
          }
          jobObject = new WateringJob(this.currentJobData.job);
          break;
        default:
          console.log("Job has no valid Job-Type. Cancelling...");
          return
      }
      this.statusManager.startJob(jobObject);
      this.appendNotification("Job '" + jobObject.name + "' started.");
      return true
    }
    return false
  }

  pauseJob(res) {
    if (this.statusManager.runningJob && !this.statusManager.isPaused) {
      if (this.currentJobData.jobType == DatabaseService.JobType.SEEDING) {
        this.cancelJob();
        res.status(200).json({ message: 'Cancelled a seeding job' });
      } else {
        this.statusManager.pauseJob()
        res.status(200).json({ message: 'Paused a running job' });
      }
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
    this.appendNotification("Job '" + jobObject.name + "' got cancelled.");
    this.statusManager.cancelJob();
  }
}

async function initalizeBackend(backend) {
  let farmbot = await getFarmbot()
  console.log("Farmbot Initialised!");
  backend.statusManager.init(farmbot);
  
  // necessary to get the current state of the farmbot. Requests and Awaits the status-callback once
  const statusPromise = new Promise((resolve) => {
    farmbot.on("status", (msg) => {resolve("Recieved first Status")}, true);
  });
  farmbot.readStatus();
  await statusPromise
  
  console.log("StatusManager Initialized");
  
  await backend.scheduleManager.loadQueuedjobsFromDB();
  backend.plants = await DatabaseService.FetchPlantsfromDB();
  backend.scheduleManager.checkForScheduledJobs()
}

export {
  initalizeBackend,
  Backend,
  FieldConstants
};