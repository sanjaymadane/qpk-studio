'use strict';
/*
 * Application bootstrap
 */

 // Load packages
var express = require('express');

// Load configuration
var config = require('./config/config');

// Load schemas
var user_schema = require('./models/user_schema');


// Local variables
var app = express()
    , api_version = '/api/' + config.api_version;

// Initial setup
var server = require('./setup/server_setup')(app, true).init(express)
    , db = require('./setup/db_setup')().init()
    , def_data = require('./setup/default_data_setup')().init();


/*
 * Load dummy data for testing
 * =============================================================
 */
if(config.load_dummy_data === true){
    var db_helper = require('./helpers/db_helper')(); 
    //db_helper.load_dummy();
    db_helper.create_dummy_contacts(500000);
}

// Api documentation route
app.use(api_version +'/docs', function(req, res){
  res.render('doc/api');
});

// Apply cors middlewares
var cors_middleware = require('./middlewares/cors_middleware')(app);

// Apply auth middlewares
var auth_middleware = require('./middlewares/auth_middleware')(app);
var high_security_auth_middleware = require('./middlewares/high_security_auth_middleware')(app);
var maintenance_middleware = require('./middlewares/maintenance_middleware')(app);

/* 
 * API - all routes
 * =========================================================
 */

// Auth API
app.use(api_version + '/authenticate', require('./routes/auth'));
// Users API
app.use(api_version + '/users', require('./routes/users'));


// Apply error handler middleware
var error_middleware = require('./middlewares/error_middleware')(app);

// Start http server
require('./setup/server_setup')(app, true).start(server, config.port);