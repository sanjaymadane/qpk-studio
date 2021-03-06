'use strict';

/*
 * Application configuration file
 */
var SERVER_IP = process.env.QCONTACTZ_SERVER_IP || '10.0.3.1';
module.exports = {
  'secret': 'crazyalarm1',
  'database': 'mongodb://'+SERVER_IP+':27025/qpk',
  'api_version': 'v1',
  'token_timeout': 900000,
  'server_ip': SERVER_IP,
  'server_ssh_port': 22,
  'server_username': 'admin',
  'server_password': 'admin',
  'media_base_path':  __dirname + '/../public/uploads/',
  'build_utility_path':  __dirname + '/../build_utility/',
  'projects_path':  __dirname + '/../projects/',
  'port': 9010
};