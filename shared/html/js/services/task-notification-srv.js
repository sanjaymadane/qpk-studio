'use strict';

app.factory('TaskNotification', ['Base', function (Base) {

    return {
        getNotifications: function (params, callback) {
            Base.get('notifications?'+params).then(function (response, err) {
                callback(response, err);
            });
        },
        updateNotifications: function (params, callback) {
            Base.post('notifications', params).then(function (response, err) {
                callback(response, err);
            });
        },
        downloadFile: function (params, callback) {
            Base.get('download?'+params).then(function (response, err) {
                callback(response, err);
            });
        }
    };
}]);