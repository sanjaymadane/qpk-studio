'use strict'

var applicationConstant = require('../../config/constant');

module.exports = {
	map: function(contact, multipleCount){		
		this.contact = contact;		
		var mappedContact = [];
		mappedContact = this.getSingleField();		
		var multipleFieldData = this.getMultipleField();

		//{ event: 
  //  [ { label: 'ANNIVERSARY', value: '2016-06-30T16:00:00.000Z' },
  //    { label: 'OTHER', value: '2016-07-01T16:00:00.000Z' } ],
  // custom: [ { label: 'C1', value: 'C1' }, { label: 'C2', value: 'C2' } ] }

		//generate multiple field data
		if(multipleCount.maxEvent && multipleCount.maxEvent > 0){
			for (var i = 0; i < multipleCount.maxEvent; i++) {
				if(multipleFieldData.event[i]){
					mappedContact.push(multipleFieldData.event[i].label)
					mappedContact.push(multipleFieldData.event[i].value)
				} else {
					mappedContact.push('');
					mappedContact.push('');
				}
			}
		}
		if(multipleCount.maxOther && multipleCount.maxOther > 0){
			for (var i = 0; i < multipleCount.maxOther; i++) {					
				if(multipleFieldData.custom[i]){
					mappedContact.push(multipleFieldData.custom[i].label)
					mappedContact.push(multipleFieldData.custom[i].value)
				} else {
					mappedContact.push('');
					mappedContact.push('');
				}
			}
		}		
		return mappedContact;
	},
	getSingleField: function(){
		//"First Name","Middle Name", "Last Name", "Nickname", "Title",

		/***"Name Prefix","Given Name","Additional Name","Family Name","Nickname","Birthday","Notes","Organization 1 - Name",			
			"Website 1 - Value","E-mail 1 - Type","E-mail 1 - Value","E-mail 2 - Type","E-mail 2 - Value","E-mail 3 - Type","E-mail 3 - Value",
			"Phone 1 - Type","Phone 1 - Value","Phone 2 - Type","Phone 2 - Value","Phone 3 - Type","Phone 3 - Value","Phone 4 - Type",
			"Phone 4 - Value","Phone 5 - Type","Phone 5 - Value","Phone 6 - Type","Phone 6 - Value","Phone 7 - Type","Phone 7 - Value",
			"Address 1 - Type","Address 1 - Street","Address 2 - Type","Address 2 - Street","Name","Yomi Name","Given Name Yomi",
			"Additional Name Yomi","Family Name Yomi",			"Name Suffix","Initials",			"Short Name","Maiden Name",			
			"Gender","Location","Billing Information","Directory Server","Mileage","Occupation","Hobby","Sensitivity","Priority",
			"Subject","Group Membership",			"Organization 1 - Type","Organization 1 - Yomi Name","Organization 1 - Title",
			"Organization 1 - Department","Organization 1 - Symbol","Organization 1 - Location","Organization 1 - Job Description",
			"Website 1 - Type","Address 1 - Formatted","Address 1 - City","Address 1 - PO Box","Address 1 - Region",
			"Address 1 - Postal Code","Address 1 - Country","Address 1 - Extended Address","Address 2 - Formatted","Address 2 - City",
			"Address 2 - PO Box","Address 2 - Region","Address 2 - Postal Code","Address 2 - Country","Address 2 - Extended Address"		
		*/		
		var arrSingleFields = [];

		//name
		arrSingleFields.push(this.contact.title || "");
		arrSingleFields.push(this.contact.fname || "");
		arrSingleFields.push(this.contact.mname || "");
		arrSingleFields.push(this.contact.lname || "");
		arrSingleFields.push(this.contact.nickname || "");

		//Bday
		arrSingleFields.push(this.getBirthday());
		
		//note
		arrSingleFields.push(this.getNote());
		
		//organization
		arrSingleFields.push(this.getCompany());

		//Website
		arrSingleFields.push(this.getWebPages());
		
		//Emails
		var objEmail = this.getEmails();

		//Home Emails
		arrSingleFields.push(applicationConstant.constEmailLable.HOME);
		arrSingleFields.push(objEmail[applicationConstant.constEmailLable.HOME]);

		//Office Emails
		arrSingleFields.push(applicationConstant.constEmailLable.OFFICE);
		arrSingleFields.push(objEmail[applicationConstant.constEmailLable.OFFICE]);

		//Other Emails
		arrSingleFields.push(applicationConstant.constEmailLable.OTHER);
		arrSingleFields.push(objEmail[applicationConstant.constEmailLable.OTHER]);



		//Phone
		var objPhone = this.getPhones();

		//Home 
		arrSingleFields.push(applicationConstant.constPhoneLabel.HOME);
		arrSingleFields.push(objPhone[applicationConstant.constPhoneLabel.HOME]);

		//Office 
		arrSingleFields.push(applicationConstant.constPhoneLabel.OFFICE);
		arrSingleFields.push(objPhone[applicationConstant.constPhoneLabel.OFFICE]);

		//mobile
		arrSingleFields.push(applicationConstant.constPhoneLabel.MOBILE);
		arrSingleFields.push(objPhone[applicationConstant.constPhoneLabel.MOBILE]);

		//main
		arrSingleFields.push(applicationConstant.constPhoneLabel.MAIN);
		arrSingleFields.push(objPhone[applicationConstant.constPhoneLabel.MAIN]);

		//home fax
		arrSingleFields.push(applicationConstant.constPhoneLabel.HOME_FAX);
		arrSingleFields.push(objPhone[applicationConstant.constPhoneLabel.HOME_FAX]);

		//business fax
		arrSingleFields.push(applicationConstant.constPhoneLabel.BUSINESS_FAX);
		arrSingleFields.push(objPhone[applicationConstant.constPhoneLabel.BUSINESS_FAX]);

		//other
		arrSingleFields.push(applicationConstant.constPhoneLabel.OTHER);
		arrSingleFields.push(objPhone[applicationConstant.constPhoneLabel.OTHER]);

		//address
		var objAddress = this.getAddresses();

		//Home 
		arrSingleFields.push(applicationConstant.constAddressLabel.HOME);
		arrSingleFields.push(objAddress[applicationConstant.constAddressLabel.HOME]);

		//Office 
		arrSingleFields.push(applicationConstant.constAddressLabel.OFFICE);
		arrSingleFields.push(objAddress[applicationConstant.constAddressLabel.OFFICE]);

		var objIm = this.getIms();

		//ims
		arrSingleFields.push(objIm.label);
		arrSingleFields.push(objIm.value);

		return arrSingleFields;
	},
	
	getBirthday: function(){
		var strEventBday = '';

		if(this.contact.events &&  this.contact.events.length > 0){
			this.contact.events.forEach( function(event){
				switch(event.label.toUpperCase()){
					case applicationConstant.constDateLabel.BIRTH_DATE:
						strEventBday = event.value;
					break;					
				}				
			});
		}
		return strEventBday;
	},
	getNote:  function(){		
		return this.contact.note || "";
	},
	getCompany: function(){
		return this.contact.company_name || "";
	},
	getWebPages: function(){
		var arrWebpages = [];
		if( this.contact.web_pages &&  this.contact.web_pages.length > 0){
			this.contact.web_pages.forEach(function( webpage ){
				arrWebpages.push(webpage.value);
			});
		}
		return arrWebpages.join(applicationConstant.constGoogleDefaultSeparator);
	},
	getEmails: function(){
		// "Email-Home", "Email-Office", "Email-Other",
		
		var arrEmailHome = [], arrEmailOffice = [], arrEmailOther = [];

		if(this.contact.emails &&  this.contact.emails.length > 0){			
			this.contact.emails.forEach( function(email){				
				switch(email.label.toUpperCase()){
					case applicationConstant.constEmailLable.HOME:
						arrEmailHome.push(email.value);
						break;
					case applicationConstant.constEmailLable.OFFICE:
						arrEmailOffice.push(email.value);
						break;
					default:
						arrEmailOther.push(email.value);
				}				
			});
		}

		var objReturn = {};
		objReturn[applicationConstant.constEmailLable.HOME] = arrEmailHome.join(applicationConstant.constGoogleDefaultSeparator);
		objReturn[applicationConstant.constEmailLable.OFFICE] = arrEmailOffice.join(applicationConstant.constGoogleDefaultSeparator);
		objReturn[applicationConstant.constEmailLable.OTHER] = arrEmailOther.join(applicationConstant.constGoogleDefaultSeparator);

		return objReturn;		
	},
	getPhones: function(){
		// "Phone-Home", "Phone-Office", "Phone-Mobile", "Phone-Main", "Phone-Home Fax", "Phone-Business Fax", "Phone-Other", 
		var arrPhoneHome = [], arrPhoneOffice = [], arrPhoneMobile = [], arrPhoneMain = [], 
			arrPhoneHomefax = [], arrPhoneBusinessFax = [], arrPhoneOther= [];
		if( this.contact.phones &&  this.contact.phones.length > 0){			
			this.contact.phones.forEach(function(phone){
				switch(phone.label.toUpperCase()){
					case applicationConstant.constPhoneLabel.HOME:						
						arrPhoneHome.push(phone.value);
						break;
					case applicationConstant.constPhoneLabel.OFFICE:						
						arrPhoneOffice.push(phone.value);
						break;
					case applicationConstant.constPhoneLabel.MOBILE:					
						arrPhoneMobile.push(phone.value);
						break;
					case applicationConstant.constPhoneLabel.MAIN:						
						arrPhoneMain.push(phone.value);
						break;
					case applicationConstant.constPhoneLabel.HOME_FAX:
						arrPhoneHomefax.push(phone.value);
						break;
					case applicationConstant.constPhoneLabel.BUSINESS_FAX:					
						arrPhoneBusinessFax.push(phone.value);
						break;
					default:						
						arrPhoneOther.push(phone.value);
				}
			});
		}

		var objReturnPhone = {};
		
		objReturnPhone[applicationConstant.constPhoneLabel.HOME] = arrPhoneHome.join(applicationConstant.constGoogleDefaultSeparator);
		objReturnPhone[applicationConstant.constPhoneLabel.OFFICE] = arrPhoneOffice.join(applicationConstant.constGoogleDefaultSeparator);
		objReturnPhone[applicationConstant.constPhoneLabel.MOBILE] = arrPhoneMobile.join(applicationConstant.constGoogleDefaultSeparator);
		objReturnPhone[applicationConstant.constPhoneLabel.MAIN] = arrPhoneMain.join(applicationConstant.constGoogleDefaultSeparator);
		objReturnPhone[applicationConstant.constPhoneLabel.HOME_FAX] = arrPhoneHomefax.join(applicationConstant.constGoogleDefaultSeparator);
		objReturnPhone[applicationConstant.constPhoneLabel.BUSINESS_FAX] = arrPhoneBusinessFax.join(applicationConstant.constGoogleDefaultSeparator);
		objReturnPhone[applicationConstant.constPhoneLabel.OTHER] = arrPhoneOther.join(applicationConstant.constGoogleDefaultSeparator);	


	
		return objReturnPhone;
		
	},
	getAddresses: function(){
		//Address-Office	Address-Home
		var strAddressHome = '', strAddressOffice = '';
		if( this.contact.addresses &&  this.contact.addresses.length > 0){
			this.contact.addresses.forEach(function(address){
				switch(address.label.toUpperCase()){
					case applicationConstant.constAddressLabel.HOME:
						strAddressHome = address.value;
					break;
					case applicationConstant.constAddressLabel.OFFICE:
						strAddressOffice = address.value;
					break;
					
				}				
			});
		}

		var objReturnAddress = {};

		objReturnAddress[applicationConstant.constAddressLabel.HOME] = strAddressHome;
		objReturnAddress[applicationConstant.constAddressLabel.OFFICE] = strAddressOffice;
		
		return objReturnAddress;
	},

	getIms: function(){		

		var  arrImLabel = [], arrImValue = [];
		if(this.contact.im &&  this.contact.im.length > 0){
			this.contact.im.forEach( function(ims) {
				arrImLabel.push(ims.label.toUpperCase() || '')
				arrImValue.push(ims.value)
							
			});
		}

		
		var objReturnIm = {};
		objReturnIm.label = arrImLabel.join(applicationConstant.constGoogleDefaultSeparator);
		objReturnIm.value = arrImValue.join(applicationConstant.constGoogleDefaultSeparator);

		return objReturnIm;
	},


	getMultipleField: function(){
		var multipleField = {};		
		
		multipleField.event = this.getEvents();
		multipleField.custom = this.getOthers();
		
		return multipleField;
	},
	
	

	getEvents: function(){
		var arrobjEvent = [];

		if(this.contact.events &&  this.contact.events.length > 0){
			this.contact.events.forEach( function(event){
				if(event.label.toUpperCase() != applicationConstant.constDateLabel.BIRTH_DATE ){
					var objEvent = {
						label: event.label || '',
						value: event.value
					}
					arrobjEvent.push(objEvent);
				}				
			});
		}		
		return arrobjEvent;
	},

	getOthers: function(){
		var arrobjOther = [];
		if(this.contact.others &&  this.contact.others.length > 0){
			this.contact.others.forEach( function(other) {				
				var objOther = {
					label: other.label.toUpperCase() || '',
					value: other.value
				}
				
				arrobjOther.push(objOther);
			});
		}		
		return arrobjOther;
	},
	
}