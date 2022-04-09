const express = require('express');
const router = express.Router();
const {Appliances} = require('../models/appliances');
const multer = require('multer');
const cloud = require('../cloudinary');
const {Service} = require('../models/service');

const FILE_TYPE_MAP={
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

const uploadOptions = multer({ 
    storage   : multer.diskStorage({}),
    fileFilter: (req, file,cb) =>{
        const isValid = FILE_TYPE_MAP[file.mimetype];
        if (isValid) {
            uploadError = null;}
        cb(uploadError, 'public/service');
    }
})



router.get('/allAppliances' , async (req, res) => {
    let appliances = await Appliances.find().populate('Services');
    if (!appliances) {
        res.status(404).send("No Appliances found");
    }else{
        res.status(200).send(appliances);
    }
})

router.get('/appliance/:id' , async (req, res) => {
    let appliance = await Appliances.findById(req.params.id);
    if (!appliance) {
        res.status(404).send("No appliance available");
    }else{
        res.status(200).send(appliance);
    }
})

router.post('/newAppliance',uploadOptions.single('image'), async (req, res)=>{
    
    if (!req.file) return res.status(400).send('No image in the request');
    
    const result = await cloud.v2.uploader.upload(req.file.path);

    let newAppliance = new Appliances({
        Appliances_image : result.secure_url,
        Cloud_id : result.public_id,
        Appliances : req.body.Appliances,
        Appliances_description : req.body.Appliances_description,
        Services : req.body.Services,

    })

    newAppliance = await newAppliance.save();

    if(!newAppliance){
        await cloud.v2.uploader.destroy(result.public_id);
        res.status(404).send("Unable to save Appliances please try again");
    }else{
        res.status(200).send(newAppliance);
    }
})

router.delete('/deleteAppliances/:id', async function(req, res) {
    const data = await Appliances.findById(req.params.id);
    Appliances.findByIdAndRemove(req.params.id).then(async Appliances =>{
        if(Appliances) {
            await cloud.v2.uploader.destroy(data.Cloud_id);
            return res.status(200).json({success: true, message: 'the Appliances is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "Appliances not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.put('/updateAppliances/:id', uploadOptions.single('image') ,async (req,res) => {
    const appliances = await Appliances.findById(req.params.id);
    if(!appliances){
        res.status(404).send("No Appliances found");
    }
    let file = req.file;
    let imagepath;
    let cloudurl;
    if(file){
        await cloud.v2.uploader.destroy(appliances.Cloud_id);
        let result = await cloud.v2.uploader.upload(file.path);
        imagepath = result.secure_url;
        cloudurl =  result.public_id;
    }else{
        imagepath = appliances.Appliances_image;
        cloudurl = appliances.Cloud_id;
    }
    let updateAppliances = await Appliances.findByIdAndUpdate(
            req.params.id,
            {
                Cloud_id:cloudurl,
                Appliances_image : imagepath,
                Appliances : req.body.Appliances,
                Appliances_description : req.body.Appliances_description,
                Services : req.body.Services,
            },
            {new: true}
        )
    if(!updateAppliances){
        res.status(400).json({message:"Can't update"})
    }

    res.send(updateAppliances);
})

router.put('/addService/:id',async (req, res)=> {
    // const service = await Service.findById(req.body.id);
    const appliances = await Appliances.findById(req.params.id);
    
    // if(!service) {
    //     console.log(service);
    //     res.send({Message: 'Service not found', Status:false});
    // }
    
    if(!appliances){
        res.send({Message: 'appliance not found', Status:false});
    }

    // let newservice = appliances.Services
    
    // if(newservice.length == 0){
    //     newservice[0] =req.body.id ;
    //     console.log(newservice , req.body.id);
    // }else{
    //     for(let i = 0; i <newservice.lenght ; i++){
    //         if(newservice[i] == req.body.id){
    //             res.send({message: 'appliance already exists', Status:false});
    //         }
    //     }
    //     newservice[newservice.length] = req.body.id;
    // }
    let updateAppliances = await Appliances.findByIdAndUpdate(
        req.params.id,
        {
            Services : req.body.ids,
        },
        {new: true}
    )
if(!updateAppliances){
    res.status(400).json({message:"Can't update"})
}

res.send(updateAppliances);
})

router.put('/deleteservice/:id',async (req, res)=>{
    const service = await Service.findById(req.body.id);
    const appliances = await Appliances.findById(req.params.id);

    if(!service) {
        res.send({Message: 'Service not found', Status:false});
    }
    
    if(!appliances){
        res.send({Message: 'appliance not found', Status:false});
    }

    let newservice = [];
    console.log(appliances);
    if(appliances.Services.length == 0) {
        res.send({Message: 'no service present '});
    }

    for(let i = 0; i < appliances.Services.length ; i++){
        if(appliances.Services[i] != req.body.id){
            newservice.push(appliances.Services[i]);
        }
        console.log(newservice);
    }

    let updateAppliances = await Appliances.findByIdAndUpdate(
        req.params.id,
        {
            Services : newservice,
        },
        {new: true}
    )
if(!updateAppliances){
    res.status(400).json({message:"Can't update"})
}

res.send(updateAppliances);
})
module.exports = router;