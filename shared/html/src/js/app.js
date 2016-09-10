'use strict';

/**
 * Route configuration for the RDash module.
 */
var app = angular
.module('RDash', ['ui.bootstrap', 'ui.router', 'ngCookies','ngFileUpload'])
.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        // For unmatched routes
        $urlRouterProvider.otherwise('/');

        // Application routes
        $stateProvider
            .state('index', {
                url: '/',
                templateUrl: 'templates/create_project.html'
            })
            .state('tables', {
                url: '/list',
                templateUrl: 'templates/tables.html'
            });
    }
]);