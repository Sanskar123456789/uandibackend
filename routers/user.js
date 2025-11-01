const {User} = require('../models/user');
const {Otp} = require('../models/Otp');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const Vonage = require('@vonage/server-sdk')
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

router.post('/newUser',async(req, res)=>{

    let newUser = new User({
        Name : req.body.Name,
        Email : req.body.Email,
        Phone_no : req.body.Phone_no,
        Address: req.body.Address,
        Gender: req.body.Gender,
        password : bcrypt.hashSync(req.body.password,10)
    })

    newUser = await newUser.save();
    if(!newUser){
        res.status(400).send("Process Failed");
    }
    res.send(newUser)
})

router.post('/guser',async(req, res)=>{

    findUser = await User.find({Email: req.body.Email}).select('Email')
    if(findUser.length){
        res.send({success:true, message:"User Already exists!",Email: req.body.Email});
    }else{
        let newUser = new User({
            Name : req.body.Name,
            Email : req.body.Email,
            Phone_no : req.body.Phone_no,
            Address: req.body.Address,
            Gender: req.body.Gender,
            password : bcrypt.hashSync(req.body.password,10)
        })
    
        newUser = await newUser.save();
        if(!newUser){
            res.status(400).send("Process Failed");
        }
        
        res.send(newUser)
    }
})

// email otp APIs

// for admin
router.post('/otp', async(req, res)=>{
    var minm = 10000;
    var maxm = 99999;
    const Otps = Math.floor(Math.random() * (maxm - minm + 1)) + minm;
    sendMail(req.body.Email,"OTP",Otps.toString());
    
    // otp is going to save in database
    findOtp = await Otp.findOne({User: req.body.Email}).select('Otp');
    if(findOtp){
        let newOtp = await Otp.findByIdAndUpdate(
            findOtp._id,
            {
                Otp : Otps,
                TypeofOtp:"Mail"
            },
            {new:true}
        )
        if(!newOtp){
            res.send({msg:"Otp has not been created. pls try again",success:false});
        }else{
            res.send({msg:"Otp Has been created.",success:true});
        }
    }else{
        let newOtp = new Otp({
            User : req.body.Email,
            Otp : Otps,
            TypeofOtp:"Mail",
        })
        newOtp = await newOtp.save();
        if(!newOtp){
            res.status(400).send({msg:"Otp has not been created. pls try again",success:false});
        }else{
            res.send({msg:"Otp Has been created.",success:true});
        }
    }
    // saved in database    
    
})
//for User
router.post('/getOtp', async(req, res)=>{
    newUser = false;
    var minm = 10000;
    var maxm = 99999;
    const otps = Math.floor(Math.random() * (maxm - minm + 1)) + minm;
    sendMail(req.body.User,"OTP",otps.toString());
    // otp is send to user Email address
    findOtp = await Otp.find({User: req.body.User}).select('Otp'); // finding otp in otp db
    console.log(findOtp);
    if(findOtp.length > 0){
        let newOtp = await Otp.findByIdAndUpdate(
            findOtp[0]._id,
            {
                Otp : otps,
                TypeofOtp:"Mail"
            },
            {new:true}
        )
        if(!newOtp){
            res.send({msg:"Otp has not been created. pls try again",success:false});
        }else{
            res.send({msg:"Otp has been created",success:true});
        }
    }else{
        let newOtp = new Otp({
            User : req.body.User,
            Otp : otps,
            TypeofOtp:"Mail"
        })
        newOtp = await newOtp.save();
        if(!newOtp){
            res.status(400).send({msg:"Otp has not been created. pls try again",success:false});
        }else{
            res.send({msg:"Otp has been created",success:true});
        }
    }
})
// check Otp
router.post('/otpChecks', async(req, res)=>{
   
    findOtp = await Otp.find({User:req.body.User}).select('Otp')
    if(findOtp.length > 0){
        if(req.body.otp == findOtp[0].Otp){
            res.send({msg:"Verified.",success:true});
        }else{
            res.send({msg:"not Verified.",success:false});
        }
    }else{
        res.send({msg:"Otp has not been created.",success:false});
    }
})

// email otp APIs ends

router.post('/login', async(req, res)=>{
    let findUser =await User.findOne({ Email: req.body.Email});
    if(!findUser){
        res.send({success:false ,msg:"Wrong EmailId"});
    }else{
        let secret = process.env.secret;
        if(bcrypt.compareSync(req.body.password, findUser.password)){
            const token= jwt.sign(
                {
                    userId : findUser._id,
                    isAdmin : findUser.isAdmin
                },
                secret,
                {expiresIn : '1d'}
            )

            res.status(200).json({success:true , email : findUser.Email , token:token,UserData : findUser});
        }else{
        res.send({success:false ,msg:"Wrong Password"});}
    }
})

