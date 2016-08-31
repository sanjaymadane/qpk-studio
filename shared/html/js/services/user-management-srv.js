'use strict';

app.factory('UserManagement', ['Base', function (Base) {
    return {
        getUsers: function(callback){
            Base.get('users').then(function(response, err){
                callback(response, err);
            });
        },
        
        createUser: function(params, callback) {
            Base.post('users', params).then(function(response, err){
                callback(response, err);
            });
        },
        
        batchDeleteUsers: function(params, callback) {
            Base.post('users/batch_delete', params).then(function(response, err){
                callback(response, err);
            });
        },
        
        editUser: function(id, params, callback) {
            Base.put('users/me', params).then(function(response, err){
                callback(response, err);
            });
        },
        
        deleteUser: function(id, callback) {
            Base.delete('users/'+id).then(function(response, err){
                callback(response, err);
            });
        },

        resetPassword: function(params, callback) {
            Base.post('users/reset_password', params).then(function(response, err){
                callback(response, err);
            });
        }
    };
}]);