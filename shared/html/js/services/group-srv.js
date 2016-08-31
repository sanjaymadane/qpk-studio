'use strict';

app.factory('Group', ['Base', function (Base) {
    return {
    	getGroups: function(params, callback){
    		Base.get('groups?'+params).then(function(response, err){
    			callback(response, err);
    		});
    	},
        getGroupContacts: function(params, callback){
            Base.get('groups/'+params.group_id+'/contacts?'+params).then(function(response, err){
                callback(response, err);
            });
        },
        createGroup: function(data, callback){
            Base.post('groups', data).then(function(response, err){
                callback(response, err);
            });
        },
        getGroup: function(groupId, callback) {
            Base.get('groups/'+groupId).then(function (response, err){
                callback(response, err)
            });
        },
        updateGroup: function(groupId, params, callback){
            Base.put('groups/'+groupId, params).then(function(response, err){
                callback(response, err);
            });
        },
        deleteGroup: function(groupId, callback){
            Base.delete('groups/'+groupId).then(function(response, err){
                callback(response, err);
            });
        },
        getBatchGroupStatus: function(contactIds, callback) {
            Base.post('contacts/batch_group_status', contactIds).then(function(response, err){
                callback(response, err);
            });
        }
    };
}]);