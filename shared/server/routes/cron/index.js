'use strict';

/*
 * Google contacts import router
 */

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    moment = require('moment');

// Load helpers
var common = require('../../helpers/common_helper');
var tasks = require('../../background_tasks');

//Require constant files
var constant = require('../../config/constant.js');

//Include libarary
var syncLibrary = require('../../library/sync');


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


var cron = require('node-cron');
 
cron.schedule('*/10 * * * *', function(){

  //Initiate the sync process

  //Get all the sync accounts

  //Get all the accounts whose sync process was last success
  var params = {
    is_active: true,
    last_sync_status: true
  }
  syncLibrary.getAccounts(params, function(err, arrAccount){
    if(err){
      //error while fetching records
    } else {
      var currentDate = moment();
      if(arrAccount.length > 0){
        arrAccount.forEach(function(account){
          // console.log(moment(account.last_sync).value)
          var secondsDiff = currentDate.diff(moment(account.last_sync), 'seconds')
          console.log(secondsDiff);
          if(secondsDiff >= account.trigger_break){
            console.log("Success for => " + account.account_name);

            var task = {
              name: 'Import google contacts',
              type: 'google-import',
              key: constant.constTaskType.GOOGLE,
              status: 'Task:Waiting',      
              progress: "0%",
              user_id: account.user_id,
              is_full_sync: false,
              sync: account
            };
            var log =  {  
              user_id: account.user_id,              
              type: "import",
              sub_type: "Google",
              key: constant.constTaskType.GOOGLE,
              message: {},
              status: "Processing",
              is_active: false
            };

            //Initialize the task
            //Create task
            createTask(task, function(err, data) {
              if (err) {
                log.message.text = "Error while creating task";
                log.status = "Failed";
                log.is_active = true;
                common.track_log(log);
                // res.json(common.pretty(false, 10000, 'Error in creating tasks')); 
              } else {
                log._id = data._id;
                common.track_log(log);
                // res.json(common.pretty(true, 10001, data)); 
              }
            });
          }
          // if(account.last_sync)
        });
      }

    }
  })
  console.log('running a task 10 min');
});
  
module.exports = router;
