'use strict'

/*
* This file exports the contacts to CSV file*
*/

// Load dep packages
var mongoose = require('mongoose'),
    fs = require('fs'),
    _ = require('underscore'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    util = require('util');

var publisher = require('../publisher');
// Load helpers
var common = require('../../helpers/common_helper'),
	contactMapper = require('../../helpers/contact_mapper_helper'),
	fileHelper = require('../../helpers/file_helper');

// // Load file config , constant file - constant value for example CSV
var config = require('../../config/config'),
	constantExport = require('../../config/constant/csv');



module.exports = {
	publishMessage: function(rmq, message, progress){
		message.status = 'Task:InProgress';
	  	message.progress = progress;
	  	rmq.publish('','events', message);
	},
	processExport: function(rmq, task, callback) {
		var self = this;
		var params = {
			user_id: task.user_id,
			is_active: true,
			is_locked: false
		};
		var pro = new Promise(function(resol, reje){

			if(task.conditions && task.conditions.is_active == false)
				params.is_active = false;

			if(task.conditions && task.conditions.is_locked)
				params.is_locked = true;
			else
				params.is_locked = false;

			if(task.conditions && task.conditions.is_favorite)
				params.is_favorite = true;

			self.publishMessage(rmq, task, '10%');
			if(task.conditions && task.conditions.contact_ids && task.conditions.contact_ids.length > 0){
				params._id = {"$in": task.conditions.contact_ids};
				resol();
			} else if(task.conditions && task.conditions.group_ids && task.conditions.group_ids.length > 0){
				mongoose.model('GroupContact').find({user_id: task.user_id, group_id: {"$in": task.conditions.group_ids}}, function (err, contacts) {
		      if (err) {
		        callback(false, err);
		        resol();
		      } else {
		        var contact_ids = _.map(contacts, function(contact){ return contact.contact_id});
						params._id = {"$in": contact_ids};
						resol();
					}
				});
			} else{
				resol();
			}
		});
		pro.then(function(){
			mongoose.model('Contact').count(params, function(err, count) {
	    	if (err && !count) {
					callback(false, err);
				} else {
					if(count > 0){
						var limit = 100000;
						var batch_count = Math.ceil(count/limit);
						var promises = [];
						var arrExportFile = [];						
						self.publishMessage(rmq, task, '20%');
						var progress = 20;
						var processArray = [];
						for(var i=0;i< batch_count; i++){
							processArray.push(i);
						}
						var objFieldMapper = null;
						var strWriteableFunction = null;
						var strExtension = null;
						var arrHeaders = [];
						var writeLimit = 10000;
						var maxColumnCount = null;

						var configPromise  = new Promise(function(configResolve, configReject){
							switch(task.type) {
								case 'vcard-export':
									objFieldMapper = require("../../helpers/export/vcard");
									strWriteableFunction = 'fileWriteStream';
									strExtension = ".vcf";
									writeLimit = 5000;

									configResolve();
									break;
								case 'csv-export':							
									strWriteableFunction = 'csvFileWriteStream';
									strExtension = ".csv";
									
									if(task.sub_type == 'google'){
										objFieldMapper = require("../../helpers/export/google_csv");
										self.getMultipleColumnCount(params).then(function(googleMetaResolve){
											maxColumnCount = googleMetaResolve[0];										
											self.getGenerateGoogleHeader(maxColumnCount).then(function(headerResolve){
												arrHeaders = headerResolve;
												configResolve();
											}).catch(function(headerReject){
												// return callback(false, headerReject);
												configReject(headerReject);
											});
										}).catch(function(googleMetaReject){
											// return callback(false, googleMetaReject);
											configReject(googleMetaReject);
										})
									} else {										
										arrHeaders = constantExport.mycontacts();
										objFieldMapper = require("../../helpers/export/csv");
										configResolve();
									}
									break;
							}
						});
						

						
						configPromise.then(function(configSetResolve){
							// console.log(arrHeaders);
							//create a directory for file writing
							var strName = Date.now();
							var exportPath = config.media_base_path + task.user_id + config.exportCsv;
							var outputDirectory = exportPath + '/' + strName;
							mkdirp.sync(outputDirectory);

							processArray.forEach(function(i){
								var promise = new Promise(function(resolve, reject){
									// var intCurrentWritten  = 0;
									var arrMappedContact = [];
									if(arrHeaders.length > 0){
										arrMappedContact.push(arrHeaders);
									}
									
									var strFilePath = outputDirectory + '/' + strName + '_' + i + strExtension;

									var intCounter = 0;
									// manual streaming
									var stream = mongoose.model('Contact').find( params, {}, {skip:i*limit,limit:limit} ).lean().stream({ transform: function(doc){
										return objFieldMapper.map(doc, maxColumnCount);
									}});

									stream.on('data', function (doc) {
										intCounter++;
										// console.log(process.memoryUsage().rss/(1024*1024) + "-----------" + arrMappedContact.length + " => " + i + "::::Currently written =>" + writeLimit * intCurrentWritten);
								  		arrMappedContact.push(doc);
								  		if(intCounter > writeLimit) {
								  			// intCurrentWritten++
								  			stream.pause();
							  				fileHelper[strWriteableFunction](strFilePath, arrMappedContact).then(function(){
							  					intCounter = 0;
							  				 	arrMappedContact = [];
							  				 	stream.resume();
							  				})
							  				.catch(function(){
							  					stream.resume();
							  				})
								  			
								  		}
									}).on('error', function (err) {
										// handle the error
										reject(err);			  
									}).on('close', function () {
									  	// the stream is closed
									  	arrExportFile.push(strFilePath);
									  	if(arrMappedContact.length > 0) {
									  		fileHelper[strWriteableFunction](strFilePath, arrMappedContact).then(function(writableResolve){
							  				 	arrMappedContact = null;
												resolve(true);
							  				});
									  	} else {
									  		resolve(true);
									  	}
									});
								});
								promises.push(promise);						
							});
							
							Promise.all(promises).then(function(){
								if(arrExportFile.length > 0) {
									if(arrExportFile.length > 1 ){
										fileHelper.zipDirectory(task.user_id, outputDirectory).then(function(resolve){
											task.filename = resolve.zipname;
											self.publishMessage(rmq, task, '100%');
											callback(true, resolve.zipname);
										}).catch(function(reject){
											console.log(reject);
											self.publishMessage(rmq, task, '100%');
											callback(false, reject);
										});
									} else {
										var fileName = path.basename(arrExportFile[0]).split("_")[0] + path.extname(arrExportFile[0]);
										task.filename = fileName;
										fileHelper.moveFile( arrExportFile[0] , exportPath + '/' + fileName).then(function(resolve){
											self.publishMessage(rmq, task, '100%');
											callback(true, fileName);
										})
									}
								} else {
									callback(false, "No file created");
								}							
							})
							.catch(function(rejected){
								console.log(rejected.message);
								callback(false, rejected.message);
							});
						}).catch(function(configSetReject){
							console.log(configSetReject);
							callback(false, configSetReject);
						});						
					} else {
						callback(false, err);
					}
				}
	    });    		
		})
	},
	getMultipleColumnCount: function(filterRecords){
		return new Promise(function(columnCountResolve,columnCountReject){
			//get the columns counts
			var arrobjColumnCountParams = [
				{
					$match: filterRecords
				},
				{ 
					$project: {  
						emailCount: { $cond: { if: { $gt: [ "$emails", null ] }, then: { $size: "$emails" }, else: 0 }}, 
						phoneCount:{ $cond: { if: { $gt: [ "$phones", null ] }, then: {$size:"$phones"}, else: 0 }}, 
						webPageCount: { $cond: { if: { $gt: [ "$web_pages", null ] }, then: {$size:"$web_pages"}, else: 0 }}, 
						imCount: { $cond: { if: { $gt: [ "$im", null ] }, then: {$size:"$im"}, else: 0 }}, 
						eventCount: { $cond: { if: { $gt: [ "$events", null ] }, then: {$size:"$events"} , else: 0 } }, 
						otherCount: { $cond: { if: { $gt: [ "$others", null ] }, then: {$size: "$others"}, else: 0 } }
					} 
				},						
				{	
					$group:  
						{_id: null, maxEmails: {$max: "$emailCount"}, maxPhones:{$max:"$phoneCount"}, maxWebPage: {$max: "$webPageCount"}, maxIm: {$max: "$imCount"}, maxEvent: {$max: "$eventCount"}, maxOther: {$max: "$otherCount"} }
				}
			]

			mongoose.model('Contact').aggregate(arrobjColumnCountParams,function (err, arbitaryCoulmnCounts){
				if(err){
					columnCountReject(err);
				} else {
					columnCountResolve(arbitaryCoulmnCounts);
				}

			});
		});
	},
	getGenerateGoogleHeader: function(multiColumnCount){
		return new Promise(function(headerResolve, headerReject){
			var arrHeader = [];
			var arrobjRawHeader = constantExport.googleCsvFields();

			_.each(arrobjRawHeader.singleField, function(value){
				arrHeader.push(value);
			})

			//generate multiple field data
			if(multiColumnCount.maxEvent && multiColumnCount.maxEvent > 0){
				for (var i = 1; i <= multiColumnCount.maxEvent; i++) {
					arrHeader.push(util.format(arrobjRawHeader.multiple_event.label, i));
					arrHeader.push(util.format(arrobjRawHeader.multiple_event.value, i));
				}
			}
			if(multiColumnCount.maxOther && multiColumnCount.maxOther > 0){
				for (var i = 1; i <= multiColumnCount.maxOther; i++) {					
					arrHeader.push(util.format(arrobjRawHeader.multiple_custom.label, i));
					arrHeader.push(util.format(arrobjRawHeader.multiple_custom.value, i));
				}
			}
			
			headerResolve(arrHeader);
		});
	}
}
