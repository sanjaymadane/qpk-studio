'use strict';

/*
 * Error handler middleware
 */

 // Load dep packages

 module.exports = function(app){
 	return {
 		init: function(){
 			// Invalid route handler
			app.use('/', function(req, res){
			  res.status(404).json(common.pretty(false,10004, ''));
			});

			// catch 404 and forward to error handler
			app.use(function(req, res, next) {
			  var err = new Error('Not Found');
			  err.status = 404;
			  next(err);
			});

			// error handlers

			// development error handler
			// will print stacktrace
			if (app.get('env') === 'development') {
			  app.use(function(err, req, res, next) {
			    res.status(err.status || 500);
			    res.render('error', {
			      message: err.message,
			      error: err
			    });
			  });
			}

			// production error handler
			// no stacktraces leaked to user
			app.use(function(err, req, res, next) {
			  res.status(err.status || 500);
			  res.render('error', {
			    message: err.message,
			    error: {}
			  });
			});
 		}
 	}
 };