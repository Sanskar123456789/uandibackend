const express = require('express');
const router = express.Router();
const {Orders} = require('../models/Orders');
const {User} = require('../models/user')
const {serviceMan} = require('../models/serviceMan')
const {Offer} = require('../models/offer');
const {Service} = require('../models/service');
const multer = require('multer');
const Razorpay =  require('razorpay'); 
const fs = require('fs');
const nodemailer = require('nodemailer');
const {google} = require('googleapis');
var easyinvoice = require('easyinvoice');
const Oauth2 = google.auth.OAuth2;
const Oauth2_client = new Oauth2(process.env.CLIENT_ID,process.env.CLIENT_SECRET);
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const d = new Date();

Oauth2_client.setCredentials({refresh_token:process.env.REFRESH_TOKEN});

function sendMail(recipients,subject,text,invoice){
    const acess_token =  Oauth2_client.getAccessToken()    
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
    let mail_options
    if(invoice){
        mail_options = {
            from :process.env.Sender,
            to:recipients,
            subject:subject,
            html:text,
            attachments: [{
                filename: "Receipt.pdf",
                contentType: 'application/pdf', // <- You also can specify type of the document
                content: invoice,
                encoding: 'base64'
            }]
        }
    }else{
        mail_options = {
            from :process.env.Sender,
            to:recipients,
            subject:subject,
            html:text,
        }
    }

    const res = transporter.sendMail(mail_options, function (err, res) {
        if (err) { console.log('Error', err); }
        transporter.close();
    })
    return res;
}

const uploadOptions = multer({ 
    storage   : multer.diskStorage({}),
    fileFilter: (req, file,cb) =>{
    }
})

const instance = new Razorpay({
    key_id: process.env.PaymentGatewayId,
    key_secret: process.env.PaymentGatewaySecret,
});

// for Admin Panel to get all Orders
router.get('/allOrders' , async (req, res) => {
    let orders = await Orders.find().populate("User Offer").populate({path:'Service',populate:'Services'});
    if (!orders) {
        res.status(404).send("No offer available");
    }else{
        res.status(200).send(orders);
    }
})

