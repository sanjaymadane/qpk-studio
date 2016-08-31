'use strict'

/*
* This file exports the contacts to CSV file
*
*/

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose'),
    fs = require('fs'),
    path =require('path');

// Load helpers
var common = require('../../helpers/common_helper');
var tasks = require('../../background_tasks');

//include the config file
var config = require('../../config/config');

router.route('/')
.post(function(req, res, next){  
  var task = {
    name: 'Export CSV',
    type: 'csv-export',
    status: 'Task:Waiting',      
    progress: "Waiting",
    user_id: req.user_auth.user_id      
  };
  var log =  {  
    user_id: req.user_auth.user_id,
    type: "export",
    sub_type: "CSV",
    message: {},
    status: "Processing",  
    is_active: false
  }
  task.conditions = req.body;
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
});

function createTask(task, callback){
  var conditions = task.conditions;
  delete task.conditions;
	mongoose.model('Task').create(task, function (err, res_task) {
	  if (err && !res_task) {
	    callback(err);        
	  } else {
      res_task.conditions = conditions;
      tasks.create(res_task, function(err, status){
	      callback(null, res_task); 
	    });        
	  }
	});
}
module.exports = router;