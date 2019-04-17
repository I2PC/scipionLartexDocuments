Hydra.module.register('LoyaltyMilesServices', function (Bus, Module, ErrorHandler, Api) {
  return {
    loyaltyMilesLists: ['departure_airports', 'arrival_airports', 'airlines'],
    loyaltyMilesListsCache: [],
    events: {
      'services': {
        'getLoyaltyMiles': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          if (oNotify.userId) {
            this.getUserMiles(oNotify.success, oNotify.failure, oNotify.userId);
          } else {
            oNotify.failure();
          }
        },
        'getLoyaltyOperations': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          if (oNotify.userId) {
            this.getUserOperations(oNotify.success, oNotify.failure, oNotify.userId, oNotify.data);
          } else {
            oNotify.failure();
          }
        },
        'getLoyaltyOperationsPdf': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          if (oNotify.userId) {
            this.getUserOperationsReportPdf(oNotify.success, oNotify.failure, oNotify.userId, oNotify.data);
          } else {
            oNotify.failure();
          }
        },
        'getLoyaltyOperationsXls': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          if (oNotify.userId) {
            this.getUserOperationsReport(oNotify.success, oNotify.failure, oNotify.userId, oNotify.data);
          } else {
            oNotify.failure();
          }
        },
        'getMilesPartners': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.getMilesPartners(oNotify.success, oNotify.failure);
        },
        'getLoyaltyTiers': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.getLoyaltyTiers(oNotify.success, oNotify.failure);
        },
        'getLoyaltyMilesLists': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.getLoyaltyMilesLists(oNotify.success, oNotify.failure);
        },
        /* transferMiles */
        'transferMiles': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          if (oNotify.frequentFlyerIdentity && oNotify.receiverFFIdentity && oNotify.numMiles) {
            this.transferMiles(oNotify.success, oNotify.failure, oNotify.frequentFlyerIdentity, oNotify.receiverFFIdentity, oNotify.numMiles, oNotify.receiverEmail);
          } else {
            oNotify.failure();
          }
        },
        /* claim Miles */
        'claimMiles': function (oNotify){
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          if (oNotify.frequentFlyerIdentity && oNotify.postData) {
            this.claimMiles(oNotify.success, oNotify.failure, oNotify.postData, oNotify.frequentFlyerIdentity);
          } else {
            oNotify.failure();
          }
        }
      }
    },
    init: function () {
    },
    getLoyaltyMilesLists: function (success, failure) {
      var self = this;
      var servicesLength = this.loyaltyMilesLists.length;
      var servicesLoaded = 0;
      $.each(this.loyaltyMilesLists, function (index, list) {

        Bus.publish('ajax', 'getJSON', {
          path: getServiceURL('loyalty_miles.' + list),
          success: function (data) {
            /* Cache the data */
            self.loyaltyMilesListsCache[list] = data;
            /* Control when all services are loaded */
            servicesLoaded += 1;
            if (servicesLoaded == servicesLength) {
              success(self.loyaltyMilesListsCache);
            }
          }
        });
      });
    },
    /* Call to [GET]user/milles Rest API request */

    getMilesPartners: function (success, failure) {
      /* Get service URL */
      var url = getServiceURL('loyalty_miles.miles_partners');
      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },
    /* Call to [GET]user/milles Rest API request */
    getUserMiles: function (success, failure, userId) {
      /* Get service URL */
      var url = getServiceURL('loyalty_miles.user_miles');
      url = url.replace('{userId}', userId);
      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },
    /* Call to [GET]user/operations Rest API request */
    getUserOperations: function (success, failure, userId, data) {
      /* Get service URL */
      var url = getServiceURL('loyalty_miles.user_operations');
      url = url.replace('{userId}', userId);
      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        params: data,
        path: url,
        success: function (response) {
          if (response.body === null) {
            response.body = {
              data: []
            };
          }
          success(response);
        },
        failure: function () {
          failure();
        }
      });
    },
    /* Call to [GET]user/operations/report Rest API request */
    getUserOperationsReport: function (success, failure, userId, data) {
      /* Get service URL */
      var url = getServiceURL('loyalty_miles.user_operations_report');
      url = url.replace('{userId}', userId);
      /* Call to getFromService */
      Bus.publish('ajax', 'downloadFromService', {
        params: data,
        path: url,
        success: function () {
          success();
        },
        failure: function () {
          failure();
        },
        headerAccept: 'application/vnd.ms-excel',
        responseType: 'application/vnd.ms-excel' /* Force type because WS is using .xlsx MIME type */
      });
    },
    /* Call to [GET]user/operations/report/pdf Rest API request */
    getUserOperationsReportPdf: function (success, failure, userId, data) {
      /* Get service URL */
      var url = getServiceURL('loyalty_miles.user_operations_report_pdf');
      url = url.replace('{userId}', userId);
      /* Call to getFromService */
      Bus.publish('ajax', 'downloadFromService', {
        params: data,
        path: url,
        success: function () {
          success();
        },
        failure: function () {
          failure();
        },
        headerAccept: 'application/pdf'
      });
    },
    /* Call to [GET]loyalty/tiers Rest API request */
    getLoyaltyTiers: function (success, failure, numberRecords) {
      /* Get service URL */
      var url = getServiceURL('loyalty_miles.loyalty_tiers');
      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },
    /* Call to [POST]miles/transfer Rest API request */
    transferMiles: function (success, failure, frequentFlyerIdentity, receiverFFIdentity, numMiles, receiverEmail) {
      /* Get service URL */
      var url = getServiceURL('loyalty_miles.transfer_miles');
      url = url.replace('{frequentFlyerIdentity}', frequentFlyerIdentity);
      /* Call to postToService */
      Bus.publish('ajax', 'postToService', {
        data: {
          receiverFFIdentity: receiverFFIdentity,
          miles: numMiles,
          receiverEmail: receiverEmail
        },
        path: url,
        success: function (response) {
          if (response.body === null) {
            response.body = {
              data: []
            };
          }
          success(response);
        },
        failure: function () {
          failure();
        }
      });
    },

    claimMiles: function(success, failure, putData, frequentFlyerIdentity){

      var url = getServiceURL('loyalty_miles.claim_miles');
      url = url.replace('{frequentFlyerIdentity}', frequentFlyerIdentity);

      Bus.publish('ajax', 'putToService', {
        data: this.claimObject(putData),
        path: url,
        success: function (response) {
          if (response.body === null) {
            response.body = {
              data: []
            };
          }
          success(response);
        },
        failure: function () {
          failure();
        }
      });
    },

    claimObject: function(data){
      var returnObject = {
        name: data.field_loyalty_name,
        surname: data.field_loyalty_surname,
        departureAirportCode: data.field_origin_airport,
        arrivalAirportCode: data.field_destiny_airport,
        company: data.field_loyalty_company,
        flightNumber: data.field_loyalty_flight_number,
        flightDate: data.field_loyalty_flight_date,
        ticketNumber: data.field_loyalty_boarding_number,
        seat: (data.field_loyalty_seat) ? data.field_loyalty_seat : '',
        sequenceNumber: (data.field_loyalty_sequence_number) ? data.field_loyalty_sequence_number : '',
        locator: (data.field_loyalty_locator) ? data.field_loyalty_locator : ''
      }
      return returnObject;
    }

  };
});