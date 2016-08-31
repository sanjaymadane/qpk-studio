'use strict'

var mongoose = require('mongoose');

module.exports = {	
	objModel: mongoose.model('TempContact'),
	deleteContact: function(params){
		var self = this;
		return new Promise(function(resolve, reject){
			self.objModel.remove(params, function(err, details){
				//No worries if fails will clean the db once in a week
				resolve();
			})
		})		
	},	
}