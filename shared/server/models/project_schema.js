'use strict';

/*
 * Project table schema
 */

// Load dep packages
var mongoose = require('mongoose');

var projectSchema = new mongoose.Schema({  
  name: String,
  user_id: String,
  is_active: {type: Boolean, default: true },
  created_on: {type: Date, default: Date.now },
  updated_on: {type: Date, default: Date.now }
});

mongoose.model('Project', projectSchema);