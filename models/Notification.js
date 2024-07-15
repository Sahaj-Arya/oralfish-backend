const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true, // Indexing improves query performance
  },
  message: String,
  link: String, // URL or identifier to redirect user on click
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true, // Helps in fetching recent notifications efficiently
  },
});

const Notification = mongoose.model(
  "Notification",
  notificationSchema,
  "notification"
);
