'use strict';

/*
 * Activity log router
 */

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose');

// Load helpers
var common = require('../../helpers/common_helper');

router.route('/')
  // GET - get logs
  .get(function(req, res, next) {
    
    // Set page limit
    var limit = parseInt(req.query.limit? req.query.limit : 50);
    // Set skip count
    var page = Math.max(0, req.query.page || 0);
    // Create find criteria
    var params = { user_id: req.user_auth.user_id };
    if(req.query.type)
      params.type = req.query.type;
    params.is_active = true;
    if(typeof req.query.read !== 'undefined')
      params.read = req.query.read;
    mongoose.model('ActivityLog').count(params, function(err, count){
      if (err) {
        res.json(common.pretty(false, 10000, err));
      } else {
        if(count > 0){
          mongoose.model('ActivityLog').find(params, {},{limit:limit,skip:page*limit,sort:{logged_on:-1}},function (err, logs) {
            if (err) {
              res.json(common.pretty(false, 10000, err));
            } else {
              res.json(common.pretty(true, 10001, {total:count, data: logs, page: page, current_count: logs.length}));
            }     
          });
        } else {
          res.json(common.pretty(true, 10001, {total:0, data: [], page: page, current_count: 0}));
        }
      }
    });    
  })
  .post(function(req, res, next){
    if(req.body.action && (req.body.log_ids || req.body.apply_all)){
      var params = {
        user_id: req.user_auth.user_id
      };
      if(req.body.log_ids && req.body.log_ids.length > 0){
        params._id = {$in:req.body.log_ids};
      }
      var update_obj = {};
      switch(req.body.action){
        case "read":
          update_obj.read = true;
          break;
        case "unread":
          update_obj.read = false;
          break;
        case "delete":
          update_obj.is_active = false;
          break;
        default:
          res.json(common.pretty(false, 10000, "Invalid action param"));  
      }
      mongoose.model('ActivityLog').update(params, {$set: update_obj}, { multi: true }, function(err, updated){
        if(err) {
          res.json(common.pretty(false, 10000, "No match found"));
        } else {
          res.json(common.pretty(true, 10001, ""));
        }            
      });
    } else{
      res.json(common.pretty(false, 10000, "Invalid params"));
    }
  });

module.exports = router;