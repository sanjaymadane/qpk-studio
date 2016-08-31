'use strict'

var vCard = require('../../modules/vcards-js'),
	moment = require('moment');

module.exports = {
	map:function(contact, exportType){		
		this.vCardData = vCard( exportType || '' );
		this.contact = contact;	

		//get data for the contacts
		this.getName();
		this.getEmail();
		this.getPhone();
		this.getCompany();
		this.getAddress();
		this.getBirthday();
		this.getWebPage();
		this.getIms();

		this.vCardData.version = '3.0';

		return this.vCardData.getFormattedString();
	},
	getName: function(){
		this.vCardData.lastName = (this.contact.lname)?this.contact.lname:'';
	    this.vCardData.middleName = (this.contact.mname) ? this.contact.mname :'';
	    this.vCardData.firstName = (this.contact.fname) ? this.contact.fname:'';
	    this.vCardData.namePrefix = (this.contact.title) ? this.contact.title :'';
	    this.vCardData.nickname = (this.contact.nickname) ? this.contact.nickname : '';	    	
	},
	getEmail: function(){
		var self = this;		
		if(this.contact.emails && this.contact.emails.length > 0) {
			this.contact.emails.forEach(function(emailData){
				if(emailData.label) {
					if( self.vCardData.email[emailData.label.toUpperCase()] && self.vCardData.email[emailData.label.toUpperCase()] instanceof Array ){
						self.vCardData.email[emailData.label.toUpperCase()].push(emailData.value);
					} else {
						self.vCardData.email[emailData.label.toUpperCase()] = [];
						self.vCardData.email[emailData.label.toUpperCase()].push(emailData.value);
					}				
					
				}				
			})
		}		
	},
	getPhone: function(){
		var self = this;		
		if(this.contact.phones && this.contact.phones.length > 0) {
			this.contact.phones.forEach(function(phoneData){
				if(phoneData.label) {
					if( self.vCardData.phone[phoneData.label.toUpperCase()] && self.vCardData.phone[phoneData.label.toUpperCase()] instanceof Array ){
						self.vCardData.phone[phoneData.label.toUpperCase()].push(phoneData.value);
					} else {
						self.vCardData.phone[phoneData.label.toUpperCase()] = [];
						self.vCardData.phone[phoneData.label.toUpperCase()].push(phoneData.value);
					}
				}
			})
		}		
	},
	getCompany: function(){		
		this.vCardData.organization = (this.contact['company_name'])?this.contact['company_name']:'';
	},

	getAddress: function(){		
		var self = this;		
		if(this.contact.addresses) {			
			this.contact.addresses.forEach(function(address){
				if(address.label.toUpperCase() == 'HOME'){
					self.vCardData.homeAddress.street = address.value;	
				} else if( address.label.toUpperCase() == 'OFFICE'  || address.label.toUpperCase() == 'WORK' ){
					self.vCardData.workAddress.street = address.value;	
				}				
			})
		}					
	},
	getBirthday: function(){
		var self = this;		
		if(this.contact.events) {
			this.contact.events.forEach(function(event){
				if(event.label.toUpperCase() == 'BIRTH_DATE') {					
					self.vCardData.birthday = event.value;
				}
			})
		}
	},
	getWebPage: function(){
		var self = this;			
		if(this.contact.web_pages) {
			this.contact.web_pages.forEach(function(webpage){
				if(webpage.label && webpage.label.length > 0) {
					if(webpage.label) {
						if( self.vCardData.url[webpage.label.toUpperCase()] && self.vCardData.url[webpage.label.toUpperCase()] instanceof Array ){
							self.vCardData.url[webpage.label.toUpperCase()].push(webpage.value);
						} else {
							self.vCardData.url[webpage.label.toUpperCase()] = [];
							self.vCardData.url[webpage.label.toUpperCase()].push(webpage.value);
						}
						
					}
				}
			});
		}
	},
	getIms: function(){
		var self = this;
		if(this.contact.im && this.contact.im.length > 0) {
			this.contact.im.forEach(function(imData){
				if(imData.label) {
					self.vCardData.ims[imData.label.toUpperCase()] = imData.value;
				}
			});
		}
	}
}