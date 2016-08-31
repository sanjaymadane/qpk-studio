'use strict';

/*
 * Background task management
 */
// Load dep packages
var publisher = require('../setup/rabbitmq_setup');

module.exports = {
	create: function(task, callback){
		publisher.publish('','jobs', task);
		publisher.publish('','events', task);    
		callback(true);
	}
};