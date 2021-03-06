if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(['requirejs'], function(requirejs, undefined) {
  var suites = [];

  var curry, util;

  function catchError(test) {
    return function(error) {
      console.error("Caught error: ", error, error && error.stack);
      test.result(false);
    };
  }

  suites.push({
    name: "baseClient.js tests",
    desc: "a collection of tests for baseClient.js",
    setup: function(env) {
      var _this = this;
      requirejs([
        './src/lib/util',
        './src/lib/baseClient',
        './src/lib/store',
        './src/lib/store/memory'
      ], function(_util, BaseClient, store, memoryAdapter) {
        util = _util;
        curry = util.curry;
        env.BaseClient = BaseClient;
        _this.assertType(BaseClient, 'function');
        env.store = store;
        env.store.setAdapter(memoryAdapter());
      });
    },
    takedown: function(env) {
      env.store.forgetAll();
      env = '';
      this.result(true);
    },
    tests: [
      {
        desc: "constructor w/o moduleName throws an exception",
        run: function(env) {
          try {
            new env.BaseClient();
          } catch(exc) {
            this.result(true);
            return;
          }
          this.result(false);
        }
      },
      {
        desc: "constructor w/ moduleName returns a new client instance",
        run: function(env) {
          var client = new env.BaseClient('test');
          this.assertTypeAnd(client, 'object');
          this.assertAnd(client instanceof env.BaseClient, true);
          this.assert(client.moduleName, 'test');
          env.client = client;
        }
      },
      {
        desc: "makePath prefixes paths correctly",
        run: function(env) {
          var path = env.client.makePath('foo/bar/baz');
          this.assert(path, '/test/foo/bar/baz');
        }
      },
      {
        desc: "makePath prefixes public paths correctly",
        run: function(env) {
          var c = new env.BaseClient('test', true);
          this.assert(c.makePath('foo/bar'), '/public/test/foo/bar');
        }
      },


      {
        desc: "BaseClient#getObject returns a promise",
        run: function(env) {
          this.assertType(env.client.getObject('foo').then, 'function');
        }
      },

      {
        desc: "BaseClient#storeObject returns a promise",
        run: function(env) {
          var promise = env.client.storeObject('foo', 'foo', { "json": "object" });
          this.assertType(promise.then, 'function');
        }
      },

      {
        desc: "BaseClient#getFile returns a promise",
        run: function(env) {
          this.assertType(env.client.getFile('foo').then, 'function');
        }
      },

      {
        desc: "BaseClient#storeFile returns a promise",
        run: function(env) {
          this.assertType(env.client.getFile('foo').then, 'function');
        }
      },

      {
        desc: "BaseClient#remove returns a promise",
        run: function(env) {
          this.assertType(env.client.remove('foo').then, 'function');
        }
      },

      {
        desc: "BaseClient#getObject won't fail if the object doesn't exist",
        run: function(env) {
          var _this = this;
          env.client.getObject('foo/bar').
            then(function(object) {
              _this.assertType(object, 'undefined');
            }, catchError(this));
        }
      },

      {
        desc: "BaseClient#getObject will pass on an object if it finds one",
        run: function(env) {
          var _this = this;
          env.store.setNodeData('/test/foo/baz', { json: 'object' }, false, 12345, 'application/json').
            then(curry(env.client.getObject, 'foo/baz')).
            then(function(object) {
              _this.assert(object, { json: 'object' });
            }, catchError(this));
        }
      },

      {
        desc: "BaseClient#saveObject returns a promise",
        run: function(env) {
          this.assertType(env.client.saveObject({}).then, 'function');
        }
      },

      {
        desc: "BaseClient#saveObject fails when no @type is given",
        run: function(env) {
          var _this = this;
          env.client.saveObject({}).
            then(function() {
              _this.result(false);
            }, function(error) {
              _this.result(!! error);
            });
        }
      }
    ]
  });
  return suites;
});
