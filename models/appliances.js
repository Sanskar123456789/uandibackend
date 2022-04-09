const mongoose = require('mongoose');

const appliancesSchema = mongoose.Schema({
    Appliances : {
        type:String,
        required:true
    },
    Services : [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Service'
    }],
    Appliances_image : {
        type:String
    },
    Appliances_description : {
        type:String
    },
    Cloud_id : {
        type:String
    }
})

exports.Appliances = mongoose.model('Appliances',appliancesSchema);
