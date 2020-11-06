const mongoose = require('mongoose');

const { Schema } = mongoose;

const cardSchema = new Schema({
  _userId: String,
  cards: Array,
});

module.exports = mongoose.model('Card', cardSchema);
