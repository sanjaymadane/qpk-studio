'use strict';

/*
 * Application configuration file
 */
var SERVER_IP = '10.0.3.1';
module.exports = {
  'secret': 'crazyalarm1',
  'database': 'mongodb://'+SERVER_IP+':27018/qpk',
  'api_version': 'v1',
  'token_timeout': 900000,
  'server_ip': SERVER_IP,
  'port': 9090
};