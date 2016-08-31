'use strict';

/*
 * User personol settings schema
 */

// Load dep packages
var mongoose = require('mongoose');  

var userSettingSchema = new mongoose.Schema({  
  user_id: String,
  language: String,
  grid_column_selected: Array,
  grid_config: {},
  tutorial_displayed: Boolean
});

userSettingSchema.index({ user_id: 1 }, { unique: true });

mongoose.model('UserSetting', userSettingSchema);