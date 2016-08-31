'use strict';

/*
 * Handle yahoo authentication
 */
// Libraries
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

// Load config
var config = require('../config/config');  

module.exports = {
    
    get_token: function(fields, callback){ 
        var url = "https://api.login.yahoo.com/oauth2/request_auth?client_id="+config.yahooAuth.clientID+"&redirect_uri="+config.yahooAuth.callbackURL+"&response_type=token&language=en-us";
        callback(url);
    },
    set_token: function(fields, callback){
        console.log(fields.code);
      callback()    	
    }
};