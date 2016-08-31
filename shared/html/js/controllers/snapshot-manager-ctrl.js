'use strict';

app.controller('SnapshotManagerCtrl', ['$scope', 'ngDialog', '$filter', 'SnapshotManagement', 'usSpinnerService', '$location', '$window', 'toasty',
        function ($scope, ngDialog, $filter, SnapshotManagement, usSpinnerService, $location, $window, toasty) {
    $scope.$parent.boolShowAddContact = true;
    $scope.snapshotList = [];
    $scope.defaultSnapshotName = 'Snapshot_'+$filter('date')(new Date(), 'yyyy-MM-dd_HH:mm:ss');
    $scope.openCreateSnapshot = function () {
        ngDialog.close();
        ngDialog.open({
            template: 'views/create-snapshot.html',
            controller: 'SnapshotManagerCtrl',
            className: 'ngdialog-theme-default custom-width-500',
            closeByDocument: false
        });
    };

    $scope.listSnapshot = function(){
        ngDialog.close();
        ngDialog.open({
            template: 'views/list-snapshot.html',
            controller: 'SnapshotManagerCtrl',
            className: 'ngdialog-theme-default restore-dialog',
            closeByDocument: false
        })
    };

    $scope.getSnapshotList = function() {        
        SnapshotManagement.getSnapshotList('', function(response, err) {
            if(err) {
                console.log("error in retreiving records")
            } else {
                if(response.data.status ==true) {
                    $scope.snapshotList = response.data.data;
                } else {
                    $scope.snapshotList = [];
                }                
            }

        })
    };
    
    $scope.takeSnapshot = function (snapshot) {
        if($scope.snapshot.name && $scope.snapshot.name.length > 0 ) {
            $scope.loading = true;
            SnapshotManagement.takeSnapshot({"display_name":$scope.snapshot.name}, function(response, err){  
                $scope.loading = false;        
                ngDialog.close();              
                if(response.data.status) {
                    toasty.success({                    
                        msg: $filter('translate')('SNAPSHOT_SUCCESS')
                    });                    
                } else {
                    toasty.error({                    
                        msg: $filter('translate')('SNAPSHOT_FAILURE')
                    });                    
                }                
            })    
        } else {
            toasty.error({                    
                msg: $filter('translate')('SNAPSHOT_NAME_VALIDATION')
            });                    
        }
    };

    $scope.deleteSnapshot = function(index) {
        ngDialog.openConfirm({
            template:
                    '<p>' + $filter('translate')('SNAPSHOT_DELETE_CONFIRMATION') + '</p>' +
                    '<footer><div class="confirm-buttons">' +
                    '<button type="button" class="mycontacts-btn" ng-click="confirm(1)">' + $filter('translate')('CONFIRM') + '</button>&nbsp;&nbsp;&nbsp;' +
                    '<button type="button" class="cancel" ng-click="closeThisDialog(0)">' + $filter('translate')('CANCEL') +
                    '</button></div></footer>',

            plain: true,
            className: 'ngdialog-theme-default'
        }).then(function (value) {
            var snapshotId = $scope.snapshotList[index]._id;
            if(snapshotId) {
                $scope.loading = true;
                SnapshotManagement.deleteSnapshot(snapshotId, function(response, err){  
                    $scope.loading = false;                                      
                    if(response.data.status) {
                        $scope.snapshotList.splice(index, 1);    
                        toasty.error({                    
                            msg: $filter('translate')('SNAPSHOT_DELETE_SUCCESS')
                        });                
                    } else {
                        toasty.error({                    
                            msg: $filter('translate')('SNAPSHOT_DELETE_FAILURE')
                        });                    
                    }                
                })
            } else {
                toasty.error({                    
                    msg: $filter('translate')('SNAPSHOT_DELETE_FAILURE')
                });

            }
        });
    }

    $scope.confirmSnapshotRestore = function(index) {        
        var snapshotId = $scope.snapshotList[index]._id;
        if(snapshotId){            
            $scope.create_snapshot = true;
            //open confirmation box
            ngDialog.open({
                template:'<loading></loading>'
                    +'<div id="restore-confirmation">'
                    +'<div class="info-block">' 
                        +'<div>'
                            + '<span id="info-icon">IMG</span>'
                        +'</div>'
                        +'<div class="content">'
                            +'<div class=""><p> '+$filter('translate')('RESTORE_MESSAGE_1')+' <p></div>'
                            +'<div class="info-data"><p> '+$filter('translate')('RESTORE_MESSAGE_2')+' <p></div>'
                            +'<div class="create-snapshot">'
                                +'<input type="checkbox"  ng-model="create_snapshot" ng-init="create_snapshot=true">'
                                +' ' + $filter('translate')('AUTOMATIC_SNAPSHOT')
                            +'</div>'
                        +'</div>'                         
                    +'</div>'
                    +'<div class="confirm-buttons">'
                        + '<button class="apply" ng-click="restoreSnapshot(\''+snapshotId+'\')">'+$filter('translate')('YES')+'</button>'
                        + '<button class="cancel" ng-click="closeThisDialog();">'+$filter('translate')('NO')+'</button>'
                    +'</div>'
                +'</div>',
                plain:true,
                controller: 'SnapshotManagerCtrl',
                closeByDocument: false
            });
        } else {
            toasty.error({                    
                msg: $filter('translate')('RESTORE_FAILURE')
            });            
        }
    };

    $scope.restoreSnapshot = function(id, restoreId){
        if(id) {
            $scope.loading = true;
            var params = {snapshot_id : id, create_snapshot: $scope.create_snapshot};

            if(restoreId && restoreId.length > 0) {
                params.restore_id = restoreId;
            }
            
            SnapshotManagement.restoreSnapshot(params, function(response, err){
                $scope.loading = false;
                if(response.data.status){
                    $location.path('/contacts');
                    $window.location.reload();
                } else {
                    toasty.error({                    
                        msg: $filter('translate')('RESTORE_FAILURE')
                    });                    
                }
            }) 
        } else {
            toasty.error({                    
                msg: $filter('translate')('RESTORE_FAILURE')
            });            
        }
    };    
}]);