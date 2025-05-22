import mongoose from 'mongoose';

const plantSchema = new mongoose.Schema({
  plantname: String,
  planttype: String,
  plantedate: Date,
  xcoordinate: Number,
  ycoordinate: Number,  
});

const plantModel = mongoose.model("plant", plantSchema);

async function InsertPlantToDB(plant) {
  await plantModel.create(plant);
}

async function FetchPlantsFromDB() {
  const notifications = await plantModel.find();
  return notifications;
}

export default {
  InsertPlantToDB,
  FetchPlantsFromDB,
};