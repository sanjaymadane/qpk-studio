'use strict';

/*
 * Question table schema
 */

// Load dep packages
var mongoose = require('mongoose'),
	moment = require('moment');

var questionsSchema = new mongoose.Schema({  
  name: String,
  is_active: {type: Boolean, default: true},
  created_on: {type: Date, default: moment().format('YYYY-MM-DD')}
});

mongoose.model('Questions', questionsSchema);
