'use strict'

/*
* This file exports the contacts to CSV file
*
*/

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose'),
    fs = require('fs'),
    path =require('path'),
    mkdirp = require('mkdirp');




// Load helpers
var common = require('../../helpers/common_helper'),
	contactMapper = require('../../helpers/contact_mapper_helper');


//include the config file
var config = require('../../config/config');

router.route('/')
.post(function(req, res, next){  
	
  var task = {
    name: 'Export CSV',
    type: 'csv-export',
    sub_type: 'google',
    status: 'Task:Waiting',      
    progress: "Waiting",
    user_id: req.user_auth.user_id      
  };

  task.conditions = req.body;

  var params = {
			
			is_active: false
			
		};	
			
					
		mongoose.model('Contact').count(params, function(err, count) {
	    	if (err && !count) {
					callback(false, err);
				} else {
					if(count > 0){
						var limit = 10000;
						var batch_count = Math.ceil(count/limit);
						var promises = [];
						var write_data = [];						
						var progress = 20;
						var processArray = [];
						for(var i=0;i< batch_count; i++){
							processArray.push(i);
						}
						processArray.forEach(function(i){
							var promise = new Promise(function(resolve, reject){
								mongoose.model('Contact').find(params, {}, {skip:i*limit,limit:limit}, function(err, contacts) {									
									if (err) {
										
										resolve(err);
									} else {		
										contactMapper.contactExport(contacts, write_data, task, function(err, data){											
											if(err) {					
												reject(err);
											} else {													
												resolve(data);
											}
									 	});
									}	
								});
							});
							promises.push(promise);						
						});	
						console.log(JSON.stringify(promises));
						Promise.all(promises).then(function(){
							console.log("all promises resolved");
							var exportPath = config.media_base_path + task.user_id + config.exportCsv;	
							
							mkdirp.sync(exportPath);
							console.log('export coontacts data received');
							switch(task.type) {
								case 'vcard-export':
									task.filename = Date.now()+'.vcf';
									fs.writeFileSync(exportPath + '/' + task.filename, write_data.join(''), { encoding: 'utf8' });
									break;
								case 'csv-export':
									task.filename = Date.now()+'.csv';
									var csvWriter = require('csv-write-stream');
									var writer = csvWriter();

									if(task.sub_type == 'google'){
										
										var writer = csvWriter({ headers: arrstrCsvHeader});
										writer.pipe(fs.createWriteStream(exportPath + '/' + task.filename));
										write_data.forEach(function(contact) {
											writer.write(contact);
										});		
										writer.end();

									} else {

										var arrstrCsvHeader = [
											"First Name", 
											"Middle Name",
											"Last Name", 
											"Nickname", 
											"Title", 
											"Emails", 
											"Phones", 
											"Company Name", 
											"Addresses", 
											"Web Pages", 
											"IMs",
											"Others",
											"Updated On"
										];

										var writer = csvWriter({ headers: arrstrCsvHeader});
										writer.pipe(fs.createWriteStream(exportPath + '/' + task.filename));
										write_data.forEach(function(contact) {
											writer.write(contact);
										});		
										writer.end();
									}
									

									
									break;
								default: 
									console.log('ERR=>Task Type not found.');
									callback(false, 'Task Type not found.');
							}														
							
							res.json({status:'success'});
						})
						.catch(function(rejected){
							console.log(rejected.message);
							callback(false, rejected.message);
						});
					} else {
						callback(false, err);
					}
				}
	    });    		
		

});
module.exports = router;

