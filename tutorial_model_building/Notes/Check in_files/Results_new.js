Hydra.module.register('USAResultServices', function(Bus, Module, ErrorHandler, Api) {
  return {

    events: {
      'services': {
        'getBookingBlock': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.data) {
            this.getBookingBlock(oNotify.success, oNotify.failure, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },
        'getInterislasInfo': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.data) {
            this.getInterislasInfo(oNotify.success, oNotify.failure, oNotify.data);
          } else {
            oNotify.failure();
          }
        }
      }
    },

    init: function() {},

    getBookingBlock: function(success, failure, data) {
      /* Get parameters from data object */
      var sessionId        = data.resultsData.sessionId;
      var petitionId       = data.resultsData.availabilityId;
      var departureCode    = data.departureCode;
      var arrivalCode      = data.arrivalCode;
      var recommendationId = data.recommendationId;
      var channel          = AirEuropaConfig.channel;

      /* Get service URL */
      var url = getServiceURL('results.booking_block');

      /* Replace URL parameters wit values */
      url = url.replace('{departureCode}', departureCode);
      url = url.replace('{arrivalCode}', arrivalCode);
      url = url.replace('{recommendationId}', recommendationId);
      url = url.replace('{petitionId}', petitionId);
      url = url.replace('{sessionId}', sessionId);
      url = url.replace('{currencyCode}', currencyCode);
      url = url.replace('{channel}', channel);

      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    },

    getInterislasInfo: function(success, failure, data) {
      /* Get parameters from data object */
      var departureCode = data.departureCode;
      var arrivalCode   = data.arrivalCode;

      /* Get service URL */
      var url = getServiceURL('results.interislas');

      /* Replace URL parameters wit values */
      url = url.replace('{departureCode}', departureCode);
      url = url.replace('{arrivalCode}', arrivalCode);

      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    }

  };
});