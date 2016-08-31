'use strict';

/*
 * Snapshot  schema
 */

// Load dep packages
var mongoose = require('mongoose');  

var snapshotSchema = new mongoose.Schema({  
  user_id: String,
  data_directory: String,
  display_name: String,  
  mtcnt_version: String,
  file_list:Array,
  is_completed: {type: Boolean, default: false },
  created_on: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true}
});

mongoose.model('SnapshotHistory', snapshotSchema);