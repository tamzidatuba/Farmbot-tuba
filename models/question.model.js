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
        user: String,
        question : String,
        answer: String,
    }

);

const questionModel = mongoose.model('questions', askQuestionSchema);

async function InsertQuestionsToDB(user, question, answer)
{
    let question1  = await questionModel.create({user:user,question: question, answer: answer});
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

async function InsertAnswersIntoDB(question,answer)
{
    let recieved_answer = await questionModel.findOneAndUpdate(
        {"question":question},
        {$set:{"answer":answer}},
        {new:true}
    );
    return recieved_answer;
}

export default{
    InsertQuestionsToDB,
    FetchAllQuestionsFromDB,
    FetchSpecificQuestionsFromDB,
    InsertAnswersIntoDB,
}