import { FarmbotStatus } from "../statusManager.js";
import { Job } from "./Job.js"
import { MoveTask } from "./tasks/MoveTask.js";
import { MoveZTask} from "./tasks/MoveZTask.js";
import { WATER_PIN } from "./tasks/SetPinTask.js";
import {TimedPinTask} from "./tasks/TimedPinTask.js";

/*
Steps:
- move to watering coordinates (Move Command)
- water(Toggle Pin Command)
- repeat till all the given plants are finished
*/

const MIN_WATERING_HEIGHT = -300 // has to be > field height
const SAFETY_HEIGHT = 0;

class WateringJob extends Job {
    constructor(wateringArgs) {
        super(wateringArgs.jobname);
        
        let goToSafetyHeight = new MoveZTask(FarmbotStatus.MOVING_TO_WATERING_POSITION, SAFETY_HEIGHT);
        this.taskQueue.push(goToSafetyHeight);
        
        for(const seed in wateringArgs.seeds) {
            let seedArgs = wateringArgs.seeds[seed];

            let goToWateringGridPosition = new MoveTask(
                FarmbotStatus.MOVING_TO_WATERING_POSITION,
                seedArgs.xcoordinate,
                seedArgs.ycoordinate
            );
            this.taskQueue.push(goToWateringGridPosition);

            let wateringHeight = Math.max(MIN_WATERING_HEIGHT, seedArgs.wateringheight);
            let goToWateringHeight = new MoveZTask(FarmbotStatus.MOVING_TO_WATERING_POSITION, wateringHeight);
            this.taskQueue.push(goToWateringHeight);
    
            let duration = this.convert_ml_into_duration(seedArgs.wateringcapacity);

            let waterSeeds = new TimedPinTask(FarmbotStatus.WATERING, WATER_PIN, duration);
            this.taskQueue.push(waterSeeds);
        }

        
    }

    convert_ml_into_duration(ml) {
        return ml / 100;
    }
}

export {WateringJob};