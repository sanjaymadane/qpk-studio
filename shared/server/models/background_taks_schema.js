'use strict';

/*
 * background task schema
 */

// Load dep packages
var mongoose = require('mongoose'),
	moment = require('moment');

var taskSchema = new mongoose.Schema({  
  name: String,
  type: String,
  sub_type: String,
  key: String,
  status: String,
  user_id: String,
  created_on: {type: Date, default: moment().format('YYYY-MM-DD')},
  conditions: {},
  general_data: {},
  message: String,
  export_file_path: String,
  originalname: String
},{ strict: false });

mongoose.model('Task', taskSchema);
