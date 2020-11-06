
const mongoose = require('mongoose');

const { Schema } = mongoose;

const _settingsSchema = new Schema({
  allowSignUp: Boolean,
  myURL: String,
  clusterKey: String,
  secureKey: String,
}, {
  collection: '_Settings',
});

module.exports = mongoose.model('_Settings', _settingsSchema);