router.get('/OrderDetail/:id' , async (req, res) => {
    let orders = await Orders.findById(req.params.id).populate("User Offer").populate({path:'Service',populate:'Services isAssignedTo'});
    if (!orders) {
        res.status(404).send("No offer available");
    }else{
        res.status(200).send(orders);
    }
})
// params = user _id
router.post('/newOrder/:id', async (req, res)=>{
    const user = await User.findById(req.params.id).select('-password');
    let offer_applied = '';
    // finding user by id
    if(!user){
        res.status(404).send({message: 'No user found' ,status: false});
        return;
    }
    
    // saving order
    let servicesid = [];
    for(let i=0; i<req.body.Service.length; i++){
        servicesid.push({Services:req.body.Service[i]})
    }
    let newOrder = new Orders({
        User : req.params.id,
        Service : servicesid,
        Scheduled_date:req.body.Scheduled_date
    })
    newOrder = await newOrder.save();
    console.log(newOrder)
    // calculating total
    let dis=0;
    let max;

    if(req.body.Offer_code){
        const offer = await Offer.find({'Offer_code':req.body.Offer_code});
        if(offer[0]){
            offer_applied = offer[0]._id
            dis = offer[0].Offer_percentage;
            max = offer[0].Offer_onBasisOfTotalAmount;
        }else{
            res.status(404).send({message:"offer not found",success:false});
            return;
        }
    }


    const orders = await Orders.findById(newOrder._id).populate({path:'Service',populate:'Services'});
    let ServiceList = orders.Service;
    let total = 0;

    for(let i = 0; i < ServiceList.length; i++){
        total = total + ServiceList[i].Services.Service_rate;
    }

    if(max){
        if(total >= max*100){
            dis = dis/100;
            total = total - (total * dis);
            console.log("Offer dis", total);
        }
    }
    
    let coinUsed = false;
    if(req.body.coins){
        coinUsed = true;
        total -= (user.Loyality_points*100);
        console.log("coin dis", total);
    }
    console.log("current amount",total)

    // order is generated
    if(offer_applied == ''){
        const updateOrder =  await Orders.findByIdAndUpdate(newOrder._id,
            {
                total_amount:total,
            },
            {new: true});    
        if(!updateOrder){
            res.status(404).send("Unable to place order please try again");
        }
    }else{
        const updateOrder =  await Orders.findByIdAndUpdate(newOrder._id,
            {
                total_amount:total,
                Offer:offer_applied
            },
            {new: true});    
        if(!updateOrder){
            res.status(404).send("Unable to place order please try again");
        }
    }

    // saving order to user table
    let userOrderList=[];
    if(user.Orders.length==0){
        userOrderList[0] = newOrder._id;
    }else{
        userOrderList=user.Orders;
        userOrderList[user.Orders.length] = newOrder._id;
    }

    let Loyality_points
    if(coinUsed){
        Loyality_points = 0;
    }else{
        Loyality_points= Math.floor(total/10000+user.Loyality_points);
    }
    // User data update
    let update =await User.findByIdAndUpdate(req.params.id,{Loyality_points:Loyality_points,Orders : userOrderList},{new:true}).select('-password')

    if(!update){
        res.send({message:"Unable to add to User Order list",status:false})
    }else{
        const products = [];
        htmlString = '';
        for(var i=0; i<orders.Service.length; i++)
        {
            if(dis>0){
                products.push({
                    "description": orders.Service[i].Services.Service_name,
                    "price": orders.Service[i].Services.Service_rate/100*(1-dis),
                    "tax-rate": 0,
                    "quantity": 1,
                })

            htmlString +=`<li>${orders.Service[i].Services.Service_name} <br> price = ${ orders.Service[i].Services.Service_rate}</li>`
            }
            else{
                products.push({
                    "description": orders.Service[i].Services.Service_name,
                    "price": orders.Service[i].Services.Service_rate/100,
                    "tax-rate": 0,
                    "quantity": 1,
                })

            htmlString +=`<li>${orders.Service[i].Services.Service_name} <br> price = ${ orders.Service[i].Services.Service_rate}</li>`
            }
            console.log(products)
            console.log(dis)
        }
        const date = new Date();
        const ordersno = await Orders.collection.countDocuments()
        const Invoicedata = {
            "images": {
                // The logo on top of your invoice
                "logo": "https://res.cloudinary.com/dsv4yzr1h/image/upload/v1653809826/logo_q0wqg0.png",
            },
            "sender": {
                "company": "UandI",
                "address": "Near Post Office, Vikas Nagar, Lucknow",  // ask
                "zip": "226022", 
                "city": "Lucknow",
                "country": "India"
                //"custom1": "custom value 1",
            },
    
            // Your recipient
            "client": {
                "company": update.Name,
                "Email": update.Email,
                // "zip": "4567 CD",
                // "city": "Clientcity",
                // "country": "Clientcountry"
                // "custom1": "custom value 1",
            },
            
            "information": {
                // Invoice number
                "number": ordersno, 
                "date": `${date.getDate()}/${monthNames[d.getMonth()]}/${date.getFullYear()}`,
                "due-date": "N/A"
            },
            "products": products,
            "bottom-notice": "Payment is to be collected",
            "settings": {
                "currency": "INR", 
            },    
        };
        easyinvoice.createInvoice(Invoicedata, function (result) {
            AdmintextmsgHTML = `
            <h1>New Order Has been added<h1>
            <p>the User Details are <p>
            <ul>
                <li> Name : ${update.Name}</li>
                <li> Email: ${update.Email}</li>
                <li> Phone Number : ${update.Phone_no}</li>
            </ul>

            <h2>Ordered Services</h2>
            ${htmlString}
            total amount = ${(total).toString()}
            <br>
            Mode of Payment : Offline.
            <br>
            Scheduled on ${newOrder.Scheduled_date}
            `
            ClienttextmsgHTML = `
            <h1>Thankyou for shopping with us here is your recipt</h1>
            `
            sendMail(process.env.AdminId,"New Order",AdmintextmsgHTML,result.pdf)
            sendMail(update.Email,"New Order",ClienttextmsgHTML,result.pdf)
            
        }).catch(err=>{
            res.send({message:"Order is successful there is problem coming in sending you invoice plese contact us for invoice",status:true})
        });
        res.send({message:"Order is successful",status:true})
    }
})

