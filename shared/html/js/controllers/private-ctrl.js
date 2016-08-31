'use strict';

var showing = false;
app.controller('PrivateCtrl', ['$scope', 'Contact', '$log', 'Private', 'SID', '$location', 'ngDialog', '$http', function ($scope, Contact, $log, Private, SID, $location, ngDialog, $http) {
    $scope.favoriteReload = 0;
    $scope.privateReload = 1;
    $scope.deleteReload = 1;
    //$scope.loadContacts();
    $scope.loadContacts = function () {
        $scope.gridOptions.loading = true;
        var pageSizeparam = $scope.paginationOptions.pageSize;
        var pageNumberparam = $scope.paginationOptions.pageNumber - 1;
        Contact.getPrivateContacts('limit=' + pageSizeparam + '&page=' + pageNumberparam, function (response, err) {
            if (response.data.status == true) {
                $scope.gridOptions.data = response.data.data.data;
                $scope.gridOptions.totalItems = response.data.data.total;
                if (!showing) {
                    $(".ui-grid-pager-count-container").prepend("Showing");
                    showing = true;
                }
                $scope.gridOptions.loading = false;
            } else {
                $scope.gridOptions.data = [];
            }
        });
    };

}]);
        