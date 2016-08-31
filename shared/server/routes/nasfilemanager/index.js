'use strict';

/*
 * filemanager router
 */

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose'),
    filedetail = require('path'),
    moment = require('moment'),
    _ = require('underscore');

// Load configuration
var config = require('../../config/config');

// Load helper methods
var common = require('../../helpers/common_helper'),
    fileHelper = require('../../helpers/file_helper');

// Load auth
var nas_auth = require('../../auth/nas_auth');

router.route('/')
  .post(function(req, res, next) {
    var generalHelper = require("../../helpers/general_helper");

    var arrNasUploadTypes = ['profile_pic', 'attachment', 'import'];

    var arrobjFileDetails = req.body.file_details;
    var type = req.body.type;
    var contactId = req.body.contact_id;
    var userId = req.user_auth.user_id;
    var sid = req.user_auth.sid;


    if(! arrobjFileDetails || !_.isArray(arrobjFileDetails)){
      res.json(common.pretty(false, 11015, ''));
      return
    }

    if(!type || _.indexOf(arrNasUploadTypes, type) == -1){
      res.json(common.pretty(false, 11014, ''));
      return
    }

    if(!contactId){
      contactId = mongoose.mongo.ObjectId();
    }   

    var strAbsolutePath = '';
    var strRelativePath = '';
    var boolIsProfilePic = false;

    switch(type){
      case 'profile_pic':
        boolIsProfilePic = true;
        strRelativePath =  '/' + config.tmpFolder + userId + '/' + contactId + '/';
        strAbsolutePath = config.media_base_path +  strRelativePath;
        break;
      case 'attachment':
        strRelativePath = '/'+ config.tmpFolder + userId + '/' + contactId + '/attachments/';
        strAbsolutePath = config.media_base_path + strRelativePath
        break;
      case 'import':
        strRelativePath = userId + '/imports/';
        strAbsolutePath = config.media_base_path + strRelativePath;
        break;
    }

    var strStaticOld = config.nas_upload_server_path+ '/';

    var arrPromiseNas = [];
    _.each(arrobjFileDetails, function(objFileDetails){
      var promise = new Promise(function(nasCopyResolve, nasCopyReject){        
        var objFileCopyToNasMap = {
          source_path: objFileDetails.path,
          source_file: objFileDetails.name,
          sid: sid
        }
        generalHelper.nasFileCopy(objFileCopyToNasMap).then(function(fileCopyResolve){
          nasCopyResolve(fileCopyResolve);
        }).catch(function(fileCopyReject){
          nasCopyReject(fileCopyReject);
        })
      });
      arrPromiseNas.push(promise);
    })

    Promise.all(arrPromiseNas).then(function(fileCopyNasResolve){
      var arrAppCopyPromise = [];
      _.each(arrobjFileDetails, function(objFileDetails){
        var appCopyPromise = new Promise(function(nasCopyResolve, nasCopyReject){
          var strExtension = filedetail.extname(objFileDetails.name);
          var strName = '';

          if(boolIsProfilePic){
            strName = contactId + strExtension;                        
          } else {
            strName = Date.now() + strExtension;            
          }

          var strOldPath =  strStaticOld + objFileDetails.name;          
          var strNewRelativePath = strRelativePath + strName;
          var strNewPath = strAbsolutePath + strName
          
          fileHelper.copyFile(strOldPath,strNewPath).then(function(resolve){
            nasCopyResolve({path: strNewRelativePath, label: objFileDetails.name});
          }).catch(function(reject){
            nasCopyReject(reject);
          })
        });
        arrAppCopyPromise.push(appCopyPromise);
      });

      Promise.all(arrAppCopyPromise).then(function(appCopyResolve){
        var arrobjResoponse = {
          file_details: appCopyResolve,
          contact_id: contactId
        };
        res.json(common.pretty(true, 10001, arrobjResoponse));
      }).catch(function(appCopyReject){
        console.log("coming into catch" + appCopyReject + '============');
        res.json(common.pretty(false, 10000, appCopyReject));
      })
    }).catch(function(fileCopyReject){
      console.log("coming into catch");
      res.json(common.pretty(false, 10000, fileCopyReject));
    })  	 
});

module.exports = router;