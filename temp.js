import { Farmbot } from "farmbot";
import {getFarmbot} from './farmbotInitializer.js';

let farmbot = await getFarmbot()
console.log("Farmbot Initialised!")

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

farmbot.on("offline",
    function(data, eventName) {
        console.log("ALERT: Disconnected from Farmbot!");
    }
)

farmbot.on("sent",
    function(data, eventName) {
        console.log("Sent: ", data);
    }
)
farmbot.connect()
console.log(await farmbot.home({speed: 100, axis: "y"}))
//console.log(await farmbot.connect().then(farmbot.home({speed: 100, axis: "x"})));