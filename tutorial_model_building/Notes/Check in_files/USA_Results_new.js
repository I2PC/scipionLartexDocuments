Hydra.module.register('ResultServices', function(Bus, Module, ErrorHandler, Api) {
  return {

    events: {
      'services': {
        'USA_getBookingBlock': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.data) {
            this.getBookingBlock(oNotify.success, oNotify.failure, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        }
      }
    },

    init: function() {},

    getBookingBlock: function(success, failure, data) {
      /* Get parameters from data object */
      var sessionId = data.resultsData.sessionId;
      var departureCode = data.selectedJourneys.ow.identity;
      var arrivalCode = '';
      if (data.selectedJourneys.rt) {
        arrivalCode = data.selectedJourneys.rt.identity;
      }
      var recommendationId = data.selectedJourneys.ow.recommendationId;
      var petitionId = data.resultsData.availabilityId;
      var currencyCode = data.resultsData.currencyCode;
      var channel = AirEuropaConfig.channel;
      
      /* Get service URL */
      var url = getServiceURL('results.booking_block_usa');

      /* Replace URL parameters wit values */
      url = url.replace('{sessionId}', sessionId);
      url = url.replace('{departureCode}', departureCode);
      url = url.replace('{arrivalCode}', arrivalCode);
      url = url.replace('{recommendationId}', recommendationId);
      url = url.replace('{petitionId}', petitionId);
      url = url.replace('{currencyCode}', currencyCode);
      url = url.replace('{channel}', channel);
      

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