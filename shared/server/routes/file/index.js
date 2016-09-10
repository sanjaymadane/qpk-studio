'use strict'

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose'),
    path = require('path'),
    fs = require('fs-extra'),
    _ = require('underscore'),
    moment = require('moment');


// Load helpers
var common = require('../../helpers/common_helper'),  
    media = require('../../helpers/media_helper'),
    fileHelper = require('../../helpers/file_helper');


router.route('/')
  .get(function(req,res, next){
    console.log("this sis herer")
    fileHelper.unzipFile('', __dirname)
    .then(function(resp){
      res.json(common.pretty(true, 10001, resp));
    })
    .catch(function(resp){
      res.json(common.pretty(trueo, 10001, resp));
    })
  })
  .post(function(req,res, next){    
    media.upload_big_files(req, res)
    .then(function(objFileDetails){    
      res.json(common.pretty(true, 10001, objFileDetails));
    })
    .catch(function(reject){      
      res.json(common.pretty(false, 10000, reject));
    })
  });


module.exports = router;