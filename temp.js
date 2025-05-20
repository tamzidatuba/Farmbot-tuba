import {SeedingJob} from "./jobs/SeedingJob.js";
import { StatusManager } from "./statusManager.js";
import {getFarmbot} from './farmbotInitializer.js';
import { WateringJob } from "./jobs/WateringJob.js";

let farmbot = await getFarmbot()
let statusManager = new StatusManager(farmbot);
console.log("Farmbot Initialised!");

// Method necessary to get the current state of the farmbot. Awaits the status-callback
function waitForFirstStatus(farmbot) {
  return new Promise((resolve) => {
    farmbot.on("status", (status) => {
      resolve(status);
    }, true);
  });
}

await waitForFirstStatus(farmbot);
console.log("StatusManager Initialized");

let seedingArgs = {"position": {"x": 100, "y": 100}}
let seedingJob = new SeedingJob(seedingArgs);

statusManager.startJob(seedingJob);

let WateringArgs ={"position": {"x": 100, "y": 100,"z": -50}, "duration":10}
let wateringJob = new WateringJob(WateringArgs);

statusManager.startJob(wateringJob);