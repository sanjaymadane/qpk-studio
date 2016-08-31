'use strict'

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose'),    
    fs = require('fs'),    
    moment = require('moment');

// Load helpers
var common = require('../../helpers/common_helper'),
	contactMapper = require('../../helpers/contact_mapper_helper'),
	media = require('../../helpers/media_helper');

var publisher = require('../publisher');

// Load file config 
var config = require('../../config/config');

module.exports = {
	processImport: function(rmq, task, callback){
		var self = this;
		task.status = 'Task:InProgress';
	    task.progress = '40%';
	    rmq.publish('','events', task);
	    var contacts = [];
	    if (fs.existsSync(task.file_path)) {
		    switch(task.type){
		    	case 'csv-import':
		    		var csv = require("fast-csv");
		    		var stream = fs.createReadStream(task.file_path); 
					csv
						.fromStream(stream, {ignoreEmpty: true, headers:true})
						.on("data", function(contact){
							contacts.push(contact);	     
						})
						.on("end", function(){
							self.dataHandler(rmq, contacts,task, function(status,err){
								callback(status,err)
							})
						});
					
		    		break;

	    		case 'vcard-import':
	    			var parser = require('vdata-parser');
	    			var arrobjVcardData = parser.fromFileSync(task.file_path);

	    			self.dataHandler(rmq, arrobjVcardData.VCARD,task, function(status, err){
						callback(status,err)
	    			})
	    			break;
		    }
			//once contacts inserted delete file
			fs.unlinkSync(task.file_path);
		} else {
			callback(false, task.file_path + ' not found.');
		}
	},

	dataHandler: function(rmq, contacts, task, callback){			
		contactMapper.contactImport(contacts, task, function(err, data){
			if(err){
				callback(false, err);
			} else {
				task.status = 'Task:InProgress';
        task.progress = '80%';
        rmq.publish('','events', task);
        var groupDetails = {	              	
          user_id: task.user_id
        }

        switch(task.type){
        	case 'vcard-import':
        		groupDetails.name = task.filename + '_VCARD_'+ moment().format('YYYYMMDD_HHmmssSSS');
        		break;
        	case 'csv-import':
        		groupDetails.name = task.filename + '_CSV_'+ moment().format('YYYYMMDD_HHmmssSSS');
        		break;
        }

        mongoose.model('Group').create(groupDetails, function (err, group) {
					if (err) {
						callback(false, err);  
					} else {
		        mongoose.model('Contact').collection.insert(data ,function(err, docs){
							if(err){
								callback(false, err);
							} else {
		          	var groupContacts = [];
              	data.forEach(function(ct){
                	groupContacts.push({
                    user_id: task.user_id,
                    group_id: group._id.toString(),
                    contact_id: ct._id.toString()
                	});
              	});
                mongoose.model('GroupContact').collection.insert(groupContacts, function(err, docs){
                	if(err)
                    callback(false, err);  
                  else {
                    task.status = 'Task:InProgress';
                    task.progress = '100%';        
                    rmq.publish('','events', task);
                    callback(true, task.filename);
                	}
                });
							}
		        });
					}
        }); 
			}
		});					
	}
}