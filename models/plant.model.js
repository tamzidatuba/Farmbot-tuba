import mongoose from 'mongoose';


/*
//connect to DB
const connectionString = 'mongodb://localhost:27017/admin';

// test connection to local database
mongoose.connect(connectionString)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
*/

const plantSchema = new mongoose.Schema({
  planttype: String,
  planteddate: Date,
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

/*const Plant = {
  plantname: "plant3",
  planttype: "radish",
  xcoordinate: 140,
  ycoordinate: 120,
};*/

//await InsertPlantToDB(Plant);


export default 
{
  InsertPlantToDB,
  FetchPlantsFromDB,
};