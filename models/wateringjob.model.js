import mongoose from 'mongoose';

// create schema for data
const wateringSchema = mongoose.Schema({
  plantName : String,
  xcoordinate: Number,
  ycoordinate: Number,
  wateringDuration: Number,
  date: Date}
);

//creating a model for wateringjob
const WaterJobModel = mongoose.model('wateringjob',wateringSchema);

async function InsertWateringJob( plantName, x, y, wateringDuration)
{
  var now = new Date();
  await WaterJobModel.create({plantName: plantName, xcoordinate: x, ycoordinate: y,wateringDuration:wateringDuration, date:now});
  console.log(plantName +' added in Database.');
}


export default{
    InsertWateringJob,
};
