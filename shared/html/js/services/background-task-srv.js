'use strict';

app.factory('BackgroundTask', ['$cookies', function ($cookies) {
        return {
            connect: function () {
                var access_token = $cookies.get('accessToken');
                
                if (access_token) {
                    return io.connect(config.SOCKET_URL, {
                        query: "token=" + access_token,
                        transports: ['websocket']
                    });
                } else {
                    return null;
                }
            }
        }
    }]);