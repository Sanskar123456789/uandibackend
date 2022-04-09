const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    Name : {
        type : String,
        required : true
    },
    Email : {
        type: String,
        required : true,
    },
    Phone_no : {
        type : Number,
    },
    Address : {
        type:String,
    },
    Gender : {
        type:String,
        required : true,
    },
    isAdmin : {
        type : Boolean,
        default : false
    },
    User_Wishlist : [{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Service',
    }],
    Cart : [{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Service',
    }],
    Orders : [{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Orders',
        Status : String
    }],
    password : {
        type:String,
        required : true
    },
    date:{type:Date, default:Date.now},
    Loyality_points: {
        type:Number,
        default:0,
    }
})

exports.User = mongoose.model('User',userSchema);