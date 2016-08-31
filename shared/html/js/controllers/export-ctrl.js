'use strict';

app.controller('ExportCtrl', ['$scope', 'Export', 'BackgroundTask', 'ngDialog', '$filter', 'Private', '$http', 'SID', '$cookies','toasty', 
    function ($scope, Export, BackgroundTask, ngDialog, $filter, Private, $http, SID, $cookies, toasty) {
    $scope.exportCSV = function(export_criteria, export_format) {
        var query = {};
        if (export_format == undefined || export_format.length == 0) {
            query.export_type = ["mycontact-csv"];
        } else {
            query.export_type = [];
            _.each(export_format, function(value, key){
                if (value){
                    switch (key) {
                        case 'mycontact_csv':
                            query.export_type.push("mycontact-csv");
                            break;
                        case 'vcard':
                            query.export_type.push("vcard");
                            break;
                        case 'google_csv':
                            query.export_type.push("google-csv");
                            break;
                    }
                }
            });
            if (query.export_type.length == 0) {
                query.export_type = ["mycontact-csv"];
            }
        }
        
        if (export_criteria == undefined && $scope.selectedContacts.length == 0) {
            toasty.error({                    
                msg: $filter('translate')('SELECT_EXPORT_CRITERIA')
            });
            return false;
        } else {
            query.is_active = true;
            switch (export_criteria.category) {
                case 'is_selected':
                    if ($scope.selectedContacts.length > 0) {
                        if ($scope.menu.private) {
                            $cookies.put('export_type', query.export_type);
                            $scope.openVerifyHighSecurity();
                        } else {
                            query.contact_ids = $scope.selectedContacts;
                            $scope.processExport(query);
                        }
                    } else {
                        toasty.error({
                            msg: $filter('translate')('SELECT_EXPORT_CRITERIA')
                        });
                        return false;
                    }
                    break;
                case 'is_favorites':
                    query.is_favorite = true;
                    $scope.processExport(query);
                    break;
                case 'is_groups':
                    query.group_ids = [export_criteria.group_id];
                    _.filter($scope.groups, function(group){
                        if (export_criteria.group_id == group._id) {
                            if (group.contacts_count < 1) {
                                toasty.error({
                                    msg: $filter('translate')('NO_CONTACTS_TO_EXPORT')
                                });
                            } else {
                                $scope.processExport(query);
                            }
                        }
                    });
                    break;
                case 'is_private':
                    query.is_locked = true;
                    $cookies.put('export_type', query.export_type);
                    $scope.openVerifyHighSecurity();
                    break;
                case 'is_default':
                    var selected_export_type = query.export_type;
                    query = {};
                    query.export_type = selected_export_type;
                    $scope.processExport(query);
                    break;
            }
        }
    };
    
    $scope.openVerifyHighSecurity = function() {
        ngDialog.open({
            template: 'views/partials/verify-security-for-export.html',
            controller: 'ExportCtrl',
            className: 'ngdialog-theme-default custom-width-550',
            closeByDocument: false
        });
    };
    
    $scope.verifyHighSecurity = function (verifyHighSecurityForm, security) {
        $scope.$broadcast('runCustomValidations');
        if (verifyHighSecurityForm.$valid) {
            security.high_security_password = SID.ezEncode(security.high_security_password);
            Private.getSecondaryToken(security, function (response, err) {
                if (response.data.status) {
                    var secondary_token = response.data.data.secondary_token;
                    $http.defaults.headers.common['Highsecurity'] = 'Bearer ' + secondary_token;
                    $cookies.put('secondaryToken', 'Bearer ' + secondary_token);

                    ngDialog.close();
                    var query = {};
                    query.export_type = $cookies.get('export_type').split(",");
                    query.is_locked = true;
                    $cookies.remove('export_type');
                    if ($scope.selectedContacts && $scope.selectedContacts.length > 0) {
                        query.contact_ids = $scope.selectedContacts;
                    }
                    $scope.processExport(query);
                } else {
                    security.high_security_password = "";
                    toasty.error({                    
                        msg: $filter('translate')('WRONG_HIGH_SECURITY_PASSWORD')
                    });                     
                }
            });
        }
    };
    
    $scope.processExport = function(query) {
        Export.exportFile(query, function (response, err) {
            switch (response.data.status_code) {
                case 10001:
                    ngDialog.open({
                        template: 'views/partials/exporting-loader.html',
                        controller: 'MainCtrl',
                        closeByDocument: false
                    });
                    break;
                case 10022:
                    toasty.error({
                        msg: $filter('translate')('COUNT_LIMIT_IMPOSED')
                    });
                    break;
                case 10023:
                    toasty.error({
                        msg: $filter('translate')('NO_CONTACTS_TO_EXPORT')
                    });
                    break;
                case 10024:
                    toasty.error({
                        msg: $filter('translate')('INVALID_EXPORT_TYPE')
                    });
                    break;
            }
            
            BackgroundTask = BackgroundTask.connect();
            BackgroundTask.on('task:progress', function(data) {                
                if(data.progress == '100%'){
                    ngDialog.close();
                }
                if(!$scope.$$phase) $scope.$apply();
            });
        });
    };
}]);