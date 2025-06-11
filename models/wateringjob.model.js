import mongoose from 'mongoose';
import { plantSchema } from './plant.model.js';

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
  ScheduleData:{
    firstexecutiontime: String,
    interval: Number,
    enabled:Boolean,
  }
}
);

//creating a model for wateringjob
export const WaterJobModel = mongoose.model('wateringjob', wateringSchema);

//for the name/type of the plant example :  radish1 or lettuce 2, the coordinates and the millilitres to be watered.
async function InsertWateringJobToDB(jobname, plantstobewatered) {
    await WaterJobModel.create({ jobname: jobname, plantstobewatered: plantstobewatered });
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
  const job = await WaterJobModel.findOne({"jobname":jobname});
  if (job !== null && typeof (job) !== "undefined") {
    return { jobType: "Watering", job };
  }
  else {
    return null;
  }

}

async function UpdateWateringJobToDB(jobname, plantstobewatered) {
  const now = new Date();
  await WaterJobModel.findOneAndUpdate({ "jobname": jobname }, {jobname: jobname, plantstobewatered: plantstobewatered });
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