'use strict';

/*
 * User router
 */

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose');

// Load helpers    
var common = require('../../helpers/common_helper');

router.route('/')
  //GET - get all users
  .get(function(req, res, next) { 
    // Only admin can perform this actions
    if(req.user_auth && req.user_auth.username == 'admin'){      
      // Select only required fields if passed
      var fields = common.filter_fields(req.query.fields, ['password','security_answer','security_question','high_security_password']);
      // Set page limit
      var limit = parseInt(req.query.limit? req.query.limit : 50);
      // Set skip count
      var page = Math.max(0, req.query.page || 0);
      // Create find criteria
      var params = { is_active : true };     

      mongoose.model('User').count(params, function(err, count){
        if (err) {
          res.json(common.pretty(false, 10000, err));
        } else {
          if(count > 0){
            mongoose.model('User').find(params, fields, function (err, users) {
              if (err) {
                res.json(common.pretty(false, 10000, err));
              } else {
                var pages = Math.ceil(count/limit);
                res.json(common.pretty(true, 10001, {total:count, data: users, page: page, current_count: users.length, pages: pages}));
              }     
            }).limit(limit)
              .skip(page*limit);
          } else {
            res.json(common.pretty(true, 10001, {total:0, data: [], page: page, current_count: 0}));
          }
        }
      });
    } else {
      res.json(common.pretty(false, 10004, ""));
    }
  })

  //POST - create new user
  .post(function(req, res) {
      if(!req.body.username){
        res.json(common.pretty(false, 10000, 'username must be required'));
      } else {
        var params = {
          username: req.body.username,
          is_active: true
        }
        mongoose.model('User').find(params, function (err, users) {
          if(users && users.length > 0){
            res.json(common.pretty(false, 10000, 'username already exists.'));
          } else{
            req.body.user_id = req.user_auth.user_id;
            mongoose.model('User').create(req.body, function (err, user) {
              if (err || !user) {
                res.json(common.pretty(false, 10000, err));
              } else {
                var arrGroups = [];
                arrGroups.push({
                  user_id: user._id.toString(),
                  is_active: true,
                  name: 'Family',
                  created_on: new Date(),
                  updated_on: new Date()
                });
                arrGroups.push({
                  user_id: user._id.toString(),
                  is_active: true,
                  name: 'Friends',
                  created_on: new Date(),
                  updated_on: new Date()
                });
                arrGroups.push({
                  user_id: user._id.toString(),
                  is_active: true,
                  name: 'Official',
                  created_on: new Date(),
                  updated_on: new Date()
                });
                mongoose.model('Group').collection.insert(arrGroups, function(err, data){
                  res.json(common.pretty(true, 10001, user._id));
                });          
              }
            });        
          }
        });
      }
  });

router.route('/reset_password')
  //POST - reset user password
  .post(function(req, res, next) { 
    // Only admin can perform this actions
    mongoose.model('User').findById(req.user_auth.user_id, function (err, user) {
      if (err || !user) {
        res.json(common.pretty(false, 10000, ''));
      } else {
        if(user.is_nas_user){
          res.json(common.pretty(false, 10000, 'User should not be NAS user.'));
        } else if(req.body.password && req.body.old_password && user.password == req.body.old_password){
          user.password = req.body.password;
          mongoose.model('User').findByIdAndUpdate(user._id, {$set: user}, function (err, user) {          
            if (err || !user) {        
              res.json(common.pretty(false, 10000, err));
            } else {
              res.json(common.pretty(true, 10001, ''));   
            }
          });
        } else
          res.json(common.pretty(false, 10000, 'Old password not match'));
      } 
    });
  });

router.route('/secure_auth')
  // POST - Set high security question and password
  .post(function(req, res, next) {
    if(!req.body.answer || !req.body.question){
      res.json(common.pretty(false, 10008, ""));
    } else {
      mongoose.model('User').findById(req.user_auth.user_id, function (err, user) {          
        if (err || !user) {        
          res.json(common.pretty(false, 10000, err));
        } else {
          if(user.security_question && user.security_question == req.body.security_question){
            res.json(common.pretty(true, 10001, user));
          } else {
            var secure_auth_obj = {
              security_question: req.body.question,
              security_answer: req.body.answer
            }
            user.update(secure_auth_obj, function (err, user) {
              if (err) {
                res.json(common.pretty(false, 10000, err));
              } else {
                res.json(common.pretty(true, 10001, user));   
              }
            });
          }          
        }
      });      
    }
  });

router.route('/batch_delete')
  // POST - Batch delete groups permanant
  .post(function(req, res, next) {    
    if(req.body.user_ids && req.body.user_ids.length > 0){
      var boolIsValidationSuccess = true, errorCode = 10000;
      var promiseFindUser = new Promise(function(resolve, reject){
          mongoose.model('User').find({_id: {$in: req.body.user_ids}}, function(err, data){
          if(err) {
            reject(err);
          } else {
            if(data && data.length > 0) {
              data.forEach(function(user){
                if(user.username.toLowerCase() == 'admin' && user.is_nas_user == true) {
                  boolIsValidationSuccess = false;
                  errorCode = 10012;
                }
              })
            } else {
              boolIsValidationSuccess = false;            
            }
            resolve(boolIsValidationSuccess);
          }
        })
      });
      
      promiseFindUser.then(function(resolve){
        if(boolIsValidationSuccess) {
          mongoose.model('GroupContact').remove({user_id: {$in: req.body.user_ids}}, function(err, ress){});
          mongoose.model('Group').remove({user_id: {$in: req.body.user_ids}}, function(err, data){});
          mongoose.model('Contact').remove({user_id: {$in: req.body.user_ids}}, function(err, data){});
          mongoose.model('ActivityLog').remove({user_id: {$in: req.body.user_ids}}, function(err, data){});
          mongoose.model('Task').remove({user_id: {$in: req.body.user_ids}}, function(err, data){});
          mongoose.model('MergeHistory').remove({user_id: {$in: req.body.user_ids}}, function(err, data){});
          mongoose.model('User').remove({_id: {$in: req.body.user_ids}}, function(err, data){
            res.json(common.pretty(true, 10001, '')); 
          });
        } else {
          res.json(common.pretty(boolIsValidationSuccess, errorCode, ''));
        }
      }).catch(function(reject){
        res.json(common.pretty(false, 10000, reject));
      })
      
      
    } else{
      res.json(common.pretty(false, 10000, ''));
    }
  });  

