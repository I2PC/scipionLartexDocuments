Hydra.module.register('FlightInfoController', function(Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#process',
    element: undefined,

    /* Results helpers */
    finishedLoadingBar: false,
    finishedHtmlLoad: false,

    /* Results cache */
    resultsData: undefined, /* Cache the last data results */
    resultsTemplate: undefined, /* Cache the last template results */

    events: {
      'process': {
        'show_info': function(oNotify) {
          this.showInfo();
        },
        'show_info_details': function(oNotify) {
          var mode = 'route';

          if (oNotify.flight) {
            mode = 'flight_number';
          }

          this.showInfoDetails(mode, oNotify);
        }
      }
    },

    init: function() {
      /* Save jquery object reference */
      this.element = $(this.selector);
    },

    /* Info flight */

    showInfo: function() {
      var self = this;

      /* Call info airports */
      this.getAirportsData();

      /* Prepare the process */
      Bus.publish('process', 'start', {process: 'info', screenName: 'form'});

      /* Make the search form active */
      this.element.find('.search_form[data-process-name=info]').addClass('active');

      /* Make the search visible */
      this.element.find('#search').addClass('visible');

      /* Show form title */
      this.element.find('.search_form[data-process-name=info]').find('.search_form_title').show();

      /* Make the search visible */
      setTimeout(function() { /* Needed because the transition callback doesn't fire properly on webkit */
        $('body').addClass('processing');
        self.element.find('#search').addClass('finished');
      }, 400);

      /* Activate links */
      $('a[data-process=info]').closest('p, li').addClass('active');

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
          self.element.find('.process_page.info').remove();
        });
      }

      /* Update Google Tag Manager */
      updateGtm({
        'mercado': window.market,
        'pageArea': 'Mis vuelos',
        'pageCategory': 'Buscador',
        'pageContent': 'Localizador de vuelo'
      });
    },

    getAirportsData: function() {
      /* Call to info from airports  */
      if (window.airportsInfo['from'].length <= 0) {
        Bus.publish('ajax', 'getFromService', {
          path: getServiceURL('info.origin'),
          success: function(data) {
            if (!data.header.error) {
                var response = data.body.data;
                  $.each(response, function (index, airport) {
                  airport.metadata = airport.description;
                  if (airport.country)
                  airport.metadata = airport.country.description + ' ' + airport.metadata;
                });

              /* Cache de response */
              window.airportsInfo['from'] = response;

              /* Trigger airports from need_data event, so they can fill their content */
              $('form.info_form .airports .airport.from').trigger('need_data');
            }
            else {
              /* Show message error */
              $('body').ui_dialog({
                title: lang('general.error_title'),
                error: true,
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
            }
          }
        });
      }
    },

    showInfoDetails: function(mode, params) {
      var self = this;

      /* Prepare the process */
      Bus.publish('process', 'start', {process: 'info', screenName: 'results'});

      /* Reset loading control vars */
      this.finishedLoadingBar = false;
      this.finishedHtmlLoad = false;

      /* First time showing checkout, so create the new page and move the wrapper */
      if (this.element.find('#info').length == 0) {
        /* Create new process page */
        var $newPage = $('<div class="process_page info"></div>');
        $newPage.addClass(mode);

        /* Get the structure template: mini_search + loading */
        Bus.publish('ajax', 'getTemplate', {
          path: AirEuropaConfig.templates.info.structure,
          success: function(html) {
            /* Append the template to the new page */
            $newPage.append(html);

            /* Append the new page to the process */
            self.element.find('.process_page_wrapper').append($newPage);

            /* Preload flights */
            self.element.find('.process_wrapper_content').addClass('loading');
            self.prepareInfoStructure(mode, params);
          }
        });
      }
      /* The info page already exists, so move the process */
      else {
        this.element.find('.process_page.info .process_wrapper_content').addClass('loading');
        this.prepareInfoStructure(mode, params);
      }

    },

    prepareInfoStructure: function(mode, params) {
      var self = this;
      var offsetTop = this.element.find('.process_page.info').index() * 100 * -1;

      /* Check if the process_page_wrapper is already at 100%, so we don't need to animate it */
      if (this.element.find('.process_page_wrapper').attr('data-view') == 'info') {
        this.loadInfo(mode, params);
      }
      else { /* Animate process wrapper to show the new page */
        this.element.find('.process_page_wrapper').animate({
          'top': offsetTop + '%'
        }, 500, 'easeInOutExpo', function() {
          self.loadInfo(mode, params);
        });
      }
    },

    loadInfo: function(mode, params) {
      var self = this;

      /* Add ancillaries view flag */
      this.element.find('.process_page_wrapper').attr('data-view', '').attr('data-view', 'ancillaries');

      /* Call to services */
      this.callToServices(mode, params);

      /* Animate searching bar */
      this.element.find('.loading_topbar').animate({
        'margin-left': '0'
      }, 400, 'linear', function() {});

      this.element.find('.searching_bar').animate({
        'width': '100%'
      }, 2000, 'easeInOutExpo', function() {
        /* Finished the load bar */
        self.finishedLoadingBar = true;

        /* Show blinking dot */
        self.element.find('.loading_content .spinner').show();
        self.element.find('.loading_content .text_spinner').show();

        if (self.finishedHtmlLoad && self.finishedLoadingBar) {
          self.appendInfoFlights(mode, params);
        }
      });
    },

    callToServices: function(mode, params) {
      var self = this;
      var templatePath = eval('AirEuropaConfig.templates.info.details');

      this.getHelpdeskPhone(); /* Get helpdesk phone */

      /* Call AJAX module to get the results json */
      Bus.publish('services', 'getFlightInfo', {
        mode: mode,
        data: params,
        success: function(data) {
          if (data.header.error != true && data.body.data.infoFlightDetail.length > 0) {
            data = self.parseInfoFlights(data.body.data, mode, params);

            self.resultsData = data;

            /* Get the template */
            Bus.publish('ajax', 'getTemplate', {
              path: templatePath,
              success: function(template) {
                self.finishedHtmlLoad = true;
                self.resultsTemplate = template;

                if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                  self.appendInfoFlights(mode, params);
                }

                /* Update GTM */
                updateGtm({
                   'origen': self.resultsData.aptDep.code,
                   'destino': self.resultsData.aptArr.code,
                   'mercado': window.market,
                   'pageArea': 'Mis vuelos',
                   'pageCategory': 'Listado de vuelos',
                   'pageContent': 'Detalle de info vuelo'
                });

              }
            });
          }
          else {
            if (data.header.code == 5003) { /* Stopped service error */
              /* Show error for flight number search */
              self.element.find('#flight_info').ui_dialog({
                title: lang('general.no_info_title'),
                subtitle: data.header.message,
                close: {
                  behaviour: 'url',
                  href: '#'
                },
                buttons: [
                {
                  className: 'url',
                  href: '#',
                  label: lang('general.go_to_home')
                }
                ]
              });
            }
            else { /* Error for no availability */
              if (mode == 'flight_number') {
                /* Popup error for flight number search */
                self.element.find('#flight_info').ui_dialog({
                  title: lang('general.error_title'),
                  subtitle: lang('general.no_info_flight_dialog').replace('{flight_number}', params.flight),
                  close: {
                    behaviour: 'url',
                    href: '#'
                  },
                  buttons: [
                    {
                      className: 'url',
                      href: '#',
                      label: lang('general.go_to_home')
                    },
                    {
                      className: 'url',
                      href: '#/' + getProcessUrl('info'),
                      label: lang('general.back_to_search')
                    }
                  ]
                });
              }
              else {
                /* Popup error for route search */
                self.element.find('#flight_info').ui_dialog({
                  title: lang('general.no_info_title'),
                  subtitle: lang('general.no_info_route_dialog').replace('{departure}', params.from).replace('{arrival}', params.to),
                  close: {
                    behaviour: 'url',
                    href: '#'
                  },
                  buttons: [
                    {
                      className: 'url',
                      href: '#',
                      label: lang('general.go_to_home')
                    },
                    {
                      className: 'url',
                      href: '#/' + getProcessUrl('info'),
                      label: lang('general.back_to_search')
                    }
                  ]
                });
              }
            }
          }
        }
      });
    },

    getHelpdeskPhone: function() {
      var self = this;

      if (this.checkoutPhoneCache == undefined) {
        Bus.publish('services', 'getHelpeskPhone', {
          success: function(data) {
            if (data) {
              self.checkoutPhoneCache = data;

              self.element.find('.helpdesk_phone').text(data);
            }
          }
        });
      }
      else {
        this.element.find('.helpdesk_phone').text(self.checkoutPhoneCache);
      }
    },

    appendInfoFlights: function(mode, params) {
      var self = this;
      var after, movingStepsPosition, newStepsPosition;
      var $process_scroll = this.element.find('.process_scroll');

      /* Render the template */
      var renderedHtml = this.resultsTemplate(this.resultsData);
      var $renderedHtml = $(renderedHtml)

      /* Get the template partials */
      var $top_bar = $renderedHtml.find('.process_top_bar');
      var $step = $renderedHtml.find('.process_step');

      /* 1) Top bar */
      /* Add the new class to change height and background color */
      var topBarClassName = $top_bar.attr('data-class');
      this.element.find('.process_top_bar').removeClass('warning normal confirm').addClass(topBarClassName);

      /* Append top_bar if there's a new topbar in the incoming content */
      if ($top_bar.length > 0) {
        /* If there's no top bar, append the current one */
        if (this.element.find('.process_top_bar').length == 0) {
          this.element.find('.process_wrapper_content .process_scroll').prepend($top_bar);
        }
        /* If there's a top bar, check if it's new or already exists */
        else {
          if (this.element.find('.process_top_bar .top_bar_content.' + topBarClassName).length == 0) {
            /* Destroy the content and put the new one */
            this.element.find('.process_top_bar .top_bar_content').hide();

            /* Append the new bar content */
            this.element.find('.process_top_bar').append($top_bar.find('.top_bar_content').hide().fadeIn());
          }
          else {
            /* Destroy the content and show the new one */
            this.element.find('.process_top_bar .top_bar_content').hide();
            this.element.find('.process_top_bar .top_bar_content.' + topBarClassName).fadeIn()
          }
        }
      }

      /* 3) Content step */

      /* Add a class to #flight_info */
      this.element.find('#flight_info').attr('class' ,'').addClass(mode);

      /* If the element doesn't exist */
      //if (this.element.find('.process_step.flights').length == 0) {



        this.element.find('.process_steps').append($step);

        /* Hide loader */
        this.element.find('.loading_content').fadeOut(800, function() {
          self.element.find('.process_wrapper_content').removeClass('loading local_loading');
          self.element.find('.loading_content').attr('style', '');
        });

        /* Init flight_info process */
        Bus.publish('flight_info', 'custom_init');
      //}

    },

    /* Helpers */

    parseInfoFlights: function(data, mode, params) {
      var numbersFound = [];
      var orderedData = {
        infoFlightDetail: {
          yesterday: [],
          today: [],
          tomorrow: []
        }
      };

      var today = moment().startOf('day');

      /* Loop over flights to calc hour data and status */
      $.each(data.infoFlightDetail, function(flightIndex, flight) {
        var className;
        var flightDay = moment(flight.estimatedDepartureDate, 'DD/MM/YYYY HH:mm:ss').startOf('day');

        flight.departureTime = moment(flight.estimatedDepartureDate, 'DD/MM/YYYY HH:mm:ss').format('HH:mm');
        flight.realDepartureTime = moment(flight.expectedDepartureDate, 'DD/MM/YYYY HH:mm:ss').format('HH:mm');

        flight.arrivalTime = moment(flight.estimatedArrivalDate, 'DD/MM/YYYY HH:mm:ss').format('HH:mm');
        flight.realArrivalTime = moment(flight.expectedArrivalDate, 'DD/MM/YYYY HH:mm:ss').format('HH:mm');

        /* Figure out the className depending on status */
        switch (flight.status) {
          case 'A':
            className = 'landed';
            break;
          case 'V':
            className = 'flying';
            break;
          case 'P':
            className = 'pending';
            break;
          case 'C':
            className = 'canceled';
            break;
          case 'R':
            className = 'delayed';
            break;
        }

        /* Set Cancelled hours to void */
        if (flight.status == 'C') {
          flight.departureTime = '----';
          flight.realDepartureTime = '----';
          flight.arrivalTime = '----';
          flight.realArrivalTime = '----';
        }

        /* Set className and description */
        flight.className = className;
        flight.statusDescription = lang('flight_status.' + className);

        /* Cache flight number */
        numbersFound.push(flight.numFlight);

        /* Order the flight into the proper array */
        if (today.diff(flightDay, 'days') > 0) {
          orderedData.infoFlightDetail.yesterday.push(flight);
        }
        else if (today.diff(flightDay, 'days') < 0) {
          orderedData.infoFlightDetail.tomorrow.push(flight);
        }
        else {
          orderedData.infoFlightDetail.today.push(flight);
        }

      });

      /* Set other data as well */
      orderedData.aptDep = data.aptDep;
      orderedData.aptArr = data.aptArr;

      /* Only for flight number */
      if (mode == 'flight_number') {

        if (orderedData.infoFlightDetail.today.length == 0) {
          orderedData.infoFlightDetail.today.push({
            numFlight: params.flight,
            departureTime: '----',
            realDepartureTime: '----',
            arrivalTime: '----',
            realArrivalTime: '----',
            className: 'no_info_number',
            status: 'P',
            statusDescription: lang('flight_status.no_info')
          });
        }

        if (orderedData.infoFlightDetail.yesterday.length == 0) {
          orderedData.infoFlightDetail.yesterday.push({
            numFlight: params.flight,
            departureTime: '----',
            realDepartureTime: '----',
            arrivalTime: '----',
            realArrivalTime: '----',
            className: 'no_info_number',
            status: 'P',
            statusDescription: lang('flight_status.no_info')
          });
        }

        if (orderedData.infoFlightDetail.tomorrow.length == 0) {
          orderedData.infoFlightDetail.tomorrow.push({
            numFlight: params.flight,
            departureTime: '----',
            realDepartureTime: '----',
            arrivalTime: '----',
            realArrivalTime: '----',
            className: 'no_info_number',
            status: 'P',
            statusDescription: lang('flight_status.no_info')
          });
        }
      }

      else {

        if (orderedData.infoFlightDetail.today.length == 0) {
          orderedData.infoFlightDetail.today.push({
            numFlight: params.flight,
            departureTime: '----',
            realDepartureTime: '----',
            arrivalTime: '----',
            realArrivalTime: '----',
            className: 'no_info_route',
            status: 'P',
            statusDescription: lang('flight_status.no_info')
          });
        }

        if (orderedData.infoFlightDetail.yesterday.length == 0) {
          orderedData.infoFlightDetail.yesterday.push({
            numFlight: params.flight,
            departureTime: '----',
            realDepartureTime: '----',
            arrivalTime: '----',
            realArrivalTime: '----',
            className: 'no_info_route',
            status: 'P',
            statusDescription: lang('flight_status.no_info')
          });
        }

        if (orderedData.infoFlightDetail.tomorrow.length == 0) {
          orderedData.infoFlightDetail.tomorrow.push({
            numFlight: params.flight,
            departureTime: '----',
            realDepartureTime: '----',
            arrivalTime: '----',
            realArrivalTime: '----',
            className: 'no_info_route',
            status: 'P',
            statusDescription: lang('flight_status.no_info')
          });
        }

      }

      /* Message when there aren't flights in one day */

      return orderedData;
    }

  };
});