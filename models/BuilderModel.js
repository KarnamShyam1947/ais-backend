const mongoose = require('mongoose');

const builderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  description: {
    type: String
  },
  experience: {
    type: String
  },
  phone: {
    type: String,
    required: true
  },
  city: {
    type: String
  },
  area: {
    type: String
  },
  pincode: {
    type: String
  },
  imageUrl: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Builder', builderSchema);
