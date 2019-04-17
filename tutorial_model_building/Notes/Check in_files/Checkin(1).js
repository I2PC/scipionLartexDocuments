Hydra.module.register('CheckinController', function(Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#process',
    element: undefined,

    /* Results helpers */
    finishedLoadingBar: false,
    finishedHtmlLoad: false,

    /* Results cache */
    resultsData: undefined, /* Cache the last data results */
    resultsTemplate: undefined, /* Cache the last template results */

    /* Checkin cache */
    checkinCache: {},
    checkinPhoneCache: undefined,

    events: {
      'process': {
        'show_checkin': function(oNotify) {
          this.showCheckin();
        },
        'show_checkin_deeplink': function(oNotify) {
          this.showCheckinDeeplink(oNotify.locator, oNotify.surname);
        },
        'show_checkin_step': function(oNotify) {
          if (oNotify.step == 'flights' ||
              oNotify.step == 'passengers' ||
              oNotify.step == 'cards' ||
              oNotify.step == 'bookings') {
            this.showCheckinStep(oNotify.mode, oNotify.step);

            if (window.warningBookingIntervalId) {
              clearTimeout(window.warningBookingIntervalId);
            }
          }
        },
        'get_checkin_data': function(oNotify) {
          this.getCheckinData(oNotify.callback);
        },
        'init_passengers_step': function() {
          this.initPassengersStep();
        },
        'call_parse_checkin_flights': function(oNotify) {
          this.callParseCheckinFlights(oNotify.data, oNotify.callback);
        }
      }
    },

    init: function() {
      /* Save jquery object reference */
      this.element = $(this.selector);

    },

    getCheckinData: function(callback) {
      callback(this.checkinCache);
    },

    callParseCheckinFlights: function(data, callback) {
      callback(this.parseCheckinFlights(data));
    },

    initPassengersStep: function() {
      this.showCheckinStep();
    },

    /* Checkin process */

    showCheckin: function() {
      var self = this;
      var checkinProcessURL = getProcessUrl('checkin');

      if(User.isLoggedIn()){
        
        Bus.publish('hash', 'change', {hash: checkinProcessURL + "/bookings"});

      }else{

        /* Prepare the process */
      Bus.publish('process', 'start', {process: 'checkin', screenName: 'form'});

      /* Make the search form active */
      this.element.find('.search_form[data-process-name=recover]').addClass('active');

      /* Make the search visible */
      this.element.find('#search').addClass('visible');

      /* Make the search visible */
      setTimeout(function() { /* Needed because the transition callback doesn't fire properly on webkit */
        $('body').addClass('processing');
        self.element.find('#search').addClass('finished');
      }, 400);

      /* Show form title */
      this.element.find('.search_form[data-process-name=recover]').find('.search_form_title.checkin').show();

      /* Add the process start flag */
      this.element.find('.search_form[data-process-name=recover]').attr('data-process-start', 'checkin');

      /* Activate links */
      $('a[data-process=checkin]').closest('p, li').addClass('active');

      /* Append checkin close if it isn't defined */
      if (this.element.find('#search .search_form .close').length == 0) {
        this.element.find('#search .search_form').append('<div class="close"><p><a href="/"><span>Cerrar</span></a></p></div>');
      }

      /* If the user is viewing any processing level */
      if ($('body').hasClass('processing')) {
        /* Animate process wrapper to show the search */
        this.element.find('.process_page_wrapper').animate({
          'top': '0'
        }, 500, 'easeInOutExpo', function() {
          self.element.find('.process_page.checkin').remove();
        });
      }

      /* Update Google Tag Manager */
      updateGtm({
        'mercado': window.market,
        'pageArea': 'Mis vuelos',
        'pageCategory': 'Buscador Checkin',
        'pageContent': 'Localizar vuelo'
      });


      /* Capture my checking booking */
      this.element.find('.helper_message a').on('click', function(event) {
        event.preventDefault();

        var keepInSession = User.isLoggedIn();

        if (keepInSession){
          Bus.publish('hash', 'change', {hash: checkinProcessURL + '/bookings'});
        }
        else {
          self.element.find('.search_form[data-process-name=login]').removeClass('ly_ancillaries');
          self.element.find('.search_form[data-process-name=login]').addClass('ly_checkin');
          window.location.hash = '#/' + getProcessUrl('login');
        }

      });
      }

    },

    showCheckinDeeplink: function(locator, surname) {
      var self = this;

      /* Prepare the process */
      Bus.publish('process', 'start', {process: 'checkin', screenName: 'form'});

      /* Make the search form active */
      this.element.find('.search_form[data-process-name=recover]').addClass('active');

      /* Make the search visible */
      this.element.find('#search').addClass('visible');

      /* Make the search visible */
      setTimeout(function() { /* Needed because the transition callback doesn't fire properly on webkit */
        $('body').addClass('processing');
        self.element.find('#search').addClass('finished');
      }, 400);

      /* Show form title */
      this.element.find('.search_form[data-process-name=recover]').find('.search_form_title.checkin').show();

      /* Add the process start flag */
      this.element.find('.search_form[data-process-name=recover]').attr('data-process-start', 'checkin');

      /* Activate links */
      $('a[data-process=checkin]').closest('p, li').addClass('active');

      /* Append checkin close if it isn't defined */
      if (this.element.find('#search .search_form .close').length == 0) {
        this.element.find('#search .search_form').append('<div class="close"><p><a href="/"><span>Cerrar</span></a></p></div>');
      }

      /* If the user is viewing any processing level */
      if ($('body').hasClass('processing')) {
        /* Animate process wrapper to show the search */
        this.element.find('.process_page_wrapper').animate({
          'top': '0'
        }, 500, 'easeInOutExpo', function() {
          self.element.find('.process_page.checkin').remove();
        });
      }

      /* Update Google Tag Manager */
      updateGtm({
        'mercado': window.market,
        'pageArea': 'Mis vuelos',
        'pageCategory': 'Buscador Checkin',
        'pageContent': 'Localizar vuelo'
      });

      //add data form
      var $form = this.element.find('#search .search_form.active');

      $form.find('.reserve_field input').val(locator).trigger('validate');
      $form.find('.text_field input').val(surname).trigger('validate');

      //Submit form
      $('.search_form.active').find('form.checkin_form .submit_button button').click();

      },


    showCheckinStep: function(mode, step) {
      if (typeof(step)=='undefined') step = 'flights';
      var self = this;
      var dataToTemplate = {};

      /* Prepare the process */
      Bus.publish('process', 'start', {process: 'checkin', screenName: 'results'});

      /* Get mode of checkin structura, if is logged or not for breadcrumb links, specially first link (bookings - flights) */
      if (typeof mode!=='undefined') {
        dataToTemplate = {
          mode: mode
        };
      }

      /* If the page already exists from results page, don't need to create it */
      if (this.element.find('.process_page.checkin').length > 0) { /* Download template and append process_scroll and process_bottom_bar */

        if (this.element.find('.process_page.checkin .process_scroll').length == 0) {
          /* Get the structure template */
          Bus.publish('ajax', 'getTemplate', {
            data: dataToTemplate,
            path: AirEuropaConfig.templates.checkin.structure,


            success: function(html) {
              var $html = $(html);

              /* Append the new page to the process */
              self.element.find('.process_page.checkin .process_wrapper_content').append($html.find('.process_scroll'));
              self.element.find('.process_page.checkin .process_wrapper_content').append($html.find('.process_bottom_bar'));

              /* Proload flights */
              self.prepareCheckinStructure(step);
            }
          });
        }
        else {
          this.prepareCheckinStructure(step);
        }

      }
      else { /* Download template and append it */
        /* Create new process page */
        var $newPage = $('<div class="process_page checkin"></div>');

        /* Get the structure template */
        Bus.publish('ajax', 'getTemplate', {
          data: dataToTemplate,
          path: AirEuropaConfig.templates.checkin.structure,
          success: function(html) {
            /* Append the template to the new page */
            $newPage.append(html);
            $newPage.find('.process_wrapper_content').addClass('loading');

            /* Append the new page to the process */
            self.element.find('.process_page_wrapper').append($newPage);

            /* Proload flights */
            self.prepareCheckinStructure(step);
          }
        });
      }
    },

    prepareCheckinStructure: function(step) {
      var self = this;
      var offsetTop = this.element.find('.process_page.checkin').index() * 100 * -1;

      /* Check if the process_page_wrapper is already at 100%, so we don't need to animate it */
      if (this.element.find('.process_page_wrapper').attr('data-view') == 'checkin') {
        this.loadCheckin(step);
      }
      else {    	  
    	/* Animate process wrapper to show the new page */
        this.element.find('.process_page_wrapper').animate({
          'top': offsetTop + '%'
        }, 500, 'easeInOutExpo', function() {
          self.loadCheckin(step);
        });
      }
    },


    loadCheckinData: function(callback) {
      var self = this;

      Bus.publish('services', 'getCheckinLists', {
        success: function(listsData) {
          self.checkinCache['services'] = listsData;
          callback();
        }
      });
    },

    getHelpdeskPhone: function() {
      var self = this;

      if (this.ancillaryPhoneCache == undefined) {
        Bus.publish('services', 'getHelpeskPhone', {
          success: function(data) {
            if (data) {
              self.checkinPhoneCache = data;
              self.checkinCache['helpdesk_phone'] = data;

              self.element.find('.support dd').text(data);
            }
          }
        });
      }
      else {
        this.element.find('.support dd').text(self.checkinPhoneCache);
      }
    },


    loadCheckin: function(step) {
      var self = this;

      this.finishedHtmlLoad = false;
      this.finishedLoadingBar = false;

      /* Add checkin view flag */
      this.element.find('.process_page_wrapper').attr('data-view', '').attr('data-view', 'checkin');

      /* Call to services */
      this.callToServices(step);

      /* Global checkout warning booking listener */
      checkWarningBookingMessage(self.checkinCache.warningBookingLimit, lang('general.booking_limit_message_checkin'));

      /* Animate searching bar */
      self.element.find('.loading_topbar').not('.process_scroll .loading_topbar').animate({
        'margin-left': '0'
      }, 400, 'linear', function() {});

      self.element.find('.searching_bar').not('.process_scroll .searching_bar').animate({
        'width': '100%'
      }, 2000, 'easeInOutExpo', function() {

        /* Finished the load bar */
        self.finishedLoadingBar = true;

        /* Show blinking dot */
        self.element.find('.loading_content .spinner').show();
        self.element.find('.loading_content .text_spinner').show();

        if (self.finishedHtmlLoad && self.finishedLoadingBar) {
          self.finishedLoadingBar = false;
          self.appendCheckin(step);
        }
      });
    },

    callToServices: function(step) {
      var self = this;
      var jsonPath = getServiceURL('checkin.session');
      var templatePath = eval('AirEuropaConfig.templates.checkin.' + step);
      var temporalCheckinCacheServices = {};

      var userToken = User.isLoggedIn();

      /* Call AJAX module to get the results json */
      if (step!='bookings') {
        Bus.publish('ajax', 'getJSON', {
          path: jsonPath,
          success: function(data) {

            if (data) {

              /* Check data checkin parent object */
              if (data.checkin) {
                data = data.checkin;

                /* If there isn't a session */
                if (data.checkinId && step!='bookings') {

                  self.loadCheckinData(function(){

                    /* Cache services */
                    self.temporalCheckinCacheServices = self.checkinCache['services'];
                    self.checkinCache = data;

                    /* If there are results, ask for template */
                    if (data.passengers && data.flights) {

                      //self.getHelpdeskPhone(); /* Get helpdesk phone */
                      /* Order and calc flights */
                      if (step == 'flights') {
                        data = self.parseCheckinFlights(data);
                      }
                      else if (step == 'passengers') {
                        self.parsePassengers(data, function(response){
                          data = response;
                        });
                      }
                      else if (step == 'cards') {

                         //Check if customer is following us in Twitter in order to get flight notifications
                        self.updateFollowingUsTwitterCheckin();

                        self.parseCheckinCards(data, function(response){

                          /* Cache the data */
                          self.checkinCache = response;
                          self.checkinCache['services'] = self.temporalCheckinCacheServices;
                          //console.log('checkinCache', self.checkinCache);

                          Bus.publish('services', 'getBoardingPassPdfTicket', {
                            checkinId : self.checkinCache.checkinId,
                            checkinCache : self.checkinCache,
                            success: function(response){
                              //console.log('Response.ticket_number', response);
                              self.checkinCache.ticket = response.body.data.ticket;

                              var locale = AirEuropaConfig.ajax.defaultParams.locale;
                              var market =  AirEuropaConfig.ajax.defaultParams.marketCode;

                              var url = getServiceURL('checkin.boardingpass');
                              url = url.replace('{checkinId}', self.checkinCache.checkinId);
                              url = url.replace('{ticket}', self.checkinCache.ticket);

                              url = url + '?locale=' + locale + '&' + 'marketCode=' + market;

                              self.checkinCache.printerUrl = url;
                              
                              self.loadCheckinTemplate(templatePath, step); 
                              
                            }

                          });

                        });
                      }

                      /* If step is not equal to cards, because cards is final step and we have to wait callback function */
                      if (step != 'cards') {
                        /* Cache the data */
                        self.checkinCache = data;
                        self.checkinCache['services'] = self.temporalCheckinCacheServices;

                        self.loadCheckinTemplate(templatePath, step);
                      }

                    }

                    /* If there are no results, go back to the search */
                    else {
                      /* Back to search */
                      self.backToSearch();
                    }

                    //self.traceManager(step, self.checkinCache);

                    /* Update GTM */
                    if ( step == "flights"){

                      updateGtm({
                        'mercado': window.market,
                        'pageArea': 'Mis vuelos',
                        'pageCategory': 'Checkin',
                        'pageContent': 'Listado de vuelos'
                      });

                    }else if ( step == "passengers") {

                      updateGtm({
                         'origen': self.checkinCache.selectedFlight.departure.airport.code,
                         'destino': self.checkinCache.selectedFlight.arrival.airport.code,
                         'fechaida': self.checkinCache.selectedFlight.departureDate,
                         'numpax': self.checkinCache.selectedFlight.passengers.length,
                         'mercado': window.market,
                         'pageArea': 'Mis vuelos',
                         'pageCategory': 'Checkin',
                         'pageContent': 'Listado de pasajeros'
                      });

                    }else if ( step == "cards" ){

                      updateGtm({
                         'origen': self.checkinCache.selectedFlight.departure.airport.code,
                         'destino': self.checkinCache.selectedFlight.arrival.airport.code,
                         'fechaida': self.checkinCache.selectedFlight.departureDate,
                         'numpax': self.checkinCache.selectedFlight.passengers.length,
                         'mercado': window.market,
                         'pageArea': 'Mis vuelos',
                         'pageCategory': 'Checkin',
                         'pageContent': 'Tarjetas de embarque'
                      });

                    }

                  });

                } else {
                  if (step != 'bookings') {
                    /* Back to home */
                    Bus.publish('process', 'kill');
                  }
                  /* Set session object and call to bookings template */
                  else {
                    /* Calling to checkin booking */
                    self.startCheckinBooking(userToken, step);
                  }
                }

              }
              else {
                /* Calling to checkin booking */
                self.startCheckinBooking(userToken, step);
              }

            }
            else { /* If there is not data, kill proccesses and back to home */
              /* Calling to checkin booking */
              self.startCheckinBooking(userToken, step);
            }
          }
        });
      }
      else {
        /* Calling to checkin booking */
        self.startCheckinBooking(userToken, step);
      }
    },

    startCheckinBooking: function(userToken, step) {
      var self = this;

      if (userToken && step == 'bookings') {
          self.getBookingByUser(step);
        }
        else {
          /* Back to home */
          Bus.publish('process', 'kill');
        }
    },

    getBookingByUser: function(step) {
      var self = this;
      var templatePath = eval('AirEuropaConfig.templates.checkin.' + step);
      var userId = localStorage.ly_userId;

      /* Get bookings before call to services */
      Bus.publish('services', 'getBookingByUser', {
        userId: userId,
        success: function(data) {
          if (data.error) {
            $('#process').ui_dialog({
              title: lang('general.error_title'),
              error: true,
              subtitle: data.header.message, //data.error_description,
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
              ],
              render: function ($dialog) {

                    /* Buttons behaviour */
                    $dialog.find('.close a').on('click', function (event) {
                      event.preventDefault();
                      /* Back to home */
                       Bus.publish('process', 'kill');
                    });
                  }
            });
            /* Back to home */
            // Bus.publish('process', 'kill');
          }
          /* NO ERROR */
          else {
            if (data.body!=null) {
                self.checkinCache = data.body.data;
                self.loadCheckinTemplate(templatePath, step);
            }
            else {
              $('#process').ui_dialog({
                title: lang('general.error_title'),
                error: true,
                subtitle: lang('checkin_booking.no_bookings'),
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
                ],
                render: function ($dialog) {

                    /* Buttons behaviour */
                    $dialog.find('.close a').on('click', function (event) {
                      event.preventDefault();
                      /* Back to home */
                       Bus.publish('process', 'kill');
                    });
                  }
              });
              /* Back to home */
              // Bus.publish('process', 'kill');
            }
          }
        }
      });
    },

    //Load checkin template
    loadCheckinTemplate: function(templatePath, step) {
      var self = this;

      /* Get the template */
      Bus.publish('ajax', 'getTemplate', {
        path: templatePath,
        success: function(template) {
          self.finishedHtmlLoad = true;
          self.resultsTemplate = template;

          if (self.finishedHtmlLoad && self.finishedLoadingBar) {
            self.finishedHtmlLoad = false;
            self.appendCheckin(step);
          }
        }
      });
    },

    appendCheckin: function(step) {
      var self = this;
      var after, movingStepsPosition, newStepsPosition;
      var $process_scroll = self.element.find('.process_scroll');

      /* Render the template */
      var renderedHtml = self.resultsTemplate(self.checkinCache);
      var $renderedHtml = $(renderedHtml);

      /* Get the template partials */
      var $top_bar = $renderedHtml.find('.process_top_bar');
      var $step = $renderedHtml.find('.process_step');
      var $bookings_block = $renderedHtml.find('.bookings_block_add');
      var $bottom_bar = $renderedHtml.find('.process_bottom_bar');
      var $currentStep = self.element.find('.process_step');

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

      /* Add a class to #checkin */
      self.element.find('#checkin').attr('class' ,'').addClass(step);

      /* Checkin content full flag */
      if ($renderedHtml.hasClass('full')) {
        self.element.find('.process_wrapper_content').addClass('full');
      }
      else {
        setTimeout(function() {
          self.element.find('.process_wrapper_content').removeClass('full');
        }, 1520);

      }

      /* If the element doesn't exist */
      if (self.element.find('.process_step.' + step).length == 0) {

        /* Hide step to append it hidden */
        $step.hide();

        /* Figure out if the new step is after or before */
        after = (stepNumber > currentStepNumber);

        /* Append step - First load, no previous step loaded */
        if ($currentStep.length == 0) {
          self.element.find('.process_steps').append($step);
          showExitAnimation = false;
          if (step == 'bookings' && $('.bookings_block_add').length == 0) {
            self.element.find('.process_content').prepend($bookings_block);
          }
        }

        /* After first load */
        else {
          showExitAnimation = (self.element.find('.process_scroll').attr('data-exit-animation-shown') != 'true');
          if (after) {
            self.element.find('.process_steps').append($step);
            direction = 'top';          }
          else {
            $("div").remove(".bookings_block_add");
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
            self.element.find('.process_top_bar').removeClass('warning normal flights cards confirm').addClass(topBarClassName);

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

              if (step == 'bookings' && $('.bookings_block_add').length == 0) {
                self.element.find('.process_content').prepend($bookings_block);
              }

              /* Init checkin process */
              Bus.publish('checkin', 'custom_init');
            }, after, $step, $currentStep);
          }, direction);
        }
        /* The exit animation was shown in the submit event, so we just need to execute the enter
        animation for the next step */
        else {

          /* 3) Top bar - Change the topbar when the plane bar is covering it */
          /* Add the new class to change height and background color */
          var topBarClassName = $top_bar.attr('data-class');
          self.element.find('.process_top_bar').removeClass('warning normal flights cards confirm').addClass(topBarClassName);

          /* Append top_bar if there's a new topbar in the incoming content */
          if ($top_bar.length > 0) {
            /* If there's no top bar, append the current one */
            if (self.element.find('.process_top_bar').length == 0) {
              self.element.find('.process_wrapper_content .process_scroll').prepend($top_bar);
            }
            /* If there's a top bar, check if it's new or already exists */
            else {
              self.element.find('.process_top_bar .top_bar_content').remove();

              /* Append the new bar content */
              self.element.find('.process_top_bar').append($top_bar.find('.top_bar_content'));

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

            if (step == 'bookings' && $('.bookings_block_add').length == 0) {
              self.element.find('.process_content').prepend($bookings_block);
            }

            /* Init checkin process */
            Bus.publish('checkin', 'custom_init');
          }, after, $step, $currentStep);
        }

      }
    },

    parseCheckinFlights: function(data) {
      var orderedFlights = [];
      var byDate = {};
      var datesFound = [];

      data.numberOfFlights = data.flights.length;

      $.each(data.flights, function(index, flight) {
        var departureLocalHour = moment(flight.departure.date);
        var arrivalLocalHour = moment(flight.arrival.date);
        var departureUTCHour = moment.utc(flight.departure.utcDate);
        var arrivalUTCHour = moment.utc(flight.arrival.utcDate);
        var msDuration = arrivalUTCHour.diff(departureUTCHour);
        var duration = moment.duration(msDuration);
        var formattedDuration, formattedDeparture;

        /* Format date */
        formattedDeparture = lang('dates.dayNames_' + departureLocalHour.day()) + ' ' + departureLocalHour.date() + ' ' + lang('dates.monthsNames_' + departureLocalHour.month());
        flight.formattedDeparture = formattedDeparture;

        /* Calc flight duration */
        if (Math.floor(duration.asHours()) > 0) {
          formattedDuration =  Math.floor(duration.asHours()) + moment.utc(msDuration).format("[h]mm[m]");
        }
        else {
          formattedDuration = moment.utc(msDuration).format("mm[m]");
        }

        flight.duration = formattedDuration;

        /* Get local hour */
        flight.departure.localHour = departureLocalHour.format('HH:mm');
        flight.arrival.localHour = arrivalLocalHour.format('HH:mm');

        /* Calc days gap */
        flight.gap = arrivalLocalHour.diff(departureLocalHour, 'days');

        /* Group flights by date */
        /* If it's a new date */
        if ($.inArray(flight.departureDate, datesFound) < 0) {
          datesFound.push(flight.departureDate); /* Push the date to the found dates list */

          /* Create new by date object */
          byDate = {
            formattedDeparture: formattedDeparture,
            date: flight.departureDate,
            flights: [flight]
          };

          /* Append it to the cache data object */
          orderedFlights.push(byDate);

        }
        /* If it's an already used date */
        else {
          /* Loop the existing date to append the new flight there */
          $.each(orderedFlights, function(dateIndex, byDate) {
            if (byDate.date == flight.departureDate) {
              orderedFlights[dateIndex].flights.push(flight);
            }
          });
        }
      });

      /* Order main flights by date */
      orderedFlights.sort(function(a, b){
        var dateA = new Date(a.date).getTime();
        var dateB = new Date(b.date).getTime();
        return dateA > dateB ? 1 : -1;
      });

      data.orderedFlights = orderedFlights;

      return data;
    },

    /* Parsing passenger information and show in step */
    parsePassengers: function(data, callback) {
      var self = this;
      var selectedFlight = [];
      var selectedPassengers = [];
      var infantPassengerFinal = [];
      var preconditionDocsType = [];
      var counterDocsType = 0;

      $.each(data.flights, function(flightIndex, flight){
        /* Setting data of the selected flight */
        if (data.flightNumber==flight.flightNumber){
          selectedFlight = flight;
          /* Passengers data */
          $.each(flight.passengers, function(passengerIndex, passenger){
            if (passenger.infant) {
              $.each(data.passengers, function(passengerIndexInfant, infantPassenger){
                if (infantPassenger.id==passenger.infant.passengerId) {
                  infantPassengerFinal = infantPassenger;
                  return false;
                }
              });
              passenger.infantPassenger = infantPassengerFinal;
            }
            var passengerReference = self.getPassengerInfo(data.passengers, passenger.passengerId);
            selectedPassengers[passengerIndex] = {
              passenger: passengerReference,
              flightPassenger: passenger
            };
            if (passenger.emptyFields) {
              if (passenger.emptyFields.indexOf('NAME')!=-1 || passenger.emptyFields.indexOf('SURNAME')!=-1) {
                selectedPassengers[passengerIndex].flightPassenger.emptyNameOrSurname = true;
              } else {
                selectedPassengers[passengerIndex].flightPassenger.emptyNameOrSurname = false;
              }
              /* Set preconditionDocsType */
              if (passenger.emptyFields.indexOf('DOCUMENT')!=-1) {
                preconditionDocsType.push('SSR_DOCS');
              }
              if (passenger.emptyFields.indexOf('DOCUMENT_NI')!=-1) {
                preconditionDocsType.push('SSR_DOCS_EXCEPTION');
              }
            }
          });
          return false;
        }
      });

      data.selectedFlight = selectedFlight;
      data.selectedPassengers = selectedPassengers;

      data.lastFlightDeparture = moment(data.orderedFlights[0].flights[data.orderedFlights[0].flights.length-1].departureDate+' '+data.orderedFlights[0].flights[data.orderedFlights[0].flights.length-1].departure.localHour).format('DD-MM-YYYY hh:mm:ss');

      /* After parsing passenger, we have to set session before next step because seat map actions */
      var postSessionURL = getPostURL('checkin');
      var checkinSession = {};

      Bus.publish('ajax', 'postJson', {
        path: postSessionURL,
        data: {checkin: data},
        failure: function() {
          /* Session error */
          $('#checkin').ui_dialog({
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
        }
      });

      /* Get document types depends on emptyFields */
      if (preconditionDocsType.length > 0) {
        $.each(preconditionDocsType, function(index, value){
          Bus.publish('services', 'getDocumentType', {
            type: value,
            success: function(dataDocument) {
              self.checkinCache[value.toLowerCase()] = {};
              self.checkinCache[value.toLowerCase()] = dataDocument;
              counterDocsType++;
              if (counterDocsType==preconditionDocsType.length) {
                /* Callback to parent call */
                callback(data);
              }
            }
          });
        });
      }

    },

    parseCheckinCards: function(data, callback) {
      var self = this;
      var cards = [];

      /* Get selected flight from confirm checkin */
      $.each(data.confirm.flights, function(indexFlight, dataFlight){
        if (self.checkinCache.selectedFlight.flightNumber==dataFlight.flightNumber) {
          data.confirm.flights = dataFlight;
          return false;
        }
      });

      var departureLocalMoment = moment(data.confirm.flights.departure.date);
      var arrivalLocalMoment = moment(data.confirm.flights.arrival.date);
      var boardingLocalMoment = moment(data.confirm.flights.boarding.date);
      var counter = 0;
      var seatNumCol = '';
      var passengersLength = data.confirm.passengers.length;

      $.each(data.confirm.flights.passengers, function(passengerIndex, passenger) {
        var card = {};
        var infantPassenger = {};

        if (passenger.infant) {
          $.each(data.confirm.passengers, function(infantIndex, infantData){
            if (passenger.infant.passengerId==infantData.id){
              infantPassenger = infantData;
              return false;
            }
          });
        }

        var passengerId = passenger.passengerId;
        var passengerReference, passengerType, babyReference;

        /* Save a reference to the global passenger data */
        passengerReference = self.getPassengerInfo(data.confirm.passengers, passengerId);

        /* Figure out passenger type */
        if (passenger.infant) {
          passengerType = 'adult_baby';

          /* Get baby (infant) information */
          babyReference = self.getPassengerInfo(data.confirm.passengers, passenger.infant.passengerId);
        }
        else {
          passengerType = passengerReference.type.passengerType.toLowerCase();
        }

        /* Passenger name */
        card.passenger = {
          id: passengerReference.id,
          userFlightId: passenger.userFlightId,
          name: passengerReference.name,
          surname: passengerReference.surname,
          withBaby: (passenger.infant),
          baby: (babyReference) ? babyReference.name + ' ' + babyReference.surname : null,
          passengerType: passengerType,
          cabinClass: passenger.cabinClass.providerCode,
          special: {
            resident: passenger.resident,
            largeFamily: passenger.familyLarge,
            priority: passenger.passengerPriorityType,
            frequentFlyer: (passenger.frequentFlyer)
          }
        };

        /* Flight data */
        card.flight = {
          company: data.confirm.flights.operatingCompany.description,
          code: data.confirm.flights.operatingCompany.code,
          number: data.confirm.flights.flightNumber
        };

        /* Departure */
        card.departure = {
          airportCode: data.confirm.flights.departure.airport.code,
          airportDescription: data.confirm.flights.departure.airport.description, //getAirportName(data.confirm.flights.departure.airport.code)
          date: data.confirm.flights.departure.date,
          dayOfMonth: departureLocalMoment.date(),
          month: lang('dates.monthsNames_' + departureLocalMoment.month()).substr(0, 3),
          hour: departureLocalMoment.format('HH:mm'),
          terminal: data.confirm.flights.departure.terminal
        };

        /* Arrival */
        card.arrival = {
          airportCode: data.confirm.flights.arrival.airport.code,
          airportDescription: data.confirm.flights.arrival.airport.description,
          date: data.confirm.flights.arrival.date,
          dayOfMonth: arrivalLocalMoment.date(),
          month: lang('dates.monthsNames_' + arrivalLocalMoment.month()).substr(0, 3),
          hour: arrivalLocalMoment.format('HH:mm'),
          terminal: data.confirm.flights.arrival.terminal
        };

        /* Check if is ZED flight */
        seatNumCol = passenger.seat.number + '' + passenger.seat.column;
        if (passenger.seat.occupation && passenger.seat.occupation=='SPACE_AVAILABLE') {
          seatNumCol = passenger.seat.printText;
        }

        /* Boarding */
        card.boarding = {
          hour: boardingLocalMoment.format('HH:mm'),
          gate: data.confirm.flights.boardingGate,
          seat: seatNumCol
        };

        /* Add infant card if exists */
        if (passenger.infant) {
          var infantCard = {};
          /* Passenger name */
          infantCard.passenger = {
            id: infantPassenger.id,
            userFlightId: passenger.infant.userFlightId,
            name: infantPassenger.name,
            surname: infantPassenger.surname,
            withBaby: null,
            baby: null,
            passengerType: infantPassenger.type.passengerType.toLowerCase(),
            special: {
                resident: null,
                largeFamily: null,
                priority: passenger.infant.passengerPriorityType,
                frequentFlyer: null
            }
          };

          /* Flight data */
          infantCard.flight = {
            company: data.confirm.flights.operatingCompany.description,
            code: data.confirm.flights.operatingCompany.code,
            number: data.confirm.flights.flightNumber
          };

          /* Departure */
          infantCard.departure = {
            airportCode: data.confirm.flights.departure.airport.code,
            airportDescription: data.confirm.flights.departure.airport.description, //getAirportName(data.confirm.flights.departure.airport.code)
            date: data.confirm.flights.departure.date,
            dayOfMonth: departureLocalMoment.date(),
            month: lang('dates.monthsNames_' + departureLocalMoment.month()).substr(0, 3),
            hour: departureLocalMoment.format('HH:mm'),
            terminal: data.confirm.flights.departure.terminal
          };

          /* Arrival */
          infantCard.arrival = {
            airportCode: data.confirm.flights.arrival.airport.code,
            airportDescription: data.confirm.flights.arrival.airport.description,
            date: data.confirm.flights.arrival.date,
            dayOfMonth: arrivalLocalMoment.date(),
            month: lang('dates.monthsNames_' + arrivalLocalMoment.month()).substr(0, 3),
            hour: arrivalLocalMoment.format('HH:mm'),
            terminal: data.confirm.flights.arrival.terminal
          };

          /* Boarding */
          infantCard.boarding = {
            hour: boardingLocalMoment.format('HH:mm'),
            gate: data.confirm.flights.boardingGate,
            seat: 'INF'
          };
          cards.push(infantCard);
          counter++;
        }

        if (passenger.qRCode) {
          Bus.publish('services', 'getCheckinQrCode', {
            qrCode: passenger.qRCode,
            success: function(dataImage) {
              //Todo correcto
              if (dataImage) {
                card.qr = {
                  code: passenger.qRCode,
                  rawImage: "data:image/png;base64,"+dataImage.replace(/"/g, '')
                };
              }

              cards.push(card);
              /* If counter is equal to passengers length, callback */
              if (counter==(passengersLength-1)) {
                data.cards = cards;
                callback(data);
              }
              counter++;
            }
          });
        }
        else {
          cards.push(card);
          /* If counter is equal to passengers length, callback */
          if (counter==(passengersLength-1)) {
            data.cards = cards;
            callback(data);
          }
          counter++;
        }

      });

    },

    getPassengerInfo: function(passengers, id) {
      var passengerReference;

      $.each(passengers, function(globalPassengerIndex, globalPassenger) {
        if (globalPassenger.id == id) {
          passengerReference = globalPassenger;
          return false;
        }
      });

      return passengerReference;
    },


    //Function to check if customer is already following Twitter AirEuropa account.
    //It is used to check if customer swicthes following option in Twitter app during execution. 
    //It only works if page is reloaded.
    updateFollowingUsTwitterCheckin: function(){

      //Data in JSImport
      if (executed){

        Bus.publish('services', 'followingUsTwitterCheckin', {
            success: function (data) {
                //Data in JSImport
                following = data;

            }             
        });
      }

    },

    /* Remove server session object */
    removeServerSession: function(){
      var postSessionURL = getPostURL('checkin');
      var checkinSession = {};

      /* Post void checkinSession object */
      Bus.publish('ajax', 'postJson', {
        path: postSessionURL,
        data: {checkin: checkinSession},
        success: function() {}
      });
    }

  };
});