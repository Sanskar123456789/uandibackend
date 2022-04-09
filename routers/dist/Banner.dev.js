"use strict";

var express = require('express');

var router = express.Router();

var _require = require('../models/Banner'),
    Banner = _require.Banner;

var multer = require('multer');

var cloud = require('../cloudinary');

var _require2 = require('../models/service'),
    Service = _require2.Service;

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
router.get('/allBanners', function _callee(req, res) {
  var banner;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(Banner.find().populate('Services'));

        case 2:
          banner = _context.sent;

          if (!banner) {
            res.status(404).send("No Banner found");
          } else {
            res.status(200).send(banner);
          }

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
});
router.get('/Banner/:id', function _callee2(req, res) {
  var banner;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(Banner.findById(req.params.id));

        case 2:
          banner = _context2.sent;

          if (!banner) {
            res.status(404).send("No banner available");
          } else {
            res.status(200).send(banner);
          }

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
});
router.post('/newBanner', uploadOptions.single('Banner_image'), function _callee3(req, res) {
  var result, newBanner;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          if (req.file) {
            _context3.next = 2;
            break;
          }

          return _context3.abrupt("return", res.status(400).send('No image in the request'));

        case 2:
          _context3.next = 4;
          return regeneratorRuntime.awrap(cloud.v2.uploader.upload(req.file.path));

        case 4:
          result = _context3.sent;
          newBanner = new Banner({
            Banner_image: result.secure_url,
            Banner_title: req.body.Banner_title,
            Services: req.body.Services,
            Cloud_id: result.public_id
          });
          _context3.next = 8;
          return regeneratorRuntime.awrap(newBanner.save());

        case 8:
          newBanner = _context3.sent;

          if (newBanner) {
            _context3.next = 15;
            break;
          }

          _context3.next = 12;
          return regeneratorRuntime.awrap(cloud.v2.uploader.destroy(result.public_id));

        case 12:
          res.status(404).send("Unable to save Banner please try again");
          _context3.next = 16;
          break;

        case 15:
          res.status(200).send(newBanner);

        case 16:
        case "end":
          return _context3.stop();
      }
    }
  });
});
router["delete"]('/deleteBanner/:id', function _callee5(req, res) {
  var data;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(Banner.findById(req.params.id));

        case 2:
          data = _context5.sent;
          Banner.findByIdAndRemove(req.params.id).then(function _callee4(Categories) {
            return regeneratorRuntime.async(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    if (!Categories) {
                      _context4.next = 6;
                      break;
                    }

                    _context4.next = 3;
                    return regeneratorRuntime.awrap(cloud.v2.uploader.destroy(data.Cloud_id));

                  case 3:
                    return _context4.abrupt("return", res.status(200).json({
                      success: true,
                      message: 'the Banner is deleted!'
                    }));

                  case 6:
                    return _context4.abrupt("return", res.status(404).json({
                      success: false,
                      message: "Banner not found!"
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
router.put('/updateBanner/:id', uploadOptions.single('Banner_image'), function _callee6(req, res) {
  var banner, file, imagepath, cloudurl, result, updatebanner;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(Banner.findById(req.params.id));

        case 2:
          banner = _context6.sent;

          if (!banner) {
            res.status(404).send("No banner found");
          }

          file = req.file;

          if (!file) {
            _context6.next = 15;
            break;
          }

          _context6.next = 8;
          return regeneratorRuntime.awrap(cloud.v2.uploader.destroy(categories.Cloud_id));

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
          imagepath = banner.Service_image;
          cloudurl = banner.Cloud_id;

        case 17:
          _context6.next = 19;
          return regeneratorRuntime.awrap(Banner.findByIdAndUpdate(req.params.id, {
            Cloud_id: cloudurl,
            Banner_image: imagepath,
            Banner_title: req.body.Banner_title,
            Services: req.body.Services
          }, {
            "new": true
          }));

        case 19:
          updatebanner = _context6.sent;

          if (!updatebanner) {
            res.status(400).json({
              message: "Can't update"
            });
          }

          res.send(updatebanner);

        case 22:
        case "end":
          return _context6.stop();
      }
    }
  });
});
router.put('/addService/:id', function _callee7(req, res) {
  var appliances, updateBanner;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return regeneratorRuntime.awrap(Banner.findById(req.params.id));

        case 2:
          appliances = _context7.sent;

          if (!appliances) {
            res.send({
              Message: 'Banner not found',
              Status: false
            });
          }

          _context7.next = 6;
          return regeneratorRuntime.awrap(Banner.findByIdAndUpdate(req.params.id, {
            Services: req.body.ids
          }, {
            "new": true
          }));

        case 6:
          updateBanner = _context7.sent;

          if (!updateBanner) {
            res.status(400).json({
              message: "Can't update"
            });
          }

          res.send(updateBanner);

        case 9:
        case "end":
          return _context7.stop();
      }
    }
  });
});
router.put('/deleteservice/:id', function _callee8(req, res) {
  var service, banner, newservice, i, updateBanner;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.next = 2;
          return regeneratorRuntime.awrap(Service.findById(req.body.id));

        case 2:
          service = _context8.sent;
          _context8.next = 5;
          return regeneratorRuntime.awrap(Banner.findById(req.params.id));

        case 5:
          banner = _context8.sent;

          if (!service) {
            res.send({
              Message: 'Service not found',
              Status: false
            });
          }

          if (!banner) {
            res.send({
              Message: 'Categories not found',
              Status: false
            });
          }

          newservice = [];

          if (banner.Services.length == 0) {
            res.send({
              Message: 'no service present '
            });
          }

          for (i = 0; i < appliances.Services.length; i++) {
            if (banner.Services[i] != req.body.id) {
              newservice.push(appliances.Services[i]);
            }
          }

          _context8.next = 13;
          return regeneratorRuntime.awrap(Banner.findByIdAndUpdate(req.params.id, {
            Services: newservice
          }, {
            "new": true
          }));

        case 13:
          updateBanner = _context8.sent;

          if (!updateBanner) {
            res.status(400).json({
              message: "Can't update"
            });
          }

          res.send(updateBanner);

        case 16:
        case "end":
          return _context8.stop();
      }
    }
  });
});
module.exports = router;