'use strict';

/*
 * This will setup http server
 */

 // Load dep packages
var path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    http = require('http');

module.exports = function(app, is_main){
 	return {
 		init: function(express){ 	
 			// Create server		
 			var server = http.createServer(app); 
 			if(is_main) {
	 			// Setup app config
	 			app.engine('html', require('ejs').renderFile);
				app.set('view engine', 'html');
				app.use(express.static('public'));
				app.set('views', path.join(__dirname, '../views'));
				app.use(logger('dev'));
				app.use(bodyParser.json());
				app.use(bodyParser.urlencoded({ extended: true }));
				app.use(cookieParser());
			}
			server.timeout = 1000*60*5;
			return server;
 		},
 		start: function(server, port){
 			server.listen(process.env.PORT || port); 
			console.log('Server running on port : ',process.env.PORT || port);
			return server;
 		}
 	};
};