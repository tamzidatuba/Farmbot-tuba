import { Queue } from "./Queue.js"

/*
A Job is a list of Tasks inside a Queue for the Farmbot to complete
*/

class Job {
    constructor() {
        this.taskQueue = new Queue();
    }

    isJobCompleted() {
        return this.taskQueue.isEmpty;
    }

    getNextTask() {
        return this.taskQueue.peek();
    }

    taskFinished() {
        console.log("Finished a task");
        this.taskQueue.dequeue();
    }
}

export {Job};