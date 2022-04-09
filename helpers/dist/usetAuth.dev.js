"use strict";

var expressjwt = require('express-jwt');

function authjwt() {
  var secret = process.env.secret;
  return expressjwt({
    secret: secret,
    algorithms: ['HS256'],
    isRevoked: isRevoked
  }).unless({
    path: [// {url: /\/public\/uploads(.*)/ , method: ['GET','OPTIONS']},
    // {url: /\/api\/v1\/products(.*)/ , method: ['GET','OPTIONS']},
    // {url: /\/api\/v1\/category(.*)/ , method: ['GET','OPTIONS']},
    // {url: /\/api\/v1\/orders(.*)/ , method: ['GET','OPTIONS']},
    {
      url: "/api/user/newUser",
      method: ["POST", 'OPTIONS']
    }, {
      url: "/api/user/login",
      method: ["POST", 'OPTIONS']
    }, {
      url: "/api/user/otp",
      method: ["POST", 'OPTIONS']
    }, {
      url: "/api/user/otpcheck",
      method: ["POST", 'OPTIONS']
    }, {
      url: "/api/user/otpCheck",
      method: ["POST", 'OPTIONS']
    }, {
      url: "/api/user/addwishlist/:id",
      method: ["PUT", 'OPTIONS']
    }, {
      url: "/api/user/removewishlist/:id",
      method: ["PUT", 'OPTIONS']
    }, {
      url: /(.*)/,
      method: ['GET', 'OPTIONS']
    }]
  });
}

function isRevoked(req, payload, done) {
  return regeneratorRuntime.async(function isRevoked$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log(payload);

          if (payload.isAdmin) {
            done(null, true);
          }

          done();

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
}

module.exports = authjwt;