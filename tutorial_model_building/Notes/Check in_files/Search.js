Hydra.module.register('Search', function (Bus, Module, ErrorHandler, Api) {

  function generateAirportMetadata(airport) {
    var regexp = /(\[.*?\])/g;
    airport.metadata = airport.description;
    airport.description = airport.description.replace(regexp, '');
  }

  return {
    selector: '.search_form',
    element: undefined,
    /* Results helpers */
    finishedLoadingBar: false,
    finishedHtmlLoad: false,
    /* Errors */
    headerError: false,
    headerErrorMessage: '',
    sessionError: false,
    alreadyBought: false,
    /* Cache data */
    checkinData: undefined,
    events: {
      'search': {
        'set_airports': function (oNotify) {
          if (oNotify.from && oNotify.to) {
            this.setAirports(oNotify.from, oNotify.to);
          }
        },
        'clean_airports': function (oNotify) {
          this.setAirports('', '');
        },
        'getDescription': function (oNotify) {
          if (oNotify.code) {
            return this.findDescription(oNotify.code);
          }
          return '';
        }
      },
      'process': {
        'launchPmrInternal':function(oNotify){
          if (oNotify.bookingId && oNotify.locator) {
            return this.launchPmrInternal(oNotify.bookingId, oNotify.locator);
          }
          return '';
        },
        'launchH72Internal':function(oNotify){
          if (oNotify.bookingId && oNotify.locator) {
            return this.launchH72Internal(oNotify.bookingId, oNotify.locator);
          }
          return '';
        },
      }
    },
    init: function () {
      /* Save jquery object reference */
      this.element = $(this.selector);

      /* Call sources */
      this.manageAirportsData();
      this.manageCalendars();

      /* Manage routes links */
      this.manageRoutes();

      /* Init Form */
      this.submitButtonTooltip();
      this.initForm();

      this.showResidentDiscountWarning();

      /* Show options Rates interbaleares */
      this.showInterbalearicRatesOptions();

    },

    submitButtonTooltip: function () {
      /* Get the buttons */
      var $searchForm = this.element.find('.search_flights');
      var $searchButton = $searchForm.find('.submit button');
      var $checkinForm = this.element.find('.checkin_form');
      var $checkinButton = $checkinForm.find('.submit button');
      var $infoForm = this.element.find('.info_form');
      var $infoButton = $infoForm.find('.submit button');
      var $ancillariesForm = this.element.find('.ancillaries_form');
      var $ancillariesButton = $ancillariesForm.find('.submit button');

      /* Set attr titles - must have content to pass first ui tooltip hover */
      $searchButton.attr('title', '');
      $checkinButton.attr('title', '');
      $infoButton.attr('title', '');
      $ancillariesButton.attr('title', '');

      /* Initialize ui tooltip */
      $searchButton.tooltip({
        track: true,
        content: lang('tooltips.search_default')
      });

      $checkinButton.tooltip({
        track: true,
        content: lang('tooltips.checkin_default')
      });

      $infoButton.tooltip({
        track: true,
        content: lang('tooltips.info_default')
      });

      $ancillariesButton.tooltip({
        track: true,
        content: lang('tooltips.ancillary_default')
      });

      /* Change tooltip depending on conditions */
      $searchButton.hover(function () {
        $searchButton.tooltip('option', 'content', function () {
          if (!$searchForm.hasClass('ready')) {
            var airportsValid = ($searchForm.find('.airport.from').hasClass('valid') && $searchForm.find('.airport.to').hasClass('valid'));
            var datesValid = $searchForm.find('.calendar.ow').hasClass('valid');

            if (!airportsValid && !datesValid) {
              return lang('tooltips.search_default');
            }
            else if (airportsValid && !datesValid) {
              return lang('tooltips.search_default_no_dates');
            }
            else if (!airportsValid && datesValid) {
              return lang('tooltips.search_default_no_airports');
            }
          }

          /* Clean title and return */
          $searchButton.attr('title', '');
          return '';
        });
      }, function () {
      });

      $checkinButton.hover(function () {
        $checkinButton.tooltip('option', 'content', function () {
          if (!$checkinForm.hasClass('ready')) {
            return lang('tooltips.checkin_default');
          }

          /* Clean title and return */
          $checkinButton.attr('title', '');
          return '';
        });
      }, function () {
      });

      $infoButton.hover(function () {
        $infoButton.tooltip('option', 'content', function () {
          if (!$infoForm.hasClass('ready')) {
            return lang('tooltips.info_default');
          }

          /* Clean title and return */
          $infoButton.attr('title', '');
          return '';
        });
      }, function () {
      });

      $ancillariesButton.hover(function () {
        $ancillariesButton.tooltip('option', 'content', function () {
          if (!$ancillariesForm.hasClass('ready')) {
            return lang('tooltips.ancillary_default');
          }

          /* Clean title and return */
          $ancillariesButton.attr('title', '');
          return '';
        });
      }, function () {
      });

    },


    prepareRateSocialStructure: function(jointsSocial){

      $.each(jointsSocial.joints, function(index, typeSocial) {
        var classSocial = "";

        switch (typeSocial.joint.code) {
          case "YTH":
            classSocial = 'counter_young';
            break;
          case "SRC":
            classSocial = 'counter_senior';
            break;
          case "SPT":
            classSocial = 'counter_federated';
            break;
          case "MED":
            classSocial = 'counter_medical';
            break;  
        }

        typeSocial.joint.classSocial= classSocial;
      });

      return jointsSocial;
                
    },
    showInterbalearicRatesOptions: function() {
      var self = this;
      var jointsSocial;
      var $form = this.element.find('form.search_flights');

      $('#search_form_to').on('blur',function(){

        var origin = ($form.find('#search_form_from')).val(),
            destination = ($form.find('#search_form_to')).val(),
            // residentIsShow = $form.find('.checkbox.resident').is(':visible');
            residentIsShow = $form.find('.checkbox.resident').hasClass('active');
            // residentIsShow = !$form.find('.checkbox.resident').is(':hidden');

        /* Only if residente check is show, call interislas services */
        if(residentIsShow){
          /* call services info Interislas */
          Bus.publish('services', 'getInterislasInfo', {
            data: {
              departureCode: origin,
              arrivalCode:   destination
            },
            success: function(rateSocial) {

              if (!rateSocial.header.error) {
                
                /* Save data Rate social*/
                self.jointsSocial = self.prepareRateSocialStructure(rateSocial.body.data);

                /* Get social_rate Template*/  
                Bus.publish('ajax', 'getTemplate', {
                  path: AirEuropaConfig.templates.search.social_rate,
                  success: function (template) {
                    var renderedHtmlSocialRate = template($.extend(true, {}, self.jointsSocial));
                    var $renderedHtmlSocialRate = $(renderedHtmlSocialRate);
                    var $SocialRateContainer = $('.passengers_detail .passengers_counter');
                    $('.social_rate').remove();

                    $SocialRateContainer.append($renderedHtmlSocialRate);

                    /* Show button change list rate */
                    $form.find('.general_rate').removeClass('hidden');
                    $form.find('.general_rate .switch_detail').removeClass('hidden');
                    $form.find('.social_rate .resetPassengers').trigger('click');
                  }
                });

              }else{

                /* Hide options social rate */
                var $passengersCounter = $form.find('.passengers_counter');
                var $generalRate = $passengersCounter.find('.general_rate');
                var isGeneralRate = ($generalRate.hasClass('hidden')) ? false : true;

                if(!isGeneralRate){
                  $form.find('.social_rate .switch_detail').trigger('click');
                }else{
                  $form.find('.social_rate .resetPassengers').trigger('click');
                }

                /*Hide button change list rate*/
                $form.find('.general_rate .switch_detail').addClass('hidden');
                $form.find('.general_rate').removeClass('hidden');
              }

            }
          });

        }else{

          /* Hide options social rate */
          var $passengersCounter = $form.find('.passengers_counter');
          var $generalRate = $passengersCounter.find('.general_rate');
          var isGeneralRate = ($generalRate.hasClass('hidden')) ? false : true;

          if(!isGeneralRate){
            $form.find('.social_rate .switch_detail').trigger('click');
          }else{
            $form.find('.social_rate .resetPassengers').trigger('click');
          }

          /*Hide button change list rate*/
          $form.find('.general_rate .switch_detail').addClass('hidden');
          $form.find('.general_rate').removeClass('hidden');
        }
        

      });
    },



    showResidentDiscountWarning: function() {
      var $form = this.element.find('form.search_flights');
      var $residentCheckbox = $form.find('.options .checkbox.resident input');

      $residentCheckbox.on('click',function(event){
        if ($(this).is(':checked') && User.isLoggedIn()) {
          $('#search').ui_dialog({
            title: lang('general.info_error_title'),
            error: false,
            subtitle: lang('results.resident_discount_warning'),
            close: {
              behaviour: 'close',
              href: '#'
            },
            buttons: [
              {
                className: 'close',
                href: '#',
                label: lang('general.ok')
              }
            ]
          });
        }
      });
    },

    initForm: function () {
      var self = this;

      /* Init search flights form */
      this.element.find('form.search_flights').form({
        triggerValidate: true,
        onSubmit: function (form) {

          /* Get form vars */
          var fromCode = form.element.find('.airport.from .input .code').val();
          var toCode = form.element.find('.airport.to .input .code').val();
          var ow = form.element.find('.dates .ow .input input').val();
          var rt = form.element.find('.dates .rt .input input').val() || 'false';
          var adults = form.element.find('.passengers .passengers_input .counter_adults').val();
          var kids = form.element.find('.passengers .passengers_input .counter_kids').val() || '0';
          var babies = form.element.find('.passengers .passengers_input .counter_babies').val() || '0';
          var young = form.element.find('.passengers .passengers_input .counter_young').val() || '0';
          var senior = form.element.find('.passengers .passengers_input .counter_senior').val() || '0';
          var federated = form.element.find('.passengers .passengers_input .counter_federated').val() || '0';
          var medical = form.element.find('.passengers .passengers_input .counter_medical').val() || '0';
          var resident = form.element.find('.options .checkbox.resident input').is(':checked') || 'false';
          var business = form.element.find('.options .checkbox.business input').is(':checked') || 'false';
          var flightsProcessURL = getProcessUrl('flights');


          var codigoColectivo = '';
          var $passengersInput = form.element.find('.passengers_counter .social_rate');

          if(young > 0){
            codigoColectivo = $passengersInput.find('.counter_young .number').attr('code');
            adults = young;

          }else if(senior > 0){
            codigoColectivo = $passengersInput.find('.counter_senior .number').attr('code');
            adults = senior;

          }else if(federated > 0){
            codigoColectivo = $passengersInput.find('.counter_federated .number').attr('code');
            adults = federated;

          } else if(medical > 0){

            codigoColectivo = $passengersInput.find('.counter_medical .number').attr('code');
            adults = medical;
          } 

          /* Compose URL */
          var url = 'from/' + fromCode + '/to/' + toCode + '/ow/' + ow + '/adults/' + adults;


          /* Optional parameters */
          url += '/rt/' + rt;
          url += '/kids/' + kids;
          url += '/babies/' + babies;
          url += '/resident/' + resident;
          url += '/business/' + business;
          if(codigoColectivo != ''){
            url += '/colective/' + codigoColectivo;  
          }
        

          /* Navigate to URL */
          Bus.publish('hash', 'change', {hash: flightsProcessURL + '/' + url});
        }
      });

      /* If there's a search_trigger, init from here */
      if ($('.search_trigger').length > 0) {
        $('.search_trigger').each(function () {
          var $this = $(this);
          var searchProcessURL = getProcessUrl('search');

          /* Start form and send to search on submit */
          $this.find('form').form({
            triggerValidate: true,
            onError: function () {
              Bus.publish('hash', 'change', {hash: searchProcessURL});
            },
            onSubmit: function () {
              /* Launch search */
              var fromCode = $this.find('.airport.from .input .code').val();
              var toCode = $this.find('.airport.to .input .code').val();

              /* If there's a from and to values, fill the values with them */
              if (fromCode && toCode) {
                Bus.publish('search', 'set_airports', {from: fromCode, to: toCode});
              }

              Bus.publish('hash', 'change', {hash: searchProcessURL});
            }
          });
        });
      }

      /* Init checkin form */
      this.element.find('form.checkin_form').form({
        triggerValidate: true,
        onSubmit: function (form) {

          /* Reset loading control vars */
          self.finishedLoadingBar = false;
          self.finishedHtmlLoad = false;
          self.headerError = false;
          self.headerErrorMessage = '';
          self.sessionError = false;
          self.alreadyBought = false;
          self.checkinData = undefined;

          self.createNewPage('checkin',
                  function () { /* Success callback */
                    self.goToCheckin();
                  },
                  function () { /* Error callback */
                    self.showErrorMessage(self.element.find('form.checkin_form'));
                  },
                  function () { /* Session error */
                    self.showSessionError();
                  },
                  function () { /* Process callback */
                    /* Post the search info */
                    var process = form.element.closest('.search_form').attr('data-process-start');
                    var checkinSession = {};
                    var checkinFormData = form.element.serializeObject();
                    var dataSent = {
                      locator: checkinFormData.checkin_form_reserve_number,
                      surname: window.cleanSpaces(checkinFormData.checkin_form_surname),
                      fromHelper: checkinFormData.checkin_form_from_helper,
                      departureDate: checkinFormData.checkin_form_ow
                    };

                    /* Get flight data service */
                    Bus.publish('services', 'getFlightData', {
                      data: dataSent,
                      success: function (data) {
                        /* If response comes without data.header */
                        if (!data.header) {
                          data = {
                            'header': {
                              'error': false
                            },
                            'body': {
                              'data': data
                            }
                          };
                        }

                        if (!data.header.error) {
                          data = data.body.data;
                          self.checkinData = data;

                          /* Post checkinSession to server with the service data */
                          var postToSession = getPostURL('checkin');

                          /* Compose post object */
                          /*
                           Tener en cuenta que la variable locator del objeto checkinSession sirve tanto para el localizador
                           de 6 caracteres como el número de reserva de 13
                           */
                          checkinSession['locator'] = dataSent.locator;
                          checkinSession['surname'] = dataSent.surname;
                          checkinSession['fromHelper'] = dataSent.fromHelper;
                          checkinSession['departureDate'] = dataSent.departureDate;
                          checkinSession['checkinId'] = data.checkinId;
                          checkinSession['passengers'] = data.passengers;
                          checkinSession['flights'] = data.flights;

                          /* Post to session */
                          Bus.publish('ajax', 'postJson', {
                            path: postToSession,
                            data: {checkin: checkinSession},
                            success: function () {

                              /* Load the data */
                              self.finishedHtmlLoad = true;

                              if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                                self.goToCheckin();
                              }
                            },
                            failure: function () {
                              self.sessionError = true;
                              self.headerError = false;
                              self.finishedHtmlLoad = true;

                              if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                                /* Session error */
                                self.showSessionError();
                              }
                            }
                          });

                        } /* If there is any error */
                        else {

                          /* update GTM error */
                          if (data.header.code === 1008)
                          {
                            updateGtm({
                              'pageArea': 'Mis vuelos',
                              'pageCategory': 'Buscador Checkin',
                              'pageContent': 'Error_' + data.header.code + '. Error al recuperar la reserva.'
                            });
                          }

                          self.sessionError = false;
                          self.headerError = true;
                          self.finishedHtmlLoad = true;
                          self.headerErrorMessage = data.header.message;

                          if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                            self.showErrorMessage(self.element.find('form.checkin_form'));
                          }
                        }
                      }
                    });

                  });
        }
      });



      /* Init Ancillaries form */
      this.element.find('form.ancillaries_form').form({
        triggerValidate: true,
        onSubmit: function (form) {
          var process = form.element.closest('.search_form').attr('data-process-start');
          var ancillarySession = {};
          var credentials = form.element.serializeObject();

          /* Reset loading control vars */
          self.finishedLoadingBar = false;
          self.finishedHtmlLoad = false;
          self.headerError = false;
          self.headerErrorMessage = '';
          self.sessionError = false;
          self.alreadyBought = false;
          self.checkinData = undefined;

          self.createNewPage('ancillaries',
                  function () { /* Success callback */
                    if (process == 'ancillaries_luggage') {
                      var ancillariesLuggageProcessURL = getProcessUrl('ancillaries_luggage');
                      self.goToAncillaries(ancillariesLuggageProcessURL, 'luggage');
                    }
                    else if (process == 'ancillaries_seats') {
                      var ancillariesSeatsProcessURL = getProcessUrl('ancillaries_seats');
                      self.goToAncillaries(ancillariesSeatsProcessURL, 'seats');
                    }
                    else if (process == 'ancillaries_premium_seats') {
                      var ancillariesPremiumSeatsProcessURL = getProcessUrl('ancillaries_premium');
                      self.goToAncillaries(ancillariesPremiumSeatsProcessURL, 'premium_seats');
                    }
                  },
                  function () { /* Error callback */
                    self.showErrorMessage(self.element.find('form.ancillaries_form'));
                  },
                  function () { /* Session error */
                    self.showSessionError();
                  },
                  function () { /* Process callback */

                    /* Locator or ticket number */
                    credentials.isLocator = (form.element.find('.reserve_field').hasClass('locator'));
                    credentials.isTicketNumber = (form.element.find('.reserve_field').hasClass('ticket_number'));

                    /* Process surname */
                    credentials.surname = window.cleanSpaces(credentials.surname);

                    /* Ancillaries luggage process */
                    if (process == 'ancillaries_luggage') {
                      /* Get extra luggage service */
                      Bus.publish('services', 'getExtraLuggage', {
                        data: credentials,
                        success: function (data) {

                          /* Check if all supported flights are blocked, then show message */
                          if (data.body && data.body.data && data.body.data.ancillary != undefined && data.body.data.ancillary.supportedFlights != undefined) {
                            var supportedFlightsLength = data.body.data.ancillary.supportedFlights.length;
                            var howMuchSupportedFlightsAreBlocked = 0;
                            $.each(data.body.data.ancillary.supportedFlights, function (indexFlight, flight) {
                              if (flight.blocked == true) {
                                howMuchSupportedFlightsAreBlocked++;
                              }
                            });
                            if (howMuchSupportedFlightsAreBlocked == supportedFlightsLength) {
                              data.header.error = true;
                              data.header.message = data.body.data.ancillary.claimInformation;
                            }
                          }

                          if (!data.header.error) {

                            if (data.body.data.ancillary.status.success) {
                              /* Post ancillary_session to server with the service data */
                              var postToSession = getPostURL('ancillaries_luggage');

                              /* Compose post object */
                              ancillarySession = data.body.data;
                              ancillarySession['credentials'] = credentials;
                              ancillarySession['mode'] = 'luggage';

                              /* Post to session */
                              Bus.publish('ajax', 'postJson', {
                                path: postToSession,
                                data: {ancillary: ancillarySession},
                                success: function () {
                                  var ancillariesLuggageProcessURL = getProcessUrl('ancillaries_luggage');

                                  /* Load the data */
                                  self.finishedHtmlLoad = true;

                                  if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                                    self.goToAncillaries(ancillariesLuggageProcessURL, 'luggage');
                                  }
                                },
                                failure: function () {
                                  self.sessionError = true;
                                  self.headerError = false;
                                  self.finishedHtmlLoad = true;

                                  if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                                    /* Session error */
                                    self.showSessionError();
                                  }
                                }
                              });
                            }
                            else {
                              self.sessionError = false;
                              self.headerError = false;
                              self.finishedHtmlLoad = true;
                              self.alreadyBought = true;
                              self.headerErrorMessage = data.body.data.ancillary.status.message;

                              if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                                self.showFinalErrorMessage(self.element.find('form.ancillaries_form'), function () {
                                  /* Hide form and show message */
                                  self.element.find('form.ancillaries_form').find('fieldset').fadeOut(500, function () {
                                    self.element.find('form.ancillaries_form').find('.error_message').fadeIn(500);
                                  });
                                });
                              }
                            }
                          }
                          else {
                            /* update gtm error recover flight */
                            if (data.header.code === 3301)
                            {
                              updateGtm({
                                'pageArea': 'Mis vuelos',
                                'pageCategory': 'Ancillaries equipaje',
                                'pageContent': 'Error_' + data.header.code + '. Error al recuperar la reserva. luggage'
                              });
                            }

                            self.sessionError = false;
                            self.headerError = true;
                            self.finishedHtmlLoad = true;
                            self.headerErrorMessage = data.header.message;

                            if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                              self.showErrorMessage(self.element.find('form.ancillaries_form'));
                            }
                          }
                        }
                      });
                    }

                    /* Ancillaries seats process and Premium Economy */
                    else if (process == 'ancillaries_seats' || process == 'ancillaries_premium_seats') {
                      /* Get extra seats service */
                      Bus.publish('services', 'getExtraSeats', {
                        data: credentials,
                        type: process,
                        success: function (data) {

                          if (!data.header.error) {

                            var supportedFlightsLength = data.body.data.ancillary.supportedFlights.length;
                            var supportedFlightsBlocked = 0;

                            /* Check if all supported flights are blocked to open ancillaries flux */
                            $.each(data.body.data.ancillary.supportedFlights, function (supportedFlightIndex, supportedFlight) {
                              if (supportedFlight.blocked == true) {
                                supportedFlightsBlocked++;
                              }
                            });

                            /* If all supported flights are blocked, show info message and back home */
                            if (supportedFlightsLength === supportedFlightsBlocked) {
                              self.sessionError = false;
                              self.headerError = true;
                              self.finishedHtmlLoad = true;
                              self.headerErrorMessage = lang('ancillaries.all_supportedflights_blocked');

                              if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                                self.showErrorMessage(self.element.find('form.ancillaries_form'));
                              }
                            }
                            /* Else, start ancillaries flux */
                            else {

                              /* Post ancillary_session to server with the service data */
                              var postToSession = process != 'ancillaries_premium_seats' ? getPostURL('ancillaries_seats') : getPostURL('ancillaries_premium');

                              /* Compose post object */
                              ancillarySession = data.body.data;
                              ancillarySession['credentials'] = credentials;
                              ancillarySession['mode'] = process != 'ancillaries_premium_seats' ? 'seats' : 'premium_seats';

                              /* Post to session */
                              Bus.publish('ajax', 'postJson', {
                                path: postToSession,
                                data: {ancillary: ancillarySession},
                                success: function () {
                                  var ancillariesSeatsProcessURL = process != 'ancillaries_premium_seats' ? getProcessUrl('ancillaries_seats') : getProcessUrl('ancillaries_premium');

                                  /* Load the data */
                                  self.finishedHtmlLoad = true;

                                  /* Load the data */
                                  if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                                    self.goToAncillaries(ancillariesSeatsProcessURL, ancillarySession['mode']);
                                  }

                                },
                                failure: function () {
                                  self.sessionError = true;
                                  self.headerError = false;
                                  self.finishedHtmlLoad = true;

                                  if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                                    /* Session error */
                                    self.showSessionError();
                                  }
                                }
                              });

                            }
                          }
                          else {

                            /* update gtm error recover flight */
                            if (data.header.code === 3301)
                            {
                              updateGtm({
                                'pageArea': 'Mis vuelos',
                                'pageCategory': (process == 'ancillaries_seats') ? 'Ancillaries asientos' : 'Ancillaries asientos PE',
                                'pageContent': (process == 'ancillaries_seats') ? 'Error_3301. Error al recuperar la reserva. Seats' : 'Error_3301. Error al recuperar la reserva. PE',
                              });
                            }

                            self.sessionError = false;
                            self.headerError = true;
                            self.finishedHtmlLoad = true;
                            self.headerErrorMessage = data.header.message;

                            if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                              self.showErrorMessage(self.element.find('form.ancillaries_form'));
                            }
                          }
                        }
                      });
                    }

                  });
        }
      });

      /* Init info flight form */
      this.element.find('form.info_form').find('.airport .input input').on('focus', function () {
        /* Enable airports */
        self.element.find('form.info_form').find('.airport').removeClass('disabled off');

        /* Disable flight number field */
        self.element.find('form.info_form').find('.flight_field').addClass('disabled off');

        /* Trigger form validate */
        self.element.find('form.info_form').trigger('validate');
      });

      this.element.find('form.info_form').find('.flight_field .input input').on('focus', function () {
        /* Disable airports */
        self.element.find('form.info_form').find('.airport').addClass('disabled off');

        /* Enable flight number field */
        self.element.find('form.info_form').find('.flight_field').removeClass('disabled off');

        /* Trigger form validate */
        self.element.find('form.info_form').trigger('validate');
      });

      this.element.find('form.info_form').form({
        triggerValidate: true,
        onSubmit: function (form) {
          var fromCode = form.element.find('.airport.from .input .code').val();
          var toCode = form.element.find('.airport.to .input .code').val();
          var flightNumber = form.element.find('.flight_number .flight_field .input input').val();
          var infonProcessURL = getProcessUrl('info');

          /* Figure out if it's a from/to search or a flightNumber search */
          if (form.element.find('.flight_number .flight_field').hasClass('disabled')) {
            /* from/to search */
            Bus.publish('hash', 'change', {hash: infonProcessURL + '/from/' + fromCode + '/to/' + toCode});
          }
          else {
            /* flightNumber search */
            Bus.publish('hash', 'change', {hash: infonProcessURL + '/flight/' + flightNumber});
          }
        }
      });

      /* Init pmr form */
      this.element.find('form.pmr_form').form({
        triggerValidate: true,

        onSubmit: function (form) {
          var pmrFormSession = {};

          /* Reset loading control vars */
          self.finishedLoadingBar = false;
          self.finishedHtmlLoad = false;
          self.headerError = false;
          self.headerErrorMessage = '';
          self.sessionError = false;
          self.alreadyBought = false;
          self.pmrData = undefined;

          self.createNewPage('pmr',
            function () { /* Success callback */
              self.goToPmr();
            },
            function () { /* Error callback */
              self.showErrorMessage(self.element.find('form.pmr_form'));
            },
            function () { /* Session error */
              self.showSessionError();
            },
            function () { /* Process callback */
              /* Post the search info */
              var process = form.element.closest('.search_form').attr('data-process-start');
              var pmrFormData = form.element.serializeObject();

              var dataSent = {
                locator: pmrFormData.pmr_form_reserve_number,
                surname: window.cleanSpaces(pmrFormData.pmr_form_surname)
              };

              /* Get flight data service */
              Bus.publish('services', 'getPassengersData', {
                data: dataSent,
                success: function (data) {
                  /* If response comes without data.header */
                  if (!data.header) {
                    data = {
                      'header': {
                        'error': false
                      },
                      'body': {
                        'data': data
                      }
                    };
                  }

                  if (!data.header.error) {
                    data = data.body.data;
                    self.pmrFormData = data;

                    /* Post checkinSession to server with the service data */
                    var postToSession = getPostURL('pmr_form');

                    /* Compose post object */
                    /*
                     Tener en cuenta que la variable locator del objeto checkinSession sirve tanto para el localizador
                     de 6 caracteres como el número de reserva de 13
                     */
                    pmrFormSession['internalService'] = false;
                    pmrFormSession['locator'] = dataSent.locator;
                    pmrFormSession['surname'] = dataSent.surname;
                    pmrFormSession['bookingId'] = data.bookingId;
                    pmrFormSession['passengers'] = data.passengers;

                    /* Post to session */
                    Bus.publish('ajax', 'postJson', {
                      path: postToSession,
                      data: {pmr: pmrFormSession},
                      success: function () {

                        /* Load the data */
                        self.finishedHtmlLoad = true;

                        if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                          self.goToPmr();
                        }
                      },
                      failure: function () {
                        self.sessionError = true;
                        self.headerError = false;
                        self.finishedHtmlLoad = true;

                        if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                          /* Session error */
                          self.showSessionError();
                        }
                      }
                    });

                  } /* If there is any error */
                  else {

                    /* update GTM error */
                    if (data.header.code === 1008)
                    {
                      updateGtm({
                        'pageArea': 'Mis vuelos',
                        'pageCategory': 'Buscador Pmr',
                        'pageContent': 'Error_' + data.header.code + '. Error al recuperar la reserva.'
                      });
                    }

                    self.sessionError = false;
                    self.headerError = true;
                    self.finishedHtmlLoad = true;
                    self.headerErrorMessage = data.header.message;

                    if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                      self.showErrorMessage(self.element.find('form.pmr_form'));
                    }
                  }
                }
              });
          });
        }
      });

    function textualDate(date) {
      var parts = date.split(/\s+/);
      var textual = parts[0];
      
      var dateText = dateFormat(textual);
      var date = new Date(dateText);
      
      var monthText = lang('dates.monthsNames_' + date.getMonth());
      var dayText = lang('dates.dayNames_' + date.getDay())
      var day = 0 + date.getDate();
      return dayText + ' ' + day + ' ' + monthText;
    }
    
    function durationString(from, to) {
      from = dateFormat(from);
      to = dateFormat(to);
      var fromTimestamp = +new Date(from);
      var toTimestamp = +new Date(to);
      var duration = toTimestamp - fromTimestamp;
      var durationMinutes = Math.floor(duration / 60000);
      var durationHours = Math.floor(durationMinutes / 60);
      durationMinutes -= durationHours * 60;
      var result = durationHours + 'h ' + durationMinutes + 'm';
      return result;
    }
    
    function dateFormat(str) {
      return str.replace(/^(\d+)\/(\d+)\/(\d+)(.*)$/, '$3/$2/$1$4');
    }
    
    function processH72Flight(info) {
      var fragments = [];
      var timeDeparture = null;
      var timeArrival = null;
      
      var numTransfers = 0;
      var totalTime = 0;
      
      var parts = info[0].dateDeparture.split(/\s+/);
      timeDeparture = parts[1];

      parts = info[info.length - 1].dateArrival.split(/\s+/);
      timeArrival = parts[1];

      for (var i = 0; i < info.length; ++i) {
        var flight = info[i];
        
        var departureTimestamp = +new Date(dateFormat(flight.gmtDateDeparture));
        var arrivalTimestamp = +new Date(dateFormat(flight.gmtDateArrival));
        var duration = arrivalTimestamp - departureTimestamp;
        totalTime += duration;

        var flightDurationMinutes = Math.floor(duration / 60000);
        var flightDurationHours = Math.floor(flightDurationMinutes / 60);
        flightDurationMinutes -= flightDurationHours * 60;
        var flightDuration = flightDurationHours + 'h ' + flightDurationMinutes + 'm';
        
        var fragment = {};
        fragment.type = 'flight';
        
        var parts = flight.dateDeparture.split(/\s+/);
        fragment.dateDeparture = parts[0];
        var fragmentTimeDeparture = parts[1];

        parts = flight.dateArrival.split(/\s+/);
        fragment.dateArrival = parts[0];
        var fragmentTimeArrival = parts[1];
        
        fragment.departure = {
          description: flight.airportDeparture.description,
          code: flight.airportDeparture.code,
          flightNumber: flight.companyCode + flight.number,
          time: fragmentTimeDeparture,
          terminal: flight.terminalDeparture
        };

        fragment.arrival = {
          description: flight.airportArrival.description,
          code: flight.airportArrival.code,
          time: fragmentTimeArrival,
          terminal: flight.terminalArrival
        };

        fragment.operatedBy = flight.operator;
        fragment.floteDescription = flight.floteDescription;
        fragment.duration = flightDuration;

        fragments.push(fragment);
        ++numTransfers;
        
        if (i < (info.length - 1)) {
          var nextFlight = info[i + 1];
          var fragment = {};
          fragment.type = 'transfer';
          
          fragment.transferAirportdescription = flight.airportArrival.description;
          fragment.transferAirportCode = flight.airportArrival.code;
          var from = flight.gmtDateArrival;
          var to = nextFlight.gmtDateDeparture;
          fragment.totalTimeString = durationString(from, to);

          fragments.push(fragment);
        }
      }
      
      var journeyDurationMinutes = Math.floor(totalTime / 60000);
      var journeyDurationHours = Math.floor(journeyDurationMinutes / 60);
      journeyDurationMinutes -= journeyDurationHours * 60;
      var journeyDuration = journeyDurationHours + 'h ' + journeyDurationMinutes + 'm';
            
      --numTransfers;
      
      return {
        dateDeparture: textualDate(info[0].dateDeparture),
        dateArrival: textualDate(info[info.length - 1].dateArrival),
        timeDeparture: timeDeparture,
        timeArrival: timeArrival,
        fragments: fragments,
        transfers: numTransfers.toString(),
        duration: journeyDuration
      };
    }
    
    function processH72BookingData(info) {       
      var paymentMethods = info.paymentMethods;

      var ow = processH72Flight(info.booking.journey.oneWayFlights);

      var dayDeparture = +new Date(dateFormat(ow.fragments[0].dateDeparture));
      var dayArrival = +new Date(dateFormat(ow.fragments[ow.fragments.length - 1].dateArrival));
      var dayDifference = dayArrival - dayDeparture;
      var daysGap = Math.floor(dayDifference / (24 * 60 * 60 * 1000));
      ow.gapArrival = daysGap;

      var rt = null;
      if (info.booking.journey.returnFlights !== undefined) {
        rt = processH72Flight(info.booking.journey.returnFlights);
        var dayDeparture = +new Date(dateFormat(rt.fragments[0].dateDeparture));
        var dayArrival = +new Date(dateFormat(rt.fragments[rt.fragments.length - 1].dateArrival));
        var dayDifference = dayArrival - dayDeparture;
        var daysGap = Math.floor(dayDifference / (24 * 60 * 60 * 1000));
        rt.gapArrival = daysGap;
      }

      var totalPassengersInfo = {};
      for (var i in info.passengers) {
        var passenger = info.passengers[i];
        var type = passenger.passengerType.toLowerCase();
        if (totalPassengersInfo[type] === undefined) 
          totalPassengersInfo[type] = [];
        var passengerData = {
          name: passenger.name,
          surname: passenger.surname,
          surname2: passenger.surname2
        };
        totalPassengersInfo[type].push(passengerData);
      }
      
      var calculatePassengers = info.passengers;      
      
      var cabinClasses = {
        BUS: 'business',
        ECO: 'economy',
        TUR: 'tourist'
      };
      var cabinClass = cabinClasses[info.booking.cabinClass];
      
      ow.cabinClass = info.booking.cabinClass;
      ow.fareFamily = null;
            
      var journeys = { ow: ow };
      if (info.booking.journey.returnFlights !== undefined) {
        rt.cabinClass = info.booking.cabinClass;
        journeys.rt = rt;      
      }
              
      var result = {
        cabinClass: cabinClass,
        totalPassengersInfo: totalPassengersInfo,
        calculatePassengers: calculatePassengers,
        methods: paymentMethods,
        journeys: journeys,
        passengers: info.passengers,
        journeyConstraint: info.booking.journeyConstraint
      };
            
      return result;
    }

      /* Init h72 form */
      this.element.find('form.h72_payment').form({
        triggerValidate: true,

        onSubmit: function (form) {
          var h72FormSession = {};

          /* Reset loading control vars */
          self.finishedLoadingBar = false;
          self.finishedHtmlLoad = false;
          self.headerError = false;
          self.headerErrorMessage = '';
          self.sessionError = false;
          self.alreadyBought = false;
          self.h72Data = undefined;

          self.createNewPage('h72',
            function () { /* Success callback */
              self.goToH72();
            },
            function () { /* Error callback */
              self.showErrorMessage(self.element.find('form.h72_payment'));
            },
            function () { /* Session error */
              self.showSessionError();
            },
            function () { /* Process callback */
              /* Post the search info */
              var process = form.element.closest('.search_form').attr('data-process-start');
              var h72FormData = form.element.serializeObject();

              var dataSent = {
                locator: h72FormData.h72_payment_reserve_number,
                surname: window.cleanSpaces(h72FormData.h72_payment_surname)
              };

              /* Get flight data service */
              Bus.publish('services', 'getH72BookingData', {
                data: dataSent,
                success: function (data) {
                  /* If response comes without data.header */
                  if (!data.header) {
                    data = {
                      'header': {
                        'error': false
                      },
                      'body': {
                        'data': data
                      }
                    };
                  }
                  
                  if (!data.header.error) {
                    data = data.body.data;
                    self.h72FormData = data;

                    /* Post checkinSession to server with the service data */
                    var postToSession = getPostURL('h72_payment');

                    /* Compose post object */
                    /*
                     Tener en cuenta que la variable locator del objeto checkinSession sirve tanto para el localizador
                     de 6 caracteres como el número de reserva de 13
                     */
                    h72FormSession['internalService'] = false;
                    h72FormSession['locator'] = dataSent.locator;
                    h72FormSession['surname'] = dataSent.surname;
                    h72FormSession['bookingId'] = data.booking.bookingId;
                    h72FormSession['passengers'] = data.passengers;
                    h72FormSession['data'] = processH72BookingData(data);
                    
                    /* Post to session */
                    Bus.publish('ajax', 'postJson', {
                      path: postToSession,
                      data: {h72: h72FormSession},
                      success: function () {

                        /* Load the data */
                        self.finishedHtmlLoad = true;

                        if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                          self.goToH72();
                        }
                      },
                      failure: function () {
                        self.sessionError = true;
                        self.headerError = false;
                        self.finishedHtmlLoad = true;

                        if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                          /* Session error */
                          self.showSessionError();
                        }
                      }
                    });

                  } /* If there is any error */
                  else {

                    /* update GTM error */
                    if (data.header.code === 1008)
                    {
                      updateGtm({
                        'pageArea': 'Mis vuelos',
                        'pageCategory': 'Buscador H72',
                        'pageContent': 'Error_' + data.header.code + '. Error al recuperar la reserva.'
                      });
                    }
                    
                    /*Pop up error*/
                    $('body').ui_dialog({
                      title: lang('general.info_error_title'),
                      error: false,
                      subtitle: data.header.message,
                      close: {
                        behaviour: 'close',
                        href: '#'
                      },
                      buttons: [
                        {
                          className: 'close',
                          href: '#',
                          label: lang('general.ok')
                        }
                      ]
                    });

                    self.sessionError = false;
                    self.headerError = true;
                    self.finishedHtmlLoad = true;
                    self.headerErrorMessage = data.header.message;

                    if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                      self.showErrorMessage(self.element.find('form.h72_payment'));
                    }
                  }
                }
              });
          });
        }
      });
    },

    launchPmrInternal: function(bookingId, locator) {
      var self = this;

      var dataSent = {
        bookingId: bookingId
      };

      /* Get flight data service */
      Bus.publish('services', 'getPassengersDataBooking', {
        data: dataSent,
        success: function (data) {
          /* If response comes without data.header */
          if (!data.header) {
            data = {
              'header': {
                'error': false
              },
              'body': {
                'data': data
              }
            };
          }

          if (!data.header.error) {
            data = data.body.data;
            self.pmrFormData = data;

            /* Post checkinSession to server with the service data */
            var postToSession = getPostURL('pmr_form');

            /* Compose post object */
            var pmrFormSession = {};

            pmrFormSession['internalService'] = true;
            pmrFormSession['bookingId'] = data.bookingId;
            pmrFormSession['locator'] = locator;
            pmrFormSession['passengers'] = data.passengers;

            /* Post to session */
            Bus.publish('ajax', 'postJson', {
              path: postToSession,
              data: {pmr: pmrFormSession},
              success: function () {
                /* Load the data */
                self.goToPmr();
              },
              failure: function () {
                /* Session error */
                self.showSessionError();
              }
            });

          } else {

            $('body').ui_dialog({
              title: lang('general.info_error_title'),
              error: false,
              close:  {
                behaviour: 'close',
                href: '#'
              },
              subtitle: data.header.message,
              buttons: [
                {
                  className: 'close',
                  href: '#',
                  label: lang('general.ok')
                }
              ],
              render: function ($dialog_error) {
                  $dialog_error.find('.close a').on('click', function(event) {
                    event.preventDefault();

                    Bus.publish('process', 'show_pmrform');
                  });
                }
            });

          }

        }
      });
    },

    launchH72Internal: function(bookingId, locator) {
      var self = this;

      var dataSent = {
        bookingId: bookingId
      };

      /* Get flight data service */
      Bus.publish('services', 'getPassengersDataBooking', {
        data: dataSent,
        success: function (data) {
          /* If response comes without data.header */
          if (!data.header) {
            data = {
              'header': {
                'error': false
              },
              'body': {
                'data': data
              }
            };
          }

          if (!data.header.error) {
            data = data.body.data;
            self.h72FormData = data;

            /* Post checkinSession to server with the service data */
            var postToSession = getPostURL('h72_payment');

            /* Compose post object */
            var h72FormSession = {};

            h72FormSession['internalService'] = true;
            h72FormSession['bookingId'] = data.bookingId;
            h72FormSession['locator'] = locator;
            h72FormSession['passengers'] = data.passengers;

            /* Post to session */
            Bus.publish('ajax', 'postJson', {
              path: postToSession,
              data: {h72: h72FormSession},
              success: function () {
                /* Load the data */
                self.goToH72();
              },
              failure: function () {
                /* Session error */
                self.showSessionError();
              }
            });

          } else {

            $('body').ui_dialog({
              title: lang('general.info_error_title'),
              error: false,
              close:  {
                behaviour: 'close',
                href: '#'
              },
              subtitle: data.header.message,
              buttons: [
                {
                  className: 'close',
                  href: '#',
                  label: lang('general.ok')
                }
              ],
              render: function ($dialog_error) {
                  $dialog_error.find('.close a').on('click', function(event) {
                    event.preventDefault();

                    Bus.publish('process', 'show_h72form');
                  });
                }
            });

          }

        }
      });
    },

    createNewPage: function (processClassName, successCallback, errorCallback, sessionErrorCallback, callback) {
      var self = this;
      var callback = (callback) ? callback : function () {
      };
      var successCallback = (successCallback) ? successCallback : function () {
      };
      var errorCallback = (errorCallback) ? errorCallback : function () {
      };
      var sessionErrorCallback = (sessionErrorCallback) ? sessionErrorCallback : function () {
      };

      /* Create the new page */
//      var $newPage = $('<div class="process_page ' + processClassName + '"><div id="' + processClassName + '"><div class="process_wrapper"><div class="process_wrapper_content loading"><div class="loading_content"><div class="loading_topbar"><div class="searching_bar"><div class="loader"><span class="icon"></span></div></div></div><span class="spinner"></span></div></div></div></div></div>');
      var $newPage = $('<div class="process_page ' + processClassName + '"><div id="' + processClassName + '"><div class="process_wrapper"><div class="process_wrapper_content loading"><div class="loading_content"><div class="loading_topbar"><div class="searching_bar"><div class="loader"><span class="icon"></span></div></div></div><span class="text_spinner">' + lang(processClassName + '.text_spinner') + '</span><span class="spinner"></span></div></div></div></div></div>');

      /* Append the new page to the process */
      this.element.closest('.process_page_wrapper').append($newPage);

      /* Get the current offset */
      var offsetTop = this.element.closest('.process_page_wrapper').find('.process_page.' + processClassName).index() * 100 * -1;

      /* Animate wrapper to show it */
      this.element.closest('.process_page_wrapper').animate({
        'top': offsetTop + '%'
      }, 500, 'easeInOutExpo', function () {

        /* Delete error messages */
        self.element.find('form').children('.error_message').remove();
        self.element.find('.ancillaries_error_type').remove();
        self.element.find('.ancillaries_error_description').hide();

        /* Animate searching bar */
        self.element.closest('.process_page_wrapper').find('.process_page.' + processClassName + ' .loading_topbar').animate({
          'margin-left': '0'
        }, 400, 'linear', function () {
        });

        self.element.closest('.process_page_wrapper').find('.process_page.' + processClassName + ' .searching_bar').animate({
          'width': '100%'
        }, 2000, 'easeInOutExpo', function () {
          /* Show blinking dot */
          self.element.closest('.process_page_wrapper').find('.process_page.' + processClassName + ' .loading_content .spinner').show();
          self.element.closest('.process_page_wrapper').find('.process_page.' + processClassName + ' .loading_content .text_spinner').show();

          /* Finished the load bar */
          self.finishedLoadingBar = true;

          if (self.finishedHtmlLoad && self.finishedLoadingBar) {

            if (self.headerError) {
              errorCallback();
            }
            else if (self.sessionError) {
              sessionErrorCallback();
            }
            else if (self.alreadyBought) {
              self.showFinalErrorMessage(self.element.find('form.ancillaries_form'), function () {
                /* Hide form and show message */
                self.element.find('form.ancillaries_form').find('fieldset').fadeOut(500, function () {
                  self.element.find('form.ancillaries_form').find('.error_message').fadeIn(500);
                });
              });
            }
            else {
              successCallback();
            }
          }

        });
        /* Execute callback to get services */
        callback();
      });

    },
    goToCheckin: function () {
      var checkinProcessURL = getProcessUrl('checkin');
      Bus.publish('hash', 'change', {hash: checkinProcessURL + '/flights'});
    },
    goToPmr: function () {
      var pmrProcessURL = getProcessUrl('pmr_form');
      Bus.publish('hash', 'change', {hash: pmrProcessURL + '/passengers'});
    },
    goToH72: function () {
      var h72ProcessURL = getProcessUrl('h72_payment');
      Bus.publish('hash', 'change', {hash: h72ProcessURL + '/payment'});
    },
    showErrorMessage: function ($form, callback) {
      var self = this;
      var message = self.headerErrorMessage;
      var callback = (callback) ? callback : function () {};

      if ($form.closest('.search_form').hasClass('process_launched')) {
        $('#content').ui_dialog({
          title: lang('general.error_title'),
          error: true,
          subtitle: message,
          close: {
            behaviour: 'close',
            href: '#'
          },
          buttons: [
            {
              className: 'close',
              href: '#',
              label: lang('general.ok')
            }
          ]
        });

        /* Kill process */
        $form.closest('.search_form').removeClass('process_launched')
        Bus.publish('process', 'kill');
      }
      else {

        /* Append message
        if ($form.children('.error_message').length == 0) {
          $form.prepend('<div class="error_message"><p><span>' + message + '</span></p></div>');
        }
        else {
          $form.find('.error_message').empty().append('<p><span>' + message + '</span></p>');
        }*/

        /* Back to search */
        this.backToSearch(callback);

      }

      $form.find('p.ancillaries_description').hide();

      if ($('.ancillaries_error_type').length === 0) {

        $('.ancillaries_error_type').remove()
        $('<h3 class="ancillaries_error_type">' + message + '</h3>').insertAfter('h2.ancillaries_title');
        $form.find('p.ancillaries_error_description').show();
      }
      else {
        $('.ancillaries_error_type').remove()
        $('<h3 class="ancillaries_error_type">' + message + '</h3>').insertAfter('h2.ancillaries_title');
      }


      /* Back to search */
      this.backToSearch(callback);
    },
    showFinalErrorMessage: function ($form, callback) {
      var self = this;
      var message = self.headerErrorMessage;
      var callback = (callback) ? callback : function () {
      };

      /* Append message */
      if ($form.children('.error_message').length == 0) {
        $form.prepend('<div class="error_message" style="display: none;"><p><span>' + message + '</span></p><a class="button" href="' + urlCms('home') + '"><span>' + lang('general.go_to_home') + '</span></a></div>');
      }
      else {
        $form.find('.error_message').empty().append('<p><span>' + message + '</span></p>');
      }

      /* Back to search */
      this.backToSearch(callback);
    },
    showSessionError: function () {
      $('#search').ui_dialog({
        title: lang('general.error_title'),
        error: true,
        subtitle: lang('general.error_message'),
        close: {
          behaviour: 'close',
          href: '#'
        },
        buttons: [
          {
            className: 'close',
            href: '#',
            label: lang('general.ok')
          }
        ]
      });

      /* Back to search */
      this.backToSearch();
    },
    backToSearch: function (callback) {
      var self = this;
      var callback = (callback) ? callback : function () {
      };

      /* Animate wrapper to show it */
      this.element.closest('.process_page_wrapper').animate({
        'top': 0
      }, 500, 'easeInOutExpo', function () {
        self.element.closest('.process_page_wrapper').find('.process_page.checkin').remove();
        self.element.closest('.process_page_wrapper').find('.process_page.ancillaries').remove();

        callback();
      });
    },
    goToAncillaries: function (url, mode) {
      Bus.publish('hash', 'change', {hash: url + '/' + mode});
    },
    setAirports: function (from, to) {
      var self = this;
      var $originField = this.element.find('.search_flights .airports .airport.from');
      var $destinyField = this.element.find('.search_flights .airports .airport.to');

      /* Get airports data */
      var departureAirport = getData(from);
      var arrivalAirport = getData(to);

      /* Fill the origin code/name */
      $originField.find('.input .code').val(from);
      $originField.find('.input .helper').val(departureAirport.description);
      $originField.data('ui-airport_field').onSelect(from, departureAirport.description, departureAirport.resident, departureAirport.zone, false, false, false);
      $originField.trigger('validate');

      /* Fill the destiny code/name */
      if (from != '')
        $destinyField.removeClass('disabled');
      else
        $destinyField.addClass('disabled');

      $destinyField.find('.input .code').val(to);
      $destinyField.find('.input .helper').val(arrivalAirport.description);
      $destinyField.data('ui-airport_field').onSelect(to, arrivalAirport.description, arrivalAirport.resident, arrivalAirport.zone, false, false, false);
      $destinyField.trigger('validate');

      $('.input input.helper').each(function(){
        $(this).val().length > 25 ? $(this).val($(this).val().substring(0,23)+'...') :'';
      });
    },
    manageAirportsData: function () {
      var self = this;

      /* Need data event for from fields */
      $('body').on('need_data', '.airports .airport.from', function () {
        var $this = $(this);
        var airportsFrom = window.airports['from'];
        var isInfoForm = $this.closest('form').hasClass('info_form');
        var isCheckinForm = $this.closest('form').hasClass('checkin_form');

        if (isInfoForm) {
          airportsFrom = window.airportsInfo['from'];
        }

        if (isCheckinForm) {
          airportsFrom = window.airportsCheckin['from'];
        }

        if (!$this.hasClass('with_source') && airportsFrom.length > 0) {
          if ($this.data('ui-airport_field')) {
            $this.airport_field('getAirports', airportsFrom);
          }
        }
      });

      /* Need data event for to fields */
      $('body').on('need_data', '.airports .airport.to', function(event, code) {
        var $this = $(this);
        var airportsTo = window.airports['to'];
        var destinyAirportsPath = getServiceURL('airport.destiny').replace('{code}', code);
        var isInfoForm = $this.closest('form').hasClass('info_form');

        if (isInfoForm) {
          airportsTo = window.airportsInfo['to'];
          destinyAirportsPath = getServiceURL('info.destiny').replace('{code}', code)
        }

        /* If there's no previous cache version, ask the service */
        if (airportsTo[code] == undefined) {

          /* Set a blank array, so it's not undefined and will make the call to service just once */
          airportsTo[code] = [];

          /* Call AJAX module to get the json */
          Bus.publish('ajax', 'getFromService', {
            path: destinyAirportsPath,
            success: function (data) {
              if (!data.header.error) {
                var response = data.body.data;
                  $.each(response, function (index, airport) {
                  airport.metadata = airport.description;
                   if (airport.country)
                   airport.metadata = airport.country.description + ' ' + airport.metadata;
                });
                /* Just notify to this field */
                if ($this.data('ui-airport_field')) {
                  $this.airport_field('getAirports', response);
                }

                /* Cache the data */
                
                airportsTo[code] = response;
                

              }
              else {
                /* Show message error */
                // $('body').ui_dialog({
                //   title: lang('general.error_title'),
                //   error: true,
                //   subtitle: data.header.message,
                //   close: {
                //     behaviour: 'close',
                //     href: '#'
                //   },
                //   buttons: [
                //     {
                //       className: 'close',
                //       href: '#',
                //       label: lang('general.ok')
                //     }
                //   ]
                // });
              }
            }
          });

        }
        else {
          /* Notify to destiny field */
          if (airportsTo[code].length > 0) {
            if ($this.data('ui-airport_field')) {
              $this.airport_field('getAirports', airportsTo[code]);
            }
          }
        }
      });

    },

    manageCalendars: function() {
      var self = this;

      $('body').on('need_dates', '.dates .calendar.ow, .calendar.rt', function(event, code) {
        event.preventDefault();

        var $this = $(this),
        isminisearch = $("#results").find('.mini_search').length === 1,
        idSearchForm = (isminisearch) ? '#mini_search_form_from' : '#search_form_from',
        idSearchTo = (isminisearch) ? '#mini_search_form_to' : '#search_form_to',
        idSearchDateOw = (isminisearch) ? '#mini_search_form_ow' : '#search_form_ow',
        idSearchDateRt = (isminisearch) ? '#mini_search_form_rt' : '#search_form_rt',
        isDepartureCalendar = $this.hasClass('ow'),
        startingpoint = (isDepartureCalendar) ? $(idSearchForm).val() : $(idSearchTo).val(),
        endingpoint = (isDepartureCalendar) ? $(idSearchTo).val() : $(idSearchForm).val(),
        departureDateOw = (isDepartureCalendar) ? '' : $(idSearchDateOw).val(),
        departureDateOwCheckValue = $(idSearchDateOw).val(),
        departureDateRt = $(idSearchDateRt).val(),
        departureDate,
        departureDatesPath;

        if (departureDateOw !== '' && !isDepartureCalendar) {
          departureDateOw = departureDateOw.split('-')[1] + '/' + departureDateOw.split('-')[0] + '/' + departureDateOw.split('-')[2];
        }
        
        departureDateOwCheckValue = departureDateOwCheckValue.split('-')[1] + '/' + departureDateOwCheckValue.split('-')[0] + '/' + departureDateOwCheckValue.split('-')[2];
        departureDateRt = departureDateRt.split('-')[1] + '/' + departureDateRt.split('-')[0] + '/' + departureDateRt.split('-')[2];

        departureDate = code || departureDateOw;

        departureDatesPath = getServiceURL('results.disable_arrival_dates').replace('{departureAirport}', startingpoint).replace('{arrivalAirport}', endingpoint).replace('{departureDate}', departureDate);

        Bus.publish('ajax', 'getFromService', {
          path: departureDatesPath,
          success: function(data) {
            if (!data.header.error) {
              var arrDisabledDates = {},
              disabled_dates = {},
              disableddatesLocal = (isDepartureCalendar) ? window.disableddatesOW : window.disableddatesRT;

              disabled_dates = data.body.data;
              if(disabled_dates != null) {

                for (var a = 0; a < disabled_dates.length; a++) {
                  for (var i = 0; i < disabled_dates[a].months.length; i++) {
                    for (var j = 0; j < disabled_dates[a].months[i].days.length; j++) {
	                   var arrIndex = new Date(disabled_dates[a].months[i].month + '/' + disabled_dates[a].months[i].days[j] + '/' + disabled_dates[a].year).getTime();
	                   arrDisabledDates[arrIndex] = arrIndex;//new Date(disabled_dates[a].months[i].month + '/' + disabled_dates[a].months[i].days[j] + '/' + disabled_dates[a].year).getTime);
	                   var activeDate = disabled_dates[a].months[i].days[j] + "/" + disabled_dates[a].months[i].month + "/" + disabled_dates[a].year;
	                   if(isDepartureCalendar) {
		                   if(activeDate == departureDateOwCheckValue.replace("/0", "/")) {
		                   	 $(idSearchDateOw).val('');
		                   	 $(idSearchDateOw).closest('.input').find('.placeholder').text('');
		                   	 $(idSearchDateOw).closest('.input').datepicker('setDate', '');
		                   	 $(idSearchDateOw).trigger('blur');
		                   	 $(idSearchDateOw).trigger('validate');
		                   }
	                   } else {
	                	   if(activeDate == departureDateRt.replace("/0", "/")) {
		                   	 $(idSearchDateRt).val('');
		                   	 $(idSearchDateRt).closest('.input').find('.placeholder').text('');
		                   	 $(idSearchDateRt).closest('.input').datepicker('setDate', '');
		                   	 $(idSearchDateRt).trigger('blur');
		                   	 $(idSearchDateRt).trigger('validate');
		                   }
	                   }
                    };
                  };
                };

                disableddatesLocal = _.union(disableddatesLocal,_.toArray(arrDisabledDates));
              }else{
                disableddatesLocal = "0";
              }

              if(isDepartureCalendar){
                window.disableddatesOW =disableddatesLocal;
                self.removeDisableCalendar('ow');
              }else{
                window.disableddatesRT = disableddatesLocal;
                self.removeDisableCalendar('rt');
              }
            }
          }
        });

      });
    },

    removeDisableCalendar:function(direction){

      if($('.'+ direction +' .ui-datepicker-group .ui-datepicker-prev.ui-corner-all[data-handler="prev"]').length !== 0) {
        $('.'+ direction +' .ui-datepicker-group .ui-datepicker-prev.ui-corner-all').removeClass('ui-state-disabled');
      }

      if($('.'+ direction +' .ui-datepicker-group .ui-datepicker-next.ui-corner-all[data-handler="next"]').length !== 0 ){
        $('.'+ direction +' .ui-datepicker-group .ui-datepicker-next.ui-corner-all').removeClass('ui-state-disabled');
      }
    },




    getDescription: function(code) {

    },
    getResident: function (code) {

    },
    getZone: function (code) {

    },
    findDescription: function (field, code) {
      /* If needed get data from cache or server */
      return '';
    },
    manageRoutes: function () {
      var self = this;

      $('body').on('show_routes', '.airports .airport', function () {

        var $this = $(this);
        var mode = ($this.hasClass('to')) ? 'to' : 'from';
        var code;
        var description;
        var data = {
          mode: mode,
          airports: undefined,
          code: undefined
        }
        var isInfoForm = $this.closest('form').hasClass('info_form');
        var airports = $this.airport_field('returnAirports');

        /* If it's toField, get the code */
        if (mode == 'to') {
          code = $this.closest('.airports').find('.airport.from .input input.code').val();
          description = $this.closest('.airports').find('.airport.from .input input.helper').val();

          if (code) {
            data.airports = self.convertAirportsToRoutes(airports);
            data.code = code;
            data.description = description;
          }
          else {
            return false;
          }
        }
        else {
          data.airports = self.convertAirportsToRoutes(airports);
        }
        
        /* Get the template and append it */
        Bus.publish('ajax', 'getTemplate', {
          path: AirEuropaConfig.templates.airport.routes,
          data: data,
          success: function (html) {
            var $html = $(html);
            var marginTop;

            /* Hide and append to body */
            $html.addClass('hidden');
            $this.append($html);

            /* Get height */
            var routesHeight = $html.find('.routes_lightbox').height();

            /* Set a class to get the min-height */
            if (routesHeight < 250) {
              $html.find('.routes_lightbox').addClass('floated_cols');
            }

            /* Call prerender for new content loaded */
            Bus.publish('prerender', 'restart');

            /* Calc height and position it */
            // marginTop = ($html.find('.routes_lightbox').height() / 2) * -1;
            // $html.find('.routes_lightbox').css('margin-top', marginTop);

            /* Add class to the body */
            $('body').addClass('showing_routes');

            /* Add class to the field */
            $this.addClass('showing_routes');

            /* Show again */
            $html.removeClass('hidden');


            var $countryList = $('.tab_list_airport li.country a.country_list');
            $countryList.on('click',function(event){
              event.preventDefault();
              $countryList.closest('li.country').removeClass('active');
              $(this).closest('li.country').addClass('active');
            });
          }
        });

      });
      


    },
    convertAirportsToRoutes: function (airports) {
      var results = new Array();
      var airportsPerZone = {};
      var orderedAirportsPerZone = {};

      /* Order the airports per zone */
      $.each(airports, function (index, airport) {
        if (airport.zone) { /* If the airport is classified by zone */
          if (airportsPerZone[airport.zone] == undefined) {
            airportsPerZone[airport.zone] = [];
          }

          airportsPerZone[airport.zone].push({
            description: airport.description,
            code: airport.code,
            resident: airport.resident,
            zone: airport.zone
          });
        }
        else { /* If it doesn't have, save it in a generic category */
          if (airportsPerZone['generic'] == undefined) {
            airportsPerZone['generic'] = [];
          }

          airportsPerZone['generic'].push({
            description: airport.description,
            code: airport.code,
            resident: airport.resident,
            zone: airport.zone
          });

        }
      });

      /* Order the zones like in the config */
      if (AirEuropaConfig.zonesAvailable != undefined) {
        $.each(AirEuropaConfig.zonesAvailable, function (index, zone) {

          /* If the zone has some results, save it on the new array */
          if (airportsPerZone[zone]) {
            orderedAirportsPerZone[zone] = airportsPerZone[zone];
          }
        });
      }

      /* Append at the end the generic category if it's needed */
      if (airportsPerZone['generic']) {
        orderedAirportsPerZone['generic'] = airportsPerZone['generic'];
      }

      /* Create the array to loop through Handlebars */
      $.each(orderedAirportsPerZone, function (index, zone) {
        var columnLength = 19;
        for (var i = 0; i < zone.length; ++i) {
          zone[i].cutpoint = (i !== 0) && ((i % columnLength) === 0);
        }
        results.push({
          code: index,
          name: (index != 'generic') ? lang('zones.' + index) : undefined,
          airports: zone
        });
      });

      return results;
    },

    // setInterislasListeners: function($module) {
    //   var $container = $module.find('fieldset.inter_discount');

    //   /* Listeners to get info */
    //   $container.on('updateInfo', function(event) {
    //     var $interislasField = $(this);
    //     var $form            = $interislasField.closest('form');
    //     var isMiniSearch     = ($('.mini_search').length);
    //     var fromValue        = (isMiniSearch) ? $form.find('#mini_search_form_from').val() : $form.find('#search_form_from').val();
    //     var toValue          = (isMiniSearch) ? $form.find('#mini_search_form_to').val()   : $form.find('#search_form_to').val();

    //     /* Hide interislas selector */
    //     $interislasField.addClass('hidden');

    //     if (fromValue !== "" && toValue !== "") {
    //       /* Call service to get interislas info */
    //       Bus.publish('services', 'getInterislasInfo', {
    //         data: {
    //           departureCode: fromValue,
    //           arrivalCode:   toValue
    //         },
    //         success: function(data) {
    //           var mustShowInterislasSelector = (data.body.data != null);

    //           if (mustShowInterislasSelector) {
    //             var interislasOptions = [{ code: '0', description: 'No aplicar descuento de interislas' }];

    //             $.each(data.body.data.joints, function() {
    //               interislasOptions.push({ code: this.farebasis, description: this.joint.description });
    //             });

    //             /* Update interislas options */
    //             $form.find('fieldset.inter_discount .inter_detail .inter_checks ul').html('');

    //             /* Field attrs */
    //             var fieldDataGroup = (isMiniSearch) ? 'field_minisearch_inter_group' : 'field_search_interislas_group';
    //             var fieldName      = (isMiniSearch) ? 'field_minisearch_inter'       : 'field_search_interislas';
    //             var fieldPrefix    = (isMiniSearch) ? 'mini_' : '';

    //             $.each(interislasOptions, function() {
    //               var optionCode = this.code;
    //               var optionText = this.description;

    //               var newOption = '<li><div class="field radio propagate_change" data-group="'+ fieldDataGroup +'" data-init="false"><div class="field_wrapper">'
    //                 + '  <label for="'+ fieldPrefix+optionCode +'"><span>'+ optionText +'</span></label>'
    //                 + '  <input type="radio" id="'+ fieldPrefix+optionCode +'" name="'+ fieldName +'" />'
    //                 + '</div></div></li>';

    //               $form.find('fieldset.inter_discount .inter_detail .inter_checks ul').append(newOption);
    //             });

    //             /* Show interislas selector */
    //             $form.find('fieldset.inter_discount').removeClass('hidden');

    //             /* Restart fields */
    //             $form.form('restartFields');

    //             /* Set selected element */
    //             var interislasCode = $form.find('input.interislas').val() || false;

    //             var $defaultOptionElement  = $form.find('fieldset.inter_discount .inter_detail .inter_checks ul .field.radio').first();
    //             var $selectedOptionInput   = $form.find('fieldset.inter_discount .inter_detail .inter_checks ul .field.radio input#'+ fieldPrefix+interislasCode);

    //             if (!interislasCode || !$selectedOptionInput.length) {
    //               /* Set first radio element as checked */
    //               $defaultOptionElement.addClass('checked');
    //               $defaultOptionElement.find('input').trigger('click');
    //             } else {
    //               $selectedOptionInput.closest('.field.radio').addClass('checked');
    //               $selectedOptionInput.trigger('click');
    //             }
    //           }
    //         }
    //       });
    //     }
    //   });

    //   /* Event listeners to show/hide details */
    //   $container.on('mouseenter', function(event) {
    //     var $this = $(this);

    //     $this.addClass('viewing_details');
    //     $("input.hasDatepicker").datepicker("hide");
    //   });

    //   $container.on('mouseleave', function(event) {
    //     var $this = $(this);

    //     $this.removeClass('viewing_details');
    //   });

    //   $container.on('touchend', function(event) {
    //     var $this = $(this);
    //     var $self = $this;

    //     $this.addClass('viewing_details');
    //     $("input.hasDatepicker").datepicker("hide");

    //     $('body').off('touchend').on('touchend', function(event) {
    //       if ($(event.target).closest('fieldset.inter_discount').length <= 0) {
    //         $self.removeClass('viewing_details');

    //         $('body').off('touchend');
    //       }
    //     });
    //   });
    // }

  };
});
