'use strict';

/*
 * Contact schema
 */

// Load dep packages
var mongoose = require('mongoose'); 

//load Config
var config = require('../config/config');

var commonSchema = new mongoose.Schema({
	label: String,
	value: String	
});

var contactSchema = new mongoose.Schema({
  tmp_data: [commonSchema], // user defined fields
  transaction_id: String,
  is_locked: { type: Boolean, default: false },
  is_favorite: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },  
  user_id: String
});

//Temporary contact schema
mongoose.model('TempContact', contactSchema);
