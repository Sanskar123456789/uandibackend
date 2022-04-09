"use strict";

var express = require('express');

var app = express();
var newLocal = 'dotenv/config';

require(newLocal);

var api = process.env.url;

var morgan = require('morgan');

var mongoose = require('mongoose'); // const authjwt = require('./helpers/jwt');


var cors = require('cors');

var bodyParser = require('body-parser'); //cors


app.use(cors());
app.options('*', cors()); // imported routers

var Userrouter = require('./routers/user');

var Bannerrouter = require('./routers/Banner');

var Contactrouter = require('./routers/contact');

var Blogrouter = require('./routers/blog');

var Appliancesrouter = require('./routers/appliances');

var Offersrouter = require('./routers/offer');

var Servicesrouter = require('./routers/service');

var Orderrouter = require('./routers/Order');

var Analyticsrouter = require('./routers/dashboard');

var Categoryrouter = require('./routers/category');

var errhandler = require('./helpers/errorhandler');

var emailRouter = require('./routers/email');

var ServiceManRouter = require('./routers/serviceman'); //Middleware 


app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(morgan('tiny')); // app.use(authjwt());

app.use('/public/uploads', express["static"](__dirname + '/public/uploads'));
app.use(errhandler); //routers

app.use("".concat(api, "/user"), Userrouter);
app.use("".concat(api, "/banner"), Bannerrouter);
app.use("".concat(api, "/appliances"), Appliancesrouter);
app.use("".concat(api, "/Category"), Categoryrouter);
app.use("".concat(api, "/contact"), Contactrouter);
app.use("".concat(api, "/blog"), Blogrouter);
app.use("".concat(api, "/service"), Servicesrouter);
app.use("".concat(api, "/offer"), Offersrouter);
app.use("".concat(api, "/Order"), Orderrouter);
app.use("".concat(api, "/Analyticsrouter"), Analyticsrouter);
app.use("".concat(api, "/email"), emailRouter);
app.use("".concat(api, "/ServiceMan"), ServiceManRouter); // connecting to database

mongoose.connect(process.env.mongo_connect, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "UandI"
}).then(function () {
  console.log("Database Connected");
})["catch"](function (err) {
  console.log(" Database is not conected " + err);
}); // port for listening request 

app.listen(3000, function () {
  console.log(api);
  console.log("Server is running http://localhost:3000");
});