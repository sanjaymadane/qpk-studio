'use strict';

app.factory('Base', ['$http', '$q', '$rootScope', '$cookies', '$location', function ($http, $q, $rootScope, $cookies, $location) {
    var checkStatus = function(response){
        var deferred = $q.defer();        
        if(response.data && response.data.status_code == 11000) {            
            $rootScope.$emit('restore_halted', response);
            deferred.reject("Error: request returned status ");
        } else if (response.data && response.data.status_code == 10007) {
            $cookies.remove('user');
            $cookies.remove('accessToken');
            $location.path('/login');
        } else {            
            deferred.resolve(response); 
        }        
        return deferred.promise;
    };
    return {
        get: function(url, params){
            return $http.get(config.API_URL + url);
        },
        post: function(url, data){
            return $http.post(config.API_URL + url, data);
        },
        put: function(url, data){
            return $http.put(config.API_URL + url, data);
        },
        delete: function(url, data){
            return $http.delete(config.API_URL + url, {
                data: data, headers: {
                    'Content-Type': "application/json; charset=utf-8"
                }
            });
        }       
    };

}]);