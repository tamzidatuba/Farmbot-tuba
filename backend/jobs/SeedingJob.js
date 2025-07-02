import { FarmbotStatus } from "../statusManager.js";
import { FieldConstants } from "../backend.js";
import { Job } from "./Job.js"
import { MoveTask } from "./tasks/MoveTask.js";
import { MoveZTask} from "./tasks/MoveZTask.js";
import { SetPinTask } from "./tasks/SetPinTask.js";
import { DatabaseTask } from "./tasks/DatabaseTask.js";
import { TimedTask } from "./tasks/TimedTask.js";
import DatabaseService from "../../databaseservice.js";
import { FARMBOT_DATA } from "../farmbotInitializer.js";

/*
Steps:
- Move to seedbowl (Move Command)
- pickup seeds (Toggle Pin Command)
- move to seeding coordinates (Move Command)
- plant seeds (Toggle Pin Command)
- (Move a little up)
*/

class SeedingJob extends Job {
    constructor(seedingArgs, demo = false) {
        super(seedingArgs.jobname);

        let goToSafetyHeight = new MoveZTask(FarmbotStatus.FETCHING, FieldConstants.SAFETY_HEIGHT);
        let goToSeedBowl = new MoveTask(FarmbotStatus.FETCHING, 0, FieldConstants.SEED_CONTAINER_Y);
        let lowerToSeedBowl = new MoveZTask(FarmbotStatus.FETCHING, FieldConstants.SEED_CONTAINER_HEIGHT);
        let activateVacuumPin = new SetPinTask(FarmbotStatus.FETCHING, FARMBOT_DATA.vacuum_pin, 1);
        let ensurePinActivation = new TimedTask(FarmbotStatus.FETCHING, 1);
        let returnToSafetyHeight = new MoveZTask(FarmbotStatus.MOVING_TO_SEEDING_POSITION, FieldConstants.SAFETY_HEIGHT);
        let lowerToSeedingHeight = new MoveZTask(FarmbotStatus.SEEDING, FieldConstants.FIELD_HEIGHT);
        let deactivateVacuumPin = new SetPinTask(FarmbotStatus.SEEDING, FARMBOT_DATA.vacuum_pin, 0);
        let ensurePinDeactivation = new TimedTask(FarmbotStatus.SEEDING, 1);

        let returnToFieldSafetyHeight = new MoveZTask(FarmbotStatus.MOVING, FieldConstants.SAFETY_HEIGHT);
        
        for(const seed in seedingArgs.seeds) {
            let seedArgs = seedingArgs.seeds[seed]
            let xCoordinate = this.clampXToField(seedArgs.xcoordinate);
            let yCoordinate = this.clampYToField(seedArgs.ycoordinate);
                
            this.taskQueue.push(goToSafetyHeight);

            this.taskQueue.push(goToSeedBowl);

            this.taskQueue.push(lowerToSeedBowl);
            
            // vacuum the seeds
            this.taskQueue.push(activateVacuumPin);
            this.taskQueue.push(ensurePinActivation);
            
            this.taskQueue.push(returnToSafetyHeight);

            let goToPlantingPosition = new MoveTask(FarmbotStatus.MOVING_TO_SEEDING_POSITION, xCoordinate, yCoordinate);
            this.taskQueue.push(goToPlantingPosition);

            this.taskQueue.push(lowerToSeedingHeight);

            let goToSeedingDepth = new MoveZTask(FarmbotStatus.MOVING_TO_SEEDING_POSITION, FieldConstants.FIELD_HEIGHT - Math.max(seedArgs.depth, FieldConstants.MAX_SEEDING_DEPTH));
            this.taskQueue.push(goToSeedingDepth);
            // plant the seeds
            this.taskQueue.push(deactivateVacuumPin);
            this.taskQueue.push(ensurePinDeactivation);

            if (!demo){
                let new_plant = {
                    planttype: seedArgs.seedtype,
                    xcoordinate: xCoordinate,
                    ycoordinate: yCoordinate
                }
                let insertPlantToDB = new DatabaseTask(
                    FarmbotStatus.SEEDING,
                    DatabaseService.InsertPlantsToDB,
                    [new_plant]
                )
                this.taskQueue.push(insertPlantToDB)
            }

            this.taskQueue.push(returnToFieldSafetyHeight);
        }
        
    }
}

export {SeedingJob};