'use strict';

/*
 * Handle skype authentication
 */
// Libraries
var Skyweb = require('skyweb');
var skyweb = new Skyweb();

// Load config
var config = require('../config/config');  

module.exports = {
    
    get_contacts: function(fields, callback){ 
        skyweb.login(fields.username, fields.password).then(function(skypeAccount){  
        	callback(skyweb.contactsService.contacts);    		
		});        
    }
};