import {SeedingJob} from "../jobs/SeedingJob.js";
import { StatusManager } from "./statusManager.js";
import {getFarmbot} from './farmbotInitializer.js';
import { WateringJob } from "../jobs/WateringJob.js";
import { ScheduleManager } from "./scheduleManager.js";
import { Queue } from "../jobs/Queue.js";

const JobNotification = Object.freeze({
    JOB_CREATED: "Job created",
    JOB_MODIFIED: "Job modified",
    JOB_DELETED: "Job deleted",
    JOB_STARTED: "Job started",
    JOB_FINISHED: "Job finished"
});


class Backend {
  constructor(farmbot, statusManager) {
    this.user = "Visitor";
    this.farmbot = farmbot;
    this.statusManager = statusManager;
    //this.scheduleManager = new ScheduleManager();
    this.notification_array = new Array();
    this.notification_history = new Queue();
  }

  appendNotification(notification) {
    // TODO put notification in database
    let date = new Date();
    // append date to the end of the string
    notification += date.getFullYear() +'.'+ date.getMonth() +'.'+ date.getDay() +' '+ date.getHours() +':'+ date.getMinutes() +':'+ date.getSeconds();
    this.notification_history.enqueue(notification);
    this.notification_array.push(notification);
    while (this.notification_history.length > 10) {
      this.notification_history.dequeue();
      this.notification_array.shift();
    }
  }

  startJob(job) {
    this.statusManager.startJob(job);
    this.appendNotification(
      "[" + this.user + "] Job " + job.name + " started at "
    );
  }

  finishJob(job) {
    this.appendNotification(
      "[" + this.user + "] Job " + job.name + " finished at "
    );
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