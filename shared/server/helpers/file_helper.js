'use strict'

/*
* File Copy helper
* @PARAMS 
*	From directory 
*	To Directory
* @OUTPUT
*  Success || Failure
* 
*
*/

//Load the dependency modules
var fse = require('fs-extra'),
	path = require('path'),
	mongoose = require('mongoose'),	
	_ = require('underscore');


//include constant
var config = require('../config/config');

module.exports = {

	getFileListing: function(fromDirectory, callback){
		var files = [];
		var directories = [];
		
		fse.walk(fromDirectory)
  		.on('data', function (item) {
		  	// console.log(JSON.stringify(item));
		  	if(item.stats.isDirectory()) {
		  		directories.push(item.path);
		  	} else {
		  		files.push(item.path);
		  	}
		})
		.on('end', function(err, data){
	  		if(err) {	  			
	  			callback(err);
	  		} else {	
	  			callback(null, {files: files, directories: directories});
	  			
	  		}
	  	});
	},
	copyMedia: function(fromDirectory, toDirectory, callback ){		
		var self = this;
		var fileListing = false;
		var fileListingPromise = new Promise(function(resolve, reject){
			self.getFileListing(fromDirectory, function(err, data){
				if(err) reject(err)
				else resolve(data)				
			});
		});
		fileListingPromise.then(function(resolve){			
			var arrFileCopyPromise = [];
		  	fse.mkdirpSync(toDirectory);

  			resolve.directories.forEach(function(directory){		  		
		  		var directoryPath = directory.replace(path.normalize(fromDirectory), '');
		  		// console.log(directory.indexOf(path.normalize(config.media_base_path + userid)));
		  		fse.mkdirpSync(toDirectory + '/' + directoryPath);
	  		})

	  		resolve.files.forEach(function(file) {
		  		var fileCopy = new Promise(function(resolve, reject){
		  			var filepath = file.replace(path.normalize(fromDirectory), '');		  		
			  		fse.copy(file, toDirectory +'/' +filepath, {clobber: true }, function(err){
			  			if (err) return reject(err);		  				
		  				else resolve(true);
			  		});
		  		})
	  			arrFileCopyPromise.push(fileCopy);
	  		});

		  	Promise.all(arrFileCopyPromise).then(function(resolve){  		
		  		callback(null, resolve);
		  	})
		  	.catch(function(reject){	
		  		callback(reject);
		  	})	  	
			
		})
		.catch(function(reject){
			console.log(reject);
			callback(reject);
		})
	},

	fileParser: function(req, file){
		return new Promise(function(resolve, reject){
			var readline = require('readline');
			var importFirstRow = req.body.is_import_first || false;
			var intLineCounter = 0;

	    	var params = {
	    		user_id: req.user_auth.user_id,
	    		filename: file.originalname
	    	}    	

	    	var parser = require('./import/global_csv').init(params);	    	
	    		

	    	// console.log(__dirname + '/../public/uploads/1/imports/100000.csv');
			var rd = readline.createInterface({
			    // input: fse.createReadStream(__dirname + '/../public/uploads/1/imports/100.csv'),			    
			    input: fse.createReadStream(file.path),
			});

			rd.on('line', function(line) {
				rd.pause();
				intLineCounter++;
				
				if(importFirstRow == false && intLineCounter == 1){
					//this is the header line as per the setting
	    			parser.setHeader(line).then(function(resolve){	    				
	    				rd.resume();	
	    			});	    			
				} else {
					parser.basicMap(line).then(function(resolve){
				    	// console.log(resolve);	
				    	// printStr += ' ============> Now resume';
				    	// console.log(printStr);
				    	rd.resume();	
				    });

				}
			});
			rd.on("close", function() {				
			    resolve(intLineCounter)
			});			
		});
	},
	deleteFilesOrDirectory: function(arrstrFiles){
		var self = this;
		return new Promise(function(resolve, reject){			
			if(!_.isArray(arrstrFiles)){
				arrstrFiles = [arrstrFiles];
			}
			_.each(arrstrFiles,function(filePath){
				fse.removeSync(filePath);
			});
			resolve();		
		});
		
	},
	csvFileParser: function(userId, transactionId,file){
		return new Promise(function(resolve, reject){			
			var intLineCounter = 0;
			var parserPromise = [];			
 			
	    	var params = {
	    		user_id: userId,
	    		sources: { label: 'CSV', value: file.originalname },
	    		transaction_id: transactionId,
	    		is_active: true
	    	};	
	    	var parser = require('./import/global_csv').init(params);	    	
	    	var csv = require("fast-csv");
	    	
    		var stream = fse.createReadStream(file.path); 
	
			csv
			.fromStream(stream, {quote: '"',  ignoreEmpty: true, headers:true})
			.on("data", function(contact){
				// console.log(process.memoryUsage().rss/(1024*1024));
				intLineCounter++;
				// console.log(JSON.stringify(parser.directLoop(contact, params)));
				parserPromise.push(parser.directLoop(contact, params));
			})
			.on("end", function(){				
				// console.log(process.memoryUsage().rss/(1024*1024));
				// console.log(intLineCounter);
				//flush remaining contacts to database if any in the contacts array
				Promise.all(parserPromise).then(function(parserResolve){
					var data = {
						contactcount: intLineCounter,
						transaction_id: transactionId
					}					
					params = null;					
					resolve(data);
			    }).catch(function(parserReject){
			    	console.log("In reject" + parserReject);
			    	reject(parserReject);
			    });
			});
		});
	},

	fileWriteStream: function(strFilePath, data){
		return new Promise(function(writeResolve, writeReject){
			var objWritableStream = fse.createWriteStream(strFilePath, {'flags': 'a'});
			if(_.isArray(data)){
				data = data.join('');				
			} 
			objWritableStream.write(data);	
			objWritableStream.end();
			data = null;
			writeResolve(strFilePath);
		});
	},
	csvFileWriteStream: function(strFilePath, data){
		var self = this;
		return new Promise(function(csvwriteResolve, csvwriteReject){

			stringify(data, function(err, output){
				data = null;
				self.fileWriteStream(strFilePath, output).then(function(writeResolve){
					output=null;
					csvwriteResolve(strFilePath);	
				});			
			});
			
		});		
	},
	zipDirectory: function(userId, dirname){
		var self = this;
		return new Promise(function(resolve, reject){
			var exportPath = config.media_base_path + userId + config.exportCsv + '/';
			var fileListingPromise = new Promise(function(resolve, reject){
				self.getFileListing(dirname, function(err, data){
					if(err) reject(err)
					else resolve(data)				
				});
			});

			fileListingPromise
			.then(function(listResolve){
				var strZipName = path.basename(dirname) + '.zip';
				var outputPath = exportPath + '/' + strZipName;
				var archiver = require('archiver');
				var output = fse.createWriteStream( outputPath );
				var archive = archiver('zip');

				output.on('close', function() {
					// console.log(archive.pointer() + ' total bytes');					
					resolve({zipname:strZipName});
				});

				archive.on('error', function(err) {
					console.log(err);
				  // throw err;
				  	reject(err);
				});

				archive.pipe(output);

				if(listResolve.files && listResolve.files.length > 0){
					listResolve.files.forEach(function(filePath){
						archive.append(fse.createReadStream(filePath), { name: path.basename(filePath) })	
					})
				  	archive.finalize();
				} else {			
					listResolve.message = "No files present";
					reject(listResolve);
				}				
			})
			.catch(function(listReject){
				console.log(listReject);
				reject(listReject);
			})
			
		})
		
	},
	moveFile: function(oldPath, newPath){
		var self = this;
		return new Promise(function(resolve, reject){			
			fse.mkdirpSync(path.dirname(newPath));
			//check if file exists
			if(self.fileExists(oldPath)){
				fse.renameSync(oldPath, newPath)
				resolve({status: true});	
			} else {
				reject({status: false, message: 'file doesnt exists'})
			}
			
		})
	},
	copyFile: function(oldPath, newPath){
		var self = this;
		return new Promise(function(resolve, reject){			
			if(self.fileExists(oldPath)){
				fse.copy(oldPath, newPath, function (err) {
				  if (err) return reject(err)
				  resolve({status: true})
				});
			} else {
				reject({status: false, message: 'file doesnt exists'})
			}
		})
	},
	fileExists: function(path){
		try{
			fse.accessSync(path, fse.F_OK);
			return true;
		}catch(e){
			return false;
		}		
	},
	getFileMimeType: function(path){
		return new Promise(function(resolve, reject){
			var mmm = require('mmmagic'),
			Magic = mmm.Magic;

			var magic = new Magic(mmm.MAGIC_MIME_TYPE);
			magic.detectFile(path, function(err, result) {
			if (err) return reject(err);
			resolve(result);
			// output on Windows with 32-bit node:
			//    application/x-dosexec
			});
		});		
	},
	getFileEncoding: function(path){
		var self = this;
		return new Promise(function(resolve, reject){
			try{
				var bufferStream = fse.createReadStream(path);
				var charsetDetector = require("node-icu-charset-detector");				
			  	var charset = charsetDetector.detectCharsetStream(bufferStream, function(charset){
			  		if(charset && charset.toString().length > 0) {
			  			resolve(charset);
			  		} else {
			  			resolve('UTF-8');
			  		}
			  	});
			} catch(e){
				reject(e);
			}
			
		});
	},
	changeFileEncoding: function(filePath, fromEncoding, toEncoding){
		var self = this;
		return new Promise(function(resolve, reject){
			var Iconv = require("iconv").Iconv;
			var input = fse.createReadStream(filePath);
			var strEtension = path.extname(filePath);
			var outfile = filePath + '_' + toEncoding + strEtension;			
			var output = fse.createWriteStream(outfile);
			input.pipe(Iconv(fromEncoding, toEncoding + '//TRANSLIT//IGNORE')).pipe(output);			
			output.on('error', function(){
				reject();
			});
			output.on('finish', function() {
				//once the file is written then delete the previous and rename the outputfile				
				//delete the unchanged file
				fse.unlinkSync(filePath);
				self.moveFile(outfile, filePath).then(function(fileCopyStatusResolve){
					resolve({status: true})
				}).catch(function(fileCopyStatusReject){
					reject({status: false})
				});
			});
			
		});		
	},
	unzipFile: function(path, dest){
		path= "/home/murtuza/Programming/node/qdk/qpk/shared/server/public/uploads/1473488925703.zip";
		dest = "/home/murtuza/Programming/node/qdk/qpk/shared/server/public/uploads";
		var fstream = require('fstream');
		return new Promise(function(resolve, reject){
			var unzip = require('unzip');
			var readStream = fse.createReadStream(path);
			var writeStream = fstream.Writer(dest);
			 
			var unzipStream = readStream.pipe(unzip.Parse()).pipe(writeStream);
			resolve({extract: dest});
		 	unzipStream.on('finish', function () { 
		 		resolve({extract: dest});
		 	});	
		})		
	}
}