import { FarmbotStatus } from "../statusManager.js";
import { FieldConstants } from "../backend.js";
import { Job } from "./Job.js"
import { MoveTask } from "./tasks/MoveTask.js";
import { MoveZTask} from "./tasks/MoveZTask.js";
import { FARMBOT_DATA } from "../farmbotInitializer.js";
import {TimedPinTask} from "./tasks/TimedPinTask.js";

class WateringJob extends Job {
    constructor(wateringArgs) {
        super(wateringArgs.jobname);
        
        let goToSafetyHeight = new MoveZTask(FarmbotStatus.MOVING_TO_WATERING_POSITION, FieldConstants.SAFETY_HEIGHT);
        this.taskQueue.push(goToSafetyHeight);
        
        for(const seed in wateringArgs.plantstobewatered) {
            let seedArgs = wateringArgs.plantstobewatered[seed];

            let goToWateringGridPosition = new MoveTask(
                FarmbotStatus.MOVING_TO_WATERING_POSITION,
                seedArgs.plant.xcoordinate,
                seedArgs.plant.ycoordinate
            );
            this.taskQueue.push(goToWateringGridPosition);

            let goToWateringHeight = new MoveZTask(FarmbotStatus.MOVING_TO_WATERING_POSITION, FieldConstants.FIELD_HEIGHT + seedArgs.wateringheight);
            this.taskQueue.push(goToWateringHeight);
    
            let duration = this.convert_ml_into_duration(seedArgs.wateringcapacity);

            let waterSeeds = new TimedPinTask(FarmbotStatus.WATERING, FARMBOT_DATA.water_pin, duration);
            this.taskQueue.push(waterSeeds);
        }
        let returnToSafetyHeight = new MoveZTask(FarmbotStatus.MOVING, FieldConstants.SAFETY_HEIGHT);
        this.taskQueue.push(returnToSafetyHeight)

        
    }

    convert_ml_into_duration(ml) {
        return ml / 100;
    }
}

export {WateringJob};