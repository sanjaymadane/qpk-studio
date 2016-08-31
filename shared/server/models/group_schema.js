'use strict';

/*
 * Group table schema
 */

// Load dep packages
var mongoose = require('mongoose'),
	moment = require('moment');

var groupSchema = new mongoose.Schema({  
  name: String,
  user_id: String,
  is_active: {type: Boolean, default: true},
  created_on: {type: Date, default: Date.now},
  updated_on: {type: Date, default: Date.now}
});

mongoose.model('Group', groupSchema);