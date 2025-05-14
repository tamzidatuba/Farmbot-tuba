const express = require('express');
const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/admin';
const app = express();
app.use(express.json());

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));
