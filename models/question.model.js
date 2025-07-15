import mongoose from 'mongoose';
import express from 'express';

// connect to the DB
const connectionString = 'mongodb://localhost:27017/admin';
const app = express();
app.use(express.json());

// test connection to local database
mongoose.connect(connectionString)
    .then(() => console.log('MongoDB connected to Questions Database.'))
    .catch((err) => console.error('MongoDB connection error: to the Questions Database.', err));


//define the schema or the structure of each document/ entry in Mongo DB
export const askQuestionSchema = new mongoose.Schema(
    {
        user: String,
        question: String,
        answer: String,
    }

);
// create model to interact with the Schema
const questionModel = mongoose.model('questions', askQuestionSchema);


// function to insert questions into the DB.
async function InsertQuestionsToDB(user, question, answer) {
    let question1 = await questionModel.create({ user: user, question: question, answer: answer });
    return question1;
}

//function to retreive a specific question in the DB
async function FetchSpecificQuestionsFromDB(question) {
    let questions = await questionModel.findOne({ "question": question });
    return questions;
}

//function to retrieve all the questions from the DB.
async function FetchAllQuestionsFromDB() {
    let questions = await questionModel.find();
    return questions;
}

//function to insert answer to a specific question in the DB.
async function InsertAnswersIntoDB(question, answer) {
    let recieved_answer = await questionModel.findOneAndUpdate(
        { "question": question },
        { $set: { "answer": answer } },
        { new: true }
    );
    return recieved_answer;
}

//function to update the details (the name of the user, question and answer) in the database.
async function UpdateDetailsinDB(user,question,answer)
{
    let change_details = await questionModel.findOneAndUpdate(
        {"question":question},
        {
            $set:
            {
                "user": user,
                "question": question,
                "answer":answer
            }
        },
        {new :true}
    )
}

//function to delete question in the Database.
async function DeleteQuestionfromDB(question)
{
    await questionModel.findOneAndDelete({"question": question});
}


//export all function for further usage
export default {
    InsertQuestionsToDB,
    FetchAllQuestionsFromDB,
    FetchSpecificQuestionsFromDB,
    InsertAnswersIntoDB,
    UpdateDetailsinDB,
    DeleteQuestionfromDB,

}