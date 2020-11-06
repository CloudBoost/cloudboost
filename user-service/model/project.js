const mongoose = require('mongoose');

const { Schema } = mongoose;

const projectSchema = new Schema({
  name: String,
  appId: String,
  _userId: {
    type: Schema.ObjectId,
    ref: 'User',
  },
  keys: Object,
  invited: Array,
  developers: Array,
  planId: Number,
  provider: Object,
  providerProperties: Object,
  disabled: Boolean,
  lastActive: Date,
  deleted: Boolean,
  deleteReason: String,
  cancelPlanAtPeriodEnd: Boolean,
  disabledDate: Number,
}, {
  collection: 'projects',
  usePushEach: true, // option to solve "Unknown modifier: $pushAll" error in mongodb 3.6
});

module.exports = mongoose.model('Project', projectSchema);
