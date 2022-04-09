const express = require('express');
const router = express.Router();
const {Categories} = require('../models/MainService');
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

router.get('/allCategories' , async (req, res) => {
    let categories = await Categories.find().populate('Services');
    if (!categories) {
        res.status(404).send("No Category found");
    }else{
        res.status(200).send(categories);
    }
})

router.get('/categories/:id' , async (req, res) => {
    let categories = await Categories.findById(req.params.id);
    if (!categories) {
        res.status(404).send("No category available");
    }else{
        res.status(200).send(categories);
    }
})

router.post('/newCategories',uploadOptions.single('image'), async (req, res)=>{
    
    if (!req.file) return res.status(400).send('No image in the request');
    
    const result = await cloud.v2.uploader.upload(req.file.path);

    let newCategories = new Categories({
        Service_image : result.secure_url,
        Cloud_id : result.public_id,
        CategoryOfService : req.body.Appliances,
        Service_description : req.body.Appliances_description,
        Services : req.body.Services,

    })

    newCategories = await newCategories.save();

    if(!newCategories){
        await cloud.v2.uploader.destroy(result.public_id);
        res.status(404).send("Unable to save Category please try again");
    }else{
        res.status(200).send(newCategories);
    }
})

router.delete('/deleteCategories/:id', async function(req, res) {
    const data = await Categories.findById(req.params.id);
    Categories.findByIdAndRemove(req.params.id).then(async Categories =>{
        if(Categories) {
            await cloud.v2.uploader.destroy(data.Cloud_id);
            return res.status(200).json({success: true, message: 'the Categories is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "Categories not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.put('/updateCategories/:id', uploadOptions.single('image') ,async (req,res) => {
    const categories = await Categories.findById(req.params.id);
    if(!categories){
        res.status(404).send("No categories found");
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
        imagepath = categories.Service_image;
        cloudurl = categories.Cloud_id;
    }
    let updatecategories = await Categories.findByIdAndUpdate(
            req.params.id,
            {
                Cloud_id:cloudurl,
                Service_image : imagepath,
                CategoryOfService : req.body.Appliances,
                Service_description : req.body.Appliances_description,
                Services : req.body.Services,
            },
            {new: true}
        )
    if(!updatecategories){
        res.status(400).json({message:"Can't update"})
    }

    res.send(updatecategories);
})

router.put('/addService/:id',async (req, res)=> {
    
    const appliances = await Categories.findById(req.params.id);
    
    if(!appliances){
        res.send({Message: 'Category not found', Status:false});
    }

    
    let updateAppliances = await Categories.findByIdAndUpdate(
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
    const appliances = await Categories.findById(req.params.id);

    if(!service) {
        res.send({Message: 'Service not found', Status:false});
    }
    
    if(!appliances){
        res.send({Message: 'Categories not found', Status:false});
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