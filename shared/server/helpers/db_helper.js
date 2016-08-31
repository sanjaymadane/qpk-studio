'use strict';

/*
 * Load dummy data helper
 */

// Load dep packages
var mongoose = require('mongoose'),
    chance = require('chance').Chance();

// Load configurations
var config = require('../config/config');
var csvWriter = require('csv-write-stream');
var fs = require('fs');
module.exports = function(){
  return {
    clean: function(){
      console.log('Cleaning database....');                      
    },
    load_dummy: function(){
      console.log('Loading seed data for testing, it will take some time.');
      var users = [],
          groups = [],
          contacts = [];

      var user_promise = new Promise(function(resolve, reject){
        console.log('Creating users....');        
        for(var i = 0; i < config.dummy_data.user_count; i++){
          var fname = chance.first(),
              lname = chance.last();
          var user = {
            fname: fname,
            lname: lname,
            username: fname+lname,
            password: 'YWRtaW4=',
            role: 'local',
            is_nas_user: false,
            email: chance.email(),
            security_question: '',
            security_answer: '',
            is_active: true,
            profile_pic: '',
            created_by: 'System',
            updated_by: 'System'
          };
          users.push(user);
        }        
        mongoose.model('User').collection.insert(users, function (err, usr) {
          resolve(usr);
        });
       });
      user_promise.then(function(usr){
        console.log('Creating groups....');
        return new Promise(function(resolve, reject){
          for(var i=0; i < config.dummy_data.group_count;i++){
            var group = {
              name: chance.word({length: 7}),
              user_id: chance.pick(usr.insertedIds)
            }
            groups.push(group);
          }

          mongoose.model('Group').collection.insert(groups, function (err, grps) {
            resolve({userIds: usr.insertedIds, groupIds: grps.insertedIds});
          });        
        });        
      }).then(function(prev_data){
        console.log('Creating contacts....');
        return new Promise(function(resolve, reject){
          for(var i=0; i < config.dummy_data.contact_count;i++){
            var contact = {
              fname: chance.first(),
              mname: chance.first(),
              lname: chance.last(),
              dob: chance.birthday({string: true}),
              note: chance.sentence({words: 10}) ,
              addresses: [{
                label: 'Home',
                value: chance.address()
              },{
                label: 'Office',
                value: chance.address()
              }], 
              emails: [{
                label: 'Home',
                value: chance.email(),
                is_primary: true
              },{
                label: 'Office',
                value: chance.email(),
                is_primary: false
              },{
                label: 'Office',
                value: chance.email(),
                is_primary: false
              }], 
              phones: [{
                label: 'Home',
                value: chance.phone(),
                is_primary: true
              },{
                label: 'Office',
                value: chance.phone(),
                is_primary: false
              },{
                label: 'Other',
                value: chance.phone(),
                is_primary: false
              }],
              user_id: "57775e03d281189f601152be",//chance.pick(prev_data.userIds),
              is_active: true,
              is_favorite: false,
              is_locked: false
            }
            contacts.push(contact);
          }

          mongoose.model('Contact').collection.insert(contacts, function (err, ctcts) {
            prev_data.contactIds = ctcts.insertedIds;
            resolve(prev_data);
          });        
        });        
      }).then(function(prev_data){
        console.log('Task completed.');
        // console.log('Adding contacts into groups');        
        // var c_promise = new Promise(function(resolve,reject){
        //   mongoose.model('Contact').aggregate([
        //     { 
        //       $group: {
        //         _id: {"user_id":'$user_id'}, 
        //         contacts: { $push: "$$ROOT" }
        //       }
        //     },        
        //   ],function(err,contacts){
        //     var sorted_contacts = {};
        //     contacts.forEach(function(con){
        //       if(con._id && con._id.user_id){
        //         sorted_contacts[con._id.user_id] = [];
        //         con.contacts.forEach(function(c){
        //           sorted_contacts[con._id.user_id].push(c._id);
        //         });              
        //       }
        //     });
        //     resolve(sorted_contacts);          
        //   });
        // });
        // var g_promise = new Promise(function(resolve,reject){
        //   mongoose.model('Group').aggregate([
        //     { 
        //       $group: {
        //         _id: {"user_id":'$user_id'}, 
        //         groups: { $push: "$$ROOT" }
        //       }
        //     },        
        //   ],function(err,groups){
        //     var sorted_groups = {};
        //     groups.forEach(function(con){
        //       if(con._id && con._id.user_id){
        //         sorted_groups[con._id.user_id] = [];
        //         con.groups.forEach(function(c){
        //           sorted_groups[con._id.user_id].push(c._id);
        //         });              
        //       }
        //     });
        //     resolve(sorted_groups);
        //   });
        // });
        // Promise.all([c_promise,g_promise]).then(function(values){
        //   var contacts = values[0];
        //   var groups = values[1];
        //   var userIds = prev_data.userIds;
        //   var group_contacts = [];
        //   for(var i=0; i< config.dummy_data.group_contact_count;i++){
        //     var user_id = chance.pick(userIds);
        //     var group_contact = {
        //       group_id: chance.pick(groups[user_id]),
        //       user_id: user_id,
        //       contact_id: chance.pick(contacts[user_id])
        //     };
        //     group_contacts.push(group_contact);
        //   }          
        //   mongoose.model('GroupContact').collection.insert(group_contacts, function (err, grpctcts) {
        //     console.log(grpctcts);
        //     console.log('Task completed.');
        //   });
        // });
      });          
    },
    create_dummy_contacts: function(count){      
      count = count || 1000;
      var batch_size = count > 100000 ? 100000 : count;
      var batch_count = Math.ceil(count/batch_size);
      var self = this;
      mongoose.model('User').findOne({username:"admin"}, function (err, user) {   
          var iscsv = true;
          var writer = null;
          if(iscsv){
            writer = csvWriter();
            writer.pipe(fs.createWriteStream(count + '_records.csv'));
          }
          self.insert_small_batch(batch_size, batch_count, user._id.toString(), iscsv, writer);        
      }); 
    },
    insert_small_batch: function(batch_size, batch_count, userid, iscsv, writer){
      console.log('Inside loop....');
      var self = this;
      var promise = new Promise(function(resolve, reject){
        var contacts = [];
        for(var j = 0; j < batch_size; j++){
          var contact = {
              fname: chance.first(),
              mname: chance.first(),
              lname: chance.last(),
              dob: chance.birthday({string: true}),
              note: chance.sentence({words: 10}) ,
              addresses: [{
                label: 'Home',
                value: chance.address()
              },{
                label: 'Office',
                value: chance.address()
              }], 
              emails: [{
                label: 'Home',
                value: chance.email(),
                is_primary: true
              },{
                label: 'Office',
                value: chance.email(),
                is_primary: false
              },{
                label: 'Office',
                value: chance.email(),
                is_primary: false
              }], 
              phones: [{
                label: 'Home',
                value: chance.phone(),
                is_primary: true
              },{
                label: 'Office',
                value: chance.phone(),
                is_primary: false
              },{
                label: 'Other',
                value: chance.phone(),
                is_primary: false
              }],
              user_id: userid,
              is_active: true,
              is_favorite: false,
              is_locked: false
            }
            if(iscsv)
              writer.write(contact);        
            else
              contacts.push(contact);    
        }
        if(iscsv)
          resolve();
        else
          mongoose.model('Contact').collection.insert(contacts, function (err, ctcts) {
            contacts = null;
            console.log("Inserted "+ batch_size + " records.");
            resolve();
          });  
      });
      promise.then(function(){
        if(batch_count > 0){
          batch_count--;
          self.insert_small_batch(batch_size, batch_count, userid, iscsv, writer);
        } else {
          console.log('All contacts imported successfully');
          if(iscsv)
            writer.end()
        }
      });
    }
  }
};