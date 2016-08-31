'use strict';

app.factory('User', ['Base', function (Base) {
    return {
        authenticate: function (params, callback) {
            Base.post('authenticate', params).then(function (response, err) {
                callback(response, err);
            });
        },
        validate: function (callback) {
            Base.get('authenticate/verify').then(function (response, err) {
                callback(response, err);
            });
        },
        getLoggedInUserDetails: function(callback) {
            Base.get('users/me').then(function (response, err) {
                callback(response, err);
            });
        },
        setTutorialDisplay: function(params, callback) {
            Base.put('users/me', params).then(function (response, err) {
                callback(response, err);
            });
        },
        logout: function(callback) {
            Base.post('authenticate/logout', {}).then(function (response, err) {
                callback(response, err);
            });
        },
        getNASDetails: function(callback) {
            Base.get('general/nas-details').then(function (response, err) {
                callback(response, err);
            });
        },
        getConfiguration: function (callback) {
            Base.get('users/config').then(function (response, err) {
                callback(response, err);
            });
        },
        setConfiguration: function(config, callback) {
            Base.post('users/config', config).then(function (response, err) {
                callback(response, err);
            });
        }
    };
}]);