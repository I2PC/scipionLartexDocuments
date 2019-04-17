Hydra.module.register('HelpdeskServices', function(Bus, Module, ErrorHandler, Api) {
  return {

    events: {
      'services': {
        'getHelpeskPhone': function(oNotify) {
          if (!oNotify.data) oNotify.data = {};
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          this.getHelpeskPhone(oNotify.success, oNotify.failure);
        }
      }
    },

    init: function() {},

    getHelpeskPhone: function(success, failure) {
      var self = this;

      Bus.publish('ajax', 'getJSON', {
        path: getServiceURL('helpdesk.phone'),
        success: function(data) {
          success(data);
        }
      });
    }

  };
});