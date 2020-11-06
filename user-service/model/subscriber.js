const mongoose = require('mongoose');

const { Schema } = mongoose;

const subscriberSchema = new Schema({
  email: String,
});

module.exports = mongoose.model('Subscriber', subscriberSchema);
