// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true });

var common = require('../../helpers/common_helper');

// Load auth
var nas_auth = require('../../auth/nas_auth');

router.route('/nas-details')
.get(function(req, res, next){	
	var promises = [];
	var http_port = new Promise(function(resolve, reject){
		nas_auth.getNasConfig('System', 'Web Access Port', function(err, intPort){ 
			resolve({label: 'HTTP', value:intPort||8080});
		});
	});
	promises.push(http_port);
	var https_port = new Promise(function(resolve, reject){
		nas_auth.getNasConfig('Stunnel', 'Port', function(err, intPort){ 
			resolve({label: 'HTTPS', value:intPort||443});
		});
	});

	promises.push(https_port);

	var NAS_version = new Promise(function(resolve, reject){
		nas_auth.getNasConfig('System', 'Version', function(err, intPort){ 
			resolve({label: 'Version', value:intPort});
		});
	});
	
	promises.push(NAS_version);

	var NAS_Model = new Promise(function(resolve, reject){
		nas_auth.getNasConfig('System', 'Model', function(err, intPort){ 
			resolve({label: 'Model', value:intPort});
		});
	});
	
	promises.push(NAS_Model);

	var NAS_Name = new Promise(function(resolve, reject){
		nas_auth.getNasConfig('System', 'Server Name', function(err, intPort){ 
			resolve({label: 'ServerName', value:intPort});
		});
	});
	
	promises.push(NAS_Name);

	var NAS_AppName = new Promise(function(resolve, reject){
		nas_auth.getQPKGConfig('qcontactz', 'Display_Name', function(err, intPort){ 
			resolve({label: 'AppName', value:intPort});
		});
	});
	
	promises.push(NAS_AppName);

	var NAS_AppVersion = new Promise(function(resolve, reject){
		nas_auth.getQPKGConfig('qcontactz', 'Version', function(err, intPort){ 
			resolve({label: 'AppVersion', value:intPort});
		});
	});
	
	promises.push(NAS_AppVersion);

	var NAS_AppDate = new Promise(function(resolve, reject){
		nas_auth.getQPKGConfig('qcontactz', 'Date', function(err, intPort){ 
			resolve({label: 'AppDate', value:intPort});
		});
	});
	
	promises.push(NAS_AppDate);
	
	Promise.all(promises).then(function(values){
		var data = {};
		if(values && values.length > 0){
			values.forEach(function(val){
        data[val.label] = val.value;
      });

		}
		res.json(common.pretty(true, 10001, data));
	}).catch(function(reject){
		res.json(common.pretty(false, 10000, "Unable to read NAS configuration"));	
	})
});
module.exports = router;