'use strict'

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose'),
    path = require('path'),
    fs = require('fs-extra'),
    _ = require('underscore'),
    moment = require('moment');

var tasks = require('../../background_tasks'); 

// Load helpers
var common = require('../../helpers/common_helper'),  
    media = require('../../helpers/media_helper'),
    file = require('../../helpers/file_helper');

// Load file config 
var config = require('../../config/config');


// router.route('/')
// .post(function(req,res,next){
//   var contacts = [];
//   //create the background task object
//   var task = {        
//     status: 'Task:Waiting',      
//     progress: "Waiting",
//     user_id: req.user_auth.user_id
//   };
//   var log =  {  
//     user_id: req.user_auth.user_id,
//     type: "import",    
//     message: {},
//     status: "Processing",  
//     is_active: false
//   }

//   media.process_import_upload(req, res, function(result){
//     if(result.status) {     
//       var fileExtension = path.extname(result.message.originalname);
//       switch(fileExtension){
//         case '.csv':
//           task.type = 'csv-import';
//           task.name = 'Import CSV',
//           log.sub_type= "CSV";
//           break;
//         case '.vcf':
//           task.type = 'vcard-import';
//           task.name = 'Import VCARD',
//           log.sub_type= "VCARD";
//           break

//         default:
//           task.type = null;
//       }

//       if(task.type){
//         task.file_path = result.message.path;
//         task.filename = result.message.originalname;      
//         createTask(task, function(err, data) {
//           if (err) {
//             log.message.text = "Error while creating task";
//             log.status = "Failed";
//             log.is_active = true;
//             common.track_log(log);
//             res.json(common.pretty(false, 10000, 'Error in creating tasks')); 
//           } else {
//             log._id = data._id;
//             common.track_log(log);
//             res.json(common.pretty(true, 10001, data)); 
//           }
//         });
//       } else {
//         log.message.text = result.message.originalname + ' Invalid file type';
//         log.status = "Failed";
//         log.is_active = true;
//         common.track_log(log);
//         //invalid task file            
//         fs.unlinkSync(result.message.path);
//         res.json(common.pretty(false, 10000, 'Invalid file'));
//       }
//     } else {      
//       log.message.text = result.message;
//       log.status = "Failed";
//       log.is_active = true;
//       common.track_log(log);
//       res.json(common.pretty(false, 10000, result.message));
//     }
//   });
// });

router.route('/')
.post(function(req,res, next){
  var userId = req.user_auth.user_id;
  var task = null;
  console.time("dbsave");
  media.upload_big_files(req, res).then(function(objFileDetails){    
    return getPrepareTaskObj(userId, objFileDetails);
  }).then(function(taskResolve){    
    console.timeEnd("dbsave");    
    createTask(taskResolve,function(err, doc){
      if (err) {
        res.json(common.pretty(true, 10000, err));
      } else {
        res.json(common.pretty(true, 10001, doc.general_data));
      }
    })
  })
  .catch(function(reject){
    console.timeEnd("dbsave");
    res.json(common.pretty(false, 10000, reject));
  })
});

router.route('/file')
.post(function(req, res, next){
  var userId = req.user_auth.user_id;
  var strFilepath = req.body.import;
  var strRelativefilePath = strFilepath;
  var strAbsolutePath = config.media_base_path + strRelativefilePath;
  if(file.fileExists(strAbsolutePath)){       
      var strFileExtension = path.extname(strAbsolutePath);
      var strFileName = path.basename(strAbsolutePath)
      var objFileDetails = {
        path: strAbsolutePath,
        originalname: strFileName,
        filename: strFileName,
        filetype: strFileExtension
      };
      var allowedImport = ['.csv','.vcf'];
      if(_.indexOf(allowedImport, strFileExtension) != -1){
        getPrepareTaskObj(userId, objFileDetails).then(function(taskResolve){        
          // console.log(JSON.stringify(taskResolve));
          createTask(taskResolve,function(err, doc){
            if (err) {
              res.json(common.pretty(false, 10000, err));
            } else {
              res.json(common.pretty(true, 10001, doc.general_data));
            }
          })
        })
        .catch(function(reject){
          res.json(common.pretty(false, 10000, reject));
        })
      } else {
        res.json(common.pretty(false, 11016));
      }      
  } else {
    res.json(common.pretty(false, 11017));
  }
});

router.route('/anyfile/parser')
.post(function(req,res, next){
  var moment = require('moment');
  var parse = require('csv-parse');

  var parserStream = fs.createReadStream(__dirname+'/../../public/google_uniode.csv');
  

  var output = [];
  // Create the parser
  var parser = parse({delimiter: ',', columns:true, relax: true, skip_empty_lines: true, trim:true, quote: '"', escape: '"', relax_column_count: true, encoding: 'ascii'});
  // Use the writable stream api
  parser.on('readable', function(){
    var record;
    while (record = parser.read()) {
      output.push(record);
    }
  });
  // Catch any error
  parser.on('error', function(err){
    console.log("in error" + err.message);
  });
  // When we are done, test that the parsed output matched what expected
  parser.on('finish', function(){
    console.log(JSON.stringify(output));
    res.json(common.pretty(false, 10000, output));
  });

  // Now that setup is done, write data to the stream
  parserStream.pipe(parser);

  
  // task.filename + '_CSV_'+ moment().format('YYYYMMDD_HHmmssSSS');
  // media.upload_big_files(req, res).then(function(resolve){    
  //   //Upload complete read file line by line
  //   var strGroupName = resolve.originalname + '_CSV_'  + moment().format('YYYYMMDD_HHmmssSSS');
  //   file.csvFileParser(req, resolve).then(function(resolve){      
  //     console.timeEnd("dbsave");
  //     resolve.group_name = strGroupName;
  //     res.json(common.pretty(true, 10001, resolve));
  //   })
  //   .catch(function(reject){
  //     console.log('parser Error' + reject);
  //     res.json(common.pretty(true, 10000, reject));
  //   })
    
  // })
  // .catch(function(reject){    
  //   console.log('upload Error' + reject);
  //   res.json(common.pretty(false, 10000, reject));
  // })
});

