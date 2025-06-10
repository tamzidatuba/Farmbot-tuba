import { Task } from "./Task.js"

const WATER_PIN = {
    pin_type: "BoxLed3", // "Peripheral"
    pin_id: -1 //this.pinNumber
};
const VACUUM_PIN = {
    pin_type: "BoxLed4", // "Peripheral"
    pin_id: -1 //this.pinNumber
};

class SetPinTask extends Task {
    constructor(status, pinData, value) {
        super(status);
        this.value = value;

        this.pinArgs = {
            pin_number: {
                kind: "named_pin",
                args: pinData
            },
            pin_value: this.value,
            pin_mode: 0
        };
    }

    checkCondition(state) {
        return true;
        // TODO check if actual farmbot water-pin in state data
        if (this.pinNumber in state.pins) {
            return state.pins[this.pinNumber].value == this.value;
        }
        return false;
    }

    execute(farmbot, lastState) {
        farmbot.writePin(this.pinArgs);
    }

}

export {SetPinTask, WATER_PIN, VACUUM_PIN};