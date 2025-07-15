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
        id: Number,
        user: String,
        question: String,
        answer: String,
    }

);
// create model to interact with the Schema
const questionModel = mongoose.model('questions', askQuestionSchema);


// function to insert questions into the DB.
async function InsertQuestionsToDB(id, user, question, answer) {
    let question1 = await questionModel.create({id:id, user: user, question: question, answer: answer });
    return question1;
}

//function to retreive a specific question in the DB
async function FetchSpecificQuestionsFromDB(id) {
    let questions = await questionModel.findOne({ "id": id });
    return questions;
}

//function to retrieve all the questions from the DB.
async function FetchAllQuestionsFromDB() {
    let questions = await questionModel.find();
    return questions;
}

//function to insert answer to a specific question in the DB.
/*async function InsertAnswersIntoDB(question_id, answer) {
    let recieved_answer = await questionModel.findOneAndUpdate(
        { "question_id": question_id },
        { $set: { "answer": answer } },
        { new: true }
    );
    return recieved_answer;
}*/

//function to update the details (the name of the user, question and answer) in the database.
async function UpdateDetailsinDB(id,user,question,answer)
{
    console.log(await FetchSpecificQuestionsFromDB(id));
    console.log("ID :" + id);
    let change_details = await questionModel.findOneAndUpdate(
        {"id":id},
        {
            $set:
            {
                "user": user,
                "question": question,
                "answer":answer
            }
        },
        {"new" :true}
    )
}

//function to delete question in the Database.
async function DeleteQuestionfromDB(id)
{
    console.log("Delete in question model");
    await questionModel.findOneAndDelete({"id": id});
}


//export all function for further usage
export default {
    InsertQuestionsToDB,
    FetchAllQuestionsFromDB,
    FetchSpecificQuestionsFromDB,
    //InsertAnswersIntoDB,
    UpdateDetailsinDB,
    DeleteQuestionfromDB,
}

/*
checking insert operation
const id1 = "question1";
const user1 = "Alagu";
const question1= "何歳？";
const answer1 = "22.";

await InsertQuestionsToDB(id1,user1,question1,answer1);
*/


