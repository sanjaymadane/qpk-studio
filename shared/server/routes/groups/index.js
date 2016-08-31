'use strict';

/*
 * Groups router
 */

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose'),
    _ = require('underscore');
// Load helpers
var common = require('../../helpers/common_helper');

var constant = require('../../config/constant');

router.route('/')
  // GET - get all groups
  .get(function(req, res, next) {
    // Select only required fields if passed
    var fields = common.filter_fields(req.query.fields, []);
    // Set page limit
    var limit = parseInt(req.query.limit? req.query.limit : 50);
    // Set skip count
    var page = Math.max(0, req.query.page || 0);
    // Create find criteria
    var params = { user_id: req.user_auth.user_id };

    var queryParams = { user_id: req.user_auth.user_id };

    var promises = [];
    if(req.query.full){
      
      // get all contacts count
      queryParams.is_active = 'true';
      queryParams.is_locked = 'false';
      var allContactsPromise = new Promise(function(resolve, reject){
        mongoose.model('Contact').count(queryParams, function(err, count){
          if(err && !count)
            resolve(false);
          else
            resolve({name: 'ALL_CONTACTS', contacts_count: count});
        });
      });
      promises.push(allContactsPromise);

      // get frequently used contacts count
      queryParams.usage = { $gt: 0 };
      var freqUsedContacts = new Promise(function(resolve, reject){
        mongoose.model('Contact').count(queryParams, function(err, count){        
          if(err && !count)
            resolve(false);
          else
            resolve({name: 'FREQUENTLY_USED', contacts_count: count});          
        });
      });
      promises.push(freqUsedContacts);

      // get favorites contacts count
      delete queryParams.usage;
      queryParams.is_favorite = 'true';
      var favoriteContacts = new Promise(function(resolve, reject){
        mongoose.model('Contact').count(queryParams, function(err, count){        
          if(err && !count)
            resolve(false);
          else
            resolve({name: 'FAVORITES', contacts_count: count});
        });
      });
      promises.push(favoriteContacts);

      // get private contacts count
      delete queryParams.is_favorite;
      queryParams.is_locked = 'true';
      var privateContacts = new Promise(function(resolve, reject){
        mongoose.model('Contact').count(queryParams, function(err, count){        
          if(err && !count)
            resolve(false);
          else
            resolve({name: 'PRIVATE', contacts_count: count});
        });
      });
      promises.push(privateContacts);

      // get trash contacts count
      queryParams.is_locked = 'false';
      queryParams.is_active = 'false';
      var trashContacts = new Promise(function(resolve, reject){
        mongoose.model('Contact').count(queryParams, function(err, count){        
          if(err && !count)
            resolve(false);
          else
            resolve({name: 'TRASH', contacts_count: count});
        });
      });
      promises.push(trashContacts);
    } 
    mongoose.model('Group').count(params, function(err, count){
      if (err) {
        res.json(common.pretty(false, 10000, err));
      } else {
        Promise.all(promises).then(function(values){
          var promise = new Promise(function(resolve, reject){
            if(count > 0){
              mongoose.model('Group').find(params, fields, function (err, groups) {
                if (err) {
                  resolve({});
                } else {
                  mongoose.model('GroupContact').aggregate([
                    {
                      $match: {
                        user_id: req.user_auth.user_id 
                      }
                    },
                    { 
                      $group: {
                        _id: '$group_id', 
                        count: {$sum: 1}
                      }
                    },        
                  ],function(err,group_counts){
                    var res_groups = [];
                    groups.forEach(function(grp, index){
                      var res_group = JSON.parse(JSON.stringify(grp));
                      res_group.contacts_count = 0;
                      if(group_counts && group_counts.length > 0){
                        var found = _.find(group_counts, function(grpc){
                          return grpc._id == grp._id;
                        });
                        if(typeof found != 'undefined'){
                          res_group.contacts_count = found.count;                    
                        }
                      }
                      res_groups.push(res_group);
                    });
                    resolve({total:count, data: res_groups, page: page, current_count: res_groups.length});
                  });              
                }     
              }).limit(limit)
                .skip(page*limit);
            } else {
              resolve({total:0, data: [], page: page, current_count: 0});
            }
          });
          promise.then(function(value){
            if(values.length > 0)
              value.system_groups = values;
            res.json(common.pretty(true, 10001, value));
          });
        });
      }
    });
  })
  //POST - create new group
  .post(function(req, res) {
    req.body.user_id = req.user_auth.user_id;
    mongoose.model('Group').findOne({name: req.body.name, user_id:req.user_auth.user_id}, function (err, group) {
      if (err) {
        res.json(common.pretty(false, 10000, err));
      } else {
        if(!group){
          mongoose.model('Group').create(req.body, function (err, group) {
            if (err) {
              res.json(common.pretty(false, 10000, err));
            } else {
              res.json(common.pretty(true, 10001, group._id));
            }
          }); 
        } else{ 
          res.json(common.pretty(false, constant.ERROR_GROUP_ALREADY_EXISTS, 'Group name already exists'));
        }
      } 
    });
    
  });

