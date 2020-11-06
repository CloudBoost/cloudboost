const mongoose = require('mongoose');

const { Schema } = mongoose;

const salesSchema = new Schema({
  firstName: String,
  lastName: String,
  salesEmail: String,
  jobTitle: String,
  company: String,
  companySize: String,
  phoneNo: String,
  selectCountry: String,
  interestedFor: String,
  requested: String,
  wantToSubscribe: Boolean,
});

module.exports = mongoose.model('Sales', salesSchema);
