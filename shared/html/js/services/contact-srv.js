'use strict';

app.factory('Contact', ['Base', '$http', 'Upload', function (Base, $http, Upload) {
    return {
        getContacts: function (params, callback) {
            Base.get('contacts?' + params).then(function (response, err) {
                callback(response, err);
            });
        },
        searchContacts: function (params, callback) {
            Base.get('contacts/search?' + params).then(function (response, err) {
                callback(response, err);
            });
        },
        updateContacts: function (id, params, callback) {
            Base.put('contacts/' + id, params).then(function (response, err) {
                callback(response, err);
            });
        },
        deleteContacts: function (params, callback) {
            Base.post('contacts/batch_delete', params).then(function (response, err) {
                callback(response, err);
            });
        },
        batchUpdateContacts: function (params, callback) {
            Base.post('contacts/batch_update', params).then(function (response, err) {
                callback(response, err);
            });
        },
        createContact: function (data, callback) {
            Base.post('contacts', data).then(function (response, err) {
                callback(response, err);
            });
        },
        getContact: function (contactId, callback) {
            Base.get('contacts/' + contactId).then(function (response, err) {
                callback(response, err);
            });
        },
        uploadContactPicture: function (contactId, dataUrl, name, callback) {
            var url = config.API_URL + 'contacts/picture/';
            if (contactId !== null) {
                url = url + '?contact_id=' + contactId;
            }
            
            Upload.upload({
                url: url,
                data: {profile_pic: Upload.dataUrltoBlob(dataUrl, name)}
            }).then(function (response, err) {
                callback(response, err);
            });
        },
        uploadFromNAS: function(contactId, data, type, callback){
            var url = 'nasupload';

            var postData = {file_details: data, type: type, contact_id: contactId};
            Base.post(url, postData).then(function (response, err) {
                callback(response, err);
            });
        },
        uploadAttachment: function (contactId, files, callback) {
            var url = config.API_URL + 'contacts/attachments/';
            if (contactId !== null) {
                url = url + '?contact_id=' + contactId;
            }
            Upload.upload({
                url: url,
                data: {attachments: files}
            }).then(function (response, err) {
                callback(response, err);
            });
        },
        deleteAttachment: function (attachment, callback) {
            Base.post('contacts/attachments/delete', attachment).then(function(response, err){
                callback(response, err)
            });
        },
        findDuplicates: function(params, callback) {
            Base.get('contacts/duplicate?' +params).then(function(response, err){
                callback(response, err);
            })
        },
        mergeDuplicates: function(data, callback) {            
            Base.post('contacts/merge', data).then(function(response,err){
                callback(response,err);
            });
        },
        mergeHistory: function(params, callback){
            Base.get('contacts/merge_history?'+params).then(function(response,err){
                callback(response,err);
            });
        },
        unmergeContacts: function(data, callback){            
            Base.post('contacts/merge_restore',data).then( function( response, err ){
                callback(response,err);
            });
        },
        fetchImportedContacts: function (url, callback) {
            Base.get(url).then(function (response, err) {
                callback(response, err);
            });
        },
        startImportingContacts: function (url, data, callback) {
            Base.post(url, data).then(function (response, err) {
                callback(response, err);
            });
        },
        setActiveInactiveStatus: function (url, data, callback) {
            Base.post(url, data).then(function (response, err) {
                callback(response, err);
            });
        },
        saveUserDefinedColumnMappingIntoDB: function (url, data, callback) {
            Base.post(url, data).then(function (response, err) {
                callback(response, err);
            });
        },
        generalGet: function (url, callback) {
            Base.get(url).then(function (response, err) {
                callback(response, err);
            });
        }
    };
}]);