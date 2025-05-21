import { Job } from "./Job.js";
import { MoveTask } from "./tasks/MoveTask.js";
import { MoveZAxisTask } from "./tasks/MoveZAxisTask.js";
import { FarmbotStatus } from "../backend/statusManager.js";


const SEED_BOWL_SAFETY_HEIGHT = 0;

class GoHomeJob extends Job {
    constructor() {
        super("goHome");

        let moveToSafetyHeight = new MoveZAxisTask(FarmbotStatus.MOVING, SEED_BOWL_SAFETY_HEIGHT);
        this.taskQueue.enqueue(moveToSafetyHeight);

        let goHome = new MoveTask(FarmbotStatus.MOVING, {x: 0, y: 0, z: 0});
        this.taskQueue.enqueue(goHome);
    }
}

export {GoHomeJob};