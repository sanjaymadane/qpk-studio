'use strict';

app.factory('Private', ['Base', function (Base) {
    return {
        getSecurityQuestionSetByUser: function(callback){
            Base.get('high_security/question').then(function(response, err){
                callback(response, err);
            });
        },
        getSecurityQuestion: function(callback){
            Base.get('question_list').then(function(response, err){
                callback(response, err);
            });
        },
        setHighSecurityPassword: function(data, callback) {
            Base.post('high_security/set', data).then(function(response, err){
                callback(response, err);
            });
        },
        getSecondaryToken : function(data, callback) {
            Base.post('high_security/get_token', data).then(function(response, err){
                callback(response, err);
            });
        },
        resetHighSecurityPassword: function(data, callback) {
            Base.post('high_security/reset', data).then(function(response, err){
                callback(response, err);
            });
        },
    };
}]);