// Route middleware to validate :id
router.param('id', function(req, res, next, id) {
  mongoose.model('Group').findById(id, function (err, group) {
    if (err) {
      res.json(common.pretty(false, 10000, err));
    } else {
      req.id = id;
      next(); 
    } 
  });
});

router.route('/:id')
  // GET - group by id
  .get(function(req, res) {
    // Select only required fields if passed
    var fields = common.filter_fields(req.query.fields,[]);
    mongoose.model('Group').findById(req.id, fields, function (err, group) {
      if (err || !group) {
        res.json(common.pretty(false, 10000, err));
      } else {
        res.json(common.pretty(true, 10001, group));
      }
    });
  })
  //PUT - update a group by ID
  .put(function(req, res) {
    mongoose.model('Group').findOne({name: req.body.name,user_id:req.user_auth.user_id}, function (err, group) {
      if (err) {
        res.json(common.pretty(false, 10000, err));
      } else {
        if(!group){
          mongoose.model('Group').findByIdAndUpdate(req.id, {$set: req.body },function (err, group) {
            if (err) {
              res.json(common.pretty(false, 10000, err));
            } else {
              if(req.body.is_active == 'false' || req.body.is_active == false){
                mongoose.model('GroupContact').remove({group_id: group._id}, function(err, gc){
                  res.json(common.pretty(true, 10001, ''));
                });  
              } else {
                res.json(common.pretty(true, 10001, ''));
              }
            }
          });
        } else {
          res.json(common.pretty(false, constant.ERROR_GROUP_ALREADY_EXISTS, 'Group name already exists'));
        }
      }
    });
  })
  //DELETE - soft delete group by ID
  .delete(function (req, res){
    mongoose.model('Group').findById(req.id, function (err, group) {
      if (err || !group) {
        res.json(common.pretty(false, 10000, err));
      } else {
        group.remove(function (err, group) {
          if (err) {
            res.json(common.pretty(false, 10000, err));
          } else {
            mongoose.model('GroupContact').remove({group_id: group._id}, function(err, gc){
              res.json(common.pretty(true, 10001, group._id));
            });                                  
          }
        });
      }
    });
  });

router.route('/batch_delete')
  // POST - Batch delete groups permanant
  .post(function(req, res, next) {    
    if(req.body.group_ids && req.body.group_ids.length > 0){
      mongoose.model('GroupContact').remove({group_id: {$in: req.body.group_ids}}, function(err, ress){});
      mongoose.model('Group').remove({_id: {$in: req.body.group_ids}}, function(err, data){
        res.json(common.pretty(true, 10001, '')); 
      });
    } else{
      res.json(common.pretty(false, 10000, ''));
    }
  });

module.exports = router;