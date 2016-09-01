'use strict';

/*
 * Auth router
 */

// Load dep packages
var express = require('express'),
    jwt = require('jsonwebtoken'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose'),
    _ = require('underscore');

// Load configuration
var config = require('../../config/config');

// Load helper methods
var common = require('../../helpers/common_helper');

// Load auth
var nas_auth = require('../../auth/nas_auth');
function createNewUser(user, cb){
  mongoose.model('User').create(user, function (err, userObject) {
    cb(err,userObject);
  });
}
function removeUser(user_id, cb){
  mongoose.model('User').remove({_id: user_id}, function(err, data){
    cb('success');
  });
}
/**
 * @api {post} /authenticate Authenticate User
 * @apiName Authenticate
 * @apiGroup User
 *
 * @apiParam {String} username Users username.
 * @apiParam {String} password Users password.
 *
 * @apiSuccess {String} user_id UserId of the User.
 * @apiSuccess {String} username  Username of the User.
 * @apiSuccess {String} sid  Nas Session id of the User.
 * @apiSuccess {String} token  Auth token of the User.
 * @apiSuccess {String} authPassed  Auth pass status of the User.
 */
router.route('/')
  // POST - Authenticate user, Need - username, password, source and remme
  .post(function(req, res, next) {
    var isKeepMeSignedIn = req.body.keep_me_signedin || false;
    var expTime = '8 days';

    //need to think over JWT by default setting exp time to 8 days
    var promise = new Promise(function(resolve, reject){
      if(!req.body.username){
        reject('ProvideUsername');
      } else {    
        var authLoginParams = {
          user: req.body.username,
          serviceKey: 1
        };
        if(isKeepMeSignedIn){
          authLoginParams.remme = 1;
        }
        if(req.body.password && req.body.password != ""){
          authLoginParams.pwd = req.body.password;
          if(req.body.get_question && req.body.get_question != '')
            authLoginParams.get_question = 1;
          if(req.body.security_code && req.body.security_code != '')
            authLoginParams.security_code = req.body.security_code;
          if(req.body.security_answer && req.body.security_answer != ''){
            authLoginParams.security_answer = req.body.security_answer;
          }
          if(req.body.send_mail && req.body.send_mail != ''){
            authLoginParams.send_mail = 1;
          }
        } else if(req.body.sid && req.body.sid != ""){
          authLoginParams.sid = req.body.sid;                
        } else if(req.body.qtoken && req.body.qtoken != ""){
          authLoginParams.qtoken = req.body.qtoken;                
        } else {
          reject('ProvideValidParams');
        }
        nas_auth.login(authLoginParams,function(data,response){
          mongoose.model('User').findOne({username:req.body.username, is_active: true}, function (err, user) {
            if(data.QDocRoot && data.QDocRoot.authPassed == 0 && data.QDocRoot.errorValue == -1){
              if(!user){
                reject('InvalidUsernamePassword');
              } else if(user && user.password == req.body.password){
                //resolve({type: 'NON-NAS', user:user, auth:{authPassed: 1}});
                reject('InvalidUsernamePassword');
              } else {
                reject('InvalidUsernamePassword');
              }              
            } else if(data.QDocRoot && data.QDocRoot.authPassed == 1) {
              if(user){
                  resolve({type: 'NAS', user:user, auth: data.QDocRoot});
              } else {
                // New NAS user created
                var userObject = {
                  fname: '',
                  lname: '',
                  username: data.QDocRoot.username,
                  password: req.body.password || 'YWRtaW4=',
                  is_active: true,
                  created_by: 'NAS',
                  updated_by: 'NAS'
                };
                if(!userObject.role && userObject.username == 'admin')
                  userObject.role = 'admin';
                createNewUser(userObject, function(err, newuser){
                  resolve({type: 'NAS', user: newuser, auth: data.QDocRoot});
                });
              }
            } else {
              resolve({type: 'NAS', user:user, auth: data.QDocRoot});
            }
          });
        });  
      }
    });
    promise.then(function(result){
      var user = result.user;
      var auth = result.auth;
      var token_auth = {};
      if(user){
        token_auth.user_id = user._id;
        token_auth.username = user.username;
      }
      var response = {};
      if(auth.authPassed == 1){
        response = _.clone(token_auth)
      }
      switch(result.type){
        case 'NAS':
          if(auth.authPassed == 1){
            response.sid = auth.authSid || req.body.sid;
            if(req.body.qtoken || auth.qtoken)
              response.qtoken = auth.qtoken || req.body.qtoken;
            token_auth.sid = auth.authSid || req.body.sid;
          } else {
            response.need_2sv = auth.need_2sv;
            response.lost_phone = auth.lost_phone;
            response.security_question_no = auth.security_question_no;
            response.security_question_text = auth.security_question_text;  
            response.send_result = auth.send_result;
            response.emergency_try_count = auth.emergency_try_count;
            response.emergency_try_limit = auth.emergency_try_limit;          
          }
          break;
        case 'NON-NAS':
          break;
      }
      if(auth.authPassed == 1){   
        response.token = jwt.sign(token_auth, config.secret, {expiresIn: expTime});
        response.authPassed = 1;
      } else
        response.authPassed = 0;
      res.json(common.pretty(true, 10001, response));          
    }).catch(function(err){
      res.json(common.pretty(false, 10005, err));
    });
  });

router.route('/verify')
  // GET - user auth verification
  .get(function(req, res, next) {
      res.json(common.pretty(true, 10001, {
        status: true
      })); 
  });

router.route('/logout')
  // POST - User session logout
  .post(function(req, res, next) {
    var fields = {
      sid: req.user_auth.sid
    };
    nas_auth.logout(fields, function(){
      res.json(common.pretty(true, 10001, {
        status: true
      }));
    });
  });

module.exports = router;