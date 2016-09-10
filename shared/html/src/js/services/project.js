app.factory('Project',['Base', function(Base){
	return {
		getProjectList: function(params, callback){
			Base.get('/projects')
			.then(function(response){
				return callback(null, response);
			})
		},
		createProject: function(params, callback){
			Base.post('/projects', params)
			.then(function(response){
				return callback(null, response);
			})
		}
	}

}])