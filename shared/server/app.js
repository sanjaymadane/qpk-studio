'use strict';
/*
 * Application bootstrap
 */

 // Load packages
var express = require('express');

// Load configuration
var config = require('./config/config');

// Load schemas
var user_schema = require('./models/user_schema'),
	project_schema = require('./models/project_schema');


// Local variables
var app = express();    

// Initial setup
var server = require('./setup/server_setup')(app, true).init(express)
    , db = require('./setup/db_setup')().init();

app.use('/docs', function(req, res){
	res.render('doc/index.html');
});

app.use('*', function(req, res, next){
	req.user_auth = {
    user_id: "57c9518ec98ecb16007732c8",
    username: "admin",
    sid: "q4d9ufly"
  };
	next();
});

// Apply cors middlewares
var cors_middleware = require('./middlewares/cors_middleware')(app);

// Apply auth middlewares
//var auth_middleware = require('./middlewares/auth_middleware')(app);

/* 
 * API - all routes
 * =========================================================
 */

// Auth API
app.use('/authenticate', require('./routes/auth'));
app.use('/projects', require('./routes/projects'));


// Apply error handler middleware
var error_middleware = require('./middlewares/error_middleware')(app);

// Start http server
require('./setup/server_setup')(app, true).start(server, config.port);