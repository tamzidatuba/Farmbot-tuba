import { Task } from "./Task.js"

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

        this.executionFinished = false;
    }

    checkCondition(state) {
        return this.executionFinished;
        // TODO check if actual farmbot pin_id in state data
        // pin_id doesnt work for fake-farmobt. Too lazy to check for actual farmbot
        /*if (this.pinArgs.pin_number.args.pin_id in state.pins) {
            return state.pins[this.pinNumber].value == this.value;
        }
        return false;
        */
    }

    async execute(farmbot, lastState) {
        await farmbot.writePin(this.pinArgs);
        this.executionFinished = true;
    }

}

export {
    SetPinTask
};