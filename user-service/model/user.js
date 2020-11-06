const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  email: String,
  password: String,
  name: String,
  emailVerified: Boolean,
  emailVerificationCode: String,
  provider: String,
  salt: String,
  createdAt: Date,
  fileId: String,
  isAdmin: Boolean,
  isActive: Boolean,
  azure: Object,
  lastLogin: Date,
  companyName: String,
  companySize: String,
  phoneNumber: String,
  reference: String,
  jobRole: String,
  oauth_code: String,
});

module.exports = mongoose.model('User', userSchema);
