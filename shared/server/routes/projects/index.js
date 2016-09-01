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
var common = require('../../helpers/common_helper');

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
              res.json(common.pretty(true, 10001, project._id));
            }
          }); 
        } else{ 
          res.json(common.pretty(false, 10000, 'Project name already exists'));
        }
      } 
    });
    
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
  // GET - Project by id
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
  //PUT - update a Project by ID
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
  //DELETE - soft delete Project by ID
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

module.exports = router;