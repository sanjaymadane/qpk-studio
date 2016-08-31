'use strict';

app.controller('LoginCtrl', ['$scope', '$filter', '$rootScope', 'User', '$location', '$cookies', 'SID', 'ngDialog', 'toasty', 'BackgroundTask', '$window',
    function ($scope, $filter, $rootScope, User, $location, $cookies, SID, ngDialog, toasty, BackgroundTask, $window) {
        $scope.is_error = false;
        $scope.error_message = "";
        $scope.company_name = config.COMPANY_NAME;
        $scope.version = config.VERSION;
        $scope.user = {};
        $scope.$parent.is_login_page = true;
        $rootScope.userDetails = {};
        $scope.ask_security_code = false;
        $scope.verify_another_way = 1;
        $scope.security_question = '';
        $scope.$parent.boolShowAddContact = true;
        $scope.title_text = $filter('translate')('MY_CONTACTS');
        
        $scope.doLogin = function () {
            if ($scope.user.username != undefined && $scope.user.password != undefined) {
                if (!$scope.ask_security_code) {
                    $scope.user_password = $scope.user.password;
                    $scope.user.password = SID.ezEncode($scope.user.password);
                }
                
                User.authenticate($scope.user, function (response, err) {
                    if (response.data.status == true && response.data.data.need_2sv == '1') {
                        $scope.error_message = '';
                        $scope.ask_security_code = true;
                        $scope.title_text = $filter('translate')('2_STEP_VERIFICATION');
                    } else {
                        if (response.data.status == true && response.data.data.authPassed == 1) {
                            $scope.$parent.setUserDetails(response.data.data, function(state){
                                if(state){
                                    $scope.$parent.getUpdatedNasConfig(true, function(){
                                        if ($scope.user.secure_login) {
                                            var nasConfig = $cookies.get('NAS_Details') ? JSON.parse($cookies.get('NAS_Details')) : null;
                                            if(nasConfig && nasConfig.HTTPS){
                                                var secure_url = 'https://'+$window.location.hostname+':'+nasConfig.HTTPS+'/'+config.APP_NAME+'/#/contacts';
                                                $window.location.href = secure_url;
                                            } else 
                                                $location.path('/contacts');
                                        } else {
                                            $location.path('/contacts');                                    
                                        }
                                    });
                                } else {
                                    $scope.$parent.is_login_page = true;
                                    $scope.error_message = $filter('translate')('LOGIN_WARNING');
                                }
                            });
                        } else {
                            $scope.$parent.is_login_page = true;
                            $scope.error_message = $filter('translate')('LOGIN_WARNING');
                        }
                    }
                });
            } else {
                $scope.error_message = $filter('translate')('PROVIDE_CREDENTIALS');
            }
        };
        
        $scope.goBack = function(){
            $scope.verify_another_way = 1;
        };
        $scope.verifyAnotherWay = function () {
            $('.verify-another-way').hide();
            User.authenticate($scope.user, function (response, err) {
                if (response.data.status == true) {
                    if (response.data.data.lost_phone == 1) {
                        $scope.user.send_mail = 1;
                        $scope.verify_another_way = 1;
                        ngDialog.openConfirm({
                            template:
                                '<p>'+$filter('translate')('SEND_MAIL_CONFIRM')+'</p>' +
                                '<footer><div class="confirm-buttons">' +
                                '<button type="button" class="mycontacts-btn" ng-click="confirm(1)">' + $filter('translate')('CONFIRM') + '</button>&nbsp;&nbsp;&nbsp;' +
                                '<button type="button" class="cancel" ng-click="closeThisDialog(0)">' + $filter('translate')('CANCEL') +
                                '</button></div></footer>',

                            plain: true,
                            className: 'ngdialog-theme-default'
                        }).then(function (value) {
                            User.authenticate($scope.user, function (response, err) {
                                if (response.data.status) {
                                    delete $scope.user.send_mail;
                                    toasty.success({                    
                                        msg: $filter('translate')('EMAIL_SENT')
                                    });                                    
                                }
                                
                            });
                        });
                    } else if (response.data.data.lost_phone == 2) {
                        $scope.user.get_question = 1;
                
                        User.authenticate($scope.user, function (response, err) {
                            delete $scope.user.get_question;
                            $scope.verify_another_way = 2;
                            switch (response.data.data.security_question_no) {
                                case '1':
                                    $scope.security_question = $filter('translate')('WHAT_IS_PET_NAME');
                                    break;
                                case '2':
                                    $scope.security_question = $filter('translate')('WHAT_IS_FAVORITE_SPORT');
                                    break;
                                case '3':
                                    $scope.security_question = $filter('translate')('WHAT_IS_FAVORITE_COLOR');
                                    break;
                                case '4':
                                    $scope.security_question = response.data.data.security_question_text;
                                    break;
                            }
                        });
                    }
                }
                if(!$scope.$$phase) $scope.$apply();
            });
        };
    }]);