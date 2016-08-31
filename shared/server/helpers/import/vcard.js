'use strict'

/*
* Parser is written for VCARD V:3.0
* Field specifiction for vCard can be check on http://www.evenx.com/vcard-3-0-format-specification
* http://alessandrorossini.org/2012/11/15/the-sad-story-of-the-vcard-format-and-its-lack-of-interoperability/
*
* Created On : 28/04/2016
* Created By: Murtuza
*
*/

var _ = require('underscore'),
    wildcard = require('wildcard'),
    phoneHelper = require('../phone_number_helper'),
    mongoose = require('mongoose');

var config = require('../../config/config');

var arrType = ['HOME','WORK','OTHER'];

module.exports = {

	map: function(contact, task){
		this.contact = contact;
		this.mappedContact = {};

		//This will be for getting the remaining fields
		this.arrextractKey = [];
		this.task = task;

		//get data for the contacts
		this.getCommonData();
		this.getName();
		this.getEmail();
		this.getPhone();
		this.getCompany();
		this.getAddress();
		this.getBirthday();
		this.getWebPage();
		this.getIms();
		this.getSourcesInfo();
		this.getNote();
		// console.log(this.contact);
		return this.mappedContact;
	},
	getName: function(){		
		// VCARD: N:Lname;Fname;Mname;title;suffix		
		var strName = '';
		if(this.contact['N'] ) {
			if( _.isObject(this.contact['N']) ) {
				strName = this.contact['N'].value;	
			} else if(_.isString(this.contact['N'])) {
				strName = this.contact['N'];
			}			
		}

		if(! _.isEmpty(strName)) {
			var arrstrName = strName.split(';');		
			if(arrstrName.length >= 4){
				this.mappedContact.lname = arrstrName[0];
				this.mappedContact.fname = arrstrName[1];
				this.mappedContact.mname = arrstrName[2];			
				this.mappedContact.title = arrstrName[3];

				this.arrextractKey.push('N');
			} else if(_.isString(this.contact['FN'])){
				this.mappedContact.fname = this.contact['FN'];				
				this.arrextractKey.push('FN');
			} else if(arrstrName.length > 0) {
				this.mappedContact.lname = (arrstrName[0]) ? arrstrName[0]:'';
				this.mappedContact.fname = (arrstrName[1]) ? arrstrName[1]:'';
				this.mappedContact.lname = (arrstrName[2]) ? arrstrName[2]:'';
				this.mappedContact.lname = (arrstrName[3]) ? arrstrName[3]:'';

				this.arrextractKey.push('N');
			}
		}
		
		
	},
	getEmail: function(){
		var arrEmails = [];		
		//merge elements
		arrEmails = this.mergeData(arrEmails, this.getFieldData('EMAIL'), this.getFieldData('*.EMAIL'));
		this.mappedContact.emails = arrEmails;
	},
	getPhone: function(){
		var arrPhone = [];
		arrPhone = this.mergeData(arrPhone, this.getFieldData('TEL'), this.getFieldData('*.TEL'));
		if(arrPhone.length > 0){			
		  arrPhone.forEach(function(phone, index){
		    // phoneNo.getCountryCode(phone.value)
		    arrPhone[index].country_code = phoneHelper.getCountryCode(phone.value);
		  });
		}
		this.mappedContact.phones = arrPhone;
	},
	getCompany: function(){
		if(this.contact['ORG']) {
			if(_.isObject(this.contact['ORG']))
				this.mappedContact.company_name = this.contact['ORG'].value;
			else if(_.isString(this.contact['ORG'])) {
				this.mappedContact.company_name = this.contact['ORG'];
			}
			this.arrextractKey.push('ORG');
		}

	},
	getAddress: function(){
		var arrstrAddress = [];
		arrstrAddress = this.mergeData(arrstrAddress, this.getFieldData('ADR'), this.getFieldData('*.ADR'));
		this.mappedContact.addresses = arrstrAddress;				
	},
	getBirthday: function(){		
		var arrEvents = [];
		if(this.contact['BDAY']) {
			var objBDay = {};
			objBDay.label = 'BIRTH_DATE';
			if(_.isObject(this.contact['BDAY']) ) {
				objBDay.value = this.contact['BDAY'].value;
			} else if(_.isString(this.contact['BDAY'])) {
				objBDay.value = this.contact['BDAY'];	
			}
			arrEvents.push(objBDay);

			this.arrextractKey.push('BDAY');
		}
		this.mappedContact.events = arrEvents;
	},
	getWebPage: function(){
		var arrWebPage = [];
		arrWebPage = this.mergeData(arrWebPage, this.getFieldData('URL'), this.getFieldData('*.URL'));
		this.mappedContact.web_pages = arrWebPage;
	},
	getIms: function(){
		var arrstrIm = [];
		arrstrIm = this.mergeData(arrstrIm, this.getFieldData('IMPP', 'X-SERVICE-TYPE'), this.getFieldData('*.IMPP','X-SERVICE-TYPE'));
		this.mappedContact.im = arrstrIm;
	},
	getOther: function(){
		// this.mappedContact.others = this.contact
	},
	getSourcesInfo: function() {
		var sources = [];
		sources.push({
			value: this.task.filename,
			label: 'Vcard Import'
		});
		this.mappedContact.sources = sources;
	},
	getNote: function(){
		var self = this;
		var note = [];
		_.each(this.contact, function(fieldData, fieldLabel){
			//check if not find in the extract key
			if(self.arrextractKey.indexOf(fieldLabel) == -1) {
				if( _.isObject(fieldData) == true) {
					note.push(fieldLabel + " :::  " + fieldData.value)
				} else if(_.isString(fieldData)) {
					note.push(fieldLabel + " :::  " + fieldData)
				}
			}
		});
		self.mappedContact.note = note.join('\n');
	},
	getFieldData: function(strFieldLabel, strFieldLabelContent){
		var self = this;
		var arrData = []
		var arrobjData = [];
		
		//Check whether field is present or not
		var arrobjFieldData = wildcard(strFieldLabel, this.contact);
		if(! _.isEmpty(arrobjFieldData) ) {
			if(typeof arrobjFieldData[strFieldLabel] != 'undefined' ) {
				arrobjData = (_.isArray(arrobjFieldData[strFieldLabel]) ? arrobjFieldData[strFieldLabel]: [arrobjFieldData[strFieldLabel]]);				
			} else {
				arrobjData = arrobjFieldData;
			}		
			_.each(arrobjData, function(strField, strFieldKey){
				if( isNaN( strFieldKey ) ) {
					//Will be used to check for remaining keys
					self.arrextractKey.push(strFieldKey);	
				} else {
					self.arrextractKey.push(strFieldLabel);
				}			

				if( _.isObject(strField) == true || _.isArray(strField) ) {
					// console.log(arrobjData);
					var objData = {};
					objData.value = strField.value;
					//by default set the value to home
					objData.label = arrType[0];
					if( strField.params && _.isArray(strField.params)){
						_.each(strField.params, function(strType){
							if(typeof strFieldLabelContent != 'undefined'){
								if(strType[strFieldLabelContent]) {								
									objData.label= strType[strFieldLabelContent].toUpperCase();
									return;
								}
							} else {
								if(strType.TYPE) {
									objData.label= strType.TYPE.toUpperCase();							
									return;
								}
							}
							
						});
					}

					
				} else {
					var objData = {};
					objData.value = strField;
					//by default set the value to home
					objData.label = arrType[0];
				}
				
				arrData.push(objData);
			});
		}
		return arrData;
	},	
	mergeData: function(){
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
	},	
	getCommonData: function(){
		this.mappedContact._id = mongoose.mongo.ObjectId();
		this.mappedContact.transaction_id = this.task.transaction_id;
		this.mappedContact.user_id = this.task.user_id;
		this.mappedContact.is_locked =  false;
		this.mappedContact.is_favorite = false;
		this.mappedContact.is_active = true;
		this.mappedContact.created_on = Date.now;
		this.mappedContact.updated_on = Date.now;
	}
}