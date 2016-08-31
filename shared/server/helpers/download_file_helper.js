/*
*	This helper deals with downloading files from third party server*
*   Options will consist of headers and url for file from where to download
*/
// var	mkdirp = require('mkdirp'),
//     path = require('path'),
//     fs = require('fs'),    
//     request = require('request');

// module.exports = {
// 	download: function(options,storeLocation, cb) {
// 		//Create directory if not exists
// 		mkdirp.sync(path.dirname(storeLocation));
// 		var	pipeAction = request(options).pipe(fs.createWriteStream(storeLocation));			
// 		pipeAction.on('close', function(){
// 		  return true;
// 		});
// 	}
// }


/*
*	This helper deals with downloading files from third party server*
*   Options will consist of headers and url for file from where to download
*/
var	mkdirp = require('mkdirp'),
    path = require('path'),
    fs = require('fs'),    
    request = require('request');

module.exports = {
	download: function(options,storeLocation) {
		return new Promise(function(resolve, reject){
			request.head(options, function(err, res, body){
			    // console.log('content-type:', res.headers['content-type']);
			    // console.log('content-length:', res.headers['content-length']);

			    // request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
			    var fileType = res.headers['content-type'].split('/')[0];			    
			    if(fileType == 'image') {
			    	// console.log(fileType);
			    	//Create directory if not exists
					mkdirp.sync(path.dirname(storeLocation));
					var	pipeAction = request(options).pipe(fs.createWriteStream(storeLocation));			
					pipeAction.on('close', function(){
						resolve({status: true});				  		
					});
			    } else {
			    	resolve({status:false});
			    }
			});	
		});
			
	}
}
