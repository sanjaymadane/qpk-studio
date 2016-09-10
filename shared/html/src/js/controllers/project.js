app.controller('ProjectCtrl', ['$scope','Project', ProjectCtrl]);

function ProjectCtrl($scope, ProjectSrv){
	$scope.master = {};
	$scope.arrobjProjectList = [];
	console.log("Project controller loaded");	

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
}

