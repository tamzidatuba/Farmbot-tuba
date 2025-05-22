import { Job } from "./Job.js";
import { MoveTask } from "./tasks/MoveTask.js";
import { MoveZTask } from "./tasks/MoveZTask.js";
import { FarmbotStatus } from "../backend/statusManager.js";


const SAFETY_HEIGHT = 0;

class GoHomeJob extends Job {
    constructor() {
        super("GoHome");

        let moveToSafetyHeight = new MoveZTask(FarmbotStatus.MOVING, SAFETY_HEIGHT);
        this.taskQueue.enqueue(moveToSafetyHeight);

        let goHome = new MoveTask(FarmbotStatus.MOVING, 0, 0);
        this.taskQueue.enqueue(goHome);
    }
}

export {GoHomeJob};