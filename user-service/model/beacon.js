const mongoose = require('mongoose');

const { Schema } = mongoose;

const beaconSchema = new Schema({
  _userId: String,
  firstApp: Boolean,
  firstTable: Boolean,
  firstColumn: Boolean,
  firstRow: Boolean,
  firstLogin: Boolean,
  tableDesignerLink: Boolean,
  documentationLink: Boolean,
  dashboardFeedback: Boolean,
});

module.exports = mongoose.model('Beacon', beaconSchema);
