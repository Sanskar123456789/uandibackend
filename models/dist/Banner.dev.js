"use strict";

var mongoose = require('mongoose');

var BannerSchema = mongoose.Schema({
  Banner_image: {
    type: String
  },
  Banner_title: {
    type: String,
    required: true
  },
  Services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  Cloud_id: {
    type: String
  }
});
exports.Banner = mongoose.model('Banner', BannerSchema);