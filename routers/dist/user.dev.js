"use strict";

var _require = require('../models/user'),
    User = _require.User;

var _require2 = require('../models/Otp'),
    Otp = _require2.Otp;

var express = require('express');

var router = express.Router();

var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

var nodemailer = require('nodemailer');

var _require3 = require('googleapis'),
    google = _require3.google;

var Vonage = require('@vonage/server-sdk');

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

router.post('/newUser', function _callee(req, res) {
  var newUser;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          newUser = new User({
            Name: req.body.Name,
            Email: req.body.Email,
            Phone_no: req.body.Phone_no,
            Address: req.body.Address,
            Gender: req.body.Gender,
            password: bcrypt.hashSync(req.body.password, 10)
          });
          _context.next = 3;
          return regeneratorRuntime.awrap(newUser.save());

        case 3:
          newUser = _context.sent;

          if (!newUser) {
            res.status(400).send("Process Failed");
          }

          res.send(newUser);

        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
});
router.post('/guser', function _callee2(req, res) {
  var _newUser;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(User.find({
            Email: req.body.Email
          }).select('Email'));

        case 2:
          findUser = _context2.sent;

          if (!findUser.length) {
            _context2.next = 7;
            break;
          }

          res.send({
            success: true,
            message: "User Already exists!",
            Email: req.body.Email
          });
          _context2.next = 13;
          break;

        case 7:
          _newUser = new User({
            Name: req.body.Name,
            Email: req.body.Email,
            Phone_no: req.body.Phone_no,
            Address: req.body.Address,
            Gender: req.body.Gender,
            password: bcrypt.hashSync(req.body.password, 10)
          });
          _context2.next = 10;
          return regeneratorRuntime.awrap(_newUser.save());

        case 10:
          _newUser = _context2.sent;

          if (!_newUser) {
            res.status(400).send("Process Failed");
          }

          res.send(_newUser);

        case 13:
        case "end":
          return _context2.stop();
      }
    }
  });
}); // email otp APIs
// for admin

router.post('/otp', function _callee3(req, res) {
  var minm, maxm, Otps, newOtp, _newOtp;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          minm = 10000;
          maxm = 99999;
          Otps = Math.floor(Math.random() * (maxm - minm + 1)) + minm;
          sendMail(req.body.Email, "OTP", Otps.toString()); // otp is going to save in database

          _context3.next = 6;
          return regeneratorRuntime.awrap(Otp.findOne({
            User: req.body.Email
          }).select('Otp'));

        case 6:
          findOtp = _context3.sent;

          if (!findOtp) {
            _context3.next = 14;
            break;
          }

          _context3.next = 10;
          return regeneratorRuntime.awrap(Otp.findByIdAndUpdate(findOtp._id, {
            Otp: Otps,
            TypeofOtp: "Mail"
          }, {
            "new": true
          }));

        case 10:
          newOtp = _context3.sent;

          if (!newOtp) {
            res.send({
              msg: "Otp has not been created. pls try again",
              success: false
            });
          }

          _context3.next = 19;
          break;

        case 14:
          _newOtp = new Otp({
            User: req.body.Email,
            Otp: Otps,
            TypeofOtp: "Mail"
          });
          _context3.next = 17;
          return regeneratorRuntime.awrap(_newOtp.save());

        case 17:
          _newOtp = _context3.sent;

          if (!_newOtp) {
            res.status(400).send({
              msg: "Otp has not been created. pls try again",
              success: false
            });
          } else {
            res.send({
              msg: "Otp Has been created.",
              success: true
            });
          }

        case 19:
        case "end":
          return _context3.stop();
      }
    }
  });
}); //for User

