

module.exports = {
	mycontacts: function(){
		return ["First Name","Middle Name", "Last Name", "Nickname", "Title", "Email-Home", "Email-Office", "Email-Other", "Phone-Home", "Phone-Office", "Phone-Mobile", "Phone-Main", "Phone-Home Fax", "Phone-Business Fax", "Phone-Other", "Company Name", "Address-Office", "Address-Home", "Webpage", "IM-Skype", "IM-Facebook", "IM-QQ", "IM-Line", "IM-Wechat", "IM-Yahoo", "IM-Gtalk", "IM-Custom:Type", "IM-Custom:Value", "Date-Birthday", "Date-Anniversary", "Date-Custom:Type", "Date-Custom:Value", "Note", "Custom:Type", "Custom:Value"];
	},
	googleCsvFields: function(){
		return {
			singleField: [
				"Name Prefix",
				"Given Name",
				"Additional Name",
				"Family Name",
				"Nickname",
				"Birthday",
				"Notes",
				"Organization 1 - Name",			
				"Website 1 - Value",
				"E-mail 1 - Type",
				"E-mail 1 - Value",
				"E-mail 2 - Type",
				"E-mail 2 - Value",
				"E-mail 3 - Type",
				"E-mail 3 - Value",
				"Phone 1 - Type",
				"Phone 1 - Value",
				"Phone 2 - Type",
				"Phone 2 - Value",
				"Phone 3 - Type",
				"Phone 3 - Value",
				"Phone 4 - Type",
				"Phone 4 - Value",
				"Phone 5 - Type",
				"Phone 5 - Value",
				"Phone 6 - Type",
				"Phone 6 - Value",
				"Phone 7 - Type",
				"Phone 7 - Value",
				"Address 1 - Type",
				"Address 1 - Street",
				"Address 2 - Type",
				"Address 2 - Street",
				"IM 1 - Service",
				"IM 1 - Value"

				// "Name",
				// "Yomi Name",
				// "Given Name Yomi",
				// "Additional Name Yomi",
				// "Family Name Yomi",			
				// "Name Suffix",
				// "Initials",			
				// "Short Name",
				// "Maiden Name",			
				// "Gender",
				// "Location",
				// "Billing Information",
				// "Directory Server",
				// "Mileage",
				// "Occupation",
				// "Hobby",
				// "Sensitivity",
				// "Priority",
				// "Subject",
				// "Group Membership",			
				// "Organization 1 - Type",
				// "Organization 1 - Yomi Name",
				// "Organization 1 - Title",
				// "Organization 1 - Department",
				// "Organization 1 - Symbol",
				// "Organization 1 - Location",
				// "Organization 1 - Job Description",
				// "Website 1 - Type",
				// "Address 1 - Formatted",
				// "Address 1 - City",
				// "Address 1 - PO Box",
				// "Address 1 - Region",
				// "Address 1 - Postal Code",
				// "Address 1 - Country",
				// "Address 1 - Extended Address",
				// "Address 2 - Formatted",
				// "Address 2 - City",
				// "Address 2 - PO Box",
				// "Address 2 - Region",
				// "Address 2 - Postal Code",
				// "Address 2 - Country",
				// "Address 2 - Extended Address",
				// "IM 1 - Type"
			],

		multiple_event: {
			label: "Event %d - Type",
			value: "Event %d - Value"
		},
		multiple_custom: {
			label: "Custom Field %d - Type",
			value: "Custom Field %d - Value"
		}
			
		}
		
	}
}