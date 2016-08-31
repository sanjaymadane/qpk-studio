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
	mongoose = require('mongoose'),
	util = require('util');

// Load file config 
var config = require('../config/config');

module.exports = {
	
	resize: function(){
		return 1;
	},
	
	prepare_file_path: function(user_id, contact_id, is_temp){
		if(is_temp)
			return config.tmpFolder + user_id + '/' + contact_id;
		else 
			return user_id + '/' + contact_id;
	},

	process_upload: function(req, res, callback){
		//Initialize multer
		//Configure multer initialization array		
		var self = this;
		var contact_id = req.query.contact_id;
		var is_temp = true;		
		if(!contact_id)
			contact_id = mongoose.mongo.ObjectId();

		var file_path = self.prepare_file_path(req.user_auth.user_id, contact_id, is_temp);
		var file_relative_path = config.media_base_path + file_path;
		var file_absulute_path = config.media_absulute_path + file_path;
		
		var storagetype = multer.diskStorage({
			destination : function (req, file, cb){
				mkdirp.sync(file_relative_path);
				cb(null, file_relative_path);
			},
			filename: function(req,file,cb) {				
				var fileExtension = path.extname(file.originalname);
				cb(null, contact_id + fileExtension)
			}
		});

		var fileFilter = function(req, file,cb) {	
			if( config.profilePicAllowedTypes.indexOf(file.mimetype) > -1 ) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		};

		multer({ storage: storagetype, fileFilter: fileFilter }).single('profile_pic')(req, res, function(err) {
			if(err) {
			   callback({status:"false", message: "Error uploading file: " + err});
			} else if( typeof req.file == 'undefined' || !req.file) {
				callback({status:"false", message: "Please provide a valid file format"});				
			} else {				
				var filepath = file_absulute_path + '/' + contact_id + path.extname(req.file.originalname);
				callback({status: true, is_temp: is_temp, contact_id: contact_id, message: filepath});												
			}
		});
	},
	process_multiple_upload: function(req, res, cb) {
		var self = this; 	
		//Initialize multer
		//Configure multer initialization array	
		var contact_id = req.query.contact_id;		
		var is_temp = true;		
		if(!contact_id)
			contact_id = mongoose.mongo.ObjectId();

		var file_path = self.prepare_file_path(req.user_auth.user_id, contact_id, is_temp);
		var file_relative_path = config.media_base_path + file_path + '/attachments';
		var file_absulute_path = config.media_absulute_path + file_path + '/attachments';

		var storagetype = multer.diskStorage({
			destination : function (req, file,cb) {
				mkdirp.sync( file_relative_path );
				cb(null, file_relative_path);
			},
			filename: function(req,file,cb) {
				//get the extension of the pic
				var fileExtension = path.extname(file.originalname);
				file.filename =  Date.now();
				cb(null, file.filename + fileExtension)
			}
		});

		var fileFilter = function(req, file,cb) {			
			if( config.attachmentAllowedTypes.indexOf(file.mimetype) > -1 ) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		};
		
		var fileSizeLimit = {fileSize:  config.attachmentLimit };

		var upload = multer({
			storage: storagetype, 
			fileFilter: fileFilter, 
			limits: fileSizeLimit
		}).array('attachments', config.allowed_upload_count);
		
		upload(req, res, function(err) {
			if(err) {				
				if(err.code == 'LIMIT_FILE_SIZE') {					
					cb({status: false, message: "File should be of size max 25MB"});
				} else {
					cb({status: false, message: "Error uploading file"});
				}
			} else if(req.files.length > 0) {
					var arr_file_paths = [];					
					req.files.forEach( function(file){
						var short_filepath = file_absulute_path + '/' + file.filename;
						var filepath = {
							value: short_filepath.split('uploads')[1],
							label: file.originalname,
							file_type: file.mimetype,
							_id: mongoose.mongo.ObjectId()
						};
						arr_file_paths.push(filepath)
					});					
					cb({status: true, message: arr_file_paths , contact_id: contact_id, is_temp: is_temp});
			} else {
				cb({status: false, message: "Please attach files"});
			}
		});
	},
	process_import_upload: function(req, res, callback) {
		var self = this;
		var file_path = self.prepare_file_path(req.user_auth.user_id, 'imports');
		var file_relative_path = config.media_base_path + file_path;		
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

		var fileSizeLimit = {fileSize:  config.importLimit};

		multer({storage: storagetype , fileFilter: fileFilter, limits: fileSizeLimit}).single('import')(req, res, function(err) {
			if(err && err.code == 'LIMIT_FILE_SIZE') {					
				callback({status: false, message: "File should be of size max 10MB"});
			} else if(err) {
		    	callback({status: false, message: "Error uploading file"});
			} else if( typeof req.file == 'undefined') {
				callback({status: false, message: "Please provide a valid file format"});				
			} else {
				callback({status: true, message: req.file});
			}
		});
	},
	process_csv_upload: function(req, res, callback){		
		var self = this;
		var file_path = self.prepare_file_path(req.user_auth.user_id, 'imports');
		var file_relative_path = config.media_base_path + file_path;
		var originalFileName = "";
		var storagetype = multer.diskStorage({
			destination : function (req, file,cb) {
				mkdirp.sync(file_relative_path);
				cb(null, file_relative_path);
			},
			filename: function(req,file,cb) {
				originalFileName = file.originalname;
				var fileExtension = path.extname(file.originalname);
				file.filename =  Date.now();
				req.originalname = file.originalname;
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

		multer({storage: storagetype, fileFilter: fileFilter}).single('import')(req, res, function(err) {
			if(err) {
		    callback({status: false, message: "Error uploading file"});
			} else if( typeof req.file == 'undefined') {
				callback({status: false, message: "Please provide a valid file format"});				
			} else {
				callback({status: true, message: { path: file_relative_path + '/' + req.file.filename, filename: originalFileName }, req: req});
			}
		});
	},
	process_vcard_upload: function(req, res, callback){		
		var self = this;
		var file_path = self.prepare_file_path(req.user_auth.user_id, 'vcard');
		var file_relative_path = config.media_base_path + file_path;
		
		var storagetype = multer.diskStorage({
			destination : function (req, file, cb) {
				mkdirp.sync(file_relative_path);
				cb(null, file_relative_path);
			},
			filename: function(req,file,cb) {
				var fileExtension = path.extname(file.originalname);
				file.filename =  Date.now();
				cb(null, file.filename + fileExtension)
			}
		} );

		var fileFilter = function(req, file, cb) {			
			if( config.allowedVcf.indexOf(file.mimetype) > -1 ) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		};

		multer({storage: storagetype, fileFilter: fileFilter}).single('import_vcard')(req, res, function(err) {
			if(err) {
			    callback({status: false, message: "Error uploading file"});
			} else if( typeof req.file == 'undefined') {
				callback({status: false, message: "Please provide a valid file format"});				
			} else {
				callback({status: true, message: {path: file_relative_path + '/' + req.file.filename, filename: req.file.originalname}});
			}
		});
	},
	upload_big_files: function(req, res){
		var self = this;
		return new Promise(function( resolve, reject ){			
			var file_path = self.prepare_file_path(req.user_auth.user_id, 'imports');
			var file_relative_path = config.media_base_path + file_path;		
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

			multer({storage: storagetype, fileFilter: fileFilter }).single('import')(req, res, function(err) {
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
