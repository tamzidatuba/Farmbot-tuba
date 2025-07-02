/*
A Task is a single Instruction for the Farmbot with a condition to check if its fulfilled
*/

class Task {
    constructor(status) {
        this.status = status;
    }

    checkCondition(state) {
        return true;
    }

    async pauseTask(farmbot) {
        await farmbot.emergencyLock();
        await farmbot.emergencyUnlock();
        return;
    }

    continueTask(farmbot, lastState) {
        this.execute(farmbot, lastState);
    }

    execute(farmbot, lastState) {
        console.log("Executing empty Task");
    } 
}

export {Task};