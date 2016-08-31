'use strict'

var mongoose = require('mongoose');

module.exports = {
	addAccount: function(data, cb){
		var objSyncModel = mongoose.model('UserAccountSync');	
		
		objSyncModel.create(data, function(err, data){
			if(err){
				cb(err);
			} else {
				cb(null, data)
			}
		})
	},
	softDeleteAccount: function(data){
		//Set is active to null
	},
	deleteAccountById: function(data,cb){
		//delete the entry
		var objSyncModel = mongoose.model('UserAccountSync');

		objSyncModel.remove({_id: {$in: data}}, function(err, details){
			if(err){
				cb(err);
			} else {
				cb(null, details);
			}
		})
	},	
	getSingleAccount: function(params){
		return new Promise(function(resolve, reject){
			var objSyncModel = mongoose.model('UserAccountSync');

			objSyncModel.findOne(params, function(err, details){
				if(err){
					reject(err);
				} else {
					resolve(details);
				}
			})
		})
	},
	getAccounts: function(params, cb){
		var objSyncModel = mongoose.model('UserAccountSync');
		objSyncModel.find(params, function(err,details){
			cb(err,details);
		})
	},
	updatedSingleAccount: function(params, data, cb){
		var objSyncModel = mongoose.model('UserAccountSync');
		objSyncModel.update(params, {$set: data}, function(err, details){
			if(err){
				cb(err);
			} else {
				cb(null, details);
			}
		})
	},
	updateAndGetSingleAccount: function(params, data, cb){
		var objSyncModel = mongoose.model('UserAccountSync');
		objSyncModel.findOneAndUpdate(params, {$set: data}, {new: true}, function(err, details){
			if(err){
				cb(err);
			} else {
				cb(null, details);
			}
		})
	}	
}