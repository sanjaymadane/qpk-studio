'use strict'

/****************************
* 	Snap shot creater and manager
*
****************************/
var path = require('path'),
	util = require('util'),
    exec = require('child_process').exec,
    mongoose = require('mongoose'),
    fse = require('fs-extra'),
    _ = require('underscore'),
    child = '';

// Load helpers
var fileCopy = require('../../helpers/file_helper');

//load the config file
var config = require('../../config/config.js'),
	constant = require('../../config/constant.js');

module.exports = {

	createSnapshot: function(userid, filename, callback){
		var snapshotData = {};			
		var arrPromise = [];
		var arrDatabaseDetails = config.database.split('/');
		var dbName = arrDatabaseDetails.pop();
		var hostname = arrDatabaseDetails.pop();
		var backupFiles = [];

		//create the backup directory
	   	var media = '/public'; //in this folder all the media will be copied
	   	var dataFolder = Date.now(); // in this folder all the data will be present	   	
	   	var outputDataDirectory = config.snapshot_dir + userid + '/' + dataFolder;
	   	var outputMediaDirectory = outputDataDirectory + '/'+ media;
	   	
	   	//create the data directory 
	   	fse.mkdirpSync(config.media_base_path + userid);
	   	fse.mkdirpSync(outputDataDirectory);
		var copydata = new Promise(function(resolve, reject){
			fileCopy.copyMedia( config.media_base_path + userid, outputMediaDirectory, function(err, data){
				if(err) {					
					reject(err);
				} else {					
					resolve(data);
				}
			})
		});
		arrPromise.push(copydata);
				
		//Get User data from mongo	  
		_.each(constant.constModels, function(dbModels, nodeModels){			
			var data = new Promise(function(resolve, reject){
				var params = {
					user_id: userid
				}
				mongoose.model(nodeModels).count(params, function(err,count){
					if(err) {
						reject(err);
					} else {						
						if(count > 0) {
							var limit = 5000;
							var fileCount = Math.ceil(count/limit);
							var arrDataPromise = [];

							//Output folder for respective models
							var modelDirectory = outputDataDirectory + '/' + dbModels;
							fse.mkdirpSync(modelDirectory)
							for(var i = 0; i < fileCount; i++) {
								var dataPromise = new Promise(function(resolve, reject){
									var exportQuery = '{user_id: "'+ userid +'"}';
									var outputFile = dbModels+ '_'+ i + '.json';
									var filePath  = modelDirectory+'/'+ outputFile;

									backupFiles.push(dbModels + '/' + outputFile);
									child = exec('mongoexport --host '+ hostname +' --db '+dbName+' --collection '+ dbModels +' -q \''+exportQuery+'\' --limit '+ limit +' --skip '+ limit * i +' --out '+ filePath,
									  function (error, stdout, stderr) {      // one easy function to capture data/errors		    
									    if (error !== null) {									      
									      reject(error);
									    } else {
									    	resolve(true);
									    }
									});
								});
								arrDataPromise.push(dataPromise);
							}

							Promise.all(arrDataPromise).then(function(data){
								resolve(data);
							}).catch(function(error){
								reject(error);
							})							
						} else {
							resolve(true);
						}						
					}

				})
				
			});
			arrPromise.push(data);
		});


		Promise.all(arrPromise)
		.then(function(resolve){
			// console.log(JSON.stringify(snapshotData));
			var strDataFileName = 'meta.json';

			//Create the snapshot object
			var objSnapshot = {};
			objSnapshot.user_id = userid;
			objSnapshot.display_name = filename;
			objSnapshot.data_directory = dataFolder;			
			objSnapshot.file_list = backupFiles;
			objSnapshot.mycnt_version = config.api_version;
			objSnapshot.is_completed = true;
			objSnapshot.is_active = true;
			mongoose.model('SnapshotHistory').create(objSnapshot, function(err, data){
				if(err) callback(err);

				//Create the meta element in the data file
				snapshotData.meta = objSnapshot;
				fse.writeJson(outputDataDirectory +'/' + strDataFileName, JSON.stringify(snapshotData), function (err) {
				  if(err) {				  	
				  	callback(err);
				  }  else {
				  	delete data.file_list;	
				  	callback(null, data);
				  }
				});
			});
		})
		.catch(function(reject){			
			callback(reject);
		})
	}
}