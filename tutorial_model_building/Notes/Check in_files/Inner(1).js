Hydra.module.register('InnerController', function(Bus, Module, ErrorHandler, Api) {
  return {
    selector: '.inner #content',
    element: undefined,

    events: {
      'proccess': {
        'get_inner_data': function(oNotify) {
          this.loadInnerData(oNotify.callback);
        }
      }
    },
    innerCache: {},

    init: function() {},


    getInnerData: function(callback) {
      callback(this.innerCache);
    },


    loadInnerData: function(callback) {
      var self = this;

      Bus.publish('services', 'getInnerLists', {
        success: function(listsData) {
          listsData['services'] = listsData;
          callback(listsData);
        }
      });
    },

  };
});