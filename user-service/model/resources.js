
const mongoose = require('mongoose');

const { Schema } = mongoose;

const resourcesSchema = new Schema({
  slug: String,
  title: String,
  content: String,
  fileURL: String,
  type: String,
  order: Number,
  imageUrl: String,
  showOnEnterprisePage: Boolean,
});

module.exports = mongoose.model('Resources', resourcesSchema);
