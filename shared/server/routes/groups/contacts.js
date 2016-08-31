'use strict';

/*
 * Groups contacts router
 */

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose'),
    _ = require('lodash');

// Load helpers
var common = require('../../helpers/common_helper');    

router.route('/')
  // GET - get all groups
  .get(function(req, res, next) {
    // Select only required fields if passed
    var fields = common.filter_fields(req.query.fields,[]);
    // Set page limit
    var limit = parseInt(req.query.limit? req.query.limit : 50);
    // Set skip count
    var page = Math.max(0, req.query.page || 0);
    // Create find criteria
    var params = { user_id: req.user_auth.user_id };
    
    params.group_id = req.params.group_id;

    mongoose.model('GroupContact').find(params, function (err, contacts) {
      if (err) {
        res.json(common.pretty(false, 10000, err));
      } else {
        var contact_ids = _.map(contacts, function(contact){ return contact.contact_id});
        mongoose.model('Contact').count({is_active: true, '_id': {"$in": contact_ids}}, function(err, count){
        if (err) {
          res.json(common.pretty(false, 10000, err));
        } else {
          if(count > 0){
            mongoose.model('Contact').find({is_active: true, '_id': {"$in": contact_ids}}, fields, function(err, contacts){
              if (err) {
                res.json(common.pretty(false, 10000, err));
              } else {
                res.json(common.pretty(true, 10001, {total:count, data: contacts, page: page, current_count: contacts.length}));
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