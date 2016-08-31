'use strict'

/****************************
* 	Restore creater and manager
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
	restoreSnapshot: function(userid, snapshotDetails, callback){
		var arrPromise = [];
		var arrDatabaseDetails = config.database.split('/');
		var dbName = arrDatabaseDetails.pop();
		var hostname = arrDatabaseDetails.pop();
		
		//create the backup directory
	   	var media = '/public'; //in this folder all the media will be copied	   	
	   	var inputDataDirectory = config.snapshot_dir + userid + '/' + snapshotDetails.data_directory;
	   	var inputMediaDirectory = inputDataDirectory + media;
	   	var outputMediaDirectory = config.media_base_path +userid;

	   	//create the output\input media directory if not exists
	   	fse.mkdirpSync(inputMediaDirectory);
	   	fse.mkdirpSync(outputMediaDirectory);
	   	console.log('data is restoring');
		
		//First clear all the old data		
		var arrdeletePromise = [];
		var params = {user_id: userid};
		//Clear all the models data
		_.each(constant.constModels, function(dbModels, nodeModels){
			var deletePromise = new Promise(function(resolve, reject){
				//delete all the existing data
				
		      	mongoose.model(nodeModels).remove(params, function(err, ress){
		      		if(err) {
		      			// console.log('error deleting contacts' + err)
		      			reject(err);
		      		} else {
		      			// console.log('All user documents cleared' + ress);
		      			resolve(ress);
		      		}
		      	});
			});
			arrdeletePromise.push(deletePromise);
		})

		//delete all the files
		var fileDeletionPromise = new Promise(function(resolve,reject){
			fileCopy.getFileListing(outputMediaDirectory, function(err, fileList){
				if(err) {
					reject(err)
				} else {
					if(fileList.files.length > 0) {
						fileList.files.forEach(function(file){
							fse.unlinkSync(file);
							resolve();
						})
					} else {
						resolve();
					}
				}
			})	
		});
		arrdeletePromise.push(fileDeletionPromise);
		

		Promise.all(arrdeletePromise).then(function(resolve){
			//all data deleted
			var copydata = new Promise(function(resolve, reject){
				fileCopy.copyMedia( inputMediaDirectory, outputMediaDirectory, function(err, data){
					if(err) {
						reject(err);
					} else {
						resolve(data);
					}
				})
			});
			arrPromise.push(copydata);

			if(snapshotDetails.file_list.length > 0) {
				snapshotDetails.file_list.forEach(function(file){
					var arrFileDetails = file.split('/');
					var modelName = arrFileDetails[0];
					var filePath = inputDataDirectory +'/'+ file;					
					var restorePromise = new Promise(function(resolve,reject){
						if(fse.existsSync(filePath)){
							child = exec('mongoimport --host '+ hostname +' --db '+dbName+' --collection '+ modelName +'  --file '+ filePath, {maxBuffer : 500 * 1024 * 100}, 
							  function (error, stdout, stderr) {      // one easy function to capture data/errors		    
							    if (error !== null) {									
									reject(error);
							    } else {
						    		resolve({stdout: stdout, stderr: stderr});
							    }
							});
						} else {
							resolve({file: filePath ,is_exists: false});
						}
					});
					arrPromise.push(restorePromise);
				});
			}
			
			Promise.all(arrPromise).then(function(resolve){				
				callback(null, resolve);
			}).catch(function(reject){				
				callback(reject);
			})			
		}).catch(function(data){
			console.log("Rejections due to errore"+data);
			callback(data);
		})
	}
}