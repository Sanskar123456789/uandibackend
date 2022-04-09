const {User} = require('../models/user');
const express = require('express');
const {Orders} = require('../models/Orders');
const router = express.Router();
const {Service} = require('../models/service')

router.get('', async (req,res)=> {
    const user =await User.find({},{_id:1,date:1});
    const order = await Orders.find({},{_id:1,date:1,total_amount:1});
    const services = await Service.find().count();
    res.send([user,order,services]);
})

module.exports = router