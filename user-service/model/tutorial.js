const mongoose = require('mongoose');

const { Schema } = mongoose;

const tutorialSchema = new Schema({
  name: String,
  description: String,
  tutorials: Array,

});

module.exports = mongoose.model('Tutorial', tutorialSchema);
