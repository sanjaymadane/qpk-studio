// Process tasks from the work queue

var config = require('../config/config');
var mongoose = require('mongoose');
var common = require('../helpers/common_helper');

module.exports = {
  processWork: function(rmq, msg, cb){
    if(msg && msg.content) {
      var job = JSON.parse(msg.content.toString());
      var handleResponse = function(status, accountname){
        job.progress = '100%';
        if(status)
          job.status = 'Task:Completed';
        else
          job.status = 'Task:Failed';

        rmq.publish('','events', job);
        mongoose.model('ActivityLog').findOne({_id:job._id, user_id: job.user_id}, function(logerr,jobObj){
          if(logerr || !jobObj){
            mongoose.model('Task').remove({_id: job._id}, function(err, tk){
              cb(msg);  
            });
          } else {
            jobObj.import_from = accountname;
            jobObj.status = status ? "Completed" : 'Failed';
            jobObj.is_active = true;
            if(jobObj.type == "export"){
              jobObj.message = jobObj.message ? jobObj.message : {};
              jobObj.message.filename = job.filename;

            }
            common.track_log(jobObj, true);
            mongoose.model('Task').remove({_id: job._id}, function(err, tk){
              cb(msg);  
            });
          }
        });
      }
      switch(job.type){
        case 'vcard-import':
        case 'any-csv-import':
          var importCsv = require('./workers/import_global');
          var objConfig = {};
          if(job.sub_type == 'import-tmp'){
            objConfig = {
              group: 'PreviewGroup',
              contact: 'PreviewContact',
              group_contact: 'PreviewGroupContact'
            };
            // console.log("IMport to tmp")
            importCsv.tmpContactImport(rmq, job, objConfig, handleResponse);
          } else if(job.sub_type == 'import-main'){
            // console.log("IMport directly to main")
            objConfig = {
              group: 'Group',
              contact: 'Contact',
              group_contact: 'GroupContact'
            };
            importCsv.tmpContactImport(rmq, job, objConfig, handleResponse);
          }else if(job.sub_type == 'import-preview') {
            importCsv.previewContactImport(rmq, job, objConfig, handleResponse);
          }
          break;

        case 'google-import':     
          var google_import = require('./workers/google_import');   
          google_import.processGoogleImport(rmq, job, handleResponse);
          break;
        // case 'csv-import': 
                             
          // var file_import = require('./workers/import_global');                
          // file_import.tmpContactImport(rmq, job, handleResponse);
          // break;
        case 'csv-export':  
        case 'vcard-export': 
          var csv_export = require('./workers/file_export'); 
          csv_export.processExport(rmq, job, handleResponse);
          break;
        default:
          cb(msg);
      }
    } else
      cb(msg);
  }
}