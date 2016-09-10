'use strict';

/*
 * Handle nas authentication
 */
// Load dep packages
var curl = require('curlrequest');
var parser = require('xml2json');
var _ = require('underscore');

// Load configuration
var config = require('../config/config');
var iniReader = require('inireader');
//nas_url = config.base_url

module.exports = {
  getNasConfig: function(block_name, config_name, callback){   
    return callback(null,null);
    block_name = block_name || 'System';
    config_name = config_name || 'Web Access Port';
    var parser = new iniReader.IniReader();
    parser.load('/app_config/uLinux.conf');
    var value = parser.param(block_name +'.' + config_name);
    callback(null, value);
  },

  getQPKGConfig: function(block_name, config_name, callback){  
    return callback(null,null);
    block_name = block_name || 'System';
    config_name = config_name || 'Web Access Port';
    var parser = new iniReader.IniReader();
    parser.load('/app_config/qpkg.conf');
    var value = parser.param(block_name +'.' + config_name);
    callback(null, value);    
  },
    
  login: function(fields, callback){ 
    var queryString = "";
    var stdout={},meta = {};
    _.mapObject(fields, function(val, key) {
      queryString += key+"="+val + "&";
      return val;
    });
    this.getNasConfig('System', 'Web Access Port', function(err, intPort){      
      intPort = intPort || 8080;
      curl.request({url: "http://"+config.server_ip+":"+intPort+"/cgi-bin/authLogin.cgi?"+queryString}, function (err, stdout, meta) {
        var options = {
          object: true,
          reversible: false,
          coerce: false,
          sanitize: false,
          trim: true,
          arrayNotation: false
        };
        var stdout = parser.toJson(stdout,options);
        callback(stdout,meta);
      });
    })            
  },
  validate: function(fields, callback){
    fields.subfunc = 'sys_setting';
    var queryString = "";
    var stdout={},meta = {};
    _.mapObject(fields, function(val, key) {
      queryString += key+"="+val + "&";
      return val;
    });
    this.getNasConfig('System', 'Web Access Port', function(err, intPort){
      intPort = intPort || 8080;
      curl.request({url: config.nas_protocol +"://"+config.server_ip+":"+intPort+"/cgi-bin/sys/sysRequest.cgi?"+ queryString}, function (err, stdout, meta) {
        var options = {
          object: true,
          reversible: false,
          coerce: false,
          sanitize: false,
          trim: true,
          arrayNotation: false
        };
        var stdout = parser.toJson(stdout,options);
        callback(err, stdout, meta);
      });
    });
  }, 

  logout: function(fields, callback){
    fields.logout = '1';
    var queryString = "";
    var stdout={},meta = {};
    _.mapObject(fields, function(val, key) {
      queryString += key+"="+val + "&";
      return val;
    });
    this.getNasConfig('System', 'Web Access Port', function(err, intPort){
      intPort = intPort || 8080;
      curl.request({url: config.nas_protocol +"://"+config.server_ip+":"+intPort+"/cgi-bin/authLogout.cgi?"+ queryString}, function (err, stdout, meta) {
        var options = {
          object: true,
          reversible: false,
          coerce: false,
          sanitize: false,
          trim: true,
          arrayNotation: false
        };
        var stdout = parser.toJson(stdout,options);
        callback(err, stdout, meta);
      });
    });
  }
};
