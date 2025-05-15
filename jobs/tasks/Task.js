/*
A Task is a single Instruction for the Farmbot with a condition to check if its fulfilled
*/

class Task {
    constructor() {
        this.completed = false;
    }


    checkCondition(state) {
        return true;
    }

    execute(farmbot, lastState) {
        console.log("Executing empty Task");
    } 
}

export {Task};