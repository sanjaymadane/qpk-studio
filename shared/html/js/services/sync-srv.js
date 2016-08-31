'use strict';

app.factory('Sync', ['Base', 'Upload', function (Base, Upload) {
    return {
        googleAuth: function (callback) {
            Base.get('imports/google/contacts').then(function (response, err) {
                callback(response, err);
            });
        },

        getGoogleContacts: function (data, callback) {
            Base.post('imports/google/contacts', data).then(function (response, err) {
                callback(response, err);
            });
        },

        importFile: function (file, callback) {
            Upload.upload({
                url: config.API_URL + 'imports',
                data: { import: file }
            }).then(function (response, err) {
                callback(response, err);
            });
        },

        getHistory: function (callback) {
            Base.get('notifications?type=import').then(function (response, err) {
                callback(response, err);
            });
        },
        uploadFromNAS: function (data, type, callback) {
            var url = 'nasupload';

            var postData = { file_details: data, type: type };
            Base.post(url, postData).then(function (response, err) {
                callback(response, err);
            });
        },
        sendForImport: function (path, callback) {
            var postData = { import: path }
            Base.post('imports/file', postData).then(function (response, err) {
                callback(response, err);
            })
        },
        manualImport: function (id, isfullsync, callback) {
            var postData = {
                id: id,
                is_full_sync: isfullsync
            }
            Base.post('imports/google/syncnow', postData).then(function (response, err) {
                callback(response, err);
            })
        },
        syncTimeList: function (callback) {
            Base.get('imports/syncTimeList').then(function (response, err) {
                callback(response, err);
            });
        },
        syncTimeUpdate: function (id, syncTime, callback) {
            var postData = {
                id: id,
                trigger_break: syncTime
            }
            Base.post('imports/google/sync', postData).then(function (response, err) {
                callback(response, err);
            })
        },
        syncDeleteAccountGoogleSync: function (ids, callback) {
            var postData = {
                id: ids
            }
            Base.delete('imports/google/sync', postData).then(function (response, err) {
                callback(response, err);
            });
        },
        getSyncAccount: function (callback) {
            Base.get('imports/google/sync').then(function (response, err) {
                callback(response, err);
            });
        }
    };
}]);