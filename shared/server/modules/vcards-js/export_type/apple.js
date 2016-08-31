'use strict'

function keyMapper(key) {
	var key = key.toLowerCase();
	var objKey = {
		'google_talk': 'googletalk',
        'qq': 'qq',
        'msn': 'msn',
        'jabber': 'jabber',
        'skype':'skype',
        'facebook':'facebook',
        'gadu':'gadugadu',
        'aim':'aim',
        'icq':'icq',        
        'yahoo':'yahoo',
        'home':'HOME',
        'work': 'WORK',
        'other':'OTHER'
	}

	return (objKey[key])? objKey[key] : key.toUpperCase();
}

module.exports = {
	getIm: function(ims){		
		var arrstrIm = [];
		for(var key in ims) {
			if( ims.hasOwnProperty(key) && ims[key]) {
				var strIm = 'IMPP;X-SERVICE-TYPE='+keyMapper(key)+';TYPE=pref:' + ims[key];
				arrstrIm.push(strIm);
			}			
		}
		return arrstrIm;			
	},

	getEmail: function(emails){		
		var arrstrEmail = [];		
		for(var key in emails) {
			if(emails[key] instanceof Array && emails[key].length > 0){
				emails[key].forEach(function(emailVal){
					var strEmail = 'EMAIL;type='+keyMapper(key)+',INTERNET:' + emailVal;
					arrstrEmail.push(strEmail);
				})				
			}			
		}		
		return arrstrEmail;		 
	},
	getPhone: function(phones){
		// TEL;TYPE=CELL;TYPE=pref;TYPE=VOICE:999 999 9999
		// TEL;TYPE=IPHONE;TYPE=CELL;TYPE=VOICE:888 888 8888
		// TEL;TYPE=HOME;TYPE=VOICE:7777 777777
		// TEL;TYPE=WORK;TYPE=VOICE:66 6666 6666
		var arrstrPhone = [];
		for(var key in phones) {			
			if(phones[key] instanceof Array && phones[key].length > 0){
				phones[key].forEach(function(phoneValue){
					var strPhone = 'TEL;TYPE='+keyMapper(key)+';TYPE=VOICE:' + phoneValue;
					arrstrPhone.push(strPhone);
				});
			}
		}
		return arrstrPhone;		 
	},
	getWebPage:function(webpages){
		var arrstrWebPage = [];
		for(var key in webpages) {
			if(webpages[key] instanceof Array && webpages[key].length > 0){
				webpages[key].forEach(function(webValue){
					var strWebPage = 'URL;type='+keyMapper(key)+':' + webValue;
					arrstrWebPage.push(strWebPage);
				});
			}
		}
		return arrstrWebPage;
	}


}