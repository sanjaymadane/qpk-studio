'use strict'
var applicationConstant = require('../../config/constant');

module.exports = {
	map: function(contact){
		this.contact = contact;
		this.mappedContact = [];

		// Order of calling functions should never change else csv will suffer
		this.getName();
		this.getEmails();		
		this.getPhones();		
		this.getCompany();
		this.getAddresses();
		this.getWebPages();
		this.getIms();
		this.getEvents();
		this.getNote();		
		this.getOthers();
		// this.getUpdatedOn();

		return this.mappedContact;
	},
	getName: function(){
		//"First Name","Middle Name", "Last Name", "Nickname", "Title",
		this.mappedContact.push(this.contact.fname || "");
		this.mappedContact.push(this.contact.mname || "");
		this.mappedContact.push(this.contact.lname || "");
		this.mappedContact.push(this.contact.nickname || "");
		this.mappedContact.push(this.contact.title || "");
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
		this.mappedContact.push(arrEmailHome.join("|||"));
		this.mappedContact.push(arrEmailOffice.join("|||"));
		this.mappedContact.push(arrEmailOther.join("|||"));
	},
	getPhones: function(){
		// "Phone-Home", "Phone-Office", "Phone-Mobile", "Phone-Main", "Phone-Home Fax", "Phone-Business Fax", "Phone-Other", 
		var arrPhoneHome = [], arrPhoneOffice = [], arrPhoneMobile = [], arrPhoneMain = [], arrPhoneHomefax = [], arrPhoneBusinessFax = [], arrPhoneOther= [];
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

		this.mappedContact.push(arrPhoneHome.join("|||"));
		this.mappedContact.push(arrPhoneOffice.join("|||"));
		this.mappedContact.push(arrPhoneMobile.join("|||"));
		this.mappedContact.push(arrPhoneMain.join("|||"));
		this.mappedContact.push(arrPhoneHomefax.join("|||"));
		this.mappedContact.push(arrPhoneBusinessFax.join("|||"));
		this.mappedContact.push(arrPhoneOther.join("|||"));
	},
	getCompany: function(){
		this.mappedContact.push(this.contact.company_name || "");
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
		this.mappedContact.push(strAddressHome);
		this.mappedContact.push(strAddressOffice);
	},
	getWebPages: function(){
		var arrWebpages = [];
		if( this.contact.web_pages &&  this.contact.web_pages.length > 0){
			this.contact.web_pages.forEach(function( webpage ){
				arrWebpages.push(webpage.value);
			});
		}
		this.mappedContact.push(arrWebpages.join("|||"));
	},
	getIms: function(){
		//IM-Skype	IM-Facebook	IM-QQ	IM-Line	IM-Wechat	IM-Yahoo	IM-Gtalk	IM-Custom:Type	IM-Custom:Value

		var arrImSkype = [], arrImFacebook = [] , arrImQq = [], 
			arrImLine = [], arrImWechat = [], arrImYahoo = [], arrImGtalk = [], arrImCustomType = [], arrImCustomValue = [];
		if(this.contact.im &&  this.contact.im.length > 0){
			this.contact.im.forEach( function(ims) {

				switch(ims.label.toUpperCase()){
					case applicationConstant.constImLabel.SKYPE:
						arrImSkype.push(ims.value);
					break;
					case applicationConstant.constImLabel.FACEBOOK:
						arrImFacebook.push(ims.value);
					break;
					case applicationConstant.constImLabel.QQ:
						arrImQq.push(ims.value);
					break;
					case applicationConstant.constImLabel.LINE:
						arrImLine.push(ims.value);
					break;
					case applicationConstant.constImLabel.WECHAT:
						arrImWechat.push(ims.value);
					break;
					case applicationConstant.constImLabel.YAHOO:
						arrImYahoo.push(ims.value);
					break;
					case applicationConstant.constImLabel.GOOGLE_TALK:
						arrImGtalk.push(ims.value);
					break;				

					default:
						arrImCustomType.push(ims.label.toUpperCase());
						arrImCustomValue.push(ims.value);
					break;
				}				
			});
		}

		this.mappedContact.push(arrImSkype.join("|||"));
		this.mappedContact.push(arrImFacebook.join("|||"));
		this.mappedContact.push(arrImQq.join("|||"));
		this.mappedContact.push(arrImLine.join("|||"));
		this.mappedContact.push(arrImWechat.join("|||"));
		this.mappedContact.push(arrImYahoo.join("|||"));
		this.mappedContact.push(arrImGtalk.join("|||"));
		this.mappedContact.push(arrImCustomType.join("|||"));
		this.mappedContact.push(arrImCustomValue.join("|||"));
	},
	getEvents: function(){
		// "Email-Home", "Email-Office", "Email-Other",
		
		var strEventBday = '', strEventAnniversary = '', arrEventCustomType = [], arrEventCustomValue = [];

		if(this.contact.events &&  this.contact.events.length > 0){			
			this.contact.events.forEach( function(event){
				switch(event.label.toUpperCase()){
					case applicationConstant.constDateLabel.BIRTH_DATE:
						strEventBday = event.value;
					break;
					case applicationConstant.constDateLabel.ANNIVERSARY:
						strEventAnniversary = event.value;
					break;
					default:						
						arrEventCustomType.push(event.label);
						arrEventCustomValue.push(event.value);
				}				
			});
		}
		this.mappedContact.push(strEventBday);
		this.mappedContact.push(strEventAnniversary);
		this.mappedContact.push(arrEventCustomType.join("|||"));
		this.mappedContact.push(arrEventCustomValue.join("|||"));
	},
	getNote: function(){		
		var strNote = '';
		if(this.contact.note){
			strNote = this.contact.note;
		}
		this.mappedContact.push(strNote);		
	},
	getOthers: function(){
		var arrOtherType = [], arrOtherValue = [];
		if(this.contact.others &&  this.contact.others.length > 0){
			this.contact.others.forEach( function(other) {				
				arrOtherType.push(other.label.toUpperCase());
				arrOtherValue.push(other.value);
			});
		}
		this.mappedContact.push(arrOtherType.join("|||"));
		this.mappedContact.push(arrOtherValue.join("|||"));
	},
	getUpdatedOn: function(){
		this.mappedContact.push(this.contact.updated_on || "");
	}
}