router.route('/config')
  //GET - get user related config
  .get(function(req, res, next) { 
    mongoose.model('UserSetting').findOne({user_id:req.user_auth.user_id}, function (err, userSettings) {
      if (err || !userSettings) {
        res.json(common.pretty(false, 10000, 'No user settings saved yet.'));
      } else {
        res.json(common.pretty(true, 10001, userSettings));
      } 
    });
  })

  .post(function(req, res, next) { 
    
    mongoose.model('UserSetting').findOne({user_id: req.user_auth.user_id }, function (err, userSettings) {
      if (err) {
        res.json(common.pretty(false, 10000, ''));
      } else {
        userSettings = userSettings || {};
        userSettings.user_id = req.user_auth.user_id;
        userSettings.language = req.body.language || 'en-US';
        userSettings.grid_column_selected = req.body.grid_column_selected || [];
        userSettings.tutorial_displayed = req.body.tutorial_displayed || false;
        userSettings.grid_config = req.body.grid_config || {};
        if(userSettings && userSettings._id){
          mongoose.model('UserSetting').findByIdAndUpdate(userSettings._id, {$set: userSettings}, function (err, user) {          
            if (err || !user) {        
              res.json(common.pretty(false, 10000, err));
            } else {
              res.json(common.pretty(true, 10001, 'Settings updated successfully.'));   
            }
          });
        } else {
          mongoose.model('UserSetting').create(userSettings, function (err, user) {          
            if (err || !user) {        
              res.json(common.pretty(false, 10000, err));
            } else {
              res.json(common.pretty(true, 10001, 'Settings updated successfully.'));   
            }
          });
        } 
      } 
    });
  });

// Route middleware to validate :id
router.param('id', function(req, res, next, id) {
  if(id != 'me'){
    if(req.user_auth.username != 'admin'){
      res.json(common.pretty(false, 10004, ""));
    } else {
      mongoose.model('User').findById(id, function (err, user) {
        if (err || !user) {
          res.json(common.pretty(false, 10000, err));
        } else {
          req.id = id;
          next(); 
        } 
      });
    }
  } else {
    req.id = id;
    next();
  }
});

router.route('/:id')
  // GET - user by id
  .get(function(req, res) {
    var userId = req.id == 'me' ? req.user_auth.user_id : req.id;
    // Select only required fields if passed
    var fields = common.filter_fields(req.query.fields, ['password','security_answer']);
    mongoose.model('User').findById(userId, fields, function (err, user) {
      if (err || !user) {        
        res.json(common.pretty(false, 10000, err));
      } else {
        res.json(common.pretty(true, 10001, user));
      }
    });
  })
  //PUT - update a user by ID
  .put(function(req, res) {
    var userId = req.id == 'me' ? req.user_auth.user_id : req.id;
    delete req.body.username;
    mongoose.model('User').findByIdAndUpdate(userId, {$set: req.body}, function (err, user) {          
      if (err || !user) {        
        res.json(common.pretty(false, 10000, err));
      } else {
        if(req.body.is_active == false){
          mongoose.model('GroupContact').remove({user_id: user._id});
          mongoose.model('Group').remove({user_id: user._id});
          mongoose.model('Contact').remove({user_id: user._id});
          mongoose.model('ActivityLog').remove({user_id: user._id});
          mongoose.model('Task').remove({user_id: user._id});
          mongoose.model('MergeHistory').remove({user_id: user._id});
          res.json(common.pretty(true, 10001, ''));
        } else {
          res.json(common.pretty(true, 10001, ''));   
        }
      }
    });
  })
  //DELETE - soft delete user by ID
  .delete(function (req, res){
    var userId = req.id == 'me' ? req.user_auth.user_id : req.id;    
    mongoose.model('User').findById(userId, function (err, user) {
      if (err || !user) {
        res.json(common.pretty(false, 10000, err));
      } else {

        
        if(user.username.toLowerCase() == 'admin' && user.is_nas_user == true) {
          res.json(common.pretty(false, 10012, ""));
        } else {
          user.remove(function (err, user) {
            if (err) {
              res.json(common.pretty(false, 10000, err));
            } else {
              mongoose.model('GroupContact').remove({user_id: user._id});
              mongoose.model('Group').remove({user_id: user._id});
              mongoose.model('Contact').remove({user_id: user._id});
              mongoose.model('ActivityLog').remove({user_id: user._id});
              mongoose.model('Task').remove({user_id: user._id});
              mongoose.model('MergeHistory').remove({user_id: user._id});
              res.json(common.pretty(true, 10001, user._id));
            }
          });
        }
        
      }
    });
  });

module.exports = router;