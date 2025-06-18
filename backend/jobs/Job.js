/*
A Job is a list of Tasks inside a Queue for the Farmbot to complete


TODO before executing next task. ensure the last task condition is still met (especialy for move commands)
*/

class Job {
    constructor(jobName) {
        this.taskQueue = new Array(); //new Queue();
        this.name = jobName
    }

    isJobCompleted() {
        return this.taskQueue.length == 0;
    }

    getNextTask() {
        return this.taskQueue[0];
    }

    taskFinished() {
        console.log("Finished a task");
        this.taskQueue.shift();
    }
}

export {Job};