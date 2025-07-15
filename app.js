import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import DatabaseService from './backend/databaseservice.js';
import { Backend } from './backend/backend.js';
import createJobsRouter from './routes/jobs.js';
import TokenManager from "./backend/tokenManager.js";
import nodemailer from 'nodemailer';


const app = express();
const PORT = 3000;


// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backend = new Backend();

// Serve static files (CSS, JS) from root
app.use(express.static(path.join(__dirname, 'frontend//')));
app.use(express.json());


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Serve index.html on root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend//index.html'));
});

app.use('/api/jobs', createJobsRouter(backend));

//to get plants
app.get('/api/plants', async (req, res) => {
  try {
    backend.refetchPlants()
    res.status(200).json(backend.plants);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in fetching plants from the database." });
  }
});

app.post('/api/questions', async (req, res) => {
  const { question, answer } = req.body
  try {
    await DatabaseService.InsertQuestionsIntoDB(question, answer);
    res.status(200).json({ message: "Thank you! Your question has been submitted." });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save question to Database." });
  }
});

app.get('/api/getquestions', async (req, res) => {
  try {
    let getquestions = await DatabaseService.FetchAlltheQuestionsFromDB();
    res.status(200).json(getquestions);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch questions and answers from the database." });
  }
});

app.get('/api/getsinglequestion', async (req, res) => {
  const { question } = req.body;
  try {
    let getsinglequestion = await DatabaseService.FetchQuestionsFromDBbyQuestion(question);
    res.status(200).json(getsinglequestion);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch question and answer from database." });
  }
});

app.put('/api/putquestions', async (req, res) => {
  const { answer, question } = req.body;
  try {
    let insert_answer = await DatabaseService.InsertAnswerIntoDB(question, answer);
    res.status(200).json(insert_answer);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to insert answer to database." });
  }
});

app.put('/api/plant/rename', async (req,res) => {
  const {plantname, xcoordinate, ycoordinate,token} =req.body;
  if (!TokenManager.validateToken(token)) {
    res.status(500).json({ error: "You dont have permission to do that" });
    return
  }
  try {
    await DatabaseService.UpdatePlantNameinDB(plantname, xcoordinate, ycoordinate);
    backend.refetchPlants()
    res.status(200).json("The plant name has been updated.");
  }catch(err) {
    console.error(err);
    res.status(500).json({error:"Failed to change the name of the plant."});
  }
});


// delete plant
app.delete('/api/plant', async (req, res) => {
  const { token, xcoordinate, ycoordinate } = req.body;
  if (!TokenManager.validateToken(token)) {
    res.status(500).json({ error: "You dont have permission to do that" });
    return
  }
  try {
    await DatabaseService.DeletePlantFromDB(xcoordinate, ycoordinate);
    for (const plant in backend.plants) {
      if (backend.plants[plant].xcoordinate == xcoordinate && backend.plants[plant].ycoordinate == ycoordinate) {

        // remove job from queue
        let plant_object = backend.plants.splice(plant, 1);
        backend.appendNotification("plant_deleted", plant_object.plantname);
        DatabaseService.ClearPlantFromWateringJobs(xcoordinate, ycoordinate);
      }
    }
    res.status(200).json({ message: 'The Plant has been deleted from the database.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete plant from database.' });
  }
});

app.put('/api/updateuser/:username/:password', async (req, res) => {
  const { username, password } = req.params;
  const { token } = req.body
  if (!TokenManager.validateToken(token)) {
    res.status(500).json({ error: "You dont have permission to do that" });
    return
  }
  try {
    const user = await DatabaseService.UpdateUserToDB(username, password);
    res.status(200).json({ message: "The Password has been Updated." })
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user in Database.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    let users = await DatabaseService.FetchUserfromDB(username, password);
    if (users == null) {
      res.status(500).json({ error: "Error. Invalid credentials for login." });
    }
    else {
      res.status(200).json({ Message: "Login Successful.", token: TokenManager.generateAndReturnToken() });
    }
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error. Invalid credentials for login." });
  }
});

