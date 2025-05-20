import mongoose from 'mongoose';

// create schema for data
const wateringSchema = mongoose.Schema({
  plantName : String,
  xcoordinate: Number,
  ycoordinate: Number,
  wateringcapacity: Number,
  date: Date}
);

//creating a model for wateringjob
const WaterJobModel = mongoose.model('wateringjob',wateringSchema);

//for the name/type of the plant example :  radish1 or lettuce 2, the coordinates and the millilitres to be watered.
async function InsertWateringJobToDB( plantName, x, y, wateringcapacity)
{

  const existingWaterjob = await WaterJobModel.findOne({plantName: plantName}, {xcoordinate: x}, {ycoordinate: y},{wateringcapacity:wateringcapacity})
  if(existingWaterjob)//if the exact same job already exists give a warning/ to find duplicates
  {
    console.log("This watering request has been made already.");
  }
  else{//  else add the job to the table
      var now = new Date();
      await WaterJobModel.create({plantName:plantName, xcoordinate: x, ycoordinate: y,wateringcapacity: wateringcapacity, date:now});
      console.log(plantName +' added in Database.');
  }
}

async function DeleteWateringJobToDB(id)
{
  const existingWaterjob = await WaterJobModel.findById(id);
  if(existingWaterjob)
  {
    await WaterJobModel.findByIdAndDelete(id);
    console.log("This watering request has been deleted.");
  }
  else{//  else add the job to the table
console.log("This watering job does not exist.");

  }
}

async function FetchAllWateringJobs() 
{
    const existingWaterjob = await WaterJobModel.find();
    if(existingWaterjob)
  {
    return existingWaterjob;
  }
  else
  {
    console.log("There are no watering jobs.");
  }
}

export default{
    InsertWateringJobToDB,
    DeleteWateringJobToDB,
    FetchAllWateringJobs,
};