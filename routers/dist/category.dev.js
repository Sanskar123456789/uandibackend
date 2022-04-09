"use strict";

var express = require('express');

var router = express.Router();

var _require = require('../models/MainService'),
    Categories = _require.Categories;

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
router.get('/allCategories', function _callee(req, res) {
  var categories;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(Categories.find().populate('Services'));

        case 2:
          categories = _context.sent;

          if (!categories) {
            res.status(404).send("No Category found");
          } else {
            res.status(200).send(categories);
          }

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
});
router.get('/categories/:id', function _callee2(req, res) {
  var categories;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(Categories.findById(req.params.id));

        case 2:
          categories = _context2.sent;

          if (!categories) {
            res.status(404).send("No category available");
          } else {
            res.status(200).send(categories);
          }

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
});
router.post('/newCategories', uploadOptions.single('image'), function _callee3(req, res) {
  var result, newCategories;
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
          newCategories = new Categories({
            Service_image: result.secure_url,
            Cloud_id: result.public_id,
            CategoryOfService: req.body.Appliances,
            Service_description: req.body.Appliances_description,
            Services: req.body.Services
          });
          _context3.next = 8;
          return regeneratorRuntime.awrap(newCategories.save());

        case 8:
          newCategories = _context3.sent;

          if (newCategories) {
            _context3.next = 15;
            break;
          }

          _context3.next = 12;
          return regeneratorRuntime.awrap(cloud.v2.uploader.destroy(result.public_id));

        case 12:
          res.status(404).send("Unable to save Category please try again");
          _context3.next = 16;
          break;

        case 15:
          res.status(200).send(newCategories);

        case 16:
        case "end":
          return _context3.stop();
      }
    }
  });
});
router["delete"]('/deleteCategories/:id', function _callee5(req, res) {
  var data;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(Categories.findById(req.params.id));

        case 2:
          data = _context5.sent;
          Categories.findByIdAndRemove(req.params.id).then(function _callee4(Categories) {
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
                      message: 'the Categories is deleted!'
                    }));

                  case 6:
                    return _context4.abrupt("return", res.status(404).json({
                      success: false,
                      message: "Categories not found!"
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
router.put('/updateCategories/:id', uploadOptions.single('image'), function _callee6(req, res) {
  var categories, file, imagepath, cloudurl, result, updatecategories;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(Categories.findById(req.params.id));

        case 2:
          categories = _context6.sent;

          if (!categories) {
            res.status(404).send("No categories found");
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
          imagepath = categories.Service_image;
          cloudurl = categories.Cloud_id;

        case 17:
          _context6.next = 19;
          return regeneratorRuntime.awrap(Categories.findByIdAndUpdate(req.params.id, {
            Cloud_id: cloudurl,
            Service_image: imagepath,
            CategoryOfService: req.body.Appliances,
            Service_description: req.body.Appliances_description,
            Services: req.body.Services
          }, {
            "new": true
          }));

        case 19:
          updatecategories = _context6.sent;

          if (!updatecategories) {
            res.status(400).json({
              message: "Can't update"
            });
          }

          res.send(updatecategories);

        case 22:
        case "end":
          return _context6.stop();
      }
    }
  });
});
router.put('/addService/:id', function _callee7(req, res) {
  var appliances, updateAppliances;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return regeneratorRuntime.awrap(Categories.findById(req.params.id));

        case 2:
          appliances = _context7.sent;

          if (!appliances) {
            res.send({
              Message: 'Category not found',
              Status: false
            });
          }

          _context7.next = 6;
          return regeneratorRuntime.awrap(Categories.findByIdAndUpdate(req.params.id, {
            Services: req.body.ids
          }, {
            "new": true
          }));

        case 6:
          updateAppliances = _context7.sent;

          if (!updateAppliances) {
            res.status(400).json({
              message: "Can't update"
            });
          }

          res.send(updateAppliances);

        case 9:
        case "end":
          return _context7.stop();
      }
    }
  });
});
router.put('/deleteservice/:id', function _callee8(req, res) {
  var service, appliances, newservice, i, updateAppliances;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.next = 2;
          return regeneratorRuntime.awrap(Service.findById(req.body.id));

        case 2:
          service = _context8.sent;
          _context8.next = 5;
          return regeneratorRuntime.awrap(Categories.findById(req.params.id));

        case 5:
          appliances = _context8.sent;

          if (!service) {
            res.send({
              Message: 'Service not found',
              Status: false
            });
          }

          if (!appliances) {
            res.send({
              Message: 'Categories not found',
              Status: false
            });
          }

          newservice = [];
          console.log(appliances);

          if (appliances.Services.length == 0) {
            res.send({
              Message: 'no service present '
            });
          }

          for (i = 0; i < appliances.Services.length; i++) {
            if (appliances.Services[i] != req.body.id) {
              newservice.push(appliances.Services[i]);
            }

            console.log(newservice);
          }

          _context8.next = 14;
          return regeneratorRuntime.awrap(Appliances.findByIdAndUpdate(req.params.id, {
            Services: newservice
          }, {
            "new": true
          }));

        case 14:
          updateAppliances = _context8.sent;

          if (!updateAppliances) {
            res.status(400).json({
              message: "Can't update"
            });
          }

          res.send(updateAppliances);

        case 17:
        case "end":
          return _context8.stop();
      }
    }
  });
});
module.exports = router;