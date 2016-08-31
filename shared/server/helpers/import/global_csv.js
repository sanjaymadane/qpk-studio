'use strict'

var transformer = require("fast-csv"),
	_ = require("underscore"),
	mongoose = require("mongoose");

//IMport the constant file
var constant = require("../../config/constant.js"),
	config = require("../../config/config");

exports.init = function(params){	
	// this.objSchema = {
	// 	// user_id: params.user_id,		
	// 	// transaction_id: params.transaction_id,
	// 	is_active: true
	// };

	// if(params.sources) {
	// 	this.objSchema.sources = params.sources;
	// }

	// if(params.field_mapping ){
	// 	this.field_mapping = params.field_mapping;
	// }

	// if(params.delimiter){
	// 	this.delimiter = params.delimiter;		
	// }


	// this.contacts = [];	
	return exports;
};

exports.mapper = function(contact,data){
	var objMappedContact = {};
	var objFieldMapper = data.field_mapping;
	var strDelimiter = data.delimiter;
	var self = this;

	try{
		if(contact && contact.tmp_data) {
			_.each(contact.tmp_data, function(record, index){			
				if(_.has(objFieldMapper, record.label) && record.value.length > 0){

					//check if the field mapping is empty or it is a note field
					if( objFieldMapper[record.label].length == 0 || _.indexOf(constant.constContactArrayField, objFieldMapper[record.label].toLowerCase()) > -1 ) {
						// if field value is empty take it into note
						if(objMappedContact['note'] && _.isArray(objMappedContact['note'])) {
							objMappedContact['note'].push(record.value);
						} else {
							objMappedContact['note'] = [];
							objMappedContact['note'].push(record.value);
						}
					} else if(_.indexOf(constant.constContactSingleField, objFieldMapper[record.label].toLowerCase()) > -1) {
						objMappedContact[objFieldMapper[record.label]] = record.value;
					} else {
						var fieldDetails = objFieldMapper[record.label].split(constant.constGlobalFieldSeparator);
						var strField = (fieldDetails[0]) ? fieldDetails[0].toLowerCase() : '';
						var strFieldType = (fieldDetails[1]) ? fieldDetails[1].toUpperCase() : '';

						//Memory release
						fieldDetails = null;

						var arrRecords = null;
						if(strDelimiter && strDelimiter.length > 0 ) {
							arrRecords = record.value.split(strDelimiter);						
						} else {
							arrRecords = record.value;
						}

						var arrobjFieldData = [];

						if(_.isArray(arrRecords)){
							_.each(arrRecords, function(data){
								var objFieldData = {
									label: strFieldType,
									value: data
								}
								arrobjFieldData.push(objFieldData);
							})
						} else {
							var objFieldData = {
								label: strFieldType,
								value: arrRecords,
							}
							arrobjFieldData.push(objFieldData);
						}				
						
						if(objMappedContact[strField] && objMappedContact[strField].length > 0) {
							objMappedContact[strField] = self.mergeData(objMappedContact[strField], arrobjFieldData);	
						} else {
							objMappedContact[strField] = arrobjFieldData;
						}
					}
				}			
			});
		}
	} catch(e){
		console.log("in catch block");
		console.log(e)
		// return objMappedContact;
	} finally {
		// console.log("in the finally: " + Object.keys(objMappedContact).length)
		if(Object.keys(objMappedContact).length > 0) {
			objMappedContact["sources"] = contact.sources;
			objMappedContact["user_id"] = contact.user_id;
			objMappedContact["transaction_id"] = contact.transaction_id;
			objMappedContact["_id"] = contact._id;		
			objMappedContact["is_locked"] = false;
			objMappedContact["is_favorite"] = false;
			objMappedContact["is_active"] =true;
			objMappedContact["created_on"] =  Date.now;
			objMappedContact["updated_on"] = Date.now;
			objMappedContact["profile_pic"] = config.default_profile_pic;
			objMappedContact['note'] = (_.isArray(objMappedContact['note'])) ? objMappedContact['note'].join('\n') : '';
		}		
		return objMappedContact;
	}

};

exports.directLoop = function(arrContactData, objSchema){
	var self = this;
	return new Promise(function(parentResolve, parentReject){
		var contact = objSchema;
		contact._id = mongoose.mongo.ObjectId();		
		var arrobjTmpData = [];
		//map each element to key		
		_.each(arrContactData, function(data, index){			
			var objTmpData = {						
				label:  index,
				value: data
			};			
			
			arrobjTmpData.push(objTmpData);
		});
		
		contact.tmp_data = arrobjTmpData;
		
		// if(self.contacts.length >= 10000){
		mongoose.model('TempContact').collection.insert(contact, function(err, details){
			if(err) {					
				parentResolve();
			} else {
				contact = null;
				parentResolve();		
			}				
		});
		// } else {		
		// 	parentResolve();
		// }
		
	});
};
exports.flush = function(){
	var self = this;
	return new Promise(function(resolve, reject){
		if(self.contacts.length > 0) {
			mongoose.model('TempContact').collection.insert(self.contacts, function(err, details){
				self.contacts = null;
				if(err) {
					console.log(err);
					resolve();	
				} else {					
					resolve();		
				}				
			})
		} else {
			resolve();
		}		
	})
};

exports.mergeData = function(){
 	var arrOriginalData = arguments[0];
	if(arguments.length > 1 ) {
		for(var i=1; i < arguments.length ; i++) {
			if(_.isArray(arguments[i]) == true) {
				_.each(arguments[i], function(data){
					arrOriginalData.push(data);
				})
			}	
		}			
	}		
	return arrOriginalData;
};