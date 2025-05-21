import { Task } from "./Task.js";

class MoveTask extends Task {

    constructor(status, x, y) {
        super(status);
        this.x = x;
        this.y = y;
        this.speed = 100;
        // TODO maybe add speed parameter?
    }

    checkCondition(state) {
        return this.x == state.location_data.position.x && this.y == state.location_data.position.y;
        //return this.position.x == state.x && this.position.y == state.y && this.position.z == state.z
    }

    execute(farmbot, lastState) {
        farmbot.moveAbsolute({ x: this.x, y: this.y, z: lastState.location_data.position.z, speed: this.speed });
        //console.log("Task: Moving to", { x: this.x, y: this.y, z: this.z, speed: 100 });
    }
}

export {MoveTask};