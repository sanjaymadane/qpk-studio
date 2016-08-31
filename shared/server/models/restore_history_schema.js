'use strict';

/*
 * Snapshot  schema
 */

// Load dep packages
var mongoose = require('mongoose');  

var restoreSchema = new mongoose.Schema({  
  user_id: String,
  snapshot_id: String,
  is_completed: {type: Boolean, default: false },
  created_on: {type: Date, default: Date.now},
  completed_on:{type: Date, default: Date.now}
});

mongoose.model('RestoreHistory', restoreSchema);