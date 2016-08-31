'use strict';

app.controller('UserManagementCtrl', ['$scope', 'UserManagement', 'User', '$location', '$cookies', '$compile', 'ngDialog', 'SID', '$filter', 'toasty', 
    function ($scope, UserManagement, User, $location, $cookies, $compile, ngDialog, SID, $filter, toasty) {
        $scope.$parent.boolShowAddContact = true;
        $scope.$parent.allUsers = {};
        $scope.accountUserData = {};
        $scope.loadUsers = function () {
            UserManagement.getUsers(function (response, err) {
                $scope.users = response.data.data.data;
            });
        };

        $scope.loadUser = function() {
            User.getLoggedInUserDetails(function (response, err) {
                $scope.user = response.data.data;
            });
        };

        $scope.selectedRows = [];
        $scope.$watch('selectedRows', function (newValue, oldValue) {
            if (newValue.length > 0)
                $scope.disable_batch_update = false;
            else
                $scope.disable_batch_update = true;
        });

        $scope.config = {
            datatype: 'json',
            ajaxGridOptions: {contentType: "application/json", cache: false},
            url: config.API_URL + 'users',
            loadBeforeSend: function (jqXHR) {
                jqXHR.setRequestHeader('Authorization', 'bearer ' + $cookies.get('accessToken'));
            },
            userData: $scope.accountUserData,
            id: '_id',
            colNames: ['id', $filter('translate')('LABEL_USERNAME'), $filter('translate')('USER'), $filter('translate')('ROLE'), ''],
            colModel: [
                {name: '_id', index: '_id', hidden: true, resizable: false, frozen: true},
                {name: 'username', index: 'username', resizable: false, frozen: true},
                {name: 'fname', index: 'fname', resizable: false, width: 215, frozen: true, formatter: function (cellvalue, options, rowObject) {
                        var fname = (rowObject.fname != undefined) ? rowObject.fname : '';
                        var lname = (rowObject.lname != undefined) ? rowObject.lname : '';
                        return '<div class="edit">' + fname + ' ' + lname + '<div>';
                    }
                },
                {name: 'role', index: 'role', resizable: false, frozen: true},
                {
                    name: 'actions',
                    index: 'actions',
                    resizable: false,
                    width: 20,
                    frozen: true,
                    align: 'center',
                    formatter: function (cellvalue, options, rowObject) {
                        var html = "";
                        if (rowObject.username != 'admin') {
                            html += '<span title="Delete" class="q-icon icon-action_delete_normal action-toolbar delete '+rowObject.is_active+'"></span>';
                        } else {
                            html += '<div style="min-width: 20px;min-height: 20px;"></div>';
                        }
                        $compile(angular.element(html))($scope);
                        return html;
                    }
                },
            ],
            scope: $scope,
            serializeGridData: function (postData) {
                postData.limit = postData.rows;
                postData.page = postData.page - 1;
                return postData;
            },
            multiselect: true,
            rowNum: 50,
            rowList: [50, 100, 500],
            pageable: true,
            jsonReader: {
                root: 'data.data',
                rows: function (obj) {
                    return obj.data.data;
                },
                records: function (obj) {
                    $scope.allUsers = obj.data.data;
                    return obj.data.total;
                },
                page: function (obj) {
                    return obj.data.page + 1;
                },
                total: function (obj) {
                    return parseInt(obj.data.pages);
                }
            },
            pager: '#pageruser-grid'
        };

        $scope.openAddUser = function () {
            ngDialog.open({
                template: 'views/add-user.html',
                scope: $scope,
                closeByDocument: false
            });
        },
                
        $scope.onSelectRow = function (scope, action, params, id) {
            switch (action) {
                case 'delete':
                    $scope.deleteUser(id);
                    break;
            }
        };
              
        $scope.deleteUser = function(id) {
            ngDialog.openConfirm({
                template:
                    '<p>'+$filter('translate')('PERMANENT_DELETE_CONTACTS_WARNING')+'</p>' +
                    '<footer><div class="confirm-buttons">' +
                    '<button type="button" class="mycontacts-btn" ng-click="confirm(1)">' + $filter('translate')('CONFIRM') + '</button>&nbsp;&nbsp;&nbsp;' +
                    '<button type="button" class="cancel" ng-click="closeThisDialog(0)">' + $filter('translate')('CANCEL') +
                    '</button></div></footer>',

                plain: true,
                className: 'ngdialog-theme-default'
            }).then(function (value) {
                UserManagement.deleteUser(id, function (response, err) {
                    if (response.status) {
                        $('#user-grid').trigger('reloadGrid');
                    }
                });
            });
        };
        
        $scope.createUser = function (user) {
            var windowIDs = ngDialog.getOpenDialogs();
            ngDialog.close(windowIDs[1]);
            
            user.password = SID.ezEncode(user.password);
            UserManagement.createUser(user, function (response, err) {
                if (response.data.status) {

                    $('#user-grid').trigger('reloadGrid');
                }
            });
        },
        
        $scope.batchDelete = function () {
            var is_admin_selected = false;
            _.filter($scope.allUsers, function(user) {
                if ($scope.selectedRows.indexOf(user._id) > -1 && user.username == 'admin') {
                    is_admin_selected = true;
                }
            })
            
            if (!is_admin_selected) {
                ngDialog.openConfirm({
                    template:
                        '<p>'+$filter('translate')('PERMANENT_DELETE_CONTACTS_WARNING')+'</p>' +
                        '<footer><div class="confirm-buttons">' +
                        '<button type="button" class="mycontacts-btn" ng-click="confirm(1)">' + $filter('translate')('CONFIRM') + '</button>&nbsp;&nbsp;&nbsp;' +
                        '<button type="button" class="cancel" ng-click="closeThisDialog(0)">' + $filter('translate')('CANCEL') +
                        '</button></div></footer>',

                    plain: true,
                    className: 'ngdialog-theme-default'
                }).then(function (value) {
                       var params = {
                        "user_ids": $scope.selectedRows,
                    };
                    UserManagement.batchDeleteUsers(params, function (response, err) {
                        if (response.status) {
                            $('#user-grid').trigger('reloadGrid');
                        }
                    });
                });
            } else {
                toasty.error({
                    msg: $filter('translate')('ADMIN_DELETE_WARNING')
                });
            }
        };
        
        $scope.editProfile = function(profileForm, user) {
            $scope.$broadcast('runCustomValidations');
            if (profileForm.$valid) {
                UserManagement.editUser(user._id, user, function (response, err) {
                    if (response.data.status) {
                        $cookies.put('accessToken', "");
                        $cookies.put('user', "");
                        ngDialog.close();

                        toasty.success({                    
                            msg: $filter('translate')('USER_EDITED_SUCCESS')
                        });
                        $location.path('/login');
                    }
                });
            }
        };

        $scope.changePassword = function(resetPasswordForm, user) {
            $scope.$broadcast('runCustomValidations');
            if (resetPasswordForm.$valid) {
                var data = {};
                data.password = SID.ezEncode(user.password);
                data.old_password = SID.ezEncode(user.old_password);

                UserManagement.resetPassword(data, function (response, err) {
                    if (response.data.status) {
                        $cookies.put('accessToken', "");
                        $cookies.put('user', "");
                        ngDialog.close();
                        toasty.success({                    
                            msg: $filter('translate')('USER_EDITED_SUCCESS')
                        });                        
                        $location.path('/login');
                    } else {
                        toasty.error({                    
                            msg: $filter('translate')('VERIFY_OLD_PASSWORD')
                        });                        
                    }
                });
            }
        }
    }]);
        

        angular.module('UserValidation', []).directive('confirmPassword', function () {
    return {
                require: 'ngModel',
                scope: {
                reference: '=confirmPassword'
            },
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue, $scope) {
                var noMatch = viewValue != scope.reference
                ctrl.$setValidity('noMatch', !noMatch);
                 return (noMatch)?noMatch:!noMatch;
            });

            scope.$watch("reference", function(value) {
                ctrl.$setValidity('noMatch', value === ctrl.$viewValue);
            });
        }
    }
})