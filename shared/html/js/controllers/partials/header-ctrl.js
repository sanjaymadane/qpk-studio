'use strict';

app.controller('HeaderCtrl', ['$scope', '$translate', '$filter','$cookies','$location', function ($scope, $translate, $filter,$cookies,$location) {
    $scope.changeLanguage = function (key) {
        $translate.use(key);
    };    
}]);