import express from 'express';
import mongoose from 'mongoose';

const connectionString = 'mongodb://localhost:27017/admin';
const app = express();
app.use(express.json());

// test connection to local database
mongoose.connect(connectionString)
  .then(() => console.log('MongoDB connected to the Users Database.'))
  .catch((err) => console.error('MongoDB connection error: to the Users Database.', err));

// create schema for data
const userSchema = mongoose.Schema({
  username: String,
  password: String,
});

// create model for user
const userModel = mongoose.model('user', userSchema);


// insert test user to collection in local db
async function InsertUser(username, password) {
  await userModel.create({ username: username, password: password });
  console.log('Sample user created');
}

async function FetchUser(username, password) {
  const userlogin = await userModel.findOne({ "username": username, "password": password });
  return userlogin;
}

async function UpdateUser(username, password) {
  const userlogin = await userModel.findOneAndUpdate({ "username": username }, { password: password });
}

// await InsertUser('testuser', 'testpassword'); // Uncomment to insert a test user

export default {
  InsertUser,
  FetchUser,
  UpdateUser,
};


