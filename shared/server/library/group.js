'use strict'

var mongoose = require('mongoose'),
	_ = require('underscore');

//Load depenendency helper
var contactHelper = require('../helpers/contact_helper');
module.exports = {
	deleteGroupContact: function(objParams, cb){		
		mongoose.model('GroupContact').remove(objParams, function(err, details){
			if(err) {
				cb(err);
			} else {
				cb(null, details);
			}
		});
	},

	getGroupDetailsById: function(objParams, cb){
		mongoose.model('Groups').findOne(objParams, function(err, details){
			if(err) {
				cb(err);
			} else {
				cb(details);
			}
		});
	},

	createGroup:  function(objData, cb){
		mongoose.model('Group').create(objData, function (err, group) {
			if(err){
				cb(err);
			} else {
				cb(null, group);
			}
		});
	},

	insertGroupContact: function(objData, cb) {
		if(_.isArray(objData) && objData.length > 0) {
			mongoose.model('GroupContact').collection.insert(objData, function(err, docs){
				if(err)
				  cb(err);  
				else {                    
				  cb(null, docs);
				}
			});
		} else {
			cb(null, {});
		}		
	}
}
	