'use strict'

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose'),    
    fs = require('fs-extra'),    
    moment = require('moment'),
    _ = require('underscore');

// Load helpers
var common = require('../../helpers/common_helper'),
	fileHelper = require('../../helpers/file_helper'),
	generalHelper = require('../../helpers/general_helper');

//Load Library
var tempcontactLibrary = require('../../library/tempcontact');

var publisher = require('../publisher');

// Load file config 
var config = require('../../config/config');

module.exports = {	
	tmpContactImport: function(rmq, task, config,callback){
		var self = this;
		var transactionId = task.general_data.transaction_id;
	    var userId = task.user_id;
	    var strGroupName = task.general_data.group_name;
	    var objMapper = task.general_data.mapper || '';
	    var strDelimiter = task.general_data.delimiter || '';
	    var boolIsImportFirstRow = task.general_data.is_import_first_row || false;
	    var strFileName = task.general_data.file_details.originalname || '';

	    //Will hold the initialization promise
	    var arrInitPromise = [];

		task.status = 'Task:InProgress';
	    task.progress = '20%';
	    rmq.publish('','events', task);

	    var filterParams = {
			transaction_id: transactionId,
			user_id: userId,
			is_active: true
		};		
		
		//need to send to vcf and csv function
		var data = {			
			user_id: userId,
			transaction_id: transactionId,
			group_detail: {
				name: strGroupName,
				user_id: userId,
				is_active: true,				
				transaction_id: transactionId
			},
			config: config,
			filter_params: filterParams
		}

		arrInitPromise.push(self.createGroup(data));

		if(boolIsImportFirstRow == true){
			arrInitPromise.push(self.createHeaderAsContact(data));
		}
		// console.log(data );
		// mongoose.set('debug',true)
		Promise.all(arrInitPromise).then(function(initResolve) {
			task.status = 'Task:InProgress';
		    task.progress = '25%';
		    rmq.publish('','events', task);

		    //Set the group id in the data object
		   	data.group_id =  initResolve[0].group_id.toString();

			return new Promise(function(contactResolve, contactReject){
				if(task.type == "any-csv-import") {
					var initParams = {			
						field_mapping: objMapper,
						delimiter: strDelimiter
					};				

					data.init_params = initParams;					

					self.tmpImportCsv(data).then(function(importResolve){
						// the stream is closed
					  	task.status = 'Task:InProgress';
					    task.progress = '75%';
					    rmq.publish('','events', task);
						contactResolve(importResolve);
					}).catch(function(importReject){
						contactReject(importReject);
					})
				} else {
					//check if the file exist
					// console.log('checking file existence');
					if(task.general_data.file_details && task.general_data.file_details.path && fileHelper.fileExists(task.general_data.file_details.path)){

						data.file_path = task.general_data.file_details.path;
						data.filename = task.general_data.file_details.originalname || '';
						// console.log('Send impot ok');
						self.tmpImportVcf(data).then(function(importResolve){
							// console.log('vcf import success');
							task.status = 'Task:InProgress';
						    task.progress = '75%';
						    rmq.publish('','events', task);
							contactResolve(importResolve);
						}).catch(function(importReject){
							contactReject(importReject);
						})
					} else {
						contactReject(importReject);
					}
					
				}	    
			});
		}).then(function(){
			var params = {
				transaction_id: transactionId
			};
			return tempcontactLibrary.deleteContact(params);
		}).then(function(resolve){
			task.status = 'Task:InProgress';
		    task.progress = '100%';
		    rmq.publish('','events', task);

		    var objImportLog = {
		    	user_id: userId,
				general_data: task.general_data, //type of file imported  csv, vcf, google
				is_from_phone: task.general_data.is_from_phone,
				device_id: task.general_data.device_id || '',
				transaction_id: transactionId
		    }

		    //Make entry in the import history
		    mongoose.model('ImportActivityLog').create(objImportLog, function(err, detail){
		    	if(err){
		    		//only import log will not be stored
		    		console.log(err);
					callback(true, strFileName);
		    	} else {
		    		// console.log(detail);
		    		callback(true, strFileName);
		    	}
		    });

		    // callback(true, resolve);
		}).catch(function(reject){
			console.log(reject + "in the main reject");
			callback(false, reject);
			// res.json(common.pretty(true, 10000, reject));
		})
	},
	previewContactImport: function(rmq, task, objConfig, callback){
		var userId = task.user_id;
		var transactionId = task.general_data.transaction_id;
		var arrPromise = [];

		task.status = 'Task:InProgress';
	    task.progress = '20%';
	    rmq.publish('','events', task);

		var exec = require('child_process').exec,
	    	child = '';


		var arrImportExportCollection = {
			"previewcontacts": {model: "contacts", filter: {check_user_id: true, check_is_active: true, check_transaction_id: true}},
			"previewgroups": {model: "groups", filter: {check_user_id: true, check_is_active: true, check_transaction_id: true}},
			"previewgroupcontacts": {model: "groupcontacts", filter: {check_user_id: true, check_is_active: false, check_transaction_id: true}},
		};

		var arrDatabaseDetails = config.database.split('/');
		var dbName = arrDatabaseDetails.pop();
		var hostname = arrDatabaseDetails.pop();
		var backupFiles = {};

		//create the backup directory
	   	var dataFolder = Date.now(); // in this folder all the data will be present	   	
	   	var outputDataDirectory = config.preview_dir + userId + '/' + dataFolder;
		fs.mkdirpSync(outputDataDirectory);
		
		_.each(arrImportExportCollection, function(toCollection, fromCollection){
			var exportPromise = new Promise(function(resolve, reject){
				// var exportQuery = '{user_id: "'+ userId +'", transaction_id: "'+ transactionId +'", is_active: true }';
				var exportParams = {};
				if(toCollection.filter.check_user_id){
					exportParams.user_id = userId;
				}

				if(toCollection.filter.check_is_active){
					exportParams.is_active = true;
				}

				if(toCollection.filter.check_user_id){
					exportParams.transaction_id = transactionId;
				}

				var outputFile = fromCollection + '.json';
				var filePath  = outputDataDirectory +'/'+ outputFile;
				backupFiles[toCollection.model] = filePath;			
				
				child = exec('mongoexport --host '+ hostname +' --db '+dbName+' --collection '+ fromCollection +' -q \''+JSON.stringify(exportParams)+'\'  --out '+ filePath,
				  function (error, stdout, stderr) {      // one easy function to capture data/errors		    
				    if (error !== null) {									      
			      		reject(error);
				    } else {
			    		resolve(true);
				    }
				});
			});
			arrPromise.push(exportPromise);
		})
		task.status = 'Task:InProgress';
	    task.progress = '60%';
	    rmq.publish('','events', task);
		Promise.all(arrPromise).then(function(resolve){
			return new Promise(function(importPromiseResolve, importPormiseReject){
				if(!_.isEmpty(backupFiles)){
					arrPromise = [];
					_.each(backupFiles, function(fileLocation, toCollection){
						var importPromise = new Promise(function(resolve, reject){						
							child = exec('mongoimport --host '+ hostname +' --db '+dbName+' --collection '+ toCollection +'  --file '+ fileLocation, {maxBuffer : 500 * 1024 * 100}, 
							  function (error, stdout, stderr) {      // one easy function to capture data/errors		    
							    if (error !== null) {									
									reject(error);
							    } else {
						    		resolve({stdout: stdout, stderr: stderr});
							    }
							});
						});
						arrPromise.push(importPromise);
					})

					Promise.all(arrPromise).then(function(resolve){
						importPromiseResolve(resolve);
					})
					.catch(function(reject){
						importPormiseReject(reject)
					})
				} else {
					importPormiseReject({status: 11010})
				}

			})
		})
		.then(function(resolve){
			//This part is for cleaning 
			return new Promise(function(clearDataResolve, clearDataReject){
				//clear all the preview db data
				//backup files
				//collections

				//Load the modal librarys
				var previewContactLibrary = require('../../library/previewcontact');
				var previewGroupLibrary = require('../../library/previewgroup');
				var previewGroupContactLibrary = require('../../library/previewgroupcontact');

				var deleteParams = {
					transaction_id: transactionId
				}
				
				var arrPromise = [];

				arrPromise.push(previewContactLibrary.deleteData(deleteParams));
				arrPromise.push(previewGroupLibrary.deleteData(deleteParams));
				arrPromise.push(previewGroupContactLibrary.deleteData(deleteParams));
				arrPromise.push(fileHelper.deleteFilesOrDirectory(backupFiles));

				Promise.all(arrPromise).then(function(status){
					clearDataResolve(resolve);	
				})
				.catch(function(reject){
					// console.log(reject + "==================== In sub reject");
					//No need to send a reject, as only data is not cleared which will anyhow be going to clear at the end of Month
					clearDataResolve(resolve)
				})
				
			})
		})
		.then(function(resolve){
			task.status = 'Task:InProgress';
		    task.progress = '100%';
		    rmq.publish('','events', task);

		    //Change the empty string if something else need to be shown in the Import history
			callback(true, '');
			// res.json(common.pretty(false, 10001, resolve));		
		})
		.catch(function(reject){
			// console.log(reject + "==================== In main reject");
			callback(false, reject);
			// res.json(common.pretty(false, 10000, reject));
		})
	},
	tmpImportCsv: function(data){	
		var self = this;	
		return new Promise(function(csvImportResolve, csvImportReject){
			var intInsertThreshold = 10000;
	    	var intCounter = 0;

			//for holding mapped contacts
			var arrContact = [];

			var objMapper = {};
			//create the mapper object as per the convinience like {key:value}
			_.each(data.init_params.field_mapping, function(objMapperDetails){
				objMapper[objMapperDetails.key] = objMapperDetails.value;
			});

			//modify the original details
			data.init_params.field_mapping =  objMapper;

			var objFieldMapper = require('../../helpers/import/global_csv').init(data.init_params);
					
			// manual streaming
			var stream = mongoose.model('TempContact').find(data.filter_params).lean().stream({ transform: function(doc){
				return objFieldMapper.mapper(doc, data.init_params);
			}});
			
			stream.on('data', function (doc) {
				if(!_.isEmpty(doc)) {
					intCounter++;
					arrContact.push(doc);
					// console.log(doc);
					// console.log(process.memoryUsage().rss/(1024*1024) + "----- Counter => " + intCounter);
					if(intCounter >= intInsertThreshold){
						stream.pause();
						self.createContact(data, arrContact).then(function(resolve){
							intCounter = 0;
				  			arrContact = [];	
				  			stream.resume();
						}).catch(function(reject){
							csvImportReject('csv imported failed');
						})						
					}
				}				  
			}).on('error', function (err) {
				// handle the error
				csvImportReject(err);			  
			}).on('close', function () {
				self.createContact(data, arrContact).then(function(resolve){
					intCounter = null;
		  			arrContact = null;	
		  			csvImportResolve('csv imported');
				}).catch(function(reject){
					csvImportReject('csv imported failed');
				})
			    	  	
			});
		});
	},
	tmpImportVcf: function(data){
		// mongoose.set('debug', true);
		var self = this;
		// setTimeout(generalHelper.logMemoryUsage(), 500);
		return new Promise(function(vcfImportResolve, vcfImportReject){
			// console.log('acutal parser');
			var objFieldMapper = require('../../helpers/import/vcard');
			var parser = require('vdata-parser');
			var arrobjVcardData = parser.fromFileSync(data.file_path);
			var arrContact = [];
			if(arrobjVcardData.VCARD){
				if(!_.isArray(arrobjVcardData.VCARD)){
					arrobjVcardData.VCARD = [arrobjVcardData.VCARD];					
				}

				// var intCounter = 0;
				_.each(arrobjVcardData.VCARD, function(contact){
					arrContact.push(objFieldMapper.map(contact, data));
				})

				arrobjVcardData = null;

				if(arrContact.length > 0){
					self.createContact(data, arrContact).then(function(resolve){						
			  			arrContact = null;	
			  			vcfImportResolve();
					}).catch(function(reject){
						vcfImportReject('vcf imported failed');
					})		
				} else {
					vcfImportResolve();
				}
			} else {
				//no contacts in  parsed object
				vcfImportResolve();
			}
		})
	},
	//Create group in preview db or main db
	createGroup: function(data){
		var self = this;
		return new Promise(function(resolve, reject){
			mongoose.model(data.config.group).create(data.group_detail, function(err, status) {
			  	if(err) {
			  		reject(err)
			  	} else {
			  		resolve({group_id: status._id});
			  	}
			})
		});
	},
	//create contacts in Preview or main db
	createContact: function(data, contacts){
		var self = this;
		return new Promise(function(previewContactResolve, previewContactReject){
			if(contacts.length > 0){
				// mongoose.model("PreviewContact").collection.insert(contacts, function(err, status) {
				mongoose.model(data.config.contact).collection.insert(contacts, function(err, status) {					
				  	if(err) {					  		
				  		previewContactReject(err);
				  	} else {
				  		contacts = null;
				  		if( _.isArray(status.insertedIds) ) {
				  			self.createGroupContact(data, status).then(function(resolve){
				  				previewContactResolve();
				  			}).catch(function(reject){
				  				previewContactReject();
				  			});
				  		} else {
				  			previewContactResolve();
				  		}
				  	}
				})
			} else {
				previewContactResolve();
			}
			
		})
	},
	//create group contact in preview or main db
	createGroupContact: function(data,contacts){
		var self = this;
		return new Promise(function(groupCreateResolve, groupCreateReject){
			var arrGroupContact = [];
			_.each(contacts.insertedIds, function(contactId){
				var objGroupContact = {
					group_id: data.group_id.toString(),
					user_id : data.user_id,
					transaction_id: data.transaction_id,
					contact_id: contactId.toString(),
					_id: mongoose.mongo.ObjectId()
				};
				arrGroupContact.push(objGroupContact);
			})

			// mongoose.model("PreviewGroupContact").collection.insert(arrGroupContact, function(err, status) {
			mongoose.model(data.config.group_contact).collection.insert(arrGroupContact, function(err, status) {
				if(err) return groupCreateReject(err);
				return groupCreateResolve();				
			});
		})
	},
	//Create header row as contact in case of CSV if asked
	createHeaderAsContact: function(data){
		return new Promise(function(resolve, reject){
			var objTempContact = mongoose.model('TempContact');
			objTempContact.findOne(data.filter_params, function(err, record){
				if(err || record == null){
					return reject(err || null);
				} else {
					var objContact = {
						user_id: record.user_id,
						sources: record.sources,
						transaction_id: record.transaction_id,
						is_active: true
					};

					var arrobjHeaderContact = [];
					
					if(record.tmp_data){
						_.each(record.tmp_data, function(contactData){
							var objHeaderContact = {
								label : contactData.label,
								value : contactData.label
							};
							arrobjHeaderContact.push(objHeaderContact);
						})
					}

					objContact.tmp_data = arrobjHeaderContact;
					objTempContact.create(objContact, function(err, success){
						if(err){							
							reject(err);
						} else {
							resolve(success);
						}
					})
				}
			});
		});
	}

}