'use strict';

/*
 * This will handle all common helper methods for application
 */
 var mongoose = require('mongoose');

module.exports = {
  'status_message': {
  	10000: 'Something went wrong, please try after some time',
  	10001: 'Success',
  	10002: 'No token provided',
  	10003: 'Invalid access token',
  	10004: 'Not permitted',
  	10005: 'Invalid username or password',
  	10006: 'Invalid usage of API, please check documentation for correct usage',
    10007: 'Failed to authenticate token',
    10008: 'High Security password cannot be empty.',
    10009: 'Wrong High Security password',
    10010: 'High Security Question and Answer cannot be blank',
    10011: 'Invalid Security Question and Answer',
    10012: 'Admin user cannot be deleted',
    10021: 'Trashed contact cannot be edited',
    10022: 'Count limit is being imposed',
    10023: 'No contacts to export',
    10024: 'Provide valid export type',
    10025: 'NAS details',
    10026: 'Error in getting details',
    10027: 'Application not installed yet',
    10028: 'Search need atleast 1 character.',
    10029: 'No valid field names to perform search operation',

    11000: 'Restore in progress',
    11001: 'Please provide a valid transaction id',
    11002: 'No contacts present for this transaction',
    11003: 'Please provide a valid mapper',    
    11004: 'Error while mapping contacts',
    11005: 'Please provide a valid group name',
    11006: "Please provide delete contact status",
    11007: "Please provide temp contact list",
    11008: "Please provide a valid template name",
    11009: "Please provide a valid mapper",    
    11011: "Template inserted Successfully",
    11012: "Template with same name already exists",
    11013: "Template List",
    11014: "Please provide a valid NAS file upload type",
    11015: "Please provide a valid file list",
    11016: "Only CSV and VCF file is accepted",
    11017: "File does not exists",
    11018: "File encoding modification error",
    11019: "Please provide a valid device id",
    11020: "Please  provide array of ids",
    11021: "Please provide a valid trigger time",
    11022: "Please provide a valid sync id"
  },
  pretty: function(status, status_code, data){
  	return {
  		"status": status,
  		"status_code": status_code,
  		"data": data,
  		"message": this.status_message[status_code]
  	};
  },
  filter_fields: function(fields, exFields){
    var field_filtered = {};
    var fields_array = fields ? fields.split(',') : [];
    var exFields = exFields || [];
    if(fields_array.length > 0){
      fields_array.forEach(function(field){
        field_filtered[field] = 1
      });

      exFields.forEach(function(field){
        delete field_filtered[field];
      });
    } else {
      exFields.forEach(function(field){
        field_filtered[field] = 0;
      });
    }    
    return field_filtered;
  },
  track_log: function(log, is_update){
    if(is_update && log._id){
      mongoose.model('ActivityLog').findByIdAndUpdate(log._id, log, function (err, data) {
        console.log('Logged updated');
      });
    } else {
      mongoose.model('ActivityLog').create(log, function (err, data) {
        console.log('Logged created');
      });
    }
  }
};