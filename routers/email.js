const express = require('express');
const router = express.Router();
const {Email} = require('../models/emails');


router.post('/newEmail', async (req, res)=>{
    let newContact = new Email({
        emailId : req.body.id
    })
    newContact = await newContact.save();
    if(!newContact){
        res.status(404).send("Unable to save email please try again");
    }else{
        res.status(200).send(newContact);
    }
})

router.delete('/deleteEmail', async function(req, res) {
    const email = await Email.find({emailId:req.body.emailId})
    Email.findByIdAndRemove(email[0]._id).then( Contact =>{
        if(Contact) {
            return res.status(200).json({success: true, message: 'the Email is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "Email not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})



module.exports = router;