// 'use strict';
/*
*	This mapper is used to map the google contact to 	
*
*/
var _ = require('underscore'),
	downloadFile = require('../download_file_helper'),
	mkdirp = require('mkdirp'),
	media = require('../media_helper'),
	phoneHelper = require('../phone_number_helper');

// Load file config 
var config = require('../../config/config'),
	constant = require('../../config/constant');

module.exports = {
	map: function(mappedContact, contact){
		this.contact = contact;
		this.mappedContact = mappedContact;		
		this.getName();
		this.getEmail();
		this.getPhoneNumber();
		this.getCompany();
		this.getBirthDay();
		this.getAddress();
		this.getIM();
		this.getWebPages();
		this.getProfilePic();
		this.getSourcesInfo();
		this.getNote();
		
		if(this.contact.updated){
			this.mappedContact.updated_on = this.contact.updated.$t;
			this.mappedContact.created_on = this.contact.updated.$t;
		}

		return this.mappedContact;
	},
	getName: function(){
		if(this.contact.gd$name) {
			if( this.contact.gd$name.gd$givenName ) {
				this.mappedContact.fname = (this.contact.gd$name.gd$givenName.$t) ? this.contact.gd$name.gd$givenName.$t: '';
			}
			if( this.contact.gd$name.gd$additionalName) {
				this.mappedContact.mname = (this.contact.gd$name.gd$additionalName.$t) ? this.contact.gd$name.gd$additionalName.$t : '';
			}
			if( this.contact.gd$name.gd$familyName) {
				this.mappedContact.lname = (this.contact.gd$name.gd$familyName.$t) ? this.contact.gd$name.gd$familyName.$t:'';
			}
			if( this.contact.gd$name.gd$namePrefix ) {
				this.mappedContact.title = (this.contact.gd$name.gd$namePrefix.$t) ? this.contact.gd$name.gd$namePrefix.$t:'';	
			}
		}
		
		if(_.has( this.contact, 'gContact$nickname')) {
			this.mappedContact.nickname = (this.contact.gContact$nickname.$t)?this.contact.gContact$nickname.$t:'';
		}
	},
	getEmail: function(){
		var emails = [];

		if(this.contact.gd$email && this.contact.gd$email.length > 0){
			this.contact.gd$email.forEach(function(objEmail){
				if(objEmail.address){
					var email = {};
					email.value = objEmail.address;
					email.label = objEmail.rel ? objEmail.rel.split('#').pop().toUpperCase() || 'OTHER' : 'OTHER';
					email.is_primary = objEmail.primary ? true : false;
					emails.push(email);
				}
			});
		}
		this.mappedContact.emails = emails;
	},
	getPhoneNumber: function(){
		var phones = [];

		if(this.contact.gd$phoneNumber && this.contact.gd$phoneNumber.length > 0) {
			this.contact.gd$phoneNumber.forEach(function(phoneNumber){
				if(phoneNumber.$t){
					var phone = {};
					phone.value = phoneNumber.$t;
					phone.label = (phoneNumber.label) ? phoneNumber.label.toUpperCase() : ((phoneNumber.rel) ? phoneNumber.rel.split('#').pop().toUpperCase() || 'OTHER' : 'OTHER');
					phone.country_code = (phoneNumber.$t) ? phoneHelper.getCountryCode(phoneNumber.$t):"";
					phones.push(phone);					
				}
			});
		}	
		this.mappedContact.phones = phones;
	},
	getCompany: function() {
		if(this.contact.gd$organization && this.contact.gd$organization.length > 0){
			this.mappedContact.company_name = this.contact.gd$organization[0].gd$orgName ? this.contact.gd$organization[0].gd$orgName.$t: "";
		}		
	},
	getBirthDay: function(){
		var arrEvents = [];
		if(this.contact.gContact$birthday) {
			var objEvents = {};
			objEvents.label = 'BIRTH_DATE';
			objEvents.value = this.contact.gContact$birthday.when;
			arrEvents.push(objEvents);
		}		
		this.mappedContact.events = arrEvents;
	},
	getAddress: function(){
		var addresses = [];
		if(this.contact.gd$structuredPostalAddress && this.contact.gd$structuredPostalAddress.length > 0){
			this.contact.gd$structuredPostalAddress.forEach(function(objAddress){
				if(objAddress.gd$formattedAddress && objAddress.gd$formattedAddress.$t){
					var address = {};
					address.value = objAddress.gd$formattedAddress.$t;
					address.label = objAddress.rel ? objAddress.rel.split('#').pop().toUpperCase() || 'OTHER' : 'OTHER';
					addresses.push(address);
				}
			});
		}
		this.mappedContact.addresses = addresses;
	},
	getIM: function() {
		var ims = [];
		if(this.contact.gd$im && this.contact.gd$im.length > 0) {
			this.contact.gd$im.forEach(function(objIM){
				if(objIM.address) {
					var im = {};
					im.value = objIM.address;
					im.label = objIM.protocol ? objIM.protocol.split('#').pop().toUpperCase() || 'OTHER' : 'OTHER';
					ims.push(im);
				}
			});
		}
		this.mappedContact.im = ims;		
	},
	getWebPages: function() {
		var webpages = [];
		if( this.contact.gContact$website &&  this.contact.gContact$website.length > 0 ) {
			this.contact.gContact$website.forEach( function( webpage ){
				if( webpage.href ) {
					var objWebpage = {};
					objWebpage.label = (webpage.rel)? webpage.rel.toUpperCase() : 'OTHER';
					objWebpage.value = webpage.href;
					webpages.push(objWebpage);
				}				
			});
		}		
		this.mappedContact.web_pages = webpages;
	},
	getProfilePic:  function() {
		var self = this;
		if(this.contact.link && this.contact.link.length > 0) {
			this.contact.link.forEach(function(profilepic) {
				var rel = profilepic.rel ? profilepic.rel.split('#').pop() : "";
				if(_.has(profilepic, 'gd$etag')){
					self.mappedContact.profile_pic = profilepic.href;					
				}
			});
		}
	},
	getSourcesInfo: function() {
		var sources = [];
		var source = {};

		if(this.contact.id){
			source.value = this.contact.id.$t.split('www.google.com/m8/feeds/contacts/')[1].split('/')[0].replace('%40','@');			
		}
		source.source_id = this.contact.id.$t.split('/').pop();		
		source.label = constant.constSources.GOOGLE;

		//gather the meta information
		source.metadata = {
			etag: this.contact['gd$etag']
		};
		sources.push(source);

		this.mappedContact.sources = sources;		
	},
	getNote: function() {
		if(this.contact.content && this.contact.content.$t) {				
			this.mappedContact.note = this.contact.content.$t;
		}
	}
};