'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
    'ngRoute',  
    'ngAnimate',
    'ngCookies',
    'pascalprecht.translate',
    'ui.bootstrap',
    'ngFileUpload',
    'ngDialog',
    'ngImgCrop',
    'angularjs-dropdown-multiselect',
    'angularSpinner',
    'directives.customvalidation.customValidationTypes',
    'UserValidation',
    'angular-toasty',
    'treeControl'
]).
factory('AuthTokenInjector', ['$cookies',function($cookies) {  
    var requestInterceptor = {
        request: function(config) {
            if(!config.headers.authorization && $cookies.get('accessToken')){
                config.headers.authorization = 'Bearer ' + $cookies.get('accessToken');
            }
            return config;
        },
        response: function(response) {
            return response;
        }
    };

    return requestInterceptor;
}]).
config(['$routeProvider', '$httpProvider', '$translateProvider','toastyConfigProvider', function ($routeProvider, $httpProvider, $translateProvider,toastyConfigProvider) {

    $routeProvider
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
        })
        .when('/contacts/create', {
            templateUrl: 'views/contact-form.html',
            controller: 'ContactFormCtrl'
        })
        .when('/contacts/edit/:contactId', {
            templateUrl: 'views/contact-form.html',
            controller: 'ContactFormCtrl'
        })
        .when('/contacts', {
            templateUrl: 'views/contact.html',
            controller: 'ContactCtrl'
        })
        .when('/contacts/:type?/:group_id?/', {
            templateUrl: 'views/contact.html',
            controller: 'ContactCtrl'
        })
        .when('/sync/:no_contacts?', {
            templateUrl: 'views/sync.html',
            controller: 'SyncCtrl'
        })
        .when('/export', {
            templateUrl: 'views/export.html',
            controller: 'ExportCtrl'
        })
        .when('/find-duplicates', {
            templateUrl: 'views/duplicates.html',
            controller: 'ContactCtrl'
        }).when('/default', {
            templateUrl: 'views/default.html',
            controller: 'SyncCtrl'
        })
        .otherwise({redirectTo: '/login'});

    $httpProvider.interceptors.push('AuthTokenInjector');

    $translateProvider.useStaticFilesLoader({
        prefix: 'resources/locales/',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('en-US');

    toastyConfigProvider.setConfig({
        limit: 5,
        showClose: true,
        clickToClose: true,
        timeout: 10000,
        sound: false,
        html: true,        
        shake: false,
        position: 'top-center'
    });
}]).
filter('filesize', function () {
    return function (size) {
        if (isNaN(size))
            size = 0;

        if (size < 1024)
            return size + ' Bytes';

        size /= 1024;

        if (size < 1024)
            return size.toFixed(2) + ' Kb';

        size /= 1024;

        if (size < 1024)
            return size.toFixed(2) + ' Mb';

        size /= 1024;

        if (size < 1024)
            return size.toFixed(2) + ' Gb';

        size /= 1024;

        return size.toFixed(2) + ' Tb';
    };
});


//Need to place in proper JS file in proper folder
function styleView()
{
    GenStyledChkBox();
    GenStyledRadioBtn();
}

function GenStyledChkBox()
{
    // remove existed label
    $("input[type=checkbox].qchkbox_b + label").remove();
    $("input[type=checkbox].qchkbox_w + label").remove();
    // append label
    $("input[type=checkbox].qchkbox_b, input[type=checkbox].qchkbox_w").each(function (idx, value) {
        $(this).after('<label></lable>');
    });
}

function GenStyledRadioBtn()
{
    // remove existed label
    $("input[type=radio].qradio + label").remove();
    // append label
    $("input[type=radio].qradio").each(function (idx, value) {
        $(this).after('<label></lable>');
    });
}

function bgTaskDropdownCtrl(status)
{
	if(status)
	{
		$('.bgTaskBtn').parent().addClass('click');	
		$('#bgTaskDropdown').show();		
	}
	else
	{
		$('.bgTaskBtn').parent().removeClass('click');
		$('#bgTaskDropdown').hide();	
	}
}
function moreDropdownCtrl(status)
{
	if(status)
	{
		$('.more').parent().addClass('click');	
		$('#moreDropdown').show();		
	}
	else
	{
		$('.more').parent().removeClass('click');
		$('#moreDropdown').hide();	
	}
}
function aboutWindow(status)
{
	if(status)
	{
		$('.more').parent().removeClass('click');
		$('#moreDropdown').hide();	
		$('#AboutDiv').show();
		$('#overlayDiv').show();
	}
	else
	{
		$('.more').parent().removeClass('click');
		$('#moreDropdown').hide();	
		$('#AboutDiv').hide();
		$('#overlayDiv').hide();
	}
}