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
        email : String,
        question : String,
        //answer: String,
    }

);

const questionModel = mongoose.model('questions', askQuestionSchema);

async function InsertQuestionsToDB(email, question)
{
    let answer  = await questionModel.create({email: email, question: question});
    return answer;
}

async function FetchSpecificQuestionsFromDB(email)
{
    let questions = await questionModel.findOne({"email":email});
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