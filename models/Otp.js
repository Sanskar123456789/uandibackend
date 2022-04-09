const mongoose = require('mongoose');

const OtpSchema = mongoose.Schema({
    TypeofOtp:{
        type:String,
        required:true,
        default:"Mobile"
    },
    User:{
        type:String,
        required:true
    },
    Otp:{
        type:String,
        required:true,
    },
    date:{type:Date, default:Date.now}
})

exports.Otp = mongoose.model('Otp',OtpSchema);
