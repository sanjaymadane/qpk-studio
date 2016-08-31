'use strict';

app.factory('CGI', ['Base', '$http', function (Base, $http) {
    return {
        getNasInfo: function(callback){
            var url = 'authLogin.cgi';            
            Base.cgiGet(url).then(function (response, err) {
                if(!err)
                    response = xml.xmlToJSON(response.data);
                callback(response, err);
            });            
        },
        getFoldersStructure: function (sid, filePath, callback) {
            var url = 'filemanager/utilRequest.cgi?func=get_tree&sid='+sid+'&is_iso=0&node='+filePath;
            Base.cgiGet(url).then(function (response, err) {
                callback(response, err);
            });
        },
        getFilesStructure: function (sid, filePath, type, callback) {
            var url = 'filemanager/utilRequest.cgi?func=get_list&sid='+sid+'&is_iso=0&list_mode=all&path='+filePath+'&dir=ASC&limit=20&sort=filename&start=0';
            if (type) {
                url = url + '&type='+ type;
            }

            Base.cgiGet(url).then(function (response, err) {
                callback(response, err);
            });
        },
        getFile: function (sid, filepath, filename, callback) {
            var url = 'filemanager/utilRequest.cgi/?sid='+sid+'&func=get_viewer&source_path='+filepath+'&source_file='+filename;

            Base.cgiGet(url).then(function (response, err) {
                callback(response, err);
            });
        },
        copyFile: function (sid, filepath, filename, callback) {
            var url = 'filemanager/utilRequest.cgi?func=copy&sid='+sid+'&source_file='+filename+'&source_total=1&source_path='+filepath+'&dest_path=/Qdownload&mode=1';

            Base.cgiGet(url).then(function (response, err) {
                callback(response, err);
            });
        },
        getAppInfo: function (app_name, callback) {
            Base.get('nas_app_info?app_name=' + app_name).then(function (response, err) {
                callback(response, err);
            });
        }
    };
}]);