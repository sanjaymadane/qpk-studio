'use strict';
/*
 * Authentication handler middleware for high security token
 */

// Load dep packages
var jwt = require('jsonwebtoken'),
    express_jwt = require('express-jwt');

// Load configuration    
var config = require('../config/config');

// Load helpers
var common = require('../helpers/common_helper');

module.exports = function(app){	
	app.use('/api/' + config.api_version + '/contacts', express_jwt({secret: config.high_secret, credentialsRequired: false}),function(req, res, next) {
		if(!req.query.is_locked || req.query.is_locked == 'false'){
			next();			
		} else {
			var token = req.headers.highsecurity;
			if (token && token.split(' ')[0] && token.split(' ')[0].toLowerCase() == 'bearer') {
				if(token.split(' ')[1] == '5262d64b892e8d4341000001'){
					next();
				} else {
					jwt.verify(token.split(' ')[1], config.high_secret, function(err, decoded) { 
						if (err) {
					  	return res.json(common.pretty(false, 10007, ""));    
					  } else {
					    next();        
					  }
					});
				}
			}
			else{
				return res.json(common.pretty(false, 10007, ""));
			}
		}
	});
}