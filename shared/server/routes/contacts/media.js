'use strict'
/*
* File Upload router
*/

//load dependency packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    fs = require('fs'),
    path = require('path');

// Load file config 
var config = require('../../config/config');
    
// Load helpers
var common = require('../../helpers/common_helper'),
	media = require('../../helpers/media_helper'),
	fileHelper = require('../../helpers/file_helper');

function check_contact(contact_id, callback) {
	mongoose.model('Contact').findById(contact_id, function (err, contact) {
    if (err) {
      callback(false);
    } else {            
      callback(contact);
    } 
  });
}

function deleteAttachments(attachments){
	if(attachments && attachments.length > 0){
		attachments.forEach(function(attachment){
			if(typeof attachment !== 'undefined'){				  		
	  		var file_path = config.media_base_path + attachment.value.split('uploads/')[1];
  			if (fs.existsSync(file_path)) {
				  fs.unlinkSync(file_path);
				}							  		
	  	}
		});
	}
}

//Map routes
router.route('/picture')
	//Upload the profile pic
	.post( function(req,res,next) {
		media.process_upload(req,res, function(result){
			if(result.status == true) {	
				if(result.is_temp){
					res.json(common.pretty(true, 10001, {contact_id: result.contact_id, profile_pic: result.message}));
				}	else {		
					mongoose.model('Contact').findByIdAndUpdate(result.contact_id, {$set: { profile_pic: result.message }}, function (err, contact) {
			      if (err) {
			        res.json(common.pretty(false, 10000, err));
			      } else {
			    		res.json(common.pretty(true, 10001, {contact_id: result.contact_id, profile_pic: result.message}));
			      }
			   });			
			  }	
			} else {
				res.json(common.pretty(false, 10000, result.message));
			}
		});			
	
	});

router.route('/attachments')
	//Upload the attachments
	.post(function(req,res,next) {
		var contactId = req.query.contact_id;
		var userId = req.user_auth.user_id;
		// var multiparty = require('multiparty');   

	   // var form = new multiparty.Form();
	   // form.parse(req, function(err, fields, files) {

	   //   //here you can read the appropriate fields/files

	   //   console.log(fields);
	   //   if(fields &&  fields['attachments[0][path]'] ) {
	   //   	var generalHelper = require("../../helpers/general_helper");
	   //   	var data = {
	   //   		source_path: fields['attachments[0][path]'],
	   //   		source_file: fields['attachments[0][name]'],
	   //   		sid: req.user_auth.sid
	   //   	}
	   //   	var arrPromise = [];

	   //   	arrPromise.push(generalHelper.nasFileCopy(data));

	   //   	Promise.all(arrPromise).then(function(fileDetails){
	   //   		var strOldPath = config.nas_upload_server_path+ '/' + data.source_file;
	   //   		var strNewPath = config.media_base_path + userId + '/' + contactId + '/attachments/' + Date.now() + '.php';
	   //   		fileHelper.copyFile(strOldPath,strNewPath).then(function(resolve){
	   //   			console.log(resolve + 'file copy success');
	   //   		}).catch(function(reject){
	   //   			console.log(reject);
	   //   		})
	   //   		console.log(fileDetails);
	   //   	}).catch(function(reject){
	   //   		console.log(reject);
	   //   	})
	   //   	console.log("got fields");
	   //   } else {
	     	media.process_multiple_upload(req, res, function(result){
				if(result.status == true) {
					if(result.is_temp){
						res.json(common.pretty(true, 10001, {contact_id: result.contact_id, attachments: result.message}));
					} else {
						mongoose.model('Contact').findByIdAndUpdate(result.contact_id, {$addToSet: { attachments: { $each: result.message } } }, function (err, contact) {
					      if (err) {
					        res.json(common.pretty(false, 10000, err));
					      } else {
					      	res.json(common.pretty(true, 10001, {contact_id: result.contact_id, attachments: result.message}));
					      }
					   });
					}
				} else {
					res.json(common.pretty(false, 10000, result));
				}
			});
	     // }

	     // console.log(files);
	   // });
			
	});

router.route('/attachments/delete')
	.post(function(req, res, next) {
		deleteAttachments(req.body.attachments);
		res.json(common.pretty(true, 10001, "Attachment deleted"));
	});

module.exports = router;