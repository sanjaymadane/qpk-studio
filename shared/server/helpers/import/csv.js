'use strict'

var _ = require('underscore'),
	phoneHelper = require('../phone_number_helper'),
	applicationConstant = require('../../config/constant');;



module.exports = {
	map: function(mappedContact, contact, task){		
		this.contact = contact;
		this.mappedContact = mappedContact;
		this.task = task;

		
		this.getName();
		this.getEmail();
		this.getPhone();
		this.getCompany();
		this.getAddress();
		this.getWebPage();
		this.getIms();
		this.getEvents();
		this.getNote();
		this.getOthers();
		this.getSourceInfo();		
		return this.mappedContact;
	},
	getName: function(){
		if(this.contact){
			if(this.contact['First Name'])
				this.mappedContact.fname = this.contact['First Name'];
			if(this.contact['Middle Name'])
				this.mappedContact.mname = this.contact['Middle Name'];
			if(this.contact['Last Name'])
				this.mappedContact.lname = this.contact['Last Name'];
			if(this.contact['Title'])
				this.mappedContact.title = this.contact['Title'];
			if(this.contact['Nickname'])
				this.mappedContact.nickname = this.contact['Nickname'];
		}
	},
	getEmail: function(){		
		var arrEmailParse = {};
		if(this.contact['Email-Home'] && this.contact['Email-Home'].length > 0){
			arrEmailParse[applicationConstant.constEmailLable.HOME] = this.contact['Email-Home'].split(applicationConstant.constDefaultSeparator);
		}
		if(this.contact['Email-Office'] && this.contact['Email-Office'].length > 0){
			arrEmailParse[applicationConstant.constEmailLable.OFFICE] = this.contact['Email-Office'].split(applicationConstant.constDefaultSeparator);	
		}
		if(this.contact['Email-Other'] && this.contact['Email-Other'].length > 0){
			arrEmailParse[applicationConstant.constEmailLable.OTHER] = this.contact['Email-Other'].split(applicationConstant.constDefaultSeparator);	
		}
		this.mappedContact.emails = this.getSchemaArrayOfObj(arrEmailParse);			
	},
	getPhone: function(){
		var arrPhoneParse = {};
		var self = this;
		if(this.contact['Phone-Home'] && this.contact['Phone-Home'].length > 0){
			arrPhoneParse[applicationConstant.constPhoneLabel.HOME] = this.contact['Phone-Home'].split(applicationConstant.constDefaultSeparator);
		}
		if(this.contact['Phone-Office'] && this.contact['Phone-Office'].length > 0){
			arrPhoneParse[applicationConstant.constPhoneLabel.OFFICE] = this.contact['Phone-Office'].split(applicationConstant.constDefaultSeparator);	
		}
		if(this.contact['Phone-Mobile'] && this.contact['Phone-Mobile'].length > 0){
			arrPhoneParse[applicationConstant.constPhoneLabel.MOBILE] = this.contact['Phone-Mobile'].split(applicationConstant.constDefaultSeparator);	
		}
		if(this.contact['Phone-Main'] && this.contact['Phone-Main'].length > 0){
			arrPhoneParse[applicationConstant.constPhoneLabel.MAIN] = this.contact['Phone-Main'].split(applicationConstant.constDefaultSeparator);	
		}
		if(this.contact['Phone-Home Fax'] && this.contact['Phone-Home Fax'].length > 0){
			arrPhoneParse[applicationConstant.constPhoneLabel.HOME_FAX] = this.contact['Phone-Home Fax'].split(applicationConstant.constDefaultSeparator);	
		}
		if(this.contact['Phone-Business Fax'] && this.contact['Phone-Business Fax'].length > 0){
			arrPhoneParse[applicationConstant.constPhoneLabel.BUSINESS_FAX] = this.contact['Phone-Business Fax'].split(applicationConstant.constDefaultSeparator);	
		}
		if(this.contact['Phone-Other'] && this.contact['Phone-Other'].length > 0){
			arrPhoneParse[applicationConstant.constPhoneLabel.OTHER] = this.contact['Phone-Other'].split(applicationConstant.constDefaultSeparator);	
		}
		var arrobjPhone = this.getSchemaArrayOfObj(arrPhoneParse);
		if(arrobjPhone.length > 0) {
			_.each(arrobjPhone, function(objPhone, index){
				arrobjPhone[index].country_code = self.getCountryCode(objPhone.value);
			})
		}
		this.mappedContact.phones = arrobjPhone;
	},
	getCompany: function(){
		if(this.contact['Company Name']) {
			this.mappedContact.company_name = this.contact['Company Name'];
		}
	},
	getAddress: function(){
		var arrAddressParse = {};
		if(this.contact['Address-Home'] && this.contact['Address-Home'].length > 0){
			arrAddressParse[applicationConstant.constAddressLabel.HOME] = this.contact['Address-Home'];	
		}

		if(this.contact['Address-Office'] && this.contact['Address-Office'].length > 0){
			arrAddressParse[applicationConstant.constAddressLabel.OFFICE] = this.contact['Address-Office'];
		}	
		
		this.mappedContact.addresses = this.getSchemaArrayOfObj(arrAddressParse);
	},
	getWebPage: function(){
		var arrWebpageParse = {};
		if(this.contact['Webpage'] && this.contact['Webpage'].length > 0){
			arrWebpageParse[applicationConstant.constWebpageLabel.DEFAULT] = this.contact['Webpage'].split(applicationConstant.constDefaultSeparator);
		}		
		this.mappedContact.web_pages = this.getSchemaArrayOfObj(arrWebpageParse);		
	},
	getIms: function(){
		var arrImParse = {};
		var arrobjIm = [];
		if(this.contact['IM-Skype'] && this.contact['IM-Skype'].length > 0){
			arrImParse[applicationConstant.constImLabel.SKYPE] = this.contact['IM-Skype'].split(applicationConstant.constDefaultSeparator);
		}
		if(this.contact['IM-Facebook'] && this.contact['IM-Facebook'].length > 0){
			arrImParse[applicationConstant.constImLabel.FACEBOOK] = this.contact['IM-Facebook'].split(applicationConstant.constDefaultSeparator);	
		}
		if(this.contact['IM-QQ'] && this.contact['IM-QQ'].length > 0){
			arrImParse[applicationConstant.constImLabel.QQ] = this.contact['IM-QQ'].split(applicationConstant.constDefaultSeparator);	
		}
		if(this.contact['IM-Line'] && this.contact['IM-Line'].length > 0){
			arrImParse[applicationConstant.constImLabel.LINE] = this.contact['IM-Line'].split(applicationConstant.constDefaultSeparator);	
		}
		if(this.contact['IM-Wechat'] && this.contact['IM-Wechat'].length > 0){
			arrImParse[applicationConstant.constImLabel.WECHAT] = this.contact['IM-Wechat'].split(applicationConstant.constDefaultSeparator);	
		}
		if(this.contact['IM-Yahoo'] && this.contact['IM-Yahoo'].length > 0){
			arrImParse[applicationConstant.constImLabel.YAHOO] = this.contact['IM-Yahoo'].split(applicationConstant.constDefaultSeparator);	
		}
		if(this.contact['IM-Gtalk'] && this.contact['IM-Gtalk'].length > 0){
			arrImParse[applicationConstant.constImLabel.GOOGLE_TALK] = this.contact['IM-Gtalk'].split(applicationConstant.constDefaultSeparator);	
		}

		arrobjIm = this.getSchemaArrayOfObj(arrImParse);

		if(this.contact['IM-Custom:Value'] && this.contact['IM-Custom:Value'].length > 0){
			var arrImCustomValue = this.contact['IM-Custom:Value'].split(applicationConstant.constDefaultSeparator);
			var arrImCustomType = this.contact['IM-Custom:Type'].split(applicationConstant.constDefaultSeparator);
			if(arrImCustomValue.length > 0){
				_.each(arrImCustomValue, function(value, index){
					var objIm = {
						value: value
					}
					if(_.isArray(arrImCustomType) && arrImCustomType[index]){
						objIm.label = arrImCustomType[index];	
					} else {
						objIm.label = applicationConstant.constImLabel.DEFAULT;
					}
					arrobjIm.push(objIm);
				})	
			}			
		}

		this.mappedContact.im = arrobjIm;
	},
	getEvents: function(){
		var arrEventParse = {};
		var arrobjEvent = [];
		if(this.contact['Date-Birthday'] && this.contact['Date-Birthday'].length > 0){
			arrEventParse[applicationConstant.constDateLabel.BIRTH_DATE] = this.contact['Date-Birthday'];
		}
		if(this.contact['Date-Anniversary'] && this.contact['Date-Anniversary'].length > 0){
			arrEventParse[applicationConstant.constDateLabel.ANNIVERSARY] = this.contact['Date-Anniversary'];	
		}
		arrobjEvent = this.getSchemaArrayOfObj(arrEventParse);

		if(this.contact['Date-Custom:Value'] && this.contact['Date-Custom:Value'].length > 0){
			var arrEventCustomValue = this.contact['Date-Custom:Value'].split(applicationConstant.constDefaultSeparator);
			var arrEventCustomType = this.contact['Date-Custom:Type'].split(applicationConstant.constDefaultSeparator);
			if(arrEventCustomValue.length > 0){
				_.each(arrEventCustomValue, function(value, index){
					var objEvent = {
						value: value
					}
					if(_.isArray(arrEventCustomType) && arrEventCustomType[index]){
						objEvent.label = arrEventCustomType[index];
					} else {
						objEvent.label = applicationConstant.constDateLabel.DEFAULT;
					}
					arrobjEvent.push(objEvent);
				});
			}			
		}
		this.mappedContact.events = arrobjEvent;
	},
	getNote: function(){
		if(this.contact['Note']) {
			this.mappedContact.note = this.contact['Note'];
		}
	},
	getOthers: function(){
		var arrobjOther = [];
		if(this.contact['Custom:Value'] && this.contact['Custom:Value'].length > 0){
			var arrOtherValue = this.contact['Custom:Value'].split(applicationConstant.constDefaultSeparator);
			var arrOtherLabel = this.contact['Custom:Type'].split(applicationConstant.constDefaultSeparator);
			
			if(arrOtherValue.length > 0){
				_.each(arrOtherValue, function(strOther, index) {
					var objOther = {
						value: strOther
					}
					if(_.isArray(arrOtherLabel) && arrOtherLabel[index]){
						objOther.label = arrOtherLabel[index];
					} else {
						objOther.label = applicationConstant.constOtherLabel.DEFAULT;
					}
					arrobjOther.push(objOther);
				});
			}
		}
		this.mappedContact.others = arrobjOther;
	},
	getSourceInfo: function(){
		var sources = [];
		sources.push({
			value: this.task.filename,
			label: 'CSV Import'
		});
		this.mappedContact.sources = sources;
	},
	getSchemaArrayOfObj: function(objData){
		var arrobjSchema = [];
		if(objData){
			_.each(objData, function(arrData, key) {				
				if(_.isArray(arrData) && arrData.length > 0) {
					_.each(arrData, function(data) {
						if(data.length > 0){
							var objSchema = {
								label: key,
								value: data
							}
							arrobjSchema.push(objSchema);
						}
					})
				} else {
					var objSchema = {
						label: key,
						value: arrData.toString()
					}
					arrobjSchema.push(objSchema); 
				}
			});
		}	
		return arrobjSchema;
	},
	getCountryCode: function(Phone){
		return phoneHelper.getCountryCode(Phone);
	}

}