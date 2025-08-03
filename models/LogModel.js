const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  service: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
