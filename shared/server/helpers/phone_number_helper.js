'use strict'

// Get an instance of `PhoneNumberUtil`. 
var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

module.exports = {
	getCountryCode : function(phoneNo){
		try {
			return '+' + phoneUtil.parse(phoneNo,"").getCountryCode();
		} catch(e) {
			return '';
		}
	}
}