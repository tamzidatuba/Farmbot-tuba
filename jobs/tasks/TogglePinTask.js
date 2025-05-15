import { Task } from "./Task.js"

const WATER_PIN = 8;
const VACUUM_PIN = 9;

class TogglePinTask extends Task {
    constructor(status, pinNumber) {
        super(status);
        this.pinNumber = pinNumber;
        this.currentPinState;
    }

    checkCondition(state) {
        if (this.pinNumber in state.pins) {
            return state.pins[this.pinNumber].value != this.currentPinState;
        }
        return false;
    }

    execute(farmbot, lastState) {
        this.currentPinState = lastState.pins[this.pinNumber].value
        farmbot.togglePin({pin_number: this.pinNumber});
    }

}

export {TogglePinTask, WATER_PIN, VACUUM_PIN};