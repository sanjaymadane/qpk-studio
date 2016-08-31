'use strict';

app.factory('Export', ['Base', function (Base) {
    return {
        exportFile: function(params, callback) {
            Base.post('exports', params).then(function(response, err){
                callback(response, err);
            });
        }
    };
}]);