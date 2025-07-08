import { Task } from "./Task.js"

class MoveZTask extends Task {
    constructor(status, z, speed = 100) {
        super(status);
        this.z = z;
        this.speed = speed;
    }

    checkCondition(state) {
        return this.z == state.location_data.position.z; //&& state["informational_settings"]["busy"] == false;
    }

    async execute(farmbot, lastState) {
        try {
            await farmbot.moveAbsolute({ x: lastState.location_data.position.x, y: lastState.location_data.position.y, z: this.z, speed: this.speed });
        } catch(e) {
            console.log(e)
        }
    }
}

export {MoveZTask};