router.post('/getOtp', function _callee4(req, res) {
  var minm, maxm, otps, newOtp, _newOtp2;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          newUser = false;
          minm = 10000;
          maxm = 99999;
          otps = Math.floor(Math.random() * (maxm - minm + 1)) + minm;
          sendMail(req.body.User, "OTP", otps.toString()); // otp is send to user Email address

          _context4.next = 7;
          return regeneratorRuntime.awrap(Otp.find({
            User: req.body.User
          }).select('Otp'));

        case 7:
          findOtp = _context4.sent;
          // finding otp in otp db
          console.log(findOtp);

          if (!(findOtp.length > 0)) {
            _context4.next = 16;
            break;
          }

          _context4.next = 12;
          return regeneratorRuntime.awrap(Otp.findByIdAndUpdate(findOtp[0]._id, {
            Otp: otps,
            TypeofOtp: "Mail"
          }, {
            "new": true
          }));

        case 12:
          newOtp = _context4.sent;

          if (!newOtp) {
            res.send({
              msg: "Otp has not been created. pls try again",
              success: false
            });
          } else {
            res.send({
              msg: "Otp has been created",
              success: true
            });
          }

          _context4.next = 21;
          break;

        case 16:
          _newOtp2 = new Otp({
            User: req.body.User,
            Otp: otps,
            TypeofOtp: "Mail"
          });
          _context4.next = 19;
          return regeneratorRuntime.awrap(_newOtp2.save());

        case 19:
          _newOtp2 = _context4.sent;

          if (!_newOtp2) {
            res.status(400).send({
              msg: "Otp has not been created. pls try again",
              success: false
            });
          } else {
            res.send({
              msg: "Otp has been created",
              success: true
            });
          }

        case 21:
        case "end":
          return _context4.stop();
      }
    }
  });
}); // check Otp

router.post('/otpChecks', function _callee5(req, res) {
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(Otp.find({
            User: req.body.User
          }).select('Otp'));

        case 2:
          findOtp = _context5.sent;

          if (findOtp.length > 0) {
            if (req.body.otp == findOtp[0].Otp) {
              res.send({
                msg: "Verified.",
                success: true
              });
            } else {
              res.send({
                msg: "not Verified.",
                success: false
              });
            }
          } else {
            res.send({
              msg: "Otp has not been created.",
              success: false
            });
          }

        case 4:
        case "end":
          return _context5.stop();
      }
    }
  });
}); // email otp APIs ends

