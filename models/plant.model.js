import mongoose from 'mongoose';
import express from 'express';

//connect to the database
const connectionString = 'mongodb://localhost:27017/admin';
const app = express();
app.use(express.json());

// test connection to local database
mongoose.connect(connectionString)
  .then(() => console.log('MongoDB connected to the Plants Database.'))
  .catch((err) => console.error('MongoDB connection error: to the Plants Database.', err));

//define plant schema or the structure of each document/ entry in Mongo DB
export const plantSchema = new mongoose.Schema({
  plantname: String,
  planttype: String,
  xcoordinate: Number,
  ycoordinate: Number,
});

//create a new model to interact with the schema
const plantModel = mongoose.model("plant", plantSchema);

//function to insert plants in the schema
async function InsertPlantToDB(plant) {
  await plantModel.create(plant);
}

//function to fetch plants in the schema
async function FetchPlantsFromDB() {
  const plants = await plantModel.find().select('plantname planttype xcoordinate ycoordinate');
  return plants;
}

//function to delete plant in the schema
async function DeletePlantFromDB(xcoordinate, ycoordinate) {
  await plantModel.deleteOne({ "xcoordinate": xcoordinate, "ycoordinate": ycoordinate });
}

async function UpdatePlantNameToDB(plantname, xcoordinate, ycoordinate){
  let changed_name = await plantModel.findOneAndUpdate(
    {"xcoordinate":xcoordinate,"ycoordinate":ycoordinate}, 
    {$set: {"plantname": plantname}},
    {new:true}
  );
    return changed_name;
}

//exporting for further usage in other files
export default
  {
    InsertPlantToDB,
    FetchPlantsFromDB,
    DeletePlantFromDB,
    UpdatePlantNameToDB,
  };