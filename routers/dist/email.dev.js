"use strict";

var express = require('express');

var router = express.Router();

var _require = require('../models/emails'),
    Email = _require.Email;

router.post('/newEmail', function _callee(req, res) {
  var newContact;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          newContact = new Email({
            emailId: req.body.id
          });
          _context.next = 3;
          return regeneratorRuntime.awrap(newContact.save());

        case 3:
          newContact = _context.sent;

          if (!newContact) {
            res.status(404).send("Unable to save email please try again");
          } else {
            res.status(200).send(newContact);
          }

        case 5:
        case "end":
          return _context.stop();
      }
    }
  });
});
router["delete"]('/deleteEmail', function _callee2(req, res) {
  var email;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(Email.find({
            emailId: req.body.emailId
          }));

        case 2:
          email = _context2.sent;
          Email.findByIdAndRemove(email[0]._id).then(function (Contact) {
            if (Contact) {
              return res.status(200).json({
                success: true,
                message: 'the Email is deleted!'
              });
            } else {
              return res.status(404).json({
                success: false,
                message: "Email not found!"
              });
            }
          })["catch"](function (err) {
            return res.status(500).json({
              success: false,
              error: err
            });
          });

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
});
module.exports = router;