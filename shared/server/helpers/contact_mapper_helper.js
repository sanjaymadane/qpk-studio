 'use strict';
/*
* This helper will be used to map import contacts to the local store object and vice versa
*
*/

var _= require('underscore'),
	mongoose = require('mongoose'),
	fs=  require('fs-extra');

//load helpers
var downloadFile = require('./download_file_helper');

// Load file config 
var config = require('../config/config');

module.exports = {

	googlemapper: function(contacts, data, cb ){
		//Load google helper
		var contentMapper = require('./import/google');
		var self = this;
		var mappedContacts = [];
		if(contacts && contacts.length > 0){
			var mapperPromise = new Promise(function(resolve, reject){
				contacts.forEach(function(contact, index) {		       
					// console.log(contact.toString());					
					var mappedContact = {
						_id: mongoose.mongo.ObjectId(),
						user_id: data.user_id
					};
					_.extend(mappedContact, self.commondata());
					mappedContacts.push(contentMapper.map(mappedContact, contact));
				});
				resolve(true);
			});
						
			mapperPromise.then(function(resolve){
				//Download Profile Pic
				var arrobjProfilePicDownloadPromise = [];
				mappedContacts.forEach(function(contact, index){					
					var objProfilePicDownloadPromise = new Promise(function(picResolve, picReject){
						if(contact.profile_pic && contact.profile_pic.length > 0) {
							//pic download
							var options = {
							 		url: contact.profile_pic,
									headers: {
									  'Authorization': 'OAuth '+ data.token
									}
								};

							var dir_path = config.media_base_path + contact.user_id + '/' + contact._id;							
							downloadFile.download(options, dir_path + '/' + contact._id + config.profile_pic_default_ext).then(function(resolve){								
								if(resolve.status){
								 	mappedContacts[index].profile_pic = config.media_absulute_path + contact.user_id + '/' + contact._id +'/'+ contact._id + config.profile_pic_default_ext;	

									//initialize history array
									mappedContacts[index].profile_pic_history = [];

									//Build absolute and relative paths 
									var relativeHistoryPath =  config.media_absulute_path + contact.user_id + '/' + contact._id + '/history/' + Date.now() + config.profile_pic_default_ext;
									var absoluteHistoryPath = config.media_base_path + contact.user_id + '/' + contact._id + '/history/' + Date.now() + config.profile_pic_default_ext;
									var absoluteProfilePicPath = config.media_base_path + contact.user_id + '/' + contact._id +'/'+ contact._id + config.profile_pic_default_ext;
									//Make a copy of the image
									fs.copySync(absoluteProfilePicPath, absoluteHistoryPath);
									//Push history path in the the history array
									mappedContacts[index].profile_pic_history.push(relativeHistoryPath);
		                            
									picResolve(true);	
								} else {
									delete(mappedContacts[index].profile_pic);
									picResolve(true);
								}
								
								
							})
							.catch(function(reject){								
								delete(mappedContacts[index].profile_pic);
								picReject(reject);
							});
							
						} else {
							if(mappedContacts[index].profile_pic)
								delete(mappedContacts[index].profile_pic);

							picResolve(true);
						}
					});
					arrobjProfilePicDownloadPromise.push(objProfilePicDownloadPromise);
				});

				Promise.all(arrobjProfilePicDownloadPromise).then(function(resolve){
					process.nextTick(function() {
			          cb( null, mappedContacts);     
			        });
					
				})
				.catch(function(reject){
					console.log("Error downloading profile pics" + reject);
					process.nextTick(function() {
			          cb( null, mappedContacts);     
			        });
				});
			})
			.catch(function(reject){				
				process.nextTick(function() {
		          cb( null, mappedContacts);     
		        });
			})			
		} else {
			process.nextTick(function() {
	          cb( null, mappedContacts);     
	        });
		}		
	},
	contactExport: function(contacts, write_data, task, cb){
		var contentMapper = null;
		switch(task.type){
			case 'vcard-export':
				contentMapper = require("./export/vcard");		
				break;
			case 'csv-export':
				
				if(task.sub_type && task.sub_type == 'google'){					
					contentMapper = require("./export/google_csv");
				} else {
					contentMapper = require("./export/csv");
				}
				
				break;
			default:				
				cb({err: 'type', message:'Unable to find valid task type'}, write_data);
		}
		
		if(contacts && contacts.length > 0) {
			var promises = []
			contacts.forEach(function(contact, index){
				var promise = new Promise(function(resolve, reject){
					write_data.push(contentMapper.map(contact))					
					resolve();
				});
				promises.push(promise);
			});
			Promise.all(promises).then(function(){
				cb(null, write_data);
			});			
		} else {
			cb({err: 'nocontact', message:'No contact found'}, write_data);
		}
	},
	contactImport: function(contacts, task, cb){
		var contentMapper = null;
		switch(task.type){
			case 'csv-import':
				contentMapper = require("./import/csv");
				break;
			case 'vcard-import':
				contacts = (_.isArray(contacts) ? contacts: [contacts]);		
				contentMapper = require("./import/vcard");
				break;
		}

		var mappedContacts = [];
		var self = this;
		if(contacts && contacts.length > 0){
			contacts.forEach(function(contact ) {				
				var mappedContact = {
					_id: mongoose.mongo.ObjectId(),
					user_id: task.user_id
				};
				_.extend(mappedContact, self.commondata());
				mappedContacts.push(contentMapper.map(mappedContact, contact, task));
			});			
			cb( null, mappedContacts);
		} else {
			cb( null, mappedContacts);
		}
	},
	commondata: function(){
		return {
			is_locked: false,
			is_favorite: false,
			is_active:true,
			created_on: Date.now,
			updated_on: Date.now
		}
	}
}