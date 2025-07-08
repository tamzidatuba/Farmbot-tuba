import { StatusManager } from "./statusManager.js";
import {getFarmbot} from './farmbotInitializer.js';
import { ScheduleManager } from "./scheduleManager.js";
import DatabaseService from '../databaseservice.js';
import { HomeJob } from './jobs/HomeJob.js';
import { SeedingJob} from './jobs/SeedingJob.js';
import { WateringJob} from './jobs/WateringJob.js';

const MAX_NOTIFICATIONS = 50;

const FieldConstants = Object.freeze({
    ACTUAL_FIELD_WIDTH: 490,
    ACTUAL_FIELD_HEIGHT: 640,
    FIELD_START_X: 0,
    FIELD_START_Y: 0,
    FIELD_END_X: 490,
    FIELD_END_Y: 640,
    SAFETY_HEIGHT: 0,
    FIELD_HEIGHT: -285,
    SEED_CONTAINER_Y: 850,
    SEED_CONTAINER_HEIGHT: -109,
    MAX_SEEDING_DEPTH: 15,
});

class Backend {
  constructor() {
    this.notification_history = new Array();
    this.scheduleManager = new ScheduleManager(this);
    this.statusManager = new StatusManager(this);
    this.currentJobData;
    this.plants = new Array();

    this.demo_job_queued = false;
    
    initalizeBackend(this);
  }

  generateFrontendData() {
    return {
      "status": this.statusManager.status,
      "paused": this.statusManager.isPaused,
      "notifications": this.notification_history,
      "executionPipeline": this.scheduleManager.jobsToExecute,
      "farmbotPosition": this.statusManager.lastState.location_data.position,
      "plants": this.plants,
      "demoQueued": this.demo_job_queued
    }
  }
  // Appends a notification to the NotificationHistory
  appendNotification(key="started", jobname="") {

    // create a date string
    let date = new Date();
    let dateString = '[' + date.getDate().toString().padStart(2, "0") +'-'+ (date.getMonth() + 1).toString().padStart(2, "0") +'-'+ date.getFullYear() +'|'+ date.getHours().toString().padStart(2, "0") +':'+ date.getMinutes().toString().padStart(2, "0") +':'+ date.getSeconds().toString().padStart(2, "0") + "] ";
    
    // create notification string for the DB
    let message = jobname + ": " + key + ".";
    const notification = dateString + message

    // put notification in DB
    DatabaseService.InsertNotificationToDB(notification)

    // create notification object for the Frontend (split up for better translation)
    let notification_object = {"date": dateString, "key": key, "jobname": jobname}
    this.notification_history.push(notification_object);

    // ensure the maximum notification-count is not surpassed
    while (this.notification_history.length > MAX_NOTIFICATIONS) {
      this.notification_history.shift();
    }
  }

  // Called after a job is finished
  async finishJob() {
    console.log("Finished a Job");
    
    // append notification
    this.appendNotification("finished", this.statusManager.currentJob.name);
    
    // check if job is a "Home"-Job
    if (this.currentJobData.jobType !== DatabaseService.JobType.HOME) {

      // Allow for a new Demo-Job to be queued
      if ("demo" in this.currentJobData) {
        this.demo_job_queued = false;
      } 
      // Check if the finished job is a scheduled watering job, if not -> Remove it from the DB
      else if (this.currentJobData.jobType !== DatabaseService.JobType.WATERING || !this.currentJobData.job.is_scheduled) {
        try {
          this.plants = await DatabaseService.FetchPlantsfromDB();
          await DatabaseService.DeleteJobFromDB(this.currentJobData.jobType, this.currentJobData.job.jobname);
        } catch (e) {
          console.log("Failed to delete executed Job from DB!")
        }
      }
      // check if another job is queued
      if (!this.checkForNextJob()) {
        // no other job is queued -> start a "Home"-Job
        this.currentJobData = {jobType: DatabaseService.JobType.HOME}
        this.statusManager.startJob(new HomeJob());
        this.appendNotification("started", "Home");
      }
    } else this.checkForNextJob();
  }

  /*
  * Checks if a Job is queued executes it if possible
  * returns "true" if a new job is getting executed
  */
  checkForNextJob() {
    // Check if there is currently running a job
    if (this.statusManager.runningJob) {
      return false
    }
    // check scheduleManager if there is a job queued
    if (this.scheduleManager.isJobScheduled()) {
      this.currentJobData = this.scheduleManager.getScheduledJob();

      // translate job-dictionary into job-object
      let jobObject;
      switch(this.currentJobData.jobType) {
        case DatabaseService.JobType.SEEDING: 
          if ("demo" in this.currentJobData) {
            jobObject = new SeedingJob(this.currentJobData.job, true);
          } else {
            jobObject = new SeedingJob(this.currentJobData.job)
          }
          break;
        case DatabaseService.JobType.WATERING:
          if (this.currentJobData.job.is_scheduled) {
            // Calculate next schedule before executing
            this.scheduleManager.calculateNextSchedule(this.currentJobData);
          }
          jobObject = new WateringJob(this.currentJobData.job);
          break;
        default:
          console.log("Job has no valid Job-Type. Canceling...");
          return
      }
      // Start the new job
      this.statusManager.startJob(jobObject);
      // append Notification
      this.appendNotification("started", jobObject.name);
      return true
    }
    return false
  }

  // pauses a job is possible
  pauseJob(res) {
    if (this.statusManager.runningJob && !this.statusManager.isPaused) {
      // check if job is a seeding job and therefore has to be canceled
      if (this.currentJobData.jobType == DatabaseService.JobType.SEEDING) {

        // Cancel the seeding job
        this.appendNotification("canceled", this.currentJobData.job.jobname);
        this.statusManager.cancelJob();

        res.status(201).json({ message: 'Canceled a seeding job' });
      } else {

        // pause the current job
        this.statusManager.pauseJob()

        res.status(200).json({ message: 'Paused a running job' });
      }
    } else {
      res.status(500).json({ error: 'There is no job currently running' });
    }
  }
  // resumes a paused job if possible
  continueJob(res) {
    // check if there is a job running and its currently paused
    if (this.statusManager.runningJob && this.statusManager.isPaused) {
      this.statusManager.continueJob()
      res.status(200).json({ message: 'Resumed a paused job' });
    } else {
      res.status(500).json({ error: 'There is no job currently paused' });
    }
  }
}
// Initalizes the backend
async function initalizeBackend(backend) {

  // get farmbot from the farmbot-intializer
  let farmbot = await getFarmbot()
  console.log("Farmbot Initialised!");

  // initalize the statusManager
  backend.statusManager.init(farmbot);
  
  // Request current status of farmbot
  // necessary to get the current state of the farmbot. Requests and Awaits the status-callback once
  const statusPromise = new Promise((resolve) => {
    farmbot.on("status", (msg) => {resolve("Recieved first Status")}, true);
  });
  farmbot.readStatus();
  await statusPromise
  console.log("StatusManager Initialized");
  
  // load queued jobs from last uptime
  await backend.scheduleManager.loadQueuedjobsFromDB();

  // fetch the plants and cache them in the backend
  backend.plants = await DatabaseService.FetchPlantsfromDB();

  // check if any scheduled-jobs are due
  backend.scheduleManager.checkForScheduledJobs()
}

export {
  Backend,
  FieldConstants
};