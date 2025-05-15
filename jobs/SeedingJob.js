import { FarmbotStatus } from "../statusManager.js";
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

const SEEDING_HEIGHT = -350
const FIELD_SAFETY_HEIGHT = -300
const SEED_SUCTION_PIN = 1
const SEED_PLANTING_PIN = 2
const SEED_BOWL_SAFETY_HEIGHT = 0;
const SEED_BOWL_POSITION = {"x": 0, "y": 500, "z": SEED_BOWL_SAFETY_HEIGHT}
const SEED_BOWL_SUCTION_HEIGHT = -200;

class SeedingJob extends Job {
    constructor(seedingArgs) {
        super();
        this.plantType = seedingArgs["type"]
        this.position = seedingArgs["position"]

        let goToSafetyHeight = new MoveZAxisTask(FarmbotStatus.FETCHING, SEED_BOWL_SAFETY_HEIGHT);
        this.taskQueue.enqueue(goToSafetyHeight);

        let goToSeedBowl = new MoveTask(FarmbotStatus.FETCHING, SEED_BOWL_POSITION);
        this.taskQueue.enqueue(goToSeedBowl);

        let lowerToSeedBowl = new MoveZAxisTask(FarmbotStatus.FETCHING, SEED_BOWL_SUCTION_HEIGHT);
        this.taskQueue.enqueue(lowerToSeedBowl);

        let suckUpSeeds = new TogglePinTask(FarmbotStatus.FETCHING, VACUUM_PIN);
        this.taskQueue.enqueue(suckUpSeeds);
        
        let returnToBowlSafetyHeight = new MoveZAxisTask(FarmbotStatus.MOVING_TO_SEEDING_POSITION, SEED_BOWL_SAFETY_HEIGHT);
        this.taskQueue.enqueue(returnToBowlSafetyHeight);

        seedingArgs["position"]["z"] = FIELD_SAFETY_HEIGHT;
        let goToPlantingPosition = new MoveTask(FarmbotStatus.MOVING_TO_SEEDING_POSITION, seedingArgs["position"]);
        this.taskQueue.enqueue(goToPlantingPosition);

        let lowerToSeedingHeight = new MoveZAxisTask(FarmbotStatus.SEEDING, SEEDING_HEIGHT);
        this.taskQueue.enqueue(lowerToSeedingHeight);

        let plantSeeds = new TogglePinTask(FarmbotStatus.SEEDING, VACUUM_PIN);
        this.taskQueue.enqueue(plantSeeds);

        let returnToFieldSafetyHeight = new MoveZAxisTask(FarmbotStatus.SEEDING, FIELD_SAFETY_HEIGHT);
        this.taskQueue.enqueue(returnToFieldSafetyHeight);
        
    }
}

export {SeedingJob};