const mongoose = require('mongoose');

const emailSchema = mongoose.Schema({
    emailId : String,
})

exports.Email = mongoose.model('Email',emailSchema);