router.post('/onlinePayment/:id', async (req, res)=>{
    const user = await User.findById(req.params.id).select('Name Phone_no Email Orders Loyality_points');
    if(user) {
        
        let dis=0;
        let max;
        const offer = await Offer.find({'Offer_code':req.body.Offer_code});
        if(offer[0]){
            dis = offer[0].Offer_percentage;
            max = offer[0].Offer_onBasisOfTotalAmount;
        }
        var total = 0;
        for(let i = 0; i < req.body.Service.length ; i++) {
            const orders = await Service.findById(req.body.Service[i]._id);
            total = total+orders.Service_rate;
        }        
        if(total >= max*100){
            dis = dis/100;
            total = total - (total * dis);
        }

        let coinUsed = false;
        if(req.body.coins){
            coinUsed = true;
            total -= (user.Loyality_points*100);
            console.log(total,user);
        }
        const ordersno = await Orders.collection.countDocuments()
        total =Math.floor(total);
        instance.orders.create({
            amount: total,
            currency: "INR",
            receipt: `receipt#${ordersno}`,
        },async function(err,order){
            if(err) console.log(err)
            else{
                // saving order
                let servicesid = [];
                for(let i=0; i<req.body.Service.length; i++){
                servicesid.push({Services:req.body.Service[i]})
                }
                let newOrder = new Orders({
                    User : req.params.id,
                    Service : servicesid,
                    RazorpayOrder_id:order.id,
                    total_amount:total,
                    Scheduled_date:req.body.Scheduled_date
                })
                newOrder = await newOrder.save();

                let userOrderList=[];
                if(user.Orders.length==0){
                    userOrderList[0] = newOrder._id;
                }else{
                    userOrderList=user.Orders;
                    userOrderList[user.Orders.length] = newOrder._id;
                }
                let Loyality_points
                if(coinUsed){
                    Loyality_points = 0;
                }else{
                    Loyality_points= Math.floor(total/10000+user.Loyality_points);
                }
                let update =await User.findByIdAndUpdate(req.params.id,{Orders : userOrderList,Loyality_points:Loyality_points},{new:true}).select('-password')

                if(!update){
                    res.send({message:"Unable to add to User Order list",status:false})
                }else{
                    res.status(200).send({"User":update,"Order":order});
                }
            }
        })
    }
})

// params = Order _id
router.put('/updateOrder/:id', async (req,res) => {
    const Order = await Orders.findById(req.params.id);
    if(!Order){
        res.status(404).send({message: 'No Order found' ,status: false});
    }
    let updateOrder = await Orders.findByIdAndUpdate(
            req.params.id,
            {
                Order_Status: req.body.Order_Status,
                Iscompleted : req.body.Iscompleted,
                isPaid: req.body.isPaid
            },
            {new: true}
            ).populate("User")
            if(!updateOrder){
        res.status(400).json({message:"Can't update"})
    }
    if(req.body.Order_Status=='Completed'){
        let text = `
        your order is been completed successfully
        please fill this feedback form to improve our quality
        click on this link http://localhost:3000/api/Order/order-feedBack/${req.params.id}
        `
        sendMail(updateOrder.User.Email,"Order is completed",text);
    }
    res.send(updateOrder);
})

