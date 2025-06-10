import { Task } from "./Task.js";

class MoveTask extends Task {

    constructor(status, x, y, speed=100) {
        super(status);
        this.x = x;
        this.y = y;
        this.speed = speed;
        // TODO maybe add speed parameter?
    }

    checkCondition(state) {
        return this.x == state.location_data.position.x && this.y == state.location_data.position.y;
    }

    async execute(farmbot, lastState) {
        try {
            await farmbot.moveAbsolute({ x: this.x, y: this.y, z: lastState.location_data.position.z, speed: this.speed});
        } catch(e) {
            console.log(e)
        }
    }
}

export {MoveTask};