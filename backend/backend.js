import {SeedingJob} from "../jobs/SeedingJob.js";
import { StatusManager } from "./statusManager.js";
import {getFarmbot} from './farmbotInitializer.js';
import { WateringJob } from "../jobs/WateringJob.js";
import { ScheduleManager } from "./scheduleManager.js";

class Backend {
  constructor(farmbot, statusManager) {
    this.farmbot = farmbot;
    this.statusManager = statusManager;
    //this.scheduleManager = new ScheduleManager();
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