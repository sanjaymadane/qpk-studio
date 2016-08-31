'use strict';

/*
 * Application configuration file
 */
var SERVER_IP = '10.0.3.1';
module.exports = {
  'secret': 'crazyalarm',
  'high_secret': 'highcrazyalarm',
  'database': 'mongodb://'+SERVER_IP+':27018/mycontacts_p',
  'api_version': 'v1',
  'token_timeout': 900000,
  'server_ip': SERVER_IP,
  'port': 9090,
  'rabbitmq_ip': SERVER_IP,
  'rabbitmq_port': 27020,
  'bg_port':9091,
  //File Uploading 
  'protocol': 'http://',
  'nas_protocol': 'http',
  'profile_pic_default_ext': '.png',
  'media_absulute_path': '/uploads/',
  'default_profile_pic': '/default/profile.png',
  'media_base_path':  __dirname + '/../public/uploads/',  
  'profilePicAllowedTypes': ['image/jpeg', 'image/png','image/jpg', 'image/gif'],
  'attachmentAllowedTypes': ['image/jpeg', 'image/png','image/jpg', 'image/gif', 'image/tiff', 'application/pdf', 'application/msword',
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint',
                              'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'text/richtext',
                              'text/csv','text/tab-separated-values', 'application/vnd.oasis.opendocument.text', 'application/vnd.oasis.opendocument.presentation',
                              'application/vnd.oasis.opendocument.spreadsheet'
                            ],
  'allowedImports': ['text/csv','application/vnd.ms-excel','text/comma-separated-values','application/csv', 'application/excel', 
                      'application/vnd.msexcel', 'text/x-vcard', 'text/vcard'
                    ],
  'allowedVcf': ['text/x-vcard'],
  'attachmentLimit': 1024 * 1024 * 5, //5 mb
  'importLimit': 1024 * 1024 * 10, //10  mb
  'defaultFolder': '/default/',
  'exportCsv': '/exports',
  'import': '/import',
  'tmpFolder': 'tmp/',
  'nas_upload': '/Public/.cache_mycontacts',
  'nas_upload_server_path': __dirname + '/../public/nas_cache',
  'allowed_upload_count': 10,
  //Snap shot and restore
  'snapshot_dir': __dirname + '/../public/snapshot/',
  'preview_dir': __dirname + '/../public/preview/',
  // Google Auth
  'googleAuth':{
    'client_id':'822247898929-rtd53jv4eg4ivqp52stmmfi2s80mq8pr.apps.googleusercontent.com',
    'client_secret':'hXmmQMtucLrxZcpUkpVCD5_Q',
    'redirect_url':'https://connector.alpha-myqnapcloud.com/oauth2/receive_auth'
  },
  'googleAuthDev':{
    'client_id':'807653384127-ib55il33lvcfi4b0en68vv6ge00l0kb8.apps.googleusercontent.com',
    'client_secret':'HlHUqa0oi0BT3MeLlXmTF8FV',
    'redirect_url':'https://dev-connector.dev-myqnapcloud.com/oauth2/receive_auth'
  },
  'googleAuthOld':{
    'client_id':'720486056719-lk5t7l1o52ufu62sdi4tnqom0enfsm99.apps.googleusercontent.com',
    'client_secret':'f4C8M2BfluQHtf44SpqnXsGv',
    'redirect_url':'http://ec2-52-34-129-252.us-west-2.compute.amazonaws.com/outhcallback/google'
  },

  // facebook auth
  'facebookAuth' : {
    'clientID'      : '929344177160597', // your App ID
    'clientSecret'  : '9b74d944e99fdaec8e9f0df61dd3f579', // your App Secret
    'callbackURL'   : 'http://ec2-52-34-129-252.us-west-2.compute.amazonaws.com/outhcallback/facebook'
  },

  // yahoo auth
  'yahooAuth' : {
    'clientID'      : 'dj0yJmk9UTdMdGpHYjhSV0tCJmQ9WVdrOWEwTnpXWEJQTkRRbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD1mZQ--', // your App ID
    'clientSecret'  : '4253d4a789acb8339fcdaa034a1692659e740faf', // your App Secret
    'callbackURL'   : 'http://ec2-52-34-129-252.us-west-2.compute.amazonaws.com/outhcallback/yahoo'
  },

  // Dummy data insert config
  'load_dummy_data': false,
  'dummy_data': {
    'user_count': 1,
    'group_count': 1,
    'contact_count': 10000,
    'group_contact_count': 50
  }
};