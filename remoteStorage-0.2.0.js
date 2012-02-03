define(function(require) {

  require(['./controller'], function(controller) {
    window.remoteStorage = {
      createClients: function(userAddress, categories, receiverPageAddress, cb) {
        return controller.createClients(userAddress, categories, receverPageAddress, cb);
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
