"use strict";

var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  Name: {
    type: String,
    required: true
  },
  Email: {
    type: String,
    required: true
  },
  Phone_no: {
    type: Number
  },
  Address: {
    type: String
  },
  Gender: {
    type: String,
    required: true
  },
  Assigned_order: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Orders'
  }],
  Speciality: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  date: {
    type: Date,
    "default": Date.now
  }
});
exports.serviceMan = mongoose.model('serviceMan', userSchema);