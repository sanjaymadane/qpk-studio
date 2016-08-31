(function(){
    'use strict';

    app.factory('Preview', ['Base', function (Base) {
        return {
            import: function(preview_id, callback) {
                Base.post('contacts/tmp/preview/' + preview_id + '/import', {}).then(function (response, err) {
                    callback(response, err);
                });
            },
            discard: function(preview_id, callback) {
                Base.delete('contacts/tmp/preview/' + preview_id, {}).then(function(response, err){
                    callback(response, err);
                });
            }
        };
    }]);
})();