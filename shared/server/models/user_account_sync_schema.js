'use strict';

/*
 * Activity Log schema
 */

// Load dep packages
var mongoose = require('mongoose');  

var objUserAccountSync = new mongoose.Schema({  
  user_id: String,
  account_type: String, //type can be google || apple or anything  
  account_name: String,
  group_id: String,
  created_on: {type: Date, default: Date.now},
  in_progress: Boolean,
  last_sync: {type: Date},
  last_sync_status: Boolean,
  error_details: String,
  trigger_break: {type: String, default: 1440},
  is_active: {type: Boolean, default: true},
  metadata: {} //any general information if required to store
});

mongoose.model('UserAccountSync', objUserAccountSync);