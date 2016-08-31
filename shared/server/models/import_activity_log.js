'use strict';

/*
 * Activity Log schema
 */

// Load dep packages
var mongoose = require('mongoose');  

var objImportActivityLogs = new mongoose.Schema({  
  user_id: String,  
  is_from_phone: {type: Boolean, default: false},
  device_id: String,
  transaction_id: String,
  logged_on: {type: Date, default: Date.now},
  general_data: {}

});

mongoose.model('ImportActivityLog', objImportActivityLogs);