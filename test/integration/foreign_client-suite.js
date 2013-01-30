if(typeof(define) !== 'function') {
  var define = require('amdefine')(module);
}
define(['requirejs', 'localStorage'], function(requirejs, localStorage) {
  global.localStorage = localStorage;

  var suites = [];

  var util;

  suites.push({
    name: "ForeignClient suite",
    desc: "Integration of ForeignClient",
    setup: function(env, test) {
      requirejs([
        './src/lib/util',
        './src/remoteStorage',
        './src/modules/root',
        './src/lib/platform',
      ], function(_util, remoteStorage, rootModule, platform) {
        util = _util;
        env.remoteStorage = remoteStorage;
        env.platform = platform;

        env.origAjax = platform.ajax;

        env.platform.ajax = function(options) {
          var promise = util.getPromise();
          env.requests.push({
            opts: options,
            promise: promise
          });
          return promise;
        };
        test.result(true);

      });
    },
    takedown: function(env, test) {
      env.platform.ajax = env.origAjax;
      test.result(true);
    },
    beforeEach: function(env, test) {
      env.requests = [];
      env.remoteStorage.getForeignClient('me@local.dev').
        then(function(client) {
          env.client = client;
          test.result(true);
        });
      setTimeout(function() {
        if(env.requests.length > 0) {
          env.requests[0].promise.fulfill('{"links":[{"href":"http://local.dev/storage/me","rel":"remoteStorage","type":"https://www.w3.org/community/rww/wiki/read-write-web-00#simple","properties":{"auth-method":"https://tools.ietf.org/html/draft-ietf-oauth-v2-26#section-4.2","auth-endpoint":"http://local.dev/auth/me"}}]}');
          env.requests.slice(1).forEach(function(req) {
            req.promise.fail('network-error');
          });
          env.requests = [];
        }
      }, 100);
    },
    
    tests: [

      {
        desc: "requests the right files",
        run: function(env, test) {
          env.client.getFile('foo');
          setTimeout(function() {
            test.assertAnd(env.requests.length, 1);
            var req = env.requests[0];
            if(req) {
              test.assert(req.opts.url, 'http://local.dev/storage/me/public/foo');
            } else {
              test.result(false);
            }
          }, 100);
        }
      },

      {
        desc: "yields files correctly",
        run: function(env, test) {
          env.client.getFile('foo').
            then(function(file) {
              test.assertAnd(file.data, 'Hello World!');
              test.assert(file.mimeType, 'text/plain');
            });
          setTimeout(function() {
            var req = env.requests.shift();
            test.assertTypeAnd(req, 'object');
            if(req) {
              req.promise.fulfill('Hello World!', {
                'content-type': 'text/plain; charset=utf-8'
              });
            }
          }, 100);
        }
      },

      {
        desc: "yields objects correctly",
        run: function(env, test) {
          env.client.getObject('foo').
            then(function(object) {
              test.assert(object, { pho: 'bo' });
            });
          setTimeout(function() {
            var req = env.requests.shift();
            test.assertTypeAnd(req, 'object');
            if(req) {
              req.promise.fulfill('{"pho":"bo"}', {
                'content-type': 'application/json; charset=utf-8'
              });
            }
          }, 100);
        }
      }
      
    ]
  });

  return suites;

});