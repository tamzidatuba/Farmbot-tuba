import mongoose from 'mongoose';
import express from 'express';

const connectionString = 'mongodb://localhost:27017/admin';
const app = express();
app.use(express.json());

// test connection to local database
mongoose.connect(connectionString)
.then(() => console.log('MongoDB connected to the Plants Database.'))
.catch((err) => console.error('MongoDB connection error: to the Plants Database.', err));

export const plantSchema = new mongoose.Schema({
  plantname: String,
  planttype: String,
  xcoordinate: Number,
  ycoordinate: Number,  
});

const plantModel = mongoose.model("plant", plantSchema);

async function InsertPlantToDB(plant) {
  await plantModel.create(plant);
}

async function FetchPlantsFromDB() {
  const plants = await plantModel.find().select('plantname planttype xcoordinate ycoordinate');
  return plants; 
}

async function DeletePlantFromDB(xcoordinate, ycoordinate)
{
    await plantModel.deleteOne({"xcoordinate": xcoordinate, "ycoordinate": ycoordinate});
}

export default 
{
  InsertPlantToDB,
  FetchPlantsFromDB,
  DeletePlantFromDB,
};