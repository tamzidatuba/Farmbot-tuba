import express from 'express';
import mongoose from 'mongoose';
import userModule from './models/user.model.js';
import wateringjob from './models/wateringjob.model.js';
import seedingjob from './models/seedingjob.model.js';

const connectionString = 'mongodb://localhost:27017/admin';
const app = express();
app.use(express.json());

// test connection to local database
mongoose.connect(connectionString)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

/*// insert test user to collection in local db
async function InsertUser() {
  await userModule.create({ name: 'admin', password: 'secret' });
  console.log('Sample user created');
}

export async function GetUserById(id) {
  try
  {
    const user = await userModule.findById(id);
    return user;
  }
  catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function GetUserByName(inputName) {
  try
  {
    const user = await userModule.findOne({name: inputName});
    return user;
  }
  catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function GetAdmin() {
  try
  {
    const admin = await userModule.findOne({name: "admin"});
    return admin;
  }
  catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// call function
// await InsertUser();

var user = await GetUserById('6824957990c6f8b11ff79691');

console.log('----------------------------------');
console.log(user.id);
console.log(user.name);
console.log(user.password);
console.log('----------------------------------');
var user2 = await GetUserByName('admin');
console.log(user2.id);
console.log(user2.name);
console.log(user2.password);
console.log('----------------------------------');

var admin = await GetAdmin();
admin.password = 'newpassword';
await admin.save();


const jobSchema = new mongoose.Schema({
  xcoordinate: Number,
  ycoordinate: Number,
});*/

//const job = mongoose.model('job', jobSchema);
//export default job;

await  wateringjob.InsertWaterPlant("Lettuce2", 230,240, 20);
await seedingjob.InsertSeedingJobToDB(1, 2, 'corn');