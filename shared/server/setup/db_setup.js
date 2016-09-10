'use strict';

/*
 * Database connection
 */

// Load dep packages
var mongoose = require('mongoose'),
		config = require('../config/config');

// Create db connection
module.exports = function(){
	return {
		init: function(){ 
			return mongoose.connect(config.database);
		}
	}
}