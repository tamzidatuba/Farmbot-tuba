import mongoose from 'mongoose';

const connectionString = 'mongodb://localhost:27017/admin';
const app = express();
app.use(express.json());

// test connection to local database
mongoose.connect(connectionString)
.then(() => console.log('MongoDB connected to the Notifications Database.'))
.catch((err) => console.error('MongoDB connection error: to the Notifications Database.', err));

const notificationSchema = new mongoose.Schema({
  notificationtext: String,
});

const notificationModel = mongoose.model('notification', notificationSchema);

async function InsertNotificationToDB(text) {
  await notificationModel.create({ notificationtext: text });
}

async function FetchNotificationsFromDB() {
  const notifications = await notificationModel.find();
  return notifications;
}

export default {
  InsertNotificationToDB,
  FetchNotificationsFromDB,
};