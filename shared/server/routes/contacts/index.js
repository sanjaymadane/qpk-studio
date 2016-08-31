'use strict';

/*
 * Contact router
 */

// Load dep packages
var express = require('express'),
    router = express.Router({ mergeParams: true }),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    fs = require('fs-extra'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    moment = require('moment'),
    constant = require('../../config/constant');    

// Load helpers
var common = require('../../helpers/common_helper'),    
    contactHelper = require("../../helpers/contact_helper");
//load config file
var config = require('../../config/config');

function insertGroups(groups, user, contact){
  var group_contacts = [];
  groups.forEach(function(group, index){
    var promise = new Promise(function(resolve, reject){
      if(group && !group.group_id){
        mongoose.model('Group').create({name:group.name, user_id: user.user_id }, function(err, newgroup){
          resolve({group_id: newgroup.id,user_id: user.user_id, contact_id: contact.id});                    
        });
      } else {
        resolve({group_id: group.group_id,user_id:user.user_id, contact_id: contact.id});                  
      }
    });
    group_contacts.push(promise);              
  });
  Promise.all(group_contacts).then(function(values){
    mongoose.model('GroupContact').collection.insert(values);
  });
}

function getGroupContactIds(params){
  return new Promise(function(resolve, reject){
    mongoose.model('GroupContact').find(params, function (err, contacts) {
      if (err) {
        resolve([]);
      } else {
        var contact_ids = _.map(contacts, function(contact){ return contact.contact_id});
        resolve(contact_ids);
      }     
    });
  });
}

function deleteGroups(groups, user, contact){
  var group_ids = [];
  groups.forEach(function(group){
    if(group && group.group_id)
      group_ids.push(group.group_id);
    else 
      mongoose.model('Group').create({name:group.name, user_id: user.user_id }, function(err, newgroup){});
  });
  mongoose.model('GroupContact').remove({group_id:{$in: group_ids}, user_id: user.user_id}, function(){});
}

function processExstract(mContact, tContact, key){
  if(mContact[key]){
    if(tContact[key] && tContact[key].length > 0){
      tContact[key].forEach(function(a){
        var found = _.find(mContact[key], function(b){
          switch(key){
            case "addresses":
            case "events":
            case "im":
            case "others":
              // Compare label & value
              return b.value == a.value && b.label == a.label;
              break;
            case "emails":
            case "phones":
            case "attachments":
            case "web_pages":
              // Compare only value
              return b.value == a.value;
              break;            
          }
        });
        if(typeof found == 'undefined'){
          mContact[key].push(a);
        }        
      });
    }    
  }
  return mContact;
}

function mapAndMergeContact(mContact, tContact){
  if(!mContact.fname)
    mContact.fname = tContact.fname;
  if(!mContact.mname)
    mContact.mname = tContact.mname;
  if(!mContact.lname)
    mContact.lname = tContact.lname;
  if(!mContact.title)
    mContact.title = tContact.title;
  if(!mContact.nickname)
    mContact.nickname = tContact.nickname;
  if(!mContact.company_name)
    mContact.company_name = tContact.company_name;
  if(!mContact.profile_pic)
    mContact.profile_pic = tContact.profile_pic;
  if(!mContact.note)
    mContact.note = tContact.note;
  try{
  mContact = processExstract(mContact, tContact, 'addresses');
  mContact = processExstract(mContact, tContact, 'web_pages');
  mContact = processExstract(mContact, tContact, 'emails');
  mContact = processExstract(mContact, tContact, 'attachments');
  mContact = processExstract(mContact, tContact, 'im');
  mContact = processExstract(mContact, tContact, 'phones');
  mContact = processExstract(mContact, tContact, 'events');
  mContact = processExstract(mContact, tContact, 'others');
  mContact.sources = [];
  mContact.sources.push({label:"merged",value: mContact.user_id});
  }catch(err){
    console.log(err);
  }
  return mContact;
}

function processProfilePicUpdate(contact){
  var profile_pic = contact.profile_pic;
  var id = contact._id;
  
  ///uploads/tmp/574d62a9f05131d2172c0e61/575fbb95b3ce9efd2d664b36/575fbb95b3ce9efd2d664b36.png
  if(profile_pic && profile_pic.indexOf('tmp') !== -1){
    var dir_path = profile_pic.split('uploads/')[1].split(id + '/')[0];
    var new_dir_path = profile_pic.split('uploads/tmp/')[1].split(id + '/')[0];
    var file_name = profile_pic.split('uploads/tmp/')[1].split(id + '/')[1];
    var new_relative_path = config.media_base_path + profile_pic.split('uploads/tmp/')[1];
    var old_relative_path = config.media_base_path + profile_pic.split('uploads/')[1];
    // if(fs.existsSync(new_relative_path)){

    //Move from tmp folder to the pic folder
    mkdirp.sync(config.media_base_path + new_dir_path + id);
    fs.renameSync(old_relative_path, new_relative_path);
    contact.profile_pic = config.media_absulute_path + profile_pic.split('uploads/tmp/')[1];

    mkdirp.sync(config.media_base_path + new_dir_path + id + '/history');  
    var history_file_path = new_dir_path + id + '/history/'+ Date.now()+ '.'+ new_relative_path.split(id+'.')[1];
    var history_relative_path = config.media_base_path + history_file_path;
    fs.copySync(new_relative_path, history_relative_path);
    if(!contact.profile_pic_history)
      contact.profile_pic_history = [];
    contact.profile_pic_history.push(config.media_absulute_path + history_file_path);
    // }
  }
  return contact;
}

function processAttachmentUpdate(attachments){
  attachments.forEach( function(attachment){
    //check if the file is in temp directory or not
    if(attachment.value.indexOf('tmp') !== -1){
      var new_dir_path = attachment.value.split('/tmp/')[1].split('attachments/')[0];
      var new_relative_path = config.media_base_path + attachment.value.split('/tmp/')[1];
      var old_relative_path = config.media_base_path + 'tmp/' +attachment.value.split('/tmp/')[1];
      mkdirp.sync(config.media_base_path + new_dir_path + 'attachments');
      fs.renameSync(old_relative_path, new_relative_path);
      var filename = config.media_absulute_path + attachment.value.split('/tmp/')[1];
      attachment.value = filename.split('uploads')[1];
    }               
  });
  return attachments;
}

router.route('/')
  // GET - get list of all contacts
  .get(function(req, res, next) {      
    // Select only required fields if passed
    var fields = common.filter_fields(req.query.fields);
    // Create find criteria
    var params = { user_id: req.user_auth.user_id };
    if(req.query.get_count == 'true' || req.query.get_count == true){
      mongoose.model('Contact')
      .count(params, function(err, count){
        if (err) {
          res.json(common.pretty(false, 10000, err));
        } else {
          res.json(common.pretty(true, 10001, {count:count}));
        }
      });
    } else {
      var groupPromise;
      if(req.query.group_id && req.query.group_id != ""){
        params.group_id = req.query.group_id;
        groupPromise = getGroupContactIds(params);
      } else {
        groupPromise = new Promise(function(resolve, reject){resolve([])});
      }
      groupPromise.then(function(ids){
        delete params.group_id;
        if(req.query.group_id && req.query.group_id != ""){
          params._id = { "$in": ids };
        }
        // Manage trash contacts and active contacts
        params.is_active = req.query.is_active ? req.query.is_active : true;
        // Manage loacked contacts
        params.is_locked = req.query.is_locked ? req.query.is_locked : false;
        //get favourite contacts
        if(req.query.is_favorite != null)
          params.is_favorite = req.query.is_favorite;
        // Set page limit
        var limit = parseInt(req.query.limit? req.query.limit : 50);
        // Set search criteria
        if(req.query.s){
          var arr_s_fields = [];
          var arr_s_and_fields = [];
          if(!req.query.search_fields)
            req.query.search_fields = 'fname,lname,emails';
          var arr_fields = req.query.search_fields.split(',');
          var complex = false;
          var string1 = '';
          var string2 = '';
          var string3 = '';
          if(arr_fields.length > 0){  
            var searchArray = req.query["s"].split(" ");
            var slength = searchArray.length;          
            if(slength > 1) complex = true;
            if(arr_fields.length == 1) searchArray[0] = req.query["s"];
            switch(slength){
              case 1:
                string1 = new RegExp(searchArray[0], 'i');
                break;
              case 2:
                string1 = new RegExp(searchArray[0], 'i');
                string3 = new RegExp(searchArray[1], 'i');
                break;
              case 3:
                string1 = new RegExp(searchArray[0], 'i');
                string2 = new RegExp(searchArray[1], 'i');
                string3 = new RegExp(searchArray[2], 'i');
                break;
              default:
                string1 = new RegExp(searchArray[0], 'i');              
            }  
                     
            var regex = new RegExp(req.query["s"], 'i');
            arr_fields.forEach(function(field){
              switch(field){
                case 'fname':
                  if(complex)
                    arr_s_and_fields.push({fname: string1});
                  else
                    arr_s_fields.push({fname: string1});
                  break;
                case 'lname':
                  if(complex)
                    if(string3 != '') arr_s_and_fields.push({lname: string3});
                  else
                    arr_s_fields.push({fname: string1});
                  break;
                case 'mname':
                  if(complex)
                    if(string2 != '') arr_s_and_fields.push({mname: string2});
                  else
                    arr_s_fields.push({fname: string1});
                  break;
                case 'company_name':
                  arr_s_fields.push({company_name: string1});
                  break;
                case 'note':
                  arr_s_fields.push({note: string1});
                  break;
                case 'emails':
                  if(!complex)
                    arr_s_fields.push({emails: { $elemMatch:{ value: string1 }}});
                  break;
                case 'phones':
                  arr_s_fields.push({phones: { $elemMatch:{ value: string1 }}});
                  break;
                case 'im':
                  arr_s_fields.push({im: { $elemMatch:{ value: string1 }}});
                  break;
                case 'addresses':
                  arr_s_fields.push({addresses: { $elemMatch:{ value: string1 }}});
                  break;
                default:
                  //arr_s_fields.push({fname: regex}, {lname: regex}, {emails: { $elemMatch:{ value: regex }}});
              }
            });
          }        
          if(arr_s_fields.length > 0)
            params.$or = arr_s_fields; 
          if(arr_s_and_fields.length > 0) 
            params.$and = arr_s_and_fields;
        }    
        if(req.query.sortby == 'usage') {
          params.usage = { $gt: 0 }
        }
        // Set skip count
        var page = Math.max(0, req.query.page || 0);

        // sort params
        var sortParam = {};
        var sortOrder = (typeof req.query.sortorder !== 'undefined') ? req.query.sortorder : 1;
        var sortbystring = '';
        switch(req.query.sortby){
          case 'usage':
            sortParam['usage'] = sortOrder;
            break;
          case 'fname':
            sortbystring = 'fname';
            sortParam['fname'] = sortOrder;
            break;
          case 'lname':
            sortbystring = 'lname';
            sortParam['lname'] = sortOrder;
            break;
          case 'updated_on':
            sortParam['updated_on'] = sortOrder;
            break;
          default:
            sortbystring = 'fname';
            sortParam['fname'] = sortOrder;
            sortParam['lname'] = sortOrder;
        }
        
        // Execute query    
        mongoose.model('Contact')
        .count(params, function(err, count){
          if (err) {
            res.json(common.pretty(false, 10000, err));
          } else {
            if(count == 0) {
              res.json(common.pretty(true, 10001, {total:0, data: [], page: page, current_count: 0, pages: 0}));
            } else {  
              if(sortbystring != '' && req.query["s"] == ''){
                var paramList = _.clone(params);    
                paramList[sortbystring] = {'$exists': true, '$ne': null, '$ne': "" };
                mongoose.model('Contact')
                  .count(paramList,function (err, contCount) {
                    if (err || contCount == null) {
                      res.json(common.pretty(false, 10000, err));
                    } else {
                      var pages = Math.ceil(count/limit);
                      if(contCount >= 0){
                        var validPages = (Math.ceil(contCount/limit)-1);
                        if(contCount > 0 && (validPages > page || (validPages == page && contCount%limit == 0))){
                          mongoose.model('Contact')
                          .find(paramList, fields, { limit:limit, skip:page*limit, sort:sortParam },function (err, contacts) {
                            if (err || contacts == null) {
                              res.json(common.pretty(false, 10000, err));
                            } else {
                              res.json(common.pretty(true, 10001, {total:count, data: contacts, page: page, current_count: contacts.length, pages: pages}));
                            }     
                          });
                        } else if(contCount > 0 && (validPages == page && contCount%limit != 0)) {
                          var extraContacts = contCount%limit;
                          mongoose.model('Contact')
                          .find(paramList, fields, { limit:limit, skip:page*limit, sort:sortParam },function (err, contacts) {
                            if (err || contacts == null) {
                              res.json(common.pretty(false, 10000, err));
                            } else {
                              paramList = _.clone(params);
                              skipCount = (limit - contacts.length);
                              if(sortbystring == 'fname'){
                                paramList.$or = [{"fname": { '$exists': false} },{"fname": { '$eq': null} },{"fname": { '$eq': ""} }];
                              } else {
                                paramList.$or = [{"lname": { '$exists': false} },{"lname": { '$eq': null} },{"lname": { '$eq': ""} }];
                              }
                              mongoose.model('Contact')
                              .find(paramList, fields, { limit:(limit-contacts.length), skip:0, sort:sortParam },function (err, contactsNext) {
                                if (err || contactsNext == null) {
                                  res.json(common.pretty(false, 10000, err));
                                } else {
                                  contacts = contacts.concat(contactsNext);
                                  var pages = Math.ceil(count/limit);
                                  res.json(common.pretty(true, 10001, {total:count, data: contacts, page: page, current_count: contacts.length, pages: pages}));
                                }     
                              });
                            }     
                          });
                        } else {
                          paramList = _.clone(params);
                          if(sortbystring == 'fname'){
                            paramList.$or = [{"fname": { '$exists': false} },{"fname": { '$eq': null} },{"fname": { '$eq': ""} }];
                          } else {
                            paramList.$or = [{"lname": { '$exists': false} },{"lname": { '$eq': null} },{"lname": { '$eq': ""} }];
                          }
                          var skipCount = contCount > 0 ? (limit - contCount%limit) : 0;
                          mongoose.model('Contact')
                          .find(paramList, fields, { limit:limit, skip:skipCount, sort:sortParam },function (err, contacts) {
                            if (err || contacts == null) {
                              res.json(common.pretty(false, 10000, err));
                            } else {
                              res.json(common.pretty(true, 10001, {total:count, data: contacts, page: page, current_count: contacts.length, pages: pages}));
                            }     
                          });
                        }
                      } else
                        res.json(common.pretty(true, 10001, {total:0, data: [], page: page, current_count: 0, pages: 0}));
                    }     
                  });
              } else {
                mongoose.model('Contact')
                .find(params, fields, { limit:limit, skip:page*limit, sort:sortParam },function (err, contacts) {
                  if (err || contacts == null) {
                    res.json(common.pretty(false, 10000, err));
                  } else {
                    var pages = Math.ceil(count/limit);
                    res.json(common.pretty(true, 10001, {total:count, data: contacts, page: page, current_count: contacts.length, pages: pages}));
                  }     
                });
              }
            }
          }
        });
      });   
    } 
  })

  // POST - create new contact
  .post(function(req, res) {
    if(!req.body._id)
      req.body._id = mongoose.mongo.ObjectId();
    req.body.user_id = req.user_auth.user_id;
    if(req.body.profile_pic){
      req.body = processProfilePicUpdate(req.body);      
    } else {
      req.body.profile_pic = config.default_profile_pic;
    }
    
    //check if attachement object is present    
    if(req.body.attachments && req.body.attachments.length > 0) {
      req.body.attachments = processAttachmentUpdate(req.body.attachments);
    }      

    contactHelper.purifyAndModifyContactDetail(req.body).then(function(resolve){      
      mongoose.model('Contact').create(resolve, function (err, contact) {        
        if (err || !contact) {
          res.json(common.pretty(false, 10000, err));
        } else {          
          if(req.body.groups && req.body.groups.length > 0){
            insertGroups(req.body.groups, req.user_auth, contact);
          }
          res.json(common.pretty(true, 10001, contact._id));
        }
      });  
    }).catch(function(reject){
        res.json(common.pretty(false, 10000, reject));
    });    
  });

function buildField(field, text){
  var obj_field = null;
  text = new RegExp(text, 'i');
  switch(field){
    case 'fname':
      obj_field = {fname: text};
      break;
    case 'lname':
      obj_field = {lname: text};
      break;
    case 'mname':
      obj_field = {mname: text};
      break;
    case 'nickname':
      obj_field = {nickname: text};
      break;
    case 'emails':
      obj_field = {emails: { $elemMatch:{ value: text }}};
      break;
    case 'phones':
      obj_field = {phones: { $elemMatch:{ value: text }}};
      break;
    case 'company_name':
      obj_field = {company_name: text};
      break;
    case 'im':
      obj_field = {im: { $elemMatch:{ value: text }}};
      break;
    case 'addresses':
      obj_field = {addresses: { $elemMatch:{ value: text }}};
      break;
    case 'web_pages':
      obj_field = {web_pages: { $elemMatch:{ value: text }}};
      break;
    case 'note':
      obj_field = {note: text};
      break;
    default:  
      obj_field = null;              
  }
  return obj_field;
}

function executeSearchQuery(params, fields, options, callback){
  mongoose.model('Contact')
  .find(params, fields, options,function (err, contacts) {
    callback(err, contacts);    
  });
}

function prepareSearchQueryMulti(params, fields, options, arr_priorities_seq, str_search_text, limit, contacts, callback){
  if(arr_priorities_seq.length > 0){
    var arr_search_text = str_search_text.split(" ");
    var bool_multi_string_search = arr_search_text.length > 1 ? true : false;

    if(arr_search_text.length > 1 && (arr_priorities_seq.indexOf('fname') != -1 || arr_priorities_seq.indexOf('lname') != -1 || arr_priorities_seq.indexOf('mname') != -1 || arr_priorities_seq.indexOf('nickname') != -1)){
      var arr_s_and_fields = getNameFieldFilter(arr_search_text);
      params.$or = [{'$and': arr_s_and_fields }];
      arr_priorities_seq = _.filter(arr_priorities_seq, function(v){ return constant.constNamePriorityFieldListMultiString.indexOf(v) == -1});
    } else { 
      if(arr_priorities_seq.length > 0){
        var field = arr_priorities_seq.shift();
        var obj_field = buildField(field, str_search_text);
        if(obj_field && (!bool_multi_string_search || (bool_multi_string_search && constant.constAvoidFieldListMultiString.indexOf(field) == -1)))
          params.$or = [obj_field];   
      }   
    }

    if(contacts.length > 0){
      params._id = { "$nin": _.map(contacts, function(v,k){ return v._id;})};
    }
    options.limit = options.limit - contacts.length;
    executeSearchQuery(params, fields, options, function(err, conts){
      if (conts && conts.length > 0) {
        contacts = contacts.concat(conts);
        if(contacts.length == limit){
          callback(null, contacts);
        } else {
          prepareSearchQueryMulti(params, fields, options, arr_priorities_seq, str_search_text, limit, contacts, function(errs, arr_contacts){
            callback(errs, arr_contacts);
          });
        }
      } else {
        prepareSearchQueryMulti(params, fields, options, arr_priorities_seq, str_search_text, limit, contacts, function(errs, arr_contacts){
          callback(errs, arr_contacts);
        });
      }      
    });
  } else {
    callback(null, contacts);
  }
}

function executeSearchQueryMultiField(params, fields, options, arr_search_in_fields, limit, str_search_text, callback){
  var arr_priorities = constant.constPriorityFieldList;
  // with space search - (fname.mname,lname,nickname),company_name,addresses,note
  var arr_multi_text_priorities = constant.constPriorityFieldListMultiString;
  var arr_priorities_seq = [];
  var contacts = [];
  var errs = null;
  
  arr_priorities.forEach(function(val){
    if(arr_search_in_fields.indexOf(val) != -1)
      arr_priorities_seq.push(val);
  });

  prepareSearchQueryMulti(params, fields, options, arr_priorities_seq, str_search_text, limit, contacts, callback);
}

function getNameFieldFilter(arr_search_text){
  var obj_field = null;
  var arr_s_and_fields = [];
  switch(arr_search_text.length){
    case 1:
      obj_field = buildField('fname', arr_search_text[0]);
      if(obj_field)
        arr_s_and_fields.push(obj_field);
      break;
    case 2:
      obj_field = buildField('fname', arr_search_text[0]);
      if(obj_field)
        arr_s_and_fields.push(obj_field);
      obj_field = buildField('lname', arr_search_text[1]);
      if(obj_field)
        arr_s_and_fields.push(obj_field);
      break;
    case 3:
      obj_field = buildField('fname', arr_search_text[0]);
      if(obj_field)
        arr_s_and_fields.push(obj_field);
      obj_field = buildField('mname', arr_search_text[1]);
      if(obj_field)
        arr_s_and_fields.push(obj_field);
      obj_field = buildField('lname', arr_search_text[2]);
      if(obj_field)
        arr_s_and_fields.push(obj_field);
      break;
    case 4:
      obj_field = buildField('fname', arr_search_text[0]);
      if(obj_field)
        arr_s_and_fields.push(obj_field);
      obj_field = buildField('mname', arr_search_text[1]);
      if(obj_field)
        arr_s_and_fields.push(obj_field);
      obj_field = buildField('lname', arr_search_text[2]);
      if(obj_field)
        arr_s_and_fields.push(obj_field);
      obj_field = buildField('nickname', arr_search_text[3]);
      if(obj_field)
        arr_s_and_fields.push(obj_field);
      break;
    default:
  } 
  return arr_s_and_fields;
}

router.route('/search')
  // GET - Search in all contacts
  .get(function(req, res, next) {      
    // Select only required fields if passed
    var fields = common.filter_fields(req.query.fields);
    // Create find criteria
    var params = { user_id: req.user_auth.user_id };
  
    // Manage trash contacts and active contacts
    params.is_active = true;
    // Manage loacked contacts
    params.is_locked = false;
    
    // Set page limit
    var limit = parseInt(req.query.limit? req.query.limit : 50);

    // Set skip count
    var page = Math.max(0, req.query.page || 0);
    
    if(!req.query.s || req.query.s == '' || req.query.s.length == 0){
      res.json(common.pretty(false, 10028, ''));
    } else {      
      req.query.search_in_fields = req.query.search_in_fields || 'fname,lname,emails';
      var arr_s_or_fields = [];
      var arr_s_and_fields = [];
      var arr_search_in_fields = req.query.search_in_fields.split(',');
      var arr_search_text = req.query["s"].split(" ");
      arr_search_text = _.filter(arr_search_text, function(val){ return val && val != ''; });
      var bool_multi_string_search = arr_search_text.length > 1 ? true : false;
      var str_search_text = req.query["s"];
      

      if(bool_multi_string_search){
        if(arr_search_in_fields.indexOf('fname') != -1){
          arr_s_or_fields.push({'$and':getNameFieldFilter(arr_search_text)});                   
        }        
      } 
      var arr_avoid_fields = constant.constAvoidFieldListMultiString;
      arr_search_in_fields.forEach(function(field){        
        var obj_field = buildField(field, str_search_text);        
        if(obj_field && (!bool_multi_string_search || (bool_multi_string_search && arr_avoid_fields.indexOf(field) == -1))){
          arr_s_or_fields.push(obj_field);
        }
      });

      // sort params
      var sortParam = {};
      var sortOrder = (typeof req.query.sortorder !== 'undefined') ? req.query.sortorder : 1;
      var sortbystring = '';
      switch(req.query.sortby){
        case 'usage':
          sortParam['usage'] = -1;
          break;
        case 'fname':
          sortbystring = 'fname';
          sortParam['fname'] = sortOrder;
          break;
        case 'lname':
          sortbystring = 'lname';
          sortParam['lname'] = sortOrder;
          break;
        case 'updated_on':
          sortParam['updated_on'] = sortOrder;
          break;
        default:
          sortbystring = 'fname';
          sortParam['fname'] = sortOrder;
          sortParam['lname'] = sortOrder;
      }
      
      if(arr_s_or_fields.length > 0 || arr_s_and_fields.length > 0){
        if(arr_s_or_fields.length > 0)
          params.$or = arr_s_or_fields;
        if(arr_s_and_fields.length > 0)
          params.$and = arr_s_and_fields;
      } else {
        res.json(common.pretty(false, 10029, ''));
        return;
      }
      
      // Execute query    
      mongoose.model('Contact')
      .count(params, function(err, count){
        if (err) {
          res.json(common.pretty(false, 10000, err));
        } else {
          if(count == 0) {
            res.json(common.pretty(true, 10001, {total:0, data: [], page: page, current_count: 0, pages: 0}));
          } else {  
            var options = { limit:limit, skip:page*limit, sort:sortParam };
              executeSearchQueryMultiField(params, fields, options, arr_search_in_fields, limit, req.query["s"], function(errs, contacts){
                if (errs|| contacts == null) {
                  res.json(common.pretty(false, 10000, errs));
                } else {
                  var pages = Math.ceil(count/limit);
                  res.json(common.pretty(true, 10001, {total:count, data: contacts, page: page, current_count: contacts.length, pages: pages}));
                }
              });
          }
        }
      });
    }
  });

router.route('/batch_update')
  // POST - Batch update contacts
  .post(function(req, res, next) {    
    if(req.body.contact_ids && req.body.contact_ids.length > 0 && req.body.update_data){
        var batch_promises = [];
        if(req.body.update_data.groups){
            
          if(req.body.update_data.groups.checked && req.body.update_data.groups.checked.length > 0) {
            var pro_checked = new Promise(function(resolve, reject){
              var group_contacts = [];
              req.body.update_data.groups.checked.forEach(function(group, index){
                var promise = new Promise(function(resolve, reject){
                  if(group && !group.group_id){
                    mongoose.model('Group').create({name:group.name, user_id: req.user_auth.user_id }, function(err, newgroup){
                      resolve({group_id: newgroup.id,user_id:req.user_auth.user_id});                    
                    });
                  } else {
                    resolve({group_id: group.group_id,user_id:req.user_auth.user_id});                  
                  }
                });
                group_contacts.push(promise);              
              });
              Promise.all(group_contacts).then(function(values){
                var group_contact_list = [];
                req.body.contact_ids.forEach(function(contact){
                  values.forEach(function(gc){
                    var g = JSON.parse(JSON.stringify(gc));
                    g.contact_id = contact;
                    group_contact_list.push(g);
                  });
                });
                mongoose.model('GroupContact').collection.insert(group_contact_list);
                resolve();
              });
            });
            batch_promises.push(pro_checked);
          }

          if(req.body.update_data.groups && req.body.update_data.groups.unchecked && req.body.update_data.groups.unchecked.length > 0) {
            var pro_unchecked = new Promise(function(resolve, reject){
              req.body.update_data.groups.unchecked.forEach(function(group, index){
                if(group && group.group_id){
                  var cond = {contact_id: {$in: req.body.contact_ids }, user_id: req.user_auth.user_id, group_id: group.group_id };
                  mongoose.model('GroupContact').remove(cond, function(err, ress){});
                }
                else if (group && group.name)
                  mongoose.model('Group').create({name:group.name, user_id: req.user_auth.user_id }, function(err, newgroup){});
                else {}
                resolve();
              });
            });
            batch_promises.push(pro_unchecked);
          }
        }
        var update_obj = {};
        if(typeof req.body.update_data.is_active !== 'undefined'){
          if(req.body.update_data.is_active == false || req.body.update_data.is_active == 'false'){
            mongoose.model('GroupContact').remove({contact_id: {$in: req.body.contact_ids}, user_id: req.user_auth.user_id}, function(err, ress){});
          } 
          update_obj.is_active = req.body.update_data.is_active;      
        } 
        if(typeof req.body.update_data.is_favorite !== 'undefined'){
          update_obj.is_favorite = req.body.update_data.is_favorite;
        } 
        if(typeof req.body.update_data.is_locked !== 'undefined'){
          update_obj.is_locked = req.body.update_data.is_locked;
        }
        if(!_.isEmpty(update_obj)) {
          update_obj.updated_on = new Date();
          var pro_update = new Promise(function(resolve, reject){
            mongoose.model('Contact').update({'_id': {$in: req.body.contact_ids}}, {$set: update_obj}, { multi: true }, function(err, updated){
              if(err) {
                resolve(err);
              } else {
                resolve();
              }            
            });
          }); 
          batch_promises.push(pro_update);  
        } 
        Promise.all(batch_promises).then(function(values){
          res.json(common.pretty(true, 10001, '')); 
        });
    } else {
      res.json(common.pretty(false, 10000, ''));
    }
  });

router.route('/batch_insert')
  // POST - Batch insert contacts
  .post(function(req, res, next) {    
    if(req.body.contacts && req.body.contacts.length > 0){
      var arrContacts = [];
      var source_present = true;
      req.body.contacts.forEach(function(contact){
        var objContact = {
          is_active: true,
          is_favorite: false,
          is_locked: false,
          created_on: new Date(),
          updated_on: new Date(),
          user_id: req.user_auth.user_id
        };
        if(contact.sources && contact.sources.length > 0)
          objContact.sources = contact.sources;
        else
          source_present = false;
        if(contact.title)
          objContact.title = contact.title;
        if(contact.fname)
          objContact.fname = contact.fname;
        if(contact.lname)
          objContact.lname = contact.lname;
        if(contact.mname)
          objContact.mname = contact.mname;
        if(contact.nickname)
          objContact.nickname = contact.nickname;
        if(contact.company_name)
          objContact.company_name = contact.company_name;
        if(contact.profile_pic)
          objContact.profile_pic = contact.profile_pic;
        if(contact.note)
          objContact.note = contact.note;
        if(contact.addresses && contact.addresses.length)
          objContact.addresses = contact.addresses;
        if(contact.im && contact.im.length > 0)
          objContact.im = contact.im;
        if(contact.phones && contact.phones.length > 0) {
          objContact.phones = contact.phones;                
        }
        if(contact.events && contact.events.length > 0)
          objContact.events = contact.events;
        if(contact.others && contact.others.length > 0)
          objContact.others = contact.others;

        arrContacts.push(objContact);
      });
      if(source_present && arrContacts.length > 0){
        contactHelper.purifyAndModifyContactDetail(arrContacts).then(function(resolve){
          mongoose.model('Contact').collection.insert(resolve, function(err, data){
            if(err) return res.json(common.pretty(false, 10000, reject));
            return res.json(common.pretty(true, 10001, ''));
          });
        }).catch(function(reject){
          res.json(common.pretty(false, 10000, reject));
        });         
      } else 
        res.json(common.pretty(false, 10000, 'Invalid params'));
    } else {
      res.json(common.pretty(false, 10000, 'Invalid params'));
    }
  });

router.route('/batch_delete')
  // POST - Batch delete contacts permanant
  .post(function(req, res, next) {    
    if((req.body.contact_ids && req.body.contact_ids.length > 0) || req.body.remove_all){
      var params = {
        user_id: req.user_auth.user_id
      };
      
      if(req.body.contact_ids && req.body.contact_ids.length > 0){
        params.contact_id = {$in: req.body.contact_ids};
      }
      mongoose.model('GroupContact').remove(params, function(err, ress){});
      delete params.contact_id;
      if(req.body.contact_ids && req.body.contact_ids.length > 0){
        params._id = {$in: req.body.contact_ids};
      }
      if(req.body.trash_only == 'true' || req.body.trash_only == true){
        params.is_active = false;
      }
      mongoose.model('Contact').remove(params, function(err, data){
        res.json(common.pretty(true, 10001, '')); 
      });
    } else{
      res.json(common.pretty(false, 10000, 'Invalid params'));
    }
  });

router.route('/batch_group_status')
  // POST - Get batch contact group status
  .post(function(req, res, next) {    
    var contact_ids = req.body.contact_ids;

    if(contact_ids && contact_ids.length > 0){
      mongoose.model('GroupContact').find({user_id: req.user_auth.user_id, contact_id: {$in:contact_ids}},function(err, ctgroups){
        if(err || !ctgroups)
          res.json(common.pretty(false, 10000, err));
        else {
          var groups = [];
          var groupcontacts = {};
          ctgroups.forEach(function(ctg){
            groups.push(ctg.group_id);
            if(!groupcontacts[ctg.group_id])
              groupcontacts[ctg.group_id] = 0;
            groupcontacts[ctg.group_id]++;
          });
          
          groups = _.uniq(groups);    
          var results = [];
          groups.forEach(function(grp){
            var status = {
              status: 'partial',
              group_id: grp
            };
            if(groupcontacts[grp] == contact_ids.length){
              status.status = 'all';
            }  
            results.push(status);          
          });
          res.json(common.pretty(true, 10001, results));
        }
      });
    } else {
      res.json(common.pretty(false, 10000, ''));
    } 
  });

router.route('/duplicate')
  // GET - get list of duplicate all contacts
  .get(function(req, res, next) {    
    // Create find criteria
    var params = { user_id: req.user_auth.user_id };
    // // Manage trash contacts and active contacts
    params.is_active = true;
    // // Manage loacked contacts
    params.is_locked = false;
    
    // Set page limit
    var limit = parseInt(req.query.limit? req.query.limit : 50);
        
    // // Set skip count
    var page = Math.max(0, req.query.page || 0);

    var skip = page * limit;
    var paramList = [
      { 
        $match: params 
      },
      { 
        $group: { 
          _id: { 
            fname: "$fname",
            mname: "$mname",
            lname: "$lname"
          }, 
          count: { 
            $sum: 1 
          }
        }
      }, 
      { 
        $match: { 
          count: { $gt: 1 },
        }
      },
      {
        $group: {
          _id: null,
          count: {$sum: 1}
        }
      }
    ];
    mongoose.model('Contact').aggregate(paramList,function (err, contactsCount){
      if (err) {
        res.json(common.pretty(false, 10000, err));
      } else {
        if(contactsCount && contactsCount.length > 0 && contactsCount[0].count > 0){  
          paramList = [
            { 
              $match: params 
            },
            { 
              $group: { 
                _id: { 
                  fname: "$fname",
                  mname: "$mname",
                  lname: "$lname"
                }, 
                ids: { 
                  $addToSet: "$_id" 
                },
                count: { 
                  $sum: 1 
                },
                contacts: { 
                  $push: "$$ROOT" 
                }
              }
            }, 
            { 
              $match: { 
                count: { $gt: 1 },
              }
            },
            {$skip: skip},
            {$limit: limit}
          ];
          mongoose.model('Contact').aggregate(paramList,function (err, contacts){
            if (err) {
              res.json(common.pretty(false, 10000, err));
            } else {
              if(contacts && contacts.length > 0){          
                contacts = _.filter(contacts, function(contact){
                  var name = "";
                  if(contact._id.fname)
                    name = contact._id.fname;
                  if(contact._id.mname)
                    name += contact._id.mname;
                  if(contact._id.lname)
                    name += contact._id.lname;
                  return (name != "")
                });
                var total = contactsCount[0].count;
                var pages = Math.ceil(total/limit);
                res.json(common.pretty(true, 10001, {total:total, data: contacts, page: page, current_count: contacts.length, pages: pages}));              
              } else 
                res.json(common.pretty(true, 10001, {total:0, data: [], page: page, current_count: 0, pages: 0}));
            }                
          });             
        } else 
          res.json(common.pretty(true, 10001, {total:0, data: [], page: page, current_count: 0, pages: 0}));
      }                
    });    
  });

router.route('/merge')
  // POST - Merge contacts
  .post(function(req, res, next) {    
    if(req.body.ids && req.body.ids.length > 0){
      var params = { 
        user_id: req.user_auth.user_id,
        is_active: true,
        is_locked: false
      };
      var promises = [];
      req.body.ids.forEach(function(ids){
        params._id = {"$in": ids};
        var promise = new Promise(function(resolve, reject){
          mongoose.model('Contact').find(params, function(err, contacts){
            if (err || !contacts) {
              console.log("Merge contacts => " + err);
              resolve([]);
            } else {
              resolve(contacts);
            }             
          });
        });
        promises.push(promise);
      });
      Promise.all(promises).then(function(values){
        if(values && values.length > 0){
          var mergedContacts = [];
          var mergeHistories = [];
          var deleteIds = [];
          values.forEach(function(mergeArray){
            if(mergeArray && mergeArray.length > 1){
              var mergedContact = null;
              mergeArray.forEach(function(cont){
                if(mergedContact == null)
                  mergedContact = cont;
                else if(moment(mergedContact.updated_on).millisecond() < moment(cont.updated_on).millisecond()){
                  mergedContact = cont;
                }
              });              
              mergeArray.forEach(function(contact){
                if(mergedContact && contact && mergedContact._id != contact._id){
                  mergedContact = mapAndMergeContact(mergedContact, contact);
                }
                deleteIds.push(contact._id);
              });
              mergedContact._id = mongoose.mongo.ObjectId();
              mergedContacts.push(mergedContact);
              var response = {
                contacts: mergeArray, 
                user_id: req.user_auth.user_id, 
                merged_contact: mergedContact,
              };
              mergeHistories.push(response);
            }
          });          
          var params = { 
            user_id: req.user_auth.user_id,
            contact_id: {"$in": deleteIds}
          };
          if(mergedContacts.length > 0){
            mongoose.model('GroupContact').find(params, {'group_id':1}, function(err, gcIds){
              if (err || !gcIds) {
                res.json(common.pretty(false, 10000, err));
              } else {
                var groupIds = _.map(gcIds, function(g){
                  return g.group_id;
                });
                groupIds = _.unique(groupIds);
                var groupContacts = [];
                if(groupIds && groupIds.length > 0){
                  groupIds.forEach(function(gid){
                    mergedContacts.forEach(function(cid){
                      groupContacts.push({group_id:gid, contact_id:cid._id,user_id:req.user_auth.user_id});
                    });                    
                  });
                }
                var finalPromises = [];
                // Create merged contacts, group contacts and merge history
                if(groupContacts.length > 0){
                  var promiseDelGC = new Promise(function(resolve, reject){
                    mongoose.model('GroupContact').remove({contact_id: {$in: deleteIds}}, function(err, data){
                      resolve('GroupContacts Deleted');
                    }); 
                  });
                  finalPromises.push(promiseDelGC);
                  var promiseInsGC = new Promise(function(resolve, reject){
                    mongoose.model('GroupContact').collection.insert(groupContacts);
                    resolve('GroupContact inserted');
                  });
                  finalPromises.push(promiseInsGC);
                }
                if(mergedContacts.length > 0){
                  var promiseDelC = new Promise(function(resolve, reject){                    
                    mongoose.model('Contact').remove({_id: {$in: deleteIds}}, function(err, data){
                      resolve('Contacts deleted');
                    });
                  });
                  finalPromises.push(promiseDelC);
                  var promiseInsC = new Promise(function(resolve, reject){
                    mergedContacts = JSON.parse(JSON.stringify(mergedContacts));
                    mergedContacts.forEach(function(ct){
                      ct._id = mongoose.mongo.ObjectId(ct._id);
                    });
                    mongoose.model('Contact').collection.insert(mergedContacts, function(err, data){
                      resolve('Contact inserted');                                      
                    });
                  });
                  finalPromises.push(promiseInsC);
                }
                if(mergeHistories.length > 0){
                  var promiseInsMH = new Promise(function(resolve, reject){
                    mergeHistories = JSON.parse(JSON.stringify(mergeHistories));
                    mongoose.model('MergeHistory').collection.insert(mergeHistories, function(err, data){
                      resolve('MergeHistory inserted');
                    });                  
                  });
                  finalPromises.push(promiseInsMH);
                }
                Promise.all(finalPromises).then(function(vals){
                  res.json(common.pretty(true, 10001, vals));
                });                
              }             
            });
          } else {
            res.json(common.pretty(false, 10000, "No contacts to merge")); 
          }
          //"Merge completed."          
        } else
          res.json(common.pretty(false, 10000, "No contacts to merge"));          
      });
    } else
      res.json(common.pretty(false, 10000, "No ids param found"));
  });

router.route('/merge_restore')
  // POST - Batch delete contacts permanant
  .post(function(req, res, next) {   
    if(req.body.history && req.body.history.length > 0){
      var history_ids = [];
      req.body.history.forEach(function(history){
        history_ids.push(history.id);
      });
      var params = { 
        user_id: req.user_auth.user_id,
        _id: {$in: history_ids}
      };
      var arrContacts = [];
      mongoose.model('MergeHistory').find(params, function (err, contacts){
        if (err) {
          res.json(common.pretty(false, 10000, err));
        } else {
          if(contacts && contacts.length > 0){
            contacts.forEach(function(contact){
              var found = _.find(req.body.history, function(hist){
                return hist.id == contact._id;
              });
              if(typeof found !== 'undefined' && contact.contacts && contact.contacts.length > 0 && found.contact_ids && found.contact_ids.length > 0){
                contact.contacts.forEach(function(cont){
                  var fd = _.find(found.contact_ids, function(id){
                    return cont._id == id;
                  });
                  if(typeof fd !== 'undefined' && cont){
                    var c = JSON.parse(JSON.stringify(cont));
                    var historyObject = {};
                    if(!contact.restore_ids)
                      historyObject.restore_ids = [];
                    else
                      historyObject.restore_ids = contact.restore_ids;
                    historyObject.restore_ids.push(c._id);
                    mongoose.model('MergeHistory').findByIdAndUpdate(contact._id, {$set: historyObject}, function (err, objHist) {
                    });
                    delete c._id;
                    arrContacts.push(c);
                  }
                });
              }
            });
          }
          if(arrContacts.length > 0){
            mongoose.model('Contact').collection.insert(arrContacts ,function(err, docs){
              if(err){
                res.json(common.pretty(false, 10000, err));
              } else {
                res.json(common.pretty(true, 10001, "Restore success."));      
              }
            });
          } else
            res.json(common.pretty(false, 10000, 'No contact_ids match.'));       
        }                
      });
    } else
      res.json(common.pretty(false, 10000, "No `history` provided."));
  });

router.route('/merge_history')
  // POST - Batch delete contacts permanant
  .get(function(req, res, next) {   
    var params = { user_id: req.user_auth.user_id };
 
    // Set page limit
    var limit = parseInt(req.query.limit? req.query.limit : 50);
        
    // // Set skip count
    var page = Math.max(0, req.query.page || 0);

    var skip = page * limit; 

    mongoose.model('MergeHistory').count(params,function (err, count){
      if (err) {
        res.json(common.pretty(false, 10000, err));
      } else {
        if(count && count > 0){
          mongoose.model('MergeHistory').find(params, function (err, history){
            if (err) {
              res.json(common.pretty(false, 10000, err));
            } else {
              var pages = Math.ceil(count/limit);
              res.json(common.pretty(true, 10001, {total:count, data: history, page: page, current_count: history.length, pages: pages}));              
            }                
          }).limit(limit)
            .skip(page*limit);          
        } else 
          res.json(common.pretty(true, 10001, {total:0, data: [], page: page, current_count: 0, pages: 0}));
      }                
    });   
  });

router.route('/add_usage')
  // POST - Batch delete contacts permanant
  .post(function(req, res, next) {   
    if(req.body.ids && req.body.ids.length > 0){
      var params = { 
        user_id: req.user_auth.user_id,
        _id: {$in: req.body.ids}
      };      
      mongoose.model('Contact').update(params, {$inc: {usage: 1}}, {multi: true}, function (err, contact) {
        if(err)
          res.json(common.pretty(false, 10000, err));
        else
          res.json(common.pretty(true, 10001, ""));
      });  
    } else
       res.json(common.pretty(false, 10000, "`ids` not provided"));
  });
  
// Route middleware to validate :id
router.param('id', function(req, res, next, id) {
  mongoose.model('Contact').findById(id, function (err, contact) {
    if (err) {
      res.json(common.pretty(false, 10000, err));
    } else {            
      req.id = id;
      next(); 
    } 
  });
});

router.route('/:id')
  // GET - contact by id
  .get(function(req, res) {
    var fields = common.filter_fields(req.query.fields);
    mongoose.model('Contact').findById(req.id, fields, function (err, contact) {
      if (err || !contact) {
        res.json(common.pretty(false, 10000, err));
      } else {
        if(contact.is_active == true) {
          if(contact.profile_pic && contact.profile_pic.indexOf(config.default_profile_pic) !== -1){
            var extension = path.extname(config.default_profile_pic)
            var strContactFullPic = path.basename(config.default_profile_pic, extension) + '_full'+ extension;
            contact.profile_pic = path.dirname(contact.profile_pic) + '/' + strContactFullPic; 
          }
          res.json(common.pretty(true, 10001, contact));  
        } else {
          res.json(common.pretty(false, 10021, ''));  
        }
        
      }
    });
  })
  
  //PUT - update a contact by ID
  .put(function(req, res) {
    req.body.updated_on = new Date();
    if(req.body.profile_pic)
      req.body = processProfilePicUpdate(req.body);
    
    //check if attachement object is present    
    if(req.body.attachments && req.body.attachments.length > 0) {
      req.body.attachments = processAttachmentUpdate(req.body.attachments);
    }
    
    contactHelper.purifyAndModifyContactDetail(req.body).then(function(resolve){
      
      mongoose.model('Contact').findByIdAndUpdate(req.id, { $set: resolve }, function (err, contact) {
        if (err || !contact) {
          res.json(common.pretty(false, 10000, err));
        } else {
          if(req.body.is_active == 'false'){
            mongoose.model('GroupContact').remove({contact_id:req.id, user_id: req.user_auth.user_id}, function(err, cg){
              res.json(common.pretty(true, 10001, ''));  
            });
          } else if(req.body.groups){
            if(req.body.groups.checked && req.body.groups.checked.length > 0){
              insertGroups(req.body.groups.checked, req.user_auth, contact);
            } 
            if(req.body.groups.unchecked && req.body.groups.unchecked.length > 0){
              deleteGroups(req.body.groups.unchecked, req.user_auth, contact);
            }
            res.json(common.pretty(true, 10001, ''));
          } else
            res.json(common.pretty(true, 10001, '')); 
        }
      });
    }).catch(function(reject){
      res.json(common.pretty(false, 10000, reject));
    });
    
  })

  //DELETE - soft delete contact by ID
  .delete(function (req, res){
    mongoose.model('Contact').findByIdAndUpdate(req.id, {$set : { is_active: false }}, function (err, contact) {
      if (err) {
        res.json(common.pretty(false, 10000, err));
      } else {
        mongoose.model('GroupContact').remove({contact_id:req.id}, function(err, cg){
          res.json(common.pretty(true, 10001, contact._id));  
        });        
      }
    });
  });

module.exports = router;
