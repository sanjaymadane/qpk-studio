'use strict'

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    _ = require("underscore"),
    mongoose = require('mongoose');

var tasks = require('../../background_tasks');

// Load helpers
var common = require('../../helpers/common_helper');   

// Load file config 
var config = require('../../config/config'),
	constant = require('../../config/constant');

router.route('/header/:transaction_id')
.get(function(req, res, next){
	if(!req.params.transaction_id){
		res.json(common.pretty(false, 11001));
		return;
	}

	var filterParams = {
		transaction_id: req.params.transaction_id,
		user_id: req.user_auth.user_id
	}

	mongoose.model('TempContact').findOne(filterParams, {"_id":0,"tmp_data.label":1},function(err, record){
		if(err || record == null){
			res.json(common.pretty(false, 10000, err));
			return; 				
		} else {
			var defaultData = require('../../config/constant/defaultData');
			var arrobjData = defaultData.templateData();
			

			var mapper = null;
			//Get the default data
			_.each( arrobjData, function(objData){
				if( objData.template_key == 'default' ) {
					mapper = objData.mapper;
					return;
				}
			});
			
			var header = [];
			_.each(record.tmp_data, function(data){
				var objHeaderAndSuggestion = {map_name: data.label};
				var boolIsMapped = false;
				_.each(mapper, function(mapData){
					if(mapData.map_name.toLowerCase() == data.label.toLowerCase()){
						boolIsMapped = true;
						objHeaderAndSuggestion.display_name = mapData.display_name;
						objHeaderAndSuggestion.field_value = mapData.field_value;
						return
					}					
				});

				if (boolIsMapped == false) {
					objHeaderAndSuggestion.display_name = 'Save to Comment';
					objHeaderAndSuggestion.field_value = '';
				}				
				header.push(objHeaderAndSuggestion);
			});

			res.json(common.pretty(true, 10001, header));
		}
	});
})

router.route('/:transaction_id')
.get(function(req, res, next){	
	if(!req.params.transaction_id){
		res.json(common.pretty(false, 11001));
		return;
	}

	var filterParams = {
		transaction_id: req.params.transaction_id,
		user_id: req.user_auth.user_id
	}

	var page = Math.max(0, req.query.page || 0);
	var limit = parseInt(req.query.limit ? req.query.limit : 50);

	var pagination = {
		limit: 	limit,
		skip: 	page * limit
	}
	
	mongoose.model('TempContact').count(filterParams, function(err, count){
		if(err) {
			res.json(common.pretty(false, 10000));
		} else {
			if(count > 0) {				
				mongoose.model('TempContact').find(filterParams, {} , pagination, function(err, result){
					if(err){
						res.json(common.pretty(false, 10000, err));		
					} else {
						res.json(common.pretty(true, 10001, {total:count, data: result, page: page, current_count: result.length, pages: Math.ceil(count/limit)}));
					}
				})
			} else {
				res.json(common.pretty(true, 10001, {total:0, data: [], page: page, current_count: 0, pages: 0}));
			}
		}
	});
})
.delete(function(req, res, next){
	//clear all the preview data
	var transactionId = req.params.transaction_id;
	var userId = req.user_auth.user_id;
	var arrPromise = [];
	var arrImportExportCollection = ["TempContact"];		
	
	var params = {
		user_id:  userId,
		transaction_id: transactionId
	}

	_.each(arrImportExportCollection, function(fromCollection){
		var objPromise = new Promise(function(resolve, reject){
			mongoose.model(fromCollection).remove(params, function(err, status){
				if(err) reject(err);
				resolve(status);
			});
		});
		arrPromise.push(objPromise);
	});
	
	Promise.all(arrPromise).then(function(resolve){
		res.json(common.pretty(true, 10001, resolve));
	})
	.catch(function(reject){
		res.json(common.pretty(false, 10000, reject));
	})
})
.post(function(req, res, next){
	var contactIds = req.body.contact_id;
	var userId = req.user_auth.user_id;
	var transactionId = req.params.transaction_id;
	var isActive = req.body.is_active;

	if(typeof isActive == "undefined"){
		res.json(common.pretty(false, 11006));
		return;
	}
	
	if(_.isArray(contactIds) && contactIds.length > 0) {		
		var params = {
			user_id: userId,
			transaction_id: transactionId,
			_id: {$in: contactIds}
		}

		var objUpdateParams = {
			is_active: isActive
		}
		
		mongoose.model('TempContact').update(params, {$set : objUpdateParams}, {multi:true}, function (err, contact) {
			if (err) {
				res.json(common.pretty(false, 10000, err));
			} else {	        
				res.json(common.pretty(true, 10001, contact));
			}
	    });
	} else {
		res.json(common.pretty(false, 11007));  
	}
});

