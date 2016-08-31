'use strict'

/****************Contacts Helper********************
*	This Helper is being written for all the contacts operation
*	Reason: All the operations regarding contacts should be at one  place
* 	Like
*		Purify Contact Data
*		Merge Contact	
*	Created On: 03/08/16
*	Created by: Murtuza Kothawla
****************************************************/

var _ = require("underscore"),
	moment = require('moment'),
	mongoose = require('mongoose');
var phoneNo = require('./phone_number_helper');

//Require constant
var constant = require("../config/constant");
module.exports = {

	//this function is used to purify the empty data, that is not required to store in the db
	//Also if any modification needs to be done with the data
	purifyAndModifyContactDetail: function(arrobjContact){
		return new Promise(function(resolve, reject){
			try {
				var arrobjReturnContact = [];
				if(!_.isArray(arrobjContact)){
					arrobjContact = [arrobjContact];
				}
				if(arrobjContact.length > 0) {
					_.each(arrobjContact, function(objContact){
						//iterate over all the fields and remove empty data for multiple fields
						var objModifiedFields = {};
						_.each(objContact, function(value, key){
							if(_.indexOf(constant.constContactMultipleField, key) > -1){					
								var arrobjModifiedValue = [];
								_.each(value, function(valueDetail){						
									if(valueDetail.value && false == _.isEmpty(valueDetail.value) ){									
										if(key == "phones"){
											valueDetail.country_code = 	phoneNo.getCountryCode(valueDetail.value);
										}
										arrobjModifiedValue.push(valueDetail);
									}
								});
								objModifiedFields[key] = arrobjModifiedValue;
							} else {
								objModifiedFields[key] = value;
							}
						})
						arrobjReturnContact.push(objModifiedFields);
					});

					// console.log(arrobjReturnContact);
					// console.log(arrobjReturnContact[0].phones);

					if(arrobjReturnContact.length > 1){
						resolve(arrobjReturnContact);	
					} else {
						resolve(arrobjReturnContact[0]);
					}					
				} else {
					resolve(arrobjReturnContact);
				}				
				// return arrobjReturnContact;	
			} catch(e) {
				// console.log(e);
				reject(e);
			}
			
		});		
	},
	//this will take an array of contacts and will return the merged contact ex: Input[ [ {},{},{} ] ]
	mergeContact: function(arrobjDuplicateContact, cb){
		var self = this;
		var arrMergedContact = [];
		if(_.isArray(arrobjDuplicateContact) == true){			
			arrobjDuplicateContact.forEach(function(arrobjContact){
				var objMergedContact = null;
				var arrDuplicateData = [];
				//loop again for the contacts array obj
				arrobjContact.forEach(function(objContact){
					if(objMergedContact){							
						if(objMergedContact.updated_on && objContact.updated_on ){
							//Initial contact is older than this
							arrDuplicateData.push(objMergedContact);
							objMergedContact = objContact;
						} else {
							//Initial contact is the latest
							arrDuplicateData.push(objContact);
						}
					} else {
						objMergedContact = objContact;
					}
				});
				// console.log(objMergedContact);
				// //Start of merge procedure
				arrDuplicateData.forEach(function(objContact){
					if(!objMergedContact.fname){
					    objMergedContact.fname = (objContact.fname) ? objContact.fname : '';
					}
					if(!objMergedContact.mname){
						objMergedContact.mname = (objContact.mname) ? objContact.mname : '';
					}
					if(!objMergedContact.lname){
						objMergedContact.lname = (objContact.lname) ? objContact.lname : '';
					}
					if(!objMergedContact.title){
						objMergedContact.title = (objContact.title) ? objContact.title : '';
					}
					if(!objMergedContact.nickname){
						objMergedContact.nickname = (objContact.nickname) ? objContact.nickname : '';
					}
					if(!objMergedContact.company_name){
						objMergedContact.company_name = (objContact.company_name) ? objContact.company_name : '';
					}
					if(!objMergedContact.profile_pic){
						objMergedContact.profile_pic = (objContact.profile_pic) ? objContact.profile_pic : '';
					}
					if(!objMergedContact.note){
						objMergedContact.note = (objContact.note) ? objContact.note : '';
					}

					try{
						objMergedContact = self._processMergeObj(objMergedContact, objContact, 'addresses');
						objMergedContact = self._processMergeObj(objMergedContact, objContact, 'web_pages');
						objMergedContact = self._processMergeObj(objMergedContact, objContact, 'emails');
						objMergedContact = self._processMergeObj(objMergedContact, objContact, 'attachments');
						objMergedContact = self._processMergeObj(objMergedContact, objContact, 'im');
						objMergedContact = self._processMergeObj(objMergedContact, objContact, 'phones');
						objMergedContact = self._processMergeObj(objMergedContact, objContact, 'events');
						objMergedContact = self._processMergeObj(objMergedContact, objContact, 'others');						
					} catch(err) {
						console.log(err);
					}
				});

				//set the id for the merged contact
				objMergedContact._id = 	mongoose.mongo.ObjectId();
						  
			  	arrMergedContact.push(objMergedContact)			  
			})
		}
		cb(null, arrMergedContact);
	},
	_processMergeObj: function(mContact, tContact, key){
		if(mContact[key]){
		    if(tContact[key] && tContact[key].length > 0){
		      tContact[key].forEach(function(a){
		        var found = _.find(mContact[key], function(b){
		          switch(key){
		            case "addresses":
		            case "events":
		            case "im":
		            case "others":
		              // Compare label & value
		              return b.value == a.value && b.label == a.label;
		              break;
		            case "emails":
		            case "phones":
		            case "attachments":
		            case "web_pages":
		              // Compare only value
		              return b.value == a.value;
		              break;            
		          }
		        });
		        if(typeof found == 'undefined'){
		          mContact[key].push(a);
		        }        
		      });
		    }    
		}
		return mContact;
	}
}