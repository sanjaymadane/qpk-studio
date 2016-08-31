'use strict'

var express = require('express'),
	router = express.Router({ mergeParams: true }),
	mongoose = require('mongoose'),	
    restore = require('../../modules/restore'),
    moment = require('moment');

//Load the dependency modules
var fse = require('fs-extra');

// Load helpers
var common = require('../../helpers/common_helper');

//load confuig files
var config = require('../../config/config.js');

router.route('/')
.post(function(req,res,next){	
	var snapshotId = req.body.snapshot_id;
	var isCreateSnapshot = req.body.create_snapshot || false;	
	var displayName=  "Automatic_Snapshot_Before_Restoring_" + moment().format('YYYYMMDD_HH:MM:SS');

	if( snapshotId ) {
		var params = {};		
		var userid = req.user_auth.user_id;
		
		params._id = snapshotId;
		params.is_active = true;

		mongoose.model('SnapshotHistory').find(params,{},{limit:1} ,function(err, data){
			if(err){
				res.json(common.pretty(false, 10000, err));
			} else {
				//If Snapshot id is present in the Database create a flag
				var flagData = {user_id: userid, snapshot_id: snapshotId, is_completed:false};
				var strRestoreHistoryId = req.body.restore_id;
				
				var flagPromise = new Promise(function(resolve, reject){
					if(strRestoreHistoryId  && strRestoreHistoryId.length > 0) {
						var params = {_id: strRestoreHistoryId, is_completed:false}
						mongoose.model('RestoreHistory').count(params, function(err, count){
							if(err){
								reject(err);
							} else {
								console.log(count);
								if(count > 0) {
									resolve(strRestoreHistoryId);			
								} else {
									reject({messg: 'Restore with this id not present'});
								}
							}
						})
						
					} else {
						mongoose.model('RestoreHistory').create(flagData, function(err, objRestore){
							if(err){
								reject(err);							
							} else {
								strRestoreHistoryId = objRestore._id;
								resolve(strRestoreHistoryId)
							}
						});
					}					
				})
				
				//store the data in db
				flagPromise.then(function(resolve){
					return new Promise(function(resolve, reject){
						//check if current snap shot need to be created or not
						if(isCreateSnapshot && isCreateSnapshot == true){
							//create the snapshot of the current copy
							var snapshot = require('../../modules/snapshot');						
							snapshot.createSnapshot(userid, displayName, function(err, data){
								if(err){								
									reject(err);	
								} else {								
									resolve(data);
								}
							})
						} else {
							resolve({is_required: isCreateSnapshot})
						}
					});
				}).then(function(resolve){
					return new Promise(function(resolve, reject){
						restore.restoreSnapshot(userid, data[0], function(err, restoreData){
							// Snapshot Restore Success or Fail delete the flag file
							if(err) {
								reject(err);
							} else 	{
								flagData.is_completed = true;
								flagData.completed_on = Date.now();
								mongoose.model('RestoreHistory').update({'_id': strRestoreHistoryId},{$set: flagData}, function(err, data){
									if(err) {
										reject(err);
									} else {
										resolve(restoreData);		
									}
								});
							}
						});
					});
				}).then(function(resolve){	
					//resolve can be very big object		
					res.json(common.pretty(true, 10001, 'Snapshot restored successfully'));
				})
				.catch(function(reject){
					res.json(common.pretty(false, 10000, reject));
				});
			}
		});
	} else {
		//no Snapshot id present
		res.json(common.pretty(false, 10000, 'No data present'));
	}

	
});

module.exports = router;