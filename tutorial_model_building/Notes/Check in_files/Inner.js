Hydra.module.register('InnerServices', function(Bus, Module, ErrorHandler, Api) {
  return {

    innerLists: ['master_services', 'countries', 'departure_airports', 'arrival_airports', 'region', 'groups_services', 'document_type_invoice', 'frequent_flyer'],
    innerListsCache: [],

    events: {
      'services': {

        'getInnerLists': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          this.getInnerLists(oNotify.success, oNotify.failure);
        },

        'createClaim': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          this.createClaim(oNotify.success, oNotify.failure, oNotify.data, oNotify.numberOfFlights);
        },

        'confirmClaim': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          this.confirmClaim(oNotify.success, oNotify.failure, oNotify.data);
        },

        'createInvoice': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          this.createInvoice(oNotify.success, oNotify.failure, oNotify.data);
        },

        'createGroupRequest': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          this.createGroupRequest(oNotify.success, oNotify.failure, oNotify.data);
        },

        'getRegionFromCountry': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          this.getRegionFromCountry(oNotify.success, oNotify.failure, oNotify.countryCode);
        },

        'getAirportFrom': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          this.getAirportFrom(oNotify.success, oNotify.failure, oNotify.airportCode);
        },

        'getFFleveFromFFtype': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          this.getFFleveFromFFtype(oNotify.success, oNotify.failure, oNotify.frequentFlyerTypeCode);
        },

        'getFFlevelSuma': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          this.getFFlevelSuma(oNotify.success, oNotify.failure);
        }

      }
    },

    init: function() {},


    getInnerLists: function(success, failure) {
      var self = this;
      var servicesLength = this.innerLists.length;
      var servicesLoaded = 0;

      $.each(this.innerLists, function(index, list) {

        Bus.publish('ajax', 'getJSON', {
          path: getServiceURL('inner.' + list),
          success: function(data) {
            /* Cache the data */
            self.innerListsCache[list] = data;

            /* Control when all services are loaded */
            servicesLoaded += 1;

            if (servicesLoaded == servicesLength) {
              success(self.innerListsCache);
            }
          }
        });

      });
    },

    createClaim: function(success, failure, data, numberOfFlights) {
      var self = this;

      var reasonsObject = [];
      $.each(data.field_reason, function(index, data){
        reasonsObject[index] = {
          "code": data
        };
      });

      var flightObject = {};
      for (var i=0; i<numberOfFlights; i++) {
        flightObject["flight"+(i+1)] = {
          "airline": {
              "code": data["field_"+i+"_airline"]
          },
          "number": data["field_"+i+"_flight_number"],
          "departureDate": data["field_"+i+"_flight_date"],
          "departureAirport": data["field_"+i+"_origin_airport"],
          "arrivalAirport": data["field_"+i+"_destiny_airport"],
          "cabinClass": data["field_"+i+"_class"]
        };
      }
      flightObject.locator = data.field_locator;
      flightObject.ticketNumber = data.field_ticket_number;

      /* If data.field_region is empty, set to 'UNK' */
      if (data.field_region) {
        if (data.field_region.length<=0) {
          data.field_region = 'UNK';
        }
      } else {
        data.field_region = 'UNK';
      }

      /* Prepare FF info */
      var fftypeCode, fflevelCode, ffnumber = "";
      if (data.field_ff === "1") {
        fftypeCode  = data.field_ff_type;
        fflevelCode = data.field_ff_level;
        ffnumber    = data.field_ff_number;
      }

      var postObject = {
        "claim": {
            "reasons": reasonsObject,
            "type": {
                "code": data.field_suggestions_type
            },
            "addressForm": {
                "code": data.field_honorific
            },
            "name": data.field_name,
            "surname1": data.field_surname,
            "surname2": data.field_second_surname,
            "documentType": {
                "code": data.field_document_type
            },
            "documentNumber": data.field_document_number,
            "language": {
                "code": data.field_language
            },
            "email": data.field_email,
            "phoneCode": data.field_phone_prefix,
            "phoneNumber": data.field_phone,
            "streetType": {
                "code": ""
            },
            "address": data.field_address,
            "postalCode": data.field_zip,
            "town": data.field_city,
            "province": data.field_region,
            "country": {
                "code": data.field_country
            },
            "pir": data.field_pir,
            "message": data.field_message,
            "fftype": {
              "code": fftypeCode
            },
            "fflevel": {
              "code": fflevelCode
            },
            "ffnumber": ffnumber,
            "booking": flightObject
        }
      };
      var url = getServiceURL('inner.contact_request');

      Bus.publish('ajax', 'postToService', {
        path: url,
        data: postObject,
        success: function(data) {
          success(data);
        }
      });
    },


    confirmClaim: function(success, failure, data) {
      var self = this;

      var url = getServiceURL('inner.contact_confirm');
      url = url.replace('{claimId}', data.claimNumber);
      url = url.replace('{idsession}', data.sessionId);

      Bus.publish('ajax', 'putToService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    },


    createInvoice: function(success, failure, data) {
      var self = this;

      var postObject = {
        "type": data.field_invoice_type,
        "documentType": data.field_document_type,
        "documentNumber": data.field_document_number,
        "name": data.field_name,
        "provinceCode": data.field_region,
        "address": data.field_address,
        "email": data.field_email,
        "postalCode": data.field_cp,
        "town": data.field_city,
        "ticketNumber": data.field_ticket_number,
        "locator": data.field_locator
      };
      if (data.field_invoice_type=='PERSONAL') {
        postObject = {
          "type": data.field_invoice_type,
          "documentType": data.field_document_type,
          "documentNumber": data.field_document_number,
          "name": data.field_name,
          "firstName": data.field_firstname,
          "secondName": data.field_secondname,
          "provinceCode": data.field_region,
          "address": data.field_address,
          "email": data.field_email,
          "postalCode": data.field_cp,
          "town": data.field_city,
          "ticketNumber": data.field_ticket_number,
          "locator": data.field_locator
        };
      }
      var url = getServiceURL('inner.invoice_request');

      Bus.publish('ajax', 'postToService', {
        path: url,
        data: postObject,
        success: function(data) {
          success(data);
        }
      });
    },


    createGroupRequest: function(success, failure, data) {
      var self = this;

      var postObject = {
        "contactInformation" : {
            "personContactName" : data.field_contact_person,
            "email" : data.field_email,
            "telephone" : data.field_phone,
            "country": data.field_origin_country
        },
        "outwardTravel" : {
            "date" : data.field_flight_date,
            "departure" : data.field_origin_country_departure,
            "destination" : data.field_origin_country_arrival,
            "availableTime" : {
                "code" : data.field_origin_available_times,
                "description" : data.field_origin_available_times_string
            },
            "adults" : parseInt(data.field_adults)
        },
        "returnTravel":{
            "date" : data.field_return_flight_date,
            "departure" : data.field_return_country_departure,
            "destination" : data.field_return_country_arrival,
            "availableTime" : {
                "code" : data.field_return_available_times,
                "description" : data.field_return_available_times_string
            },
            "adults" : parseInt(data.field_return_adults)
        }
      };

      if (data.field_message.length>0) {
        postObject.contactInformation.comment = data.field_message;
      }
      if (data.field_kids.length>0) {
        postObject.outwardTravel.children = parseInt(data.field_kids);
      }
      if (data.field_kids_age.length>0) {
        postObject.outwardTravel.childrenAges = data.field_kids_age;
      }
      if (data.field_return_kids.length>0) {
        postObject.returnTravel.children = parseInt(data.field_return_kids);
      }
      if (data.field_return_kids_age.length>0) {
        postObject.returnTravel.childrenAges = data.field_return_kids_age;
      }

      var url = getServiceURL('inner.group_request');

      Bus.publish('ajax', 'postToService', {
        path: url,
        data: postObject,
        success: function(data) {
          success(data);
        }
      });
    },

    /* Return object states from country code */
    getRegionFromCountry: function(success, failure, countryCode){
      var self = this;

      var url = getServiceURL('inner.country_region');
      url = url.replace('{countryCode}', countryCode);

      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    },


 getAirportFrom: function(success, failure, airportCode){
      var self = this;

      var url = getServiceURL('airport.destiny');
      url = url.replace('{code}', airportCode);

      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    },


    /* Return object FF level from FF type code */
    getFFleveFromFFtype: function(success, failure, frequentFlyerTypeCode) {
      var self = this;

      var url = getServiceURL('inner.frequent_flyer_level');
      url = url.replace('{frequentFlyerTypeCode}', frequentFlyerTypeCode);

      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    },

    /* Return object FF level from FF type SUMA */
    getFFlevelSuma: function(success, failure) {
      var self = this;

      var url = getServiceURL('inner.frequent_flyer_level_suma');

      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    }

  };
});
