'use strict';

/*
 * Activity Log schema
 */

// Load dep packages
var mongoose = require('mongoose');  

var activityLogSchema = new mongoose.Schema({  
  user_id: String,
  type: String,
  sub_type: String,
  key: String,
  general_data: {},
  message: {},
  import_from: String,
  status: String, 
  read: {type: Boolean, default: false},
  is_active: {type: Boolean, default: true},
  logged_on: {type: Date, default: Date.now}
});

mongoose.model('ActivityLog', activityLogSchema);