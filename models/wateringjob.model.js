import mongoose from 'mongoose';
import express from 'express';


// create schema for data
const wateringSchema = mongoose.Schema({
  plantName : String,
  xcoordinate: Number,
  ycoordinate: Number,
  time: Number,},
  {
  timestamps: true  //To add createdAt and updatedAt fields
}
);

//creating a model for wateringjob
const WaterJobModel = mongoose.model('wateringjob',wateringSchema);

async function InsertWaterPlant( plantName1, xcoordinate1, ycoordinate1, time1)
{
  await WaterJobModel.create({plantName: plantName1, xcoordinate: xcoordinate1, ycoordinate: ycoordinate1, time:time1});
  console.log(plantName1 +' added in Database.');
}


export default{
    InsertWaterPlant,
};
