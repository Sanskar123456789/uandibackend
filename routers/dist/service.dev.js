"use strict";

var express = require('express');

var router = express.Router();

var cloud = require('../cloudinary');

var _require = require('../models/service'),
    Service = _require.Service;

var multer = require('multer');

var FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};
var uploadOptions = multer({
  storage: multer.diskStorage({}),
  fileFilter: function fileFilter(req, file, cb) {
    var isValid = FILE_TYPE_MAP[file.mimetype];

    if (isValid) {
      uploadError = null;
    }

    cb(uploadError, 'public/service');
  }
});
router.get('/allService', function _callee(req, res) {
  var service;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(Service.find());

        case 2:
          service = _context.sent;

          if (!service) {
            res.status(404).send("No service available");
          } else {
            res.status(200).send(service);
          }

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
});
router.get('/Service/:id', function _callee2(req, res) {
  var service;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(Service.findById(req.params.id));

        case 2:
          service = _context2.sent;

          if (!service) {
            res.status(404).send("No service available");
          } else {
            res.status(200).send(service);
          }

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
});
router.post('/newservice', uploadOptions.single('image'), function _callee3(req, res) {
  var result, newservice;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          console.log(req.body, req.file);

          if (req.file) {
            _context3.next = 3;
            break;
          }

          return _context3.abrupt("return", res.status(400).send('No image in the request'));

        case 3:
          _context3.next = 5;
          return regeneratorRuntime.awrap(cloud.v2.uploader.upload(req.file.path));

        case 5:
          result = _context3.sent;
          newservice = new Service({
            Service_name: req.body.Service_name,
            Service_rate: req.body.Service_rate,
            Is_Service_appliance: req.body.Is_Service_appliance,
            Service_description: req.body.Service_description,
            Service_image: result.secure_url,
            Cloud_id: result.public_id
          });
          _context3.next = 9;
          return regeneratorRuntime.awrap(newservice.save());

        case 9:
          newservice = _context3.sent;

          if (newservice) {
            _context3.next = 16;
            break;
          }

          _context3.next = 13;
          return regeneratorRuntime.awrap(cloud.v2.uploader.destroy(result.public_id));

        case 13:
          res.status(404).send("Unable to save service please try again");
          _context3.next = 17;
          break;

        case 16:
          res.status(200).send(newservice);

        case 17:
        case "end":
          return _context3.stop();
      }
    }
  });
});
router["delete"]('/deleteservice/:id', function _callee5(req, res) {
  var service1;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(Service.findById(req.params.id));

        case 2:
          service1 = _context5.sent;
          Service.findByIdAndRemove(req.params.id).then(function _callee4(service) {
            return regeneratorRuntime.async(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    if (service) {
                      _context4.next = 4;
                      break;
                    }

                    return _context4.abrupt("return", res.status(404).json({
                      success: false,
                      message: "service not found!"
                    }));

                  case 4:
                    _context4.next = 6;
                    return regeneratorRuntime.awrap(cloud.v2.uploader.destroy(service1.Cloud_id));

                  case 6:
                    return _context4.abrupt("return", res.status(200).json({
                      success: true,
                      message: 'the service is deleted!'
                    }));

                  case 7:
                  case "end":
                    return _context4.stop();
                }
              }
            });
          })["catch"](function (err) {
            return res.status(500).json({
              success: false,
              error: err
            });
          });

        case 4:
        case "end":
          return _context5.stop();
      }
    }
  });
});
router.put('/updateservice/:id', uploadOptions.single('image'), function _callee6(req, res) {
  var service, file, imagepath, cloudurl, result, updateservice;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(Service.findById(req.params.id));

        case 2:
          service = _context6.sent;

          if (!service) {
            res.status(404).send("No Service found");
          }

          file = req.file;

          if (!file) {
            _context6.next = 15;
            break;
          }

          _context6.next = 8;
          return regeneratorRuntime.awrap(cloud.v2.uploader.destroy(service.Cloud_id));

        case 8:
          _context6.next = 10;
          return regeneratorRuntime.awrap(cloud.v2.uploader.upload(file.path));

        case 10:
          result = _context6.sent;
          imagepath = result.secure_url;
          cloudurl = result.public_id;
          _context6.next = 17;
          break;

        case 15:
          imagepath = service.Service_image;
          cloudurl = service.Cloud_id;

        case 17:
          _context6.next = 19;
          return regeneratorRuntime.awrap(Service.findByIdAndUpdate(req.params.id, {
            Service_name: req.body.Service_name,
            Service_rate: req.body.Service_rate,
            Is_Service_appliance: req.body.Is_Service_appliance,
            Service_image: imagepath,
            Service_description: req.body.Service_description,
            Cloud_id: cloudurl
          }, {
            "new": true
          }));

        case 19:
          updateservice = _context6.sent;

          if (!updateservice) {
            res.status(400).json({
              message: "Can't update"
            });
          }

          res.send(updateservice);

        case 22:
        case "end":
          return _context6.stop();
      }
    }
  });
});
router.put('/newFeedBack/:id', function _callee7(req, res) {
  var findService, review, feed, UpService;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return regeneratorRuntime.awrap(Service.findById(req.params.id));

        case 2:
          findService = _context7.sent;

          if (findService) {
            _context7.next = 6;
            break;
          }

          res.status(404).send({
            success: false,
            message: 'No Service found'
          });
          return _context7.abrupt("return");

        case 6:
          review = 0;
          feed = [];
          console.log(review, findService.Review);
          if (findService.Review == 0) review = req.body.Review;else {
            review = (findService.Review + parseInt(req.body.Review)) / 2;
          }

          if (findService.Feedback) {
            feed = findService.Feedback;
            feed.push(req.body.Feedback);
          } else feed.push(req.body.Feedback);

          _context7.next = 13;
          return regeneratorRuntime.awrap(Service.findByIdAndUpdate(req.params.id, {
            Feedback: feed,
            Review: review
          }, {
            "new": true
          }));

        case 13:
          UpService = _context7.sent;

          if (!UpService) {
            res.send({
              message: "Unable to add your feed back",
              success: false
            });
          } else {
            res.send({
              message: "your feed has been Added",
              success: true
            });
          }

        case 15:
        case "end":
          return _context7.stop();
      }
    }
  });
});
module.exports = router;