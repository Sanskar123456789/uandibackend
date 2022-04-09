const express = require('express');
const router = express.Router();
const {Blog} = require('../models/blog');
const multer = require('multer');
const cloud = require('../cloudinary');

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

router.get('/allBlogs' , async (req, res) => {
    let blog = await Blog.find();
    if (!blog) {
        res.status(404).send("No Blog found");
    }else{
        res.status(200).send(blog);
    }
})
router.get('/blog/:id' , async (req, res) => {
    let blog = await Blog.findById(req.params.id);
    if (!blog) {
        res.status(404).send("No service available");
    }else{
        res.status(200).send(blog);
    }
})
router.post('/newBlog',uploadOptions.single('image'), async (req, res)=>{
    
    if (!req.file) return res.status(400).send('No image in the request');
    
    const result = await cloud.v2.uploader.upload(req.file.path);

    let newBlog = new Blog({
        Blog_image : result.secure_url,
        Blog_title : req.body.Blog_title,
        Blog_description : req.body.Blog_description,
        Cloud_id : result.public_id
    })

    newBlog = await newBlog.save();

    if(!newBlog){
        await cloud.v2.uploader.destroy(result.public_id);
        res.status(404).send("Unable to save Blog please try again");
    }else{
        res.status(200).send(newBlog);
    }
})

router.delete('/deleteBlog/:id', async function(req, res) {
    
    Blog.findByIdAndRemove(req.params.id).then(async Offer =>{
        if(Offer) {
            await cloud.v2.uploader.destroy(Offer.Cloud_id);
            return res.status(200).json({success: true, message: 'the blog is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "blog not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.put('/updateblog/:id', uploadOptions.single('image') ,async (req,res) => {
    const blog = await Blog.findById(req.params.id);
    if(!blog){
        res.status(404).send("No Blog found");
    }
    let file = req.file;
    let imagepath;
    let cloudurl;
    console.log(blog);
    if(file){
        console.log("Loading");
        await cloud.v2.uploader.destroy(blog.Cloud_id);
        console.log("previous image is deleted");
        const result = await cloud.v2.uploader.upload(file.path);
        console.log("new image is created");
        imagepath = result.secure_url;
        cloudurl =  result.public_id;
        console.log(imagepath, cloudurl, blog);
    }else{
        imagepath = blog.image;
        cloudurl = blog.Cloud_id;
    }
    let updateblog = await Blog.findByIdAndUpdate(
            req.params.id,
            {
                Blog_image : imagepath,
                Blog_title : req.body.Blog_title,
                Blog_description : req.body.Blog_description,
                Cloud_id: cloudurl
            },
            {new: true}
        )
    if(!updateblog){
        res.status(400).json({message:"Can't update"})
    }

    res.send(updateblog);
})

module.exports = router;