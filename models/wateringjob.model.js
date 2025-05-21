import mongoose from 'mongoose';

// create schema for data
const wateringSchema = mongoose.Schema({
  jobname: String,
  plantName: String,
  xcoordinate: Number,
  ycoordinate: Number,
  wateringcapacity: Number,
  date: Date
}
);

//creating a model for wateringjob
const WaterJobModel = mongoose.model('wateringjob', wateringSchema);

//for the name/type of the plant example :  radish1 or lettuce 2, the coordinates and the millilitres to be watered.
async function InsertWateringJobToDB(jobname, plantName, x, y, wateringcapacity) {

  const existingWaterjob = await WaterJobModel.findOne({jobname: jobname},{ plantName: plantName }, { xcoordinate: x }, { ycoordinate: y }, { wateringcapacity: wateringcapacity })
  if (existingWaterjob)//if the exact same job already exists give a warning/ to find duplicates
  {
    console.log("This watering request has been made already.");
    return null;
  }
  else {//  else add the job to the table
    var now = new Date();
    await WaterJobModel.create({ jobname: jobname, plantName: plantName, xcoordinate: x, ycoordinate: y, wateringcapacity: wateringcapacity, date: now });
    console.log(plantName + ' added in Database.');
  }
}

async function DeleteWateringJobFromDB(jobname) {
  await WaterJobModel.deleteOne({"jobname": jobname});
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


async function UpdateWateringJobToDB(jobname, plantName, x,y, wateringcapacity) {
  const now = new Date();
  await WaterJobModel.findOneAndUpdate( {"jobname": jobname},{plantName: plantName, xcoordinate: x, ycoordinate: y, wateringcapacity: wateringcapacity, date: now});
  console.log("Job has been updated.");
  
}



export default {
  InsertWateringJobToDB,
  DeleteWateringJobFromDB,
  FetchAllWateringJobsFromDB,
  UpdateWateringJobToDB,
};