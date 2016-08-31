'use strict';

app.controller('ContactFormCtrl', ['$scope', 'Contact', '$routeParams', '$location', 'ngDialog', 'Group', '$filter', '$cookies', 'toasty', '$window', '$rootScope', 'CGI',
    function ($scope, Contact, $routeParams, $location, ngDialog, Group, $filter, $cookies, toasty, $window, $rootScope, CGI) {
        $scope.show_group = false;
        $scope.base_url = config.BASE_URL;
        $scope.pic_url = config.PIC_URL;
        $scope.api_url = config.API_URL;
        $scope.attachmentsToDelete = [];
        $scope.uploading = false;
        $scope.temp = false;
        $scope.show_title = false;
        $scope.show_nickname = false;
        $scope.unsaved_form = false;
        $scope.rand = Math.random();
        $scope.selected_picture = '';
        $scope.accessToken = $cookies.get('accessToken');
        $scope.is_favorite = false;
        $scope.is_locked = false;
        $scope.contact = {
            groups: {checked:[]}
        }
        $('.contact-form .right-column').height($( window ).height()-180);
        $scope.uploadType = '';
        $( window ).resize(function() {
          $('.contact-form .right-column').height($( window ).height()-180);
        });
        $scope.$parent.boolShowAddContact = true;
        $scope.changeSelectedPic = function (profile_pic) {
            $scope.selected_picture = profile_pic;
            if (!$scope.$$phase) $scope.$apply();
        };

        $scope.updateContactObject = function () {
            $scope.$parent.openResetHighSecurityPassword(true, function(state){
                if ($scope.contact._id && state) {
                    $scope.contact.is_favorite = $scope.is_favorite;
                    $scope.contact.is_locked = $scope.is_locked;
                    
                    $scope.contact.groups = { checked: [], unchecked: [] };
                    $('.groups-checklist input[type="checkbox"]').each(function () {
                        var $this = $(this);
                        if ($this.is(":checked")) {
                            $scope.contact.groups.checked.push({ group_id: $this.attr("id") });
                        } else {
                            $scope.contact.groups.unchecked.push({ group_id: $this.attr("id") });
                        }
                    });
                    if($scope.contact.groups.checked.length > 0)
                        $('.group-icon-container > i').removeClass('icon-group').addClass('icon-group-active');
                    else 
                        $('.group-icon-container > i').removeClass('icon-group-active').addClass('icon-group');
                } else {
                    $scope.is_locked = !$scope.is_locked;
                }
            });
        };

        $scope.closeGroupsDiv = function () {
            $scope.show_group = false;
            $scope.showCreateGroup = false;
            if (!$scope.$$phase) $scope.$apply();
        };

        if ($routeParams.contactId) {
            $scope.temp = true;
            $scope.contactId = $routeParams.contactId;
            Contact.getContact($scope.contactId, function (response, err) {
                $scope.contact = response.data.data || {};
                $scope.is_favorite = $scope.contact.is_favorite;
                delete($scope.contact.is_favorite);
                $scope.is_locked = $scope.contact.is_locked;
                delete($scope.contact.is_locked);
                if ($scope.contact.profile_pic) {
                    $scope.contact.profile_pic = $scope.pic_url + $scope.contact.profile_pic;
                }
                if ($scope.contact.profile_pic_history) {
                    $scope.contact.profile_pic_history.forEach(function (pic_history, index) {
                        $scope.contact.profile_pic_history[index] = $scope.pic_url + pic_history;
                    });
                }
                if (!$scope.contact.others)
                    $scope.contact.others = [];

                if ($scope.contact.title) {
                    $scope.show_title = true;
                }
                if ($scope.contact.nickname) {
                    $scope.show_nickname = true;
                }
                if ($scope.contact.emails == undefined || $scope.contact.emails.length == 0) {
                    $scope.contact.emails = [{ label: 'HOME', value: '', is_primary: false }];
                }
                if ($scope.contact.phones == undefined || $scope.contact.phones.length == 0) {
                    $scope.contact.phones = [{ label: 'HOME', value: '', is_primary: false }];
                }
                if ($scope.contact.addresses == undefined || $scope.contact.addresses.length == 0) {
                    $scope.contact.addresses = [{ label: 'Home', value: '' }, { label: 'Office', value: '' }];
                }
                if ($scope.contact.im == undefined || $scope.contact.im.length == 0) {
                    $scope.contact.im = [{ label: 'SKYPE', value: '' }];
                }
                if ($scope.contact.web_pages == undefined || $scope.contact.web_pages.length == 0) {
                    $scope.contact.web_pages = [{ label: 'OFFICE', value: '' }];
                }
                $scope.file = response.data.data ? response.data.data.profile_pic : "";
                if($scope.contact.events && $scope.contact.events.length > 0){
                    $scope.contact.events.forEach(function (eventsDate) {
                        if (eventsDate.value) {
                            eventsDate.value = new Date(eventsDate.value);
                        }
                    });
                } else {
                    $scope.contact.events = [{ label: 'BIRTH_DATE', value: null, opened: false }, { label: 'ANNIVERSARY', value: null, opened: false }];
                }

                $scope.getGroupStatus();
            });
        } else {
            $scope.contact = {
                emails: [{ label: 'HOME', value: '', is_primary: false }],
                phones: [{ label: 'HOME', value: '', is_primary: false }],
                addresses: [{ label: 'HOME', value: '' }, { label: 'OFFICE', value: '' }],
                im: [{ label: 'SKYPE', value: '' }],
                events: [{ label: 'BIRTH_DATE', value: null, opened: false }, { label: 'ANNIVERSARY', value: null, opened: false }],
                web_pages: [{ label: 'OFFICE', value: '' }],
                others: [],
                groups: [],
                attachments: [],
                profile_pic_history: []
            };
        }

        $scope.editedContact = angular.copy($scope.contact);
        $scope.selectAttachmentTemp = [];
        $scope.filesSelectedFromNAS = [];
        $scope.openPhotoSelector = function () {
            $scope.uploadType = 'profile_pic';
            $scope.rand = Math.random();
            $scope.base_url = '';
            ngDialog.open({
                template: 'views/partials/contact-picture-selector.html',
                scope: $scope,
                closeByDocument: false,
                className: 'ngdialog-theme-default custom-width-750'
            });
        };

        $scope.attachement = [];

        $scope.removeTitle = function () {
            $scope.show_title = false;
            $scope.contact.title = null;
        };

        $scope.removeNickname = function () {
            $scope.show_nickname = false;
            $scope.contact.nickname = null;
        };

        $scope.add_new_email = function (emailType) {
            if(!$scope.contact.emails) $scope.contact['emails'] = [];
            $scope.contact.emails.push({ label: emailType, value: '', is_primary: false });
        };
        $scope.remove_new_email = function (index) {
            $scope.contact.emails.splice(index, 1);
        };
        $scope.add_new_phone = function (phoneType) {
            if(!$scope.contact.phones) $scope.contact['phones'] = [];
            $scope.contact.phones.push({ label: phoneType, value: '', is_primary: false });
        };
        $scope.remove_new_phone = function (index) {
            $scope.contact.phones.splice(index, 1);
        };
        $scope.add_new_address = function () {
            if(!$scope.contact.addresses) $scope.contact['addresses'] = [];
            $scope.contact.addresses.push({ label: 'HOME', value: '' });
        };
        $scope.remove_new_address = function (index) {
            $scope.contact.addresses.splice(index, 1);
        };
        $scope.add_new_im = function (imType) {
            if(!$scope.contact.im) $scope.contact['im'] = [];
            $scope.contact.im.push({ label: imType, value: '' });
        };
        $scope.remove_new_im = function (index) {
            $scope.contact.im.splice(index, 1);
        };
        $scope.add_new_event = function (eventType) {
            if(!$scope.contact.events) $scope.contact['events'] = [];
            $scope.contact.events.push({ label: eventType, value: null, opened: false });
        };
        $scope.remove_new_event = function (index) {
            $scope.contact.events.splice(index, 1);
        };
        $scope.add_new_webpage = function () {
            if(!$scope.contact.web_pages) $scope.contact['web_pages'] = [];
            $scope.contact.web_pages.push({ label: 'OFFICE', value: '' });
        };
        $scope.remove_new_webpage = function (index) {
            $scope.contact.web_pages.splice(index, 1);
        };
        $scope.add_new_other = function () {
            if(!$scope.contact.others) $scope.contact['others'] = [];
            $scope.contact.others.push({});
        };
        $scope.remove_new_other = function (index) {
            $scope.contact.others.splice(index, 1);
        };

        $scope.setPrimaryEmail = function (index) {
            $scope.contact.emails.forEach(function (email) {
                email.is_primary = false;
            });
            $scope.contact.emails[index].is_primary = true;
        };

        $scope.setPrimaryPhone = function (index) {
            $scope.contact.phones.forEach(function (phone) {
                phone.is_primary = false;
            });
            $scope.contact.phones[index].is_primary = true;
        };

        $scope.open = function ($event, index) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.contact.events[index].opened = true;
        };

        $scope.initTelDD = function (index) {
            setTimeout(function () {
                $("#phone_" + index).intlTelInput({
                    nationalMode: false,
                    utilsScript: 'lib/intl-tel-input/build/js/utils.js',
                    initialCountry: 'auto',
                    geoIpLookup: function (callback) {
                        $.get('http://ipinfo.io', function () { }, "jsonp").always(function (resp) {
                            var countryCode = (resp && resp.country) ? resp.country : "";
                            callback(countryCode);
                        });
                    }
                });
            }, 10);
        };

        $scope.resetFileChooserOptions = function(file_chooser_option) {
            if (file_chooser_option == 'choose_local_file') {
                $scope.filesSelectedFromNAS = [];
            } else if (file_chooser_option == 'choose_nas_file') {
                $scope.selectAttachmentTemp = [];
            }
        };

        $rootScope.$on('selectedNASFile', function (event, data) {
            if ($scope.uploadType == 'attachment') {
                _.filter(data, function (nasFile) {
                    $scope.filesSelectedFromNAS.push(nasFile);
                });
            } else if ($scope.uploadType == 'profile_pic') {
                // var contactId = ($scope.contact._id != undefined) ? $scope.contact._id : null;
                // Contact.uploadFromNAS(contactId, data, 'attachment', function (response, err) {
                //     if (response.data.status) {
                //         console.log(config.PIC_URL + response.data.data.file_details[0].path);
                //     }
                // });
            }
        });


        // upload on file select or drop
        $scope.uploadProfilePic = function (croppedDataUrl, name) {
            $scope.data_url = croppedDataUrl;
            $scope.pic_name = name;
            var contactId = ($scope.contact._id != undefined) ? $scope.contact._id : null;

            if ($scope.data_url != undefined && $scope.pic_name != undefined) {
                Contact.uploadContactPicture(contactId, $scope.data_url, $scope.pic_name, function (response, err) {
                    if (contactId == null) {
                        contactId = response.data.data.contact_id;
                        $scope.contact._id = contactId;
                    }
                    //attach base url before showing image on the UI.
                    $scope.contact.profile_pic = config.PIC_URL + response.data.data.profile_pic;
                    $scope.rand = Math.random();
                });
            }
            ngDialog.close();
        };

        $scope.openFileUpload = function () {
            $scope.uploadType = 'attachment';
            ngDialog.open({
                template: 'views/partials/AttachFileContact.html',
                closeByDocument: false,
                scope: $scope
            });
        };


        $scope.tempStoreAttachment = function (attachments, errFiles) {
            $scope.errFile = errFiles && errFiles[0];
            if ($scope.errFile) {
                toasty.error({
                    msg: $scope.errFile.name + ' \n \n ' + $filter('translate')('FILE_VALIDATION') + ' \n \n ' + $scope.errFile.$errorParam
                });
                return;
            }
            if (attachments.length > 0)
                $scope.selectAttachmentTemp.push(attachments);

        };
               
        $scope.uploadAttachment = function (file_chooser_options) {
            if (file_chooser_options == 'choose_nas_file') {
                var contactId = ($scope.contact._id != undefined) ? $scope.contact._id : null;

                Contact.uploadFromNAS(contactId, $scope.filesSelectedFromNAS, 'attachment', function (response, err) {
                    if (response.data.status) {
                        _.filter(response.data.data.file_details, function (nasFile) {
                            $scope.contact.attachments.push({file_type:'text/plain', label: nasFile.label, value: nasFile.path});
                        });
                        $scope.filesSelectedFromNAS = [];
                        ngDialog.close();
                    }
                });
            } else if (file_chooser_options == 'choose_local_file') {
                var attachments = $scope.selectAttachmentTemp;
                var contactId = ($scope.contact._id != undefined) ? $scope.contact._id : null;

                if (attachments && $scope.contact.attachments.length < 10) {
                    attachments.forEach(function (imageFile) {
                        $scope.uploading = true;
                        Contact.uploadAttachment(contactId, imageFile[0], function (response, err) {
                            if (contactId == null) {
                                contactId = response.data.data.contact_id;
                                $scope.contact._id = contactId;
                            }
                            if (!response.data.data.attachments[0]) {
                                toasty.error({
                                    msg: $filter('translate')('UNABLE_TO_UPLOAD')
                                });
                                ngDialog.close();
                                return;
                            }
                            $scope.contact.attachments.push(response.data.data.attachments[0]);
                            $scope.uploading = false;
                            $scope.selectAttachmentTemp = [];
                            ngDialog.close();
                        });
                    });
                } else {
                    toasty.error({
                        msg: $filter('translate')('UNABLE_TO_UPLOAD')
                    });
                }
            }
        };

        $scope.closeAttachmentDialog = function () {
            $scope.selectAttachmentTemp = [];
            $scope.filesSelectedFromNAS = [];
            ngDialog.close();
        };

        $scope.deleteAttachment = function (attachment, index) {
            $scope.attachmentsToDelete.push(attachment);
            $scope.contact.attachments = _.filter($scope.contact.attachments, function (attach) {
                return attach && attach._id != attachment._id;
            });
        };

        $scope.$on('$locationChangeStart', function (event, next, current) {
            if (!$scope.contactForm.$pristine && !$scope.formsubmit) {

                var r = confirm($filter('translate')('UNSAVED_DATA_WARNING'));
                $scope.formsubmit = true;
                if (r === false) {
                    event.preventDefault();
                    $scope.formsubmit = false;
                }
            }
        });

        $scope.formsubmit = false;
        $scope.saveContact = function (contactForm, contact) {
            // $scope.$broadcast('runCustomValidations');
            $scope.formsubmit = true;
            
            if (contactForm.$valid) {
                $scope.contact.is_favorite = $scope.is_favorite;
                $scope.contact.is_locked = $scope.is_locked;
                var count = 0;
                $scope.contact.phones.forEach(function (phone) {
                    if ($("#phone_" + count).intlTelInput("isValidNumber")) {
                        phone.value = $("#phone_" + count).intlTelInput("getNumber");
                    } else {
                        phone.value = $("#phone_" + count).val();
                    }
                    count = count + 1;
                });

                if (contact.profile_pic) {
                    contact.profile_pic = contact.profile_pic.replace(config.PIC_URL,'');
                }

                if (contact.profile_pic_history) {
                    contact.profile_pic_history.forEach(function (pic_history, index) {
                        var profile_pic = pic_history.replace(config.PIC_URL,'')
                        contact.profile_pic_history[index] = profile_pic;
                    });
                }

                if (contact._id && $scope.temp) {
                    $scope.contact.groups = { checked: [], unchecked: [] };
                    $('.groups-checklist input[type="checkbox"]').each(function () {
                        var $this = $(this);
                        if ($this.is(":checked")) {
                            $scope.contact.groups.checked.push({ group_id: $this.attr("id") });
                        } else {
                            $scope.contact.groups.unchecked.push({ group_id: $this.attr("id") });
                        }
                    });
                    Contact.updateContacts(contact._id, contact, function (response, err) { });
                } else {
                    $('.groups-checklist input[type="checkbox"]:checked').each(function () {
                        var $this = $(this);
                        if ($this.is(":checked")) {
                            $scope.contact.groups.push({ group_id: $this.attr("id") });
                        }
                    });
                    Contact.createContact(contact, function (response, err) { });
                }

                var deleteAttachment = {
                    contact_id: contact._id,
                    attachments: $scope.attachmentsToDelete
                };
                
                Contact.deleteAttachment(deleteAttachment, function (response, err) { });
                $location.path('/contacts');
            }
        };



        $scope.cancelContact = function () {
            if ($scope.unsaved_form === false) {
                $window.history.back();
            } else {
                var r = confirm($filter('translate')('UNSAVED_DATA_WARNING'));
                $scope.formsubmit = true;
                if (r === true) {
                    $window.history.back();
                    $scope.unsaved_form = false;
                }
            }
        };

        $scope.getGroupStatus = function () {
            if ($scope.contact._id != undefined) {
                Group.getBatchGroupStatus({ contact_ids: [$scope.contact._id] }, function (response, err) {
                    var is_group_selected = false;
                    if(response.data.data && response.data.data.length > 0){
                        if (response.data.data[0].status == 'all') {
                            response.data.data.forEach(function (group) {
                                $('#' + group.group_id).prop('checked', true);
                                is_group_selected = true;
                            });
                        } else {
                            response.data.data.forEach(function (group) {
                                $('#' + group.group_id).prop('checked', false);
                            });
                        }
                    }
                    if(is_group_selected)
                        $('.group-icon-container > i').removeClass('icon-group').addClass('icon-group-active');
                });
            }
        };
        

        $scope.$watch("contact", function (newValue, oldValue) {
            if (typeof oldValue === 'undefined') return;

            if (newValue !== oldValue) {
                //  $scope.unsaved_form = true;
                // $scope.formsubmit = false;
                $scope.unsaved_form = !angular.equals($scope.editedContact, newValue);
            }
        }, true);

    }]);