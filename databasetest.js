import express from 'express';
import mongoose from 'mongoose';

const connectionString = 'mongodb://localhost:27017/admin';
const app = express();
app.use(express.json());

// test connection to local database
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true,})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// create schema for data
const userSchemaTest = mongoose.Schema({
  name: String,
  password: String,
});

// create model for user
const userModel = mongoose.model('User', userSchemaTest, 'Users');

// insert test user to collection in local db
async function InsertUser() {
  await userModel.create([
    { name: 'admin', password: 'secret' },
  ]);
  console.log('Sample user created');
}

// call function
await InsertUser();