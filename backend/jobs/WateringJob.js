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

            let coords = this.adjustCoordinatesToFieldDimension(seedArgs.plant.xcoordinate, seedArgs.plant.ycoordinate);
            let goToWateringGridPosition = new MoveTask(
                FarmbotStatus.MOVING_TO_WATERING_POSITION,
                coords.x, coords.y
            );
            this.taskQueue.push(goToWateringGridPosition);

            let goToWateringHeight = new MoveZTask(FarmbotStatus.MOVING_TO_WATERING_POSITION, FieldConstants.FIELD_HEIGHT + Math.abs(seedArgs.wateringheight));
            this.taskQueue.push(goToWateringHeight);
    
            let duration = this.convert_ml_into_duration(seedArgs.wateringcapacity);

            let waterSeeds = new TimedPinTask(FarmbotStatus.WATERING, FARMBOT_DATA.water_pin, duration);
            this.taskQueue.push(waterSeeds);
        }
        let returnToSafetyHeight = new MoveZTask(FarmbotStatus.MOVING, FieldConstants.SAFETY_HEIGHT);
        this.taskQueue.push(returnToSafetyHeight)

        this.task_count = this.taskQueue.length;
        
    }

    convert_ml_into_duration(ml) {
        // measured 450ml running 20seconds
        // 450/20 = 22.5
        return ml / 22.5;
    }
}

export {WateringJob};