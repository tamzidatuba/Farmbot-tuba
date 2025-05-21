import { FarmbotStatus } from "../backend/statusManager.js";
import { Job } from "./Job.js"
import { MoveTask } from "./tasks/MoveTask.js";
import { MoveZAxisTask} from "./tasks/MoveZAxisTask.js";
import { WATER_PIN } from "./tasks/TogglePinTask.js";
import {TimedPinTask} from "./tasks/TimedPinTask.js";

/*
Steps:
- move to watering coordinates (Move Command)
- water(Toggle Pin Command)
- repeat till all the given plants are finished
*/

const SEEDING_HEIGHT = -350
const FIELD_SAFETY_HEIGHT = -300
const SEED_BOWL_SAFETY_HEIGHT = 0;

class WateringJob extends Job {
    constructor(wateringArgs) {
        super(wateringArgs.name);
        this.duration = wateringArgs["duration"];
        this.position = wateringArgs["position"];

        let goToSafetyHeight = new MoveZAxisTask(FarmbotStatus.FETCHING, SEED_BOWL_SAFETY_HEIGHT);
        this.taskQueue.enqueue(goToSafetyHeight);

        wateringArgs["position"]["z"] = Math.max(FIELD_SAFETY_HEIGHT,wateringArgs["position"]["z"]);
        let goToWateringPosition = new MoveTask(FarmbotStatus.MOVING_TO_WATERING_POSITION, wateringArgs["position"]);
        this.taskQueue.enqueue(goToWateringPosition);

        let waterSeeds = new TimedPinTask(FarmbotStatus.WATERING, WATER_PIN, this.duration);
        this.taskQueue.enqueue(waterSeeds);

        let returnToFieldSafetyHeight = new MoveZAxisTask(FarmbotStatus.WATERING, FIELD_SAFETY_HEIGHT);
        this.taskQueue.enqueue(returnToFieldSafetyHeight);
        
    }
}

export {WateringJob};