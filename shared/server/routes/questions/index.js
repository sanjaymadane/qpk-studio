'use strict';

/*
 *Question list router
 */

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose');

// Load helpers
var common = require('../../helpers/common_helper');


router.route('/')
  //GET -List of all the common questions
  .get(function(req, res, next) {
    // Create find criteria
    var params = { 
      is_active: req.body.is_active || true 
    };    
    mongoose.model('Questions').find(params, function (err, questions) {
      if (err) {
        res.json(common.pretty(false, 10000, err));
      } else {
        res.json(common.pretty(true, 10001, questions));
      }     
    });
  });

module.exports = router;