"use strict";

var _require = require('../models/serviceMan'),
    serviceMan = _require.serviceMan;

var express = require('express');

var router = express.Router();

var nodemailer = require('nodemailer');

var _require2 = require('googleapis'),
    google = _require2.google; // const Vonage = require('@vonage/server-sdk')


require('dotenv');

var Oauth2 = google.auth.OAuth2;
var Oauth2_client = new Oauth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
Oauth2_client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});

function sendMail(recipients, subject, text) {
  var acess_token = Oauth2_client.getAccessToken(); // let auth =  {
  //     type:'OAUTH2',
  //     user:process.env.Sender,
  //     clientId:process.env.CLIENT_ID,
  //     clientSecret:process.env.CLIENT_SECRET,
  //     refreshToken:process.env.REFRESH_TOKEN, 
  //     accessToken:acess_token
  // }

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: 'OAUTH2',
      user: process.env.Sender,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: acess_token
    }
  });
  var mail_options = {
    from: process.env.Sender,
    to: recipients,
    subject: subject,
    text: text
  };
  var res = transporter.sendMail(mail_options, function (err, res) {
    if (err) {
      console.log('Error', err);
    } else {
      console.log('Success');
    }

    transporter.close();
  });
  return res;
}

router.post('/newServiceman', function _callee(req, res) {
  var newServiceman;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          newServiceman = new serviceMan({
            Name: req.body.Name,
            Email: req.body.Email,
            Phone_no: req.body.Phone_no,
            Address: req.body.Address,
            Gender: req.body.Gender,
            Speciality: req.body.Speciality
          });
          _context.next = 3;
          return regeneratorRuntime.awrap(newServiceman.save());

        case 3:
          newServiceman = _context.sent;

          if (!newServiceman) {
            res.status(400).send("Process Failed");
          }

          res.send(newServiceman);

        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
});
router["delete"]('/deleteserviceMan/:id', function _callee2(req, res) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          serviceMan.findByIdAndRemove(req.params.id).then(function (user) {
            if (user) {
              return res.status(200).json({
                success: true,
                message: 'the service partner is deleted!'
              });
            } else {
              return res.status(404).json({
                success: false,
                message: "Partner not found!"
              });
            }
          })["catch"](function (err) {
            return res.status(500).json({
              success: false,
              error: err
            });
          });

        case 1:
        case "end":
          return _context2.stop();
      }
    }
  });
});
router.put('/updateServiceMan/:id', function _callee3(req, res) {
  var update;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(serviceMan.findByIdAndUpdate(req.params.id, {
            Name: req.body.Name,
            Email: req.body.Email,
            Phone_no: req.body.Phone_no,
            Address: req.body.Address,
            Gender: req.body.Gender,
            Speciality: req.body.Speciality
          }, {
            "new": true
          }));

        case 2:
          update = _context3.sent;

          if (!update) {
            res.status(400).json({
              message: "Can't update"
            });
          }

          res.send(update);

        case 5:
        case "end":
          return _context3.stop();
      }
    }
  });
});
router.get('/allserviceMan', function _callee4(req, res) {
  var allUser;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(serviceMan.find().populate('Assigned_order Speciality'));

        case 2:
          allUser = _context4.sent;

          if (!allUser) {
            res.status(404).json({
              message: "No Partner Found"
            });
          } else {
            res.send(allUser);
          }

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  });
});
router.get('/singleserviceMan/:id', function _callee5(req, res) {
  var findUser;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(serviceMan.findById(req.params.id).populate('Assigned_order Speciality').populate({
            path: 'Assigned_order',
            populate: 'User'
          }));

        case 2:
          findUser = _context5.sent;

          if (!findUser) {
            res.status(404).json({
              message: "Partner not found"
            });
          } else {
            res.send(findUser);
          }

        case 4:
        case "end":
          return _context5.stop();
      }
    }
  });
});
router.get('/RelateServiceMan/:id', function _callee6(req, res) {
  var ServiceMan;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(serviceMan.find({
            Speciality: req.params.id
          }));

        case 2:
          ServiceMan = _context6.sent;

          if (!serviceMan) {
            res.status(404).json({
              message: "Serviceman not found",
              status: false
            });
          } else {
            res.status(200).json({
              message: "Serviceman found",
              status: true,
              data: ServiceMan
            });
          }

        case 4:
        case "end":
          return _context6.stop();
      }
    }
  });
});
module.exports = router;