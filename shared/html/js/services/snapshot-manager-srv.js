'use strict';

app.factory('SnapshotManagement', ['Base', function (Base) {
    return {
        takeSnapshot: function (data, callback) {        	
            Base.post('snapshot', data).then(function (response, err) {
                callback(response, err);
            });
        },
        getSnapshotList: function(params, callback){
        	Base.get('snapshot').then(function(response,err){
                callback(response,err);
            });
        },
        restoreSnapshot: function(params, callback){
        	Base.post('restore', params).then(function(response, err){
        		callback(response, err);
        	})
        },
        deleteSnapshot: function(snapshotId, callback){        	
        	Base.delete('snapshot/'+snapshotId).then(function(response,err){
        		callback(response, err);
        	})
        }

    };
}]);