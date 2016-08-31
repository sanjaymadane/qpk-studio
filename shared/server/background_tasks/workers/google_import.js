/*
* Google Import Sync
* PARAMS
*   @task.user_id => Required user id of the context user
    @task.owner => Optional for sync
    @task.refresh_token => Required for getting the access token
*
*/

// Load helpers

var GoogleContacts = require('../../modules/google/contacts').GoogleContacts,
    mapper = require('../../helpers/contact_mapper_helper'),
    config = require('../../config/config'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    _ = require('underscore'),
    fs=  require('fs-extra'),
    path = require('path'),
    debug = require('debug')('google-contacts');

//require helpers
var googleHelper = require('../../helpers/google_helper'),
    constant = require('../../config/constant'),
    contactHelper = require('../../helpers/contact_helper');

//Load Library
var contactLibrary = require('../../library/contact'),
    groupLibrary = require('../../library/group'),
    syncLibrary = require('../../library/sync');

var publisher = require('../publisher');

module.exports = {
  processGoogleImport: function(rmq, task, callback){ 
    var self = this;

    task.status = 'Task:InProgress';
    task.progress = '10%';   
    rmq.publish('','events', _.clone(task));

    //initiate the data object
    var data = {      
      current_sync_time: Date.now()
    }

    debug(task)

    var strRefereshToken = null;
    //Check if the sync object is present in the task object
    if(task.sync) {
      data.referesh_token = task.sync.metadata.refresh_token;

      if(task.is_full_sync == false && task.sync.last_sync ) {
        data.updated_min = task.sync.last_sync;
      }

      if(task.sync.account_name){
        data.email = task.sync.account_name;
      }
    } else {
      data.referesh_token  = task.refresh_token;
      //initialize it for future use
      task.sync = null;
    }    

    self._googleSync(data, rmq, task , function(err, details){
      if(err){
        callback(false, ((data.email)? data.email: ''));
      } else {
        debug(true, task.sync.account_name);
        callback(true, task.sync.account_name);
      }
    })
    
  },

  _googleSync: function(data,rmq, task, callback){
    var self = this;
    
    //Get contacts will return an object  
    //Get generate access token  
    googleHelper.generateAccessToken(data)
    .then(function(tokenResolve){
      data.token = tokenResolve.token;
      return googleHelper.getContacts(data)
    }).then(function(contactResolve){
      // debug(contactResolve);
      task.status = 'Task:InProgress';
      task.progress = '40%'; 
      rmq.publish('','events', _.clone(task));
      return self._mapContacts(contactResolve, task);
    }).then(function(contactResolve){
      task.status = 'Task:InProgress';
      task.progress = '60%';        
      rmq.publish('','events', _.clone(task));

      //check whether this account is already sync with Qcontactz and carry on the details to the subsequent request
      return self._getSyncDetails(contactResolve, task)      
    }).then(function(mapResolve){
      task.status = 'Task:InProgress';
      task.progress = '70%';        
      rmq.publish('','events', _.clone(task));
      //Check if user want to do a forcefull import
      //Find duplicate and merge      
      return new Promise(function(resolve, reject){
        self._findDuplicates(mapResolve, task, function(err, mappedContactResolve){
          if(err){
            reject(err)
          } else {
            resolve(mappedContactResolve);
          }
          
        });
      })
      
    })
    .then(function(mappedContactResolve){
      task.status = 'Task:InProgress';
      task.progress = '80%';        
      rmq.publish('','events', _.clone(task));
      //Do the insert and delete operation for the updated contacts      
      return  self._insertUpdateContact(mappedContactResolve, task);
    })
    .then(function(modifyContactDetail){
      task.status = 'Task:InProgress';
      task.progress = '90%';        
      rmq.publish('','events', _.clone(task));
      // callback(null, '');
      // Check if sync object present
      if(modifyContactDetail.sync && modifyContactDetail.sync._id) {
        var objSync = {             
          last_sync: data.current_sync_time,
          last_sync_status: true,
          error_details: ''
        }
        debug(objSync);
        var params = {
          _id: modifyContactDetail.sync._id
        }
        syncLibrary.updatedSingleAccount(params, objSync, function(err, details){
          //even if error no worries it will create a new entry in the sync table but rest all will be updated
          callback(err, details);
        })
      } else {
        var objSync = {
          user_id: task.user_id,
          account_type: constant.constSources.GOOGLE, 
          account_name: modifyContactDetail.owner,
          group_id: modifyContactDetail.group_id,        
          last_sync: data.current_sync_time,
          last_sync_status: true,
          is_active: true,
          metadata: {
            refresh_token: data.referesh_token
          } //any general information if required to store
        }
        syncLibrary.addAccount(objSync, function(err, details){
          callback(err,details);
        })
      }
    })
    .catch(function(reject){
      debug(reject);
      debug("======================> In main reject");
      //If the sync fails make an entry in the db
      if(task.sync && task.sync._id) {
        var objSync = {        
          last_sync_status: false,
          error_details: JSON.stringify(reject)
        };        
        var params = {
          _id: task.sync._id
        };

        syncLibrary.updateAndGetSingleAccount(params, objSync, function(err, details){
          //even if error no worries it will create a new entry in the sync table but rest all will be updated        
          callback(reject);
        })

      } else {
        callback(reject);
      }
    })   
  },

  _mapContacts: function(contactResolve, task){
    //map contacts as per the Qcontactz Standard
    return new Promise(function(mapResolve, mapReject){ 
      var objMappedData = {
        contact: [],
        owner: contactResolve.owner
      }
      if(contactResolve.contact && contactResolve.contact.length > 0) {
        mapper.googlemapper(contactResolve.contact, task ,function(err, data) {
            if(err) {
              mapReject(err);
            } else {            
              objMappedData.contact = data;
              mapResolve(objMappedData);
            }
        });  
      } else {
        debug(objMappedData);
        mapResolve(objMappedData);
      }
      
    })      
  },

  _findDuplicates: function(mapResolve, task, cb){
    // debug(mapResolve)
    //find the duplicates and merge
    //check by userid, source and owner and source ids
    if(mapResolve.contact && mapResolve.contact.length > 0) {
      var objParams = {
        user_id: task.user_id,
        is_active: true
      }

      var arrSourceId = [];
      _.each(mapResolve.contact, function(contact){
        arrSourceId.push(contact.sources[0].source_id);
      })

      //Prepare the query parameters
      objParams.sources = { $elemMatch: { source_id: {$in: arrSourceId}, label: constant.constSources.GOOGLE, value: mapResolve.owner} }; 

      contactLibrary.findContact(objParams, function(err, duplicateContact){
        if(err){
          process.nextTick(function() {
            cb(err);      
          });
        } else {
          var arrMergeContact = [];
          var arrNewContactIds = [];
          var arrOldContactIds = [];

          if(duplicateContact.length > 0){

            mapResolve.contact.forEach(function(gcont){
              var notFoundGoogle = true;
              var arrDuplicateContact = [];
              _.find(duplicateContact, function(objQcontactz){
                if(gcont.sources[0].source_id == objQcontactz.sources[0].source_id ){
                  notFoundGoogle = false;
                  arrDuplicateContact.push(objQcontactz);
                  arrDuplicateContact.push(gcont);
                  arrMergeContact.push(arrDuplicateContact);
                  //Push for deletion
                  arrOldContactIds.push(objQcontactz._id);
                  return true;
                } else {
                  return false;
                }
              });
              if(notFoundGoogle){
                arrNewContactIds.push(gcont);
              }            
            });
            mapResolve.contact = arrNewContactIds;
            // debug(arrMergeContact);
            //check if merge contact array 
            if(arrMergeContact.length > 0){
              //merge contacts
              contactHelper.mergeContact(arrMergeContact, function(err, arrContact){
                if(err){
                  debug(err+ "this is the error message");
                  process.nextTick(function() {
                    cb(err);      
                  });
                } else {
                  mapResolve.old_contacts = arrOldContactIds; 
                  arrContact.forEach(function(contact){
                    mapResolve.contact.push(contact);  
                  });

                  process.nextTick(function() {
                    cb(false, mapResolve);      
                  });
                  
                }
              });          
              
              // cb(false, mapResolve);
            } else {
              cb(false, mapResolve);      
            }            
          } else {
            process.nextTick(function() {
              cb(false, mapResolve);      
            });            
          }
        }
      })
    } else {
      debug(mapResolve);
      process.nextTick(function() {
        cb(false, mapResolve);
      });
    }
  },
  _insertUpdateContact: function(mappedContactResolve, task){
    
    //insert OR update contacts 
    return new Promise(function(synContactResolve,synContactReject){
      var strGroupId = null;
      var groupPromise = new Promise(function(groupResolve, groupReject){
        // debug(mappedContactResolve.sync);
        if(mappedContactResolve.sync && mappedContactResolve.sync.group_id) {
          debug("Using old grouop id")
          strGroupId = mappedContactResolve.sync.group_id;
          groupResolve();
        } else {
          //create group
          var groupDetails = {
            name: googleHelper.getGroupName(mappedContactResolve.owner),
            user_id: task.user_id
          }

          groupLibrary.createGroup(groupDetails, function(err, details){
            if(err){
              groupReject(err);
            } else {
              debug(details);
              strGroupId = details._id.toString();
              groupResolve();
            }
          })
        }
      });

      groupPromise.then(function(resolve){
        //Insert the contacts in the db
        //Set the group id in the output object
        return new Promise(function(contactProcessResolve, contactProcessReject){
          mappedContactResolve.group_id = strGroupId;
          if(mappedContactResolve.contact.length > 0){
            debug(mappedContactResolve.contact.length + "Insert contact length=================");
            contactLibrary.insertContact(mappedContactResolve.contact)
            .then(function(docs){
              debug("contacts inserted+++++++++++++++++++++++++++");
              var groupContacts = [];
              mappedContactResolve.contact.forEach(function(ct){
                groupContacts.push({
                  user_id: task.user_id,
                  group_id: strGroupId,
                  contact_id: ct._id.toString()
                });
              });

              groupLibrary.insertGroupContact(groupContacts, function(err, details){
                if(err){
                  contactProcessReject();
                } else {
                  contactProcessResolve();
                }
              })
              
            }).catch(function(reject){
              debug(reject + "asdasdasd");
              synContactReject(reject);

            });
          } else {
            contactProcessResolve()
          }   
        });
        
      }).then(function(contactInsertResolve){
        // synContactResolve(mappedContactResolve);
        //delete old contacts from group contacts and contacts db
        if(mappedContactResolve.old_contacts && mappedContactResolve.old_contacts.length > 0) {
          debug(mappedContactResolve.old_contacts.length + "deete contact length=================");
          var objContactDeleteParams = {
            _id:{$in: mappedContactResolve.old_contacts}, 
            user_id: task.user_id
          };

          var objGroupContactDeleteParams = {
            contact_id:{$in: mappedContactResolve.old_contacts}, 
            user_id: task.user_id
          };

         var arrPromise = [];
         var contactPromise = new Promise(function(contactDeleteResolve, contactDeleteReject){
            contactLibrary.deleteContact(objContactDeleteParams, function(err,details){
              if(err) return contactDeleteReject(err)
              return contactDeleteResolve(details)
            })
         });

         arrPromise.push(contactPromise);
          
          var groupPromise = new Promise(function(groupcontactDeleteResolve, groupcontactDeleteReject){  
            groupLibrary.deleteGroupContact(objGroupContactDeleteParams, function(err, details){
              if(err) return groupcontactDeleteReject(err)
              return groupcontactDeleteResolve(details)
            })
          });

          arrPromise.push(groupPromise);

          Promise.all(arrPromise).then(function(resolve){
            synContactResolve(mappedContactResolve);
          }).catch(function(reject){
            synContactReject(reject);
          })
        } else {
          //no contacts to delete
          synContactResolve(mappedContactResolve);
        }
        
      }).catch(function(reject){
        synContactReject(reject);
      });
    });
  },
  _getSyncDetails: function(contactResolve, task){
    return new Promise(function(resolve, reject){
      if(task.sync && !_.isEmpty(task.sync)) {
        contactResolve.sync = task.sync;
        resolve(contactResolve);
      }  else {
        var params = {
          account_name: contactResolve.owner,
          account_type: constant.constSources.GOOGLE,
          user_id: task.user_id
        }
        syncLibrary.getSingleAccount(params)
        .then(function(account){
          debug(account + "in sync")
          contactResolve.sync = account;
          resolve(contactResolve);
        }).catch(function(accountReject){
          reject(accountReject);
        })
      }
    })
    
  }
}