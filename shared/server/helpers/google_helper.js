'use strict'


var GoogleContacts = require('../modules/google/contacts').GoogleContacts,
	_ = require('underscore');


var config = require('../config/config'),
	constant = require('../config/constant');
module.exports = {
	getContacts: function(data){
		var self = this;
		return new Promise(function(resolve, reject){
			//For information on params visit
			//https://developers.google.com/google-apps/contacts/v3/reference#Parameters
			var params = { projection: 'full', type: 'contacts', token: data.token};
			
			var c = new GoogleContacts(params);


			//Build the contacts get query
			var query = {}

			if(data.updated_min){
				params['updated-min'] = data.updated_min;
			}	

			if(data.email){
				params.email = data.email;
			}
	    	
	    	if(data.showdeleted){
				params.showdeleted = data.showdeleted;
			}

			if(typeof data.isgetnext != 'undefined'){
				params.isgetnext = data.isgetnext;
			} else {
				params.isgetnext = true;
			}

			if(typeof data['max-results'] != 'undefined') {
				params['max-results'] = data['max-results'];
			} else {
				params['max-results'] = 1001;
			}
	    	
	    	c.getContacts( contactData, params);

	    	function contactData(err, contacts) {
	    		if(err){
	    			reject(err);
	    		} else {
	    			//If success this will return account name and all contacts
	    			//Separate deleted contacts
	    			resolve(contacts)
	    		}
	    	}
		})
	},
	
	generateAccessToken: function(data){
		var self = this;
		return new Promise(function(resolve, reject){
			var c = new GoogleContacts({
		      consumerKey: config.googleAuth.client_id,
		      consumerSecret: config.googleAuth.client_secret,
		    });

			c.refreshAccessToken(data.referesh_token, function(err, data){
				if(err){
					reject({error: err});
				} else {
					resolve({token: data})
				}
			});
		});
		
	},
	//Input is array of contacts 
	getSeparateDeleteAndInsertContact: function(arrobjContact){
		var self = this;
		return new Promise(function(resolve, reject){
			//If gd$deleted is present in the contact this means it is deleted
			var arrDeletedContact = [];
			var arrNewUpdateContact = [];
			if(!_.isArray(arrobjContact)){
				arrobjContact = [arrobjContact];
			}
			_.each(arrobjContact, function(objContact){
				if(_.has(objContact, 'gd$deleted')){
					arrDeletedContact.push(objContact);
				} else {
					arrNewUpdateContact.push(objContact);
				}
			})

			return {deleted: arrDeletedContact, new: arrNewUpdateContact};
		})
		
	},

	//Group name for google contacts
	getGroupName: function(owner){
		return owner+'_GOOGLE';
	}
}