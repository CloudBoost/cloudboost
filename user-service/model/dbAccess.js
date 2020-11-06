const mongoose = require('mongoose');

const { Schema } = mongoose;

const dbAccessSchema = new Schema({
  appId: String,
  _userId: String,
  password: String,
  username: String,
});

module.exports = mongoose.model('dbAccess', dbAccessSchema);