app.post('/api/logout', async (req, res) => {
  const { token } = req.body;
  TokenManager.removeToken(token);
});

app.get('/api/frontendData', (req, res) => {
  res.status(200).json(backend.generateFrontendData());
});

app.post('/api/demo/watering', async (req, res) => {
  const { payload, token } = req.body
  const job_data = { jobType: DatabaseService.JobType.WATERING, job: payload, demo: true }
  console.log(payload.plantstobewatered[0].plant);
  // append demo to schedule_manager
  if (!backend.demo_job_queued && backend.scheduleManager.appendDemoJob(job_data)) {
    backend.appendNotification(TokenManager.getUser(token) + " queued", "Watering-Demo");
    backend.checkForNextJob();
    res.status(200).json({ message: "wateringDemoQueued" });
  } else {
    res.status(500).json({ error: 'demoDenied' });
  }
});

app.post('/api/demo/seeding', async (req, res) => {
  const { payload, token } = req.body
  const job_data = { jobType: DatabaseService.JobType.SEEDING, job: payload, demo: true }
  // append demo to schedule_manager
  if (!backend.demo_job_queued && backend.scheduleManager.appendDemoJob(job_data)) {
    backend.checkForNextJob();
    backend.appendNotification(TokenManager.getUser(token) + " queued", "Seeding-Demo");
    res.status(200).json({ message: "seedingDemoQueued" })
  } else {
    res.status(500).json({ error: 'demoDenied' });
  }
});

//for ask questions


app.post('/api/ask-question', async (req, res) => {
  const { email, question } = req.body;

  if (!email || !question) {
    return res.status(400).json({ error: 'Email and question are required.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'farmbot285@gmail.com',
        pass: 'jphfvfkdtbvcgyxf'  // app password 
      }
    });

    const supportMailOptions = {
      
      from:email,
      to: 'farmbot285@gmail.com',
      subject: `New question from ${email}`,
      text: `You have received a new question from ${email}:\n\n${question}`
    };

   

    await Promise.all([
      transporter.sendMail(supportMailOptions)
      
    ]);

    res.status(200).json({ message: 'Your question was received and sent to team.' });
  } catch (err) {
    console.error('Email sending error:', err);
    res.status(500).json({ error: 'Failed to send email. Try again later.' });
  }
});

app.post('/api/send-feedback', async (req, res) => {
  const { rating, message } = req.body;

  if (!rating || !message) {
    return res.status(400).json({ error: 'Rating and message are required.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'farmbot394@gmail.com',
        pass: 'fhiuohwwzqezuolf'
      }
    });

    const mailOptions = {
      from: 'farmbot394@gmail.com',
      to: 'farmbot394@gmail.com',
      subject: `New Feedback Received ⭐️ Rating: ${rating}`,
      text: `Feedback Message:\n\n${message}\n\nRating: ${rating}`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Feedback sent successfully.' });
  } catch (error) {
    console.error('Feedback email error:', error);
    res.status(500).json({ error: 'Failed to send feedback email.' });
  }
});

//api to update question
app.put('/api/questions/update', async (req,res) => {
  const {user,question,answer,token} =req.body;
  if (!TokenManager.validateToken(token)) {
    res.status(500).json({ error: "You dont have permission to do that" });
    return
  }
  try {
    await DatabaseService.UpdateQuestionDetailsIntoDB(user,question,answer);
    res.status(200).json("The changed details have been updated.");
  }catch(err) {
    console.error(err);
    res.status(500).json({error:"Failed to update the change."});
  }
});



//api to delete question
app.delete('/api/questions/delete', async (req, res) => {
  const { question, token } = req.body
  if (!TokenManager.validateToken(token)) {
    res.status(500).json({ error: "You dont have permission to do that" });
    return
  }
  try {
    await DatabaseService.DeleteQuestionInDB(question);
    res.status(200).json({ message: 'Question deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question.' });
  }
    });