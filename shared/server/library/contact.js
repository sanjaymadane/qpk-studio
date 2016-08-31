'use strict'

var mongoose = require('mongoose');

//Load depenendency helper
var contactHelper = require('../helpers/contact_helper');
module.exports = {

	createContact: function(arrContact){

	},
	insertContact: function(arrInsert){
		return new Promise(function(resolve, reject){
			if(arrInsert.length > 0){
				mongoose.model('Contact').collection.insert(arrInsert, function(err, docs){
			        if(err) {
			        	reject(err)
			        } else {
			        	// insertedCount: 30,  insertedIds: []
			        	resolve(docs);
		      		}
		  		});
			} else {
				resolve();
			}
			
		});
	},
	
	updateContactById: function(id, details){
		
	},

	findContact: function(objParams, cb){
		mongoose.model('Contact').find(objParams, function(err, details){
			if(err) {
				process.nextTick(function() {
			        cb(err);
			    });
			} else {
				process.nextTick(function() {
			        cb(false, details);       
			    });
				
			}
		})
	},
	deleteContact: function(objParams, cb){
		mongoose.model('Contact').remove(objParams, function(err, details){
			if(err) {
				cb(err);
			} else {
				cb(null, details);
			}
		});
	}
}
	