router.post('/is-order-complete',uploadOptions.single('razorpay_payment_id'),async (req, res)=>{
    try{
        instance.payments.fetch(req.body.razorpay_payment_id).then(async (check)=>{
            findOrder = await Orders.find({RazorpayOrder_id:check.order_id});
            updateOrder = await Orders.findByIdAndUpdate(
                findOrder[0]._id,
                {
                    isPaid: true,
                },
                {new: true}
            ).populate("User").populate({path:'Service',populate:'Services'});

            updateUser = await User.findByIdAndUpdate(updateOrder.User._id, {Loyality_points:Math.floor((updateOrder.total_amount/10000)+updateOrder.User.Loyality_points)},{new: true})
            try{
                res.writeHead(200,{"Content-type":'text/html'});
                fs.readFile('./recipt.html',null,async function(err, data){
                    if(err) {
                        console.log(err);
                        res.write("Order Has Been Placed");
                    }
                    else{
                        res.write(data);
                    }

                    const products = [];
                    htmlString = '';
                    for(var i=0; i<updateOrder.Service.length; i++)
                    {
                        if(dis>0){
                            products.push({
                                "description": updateOrder.Service[i].Services.Service_name,
                                "price": updateOrder.Service[i].Services.Service_rate/100*(1-dis),
                                "tax-rate": 0,
                                "quantity": 1,
                            })
                        htmlString +=`<li>${updateOrder.Service[i].Services.Service_name} <br> price = ${ updateOrder.Service[i].Services.Service_rate}</li>`
                        }
                        else{
                            products.push({
                                "description": updateOrder.Service[i].Services.Service_name,
                                "price": updateOrder.Service[i].Services.Service_rate/100,
                                "tax-rate": 0,
                                "quantity": 1,
                            })
                        htmlString +=`<li>${updateOrder.Service[i].Services.Service_name} <br> price = ${ updateOrder.Service[i].Services.Service_rate}</li>`
                    }
                }
                    const date = new Date();
                    const ordersno = await Orders.collection.countDocuments()
                    const Invoicedata = {
                        "images": {
                            // The logo on top of your invoice
                            "logo": "https://res.cloudinary.com/dsv4yzr1h/image/upload/v1653809826/logo_q0wqg0.png",
                        },
                        "sender": {
                            "company": "UandI",
                            "address": "Near Post Office, Vikas Nagar, Lucknow",  // ask
                            "zip": "226022", 
                            "city": "Lucknow",
                            "country": "India"
                            //"custom1": "custom value 1",
                        },
                
                        // Your recipient
                        "client": {
                            "company": updateOrder.User.Name,
                            "Email": updateOrder.User.Email,
                            // "zip": "4567 CD",
                            // "city": "Clientcity",
                            // "country": "Clientcountry"
                            // "custom1": "custom value 1",
                        },
                        "information": {
                            // Invoice number
                            "number": ordersno, 
                            "date": `${date.getDate()}/${monthNames[d.getMonth()]}/${date.getFullYear()}`,
                            "due-date": "N/A"
                        },
                        "products": products,
                        "bottom-notice": "Payment is done",
                        "settings": {
                            "currency": "INR", 
                        },    
                    };

                    easyinvoice.createInvoice(Invoicedata, function (result) {
                        // console.log('PDF base64 string:-----------------------> ', result.pdf);
                        AdmintextmsgHTML = `
                        <h1>New Order Has been added<h1>
                        <p>the User Details are <p>
                        <ul>
                            <li> Name : ${updateOrder.User.Name}</li>
                            <li> Email: ${updateOrder.User.Email}</li>
                            <li> Phone Number : ${updateOrder.User.Phone_no}</li>
                        </ul>

                        <h2>Ordered Services</h2>
                        ${htmlString}
                        <br>
                        total amount = ${(findOrder[0].total_amount/100).toString()}
                        <br>
                        Mode of Payment : Online.
                        <br>
                        Scheduled on ${updateOrder.Scheduled_date}
                        `
                        ClienttextmsgHTML = `
                        <h1>Thankyou for shopping with us here is your recipt</h1>
                        `
                        sendMail(process.env.AdminId,"New Order",AdmintextmsgHTML,result.pdf)
                        sendMail(updateOrder.User.Email,"New Order",ClienttextmsgHTML,result.pdf)
                        res.end();
                    }).catch(err=>{
                        console.log(err);
                    });
                    
                    })
            }catch(err){console.log(err);}
        })
    }
    catch(err){
        res.send({"msg":false,guide:"Please contact us if your payments is debited"});
    }
})

router.post('/cancel-order/:id',async (req, res)=>{
    const findOrder = await Orders.findByIdAndUpdate(req.params.id,{
        Order_Status:'Cancel'
    },{new:true}).populate("User").populate({path:'Service',populate:'Services'})
    updateUser = await User.findByIdAndUpdate(findOrder.User._id, {Loyality_points:Math.floor(findOrder.User.Loyality_points-(findOrder.total_amount/10000))},{new: true})
    
    if(!findOrder){
        res.send({message: 'Order is unable to cancel',success:false})
    }else{
        let html = ''
        for (let index = 0; index < findOrder.Service.length; index++) {
            html += `<li>${findOrder.Service[index].Services.Service_name}</li>`
        }
        let textmsg = `<h1>Your Order is been canceled successfully if you have any query please contact us</h1>`;
        let textmsgAdmin = `
        <h2>${findOrder.User.Name} has canceled its order that was been placed on ${findOrder.date}</h2>
        <h4>Service Details:</h4>
        <p>
        <ul>${html}<ul>
        <p>
        Reason:
        ${req.body.reason}
        <br>
        Payment Status:
        ${findOrder.isPaid}
        `;
        sendMail(findOrder.User.Email,`Order is been Canceled`,textmsg);
        sendMail(process.env.AdminId,`Order is been Canceled`,textmsgAdmin);
        res.send({message: 'Order is canceled',success:true})
    }
})

router.get('/order-feedBack/:id',async (req, res)=>{
    res.writeHead(200,{"Content-type":'text/html'});
    fs.readFile('./feedback.html',null,function(err, data){ 
        if(err) {
            console.log(err);
            res.write("Order Has Been Placed");
        }
        else{
            res.write(data);
        }
        res.send();
    })
})

router.get('/order-not-completed',async (req, res)=>{
    const faultyOrders =await Orders.find({isPaid:false})
    const data = faultyOrders.filter(item=>{
        if(item.RazorpayOrder_id){
            return item
        }
    })
    data.map(async item=>{
        await Orders.findByIdAndRemove(item._id)
    })
    res.send('Faulty Order deleted');
})

