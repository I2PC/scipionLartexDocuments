Hydra.module.register('LoyaltyBookingsController', function (Bus, Module, ErrorHandler, Api) {
  return {

    selector: '#content.loyalty_bookings',
    element: undefined,
    defaultHashProcess: 'loyalty_bookings',
    moduleHashes: ['loyalty_bookings', 'loyalty_bookings_add'],
    currentHash: undefined,
    bookingData: undefined,
    cardsCache: {},
    bookingId: undefined,
   
    events: {
      'process': {
        'kill': function () {
          var newHash;
          if (this.element.length > 0) {

            newHash = '#/' + getProcessUrl(this.defaultHashProcess);

            if (this.currentHash) {
              newHash = this.currentHash;
            }

            window.location.hash = newHash;
          }
        }
      },
      'loyalty': {
        'show_my_bookings': function (oNotify) {
          this.showMyBookings();
        },
        'show_add_bookings': function(oNotify) {
          this.showAddBookings();
        },
        'show_booking_detail': function (oNotify) {
          if (oNotify.bookingId) {
            this.showBookingDetail(oNotify.bookingId);
          }
          else {
            /* @todo: Send to my booking home */
          }
        },
        'show_booking_detail_passengers': function(oNotify) {
          if (oNotify.bookingId) {
            this.showBookingPassengers(oNotify.bookingId);
          }
          else {
            /* @todo: Send to my booking home */
          }
        },
        'show_booking_detail_payment': function(oNotify) {
          if (oNotify.bookingId) {
            this.showBookingPayment(oNotify.bookingId);
          }
          else {
            /* @todo: Send to my booking home */
          }
        },
        'show_booking_detail_itemization': function(oNotify) {
          if (oNotify.bookingId) {
            this.showBookingItemization(oNotify.bookingId);
          }
          else {
            /* @todo: Send to my booking home */
          }
        },
        'show_booking_documentation': function (oNotify) {
          if (oNotify.bookingId) {
            this.showBookingDocumentation(oNotify.bookingId);
          }
          else {
            /* @todo: Send to my booking home */
          }
        },
        'show_booking_card': function (oNotify) {
          if (oNotify.bookingId) {
            this.showBookingCard(oNotify.bookingId);
          }
          else {
            /* @todo: Send to my booking home */
          }
        },
        'show_booking_flight': function (oNotify) {
          if (oNotify.bookingId) {
            this.showBookingFlight(oNotify.bookingId);
          }
          else {
            /* @todo: Send to my booking home */
          }
        },
        'getLoyaltyBookingData': function (oNotify) {
          oNotify.callback(this.bookingData);
        },
        'processFlight': function (oNotify) {
          oNotify.callback(this.processInfoFlight(oNotify.flight));
        },
        'getLoyaltyCardsData': function (oNotify) {
          oNotify.callback(this.cardsCache);
        },
        'getBookingId': function (oNotify) {
          oNotify.callback(this.bookingId);
        }
      }
    },

    init: function () {
      /* Save jquery object reference */
      this.element = $(this.selector);

      if (this.element.length > 0) {
        /* Launch default hash for this module */
        this.launchDefaultHash();

        /* Load default content on background if needed */
        this.loadDefaultContent();

        this.updateFollowingUsTwitterLoyalty();

        // Updating GTM
        updateGtm({
          'pageArea' : 'SUMA-logeado',
          'pageCategory' : 'mis-reservas'
        });
      }
    },

    //Function to check if customer is already following Twitter AirEuropa account.
    //It is used to check if customer swicthes following option in Twitter app during execution. 
    //It only works if page is reloaded.
    updateFollowingUsTwitterLoyalty: function(){

      //Data in JSImport
      if (executed){

        Bus.publish('services', 'followingUsTwitterLoyalty', {
            success: function (data) {
                //Data in JSImport
                following = data;

            }             
        });
      }

    },


    launchDefaultHash: function () {
      /* Get the default hash for this module */
      var defaultHash = getProcessUrl(this.defaultHashProcess);

      if (window.location.hash === '') {
        window.location.hash = '#/' + defaultHash;
      }
    },

    loadDefaultContent: function () {
      /* Loop over module hashes to figure out if the hash belongs to this module. If not, probably will be a process
       so we have to load on the background the default content */
      if (!this.checkHash(window.location.hash)) {
        this.showMyBookings();
      }
    },


    checkHash: function (hash) {
      var hashFound = false;

      _.each(this.moduleHashes, function (hashProcess) {
        var thisHash = getProcessUrl(hashProcess);

        if (hash.indexOf('#/' + thisHash) == 0) {
          hashFound = true;
        }
      });

      return hashFound;
    },

    startPromiseLoading: function () {
      var self = this;
      this.loadingPromise = $.Deferred();

      /* Show loading */
      self.element.addClass('loading');

      /* Start loading animation, it's in a setTimeout to fix the animation */
      setTimeout(function () {
        self.element.addClass('start_loading');
      }, 1);

      /* Reset scroll */
      $(window).scrollTop(0);

      /* Resolve the promise after animation */
      // setTimeout(function () {
        self.loadingPromise.resolve();
      // }, 2500);
    },

    resolvePromiseLoading: function () {
      var self = this;

      /* Fade out loading screen */
      this.element.addClass('loading_finished');

      /* After 500ms, reste all loading classes to get it ready for the next click */
      setTimeout(function () {
        self.element.removeClass('loading start_loading loading_finished');
      }, 500);
    },

    /* Control routes for each hash */

    showMyBookings: function (callback) {
      var self = this;
      var module = 'loyalty_bookings';
      var page = 'home';
      var templatePath = AirEuropaConfig.templates[module][page];

      /* Save current hash */
      if (this.checkHash(window.location.hash)) {
        this.currentHash = window.location.hash;
      }
      else {
        this.currentHash = '';
      }

      /* Security check: the functionality has to execute just for this selector + the user must be logged in */
      if (this.element.length > 0 && this.element.find('.content_wrapper').attr('data-page') !== page) {

        /* Start loading */
        this.startPromiseLoading();

        /* Call to service to get user bookings and exexute a callback */
        this.getMyBookings(function(data, checkinBookingsData) {
          /* Get info from json */
          var error = (data.header ? data.header.error : (data.error));
          var errorMessage = data.header.message;
          var processedBookingsData;
          var processedCheckinBokingsData;
          var mergedBookingsData;
          var checkinBookings = [];

          /* Asign bookings data in case the services doesn't return an error */
          if (!checkinBookingsData.header.error) {
            checkinBookings = checkinBookingsData.body.data;
          }

          /* Process bookings */
          if (!error && data.body && data.body.data) {
            processedBookingsData = self.processFlights(data.body.data, checkinBookings);
            processedCheckinBokingsData = self.processCheckinFlights(checkinBookings);

            mergedBookingsData = processedCheckinBokingsData.concat(processedBookingsData);

            self.bookingData = mergedBookingsData;
          }
          else {
            /* Show error dialog */
            self.element.ui_dialog({
              title: lang('general.error_title'),
              subtitle: errorMessage,
              error: false,
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

          /* Call to the change content function */
          self.changeContent(templatePath, mergedBookingsData, module, page, callback);

        });
      }
    },

    showAddBookings: function() {
      if (this.element.find('.add_booking').length === 0) {
        this.showMyBookings(function(finishLoadingCallback) {
          Bus.publish('loyalty_bookings', 'show_add_bookings_dialog', {callback: finishLoadingCallback});
        });
      }
      else {
        Bus.publish('loyalty_bookings', 'show_add_bookings_dialog');
      }
    },

    showBookingDetail: function (bookingId, callback) {
      var self = this;
      var module = 'loyalty_bookings';
      var page = 'booking_detail';
      var templatePath = AirEuropaConfig.templates[module][page];
      var data = {};
      var loyaltyBookingsURL = getProcessUrl('loyalty_bookings');

      /* Save current hash */
      if (this.checkHash(window.location.hash)) {
        this.currentHash = window.location.hash;
      }
      else {
        this.currentHash = '';
      }

      /* Security check: the functionality has to execute just for this selector + the user must be logged in */
      if (this.element.length > 0 && this.element.find('.content_wrapper').attr('data-page') !== page) {

        /* Start loading */
        this.startPromiseLoading();

        /* Call to my bookings cards service */
        this.getBookingDetails(bookingId, function(bookingData) {
          data = bookingData;

          if (bookingData.booking.checkInInformation.done) {
            var locator = bookingData.booking.locator;
            var surname = bookingData.passengers[0].surname;

            Bus.publish('services', 'getBookingCards', {
              cardsData: {
                locator: locator,
                surname: surname
              },
              success: function (response) {
                if (!response.header) {
	                response.header = {
	                  error: false,
	                  message: ''
	                }
	              }
	              if (!response.header.error) {
	                var bookingData = response;
	                self.processCards(response, function (cards) {
	                  data.cards = cards;

                    self.cardsCache = cards;
                    self.bookingId = bookingId;

                    Bus.publish('services', 'getBoardingPassTicket', {
                      locator: locator,
                      bookingData: bookingData,
                      userId: localStorage.ly_userId,
                      cards: cards,
                      success: function (response) {
                        var url = getServiceURL('loyalty_bookings.boardingpassticketpdf');

                        var locale = AirEuropaConfig.ajax.defaultParams.locale;
                        var market =  AirEuropaConfig.ajax.defaultParams.marketCode;

                        url = url.replace('{userId}', localStorage.ly_userId);
                        url = url.replace('{locator}', locator);
                        url = url.replace('{ticket}', response.body.data.ticket);

                        url = url + '?locale=' + locale + '&' + 'marketCode=' + market;

                        data.printerUrl = url;

                        self.changeContent(templatePath, data, module, page);
                      }
                    });

                  });
                }
                else {
                  /*booking_card no disponible*/
                  data.booking.checkInInformation.done = false;
                  data.cards =  null;

              	  /* Call to the change content function */
                  self.changeContent(templatePath, data, module, page);
                }
              }
            });
          } else {
        	  self.changeContent(templatePath, data, module, page);
          }
        });
      }
    },

    showBookingPassengers: function(bookingId) {
      if (this.element.find('#passengers').length === 0) {
        this.showBookingDetail(bookingId, function(finishLoadingCallback) {
          Bus.publish('loyalty_bookings', 'scroll_to_passengers', {callback: finishLoadingCallback});
        });
      }
      else {
        Bus.publish('loyalty_bookings', 'scroll_to_passengers');
      }
    },

    showBookingPayment: function(bookingId) {
      if (this.element.find('#payment_methods').length === 0) {
        this.showBookingDetail(bookingId, function(finishLoadingCallback) {
          Bus.publish('loyalty_bookings', 'scroll_to_payment', {callback: finishLoadingCallback});
        });
      }
      else {
        Bus.publish('loyalty_bookings', 'scroll_to_payment');
      }
    },

    showBookingItemization: function(bookingId) {
      if (this.element.find('#itemization').length === 0) {
        this.showBookingDetail(bookingId, function(finishLoadingCallback) {
          Bus.publish('loyalty_bookings', 'scroll_to_itemization', {callback: finishLoadingCallback});
        });
      }
      else {
        Bus.publish('loyalty_bookings', 'scroll_to_itemization');
      }
    },

    showBookingCard: function (bookingId) {
      var self = this;
      var module = 'loyalty_bookings';
      var page = 'booking_card';
      var templatePath = AirEuropaConfig.templates[module][page];
      var data = {};

      /* Save current hash */
      if (this.checkHash(window.location.hash)) {
        this.currentHash = window.location.hash;
      }
      else {
        this.currentHash = '';
      }

      /* Security check: the functionality has to execute just for this selector + the user must be logged in */
      if (this.element.length > 0 && this.element.find('.content_wrapper').attr('data-page') !== page) {

        /* Start loading */
        this.startPromiseLoading();

        /* Call to my bookings cards service */
        this.getBookingDetails(bookingId, function(bookingData) {
          data = bookingData;

          Bus.publish('services', 'getBookingCards', {
            locator: bookingData.booking.locator,
            success: function (response) {
              if (!response.header) {
                response.header = {
                  error: false,
                  message: ''
                }
              }
              if (!response.header.error) {
                var bookingData = response;
                self.processCards(response, function (cards) {
                  data.cards = cards;

                  self.cardsCache = cards;
                  self.bookingId = bookingId;

                  /* Call to the change content function */
                  self.changeContent(templatePath, data, module, page);
                });
              }
              else {
                self.resolvePromiseLoading();
                /* Send user back to bookings list */
                Bus.publish('hash', 'change', {hash: self.currentHash});
                /* Show error dialog */
                self.element.ui_dialog({
                  title: lang('general.error_title'),
                  subtitle: response.header.message,
                  error: true,
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
        });
      }
    },

    showBookingDocumentation: function (bookingId) {
      var self = this;
      var module = 'loyalty_bookings';
      var page = 'booking_documentation';
      var templatePath = AirEuropaConfig.templates[module][page];
      var data = {};

      /* Save current hash */
      if (this.checkHash(window.location.hash)) {
        this.currentHash = window.location.hash;
      }
      else {
        this.currentHash = '';
      }

      /* Security check: the functionality has to execute just for this selector + the user must be logged in */
      if (this.element.length > 0 && this.element.find('.content_wrapper').attr('data-page') !== page) {

        /* Start loading */
        this.startPromiseLoading();

        this.getBookingDetails(bookingId, function(bookingData) {
          data = bookingData;

          self.changeContent(templatePath, data, module, page);
        });

      }
    },

    showBookingFlight: function (bookingId) {
      var self = this;
      var module = 'loyalty_bookings';
      var page = 'booking_flight';
      var templatePath = AirEuropaConfig.templates[module][page];

      /* Save current hash */
      if (this.checkHash(window.location.hash)) {
        this.currentHash = window.location.hash;
      }
      else {
        this.currentHash = '';
      }

      /* Security check: the functionality has to execute just for this selector + the user must be logged in */
      if (this.element.length > 0 && this.element.find('.content_wrapper').attr('data-page') !== page) {

        /* Start loading */
        this.startPromiseLoading();

        this.getBookingDetails(bookingId, function(bookingData) {
          var flightCodes = [];

          data = bookingData;

          /* Extract flight codes from bookingData */
          _.each(bookingData.booking.journey.oneWayFlights, function(flight, index, list) {
            flightCodes.push({
              number: flight.number,
              dateDeparture: flight.dateDeparture,
              segmentId: flight.segmentId
            });
          });

          if (bookingData.booking.journey.returnFlights && bookingData.booking.journey.returnFlights.length > 0) {
            _.each(bookingData.booking.journey.returnFlights, function(flight, index, list) {
              flightCodes.push({
                number: flight.number,
                dateDeparture: flight.dateDeparture,
                segmentId: flight.segmentId
              });
            });
          }

          Bus.publish('services', 'getFlightInfoBatch', {
            flightCodes: flightCodes,
            success: function (response) {

              data.flightInfo = self.parseInfoFlights(response, data);

              self.changeContent(templatePath, data, module, page);
            }
          });

        });
      }
    },

    /* Main change content engine */

    changeContent: function (templatePath, data, module, page, callback) {
      var self = this;

      /* Get the structure template */
      Bus.publish('ajax', 'getTemplate', {
        path: templatePath,
        success: function (template) {

          /* Render the template */
          var renderedHtml = template(data);
          var $html = $(renderedHtml);

          /* Get the template partials */
          var $header = $html.find('.loyalty_header, .info_header');
          var $navBar = $html.find('.nav_bar');
          var $innerContent = $html.find('.inner_content');

          /* Get the current content */
          var $currentContent = self.element.find('.inner_content .inner_block_page');

          /* Clean the current content */
          self.element.find('.content_wrapper').empty();

          /* Append the structure */
          self.element.find('.content_wrapper').append($header);
          self.element.find('.content_wrapper').append($navBar);

          /* Check if the template has any .inner_block_page content, if it has content, use it, if not
           use the default html content if any */
          if ($innerContent.find('.inner_block_page_wrapper .inner_block_page').length > 0) {
            $currentContent.addClass('fallback');
          }

          $innerContent.find('.inner_block_page_wrapper').append($currentContent);

          /* Delete current content */
          self.element.find('.inner_content').remove();

          /* Append new inner content */
          self.element.find('.content_wrapper').append($innerContent);

          /* Save the data attribute */
          self.element.find('.content_wrapper').attr('data-page', page);

          /* Restart */
          Bus.publish('inner', 'custom_init');

          /* Init loyalty view process */
          Bus.publish(module, 'custom_init');

          /* Call to loyalty loaded event */
          Bus.publish('loyalty', 'loaded');

          /* Close navigation */
          var $header = self.element.closest('#wrapper').find('#header');
          $header.find('#subnav').removeClass('active').attr('style', '');
          $header.find('.panel.active').removeClass('active').attr('style', '');
          $header.find('#topbar .nav .main_nav li.active').removeClass('active');

          if (callback) {
            callback(function() {
              /* Hide loading screen */
              $.when(self.loadingPromise)
              .done(function () {
                self.resolvePromiseLoading();
              });

            });
          }
          else {
            /* Hide loading screen */
            $.when(self.loadingPromise)
            .done(function () {
              self.resolvePromiseLoading();
            });
          }
        }
      });

    },

    /* Helpers */

    getMyBookings: function(callback) {
      /* Call to my bookings service */
      Bus.publish('services', 'getBookings', {
        userId: localStorage.ly_userId,
        success: function (bookingsData) {

          /* Call to my bookings service */
          Bus.publish('services', 'getCheckinBookings', {
            userId: localStorage.ly_userId,
            success: function (checkinBookingsData) {
              callback(bookingsData, checkinBookingsData);
            }
          });
        }
      });
    },

    getBookingDetails: function(bookingId, callback) {
      var self = this;
      var loyaltyBookingsURL = getProcessUrl('loyalty_bookings');

      if (self.bookingData && self.bookingData.booking && self.bookingData.booking.bookingId && self.bookingData.booking.bookingId === bookingId) {
        callback(self.bookingData);
      }
      else {
        Bus.publish('services', 'getBookingDetail', {
          data: {
            userId: localStorage.ly_userId,
            bookingId: bookingId,
          },
          success: function (data) {

            /* Get info from json */
            var error = (data.header ? data.header.error : (data.error));
            var bookingData;

            /* Process bookings */
            if (!error && data.body && data.body.data && data.body.data.booking) {
              bookingData = data.body.data;
              bookingData.booking = self.processInfoFlight(bookingData.booking);
              bookingData.booking = self.buildDataForGraphic(bookingData.booking);

              /* Save the info in the object, so it can share it with other modules */
              self.bookingData = bookingData;
              console.log('self.bookingData', self.bookingData)
              callback(self.bookingData);
            }
            else {
              /* Show error dialog */
              self.element.ui_dialog({
                title: lang('general.error_title'),
                subtitle: lang('my_booking.detail_loading_error'),
                error: false,
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

              self.resolvePromiseLoading();

              /* Send user back to bookings list */
              Bus.publish('hash', 'change', {hash: loyaltyBookingsURL});
            }
          }
        });
      }
    },

    processCards: function (data, callback) {
      var self = this;
      var passengers = data.passengers;
      var boardingPass = [];

      _.each(data.flights, function (flight, index, list) {
        self.processPassengerCard(flight, passengers, function (cards) {
          boardingPass = boardingPass.concat(cards);
          if (index === (list.length - 1)) {
            callback(boardingPass);
          }
        });
      });
    },

    processFlights: function (bookingsData, checkinBookingsData) {
      var self = this;
      var checkinBookingIds = [];
      var newBookingsData = [];

      /* Prepare the checkin id bookings list */
      _.each(checkinBookingsData, function (booking, index, list) {
        checkinBookingIds.push(booking.bookingId);
      });

      /* Process each booking separately */
      _.each(bookingsData, function (booking, index, list) {
        /* Don't process the booking if it's already in the checkin list */
        if (_.contains(checkinBookingIds, booking.bookingId)) {
          return true;
        }

        /* Process the info */
        newBookingsData.push(self.processInfoFlight(booking));
      });

      return newBookingsData;
    },

    processCheckinFlights: function (bookingsCheckinData) {

      var self = this;

      _.each(bookingsCheckinData, function (booking, index, list) {
        booking = self.processInfoFlight(booking);

        booking.checkinStatus = {
          status: "OPEN"
        };
      });

      return bookingsCheckinData;
    },

    processInfoFlight: function (booking) {

      /* Process one way flights */
      booking.ow = this.buildFlightsInformation(booking.journey.oneWayFlights);

      /* Process return flights */
      if (booking.journey.returnFlights && booking.journey.returnFlights.length > 0) {
        booking.rt = this.buildFlightsInformation(booking.journey.returnFlights);
      }

      return booking;
    },

    /* Helpers */

    parseInfoFlights: function(data, bookingData) {
      var orderedData = [];
      var flightsToParse = bookingData.booking.journey.oneWayFlights;

      if (bookingData.booking.journey.returnFlights) {
        flightsToParse = flightsToParse.concat(bookingData.booking.journey.returnFlights);
      }

      $.each(flightsToParse, function(flightIndex, flight) {
        var segmentId = flight.segmentId;
        var originalDate;
        var flightFound = false;

        if (data[segmentId]) {
          originalDate = moment(data[segmentId].originalDateDeparture, 'DD/MM/YYYY HH:mm:ss').startOf('day');

          $.each(data[segmentId].infoFlightDetail, function(flightIndex, flight) {
            var flightDay = moment(flight.estimatedDepartureDate, 'DD/MM/YYYY HH:mm:ss').startOf('day');
            var className;

            /* Set other data as well */
            flight.aptDep = data[segmentId].aptDep;
            flight.aptArr = data[segmentId].aptArr;

            if (originalDate.diff(flightDay, 'days') === 0) {
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

              orderedData.push(flight);

              flightFound = true;
              return false;
            }

          });

        }

        if (!flightFound) {
          /* Set other data as well */

          orderedData.push({
            numFlight: flight.number,
            departureTime: '----',
            realDepartureTime: '----',
            arrivalTime: '----',
            realArrivalTime: '----',
            className: 'no_info_number',
            status: 'P',
            statusDescription: lang('flight_status.no_info'),
            aptDep: flight.airportDeparture,
            aptArr: flight.airportArrival,
            estimatedDepartureDate: flight.dateDeparture
          });

        }
      });

      // $.each(data, function(infoIndex, info) {
      //   var originalDate = moment(info.originalDateDeparture, 'DD/MM/YYYY HH:mm:ss').startOf('day');

      //   /* Loop over flights to calc hour data and status */
      //   $.each(info.infoFlightDetail, function(flightIndex, flight) {
      //     var className;

      //     var flightDay = moment(flight.estimatedDepartureDate, 'DD/MM/YYYY HH:mm:ss').startOf('day');

      //     flight.departureTime = moment(flight.estimatedDepartureDate, 'DD/MM/YYYY HH:mm:ss').format('HH:mm');
      //     flight.realDepartureTime = moment(flight.expectedDepartureDate, 'DD/MM/YYYY HH:mm:ss').format('HH:mm');

      //     flight.arrivalTime = moment(flight.estimatedArrivalDate, 'DD/MM/YYYY HH:mm:ss').format('HH:mm');
      //     flight.realArrivalTime = moment(flight.expectedArrivalDate, 'DD/MM/YYYY HH:mm:ss').format('HH:mm');

      //     /* Figure out the className depending on status */
      //     switch (flight.status) {
      //       case 'A':
      //         className = 'landed';
      //         break;
      //       case 'V':
      //         className = 'flying';
      //         break;
      //       case 'P':
      //         className = 'pending';
      //         break;
      //       case 'C':
      //         className = 'canceled';
      //         break;
      //       case 'R':
      //         className = 'delayed';
      //         break;
      //     }

      //     /* Set Cancelled hours to void */
      //     if (flight.status == 'C') {
      //       flight.departureTime = '----';
      //       flight.realDepartureTime = '----';
      //       flight.arrivalTime = '----';
      //       flight.realArrivalTime = '----';
      //     }

      //     /* Set className and description */
      //     flight.className = className;
      //     flight.statusDescription = lang('flight_status.' + className);

      //     /* Set other data as well */
      //     flight.aptDep = info.aptDep;
      //     flight.aptArr = info.aptArr;

      //     /* Order the flight into the proper array */
      //     if (originalDate.diff(flightDay, 'days') === 0) {
      //       orderedData.push(flight);
      //     }

      //   });

      // });

      return orderedData;
    },

    /* Process data received for a passenger in order to build a boarding pass (card) */

    processPassengerCard: function (flight, passengers, callback) {
      var self = this;
      var cards = [];
      var counter = 0;

      var departureLocalMoment = moment(flight.departure.date);
      var arrivalLocalMoment = moment(flight.arrival.date);
      var boardingLocalMoment = moment(flight.boarding.date);

      $.each(flight.passengers, function (passengerIndex, passenger) {
        var card = {};
        var infantPassenger = {};

        if (passenger.infant) {
          $.each(passengers, function (infantIndex, infantData) {
            if (passenger.infant.passengerId == infantData.id) {
              infantPassenger = infantData;
              return false;
            }
          });
        }

        var passengerId = passenger.passengerId;
        var passengerReference, passengerType, babyReference;

        passengerReference = self.getPassengerInfo(passengers, passengerId);

        /* Figure out passenger type */
        if (passenger.infant) {
          passengerType = 'adult_baby';
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
          company: flight.operatingCompany.description,
          code: flight.operatingCompany.code,
          number: flight.flightNumber
        };

        /* Departure */
        card.departure = {
          airportCode: flight.departure.airport.code,
          airportDescription: flight.departure.airport.description, //getAirportName(flight.departure.airport.code)
          date: flight.departure.date,
          dayOfMonth: departureLocalMoment.date(),
          month: lang('dates.monthsNames_' + departureLocalMoment.month()).substr(0, 3),
          hour: departureLocalMoment.format('HH:mm'),
          terminal: flight.departure.terminal
        };

        /* Arrival */
        card.arrival = {
          airportCode: flight.arrival.airport.code,
          airportDescription: flight.arrival.airport.description,
          date: flight.arrival.date,
          dayOfMonth: arrivalLocalMoment.date(),
          month: lang('dates.monthsNames_' + arrivalLocalMoment.month()).substr(0, 3),
          hour: arrivalLocalMoment.format('HH:mm'),
          terminal: flight.arrival.terminal
        };

        /* Boarding */
        card.boarding = {
          hour: boardingLocalMoment.format('HH:mm'),
          gate: flight.boardingGate,
          seat: passenger.seat.number + '' + passenger.seat.column
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
            special: null
          };

          /* Flight data */
          infantCard.flight = {
            company: flight.operatingCompany.description,
            code: flight.operatingCompany.code,
            number: flight.flightNumber
          };

          /* Departure */
          infantCard.departure = {
            airportCode: flight.departure.airport.code,
            airportDescription: flight.departure.airport.description, //getAirportName(flight.departure.airport.code)
            date: flight.departure.date,
            dayOfMonth: departureLocalMoment.date(),
            month: lang('dates.monthsNames_' + departureLocalMoment.month()).substr(0, 3),
            hour: departureLocalMoment.format('HH:mm'),
            terminal: flight.departure.terminal
          };

          /* Arrival */
          infantCard.arrival = {
            airportCode: flight.arrival.airport.code,
            airportDescription: flight.arrival.airport.description,
            date: flight.arrival.date,
            dayOfMonth: arrivalLocalMoment.date(),
            month: lang('dates.monthsNames_' + arrivalLocalMoment.month()).substr(0, 3),
            hour: arrivalLocalMoment.format('HH:mm'),
            terminal: flight.arrival.terminal
          };

          /* Boarding */
          infantCard.boarding = {
            hour: boardingLocalMoment.format('HH:mm'),
            gate: flight.boardingGate,
            seat: 'INF'
          };
          cards.push(infantCard);
          counter++;
        }

        if (passenger.qRCode) {
          Bus.publish('services', 'getLoyaltyQrCode', {
            qrCode: passenger.qRCode,
            success: function (dataImage) {
              if (dataImage) {
                card.qr = {
                  code: passenger.qRCode,
                  rawImage: "data:image/png;base64," + dataImage.replace(/"/g, '')
                };
              }

              cards.push(card);

              if (counter === (passengers.length) - 1) {
                callback(cards);
              }
              counter++;
            }
          });
        }
        else {
          cards.push(card);
          /* If counter is equal to passengers length, callback */
          // if (counter==(flight.passengers.length)-1) {
          if (counter === (passengers.length) - 1) {
            callback(cards);
          }
          counter++;
        }

      });
    },

    buildFlightsInformation: function (flights) {
      var dateHourFormat = 'DD-MM-YYYY HH:mm';
      var dateFormat = 'DD MMM YYYY';
      var hourFormat = 'HH:mm';

      var oneWayFlightsSortedByDate = _.sortBy(flights, function (flight) {
        return moment(flight.dateDeparture, dateHourFormat);
      });

      var firstFlight = oneWayFlightsSortedByDate[0];
      var firstFlightStatus = oneWayFlightsSortedByDate[0].flightStatus;
      var lastFlight = oneWayFlightsSortedByDate[oneWayFlightsSortedByDate.length - 1];
      var momentDateDeparture = moment(firstFlight.dateDeparture, dateHourFormat);
      var lastFlightDate = moment(lastFlight.dateArrival, dateHourFormat);

      return {
        date: momentDateDeparture.format(dateFormat),
        flight_number: firstFlight.companyCode + '' + firstFlight.number,
        departure_time: momentDateDeparture.format(hourFormat),
        arrival_time: lastFlightDate.format(hourFormat),
        flightStatus: firstFlightStatus
      };
    },

    buildDataForGraphic: function (booking) {
      var dateHourFormat = 'DD-MM-YYYY HH:mm';
      var dateFormat = 'dddd D MMMM';
      var langCode = window.langCode;
      if(langCode == 'br') {
    	  langCode = 'pt';
      } else if (langCode == 'be') {
    	  langCode = 'nl';
      }

      moment.lang(langCode);

      /* Get first flight departure and last flight arrival to calculate the gapArrival */
      var firstFlightDeparture = moment(booking.journey.oneWayFlights[0].gmtDateDeparture, dateHourFormat);
      var lastFlightArrival = moment(booking.journey.oneWayFlights[booking.journey.oneWayFlights.length - 1].gmtDateArrival, dateHourFormat);

      /* Calc the gap */
      var gapArrival = lastFlightArrival.diff(firstFlightDeparture, 'days');

      /* Calc the duration */
      var durationHours = lastFlightArrival.diff(firstFlightDeparture, 'hours');
      var durationMinutes = lastFlightArrival.diff(firstFlightDeparture, 'minutes') - (durationHours*60);
      var duration = "";
      if(durationHours > 0) {
    	  duration += durationHours + lang('my_bookings.hour_short');
      }
      if(durationMinutes > 0) {
    	  if(durationHours > 0) {
    		  duration += ' ';
    	  }
    	  duration += durationMinutes+"m";
      }

      /* Process ow flights */
      booking.journeys = {
        ow: {
          dateDeparture: moment(booking.journey.oneWayFlights[0].dateDeparture, dateHourFormat).format(dateFormat),
          fragments: this.convertFlights(booking.journey.oneWayFlights),
          gapArrival: gapArrival,
          transfers: (booking.journey.oneWayFlights.length - 1),
          duration: duration
        }
      };

      /* RT flights */
      if (booking.journey.returnFlights && booking.journey.returnFlights.length > 0) {

        /* Calc the gap for rt flights */
        firstFlightDeparture = moment(booking.journey.returnFlights[0].gmtDateDeparture, dateHourFormat);
        lastFlightArrival = moment(booking.journey.returnFlights[booking.journey.returnFlights.length - 1].gmtDateArrival, dateHourFormat);
        gapArrival = lastFlightArrival.diff(firstFlightDeparture, 'days');

        /* Calc the duration for rt flights */
        durationHours = lastFlightArrival.diff(firstFlightDeparture, 'hours');
        durationMinutes = lastFlightArrival.diff(firstFlightDeparture, 'minutes') - (durationHours*60);
        duration = "";
        if(durationHours > 0) {
      	  duration += durationHours + lang('my_bookings.hour_short');
        }
        if(durationMinutes > 0) {
      	  if(durationHours > 0) {
      		  duration += ' ';
      	  }
      	  duration += durationMinutes+"m";
        }

        /* Process rt flights */
        booking.journeys.rt = {
          dateDeparture: moment(booking.journey.returnFlights[0].dateDeparture, dateHourFormat).format(dateFormat),
          fragments: this.convertFlights(booking.journey.returnFlights),
          gapArrival: gapArrival,
          transfers: (booking.journey.returnFlights.length - 1),
          duration: duration
        }
      }

      return booking;
    },

    convertFlights: function (flights) {
      var dateHourFormat = 'DD-MM-YYYY HH:mm';
      var hourFormat = 'HH:mm';
      var convertedFlights = [];
      var firstFlightDeparture = moment(flights[0].dateDeparture, dateHourFormat);

      _.each(flights, function (flight, index, list) {
        var newTransfer;
        var nextFlightDeparture;
        var transferTotalMinutes;
        var transferTotalHours;
        var totalTimeString;

        /* Flight type */
        var momentGMTDeparture = moment(flight.gmtDateDeparture, dateHourFormat);
        var momentGMTArrival = moment(flight.gmtDateArrival, dateHourFormat);
        var momentDeparture = moment(flight.dateDeparture, dateHourFormat);
        var momentArrival = moment(flight.dateArrival, dateHourFormat);
        var totalMinutes = momentGMTArrival.diff(momentGMTDeparture, 'minutes');
        var momentDuration = moment.duration(totalMinutes, 'minutes');
        var duration = "";
        if(momentDuration.hours() > 0) {
      	  duration += momentDuration.hours() + lang('my_bookings.hour_short');
        }
        if(momentDuration.minutes() > 0) {
      	  if(momentDuration.hours() > 0) {
      		  duration += ' ';
      	  }
      	  duration += momentDuration.minutes()+"m";
        }
        var departureTime = momentDeparture.format(hourFormat);
        var arrivalTime = momentArrival.format(hourFormat);

        var newFlight = {
          type: "flight",
          totalMinutes: totalMinutes,
          duration: duration,
          operatedBy: flight.operator,
          flightStatus: flight.flightStatus,
          departure: {
            flightNumber: flight.companyCode + flight.number,
            code: flight.airportDeparture.code,
            description: flight.airportDeparture.description,
            airportType: flight.airportDeparture.type,
            time: departureTime,
            gap: momentDeparture.diff(firstFlightDeparture, 'days'),
            terminal: flight.terminalDeparture,
            boardingTime: null,
            gmtDateDeparture: flight.gmtDateDeparture,
            gmtDateArrival: null
          },
          arrival: {
            flightNumber: flight.companyCode + flight.number,
            code: flight.airportArrival.code,
            description: flight.airportArrival.description,
            airportType: flight.airportArrival.type,
            time: arrivalTime,
            gap: momentArrival.diff(firstFlightDeparture, 'days'),
            terminal: flight.terminalArrival,
            boardingTime: null,
            gmtDateDeparture: null,
            gmtDateArrival: flight.gmtDateArrival
          },
          dateDeparture: flight.dateDeparture,
          dateArrival: flight.dateArrival,
          floteCode: flight.floteCode,
          floteDescription: flight.floteDescription
        };

        /* Save the current flight */
        convertedFlights.push(newFlight);

        /* If there are more flights, should be a transfer as a fragment */
        if (list[index + 1]) {

          /* Get the difference between next flight departure and this flight arrival */
          nextFlightDeparture = moment(list[index + 1].gmtDateDeparture, dateHourFormat);
          transferTotalMinutes = nextFlightDeparture.diff(momentGMTArrival, 'minutes');
          transferTotalHours = nextFlightDeparture.diff(momentGMTArrival, 'hours');
          if(transferTotalHours != 0) {
        	  totalTimeString = transferTotalHours + lang('my_bookings.hour_short');
          }
          if((transferTotalMinutes - (transferTotalHours * 60)) != 0) {
        	  if(transferTotalHours != 0) {
        		  totalTimeString += ' ';
        	  }
        	  totalTimeString += (transferTotalMinutes - (transferTotalHours * 60)) + "m";
          }

          newTransfer = {
            type: "transfer",
            totalMinutes: transferTotalMinutes,
            transferAirportCode: flight.airportArrival.code,
            transferAirportDescription: flight.airportArrival.description,
            totalTimeString: totalTimeString
          };

          convertedFlights.push(newTransfer);
        }
      });

      return convertedFlights;
    },

    getPassengerInfo: function (passengers, id) {
      var passengerReference;

      $.each(passengers, function (globalPassengerIndex, globalPassenger) {
        if (globalPassenger.id === id) {
          passengerReference = globalPassenger;
          return false;
        }
      });

      return passengerReference;
    }

  };
});