router.post('/login', function _callee6(req, res) {
  var findUser, secret, token;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(User.findOne({
            Email: req.body.Email
          }));

        case 2:
          findUser = _context6.sent;

          if (!findUser) {
            res.send({
              success: false,
              msg: "Wrong EmailId"
            });
          } else {
            secret = process.env.secret;

            if (bcrypt.compareSync(req.body.password, findUser.password)) {
              token = jwt.sign({
                userId: findUser._id,
                isAdmin: findUser.isAdmin
              }, secret, {
                expiresIn: '1d'
              });
              res.status(200).json({
                success: true,
                email: findUser.Email,
                token: token,
                UserData: findUser
              });
            } else {
              res.send({
                success: false,
                msg: "Wrong Password"
              });
            }
          }

        case 4:
        case "end":
          return _context6.stop();
      }
    }
  });
});
router["delete"]('/deleteUser/:id', function _callee7(req, res) {
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          User.findByIdAndRemove(req.params.id).then(function (user) {
            if (user) {
              return res.status(200).json({
                success: true,
                message: 'the user is deleted!'
              });
            } else {
              return res.status(404).json({
                success: false,
                message: "user not found!"
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
          return _context7.stop();
      }
    }
  });
});
router.put('/updateUser/:id', function _callee8(req, res) {
  var update;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.next = 2;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.params.id, {
            Name: req.body.Name,
            Phone_no: req.body.Phone_no,
            Address: req.body.Address,
            Gender: req.body.Gender
          }, {
            "new": true
          }));

        case 2:
          update = _context8.sent;

          if (!update) {
            res.status(400).json({
              message: "Can't update"
            });
          }

          res.send(update);

        case 5:
        case "end":
          return _context8.stop();
      }
    }
  });
});
router.get('/allUser', function _callee9(req, res) {
  var allUser;
  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.next = 2;
          return regeneratorRuntime.awrap(User.find());

        case 2:
          allUser = _context9.sent;

          if (!allUser) {
            res.status(404).json({
              message: "No User Found"
            });
          } else {
            res.send(allUser);
          }

        case 4:
        case "end":
          return _context9.stop();
      }
    }
  });
});
router.get('/singleUser/:id', function _callee10(req, res) {
  var findUser;
  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.params.id).select('-password').populate('User_Wishlist').populate('Cart').populate({
            path: "Orders",
            populate: 'Service'
          }));

        case 2:
          findUser = _context10.sent;

          if (!findUser) {
            res.status(404).json({
              message: "User not found"
            });
          } else {
            res.send(findUser);
          }

        case 4:
        case "end":
          return _context10.stop();
      }
    }
  });
});
router.get('/count', function _callee11(req, res) {
  var count;
  return regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          _context11.next = 2;
          return regeneratorRuntime.awrap(User.find({
            isAdmin: false
          }).count());

        case 2:
          count = _context11.sent;

          if (!count) {
            res.status(404).send({
              count: 0
            });
          } else {
            res.send({
              "count": count
            });
          }

        case 4:
        case "end":
          return _context11.stop();
      }
    }
  });
});
router.put('/addwishlist/:id', function _callee12(req, res) {
  var findUser, update;
  return regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          _context12.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.params.id));

        case 2:
          findUser = _context12.sent;

          if (!findUser) {
            res.status(404).send("No user found");
          }

          if (!findUser.User_Wishlist) {
            findUser.User_Wishlist[0] = req.body.User_Wishlist;
          } else {
            if (findUser.User_Wishlist.indexOf(req.body.User_Wishlist[0]) != -1) {} else {
              findUser.User_Wishlist = findUser.User_Wishlist.push(req.body.User_Wishlist);
            }
          }

          _context12.next = 7;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.params.id, findUser, {
            "new": true
          }));

        case 7:
          update = _context12.sent;

          if (!update) {
            res.send({
              message: "Unable to add to wishlist",
              status: false
            });
          }

          res.send({
            data: update
          });

        case 10:
        case "end":
          return _context12.stop();
      }
    }
  });
});
router.put('/removewishlist/:id', function _callee13(req, res) {
  var findUser, newWishlist, l, i, update;
  return regeneratorRuntime.async(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          _context13.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.params.id));

        case 2:
          findUser = _context13.sent;

          if (!findUser) {
            res.status(404).send("No user found");
          }

          if (findUser.User_Wishlist) {
            _context13.next = 8;
            break;
          }

          res.status(404).send("Wishlist is empty");
          _context13.next = 17;
          break;

        case 8:
          newWishlist = [];
          l = findUser.User_Wishlist.length;

          for (i = 0; i < l; i++) {
            if (findUser.User_Wishlist[i] != req.body.User_Wishlist) {
              newWishlist.push(findUser.User_Wishlist[i]);
            }
          }

          findUser.User_Wishlist = newWishlist;
          _context13.next = 14;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.params.id, findUser, {
            "new": true
          }).populate('User_Wishlist'));

        case 14:
          update = _context13.sent;

          if (!update) {
            res.send({
              message: "Unable to add to wishlist",
              status: false
            });
          }

          res.send({
            data: update
          });

        case 17:
        case "end":
          return _context13.stop();
      }
    }
  });
});
router.put('/addCart/:id', function _callee14(req, res) {
  var findUser, update;
  return regeneratorRuntime.async(function _callee14$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          _context14.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.params.id));

        case 2:
          findUser = _context14.sent;

          if (!findUser) {
            res.status(404).send("No user found");
          }

          if (!findUser.Cart) {
            findUser.Cart[0] = req.body.Cart;
          } else {
            if (findUser.Cart.indexOf(req.body.Cart[0]) != -1) {} else {
              findUser.Cart = findUser.Cart.push(req.body.Cart);
            }
          }

          _context14.next = 7;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.params.id, findUser, {
            "new": true
          }));

        case 7:
          update = _context14.sent;

          if (!update) {
            res.send({
              message: "Unable to add to cart",
              status: false
            });
          }

          res.send({
            data: update
          });

        case 10:
        case "end":
          return _context14.stop();
      }
    }
  });
});
router.put('/removeCart/:id', function _callee15(req, res) {
  var findUser, newCart, l, i, update;
  return regeneratorRuntime.async(function _callee15$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          _context15.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.params.id));

        case 2:
          findUser = _context15.sent;

          if (!findUser) {
            res.status(404).send("No user found");
          }

          if (findUser.Cart) {
            _context15.next = 8;
            break;
          }

          res.status(404).send("Cart is empty");
          _context15.next = 17;
          break;

        case 8:
          newCart = [];
          l = findUser.Cart.length;

          for (i = 0; i < l; i++) {
            if (findUser.Cart[i] != req.body.Cart) {
              newCart.push(findUser.Cart[i]);
            }
          }

          findUser.Cart = newCart;
          _context15.next = 14;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.params.id, findUser, {
            "new": true
          }).populate('Cart').select('-password'));

        case 14:
          update = _context15.sent;

          if (!update) {
            res.send({
              message: "Unable to add to wishlist",
              status: false
            });
          }

          res.send({
            data: update
          });

        case 17:
        case "end":
          return _context15.stop();
      }
    }
  });
});
router.put('/updatePassword', function _callee16(req, res) {
  var userexist, newpassword, update;
  return regeneratorRuntime.async(function _callee16$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          _context16.next = 2;
          return regeneratorRuntime.awrap(User.find({
            Email: req.body.Email
          }));

        case 2:
          userexist = _context16.sent;

          if (!(userexist.length == 0)) {
            _context16.next = 6;
            break;
          }

          res.send({
            msg: 'You are not a user pls register',
            success: false
          });
          return _context16.abrupt("return");

        case 6:
          if (req.body.password) {
            newpassword = bcrypt.hashSync(req.body.password, 10);
          } else {
            newpassword = userexist.password;
          }

          _context16.next = 9;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(userexist[0]._id, {
            password: newpassword
          }, {
            "new": true
          }));

        case 9:
          update = _context16.sent;

          if (!update) {
            res.status(400).json({
              message: "Can't update"
            });
          }

          res.send({
            password: update,
            success: true
          });

        case 12:
        case "end":
          return _context16.stop();
      }
    }
  });
});
router.post('/mobileOtp', function _callee17(req, res) {
  var minm, maxm, otps, newOtp, _newOtp3;

  return regeneratorRuntime.async(function _callee17$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          // const vonage = new Vonage({
          //     apiKey: process.env.MobileOTPAPIKEY,
          //     apiSecret: process.env.MobileOTPAPISECRET
          // })
          // const from = "Vonage APIs"
          // const to = req.body.Phone_no
          minm = 10000;
          maxm = 99999;
          otps = Math.floor(Math.random() * (maxm - minm + 1)) + minm; // const text = `Your Otp for verifying your number is ${otps}`;

          _context17.next = 5;
          return regeneratorRuntime.awrap(Otp.find({
            User: req.body.User
          }).select('Otp'));

        case 5:
          findOtp = _context17.sent;

          if (!(findOtp.length > 0)) {
            _context17.next = 13;
            break;
          }

          _context17.next = 9;
          return regeneratorRuntime.awrap(Otp.findByIdAndUpdate(findOtp[0]._id, {
            Otp: otps
          }, {
            "new": true
          }));

        case 9:
          newOtp = _context17.sent;

          if (!newOtp) {
            res.send({
              msg: "Otp has not been created. pls try again",
              success: false
            });
          } else {
            res.send({
              msg: "Opt has been sended to your Phone number pls check.",
              success: true
            });
          }

          _context17.next = 18;
          break;

        case 13:
          _newOtp3 = new Otp({
            User: req.body.User,
            Otp: otps
          });
          _context17.next = 16;
          return regeneratorRuntime.awrap(_newOtp3.save());

        case 16:
          _newOtp3 = _context17.sent;

          if (!_newOtp3) {
            res.status(400).send({
              msg: "Otp has not been created. pls try again",
              success: false
            });
          } else {
            res.send({
              msg: "Opt has been sended to your Phone number pls check.",
              success: true
            });
          }

        case 18:
        case "end":
          return _context17.stop();
      }
    }
  });
});
router.post('/checkMobileOtp', function _callee18(req, res) {
  return regeneratorRuntime.async(function _callee18$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          _context18.next = 2;
          return regeneratorRuntime.awrap(Otp.find({
            User: req.body.User
          }).select('Otp'));

        case 2:
          findOtp = _context18.sent;

          if (findOtp.length > 0) {
            if (req.body.otp == findOtp[0].Otp) {
              res.send({
                msg: "Verified.",
                success: true
              });
            } else {
              res.send({
                msg: "not Verified.",
                success: false
              });
            }
          } else {
            res.send({
              msg: "Otp has not been created.",
              success: false
            });
          }

        case 4:
        case "end":
          return _context18.stop();
      }
    }
  });
});
module.exports = router;