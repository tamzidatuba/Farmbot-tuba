import { Farmbot } from "farmbot";
import {SeedingJob} from "./jobs/SeedingJob.js";
import { MoveTask } from "./jobs/tasks/MoveTask.js";
import { StatusManager } from "./statusManager.js";
import {getFarmbot} from './farmbotInitializer.js';

let farmbot = await getFarmbot()
let statusManager = new StatusManager(farmbot);
console.log("Farmbot Initialised!");

/*
 var bot = Farmbot({ token: '---'});
  bot.on("eventName", function(data, eventName) {
    console.log("I just got an" + eventName + " event!");
    console.log("This is the payload: " + data);
  })
   // "I just got an eventName event!"
   // "This is the payload: any javascript object or primitive"
  bot.emit("eventName", "any javascript object or primitive");
  var eventHandlers = bot.event("eventName");
   // [function(){...}]
*/

// TODO: create list of possible statuses
// TODO: Determine what the current status is
// TODO: create history of past statuses

/*
farmbot.on("sent",
    function(data, eventName) {
        console.log("Sent: ", data);
    }
)*/

//console.log(await farmbot.home({speed: 100, axis: "y"}))
//console.log(await farmbot.connect().then(farmbot.home({speed: 100, axis: "x"})));
/*
function move_to(x_coords, y_coords, z_coords) {
    farmbot.moveAbsolute({ x: x_coords, y: y_coords, z: z_coords, speed: 100 });
}*/

function waitForFirstStatus(farmbot) {
  return new Promise((resolve) => {
    const unsubscribe = farmbot.on("status", (status) => {
      resolve(status);
    }, true);
  });
}

await waitForFirstStatus(farmbot);
console.log("StatusManager Initialized");
let seedingArgs = {"position": {"x": 100, "y": 100}}
let seedingJob = new SeedingJob(seedingArgs);

statusManager.startJob(seedingJob);