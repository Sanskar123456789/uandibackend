"use strict";

var express = require('express');

var router = express.Router();

var _require = require('../models/Orders'),
    Orders = _require.Orders;

var _require2 = require('../models/user'),
    User = _require2.User;

var _require3 = require('../models/serviceMan'),
    serviceMan = _require3.serviceMan;

var _require4 = require('../models/offer'),
    Offer = _require4.Offer;

var _require5 = require('../models/service'),
    Service = _require5.Service;

var multer = require('multer');

var Razorpay = require('razorpay');

var fs = require('fs');

var nodemailer = require('nodemailer');

var _require6 = require('googleapis'),
    google = _require6.google;

var easyinvoice = require('easyinvoice');

var Oauth2 = google.auth.OAuth2;
var Oauth2_client = new Oauth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
Oauth2_client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});

function sendMail(recipients, subject, text, invoice) {
  var acess_token = Oauth2_client.getAccessToken();
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
  var mail_options;

  if (invoice) {
    mail_options = {
      from: process.env.Sender,
      to: recipients,
      subject: subject,
      html: text,
      attachments: [{
        filename: "Receipt.pdf",
        contentType: 'application/pdf',
        // <- You also can specify type of the document
        content: invoice,
        encoding: 'base64'
      }]
    };
  } else {
    mail_options = {
      from: process.env.Sender,
      to: recipients,
      subject: subject,
      html: text
    };
  }

  var res = transporter.sendMail(mail_options, function (err, res) {
    if (err) {
      console.log('Error', err);
    }

    transporter.close();
  });
  return res;
}

var uploadOptions = multer({
  storage: multer.diskStorage({}),
  fileFilter: function fileFilter(req, file, cb) {}
});
var instance = new Razorpay({
  key_id: process.env.PaymentGatewayId,
  key_secret: process.env.PaymentGatewaySecret
}); // for Admin Panel to get all Orders

router.get('/allOrders', function _callee(req, res) {
  var orders;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(Orders.find().populate("User Offer").populate({
            path: 'Service',
            populate: 'Services'
          }));

        case 2:
          orders = _context.sent;

          if (!orders) {
            res.status(404).send("No offer available");
          } else {
            res.status(200).send(orders);
          }

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
});
router.get('/OrderDetail/:id', function _callee2(req, res) {
  var orders;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(Orders.findById(req.params.id).populate("User Offer").populate({
            path: 'Service',
            populate: 'Services isAssignedTo'
          }));

        case 2:
          orders = _context2.sent;

          if (!orders) {
            res.status(404).send("No offer available");
          } else {
            res.status(200).send(orders);
          }

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
}); // params = user _id

