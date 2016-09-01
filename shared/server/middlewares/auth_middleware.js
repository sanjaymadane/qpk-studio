'use strict';
/*
 * Authentication handler middleware
 */

// Load dep packages
var jwt = require('jsonwebtoken'),
    express_jwt = require('express-jwt'),
    mongoose = require('mongoose');

// Load configuration    
var config = require('../config/config');

// Load helpers
var common = require('../helpers/common_helper');

// Load auth
var nas_auth = require('../auth/nas_auth');

module.exports = function(app){	
	app.use('/', express_jwt({secret: config.secret, credentialsRequired: false}),function(req, res, next) {
		var promise = new Promise(function(resolve, reject){
			var token = req.body.authorization || req.query.authorization || req.headers.authorization;  
			if(req.query.username && req.query.username != '' && req.query.sid && req.query.sid != ''){
				var authLoginParams = {
	          user: req.query.username,
	          serviceKey: 1,
	          remme: 1,
	          sid : req.query.sid
	        };
			    nas_auth.login(authLoginParams, function(stdout, meta){
			    	if(stdout && stdout.QDocRoot && ( stdout.QDocRoot.authPassed == 1 || stdout.QDocRoot.authPassed == '1')){		
			    		var params = {
			    			username: req.query.username
			    		};
				    	mongoose.model('User').find(params, function (err, users) {
				    		if(err || users.length == 0){
				    			resolve(false);
				    		} else {
				    			var user = users[0];
				    			req.user_auth = {
					          user_id: user._id,
					          username: user.username,
					          sid: req.query.sid
					        };
					        resolve(true);
				    		}
				    	});				        
			    	} else {
			    		resolve(false);
			    	}
		      });
				} else if (token && token.split(' ')[0] && token.split(' ')[0].toLowerCase() == 'bearer') {

					jwt.verify(token.split(' ')[1], config.secret, function(err, decoded) {   
						if (err) {
					  	resolve(false);
					  } else {
					    // if everything is good, save to request for use in other routes
					    var authLoginParams = {
			          user: decoded.username,
			          serviceKey: 1,
			          remme: 1,
			          sid : decoded.sid
			        };
					    nas_auth.login(authLoginParams, function(stdout, meta){
					    	if(stdout && stdout.QDocRoot && ( stdout.QDocRoot.authPassed == 1 || stdout.QDocRoot.authPassed == '1')){				
					    		req.user_auth = decoded;
					    		console.log(req.user_auth);    		
					        resolve(true);					        
					    	} else {
					    		resolve(false);
					    	}
				      });
					  }
					});
				} else {
					if(['/authenticate'].indexOf(req.url) !== -1){
						resolve(true);
					}
					else
						resolve(false);
				}
		});
		promise.then(function(value){
			if(value){
				next();
			} else {
				return res.json(common.pretty(false, 10007, { status: false}));
			}
		});
	});
}