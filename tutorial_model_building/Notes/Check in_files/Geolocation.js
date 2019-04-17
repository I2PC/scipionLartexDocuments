Hydra.module.register('Geolocation', function(Bus, Module, ErrorHandler, Api) {
  return {
    init: function() {
      /* Get geolocation */
      this.getGeolocation();
    },

    getGeolocation: function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          Bus.publish('geolocation', 'success', {position: position});
        }, function() {
          Bus.publish('geolocation', 'fail');
        });
      }
    }

  };
});