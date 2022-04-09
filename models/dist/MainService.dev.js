"use strict";

var mongoose = require('mongoose');

var CategoryOfServiceSchema = mongoose.Schema({
  CategoryOfService: {
    type: String,
    required: true
  },
  Services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  Service_image: {
    type: String
  },
  Service_description: {
    type: String
  },
  Cloud_id: {
    type: String
  }
});
exports.Categories = mongoose.model('Category', CategoryOfServiceSchema);