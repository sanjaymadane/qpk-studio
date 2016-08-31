'use strict';

/*
 * Google contacts import router
 */

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose'),
    assert = require('assert'),
    util = require('util'),
    debug = require('debug')('google-contacts'),
    _ = require('underscore');

// Load helpers
var common = require('../../helpers/common_helper'),
    constant = require('../../config/constant');
    
var tasks = require('../../background_tasks');

//Include libarary
var syncLibrary = require('../../library/sync');

//Load Auth Library
var googleauth = require('../../auth/google_auth');


router.route('/contacts')
  .get(function(req, res){
    googleauth.import(function(url){
      res.json(common.pretty(true, 10001, {auth_url: url})); 
    });
  })
  .post( function(req, res, next) {  
    var googleHelper = require('../../helpers/google_helper');    
    var groupLibrary = require('../../library/group');

    var params = {};   
    params.result = req.body.result
    params.code = req.body.auth_key;
    var strToken = req.body.token;
    var strRefreshToken = req.body.refresh_token;

    var objGoogleDetails = null;

    //create the background task object
    var task = {
      name: 'Import google contacts',
      type: 'google-import',
      key: constant.constTaskType.GOOGLE,
      status: 'Task:Waiting',      
      progress: "0%",
      user_id: req.user_auth.user_id,
    };
    var log =  {  
      user_id: req.user_auth.user_id,
      type: "import",
      sub_type: "Google",
      key: constant.constTaskType.GOOGLE,
      message: {},
      status: "Processing",
      is_active: false
    }


    if(params.result && params.result !== 'undefined'){
      var crypto_helper = require('../../helpers/encript_helper');
      var decrypted = JSON.parse(crypto_helper.AES_Decrypt(params.result));
      strToken = decrypted.access_token;
      strRefreshToken = decrypted.refresh_token;
    }

    var getTokenPromise = new Promise(function(resolve, reject){
      if( typeof strToken !== 'undefined' && typeof strRefreshToken !== 'undefined') {
        resolve();       
      } else if( typeof params.code !== 'undefined' ) {
        googleauth.get_token(params , function(err, data){  
          if(err) {
            reject(err);
          } else {
            strToken = data.access_token;
            strRefreshToken = data.refresh_token;
            resolve();
          }
        });
      } else {
        reject()
      }
    });

    getTokenPromise.then(function(resolve){      
      var data = {
        token: strToken,
        isgetnext: false,
        'max-results': 1
      }
      return googleHelper.getContacts(data);      
    }).then(function(contactResolve){
      var params = {
        account_name: contactResolve.owner,
        account_type: constant.constSources.GOOGLE,
        user_id: req.user_auth.user_id
      }
      objGoogleDetails = contactResolve;
      return syncLibrary.getSingleAccount(params)
      
    }).then(function(account){
      debug(account);
      return new Promise(function(resolve,reject){
        if(account){
          //If account present update the referesh token
          var objSync = {
            metadata: {
              refresh_token: strRefreshToken
            } //any general information if required to store
          }

          var params = {
            _id: account._id
          }
          syncLibrary.updateAndGetSingleAccount(params, objSync, function(err, details){
            if(err){
              reject(err);
            } else {
              debug(details);
              resolve(details);
            }
            
          });
        } else {            
          //Create the entry into the Group db
          //create group
          var groupDetails = {
            name: googleHelper.getGroupName(objGoogleDetails.owner),
            user_id: req.user_auth.user_id
          }

          groupLibrary.createGroup(groupDetails, function(err, details){
            if(err){
              reject(err);
            } else {
              //Create entry into the sync db if not present 
              var objSync = {
                user_id: req.user_auth.user_id,
                account_type: constant.constSources.GOOGLE, 
                account_name: objGoogleDetails.owner,
                trigger_break: 86400,
                group_id: details._id.toString(),
                is_active: true,
                last_sync: Date.now(),
                last_sync_status: true,
                metadata: {
                  refresh_token: strRefreshToken
                } //any general information if required to store
              }

              //create entry into the sync db
              syncLibrary.addAccount(objSync, function(err, details){
                if(err){
                  reject(err);
                } else {
                  resolve(details);
                }
              })
            }
          })

          
        }
      })
    }).then(function(syncCreated){
      //Initialize the task
      //Create task
      task.refresh_token = strRefreshToken;
      task.token = strToken;
      task.sync = syncCreated;
      /*
      * Can be controlled as from the main page if user initiates it should be full sync
      * If false it will get only updated contacts since the last sync
      */
      task.is_full_sync = true;
      createTask(task, function(err, data) {
        if (err) {
          log.message.text = "Error while creating task";
          log.status = "Failed";
          log.is_active = true;
          common.track_log(log);
          res.json(common.pretty(false, 10000, 'Error in creating tasks')); 
        } else {
          log._id = data._id;
          common.track_log(log);
          res.json(common.pretty(true, 10001, data)); 
        }
      });
    })
    .catch(function(reject){
      log.message.text = err;
      log.status = "Failed";
      log.is_active = true;
      common.track_log(log);
      res.json(common.pretty(false, 10000, reject));
    });
  });

