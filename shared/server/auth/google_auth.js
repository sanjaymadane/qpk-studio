'use strict';

/*
 * Handle google authentication
 */
// Load dep packages
var google = require('googleapis'),
    GoogleContacts = require('google-contacts-api'),
    OAuth2 = google.auth.OAuth2;

// Load configuration
var config = require('../config/config');

// Local variables
var oauth2Client = new OAuth2(config.googleAuth.client_id, config.googleAuth.client_secret, config.googleAuth.redirect_url);
var scopes = [
    "https://www.google.com/m8/feeds/",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ];
var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
    scope: scopes, // If you only need one scope you can pass it as string,
    approval_prompt: 'force'
  });

  
module.exports = {
    
  import: function(callback){        
     callback(url);
  },
  get_token: function(fields, callback){
  	var code = fields.code;
    
  	oauth2Client.getToken(code, function(err, tokens){    
    	if(err){
  			callback(err);
  		} else {
        callback(null, tokens);
      }  		
  	});
  }
};