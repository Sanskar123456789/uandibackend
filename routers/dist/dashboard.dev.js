"use strict";

var _require = require('../models/user'),
    User = _require.User;

var express = require('express');

var _require2 = require('../models/Orders'),
    Orders = _require2.Orders;

var router = express.Router();

var _require3 = require('../models/service'),
    Service = _require3.Service;

router.get('', function _callee(req, res) {
  var user, order, services;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(User.find({}, {
            _id: 1,
            date: 1
          }));

        case 2:
          user = _context.sent;
          _context.next = 5;
          return regeneratorRuntime.awrap(Orders.find({}, {
            _id: 1,
            date: 1,
            total_amount: 1
          }));

        case 5:
          order = _context.sent;
          _context.next = 8;
          return regeneratorRuntime.awrap(Service.find().count());

        case 8:
          services = _context.sent;
          res.send([user, order, services]);

        case 10:
        case "end":
          return _context.stop();
      }
    }
  });
});
module.exports = router;