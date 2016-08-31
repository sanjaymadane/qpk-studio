'use strict';

/*
 * Contact schema
 */

// Load dep packages
var mongoose = require('mongoose'); 

//load Config
var config = require('../config/config');

var emailSchema = new mongoose.Schema({
	label: String,
	value: String,
	is_primary: { type: Boolean, default: false }
}); 
var phoneSchema = new mongoose.Schema({
	label: String,
	value: String,
  country_code: String,
	is_primary: { type: Boolean, default: false }
}); 
var attachmentSchema = new mongoose.Schema({
  label: String,
  file_type: String,
  value: String,
  created_on: { type: Date, default: Date.now }
});
var sourcesSchema = new mongoose.Schema({
  label: String,
  value: String 
});

var commonSchema = new mongoose.Schema({
	label: String,
	value: String	
});

var contactSchema = new mongoose.Schema({  
  title: String,
  fname: String,
  lname: String,
  mname: String,
  nickname: String,
  company_name: String,
  profile_pic_history: Array,
  profile_pic: {type: String, default: config.default_profile_pic},
  note: String,

  addresses: [commonSchema],  // home, office

  web_pages: [commonSchema], //Multiple support

  sources: [sourcesSchema], // account type, userid,  

  emails: [emailSchema],  //home,office,other

  attachments: [attachmentSchema],//multiple support

  im: [commonSchema],  // skype,facebook,qq,line,other,wechat

  phones: [phoneSchema],  //home,work,mobile,main,home fax, business fax,other
  
  events: [commonSchema],  //dob, aniverserry, custom
  
  others: [commonSchema], // user defined fields
  is_locked: { type: Boolean, default: false },
  is_favorite: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  usage: {type: Number, default: 0},
  user_id: String,
  transaction_id: String
});

mongoose.model('PreviewContact', contactSchema);