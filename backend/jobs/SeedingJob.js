import { FarmbotStatus } from "../statusManager.js";
import { FieldConstants } from "../backend.js";
import { Job } from "./Job.js"
import { MoveTask } from "./tasks/MoveTask.js";
import { MoveZTask} from "./tasks/MoveZTask.js";
import { SetPinTask, FAKE_VACUUM_PIN } from "./tasks/SetPinTask.js";
import { DatabaseTask } from "./tasks/DatabaseTask.js";
import DatabaseService from "../../databaseservice.js";

/*
Steps:
- Move to seedbowl (Move Command)
- pickup seeds (Toggle Pin Command)
- move to seeding coordinates (Move Command)
- plant seeds (Toggle Pin Command)
- (Move a little up)
*/

class SeedingJob extends Job {
    constructor(seedingArgs) {
        super(seedingArgs.jobname);

        let goToSafetyHeight = new MoveZTask(FarmbotStatus.FETCHING, FieldConstants.SAFETY_HEIGHT);
        let goToSeedBowl = new MoveTask(FarmbotStatus.FETCHING, 0, FieldConstants.SEED_CONTAINER_Y);
        let lowerToSeedBowl = new MoveZTask(FarmbotStatus.FETCHING, FieldConstants.SEED_CONTAINER_HEIGHT);
        let activateVacuumPin = new SetPinTask(FarmbotStatus.FETCHING, FAKE_VACUUM_PIN, 1);
        let returnToSafetyHeight = new MoveZTask(FarmbotStatus.MOVING_TO_SEEDING_POSITION, FieldConstants.SAFETY_HEIGHT);
        let lowerToSeedingHeight = new MoveZTask(FarmbotStatus.SEEDING, FieldConstants.FIELD_HEIGHT);
        let deactivateVacuumPin = new SetPinTask(FarmbotStatus.SEEDING, FAKE_VACUUM_PIN, 0);

        let returnToFieldSafetyHeight = new MoveZTask(FarmbotStatus.SEEDING, FieldConstants.SAFETY_HEIGHT);
        
        for(const seed in seedingArgs.seeds) {
            let seedArgs = seedingArgs.seeds[seed]
                
            this.taskQueue.push(goToSafetyHeight);

            this.taskQueue.push(goToSeedBowl);

            this.taskQueue.push(lowerToSeedBowl);
            
            // vacuum the seeds
            this.taskQueue.push(activateVacuumPin);
            
            this.taskQueue.push(returnToSafetyHeight);

            let goToPlantingPosition = new MoveTask(FarmbotStatus.MOVING_TO_SEEDING_POSITION, seedArgs.xcoordinate, seedArgs.ycoordinate);
            this.taskQueue.push(goToPlantingPosition);

            this.taskQueue.push(lowerToSeedingHeight);

            let goToSeedingDepth = new MoveZTask(FarmbotStatus.MOVING_TO_SEEDING_POSITION, FieldConstants.FIELD_HEIGHT - seedArgs.depth)
            this.taskQueue.push(goToSeedingDepth);
            // plant the seeds
            this.taskQueue.push(deactivateVacuumPin);


            let new_plant = {
                planttype: seedArgs.seedtype,
                xcoordinate: seedArgs.xcoordinate,
                ycoordiante: seedArgs.ycoordinate
            }
            let insertPlantToDB = new DatabaseTask(
                FarmbotStatus.SEEDING,
                DatabaseService.InsertPlantsToDB,
                [new_plant]
            )
            this.taskQueue.push(insertPlantToDB)
            
            // TODO insert plant into DB
            // let newPlant = ["position": position, "plantType": seedingArgs.plantType]
            // DatabaseService.insertPlanttoDB(newPlant)


            this.taskQueue.push(returnToFieldSafetyHeight);
        }
        
    }
}

export {SeedingJob};