Hydra.module.register('AncillariesController', function(Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#process',
    element: undefined,

    /* Results helpers */
    finishedLoadingBar: false,
    finishedHtmlLoad: false,

    /* Results cache */
    resultsData: undefined, /* Cache the last data results */
    resultsTemplate: undefined, /* Cache the last template results */

    /* Ancillary cache */
    ancillaryCache: {},
    ancillaryPhoneCache: undefined,

    events: {
      'process': {
        'show_ancillaries': function(oNotify) {
          this.showAncillaries(oNotify.mode);
        },
        'show_ancillaries_deeplink': function(oNotify) {
          this.showAncillariesDeeplink(oNotify.mode, oNotify.locator, oNotify.surname);
        },
        'show_ancillaries_step': function(oNotify) {
          /* Default step */
          if (oNotify.step == '') oNotify.step = mode;

          /* Just load the checkout if it's a valid step */
          if (oNotify.step == 'luggage' ||
              oNotify.step == 'seats' ||
              oNotify.step == 'payment' ||
              oNotify.step == 'confirm' ||
              oNotify.step == 'premium_seats') {
            this.showAncillariesStep(oNotify.mode, oNotify.step);
          }
        },
        'get_ancillaries_data': function(oNotify) {
          this.getAncillaryData(oNotify.callback);
        }
      }
    },

    init: function() {
      /* Save jquery object reference */
      this.element = $(this.selector);
    },

    getAncillaryData: function(callback) {
      callback(this.ancillaryCache);
    },

    /* Ancillaries process */

    showAncillaries: function(mode) {
      var self = this;

      /* Prepare the process */
      Bus.publish('process', 'start', {process: 'ancillaries', screenName: 'form'});

      /* Make the search form active */
      this.element.find('.search_form[data-process-name=ancillaries]').addClass('active');

      /* Make the search visible */
      this.element.find('#search').addClass('visible');

      /* Make the search visible */
      setTimeout(function() { /* Needed because the transition callback doesn't fire properly on webkit */
        $('body').addClass('processing');
        self.element.find('#search').addClass('finished');
      }, 400);

      /* Add the process start flag */
      this.element.find('.search_form[data-process-name=ancillaries]').attr('data-process-start', 'ancillaries_' + mode);

      /* Show form title */
      this.element.find('.search_form[data-process-name=ancillaries]').find('.search_form_title.ancillaries_' + mode).show();

      /* Activate links */
      $('a[data-process=ancillaries]').closest('p, li').addClass('active');

      /* Append ancillaries close if it isn't defined */
      if (this.element.find('#search .search_form .close').length == 0) {
        this.element.find('#search .search_form').append('<div class="close"><p><a href="/"><span>Cerrar</span></a></p></div>');
      }

      /* If the user is viewing any processing level */
      if ($('body').hasClass('processing')) {
        /* Animate process wrapper to show the search */
        this.element.find('.process_page_wrapper').animate({
          'top': '0'
        }, 500, 'easeInOutExpo', function() {
          self.element.find('.process_page.ancillaries').remove();
        });
      }

      /* Update Google Tag Manager */
      updateGtm({
        'pageArea': 'Mis vuelos',
        'pageCategory': 'Ancillaries',
        'pageContent': this.getPageContent('anc_' + mode)
      });
    },

    showAncillariesDeeplink: function(mode, locator, surname) {
        var self = this;

        /* Prepare the process */
        Bus.publish('process', 'start', {process: 'ancillaries', screenName: 'form'});

        /* Make the search form active */
        this.element.find('.search_form[data-process-name=ancillaries]').addClass('active');

        /* Make the search visible */
        this.element.find('#search').addClass('visible');

        /* Make the search visible */
        setTimeout(function() { /* Needed because the transition callback doesn't fire properly on webkit */
          $('body').addClass('processing');
          self.element.find('#search').addClass('finished');
        }, 400);

        /* Add the process start flag */
        this.element.find('.search_form[data-process-name=ancillaries]').attr('data-process-start', 'ancillaries_' + mode);

        /* Show form title */
        this.element.find('.search_form[data-process-name=ancillaries]').find('.search_form_title.ancillaries_' + mode).show();

        /* Activate links */
        $('a[data-process=ancillaries]').closest('p, li').addClass('active');

        /* Append ancillaries close if it isn't defined */
        if (this.element.find('#search .search_form .close').length == 0) {
          this.element.find('#search .search_form').append('<div class="close"><p><a href="/"><span>Cerrar</span></a></p></div>');
        }

        /* If the user is viewing any processing level */
        if ($('body').hasClass('processing')) {
          /* Animate process wrapper to show the search */
          this.element.find('.process_page_wrapper').animate({
            'top': '0'
          }, 500, 'easeInOutExpo', function() {
            self.element.find('.process_page.ancillaries').remove();
          });
        }

        /* Update Google Tag Manager */
        updateGtm({
          'pageArea': 'Mis vuelos',
          'pageCategory': 'Ancillaries',
          'pageContent': this.getPageContent('anc_' + mode)
        });

        //add data form
        var $form = this.element.find('#search .search_form.active');

        $form.find('.reserve_field input').val(locator).trigger('validate');
        $form.find('.text_field input').val(surname).trigger('validate');

        //Submit form
        $('.search_form.active').find('form.ancillaries_form .submit_button button').click();

      },

    showAncillariesStep: function(mode, step) {
      var self = this;

      /* Prepare the process */
      Bus.publish('process', 'start', {process: 'ancillaries', screenName: 'results'});

      /* If the page already exists from results page, don't need to create it */
      if (this.element.find('.process_page.ancillaries').length > 0) { /* Download template and append process_scroll and process_bottom_bar */

        if (this.element.find('.process_page.ancillaries .process_scroll').length == 0) {
          /* Get the structure template */
          Bus.publish('ajax', 'getTemplate', {
            data: {step: step},
            path: AirEuropaConfig.templates.ancillaries.structure,
            success: function(html) {
              var $html = $(html);

              /* Append the new page to the process */
              self.element.find('.process_page.ancillaries').addClass(mode);
              self.element.find('.process_page.ancillaries .process_wrapper_content').append($html.find('.process_scroll'));
              self.element.find('.process_page.ancillaries .process_wrapper_content').append($html.find('.process_bottom_bar'));

              /* Proload flights */
              self.prepareAncillariesStructure(step);
            }
          });
        }
        else {
          this.prepareAncillariesStructure(step);
        }

      }
      else { /* Download template and append it */
        /* Create new process page */
        var $newPage = $('<div class="process_page ancillaries"></div>');
        $newPage.addClass(mode);

        /* Get the structure template */
        Bus.publish('ajax', 'getTemplate', {
          data: {step: step},
          path: AirEuropaConfig.templates.ancillaries.structure,
          success: function(html) {
            /* Append the template to the new page */
            $newPage.append(html);
            $newPage.find('.process_wrapper_content').addClass('loading');

            /* Append the new page to the process */
            self.element.find('.process_page_wrapper').append($newPage);

            /* Proload flights */
            self.prepareAncillariesStructure(step);
          }
        });
      }
    },

    prepareAncillariesStructure: function(step) {
      var self = this;
      var offsetTop = this.element.find('.process_page.ancillaries').index() * 100 * -1;

      /* Check if the process_page_wrapper is already at 100%, so we don't need to animate it */
      if (this.element.find('.process_page_wrapper').attr('data-view') == 'ancillaries') {
        this.loadAncillaries(step);
      }
      else { /* Animate process wrapper to show the new page */
        this.element.find('.process_page_wrapper').animate({
          'top': offsetTop + '%'
        }, 500, 'easeInOutExpo', function() {
          self.loadAncillaries(step);
        });
      }
    },

    loadAncillaries: function(step) {
      var self = this;

      /* Add ancillaries view flag */
      this.element.find('.process_page_wrapper').attr('data-view', '').attr('data-view', 'ancillaries');

      /* Call to services */
      this.callToServices(step);

      /* Animate searching bar */
      this.element.find('.loading_topbar').not('.process_scroll .loading_topbar').animate({
        'margin-left': '0'
      }, 400, 'linear', function() {});

      this.element.find('.searching_bar').not('.process_scroll .searching_bar').animate({
        'width': '100%'
      }, 2000, 'easeInOutExpo', function() {
        /* Finished the load bar */
        self.finishedLoadingBar = true;

        /* Show blinking dot */
        self.element.find('.loading_content .spinner').show();
        self.element.find('.loading_content .text_spinner').show();

        if (self.finishedHtmlLoad && self.finishedLoadingBar) {
          self.finishedLoadingBar = false;
          self.appendAncillary(step);
        }
      });

    },

    callToServices: function(step) {
      var self = this;
      var jsonPath = getServiceURL('ancillaries.session');
      var templatePath = eval('AirEuropaConfig.templates.ancillaries.' + step);
      var ancillariesLuggageProcessURL = getProcessUrl('ancillaries_luggage');
      var ancillariesSeatsProcessURL = getProcessUrl('ancillaries_seats');
      var ancillariesPremiumSeatsProcessURL = getProcessUrl('ancillaries_premium');

      /* Call AJAX module to get the results json */
      Bus.publish('ajax', 'getJSON', {
        path: jsonPath,
        success: function(data) {
          if (data.ancillary) {
            data = data.ancillary;

            if (data.sessionId) {
              /* Save json data on cache */
              self.ancillaryCache = data;

              /* Load custom services and templates depending on the step */
              if (step == 'luggage') {
                /* Extra calcs fo baggage */
                $.each(self.ancillaryCache.ancillary.passengerBaggage, function(passengerIndex, passengerElement) {
                  var maxBaggageNumber = { ONEWAY: null, RETURNWAY: null };
                  var passengerType = (passengerElement.frequentFlyerLevel !== null && passengerElement.frequentFlyerLevel.skyTeamFrequentFlyerLevel == 'ELITE_PLUS') ? 'ELITE_PLUS' : passengerElement.type;

                  $.each(self.ancillaryCache.ancillary.journeyPassengerBaggageTypes, function(journeyPassengerBaggageIndex, journeyPassengerBaggageElement) {
                    var segmentType = journeyPassengerBaggageElement.segmentType;

                    $.each(journeyPassengerBaggageElement.passengerBaggageTypes, function(passengerBaggageIndex, passengerBaggageElement) {
                      if (passengerType == passengerBaggageElement.passengerType) {
                        maxBaggageNumber[segmentType] = passengerBaggageElement.maxBaggageNumber;
                      }
                    });
                  });

                  self.ancillaryCache.ancillary.passengerBaggage[passengerIndex].maxBaggageNumber = maxBaggageNumber;
                });

                self.loadAncillariesData(function() { /* Get lists */
                  self.getHelpdeskPhone(); /* Get helpdesk phone */
                  self.checkRestrictionsLuggageWarning();
                  /* Check journey segments are blocked for title */
                  self.checkJourneyTitle();

                  self.loadAncillaryTemplate(templatePath, step);
                });
              }
              else if (step == 'seats') {
                self.loadAncillariesData(function() { /* Get lists */
                  self.getHelpdeskPhone(); /* Get helpdesk phone */
                  self.checkWarning();
                  self.loadAncillaryTemplate(templatePath, step);
                });
              }
              else if (step == 'premium_seats') {
                self.loadAncillariesData(function() { /* Get lists */
                  self.getHelpdeskPhone(); /* Get helpdesk phone */
                  self.checkWarning();
                  self.loadAncillaryTemplate(templatePath, step);
                });
              }
              else if (step == "payment") {
                if (!data.passengerRelated) {
                  if (data.mode == 'luggage') {
                    Bus.publish('hash', 'change', {hash: ancillariesLuggageProcessURL + '/luggage'});
                  }
                  else if (data.mode == 'seats') {
                    Bus.publish('hash', 'change', {hash: ancillariesSeatsProcessURL + '/seats'});
                  }
                  else if (data.mode == 'premium_seats') {
                    Bus.publish('hash', 'change', {hash: ancillariesPremiumSeatsProcessURL + '/premium_seats'});
                  }
                }
                else {

                  /* Get payment methods */
                  self.loadAncillariesData(function() { /* Get lists */
                    var serviceName;

                    if (data.mode == 'luggage') {
                      serviceName = 'getExtraLuggagePaymentMethods';
                    }
                    else if (data.mode == 'seats') {
                      serviceName = 'getExtraSeatsPaymentMethods';
                    }
                    else if (data.mode == 'premium_seats') {
                      serviceName = 'getPremiumExtraSeatsPaymentMethods';
                    }

                    Bus.publish('services', serviceName, {
                      sessionId: data.sessionId,
                      success: function(paymentData) {
                        var isFree = false;

                        self.ancillaryCache['payment_methods'] = paymentData.body.data;

                        self.getHelpdeskPhone(); /* Get helpdesk phone */
                        self.loadAncillaryTemplate(templatePath, step);

                      }
                    });

                  });

                }
              }
              else if (step == "confirm") {
                self.getHelpdeskPhone(); /* Get helpdesk phone */
                self.loadAncillaryTemplate(templatePath, step);

                /* Send void ancillary session to clean the session */
                Bus.publish('ajax', 'postJson', {
                  path: getPostURL('ancillaries_luggage'),
                  data: {ancillary: {}},
                  success: function() {
                  }
                });
              }

              /* Update GTM */
              self.traceManager(step, self.ancillaryCache);

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

    traceManager: function(step, ancillaryCache){
      var self = this;

      var traceName = "anc_" + ancillaryCache.ancillary.type + "_" + step;

      /* Prepare flags for luggage for tag manager */
      var equipajeIda = false;
      var equipajeVuelta = false;

      if (ancillaryCache.passengerRelated && ancillaryCache.passengerRelated.passengerRelated){
        _.each(ancillaryCache.passengerRelated.passengerRelated, function(passengerRelated, index, list){
          _.each(passengerRelated.ancillaryBooking, function(ancillary, index, list){

            if ( ( ancillary.routeType == "RETURNWAY" )
              || ( ancillary.routeType == "ROUNDTRIP" )){
              equipajeVuelta = true;
            }

            if ( ( ancillary.routeType =='RETURNWAY' )
              || ( ancillary.routeType == "ONEWAY" )){
              equipajeIda = true;
            }

          });
        });
      }

      var numpax = 0;

      if (ancillaryCache.ancillary.passengerSeats) {
        if (ancillaryCache.mode == "seats" || ancillaryCache.mode == "premium_seats")
        {
          numpax = ancillaryCache.ancillary.passengerSeats.length;
        } else {
          numpax = ancillaryCache.ancillary.passengerBaggage.length;
        }
      }

      var lastReturnFlight = (ancillaryCache.journey.returnFlights) ? (ancillaryCache.journey.returnFlights.length - 1) : 0;
      var lastOutboundFlight = (ancillaryCache.journey.outboundFlights) ? (ancillaryCache.journey.outboundFlights.length - 1) : 0;

      updateGtm({
        'ow': (ancillaryCache.journey.returnFlights.length == 0) ? 'N' : 'S',
        'origen': ancillaryCache.journey.outboundFlights[0].airportDeparture.code,
        'destino': ancillaryCache.journey.outboundFlights[lastOutboundFlight].airportArrival.code,
        'fechaida': ancillaryCache.journey.outboundFlights[0].departureDate,
        'fecharegreso': (ancillaryCache.journey.returnFlights.length == 0) ? '' : ancillaryCache.journey.returnFlights[lastReturnFlight].departureDate,
        'numpax': numpax,

        'equipajeida': equipajeIda ? 'S' : 'N',
        'equipajevuelta': equipajeVuelta ? 'S' : 'N',

        'divisa': window.appConfig.currentCurrency.code || 'EUR',
        'mercado': window.market,
        'pageArea': 'Mis vuelos',
        'pageCategory': self.getPageCategory(traceName),
        'pageContent': self.getPageContent(traceName)
      });

    },

    getPageCategory: function(traceName){
      var result = '';
      switch (traceName) {
        case "anc_luggage":
          result = 'Ancillaries equipaje';
          break;
        case "anc_seats":
          result = 'Ancillaries asientos';
          break;
        case "anc_premium_seats":
          result = 'Ancillaries asientos PE';
          break;
      }

      return result;
    },

    getPageContent: function(traceName){
      var result = '';
      switch (traceName) {

        case "anc_luggage":
          result = 'Buscador equipaje';
          break;

        case "anc_seats":
          result = 'Buscador asientos';
          break;

        case "anc_premium_seats":
          result = 'Buscador asientos PE';
          break;

        case "anc_BAGGAGE_luggage":
          result = 'Selección de equipaje';
          break;

        case "anc_BAGGAGE_payment":
          result = 'Pago de equipajes';
          break;

        case "anc_BAGGAGE_confirm":
          result = 'Confirmación pago equipaje';
          break;

        case "anc_SEAT_seats":
          result = 'Selección de asientos por pasajero';
          break;

        case "anc_SEAT_payment":
          result = 'Pago de asientos';
          break;

        case "anc_SEAT_confirm":
          result = 'Confirmación pago de asientos';
          break;

        case "anc_PREMIUM_ECONOMY_premium_seats":
          result = 'Selección de asientos PE por pasajero';
          break;

        case "anc_PREMIUM_ECONOMY_payment":
          result = 'Pago de asientos PE';
          break;

        case "anc_PREMIUM_ECONOMY_confirm":
          result = 'Confirmación pago de asientos PE';
          break;

        default:
          result = 'extras';
      }

      return result;

    },

    getHelpdeskPhone: function() {
      var self = this;

      if (this.ancillaryPhoneCache == undefined) {
        Bus.publish('services', 'getHelpeskPhone', {
          success: function(data) {
            if (data) {
              self.ancillaryPhoneCache = data;
              self.ancillaryCache['helpedsk_phone'] = data;

              self.element.find('.helpdesk_phone').text(data);
            }
          }
        });
      }
      else {
        this.ancillaryCache['helpedsk_phone'] = self.ancillaryPhoneCache;
        this.element.find('.helpdesk_phone').text(self.ancillaryPhoneCache);
      }
    },

    loadAncillaryTemplate: function(templatePath, step) {
      var self = this;

      /* Get the template */
      Bus.publish('ajax', 'getTemplate', {
        path: templatePath,
        success: function(template) {
          self.finishedHtmlLoad = true;
          self.resultsTemplate = template;

          if (self.finishedHtmlLoad && self.finishedLoadingBar) {
            self.finishedHtmlLoad = false;
            self.appendAncillary(step);
          }
        }
      });
    },

    appendAncillary: function(step) {
      var self = this;
      var after, movingStepsPosition, newStepsPosition;
      var $process_scroll = self.element.find('.process_scroll');

      /* Render the template */
      var renderedHtml = self.resultsTemplate(self.ancillaryCache);
      var $renderedHtml = $(renderedHtml);

      /* Get the template partials */
      var $top_bar = $renderedHtml.find('.process_top_bar');
      var $step = $renderedHtml.find('.process_step');
      var $bottom_bar = $renderedHtml.find('.process_bottom_bar');
      var $currentStep = self.element.find('.process_step');
      var $prices = $renderedHtml.find('.process_content > .prices');

      /* Step stuff, get the new step number and the current one */
      var stepNumber = parseInt($step.attr('data-order'));
      var currentStepNumber = parseInt($currentStep.attr('data-order'));
      var showExitAnimation = false;
      var direction = 'top';

      /* 1) Bottom bar */

      /* Add the new class to change height and background color */
      self.element.find('.process_bottom_bar').removeClass('final normal').addClass($bottom_bar.attr('data-class'));

      /* Change bottom bar if it's defined */
      if ($bottom_bar.length > 0) {
        /* Destroy the content and put the new one */
        self.element.find('.process_bottom_bar .bottom_bar_content').hide();

        /* Append the new bar content */
        self.element.find('.process_bottom_bar').append($bottom_bar.find('.bottom_bar_content').hide().fadeIn());
      }
      else {
        self.element.find('.process_bottom_bar .bottom_bar_content.final').hide();
        self.element.find('.process_bottom_bar .bottom_bar_content').not('.final').fadeIn();
      }

      /* Update the status bar */
      self.element.find('.breadcrumb .steps li').removeClass('active done');
      self.element.find('.breadcrumb .steps .' + step).addClass('active');
      setTimeout(function(){
        self.element.find('.breadcrumb .steps .' + step).prevAll().addClass('done');
      },0);

      /* 2) Content step */

      /* Add a class to #ancillaries */
      self.element.find('#ancillaries').attr('class' ,'').addClass(step);

      /* Append prices block if it's not already loaded */
      if (self.element.find('.process_content > .prices').length == 0) {
        self.element.find('.process_content').append($prices);
      }

      /* Checkout content full flag */
      if ($renderedHtml.hasClass('full')) {
        self.element.find('.process_wrapper_content').addClass('full');
      }
      else {
        setTimeout(function() {
          self.element.find('.process_wrapper_content').removeClass('full');
        }, 500);
      }

      if (self.element.find('.process_step.' + step).length == 0) {

        /* Hide step to append it hidden */
        $step.hide();

        /* Figure out if the new step is after or before */
        after = (stepNumber > currentStepNumber);

        /* Append step - First load, no previous step loaded */
        if ($currentStep.length == 0) {
          self.element.find('.process_steps').append($step);
          showExitAnimation = false;
        }

        /* After first load */
        else {
          showExitAnimation = (self.element.find('.process_scroll').attr('data-exit-animation-shown') != 'true');
          if (after) {
            self.element.find('.process_steps').append($step);
            direction = 'top';
          }
          else {
            self.element.find('.process_steps').prepend($step);
            direction = 'bottom';
          }
        }

        /* Initialize steps widget */
        self.element.find('.process_scroll').steps();

        /* The user comes directly from URL change (broswer arrows or click on breadcrumb) so we have
        to show the exit animation of the current step. In the other case, the exit animation was shown
        in the submit event*/
        if (showExitAnimation) {

          self.element.find('.process_scroll').steps('showLoading', function() { /* Exit animation */

            /* 3) Top bar - Change the topbar when the plane bar is covering it */
            /* Add the new class to change height and background color */
            var topBarClassName = $top_bar.attr('data-class');
            self.element.find('.process_top_bar').removeClass('warning normal confirm').addClass(topBarClassName);

            /* Append top_bar if there's a new topbar in the incoming content */
            if ($top_bar.length > 0) {
              /* If there's no top bar, append the current one */
              if (self.element.find('.process_top_bar').length == 0) {
                self.element.find('.process_wrapper_content .process_scroll').prepend($top_bar);
              }
              /* If there's a top bar, check if it's new or already exists */
              else {
                if (self.element.find('.process_top_bar .top_bar_content.' + topBarClassName).length == 0) {
                  /* Destroy the content and put the new one */
                  self.element.find('.process_top_bar .top_bar_content').hide();

                  /* Append the new bar content */
                  self.element.find('.process_top_bar').append($top_bar.find('.top_bar_content'));
                }
                else {
                  /* Destroy the content and show the new one */
                  self.element.find('.process_top_bar .top_bar_content').hide();
                  self.element.find('.process_top_bar .top_bar_content.' + topBarClassName).show();
                }
              }
            }

            self.element.find('.process_scroll').steps('showNextStep', function() { /* Enter animation */
              /* Remove current step */
              $currentStep.remove();

              /* Fadeout the process_page_loading if it's visible */
            self.element.find('.loading_content').fadeOut(800, function() {
              self.element.find('.process_wrapper_content').removeClass('loading local_loading');
              self.element.find('.loading_content').attr('style', '');
            });

              /* Init ancillaries process */
              Bus.publish('ancillaries', 'custom_init');
            }, after, $step, $currentStep);
          }, direction);
        }
        /* The exit animation was shown in the submit event, so we just need to execute the enter
        animation for the next step */
        else {

          /* 3) Top bar - Change the topbar when the plane bar is covering it */
          /* Add the new class to change height and background color */
          var topBarClassName = $top_bar.attr('data-class');
          self.element.find('.process_top_bar').removeClass('warning normal confirm').addClass(topBarClassName);

          /* Append top_bar if there's a new topbar in the incoming content */
          if ($top_bar.length > 0) {
            /* If there's no top bar, append the current one */
            if (self.element.find('.process_top_bar').length == 0) {
              self.element.find('.process_wrapper_content .process_scroll').prepend($top_bar);
            }
            /* If there's a top bar, check if it's new or already exists */
            else {
              if (self.element.find('.process_top_bar .top_bar_content.' + topBarClassName).length == 0) {
                /* Destroy the content and put the new one */
                self.element.find('.process_top_bar .top_bar_content').hide();

                /* Append the new bar content */
                self.element.find('.process_top_bar').append($top_bar.find('.top_bar_content'));
              }
              else {
                /* Destroy the content and show the new one */
                self.element.find('.process_top_bar .top_bar_content').hide();
                self.element.find('.process_top_bar .top_bar_content.' + topBarClassName).show();
              }
            }
          }

          self.element.find('.process_scroll').steps('showNextStep', function() { /* Enter animation */
            /* Remove current step */
            $currentStep.remove();

            /* Fadeout the process_page_loading if it's visible */
            self.element.find('.loading_content').fadeOut(800, function() {
              self.element.find('.process_wrapper_content').removeClass('loading local_loading');
              self.element.find('.loading_content').attr('style', '');
            });

            /* Init ancillaries process */
            Bus.publish('ancillaries', 'custom_init');
          }, after, $step, $currentStep);
        }
      }

    },

    loadAncillariesData: function(callback) {
      var self = this;

      Bus.publish('services', 'getAncillariesLists', {
        preconditionDocsType: 'OTHERS',
        success: function(listsData) {
          self.ancillaryCache['services'] = listsData;
          callback();
        }
      });
    },

    checkWarning: function() {
      var showWarning = false;

      if (this.ancillaryCache.ancillary.passengerSeats) {
        $.each(this.ancillaryCache.ancillary.passengerSeats, function(passengerIndex, passenger) {
          if (passenger.reservedSeats.length > 0) {
            showWarning = true;
            return false;
          }
        });
      }
      else {
        showWarning = true;
      }

      this.ancillaryCache.showWarning = showWarning;
    },

    checkRestrictionsLuggageWarning: function(warningMessage) {
      var showRestrictionsWarning = false;

      if (this.ancillaryCache.ancillary.supportedFlights) {
        $.each(this.ancillaryCache.ancillary.supportedFlights, function(supportedFlightIndex, supportedFlight) {
          if (supportedFlight.blocked == true) {
            showRestrictionsWarning = true;
            warningMessage = supportedFlight.message;
            return false;
          }
        });
      }

      this.ancillaryCache.showRestrictionsWarning = showRestrictionsWarning;
      this.ancillaryCache.restrinctionsWarningMessage = warningMessage;
    },

    /* Check journey segments for top title */
    checkJourneyTitle: function() {
      var self = this;
      var outboundFlightsBoolean = false;
      var returnFlightsBoolean = false;

      if (self.ancillaryCache.ancillary.journeyPassengerBaggageTypes) {
        $.each(self.ancillaryCache.ancillary.journeyPassengerBaggageTypes, function(indexPrice, dataPrice){
          if (dataPrice.segmentType=='ROUNDTRIP' || dataPrice.segmentType=='ONEWAY') {
            if(self.ancillaryCache.journey.outboundFlights && self.ancillaryCache.journey.outboundFlights.length > 0) {
              outboundFlightsBoolean = true;
            }
          }
          if (dataPrice.segmentType=='RETURNWAY') {
            if (!outboundFlightsBoolean) {
              returnFlightsBoolean = true;
            }
          }
        });

        var titleJourney = [];
        if (outboundFlightsBoolean) {
          var tempData = {};
          tempData = self.ancillaryCache.journey.outboundFlights[0];
          tempData.airportArrival = self.ancillaryCache.journey.outboundFlights[(self.ancillaryCache.journey.outboundFlights.length)-1].airportArrival;
          titleJourney.push(tempData);
        } else if (returnFlightsBoolean) {
          var tempData = {};
          tempData = self.ancillaryCache.journey.returnFlights[0];
          tempData.airportArrival = self.ancillaryCache.journey.returnFlights[(self.ancillaryCache.journey.returnFlights.length)-1].airportArrival;
          titleJourney.push(tempData);
        }

        if (titleJourney.length > 0) {
          self.ancillaryCache.titleJourney = titleJourney;
        }
      }
    },
  };
});