router.route('/:transaction_id/import')
.post(function(req, res, next){

	var transaction_id = req.params.transaction_id;
	var userId = req.user_auth.user_id;
	var objTask = mongoose.model("Task");

	var params = {
		user_id : userId,
		'general_data.transaction_id': transaction_id
	}

	var log = null;
	var task = null;
	
	var initPromise = new Promise(function(initPromiseResolve, initPromiseReject){
		objTask.findOne(params, function(err, record){
			if(err || record == null){
				return initPromiseReject();				
			} else {
				var strGroupName = req.body.group_name;
				var generalData = record.general_data;
				var boolIsImportDirect = req.body.is_direct_import;
				var boolIsImportFirstRow = req.body.import_first_row || false;
				var boolIsPhoneImport = req.body.is_from_phone || false;
				var strDeviceId = req.body.device_id;

				// console.log(boolIsImportDirect);

				if(!strGroupName){
					initPromiseReject({status_code: 11003});
					return;
				} else {
					generalData.group_name = strGroupName;
				}

				generalData.is_from_phone = boolIsPhoneImport;
				if(boolIsPhoneImport){
					if(typeof strDeviceId == 'undefined'){
						return res.json(common.pretty(false, 11019, ''));
					} else {
						generalData.device_id = strDeviceId;
						//initialize the default data
						req.body.mapper = constant.constDefaultQcontactzMapper;
						req.body.delimiter = constant.constDefaultSeparator;
						boolIsImportDirect = true;
						boolIsImportFirstRow = false;
					}
				}

				// console.log(req.body);

				//add the clause for first row import
				generalData.is_import_first_row = boolIsImportFirstRow;

				//check if it is direct import or not
				var strTaskSubtype = "import-tmp";
				var strTaskKey = constant.constTaskType.IMPORT_TEMP;
				if(typeof boolIsImportDirect != 'undefined' && boolIsImportDirect == true) {
					strTaskSubtype = "import-main";
					strTaskKey = constant.constTaskType.IMPORT_DIRECT;
				}

				if(record.type == 'any-csv-import'){
					var strDelimiter =  req.body.delimiter || '';
					var objMapper = req.body.mapper;
					
					
					generalData.delimiter = strDelimiter;

					//store mapper as array of objects because of mongo "." characterstice
					var arrobjMapper = [];
					_.each(objMapper, function(value, key){
						if(key.length > 0) {
							var objMapperData = {
								key: key,
								value: value
							};
							arrobjMapper.push(objMapperData);
						}
					});

					if(arrobjMapper.length == 0){
						initPromiseReject({status_code: 11003});
						return;
					}

					generalData.mapper = arrobjMapper;

					log =  {
					    user_id: userId,
					    type: "import", //this is used for showing logging					    
					    sub_type: "File",
					    key: strTaskKey,
					    general_data: generalData,
					    message: {},
					    status: "Processing",  
					    is_active: false
				  	};
					task = {
						type : 'any-csv-import',
						name : 'Import CSV',
						key: strTaskKey,
						sub_type: strTaskSubtype,
						user_id: userId,
						general_data: generalData
					};
					
					initPromiseResolve(record);
				} else {
					log =  {  
					    user_id: userId,
					    type: "import",
					    sub_type: "File",
					    key: strTaskKey,
					    general_data: generalData,
					    message: {},
					    status: "Processing",  
					    is_active: false
				  	};
					task = {
						type : 'vcard-import',
						name : 'Import vCard',
						key: strTaskKey,
						sub_type: strTaskSubtype,
						user_id: userId,
						general_data: generalData
					};

					initPromiseResolve(record);
				}
			}
		})
	});

	initPromise.then(function(initResolve){
		objTask.update(params, {$set: task}, function(err, details){
			if (err) {
		        log.message.text = "Error while creating task";
		        log.status = "Failed";
		        log.is_active = true;
		        common.track_log(log);
		        res.json(common.pretty(false, 10000, 'Error in creating tasks')); 
		      } else {
		      	//set the task id for rabbit mq
		      	task._id = initResolve._id;
		      	tasks.create(task, function(err, status){			         
			        log._id = task._id;
			        common.track_log(log);
			        res.json(common.pretty(true, 10001, task));
		    	}); 
		         
		      }
		})		
	}).catch(function(reject){
		var statusCode = (reject && reject.status_code) ?  reject.status_code : 10000;
		res.json(common.pretty(false, statusCode));
	})
});

