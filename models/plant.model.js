import mongoose from 'mongoose';


/*
//connect to DB
const connectionString = 'mongodb://localhost:27017/admin';

// test connection to local database
mongoose.connect(connectionString)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
*/

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
  const plants = await plantModel.find().select('planttype xcoordinate ycoordinate');
  return plants; 
}

export default 
{
  InsertPlantToDB,
  FetchPlantsFromDB,
};