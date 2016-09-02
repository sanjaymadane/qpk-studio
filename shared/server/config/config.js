'use strict';

/*
 * Application configuration file
 */
console.log(process.env.QCONTACTZ_SERVER_IP + "test");
var SERVER_IP = process.env.QCONTACTZ_SERVER_IP || '172.17.30.151';
console.log(SERVER_IP);
module.exports = {
  'secret': 'crazyalarm1',
  'database': 'mongodb://'+SERVER_IP+':27018/qpk',
  'api_version': 'v1',
  'token_timeout': 900000,
  'server_ip': SERVER_IP,
  'port': 9090
};