"use strict";

var mongoose = require('mongoose');

var emailSchema = mongoose.Schema({
  emailId: String
});
exports.Email = mongoose.model('Email', emailSchema);