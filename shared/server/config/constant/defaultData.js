'use strict'

var constant = require('../constant');

module.exports = {
	templateData: function() {
			var arrObjData = [];

			/*
			* display name => Text to be shown in the drop down list
			* map_name => Text with which this should be compared
			* field_vale => value to be sent to server
			*/
			var objMycontactData = {
					template_key: 'mycontact',
					is_default:true,
					template_name: "Qcontactz CSV",
					mapper: [{
							display_name: "First Name",
							map_name: "First Name",
						  	field_value: "fname"
						},
						{
							display_name: "Middle Name",
							map_name: "Middle Name",
						  	field_value: "mname"
						},
						{
							display_name: "Last Name",
							map_name: "Last Name",
						  	field_value: "lname"
						},
						{
							display_name: "Nickname",
							map_name: "Nickname",
						  	field_value: "nickname"
						},
						{
							display_name: "Title",
							map_name: "Title",
						  	field_value: "title"
						},
						{
							display_name: "Email-Home",
							map_name: "Email-Home",
						  	field_value: "emails-"+ constant.constEmailLable.HOME
						},
						{
							display_name: "Email-Office",
							map_name: "Email-Office",
						  	field_value: "emails-"+ constant.constEmailLable.OFFICE
						},
						{
							display_name: "Email-Other",
							map_name: "Email-Other",
						  	field_value: "emails-"+ constant.constEmailLable.OTHER
						},
						{
							display_name: "Phone-Home",
							map_name: "Phone-Home",
						  	field_value: "phones-"+ constant.constPhoneLabel.HOME
						},
						{
							display_name: "Phone-Office",
							map_name: "Phone-Office",
						  	field_value: "phones-"+ constant.constPhoneLabel.OFFICE
						},
						{
							display_name: "Phone-Mobile",
							map_name: "Phone-Mobile",
						  	field_value: "phones-"+ constant.constPhoneLabel.MOBILE
						},
						{
							display_name: "Phone-Main",
							map_name: "Phone-Main",
						  	field_value: "phones-"+ constant.constPhoneLabel.MAIN
						},
						{
							display_name: "Phone-Home Fax",
							map_name: "Phone-Home Fax",
						  	field_value: "phones-"+ constant.constPhoneLabel.HOME_FAX
						},
						{
							display_name: "Phone-Business Fax",
							map_name: "Phone-Business Fax",
						  	field_value: "phones-"+ constant.constPhoneLabel.BUSINESS_FAX
						},
						{
							display_name: "Phone-Other",
							map_name: "Phone-Other",
						  	field_value: "phones-"+ constant.constPhoneLabel.OTHER
						},
						{
							display_name: "Company",
							map_name: "Company",
						  	field_value: "company_name"
						},
						{
							display_name: "Address-Home",
							map_name: "Address-Home",
						  	field_value: "addresses-"+ constant.constAddressLabel.HOME
						},
						{
							display_name: "Address-Office",
							map_name: "Address-Office",
						  	field_value: "addresses-"+ constant.constAddressLabel.OFFICE
						},
						{
							display_name: "Webpage",
							map_name: "Webpage",
						  	field_value: "web_pages",
						},
						{
							display_name: "IM-Skype",
							map_name: "IM-Skype",
						  	field_value: "im-"+ constant.constImLabel.SKYPE
						},
						{
							display_name: "IM-Facebook",
							map_name: "IM-Facebook",
						  	field_value: "im-"+ constant.constImLabel.FACEBOOK
						},
						{
							display_name: "IM-QQ",
							map_name: "IM-QQ",
						  	field_value: "im-"+ constant.constImLabel.QQ
						},
						{
							display_name: "IM-Line",
							map_name: "IM-Line",
						  	field_value: "im-"+ constant.constImLabel.LINE
						},
						{
							display_name: "IM-Wechat",
							map_name: "IM-Wechat",
						  	field_value: "im-"+ constant.constImLabel.WECHAT
						},
						{
							display_name: "IM-Yahoo",
							map_name: "IM-Yahoo",
						  	field_value: "im-"+ constant.constImLabel.YAHOO
						},
						{
							display_name: "IM-GTalk",
							map_name: "IM-GTalk",
						  	field_value: "im-"+ constant.constImLabel.GOOGLE_TALK
						},
						{
							display_name: "IM-Custom",
							map_name: "IM-Custom",
						  	field_value: "im-"+ constant.constImLabel.DEFAULT
						},
						{
							display_name: "Date-Birthday",
							map_name: "Date-Birthday",
						  	field_value: "events-"+ constant.constDateLabel.BIRTH_DATE
						},
						{
							display_name: "Date-Anniversary",
							map_name: "Date-Anniversary",
						  	field_value: "events-"+ constant.constDateLabel.ANNIVERSARY
						},
						{
							display_name: "Date-Custom",
							map_name: "Date-Custom",
						  	field_value: "events-"+ constant.constDateLabel.DEFAULT
						},
						{
							display_name: "Note",
							map_name: "Note",
						  	field_value: "note",
						}
						],
					delimiter: '|||'
				};

			var objGoogleData = {
					template_key: 'google',
					template_name: "Google CSV",
					mapper: [{
							display_name: "First Name",
							map_name: "Given Name",
						  	field_value: "fname"
						},
						{
							display_name: "Middle Name",
							map_name: "Additional Name",
						  	field_value: "mname"
						},
						{
							display_name: "Last Name",
							map_name: "Family Name",
						  	field_value: "lname"
						},
						{
							display_name: "Nickname",
							map_name: "Nickname",
						  	field_value: "nickname"
						},
						{
							display_name: "Title",
							map_name: "Name Prefix",
						  	field_value: "title"
						}],
					delimiter: ':::'
				};

			var objYahooData = {
					template_key: 'yahoo',
					template_name: "Yahoo CSV",
					mapper: [{
							display_name: "First Name",
							map_name: "First",
						  	field_value: "fname"
						},
						{
							display_name: "Middle Name",
							map_name: "Middle",
						  	field_value: "mname"
						},
						{
							display_name: "Last Name",
							map_name: "Last",
						  	field_value: "lname"
						},
						{
							display_name: "Nickname",
							map_name: "Nickname",
						  	field_value: "nickname"
						},
						{
							display_name: "Title",
							map_name: "Title",
						  	field_value: "title"
						},
						{
							display_name: "Email-Home",
							map_name: "Email",
						  	field_value: "emails-"+ constant.constEmailLable.HOME
						},
						{
							display_name: "Email-Other",
							map_name: "Alternate-Email x",
						  	field_value: "emails-"+ constant.constEmailLable.OTHER
						},
						{
							display_name: "Phone-Home",
							map_name: "Home",
						  	field_value: "phones-"+ constant.constPhoneLabel.HOME
						},
						{
							display_name: "Phone-Office",
							map_name: "Work",
						  	field_value: "phones-"+ constant.constPhoneLabel.OFFICE
						},
						{
							display_name: "Phone-Mobile",
							map_name: "Mobile",
						  	field_value: "phones-"+ constant.constPhoneLabel.MOBILE
						},
						
						{
							display_name: "Phone-Home Fax",
							map_name: "Fax",
						  	field_value: "phones-"+ constant.constPhoneLabel.HOME_FAX
						},						
						{
							display_name: "Phone-Other",
							map_name: "Pager",
						  	field_value: "phones-"+ constant.constPhoneLabel.OTHER
						},
						{
							display_name: "Company",
							map_name: "Company",
						  	field_value: "company_name"
						},
						{
							display_name: "Address-Home",
							map_name: "Home Address",
						  	field_value: "addresses-"+ constant.constAddressLabel.HOME
						},
						{
							display_name: "Address-Office",
							map_name: "Work Address",
						  	field_value: "addresses-"+ constant.constAddressLabel.OFFICE
						},
						{
							display_name: "Webpage",
							map_name: "Personal Website",
						  	field_value: "web_pages",
						},
						{
							display_name: "Webpage",
							map_name: "Business Website",
						  	field_value: "web_pages",
						},
						{
							display_name: "IM-Skype",
							map_name: "Skype ID",
						  	field_value: "im-"+ constant.constImLabel.SKYPE
						},
						{
							display_name: "IM-Facebook",
							map_name: "IM-Facebook",
						  	field_value: "im-"+ constant.constImLabel.FACEBOOK
						},
						{
							display_name: "IM-QQ",
							map_name: "QQ ID",
						  	field_value: "im-"+ constant.constImLabel.QQ
						},
						{
							display_name: "IM-Line",
							map_name: "IM-Line",
						  	field_value: "im-"+ constant.constImLabel.LINE
						},
						{
							display_name: "IM-Wechat",
							map_name: "IM-Wechat",
						  	field_value: "im-"+ constant.constImLabel.WECHAT
						},
						{
							display_name: "IM-Yahoo",
							map_name: "Messenger ID",
						  	field_value: "im-"+ constant.constImLabel.YAHOO
						},
						{
							display_name: "IM-GTalk",
							map_name: "Google ID",
						  	field_value: "im-"+ constant.constImLabel.GOOGLE_TALK
						},
						{
							display_name: "IM-Custom",
							map_name: "IRC ID",
						  	field_value: "im-"+ constant.constImLabel.DEFAULT
						},
						{
							display_name: "IM-Custom",
							map_name: "ICQ ID",
						  	field_value: "im-"+ constant.constImLabel.DEFAULT
						},
						{
							display_name: "IM-Custom",
							map_name: "MSN ID",
						  	field_value: "im-"+ constant.constImLabel.DEFAULT
						},
						{
							display_name: "IM-Custom",
							map_name: "AIM ID",
						  	field_value: "im-"+ constant.constImLabel.DEFAULT
						},
						{
							display_name: "Date-Birthday",
							map_name: "Birthday",
						  	field_value: "events-"+ constant.constDateLabel.BIRTH_DATE
						},
						{
							display_name: "Date-Anniversary",
							map_name: "Anniversary",
						  	field_value: "events-"+ constant.constDateLabel.ANNIVERSARY
						},
						{
							display_name: "Date-Custom",
							map_name: "Date-Custom",
						  	field_value: "events-"+ constant.constDateLabel.DEFAULT
						},
						{
							display_name: "Note",
							map_name: "Comments",
						  	field_value: "note",
						}],
					delimiter: ''
				};

			var objOutlookData = {
				template_key: 'outlook',
				template_name: "Outlook CSV",
				mapper: [
					{
						display_name: "Title",
						map_name: "Title",
					  	field_value: "title"
					},
					{
						display_name: "First Name",
						map_name: "First Name",
					  	field_value: "fname"
					},
					{
						display_name: "Middle Name",
						map_name: "Middle Name",
					  	field_value: "mname"
					},
					{
						display_name: "Last Name",
						map_name: "Last Name",
					  	field_value: "lname"
					},
					{
						display_name: "Address-Home",
						map_name: "Home Street",
					  	field_value: "addresses-"+ constant.constAddressLabel.HOME
					},
					{
						display_name: "Company",
						map_name: "Company",
					  	field_value: "company_name"
					},
					
					{
						display_name: "Address-Office",
						map_name: "Business Street",
					  	field_value: "addresses-"+ constant.constAddressLabel.OFFICE
					},						
					{
						display_name: "Phone-Business Fax",
						map_name: "Business Fax",
					  	field_value: "phones-"+ constant.constPhoneLabel.BUSINESS_FAX
					},
					{
						display_name: "Phone-Office",
						map_name: "Business Phone",
					  	field_value: "phones-"+ constant.constPhoneLabel.OFFICE
					},
					{
						display_name: "Phone-Office",
						map_name: "Business Phone x",
					  	field_value: "phones-"+ constant.constPhoneLabel.OFFICE
					},
					{
						display_name: "Phone-Other",
						map_name: "Car Phone",
					  	field_value: "phones-"+ constant.constPhoneLabel.OTHER
					},
					{
						display_name: "Phone-Office",
						map_name: "Company Main Phone",
					  	field_value: "phones-"+ constant.constPhoneLabel.OFFICE
					},
					{
						display_name: "Phone-Home Fax",
						map_name: "Home Fax",
					  	field_value: "phones-"+ constant.constPhoneLabel.HOME_FAX
					},											
					{
						display_name: "Phone-Home",
						map_name: "Home Phone",
					  	field_value: "phones-"+ constant.constPhoneLabel.HOME
					},
					{
						display_name: "Phone-Home",
						map_name: "Home Phone x",
					  	field_value: "phones-"+ constant.constPhoneLabel.HOME
					},
					{
						display_name: "Phone-Mobile",
						map_name: "Mobile Phone",
					  	field_value: "phones-"+ constant.constPhoneLabel.MOBILE
					},
					{
						display_name: "Phone-Other",
						map_name: "Pager",
					  	field_value: "phones-"+ constant.constPhoneLabel.OTHER
					},
					{
						display_name: "Phone-Other",
						map_name: "Other Fax",
					  	field_value: "phones-"+ constant.constPhoneLabel.OTHER
					},
					{
						display_name: "Phone-Other",
						map_name: "Other Phone",
					  	field_value: "phones-"+ constant.constPhoneLabel.OTHER
					},
					{
						display_name: "Date-Birthday",
						map_name: "Birthday",
					  	field_value: "events-"+ constant.constDateLabel.BIRTH_DATE
					},
					{
						display_name: "Date-Anniversary",
						map_name: "Anniversary",
					  	field_value: "events-"+ constant.constDateLabel.ANNIVERSARY
					},
					{
						display_name: "Email-Other",
						map_name: "E-mail Address",
					  	field_value: "emails-"+ constant.constEmailLable.OTHER
					},
					{
						display_name: "Email-Other",
						map_name: "E-mail x Address",
					  	field_value: "emails-"+ constant.constEmailLable.OTHER
					},					
					{
						display_name: "Webpage",
						map_name: "Webpage",
					  	field_value: "web_pages",
					}					
				],
				delimiter: ''
				};

			var objLotuNoteData = {
					template_key: 'lotus_note',	
					template_name: "Lotus Notes CSV",
					mapper: [{
							display_name: "First Name",
							map_name: "First Name",
						  	field_value: "fname"
						},
						{
							display_name: "Middle Name",
							map_name: "Middle Name",
						  	field_value: "mname"
						},
						{
							display_name: "Last Name",
							map_name: "Last Name",
						  	field_value: "lname"
						},						
						{
							display_name: "Title",
							map_name: "Title",
						  	field_value: "title"
						},
						{
							display_name: "Email-Home",
							map_name: "Personal Mail",
						  	field_value: "emails-"+ constant.constEmailLable.HOME
						},
						{
							display_name: "Email-Office",
							map_name: "Business Mail",
						  	field_value: "emails-"+ constant.constEmailLable.OFFICE
						},
						{
							display_name: "Email-Home",
							map_name: "Personal Mail 2",
						  	field_value: "emails-"+ constant.constEmailLable.HOME
						},
						{
							display_name: "Email-Office",
							map_name: "Business Mail 2",
						  	field_value: "emails-"+ constant.constEmailLable.OFFICE
						},						
						{
							display_name: "Phone-Home",
							map_name: "Home Phone",
						  	field_value: "phones-"+ constant.constPhoneLabel.HOME
						},						
						{
							display_name: "Phone-Mobile",
							map_name: "Mobile Phone",
						  	field_value: "phones-"+ constant.constPhoneLabel.MOBILE
						},
						{
							display_name: "Phone-Home",
							map_name: "Home Phone 2",
						  	field_value: "phones-"+ constant.constPhoneLabel.HOME
						},						
						{
							display_name: "Phone-Mobile",
							map_name: "Mobile Phone 2",
						  	field_value: "phones-"+ constant.constPhoneLabel.MOBILE
						},
						{
							display_name: "Phone-Office",
							map_name: "Business Phone",
						  	field_value: "phones-"+ constant.constPhoneLabel.OFFICE
						},
						{
							display_name: "Phone-Office",
							map_name: "Business Phone 2",
						  	field_value: "phones-"+ constant.constPhoneLabel.OFFICE
						},
						{
							display_name: "Phone-Home Fax",
							map_name: "Fax",
						  	field_value: "phones-"+ constant.constPhoneLabel.HOME_FAX
						},
						{
							display_name: "Phone-Business Fax",
							map_name: "Fax 2",
						  	field_value: "phones-"+ constant.constPhoneLabel.BUSINESS_FAX
						},
						{
							display_name: "Phone-Other",
							map_name: "Assistant's Phone",
						  	field_value: "phones-"+ constant.constPhoneLabel.OTHER
						},
						{
							display_name: "Phone-Other",
							map_name: "Pager",
						  	field_value: "phones-"+ constant.constPhoneLabel.OTHER
						},
						{
							display_name: "Company",
							map_name: "Company",
						  	field_value: "company_name"
						},
						{
							display_name: "Address-Home",
							map_name: "Home Street",
						  	field_value: "addresses-"+ constant.constAddressLabel.HOME
						},
						{
							display_name: "Address-Office",
							map_name: "Business Street",
						  	field_value: "addresses-"+ constant.constAddressLabel.OFFICE
						},
						{
							display_name: "Webpage",
							map_name: "Blog Site",
						  	field_value: "web_pages",
						},
						{
							display_name: "Webpage",
							map_name: "Web Site",
						  	field_value: "web_pages",
						},
						{
							display_name: "IM-Skype",
							map_name: "Messaging ID",
						  	field_value: "im-"+ constant.constImLabel.SKYPE
						},						
						{
							display_name: "Date-Birthday",
							map_name: "Birthday",
						  	field_value: "events-"+ constant.constDateLabel.BIRTH_DATE
						},
						{
							display_name: "Date-Anniversary",
							map_name: "Anniversary",
						  	field_value: "events-"+ constant.constDateLabel.ANNIVERSARY
						},						
						{
							display_name: "Note",
							map_name: "Comments",
						  	field_value: "note",
						}
						],
					delimiter: ''
				};

			var objDefaultData = {
					is_show: false,
					template_key: 'default',
					template_name: "Choose Mapping",
					mapper: [
						{
							display_name: "First Name",
							map_name: "First Name",
						  	field_value: "fname"
						},
						{
							display_name: "First Name",
							map_name: "Given Name",
						  	field_value: "fname"
						},
						{
							display_name: "First Name",
							map_name: "First",
						  	field_value: "fname"
						},
						{
							display_name: "Middle Name",
							map_name: "Middle Name",
						  	field_value: "mname"
						},
						{
							display_name: "Middle Name",
							map_name: "Additional Name",
						  	field_value: "mname"
						},
						{
							display_name: "Middle Name",
							map_name: "Middle",
						  	field_value: "mname"
						},

						{
							display_name: "Last Name",
							map_name: "Last Name",
						  	field_value: "lname"
						},
						{
							display_name: "Last Name",
							map_name: "Family Name",
						  	field_value: "lname"
						},
						{
							display_name: "Last Name",
							map_name: "Last",
						  	field_value: "lname"
						},
						{
							display_name: "Title",
							map_name: "Title",
						  	field_value: "title"
						},
						{
							display_name: "Title",
							map_name: "Prefix",
						  	field_value: "title"
						},
						{
							display_name: "Nickname",
							map_name: "Nickname",
						  	field_value: "nickname"
						},
						{
							display_name: "Email-Home",
							map_name: "E-mail",
						  	field_value: "emails-"+ constant.constEmailLable.HOME
						},
						{
							display_name: "Email-Home",
							map_name: "Email",
						  	field_value: "emails-"+ constant.constEmailLable.HOME
						},
						{
							display_name: "Phone-Home",
							map_name: "Phone",
						  	field_value: "phones-"+ constant.constPhoneLabel.HOME
						},						
						{
							display_name: "Phone-Mobile",
							map_name: "Mobile ",
						  	field_value: "phones-"+ constant.constPhoneLabel.MOBILE
						},						
						{
							display_name: "Phone-Home Fax",
							map_name: "Fax",
						  	field_value: "phones-"+ constant.constPhoneLabel.HOME_FAX
						},						
						{
							display_name: "Phone-Other",
							map_name: "Pager",
						  	field_value: "phones-"+ constant.constPhoneLabel.OTHER
						},
						{
							display_name: "Company",
							map_name: "Organization",
						  	field_value: "company_name"
						},
						{
							display_name: "Company",
							map_name: "Company",
						  	field_value: "company_name"
						},
						{
							display_name: "Date-Birthday",
							map_name: "Birthday",
						  	field_value: "events-"+ constant.constDateLabel.BIRTH_DATE
						},
						{
							display_name: "Webpage",
							map_name: "Webpage",
						  	field_value: "web_pages",
						},
						{
							display_name: "Webpage",
							map_name: "Website",
						  	field_value: "web_pages",
						},
						{
							display_name: "Date-Anniversary",
							map_name: "Anniversary",
						  	field_value: "events-"+ constant.constDateLabel.ANNIVERSARY
						},
						{
							display_name: "Date-Custom",
							map_name: "Event",
						  	field_value: "events-"+ constant.constDateLabel.DEFAULT
						},
						{
							display_name: "Note",
							map_name: "Note",
						  	field_value: "note",
						},
						{
							display_name: "Note",
							map_name: "Notes",
						  	field_value: "note",
						},
						{
							display_name: "IM-Custom",
							map_name: "IM",
						  	field_value: "im-"+ constant.constImLabel.DEFAULT
						},
						{
							display_name: "IM-Skype",
							map_name: "Skype",
						  	field_value: "im-"+ constant.constImLabel.SKYPE
						},
						
						{
							display_name: "IM-QQ",
							map_name: "QQ",
						  	field_value: "im-"+ constant.constImLabel.QQ
						},
						{
							display_name: "IM-GTalk",
							map_name: "Gtalk",
						  	field_value: "im-"+ constant.constImLabel.GOOGLE_TALK
						},
						{
							display_name: "IM-Custom",
							map_name: "AIM",
						  	field_value: "im-"+ constant.constImLabel.DEFAULT
						},
						{
							display_name: "IM-Custom",
							map_name: "ICQ",
						  	field_value: "im-"+ constant.constImLabel.DEFAULT
						},
						{
							display_name: "IM-Custom",
							map_name: "MSN",
						  	field_value: "im-"+ constant.constImLabel.DEFAULT
						}
					],
					delimiter: ''
				};

			arrObjData.push(objDefaultData);
			arrObjData.push(objLotuNoteData);
			arrObjData.push(objOutlookData);
			arrObjData.push(objYahooData);
			arrObjData.push(objGoogleData);
			arrObjData.push(objMycontactData);			

			return arrObjData;
	},

	syncDefaultData: function(){
		var arrobjData = [
			{
				label: 'Never',
				value: -1,
				key: 'LABEL_NEVER'
			},
			{
				label: 'Every 10 mins after the previous import has finished',
				value: 600,
				key: 'LABEL_TEN_MIN'
			},
			{
				label: 'Every 1 hr after the previous import has finished',
				value: 3600,
				key: 'LABEL_ONE_HR'
			},
			{
				label: 'Every 1 day after the previous import has finished',
				value: 86400,
				key: 'LABEL_ONE_DAY',
				is_default: true
			},
			{
				label: 'Every 1 week after the previous import has finished',
				value: 604800,
				key: 'LABEL_ONE_WEEK'
			}

		];

		return arrobjData;
	}	
}