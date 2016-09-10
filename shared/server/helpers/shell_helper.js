'use strict';

var config = require('../config/config');
var replace = require('replace');
module.exports = {
  create_project: function(options){
    return new Promise(function(resolve, reject){
      var host = {
        server:              {       
          host:         config.server_ip,
          port:         config.server_ssh_port,
          userName:     config.server_username,
          password:     config.server_password
        },
        commands:           [
            "cd "+ projects_path + options.name, 
            "qbuild"
            ], //array() of command strings 
        msg:                {
          send: function( message ) {
            //message handler code 
            console.log(message);
          }
        }, 
        verbose:             false,  //optional default false 
        debug:               false,  //optional default false 
        idleTimeOut:         5000,        //optional number in milliseconds default 5000 
        connectedMessage:    "Connected", //optional default "Connected" 
        readyMessage:        "Ready",     //optional default "Ready" 
        closedMessage:       "Closed",    //optional default "Closed" 
        
        //optional event handlers defined for a host that will be called by the default event handlers 
        //of the class 
        onCommandProcessing: function( command, response, sshObj, stream ) {
         //optional code to run during the procesing of a command  
         //command is the command being run 
         //response is the text buffer that is still being loaded with each data event 
         //sshObj is this object and gives access to the current set of commands 
         //stream object allows strea.write access if a command requires a response 
        },
        onCommandComplete:   function( command, response, sshObj ) {
          console.log(response);
         //optional code to run on the completion of a command 
         //response is the full response from the command completed 
         //sshObj is this object and gives access to the current set of commands 
        },
        onCommandTimeout:    function(command, response, sshObj, stream, connection) {
         //optional code for responding to command timeout 
         //response is the text response from the command up to it timing out 
         //stream object used  to respond to the timeout without having to close the connection 
         //connection object gives access to close the shell using connection.end() 
        },
        onEnd:               function( sessionText, sshObj ) {
         //optional code to run at the end of the session 
         //sessionText is the full text for this hosts session 
         //sshObj.msg.send(sessionText); 
        },
        onError:            function(err, type, close = false, callback) {
          console.log(err);
         //optional code to run when an error event is raised 
         //sshObj object and sshObj.msg.send() is not available when event handler is defined in the host object. 
         //use console.log() to output messages. 
        }
      };
       
      //Create a new instance 
      var SSH2Shell = require ('ssh2shell'),
          SSH       = new SSH2Shell(host);
       
      //Start the process 
      SSH.connect();
      resolve(true);
    });
  },
  replace_strings: function(options) {
    // var options = {
    //   qpkg_name: req.body.name,
    //   qpkg_display_name: req.body.name,
    //   container_name: 'lamp_server',
    //   container_port: 9011
    // };
    //qpkg.cfg
    return new Promise(function(resolve, reject) {
      replace({
        regex: "#QPKG_NAME=",
        replacement: "QPKG_NAME=" + options.qpkg_name,
        paths: [config.projects_path + '' + options.qpkg_name + '/shared/app.conf'],
        recursive: true,
        silent: true,
      });
      replace({
        regex: "#QPKG_NAME=",
        replacement: "QPKG_NAME=\"" + options.qpkg_name + "\"",
        paths: [config.projects_path + '' + options.qpkg_name + '/qpkg.cfg', 
            config.projects_path + '' + options.qpkg_name + '/package_routines', 
            config.projects_path + '' + options.qpkg_name + '/shared/'+ options.qpkg_name + '.sh'
            // ,config.projects_path + '' + options.qpkg_name + '/shared/images/initimages.sh',
            // ,config.projects_path + '' + options.qpkg_name + '/shared/init/initcontainer.sh'
            ],
        recursive: true,
        silent: true,
      });
      replace({
        regex: "#QPKG_DISPLAY_NAME=",
        replacement: "QPKG_DISPLAY_NAME=\"" + options.qpkg_name + "\"",
        paths: [config.projects_path + '' + options.qpkg_name + '/qpkg.cfg'],
        recursive: true,
        silent: true,
      });
      replace({
        regex: "#QPKG_WEBUI=",
        replacement: "QPKG_WEBUI=\"/" + options.qpkg_name + "\"",
        paths: [config.projects_path + '' + options.qpkg_name + '/qpkg.cfg'],
        recursive: true,
        silent: true,
      });
      replace({
        regex: "#QPKG_SERVICE_PROGRAM=",
        replacement: "QPKG_SERVICE_PROGRAM=\"" + options.qpkg_name + ".sh\"",
        paths: [config.projects_path + '' + options.qpkg_name + '/qpkg.cfg'],
        recursive: true,
        silent: true,
      });
      resolve(true);
    });
  }
};