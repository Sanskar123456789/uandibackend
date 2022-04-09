"use strict";

var mongoose = require('mongoose');

var serviceSchema = mongoose.Schema({
  Service_name: {
    type: String,
    required: true
  },
  Service_rate: {
    type: Number,
    required: true
  },
  Is_Service_appliance: {
    type: Boolean,
    required: true,
    "default": true
  },
  Service_image: {
    type: String
  },
  Service_description: {
    type: String
  },
  Feedback: [{
    type: String
  }],
  Review: {
    type: Number,
    "default": 0
  },
  Cloud_id: {
    type: String
  }
});
exports.Service = mongoose.model('Service', serviceSchema);