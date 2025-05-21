import { FarmbotStatus } from "../backend/statusManager.js";
import { Job } from "./Job.js"
import { MoveTask } from "./tasks/MoveTask.js";
import { MoveZAxisTask} from "./tasks/MoveZAxisTask.js";
import { TogglePinTask, VACUUM_PIN } from "./tasks/TogglePinTask.js";

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
const SEED_BOWL_POSITION = {"x": 0, "y": 500, "z": SEED_BOWL_SAFETY_HEIGHT};
const SEED_BOWL_SUCTION_HEIGHT = -200;

class SeedingJob extends Job {
    constructor(seedingArgs) {
        super(seedingArgs.name);

        let goToSafetyHeight = new MoveZAxisTask(FarmbotStatus.FETCHING, SEED_BOWL_SAFETY_HEIGHT);
        let goToSeedBowl = new MoveTask(FarmbotStatus.FETCHING, SEED_BOWL_POSITION);
        let lowerToSeedBowl = new MoveZAxisTask(FarmbotStatus.FETCHING, SEED_BOWL_SUCTION_HEIGHT);
        let toggleVacuumPin = new TogglePinTask(FarmbotStatus.FETCHING, VACUUM_PIN);
        let returnToBowlSafetyHeight = new MoveZAxisTask(FarmbotStatus.MOVING_TO_SEEDING_POSITION, SEED_BOWL_SAFETY_HEIGHT);
        let lowerToSeedingHeight = new MoveZAxisTask(FarmbotStatus.SEEDING, SEEDING_HEIGHT);

        let returnToFieldSafetyHeight = new MoveZAxisTask(FarmbotStatus.SEEDING, FIELD_SAFETY_HEIGHT);
        
        for(const plant in seedingArgs) {
            let position = seedingArgs[plant].position;
                
            this.taskQueue.enqueue(goToSafetyHeight);

            this.taskQueue.enqueue(goToSeedBowl);

            this.taskQueue.enqueue(lowerToSeedBowl);
            
            // vacuum the seeds
            this.taskQueue.enqueue(toggleVacuumPin);
            
            this.taskQueue.enqueue(returnToBowlSafetyHeight);

            position.z = SEED_BOWL_SAFETY_HEIGHT;
            let goToPlantingPosition = new MoveTask(FarmbotStatus.MOVING_TO_SEEDING_POSITION, position);
            this.taskQueue.enqueue(goToPlantingPosition);

            this.taskQueue.enqueue(lowerToSeedingHeight);

            // plant the seeds
            this.taskQueue.enqueue(toggleVacuumPin);

            this.taskQueue.enqueue(returnToFieldSafetyHeight);
        }
        
    }
}

export {SeedingJob};