router.route('/sync')
  .get(function(req,res, next){
    //get the list of sync user accounts    
    var params = {
      user_id: req.user_auth.user_id
    }
    syncLibrary.getAccounts(params, function(err, details){
      if(err){
        res.json(common.pretty(false, 10000, err)); 
      } else {
        res.json(common.pretty(true, 10001, details)); 
      }
    })
  })
  .post(function(req, res, next){    
    var strSyncId = req.body.id;
    var intTriggerTime = parseInt(req.body.trigger_break);

    if(!strSyncId){
      return res.json(common.pretty(false, 11022, err)); 
    }

    if(!intTriggerTime || isNaN(intTriggerTime)){
      return res.json(common.pretty(false, 11021));  
    }
    
    syncLibrary.updateAndGetSingleAccount({_id: strSyncId}, {trigger_break: intTriggerTime}, function(err, details){
      if(err){
        res.json(common.pretty(false, 10000, err)); 
      } else {
        res.json(common.pretty(true, 10001, details)); 
      }
    })
  })
  .delete(function(req, res, next){
    var arrstrDeleteIds = req.body.id;
    if(!_.isArray(arrstrDeleteIds)){
      return res.json(common.pretty(false, 11020)); 
    }

    syncLibrary.deleteAccountById(arrstrDeleteIds, function(err, details){
      if(err){
        res.json(common.pretty(false, 10000, err)); 
      } else {
        res.json(common.pretty(true, 10001, details)); 
      }
    });
  });

router.route('/syncNow')
  .post(function(req, res, next){
    var strSyncId = req.body.id;
    /*
    * Can be controlled as from the main page if user initiates it should be full sync
    * If false it will get only updated contacts since the last sync
    */
    var boolIsFullSync = req.body.is_full_sync;

    if(typeof boolIsFullSync  == 'undefined'){
      boolIsFullSync = true;      
    }

    syncLibrary.getSingleAccount({_id: strSyncId})
    .then(function(resolve){
      //create the background task object
      var task = {
        name: 'Import google contacts',
        type: 'google-import',
        key: constant.constTaskType.GOOGLE,
        status: 'Task:Waiting',      
        progress: "0%",
        user_id: req.user_auth.user_id,
        is_full_sync: boolIsFullSync
      };
      var log =  {  
        user_id: req.user_auth.user_id,
        type: "import",
        key: constant.constTaskType.GOOGLE,
        sub_type: "Google",
        message: {},
        status: "Processing",
        is_active: false
      };

      //Initialize the task
      //Create task      
      task.sync = resolve;

      createTask(task, function(err, data) {
        if (err) {
          log.message.text = "Error while creating task";
          log.status = "Failed";
          log.is_active = true;
          common.track_log(log);
          res.json(common.pretty(false, 10000, 'Error in creating tasks')); 
        } else {
          log._id = data._id;
          common.track_log(log);
          res.json(common.pretty(true, 10001, data)); 
        }
      });

    })
    .catch(function(reject){
      res.json(common.pretty(false, 10000, reject));
    })
  });

function createTask(task, callback ){
  mongoose.model('Task').create(task, function (err, res_task) {
    if (err) {
      callback(err);        
    } else {
      tasks.create(res_task, function(err, status){
        callback(null, res_task); 
      });        
    }
  });
}


  
module.exports = router;
