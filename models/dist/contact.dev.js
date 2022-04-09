"use strict";

var mongoose = require('mongoose');

var contactSchema = mongoose.Schema({
  Phone_no: Number,
  Address: String,
  emailId: String,
  instaId: String,
  twitter: String,
  facebook: String,
  youtube: String
});
exports.Contact = mongoose.model('Contact', contactSchema);