'use strict'

/*************************************
*
*This file is used to create snapshots 
*Created on 10 May 2016
*
*************************************/


var express = require('express'),
	router = express.Router({ mergeParams: true }),
	mongoose = require('mongoose'),
	snapshot = require('../../modules/snapshot');	

var common = require('../../helpers/common_helper');


router.route('/')
.get(function(req,res,next){
	var params = {
		user_id: req.user_auth.user_id,
		is_active: true
	}	
	mongoose.model('SnapshotHistory').find(params, function(err,data){
		if(err) {
			res.json(common.pretty(false, 10000, err));
		} else {
			res.json(common.pretty(true, 10001, data));
		}
	});
})
.post(function(req, res, next){
	var displayName = req.body.display_name;
	if(displayName && displayName.length > 0 ) {

		var userid = req.user_auth.user_id;

		var createSnapshotPromise = new Promise(function(resolve,reject){
			snapshot.createSnapshot(userid, displayName, function(err, data){
				if(err){
					console.log('coming here');
					reject(err);	
				} 
				else {
					console.log('resolve');
					resolve(data);
				}
			})	
		});
	   	
	   	createSnapshotPromise.then(function(resolve){
	   		res.json(common.pretty(true, 10001, resolve));	
	   	}).catch(function(reject){
	   		res.json(common.pretty(false, 10000, reject));

	   	})		  
			
	} else {
		res.json(common.pretty(false, 10000, 'Please provide a valid display name'));
	}
	
});

router.route('/:id')
.delete(function(req,res,next){
	var snapshotId = req.params.id;
	if( snapshotId ) {
		mongoose.model('SnapshotHistory').findByIdAndUpdate({_id: snapshotId}, {$set : { is_active: false }}, function (err, data) {
	      if (err) {
	        res.json(common.pretty(false, 10000, err));
	      } else {
	          res.json(common.pretty(true, 10001, data._id));
	      }
	    });
    } else {
		//no Snapshot id present
		res.json(common.pretty(false, 10000, 'No data present'));
	}
});


module.exports = router;