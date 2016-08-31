'use strict';
var openedWindow;

app.controller('SyncCtrl', ['$compile','$rootScope','$scope', 'Sync', 'ngDialog', 'BackgroundTask', '$location', '$routeParams', '$filter', '$cookies', 'toasty', 'User', 'Contact',
    function ($compile, $rootScope, $scope, Sync, ngDialog, BackgroundTask, $location, $routeParams, $filter, $cookies, toasty, User, Contact) {
        
        $rootScope.$emit('load_groups');
        $scope.$parent.boolShowAddContact = true;
        $scope.showHistory = {};
        $scope.showHistory.showGrid = true;
        var manageAccountDailog;
        $scope.OnDisconnectButtonCloseManageAccountDailog;
        var manualSynDailog;
        $scope.importType = {};
        $scope.importType.importTypeDifferential = true;
        $scope.importType.SyncTime = {};
        
        $scope.recordIDForSyncManual = 0;
        $scope.selected = {};
        $scope.selected.gridSelectedRows = [];
        $scope.googleLogin = function () {
            var url = config.GOOGLE_CONNECTOR_URL;
                url += "?app_id=" + config.GOOGLE_CONNECTOR_APPID;
                url += "&provider=" + config.GOOGLE_CONNECTOR_PROVIDER;
                url += "&scope=" + config.GOOGLE_CONNECTOR_SCOPE;
                url += "&cb=" + config.GOOGLE_CONNECTOR_CALLBACK_URL;

            openedWindow = window.open(url, "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=200, left=500, width=700, height=600");
            if (window.addEventListener) {
                window.addEventListener("message", $scope.receiveMessage, false);
            } else {
                window.attachEvent("onmessage", $scope.receiveMessage);
            }
        };

        $scope.receiveMessage = function(event) {
            var token = event.data.split('result=')[1].replace('#','');

            //Need to remove event listener after we receive the message.
            window.removeEventListener('message', $scope.receiveMessage);
            openedWindow.close();

            if (token[1].indexOf('access_denied') > -1) {
                toasty.error({
                    msg: $filter('translate')('IMPORT_CONTACTS_FAILED')
                });
            } else {
                //$scope.getGoogleContacts(token[1]);
                token = decodeURIComponent(token);
                $scope.getGoogleContacts(token.split("\,+").join(",").split(":+").join(":"));
            }
        };

        $scope.getGoogleContacts = function (auth_key) {
           var tempDailog =  ngDialog.open({
                template: 'views/partials/importing-loader.html',
                controller: 'MainCtrl',
                closeByDocument: false
            });
            //Sync.getGoogleContacts({auth_key:auth_key.slice(0, -1)}, function(response, err){
            Sync.getGoogleContacts({result:auth_key}, function(response, err){
                BackgroundTask = BackgroundTask.connect();
                BackgroundTask.on('task:progress', function(data) {
                    if(data.progress == '100%'){
                        tempDailog.close();
                        var path = $location.$$path;
                        if (path == "/default") {
                            $location.path('/contacts');
                        } else {
                            if (path == "/sync") {
                                $('#manage-account').trigger('reloadGrid');
                                $('#history-grid').trigger('reloadGrid');
                            }
                        }
                    }
                    if(!$scope.$$phase) $scope.$apply();
                });
            });
        };

        $scope.importFile = function(file, errorFile) {
            if (!errorFile && file) {
                ngDialog.close();
               var tempDailog =  ngDialog.open({
                    template: 'views/partials/importing-loader.html',
                    controller: 'MainCtrl',
                    closeByDocument: false
                });

                Sync.importFile(file, function(response, err){
                    BackgroundTask = BackgroundTask.connect();
                    BackgroundTask.on('task:progress', function(data) {
                        if(data.progress == '100%'){
                            tempDailog.close();
                            if ($location.$$path == "/default") {
                                $('#history-grid').trigger('reloadGrid');
                                $location.path('/contacts');
                            } else {
                                if ($location.$$path == "/sync") {
                                    $('#manage-account').trigger('reloadGrid');
                                    $('#history-grid').trigger('reloadGrid');
                                }
                            }
                        }
                        if(!$scope.$$phase) $scope.$apply();
                    });
                });
            }
        };

        $scope.openFileImport = function() {
            ngDialog.open({
                template: 'views/partials/file-import.html',
               controller:'importFileCtrl',
                closeByDocument: false,
                className: 'ngdialog-theme-default custom-width-900-import'
            });
        };

        $scope.loadHistory = function () {
            Sync.getHistory(function(response, err){
                $scope.history = response.data.data;
                $scope.showHistory.showGrid = response.data.data.total > 0 ? true : false;
                $("#history-grid").setGridWidth(($(window).innerWidth()-275), false);
            });
        };

        $scope.config = {
            datatype: 'json',
            ajaxGridOptions: { contentType: "application/json", cache: false },
            url: config.API_URL + 'notifications?type=import',
            loadBeforeSend: function (jqXHR) {
                jqXHR.setRequestHeader('Authorization', 'bearer ' + $cookies.get('accessToken'));
            },
            userData: $scope.history,
            colNames: [$filter('translate')('IMPORT_SOURCE_TYPE'), $filter('translate')('IMPORT_SOURCE_DETAILS'), $filter('translate')('ACCOUNT_IMPORTED_TIME'), $filter('translate')('ACCOUNT_IMPORT_STATUS_HISTORY')],
            colModel: [
                { name: 'sub_type', index: 'sub_type', width: 300 },
                { name: 'import_from', index: 'import_from', width: 400 },
                {
                    name: 'logged_on', index: 'logged_on', width: 345, formatter: function (cellvalue, options, rowObject) {
                        return moment(cellvalue).format('DD-MM-YYYY HH:mm:ss');
                    }
                },
                { name: 'status', index: 'status', width: 600 }
            ],
            scope: $scope,
            serializeGridData: function (postData) {
                postData.limit = postData.rows;
                postData.page = postData.page - 1;
                return postData;
            },
            rowNum: 50,
            rowList: [50, 100, 500],
            pageable: true,
            jsonReader: {
                root: 'data.data',
                rows: function (obj) {
                    return obj.data.data;
                },
                records: function (obj) {
                    return obj.data.total;
                },
                page: function (obj) {
                    return obj.data.page + 1;
                },
                total: function (obj) {
                    return parseInt(obj.data.pages);
                }
            },
            pager: '#pagerhistory-grid'
        };
      
        //$scope.config = {
        //    datatype: 'json',
        //    ajaxGridOptions: {contentType: "application/json", cache: false},
        //    url: config.API_URL + 'imports/google/sync',
        //    loadBeforeSend: function (jqXHR) {
        //        jqXHR.setRequestHeader('Authorization', 'bearer ' + $cookies.get('accessToken'));
        //    },
        //    userData: $scope.history,
        //    colNames: [$filter('translate')('IMPORT_SOURCE_TYPE'), $filter('translate')('IMPORT_SOURCE_DETAILS'), $filter('translate')('ACCOUNT_LAST_IMPORTED_TIME'), $filter('translate')('ACCOUNT_IMPORT_SCHEDULE')],
        //    colModel: [
        //        { name: 'account_type', index: 'account_type', width: 300 },
        //        { name: 'account_name', index: 'account_name', width: 300 },
        //        {
        //            name: 'last_sync', index: 'last_sync', width: 300, formatter: function (cellvalue, options, rowObject) {
        //                return moment(cellvalue).format('DD MMM YYYY HH:mm:ss');
        //            }
        //        },
        //         {
        //             name: 'trigger_break', index: 'trigger_break', width: 300, formatter: function (cellvalue, options, rowObject) {
        //                 var val = "";
        //                 angular.forEach($scope.importType.SyncTime, function (value, key) {
        //                     if (value.value.toString() == cellvalue) {
        //                         val= value.key.toString();
        //                     }
        //                 });
        //                 if (val == "") {
        //                     return "--";
        //                 }
        //                 return $filter('translate')(val);
        //             }
        //         }
        //    ],
        //    scope: $scope,
        //    jsonReader: {
        //        root: 'data',
        //        rows: function (obj) {
        //            return obj.data.data;
        //        }
        //    }
        //};

        $scope.openManageAccountDailog = function () {
            $scope.selected.gridSelectedRows = [];
            Sync.getSyncAccount(function (resp, error) {
                var msg = resp.data.data.length;
                if (msg > 0) {
                    manageAccountDailog = ngDialog.open({
                        template: 'views/partials/import-manage-account.html',
                        scope: $scope,
                        className: 'ngdialog-theme-default custom-width-900'
                    });
                } else {
                    manageAccountDailog = ngDialog.open({
                        template: 'views/partials/import-manage-account-no-history.html',
                        scope: $scope,
                        className: 'ngdialog-theme-default custom-width-840'
                    });
                }
            });
        };

        $scope.syncTimeUpdate = function (id, syncTime) {
            Sync.syncTimeUpdate(id, syncTime, function (resp, err) {});
        };

        $scope.syncDeleteAccountGoogleSync = function (ids) {
            ngDialog.openConfirm({
                template:
                     '<p style="margin-top:20px;">' + '</p>' +
                    '<p>' + $filter('translate')('ACCOUNT_DELETE_WARNING_HEADER')  +"  " +
                     $filter('translate')('ACCOUNT_DELETE_WARNING_DESC') + '</p>' +
                    '<footer><div class="confirm-buttons">' +
                    '<button type="button" class="mycontacts-btn" ng-click="confirm(1)">' + $filter('translate')('CONFIRM') + '</button>&nbsp;&nbsp;&nbsp;' +
                    '<button type="button" class="cancel" ng-click="closeThisDialog(0)">' + $filter('translate')('CANCEL') +
                    '</button></div></footer>',
                plain: true,
                className: 'ngdialog-theme-default'
            }).then(function (value) {
                Sync.syncDeleteAccountGoogleSync($scope.selected.gridSelectedRows, function (response, err) {
                    if (response.status) {
                        $('#manage-account').trigger('reloadGrid');
                        $('#history-grid').trigger('reloadGrid');
                        setTimeout(function () {
                            var records = $('#manage-account').jqGrid('getGridParam', 'records');
                            if (records == 0) {
                                manageAccountDailog.close();
                                $scope.openManageAccountDailog();
                            }
                        }, 100);
                    }
                });
            });
           
        };

        Sync.syncTimeList(function (resp, err) {
            $scope.importType.SyncTime = resp.data.data;

            $scope.configForManageAccounts = {
                datatype: 'json',
                ajaxGridOptions: { contentType: "application/json", cache: false },
                url: config.API_URL + 'imports/google/sync',
                loadBeforeSend: function (jqXHR) {
                    jqXHR.setRequestHeader('Authorization', 'bearer ' + $cookies.get('accessToken'));
                },
                id: '_id',
                height: 350,
                width: 830,
                colNames: ['id', $filter('translate')('LABEL_USERNAME'), $filter('translate')('ACCOUNT_LAST_IMPORTED_TIME'), $filter('translate')('ACCOUNT_IMPORT_SCHEDULE'), $filter('translate')('ACCOUNT_IMPORT_STATUS'),''],
                colModel: [
                    { name: '_id', index: '_id', hidden: true },
                    { name: 'account_name', index: 'account_name', resizable: false, width: 190, sortable: false },
                    {
                        name: 'last_sync', index: 'last_sync', resizable: false, width: 195, sortable: false,
                        formatter: function (cellvalue, options, rowObject) {
                            var cellString = moment(cellvalue).format('DD MMM YYYY HH:mm:ss');
                            return '<div class="hand-cursor">' + cellString + ' <img src="resources/img/um_import.png"></div>';
                        }
                    },
                    {
                        name: 'trigger_break', index: 'trigger_break', resizable: false, width: 145, sortable: false,
                        formatter: function (cellvalue, options, rowObject) {
                            var cellstring = '<select class="select-ele" id="sync_'+rowObject._id +'">';
                            angular.forEach($scope.importType.SyncTime, function (value, key) {
                                if (value.value.toString() == cellvalue) {
                                    cellstring += '<option selected value="'+ value.value+'"  >' +$filter('translate')(value.key)  + '</option>';
                                } else {
                                    cellstring += '<option value="' + value.value + '"  >' + $filter('translate')(value.key) + '</option>';
                                }
                            });
                            cellstring += "</select>";
                            return cellstring;
                        }
                    },
                    {
                        name: 'last_sync_status', index: 'last_sync_status', resizable: false, width: 155, sortable: false,
                        formatter: function (cellvalue, options, rowObject) {
                            if (cellvalue == true) {
                                return '<div class="account-connected-foreground">Connected</div>';
                            }
                            return '<div class="account-disconnected-foreground">Disconnected <label class="account-disconnected-info-circle-base">!</label><img  class="hand-cursor" src="resources/img/um_refresh.png"></div>';
                        }
                    },
                      {
                          name: 'delete', index: 'delete', resizable: false, width: 79, sortable: false,
                          formatter: function (cellvalue, options, rowObject) {
                              return '<div class="hand-cursor"> <img src="resources/img/um_delete.png"></div>';
                          }
                      },
                ],
                scope: $scope,
                multiselect: true,
                pageable: true,
                jsonReader: {
                    root: 'data',
                    rows: function (obj) {
                        return obj.data;
                    }
                }
            };
        });

        $scope.onSelectRowManageAccout = function (scope, status, id) {

            if (status) {
                
            } else {
                
            }
        };

        $scope.onSelectAllManageAccount = function (scope, status, ids) {
            if (status) {
                
            } else {
               
            }
        };

        $scope.onLastImportedTimeUpdate = function (id) {
            $scope.recordIDForSyncManual = id;
            manualSynDailog = ngDialog.open({
                scope: $scope,
                template: 'views/partials/import-sync-dailog.html',
                className: 'ngdialog-theme-default custom-width-300'
            });
        };

        $scope.closeManualImport = function () {
            manualSynDailog.close();
        };

        $scope.OnManualImportClick = function () {
            Sync.manualImport($scope.recordIDForSyncManual, !$scope.importType.importTypeDifferential, function (response, err) {
                manualSynDailog.close();
            });
            $('#manage-account').trigger('reloadGrid');
            $('#history-grid').trigger('reloadGrid');
        };

        $scope.openAddUser = function () {
            ngDialog.open({
                template: 'views/add-user.html',
                scope: $scope,
                closeByDocument: false
            });
        };

        $scope.onSelectRow = function (scope, action, params, id) {
            switch (action) {
                case 'delete':
                    $scope.deleteUser(id);
                    break;
            }
        };

        $scope.OnDisconnectButtonCloseManageAccountDailog = function (status) {
            if (status !== '<div class="account-connected-foreground">Connected</div>') {
                $scope.googleLogin();
            }
        };
}]);