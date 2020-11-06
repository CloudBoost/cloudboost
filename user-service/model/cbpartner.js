
const mongoose = require('mongoose');

const { Schema } = mongoose;


const cbpartnerSchema = new Schema({
  companyName: String,
  companyDescription: String,
  personName: String,
  companyEmail: String,
  companyContact: String,
  personMobile: String,
  companyAddress: String,
  companyWebsite: String,
  companyCountry: String,
  appSpecilizedIn: String,
  companySize: String,
  createdAt: Date,
});

module.exports = mongoose.model('Cbpartner', cbpartnerSchema);
