const express = require('express');
const router = express.Router();
const {Offer} = require('../models/offer');

router.get('/allOffers' , async (req, res) => {
    let offer = await Offer.find();
    if (!offer) {
        res.status(404).send("No offer available");
    }else{
        res.status(200).send(offer);
    }
})

router.get('/oneOffer/:id' , async (req, res) => {
    let offer = await Offer.findById(req.params.id);
    if (!offer) {
        res.status(404).send("No offer available");
    }else{
        res.status(200).send(offer);
    }
})

router.post('/newOffers', async (req, res)=>{
    let newOffer = new Offer({
        Offer_title : req.body.Offer_title,
        Offer_Description : req.body.Offer_Description,
        Offer_percentage : req.body.Offer_percentage,
        Offer_onBasisOfTotalAmount:req.body.Offer_onBasisOfTotalAmount,
        Offer_code: req.body.Offer_code,
    })

    newOffer = await newOffer.save();

    if(!newOffer){
        res.status(404).send("Unable to save offer please try again");
    }else{
        res.status(200).send(newOffer);
    }
})

router.delete('/deleteOffer/:id', async function(req, res) {
    Offer.findByIdAndRemove(req.params.id).then( Offer =>{
        if(Offer) {
            return res.status(200).json({success: true, message: 'the offer is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "offer not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.put('/updateoffer/:id', async (req,res) => {
    console.log(req.body);
    let updateoffer = await Offer.findByIdAndUpdate(
            req.params.id,
            {
                Offer_title : req.body.Offer_title,
                Offer_Description : req.body.Offer_Description,
                Offer_percentage : req.body.Offer_percentage,
                Offer_onBasisOfTotalAmount: req.body.Offer_onBasisOfTotalAmount,
                Offer_code: req.body.Offer_code
            },
            {new: true}
        )
    if(!updateoffer){
        res.status(400).json({message:"Can't update"})
    }

    res.send(updateoffer);
})

module.exports = router;