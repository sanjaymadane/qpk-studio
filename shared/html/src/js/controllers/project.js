app.controller('ProjectCtrl', ['$scope','Project','Upload', ProjectCtrl]);

function ProjectCtrl($scope, ProjectSrv, Upload){	
	$scope.project = {};
	$scope.master = {};
	$scope.arrobjProjectList = [];

	$scope.getProjectList = function(){
		ProjectSrv.getProjectList('', function(err, data){
			if(err){
				console.log(err);
			} else {
				$scope.arrobjProjectList = data.data.data;
				console.log(data.data.data);
			}
		});	
	};

	$scope.createProject = function(project){
      // Example with 2 arguments
      angular.copy(project, $scope.master);
      console.log($scope.master);

      ProjectSrv.createProject($scope.master, function(err, response){
      	if(err){
      		console.log(err);
      	} else {
      		console.log(response);
      		$scope.project = {};
      	}
      })
      
	}

	$scope.reset = function(){
		$scope.project = {};
	}

	// upload later on form submit or something similar
    $scope.submit = function() {
      if ($scope.file) {
        $scope.upload($scope.file);
      }
    };

    // upload on file select or drop
    $scope.upload = function (file) {
        Upload.upload({
            url: config.API_URL+'/file',
            data: {upload: file}
        }).then(function (resp) {
        	console.log(resp);
        	$scope.project.file = resp.data.data.path;
        	$scope.project.filename = resp.data.data.originalname;

            // console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            // var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            // console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
    };   
}

