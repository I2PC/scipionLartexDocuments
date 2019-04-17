Hydra.module.register('SeatMapServices', function(Bus, Module, ErrorHandler, Api) {
  return {

    events: {
      'services': {

        'getSeatMap': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.data && oNotify.data.sessionId) {
            this.getSeatMap(oNotify.success, oNotify.failure, oNotify.data, oNotify.type);
          }
          else {
            oNotify.failure();
          }
        },

        'putSeat': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.data && oNotify.data.sessionId) {
            this.putSeat(oNotify.success, oNotify.failure, oNotify.data, oNotify.type);
          }
          else {
            oNotify.failure();
          }
        },

        'deleteSeat': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.data && oNotify.data.sessionId) {
            this.deleteSeat(oNotify.success, oNotify.failure, oNotify.data, oNotify.type);
          }
          else {
            oNotify.failure();
          }
        }
      }
    },

    init: function() {},

    getSeatMap: function(success, failure, data, type) {
      if (typeof type=='undefined') type = 'seat';
      /* Get service URL */
      var url = type=='premium'?getServiceURL('checkout.plane_premium_economy'):getServiceURL('checkout.plane');

      /* Replace URL parameters with values */
      url = url.replace('{sessionId}', data.sessionId);
      url = url.replace('{segment}', data.segment);
      url = url.replace('{passenger}', data.passenger);

      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    },

    putSeat: function(success, failure, data, type) {
      if (typeof type=='undefined') type = 'seat';
      /* Get service URL */
      var url = type=='premium'?getServiceURL('checkout.select_premium_seat'):getServiceURL('checkout.select_seat');

      /* Replace URL parameters with values */
      url = url.replace('{sessionId}', data.sessionId);
      url = url.replace('{segment}', data.segment);
      url = url.replace('{passenger}', data.passenger);
      url = url.replace('{number}', data.number);
      url = url.replace('{column}', data.column);

      /* Call to getFromService */
      Bus.publish('ajax', 'putToService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });

    },

    deleteSeat: function(success, failure, data, type) {
      if (typeof type=='undefined') type = 'seat';
      /* Get service URL */
      var url = type=='premium'?getServiceURL('checkout.remove_premium_seats'):getServiceURL('checkout.remove_seats');

      /* Replace URL parameters with values */
      url = url.replace('{sessionId}', data.sessionId);
      url = url.replace('{segment}', data.segment);
      url = url.replace('{passenger}', data.passenger);

      /* Call to getFromService */
      Bus.publish('ajax', 'deleteFromService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });

    }

  };
});