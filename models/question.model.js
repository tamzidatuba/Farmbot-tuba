import mongoose from 'mongoose';
import express from 'express';


const connectionString = 'mongodb://localhost:27017/admin';
const app = express();
app.use(express.json());

// test connection to local database
mongoose.connect(connectionString)
.then(() => console.log('MongoDB connected to Questions Database.'))
.catch((err) => console.error('MongoDB connection error: to the Questions Database.', err));

export const  askQuestionSchema = new mongoose.Schema(
    {
        question : String,
        answer: String,
    }

);

const questionModel = mongoose.model('questions', askQuestionSchema);

async function InsertQuestionsToDB(question, answer)
{
    let question1  = await questionModel.create({question: question, answer: answer});
    return question1;
}

async function FetchSpecificQuestionsFromDB(question)
{
    let questions = await questionModel.findOne({"question":question});
    return questions;
}

async function FetchAllQuestionsFromDB()
{
    let questions = await questionModel.find();
    return questions;
}

export default{
    InsertQuestionsToDB,
    FetchAllQuestionsFromDB,
    FetchSpecificQuestionsFromDB,
}

//await InsertQuestionsToDB("alagammai0007@gmail.com","How often can the plants be watered through the farmbot?");