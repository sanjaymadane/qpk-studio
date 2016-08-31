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
  role: String,
  is_nas_user: Boolean,
  email: String,
  security_question: String,
  security_answer: String,
  high_security_password: String,
  created_by: String,
  updated_by: String,
  is_active: {type: Boolean, default: true },
  is_tutorial_displayed: {type: Boolean, default: false },
  profile_pic: String,
  created_on: {type: Date, default: Date.now },
  updated_on: {type: Date, default: Date.now },
  is_high_security_set: {type: Boolean, default: false }
});

mongoose.model('User', userSchema);