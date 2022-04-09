const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    Order_Status:{
        type:String,
        required:true,
        default:"Placed"
    },
    User:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    Service:[{
        Services:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Service',
            required:true,
        },
        iscompleted:{
            type:Boolean,
            default:false
        },
        isAssignedTo:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'serviceMan',
        }
    }],
    Offer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Offer',
    },
    Iscompleted:{
        type:Boolean,
        default:false
    },
    isPaid:{
        type:Boolean,
        default:false
    },
    RazorpayOrder_id:{type:String},
    total_amount:{type:Number},
    date:{type:Date, default:Date.now},
    Scheduled_date:{type:Date}
})

exports.Orders = mongoose.model('Orders',orderSchema);
