const express = require('express');
const app = express();
const newLocal = 'dotenv/config';
require(newLocal);
const api = process.env.url;
const morgan = require('morgan');
const mongoose = require('mongoose');
// const authjwt = require('./helpers/jwt');
const cors = require('cors');
const bodyParser = require('body-parser');
//cors
app.use(cors());
app.options('*', cors())


// imported routers
const Userrouter = require('./routers/user');
const Bannerrouter = require('./routers/Banner');
const Contactrouter = require('./routers/contact');
const Blogrouter = require('./routers/blog');
const Appliancesrouter = require('./routers/appliances');
const Offersrouter = require('./routers/offer');
const Servicesrouter = require('./routers/service');
const Orderrouter = require('./routers/Order');
const Analyticsrouter = require('./routers/dashboard');
const Categoryrouter = require('./routers/category');
const errhandler = require('./helpers/errorhandler');
const emailRouter = require('./routers/email');
const ServiceManRouter = require('./routers/serviceman');

//Middleware 
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('tiny'));
// app.use(authjwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))
app.use(errhandler);

//routers
app.use(`${api}/user`,Userrouter);
app.use(`${api}/banner`,Bannerrouter);
app.use(`${api}/appliances`,Appliancesrouter);
app.use(`${api}/Category`,Categoryrouter);
app.use(`${api}/contact`,Contactrouter);
app.use(`${api}/blog`,Blogrouter);
app.use(`${api}/service`,Servicesrouter)
app.use(`${api}/offer`,Offersrouter);
app.use(`${api}/Order`,Orderrouter);
app.use(`${api}/Analyticsrouter`,Analyticsrouter);
app.use(`${api}/email`,emailRouter);
app.use(`${api}/ServiceMan`,ServiceManRouter);

// connecting to database
mongoose.connect(process.env.mongo_connect,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    dbName:"UandI"
})
.then(()=>{
    console.log("Database Connected");
})
.catch((err)=>{
    console.log(" Database is not conected " + err);
})

// port for listening request 
app.listen(3000,()=>{
    console.log(api);
    console.log("Server is running http://localhost:3000");
})