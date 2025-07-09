import mongoose from 'mongoose';
import { plantSchema } from './plant.model.js';
import express from 'express';


const connectionString = 'mongodb://localhost:27017/admin';
const app = express();
app.use(express.json());

// test connection to local database
mongoose.connect(connectionString)
  .then(() => console.log('MongoDB connected to the Watering Job Database.'))
  .catch((err) => console.error('MongoDB connection error: to the Watering Job Database.', err));

// create schema for data
const wateringSchema = mongoose.Schema({
  jobname: String,
  plantstobewatered: [
    {
      plant: plantSchema,
      wateringcapacity: Number,
      wateringheight: Number,
    }
  ],
  is_scheduled: Boolean,
  ScheduleData: {
    next_execution_time: Number,
    interval: Number,
    enabled: Boolean,
  }
}
);

//creating a model for wateringjob
export const WaterJobModel = mongoose.model('wateringjob', wateringSchema);

//for the name/type of the plant example :  radish1 or lettuce 2, the coordinates and the millilitres to be watered.
async function InsertWateringJobToDB(jobname, plantstobewatered, is_scheduled, scheduleData) {
  await WaterJobModel.create({ jobname: jobname, plantstobewatered: plantstobewatered, is_scheduled: is_scheduled, ScheduleData: scheduleData });
}

async function DeleteWateringJobFromDB(jobname) {
  await WaterJobModel.deleteOne({ "jobname": jobname });
}

async function FetchAllWateringJobsFromDB() {
  const existingWaterjob = await WaterJobModel.find();
  if (existingWaterjob) {
    return existingWaterjob;
  }
  else {
    console.log("There are no watering jobs.");
  }
}

async function ReturnWateringJob(jobname) {
  const job = await WaterJobModel.findOne({ "jobname": jobname });
  if (job !== null && typeof (job) !== "undefined") {
    return { jobType: "Watering", job };
  }
  else {
    return null;
  }

}

async function UpdateWateringJobToDB(jobname, plantstobewatered, is_scheduled, scheduleData) {
  await WaterJobModel.findOneAndUpdate({ "jobname": jobname }, { jobname: jobname, plantstobewatered: plantstobewatered, is_scheduled: is_scheduled, ScheduleData: scheduleData });
  console.log("Job has been updated.");
}

export default {
  InsertWateringJobToDB,
  DeleteWateringJobFromDB,
  FetchAllWateringJobsFromDB,
  UpdateWateringJobToDB,
  ReturnWateringJob,
  findOne: (args) => WaterJobModel.findOne(args),
};



