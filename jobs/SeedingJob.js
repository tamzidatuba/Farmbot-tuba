import { Job } from "./Job.js"
import { MoveTask } from "./tasks/MoveTask.js";
import { MoveZAxisTask} from "./tasks/MoveZAxisTask.js";
import { Task } from "./tasks/Task.js";

/*
Steps:
- Move to seedbowl (Move Command)
- pickup seeds (Timed Pin Command)
- move to seeding coordinates (Move Command)
- plant seeds (Timed Pin Command)
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

        let goToSafetyHeight = new MoveZAxisTask(SEED_BOWL_SAFETY_HEIGHT);
        this.taskQueue.enqueue(goToSafetyHeight);

        let goToSeedBowl = new MoveTask(SEED_BOWL_POSITION);
        this.taskQueue.enqueue(goToSeedBowl);

        let lowerToSeedBowl = new MoveZAxisTask(SEED_BOWL_SUCTION_HEIGHT);
        this.taskQueue.enqueue(lowerToSeedBowl);

        let suckUpSeeds = new Task();
        this.taskQueue.enqueue(suckUpSeeds);

        let returnToBowlSafetyHeight = new MoveZAxisTask(SEED_BOWL_SAFETY_HEIGHT);
        this.taskQueue.enqueue(returnToBowlSafetyHeight);

        seedingArgs["position"]["z"] = FIELD_SAFETY_HEIGHT;
        let goToPlantingPosition = new MoveTask(seedingArgs["position"]);
        this.taskQueue.enqueue(goToPlantingPosition);

        let lowerToSeedingHeight = new MoveZAxisTask(SEEDING_HEIGHT);
        this.taskQueue.enqueue(lowerToSeedingHeight);

        let plantSeeds = new Task();
        this.taskQueue.enqueue(plantSeeds);

        let returnToFieldSafetyHeight = new MoveZAxisTask(FIELD_SAFETY_HEIGHT);
        this.taskQueue.enqueue(returnToFieldSafetyHeight);

    }
}

export {SeedingJob};