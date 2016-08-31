'use strict';

/*
 * Auth router
 */

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    moment = require('moment'),
    _ = require('underscore');

// Load configuration
var config = require('../../config/config');

// Load helper methods
var common = require('../../helpers/common_helper');

// Load auth
var nas_auth = require('../../auth/nas_auth');

router.route('/')
  .get(function(req, res, next) {
    var app_name = req.query.app_name;
    var conf_name = req.query.conf_name || 'Enable';
    if(!app_name){
      res.json(common.pretty(false, 10027, app_name + ' not provided')); 
      return;
    }

    nas_auth.getQPKGConfig(app_name, conf_name, function(err, value){
      if(value && value)
        res.json(common.pretty(true, 10001, {value: value}));
      else
        res.json(common.pretty(false, 10027, app_name + ' not installed on this NAS')); 
    });
  });
module.exports = router;