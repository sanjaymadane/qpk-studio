(function(){
	'use strict';

	describe('Module: User authentication', function(){
		beforeEach(angular.mock.module('myApp'));
		var $controller, $rootScope, $httpBackend;

		beforeEach(inject(function(_$rootScope_, _$controller_, _$httpBackend_){
	    // The injector unwraps the underscores (_) from around the parameter names when matching
	    $controller = _$controller_;
	    $rootScope = _$rootScope_;
	    $httpBackend = _$httpBackend_;
	  }));

	  describe('Login using username and password', function(){
	  	it('Normal login with username and password without 2 step', function(){
	  		var $scope = $rootScope.$new();
	  		var controller = $controller('LoginCtrl', { $scope: $scope });
	  		$scope.user = {
	  			username: 'admin',
	  			password: 'YWRtaW4=' //admin
	  		};
	  		$scope.doLogin();
	  		expect($scope.login_success).toBe(true);
	  	});
	  });
	});
}());