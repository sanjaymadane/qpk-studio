(function (){
    'use strict';

    app.controller('PreviewCtrl', ['$scope', '$translate', '$filter','$cookies','$location', 'Preview', function ($scope, $translate, $filter,$cookies,$location, Preview) {
        $scope.config = {
            datatype: 'json',
            ajaxGridOptions: {contentType: "application/json", cache: false},
            url: config.API_URL + 'contacts/tmp/preview/' + $scope.ngDialogData.preview_id,
            loadBeforeSend: function (jqXHR) {
                jqXHR.setRequestHeader('Authorization', 'bearer ' + $cookies.get('accessToken'));
            },
            userData: $scope.previewData,
            id: '_id',
            colNames: [
                'id',
                $filter('translate')('FIRST_NAME'),
                $filter('translate')('MIDDLE_NAME'),
                $filter('translate')('LAST_NAME'),
                $filter('translate')('NICKNAME'),
                $filter('translate')('TITLE'),
                $filter('translate')('EMAIL_HOME'),
                $filter('translate')('EMAIL_OFFICE'),
                $filter('translate')('EMAIL_OTHER'),
                $filter('translate')('PHONE_HOME'),
                $filter('translate')('PHONE_OFFICE'),
                $filter('translate')('PHONE_MOBILE'),
                $filter('translate')('PHONE_MAIN'),
                $filter('translate')('PHONE_HOME_FAX'),
                $filter('translate')('PHONE_BUSINESS_FAX'),
                $filter('translate')('PHONE_OTHER'),
                $filter('translate')('COMPANY'),
                $filter('translate')('ADDRESS_HOME'),
                $filter('translate')('ADDRESS_OFFICE'),
                $filter('translate')('WEBPAGE'),
                $filter('translate')('IM_SKYPE'),
                $filter('translate')('IM_FACEBOOK'),
                $filter('translate')('IM_QQ'),
                $filter('translate')('IM_LINE'),
                $filter('translate')('IM_WECHAT'),
                $filter('translate')('IM_YAHOO'),
                $filter('translate')('IM_GTALK'),
                $filter('translate')('IM_CUSTOM'),
                $filter('translate')('DATE_BIRTHDAY'),
                $filter('translate')('DATE_ANNIVERSARY'),
                $filter('translate')('DATE_CUSTOM'),
                $filter('translate')('NOTE'),
                $filter('translate')('CUSTOM_FIELD')
            ],
            colModel: [
                {name: '_id', index: '_id', hidden: true, resizable: false},
                {name: 'fname', index: 'fname', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    if (cellvalue) {
                        return '<div class="contact-grid-column-padding">' + _.escape(cellvalue) + '</div>';
                    } else {
                        return "";
                    }
                }
                },
                {name: 'mname', index: 'mname', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    if (cellvalue) {
                        return '<div class="contact-grid-column-padding">' + _.escape(cellvalue) + '</div>';
                    } else {
                        return "";
                    }
                }
                },
                {name: 'lname', index: 'lname', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    if (cellvalue) {
                        return '<div class="contact-grid-column-padding">' + _.escape(cellvalue) + '</div>';
                    } else {
                        return "";
                    }
                }
                },
                {name: 'nickname', index: 'nickname', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    if (cellvalue) {
                        return '<div class="contact-grid-column-padding">' + _.escape(cellvalue) + '</div>';
                    } else {
                        return "";
                    }
                }
                },
                {name: 'title', index: 'title', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    if (cellvalue) {
                        return '<div class="contact-grid-column-padding">' + _.escape(cellvalue) + '</div>';
                    } else {
                        return "";
                    }
                }
                },
                {name: 'emails', index: 'emails', width: 250, resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var emailHTML = "";
                    var emails = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(email) {
                            if (email.label == 'HOME') {
                                var label = email.label;
                                var value = email.value;
                                var obj = {label: label, value: value};
                                emails.push(obj);
                            }
                        });

                        if (emails.length > 1) {
                            emailHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(emails[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            emails.forEach(function (q) {
                                emailHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '</a></li>';

                            });
                            emailHTML += '</ul></div>';
                        } else {
                            var e = (emails.length==1)?emails[0].value:"";
                            emailHTML = '<div class="contact-grid-column-padding">' + e + '</div>';
                        }
                    }
                    return emailHTML;
                }
                },
                {name: 'emails', index: 'emails', width: 250, resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var emailHTML = "";
                    var emails = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(email) {
                            if (email.label == 'OFFICE') {
                                var label = email.label;
                                var value = email.value;
                                var obj = {label: label, value: value};
                                emails.push(obj);
                            }
                        });

                        if (emails.length > 1) {
                            emailHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(emails[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            emails.forEach(function (q) {
                                emailHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '</a></li>';

                            });
                            emailHTML += '</ul></div>';
                        } else {
                            var e = (emails.length==1)?emails[0].value:"";
                            emailHTML = '<div class="contact-grid-column-padding">' + e + '</div>';
                        }
                    }
                    return emailHTML;
                }
                },
                {name: 'emails', index: 'emails', width: 250, resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var emailHTML = "";
                    var emails = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(email) {
                            if (email.label == 'OTHER') {
                                var label = email.label;
                                var value = email.value;
                                var obj = {label: label, value: value};
                                emails.push(obj);
                            }
                        });

                        if (emails.length > 1) {
                            emailHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(emails[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            emails.forEach(function (q) {
                                emailHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(q.label) + '</span>' + '</a></li>';

                            });
                            emailHTML += '</ul></div>';
                        } else {
                            var e = (emails.length==1)?emails[0].value:"";
                            emailHTML = '<div class="contact-grid-column-padding">' + e + '</div>';
                        }
                    }
                    return emailHTML;
                }
                },
                {name: 'phones', index: 'phones', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var phonesHTML = "";
                    var phones = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(phone) {
                            if (phone.label == 'HOME') {
                                var label = phone.label;
                                var value = phone.value;
                                var obj = {label: label, value: value};
                                phones.push(obj);
                            }
                        });

                        if (phones.length > 1) {
                            phonesHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(phones[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            phones.forEach(function (q) {
                                phonesHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '</a></li>';

                            });
                            phonesHTML += '</ul></div>';
                        } else {
                            var p = (phones.length==1)?phones[0].value:"";
                            phonesHTML = '<div class="contact-grid-column-padding">' + p + '</div>';
                        }
                    }
                    return phonesHTML;
                }
                },
                {name: 'phones', index: 'phones', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var phonesHTML = "";
                    var phones = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(phone) {
                            if (phone.label == 'OFFICE') {
                                var label = phone.label;
                                var value = phone.value;
                                var obj = {label: label, value: value};
                                phones.push(obj);
                            }
                        });

                        if (phones.length > 1) {
                            phonesHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(phones[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            phones.forEach(function (q) {
                                phonesHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '</a></li>';

                            });
                            phonesHTML += '</ul></div>';
                        } else {
                            var p = (phones.length==1)?phones[0].value:"";
                            phonesHTML = '<div class="contact-grid-column-padding">' + p + '</div>';
                        }
                    }
                    return phonesHTML;
                }
                },
                {name: 'phones', index: 'phones', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var phonesHTML = "";
                    var phones = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(phone) {
                            if (phone.label == 'MOBILE') {
                                var label = phone.label;
                                var value = phone.value;
                                var obj = {label: label, value: value};
                                phones.push(obj);
                            }
                        });

                        if (phones.length > 1) {
                            phonesHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(phones[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            phones.forEach(function (q) {
                                phonesHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '</a></li>';

                            });
                            phonesHTML += '</ul></div>';
                        } else {
                            var p = (phones.length==1)?phones[0].value:"";
                            phonesHTML = '<div class="contact-grid-column-padding">' + p + '</div>';
                        }
                    }
                    return phonesHTML;
                }
                },
                {name: 'phones', index: 'phones', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var phonesHTML = "";
                    var phones = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(phone) {
                            if (phone.label == 'MAIN') {
                                var label = phone.label;
                                var value = phone.value;
                                var obj = {label: label, value: value};
                                phones.push(obj);
                            }
                        });

                        if (phones.length > 1) {
                            phonesHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(phones[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            phones.forEach(function (q) {
                                phonesHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '</a></li>';

                            });
                            phonesHTML += '</ul></div>';
                        } else {
                            var p = (phones.length==1)?phones[0].value:"";
                            phonesHTML = '<div class="contact-grid-column-padding">' + p + '</div>';
                        }
                    }
                    return phonesHTML;
                }
                },
                {name: 'phones', index: 'phones', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var phonesHTML = "";
                    var phones = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(phone) {
                            if (phone.label == 'HOME_FAX') {
                                var label = phone.label;
                                var value = phone.value;
                                var obj = {label: label, value: value};
                                phones.push(obj);
                            }
                        });

                        if (phones.length > 1) {
                            phonesHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(phones[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            phones.forEach(function (q) {
                                phonesHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '</a></li>';

                            });
                            phonesHTML += '</ul></div>';
                        } else {
                            var p = (phones.length==1)?phones[0].value:"";
                            phonesHTML = '<div class="contact-grid-column-padding">' + p + '</div>';
                        }
                    }
                    return phonesHTML;
                }
                },
                {name: 'phones', index: 'phones', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var phonesHTML = "";
                    var phones = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(phone) {
                            if (phone.label == 'BUSINESS_FAX') {
                                var label = phone.label;
                                var value = phone.value;
                                var obj = {label: label, value: value};
                                phones.push(obj);
                            }
                        });

                        if (phones.length > 1) {
                            phonesHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(phones[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            phones.forEach(function (q) {
                                phonesHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '</a></li>';

                            });
                            phonesHTML += '</ul></div>';
                        } else {
                            var p = (phones.length==1)?phones[0].value:"";
                            phonesHTML = '<div class="contact-grid-column-padding">' + p + '</div>';
                        }
                    }
                    return phonesHTML;
                }
                },
                {name: 'phones', index: 'phones', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var phonesHTML = "";
                    var phones = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(phone) {
                            if (phone.label == 'OTHER') {
                                var label = phone.label;
                                var value = phone.value;
                                var obj = {label: label, value: value};
                                phones.push(obj);
                            }
                        });

                        if (phones.length > 1) {
                            phonesHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(phones[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            phones.forEach(function (q) {
                                phonesHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(q.label) + '</span>' + '</a></li>';

                            });
                            phonesHTML += '</ul></div>';
                        } else {
                            var p = (phones.length==1)?phones[0].value:"";
                            phonesHTML = '<div class="contact-grid-column-padding">' + p + '</div>';
                        }
                    }
                    return phonesHTML;
                }
                },
                {name: 'company_name', index: 'company_name', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    if (cellvalue) {
                        return '<div class="contact-grid-column-padding">' + _.escape(cellvalue) + '</div>';
                    } else {
                        return "";
                    }
                }
                },
                {name: 'addresses', index: 'addresses', width: 250, resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var addressesHTML = "";
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(address) {
                            if (address.label == 'HOME') {
                                addressesHTML = address.value;
                            }
                        });
                    }
                    return '<div class="contact-grid-column-padding">' + addressesHTML + '</div>';
                }
                },
                {name: 'addresses', index: 'addresses', width: 250, resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var addressesHTML = "";
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(address) {
                            if (address.label == 'OFFICE') {
                                addressesHTML = address.value;
                            }
                        });
                    }
                    return '<div class="contact-grid-column-padding">' + addressesHTML + '</div>';
                }
                },
                {name: 'web_pages', index: 'web_pages', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var webpagesHTML = "";
                    var webpages = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(webpage) {
                            var label = webpage.label;
                            var value = webpage.value;
                            var obj = {label: label, value: value};
                            webpages.push(obj);
                        });

                        if (webpages.length > 1) {
                            webpagesHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(webpages[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            webpages.forEach(function (q) {
                                webpagesHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(q.label) + '</span>' + '</a></li>';

                            });
                            webpagesHTML += '</ul></div>';
                        } else {
                            var w = (webpages.length==1)?webpages[0].value:"";
                            webpagesHTML = w;
                        }
                    }
                    return webpagesHTML;
                }
                },
                {name: 'im', index: 'im', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var imHTML = "";
                    var ims = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(im) {
                            if (im.label == 'SKYPE') {
                                var label = im.label;
                                var value = im.value;
                                var obj = {label: label, value: value};
                                ims.push(obj);
                            }
                        });

                        if (ims.length > 1) {
                            imHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(ims[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            ims.forEach(function (q) {
                                imHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(q.label) + '</span>' + '</a></li>';

                            });
                            imHTML += '</ul></div>';
                        } else {
                            imHTML = (ims.length>0) ? '<div class="contact-grid-column-padding">' + ims[0].value + '</div>' : "";
                        }
                    }
                    return imHTML;
                }
                },
                {name: 'im', index: 'im', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var imHTML = "";
                    var ims = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(im) {
                            if (im.label == 'FACEBOOK') {
                                var label = im.label;
                                var value = im.value;
                                var obj = {label: label, value: value};
                                ims.push(obj);
                            }
                        });

                        if (ims.length > 1) {
                            imHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(ims[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            ims.forEach(function (q) {
                                imHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(q.label) + '</span>' + '</a></li>';

                            });
                            imHTML += '</ul></div>';
                        } else {
                            imHTML = (ims.length>0) ? '<div class="contact-grid-column-padding">' + ims[0].value + '</div>' : "";
                        }
                    }
                    return imHTML;
                }
                },
                {name: 'im', index: 'im', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var imHTML = "";
                    var ims = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(im) {
                            if (im.label == 'QQ') {
                                var label = im.label;
                                var value = im.value;
                                var obj = {label: label, value: value};
                                ims.push(obj);
                            }
                        });

                        if (ims.length > 1) {
                            imHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(ims[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            ims.forEach(function (q) {
                                imHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(q.label) + '</span>' + '</a></li>';

                            });
                            imHTML += '</ul></div>';
                        } else {
                            imHTML = (ims.length>0) ? '<div class="contact-grid-column-padding">' + ims[0].value + '</div>' : "";
                        }
                    }
                    return imHTML;
                }
                },
                {name: 'im', index: 'im', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var imHTML = "";
                    var ims = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(im) {
                            if (im.label == 'LINE') {
                                var label = im.label;
                                var value = im.value;
                                var obj = {label: label, value: value};
                                ims.push(obj);
                            }
                        });

                        if (ims.length > 1) {
                            imHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(ims[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            ims.forEach(function (q) {
                                imHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(q.label) + '</span>' + '</a></li>';

                            });
                            imHTML += '</ul></div>';
                        } else {
                            imHTML = (ims.length>0) ? '<div class="contact-grid-column-padding">' + ims[0].value + '</div>' : "";
                        }
                    }
                    return imHTML;
                }
                },
                {name: 'im', index: 'im', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var imHTML = "";
                    var ims = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(im) {
                            if (im.label == 'WECHAT') {
                                var label = im.label;
                                var value = im.value;
                                var obj = {label: label, value: value};
                                ims.push(obj);
                            }
                        });

                        if (ims.length > 1) {
                            imHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(ims[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            ims.forEach(function (q) {
                                imHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(q.label) + '</span>' + '</a></li>';

                            });
                            imHTML += '</ul></div>';
                        } else {
                            imHTML = (ims.length>0) ? '<div class="contact-grid-column-padding">' + ims[0].value + '</div>' : "";
                        }
                    }
                    return imHTML;
                }
                },
                {name: 'im', index: 'im', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var imHTML = "";
                    var ims = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(im) {
                            if (im.label == 'YAHOO') {
                                var label = im.label;
                                var value = im.value;
                                var obj = {label: label, value: value};
                                ims.push(obj);
                            }
                        });

                        if (ims.length > 1) {
                            imHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(ims[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            ims.forEach(function (q) {
                                imHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(q.label) + '</span>' + '</a></li>';

                            });
                            imHTML += '</ul></div>';
                        } else {
                            imHTML = (ims.length>0) ? '<div class="contact-grid-column-padding">' + ims[0].value + '</div>' : "";
                        }
                    }
                    return imHTML;
                }
                },
                {name: 'im', index: 'im', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var imHTML = "";
                    var ims = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(im) {
                            if (im.label == 'GTALK') {
                                var label = im.label;
                                var value = im.value;
                                var obj = {label: label, value: value};
                                ims.push(obj);
                            }
                        });

                        if (ims.length > 1) {
                            imHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(ims[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            ims.forEach(function (q) {
                                imHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(q.label) + '</span>' + '</a></li>';

                            });
                            imHTML += '</ul></div>';
                        } else {
                            imHTML = (ims.length>0) ? '<div class="contact-grid-column-padding">' + ims[0].value + '</div>' : "";
                        }
                    }
                    return imHTML;
                }
                },
                {name: 'im', index: 'im', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var imHTML = "";
                    var ims = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(im) {
                            if (im.label != 'SKYPE' && im.label != 'FACEBOOK' && im.label != 'QQ' && im.label != 'LINE' && im.label != 'WECHAT' && im.label != 'YAHOO' && im.label != 'GTALK') {
                                var label = im.label;
                                var value = im.value;
                                var obj = {label: label, value: value};
                                ims.push(obj);
                            }
                        });

                        if (ims.length > 1) {
                            imHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(ims[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            ims.forEach(function (q) {
                                imHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(q.label) + '</span>' + '</a></li>';

                            });
                            imHTML += '</ul></div>';
                        } else {
                            imHTML = (ims.length>0) ? '<div class="contact-grid-column-padding">' + ims[0].value + '</div>' : "";
                        }
                    }
                    return imHTML;
                }
                },
                {name: 'events', index: 'events', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var eventsHTML = "";
                    var events = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(event) {
                            if (event.label == 'BIRTH_DATE') {
                                var label = event.label;
                                var value = event.value;
                                var obj = {label: label, value: value};
                                events.push(obj);
                            }
                        });

                        if (events.length > 1) {
                            eventsHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(events[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            events.forEach(function (q) {
                                var d = new Date(q.value);
                                var date = d.getDate();
                                var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getMonth()];
                                var year = d.getFullYear();
                                eventsHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + [date, month, year].join('-') + '</span>' + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(q.label) + '</span>' + '</a></li>';

                            });
                            eventsHTML += '</ul></div>';
                        } else {
                            var d = new Date(events[0].value);
                            var date = d.getDate();
                            var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getMonth()];
                            var year = d.getFullYear();
                            eventsHTML = (events.length>0) ? '<div class="contact-grid-column-padding">' + [date, month, year].join('-') + '</div>' : "";
                        }
                    }
                    return eventsHTML;
                }
                },
                {name: 'events', index: 'events', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var eventsHTML = "";
                    var events = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(event) {
                            if (event.label == 'ANNIVERSARY') {
                                var label = event.label;
                                var value = event.value;
                                var obj = {label: label, value: value};
                                events.push(obj);
                            }
                        });

                        if (events.length > 1) {
                            eventsHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(events[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            events.forEach(function (q) {
                                var d = new Date(q.value);
                                var date = d.getDate();
                                var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getMonth()];
                                var year = d.getFullYear();
                                eventsHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + [date, month, year].join('-') + '</span>' + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(q.label) + '</span>' + '</a></li>';

                            });
                            eventsHTML += '</ul></div>';
                        } else {
                            var d = new Date(events[0].value);
                            var date = d.getDate();
                            var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getMonth()];
                            var year = d.getFullYear();
                            eventsHTML = (events.length>0) ? '<div class="contact-grid-column-padding">' + [date, month, year].join('-') + '</div>' : "";
                        }
                    }
                    return eventsHTML;
                }
                },
                {name: 'events', index: 'events', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var eventsHTML = "";
                    var events = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(event) {
                            if (event.label != 'BIRTH_DATE' && event.label != 'ANNIVERSARY') {
                                var label = event.label;
                                var value = event.value;
                                var obj = {label: label, value: value};
                                events.push(obj);
                            }
                        });

                        var d = new Date(events[0].value);
                        var date = d.getDate();
                        var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getMonth()];
                        var year = d.getFullYear();

                        if (events.length > 1) {
                            eventsHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + [date, month, year].join('-') + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            events.forEach(function (q) {
                                var d = new Date(q.value);
                                var date = d.getDate();
                                var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getMonth()];
                                var year = d.getFullYear();
                                eventsHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + [date, month, year].join('-') + '</span>' + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(q.label) + '</span>' + '</a></li>';

                            });
                            eventsHTML += '</ul></div>';
                        } else {
                            eventsHTML = (events.length>0) ? '<div class="contact-grid-column-padding">' + [date, month, year].join('-') + '</div>' : "";
                        }
                    }
                    return eventsHTML;
                }
                },
                {name: 'note', index: 'note', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    if (cellvalue) {
                        return '<div class="contact-grid-column-padding">' + _.escape(cellvalue) + '</div>';
                    } else {
                        return "";
                    }
                }
                },
                {name: 'others', index: 'others', resizable: false, formatter: function (cellvalue, options, rowObject) {
                    var customsHTML = "";
                    var customs = [];
                    if (cellvalue.length > 1) {
                        _.filter(cellvalue, function(custom) {
                            var label = custom.label;
                            var value = custom.value;
                            var obj = {label: label, value: value};
                            customs.push(obj);
                        });

                        if (customs.length > 1) {
                            customsHTML += '<div class="dropdown"><button id="email_' + rowObject._id + '"class="btn btn-default dropdown-toggle sendQMailBtn contact-grid-phone-button" data-toggle="dropdown">' + _.escape(customs[0].value) + '  <span class="caret contact-grid-caret"></span></button><ul class="dropdown-menu">';
                            customs.forEach(function (q) {
                                customsHTML += '<li class="common-hover-background"><a class="contact-grid-phone-a" href="javascript:void(0)" >' + '<span id="email_' + rowObject._id + '">' + q.value + '</span>' + '  <span class="mobile-type-drop-down-contact-grid">' + $filter('translate')(q.label) + '</span>' + '</a></li>';

                            });
                            customsHTML += '</ul></div>';
                        } else {
                            customsHTML = (customs.length>0) ? '<div class="contact-grid-column-padding">' + customs[0].value + '</div>' : "";
                        }
                    }
                    return customsHTML;
                }
                }
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
            }
        };

        $scope.importPreview = function() {
            Preview.import($scope.ngDialogData.preview_id, function(response, err){
                console.log(response);
            });
        };

        $scope.discardPreview = function() {
            Preview.discard($scope.ngDialogData.preview_id, function(response, err){
                console.log(response);
            });
        };
    }]);
})();