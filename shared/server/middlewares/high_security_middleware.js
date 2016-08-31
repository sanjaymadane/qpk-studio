'use strict';
/*
 * Authentication handler middleware
 */

// Load dep packages
var jwt = require('jsonwebtoken'),
    express_jwt = require('express-jwt');

// Load configuration    
var config = require('../config/config');

// Load helpers
var common = require('../helpers/common_helper');

module.exports = function(app){	
	app.use('/api/contacts/*', express_jwt({secret: config.secret, credentialsRequired: false}),function(req, res, next) {
		var token = req.body.authorization || req.query.authorization || req.headers.authorization;  
		if (token && token.split(' ')[0] == 'Bearer') {
			jwt.verify(token.split(' ')[1], config.secret, function(err, decoded) {      
			  if (err) {
			    return res.json(common.pretty(false, 10007, ""));    
			  } else {
			    req.user_auth = decoded; 
			    next();        
			  }
			});
		}
	});
}