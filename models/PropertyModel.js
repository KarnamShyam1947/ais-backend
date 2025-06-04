const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  location: {
    city: {
      type: String,
      required: true
    },
    area: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    }
  },
  features: {
    type: [String],
    default: []
  },
  email: {
    type: String
  },
  imageUrls: {
    type: [String]  
  },
  description: {
    type: String
  },
  phone: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Property', propertySchema);

