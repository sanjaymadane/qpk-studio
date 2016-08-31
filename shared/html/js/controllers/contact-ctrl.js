'use strict';

app.controller('ContactCtrl', ['$scope', 'Contact', '$log', '$routeParams', 'Group', '$cookies', '$compile', '$location', 'ngDialog', 'Private', '$document', 'usSpinnerService', '$filter', 'toasty', '$rootScope', 'CGI',
    function ($scope, Contact, $log, $routeParams, Group, $cookies, $compile, $location, ngDialog, Private, $document, usSpinnerService, $filter, toasty, $rootScope, CGI) {
        $scope.duplicateTotalItems = 0;
        $scope.duplicateCurrentPage = 1;
        $scope.mergeTotalItems = 0;
        $scope.mergeCurrentPage = 1;
        $scope.duplicateItemsPerPage = duplicates.itemsPerPage;
        $scope.duplicateMaxSize = duplicates.maxSize;
        $scope.duplicatesNumPages = Math.ceil(200 / duplicates.itemsPerPage);
        $scope.boolShowAddContact = false;
        $scope.$parent.is_login_page = false;
        $scope.grid_heading = $filter('translate')('ALL_CONTACTS');
        $scope.userData = {
            is_active: true,
            sortby: 'fname'
        };
        $scope.paginationDetails = "";
        $scope.paginationCurrentPage = 1;
        $scope.paginationTotalPages = 0;
        $scope.paginationDisplayItem = "";

        $scope.paginationDetailsMerge = "";
        $scope.paginationCurrentPageMerge = 1;
        $scope.paginationTotalPagesMerge = 0;
        $scope.paginationDisplayItemMerge = "";

        $scope.pagination = {};
        $scope.pagination.limit = "50";
        $scope.pagination.limitmerge = "50";
        // Binding scope for grid usage
        $scope.boxShow = false;
        $scope.show_filter = false;
        $scope.show_sort = false;
        $scope.contact = Contact;
        $scope.location = $location;
        $scope.disable_batch_update = true;
        $scope.disable_merge_batch_update = true;
        $scope.totalContacts = 0;
        $scope.base_url = config.BASE_URL;
        $scope.pic_url = config.PIC_URL;
        $scope.mergeContact = [];
        $scope.unmergeContact = [];

        $scope.getUserConfiguration();

        $('.merge-data-content main').height($( window ).height()-200);
        $( window ).resize(function() {
          $('.merge-data-content main').height($( window ).height()-200);          
        });
        $scope.$watch('selectedRows', function (newValue, oldValue) {
            if (newValue && newValue.length > 0) {
                $scope.disable_batch_update = false;
                $scope.$parent.selectedContacts = newValue;
            } else {
                $scope.disable_batch_update = true;
                $scope.$parent.selectedContacts = [];
            }

            if (newValue && newValue.length > 1) {
                $scope.disable_merge_batch_update = false;
                $scope.$parent.selectedContacts = newValue;
            } else {
                $scope.disable_merge_batch_update = true;
                $scope.$parent.selectedContacts = newValue;
            }
        });
        $scope.viewContact = function(id){
            ngDialog.open({
                template: 'views/partials/view-contact.html',
                controller: 'ViewContactCtrl',
                resolve: {
                    contact_id: function() {
                        return id;
                    }
                },
                className: 'ngdialog-theme-default custom-width-550',
                closeByDocument: false
            });
        };
        $scope.closeGroupsDiv = function () {
            $scope.show_group = false;
            $scope.showCreateGroup = false;
            if (!$scope.$$phase)
                $scope.$apply();
        };
        $scope.selectedGroups = {
            checked: [],
            unchecked: []
        };
        $scope.is_trash = ($routeParams.type == 'trash') ? true : false;
        $scope.userData.group_id = ($routeParams.type == 'group') ? $routeParams.group_id : "";
        if ($routeParams.type == 'group') {
            Group.getGroup($routeParams.group_id, function (response, err) {
                $scope.userData.group_name = response.data.data.name;
            });
        }

        switch ($routeParams.type) {
            case 'frequently-used':
                $scope.resetMenu();
                $scope.grid_heading = $filter('translate')('FREQUENTLY_USED');
                $scope.menu.frequently_used = "selected";
                $scope.userData.sortby = 'usage';
                break;
            case 'favorite':
                $scope.resetMenu();
                $scope.grid_heading = $filter('translate')('FAVORITES');
                $scope.menu.favorite = "selected";
                $scope.userData.is_favorite = true;
                break;
            case 'private':
                $scope.resetMenu();
                $scope.grid_heading = $filter('translate')('PRIVATE');
                $scope.menu.private = "selected";
                $scope.userData.is_locked = true;
                break;
            case 'trash':
                $scope.resetMenu();
                $scope.grid_heading = $filter('translate')('TRASH');
                $scope.menu.trash = "selected";
                $scope.userData.is_active = false;
                break;
            case 'group':
                break;
            default:

        }
        $scope.sortGrid = function (field) {
            $scope.userData.sortby = field;
            $('#contact-grid').trigger('reloadGrid');
        };
        $scope.onSelectGroup = function ($event, groupId) {
            var checkbox = $event.target;
            if (groupId) {
                if (checkbox.checked) {
                    $scope.selectedGroups.checked.push({'group_id': groupId});
                    $scope.selectedGroups.unchecked = _.filter($scope.selectedGroups.unchecked, function (group) {
                        return !(group.group_id == groupId);
                    });
                } else {
                    $scope.selectedGroups.unchecked.push({'group_id': groupId});
                    $scope.selectedGroups.checked = _.filter($scope.selectedGroups.checked, function (group) {
                        return !(group.group_id == groupId);
                    });
                }
            }
            $scope.show_group = true;
        };
        $scope.onSelectRow = function (scope, action, params, id) {
            switch (action) {
                case 'sendQMail':
                    var selectedEmail = '';
                    selectedEmail = $('#email_' + id).text();
                    $scope.composeQMail(selectedEmail);
                    break;
                case 'edit':
                    scope.viewContact(id);
                    //scope.location.path('/contacts/edit/' + id);
                    if (!scope.$$phase)
                        scope.$apply();
                    break;
                case 'delete':
                case 'favorite':
                case 'private':
                    var self = this;
                    scope.contact.updateContacts(id, params, function (response) {
                        if (action == 'private' || $scope.userData.is_favorite == true) {
                            $('#contact-grid').trigger('reloadGrid');
                        } else {
                            if (response.data.status) {
                                if (params.is_favorite == true) {
                                    $('[data-id="favorite_' + id + '"]').removeClass('icon-favorite').addClass('icon-favorite-active');
                                    $('[data-id="favorite_' + id + '"]').removeClass('false').addClass('true');
                                    $('[data-id="favorite_' + id + '"]').attr('title', $filter('translate')('MAKE_UNFAVORITE'));
                                } else {
                                    $('[data-id="favorite_' + id + '"]').removeClass('true').addClass('false');
                                    $('[data-id="favorite_' + id + '"]').removeClass('icon-favorite-active').addClass('icon-favorite');
                                    $('[data-id="favorite_' + id + '"]').attr('title', $filter('translate')('MAKE_FAVORITE'));
                                }
                            }
                            $scope.load_groups();
                        }
                    });
                    break;
            }
        };

        $scope.setConfiguration = function(){
            if ($scope.userConfiguration != undefined) {
                $('#contact-grid').jqGrid('hideCol', ['phones', 'company_name', 'im', 'sources', 'events']);
                $('#contact-grid').jqGrid('showCol', $scope.userConfiguration.grid_column_selected);
            }
        };

        $scope.updatePaginationConfiguration = function (config) {
            $scope.userConfiguration.grid_config = config;
            $scope.$emit('configChanged', $scope.userConfiguration);
        };

        $scope.set_groups_menu = function () {
            if ($scope.userData.group_id) {
                setTimeout(function () {
                    $('.sub-menu').removeClass('selected');
                    $('#group_menu_' + $scope.userData.group_id).addClass('selected');
                }, 1);
            }
        };

        $scope.countryDialCodeWithCSSClass = config.COUNTRY_FLAGS;
        var gridUrl = ($routeParams.type == 'search') ? 'contacts/search' : 'contacts';
        $scope.config = {
            datatype: 'json',
            ajaxGridOptions: {contentType: "application/json", cache: false},
            url: config.API_URL + gridUrl,
            loadBeforeSend: function (jqXHR) {
                jqXHR.setRequestHeader('Authorization', 'bearer ' + $cookies.get('accessToken'));
                jqXHR.setRequestHeader('Highsecurity', $cookies.get('secondaryToken'));
            },
            userdata: $scope.userData,
            id: '_id',
            colNames: ['id', '', '', $filter('translate')('NAME'), $filter('translate')('EMAIL'), $filter('translate')('PHONE'), $filter('translate')('COMPANY'), $filter('translate')('IM'), $filter('translate')('SOURCE'), $filter('translate')('EVENTS'), $filter('translate')('DELETED_ON')],
            colModel: [
                {name: '_id', index: '_id', hidden: true, frozen: true, },
                {
                    name: 'actions',
                    index: 'actions',
                    resizable: false,
                    frozen: true,
                    'width': 30,
                    align: 'center',
                    formatter: function (cellvalue, options, rowObject) {
                        var html = "";
                        if (rowObject.is_favorite)
                            html += '<span data-id="favorite_' + rowObject._id + '" title="' + $filter('translate')('MAKE_UNFAVORITE') + '" class="icon-favorite-active action-toolbar favorite ' + rowObject.is_favorite + '"></span>';
                        else
                            html += '<span data-id="favorite_' + rowObject._id + '" title="' + $filter('translate')('MAKE_FAVORITE') + '" class="icon-favorite action-toolbar favorite ' + rowObject.is_favorite + '"></span>';
                        $compile(angular.element(html))($scope);
                        return html;
                    }
                },
                {
                    name: 'profile_pic',
                    index: 'profile_pic',
                    resizable: false,
                    frozen: true,
                    align: 'center',
                    width: 50,
                    formatter: function (cellvalue, options, rowObject) {
                        var profile_pic_url = config.PIC_URL + cellvalue + '?v=' + Math.random();
                        if (cellvalue)
                            return '<img class="profile-pic edit" src="' + profile_pic_url + '"/>';
                        else
                            return "";
                    }
                },
                {
                    name: 'fname',
                    index: 'fname',
                    sortable: false,
                    resizable: false,
                    frozen: true,
                    width: 200,
                    formatter: function (cellvalue, options, rowObject) {
                        var contact_name = '';
                        var fname = (rowObject.fname != undefined) ? rowObject.fname : '';
                        var mname = (rowObject.mname != undefined) ? rowObject.mname : '';
                        var lname = (rowObject.lname != undefined) ? rowObject.lname : '';
                        var nickname = (rowObject.nickname != undefined) ? rowObject.nickname : '';

                        if (fname != '' || lname != '') {
                            if ($scope.userData.sortby == undefined || $scope.userData.sortby == 'fname') {
                                contact_name = fname + ' ' + lname;
                            } else if ($scope.userData.sortby == 'lname') {
                                contact_name = lname + ' ' + fname;
                            } else if ($scope.userData.sortby == 'usage') {
                                contact_name = fname + ' ' + lname;
                            }
                        } else if (mname != '') {
                            contact_name = mname;
                        } else if (nickname != '') {
                            contact_name = nickname;
                        } else {
                            contact_name = '[unnamed]';
                        }

                        return '<div class="edit contact-grid-column-padding">' + _.escape(contact_name) + '<div>';
                    }
                },
                {
                    name: 'emails', index: 'emails', frozen: true, title: false, resizable: false, sortable: false, width: 250,
                    formatter: function (cellvalue, options, rowObject) {
                        if (cellvalue && cellvalue.length > 1) {
                            var cellstring = '';
                            var primary_set = false;
                            cellvalue.forEach(function (q) {
                                if (q.is_primary) {
                                    primary_set = true;
                                }
                            });
                            cellvalue.forEach(function (q) {
                                var is_primary = (q.is_primary != undefined) ? q.is_primary : false;
                                var email = (q.value != undefined) ? q.value : '';
                                var emailType = (q.label != undefined) ? q.label : '';
                                if (primary_set && is_primary && cellstring == '') {
                                    cellstring += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + email + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                                } else if (!primary_set && !is_primary && cellstring == '') {
                                    cellstring += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + email + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                                }
                            });
                            cellvalue.forEach(function (q) {
                                var is_primary = (q.is_primary != undefined) ? q.is_primary : false;
                                var email = (q.value != undefined) ? q.value : '';
                                var emailType = (q.label != undefined) ? q.label : '';
                                var user = ($cookies.get('user')) ? JSON.parse($cookies.get('user')) : {};
                                cellstring += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" onclick="sendQMail(`' + email + '`, `' + user.sid + '`);return false;">' + '<span id="email_' + rowObject._id + '" class="sendQMail">' + email + '</span>' + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(emailType) + '</span>' + '</a></li>';
                            });
                            cellstring += '</ul></div>';
                            return cellstring;
                        } else {
                            var email = (cellvalue.length > 0 && cellvalue[0].value != undefined) ? cellvalue[0].value : "";
                            return '<div id="email_' + rowObject._id + '" class="sendQMail contact-grid-column-padding">' + email + '</div>';
                        }
                    }
                },
                {
                    name: 'phones', index: 'phones', title: false, resizable: false, sortable: false, width: 250, formatter: function (cellvalue, options, rowObject) {

                        $scope.countryFlagCss = "";
                        function getCSSClassOnCountryCode(phones) {
                            $scope.countryFlagCss = $scope.countryDialCodeWithCSSClass[phones];
                            if (!$scope.countryFlagCss)
                                $scope.countryFlagCss = "flag";
                        }

                        if (cellvalue && cellvalue.length > 1) {
                            var cellstring = '';
                            var primary_set = false;
                            cellvalue.forEach(function (q) {
                                if (q.is_primary) {
                                    primary_set = true;
                                }
                            });

                            cellvalue.forEach(function (q) {
                                var is_primary = (q.is_primary != undefined) ? q.is_primary : false;
                                var phones = (q.value != undefined) ? q.value : '';
                                var phoneType = (q.label != undefined) ? q.label : '';
                                if (primary_set && is_primary && cellstring == '') {
                                    getCSSClassOnCountryCode(q.country_code);
                                    cellstring += '<div class="dropdown"><button id="phone_' + rowObject._id + '" class="btn btn-default dropdown-toggle contact-grid-phone-button"  data-toggle="dropdown">' + '<span class="' + $scope.countryFlagCss + '" />' + " " + phones + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                                } else if (!primary_set && !is_primary && cellstring == '') {
                                    getCSSClassOnCountryCode(q.country_code);
                                    cellstring += '<div class="dropdown"><button id="phone_' + rowObject._id + '" class="btn btn-default dropdown-toggle contact-grid-phone-button"  data-toggle="dropdown">' + '<span class="' + $scope.countryFlagCss + '" />' + " " + phones + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                                }
                            });
                            cellvalue.forEach(function (q) {
                                var is_primary = (q.is_primary != undefined) ? q.is_primary : false;
                                var phones = (q.value != undefined) ? q.value : '';
                                var phoneType = (q.label != undefined) ? q.label : '';
                                getCSSClassOnCountryCode(q.country_code);
                                cellstring += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)">' + '<span class="' + $scope.countryFlagCss + '" />' + " " + phones + '<span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(phoneType) + '</span>' + '</a></li>';

                            });
                            cellstring += '</ul></div>';
                            return cellstring;
                        } else {
                            var phone = "";

                            phone = (cellvalue.length > 0 && cellvalue[0].value != undefined) ? cellvalue[0].value : "";
                            if (phone != "") {
                                getCSSClassOnCountryCode(cellvalue[0].country_code);
                                phone = '<span class="contact-grid-column-padding" /><span class="' + $scope.countryFlagCss + '" />' + " " + phone;
                            }

                            return phone;
                        }
                    }
                },
                {
                    name: 'company_name', resizable: false, sortable: false, index: 'company_name', width: 250,
                    formatter: function (cellvalue, options, rowObject) {
                        if (cellvalue) {
                            return '<div class="contact-grid-column-padding">' + _.escape(cellvalue) + '</div>';
                        } else
                            return "";
                    }
                },
                {
                    name: 'im', sortable: false, resizable: false, index: 'im', width: 250, formatter: function (cellvalue, options, rowObject) {
                        var cellstring = "";
                        if (cellvalue && cellvalue.length > 1) {
                            cellstring += '<div class="dropdown"><button id="im_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(cellvalue[0].value) + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(cellvalue[0].label) + '</span>' + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            cellvalue.forEach(function (q) {
                                var im = (q.value != undefined) ? q.value : '';
                                var imType = (q.label != undefined) ? q.label : '';
                                if(im)
                                    cellstring += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="im_' + rowObject._id + '">' + im + '</span>' + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(imType) + '</span>' + '</a></li>';

                            });
                            cellstring += '</ul></div>';
                            return cellstring;
                        } else {
                            cellstring = (cellvalue.length > 0 && cellvalue[0].value != "") ? '<div class="dropdown"><div class="contact-grid-column-padding">' + cellvalue[0].value + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(cellvalue[0].label) + '</span>' + '</div></div>' : "";
                        }
                        return cellstring;
                    }
                },
                {
                    name: 'sources', resizable: false, sortable: false, index: 'sources', width: 250, formatter: function (cellvalue, options, rowObject) {
                        if (cellvalue && cellvalue.length > 0) {
                            var source = (cellvalue[0].value != undefined) ? cellvalue[0].value : '';
                            return '<span class="contact-grid-column-padding" />' + source;
                        } else
                            return "";
                    }
                },
                {
                    name: 'events', index: 'events', resizable: false, sortable: false, width: 250, formatter: function (cellvalue, options, rowObject) {
                        var eventsHTML = "";
                        var events = [];

                        if (cellvalue.length > 1) {
                            _.filter(cellvalue, function(event) {
                                if (event.value) {
                                    var label = event.label;
                                    var value = event.value;
                                    var obj = {label: label, value: value};
                                    events.push(obj);
                                }
                            });
                            if (events.length > 1) {
                                var default_d = new Date(events[0].value);
                                var default_date = default_d.getDate();
                                var default_month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][default_d.getMonth()];
                                var default_year = default_d.getFullYear();
                                eventsHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + [default_date, default_month, default_year].join('-') + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(events[0].label) + '</span>' + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                                events.forEach(function (q) {
                                    var d = new Date(q.value);
                                    var date = d.getDate();
                                    var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getMonth()];
                                    var year = d.getFullYear();
                                    eventsHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + [date, month, year].join('-') + '</span>' + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(q.label) + '</span>' + '</a></li>';

                                });
                                eventsHTML += '</ul></div>';
                            } else {
                                var d = new Date(cellvalue[0].value);
                                var date = d.getDate();
                                var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getMonth()];
                                var year = d.getFullYear();
                                eventsHTML = (cellvalue.length>0 && cellvalue[0].value) ? '<div class="dropdown"><div class="contact-grid-column-padding">' + [date, month, year].join('-') + ' <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(cellvalue[0].label) + '</span>' + '</div></div>' : "";
                            }
                        }
                        return eventsHTML;
                    }
                },
                {
                    name: 'updated_on', index: 'updated_on', resizable: false, sortable: false, width: 250, formatter: function (cellvalue, options, rowObject) {
                        var d = new Date(cellvalue);
                        var date = d.getDate();
                        var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getMonth()];
                        var year = d.getFullYear();
                        return [date, month, year].join('-');
                    }
                }
            ],
            scope: $scope,
            serializeGridData: function (postData) {
                var userData = $(this).getGridParam('userdata');
                if (typeof userData.is_active !== 'undefined')
                    postData.is_active = userData.is_active;
                if (typeof userData.is_favorite !== 'undefined')
                    postData.is_favorite = userData.is_favorite;
                if (typeof userData.is_locked !== 'undefined')
                    postData.is_locked = userData.is_locked;
                if (typeof $scope.userData.sortby !== 'undefined')
                    postData.sortby = $scope.userData.sortby;
                postData.group_id = userData.group_id;
                postData.limit = postData.rows;
                postData.page = postData.page - 1;
                postData.s = '';
                if ($routeParams.type == 'search') {
                    $('.group-info').hide();
                    $scope.resetMenu();
                    postData.is_private = false;
                    if ($scope.searchCriteriaModel.length > 0) {
                        postData.search_in_fields = '';
                        $scope.searchCriteriaModel.forEach(function (field) {
                            if (field.id == 'name') {
                                postData.search_in_fields = postData.search_in_fields + 'fname,mname,lname,'
                            } else {
                                postData.search_in_fields = postData.search_in_fields + field.id + ',';
                            }
                        });
                        postData.s = decodeURIComponent($routeParams.group_id);
                        postData.search_in_fields = postData.search_in_fields.slice(0, -1);
                    }
                }

                return postData;
            },
            multiselect: true,
            rowNum: ($scope.userConfiguration && $scope.userConfiguration.grid_config) ? $scope.userConfiguration.grid_config.pagination : 100,
            rowList: [50, 100, 200, 500],
            pageable: true,
            jsonReader: {
                root: 'data.data',
                rows: function (obj) {
                    return obj.data.data;
                },
                records: function (obj) {
                    if (obj.data.total < 1) {
                        if ($routeParams.type == undefined && $scope.searchString == '') {
                            $location.path('/default');
                        } else {
                            $(".grid-container").hide();
                            if ($routeParams.type === 'frequently-used') {
                                $(".no-frequently-used-contacts").show();
                                $scope.resetMenu();
                                $scope.menu.frequently_used = "selected";
                            }

                            if ($routeParams.type === 'favorite') {
                                $(".no-favorites").show();
                                $scope.resetMenu();
                                $scope.menu.favorite = "selected";
                            }

                            if ($routeParams.type === 'private') {
                                $(".no-privates").show();
                                $scope.resetMenu();
                                $scope.menu.private = "selected";
                            }

                            if ($routeParams.type === 'group') {
                                $(".empty-group").show();
                                $scope.resetMenu();
                                $scope.menu.group = "selected";
                            }

                            if ($routeParams.type === 'trash') {
                                $(".empty-trash").show();
                                $scope.resetMenu();
                                $scope.menu.trash = "selected";
                            }

                            if ($routeParams.type === 'search') {
                                $(".no-searched-contacts").show();
                            }

                            if ($routeParams.type === undefined) {
                                $location.path('/sync/true');
                            }
                        }
                    } else {
                        $(".grid-container").show();
                    }
                    $scope.totalContacts = obj.data.total;
                    return obj.data.total;
                },
                page: function (obj) {
                    return obj.data.page + 1;
                },
                total: function (obj) {
                    return parseInt(obj.data.pages);
                }
            },
            pager: '#pagercontact-grid'
        };
        $scope.hideShowGridColumn = function (index) {
            if ($('#column_' + index).is(":checked")) {
                $('#contact-grid').jqGrid('showCol', [index]);

                $scope.userConfiguration.grid_column_selected.push(index);
            } else {
                $('#contact-grid').jqGrid('hideCol', [index]);
                _.filter($scope.userConfiguration.grid_column_selected, function (col, i) {
                    if (col == index) {
                        $scope.userConfiguration.grid_column_selected.splice(i, 1);
                    }
                });
            }
            $scope.$emit('configChanged', $scope.userConfiguration);
            $scope.show_filter = true;
        };

        $scope.editContact = function (contact) {
            $location.path('/contacts/edit' + contact._id);
        };
        $scope.batchDelete = function () {
            var params = {
                "contact_ids": selectedRows.contactIds,
                "update_data": {
                    "is_active": false
                }
            };
            Contact.batchUpdateContacts(params, function (response, err) {
                if (response.data.status) {
                    $scope.loadContacts();
                }
            });
        };
        $scope.batchMergeDuplicate = function () {
            if ($scope.selectedRows.length > 1) {
                Contact.mergeDuplicates({ids: [$scope.selectedRows]}, function (response, err) {
                    if (response.data.status) {
                        $scope.load_groups();
                        $('#contact-grid').trigger('reloadGrid');
                    } else {
                        toasty.error({
                            msg: $filter('translate')('ERROR_MERGE')
                        });
                    }
                })
            } else {
                toasty.error({
                    msg: $filter('translate')('CONTACT_MERGE_VALIDATION')
                });
            }
        };
        $scope.batchFavorite = function () {
            var params = {
                "contact_ids": selectedRows.contactIds,
                "update_data": {
                    "is_favorite": true
                }
            };
            Contact.batchUpdateContacts(params, function (response, err) {
                if (response.data.status) {
                    $scope.loadContacts();
                }
            });
        };
        $scope.batchPrivate = function () {
            var params = {
                "contact_ids": selectedRows.contactIds,
                "update_data": {
                    "is_locked": true
                }
            };
            Contact.batchUpdateContacts(params, function (response, err) {
                if (response.data.status) {
                    $scope.loadContacts();
                }
            });
        };
        $scope.doFavorite = function (data) {
            var favTag = $("#favorite_" + data);
            var favResultedFlag = (favTag.attr("data-is-starred") == "true") ? false : true;
            var params = {"is_favorite": favResultedFlag};
            Contact.updateContacts(data, params, function (response, err) {
                if (response.data.status) {
                    if ($scope.favoriteReload) {
                        $scope.loadContacts();
                    } else {
                        if (favTag.attr("data-is-starred") == "true") {
                            favTag.removeClass('starred');
                        } else {
                            favTag.addClass('starred');
                        }
                        favTag.attr("data-is-starred", favResultedFlag);
                    }
                }
            });
        };
        $scope.sendQMail = function (element, previous) {
            $scope.composeQMail(element.val());
            element.val(previous);
        };
        $scope.doPrivate = function (data) {
            Private.getSecurityQuestionSetByUser(function (response, err) {
                if (response.data.data && response.data.data.data && response.data.data.data != '') {
                    var params = {"is_locked": true};
                    Contact.updateContacts(data, params, function (response, err) {
                        if (response.data.status) {
                            if ($scope.privateReload) {
                                $scope.loadContacts();
                            }
                        }
                    });
                } else {
                    ngDialog.open({
                        template: 'views/high-security-question.html',
                        controller: 'MainCtrl',
                        closeByDocument: false
                    });
                }
            });
        };
        $scope.permanentDelete = function (all_contacts) {
            if (!all_contacts) {
                if ($scope.selectedRows.length > 0) {
                    var perm_delete_message = $scope.selectedRows.length > 1 ? $filter('translate')('PERMANENT_DELETE_CONTACTS_WARNING') : $filter('translate')('PERMANENT_DELETE_CONTACT_WARNING');
                    ngDialog.openConfirm({
                        template:
                        '<p>' + perm_delete_message + '</p>' +
                        '<footer><div class="confirm-buttons">' +
                        '<button type="button" class="mycontacts-btn" ng-click="confirm(1)">' + $filter('translate')('CONFIRM') + '</button>&nbsp;&nbsp;&nbsp;' +
                        '<button type="button" class="cancel" ng-click="closeThisDialog(0)">' + $filter('translate')('CANCEL') +
                        '</button></div></footer>',
                        plain: true,
                        className: 'ngdialog-theme-default'
                    }).then(function (value) {
                        var params = {
                            contact_ids: $scope.selectedRows
                        };
                        Contact.deleteContacts(params, function (response, err) {
                            $('#contact-grid').trigger('reloadGrid');
                            $scope.load_groups();
                        });
                    });
                }
            } else {
                var perm_delete_all_message = $filter('translate')('PERMANENT_DELETE_ALL_CONTACTS_WARNING');
                ngDialog.openConfirm({
                    template:
                    '<p>' + perm_delete_all_message + '</p>' +
                    '<footer><div class="confirm-buttons">' +
                    '<button type="button" class="mycontacts-btn" ng-click="confirm(1)">' + $filter('translate')('CONFIRM') + '</button>&nbsp;&nbsp;&nbsp;' +
                    '<button type="button" class="cancel" ng-click="closeThisDialog(0)">' + $filter('translate')('CANCEL') +
                    '</button></div></footer>',
                    plain: true,
                    className: 'ngdialog-theme-default'
                }).then(function (value) {
                    var params = {
                        trash_only: true,
                        remove_all: true
                    };
                    Contact.deleteContacts(params, function (response, err) {
                        $('#contact-grid').trigger('reloadGrid');
                        $scope.load_groups();
                    });
                });
            }
        };
        $scope.batchProcess = function (action) {
            if ($scope.selectedRows.length > 0) {
                var params = {
                    "contact_ids": $scope.selectedRows,
                    "update_data": {}
                };
                switch (action) {
                    case 'sendQMail':
                        var selectedEmails = '';
                        params.contact_ids.forEach(function (value) {
                            if ($("#email_" + value).text()) {
                                if (selectedEmails != '') {
                                    selectedEmails = selectedEmails + ', ';
                                }
                                selectedEmails = selectedEmails + $("#email_" + value).text();
                            }
                        });
                        if (selectedEmails) {
                            $scope.composeQMail(selectedEmails);
                        } else {
                            toasty.error({
                                msg: $filter('translate')('EMAIL_NOT_AVAILABLE')
                            });
                        }
                        break;
                    case 'delete':
                        params.update_data.is_active = false;
                        break;
                    case 'favorite':
                        params.update_data.is_favorite = true;
                        break;
                    case 'unfavorite':
                        params.update_data.is_favorite = false;
                        break;
                    case 'private':
                        if ($routeParams.type == 'private') {
                            params.update_data.is_locked = false;
                        } else {
                            params.update_data.is_locked = true;
                        }
                        break;
                    case 'restore':
                        params.update_data.is_active = true;
                        break;
                    case 'addToGroup':
                        params.update_data.groups = $scope.selectedGroups;
                        break;
                }

                if (action != 'sendQMail') {
                    if (action == 'delete') {
                        var warning_message = '';
                        if($scope.selectedRows.length > 1){
                            if ($routeParams.type == 'private') {
                                warning_message = $filter('translate')('PRIVATE_CONTACTS_DELETE_WARNING');
                            } else {
                                warning_message = $filter('translate')('DELETE_CONTACTS_WARNING');
                            }
                        } else {
                            if ($routeParams.type == 'private') {
                                warning_message = $filter('translate')('PRIVATE_CONTACT_DELETE_WARNING');
                            } else {
                                warning_message = $filter('translate')('DELETE_CONTACT_WARNING');
                            }
                        }
                        ngDialog.openConfirm({
                            template:
                                    '<p>' + warning_message + '</p>' +
                                    '<footer><div class="confirm-buttons">' +
                                    '<button type="button" class="mycontacts-btn" ng-click="confirm(1)">' + $filter('translate')('CONFIRM') + '</button>&nbsp;&nbsp;&nbsp;' +
                                    '<button type="button" class="cancel" ng-click="closeThisDialog(0)">' + $filter('translate')('CANCEL') +
                                    '</button></div></footer>',
                            plain: true,
                            className: 'ngdialog-theme-default'
                        }).then(function (value) {
                            $scope.batchUpdateContacts(params, action);
                        });
                    } else if (action == 'private') {
                        Private.getSecurityQuestionSetByUser(function (response, err) {
                            if (response.data.data && response.data.data.data && response.data.data.data != '') {
                                $scope.batchUpdateContacts(params, action);
                            } else {
                                var dialog = ngDialog.open({
                                    template: 'views/high-security-question.html',
                                    controller: 'MainCtrl',
                                    className: 'ngdialog-theme-default custom-width-550',
                                    closeByDocument: false
                                });

                                dialog.closePromise.then(function (data) {
                                    if (data.value == 'success') {
                                        $scope.batchUpdateContacts(params, action);
                                    }
                                });
                            }
                        });
                    } else {
                        $scope.batchUpdateContacts(params, action);
                    }
                }
            }
        };
        $scope.batchUpdateContacts = function (params, action) {
            Contact.batchUpdateContacts(params, function (response, err) {
                if (action == 'private' || $scope.userData.is_favorite == true || action == 'delete' || action == 'restore') {
                    $('#contact-grid').trigger('reloadGrid');
                } else if ($routeParams.type == 'group' && action == 'addToGroup') {
                    $('#contact-grid').trigger('reloadGrid');
                } else if ($routeParams.type == 'group' && action == 'addToGroup') {
                    $('#contact-grid').trigger('reloadGrid');
                } else {
                    if (response.data.status) {
                        params.contact_ids.forEach(function (contact_id) {
                            if (params.update_data.is_favorite == true) {
                                $('[data-id="favorite_' + contact_id + '"]').removeClass('false').addClass('true');
                                $('[data-id="favorite_' + contact_id + '"]').removeClass('icon-favorite').addClass('icon-favorite-active');
                            } else if (params.update_data.is_favorite == false) {
                                $('[data-id="favorite_' + contact_id + '"]').removeClass('true').addClass('false');
                                $('[data-id="favorite_' + contact_id + '"]').removeClass('icon-favorite-active').addClass('icon-favorite');
                            }
                        });
                    }
                }
                $scope.load_groups();
            });
        };
        $scope.getGroupStatus = function () {
            Group.getBatchGroupStatus({contact_ids: $scope.selectedRows}, function (response, err) {
                $scope.show_group = true;
                if (response.data.data[0].status == 'all') {
                    response.data.data.forEach(function (group) {
                        $scope.selectedGroups.checked.push({'group_id': group.group_id});
                        $('#' + group.group_id).prop('checked', true);
                    });
                } else {
                    response.data.data.forEach(function (group) {
                        $scope.selectedGroups.checked.push({'group_id': group.group_id});
                        $('#' + group.group_id).prop('checked', false);
                    });
                }
            });
        };
        $scope.firstPage = function () {
            if ($scope.paginationCurrentPage != 1) {
                $scope.paginationCurrentPage = 1;
                $scope.findDuplicates($scope.paginationCurrentPage);
            }
        };
        $scope.prevPage = function () {
            if ($scope.paginationCurrentPage > 1) {
                $scope.paginationCurrentPage = $scope.paginationCurrentPage - 1;
                $scope.findDuplicates($scope.paginationCurrentPage);
            }
        };
        $scope.nextPage = function () {
            if ($scope.paginationCurrentPage < $scope.paginationTotalPages) {
                $scope.paginationCurrentPage = $scope.paginationCurrentPage + 1;
                $scope.findDuplicates($scope.paginationCurrentPage);
            }
        };
        $scope.lastPage = function () {
            if ($scope.paginationCurrentPage != $scope.paginationTotalPages) {
                $scope.paginationCurrentPage = $scope.paginationTotalPages;
                $scope.findDuplicates($scope.paginationTotalPages);
            }
        };
        $scope.$watch('pagination.limit', function (value) {
            $scope.findDuplicates(1);
        });
        $scope.findDuplicates = function (pageNo) {
            $scope.$parent.boolShowAddContact = true;
            $scope.duplicate_contacts = [];
            $scope.showButton = 'merge';
            //var params = 'limit=' + $scope.duplicateItemsPerPage;
            var params = 'limit=' + $scope.pagination.limit;
            if (typeof pageNo == 'undefined') {
                pageNo = 0;
            }
            pageNo = ((pageNo > 0) ? pageNo - 1 : pageNo);
            //params += '&page=' + ((pageNo > 0) ? pageNo - 1 : pageNo);
            params += '&page=' + pageNo;
           
            $scope.loading = true;
            Contact.findDuplicates(params, function (response, err) {
                $scope.loading = false;
                if (true == response.data.status) {
                    $scope.duplicateCurrentPage = pageNo;
                    $scope.duplicateTotalItems = response.data.data.total;
                    $scope.paginationDetails = pageNo +1 + "/" + response.data.data.pages;
                    $scope.paginationTotalPages = response.data.data.pages;
                    var tocount = (pageNo + 1) * $scope.pagination.limit;
                    var fromcount = pageNo == 0 ? 1 : tocount - $scope.pagination.limit;
                    tocount = tocount > response.data.data.total ? response.data.data.total : tocount;
                    
                    $scope.paginationDisplayItem = fromcount + " - " + tocount;
                    if ($scope.duplicateTotalItems > 0) {
                        angular.forEach(response.data.data.data, function (contact, index) {
                            $scope.mergeContact[index] = {};
                            var latestDate = '';
                            angular.forEach(contact.contacts, function (dup_contact) {
                                if (latestDate && latestDate.length > 0) {
                                    if (dup_contact.updated_on > latestDate) {
                                        $scope.mergeContact[index]['profile_pic'] = dup_contact.profile_pic;
                                        latestDate = dup_contact.updated_on;
                                    }
                                } else {
                                    $scope.mergeContact[index]['profile_pic'] = dup_contact.profile_pic;
                                    latestDate = dup_contact.updated_on;
                                }

                                $scope.mergeContact[index][dup_contact._id] = true;
                            })
                        });
                        $scope.duplicate_contacts = response.data.data.data;
                    } else {

                        $scope.duplicate_contacts = [];
                    }

                }

            });
        };
        $scope.mergeDuplicate = function ($index) {
            var duplicateContact = [];
            if (typeof $index !== 'undefined') {
                if ($scope.mergeContact[$index]) {
                    angular.forEach($scope.mergeContact[$index], function (value, key) {
                        if (true == value) {
                            duplicateContact.push(key);
                        }
                    });
                    if (duplicateContact.length > 1) {
                        Contact.mergeDuplicates({ids: [duplicateContact]}, function (response, err) {
                            if (response.data.status) {
                                //remove element from the scope 
                                $scope.load_groups();
                                $scope.mergeContact.splice($index, 1);
                                $scope.duplicate_contacts.splice($index, 1);
                            } else {
                                toasty.error({
                                    msg: $filter('translate')('ERROR_MERGE')
                                });
                            }
                        })
                    } else {
                        toasty.error({
                            msg: $filter('translate')('CONTACT_MERGE_VALIDATION')
                        });
                    }
                } else {
                    toasty.error({
                        msg: $filter('translate')('NO_CONTACT_MERGE')
                    });
                }
            } else {
                if ($scope.duplicate_contacts.length > 0) {
                    angular.forEach($scope.duplicate_contacts, function (contact) {
                        duplicateContact.push(contact['ids']);
                    });
                    if (duplicateContact.length > 0) {
                        Contact.mergeDuplicates({ids: duplicateContact}, function (response, err) {
                            if (response.data.status) {
                                $scope.load_groups();
                                //remove element from the scope
                                $scope.duplicate_contacts = [];
                                //reload tab data
                                $scope.findDuplicates();
                            } else {
                                toasty.error({
                                    msg: $filter('translate')('ERROR_MERGE')
                                });
                            }
                        })
                    } else {
                        toasty.error({
                            msg: filter('translate')('CONTACT_MERGE_VALIDATION')
                        });
                    }
                } else {
                    toasty.error({
                        msg: $filter('translate')('NO_CONTACT_MERGE')
                    });
                }
            }
        };
        $scope.firstPageMerge = function () {
            if ($scope.paginationCurrentPageMerge != 1) {
                $scope.paginationCurrentPageMerge = 1;
                $scope.getMergeHistory($scope.paginationCurrentPageMerge);
            }
        };
        $scope.prevPageMerge = function () {
            if ($scope.paginationCurrentPageMerge > 1) {
                $scope.paginationCurrentPageMerge = $scope.paginationCurrentPageMerge - 1;
                $scope.getMergeHistory($scope.paginationCurrentPageMerge);
            }
        };
        $scope.nextPageMerge = function () {
            if ($scope.paginationCurrentPageMerge < $scope.paginationTotalPagesMerge) {
                $scope.paginationCurrentPageMerge = $scope.paginationCurrentPageMerge + 1;
                $scope.getMergeHistory($scope.paginationCurrentPageMerge);
            }
        };
        $scope.lastPageMerge = function () {
            if ($scope.paginationCurrentPageMerge != $scope.paginationTotalPagesMerge) {
                $scope.paginationCurrentPageMerge = $scope.paginationTotalPagesMerge;
                $scope.getMergeHistory($scope.paginationTotalPagesMerge);
            }
        };
        $scope.$watch('pagination.limitmerge', function (value) {
            $scope.getMergeHistory(1);
        });
        $scope.getMergeHistory = function (pageNo) {
            $scope.$parent.boolShowAddContact = true;
            $scope.mergeHistory = [];
            var params = 'limit=' + $scope.pagination.limitmerge;
            if (typeof pageNo == 'undefined') {
                pageNo = 0;
            }
            pageNo = ((pageNo > 0) ? pageNo - 1 : pageNo);
            //params += '&page=' + ((pageNo > 0) ? pageNo - 1 : pageNo);
            params += '&page=' + pageNo;
            $scope.loading = true;
            Contact.mergeHistory(params, function (response, err) {
                $scope.loading = false;
                $scope.mergeCurrentPage = pageNo;
                $scope.mergeTotalItems = response.data.data.total;
                                
                $scope.paginationDetailsMerge = pageNo + 1 + "/" + response.data.data.pages;
                $scope.paginationTotalPagesMerge = response.data.data.pages;
                var tocount = (pageNo + 1) * $scope.pagination.limitmerge;
                var fromcount = pageNo == 0 ? 1 : tocount - $scope.pagination.limitmerge;
                tocount = tocount > response.data.data.total ? response.data.data.total : tocount;

                $scope.paginationDisplayItemMerge = fromcount + " - " + tocount;


                if ($scope.mergeTotalItems > 0) {
                    $scope.mergeHistory = response.data.data.data;
                } else {
                    //no merge contacts
                    $scope.mergeHistory = [];
                }
            })
        };
        $scope.restoreContact = function (historyId, $index) {
            var arrobjhistory = [];
            var unmerge = [];
            if (typeof historyId !== 'undefined') {
                if ($scope.unmergeContact[historyId]) {
                    angular.forEach($scope.unmergeContact[historyId], function (value, key) {
                        if (true == value) {
                            unmerge.push(key);
                        }
                    });
                    if (unmerge.length > 0) {
                        var objhistory = {};
                        objhistory.id = historyId;
                        objhistory.contact_ids = unmerge;
                        arrobjhistory.push(objhistory)

                        Contact.unmergeContacts({history: arrobjhistory}, function (response, err) {
                            if (response.data.status) {
                                $scope.load_groups();

                                //remove element from the scope                             
                                $scope.unmergeContact = [];
                                $scope.getMergeHistory();
                                // $scope.mergeHistory.splice($index, 1);
                            } else {
                                toasty.error({
                                    msg: $filter('translate')('ERROR_UNMERGE')
                                });
                            }
                        })
                    } else {
                        toasty.error({
                            msg: $filter('translate')('CONTACT_UNMERGE_VALIDATION')
                        });
                    }
                } else {
                    toasty.error({
                        msg: $filter('translate')('NO_CONTACT_UNMERGE')
                    });
                }
            } else {
                if ($scope.mergeHistory.length > 0) {
                    angular.forEach($scope.mergeHistory, function (contact) {
                        var objhistory = {};
                        var contact_ids = [];
                        objhistory.id = contact['_id'];
                        angular.forEach(contact.contacts, function (contact_list) {
                            if(contact.restore_ids.indexOf(contact_list._id) == -1)
                                contact_ids.push(contact_list._id);
                        });
                        objhistory.contact_ids = contact_ids;
                        if(contact_ids.length > 0){
                            arrobjhistory.push(objhistory);    
                        }                        
                    });
                    if (arrobjhistory.length > 0) {
                        Contact.unmergeContacts({history: arrobjhistory}, function (response, err) {
                            if (response.data.status) {
                                $scope.load_groups();
                                //remove element from the scope
                                $scope.unmergeContact = [];
                                // $scope.mergeHistory = [];
                                //reload tab data
                                $scope.getMergeHistory();
                            } else {
                                toasty.error({
                                    msg: $filter('translate')('ERROR_UNMERGE')
                                });
                            }
                        })
                    } else {
                        toasty.error({
                            msg: $filter('translate')('NO_CONTACT_UNMERGE')
                        });
                    }
                } else {
                    toasty.error({
                        msg: $filter('translate')('NO_CONTACT_UNMERGE')
                    });
                }
            }
        };
        $scope.dismiss = function ($index) {
            if (typeof $index !== 'undefined') {
                //remove element from the scope                             
                $scope.duplicate_contacts.splice($index, 1);
            } else {
                //remove element from the scope
                $scope.duplicate_contacts = [];
                //reload tab data
                $scope.findDuplicates();
            }

        };
        $scope.saveState = function () {
//            $.jgrid.saveState("contact-grid");
            var gridState = $('#contact-grid').jqGrid('getGridParam');
            var gridJSON = {rowNum: gridState.rowNum.toString(), page: gridState.page, reccount: gridState.reccount};
            $cookies.put('gridState', JSON.stringify(gridJSON));
        };
        $scope.loadState = function () {
//            $.jgrid.loadState("contact-grid");
            if ($cookies.get('gridState')) {
                var gridState = JSON.parse($cookies.get('gridState'));
                $('#contact-grid').setGridParam(gridState).trigger('reloadGrid');
                $('.ui-pg-selbox').val(gridState.rowNum);
            }
        };
        $scope.alert = function (text) {
            alert(text);
        };
        $(".group-list, .grid-filter").bind('click', function (event) {
            event.stopPropagation();
        });
        $document.bind('click', function () {
            if ($scope.show_group) {
                $scope.show_group = false;
            }

            if ($scope.show_filter) {
                $scope.show_filter = false;
            }

            if ($scope.show_sort) {
                $scope.show_sort = false;
            }
        });

        $scope.pageChanged = function (type) {
            if (type && type == 'merge') {
                $scope.getMergeHistory($scope.mergeCurrentPage);
                $log.log('Page changed to: ' + $scope.mergeCurrentPage);
            } else {
                $scope.findDuplicates($scope.duplicateCurrentPage);
                $log.log('Page changed to: ' + $scope.duplicateCurrentPage);
            }
        };
        $scope.composeQMail = function (email) {
            CGI.getAppInfo('qmail', function (response, err) {
                if (response.data.data.value != undefined) {
                    if (response.data.data.value == 'FALSE') {
                        toasty.error({
                            msg: $filter('translate')('QMAIL_DISABLED')
                        });
                    } else if (response.data.data.value == 'TRUE') {
                        var user = ($cookies.get('user')) ? JSON.parse($cookies.get('user')) : {};
                        window.open(config.QMAIL_URL + email + '&_sid=' + user.sid, "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=200, left=500, width=700, height=600");
                    }
                } else {
                    toasty.error({
                        msg: $filter('translate')('QMAIL_NOT_INSTALLED')
                    });
                }

            });
        };
    }]);

