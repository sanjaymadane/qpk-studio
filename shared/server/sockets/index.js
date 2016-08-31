'use strict';

/*
 * Background task event handler
 */
var config = require('../config/config'),
	mongoose = require('mongoose'),
	socket_helper = require('../helpers/socket_helper'),
	_ = require('underscore');

module.exports = {
    processEvents: function(rmq, msg, cb){
        if(msg && msg.content){
            var message = JSON.parse(msg.content.toString());
            if(rmq.io){
                rmq.io.to(message.user_id).emit('task:progress', message);              
            }            
        }
        cb(msg);
    }
};