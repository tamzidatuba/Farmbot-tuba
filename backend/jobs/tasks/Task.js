/*
A Task is a single Instruction for the Farmbot with a condition to check if its fulfilled.
It can be reused keeping the same parameters.
*/

class Task {
    // Recieve the status corresponding to the Task
    constructor(status) {
        this.status = status;
    }

    // Checks if the condition has been met -> Task has been completed
    checkCondition(state) {
        return true;
    }
    // Code for Task-Specific pausing
    async pauseTask(farmbot) {
        await farmbot.emergencyLock();
        await farmbot.emergencyUnlock();
        await new Promise(res => setTimeout(res, 5000)); // Wait 5 Seconds
        return;
    }
    // Code for Task-Specific resuming
    continueTask(farmbot, lastState) {
        this.execute(farmbot, lastState);
    }
    // Code for Task-Specific execution
    execute(farmbot, lastState) {
        console.log("Executing empty Task");
    } 
}

export {Task};