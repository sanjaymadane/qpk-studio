app.factory('Utility',['Base', function(Base){
	return {
		fileUpload: function(params, callback){
			Base.post('/file', params)
			.then(function(response){
				console.log(response);
				return callback(null, response);
			})
		}
	}

}])