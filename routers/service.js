const express = require('express');
const router = express.Router();
const cloud = require('../cloudinary');
const {Service} = require('../models/service');
const multer = require('multer');

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

router.get('/allService' , async (req, res) => {
    let service = await Service.find();
    if (!service) {
        res.status(404).send("No service available");
    }else{
        res.status(200).send(service);
    }
})

router.get('/Service/:id' , async (req, res) => {
    let service = await Service.findById(req.params.id);
    if (!service) {
        res.status(404).send("No service available");
    }else{
        res.status(200).send(service);
    }
})

router.post('/newservice',uploadOptions.single('image') ,async (req, res)=>{    
    console.log(req.body,req.file);
    if (!req.file) return res.status(400).send('No image in the request');
    
    const result = await cloud.v2.uploader.upload(req.file.path);
    
    let newservice = new Service({
        Service_name : req.body.Service_name,
        Service_rate : req.body.Service_rate,
        Is_Service_appliance : req.body.Is_Service_appliance,
        Service_description: req.body.Service_description,
        Service_image : result.secure_url,
        Cloud_id : result.public_id,
    })
    
    newservice = await newservice.save();
    
    if(!newservice){
        await cloud.v2.uploader.destroy(result.public_id);
        res.status(404).send("Unable to save service please try again");
    }else{
        res.status(200).send(newservice);
    }
})

router.delete('/deleteservice/:id', async function(req, res) {
    const service1 = await Service.findById(req.params.id);
    Service.findByIdAndRemove(req.params.id).then(async service =>{
        if(!service) {
            return res.status(404).json({success: false , message: "service not found!"})
        }
        else{
            await cloud.v2.uploader.destroy(service1.Cloud_id);
            return res.status(200).json({success: true, message: 'the service is deleted!'})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.put('/updateservice/:id',uploadOptions.single('image') ,async (req,res) => {

    const service = await Service.findById(req.params.id);
    if(!service){
        res.status(404).send("No Service found");
    }
    let file = req.file;
    let imagepath;
    let cloudurl;
    if(file){
        await cloud.v2.uploader.destroy(service.Cloud_id);
        let result = await cloud.v2.uploader.upload(file.path);
        imagepath = result.secure_url;
        cloudurl =  result.public_id;
    }else{
        imagepath = service.Service_image;
        cloudurl = service.Cloud_id;
    }

    let updateservice = await Service.findByIdAndUpdate(
            req.params.id,
            {
                Service_name : req.body.Service_name,
                Service_rate : req.body.Service_rate,
                Is_Service_appliance : req.body.Is_Service_appliance,
                Service_image : imagepath,
                Service_description: req.body.Service_description,
                Cloud_id : cloudurl
            },
            {new: true}
        )
    if(!updateservice){
        res.status(400).json({message:"Can't update"})
    }
    res.send(updateservice);
})

router.put('/newFeedBack/:id',async (req, res)=>{
   
    const findService = await Service.findById(req.params.id);
    if(!findService){
        res.status(404).send({success:false, message:'No Service found'})
        console.log("Not Found", req.body);
        return;
    }
    var review=0;
    let feed=[];
    console.log(review,findService.Review);
    if(findService.Review==0)
    review = req.body.Review
    else
    {
        review = (findService.Review+parseInt(req.body.Review))/2;
    }
    if(findService.Feedback){
        feed = findService.Feedback;
        feed.push(req.body.Feedback);
    }
    else
    feed.push(req.body.Feedback);
   
    const UpService = await Service.findByIdAndUpdate(req.params.id,
        {
            Feedback:feed,
            Review:review
        },{new: true}
    );

    if(!UpService) {
        res.send({message:"Unable to add your feed back",success:false});
    }else{
        res.send({message:"your feed has been Added",success:true});
    }

})

module.exports = router;