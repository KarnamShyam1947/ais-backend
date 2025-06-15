const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  service: {
    type: String,
  },
  reason: {
    type: String,
  }
}, {
  timestamps: true
});

const Contact = mongoose.model('Contact', ContactSchema);

module.exports = Contact;
