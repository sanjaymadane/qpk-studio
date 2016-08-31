'use strict';

/*
 * Contact groups router
 */

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose'),
    _ = require('lodash');      

// Load helpers
var common = require('../../helpers/common_helper');

// Route middleware to validate :id
router.route('/')
  // GET - groups of given contact
  .get(function(req, res, next) {
     // Select only required fields if passed
    var fields = common.filter_fields(req.query.fields);
    // Set page limit
    var limit = req.query.limit? req.query.limit : 50;
    // Set skip count
    var page = Math.max(0, req.query.page || 0);
    // Create find criteria
    var params = { user_id: req.user_auth.user_id };

    params.contact_id = req.params.contact_id;
    
    mongoose.model('GroupContact').find(params, function (err, groups) {
      if (err) {
        res.json(common.pretty(false, 10000, err));
      } else {
        var group_ids = _.map(groups, function(group){ return group.group_id});
        mongoose.model('Group').count({'_id': {"$in": group_ids}}, function(err, count){
        if (err) {
          res.json(common.pretty(false, 10000, err));
        } else {
          if(count > 0){
            mongoose.model('Group').find({'_id': {"$in": group_ids}}, fields, function(err, groups){
              if (err) {
                res.json(common.pretty(false, 10000, err));
              } else {
                res.json(common.pretty(true, 10001, {total:count, data: groups, page: page, current_count: groups.length}));
              } 
            })
            .limit(limit)
            .skip(page*limit);
          } else {
            res.json(common.pretty(true, 10001, {total:0, data: [], page: page, current_count: 0}));
          }
        }
      });      
      }     
    });
  });
module.exports = router;