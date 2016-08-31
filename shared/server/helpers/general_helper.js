'use strict'

var _ = require("underscore"),
	curl = require('curlrequest');;

var config = require('../config/config');
// Load auth
var nas_auth = require('../auth/nas_auth');

module.exports = {
	//this function will copy the file to mapped folder
	nasFileCopy: function(data){
		var self = this;
		return new Promise(function(copyResolve, copyReject){
			var fields = {
		  		sid: data.sid,
		  		source_file: data.source_file,
		  		source_total: 1,
		  		source_path: data.source_path,
		  		func: 'copy',
		  		dest_path: config.nas_upload ,
		  		mode:0		  		
		  	};

		  	self.genericFileStationCall(fields).then(function(resolve){
		  		copyResolve(resolve)
		  	}).catch(function(reject){
		  		copyReject(reject)
		  	})
		});
	},

	genericFileStationCall: function(fields){
		var self = this;
		return new Promise(function(genericResolve, genericReject){
			fields.logout = '1';
		    var queryString = "";
		    var stdout={},meta = {};
		    _.mapObject(fields, function(val, key) {
		      queryString += key+"="+val + "&";
		      return val;
		    });
		    nas_auth.getNasConfig('System', 'Web Access Port', function(err, intPort){
		      curl.request({url: config.nas_protocol +"://"+config.server_ip+":"+intPort+"/cgi-bin/filemanager/utilRequest.cgi?"+ queryString}, function (err, stdout) {
	      	  if(err){
		      		genericReject(err);
		      	} else {
		      		try {
                        var data  = JSON.parse(stdout);
	                    if(typeof data.pid != 'undefined'){
	                        // console.log(data.pid+ 'got pid');
	                        genericResolve(data);
	                    } else {
	                        // console.log(data.pid+ 'copy fail');
                            genericReject(data);
	                    }
                    } catch(e) {                        
                        genericReject(e);
                    }
                }		        
		      });
		    });
		})
		
	},

	createBackgroundTask: function(task){
		var self = this;
		return new Promise(function(resolve, reject){
			mongoose.model('Task').create(task, function (err, res_task) {
			    if (err) {
			      	reject(err);        
			    } else {
			    	self.addToQueueBackgroundTask(res_task).then(function(taskQueueResolve){
			    		resolve(taskQueueReject);
			    	}).catch(function(taskQueueReject){
			    		reject(taskQueueReject);
			    	})
			    }
			});		
		});	  
	},

	addToQueueBackgroundTask: function(task){
		return new Promise(function(resolve, reject){
			var tasks = require('../background_tasks');
			tasks.create(task, function(err, status){
				if(err) return reject(err);
				return resolve(task);		        
		    });
		})
	},

	logMemoryUsage: function(){
		console.log(process.memoryUsage().rss/(1024*1024));
	}
}