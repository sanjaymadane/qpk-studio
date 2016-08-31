'use strict';

/*
 * High Security router
 */

// Load dep packages
var express = require('express'),
		jwt = require('jsonwebtoken'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose');

// Load configuration
var config = require('../../config/config');

// Load helpers
var common = require('../../helpers/common_helper');

router.route('/set')
  //POST - Set high security question, answer, high security password
  .post(function(req, res) {
  	if(!req.body.high_security_password || !req.body.security_answer || !req.body.security_question){
      res.json(common.pretty(false, 10008, ""));
    } else {
    	mongoose.model('User').findById(req.user_auth.user_id, function (err, user) {          
		    if (err || !user) {        
		       res.json(common.pretty(false, 10000, err));
		    } else {
		    	req.body.is_high_security_set = true;
		    	user.update(req.body, function (err, user) {
	       	if (err) {
	           	res.json(common.pretty(false, 10000, err));
	       	} else {
	           	res.json(common.pretty(true, 10001, ""));   
	       	}
	       	});
		    }
	    });
    }
  });

router.route('/reset')
  //POST -  Reset high security password
  .post(function(req, res) {
  	if((!req.body.new_high_security_password && !req.body.old_high_security_password) || (!req.body.new_high_security_password && req.body.security_question!="" && req.body.security_answer!="")){
  		res.json(common.pretty(false, 10008, ""));
  	} else {  		
  		// if only old high security password is given to reset
  		mongoose.model('User').findById(req.user_auth.user_id, function (err, user) {          
		    if (err || !user) {        
		       	res.json(common.pretty(false, 10000, err));
		    } else {
		    	if((req.body.old_high_security_password == user.high_security_password) ||
		    		(req.body.security_question == user.security_question && req.body.security_answer == user.security_answer)){
		    			user.update({high_security_password: req.body.new_high_security_password }, function (err, user) {
			       	  if (err) {
			          	res.json(common.pretty(false, 10000, err));
			       	  } else {
			          	res.json(common.pretty(true, 10001, ""));   
			       	  }
			       	});
		    	} else {
		    		res.json(common.pretty(false, 10009, ""));
		    	}
		    }
	   	}); 
		}
	});

router.route('/question')
  //GET -only the security question set by user
  .get(function(req, res, next) {
    mongoose.model('User').findById(req.user_auth.user_id, function (err, user) { 
      if (err || !user) {
        res.json(common.pretty(false, 10000, err));
      } else {
        res.json(common.pretty(true, 10001, {data: user.security_question || ''}));
      } 
    });
  });

router.route('/get_token')
  //get the secondary token for browsing private stuff
  .post(function(req, res, next) {
    if(!req.body.high_security_password){
      res.json(common.pretty(false, 10009, ""));
    } else {
     //confirm high security password
     mongoose.model('User').findById(req.user_auth.user_id,function(err,user){
      if (user && req.body.high_security_password == user.high_security_password){
       //hsp matched create secondary token
       var token_hsp = {
         user_id: user._id,
         high_security_password: req.body.high_security_password
       };
       var token = jwt.sign(token_hsp, config.high_secret, {
          //expiresIn: 60*60
       });
       res.json(common.pretty(true, 10001, {secondary_token: token}));
      }else{
       //hsp does not match raise error
        res.json(common.pretty(false, 10009, ""));
      }
     });
    }
  });
   
module.exports = router;