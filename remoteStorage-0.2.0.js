define(function(require) {

  require(['./controller'], function(controller) {
    var options = {};
    controller.onLoad(options);

    window.remoteStorage = {
      createClients: function(userAddress, receiverPageAddress, categories, cb) {
        return controller.createClients(userAddress, receverPageAddress, categories, cb);
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
