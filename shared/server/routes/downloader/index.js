//load dependency packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
		mime = require('mime');

// Load file config 
var config = require('../../config/config');
var common = require('../../helpers/common_helper');

//Map routes
router.route('/')
	//Upload the profile pic
	.get( function(req,res,next) {		
		if(req.query.filename && req.query.type){
			var file = "";
			switch(req.query.type){
				case 'export':
					file = config.media_base_path + req.user_auth.user_id +'/exports/'+ req.query.filename;
					break;
				case "attachment":
					file = config.media_base_path + req.query.filename;
					break;
				default:
					res.json(common.pretty(false, 10000, "Type not defined"));
			}
			if(file != ""){
				fs.exists(file, function(exists) {
					if(exists){
						res.download(file);
					} else {
						res.json(common.pretty(false, 10000, "File not found"));
					}
				});
			}
		} else
			res.json(common.pretty(false, 10000, "`filename` or `type` param not provided."));
	});

module.exports = router;