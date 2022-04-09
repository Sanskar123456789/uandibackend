const express = require('express');
const router = express.Router();
const {Contact} = require('../models/contact');

router.get('/allContact' , async (req, res) => {
    let contact = await Contact.find();
    if (!contact) {
        res.status(404).send("No Contact available");
    }else{
        res.status(200).send(contact);
    }
})

router.get('/OneContact/:id' , async (req, res) => {
    let contact = await Contact.findById(req.params.id);
    if (!contact) {
        res.status(404).send("No Contact available");
    }else{
        res.status(200).send(contact);
    }
})

router.post('/newContact', async (req, res)=>{
    console.log(req.body);
    let newContact = new Contact({
        Phone_no: req.body.Phone_no,
        emailId : req.body.emailId,
        instaId : req.body.instaId,
        twitter : req.body.twitter,
        facebook : req.body.facebook,
        youtube : req.body.youtube,
    })

    newContact = await newContact.save();

    if(!newContact){
        res.status(404).send("Unable to save contact please try again");
    }else{
        res.status(200).send(newContact);
    }
})

router.delete('/deleteContact/:id', async function(req, res) {
    Contact.findByIdAndRemove(req.params.id).then( Contact =>{
        if(Contact) {
            return res.status(200).json({success: true, message: 'the Contact is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "Contact not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.put('/updateContact/:id', async (req,res) => {
    let updateContact = await Contact.findByIdAndUpdate(
            req.params.id,
            {
                Phone_no: req.body.Phone_no,
                emailId : req.body.emailId,
                instaId : req.body.instaId,
                twitter : req.body.twitter,
                facebook : req.body.facebook,
                youtube : req.body.youtube,
            },
            {new: true}
        )
    if(!updateContact){
        res.status(400).json({message:"Can't update"})
    }
    res.send(updateContact);
})

module.exports = router;