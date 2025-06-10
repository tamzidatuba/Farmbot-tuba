import mongoose from 'mongoose';
import express from 'express';
import {plantSchema} from './plant.model.js';
import wateringjobModel from './wateringjob.model.js';


const connectionString = 'mongodb://localhost:27017/admin';
const app = express();
app.use(express.json());

// test connection to local database
mongoose.connect(connectionString)
.then(() => console.log('MongoDB connected to Scheduled Watering Jobs Database.'))
.catch((err) => console.error('MongoDB connection error: to the Scheduled Jobs Database.', err));

// create schema for data
const ScheduledWateringSchema = mongoose.Schema({
  jobname: String,
  plantstobewatered: [{
    plant : plantSchema,
    wateringheight: Number,
    wateringcapacity: Number,
  }],
  nextexecutiontime:String,
  interval: Number,
  enabled:Boolean,
}
);

//creating a model for wateringjob
const ScheduledWaterJobModel = mongoose.model('scheduledwateringjob', ScheduledWateringSchema);


async function InsertScheduledWateringjob(jobname,plantstobewatered,enabled)
{
  const seeds = await ScheduledWaterJobModel.create({jobname: jobname, plantstobewatered: plantstobewatered, enabled: enabled})
}

async function DeleteScheduledWateringJob(jobname){
  const job = await ScheduledWaterJobModel.deleteOne({"jobname":jobname});
}

async function FetchAllScheduledWateringJobsFromDB()
{  
  let scheduledwaterjob  = await ScheduledWaterJobModel.find();
  if(scheduledwaterjob !== null && typeof(scheduledwaterjob)!== "undefined"){
    return (scheduledwaterjob);
  }
  else{
    return null;
  }
}

async function FetchSingleScheduledJobFromDB(id)
{
  let scheduledwaterjob = await ScheduledWaterJobModel.findById(id);
  if (scheduledwaterjob !== null && typeof(scheduledwaterjob) !== "undefined" ){
     return {jobType : "Watering",scheduledwaterjob};
  }
  else{
    return null;
  }

}

export default{
  InsertScheduledWateringjob,
  DeleteScheduledWateringJob,
  FetchAllScheduledWateringJobsFromDB,
  FetchSingleScheduledJobFromDB,
}

/*const plantstobewatered = [
    {
      plant: {
      plantname: "plant3",
      planttype: "radish",
      xcoordinate: 140,
      ycoordinate: 120,
      },
      wateringheight: 20,
      wateringcapacity: 1.5,
      nextexecutiontime: "2025-06-11T07:00:00Z",
      interval: 2
    },
    {
      plant: {
      plantname: "plant2",
      planttype: "lettuce",
      xcoordinate: 160,
      ycoordinate: 140,
      },
      wateringheight: 15,
      wateringcapacity: 2.0,
      nextexecutiontime: "2025-06-11T07:15:00Z",
      interval: 3
    }
  ];

const insertjob = await InsertScheduledWateringjob("Job3",plantstobewatered,true);
let wateringjob = await DeleteScheduledWateringJob("Job2");
wateringjob = await FetchAllScheduledWateringJobsFromDB();
console.log(wateringjob);
wateringjob = await FetchSingleScheduledJobFromDB('6847f2c7574b3b9a810810c6');
console.log(wateringjob);
*/