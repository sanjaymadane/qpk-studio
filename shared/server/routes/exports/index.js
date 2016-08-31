'use strict'

/*
* This file exports the contacts to CSV file
*
*/

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose'),    
    _ = require('underscore');

// Load helpers
var common = require('../../helpers/common_helper'),
    contactMapper = require('../../helpers/contact_mapper_helper');
var tasks = require('../../background_tasks');

//include the config file
var config = require('../../config/config'),
	constant = require('../../config/constant');

router.route('/')
  .post(function(req, res, next){  	
  	var arrExportType = req.body.export_type;
  	if(arrExportType && _.isArray(arrExportType) && arrExportType.length > 0) {
	    var arrPromise = [];
	    var intExportCount = 0;
	 
	    var self = this;
		var params = {
			user_id: req.user_auth.user_id,
			is_active: true,
			is_locked: false
		};
		var pro = new Promise(function(resol, reje) {
			if(req.body && req.body.is_active == false)
				params.is_active = false;

			if(req.body && req.body.is_locked)
				params.is_locked = true;
			else
				params.is_locked = false;

			if(req.body && req.body.is_favorite)
				params.is_favorite = true;

			if(req.body && req.body.contact_ids && req.body.contact_ids.length > 0){
				params._id = {"$in": req.body.contact_ids};
				resol();
			} else if(req.body && req.body.group_ids && req.body.group_ids.length > 0){
				mongoose.model('GroupContact').find({user_id: req.user_auth.user_id, group_id: {"$in": req.body.group_ids}}, function (err, contacts) {
			      if (err) {			        
			        reje(err);
			      } else {
			        var contact_ids = _.map(contacts, function(contact){ return contact.contact_id});
						params._id = {"$in": contact_ids};
						resol();
					}
				});
			} else{
				resol();
			}
		});

		pro.then(function(resolve){
			return new Promise(function(resolveCount, rejectCount){				
				mongoose.model('Contact').count(params, function(err, count) {
					if(err) {
						rejectCount(err)
					} else {						
						resolveCount({count: count});
					}
				});
			});
		})
		.then(function(resolve){
			if(resolve.count == 0) {
				res.json(common.pretty(false, 10023, 'No contacts to export'));	
			}else if(resolve.count  > 0){
				arrExportType.forEach( function(exportType){
		  			var task = {
				      status: 'Task:Waiting',      
				      progress: "Waiting",
				      key: constant.constTaskType.EXPORT,
				      conditions: req.body,
				      user_id: req.user_auth.user_id      
				    };
				    var log =  {
				      user_id: req.user_auth.user_id,
				      type: "export",
				      key: constant.constTaskType.EXPORT,
				      message: {},
				      status: "Processing",  
				      is_active: false
				    }
					
		  			switch(exportType){
		  				case 'vcard':
							task.name = 'Export vCard';
							task.type = 'vcard-export';
							log.sub_type = "vcard";
							intExportCount++;
		  					break;

		  				case 'google-csv':
						case 'mycontact-csv':
							if(exportType == 'mycontact-csv'){
								task.sub_type = 'mycontact';
							} else {
								task.sub_type = 'google';
							}

							task.name = 'Export CSV';
							task.type = 'csv-export';
							log.sub_type = "csv";
							intExportCount++;
							break;
		  			}
		  			if(task.type.length > 0) {
		  				var promise = new Promise(function(resolve, reject){
							createTask(task, function(err, data) {
						      if (err) {
						        log.message.text = "Error while creating task";
						        log.status = "Failed";
						        log.is_active = true;				        
						        common.track_log(log);
						        reject({message: 'Error in creating tasks'});				        
						      } else {
						        log._id = data._id;				        
						        common.track_log(log);
						        resolve(data);
						        // res.json(common.pretty(true, 10001, data)); 
						      }
						    })
			  			});
		  			}
		  			arrPromise.push(promise);
		  		});
				if(intExportCount > 0 ) {
		  			Promise.all(arrPromise)
			  		.then(function(resolve){	  			
			  			res.json(common.pretty(true, 10001, resolve));
			  		})
			  		.catch(function(reject){	  			
			  			res.json(common.pretty(false, 10000, reject.message));
			  		});	
		  		} else {
		  			res.json(common.pretty(false, 10024, 'Provide valid export type'));	
		  		}
			} else {
				res.json(common.pretty(false, 10022, 'Count limit is being imposed' + resolve.count));	
			}
		})
		.catch(function(reject){
			res.json(common.pretty(false, 10000, reject));	
		})
  	} else {
  		//No export type present
  		res.json(common.pretty(false, 10023, 'No export type present'));
  	}    
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