import { Task } from "./Task.js";

class MoveTask extends Task {

    constructor(position) {
        super()
        this.x = position["x"];
        this.y = position["y"];
        this.z = position["z"];
        // TODO maybe add speed parameter?
    }

    checkCondition(state) {
        state = state["location_data"]["position"]
        return this.x == state["x"] && this.y == state["y"] && this.z == state["z"]
    }

    execute(farmbot, lastState) {
        farmbot.moveAbsolute({ x: this.x, y: this.y, z: this.z, speed: 100 });
        console.log("Task: Moving to:", { x: this.x, y: this.y, z: this.z, speed: 100 });
    }
}

export {MoveTask};