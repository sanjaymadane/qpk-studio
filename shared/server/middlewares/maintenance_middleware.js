'use strict';
/*
 * Authentication handler middleware
 */
//Load Modules
var fs = require('fs'),
	mongoose = require('mongoose');

// Load configuration    
var config = require('../config/config');

// Load helpers
var common = require('../helpers/common_helper');

module.exports = function(app){	
	app.use('/api/' + config.api_version, function(req, res, next) {			
		if(req.user_auth &&  req.user_auth.user_id.length > 0) {			
			var params = {user_id: req.user_auth.user_id, is_completed:false}
			//check if any maintenance data exist 
		   	mongoose.model('RestoreHistory').find(params, function(err, restorePresent){
		   		if(err) {
		   			next();
		   		} else {
		   			if(restorePresent && restorePresent.length > 0) {
		   				var restoreId = req.body.restore_id;
		   				if(['/restore'].indexOf(req.url) !== -1 && restoreId && restoreId.length > 0) {
							next();
		   				} else {		   					
		   					res.json(common.pretty(true, 11000, restorePresent[0]));
		   				}		   				
		   			} else {
		   				next();
		   			}
		   			
		   		}
		   	});		   	
		} else {
			//user id not present go normal
			next();
		}				
	});
}