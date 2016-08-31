'use strict'


var mongoose = require('mongoose');


var templateMapperSchema = new mongoose.Schema({  
	user_id: String,
	template_key: String,
	template_name: String,
	mapper: [{
		display_name: String,
		map_name: String,
	  	field_value: String,	
	}], 
	delimiter: String,
	is_active: {type: Boolean, default: true},
	is_default: {type: Boolean, default: false},
	is_show: {type: Boolean, default: true} 
});

mongoose.model('TemplateMapper', templateMapperSchema);