router.delete('/deleteUser/:id',async(req, res) => {
    User.findByIdAndRemove(req.params.id).then( user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.put('/updateUser/:id',async (req, res) =>{
    
    let update = await User.findByIdAndUpdate
    (
        req.params.id,
        {
        Name : req.body.Name,
        Phone_no : req.body.Phone_no,
        Address: req.body.Address,
        Gender: req.body.Gender,
    },
    {new : true}
    )
    if(!update){
        res.status(400).json({message:"Can't update"})
    }
    res.send(update);
})

router.get('/allUser', async (req,res)=> {
    let allUser = await User.find();
    if(!allUser){
        res.status(404).json({message:"No User Found"});
    }else{
        res.send(allUser);
    }
})

router.get('/singleUser/:id', async (req,res)=> {
    let findUser = await User.findById(req.params.id).select('-password').populate('User_Wishlist').populate('Cart').populate({path : "Orders" , populate :{path:'Service',populate:'Services'}});
    if(!findUser){
        res.status(404).json({message:"User not found"});
    }
    else{
        res.send(findUser);
    }
})

router.get('/count', async (req,res)=>{
    let count = await User.find({isAdmin:false}).count();
    if(!count){
        res.status(404).send({count:0});
    }else{
        res.send({"count": count});
    }
})

router.put('/addwishlist/:id', async (req, res)=>{
    let findUser = await User.findById(req.params.id);
    if(!findUser){
        res.status(404).send("No user found");
    }
    
    if(!findUser.User_Wishlist){
        findUser.User_Wishlist[0] = req.body.User_Wishlist;
    }else{
        if(findUser.User_Wishlist.indexOf(req.body.User_Wishlist[0])!=-1){
            
        }else{
            findUser.User_Wishlist = findUser.User_Wishlist.push(req.body.User_Wishlist);
        }
    }
    
    let update =await  User.findByIdAndUpdate(req.params.id,findUser,{new:true})

    if(!update){
        res.send({message:"Unable to add to wishlist",status:false})
    }

    res.send({data: update});
})

router.put('/removewishlist/:id', async(req, res) => {
    let findUser = await User.findById(req.params.id);
    if(!findUser){
        res.status(404).send("No user found");
    }
    
    
    if(!findUser.User_Wishlist){
        res.status(404).send("Wishlist is empty");
    }else{
        let newWishlist=[];
        let l = findUser.User_Wishlist.length;
        for(let i = 0; i < l; i++){
            if(findUser.User_Wishlist[i] != req.body.User_Wishlist){
                newWishlist.push(findUser.User_Wishlist[i])
            }
        }

        findUser.User_Wishlist = newWishlist;
        let update =await User.findByIdAndUpdate(req.params.id,findUser,{new:true}).populate('User_Wishlist')
        if(!update){
            res.send({message:"Unable to add to wishlist",status:false})
        }
        res.send({data: update});
    }
})

router.put('/addCart/:id', async (req, res)=>{
    let findUser = await User.findById(req.params.id);
    if(!findUser){
        res.status(404).send("No user found");
    }
    
    if(!findUser.Cart){
        findUser.Cart[0] = req.body.Cart;
    }else{
        if(findUser.Cart.indexOf(req.body.Cart[0])!=-1){
            
        }else{
            findUser.Cart = findUser.Cart.push(req.body.Cart);
        }
    }
    
    let update =await  User.findByIdAndUpdate(req.params.id,findUser,{new:true})

    if(!update){
        res.send({message:"Unable to add to cart",status:false})
    }

    res.send({data: update});
})

router.put('/removeCart/:id', async(req, res) => {
    let findUser = await User.findById(req.params.id);
    if(!findUser){
        res.status(404).send("No user found");
    }
    
    
    if(!findUser.Cart){
        res.status(404).send("Cart is empty");
    }else{
        let newCart=[];
        let l = findUser.Cart.length;
        for(let i = 0; i < l; i++){
            if(findUser.Cart[i] != req.body.Cart){
                newCart.push(findUser.Cart[i])
            }
        }

        findUser.Cart = newCart;
        let update =await User.findByIdAndUpdate(req.params.id,findUser,{new:true}).populate('Cart').select('-password')
        if(!update){
            res.send({message:"Unable to add to wishlist",status:false})
        }
        res.send({data: update});
    }
})

router.put('/updatePassword',async (req, res) =>{

    const userexist = await User.find({Email: req.body.Email});
    if(userexist.length==0){
        res.send({msg: 'You are not a user pls register',success:false})
        return
    }
    let newpassword
    if(req.body.password){
        newpassword = bcrypt.hashSync(req.body.password,10)
    }else{
        newpassword = userexist.password;
    }

    let update = await User.findByIdAndUpdate
    (
        userexist[0]._id,
        {
        password : newpassword,
    },
    {new : true}
    )
    if(!update){
        res.status(400).json({message:"Can't update"})
    }

    res.send({password:update,success:true});
})

router.post('/mobileOtp', async(req, res)=>{
                        // const vonage = new Vonage({
                        //     apiKey: process.env.MobileOTPAPIKEY,
                        //     apiSecret: process.env.MobileOTPAPISECRET
                        // })
                        // const from = "Vonage APIs"
                        // const to = req.body.Phone_no
    var minm = 10000;
    var maxm = 99999;
    const otps = Math.floor(Math.random() * (maxm - minm + 1)) + minm;
                        // const text = `Your Otp for verifying your number is ${otps}`;
    findOtp = await Otp.find({User: req.body.User}).select('Otp');
    if(findOtp.length > 0){
        let newOtp = await Otp.findByIdAndUpdate(
            findOtp[0]._id,
            {
                Otp : otps,
            },
            {new:true}
        )
        if(!newOtp){
            res.send({msg:"OTP has not been created. pls try again",success:false});
        }else{
            res.send({msg:"OTP has been sended to your Phone number pls check.",success:true});
        }
    }else{
        let newOtp = new Otp({
            User : req.body.User,
            Otp : otps,
        })
        newOtp = await newOtp.save();
        if(!newOtp){
            res.status(400).send({msg:"Otp has not been created. pls try again",success:false});
        }else{
            res.send({msg:"OPT has been sended to your Phone number pls check.",success:true});
        }
    }
})

router.post('/checkMobileOtp', async(req, res)=>{
    findOtp = await Otp.find({User: req.body.User}).select('Otp')
    if(findOtp.length > 0){
        
        if(req.body.otp == findOtp[0].Otp){
            res.send({msg:"Verified.",success:true});
        }else{
            res.send({msg:"not Verified.",success:false});
        }
    }else{
        res.send({msg:"Otp has not been created.",success:false});
    }
})

module.exports = router

