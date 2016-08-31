'use strict';

var showing = false;
app.controller('MainCtrl', ['$scope', '$translate', 'Contact', '$log', '$cookies', 'User', '$location', '$rootScope', 'Group', 'ngDialog', 'Private', 'SID', '$http', 'BackgroundTask', 'TaskNotification', '$window', '$filter', 'toasty', '$document','CGI',
    function ($scope, $translate, Contact, $log, $cookies, User, $location, $rootScope, Group, ngDialog, Private, SID, $http, BackgroundTask, TaskNotification, $window, $filter, toasty, $document,CGI) {
        $scope.nasDetails = "";
        if($cookies.get('nasDetails')){
            $scope.nasDetails = JSON.parse($cookies.get('nasDetails'));
        } else {
            CGI.getNasInfo(function(res, err){
                if(res.QDocRoot){
                    var nasDetails = {
                        nas_name: res.QDocRoot.hostname,
                        hostname: window.location.hostname
                    }
                    $cookies.put('nasDetails', JSON.stringify(nasDetails));
                    $scope.nasDetails = nasDetails;
                    if (!$scope.$$phase) $scope.$apply();
                }
            });
        }        
        $scope.show_connection_error = false;
        $scope.socket_url = config.SOCKET_URL;
        $scope.pic_url = config.PIC_URL;
        $scope.api_url = config.API_URL;
        $scope.authorization = 'bearer '+ $cookies.get('accessToken');
        $rootScope.isRestoreDialogOpen = false;
        $scope.boolShowAddContact = true;
        $scope.translationText = {};
        $scope.NAS_INFO = {};
        $scope.searchCriteriaSettings = {
            smartButtonMaxItems: 2,
            buttonClasses: 'search-criteria-btn'
        };
        $scope.supportedLanguages = [
            {lang_code: "en-US", nas_lang:"ENG", lang_name: "English"},
            {lang_code: "zh_TW", nas_lang:"TCH", lang_name: "繁體中文"},
            {lang_code: "zh_CH", nas_lang:"SCH", lang_name: "简体中文"},
            {lang_code: "cs_CZ", nas_lang:"CZE", lang_name: "Czech"},
            {lang_code: "nl_NL", nas_lang:"DUT", lang_name: "Nederlands"},
            {lang_code: "es_ES", nas_lang:"SPA", lang_name: "Español"},
            {lang_code: "sv_SE", nas_lang:"SWE", lang_name: "Svenska"},
            {lang_code: "tr_TR", nas_lang:"TUR", lang_name: "Turk dili"},
            {lang_code: "fr_FR", nas_lang:"FRE", lang_name: "Français"},
            {lang_code: "it_IT", nas_lang:"ITA", lang_name: "Italiano"},
            {lang_code: "pl_PL", nas_lang:"POL", lang_name: "Polski"},
            {lang_code: "da_DA", nas_lang:"DAN", lang_name: "Dansk"},
            {lang_code: "su_SU", nas_lang:"FIN", lang_name: "Suomi"},
            {lang_code: "de_DE", nas_lang:"GER", lang_name: "Deutsch"},
            {lang_code: "el_GR", nas_lang:"GRK", lang_name: "Ελληνικά"},
            {lang_code: "hr_HR", nas_lang:"HUN", lang_name: "Magyar"},
            {lang_code: "jp_JP", nas_lang:"JPN", lang_name: "日本語"},
            {lang_code: "kr_KR", nas_lang:"KOR", lang_name: "한글"},
            {lang_code: "nw_NW", nas_lang:"NOR", lang_name: "Norsk"},
            {lang_code: "pt_PT", nas_lang:"POR", lang_name: "Português"},
            {lang_code: "ro_RO", nas_lang:"ROM", lang_name: "Română"},
            {lang_code: "ru_RU", nas_lang:"RUS", lang_name: "Русский"},
            {lang_code: "th_TH", nas_lang:"THA", lang_name: "ไทย"}
        ];
        $scope.notifications = {};
        $scope.selectedContacts = [];
        
        $scope.menu = {};
        $scope.tasks = [];

        $scope.showSearchResult = false;
        $scope.showCreateGroup = false;
        $scope.forgotPassword = false;
        
        if ($rootScope.userDetails === undefined) {
            if ($cookies.get('user')) {
                $rootScope.userDetails = JSON.parse($cookies.get('user'));
            }
        }
        $scope.searchCriteriaModel = [];
        $scope.searchCriteria = [];

        $scope.$on('configChanged', function (event, Data) {
            User.setConfiguration($scope.userConfiguration, function (response, err) {
            });
        });

        $scope.$on('$viewContentLoaded', function() {
            $scope.searchString = '';
            $scope.translationText = { selectionOf: '/', checkAll: $filter('translate')('CHECK_ALL'), uncheckAll: $filter('translate')('UNCHECK_ALL') };
            $scope.searchCriteria = [
                {id: "name", label: $filter('translate')('NAME'), checked: false},
                {id: "emails", label: $filter('translate')('EMAIL'), checked: false},
                {id: "phones", label: $filter('translate')('PHONE'), checked: false},
                {id: "company_name", label: $filter('translate')('COMPANY'), checked: false},
                {id: "im", label: $filter('translate')('IM'), checked: false},
                {id: "addresses", label: $filter('translate')('ADDRESS'), checked: false},
                {id: "webpage", label: $filter('translate')('WEBPAGE'), checked: false},
                {id: "note", label: $filter('translate')('NOTE'), checked: false}
            ];

            if ($scope.searchCriteriaModel.length<1) {
                $scope.searchCriteriaModel = [
                    {id: "name", label: $filter('translate')('NAME'), checked: true},
                    {id: "emails", label: $filter('translate')('EMAIL'), checked: true}
                ];
            }
        });

        $rootScope.$on('restore_halted', function(event, response){         
            if($rootScope.isRestoreDialogOpen == false) {
                $rootScope.isRestoreDialogOpen = true;
                var snapshotId = response.data.data.snapshot_id,
                    restoreId = response.data.data._id;

                ngDialog.open({
                    template:'<div id="restore-confirmation">'
                        +'<div class="info-block">' 
                            +'<div>'
                                + '<span id="info-icon">IMG</span>'
                            +'</div>'
                            +'<div class="content">'
                                +'<div class=""><p>'+$filter('translate')('RESUME_RESTORE_MESSAGE_1')+'<p></div>'
                                +'<div class="info-data"><p>'+$filter('translate')('RESUME_RESTORE_MESSAGE_2')+'<p></div>'
                                +'<div class="create-snapshot">'
                                    +'<input type="checkbox"  ng-model="create_snapshot" ng-init="create_snapshot=true">'
                                    + $filter('translate')('AUTOMATIC_SNAPSHOT')
                                +'</div>'
                            +'</div>'                         
                        +'</div>'
                        +'<div class="confirm-buttons">'
                            + '<button class="apply" ng-click="restoreSnapshot(\''+snapshotId+'\', \''+restoreId+'\')">'+$filter('translate')('NEXT')+'</button>'
                        +'</div>'
                    +'</div>',
                    controller: 'SnapshotManagerCtrl',
                    className: 'ngdialog-theme-default custom-width-670',
                    closeByDocument: false,
                    plain: true,
                    closeByEscape: false,
                    showClose: false
                });    
            }            
        });
        
        $rootScope.$on('ngDialog.opened', function (e, $dialog) {
            $scope.makeDraggable();
        });

        $scope.getUserConfiguration = function () {
            User.getConfiguration(function (response, err) {
                $scope.userConfiguration = {
                    tutorial_displayed: false,
                    grid_column_selected: ['phones', 'company_name', 'im', 'sources', 'events'],
                    grid_config: {pagination:100},
                    language: 'en-US'
                };

                if (response.data.status_code == 10000) {
                    User.setConfiguration($scope.userConfiguration, function (response, err) {
                    });
                } else if (response.data.status) {
                    $scope.userConfiguration = response.data.data;
                    if ($scope.userConfiguration != undefined && $scope.userConfiguration.language) {
                        $translate.use($scope.userConfiguration.language);
                    }else if ($cookies.get('language_code')) {
                        $translate.use($cookies.get('language_code'));
                    } else if ($cookies.get('nas_lang')) {
                        var nas_lang = $cookies.get('nas_lang');
                        _.filter($scope.supportedLanguages, function (lang) {
                            if (lang.nas_lang == nas_lang) {
                                $cookies.put('language_code', lang.lang_code);
                                $translate.use(lang.lang_code);
                            }
                        });
                    } else {
                        $cookies.put('language_code', 'en-US');
                        $translate.use($cookies.get('language_code'));                        
                    }
                } else {
                    $cookies.put('language_code', 'en-US');
                    $translate.use($cookies.get('language_code'));
                }
            });
        };

        $scope.logout = function () {
            User.logout(function(response, err){
                if (response.data.data.status) {
                    $rootScope.userDetails = {};
                    $cookies.remove('user');
                    $cookies.remove('accessToken');
                    $cookies.remove('mcsqtoken');
                    $cookies.put('loggedout', true);
                    $location.path('/login');
                    $window.location.reload();
                }
            });
        };

        $scope.initSocket = function () {
            BackgroundTask = BackgroundTask.connect();
            BackgroundTask.on('task:error', function(data) {
            });
            
            BackgroundTask.on('disconnect', function() {
                if (!$scope.show_connection_error) {
                    $scope.show_connection_error = true;
                    if (!$scope.$$phase) $scope.$apply();
                    $scope.showNetworkError();
                }
            });

            BackgroundTask.on('connect_error', function(data) {
                if (!$scope.show_connection_error) {
                    $scope.show_connection_error = true;
                    if (!$scope.$$phase) $scope.$apply();
                    $scope.showNetworkError();
                }
            });

            BackgroundTask.on('connect', function() {
                if ($scope.show_connection_error) {
                    $scope.show_connection_error = false;
                    if (!$scope.$$phase) $scope.$apply();
                    $window.location.reload();
                }
            });

            BackgroundTask.on('task:progress', function(data) {
                var found = _.find($scope.tasks, function(task){
                    var status = false;
                    if(task._id == data._id){
                        status = true;
                        task.progress = data.progress.replace('%','');                    
                    }
                    return status;
                });
                if(data.progress == '100' || data.progress == '100%'){
                    $scope.tasks = _.filter($scope.tasks, function(task){
                        TaskNotification.getNotifications('read=false', function(response, err){
                            $scope.notifications = response.data.data;
                        });
                        if ( $( "#contact-grid" ).length ) {
                            $('#contact-grid').trigger('reloadGrid');
                        }
                        $scope.load_groups();
                        return task._id !== data._id;
                    });
                }
                if(typeof found == 'undefined' && data.progress != '100%'){
                    $scope.tasks.push(data);
                }
                if(!$scope.$$phase) $scope.$apply();
            });
            BackgroundTask.on('task:list', function(data) {
                $scope.tasks = data;
            });
            
            $scope.getNotifications();
        };
        
        $scope.showPreview = function (preview_id) {
            ngDialog.open({
                template: 'views/partials/show-preview.html',
                controller: 'PreviewCtrl',
                closeByDocument: false,
                className: 'ngdialog-theme-default custom-width-750',
                data: {preview_id: preview_id}
            });
        };
        
        $scope.changeLanguage = function (key) {
            $cookies.put('language_code', key);
            $translate.use(key);
            $scope.updateLanguageConfiguration(key);
            $window.location.reload();
        };

        $scope.updateLanguageConfiguration = function (lang_code) {
            $scope.userConfiguration.language = lang_code;
            $scope.$emit('configChanged', $scope.userConfiguration);
        };
        
        $scope.resetMenu = function () {
            $scope.menu.all = false;
            $scope.menu.frequently_used = false;
            $scope.menu.favorite = false;
            $scope.menu.private = false;
            $scope.menu.group = false;
            $scope.menu.more = false;
            $scope.menu.trash = false;
        };        
        
        $scope.clearAllNotifications = function () {
            var params = {
                action: "read",
                apply_all: true
            };
            TaskNotification.updateNotifications(params, function(response, err){
                $scope.getNotifications();
            });
        };

        $scope.getNotifications = function () {
            TaskNotification.getNotifications('read=false', function(response, err){
                $scope.notifications = response.data.data;
                $scope.authorization = 'bearer '+$cookies.get('accessToken');
            });
        };
        
        $scope.showNetworkError = function() {
            if (ngDialog.getOpenDialogs().length === 0) {
                ngDialog.open({
                    name: 'networkError',
                    template: 'views/partials/network-error.html',
                    controller: 'MainCtrl',
                    className: 'ngdialog-theme-default custom-width-550',
                    closeByDocument: false
                });
            }
        };

        $scope.showContacts = function (type) {
            $scope.resetMenu();
            switch (type) {
                case 'favorite':
                    $scope.menu.favorite = "selected";
                    break;
                case 'private':
                    $scope.menu.private = "selected";
                    break;
                case 'group':
                    $scope.menu.group = "selected";
                    break;
                case 'more':
                    $scope.menu.more = "selected";
                    break;
                case 'trash':
                    $scope.menu.trash = "selected";
                    break;
                case 'all':
                    $scope.menu.all = "selected";
                default:

            }
            if (type != 'group') {
                $('.sub-menu').removeClass('selected');
            }
        };
        
        $scope.openSnapshotManager = function() {
            ngDialog.open({
                template: 'views/snapshot-manager.html',
                controller: 'SnapshotManagerCtrl',
                className: 'ngdialog-theme-default snapshot-restore-dialog',
                closeByDocument: false
            });
        };

        $scope.openPrivate = function () {
            if($location.path().indexOf('contacts/private') > -1)
                return;
            Private.getSecurityQuestionSetByUser(function (response, err) {
                if (response.data.data && response.data.data.data && response.data.data.data != '') {
                    ngDialog.open({
                        template: 'views/high-security-password.html',
                        controller: 'MainCtrl',
                        className: 'ngdialog-theme-default custom-width-550',
                        closeByDocument: false
                    });
                } else {
                    ngDialog.open({
                        template: 'views/high-security-question.html',
                        controller: 'MainCtrl',
                        className: 'ngdialog-theme-default custom-width-550',
                        closeByDocument: false
                    });
                }
            });
        };

        $scope.isUserLoggedIn = function () {
            if ($cookies.get('accessToken') != undefined) {
                var userToken = $cookies.get('accessToken');
                User.validate(function (response, err) {
                    if (response.data.status == false) {
                        $scope.is_login_page = true;
                        $location.path('/login');
                    } else {
                        $scope.is_login_page = false;
                    }
                });
            } else {
                $scope.is_login_page = true;
                $location.path('/login');
            }
        };

        $scope.redirectPath = function (type, url) {
            $scope.showContacts(type);
            $location.path(url);
        };
        
        $scope.redirectGroup = function (type, url, group_id) {
            $scope.showContacts(type);
            $location.path(url);
            $('.sub-menu').removeClass('selected');
            $('#group_menu_'+group_id).addClass('selected');
            $('.icon-ic_submenu_close_normal').addClass('icon-ic_submenu_close_active');
            $('.icon-ic_submenu_close_normal').removeClass('icon-ic_submenu_close_normal');
        };
        
        $scope.redirectMoreOptions = function (type, url, more_option) {
            $scope.showContacts(type);
            $location.path(url);
            $('.sub-menu').removeClass('selected');
            $('#'+more_option).addClass('selected');
            $('.icon-ic_submenu_close_normal').addClass('icon-ic_submenu_close_active');
            $('.icon-ic_submenu_close_normal').removeClass('icon-ic_submenu_close_normal');
        };

        $scope.openAbout = function () {
            var nasConfig = $cookies.get('NAS_Details') ? JSON.parse($cookies.get('NAS_Details')) : {};
            ngDialog.open({
                template: 'views/about.html',
                className: 'ngdialog-theme-default custom-width-360',
                closeByDocument: false,
                scope: $scope
            });
        };

        $scope.openHelp = function () {
            ngDialog.open({
                template: 'views/help.html',
                className: 'ngdialog-theme-default custom-width-900',
                closeByDocument: false
            });
        };

        $scope.openResetHighSecurityPassword = function (checkFlag, callback) {
            Private.getSecurityQuestionSetByUser(function (response, err) {
                if (response.data.data && response.data.data.data && response.data.data.data != '') {
                    if(!checkFlag){
                        ngDialog.open({
                            template: 'views/reset-high-security-password.html',
                            controller: 'MainCtrl',
                            closeByDocument: false,
                            data: response.data.data
                        });
                    }
                    if(typeof callback == 'function')
                        callback(true);
                } else {
                    ngDialog.open({
                        template: 'views/high-security-question.html',
                        controller: 'MainCtrl',
                        className: 'ngdialog-theme-default custom-width-550',
                        closeByDocument: false
                    });
                    if(typeof callback == 'function')
                        callback(false);
                }
            });
        };

        $scope.loadSecurityQuestions = function () {
            Private.getSecurityQuestion(function (response, err) {
                $scope.questionList = response.data.data;
                $scope.security = {};
            });
        };

        $scope.setSecurityPassword = function (setSecurityForm, security) {
            $scope.$broadcast('runCustomValidations');
            if (setSecurityForm.$valid) {
                var data = {};
                data.high_security_password = SID.ezEncode(security.high_security_password);
                data.security_question = security.security_question;
                data.security_answer = security.security_answer;

                if (security.custom_question != undefined && security.security_question == 'custom_question') {
                    data.security_question = security.custom_question;
                }

                Private.setHighSecurityPassword(data, function (response, err) {
                    if (response.data.status_code == 10001) {
                        $scope.closeThisDialog('success');
                        toasty.success({                    
                            msg: $filter('translate')('HIGH_SECURITY_PASSWORD_SET_SUCCESS')
                        });

                    } else if (response.data.status_code == 10008) {
                        toasty.error({                    
                            msg: $filter('translate')('HIGH_SECURITY_PASSWORD_EMPTY_WARNING')
                        });                            
                    }
                });
            }
        };

        $scope.verifyPassword = function (verifyPasswordForm, security) {
            $scope.$broadcast('runCustomValidations');
            if (verifyPasswordForm.$valid) {
                security.high_security_password = SID.ezEncode(security.high_security_password);
                Private.getSecondaryToken(security, function (response, err) {
                    if (response.data.status) {
                        var secondary_token = response.data.data.secondary_token;
                        $http.defaults.headers.common['Highsecurity'] = 'Bearer ' + secondary_token;
                        $cookies.put('secondaryToken', 'Bearer ' + secondary_token);

                        ngDialog.close();
                        $location.path("contacts/private");
                    } else {
                        security.high_security_password = "";
                        toasty.error({                    
                            msg: $filter('translate')('WRONG_HIGH_SECURITY_PASSWORD')
                        });                        
                    }
                });
            }
        };

        $scope.showExportOption = function() {
            ngDialog.open({
                template: 'views/export.html',
                controller: 'ExportCtrl',
                scope: $scope,
                className: 'ngdialog-theme-default custom-width-550',
                closeByDocument: false
            });
        };

        $scope.resetHighSecurityPassword = function (resetHighSecurityPasswordForm, security) {
            $scope.$broadcast('runCustomValidations');
            if (resetHighSecurityPasswordForm.$valid) {
                var data = {};
                if (security.old_high_security_password != undefined) {
                    data.old_high_security_password = SID.ezEncode(security.old_high_security_password);
                } else {
                    data.security_question = security.security_question;
                    data.security_answer = security.security_answer;
                }
                data.new_high_security_password = SID.ezEncode(security.new_high_security_password);

                Private.resetHighSecurityPassword(data, function (response, err) {
                    if (response.data.status_code == 10001) {
                        ngDialog.close();
                        toasty.success({                    
                            msg: $filter('translate')('HIGH_SECURITY_PASSWORD_CHANGED_SUCCESS')
                        });                            
                    } else {
                        toasty.error({                    
                            msg: $filter('translate')('WRONG_HIGH_SECURITY_PASSWORD')
                        });                             
                    }
                });
            }
        };

        $rootScope.$on('load_groups', function (event) {
            $scope.load_groups();
        });

        $scope.load_groups = function () {
            Group.getGroups('full=true', function (response) {
                if (response.data.status) {
                    $scope.groups = response.data.data.data;
                    $scope.system_groups = {};
                    _.filter(response.data.data.system_groups, function(group){
                        switch (group.name) {
                            case 'ALL_CONTACTS':
                                $scope.system_groups.all_contacts = group.contacts_count;
                                break;
                            case 'FREQUENTLY_USED':
                                $scope.system_groups.frequently_used = group.contacts_count;
                                break;
                            case 'FAVORITES':
                                $scope.system_groups.favorites = group.contacts_count;
                                break;
                            case 'PRIVATE':
                                $scope.system_groups.private = group.contacts_count;
                                break;
                            case 'TRASH':
                                $scope.system_groups.trash = group.contacts_count;
                                break;
                        }
                    });
                } else {
                    $scope.groups = [];
                    $scope.system_groups = {
                        all_contacts: 0,
                        frequently_used: 0,
                        favorites: 0,
                        private: 0,
                        trash: 0
                    };
                }
                $scope.show_create_contact = ($scope.system_groups.all_contacts > 0) ? false : true;
            });
        };

        $scope.doForgotPassword = function(value) {
            $scope.forgotPassword = value;
        };

        $scope.createGroup = function (group) {
            if (group && group.name != '') {
                Group.createGroup(group, function(response, err){
                    if (response.data.status) {
                        group.name = '';
                        $scope.load_groups();
                    } else {
                        if (response.data.status_code == '10050') {
                            toasty.error({                    
                                msg: $filter('translate')('ERR_GROUP_EXIST')
                            });
                        }
                    }
                });
            }
        };

        $scope.editGroup = function(group, groupId){
            var oldName = $('#group_name_span').text();
            if (group && group.name != '') {
                Group.updateGroup(groupId, group, function(response, err){
                    if (response.data.status) {
                        $scope.load_groups();
                        $('#group_name_text').val(group.name);
                        $('#group_name_span').text(group.name);
                    } else {
                        if (response.data.status_code == '10050') {
                            $('#group_name_span').text(oldName);
                            $('#group_name_text').val(oldName);
                            toasty.error({                    
                                msg: $filter('translate')('ERR_GROUP_EXIST')
                            });
                        }
                    }
                });
            } else {
                $('#group_name_text').val(oldName);
            }
        };

        $scope.deleteGroup = function(groupId){
            ngDialog.openConfirm({
                template:
                        '<p>' + $filter('translate')('CONFIRM_DELETE_GROUP') + '</p>' +
                        '<footer><div class="confirm-buttons">' +
                        '<button type="button" class="mycontacts-btn" ng-click="confirm(1)">' + $filter('translate')('CONFIRM') + '</button>&nbsp;&nbsp;&nbsp;' +
                        '<button type="button" class="cancel" ng-click="closeThisDialog(0)">' + $filter('translate')('CANCEL') +
                        '</button></div></footer>',

                plain: true,
                className: 'ngdialog-theme-default'
            }).then(function (value) {
                Group.deleteGroup(groupId, function (response, err) {
                    if (response.data.status) {
                        $scope.load_groups();
                        $location.path('/contacts');
                    }
                });
            });
        };
        
        $scope.cleanUpSearch = function (search) {
            if (search && search.s == '') {
                $('.search-result').hide();
            } else {
                $('.search-result').show();
            }
        };

        $scope.doSearch = function(search) {
            $('.search-result').show();
            var searchKeyword = encodeURIComponent(search.s);
            var params = 's='+searchKeyword;
            if ($scope.searchCriteriaModel.length > 0) {
                params = params + '&search_in_fields=';
                $scope.searchCriteriaModel.forEach(function(field){
                    if (field.id == 'name') {
                        params = params + 'fname,mname,lname,'
                    } else {
                        params = params+field.id+',';
                    }
                });
                params = params.slice(0, -1);
            }

            $scope.searchedContacts = [];
            if (search.s != '') {
                Contact.searchContacts(params, function(response, err){
                    if (response.data.data.data.length > 0) {
                        $scope.searchedContacts = response.data.data.data;
                    }
                });
            }
        };
        
        $scope.openUserManagement = function() {
            ngDialog.open({
                template: 'views/user-management.html',
                controller: 'UserManagementCtrl',
                className: 'ngdialog-theme-default custom-width-670',
                closeByDocument: false
            });
        };
        
        $scope.openEditProfile = function() {
            $scope.edit_user = true;
            
            ngDialog.open({
                template: 'views/edit-profile.html',
                controller: 'UserManagementCtrl',
                scope: $scope,
                closeByDocument: false
            });
        };
        
        $scope.closeSearch = function () {
            if ($('#search-btn').hasClass('icon-framset_search_on')) {
                $('#search-string').val('');
                $('#search-inputs').slideToggle("fast");
                $('#search-inputs').css('display', 'none');
                $('#search-btn').removeClass('icon-framset_search_on');
                $('#search-btn  ').addClass('icon-framset_search_active');
                $('#search_string').val('');
            }
        };
        
        $scope.applyFilter = function(search) {
            if ($('#search-inputs').css('display') == 'none') {
                $('#search-inputs').slideToggle("fast");
                $('#search-inputs').css('display', 'inline-block');
                $('.icon-framset_search_active').addClass('icon-framset_search_on');
                $('.icon-framset_search_active').removeClass('icon-framset_search_active');
                $('#search_string').focus();
            } else {
                if (search && search.s != '') {
                    $scope.searchString = (search!=undefined) ? search.s : '';
                    $location.path('contacts/search/'+encodeURIComponent(search.s));
                }
            }
        };

        $scope.openNASFileChooser = function (type, multiselect, folderSelect) {
            var type = (type != undefined) ? type : null;
            var multiselect = (multiselect != undefined) ? multiselect : true;
            var folderSelect = (folderSelect != undefined) ? folderSelect : false;

            ngDialog.open({
                template: 'views/partials/nas-file-chooser.html',
                controller: 'FileBrowserCtrl',
                className: 'ngdialog-theme-default custom-width-900',
                closeByDocument: false,
                data: {type: type, multiselect: multiselect, folderSelect: folderSelect}
            });
        };
        
        $scope.makeDraggable = function () {
            var startX = 0, startY = 0, x = 0, y = 0;
            var mousemove = function (event) {
                y = event.screenY - startY;
                x = event.screenX - startX;
                $('.ngdialog-content').css({
                    top: y + 'px',
                    left:  x + 'px'
                });
            };

            var mouseup = function () {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
                $('.ngdialog-content').css('opacity', '1');
            };
            
            $('.ngdialog-content header').on('mousedown', function(event) {
                event.preventDefault();
                startX = event.screenX - x;
                startY = event.screenY - y;
                $('.ngdialog-content').css('opacity', '0.25');
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });
        };
        
        $scope.scrollToTextHelpPage = function (idToScroll, idToAddClass) {
            var container = document.getElementById('helpcontent');
            var rowToScrollTo = document.getElementById(idToScroll);
            container.scrollTop = rowToScrollTo.offsetTop;

            $('#option_name_p1_overview').removeClass("selected");
            $('#option_name_sys_requir').removeClass("selected");
            $('#option_name_import_contact').removeClass("selected");
            $('#option_name_export').removeClass("selected");
            $('#option_name_manage').removeClass("selected");
            $('#option_name_sendmail').removeClass("selected");
            $('#' + idToAddClass).addClass("selected");
        };
        
        $scope.setUserDetails = function(userData, callback){
            $cookies.put('accessToken', userData.token);
            User.getLoggedInUserDetails(function(response, err){
                if(response.data && response.data.status){
                    var user_details = response.data.data;
                    $rootScope.userDetails = {};
                    $rootScope.userDetails.name = (user_details.fname || '') + ' ' + (user_details.lname || '');
                    $rootScope.userDetails.username = user_details.username || '';
                    $rootScope.userDetails.role = user_details.role || 'user';
                    $rootScope.userDetails.is_nas_user = user_details.is_nas_user || false;
                    $rootScope.userDetails.is_tutorial_displayed = user_details.is_tutorial_displayed || false;
                    $rootScope.userDetails.sid = userData.sid || '';

                    $cookies.put('user', angular.toJson($rootScope.userDetails));

                    $scope.is_login_page = false;

                    $scope.qtoken = {qtoken: response.data.data.qtoken, username: response.data.data.username};
                    $cookies.put('mcsqtoken', angular.toJson($scope.qtoken));
                    $scope.authorization = 'bearer '+ $cookies.get('accessToken');
                    $scope.initSocket();
                    $scope.getUserConfiguration();
                    checkTutorialDiscplayed();
                    callback(true);
                } else {
                    callback(false);
                }
            });
        };

        $scope.getUpdatedNasConfig = function(forceUpdate, callback){
            var nasConfig = $scope.NAS_INFO = $cookies.get('NAS_Details') ? JSON.parse($cookies.get('NAS_Details')) : "";
            if(!nasConfig || forceUpdate){
                User.getNASDetails(function (response, err) {
                    if(response.data && response.data.status){
                        $cookies.put('NAS_Details', angular.toJson(response.data.data));
                        $scope.NAS_INFO = response.data.data;
                        if (!$scope.$$phase) $scope.$apply();
                        callback(true);
                    } else {
                        callback(false);    
                    }                    
                });
            } else 
                callback(true);
        };

        var checkTutorialDiscplayed = function(){
            if (!$rootScope.userDetails.is_tutorial_displayed) {
                ngDialog.open({
                    template: 'views/partials/introduction-tutorial.html',
                    className: 'ngdialog-theme-default custom-width-900',
                    closeByDocument: false,
                    scope: $scope
                });
                User.setTutorialDisplay({is_tutorial_displayed:true}, function(response, err){
                    if (response.data.status) {
                        $rootScope.userDetails.is_tutorial_displayed = true;
                        $cookies.put('user', angular.toJson($rootScope.userDetails));
                    }
                });
            }
        };

        var init = function(){
            $scope.load_groups();
            $scope.showContacts('all');
            $scope.getUpdatedNasConfig(false, function(){});            
        }; 
        
        var checkUserSession = function(callback){
            if ($cookies.get('user') && $cookies.get('accessToken')) {
                $scope.is_login_page = false;                
                $rootScope.userDetails = JSON.parse($cookies.get('user'));
                $scope.authorization = 'bearer '+ $cookies.get('accessToken');
                $scope.qtoken = $cookies.get('mcsqtoken') ? JSON.parse($cookies.get('mcsqtoken')) : {};
                $scope.initSocket();
                $scope.getUserConfiguration();
                checkTutorialDiscplayed();
                callback(true);
            } else {
                var qtoken = ($cookies.get('mcsqtoken')) ? JSON.parse($cookies.get('mcsqtoken')) : '';
                var nas_sid = $cookies.get('NAS_SID');
                var nas_user = $cookies.get('NAS_USER');
                var loggedout = $cookies.get('loggedout');

                if (qtoken && !loggedout) {
                    User.authenticate({username: qtoken.username,  qtoken: qtoken.qtoken, keep_me_signedin: true}, function (response, err) {
                        if (response.data.status == true && response.data.data.authPassed == 1) {
                            $cookies.remove('loggedout');
                            $scope.is_login_page = false;
                            $scope.setUserDetails(response.data.data);
                            callback(true);
                        } else
                            callback(false);
                    });
                } else if (nas_sid && nas_user && !loggedout) {
                    User.authenticate({username: nas_user, sid: nas_sid}, function (response, err) {
                        if (response.data.status == true && response.data.data.authPassed == 1) {
                            $scope.is_login_page = false;
                            $scope.setUserDetails(response.data.data);
                            callback(true);
                        } else 
                            callback(false);
                    });
                } else
                    callback(false);
            }
        };

        checkUserSession(function(status, loadSocket){
            if(status){
                init();
                var path = $location.path();
                if(path =='' || path == '/' || path == '/#' || path.indexOf('login') != -1)
                    $location.path('/contacts');
            } else {
                $location.path('/login');
            }            
        });

        $scope.redirectToContactPageOrNot = function () {
            var path = $location.$$path;
            if (path != "/sync")
                $location.path('/contacts');
            ngDialog.close();
        };
    }]);