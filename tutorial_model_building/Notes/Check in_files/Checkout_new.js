Hydra.module.register('CheckoutController', function (Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#process',
    element: undefined,
    /* Checkout cache */
    checkoutCache: [],
    checkoutPhoneCache: undefined,
    showCallMeBackPopup: false,
    events: {
      'process': {
        'show_checkout': function (oNotify) { 
          /* Default step */
          if (oNotify.step == '')
            oNotify.step = 'passengers';
          /* Just load the checkout if it's a valid step */
          if (oNotify.step == 'passengers' ||
                  oNotify.step == 'extras' ||
                  oNotify.step == 'payment' ||
                  oNotify.step == 'finish' ||
                  oNotify.step == 'confirm') {
            this.showCheckout(oNotify.step);
            if (window.warningBookingIntervalId) {
              clearTimeout(window.warningBookingIntervalId);
            }
          }
        },
        'get_checkout_data': function (oNotify) {
          this.getCheckoutData(oNotify.callback);
        }
      }
    },
    init: function () {
      /* Save jquery object reference */
      this.element = $(this.selector);

      /* Init show call me back popup */
      this.showCallMeBackPopup = false;
    },

    getCheckoutData: function (callback) {
      callback(this.checkoutCache);
    },

    
    /* Checkout process */

    showCheckout: function (step) {
      var self = this;
      /* Prepare the process */
      Bus.publish('process', 'start', {process: 'search'});
      /* If the page already exists from results page, don't need to create it */
      if (this.element.find('.process_page.checkout').length > 0) {
        /* First time showing checkout, so create the #checkout block and move the wrapper */
        if (this.element.find('#checkout').length == 0) {
          this.downloadStructureTemplate(step);
        }
        else {
          this.prepareCheckoutStructure(step);
        }
      }
      else {
        /* Create new page and append it */
        var $newPage = $('<div class="process_page checkout"><div class="process_page_loading"><span class="spinner"></span></div></div>');
        this.element.find('.process_page_wrapper').append($newPage);
        /* Start background color animation */
        setTimeout(function () {
          self.element.find('.process_page.checkout .process_page_loading').addClass('showing');
          self.element.find('.process_page.checkout .process_page_loading .spinner').show();
        }, 200);
        /* Download template */
        this.downloadStructureTemplate(step);
      }
    },
    downloadStructureTemplate: function (step) {
      var self = this;
      /* Get the structure template: mini_search + loading */
      Bus.publish('ajax', 'getTemplate', {
        path: AirEuropaConfig.templates.checkout.structure,
        success: function (html) {
          self.element.find('.process_page.checkout').append(html);
          /* Proload flights */
          self.prepareCheckoutStructure(step);
        }
      });
    },
    prepareCheckoutStructure: function (step) {
      var self = this;
      var offsetTop = this.element.find('.process_page.checkout').index() * 100 * -1;
      /* Check if the process_page_wrapper is already at 100%, so we don't need to animate it */
      if (this.element.find('.process_page_wrapper').attr('data-view') == 'checkout') {
        this.loadCheckout(step);
      }
      else { /* Animate process wrapper to show the new page */
        this.element.find('.process_page_wrapper').animate({
          'top': offsetTop + '%'
        }, 500, 'easeInOutExpo', function () {
          self.loadCheckout(step);
        });
      }
    },
    loadCheckout: function (step) {
      var self = this;
      var jsonPath = getServiceURL('checkout.session');
      var templatePath = eval('AirEuropaConfig.templates.checkout.' + step);
      var checkoutProcessURL = getProcessUrl('checkout');
      /* Add checkout view flag */
      this.element.find('.process_page_wrapper').attr('data-view', '').attr('data-view', 'checkout');
      /* Call AJAX module to get the checkout session object */
      Bus.publish('ajax', 'getJSON', {
        path: jsonPath,
        success: function (data) {
          if (data && data.checkout) { /* Check data checkout */
            data = data.checkout;
            /* If there isn't a session */
            if (data.sessionId) {

              /* Save json data on cache */
              self.checkoutCache = data;
              /* Global checkout warning booking listener */
              checkWarningBookingMessage(self.checkoutCache.warningBookingLimit);
              /* Prepare flags for luggage and seats info for tag manager */
              var equipageIda = false;
              var equipageVuelta = false;
              var asientoIda = false;
              var asientoVuelta = false;
              if (self.checkoutCache && self.checkoutCache.servicePassengers) {
                _.each(self.checkoutCache.servicePassengers, function (passenger, index, list) {

                  /* Look for luggage extra in any passenger */
                  if (passenger.extras &&
                          passenger.extras.luggage) {
                    if (passenger.extras.luggage.amount != '0' && passenger.extras.luggage.journey == 'ONEWAY')
                      equipageIda = true;
                    if (passenger.extras.luggage.amount != '0' && passenger.extras.luggage.journey == 'RETURNWAY')
                      equipageVuelta = true;
                    if (passenger.extras.luggage.amount != '0' && passenger.extras.luggage.journey == 'ROUNDTRIP') {
                      equipageIda = true;
                      equipageVuelta = true;
                    }
                  }

                  /* Look for luggage extra in any passenger */
                  if (passenger.seats) {
                    if (passenger.seats.ow) {
                      _.each(passenger.seats.ow, function (item, index, list) {
                        if (item.column != '' && item.number != '')
                          asientoIda = true;
                      });
                    }
                    if (passenger.seats.rt) {
                      _.each(passenger.seats.rt, function (item, index, list) {
                        if (item.column != '' && item.number != '')
                          asientoVuelta = true;
                      });
                    }
                  }
                });
              }

              /*Getting all info for technical stops and adding it to checkoutCache object to be used in template.
              We are getting this info in this point as it does not depend on step. It is used on passenger, extra and payment step.*/
              self.checkoutCache['dataTechnicalStops'] = self.getInfoTechnicalStops(data);   


              /* Load custom services depending on the step */
              if (step == "passengers") {
                self.checkoutCache['step'] = 'passengers';
                /* Get lists */
                self.loadCheckoutData(data.sessionId, function () {

                  var indexHelper = 0;
                  /* Order the passengers object */
                  var passengersArray = [];
                  for (var passenger in self.checkoutCache['passengers']) {
                    if (self.checkoutCache['passengers'].hasOwnProperty(passenger)) {
                      indexHelper = parseInt(passenger);
                      passengersArray[indexHelper] = self.checkoutCache['passengers'][passenger];
                    }
                  }

                  self.checkoutCache['passengers'] = passengersArray;
                  /* Get itemization */
                  Bus.publish('services', 'getItemization', {
                    sessionId: data.sessionId,
                    stepType: 'PASSENGERS',
                    success: function (itemizationData) {
                      if (itemizationData.header.error != true) {
                        self.checkoutCache['itemization'] = itemizationData.body.data;
                      }

                      /* If the user is logged in, get the user info and frequent passengers */
                      if (User.isLoggedIn()) {
                        /* Get user info */
                        Bus.publish('services', 'getUser', {
                          success: function (userInfoResponse) {
                            self.checkoutCache['user_info'] = userInfoResponse.body.data;
                            var user = userInfoResponse.body.data.user,
                                preference = userInfoResponse.body.data.preference;

                            if (!data.passengers_added) {
                              var user_document_type = user.identificationDocument.documentType.code;
                              var user_document_number = user.identificationDocument.identity;
                              var isDocumentAvailable = false;

                              /* check the if the document saved, is in the list of document availables */
                              $.each(self.checkoutCache['typeDocumentation'], function (indexDocument, document) {

                                if (document.code == user_document_type)
                                {
                                  isDocumentAvailable = true;
                                  return false;
                                }

                              });

                              /* Find index of passenger by type to autocomplete data in passengers form */
                              var indexPaxAutocomplete = -1;

                              $.each(self.checkoutCache.passengers, function(indexPax,dataPax){
                                if (dataPax.type === self.getTypeByBirth(user)) {
                                  indexPaxAutocomplete === -1 ? indexPaxAutocomplete = indexPax : '';
                                }
                              });

                              if (indexPaxAutocomplete >= 0) {
                                self.checkoutCache.passengers[indexPaxAutocomplete].info = {
                                  birthdate: user.born,
                                  document_country: user.identificationDocument.expeditionCountry,
                                  document_expiration: user.identificationDocument.expiration,
                                  document_number: (isDocumentAvailable)? user_document_number : '',
                                  document_type: user_document_type,
                                  email: user.contactInformation.email,
                                  frequent_flyer: (user.frequentFlyerInformation.frequentFlyer) ? 1 : 0,
                                  frequent_flyer_number: user.frequentFlyerInformation.frequentFlyerIdentity,
                                  frequent_flyer_type: user.frequentFlyerInformation.frequentFlyerType,
                                  honorific: (user.title === 'MR') ? 'sr' : (user.title === 'MRS') ? 'sra' : 'srta',
                                  large_family: user.userGrant.largeFamilyGrant.largeFamily,
                                  large_family_number: user.userGrant.largeFamilyGrant.largeFamilyIdentity,
                                  large_family_region: (user.userGrant.largeFamilyGrant.largeFamilyCommunity) ? user.userGrant.largeFamilyGrant.largeFamilyCommunity.code : null,
                                  large_family_type: user.userGrant.largeFamilyGrant.largeFamilyTypeSubvention,
                                  name: user.personCompleteName.name,
                                  nationality: user.citizenship.code,
                                  preference_airport: preference.preferenceAirport,                                  
                                  phone: (user.contactInformation.telephone) ? user.contactInformation.telephone.number : null,
                                  phone_prefix: (user.contactInformation.telephone) ? user.contactInformation.telephone.prefix : null,
                                  surname_1: user.personCompleteName.firstSurname,
                                  surname_2: user.personCompleteName.secondSurname,
                                  resident_discount_city: (user.userGrant.residentGrant.residentTown && user.userGrant.residentGrant.residentTown.code) ? user.userGrant.residentGrant.residentTown.code : null
                                };
                              }

                            }
                            /* Get frequent flyers */
                            Bus.publish('services', 'getFrequentPassengers', {
                              userId: localStorage.ly_userId,
                              success: function (frequentPassengerResponse) {
                                /* Reset the array */
                                self.checkoutCache['frequent_passengers'] = [];

                                /* Add the current user as the first value of the combo */
                                self.checkoutCache['frequent_passengers'].push(self.generateFrequentPassenger(user));

                                if (frequentPassengerResponse && frequentPassengerResponse.body && frequentPassengerResponse.body.data) {
                                  /* Model type property because is checked on frequent passengers select */
                                  var typeFinal;
                                  _.each(frequentPassengerResponse.body.data, function(dataPax, indexPax){
                                    if (dataPax.passengerType == 'INFANT') {
                                      typeFinal = 'baby';
                                    }
                                    else if (dataPax.passengerType == 'CHILD') {
                                      typeFinal = 'kid';
                                    }
                                    else if (dataPax.passengerType == 'ADULT') {
                                      typeFinal = 'adult';
                                    }
                                    frequentPassengerResponse.body.data[indexPax].type = typeFinal;
                                    frequentPassengerResponse.body.data[indexPax].name = dataPax.name.toUpperCase();
                                    frequentPassengerResponse.body.data[indexPax].surname = dataPax.surname.toUpperCase();
                                    frequentPassengerResponse.body.data[indexPax].surname2 = dataPax.surname2 ? dataPax.surname2.toUpperCase() : null;
                                  });
                                  self.checkoutCache['frequent_passengers'] = self.checkoutCache['frequent_passengers'].concat(frequentPassengerResponse.body.data);
                                }

                                self.getHelpdeskPhone(); /* Get helpdesk phone */
                                self.loadCheckoutTemplate(templatePath, step);
                              }
                            });
                          }
                        });
                      }

                      /* If not, just load the template */
                      else {
                        self.getHelpdeskPhone(); /* Get helpdesk phone */
                        self.loadCheckoutTemplate(templatePath, step);
                      }


                    }
                  });
                });
              }
              else if (step == 'extras') {
                if (!data.passengers_added) {
                  Bus.publish('hash', 'change', {hash: checkoutProcessURL + '/passengers'});
                }
                else {
                  self.checkoutCache['step'] = 'extras';
                  self.loadCheckoutData(data.sessionId, function () { /* Get lists */

                    self.getHelpdeskPhone(); /* Get helpdesk phone */
                    /* Call ancillaries before itemization to reset the itemization data in the server */
                    Bus.publish('services', 'getAncillaries', {/* Get ancillaries configuration */
                      sessionId: data.sessionId,
                      success: function (ancData) {
                        if (self.checkoutCache['services'] == undefined) {
                          self.checkoutCache['services'] = [];
                        }

                        /* Set segmentId in the global journey object */
                        self.setIdentityFlights(ancData);
                        /* Set new supportedFlights object based index in identity number */
                        $.each(ancData.ancillaries, function (indexAnc, dataAnc) {
                          ancData.ancillaries[indexAnc].supportedFlightsByIdentity = [];
                          if (dataAnc.supportedFlights) {
                            $.each(dataAnc.supportedFlights, function (indexFl, dataFl) {
                              ancData.ancillaries[indexAnc].supportedFlightsByIdentity[dataFl.identity] = dataFl;
                            });
                          }
                        });
                        /* Control passengers returned by the service - update them if they have changed */
                        if (self.checkoutCache['servicePassengers'] == undefined) { /* First time the user arrives to extras screen */
                          self.checkoutCache['servicePassengers'] = ancData.passengers;
                        }
                        else { /* Not first time */
                          /* Change the info of each passenger, but respect their extras (seats and extra objects) */
                          $.each(self.checkoutCache['servicePassengers'], function (indexPassenger, passenger) {
                            /* Get a reference to extras and seats */
                            var extras = passenger.extras;
                            var seats = passenger.seats;
                            /* Update service ancData */
                            self.checkoutCache['servicePassengers'][indexPassenger] = ancData.passengers[indexPassenger];
                            /* Keep the extras and seats objects */
                            self.checkoutCache['servicePassengers'][indexPassenger].extras = extras;
                            self.checkoutCache['servicePassengers'][indexPassenger].seats = seats;
                          });
                        }

                        /* Set a flag in the ancillary object to figure out its status */
                        $.each(ancData.ancillaries, function (indexAncillary, ancillary) {
                          if (ancillary.supportedFlights != undefined) {

                            if (ancillary.type == 'BAGGAGE') {

                              /* Type BAGGAGE */
                              var blockThisAncillaryOw = false;
                              var blockThisAncillaryRt = false;
                              var ancillaryMessageOw = '';
                              var ancillaryMessageRt = '';

                              /* Iterate over supported flights*/
                              $.each(ancillary.supportedFlights, function (indexFlight, flight) {
                                var flightIdentity = flight.identity;
                                var segmentType;

                                $.each(ancData.journey.outboundFlights, function (indexJourney, journey) {
                                  if (journey.identity == flightIdentity) segmentType = 'ow';
                                });

                                $.each(ancData.journey.returnFlights, function (indexJourney, journey) {
                                  if (journey.identity == flightIdentity) segmentType = 'rt';
                                });

                                if (segmentType == 'ow') {
                                  if (flight.blocked == true) {
                                    blockThisAncillaryOw = true;
                                  }
                                  ancillaryMessageOw = flight.message;
                                } else {
                                  if (flight.blocked == true) {
                                    blockThisAncillaryRt = true;
                                  }
                                  ancillaryMessageRt = flight.message;
                                }
                              });

                              ancillary.blocked = blockThisAncillaryOw || blockThisAncillaryRt;
                              ancillary.blockedAll = blockThisAncillaryOw && blockThisAncillaryRt;
                              ancillary.blockedOw = blockThisAncillaryOw;
                              ancillary.blockedRt = blockThisAncillaryRt;
                              ancillary.messageOw = ancillaryMessageOw;
                              ancillary.messageRt = ancillaryMessageRt;
                              ancillary.message = ancillaryMessageRt != '' ? ancillaryMessageRt : ancillaryMessageOw;

                            } else {

                              /* Type SEATS */
                              var blockThisAncillary = true;
                              var ancillaryMessage = '';

                              /* Iterate over supported flights*/
                              $.each(ancillary.supportedFlights, function (indexFlight, flight) {
                                if (flight.blocked == false) {
                                  blockThisAncillary = false;
                                }

                                ancillaryMessage = flight.message;
                              });

                              ancillary.blocked = blockThisAncillary;
                              ancillary.message = ancillaryMessage;

                            }
                          }
                        });

                        /* Save json ancData on cache */
                        self.checkoutCache['services']['ancillariesJourney'] = ancData.journey;
                        self.checkoutCache['services']['ancillaries'] = ancData.ancillaries;
                        Bus.publish('services', 'getItemization', {/* Get itemization */
                          sessionId: data.sessionId,
                          stepType: 'ANCILLARIES',
                          success: function (itemizationData) {
                            if (itemizationData.header.error != true) {
                              self.checkoutCache['itemization'] = itemizationData.body.data;
                            }

                            /* Call the template */
                            self.loadCheckoutTemplate(templatePath, step);
                          }
                        });
                      }
                    });
                  });
                  /* Check if the Scoring is not evaluate */
                  if (self.showCallMeBackPopup === false) {
                    /* Update Google tag manager */
                    if (market.toUpperCase() === "US") {
                      updateGtm({
                        'ow': (self.checkoutCache.resultsParams.rt != 'false') ? 'N' : 'S',
                        'business': (self.checkoutCache.resultsParams.business == 'true') ? 'BUS' : 'TUR',
                        'origen': self.checkoutCache.resultsParams.from,
                        'destino': self.checkoutCache.resultsParams.to,
                        'fechaida': self.checkoutCache.resultsParams.ow,
                        'fecharegreso': (self.checkoutCache.resultsParams.rt != 'false') ? self.checkoutCache.resultsParams.rt : '',
                        'residente': (self.checkoutCache.resultsParams.resident == 'true') ? 'S' : 'N',
                        'numpax': parseInt(self.checkoutCache.resultsParams.adults) + parseInt(self.checkoutCache.resultsParams.kids) + parseInt(self.checkoutCache.resultsParams.babies),
                        'divisa': window.appConfig.currentCurrency.code || 'EUR',
                        'mercado': window.market,
                        'pageArea': 'Comprar vuelos',
                        'pageCategory': 'Checkout',
                        'pageContent': 'Selección de extras ' + window.getResultsViewName(self.checkoutCache.resultView)
                      });
                    } else {
                      updateGtm({
                        'ow': (typeof self.checkoutCache.resultsParams.dateArrival != 'undefined') ? 'N' : 'S',
                        'fareFamilyIda': self.checkoutCache.journeys.ow.fareFamily.code || '',
                        'fareFamilyVuelta': (self.checkoutCache.journeys.rt != null) ? self.checkoutCache.journeys.rt.fareFamily.code : '',
                        'origen': self.checkoutCache.resultsParams.airportDeparture,
                        'destino': self.checkoutCache.resultsParams.airportArrival,
                        'fechaida': self.checkoutCache.resultsParams.dateDeparture,
                        'fecharegreso': (typeof self.checkoutCache.resultsParams.dateArrival != 'undefined') ? self.checkoutCache.resultsParams.dateArrival : '',
                        'residente': (self.checkoutCache.resultsParams.paxAdultResident > 0) ? 'S' : 'N',
                        'numpax': parseInt(self.checkoutCache.resultsParams.paxAdult) + parseInt(self.checkoutCache.resultsParams.paxChild) + parseInt(self.checkoutCache.resultsParams.paxInfant) + parseInt(self.checkoutCache.resultsParams.paxAdultResident) + parseInt(self.checkoutCache.resultsParams.paxChildResident) + parseInt(self.checkoutCache.resultsParams.paxInfantResident),
                        'divisa': window.appConfig.currentCurrency.code || 'EUR',
                        'mercado': window.market,
                        'pageArea': 'Comprar vuelos',
                        'pageCategory': 'Checkout',
                        'pageContent': 'Selección de extras por horas'
                      });
                    }
                  }
                }
              }
              else if (step == "payment") {
                if (!data.passengers_added) {
                  Bus.publish('hash', 'change', {hash: checkoutProcessURL + '/extras'});
                }
                else {
                  self.checkoutCache['step'] = 'payment';
                  self.loadCheckoutData(data.sessionId, function () { /* Get lists */
                 
                    if(!window.paypalTemp){ 
                      /* Call to payment methods again to reset the itemization */
                      Bus.publish('services', 'getPaymentMethods', {
                        sessionId: data.sessionId,
                        success: function (paymentData) {

                          var goToNextStep = !(paymentData.header.error == true);
                          var showScoring = (paymentData.header.code == 4025);
                          if (showScoring) {
                            /* Update Google tag manager */
                            if (market.toUpperCase() === "US") {
                              updateGtm({
                                'ow': (self.checkoutCache.resultsParams.rt != 'false') ? 'N' : 'S',
                                'business': (self.checkoutCache.resultsParams.business == 'true') ? 'BUS' : 'TUR',
                                'origen': self.checkoutCache.resultsParams.from,
                                'destino': self.checkoutCache.resultsParams.to,
                                'fechaida': self.checkoutCache.resultsParams.ow,
                                'fecharegreso': (self.checkoutCache.resultsParams.rt != 'false') ? self.checkoutCache.resultsParams.rt : '',
                                'residente': (self.checkoutCache.resultsParams.resident == 'true') ? 'S' : 'N',
                                'numpax': parseInt(self.checkoutCache.resultsParams.adults) + parseInt(self.checkoutCache.resultsParams.kids) + parseInt(self.checkoutCache.resultsParams.babies),
                                'asientoida': asientoIda ? 'S' : 'N',
                                'asientovuelta': asientoVuelta ? 'S' : 'N',
                                'equipajeida': equipageIda ? 'S' : 'N',
                                'equipajevuelta': equipageVuelta ? 'S' : 'N',
                                'opcioncambio': (self.checkoutCache.extras && self.checkoutCache.extras.journeyRelated && self.checkoutCache.extras.journeyRelated.change && self.checkoutCache.extras.journeyRelated.change == '1') ? 'S' : 'N',
                                'seguro': (self.checkoutCache.extras && self.checkoutCache.extras.journeyRelated && self.checkoutCache.extras.journeyRelated.insurance) ? self.checkoutCache.extras.journeyRelated.insurance : '',
                                'divisa': window.appConfig.currentCurrency.code || 'EUR',
                                'mercado': window.market,
                                'pageArea': 'Comprar vuelos',
                                'pageCategory': 'Checkout',
                                'pageContent': 'Call me back ' + window.getResultsViewName(self.checkoutCache.resultView)
                              });
                            } else {
                              updateGtm({
                                'ow': (typeof self.checkoutCache.resultsParams.dateArrival != 'undefined') ? 'N' : 'S',
                                'fareFamilyIda': self.checkoutCache.journeys.ow.fareFamily.code || '',
                                'fareFamilyVuelta': (self.checkoutCache.journeys.rt != null) ? self.checkoutCache.journeys.rt.fareFamily.code : '',
                                'origen': self.checkoutCache.resultsParams.airportDeparture,
                                'destino': self.checkoutCache.resultsParams.airportArrival,
                                'fechaida': self.checkoutCache.resultsParams.dateDeparture,
                                'fecharegreso': (typeof self.checkoutCache.resultsParams.dateArrival != 'undefined') ? self.checkoutCache.resultsParams.dateArrival : '',
                                'residente': (self.checkoutCache.resultsParams.paxAdultResident > 0) ? 'S' : 'N',
                                'numpax': parseInt(self.checkoutCache.resultsParams.paxAdult) + parseInt(self.checkoutCache.resultsParams.paxChild) + parseInt(self.checkoutCache.resultsParams.paxInfant) + parseInt(self.checkoutCache.resultsParams.paxAdultResident) + parseInt(self.checkoutCache.resultsParams.paxChildResident) + parseInt(self.checkoutCache.resultsParams.paxInfantResident),
                                'asientoida': asientoIda ? 'S' : 'N',
                                'asientovuelta': asientoVuelta ? 'S' : 'N',
                                'equipajeida': equipageIda ? 'S' : 'N',
                                'equipajevuelta': equipageVuelta ? 'S' : 'N',
                                'opcioncambio': (self.checkoutCache.extras && self.checkoutCache.extras.journeyRelated && self.checkoutCache.extras.journeyRelated.change && self.checkoutCache.extras.journeyRelated.change == '1') ? 'S' : 'N',
                                'seguro': (self.checkoutCache.extras && self.checkoutCache.extras.journeyRelated && self.checkoutCache.extras.journeyRelated.insurance) ? self.checkoutCache.extras.journeyRelated.insurance : '',
                                'divisa': window.appConfig.currentCurrency.code || 'EUR',
                                'mercado': window.market,
                                'pageArea': 'Comprar vuelos',
                                'pageCategory': 'Checkout',
                                'pageContent': 'Call me back por horas'
                              });
                            }

                            /* Save a scoring flag */
                            self.checkoutCache['scoring1'] = false;
                            /* Show call me back popup */
                            self.showCallMeBackPopup = true;

                            /* Show call me back popup */
                            self.element.find('.process_scroll').steps('showErrors');
                            Bus.publish('checkout', 'show_call_me_back');
                            self.showCallMeBackPopup = false;
                          }
                          else {
                            /* Update Google tag manager */
                            if (market.toUpperCase() === "US") {
                              updateGtm({
                                'ow': (self.checkoutCache.resultsParams.rt != 'false') ? 'N' : 'S',
                                'business': (self.checkoutCache.resultsParams.business == 'true') ? 'BUS' : 'TUR',
                                'origen': self.checkoutCache.resultsParams.from,
                                'destino': self.checkoutCache.resultsParams.to,
                                'fechaida': self.checkoutCache.resultsParams.ow,
                                'fecharegreso': (self.checkoutCache.resultsParams.rt != 'false') ? self.checkoutCache.resultsParams.rt : '',
                                'residente': (self.checkoutCache.resultsParams.resident == 'true') ? 'S' : 'N',
                                'numpax': parseInt(self.checkoutCache.resultsParams.adults) + parseInt(self.checkoutCache.resultsParams.kids) + parseInt(self.checkoutCache.resultsParams.babies),
                                'asientoida': asientoIda ? 'S' : 'N',
                                'asientovuelta': asientoVuelta ? 'S' : 'N',
                                'equipajeida': equipageIda ? 'S' : 'N',
                                'equipajevuelta': equipageVuelta ? 'S' : 'N',
                                'opcioncambio': (self.checkoutCache.extras && self.checkoutCache.extras.journeyRelated && self.checkoutCache.extras.journeyRelated.change && self.checkoutCache.extras.journeyRelated.change == '1') ? 'S' : 'N',
                                'seguro': (self.checkoutCache.extras && self.checkoutCache.extras.journeyRelated && self.checkoutCache.extras.journeyRelated.insurance) ? self.checkoutCache.extras.journeyRelated.insurance : '',
                                'divisa': window.appConfig.currentCurrency.code || 'EUR',
                                'mercado': window.market,
                                'pageArea': 'Comprar vuelos',
                                'pageCategory': 'Checkout',
                                'pageContent': 'Pago del vuelo ' + window.getResultsViewName(self.checkoutCache.resultView)
                              });
                            } else {
                              updateGtm({
                                'ow': (typeof self.checkoutCache.resultsParams.dateArrival != 'undefined') ? 'N' : 'S',
                                'fareFamilyIda': self.checkoutCache.journeys.ow.fareFamily.code || '',
                                'fareFamilyVuelta': (self.checkoutCache.journeys.rt != null) ? self.checkoutCache.journeys.rt.fareFamily.code : '',
                                'origen': self.checkoutCache.resultsParams.airportDeparture,
                                'destino': self.checkoutCache.resultsParams.airportArrival,
                                'fechaida': self.checkoutCache.resultsParams.dateDeparture,
                                'fecharegreso': (typeof self.checkoutCache.resultsParams.dateArrival != 'undefined') ? self.checkoutCache.resultsParams.dateArrival : '',
                                'residente': (self.checkoutCache.resultsParams.paxAdultResident > 0) ? 'S' : 'N',
                                'numpax': parseInt(self.checkoutCache.resultsParams.paxAdult) + parseInt(self.checkoutCache.resultsParams.paxChild) + parseInt(self.checkoutCache.resultsParams.paxInfant) + parseInt(self.checkoutCache.resultsParams.paxAdultResident) + parseInt(self.checkoutCache.resultsParams.paxChildResident) + parseInt(self.checkoutCache.resultsParams.paxInfantResident),
                                'asientoida': asientoIda ? 'S' : 'N',
                                'asientovuelta': asientoVuelta ? 'S' : 'N',
                                'equipajeida': equipageIda ? 'S' : 'N',
                                'equipajevuelta': equipageVuelta ? 'S' : 'N',
                                'opcioncambio': (self.checkoutCache.extras && self.checkoutCache.extras.journeyRelated && self.checkoutCache.extras.journeyRelated.change && self.checkoutCache.extras.journeyRelated.change == '1') ? 'S' : 'N',
                                'seguro': (self.checkoutCache.extras && self.checkoutCache.extras.journeyRelated && self.checkoutCache.extras.journeyRelated.insurance) ? self.checkoutCache.extras.journeyRelated.insurance : '',
                                'divisa': window.appConfig.currentCurrency.code || 'EUR',
                                'mercado': window.market,
                                'pageArea': 'Comprar vuelos',
                                'pageCategory': 'Checkout',
                                'pageContent': 'Pago del vuelo por horas'
                              });
                            }


                            /* Save a scoring flag */
                            self.checkoutCache['scoring1'] = true;

                            /* Save payment methods info */
                            var passengerList     = paymentData.body.data.passengers;
                            var paymentMethodList = paymentData.body.data.paymentMethods;
                            var loyaltyMiles = paymentData.body.data.loyaltyMiles;

                            $.each(paymentMethodList, function (paymentMethodIndex, paymentMethodInfo) {
                              /* Save in array all document types that are available in current payment method */
                              var availableDocumentTypeList = [];
                              $.each(paymentMethodInfo.documentTypes, function (documentTypeIndex, documentTypeInfo) {
                                availableDocumentTypeList.push(documentTypeInfo.code);
                              });

                              /* Save in array all passengers whose document type is available in current payment method */
                              var availablePassengerList = [];
                              $.each(passengerList, function (passengerIndex, passengerInfo) {
                                var documentCode = passengerInfo.identificationDocument.documentType.code;

                                if (($.inArray(documentCode, availableDocumentTypeList) != -1) && (passengerInfo.passengerType == 'ADULT')) {
                                  passengerInfo.passengerIndex = passengerIndex;
                                  availablePassengerList.push(passengerInfo);
                                }
                              });

                              paymentMethodList[paymentMethodIndex]['availablePassengers'] = availablePassengerList;

                              if (paymentMethodInfo.type == 'MILES'){

                               var minRedemptionMiles = paymentMethodInfo.milesInformation.minRedemptionMiles;
                               var newMilesMessage = lang('checkout_payment.min_miles_information') + minRedemptionMiles + lang('checkout_payment.min_miles_status');

                               paymentMethodInfo.status.information = newMilesMessage;

                             }

                            });

                            self.checkoutCache['methods'] = paymentMethodList;

                            /* Save loyaltyMiles object */
                            self.checkoutCache['loyaltyMiles'] = loyaltyMiles;

                            /* Check ESTA constraint, and add to CheckoutCache */
                            if (typeof paymentData.body.data.journeyConstraints[0] !== 'undefined') {
                              self.checkoutCache['constraintESTA'] = paymentData.body.data.journeyConstraints[0];
                            }

                            /* Save passengers list*/
                            self.checkoutCache['calculatePassengers'] = paymentData.body.data.passengers;

                            /* Add extra and seats objects from servicePassengers global object, so they can be available in the next screen */
                            $.each(self.checkoutCache['calculatePassengers'], function (indexPassenger, passenger) {
                              if (passenger.identity != null) {
                                var extrasPassenger = self.getExtraPassengersByIdentity(passenger.identity, self);

                                self.checkoutCache['calculatePassengers'][indexPassenger].extras = extrasPassenger.extras;
                                self.checkoutCache['calculatePassengers'][indexPassenger].seats = extrasPassenger.seats;
                                self.checkoutCache['calculatePassengers'][indexPassenger].seatsLength = window.objectLength(extrasPassenger.seats.ow) + window.objectLength(extrasPassenger.seats.rt);
                              }
                            });

                            /* Save passengers info list*/
                            self.checkoutCache['totalPassengersInfo'] = self.getInfoPanssengers(paymentData.body.data.passengers);

                            /* Get itemization */
                            Bus.publish('services', 'getItemization', {
                              sessionId: data.sessionId,
                              stepType: 'PAYMENTMETHOD',
                              success: function (itemizationData) {
                                if (itemizationData.header.error != true) {
                                  self.checkoutCache['itemization'] = itemizationData.body.data;
                                }

                                /* If the user is logged in, get frequent payment methods */
                                if (User.isLoggedIn()) {
                                  Bus.publish('services', 'getUserPaymentMethods', {
                                    userId: localStorage.ly_userId,
                                    success: function (frequentPaymentResponse) {
                                      // console.log(frequentPaymentResponse);
                                      if (frequentPaymentResponse) {
                                        self.checkoutCache['frequent_payment'] = self.processFrequentPayment(frequentPaymentResponse.body.data);
                                      }

                                      self.getHelpdeskPhone(); /* Get helpdesk phone */
                                      self.loadCheckoutTemplate(templatePath, step);
                                    }
                                  });
                                }

                                /* If not, just load the template */
                                else {
                                  self.getHelpdeskPhone(); /* Get helpdesk phone */
                                  self.loadCheckoutTemplate(templatePath, step);
                                }


                              }
                            });
                          }

                        }
                      });
          
                    }else{
                      self.loadCheckoutTemplate(templatePath, step);
                    }
   
                  });
                }
              }
             // else if (step == "finish") {
             //   if (!data.scoring2) {
             //     Bus.publish('hash', 'change', {hash: checkoutProcessURL + '/payment'});
             //   }
             //   else {
             //     self.checkoutCache['step'] = 'finish';

             //     Bus.publish('services', 'getItemization', { /* Get itemization */
             //       sessionId:  data.sessionId,
             //       stepType: 'SCORING',
             //       success: function(itemizationData) {
             //         if (itemizationData.header.error != true) {
             //           self.checkoutCache['itemization'] = itemizationData.body.data;
             //         }

             //         self.loadCheckoutData(data.sessionId, function() { /* Get lists */
             //           self.getHelpdeskPhone(); /* Get helpdesk phone */
             //           self.loadCheckoutTemplate(templatePath, step);
             //         });
             //       }
             //     });
             //   }
             // }

              else {
                /* Call the template */
                if ((!data.booking && !data.tickets) || !data.scoring2) {
                  Bus.publish('hash', 'change', {hash: checkoutProcessURL + '/payment'});
                }
                //CONFIRM STEP
                else {
                  self.checkoutCache['step'] = 'confirm';

                  //Check if customer is following us in Twitter in order to get flight notifications
                  self.updateFollowingUsTwitterCheckout();

                  self.loadCheckoutData(data.sessionId, function () { /* Get lists */

                    // /* Send void checkout session to clean the server session */
                    // var postSessionURL = getPostURL('checkout');
                    // var checkoutSession = {};
                    // /* Remove intervalId of booking warning message */
                    // if (window.warningBookingIntervalId) {
                    //   clearTimeout(window.warningBookingIntervalId);
                    // }
                    // /* Post void checkoutSession object */
                    // Bus.publish('ajax', 'postJson', {
                    //   path: postSessionURL,
                    //   data: {checkout: checkoutSession},
                    //   success: function () {
                    //   }
                    // });

                    /* Call to template */
                    self.loadCheckoutTemplate(templatePath, step);
                  });
                }
              }

              /* Update Google tag manager */
              /* estos se llaman, podemos hacer un helper, en funcion de este parámetro de sesion, poner matriz hora y precio */

              if (step == 'passengers') {
                if (market.toUpperCase() === "US") {
                  updateGtm({
                    'ow': (self.checkoutCache.resultsParams.rt != 'false') ? 'N' : 'S',
                    'business': (self.checkoutCache.resultsParams.business == 'true') ? 'BUS' : 'TUR',
                    'origen': self.checkoutCache.resultsParams.from,
                    'destino': self.checkoutCache.resultsParams.to,
                    'fechaida': self.checkoutCache.resultsParams.ow,
                    'fecharegreso': (self.checkoutCache.resultsParams.rt != 'false') ? self.checkoutCache.resultsParams.rt : '',
                    'residente': (self.checkoutCache.resultsParams.resident == 'true') ? 'S' : 'N',
                    'numpax': parseInt(self.checkoutCache.resultsParams.adults) + parseInt(self.checkoutCache.resultsParams.kids) + parseInt(self.checkoutCache.resultsParams.babies),
                    'divisa': window.appConfig.currentCurrency.code || 'EUR',
                    'mercado': window.market,
                    'pageArea': 'Comprar vuelos',
                    'pageCategory': 'Checkout',
                    'pageContent': 'Listado de pasajeros ' + window.getResultsViewName(self.checkoutCache.resultView)
                  });
                } else {
                  updateGtm({
                    'ow': (typeof self.checkoutCache.resultsParams.dateArrival != 'undefined') ? 'N' : 'S',
                    'fareFamilyIda': self.checkoutCache.journeys.ow.fareFamily.code || '',
                    'fareFamilyVuelta': (self.checkoutCache.journeys.rt != null) ? self.checkoutCache.journeys.rt.fareFamily.code : '',
                    'origen': self.checkoutCache.resultsParams.airportDeparture,
                    'destino': self.checkoutCache.resultsParams.airportArrival,
                    'fechaida': self.checkoutCache.resultsParams.dateDeparture,
                    'fecharegreso': (typeof self.checkoutCache.resultsParams.dateArrival != 'undefined') ? self.checkoutCache.resultsParams.dateArrival : '',
                    'residente': (self.checkoutCache.resultsParams.paxAdultResident > 0) ? 'S' : 'N',
                    'numpax': parseInt(self.checkoutCache.resultsParams.paxAdult) + parseInt(self.checkoutCache.resultsParams.paxChild) + parseInt(self.checkoutCache.resultsParams.paxInfant) + parseInt(self.checkoutCache.resultsParams.paxAdultResident) + parseInt(self.checkoutCache.resultsParams.paxChildResident) + parseInt(self.checkoutCache.resultsParams.paxInfantResident),
                    'divisa': window.appConfig.currentCurrency.code || 'EUR',
                    'mercado': window.market,
                    'pageArea': 'Comprar vuelos',
                    'pageCategory': 'Checkout',
                    'pageContent': 'Listado de pasajeros por horas'
                  });
                }
              }
//              else if (step == 'finish') {
//               updateGtm({
//                 'ow': (self.checkoutCache.resultsParams.rt != 'false') ? 'N' : 'S',
//                 'business': (self.checkoutCache.resultsParams.business == 'true') ? 'BUS' : 'TUR',
//                 'origen': self.checkoutCache.resultsParams.from,
//                 'destino': self.checkoutCache.resultsParams.to,
//                 'fechaida': self.checkoutCache.resultsParams.ow,
//                 'fecharegreso': (self.checkoutCache.resultsParams.rt != 'false') ? self.checkoutCache.resultsParams.rt : '',
//                 'residente': (self.checkoutCache.resultsParams.resident == 'true') ? 'S' : 'N',
//                 'numpax': parseInt(self.checkoutCache.resultsParams.adults) + parseInt(self.checkoutCache.resultsParams.kids) + parseInt(self.checkoutCache.resultsParams.babies),
//
//                 'asientoida': asientoIda ? 'S' : 'N',
//                 'asientovuelta': asientoVuelta ? 'S' : 'N',
//                 'equipajeida': equipageIda ? 'S' : 'N',
//                 'equipajevuelta': equipageVuelta ? 'S' : 'N',
//                 'formapago': self.checkoutCache.payment.payment_method_type,
//
//                 'opcioncambio': (self.checkoutCache.extras && self.checkoutCache.extras.journeyRelated && self.checkoutCache.extras.journeyRelated.change    && self.checkoutCache.extras.journeyRelated.change == '1') ? 'S' : 'N',
//                 'seguro': (self.checkoutCache.extras && self.checkoutCache.extras.journeyRelated && self.checkoutCache.extras.journeyRelated.insurance) ? self.checkoutCache.extras.journeyRelated.insurance : '',
//
//                 'divisa': window.appConfig.currentCurrency.code || 'EUR',
//                 'mercado': window.market,
//                 'pageArea': 'Comprar vuelos',
//                 'pageCategory': 'Checkout',
//                 'pageContent': 'Cálculo del coste ' + window.getResultsViewName(self.checkoutCache.resultView)
//               });
//              }

              else if (step == 'confirm') {
                if (market.toUpperCase() === "US") {
                  updateGtm({
                    'ow': (self.checkoutCache.booking.dateArrival) ? 'N' : 'S',
                    'business': self.checkoutCache.booking.cabinClass,
                    'origen': self.checkoutCache.booking.airportDeparture.code,
                    'destino': self.checkoutCache.booking.airportArrival.code,
                    'fechaida': self.checkoutCache.booking.dateDeparture,
                    'fecharegreso': self.checkoutCache.booking.dateArrival,
                    'residente': (self.checkoutCache.resident) ? 'S' : 'N',
                    'numpax': self.checkoutCache.finalPassengers.length,
                    'asientoida': asientoIda ? 'S' : 'N',
                    'asientovuelta': asientoVuelta ? 'S' : 'N',
                    'equipajeida': equipageIda ? 'S' : 'N',
                    'equipajevuelta': equipageVuelta ? 'S' : 'N',
                    'formapago': self.checkoutCache.payment.payment_method_type,
                    'opcioncambio': (self.checkoutCache.extras && self.checkoutCache.extras.journeyRelated && self.checkoutCache.extras.journeyRelated.change && self.checkoutCache.extras.journeyRelated.change == '1') ? 'S' : 'N',
                    'seguro': (self.checkoutCache.extras && self.checkoutCache.extras.journeyRelated && self.checkoutCache.extras.journeyRelated.insurance) ? self.checkoutCache.extras.journeyRelated.insurance : '',
                    'expediente': self.checkoutCache.finalPaymentInfo.purchaseReference,
                    'valorventa': self.checkoutCache.totalInEuros.amount,
                    'valordivisa': self.checkoutCache.prices.totalAmount,
                    'amadeus': self.checkoutCache.booking.locator,
                    'divisa': window.appConfig.currentCurrency.code || 'EUR',
                    'mercado': window.market,
                    'pageArea': 'Comprar vuelos',
                    'pageCategory': 'Checkout',
                    'pageContent': 'Confirmación de compra ' + window.getResultsViewName(self.checkoutCache.resultView)+(self.checkoutCache.payment.mymiles == 1 ? '_usuario-SUMA-pagoconmillas' : '_usuario-SUMA-pagosinmillas'),
                    'canjeo-millas' : self.checkoutCache.payment.mymiles == 1 ? 'SI' : 'NO',
                    'millas-canjeadas' : self.checkoutCache.payment.mymiles_percentage_points || '0'
                  });
                } else {
                  updateGtm({
                    'ow': (typeof self.checkoutCache.resultsParams.dateArrival != 'undefined') ? 'N' : 'S',
                    'fareFamilyIda': self.checkoutCache.journeys.ow.fareFamily.code || '',
                    'fareFamilyVuelta': (self.checkoutCache.journeys.rt != null) ? self.checkoutCache.journeys.rt.fareFamily.code : '',
                    'origen': self.checkoutCache.resultsParams.airportDeparture,
                    'destino': self.checkoutCache.resultsParams.airportArrival,
                    'fechaida': self.checkoutCache.resultsParams.dateDeparture,
                    'fecharegreso': (typeof self.checkoutCache.resultsParams.dateArrival != 'undefined') ? self.checkoutCache.resultsParams.dateArrival : '',
                    'residente': (self.checkoutCache.resultsParams.paxAdultResident > 0) ? 'S' : 'N',
                    'numpax': parseInt(self.checkoutCache.resultsParams.paxAdult) + parseInt(self.checkoutCache.resultsParams.paxChild) + parseInt(self.checkoutCache.resultsParams.paxInfant) + parseInt(self.checkoutCache.resultsParams.paxAdultResident) + parseInt(self.checkoutCache.resultsParams.paxChildResident) + parseInt(self.checkoutCache.resultsParams.paxInfantResident),
                    'asientoida': asientoIda ? 'S' : 'N',
                    'asientovuelta': asientoVuelta ? 'S' : 'N',
                    'equipajeida': equipageIda ? 'S' : 'N',
                    'equipajevuelta': equipageVuelta ? 'S' : 'N',
                    'opcioncambio': (self.checkoutCache.extras && self.checkoutCache.extras.journeyRelated && self.checkoutCache.extras.journeyRelated.change && self.checkoutCache.extras.journeyRelated.change == '1') ? 'S' : 'N',
                    'seguro': (self.checkoutCache.extras && self.checkoutCache.extras.journeyRelated && self.checkoutCache.extras.journeyRelated.insurance) ? self.checkoutCache.extras.journeyRelated.insurance : '',
                    'formapago': self.checkoutCache.payment.payment_method_type,
                    'expediente': self.checkoutCache.finalPaymentInfo.purchaseReference,
                    'valorventa': self.checkoutCache.totalInEuros.amount,
                    'valordivisa': self.checkoutCache.prices.totalAmount,
                    'amadeus': self.checkoutCache.booking.locator,
                    'divisa': window.appConfig.currentCurrency.code || 'EUR',
                    'mercado': window.market,
                    'pageArea': 'Comprar vuelos',
                    'pageCategory': 'Checkout',
                    'pageContent': 'Confirmación de compra por horas'+(self.checkoutCache.payment.mymiles == 1 ? '_usuario-SUMA-pagoconmillas' : '_usuario-SUMA-pagosinmillas'),
                    'canjeo-millas' : self.checkoutCache.payment.mymiles == 1 ? 'SI' : 'NO',
                    'millas-canjeadas' : self.checkoutCache.payment.mymiles_percentage_points || '0'
                  });
                }
              }

            }

            /* If there are no results, go back to the search */
            else {
              /* Back to home */
              Bus.publish('process', 'kill');
            }
          }
          else {
            /* Back to home */
            Bus.publish('process', 'kill');
          }

        }
      });
    },

    generateFrequentPassenger: function(user){
      var self = this;

      var resultPassenger = {
        identity: user.identity,
        addressAs: user.title,
        birthday: user.born,
        confirmation: '',
        country:
          {
            code: user.citizenship.code,
            description: user.citizenship.description,
            phoneCode: (user.contactInformation.telephone) ? user.contactInformation.telephone.prefix : null
          },
        email: user.contactInformation.email,
        frequentFlyer: user.frequentFlyerInformation.frequentFlyer,
        frequentFlyerIdentity: user.frequentFlyerInformation.frequentFlyerIdentity,
        frequentFlyerType: user.frequentFlyerInformation.frequentFlyerType,
        identificationDocument: user.identificationDocument,
        largeFamily: user.userGrant.largeFamilyGrant.largeFamily,
        largeFamilyCommunity: (user.userGrant.largeFamilyGrant.largeFamilyCommunity) ? user.userGrant.largeFamilyGrant.largeFamilyCommunity.code : null,
        largeFamilyIdentity: user.userGrant.largeFamilyGrant.largeFamilyIdentity,
        name: user.personCompleteName.name.toUpperCase(),
        // passengerType: "",
        resident: (user.userGrant) ? user.userGrant.residentGrant.resident : null,
        residentTown: (user.userGrant) ? user.userGrant.residentGrant.residentTown : null,
        surname: user.personCompleteName.firstSurname.toUpperCase(),
        surname2: user.personCompleteName.secondSurname ? user.personCompleteName.secondSurname.toUpperCase() : null,
        telephone: (user.contactInformation.telephone) ? user.contactInformation.telephone.number : null,
        type: self.getTypeByBirth(user)
      }

      return resultPassenger;
    },

    getTypeByBirth: function(user) { 
      /* Get user logged born and verify to set baby, kid or adult */
      var typePax;
      if (user.born) {
        var today = moment();
        birthdayDate = moment(user.born, 'DD/MM/YYYY');

        var differenceYears = today.diff(birthdayDate, 'years');

        /* Baby */
        if (differenceYears >= 0 && differenceYears < 2) {
          typePax = 'baby';
        }
        /* Kid */
        else if (differenceYears >= 2 && differenceYears < 12) {
          typePax = 'kid';
        }
        /* Adult */
        else if (differenceYears >= 12) {
          typePax = 'adult';
        }
      }

      return typePax;
    },

    setIdentityFlights: function (ancData) {
      var self = this;
      if (self.checkoutCache.journeys.ow && self.checkoutCache.journeys.ow.fragments) {
        $.each(self.checkoutCache.journeys.ow.fragments, function (indexOwFragment, owFragment) {
          if (owFragment.type == 'flight') {
            $.each(ancData.journey.outboundFlights, function (indexOutboundFragment, outboundFragment) {
              if ((owFragment.departure.code == outboundFragment.airportDeparture.code) && (owFragment.arrival.code == outboundFragment.airportArrival.code)) {
                self.checkoutCache.journeys.ow.fragments[indexOwFragment].identity = outboundFragment.identity;
                outboundFragment.segmentType = 'ow';
                return false;
              }
            });
          }
        });
      }

      if (self.checkoutCache.journeys.rt && self.checkoutCache.journeys.rt.fragments) {
        $.each(self.checkoutCache.journeys.rt.fragments, function (indexRtFragment, rtFragment) {
          if (rtFragment.type == 'flight') {
            $.each(ancData.journey.returnFlights, function (indexReturnFragment, returnFragment) {
              if ((rtFragment.departure.code == returnFragment.airportDeparture.code) && (rtFragment.arrival.code == returnFragment.airportArrival.code)) {
                self.checkoutCache.journeys.rt.fragments[indexRtFragment].identity = returnFragment.identity;
                returnFragment.segmentType = 'rt';
                return false;
              }
            });
          }
        });
      }
    },
    loadCheckoutData: function (sessionId, callback) {
      var self = this;
      Bus.publish('services', 'getCheckoutLists', {
        preconditionDocsType: (self.checkoutCache.resident) ? 'RESIDENT' : 'NATIONAL',
        sessionId: sessionId,
        success: function (listsData) {
          self.checkoutCache['services'] = listsData;
          callback();
        }
      });
    },
    getHelpdeskPhone: function () {
      var self = this;
      if (this.checkoutPhoneCache == undefined) {
        Bus.publish('services', 'getHelpeskPhone', {
          success: function (data) {
            if (data) {
              self.checkoutPhoneCache = data;
              self.checkoutCache['helpedsk_phone'] = data;
              self.element.find('.helpdesk_phone').text(data);
            }
          }
        });
      }
      else {
        this.element.find('.helpdesk_phone').text(self.checkoutPhoneCache);
      }
    },
    loadCheckoutTemplate: function (templatePath, step) {
      var self = this;
      /* Get the template */
      Bus.publish('ajax', 'getTemplate', {
        path: templatePath,
        success: function (template) {
          var after, movingStepsPosition, newStepsPosition;
          var $process_scroll = self.element.find('.process_page.checkout .process_scroll');
          /* Render the template */
          var renderedHtml = template($.extend(true, {}, self.checkoutCache));
          var $renderedHtml = $(renderedHtml);
          /* Get the template partials */
          var $top_bar = $renderedHtml.find('.process_top_bar');
          var $step = $renderedHtml.find('.process_step');
          var $bottom_bar = $renderedHtml.find('.process_bottom_bar');
          var $currentStep = self.element.find('.process_step');
          var $prices = $renderedHtml.find('.process_content > .prices');
          var $infomiles = $renderedHtml.find('.process_content > .prices > .prices_block > .info_miles');
          /* Step stuff, get the new step number and the current one */
          var stepNumber = parseInt($step.attr('data-order'));
          var currentStepNumber = parseInt($currentStep.attr('data-order'));
          var showExitAnimation = false;
          var direction = 'top';
          /* 1) Bottom bar */

          /* Add the new class to change height and background color */
          self.element.find('.process_page.checkout .process_bottom_bar').removeClass('final normal').addClass($bottom_bar.attr('data-class'));
          /* Change bottom bar if it's defined */
          if ($bottom_bar.length > 0) {
            /* Destroy the content and put the new one */
            self.element.find('.process_page.checkout .process_bottom_bar .bottom_bar_content').hide();
            /* Append the new bar content */
            self.element.find('.process_page.checkout .process_bottom_bar').append($bottom_bar.find('.bottom_bar_content').hide().fadeIn());
          }
          else {
            self.element.find('.process_page.checkout .process_bottom_bar .bottom_bar_content.final').hide();
            self.element.find('.process_page.checkout .process_bottom_bar .bottom_bar_content').not('.final').fadeIn();
          }

          /* Update the status bar */
          self.element.find('.process_page.checkout .breadcrumb .steps li').removeClass('active done');
          self.element.find('.process_page.checkout .breadcrumb .steps .' + step).addClass('active');
          setTimeout(function () {
            self.element.find('.process_page.checkout .breadcrumb .steps .' + step).prevAll().addClass('done');
          }, 0);
          /* 2) Content step */

          /* Add a class to #checkout */
          self.element.find('#checkout').attr('class', '').addClass(step);
          /* Append prices block if it's not already loaded */
          if (self.element.find('.process_page.checkout .process_content > .prices').length == 0) {
            self.element.find('.process_page.checkout .process_content').append($prices);
            self.element.find('.process_page.checkout .process_content .prices .prices_block .info_miles').slideDown();
          }
          else{
            if (step == 'payment'){
              self.element.find('.process_page.checkout .process_content .prices .prices_block').prepend($infomiles);
              self.element.find('.process_page.checkout .process_content .prices .prices_block .info_miles').slideDown();
              self.element.find('.process_page.checkout .process_content .prices .prices_block .user_info_miles').slideUp();
            }
            else{
              self.element.find('.process_page.checkout .process_content .info_miles').slideUp();
              self.element.find('.process_page.checkout .process_content .info_miles').remove();
            }
          }

          /* Checkout content full flag */
          if ($renderedHtml.hasClass('full')) {
            self.element.find('.process_page.checkout .process_wrapper_content').addClass('full');
          }
          else {
            self.element.find('.process_page.checkout .process_wrapper_content').removeClass('full');
          }

          /* If the element doesn't exist */
          if (self.element.find('.process_page.checkout .process_step.' + step).length == 0) {

            /* Hide step to append it hidden */
            $step.hide();
            /* Figure out if the new step is after or before */
            after = (stepNumber > currentStepNumber);
            /* Append step - First load, no previous step loaded */
            if ($currentStep.length == 0) {
              self.element.find('.process_page.checkout .process_steps').append($step);
              showExitAnimation = false;
            }

            /* After first load - two steps animating */
            else {
              showExitAnimation = (self.element.find('.process_scroll').attr('data-exit-animation-shown') != 'true');
              if (after) {
                self.element.find('.process_page.checkout .process_steps').append($step);
                direction = 'top';
              }
              else {
                self.element.find('.process_page.checkout .process_steps').prepend($step);
                direction = 'bottom';
              }
            }

            /* Initialize steps widget */
            self.element.find('.process_scroll').steps();

            /*Initialize step payment tab*/
            if(step == 'payment'){
               var totalTabs = self.element.find('.tab-list li').length;

              if(self.element.find('.tab-list li a.promotion_paypal').length > 0){
                var linkPaypalPromotion = self.element.find('.tab-list li a.promotion_paypal');
                var tabPaypalPromotion = linkPaypalPromotion.closest('li');
                tabPaypalPromotion.remove();
                totalTabs = totalTabs - 1;

                var linkPaypal = self.element.find('.tab-list li a.paypal');
                linkPaypal.attr('href', '#field_payment_promotion_paypal');
              }
             
              var widthtabs = 100 / totalTabs;
              self.element.find('.tab-list li').css('width', widthtabs+'%');

              var firstTabs = self.element.find('.tab-list li').eq(0);
              // firstTabs.addClass('active');
              var idInputFirst = firstTabs.find('a').attr('href');
              var typemethod = self.element.find('.check_group.payment_method .group_header input'+idInputFirst).val();
              self.element.find('.check_group.payment_method.'+typemethod).addClass('expanded_method');
              self.element.find('.check_group.payment_method.'+typemethod).addClass('opened');
              self.element.find('.check_group.payment_method.'+typemethod + ' .disabled').removeClass('disabled');

            }
            else if(step == 'confirm'){

              if(window.dynamic_europcar){
                Bus.publish('services', 'getEuropCarAutos', {
                  sessionId: self.element.find('.process_step').attr('data-sessionId'),
                  success: function (europCarAutos) {
                    if (europCarAutos.header.error != true) {
                      self.checkoutCache['serviceEuropCarAutos'] = europCarAutos.body.data;

                      Bus.publish('ajax', 'getTemplate', {
                        path: AirEuropaConfig.templates.checkout.banner_dinamico_europcar,
                        success: function (template) {
                          var renderedHtmlBanner = template($.extend(true, {}, self.checkoutCache));
                          var $renderedHtmlBanner = $(renderedHtmlBanner);
                          var $europcarContainer = self.element.find('.checkout_block.europcar_container');
                          $europcarContainer.append($renderedHtmlBanner);
     
                          /* Init swiper banner europcar */
                          Bus.publish('checkout', 'init_swiper');
                        }
                      });

                    }else{
                      //Error service "Cross Selling no disponible",
                      Bus.publish('ajax', 'getTemplate', {
                        path: AirEuropaConfig.templates.checkout.banner_fijo_europcar,
                        success: function (template) {
                          var renderedHtmlBanner = template($.extend(true, {}, self.checkoutCache));
                          var $renderedHtmlBanner = $(renderedHtmlBanner);
                          var $europcarContainer = self.element.find('.checkout_block.europcar_container');
                          $europcarContainer.append($renderedHtmlBanner);
     
                        }
                      });
                    }
                    
                  }
                });

              }else{
                //Banner static
                Bus.publish('ajax', 'getTemplate', {
                  path: AirEuropaConfig.templates.checkout.banner_fijo_europcar,
                  success: function (template) {
                    var renderedHtmlBanner = template($.extend(true, {}, self.checkoutCache));
                    var $renderedHtmlBanner = $(renderedHtmlBanner);
                    var $europcarContainer = self.element.find('.checkout_block.europcar_container');
                    $europcarContainer.append($renderedHtmlBanner);

                  }
                });

              }


              
            }

            /* Init graphis for the next step */
            self.initGraphics();
            /* The user comes directly from URL change (broswer arrows or click on breadcrumb) so we have
             to show the exit animation of the current step. In the other case, the exit animation was shown
             in the submit event*/
            if (showExitAnimation) {

              self.element.find('.process_scroll').steps('showLoading', function () { /* Exit animation */

                /* 3) Top bar - Change the topbar when the plane bar is covering it */
                /* Add the new class to change height and background color */
                var topBarClassName = $top_bar.attr('data-class');
                self.element.find('.process_page.checkout .process_top_bar').removeClass('finish normal confirm').addClass(topBarClassName);
                /* Append top_bar if there's a new topbar in the incoming content */
                if ($top_bar.length > 0) {
                  /* If there's no top bar, append the current one */
                  if (self.element.find('.process_page.checkout .process_top_bar').length == 0) {
                    self.element.find('.process_page.checkout .process_wrapper_content .process_scroll').prepend($top_bar);
                  }
                  /* If there's a top bar, check if it's new or already exists */
                  else {
                    if (self.element.find('.process_page.checkout .process_top_bar .top_bar_content.' + topBarClassName).length == 0) {
                      /* Destroy the content and put the new one */
                      self.element.find('.process_page.checkout .process_top_bar .top_bar_content').hide();
                      /* Append the new bar content */
                      self.element.find('.process_page.checkout .process_top_bar').append($top_bar.find('.top_bar_content'));
                    }
                    else {
                      /* Destroy the content and show the new one */
                      self.element.find('.process_page.checkout .process_top_bar .top_bar_content').hide();
                      self.element.find('.process_page.checkout .process_top_bar .top_bar_content.' + topBarClassName).show();
                    }
                  }
                }

                self.element.find('.process_scroll').steps('showNextStep', function () { /* Enter animation */
                  /* Remove current step */
                  $currentStep.remove();
                  /* Fadeout the process_page_loading if it's visible */
                  if (self.element.find('.process_page.checkout .process_page_loading').length > 0) {
                    self.element.find('.process_page.checkout .process_page_loading').fadeOut(800, function () {
                      self.element.find('.process_page.checkout .process_page_loading').remove();
                    });
                  }

                  /* Init checkout process */
                  Bus.publish('checkout', 'custom_init');
                }, after, $step, $currentStep);
              }, direction);
            }
            /* The exit animation was shown in the submit event, so we just need to execute the enter
             animation for the next step */
            else {

              /* 3) Top bar - Change the topbar when the plane bar is covering it */
              /* Add the new class to change height and background color */
              var topBarClassName = $top_bar.attr('data-class');
              self.element.find('.process_page.checkout .process_top_bar').removeClass('finish normal confirm').addClass(topBarClassName);
              /* Append top_bar if there's a new topbar in the incoming content */
              if ($top_bar.length > 0) {
                /* If there's no top bar, append the current one */
                if (self.element.find('.process_page.checkout .process_top_bar').length == 0) {
                  self.element.find('.process_page.checkout .process_wrapper_content .process_scroll').prepend($top_bar);
                }
                /* If there's a top bar, check if it's new or already exists */
                else {
                  if (self.element.find('.process_page.checkout .process_top_bar .top_bar_content.' + topBarClassName).length == 0) {
                    /* Destroy the content and put the new one */
                    self.element.find('.process_page.checkout .process_top_bar .top_bar_content').hide();
                    /* Append the new bar content */
                    self.element.find('.process_page.checkout .process_top_bar').append($top_bar.find('.top_bar_content'));
                  }
                  else {
                    /* Destroy the content and show the new one */
                    self.element.find('.process_page.checkout .process_top_bar .top_bar_content').hide();
                    self.element.find('.process_page.checkout .process_top_bar .top_bar_content.' + topBarClassName).show();
                  }
                }
              }

              self.element.find('.process_scroll').steps('showNextStep', function () { /* Enter animation */
                /* Remove current step */
                $currentStep.remove();
                /* Fadeout the process_page_loading if it's visible */
                if (self.element.find('.process_page.checkout .process_page_loading').length > 0) {
                  self.element.find('.process_page.checkout .process_page_loading').fadeOut(800, function () {
                    self.element.find('.process_page.checkout .process_page_loading').remove();
                  });
                }

                /* Init checkout process */
                Bus.publish('checkout', 'custom_init');
              }, after, $step, $currentStep);
            }

          }

          /* Show call me back popup */
          if (self.showCallMeBackPopup) {
            self.element.find('.process_scroll').steps('showErrors');
            Bus.publish('checkout', 'show_call_me_back');
            self.showCallMeBackPopup = false;
          }

        }
      });
    },
    initGraphics: function () {

      /* Prepare graphic */
      this.element.find('.graphic').graphic({
        minFlightWidth: AirEuropaConfig.graphic.minFlightWidth,
        maxTransferWidth: AirEuropaConfig.graphic.maxTransferWidth,
        minTransferWidth: AirEuropaConfig.graphic.minTransferWidth,
        highlights: AirEuropaConfig.graphic.highlights
      });
    },

    processFrequentPayment: function(frequentPaymentData) {

      _.each(frequentPaymentData, function(card, index, list) {
        var year = card.expiration.substring(2, card.expiration.indexOf('-'));
        var month = card.expiration.substring(card.expiration.indexOf('-') + 1, card.expiration.lastIndexOf('-'));

        card.expiration = month + '/' + year;
      });

      return frequentPaymentData;
    },

    getExtraPassengersByIdentity: function (identity, self) {
      var foundPassenger = undefined;
      var cleanSeats = {ow: {}, rt: {}};

      if (self.checkoutCache['servicePassengers'].length > 0) {
        $.each(self.checkoutCache['servicePassengers'], function (indexPassenger, passenger) {
          if (identity == passenger.identity) {
            foundPassenger = $.extend({}, passenger); /* Clone the object */
            return false;
          }
        });
      }

      /* Loop seats to clean void ones */
      if (foundPassenger) {
        if (foundPassenger.seats && foundPassenger.seats.ow) {
          for (var segmentId in foundPassenger.seats.ow) {
            var segment = foundPassenger.seats.ow[segmentId];
            if (segment.number != '' && segment.column != '') {
              cleanSeats.ow[segmentId] = segment;
            }
          }
        }

        if (foundPassenger.seats && foundPassenger.seats.rt) {
          for (var segmentId in foundPassenger.seats.rt) {
            var segment = foundPassenger.seats.rt[segmentId];
            if (segment.number != '' && segment.column != '') {
              cleanSeats.rt[segmentId] = segment;
            }
          }
        }

        foundPassenger.seats = cleanSeats;
      }

      return foundPassenger;
    },


    /* Technical stops */
    getInfoTechnicalStops: function(){

      var self = this;

      var technicalStopsListOw = [];
      var technicalStopsTextOw;
      var numberStopsOw;

      var technicalStopsListRt = [];
      var technicalStopsTextRt;
      var numberStopsRt;
      

      if (self.checkoutCache.journeys.ow && self.checkoutCache.journeys.ow.fragments){

        $.each(self.checkoutCache.journeys.ow.fragments, function(indexStop) {

          if(self.checkoutCache.journeys.ow.fragments[indexStop].type === 'flight'){

            numberStopsOw = self.checkoutCache.journeys.ow.fragments[indexStop].technicalStop.numberStops;     

            if (numberStopsOw > 0){

              var airportOw = self.checkoutCache.journeys.ow.fragments[indexStop].technicalStop.airportStops;

              var airportNameOw = getData(airportOw).description
              technicalStopsListOw.push(airportNameOw);

              technicalStopsTextOw  = (technicalStopsListOw > 0) ? lang('availability_farefamily.technical_stops_plural') + ' '  : lang('availability_farefamily.technical_stops_singular') + ' ';
              technicalStopsTextOw += technicalStopsListOw.join(', ') +'.';
            }
          }
        });
      }

      if (self.checkoutCache.journeys.rt && self.checkoutCache.journeys.rt.fragments && (self.checkoutCache.journeys.rt.fragments.type === 'flight')){
      
        $.each(self.checkoutCache.journeys.rt.fragments, function(indexStop) {

          if(self.checkoutCache.journeys.rt.fragments[indexStop].type === 'flight'){

            numberStopsRt = self.checkoutCache.journeys.rt.fragments[indexStop].technicalStop.numberStops;

            if(numberStopsRt > 0){
                     
              var airportRt = self.checkoutCache.journeys.rt.fragments[indexStop].technicalStop.airportStops;

              var airportNameRt = getData(airportRt).description
              technicalStopsListRt.push(airportNameRt);

              technicalStopsTextRt  = (technicalStopsListRt > 0) ? lang('availability_farefamily.technical_stops_plural') + ' ' : lang('availability_farefamily.technical_stops_singular') + ' ';
              technicalStopsTextRt += technicalStopsListRt.join(', ') +'.';
            }
          } 

        });
      }

      return {       

        hasTechnicalStopsOw:  (numberStopsOw > 0) ? true : false,
        numberStopsOw: numberStopsOw,
        technicalStopsListOw: technicalStopsListOw,
        technicalStopsTextOw: technicalStopsTextOw,
        hasTechnicalStopsRt:  (numberStopsRt > 0) ? true : false,
        numberStopsRt: numberStopsRt,
        technicalStopsListRt: technicalStopsListRt,
        technicalStopsTextRt: technicalStopsTextRt,

      };

    },


    getInfoPanssengers:function(listPassenger){
  	var pasengerListInfo = {
  	            adult:[],
  	            child:[],
  	            infant:[]
  	        };

      $.each(listPassenger, function (indexPassenger, passenger) {
        if (passenger.passengerType === "ADULT") {
      	  var adult = {
      	    name : passenger.name,
      	    surname : passenger.surname,
      	    surname2 : passenger.surname2
      	  };
      	  pasengerListInfo.adult.push(adult);
        }

        if (passenger.passengerType === "CHILD") {
      	  var child = {
            	    name : passenger.name,
            	    surname : passenger.surname,
              	    surname2 : passenger.surname2
            	  };
      	  pasengerListInfo.child.push(child);
        }

        if (passenger.passengerType === "INFANT") {
      	  var infant = {
            	    name : passenger.name,
            	    surname : passenger.surname,
              	    surname2 : passenger.surname2
            	  };
      	  pasengerListInfo.infant.push(infant);
        }

      });

      return pasengerListInfo;
    },

    //Function to check if customer is already following Twitter AirEuropa account.
    //It is used to check if customer swicthes following option in Twitter app during execution. 
    //It only works if page is reloaded.
    updateFollowingUsTwitterCheckout: function(){

      //Data in JSImport
      if (executed){

        Bus.publish('services', 'followingUsTwitterCheckout', {
            success: function (data) {
                //Data in JSImport
                following = data;

            }             
        });
      }

    }

  };
});