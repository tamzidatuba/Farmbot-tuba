import mongoose from 'mongoose';
import express from 'express';


const connectionString = 'mongodb://localhost:27017/admin';
const app = express();
app.use(express.json());

// test connection to local database
mongoose.connect(connectionString)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// create schema for data
const ScheduledWateringSchema = mongoose.Schema({
  jobname: String,
  seeds: [{
    xcoordinate: Number,
    ycoordinate: Number,
    wateringheight: Number,
    plantType: String,
    wateringcapacity: Number,
    nextexecutiontime:Number,
    interval: Number,
  }],
  status:Boolean,
  date: Date
}
);

//creating a model for wateringjob
const ScheduledWaterJobModel = mongoose.model('scheduledwateringjob', ScheduledWateringSchema);

/*const Plant = {
  plantname: "plant3",
  planttype: "radish",
  xcoordinate: 140,
  ycoordinate: 120,
};*/
