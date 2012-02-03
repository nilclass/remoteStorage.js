define([
  'require',
  './ajax',
  './oauth',
  './session',
  './sync',
  './versioning',
  './webfinger',
  './button'
], function(require, ajax, oauth, session, sync, versioning, webfinger) {
  function newClient(storageAddress, api, token) {
    return {
      get: function() {},
      put: function() {},
      delete: function() {}
    };
  }
  function createClients(userAddress, receiverPageAddress, categories, cb) {
    webfinger.getAttributes(userAddress, {
      allowHttpWebfinger: true,
      allowSingleOriginWebfinger: false,
      allowFakefinger: true
    }, onError, function(attributes) {
      var api, token, i, clients;
      clients = [];
      if(attributes.api == 'CouchDB') {
        api = 'couch';
      } else if(attributes.api == 'WebDAV') {
        api = 'dav';
      } else if(attributes.api == 'simple') {
        api = 'dav';
      } else {
        console.log('API "'+attributes.api+'" not supported! please try setting api="CouchDB" or "WebDAV" or "simple" in webfinger');
      }
      //oauth.go(attributes.auth, categories, userAddress);
      token = 'oauth_not_implemented_yet';
      for(i in categories) {
        var storageAddress = webfinger.resolveTemplate(attributes.template, categories[i]);
        clients.push(newClient(storageAddress, api, token));
      }
      cb(clients);
    });
  }
  return {
    createClients: createClients
  };
});
