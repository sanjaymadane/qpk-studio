// Post a new task to the work queue

var amqplib = require('amqplib');
var when = require('when');
var config = require('../config/config');
var amqp = require('amqp');

module.exports = {
  publish: function(job){    
    var self = this;
    amqplib.connect('amqp://'+ config.rabbitmq_ip +':'+ config.rabbitmq_port).then(function(conn) {      
      return when(conn.createChannel().then(function(ch) {
        var q = 'task_queue';
        var ok = ch.assertQueue(q, {durable: true});
        
        return ok.then(function() {
          ch.sendToQueue(q, new Buffer(JSON.stringify(job),'utf8'), {deliveryMode: true});
          console.log(" [x] Sent");
          self.emit(job);
          return ch.close();
        });
      })).ensure(function() { conn.close(); });
    }).then(null, console.warn("Error connecting Rabbitmq"));  
  }
}