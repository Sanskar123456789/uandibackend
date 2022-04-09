const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
    Offer_title : {
        type: String,
        required: true,
    },
    Offer_Description:{
        type:String,
    },
    Offer_percentage : {
        type:Number,
        required: true
    },
    Offer_onBasisOfTotalAmount : {
        type:Number,
        required: true
    },
    Offer_code : {
        type:String,
    }
})

exports.Offer = mongoose.model('Offer', offerSchema);