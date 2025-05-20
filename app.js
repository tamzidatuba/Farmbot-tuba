import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import SeedingModule  from './models/seedingjob.model.js';
import  WateringModule from './models/wateringjob.model.js';

const app = express();
const PORT = 3000;

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (CSS, JS) from root
app.use(express.static(__dirname));
app.use(express.json());

//connect to DB
const connectionString = 'mongodb://localhost:27017/admin';

// test connection to local database
mongoose.connect(connectionString)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));


// Serve index.html on root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint
app.post('/api/insertseedingjob', async (req, res) => {
  const { x, y, plant, depth } = req.body;
  try {
    await SeedingModule.InsertSeedingJobToDB(x, y, plant, depth);
    res.status(200).json({ message: 'Job saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save job' });
  }
});

app.post('/api/insertwateringjob', async (req, res) => {
  const {plantName,x,y,wateringcapacity} = req.body;
  try {
    await WateringModule.InsertWateringJobToDB(plantName,x,y,wateringcapacity);
    res.status(200).json({ message: 'Job saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save job' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});