define(function(require) {

  require(['./controller'], function(controller) {
    var options = {};
    controller.onLoad(options);

    window.remoteStorage = {
      createClient: function(userAddress, receiverPageAddress, categories, cb) {
        return controller.createClient(userAddress, receverPageAddress, categories, cb);
      },
      getPublic: function(userAddress, key, cb) {
        cb('not implemented');
      },
      beTheReceiverPage: function() {
        alert('not implemented');
      }
    };
  });
});
