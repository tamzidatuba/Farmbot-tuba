import mongoose from 'mongoose';

export const plantSchema = new mongoose.Schema({
  planttype: String,
  xcoordinate: Number,
  ycoordinate: Number,  
});

const plantModel = mongoose.model("plant", plantSchema);

async function InsertPlantToDB(plant) {
  await plantModel.create(plant);
}

async function FetchPlantsFromDB() {
  const notifications = await plantModel.find().select('planttype xcoordinate ycoordinate');
  return notifications; 
}

export default 
{
  InsertPlantToDB,
  FetchPlantsFromDB,
};