router.route('/template')
.get(function(req, res, next){
  var userId = req.user_auth.user_id;

  var boolIsDefault = req.query.is_default;

  var params = {      
      $or: [
            {
              user_id: userId
            },
            {
              user_id: { $exists:false }
            }
        ]
  };  
  
  if(typeof boolIsDefault != 'undefined' && boolIsDefault == 1) {
    params.is_default = true;
  }
  
  mongoose.model('TemplateMapper').find(params,{},{sort: {is_show:1}}, function(err, result){
      if(err){
        res.json(common.pretty(true, 10000, err));
      } else {
        res.json(common.pretty(true, 11013, result));
      }
  });
})
.post(function(req, res, next){
  var strUserId = req.user_auth.user_id;
  var objMapper = req.body.mapper;
  var strTemplateName = req.body.template_name;
  var strDelimiter = req.body.delimiter || '';

  if(typeof objMapper == 'undefined'){
    res.json(common.pretty(false, 11009));
    return;
  }
  if(typeof strTemplateName == 'undefined'){
    res.json(common.pretty(false, 11008));
    return;
  }

  var objInsert = {
    mapper: objMapper,
    template_name: strTemplateName,
    user_id: strUserId,
    delimiter: strDelimiter
  }

  var params = {
    template_name: strTemplateName,
    user_id: strUserId
  }

  //check if template with same name exists
  mongoose.model('TemplateMapper').count(params, function(err, templateCount){
    if(err){
      res.json(common.pretty(false, 10000));
    } else {
      if(templateCount > 0 ) {
        res.json(common.pretty(false, 11012));
      } else {
        mongoose.model('TemplateMapper').create(objInsert, function(err, status){
          if(err){
            res.json(common.pretty(false, 10000));
          } else {
            res.json(common.pretty(true, 11011));
          }
        });
      }
    }
  });  
});


router.route('/synctimelist')
.get(function(req, res, next){
  var defaultData = require('../../config/constant/defaultData');
  res.json(common.pretty(true, 10001, defaultData.syncDefaultData()));
})

router.route('/last-sync/:device_id')
.get(function(req, res, next){
  var strDeviceId = req.params.device_id;

  if(typeof strDeviceId == 'undefined'){
    return res.json(common.pretty(false, 11019, ''));
  }
  var filterParams = {
    device_id: strDeviceId
  };

  mongoose.model('ImportActivityLog').findOne(filterParams,{user_id:1, device_id:1, transaction_id:1, logged_on:1}, {sort: {logged_on:-1}}, function(err, details){
    if(err) {
      res.json(common.pretty(false, 10000, err));
    } else {
      if(!details){
        details = {};
      }
      res.json(common.pretty(true, 10001, details));
    }
  });
});

//Only create a blank task
function createTask(task, callback){
  mongoose.model('Task').create(task, function (err, res_task) {
    if (err) {
      callback(err);        
    } else {     
      callback(null, res_task);
    }
  });
}

function getPrepareTaskObj(userId, objFileData) {
  return new Promise(function(importResolve,importReject){
    checkAndModifyEncoding(objFileData).then(function(encodingResolve){
      var fileType = path.extname(objFileData.filename).toLowerCase();
      var transactionId = mongoose.mongo.ObjectId().toString();
      var task = {};
      if(fileType == '.vcf') {      
        var strGroupName = objFileData.originalname + '_VCF_'  + moment().format('YYYYMMDD_HHmmssSSS');
        objFileData.filetype = fileType;
        task = {
          type : 'vcard-import',
          name : 'Import VCF',
          sub_type: "import-tmp",
          user_id: userId,
          general_data: {
            transaction_id: transactionId,
            group_name: strGroupName,
            file_details: objFileData       
          }        
        };
        importResolve(task);
        //create an empty task. Do not add it in the queue      
      } else {
        var strGroupName = objFileData.originalname + '_CSV_'  + moment().format('YYYYMMDD_HHmmssSSS');
        file.csvFileParser(userId, transactionId ,objFileData).then(function(csvParserResolve){        
          objFileData.filetype = fileType;
          task = {
            type : 'any-csv-import',
            name : 'Import CSV',
            sub_type: "import-tmp",
            user_id: userId,
            general_data: {
              transaction_id: transactionId,
              group_name: strGroupName,
              file_details: objFileData       
            }        
          };        
          importResolve(task);
        }).catch(function(reject){        
          importReject(reject);       
        })  
      }
    }).catch(function(reject){
      importReject(reject);
    })    
  });
}

function checkAndModifyEncoding(objFileDetails){
  return new Promise(function(resolve, reject){
    //check file encoding and convert it to utf8 if required
    file.getFileEncoding(objFileDetails.path).then(function(charset){
      console.log(charset);
      var allowedCharset = ["utf8", 'utf-8', 'iso-8859-1'];
      if(_.indexOf(allowedCharset, charset.toLowerCase()) != -1){
        //no encoding change required
        // console.log('no change')
        resolve();
      } else {
        //change encoding
        file.changeFileEncoding(objFileDetails.path, charset, 'utf8').then(function(filedata){
          resolve()
        }).catch(function(reject){
          reject({status_code: 11018})
        })
      }
    }).catch(function(reject){
      reject({status_code: 11018})
    })
  })
}

module.exports = router;