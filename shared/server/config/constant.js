'use strict'

/*
*	All the constants in the application needs to be defined here
*
*/


module.exports = {
	//This will be used for import contacts
	constSources: {
		'GOOGLE': 'GOOGLE',
		'CSV':'CSV'
	},

	//Do not change this array it is used in snapshot and restore 
	constModels: {
		'Questions' : 'questions',
		'Group' : 'groups',
		'GroupContact' : 'groupcontacts',
		'Contact': 'contacts',
		'MergeHistory':'mergehistories'
	},

	//this we will use in Field Mapping
	constEmailLable:{
		'HOME':'HOME',
		'OFFICE':'OFFICE',
		'OTHER':'OTHER',
	},
	constPhoneLabel:{
		'HOME':'HOME',
		'OFFICE':'OFFICE',
		'MOBILE':'MOBILE',
		'MAIN':'MAIN',
		'HOME_FAX':'HOME_FAX',
		'BUSINESS_FAX':'BUSINESS_FAX',
		'OTHER':'OTHER'
	},
	constAddressLabel:{
		'HOME':'HOME',
		'OFFICE':'OFFICE'
	},
	constImLabel:{
		"DEFAULT": "",
		"SKYPE":"SKYPE",
		"FACEBOOK":"FACEBOOK",
		"QQ":"QQ",
		"LINE":"LINE",
		"WECHAT":"WECHAT",
		"YAHOO":"YAHOO",
		"GOOGLE_TALK":"GOOGLE_TALK"
	},
	constDateLabel:{
		'DEFAULT': '',
		'BIRTH_DATE':'BIRTH_DATE',
		'ANNIVERSARY':'ANNIVERSARY'
	},
	constWebpageLabel:{
		'DEFAULT':'HOME'
	},
	constOtherLabel:{
		'DEFAULT':''
	},

	constDefaultSeparator: '|||',
	constGoogleDefaultSeparator: ' ::: ',

	//this is used for parsing and mapping the global csv function
	constGlobalFieldSeparator: '-',
	constContactSingleField: ["title", "fname", "lname", "mname", "nickname", "company_name"],
	constContactArrayField: ["note"],
	constContactMultipleField: ["addresses", "web_pages", "emails", "im", "phones", "events", "others"],

	ERROR_GROUP_ALREADY_EXISTS: 10050,
	constPriorityFieldList :['fname','mname','lname','nickname','emails','phones','company_name','im','addresses','web_pages','note'],
	constPriorityFieldListMultiString: ['company_name','addresses','note'],
	constNamePriorityFieldListMultiString: ['fname','mname','lname','nickname'],
	constAvoidFieldListMultiString: ['fname','mname','lname','nickname','emails','phones', 'events', 'im', 'web_pages'],

	constTaskType: {
		'GOOGLE' : 'NOTIFICATION_GOOGLE_IMPORT',
		'IMPORT_TEMP' : 'NOTIFICATION_IMPORT_TEMP',		
		'IMPORT_PREVIEW' : 'NOTIFICATION_IMPORT_PREVIEW',
		'IMPORT_DIRECT': 'NOTIFICATION_IMPORT_DIRECT',
		'EXPORT': 'NOTIFICATION_EXPORT'
	},
	//This is use in case of phone imports
	constDefaultQcontactzMapper: {
		"First Name":"fname",
		"Middle Name":"mname",
		"Last Name":"lname",
		"Nickname":"nickname",
		"Title":"title",
		"Email-Home":"emails-HOME",
		"Email-Office":"emails-OFFICE",
		"Email-Other":"emails-OTHER",
		"Phone-Home":"phones-HOME",
		"Phone-Office":"phones-OFFICE",
		"Phone-Mobile":"phones-MOBILE",
		"Phone-Main":"phones-MAIN",
		"Phone-Home Fax":"phones-HOME_FAX",
		"Phone-Business Fax":"phones-BUSINESS_FAX",
		"Phone-Other":"phones-OTHER",
		"Company Name":"company_name",
		"Address-Office":"addresses-OFFICE",
		"Address-Home":"addresses-HOME",
		"Webpage":"web_pages",
		"IM-Skype":"im-SKYPE",
		"IM-Facebook":"im-FACEBOOK",
		"IM-QQ":"im-QQ",
		"IM-Line":"im-LINE",
		"IM-Wechat":"im-WECHAT",
		"IM-Yahoo":"im-YAHOO",
		"IM-Gtalk":"im-GOOGLE_TALK",
		"IM-Custom:Type":"",
		"IM-Custom:Value":"im-",
		"Date-Birthday":"events-BIRTH_DATE",
		"Date-Anniversary":"events-ANNIVERSARY",
		"Date-Custom:Type":"",
		"Date-Custom:Value":"events-",
		"Note":"note",
		"Custom:Value":"note"
	}
}