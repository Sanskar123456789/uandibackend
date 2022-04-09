"use strict";

var express = require('express');

var router = express.Router();

var _require = require('../models/contact'),
    Contact = _require.Contact;

router.get('/allContact', function _callee(req, res) {
  var contact;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(Contact.find());

        case 2:
          contact = _context.sent;

          if (!contact) {
            res.status(404).send("No Contact available");
          } else {
            res.status(200).send(contact);
          }

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
});
router.get('/OneContact/:id', function _callee2(req, res) {
  var contact;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(Contact.findById(req.params.id));

        case 2:
          contact = _context2.sent;

          if (!contact) {
            res.status(404).send("No Contact available");
          } else {
            res.status(200).send(contact);
          }

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
});
router.post('/newContact', function _callee3(req, res) {
  var newContact;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          console.log(req.body);
          newContact = new Contact({
            Phone_no: req.body.Phone_no,
            emailId: req.body.emailId,
            instaId: req.body.instaId,
            twitter: req.body.twitter,
            facebook: req.body.facebook,
            youtube: req.body.youtube
          });
          _context3.next = 4;
          return regeneratorRuntime.awrap(newContact.save());

        case 4:
          newContact = _context3.sent;

          if (!newContact) {
            res.status(404).send("Unable to save contact please try again");
          } else {
            res.status(200).send(newContact);
          }

        case 6:
        case "end":
          return _context3.stop();
      }
    }
  });
});
router["delete"]('/deleteContact/:id', function _callee4(req, res) {
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          Contact.findByIdAndRemove(req.params.id).then(function (Contact) {
            if (Contact) {
              return res.status(200).json({
                success: true,
                message: 'the Contact is deleted!'
              });
            } else {
              return res.status(404).json({
                success: false,
                message: "Contact not found!"
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
          return _context4.stop();
      }
    }
  });
});
router.put('/updateContact/:id', function _callee5(req, res) {
  var updateContact;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(Contact.findByIdAndUpdate(req.params.id, {
            Phone_no: req.body.Phone_no,
            emailId: req.body.emailId,
            instaId: req.body.instaId,
            twitter: req.body.twitter,
            facebook: req.body.facebook,
            youtube: req.body.youtube
          }, {
            "new": true
          }));

        case 2:
          updateContact = _context5.sent;

          if (!updateContact) {
            res.status(400).json({
              message: "Can't update"
            });
          }

          res.send(updateContact);

        case 5:
        case "end":
          return _context5.stop();
      }
    }
  });
});
module.exports = router;