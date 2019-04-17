Hydra.module.register('FlightinfoServices', function(Bus, Module, ErrorHandler, Api) {
  return {

    events: {
      'services': {

        'getFlightInfo': function(oNotify) {
          if (!oNotify.data) oNotify.data = {};
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.mode && oNotify.data) {
            this.getFlightInfo(oNotify.success, oNotify.failure, oNotify.mode, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },

        'getFlightInfoBatch': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          this.getFlightInfoBatch(oNotify.success, oNotify.failure, oNotify.flightCodes);
        }

      }
    },

    init: function() {},

    getFlightInfo: function(success, failure, mode, data) {
      var jsonPath = getServiceURL('info.' + mode).replace('{from}', data.from).replace('{to}', data.to).replace('{flight}', data.flight);

      Bus.publish('ajax', 'getFromService', {
        path: jsonPath,
        success: function(data) {
          success(data);
        }
      });
    },

    getFlightInfoBatch: function(success, failure, flightCodes) {
      var self = this;
      var servicesLength = flightCodes.length;
      var servicesLoaded = 0;
      var flightInfo = {};

      $.each(flightCodes, function(index, flight) {
        var jsonPath = getServiceURL('info.flight_number').replace('{flight}', flight.number);

        Bus.publish('ajax', 'getFromService', {
          path: jsonPath,
          success: function(data) {
            if (!data.header.error) {
              flightService = data.body.data;
              flightService.originalDateDeparture = flight.dateDeparture;

              /* Cache the data */
              flightInfo[flight.segmentId] = flightService;
            }

            /* Control when all services are loaded */
            servicesLoaded += 1;

            if (servicesLoaded == servicesLength) {
              success(flightInfo);
            }
          }
        });

      });
    }

  };
});