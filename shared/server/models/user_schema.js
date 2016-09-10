'use strict';

/*
 * User table schema
 */

// Load dep packages
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({  
  fname: String,
  lname: String,
  username: String,
  password: String,
  created_by: String,
  updated_by: String,
  is_active: {type: Boolean, default: true },
  created_on: {type: Date, default: Date.now },
  updated_on: {type: Date, default: Date.now }
});

mongoose.model('User', userSchema);