'use strict';

/*
 * Handle facebook authentication
 */
// Libraries
var FB = require('facebook-node');
FB.setApiVersion("v2.5");
// Load config
var config = require('../config/config');  

module.exports = {
    
    get_url: function(fields, callback){    
      var url = "https://www.facebook.com/dialog/oauth?client_id="+config.facebookAuth.clientID+"&redirect_uri="+config.facebookAuth.callbackURL;
      callback(url);
    },
    set_token: function(fields, callback){
      FB.api('oauth/access_token', {
        client_id: config.facebookAuth.clientID,
        client_secret: config.facebookAuth.clientSecret,
        redirect_uri: config.facebookAuth.callbackURL,
        code: fields.code
      }, function (res) {
        if(!res || res.error) {
            console.log(!res ? 'error occurred' : res.error);
            callback(res.error);
            return;
        }
        FB.setAccessToken(res.access_token);
        FB.api('/me', { fields: ['id','name'] }, function (res) {
          callback(res);
        });
                
      });  
    }
};