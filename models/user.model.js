import express from 'express';
import mongoose from 'mongoose';

const connectionString = 'mongodb://localhost:27017/admin';
const app = express();
app.use(express.json());

// test connection to local database
mongoose.connect(connectionString)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// create schema for data
const userSchema = mongoose.Schema({
  username: String,
  password: String,
});

// create model for user
const userModel = mongoose.model('user', userSchema);


// insert test user to collection in local db
async function InsertUser() {
  await userModel.create({ username: 'admin', password: 'admin'});
  console.log('Sample user created');
}

// call function
await InsertUser();

async function FetchUser(username, password)
{
 const userlogin = await userModel.findOne({"username":username, "password":password});
 return userlogin;

}




