const {serviceMan} = require('../models/serviceMan');
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const {google} = require('googleapis');
// const Vonage = require('@vonage/server-sdk')
require('dotenv');

const Oauth2 = google.auth.OAuth2;
const Oauth2_client = new Oauth2(process.env.CLIENT_ID,process.env.CLIENT_SECRET);

Oauth2_client.setCredentials({refresh_token:process.env.REFRESH_TOKEN});

 function sendMail(recipients,subject,text){
    const acess_token =  Oauth2_client.getAccessToken()    
    
    // let auth =  {
    //     type:'OAUTH2',
    //     user:process.env.Sender,
    //     clientId:process.env.CLIENT_ID,
    //     clientSecret:process.env.CLIENT_SECRET,
    //     refreshToken:process.env.REFRESH_TOKEN, 
    //     accessToken:acess_token
    // }
    
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth: {
            type:'OAUTH2',
            user:process.env.Sender,
            clientId:process.env.CLIENT_ID,
            clientSecret:process.env.CLIENT_SECRET,
            refreshToken:process.env.REFRESH_TOKEN, 
            accessToken:acess_token
        }
    });

    const mail_options = {
        from :process.env.Sender,
        to:recipients,
        subject:subject,
        text:text
    }

    const res = transporter.sendMail(mail_options, function (err, res) {
        if (err) { console.log('Error', err); }
        else { console.log('Success'); }
        transporter.close();
    })
    return res;
}

router.post('/newServiceman',async(req, res)=>{

    let newServiceman = new serviceMan({
        Name : req.body.Name,
        Email : req.body.Email,
        Phone_no : req.body.Phone_no,
        Address: req.body.Address,
        Gender: req.body.Gender,
        Speciality:req.body.Speciality
    })

    newServiceman = await newServiceman.save();
    if(!newServiceman){
        res.status(400).send("Process Failed");
    }
    res.send(newServiceman)
})

router.delete('/deleteserviceMan/:id',async(req, res) => {
    serviceMan.findByIdAndRemove(req.params.id).then( user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'the service partner is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "Partner not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.put('/updateServiceMan/:id',async (req, res) =>{
    
    let update = await serviceMan.findByIdAndUpdate
    (
        req.params.id,
        {
        Name : req.body.Name,
        Email: req.body.Email,
        Phone_no : req.body.Phone_no,
        Address: req.body.Address,
        Gender: req.body.Gender,
        Speciality:req.body.Speciality
    },
    {new : true}
    )
    if(!update){
        res.status(400).json({message:"Can't update"})
    }
    res.send(update);
})

router.get('/allserviceMan', async (req,res)=> {
    let allUser = await serviceMan.find().populate('Assigned_order Speciality');
    if(!allUser){
        res.status(404).json({message:"No Partner Found"});
    }else{
        res.send(allUser);
    }
})

router.get('/singleserviceMan/:id', async (req,res)=> {
    let findUser = await serviceMan.findById(req.params.id).populate('Assigned_order Speciality').populate({path:'Assigned_order',populate:'User'});
    if(!findUser){
        res.status(404).json({message:"Partner not found"});
    }
    else{
        res.send(findUser);
    }
})

router.get('/RelateServiceMan/:id', async (req, res)=>{
    const ServiceMan = await serviceMan.find({Speciality:req.params.id})
    if(!serviceMan){
        res.status(404).json({message:"Serviceman not found" ,status:false});
    }else{
        res.status(200).json({message:"Serviceman found",status:true,data:ServiceMan});
    }
})


module.exports = router