router.post('/assign-Task/:id',async (req, res)=>{

    const upserviceman = await serviceMan.findById(req.body.ServiceManId)

    if(!upserviceman){
        res.send({message:"Unable to find serviceMan",status:false});
        return
    }else{
        let assignedOrders = upserviceman.Assigned_order
        assignedOrders.push(req.params.id)
        await serviceMan.findByIdAndUpdate(req.body.ServiceManId,{
            Assigned_order:assignedOrders
        },{new: true})
    }
    
    
    
    const Order = await Orders.findById(req.params.id).populate('User').populate({path:'Service',populate:'Services'});
    
    let services = Order.Service
    let itemtoupdate = {};
    for(let i=0; i< services.length; i++) {
        if(services[i]._id == req.body.ServiceId){
            itemtoupdate = services[i];
            itemtoupdate['isAssignedTo'] = req.body.ServiceManId
            services[i] = itemtoupdate;
        }
    }
    const AssignedOrder = await Orders.findByIdAndUpdate(req.params.id,{
        Service:services
    },{new: true}).populate({path:'Service',populate:'isAssignedTo'})
    var a = `${date.getDate()}/${monthNames[d.getMonth()]}/${date.getFullYear()}`
    let htmltext = `
    <h2>You Have been assigned an order. Please read the details and after completion click on the following link<h2>
    <p>
    <br>Customer Name: ${Order.User.Name}
    <br>Customer Phone Number: ${Order.User.Phone_no}
    <br>Customer Scheduled Date: ${a}
    <br>Customer Address: ${Order.User.Address}<br>
    <br>Service Details: <br>
    Name : ${itemtoupdate.Services.Service_name}<br>
    Rate : ${Order.total_amount/100} Rupees<br>
    <p>
    
    After completion click on the link <br>
    "http://localhost:3000/api/Order/set-OrderStatus-true/${AssignedOrder._id}/${req.body.ServiceManId}"
    `
    sendMail(upserviceman.Email,'New Order',htmltext)
    res.send(AssignedOrder)

})

router.get('/set-OrderStatus-true/:id/:servimanId',async(req, res)=>{
    const Order = await Orders.findById(req.params.id).populate({path:'Service',populate:'Services'});
    let services = Order.Service
    let itemtoupdate = {};
    for(let i=0; i< services.length; i++) {
        if(services[i].isAssignedTo == req.params.servimanId){
            itemtoupdate = services[i];
            itemtoupdate['iscompleted'] = true
            services[i] = itemtoupdate;
        }
    }
    const AssignedOrder = await Orders.findByIdAndUpdate(req.params.id,{
        Service:services
    },{new: true})
    if(!AssignedOrder){
        res.send({message:"Data not updated",success:false});
    }else{
        res.writeHead(200,{"Content-type":'text/html'});
        fs.readFile('./orderStatus.html',null,function(err, data){ 
        if(err) {
            console.log(err);
            res.write("Order Is Been completed!");
        }
        else{
            res.write(data);
        }
        res.send();
    })
    }
})

router.put('/reschedule-Date/:id',async (req, res)=>{
    const data = await Orders.findByIdAndUpdate(req.params.id,{
        Scheduled_date:req.body.Scheduled_date
    },
    {new: true}).populate('User')

    if(data){
        let date = new Date(data.Scheduled_date)
        sendMail(data.User.Email,"UandI : Your order has been Rescheduled","<h1>New date is " + date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear()+"</h1><h5>for any query please contact</h5>")
        sendMail(process.env.AdminId,`UandI :An order of ${data.User.Name} has been Rescheduled` ,"<h1>New Date is "+ date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear()+"</h1>")
        res.send({data:data,status:true})
    }else{
        res.send({status:false})
    }
})

router.put('/reschedule-Date-admin/:id',async (req, res)=>{
    const data = await Orders.findByIdAndUpdate(req.params.id,{
        Scheduled_date:req.body.Scheduled_date
    },
    {new: true})

    if(data){
        sendMail(data.User.Email,"UandI : Your order has been Rescheduled","<h1>New date is " + date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear()+"</h1><h5>for any query please contact</h5>")
        sendMail(process.env.AdminId,`UandI :An order of ${data.User.Name} has been Rescheduled` ,"<h1>New Date is "+ date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear()+"</h1>")
        res.send({data:data,status:true})
    }else{
        res.send({status:false})
    }
})
module.exports = router;