import { Task } from "./Task.js"

class MoveZAxisTask extends Task {
    constructor(status, z) {
        super(status);
        this.z = z;
    }

    checkCondition(state) {
        return this.z == state["location_data"]["position"]["z"]; //&& state["informational_settings"]["busy"] == false;
    }

    execute(farmbot, lastState) {
        this.z = Math.max(this.z, lastState.location_data.position.z);
        farmbot.moveAbsolute({ x: lastState["location_data"]["position"]["x"], y: lastState["location_data"]["position"]["y"], z: this.z, speed: 100 });
        console.log("Task: Moving to:", { x: lastState["location_data"]["position"]["x"], y: lastState["location_data"]["position"]["y"], z: this.z, speed: 100 });
    }
}

export {MoveZAxisTask};