router.route('/preview/:transaction_id')
.get(function(req, res, next){
	var filterParams = {
		transaction_id: req.params.transaction_id,
		user_id: req.user_auth.user_id
	}

	var page = Math.max(0, req.query.page || 0);
	var limit = parseInt(req.query.limit ? req.query.limit : 50);

	var pagination = {
		limit: 	limit,
		skip: 	page * limit
	}	

	mongoose.model('PreviewContact').count(filterParams, function(err, count){
		if(err) {
			res.json(common.pretty(false, 10000));
		} else {
			if(count > 0) {
				mongoose.model('PreviewContact').find(filterParams, {} , pagination,function(err, result){
					if(err){
						res.json(common.pretty(false, 10000, err));		
					} else {
						res.json(common.pretty(true, 10001, {total:count, data: result, page: page, current_count: result.length, pages: Math.ceil(count/limit)}));
					}
				})
			} else {
				res.json(common.pretty(true, 10001, {total:0, data: [], page: page, current_count: 0, pages: 0}));
			}
		}
	});
})
.post(function(req, res, next){
	var contactIds = req.body.contact_id;
	var userId = req.user_auth.user_id;
	var transactionId = req.params.transaction_id;
	var isActive = req.body.is_active;

	if(typeof isActive == "undefined"){
		res.json(common.pretty(false, 11006));
		return;
	}
	
	if(_.isArray(contactIds) && contactIds.length > 0) {		
		var params = {
			user_id: userId,
			transaction_id: transactionId,
			_id: {$in: contactIds}
		}

		var objUpdateParams = {
			is_active: isActive
		}
		
		mongoose.model('PreviewContact').update(params, {$set : objUpdateParams}, {multi:true}, function (err, contact) {
			if (err) {
				res.json(common.pretty(false, 10000, err));
			} else {	        
				res.json(common.pretty(true, 10001, contact));
			}
	    });
	} else {
		res.json(common.pretty(false, 11007));  
	}
})
.delete(function(req, res, next){
	//clear all the preview data
	var transactionId = req.params.transaction_id;
	var userId = req.user_auth.user_id;
	var arrPromise = [];
	var arrImportExportCollection = [
		"PreviewContact",
		"PreviewGroupContact",
		"PreviewGroup"
	];		
	
	var params = {
		user_id:  userId,
		transaction_id: transactionId
	}

	_.each(arrImportExportCollection, function(fromCollection){
		var objPromise = new Promise(function(resolve, reject){
			mongoose.model(fromCollection).remove(params, function(err, status){
				if(err) reject(err);
				resolve(status);
			});
		});
		arrPromise.push(objPromise);
	})
	
	Promise.all(arrPromise).then(function(resolve){
		res.json(common.pretty(true, 10001, resolve));
	})
	.catch(function(reject){
		res.json(common.pretty(false, 10000, reject));
	})
	
});

router.route('/preview/:transaction_id/import')
.post(function(req, res, next){
	var userId = req.user_auth.user_id;
	var transactionId = req.params.transaction_id;
	
	var userId = req.user_auth.user_id;
	var objLog = mongoose.model("ActivityLog");

	var params = {
		user_id : userId,
		'general_data.transaction_id': transactionId
	}	
	
	objLog.findOne(params, function(err, record){
		if(err || record == null){
			return res.json(common.pretty(false, 10000, 'Error in creating tasks'));
		} else {
			var log =  {  
			    user_id: userId,			    
			    type:  "import",
			    sub_type: "File",
			    key: constant.constTaskType.IMPORT_PREVIEW,
			    general_data: {
					transaction_id: transactionId
				},   
			    message: {},
			    status: "Processing",  
			    is_active: false
		  	};
			var task = {				
				sub_type: "import-preview",
				user_id: userId,
				key: constant.constTaskType.IMPORT_PREVIEW,
				general_data: {
					transaction_id: transactionId
				}		
			};

			if(record.type == "any-csv-import"){
				task.type = 'any-csv-import';
				task.name = 'Import CSV';
			} else {				
				task.type = 'vcard-import';
				task.name = 'Import vCard';
			}
			
			createTask(task, function(err, data) {
		      if (err) {      	
		        log.message.text = "Error while creating task";
		        log.status = "Failed";
		        log.is_active = true;
		        common.track_log(log);
		        res.json(common.pretty(false, 10000, 'Error in creating tasks')); 
		      } else {
		        log._id = data._id;
		        common.track_log(log);
		        res.json(common.pretty(true, 10001, data)); 
		      }
		    });

		}
	})	// console.log
});

function createTask(task, callback){
  mongoose.model('Task').create(task, function (err, res_task) {
    if (err) {
      callback(err);        
    } else {
      tasks.create(res_task, function(err, status){
        callback(null, res_task); 
      });        
    }
  });
}

module.exports = router;