router.post('/newOrder/:id', function _callee3(req, res) {
  var user, offer_applied, servicesid, _i, newOrder, dis, max, offer, orders, ServiceList, total, _i2, _updateOrder, _updateOrder2, userOrderList, LoyalityPoints, update, products, i, _date, ordersno, Invoicedata;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.params.id).select('-password'));

        case 2:
          user = _context3.sent;
          offer_applied = ''; // finding user by id

          if (user) {
            _context3.next = 7;
            break;
          }

          res.status(404).send({
            message: 'No user found',
            status: false
          });
          return _context3.abrupt("return");

        case 7:
          // saving order
          servicesid = [];

          for (_i = 0; _i < req.body.Service.length; _i++) {
            servicesid.push({
              Services: req.body.Service[_i]
            });
          }

          newOrder = new Orders({
            User: req.params.id,
            Service: servicesid,
            Scheduled_date: req.body.Scheduled_date
          });
          _context3.next = 12;
          return regeneratorRuntime.awrap(newOrder.save());

        case 12:
          newOrder = _context3.sent;
          console.log(newOrder); // calculating total

          dis = 0;

          if (!req.body.Offer_code) {
            _context3.next = 27;
            break;
          }

          _context3.next = 18;
          return regeneratorRuntime.awrap(Offer.find({
            'Offer_code': req.body.Offer_code
          }));

        case 18:
          offer = _context3.sent;

          if (!offer[0]) {
            _context3.next = 25;
            break;
          }

          offer_applied = offer[0]._id;
          dis = offer[0].Offer_percentage;
          max = offer[0].Offer_onBasisOfTotalAmount;
          _context3.next = 27;
          break;

        case 25:
          res.status(404).send({
            message: "offer not found",
            success: false
          });
          return _context3.abrupt("return");

        case 27:
          _context3.next = 29;
          return regeneratorRuntime.awrap(Orders.findById(newOrder._id).populate({
            path: 'Service',
            populate: 'Services'
          }));

        case 29:
          orders = _context3.sent;
          ServiceList = orders.Service;
          total = 0;

          for (_i2 = 0; _i2 < ServiceList.length; _i2++) {
            total = total + ServiceList[_i2].Services.Service_rate;
          }

          if (max) {
            if (total >= max) {
              dis = dis / 100;
              total = total - total * dis;
            }
          }

          if (req.body.coins) {
            total -= user.Loyality_points;
          } // order is generated


          if (!(offer_applied == '')) {
            _context3.next = 42;
            break;
          }

          _context3.next = 38;
          return regeneratorRuntime.awrap(Orders.findByIdAndUpdate(newOrder._id, {
            total_amount: total * 100
          }, {
            "new": true
          }));

        case 38:
          _updateOrder = _context3.sent;

          if (!_updateOrder) {
            res.status(404).send("Unable to place order please try again");
          }

          _context3.next = 46;
          break;

        case 42:
          _context3.next = 44;
          return regeneratorRuntime.awrap(Orders.findByIdAndUpdate(newOrder._id, {
            total_amount: total * 100,
            Offer: offer_applied
          }, {
            "new": true
          }));

        case 44:
          _updateOrder2 = _context3.sent;

          if (!_updateOrder2) {
            res.status(404).send("Unable to place order please try again");
          }

        case 46:
          // saving order to user table
          userOrderList = [];

          if (user.Orders.length == 0) {
            userOrderList[0] = newOrder._id;
          } else {
            userOrderList = user.Orders;
            userOrderList[user.Orders.length] = newOrder._id;
          }

          LoyalityPoints = Math.floor(total / 100 + user.Loyality_points); // User data update

          _context3.next = 51;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.params.id, {
            Loyality_points: LoyalityPoints,
            Orders: userOrderList
          }, {
            "new": true
          }).select('-password'));

        case 51:
          update = _context3.sent;

          if (update) {
            _context3.next = 56;
            break;
          }

          res.send({
            message: "Unable to add to User Order list",
            status: false
          });
          _context3.next = 65;
          break;

        case 56:
          products = [];
          htmlString = '';

          for (i = 0; i < orders.Service.length; i++) {
            products.push({
              "description": orders.Service[i].Services.Service_name,
              "price": orders.Service[i].Services.Service_rate,
              "tax-rate": 0,
              "quantity": 1
            });
            htmlString += "<li>".concat(orders.Service[i].Services.Service_name, " <br> price = ").concat(orders.Service[i].Services.Service_rate, "</li>");
          }

          _date = new Date();
          _context3.next = 62;
          return regeneratorRuntime.awrap(Orders.collection.countDocuments());

        case 62:
          ordersno = _context3.sent;
          Invoicedata = {
            "images": {
              // The logo on top of your invoice
              "logo": "https://public.easyinvoice.cloud/img/logo_en_original.png",
              // The invoice background
              "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
            },
            "sender": {
              "company": "UandI",
              "address": "Sample Street 123",
              // ask
              "zip": "1234 AB",
              "city": "Lucknow",
              "country": "India" //"custom1": "custom value 1",

            },
            // Your recipient
            "client": {
              "company": update.Name,
              "Email": update.Email // "zip": "4567 CD",
              // "city": "Clientcity",
              // "country": "Clientcountry"
              // "custom1": "custom value 1",

            },
            "information": {
              // Invoice number
              "number": ordersno,
              "date": "".concat(_date.getDate(), "/").concat(_date.getMonth(), "/").concat(_date.getFullYear()),
              "due-date": "N/A"
            },
            "products": products,
            "bottom-notice": "Payment is to be collected",
            "settings": {
              "currency": "INR"
            }
          };
          easyinvoice.createInvoice(Invoicedata, function (result) {
            AdmintextmsgHTML = "\n            <h1>New Order Has been added<h1>\n            <p>the User Details are <p>\n            <ul>\n                <li> Name : ".concat(update.Name, "</li>\n                <li> Email: ").concat(update.Email, "</li>\n                <li> Phone Number : ").concat(update.Phone_no, "</li>\n            </ul>\n\n            <h2>Ordered Services</h2>\n            ").concat(htmlString, "\n            total amount = ").concat(total.toString(), "\n            <br>\n            Mode of Payment : Offline.\n            <br>\n            Scheduled on ").concat(newOrder.Scheduled_date, "\n            ");
            ClienttextmsgHTML = "\n            <h1>Thankyou for shopping with us here is your recipt</h1>\n            ";
            sendMail(process.env.AdminId, "New Order", AdmintextmsgHTML, result.pdf);
            sendMail(update.Email, "New Order", ClienttextmsgHTML, result.pdf);
            res.send({
              message: "Order is successful",
              status: true
            });
          })["catch"](function (err) {
            res.send({
              message: "Order is successful there is problem coming in sending you invoice plese contact us for invoice",
              status: true
            });
          });

        case 65:
        case "end":
          return _context3.stop();
      }
    }
  });
}); // params = Order _id

