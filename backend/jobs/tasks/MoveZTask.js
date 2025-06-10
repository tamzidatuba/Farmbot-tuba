import { Task } from "./Task.js"

class MoveZTask extends Task {
    constructor(status, z) {
        super(status);
        this.z = z;
    }

    checkCondition(state) {
        return this.z == state.location_data.position.z; //&& state["informational_settings"]["busy"] == false;
    }

    async execute(farmbot, lastState) {
        //this.z = Math.max(this.z, lastState.location_data.position.z);
        try {
            await farmbot.moveAbsolute({ x: lastState.location_data.position.x, y: lastState.location_data.position.y, z: this.z, speed: 100 });
        } catch(e) {
            console.log(e)
        }
    }
}

export {MoveZTask};