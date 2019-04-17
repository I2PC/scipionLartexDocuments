Hydra.module.register('CheckinServices', function (Bus, Module, ErrorHandler, Api) {
  return {
    checkinLists: ['countries', 'frequent_flyer'],
    checkinListsCache: [],
    events: {
      'services': {
        'getCheckinLists': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          this.getCheckinLists(oNotify.success, oNotify.failure);
        },
        'getCheckinStatesFromCountry': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.countryCode) {
            this.getCheckinStatesFromCountry(oNotify.success, oNotify.failure, oNotify.countryCode);
          }
          else {
            oNotify.failure();
          }
        },
        'getFlightData': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.data.locator) {
            this.getFlightData(oNotify.success, oNotify.failure, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },
        'postAircraftMap': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.checkinId) {
            this.postAircraftMap(oNotify.success, oNotify.failure, oNotify.postObject, oNotify.checkinId, oNotify.passengerId);
          }
          else {
            oNotify.failure();
          }
        },
        'putCheckinSeat': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.data && oNotify.data.checkinId) {
            this.putCheckinSeat(oNotify.success, oNotify.failure, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },
        'updateCheckinPassengers': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.checkinId) {
            this.updateCheckinPassengers(oNotify.success, oNotify.failure, oNotify.checkinCache, oNotify.checkinId);
          }
          else {
            oNotify.failure();
          }
        },
        'confirmCheckin': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.checkinId) {
            this.confirmCheckin(oNotify.success, oNotify.failure, oNotify.checkinCache, oNotify.checkinId);
          }
          else {
            oNotify.failure();
          }
        },
        'getCheckinQrCode': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.qrCode) {
            this.getCheckinQrCode(oNotify.success, oNotify.failure, oNotify.qrCode);
          }
          else {
            oNotify.failure();
          }
        },
        'getBoardingPassPdfTicket': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.checkinId) {
            this.getBoardingPassPdfTicket(oNotify.success, oNotify.failure, oNotify.checkinCache, oNotify.checkinId);
          }
          else {
            oNotify.failure();
          }
        },
        'shareCheckinCards': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.checkinId) {
            this.shareCheckinCards(oNotify.success, oNotify.failure, oNotify.data, oNotify.checkinId);
          }
          else {
            oNotify.failure();
          }
        },
        'finishCheckin': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.checkinId) {
            this.finishCheckin(oNotify.success, oNotify.failure, oNotify.checkinId);
          }
          else {
            oNotify.failure();
          }
        },
        'cancelCheckin': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.checkinId) {
            this.cancelCheckin(oNotify.success, oNotify.failure, oNotify.checkinCache, oNotify.passenger, oNotify.checkinId);
          }
          else {
            oNotify.failure();
          }
        },
        'getBookingByUser': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.userId) {
            this.getBookingByUser(oNotify.success, oNotify.failure, oNotify.userId);
          }
          else {
            oNotify.failure();
          }
        },
        'getDocumentType': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.type) {
            this.getDocumentType(oNotify.success, oNotify.failure, oNotify.type);
          }
          else {
            oNotify.failure();
          }
        },
        'getFrequentFlyerCheckCheckin': function(oNotify) {
            if (!oNotify.success) oNotify.success = function() {};
            if (!oNotify.failure) oNotify.failure = function() {};

            if (oNotify.data) {
              this.getFrequentFlyerCheck(oNotify.success, oNotify.failure, oNotify.data);
            }
            else {
              oNotify.failure();
            }
          },
        'loginTwitterOAuthCheckin': function(oNotify) {
            if (!oNotify.success) oNotify.success = function() {};
            if (!oNotify.failure) oNotify.failure = function() {};

           
            this.loginTwitterOAuthCheckin(oNotify.success, oNotify.failure, oNotify.data);
            
                 
        },

        'followUsTwitterCheckin': function(oNotify) {
            if (!oNotify.success) oNotify.success = function() {};
            if (!oNotify.failure) oNotify.failure = function() {};

            this.followUsTwitterCheckin(oNotify.success, oNotify.failure);
           
        },

        'followingUsTwitterCheckin': function(oNotify) {
            if (!oNotify.success) oNotify.success = function() {};
            if (!oNotify.failure) oNotify.failure = function() {};

            
            this.followingUsTwitterCheckin(oNotify.success, oNotify.failure);
                      
        },

        'notificationsTwitterCheckin': function(oNotify) {
            if (!oNotify.success) oNotify.success = function() {};
            if (!oNotify.failure) oNotify.failure = function() {};
            

            this.notificationsTwitterCheckin(oNotify.success, oNotify.failure, oNotify.data);
              
        }

      }
    },
    init: function () {
    },
    getCheckinLists: function (success, failure) {
      var self = this;
      var servicesLength = this.checkinLists.length;
      var servicesLoaded = 0;

      $.each(this.checkinLists, function (index, list) {

        Bus.publish('ajax', 'getJSON', {
          path: getServiceURL('checkin.' + list),
          success: function (data) {
            /* Cache the data */
            self.checkinListsCache[list] = data;

            /* Control when all services are loaded */
            servicesLoaded += 1;

            if (servicesLoaded == servicesLength) {
              success(self.checkinListsCache);
            }
          }
        });

      });
    },
    /* Return object states from country code */
    getCheckinStatesFromCountry: function (success, failure, countryCode) {
      var self = this;

      var url = getServiceURL('checkin.address_countries');
      url = url.replace('{country}', countryCode);

      Bus.publish('ajax', 'getJSON', {
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },
    getFlightData: function (success, failure, data) {
      /* Get service URL */
      var url = getServiceURL('checkin.flights');

      /* Replace URL parameters with values */
      url = url.replace('{locator}', data.locator);
      if (typeof data.surname !== 'undefined' && data.surname !== '') {
        url = url.replace('{surname}', data.surname);
      } else {
        url = url.replace('/{surname}', '');
      }

      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },
    postAircraftMap: function (success, failure, postObject, checkinId, passengerId) {

      var $this = $(this);
      var url = getServiceURL('checkin.aircraft_map');

      var flightPostObject = {};
      var passengersPostObject = [];
      var userFlightId = '';
      var passengerSurname = '';
      $.each(postObject.flights, function (flightIndex, flight) {
        if (postObject.flightNumber == flight.flightNumber) {
          flightPostObject = {
            "flightNumber": postObject.flightNumber,
            "carrierCompanyCode": flight.carrierCompany.code,
            "departureDate": flight.departureDate,
            "departureAirportCode": flight.departure.airport.code,
            "arrivalAirportCode": flight.arrival.airport.code
          };
          $.each(flight.passengers, function (passengerIndex, passenger) {
            if (passengerId == passenger.passengerId) {
              userFlightId = passenger.userFlightId;
              return false;
            }
          });
          return false;
        }
      });
      $.each(postObject.passengers, function (passengerIndex, passenger) {
        if (passengerId == passenger.id) {
          passengerSurname = passenger.surname;
          return false;
        }
      });
      passengersPostObject[0] = {
        "userFlightId": userFlightId,
        "surname": passengerSurname
      };

      var postObject = {
        "flight": flightPostObject,
        "passengers": passengersPostObject
      };

      //Replace checkinId in URL
      url = url.replace('{checkinId}', checkinId);

      Bus.publish('ajax', 'postToService', {
        path: url,
        data: postObject,
        success: function (data) {
          success(data);
        }
      });
    },
    putCheckinSeat: function (success, failure, data) {
      /* Get service URL */
      var url = getServiceURL('checkin.select_seat');
      if (data.serviceType == 're-allocate') {
        url = getServiceURL('checkin.re_select_seat');
      }

      /* Replace URL parameters with values */
      url = url.replace('{checkinId}', data.checkinId);
      data = data.putData;

      /* Call to getFromService */
      Bus.publish('ajax', 'postToService', {
        path: url,
        data: data,
        success: function (data) {
          success(data);
        }
      });

    },
    updateCheckinPassengers: function (success, failure, checkinCache, checkinId) {

      var $this = $(this);
      var self = this;
      var url = getServiceURL('checkin.update_passengers');

      var existsFormData = true;

      var updatePassengersObject = [];
      var counter = 0;

      /* Update passenger data */
      $.each(checkinCache.selectedPassengers, function (passengerIndex, passengerData) {
        /* If passenger checkbox in on, proceed to update data before card generate */
        if (checkinCache.formData.field_passenger[passengerData.flightPassenger.passengerId] == 'on') {
          updatePassengersObject[counter] = {
            "id": passengerData.flightPassenger.passengerId,
            "userFlightId": passengerData.flightPassenger.userFlightId,
            "name": passengerData.passenger.name,
            "surname": passengerData.passenger.surname,
            "type": passengerData.passenger.type,
            "gender": passengerData.passenger.gender,
            "title": passengerData.passenger.title
          };

          if (typeof (checkinCache.formData.field_another_nationality) != "undefined" && typeof (checkinCache.formData.field_another_nationality[passengerData.flightPassenger.passengerId]) != "undefined") {
            if (checkinCache.formData.field_another_nationality[passengerData.flightPassenger.passengerId] == "1") {
              var finalState = checkinCache.formData.field_destiny_address_state[passengerData.flightPassenger.passengerId];
              if (typeof (checkinCache.formData.field_destiny_address_state_input) != "undefined" && typeof (checkinCache.formData.field_destiny_address_state_input[passengerData.flightPassenger.passengerId]) != "undefined") {
                if (checkinCache.formData.field_destiny_address_state_input[passengerData.flightPassenger.passengerId].length > 0) {
                  finalState = checkinCache.formData.field_destiny_address_state_input[passengerData.flightPassenger.passengerId];
                }
              }
              updatePassengersObject[counter].destinationAddress = {
                "street": checkinCache.formData.field_destiny_address[passengerData.flightPassenger.passengerId],
                "city": checkinCache.formData.field_destiny_address_city[passengerData.flightPassenger.passengerId],
                "state": finalState,
                "zipCode": checkinCache.formData.field_destiny_address_zip[passengerData.flightPassenger.passengerId],
                "country": checkinCache.formData.field_destiny_address_country[passengerData.flightPassenger.passengerId]
              };
            }
          }

          if (typeof (checkinCache.formData.field_birthdate) != "undefined" && typeof (checkinCache.formData.field_birthdate[passengerData.flightPassenger.passengerId]) != "undefined") {
            updatePassengersObject[counter].birthDay = moment(checkinCache.formData.field_birthdate[passengerData.flightPassenger.passengerId], 'DD/MM/YYYY').format('YYYY-MM-DD');
          }
          if (typeof (checkinCache.formData.field_document_number) != "undefined" && typeof (checkinCache.formData.field_document_expiration) != "undefined" && typeof (checkinCache.formData.field_document_number[passengerData.flightPassenger.passengerId]) != "undefined" && typeof (checkinCache.formData.field_document_expiration[passengerData.flightPassenger.passengerId]) != "undefined") {
            updatePassengersObject[counter].document = {
              "expirationDate": moment(checkinCache.formData.field_document_expiration[passengerData.flightPassenger.passengerId], 'DD/MM/YYYY').format('YYYY-MM-DD'),
              "number": checkinCache.formData.field_document_number[passengerData.flightPassenger.passengerId],
              "type": checkinCache.formData.field_document_type[passengerData.flightPassenger.passengerId], //"PASSPORT"
              "issuingCountry": checkinCache.formData.field_document_country[passengerData.flightPassenger.passengerId]
            };
          }
          if (typeof (checkinCache.formData.field_honorific) != "undefined" && typeof (checkinCache.formData.field_honorific[passengerData.flightPassenger.passengerId]) != "undefined") {
            updatePassengersObject[counter].title = checkinCache.formData.field_honorific[passengerData.flightPassenger.passengerId];
          }
          if (typeof (checkinCache.formData.field_resident_country) != "undefined" && typeof (checkinCache.formData.field_resident_country[passengerData.flightPassenger.passengerId]) != "undefined") {
            updatePassengersObject[counter].countryOfResidence = checkinCache.formData.field_resident_country[passengerData.flightPassenger.passengerId];
          }
          if (typeof (checkinCache.formData.field_document_nationality) != "undefined" && typeof (checkinCache.formData.field_document_nationality[passengerData.flightPassenger.passengerId]) != "undefined") {
            updatePassengersObject[counter].nationality = checkinCache.formData.field_document_nationality[passengerData.flightPassenger.passengerId];
          }
          if (typeof (checkinCache.formData.field_frequent_flyer) != "undefined" && typeof (checkinCache.formData.field_frequent_flyer[passengerData.flightPassenger.passengerId]) != "undefined" && checkinCache.formData.field_frequent_flyer[passengerData.flightPassenger.passengerId] == "on") {
            updatePassengersObject[counter].frequentFlyer = {
              "carrierCode": checkinCache.formData.field_frequent_flyer_type[passengerData.flightPassenger.passengerId],
              "number": checkinCache.formData.field_frequent_flyer_number[passengerData.flightPassenger.passengerId]
            };
          }

          /* If passenger infant is true, compose infant object */
          if (passengerData.flightPassenger.infant) {
            counter++;
            updatePassengersObject[counter] = {
              "id": passengerData.flightPassenger.infantPassenger.id,
              "userFlightId": passengerData.flightPassenger.infant.userFlightId,
              "name": passengerData.flightPassenger.infantPassenger.name,
              "surname": passengerData.flightPassenger.infantPassenger.surname,
              "type": passengerData.flightPassenger.infantPassenger.type
            };
            if (typeof (checkinCache.formData.field_birthdate) != "undefined" && typeof (checkinCache.formData.field_birthdate[passengerData.flightPassenger.infantPassenger.id]) != "undefined") {
              updatePassengersObject[counter].birthDay = moment(checkinCache.formData.field_birthdate[passengerData.flightPassenger.infantPassenger.id], 'DD/MM/YYYY').format('YYYY-MM-DD');
            }
            if (typeof (checkinCache.formData.field_document_number) != "undefined" && typeof (checkinCache.formData.field_document_expiration) != "undefined" && typeof (checkinCache.formData.field_document_number[passengerData.flightPassenger.passengerId]) != "undefined" && typeof (checkinCache.formData.field_document_expiration[passengerData.flightPassenger.passengerId]) != "undefined") {
              updatePassengersObject[counter].document = {
                "expirationDate": moment(checkinCache.formData.field_document_expiration[passengerData.flightPassenger.infantPassenger.id], 'DD/MM/YYYY').format('YYYY-MM-DD'),
                "number": checkinCache.formData.field_document_number[passengerData.flightPassenger.infantPassenger.id],
                "type": checkinCache.formData.field_document_type[passengerData.flightPassenger.infantPassenger.id], //"PASSPORT"
                "issuingCountry": checkinCache.formData.field_document_country[passengerData.flightPassenger.infantPassenger.id]
              };
            }
            if (typeof (checkinCache.formData.field_gender) != "undefined" && typeof (checkinCache.formData.field_gender[passengerData.flightPassenger.infantPassenger.id]) != "undefined") {
              updatePassengersObject[counter].gender = checkinCache.formData.field_gender[passengerData.flightPassenger.infantPassenger.id];
            }
            if (typeof (checkinCache.formData.field_resident_country) != "undefined" && typeof (checkinCache.formData.field_resident_country[passengerData.flightPassenger.passengerId]) != "undefined") {
              updatePassengersObject[counter].countryOfResidence = checkinCache.formData.field_resident_country[passengerData.flightPassenger.passengerId];
            }
            if (typeof (checkinCache.formData.field_document_nationality) != "undefined" && typeof (checkinCache.formData.field_document_nationality[passengerData.flightPassenger.infantPassenger.id]) != "undefined") {
              updatePassengersObject[counter].nationality = checkinCache.formData.field_document_nationality[passengerData.flightPassenger.infantPassenger.id];
            }
            if (typeof (checkinCache.formData.field_frequent_flyer_valid) != "undefined" && checkinCache.formData.field_frequent_flyer_valid[passengerData.flightPassenger.infantPassenger.id] == "true") {
              updatePassengersObject[counter].frequentFlyer = {
                "carrierCode": checkinCache.formData.field_frequent_flyer_type[passengerData.flightPassenger.infantPassenger.id],
                "number": checkinCache.formData.field_frequent_flyer_number[passengerData.flightPassenger.infantPassenger.id]
              };
            }
          }
          counter++;
        }
      });

      /* If there is some data in form, call to update passenger service */
      var updateObject = {
        "passengers": updatePassengersObject,
        "flight": {
          "departureDate": checkinCache.selectedFlight.departureDate,
          "carrierCompanyCode": checkinCache.selectedFlight.carrierCompany.code,
          "operatingCompanyCode": checkinCache.selectedFlight.operatingCompany.code,
          "boarding": {
            "terminal": checkinCache.selectedFlight.boarding.terminal,
            "airportCode": checkinCache.selectedFlight.boarding.airport.code,
            "date": checkinCache.selectedFlight.boarding.date
          },
          "departure": {
            "terminal": checkinCache.selectedFlight.departure.terminal,
            "airportCode": checkinCache.selectedFlight.departure.airport.code,
            "date": checkinCache.selectedFlight.departure.date
          },
          "arrival": {
            "terminal": checkinCache.selectedFlight.arrival.terminal,
            "airportCode": checkinCache.selectedFlight.arrival.airport.code,
            "date": checkinCache.selectedFlight.arrival.date
          },
          "flightNumber": checkinCache.flightNumber
        }
      };

      //Replace checkinId in URL
      url = url.replace('{checkinId}', checkinId);

      Bus.publish('ajax', 'postToService', {
        path: url,
        data: updateObject,
        success: function (data) {
          success(data);
        }
      });
    },
    confirmCheckin: function (success, failure, checkinCache, checkinId) {

      var $this = $(this);
      var url = getServiceURL('checkin.confirm_checkin');

      /* Confirm checkin */
      var passengersTempObject = [];
      var counter = 0;
      $.each(checkinCache.selectedPassengers, function (passengerIndex, passengerData) {
        if (checkinCache.formData.field_passenger[passengerData.flightPassenger.passengerId] == 'on') {
          var infantObject = null;
          if (passengerData.flightPassenger.infant) {
            infantObject = {
              "id": passengerData.flightPassenger.infantPassenger.id,
              "userFlightId": passengerData.flightPassenger.infant.userFlightId,
              "name": passengerData.flightPassenger.infantPassenger.name,
              "surname": passengerData.flightPassenger.infantPassenger.surname,
              "type": passengerData.flightPassenger.infantPassenger.type
            };
            /* Create infant object in superior level like any passenger */
            passengersTempObject[counter] = {
              "id": passengerData.flightPassenger.infantPassenger.id,
              "userFlightId": passengerData.flightPassenger.infant.userFlightId,
              "name": passengerData.flightPassenger.infantPassenger.name,
              "surname": passengerData.flightPassenger.infantPassenger.surname,
              "type": passengerData.flightPassenger.infantPassenger.type,
              "infant": null
            };
            counter++;
          }
          passengersTempObject[counter] = {
            "id": passengerData.flightPassenger.passengerId,
            "userFlightId": passengerData.flightPassenger.userFlightId,
            "name": passengerData.passenger.name,
            "surname": passengerData.passenger.surname,
            "type": passengerData.passenger.type,
            "infant": infantObject
          };
          counter++;
        }
      });

      var postObject = {
        "passengers": passengersTempObject,
        "flight": {
          "departureDate": checkinCache.selectedFlight.departureDate,
          "carrierCompanyCode": checkinCache.selectedFlight.carrierCompany.code,
          "operatingCompanyCode": checkinCache.selectedFlight.operatingCompany.code,
          "boarding": {
            "terminal": checkinCache.selectedFlight.boarding.terminal,
            "airportCode": checkinCache.selectedFlight.boarding.airport.code,
            "date": checkinCache.selectedFlight.boarding.date
          },
          "departure": {
            "terminal": checkinCache.selectedFlight.departure.terminal,
            "airportCode": checkinCache.selectedFlight.departure.airport.code,
            "date": checkinCache.selectedFlight.departure.date
          },
          "arrival": {
            "terminal": checkinCache.selectedFlight.arrival.terminal,
            "airportCode": checkinCache.selectedFlight.arrival.airport.code,
            "date": checkinCache.selectedFlight.arrival.date
          },
          "flightNumber": checkinCache.flightNumber
        }
      };

      //Replace checkinId in URL
      url = url.replace('{checkinId}', checkinId);

      Bus.publish('ajax', 'putToService', {
        path: url,
        data: postObject,
        success: function (data) {
          success(data);
        }
      });
    },
    getCheckinQrCode: function (success, failure, qrCode) {
      var $this = $(this);
      var url = getServiceURL('checkin.checkin_qrcode');

      /* Replace URL parameters with values */
      url = url.replace('{qrCode}', qrCode);

      Bus.publish('ajax', 'getImage', {
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },
    getBoardingPassPdfTicket: function (success, failure, checkinCache, checkinId) {
      var $this = $(this);
      var url = getServiceURL('checkin.boardingpassticket');

      var data = {
        "departureDate": checkinCache.selectedFlight.departureDate,
        "flightNumber": checkinCache.flightNumber,
        "userFlightIds": []
      };

      _.each(checkinCache.cards, function (item, index, list) {
        data.userFlightIds.push(item.passenger.userFlightId)
      });

      /* Replace URL parameters with values */
      url = url.replace('{checkinId}', checkinId);

      Bus.publish('ajax', 'postToService', {
        path: url,
        data: data,
        success: function (data) {
          success(data);
        }
      });
    },
    shareCheckinCards: function (success, failure, data, checkinId) {
      var $this = $(this);
      var url = getServiceURL('checkin.checkin_share');

      /* Replace URL parameters with values */
      url = url.replace('{checkinId}', checkinId);

      Bus.publish('ajax', 'postToService', {
        path: url,
        data: data,
        success: function (data) {
          success(data);
        }
      });
    },
    finishCheckin: function (success, failure, checkinId) {
      var $this = $(this);
      var url = getServiceURL('checkin.finish_checkin');

      /* Replace URL parameters with values */
      url = url.replace('{checkinId}', checkinId);

      Bus.publish('ajax', 'getJSON', {
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },
    cancelCheckin: function (success, failure, checkinCache, passenger, checkinId) {
      var $this = $(this);
      var url = getServiceURL('checkin.cancel_checkin');

      var passengersTempObject = [];
      var counter = 0;
      $.each(checkinCache.selectedPassengers, function (passengerIndex, passengerData) {
        if (passenger == passengerData.flightPassenger.passengerId) {
          var infantObject = null;
          if (passengerData.flightPassenger.infant) {
            infantObject = {
              "id": passengerData.flightPassenger.infantPassenger.id,
              "userFlightId": passengerData.flightPassenger.infant.userFlightId,
              "name": passengerData.flightPassenger.infantPassenger.name,
              "surname": passengerData.flightPassenger.infantPassenger.surname,
              "type": passengerData.flightPassenger.infantPassenger.type
            };
          }
          passengersTempObject[counter] = {
            "id": passengerData.flightPassenger.passengerId,
            "userFlightId": passengerData.flightPassenger.userFlightId,
            "name": passengerData.passenger.name,
            "surname": passengerData.passenger.surname,
            "type": passengerData.passenger.type,
            "infant": infantObject
          };
          counter++;
        }
      });

      var putObject = {
        "passengers": passengersTempObject,
        "flight": {
          "departureDate": checkinCache.selectedFlight.departureDate,
          "carrierCompanyCode": checkinCache.selectedFlight.carrierCompany.code,
          "operatingCompanyCode": checkinCache.selectedFlight.operatingCompany.code,
          "boarding": {
            "terminal": checkinCache.selectedFlight.boarding.terminal,
            "airportCode": checkinCache.selectedFlight.boarding.airport.code,
            "date": checkinCache.selectedFlight.boarding.date
          },
          "departure": {
            "terminal": checkinCache.selectedFlight.departure.terminal,
            "airportCode": checkinCache.selectedFlight.departure.airport.code,
            "date": checkinCache.selectedFlight.departure.date
          },
          "arrival": {
            "terminal": checkinCache.selectedFlight.arrival.terminal,
            "airportCode": checkinCache.selectedFlight.arrival.airport.code,
            "date": checkinCache.selectedFlight.arrival.date
          },
          "flightNumber": checkinCache.flightNumber
        }
      };

      /* Replace URL parameters with values */
      url = url.replace('{checkinId}', checkinId);

      Bus.publish('ajax', 'putToService', {
        path: url,
        data: putObject,
        success: function (data) {
          success(data);
        }
      });
    },
    /* Get booking by userId */
    getBookingByUser: function (success, failure, userId) {
      var $this = $(this);
      var url = getServiceURL('checkin.bookings');

      /* Replace URL parameters with values */
      url = url.replace('{userId}', userId);

      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },

    getDocumentType: function(success, failure, type) {
      /* Get service URL */
      var url = getServiceURL('checkin.document_type');

      /* Replace URL parameters with values */
      url = url.replace('{preconditionDocsType}', type);

      Bus.publish('ajax', 'getJSON', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    },
    
    getFrequentFlyerCheck: function(success, failure, data) {
        /* Get service URL */
        var url = getServiceURL('checkin.frequent_flyer_check');

        /* Replace URL parameters with values */
        url = url.replace('{surname}', data.surname);
        url = url.replace('{frequentFlyerProgram}', data.frequentFlyerProgram);
        url = url.replace('{frequentFlyerIdentity}', data.frequentFlyerIdentity);

        Bus.publish('ajax', 'getFromService', {
          path: url,
          success: function(data) {
            success(data);
          }
        });
      },

    loginTwitterOAuthCheckin: function(success, failure, data) {
      /* Get service URL */
        var url = getServiceURL('twitter.login_twitter_oauth');

        url = url.replace('{step}','checkin');
        url = url.replace('{returnTo}', encodeURIComponent(data));
        
        Bus.publish('ajax', 'getFromService', {
            path: url,
            success: function(data) {
              success(data);
            }
        });
    },

    followingUsTwitterCheckin: function(success, failure, data){

        var url = getServiceURL('twitter.following_us_twitter');

        Bus.publish('ajax', 'getFromService',{
            path:url,
            success: function(data){
              success(data);
            }

        });
     },

    followUsTwitterCheckin: function(success, failure){

        var url = getServiceURL('twitter.follow_us_twitter');

        Bus.publish('ajax', 'getFromService',{
            path:url,
            success: function(data){
              success(data);
            }

        });
     },

   notificationsTwitterCheckin: function(success, failure, data){

        var url = getServiceURL('twitter.notifications_twitter');
   
        //ReplaceAll (/)
        var departureDate = data.departureDate.replace(/\//g, '-');
        var arrivalDate = data.arrivalDate.replace(/\//g, '-');

        url = url.replace('{flightCode}', data.flightCode);
        url = url.replace('{departureAirport}', data.departureAirport);
        url = url.replace('{departureDate}', departureDate);
        url = url.replace('{arrivalAirport}', data.arrivalAirport);
        url = url.replace('{arrivalDate}', arrivalDate);

        Bus.publish('ajax', 'getFromService',{
            path:url,
            success: function(data){
              success(data);
            }
        });

     }

  };
});
