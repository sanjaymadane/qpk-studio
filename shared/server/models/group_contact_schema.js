'use strict';

/*
 * Group contact table schema
 */

// Load dep packages
var mongoose = require('mongoose');  

var groupContactSchema = new mongoose.Schema({  
  group_id: String,
  user_id: String,
  contact_id: String,
  created_on: {type: Date, default: Date.now}
});

groupContactSchema.index({ group_id: 1, user_id: 1, contact_id: 1 }, { unique: true });

mongoose.model('GroupContact', groupContactSchema);