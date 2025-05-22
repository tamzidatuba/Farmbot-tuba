import mongoose from 'mongoose';

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