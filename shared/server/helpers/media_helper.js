'use strict'

/*
*	This helper will deal with all kind of image processing 
*
*/

//Load dependency modules
var multer = require('multer'),
    mkdirp = require('mkdirp'),
    path = require('path'),
	fs = require('fs-extra'),	
	util = require('util');

// Load file config 
var config = require('../config/config');

module.exports = {	
	upload_big_files: function(req, res){
		var self = this;
		return new Promise(function( resolve, reject ){
			var file_relative_path = config.media_base_path ;		
			var storagetype = multer.diskStorage({
				destination : function (req, file,cb) {
					mkdirp.sync(file_relative_path);
					cb(null, file_relative_path);
				},
				filename: function(req,file,cb) {				
					var fileExtension = path.extname(file.originalname);
					file.filename =  Date.now();				
					cb(null, file.filename + fileExtension)
				}
			});

			var fileFilter = function(req, file, cb) {
				if( config.allowedImports.indexOf(file.mimetype) > -1 ) {
					cb(null, true);
				} else {
					cb(null, false);
				}
			};			

			multer({storage: storagetype}).single('upload')(req, res, function(err) {
				if(err && err.code == 'LIMIT_FILE_SIZE') {
					reject({status: false, message: "File size limit"});
				} else if(err) {					
			    	reject({status: false, message: "Error uploading file"});
				} else if( typeof req.file == 'undefined') {
					reject({status: false, message: "Please provide a valid file format"});
				} else {					
					resolve(req.file);
				}
			});
		})
		
	}


}