router.put('/updateOrder/:id', function _callee4(req, res) {
  var Order, updateOrder, text;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(Orders.findById(req.params.id));

        case 2:
          Order = _context4.sent;

          if (!Order) {
            res.status(404).send({
              message: 'No Order found',
              status: false
            });
          }

          _context4.next = 6;
          return regeneratorRuntime.awrap(Orders.findByIdAndUpdate(req.params.id, {
            Order_Status: req.body.Order_Status,
            Iscompleted: req.body.Iscompleted,
            isPaid: req.body.isPaid
          }, {
            "new": true
          }).populate("User"));

        case 6:
          updateOrder = _context4.sent;

          if (!updateOrder) {
            res.status(400).json({
              message: "Can't update"
            });
          }

          if (req.body.Order_Status == 'Completed') {
            text = "\n        your order is been completed successfully\n        please fill this feedback form to improve our quality\n        click on this link http://localhost:3000/api/Order/order-feedBack/".concat(req.params.id, "\n        ");
            sendMail(updateOrder.User.Email, "Order is completed", text);
          }

          res.send(updateOrder);

        case 10:
        case "end":
          return _context4.stop();
      }
    }
  });
});
router.post('/onlinePayment/:id', function _callee6(req, res) {
  var user, dis, max, offer, total, i, orders, ordersno;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.params.id).select('Name Phone_no Email Orders Loyality_points'));

        case 2:
          user = _context6.sent;

          if (!user) {
            _context6.next = 26;
            break;
          }

          dis = 0;
          _context6.next = 7;
          return regeneratorRuntime.awrap(Offer.find({
            'Offer_code': req.body.Offer_code
          }));

        case 7:
          offer = _context6.sent;

          if (offer[0]) {
            dis = offer[0].Offer_percentage;
            max = offer[0].Offer_onBasisOfTotalAmount;
          }

          total = 0;
          i = 0;

        case 11:
          if (!(i < req.body.Service.length)) {
            _context6.next = 19;
            break;
          }

          _context6.next = 14;
          return regeneratorRuntime.awrap(Service.findById(req.body.Service[i]._id));

        case 14:
          orders = _context6.sent;
          total = total + orders.Service_rate;

        case 16:
          i++;
          _context6.next = 11;
          break;

        case 19:
          if (total >= max) {
            dis = dis / 100;
            total = total - total * dis;
          }

          if (req.body.coins) {
            total = total - user.Loyality_points;
          }

          _context6.next = 23;
          return regeneratorRuntime.awrap(Orders.collection.countDocuments());

        case 23:
          ordersno = _context6.sent;
          total = Math.floor(total);
          instance.orders.create({
            amount: total * 100,
            currency: "INR",
            receipt: "receipt#".concat(ordersno)
          }, function _callee5(err, order) {
            var servicesid, _i3, newOrder, userOrderList, update;

            return regeneratorRuntime.async(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    if (!err) {
                      _context5.next = 4;
                      break;
                    }

                    console.log(err);
                    _context5.next = 16;
                    break;

                  case 4:
                    // saving order
                    servicesid = [];

                    for (_i3 = 0; _i3 < req.body.Service.length; _i3++) {
                      servicesid.push({
                        Services: req.body.Service[_i3]
                      });
                    }

                    newOrder = new Orders({
                      User: req.params.id,
                      Service: servicesid,
                      RazorpayOrder_id: order.id,
                      total_amount: total * 100,
                      Scheduled_date: req.body.Scheduled_date
                    });
                    _context5.next = 9;
                    return regeneratorRuntime.awrap(newOrder.save());

                  case 9:
                    newOrder = _context5.sent;
                    userOrderList = [];

                    if (user.Orders.length == 0) {
                      userOrderList[0] = newOrder._id;
                    } else {
                      userOrderList = user.Orders;
                      userOrderList[user.Orders.length] = newOrder._id;
                    }

                    _context5.next = 14;
                    return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.params.id, {
                      Orders: userOrderList
                    }, {
                      "new": true
                    }).select('-password'));

                  case 14:
                    update = _context5.sent;

                    if (!update) {
                      res.send({
                        message: "Unable to add to User Order list",
                        status: false
                      });
                    } else {
                      res.status(200).send({
                        "User": update,
                        "Order": order
                      });
                    }

                  case 16:
                  case "end":
                    return _context5.stop();
                }
              }
            });
          });

        case 26:
        case "end":
          return _context6.stop();
      }
    }
  });
});
router.post('/is-order-complete', uploadOptions.single('razorpay_payment_id'), function _callee9(req, res) {
  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          try {
            instance.payments.fetch(req.body.razorpay_payment_id).then(function _callee8(check) {
              return regeneratorRuntime.async(function _callee8$(_context8) {
                while (1) {
                  switch (_context8.prev = _context8.next) {
                    case 0:
                      _context8.next = 2;
                      return regeneratorRuntime.awrap(Orders.find({
                        RazorpayOrder_id: check.order_id
                      }));

                    case 2:
                      findOrder = _context8.sent;
                      _context8.next = 5;
                      return regeneratorRuntime.awrap(Orders.findByIdAndUpdate(findOrder[0]._id, {
                        isPaid: true
                      }, {
                        "new": true
                      }).populate("User").populate({
                        path: 'Service',
                        populate: 'Services'
                      }));

                    case 5:
                      updateOrder = _context8.sent;
                      _context8.next = 8;
                      return regeneratorRuntime.awrap(User.findByIdAndUpdate(updateOrder.User._id, {
                        Loyality_points: Math.floor(updateOrder.total_amount / 10000 + updateOrder.User.Loyality_points)
                      }, {
                        "new": true
                      }));

                    case 8:
                      updateUser = _context8.sent;

                      try {
                        res.writeHead(200, {
                          "Content-type": 'text/html'
                        });
                        fs.readFile('./recipt.html', null, function _callee7(err, data) {
                          var products, i, date, ordersno, Invoicedata;
                          return regeneratorRuntime.async(function _callee7$(_context7) {
                            while (1) {
                              switch (_context7.prev = _context7.next) {
                                case 0:
                                  if (err) {
                                    console.log(err);
                                    res.write("Order Has Been Placed");
                                  } else {
                                    res.write(data);
                                  }

                                  products = [];
                                  htmlString = '';

                                  for (i = 0; i < updateOrder.Service.length; i++) {
                                    products.push({
                                      "description": updateOrder.Service[i].Services.Service_name,
                                      "price": updateOrder.Service[i].Services.Service_rate,
                                      "tax-rate": 0,
                                      "quantity": 1
                                    });
                                    htmlString += "<li>".concat(updateOrder.Service[i].Services.Service_name, " <br> price = ").concat(updateOrder.Service[i].Services.Service_rate, "</li>");
                                  }

                                  date = new Date();
                                  _context7.next = 7;
                                  return regeneratorRuntime.awrap(Orders.collection.countDocuments());

                                case 7:
                                  ordersno = _context7.sent;
                                  Invoicedata = {
                                    "images": {
                                      // The logo on top of your invoice
                                      "logo": "https://public.easyinvoice.cloud/img/logo_en_original.png",
                                      // The invoice background
                                      "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
                                    },
                                    "sender": {
                                      "company": "UandI",
                                      "address": "Sample Street 123",
                                      // ask
                                      "zip": "1234 AB",
                                      "city": "Lucknow",
                                      "country": "India" //"custom1": "custom value 1",

                                    },
                                    // Your recipient
                                    "client": {
                                      "company": updateOrder.User.Name,
                                      "Email": updateOrder.User.Email // "zip": "4567 CD",
                                      // "city": "Clientcity",
                                      // "country": "Clientcountry"
                                      // "custom1": "custom value 1",

                                    },
                                    "information": {
                                      // Invoice number
                                      "number": ordersno,
                                      "date": "".concat(date.getDate(), "/").concat(date.getMonth(), "/").concat(date.getFullYear()),
                                      "due-date": "N/A"
                                    },
                                    "products": products,
                                    "bottom-notice": "Payment is done",
                                    "settings": {
                                      "currency": "INR"
                                    }
                                  };
                                  easyinvoice.createInvoice(Invoicedata, function (result) {
                                    // console.log('PDF base64 string:-----------------------> ', result.pdf);
                                    AdmintextmsgHTML = "\n                        <h1>New Order Has been added<h1>\n                        <p>the User Details are <p>\n                        <ul>\n                            <li> Name : ".concat(updateOrder.User.Name, "</li>\n                            <li> Email: ").concat(updateOrder.User.Email, "</li>\n                            <li> Phone Number : ").concat(updateOrder.User.Phone_no, "</li>\n                        </ul>\n\n                        <h2>Ordered Services</h2>\n                        ").concat(htmlString, "\n                        <br>\n                        total amount = ").concat((findOrder[0].total_amount / 100).toString(), "\n                        <br>\n                        Mode of Payment : Online.\n                        <br>\n                        Scheduled on ").concat(updateOrder.Scheduled_date, "\n                        ");
                                    ClienttextmsgHTML = "\n                        <h1>Thankyou for shopping with us here is your recipt</h1>\n                        ";
                                    sendMail(process.env.AdminId, "New Order", AdmintextmsgHTML, result.pdf);
                                    sendMail(updateOrder.User.Email, "New Order", ClienttextmsgHTML, result.pdf);
                                    res.end();
                                  })["catch"](function (err) {
                                    console.log(err);
                                  });

                                case 10:
                                case "end":
                                  return _context7.stop();
                              }
                            }
                          });
                        });
                      } catch (err) {
                        console.log(err);
                      }

                    case 10:
                    case "end":
                      return _context8.stop();
                  }
                }
              });
            });
          } catch (err) {
            res.send({
              "msg": false,
              guide: "Please contact us if your payments is debited"
            });
          }

        case 1:
        case "end":
          return _context9.stop();
      }
    }
  });
});
router.post('/cancel-order/:id', function _callee10(req, res) {
  var findOrder, html, index, textmsg, textmsgAdmin;
  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.next = 2;
          return regeneratorRuntime.awrap(Orders.findByIdAndUpdate(req.params.id, {
            Order_Status: 'Cancel'
          }, {
            "new": true
          }).populate("User").populate({
            path: 'Service',
            populate: 'Services'
          }));

        case 2:
          findOrder = _context10.sent;
          _context10.next = 5;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(findOrder.User._id, {
            Loyality_points: Math.floor(findOrder.User.Loyality_points - findOrder.total_amount / 10000)
          }, {
            "new": true
          }));

        case 5:
          updateUser = _context10.sent;

          if (!findOrder) {
            res.send({
              message: 'Order is unable to cancel',
              success: false
            });
          } else {
            html = '';

            for (index = 0; index < findOrder.Service.length; index++) {
              html += "<li>".concat(findOrder.Service[index].Services.Service_name, "</li>");
            }

            textmsg = "<h1>Your Order is been canceled successfully if you have any query please contact us</h1>";
            textmsgAdmin = "\n        <h2>".concat(findOrder.User.Name, " has canceled its order that was been placed on ").concat(findOrder.date, "</h2>\n        <h4>Service Details:</h4>\n        <p>\n        <ul>").concat(html, "<ul>\n        <p>\n        Reason:\n        ").concat(req.body.reason, "\n        <br>\n        Payment Status:\n        ").concat(findOrder.isPaid, "\n        ");
            sendMail(findOrder.User.Email, "Order is been Canceled", textmsg);
            sendMail(process.env.AdminId, "Order is been Canceled", textmsgAdmin);
            res.send({
              message: 'Order is canceled',
              success: true
            });
          }

        case 7:
        case "end":
          return _context10.stop();
      }
    }
  });
});
router.get('/order-feedBack/:id', function _callee11(req, res) {
  return regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          res.writeHead(200, {
            "Content-type": 'text/html'
          });
          fs.readFile('./feedback.html', null, function (err, data) {
            if (err) {
              console.log(err);
              res.write("Order Has Been Placed");
            } else {
              res.write(data);
            }

            res.send();
          });

        case 2:
        case "end":
          return _context11.stop();
      }
    }
  });
});
router.get('/order-not-completed', function _callee13(req, res) {
  var faultyOrders, data;
  return regeneratorRuntime.async(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          _context13.next = 2;
          return regeneratorRuntime.awrap(Orders.find({
            isPaid: false
          }));

        case 2:
          faultyOrders = _context13.sent;
          data = faultyOrders.filter(function (item) {
            if (item.RazorpayOrder_id) {
              return item;
            }
          });
          data.map(function _callee12(item) {
            return regeneratorRuntime.async(function _callee12$(_context12) {
              while (1) {
                switch (_context12.prev = _context12.next) {
                  case 0:
                    _context12.next = 2;
                    return regeneratorRuntime.awrap(Orders.findByIdAndRemove(item._id));

                  case 2:
                  case "end":
                    return _context12.stop();
                }
              }
            });
          });
          res.send('Faulty Order deleted');

        case 6:
        case "end":
          return _context13.stop();
      }
    }
  });
});
router.post('/assign-Task/:id', function _callee14(req, res) {
  var upserviceman, assignedOrders, Order, services, itemtoupdate, i, AssignedOrder, htmltext;
  return regeneratorRuntime.async(function _callee14$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          _context14.next = 2;
          return regeneratorRuntime.awrap(serviceMan.findById(req.body.ServiceManId));

        case 2:
          upserviceman = _context14.sent;

          if (upserviceman) {
            _context14.next = 8;
            break;
          }

          res.send({
            message: "Unable to find serviceMan",
            status: false
          });
          return _context14.abrupt("return");

        case 8:
          assignedOrders = upserviceman.Assigned_order;
          assignedOrders.push(req.params.id);
          _context14.next = 12;
          return regeneratorRuntime.awrap(serviceMan.findByIdAndUpdate(req.body.ServiceManId, {
            Assigned_order: assignedOrders
          }, {
            "new": true
          }));

        case 12:
          _context14.next = 14;
          return regeneratorRuntime.awrap(Orders.findById(req.params.id).populate('User').populate({
            path: 'Service',
            populate: 'Services'
          }));

        case 14:
          Order = _context14.sent;
          services = Order.Service;
          itemtoupdate = {};

          for (i = 0; i < services.length; i++) {
            if (services[i]._id == req.body.ServiceId) {
              itemtoupdate = services[i];
              itemtoupdate['isAssignedTo'] = req.body.ServiceManId;
              services[i] = itemtoupdate;
            }
          }

          _context14.next = 20;
          return regeneratorRuntime.awrap(Orders.findByIdAndUpdate(req.params.id, {
            Service: services
          }, {
            "new": true
          }).populate({
            path: 'Service',
            populate: 'isAssignedTo'
          }));

        case 20:
          AssignedOrder = _context14.sent;
          htmltext = "\n    <h2>You Have been assigned an order Please read the details and after completion click the following button<h2>\n    <p>\n    <br>Customer Name: ".concat(Order.User.Name, "<br>\n    <br>Customer Phone_no: ").concat(Order.User.Phone_no, "<br>\n    <br>Customer Scheduled Date: ").concat(Order.Scheduled_date, "<br>\n    <br>Service Details<br>\n    Name : ").concat(itemtoupdate.Services.Service_name, "<br>\n    Rate : ").concat(itemtoupdate.Services.Service_rate, "<br>\n    <p>\n    \n    After completion click on the link <br>\n    \"http://localhost:3000/api/Order/set-OrderStatus-true/").concat(AssignedOrder._id, "/").concat(req.body.ServiceManId, "\"\n    ");
          sendMail(upserviceman.Email, 'New Order', htmltext);
          res.send(AssignedOrder);

        case 24:
        case "end":
          return _context14.stop();
      }
    }
  });
});
router.get('/set-OrderStatus-true/:id/:servimanId', function _callee15(req, res) {
  var Order, services, itemtoupdate, i, AssignedOrder;
  return regeneratorRuntime.async(function _callee15$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          _context15.next = 2;
          return regeneratorRuntime.awrap(Orders.findById(req.params.id).populate({
            path: 'Service',
            populate: 'Services'
          }));

        case 2:
          Order = _context15.sent;
          services = Order.Service;
          itemtoupdate = {};

          for (i = 0; i < services.length; i++) {
            if (services[i].isAssignedTo == req.params.servimanId) {
              itemtoupdate = services[i];
              itemtoupdate['iscompleted'] = true;
              services[i] = itemtoupdate;
            }
          }

          _context15.next = 8;
          return regeneratorRuntime.awrap(Orders.findByIdAndUpdate(req.params.id, {
            Service: services
          }, {
            "new": true
          }));

        case 8:
          AssignedOrder = _context15.sent;

          if (!AssignedOrder) {
            res.send({
              message: "Data not updated",
              success: false
            });
          } else {
            res.writeHead(200, {
              "Content-type": 'text/html'
            });
            fs.readFile('./orderStatus.html', null, function (err, data) {
              if (err) {
                console.log(err);
                res.write("Order Is Been completed!");
              } else {
                res.write(data);
              }

              res.send();
            });
          }

        case 10:
        case "end":
          return _context15.stop();
      }
    }
  });
});
router.put('/reschedule-Date/:id', function _callee16(req, res) {
  var data, _date2;

  return regeneratorRuntime.async(function _callee16$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          _context16.next = 2;
          return regeneratorRuntime.awrap(Orders.findByIdAndUpdate(req.params.id, {
            Scheduled_date: req.body.Scheduled_date
          }, {
            "new": true
          }).populate('User'));

        case 2:
          data = _context16.sent;

          if (data) {
            _date2 = new Date(data.Scheduled_date);
            sendMail(data.User.Email, "UandI : Your order has been Rescheduled", "<h1>New date is " + _date2.getDate() + "/" + _date2.getMonth() + "/" + _date2.getFullYear() + "</h1><h5>for any query please contact</h5>");
            sendMail(process.env.AdminId, "UandI :An order of ".concat(data.User.Name, " has been Rescheduled"), "<h1>New Date is " + _date2.getDate() + "/" + _date2.getMonth() + "/" + _date2.getFullYear() + "</h1>");
            res.send({
              data: data,
              status: true
            });
          } else {
            res.send({
              status: false
            });
          }

        case 4:
        case "end":
          return _context16.stop();
      }
    }
  });
});
router.put('/reschedule-Date-admin/:id', function _callee17(req, res) {
  var data;
  return regeneratorRuntime.async(function _callee17$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          _context17.next = 2;
          return regeneratorRuntime.awrap(Orders.findByIdAndUpdate(req.params.id, {
            Scheduled_date: req.body.Scheduled_date
          }, {
            "new": true
          }));

        case 2:
          data = _context17.sent;

          if (data) {
            sendMail(data.User.Email, "UandI : Your order has been Rescheduled", "<h1>New date is " + date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + "</h1><h5>for any query please contact</h5>");
            sendMail(process.env.AdminId, "UandI :An order of ".concat(data.User.Name, " has been Rescheduled"), "<h1>New Date is " + date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + "</h1>");
            res.send({
              data: data,
              status: true
            });
          } else {
            res.send({
              status: false
            });
          }

        case 4:
        case "end":
          return _context17.stop();
      }
    }
  });
});
module.exports = router;