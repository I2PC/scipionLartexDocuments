Hydra.module.register('AncillariesServices', function(Bus, Module, ErrorHandler, Api) {
  return {

    ancillariesLists: ['countries', 'document_type'],
    ancillariesListsCache: [],

    events: {
      'services': {

        'getAncillariesLists': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          this.getAncillariesLists(oNotify.success, oNotify.failure, oNotify.preconditionDocsType);
        },

        'getExtraLuggage': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.data.locator && oNotify.data.surname) {
            this.getExtraLuggage(oNotify.success, oNotify.failure, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },

        'postExtraLuggage': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.sessionId) {
            this.postExtraLuggage(oNotify.success, oNotify.failure, oNotify.sessionId, oNotify.postObject);
          }
          else {
            oNotify.failure();
          }
        },

        'getExtraSeats': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.data.locator && oNotify.data.surname) {
            this.getExtraSeats(oNotify.success, oNotify.failure, oNotify.data, oNotify.type);
          }
          else {
            oNotify.failure();
          }
        },

        'getExtraSeatMap': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.data && oNotify.data.sessionId) {
            this.getExtraSeatMap(oNotify.success, oNotify.failure, oNotify.data, oNotify.type);
          }
          else {
            oNotify.failure();
          }
        },

        'putExtraSeat': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.data && oNotify.data.sessionId) {
            this.putExtraSeat(oNotify.success, oNotify.failure, oNotify.data, oNotify.type);
          }
          else {
            oNotify.failure();
          }
        },

        'deleteExtraSeat': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.data && oNotify.data.sessionId) {
            this.deleteExtraSeat(oNotify.success, oNotify.failure, oNotify.data, oNotify.type);
          }
          else {
            oNotify.failure();
          }
        },

        'getExtraLuggagePaymentMethods': function(oNotify) { /* Not used, for the moment */
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.sessionId) {
            this.getExtraLuggagePaymentMethods(oNotify.success, oNotify.failure, oNotify.sessionId);
          }
          else {
            oNotify.failure();
          }
        },

        'getExtraSeatsPaymentMethods': function(oNotify) { /* Not used, for the moment */
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.sessionId) {
            this.getExtraSeatsPaymentMethods(oNotify.success, oNotify.failure, oNotify.sessionId);
          }
          else {
            oNotify.failure();
          }
        },

        'getPremiumExtraSeatsPaymentMethods': function(oNotify) { /* Not used, for the moment */
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.sessionId) {
            this.getPremiumExtraSeatsPaymentMethods(oNotify.success, oNotify.failure, oNotify.sessionId);
          }
          else {
            oNotify.failure();
          }
        },

        'postExtraPayment': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.sessionId) {
            this.postExtraPayment(oNotify.success, oNotify.failure, oNotify.sessionId, oNotify.ancillarySession, oNotify.mode);
          }
          else {
            oNotify.failure();
          }
        },

      }
    },

    init: function() {},

    /* Ancillaries lists */

    getAncillariesLists: function(success, failure, preconditionDocsType) {
      var self = this;
      var servicesLength = this.ancillariesLists.length;
      var servicesLoaded = 0;

      $.each(this.ancillariesLists, function(index, list) {

        Bus.publish('ajax', 'getJSON', {
          path: getServiceURL('ancillaries.' + list).replace('{preconditionDocsType}', preconditionDocsType),
          success: function(data) {
            /* Cache the data */
            self.ancillariesListsCache[list] = data;

            /* Control when all services are loaded */
            servicesLoaded += 1;

            if (servicesLoaded == servicesLength) {
              success(self.ancillariesListsCache);
            }
          }
        });

      });
    },

    /* Luggage screen */

    getExtraLuggage: function(success, failure, data) {
      /* Get service URL */
      var url = getServiceURL('ancillaries.luggage');

      /* Replace URL parameters with values */
      url = url.replace('{locator}', data.locator);
      url = url.replace('{surname}', data.surname);

      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    },

    postExtraLuggage: function(success, failure, sessionId, postObject) {
      Bus.publish('ajax', 'postToService', {
        path: getServiceURL('ancillaries.post_ancillaries').replace('{sessionId}', sessionId),
        data: postObject, /* The object is already formatted by ancillaries view */
        success: function(data) {
          success(data);
        }
      });

    },

    /* Seats screen */

    getExtraSeats: function(success, failure, data, type) {
      if (typeof type=='undefined') type = 'seats';
      /* Get service URL */
      var url = type!='ancillaries_premium_seats'?getServiceURL('ancillaries.seats'):getServiceURL('ancillaries.premium_seats');

      /* Replace URL parameters with values */
      url = url.replace('{locator}', data.locator);
      url = url.replace('{surname}', data.surname);

      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    },

    getExtraSeatMap: function(success, failure, data, type) {
      if (typeof type=='undefined') type = 'seats';
      /* Get service URL */
      var url = type!='premium'?getServiceURL('ancillaries.plane'):getServiceURL('ancillaries.premium_plane');

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

    putExtraSeat: function(success, failure, data, type) {
      if (typeof type=='undefined') type = 'seats';
      /* Get service URL */
      var url = type!='premium'?getServiceURL('ancillaries.select_seat'):getServiceURL('ancillaries.select_premium_seat');

      /* Replace URL parameters with values */
      url = url.replace('{sessionId}', data.sessionId);
      url = url.replace('{segment}', data.segment);
      url = url.replace('{passenger}', data.passenger);
      url = url.replace('{number}', data.number);
      url = url.replace('{column}', data.column);

      /* Call to putToService */
      Bus.publish('ajax', 'putToService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });

    },

    deleteExtraSeat: function(success, failure, data, type) {
      if (typeof type=='undefined') type = 'seats';
      /* Get service URL */
      var url = type!='premium'?getServiceURL('ancillaries.remove_seats'):getServiceURL('ancillaries.remove_premium_seats');

      /* Replace URL parameters with values */
      url = url.replace('{sessionId}', data.sessionId);
      url = url.replace('{segment}', data.segment);
      url = url.replace('{passenger}', data.passenger);

      /* Call to deleteFromService */
      Bus.publish('ajax', 'deleteFromService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });

    },

    /* Payment screen */

    getExtraSeatsPaymentMethods: function(success, failure, sessionId) {
      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: getServiceURL('ancillaries.seat_payment_methods').replace('{sessionId}', sessionId),
        success: function(data) {
          success(data);
        }
      });
    },

    getPremiumExtraSeatsPaymentMethods: function(success, failure, sessionId) {
      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: getServiceURL('ancillaries.premium_seat_payment_methods').replace('{sessionId}', sessionId),
        success: function(data) {
          success(data);
        }
      });
    },

    getExtraLuggagePaymentMethods: function(success, failure, sessionId) {
      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: getServiceURL('ancillaries.luggage_payment_methods').replace('{sessionId}', sessionId),
        success: function(data) {
          success(data);
        }
      });
    },

    postExtraPayment: function(success, failure, sessionId, ancillarySession, mode) {

      var url;
      var cardHolder;
      var formExpiration;
      var expiration;
      var postObject;

      /* Get URL */
      if (mode == 'luggage') {
        url = getServiceURL('ancillaries.luggage_payment');
      }
      else if (mode == 'seats') {
        url = getServiceURL('ancillaries.seat_payment');
      }
      else if (mode == 'premium_seats') {
        url = getServiceURL('ancillaries.premium_seat_payment');
      }

      url = url.replace('{sessionId}', sessionId);

      if (ancillarySession.payment.payment_type === "card") {

        /* Figure out holder name */
        if (ancillarySession.payment.credit_card_holder != 'other') { /* Loop the passengers to get the name and surname */
          if (ancillarySession.mode == 'luggage') {
            if (ancillarySession.ancillary.passengerBaggage && ancillarySession.ancillary.passengerBaggage.length > 0) {
              $.each(ancillarySession.ancillary.passengerBaggage, function(passengerIndex, passenger) {
                if (ancillarySession.payment.credit_card_holder == passenger.identity) {
                  cardHolder = passenger.name + ' ' + passenger.surname + ' ' + ((passenger.secondName) ? passenger.secondName : '');
                  return false;
                }
              });
            }
          }
          else if (ancillarySession.mode == 'seats') {
            if (ancillarySession.ancillary.passengerSeats && ancillarySession.ancillary.passengerSeats.length > 0) {
              $.each(ancillarySession.ancillary.passengerSeats, function(passengerIndex, passenger) {
                if (ancillarySession.payment.credit_card_holder == passenger.identity) {
                  cardHolder = passenger.name + ' ' + passenger.surname + ' ' + ((passenger.secondName) ? passenger.secondName : '');
                  return false;
                }
              });
            }
          }
          else if (ancillarySession.mode == 'premium_seats') {
            if (ancillarySession.ancillary.passengerSeats && ancillarySession.ancillary.passengerSeats.length > 0) {
              $.each(ancillarySession.ancillary.passengerSeats, function(passengerIndex, passenger) {
                if (ancillarySession.payment.credit_card_holder == passenger.identity) {
                  cardHolder = passenger.name + ' ' + passenger.surname + ' ' + ((passenger.secondName) ? passenger.secondName : '');
                  return false;
                }
              });
            }
          }
        }
        else { /* Get the holder name directly from form data */
          cardHolder = ancillarySession.payment.credit_card_name;
        }

        /* Convert date to the servive format from MM/YYYY YYYY-MM-01 */
        formExpiration = ancillarySession.payment.credit_card_expiration;
        expiration = "20" + formExpiration.substring(formExpiration.indexOf('/') + 1) + '-' + formExpiration.substring(0, formExpiration.indexOf('/')) + '-01';

        /* Compose post object */
        postObject = {
          paymentType: "CREDITCARD",
          number: ancillarySession.payment.credit_card_number,
          expiration: expiration,
          cvv: ancillarySession.payment.credit_card_cvv,
          holder: cardHolder,
          identificationDocumentType: ancillarySession.payment.credit_card_document_type,
          identificationDocumentIdentity: ancillarySession.payment.credit_card_document_number,
          bookingPassenger: (ancillarySession.payment.bookingPassenger == "1"),
          personContactInformation: {
            email: ancillarySession.payment.credit_card_mail,
            telephone: ''
          }
        };

      }

      else if (ancillarySession.payment.payment_type === "free") {
        /* Compose post object */
        postObject = {
          paymentType: "FREE",
          bookingPassenger: (ancillarySession.payment.bookingPassenger == "1"),
          personContactInformation: {
            email: ancillarySession.payment.free_mail,
            telephone: ancillarySession.payment.free_prefix + ancillarySession.payment.free_phone
          }
        };
      }

      //console.log(postObject);

      Bus.publish('ajax', 'postToService', {
        path: url,
        data: postObject,
        success: function(data) {
          success(data);
        }
      });

    }

  };
});