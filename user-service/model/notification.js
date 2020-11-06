const mongoose = require('mongoose');

const { Schema } = mongoose;

const notificationSchema = new Schema({
  user: String,
  text: String,
  appId: String,
  notificationType: String,
  type: String,
  seen: Boolean,
  date: {
    type: Date,
    default: Date.now,
  },
  meta: {
    type: Schema.Types.Mixed,
    required: true,
  },

});

module.exports = mongoose.model('Notification', notificationSchema);
