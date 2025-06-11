import mongoose from 'mongoose';
import express from 'express';


const connectionString = 'mongodb://localhost:27017/admin';
const app = express();
app.use(express.json());

// test connection to local database
mongoose.connect(connectionString)
.then(() => console.log('MongoDB connected to Execution Queue Database.'))
.catch((err) => console.error('MongoDB connection error: to the Execution Queue Database.', err));

// create schema for data
const ExecutionQueueSchema = mongoose.Schema({

    job_id : String,
    time_stamp : Number,
}
);

export const ExecutionModel =  mongoose.model("execution_pipeline", ExecutionQueueSchema);

async function InsertintoExecutionDB(job_id,time_stamp)
{
    let existing_new_job = await ExecutionModel.findOne({job_id:job_id});
    if(existing_new_job == null || typeof(existing_new_job) == "undefined")
    {
        let new_job = await ExecutionModel.create({job_id: job_id, time_stamp: time_stamp});
        return new_job;
    }
    else
    {
        return null;
    }
}

async function RemovefromExecutionDB(job_id)
{

    let new_job = await ExecutionModel.deleteOne({job_id: job_id});

}

async function FetchAllfromExecutionDB() {

    let existing_new_job = await ExecutionModel.find();
    if(existing_new_job !== null && typeof(existing_new_job) !== "undefined")
    {
        return existing_new_job;
    }
    else
    {
        return null;
    }
    
}

export default{
    InsertintoExecutionDB,
    RemovefromExecutionDB,
    FetchAllfromExecutionDB,
}

