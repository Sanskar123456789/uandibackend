const express = require('express');
const router = express.Router();
const {Banner} = require('../models/Banner');
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

router.get('/allBanners' , async (req, res) => {
    let banner = await Banner.find().populate('Services');
    if (!banner) {
        res.status(404).send("No Banner found");
    }else{
        res.status(200).send(banner);
    }
})

router.get('/Banner/:id' , async (req, res) => {
    let banner = await Banner.findById(req.params.id);
    if (!banner) {
        res.status(404).send("No banner available");
    }else{
        res.status(200).send(banner);
    }
})

router.post('/newBanner',uploadOptions.single('Banner_image'), async (req, res)=>{
    
    if (!req.file) return res.status(400).send('No image in the request');
    
    const result = await cloud.v2.uploader.upload(req.file.path);

    let newBanner = new Banner({
        Banner_image : result.secure_url,
        Banner_title : req.body.Banner_title,
        Services : req.body.Services,
        Cloud_id : result.public_id,
    })

    newBanner = await newBanner.save();

    if(!newBanner){
        await cloud.v2.uploader.destroy(result.public_id);
        res.status(404).send("Unable to save Banner please try again");
    }else{
        res.status(200).send(newBanner);
    }
})

router.delete('/deleteBanner/:id', async function(req, res) {
    const data = await Banner.findById(req.params.id);
    Banner.findByIdAndRemove(req.params.id).then(async Categories =>{
        if(Categories) {
            await cloud.v2.uploader.destroy(data.Cloud_id);
            return res.status(200).json({success: true, message: 'the Banner is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "Banner not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.put('/updateBanner/:id', uploadOptions.single('Banner_image') ,async (req,res) => {
    const banner = await Banner.findById(req.params.id);
    if(!banner){
        res.status(404).send("No banner found");
    }
    let file = req.file;
    let imagepath;
    let cloudurl;
    if(file){
        await cloud.v2.uploader.destroy(categories.Cloud_id);
        let result = await cloud.v2.uploader.upload(file.path);
        imagepath = result.secure_url;
        cloudurl =  result.public_id;
    }else{
        imagepath = banner.Service_image;
        cloudurl = banner.Cloud_id;
    }
    let updatebanner = await Banner.findByIdAndUpdate(
            req.params.id,
            {
                Cloud_id:cloudurl,
                Banner_image : imagepath,
                Banner_title : req.body.Banner_title,
                Services : req.body.Services,
            },
            {new: true}
        )
    if(!updatebanner){
        res.status(400).json({message:"Can't update"})
    }

    res.send(updatebanner);
})

router.put('/addService/:id',async (req, res)=> {
    
    const appliances = await Banner.findById(req.params.id);
    
    if(!appliances){
        res.send({Message: 'Banner not found', Status:false});
    }

    
    let updateBanner = await Banner.findByIdAndUpdate(
        req.params.id,
        {
            Services : req.body.ids,
        },
        {new: true}
    )
if(!updateBanner){
    res.status(400).json({message:"Can't update"})
}

res.send(updateBanner);
})

router.put('/deleteservice/:id',async (req, res)=>{
    const service = await Service.findById(req.body.id);
    const banner = await Banner.findById(req.params.id);

    if(!service) {
        res.send({Message: 'Service not found', Status:false});
    }
    
    if(!banner){
        res.send({Message: 'Categories not found', Status:false});
    }

    let newservice = [];
    if(banner.Services.length == 0) {
        res.send({Message: 'no service present '});
    }

    for(let i = 0; i < appliances.Services.length ; i++){
        if(banner.Services[i] != req.body.id){
            newservice.push(appliances.Services[i]);
        }
    }

    let updateBanner = await Banner.findByIdAndUpdate(
        req.params.id,
        {
            Services : newservice,
        },
        {new: true}
    )
if(!updateBanner){
    res.status(400).json({message:"Can't update"})
}

res.send(updateBanner);
})

module.exports = router;