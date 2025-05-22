import { FarmbotStatus } from "../backend/statusManager.js";
import { Job } from "./Job.js"
import { MoveTask } from "./tasks/MoveTask.js";
import { MoveZTask} from "./tasks/MoveZTask.js";
import { SetPinTask, VACUUM_PIN } from "./tasks/SetPinTask.js";

/*
Steps:
- Move to seedbowl (Move Command)
- pickup seeds (Toggle Pin Command)
- move to seeding coordinates (Move Command)
- plant seeds (Toggle Pin Command)
- (Move a little up)
*/

const SEEDING_HEIGHT = -350;
const FIELD_SAFETY_HEIGHT = -300;
const SEED_BOWL_SAFETY_HEIGHT = 0;
const SEED_BOWL_POSITION = {"x": 0, "y": 500};
const SEED_BOWL_SUCTION_HEIGHT = -200;

class SeedingJob extends Job {
    constructor(seedingArgs) {
        super(seedingArgs.name);

        let goToSafetyHeight = new MoveZTask(FarmbotStatus.FETCHING, SEED_BOWL_SAFETY_HEIGHT);
        let goToSeedBowl = new MoveTask(FarmbotStatus.FETCHING, SEED_BOWL_POSITION.x , SEED_BOWL_POSITION.y);
        let lowerToSeedBowl = new MoveZTask(FarmbotStatus.FETCHING, SEED_BOWL_SUCTION_HEIGHT);
        let activateVacuumPin = new SetPinTask(FarmbotStatus.FETCHING, VACUUM_PIN, 1);
        let returnToSafetyHeight = new MoveZTask(FarmbotStatus.MOVING_TO_SEEDING_POSITION, SEED_BOWL_SAFETY_HEIGHT);
        let lowerToSeedingHeight = new MoveZTask(FarmbotStatus.SEEDING, SEEDING_HEIGHT);
        let deactivateVacuumPin = new SetPinTask(FarmbotStatus.FETCHING, VACUUM_PIN, 0);

        let returnToFieldSafetyHeight = new MoveZTask(FarmbotStatus.SEEDING, FIELD_SAFETY_HEIGHT);
        
        for(const plant in seedingArgs.positions) {
            let position = seedingArgs.positions[plant].position;
                
            this.taskQueue.enqueue(goToSafetyHeight);

            this.taskQueue.enqueue(goToSeedBowl);

            this.taskQueue.enqueue(lowerToSeedBowl);
            
            // vacuum the seeds
            this.taskQueue.enqueue(activateVacuumPin);
            
            this.taskQueue.enqueue(returnToSafetyHeight);

            position.z = SEED_BOWL_SAFETY_HEIGHT;
            let goToPlantingPosition = new MoveTask(FarmbotStatus.MOVING_TO_SEEDING_POSITION, position.x, position.y);
            this.taskQueue.enqueue(goToPlantingPosition);

            this.taskQueue.enqueue(lowerToSeedingHeight);

            // plant the seeds
            this.taskQueue.enqueue(deactivateVacuumPin);

            this.taskQueue.enqueue(returnToFieldSafetyHeight);
        }
        
    }
}

export {SeedingJob};