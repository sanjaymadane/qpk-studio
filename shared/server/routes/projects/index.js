'use strict';

/*
 * Projects router
 */

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose'),
    _ = require('underscore');
// Load helpers
var common = require('../../helpers/common_helper'),
  shell = require('../../helpers/shell_helper'),
  file_helper = require('../../helpers/file_helper'),
  config = require('../../config/config');

router.route('/')
  /**
   * @api {get} /projects Get project list
   * @apiName Project List
   * @apiGroup Project
   
   *
   * @apiSuccess {String} _id Project id.
   * @apiSuccess {String} name Project name.
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *         "status": true,
   *         "status_code": 10001,
   *         "data": [],
   *         "message": "Success"
   *     }   
   */
  .get(function(req, res, next) {
    // Select only required fields if passed
    var fields = common.filter_fields(req.query.fields, []);
    // Set page limit
    var limit = parseInt(req.query.limit? req.query.limit : 50);
    // Set skip count
    var page = Math.max(0, req.query.page || 0);
    // Create find criteria
    var params = { user_id: req.user_auth.user_id };

    var queryParams = { user_id: req.user_auth.user_id };


    mongoose.model('Project').find(params, fields, function (err, projects) {
      if (err) {
        res.json(common.pretty(false, 10000, err));
      } else {
        res.json(common.pretty(true, 10001, projects));             
      }     
    }).limit(limit)
      .skip(page*limit);
  })
  
  /**
   * @api {post} /projects Create new project
   * @apiName Create Project
   * @apiGroup Project   
   *
   * @apiParamExample {json} Request-Example:
   *     {
   *       "name": "My Hello World"
   *     }
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *         "status": true,
   *         "status_code": 10001,
   *         "data": "57c80de9c7db5c7f7710a5f5",
   *         "message": "Success"
   *     }   
   */
  .post(function(req, res) {
    req.body.user_id = req.user_auth.user_id;
    mongoose.model('Project').findOne({name: req.body.name, user_id:req.user_auth.user_id}, function (err, project) {
      if (err) {
        res.json(common.pretty(false, 10000, err));
      } else {
        if(!project){
          mongoose.model('Project').create(req.body, function (err, project) {
            if (err) {
              res.json(common.pretty(false, 10000, err));
            } else {
              var newpath = config.projects_path + req.body.name;
              var filepath = config.build_utility_path;
              var unzipPath = newpath + "/shared/html";
              var zipCopyPath = unzipPath + '/wordpress';

              file_helper.copyFile(filepath, newpath)
              .then(function(resolve){
                return file_helper.unzipFile(req.body.file, unzipPath)
              })
              .then(function(resolve){                
                return file_helper.copyFile(zipCopyPath, unzipPath);
              })
              .then(function(resolve){
                return file_helper.deleteFilesOrDirectory(zipCopyPath);
              })
              .then(function() {
                var options = {
                  qpkg_name: req.body.name,
                  qpkg_display_name: req.body.name,
                  container_name: 'lamp_server',
                  container_port: 9011
                };

                return shell.replace_strings(options);
              })
              .then(function() {
                return shell.create_project(req.body);
              })
              .then(function(resp){
                res.json(common.pretty(true, 10001, project._id));              
              });             
            }
          }); 
        } else{ 
          res.json(common.pretty(false, 10000, 'Project name already exists'));
        }
      } 
    });
    
  });


router.route('/download')
  .get(function(req, res, next){
    var fs = require('fs');
    var file = config.projects_path + req.query.project_name+ '/build/'+req.query.project_name+'_0.9.0.qpkg';
    console.log(file);
    
    if(file != ""){
      fs.exists(file, function(exists) {
        if(exists){
          res.download(file);
        } else {
          res.json(common.pretty(false, 10000, "File not found"));
        }
      });
    }
  });

router.route('/batch_delete')
  // POST - Batch delete Projects permanant
  .post(function(req, res, next) {    
    if(req.body.project_ids && req.body.project_ids.length > 0){
      mongoose.model('Project').remove({_id: {$in: req.body.project_ids}}, function(err, data){
        res.json(common.pretty(true, 10001, '')); 
      });
    } else{
      res.json(common.pretty(false, 10000, ''));
    }
  });


// Route middleware to validate :id
router.param('id', function(req, res, next, id) {
  mongoose.model('Project').findById(id, function (err, project) {
    if (err) {
      res.json(common.pretty(false, 10000, err));
    } else {
      req.id = id;
      next(); 
    } 
  });
});

router.route('/:id')
  /**
   * @api {get} /projects/:id Get project details
   * @apiName Get project
   * @apiGroup Project
   *
   * @apiParam {String} id Project id.
   *
   * @apiSuccess {String} _id Project id.
   * @apiSuccess {String} name Project name.
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *         "status": true,
   *         "status_code": 10001,
   *         "data": {},
   *         "message": "Success"
   *     }   
   */
  .get(function(req, res) {
    // Select only required fields if passed
    var fields = common.filter_fields(req.query.fields,[]);
    mongoose.model('Project').findById(req.id, fields, function (err, project) {
      if (err || !project) {
        res.json(common.pretty(false, 10000, err));
      } else {
        res.json(common.pretty(true, 10001, project));
      }
    });
  })
  /**
   * @api {put} /projects/:id Update project details
   * @apiName Update project
   * @apiGroup Project
   *
   * @apiParam {String} id Project id.
   *
   * @apiParamExample {json} Request-Example:
   *     {
   *       "name": "My Hello World"
   *     }
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *         "status": true,
   *         "status_code": 10001,
   *         "data": {},
   *         "message": "Success"
   *     }   
   */
  .put(function(req, res) {
    mongoose.model('Project').findOne({name: req.body.name,user_id:req.user_auth.user_id}, function (err, project) {
      if (err) {
        res.json(common.pretty(false, 10000, err));
      } else {
        if(!project){
          mongoose.model('Project').findByIdAndUpdate(req.id, {$set: req.body },function (err, project) {
            if (err) {
              res.json(common.pretty(false, 10000, err));
            } else {
              res.json(common.pretty(true, 10001, ''));
            }
          });
        } else {
          res.json(common.pretty(false, 10000, 'Group name already exists'));
        }
      }
    });
  })
  /**
   * @api {delete} /projects/:id Delete project
   * @apiName Delete project
   * @apiGroup Project
   *
   * @apiParam {String} id Project id.
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *         "status": true,
   *         "status_code": 10001,
   *         "data": {},
   *         "message": "Success"
   *     }   
   */
  .delete(function (req, res){
    mongoose.model('Project').findById(req.id, function (err, project) {
      if (err || !project) {
        res.json(common.pretty(false, 10000, err));
      } else {
        project.remove(function (err, project) {
          if (err) {
            res.json(common.pretty(false, 10000, err));
          } else {
            res.json(common.pretty(true, 10001, project._id));                                  
          }
        });
      }
    });
  });

module.exports = router;