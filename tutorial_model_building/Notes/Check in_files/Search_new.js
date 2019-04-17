Hydra.module.register('SearchController', function(Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#process',
    element: undefined,

    /* Results helpers */
    finishedLoadingBar: false,
    finishedHtmlLoad: false,
    noResults: false,

    /* Results cache */
    resultsData: undefined, /* Cache the last data results */
    resultsTemplate: undefined, /* Cache the last template results */
    resultsParams: undefined, /* Cache the last search params results */
    templateData: undefined,
    results: {},

    events: {
      'process': {
        'show_search': function(oNotify) {
          this.showSearch(oNotify.from, oNotify.to);
        },
        'show_flights': function(oNotify) {
          this.showFlights(oNotify.params);
        },
        'get_results_data': function(oNotify) {
          this.getResultsData();
        },
        'clean_results_data': function(oNotify) {
          this.cleanResultsData();
        },
        'render_results': function(oNotify) {
          this.prepareResultsStructure(parseInt(oNotify.transferSelected));
        },
        'set_minisearch_default_values': function(oNotify) {
          this.prepareDefaultMinisearch();
        },
        'cleanResultsParams': function(oNotify){
          this.cleanResultsParams();
        }
      }
    },



    init: function() {
      /* Save jquery object reference */
      this.element = $(this.selector);
    },

    
    cleanResultsParams:function(){
      this.results.hash = '';
    },



    /*
     * Show search process.
     */
    showSearch: function(from, to) {
      var self = this;

      /* Prepare the process */
      Bus.publish('process', 'start', { process: 'search', screenName: 'form' });

      /* Make the search form active */
      this.element.find('.search_form[data-process-name=search]').addClass('active');

      /* Make the search visible */
      this.element.find('#search').addClass('visible');

      /* Show form title */
      this.element.find('.search_form[data-process-name=search]').find('.search_form_title').show();

      /* Make the search visible */
      setTimeout(function() { /* Needed because the transition callback doesn't fire properly on webkit */
        $('body').addClass('processing');
        self.element.find('#search').addClass('finished');
      }, 400);

      /* Activate links */
      $('a[data-process=search]').closest('p, li').addClass('active');

      /* Append search close if it isn't defined */
      if (this.element.find('#search .search_form .close').length == 0) {
        this.element.find('#search .search_form').append('<div class="close"><p><a href="/"><span>Cerrar</span></a></p></div>');
      }

      /* If the user is viewing any processing level */
      if ($('body').hasClass('processing')) {
        /* Animate process wrapper to show the search */
        this.element.find('.process_page_wrapper').addClass('animating_wrapper').animate({
          'top': '0'
        }, 500, 'easeInOutExpo', function() {
          self.element.find('.process_page_wrapper').removeClass('animating_wrapper');
          self.element.find('.process_page.results').remove();
          self.element.find('.process_page.checkout').remove();
        });
      }

      /* Update airports */
      Bus.publish('search', 'set_airports', {from: from, to: to});

      /* Update Google tag manager */
      updateGtm({
        'mercado': window.market,
        'pageArea': 'Comprar vuelos',
        'pageCategory': 'Buscador vuelos',
        'pageContent': 'Selección de trayecto'
      });
    },



    /*
     * Show flights process. Call availabiity service and show results data.
     */
    showFlights: function(params) {
      var self = this;

      /* Cache params */
      this.resultsParams = params;

      /* Prepare the process */
      Bus.publish('process', 'start', {process: 'search', screenName: 'results'});

      /* Make the search visible */
      this.element.find('#search').addClass('visible');

      /* Reset loading control vars */
      this.finishedLoadingBar = false;
      this.finishedHtmlLoad = false;

      /* First time showing results, so create the new page and move the wrapper */
      if (this.element.find('#results').length == 0) {
        /* Create new process page */
        var $newPage = $('<div class="process_page results"></div>');

        /* Get the structure template: mini_search + loading */
        Bus.publish('ajax', 'getTemplate', {
          path: AirEuropaConfig.templates.results.structure,
          success: function(html) {
            /* Append the template to the new page */
            $newPage.append(html);

            /* Append the new page to the process */
            if (self.element.find('.process_page.checkout').length > 0) { /* If users comes from checkout page, results have to be before that one */
              self.element.find('.process_page.checkout').before($newPage);

              var offsetTop = self.element.find('.process_page.checkout').index() * 100 * -1;
              self.element.find('.process_page_wrapper').css('top', offsetTop + '%');
            }
            else { /* If user comes from search screen, just append it at the end */
              self.element.find('.process_page_wrapper').append($newPage);
            }

            /* Proload flights */
            self.showCheckoutWarning();
          }
        });
      }
      /* The results page already exists, so move the process */
      else {
        this.showCheckoutWarning();
      }
    },



    /*
     * Show alert before cancel checkout.
     */
    showCheckoutWarning: function(transferSelected) {
      if (this.element.find('.process_page.checkout').length == 0) {
        /* We come from the normal workflow: from search or from the same results page in a minisearch submit or change */
        this.prepareResultsStructure();
      }
      else {
        /* We come from the checkout page, so first thing we need to do is show the checkout popup */
        this.initCancel();
      }
    },



    /*
     * Cancel checkout process.
     */
    initCancel: function() {
      var self = this;

      /* Show cancel window */
      this.element.find('.process_page.checkout .checkout_cancel').addClass('visible');

      /* Unbind previous click events */
      this.element.find('#checkout').off('click', '.checkout_cancel .close_dialog a, .checkout_cancel .close a');
      this.element.find('#checkout').off('click', '.checkout_cancel .cancel_process a');

      /* Buttons inside cancel windows */
      this.element.find('#checkout').on('click', '.checkout_cancel .close_dialog a, .checkout_cancel .close a', function(event) {
        event.preventDefault();

        /* Stay in checkout, set again the checkout URL */
        var step = self.element.find('#checkout .process_step').attr('data-step');
        var checkoutProcessURL = getProcessUrl('checkout');
        Bus.publish('hash', 'change', {hash: checkoutProcessURL + '/' + step });

        /* Hide cancel window */
        self.element.find('#checkout .checkout_cancel').removeClass('visible');

        /* Resign the cancel events */
        Bus.publish('checkout', 'init_cancel', {});
      });

      this.element.find('#checkout').on('click', '.checkout_cancel .cancel_process a', function(event) {
        event.preventDefault();

        /* Get vars */
        var postSessionURL = getPostURL('checkout');
        var checkoutSession = {};

        /* Remove intervalId of booking warning message */
        if (window.warningBookingIntervalId) {
          clearTimeout(window.warningBookingIntervalId);
        }

        /* Post void checkoutSession object */
        Bus.publish('ajax', 'postJson', {
          path: postSessionURL,
          data: {checkout: checkoutSession},
          success: function() {}
        });

        /* Go to results */
        self.prepareResultsStructure();
      });
    },



    /*
     * Prepare html structure.
     */
    prepareResultsStructure: function(numberOfScalesSelected) {
      var self = this;
      var params = this.resultsParams;
      var hash = params.airportDeparture + '-' +
                 params.airportArrival + '-' +
                 params.dateDeparture + '-' +
                 ((params.dateArrival) ? params.dateArrival : '0') + '-' +
                 params.paxAdult + '-' +
                 params.paxChild + '-' +
                 params.paxInfant + '-' +
                 params.colective + '-' +
                 ((params.paxAdultResident) ? params.paxAdultResident : '0') + '-' +
                 ((params.paxChildResident) ? params.paxChildResident : '0') + '-' +
                 ((params.paxInfantResident) ? params.paxInfantResident : '0');

        var intervalQuote = function(){
          
            setInterval(function() {
                var elt = $('.containerQuotes li.active');
                var nextelt;
                if (elt.is(":last-child")) nextelt = $('.containerQuotes li:first-child');
                else nextelt = elt.next();
                elt.removeClass('active');
                nextelt.addClass('active');
            
          }, 4000); 
        };
                  

      if (hash == this.results.hash) {
        /* Changing view, show local spinner */
        if (this.element.find('.process_wrapper_content .results_scroll .results_content').length > 0) {
          this.element.find('.process_wrapper_content').addClass('local_loading');

          /* Clean previous results and add loading class */
          this.element.find('.process_wrapper_content .results_scroll .results_content').fadeOut(500, function() {

            /* After fadeOut, remove the .results_content div */
            self.element.find('.process_wrapper_content .results_scroll .results_content').remove();

            /* Add loading classes */
            self.element.find('.process_wrapper_content').addClass('loading').removeClass('by_price by_hour by_matriz');
            self.element.find('.loading_content .text_spinner').hide();
            self.animateToProcessPage(numberOfScalesSelected);
          });
        } else {
          /* The results are cached so just show the spinner for a short time */
          // this.element.find('.loading_topbar').css('margin-left', '0');
          // this.element.find('.searching_bar').css('width', '100%');
          // this.element.find('.loading_content .spinner').show();
          // this.element.find('.loading_content .text_spinner').show();
          this.element.find('.loading_content.results_loader .ctn_slider_loading').fadeOut();
          clearInterval(intervalQuote);

          this.element.find('.process_wrapper_content').addClass('loading');
          this.animateToProcessPage(numberOfScalesSelected);
        }
      } else {
        /* Reset topbar values, so it can start the animation again */
        // this.element.find('.loading_topbar').css('margin-left', '-208px');
        // this.element.find('.searching_bar').css('width', '0');
        // this.element.find('.loading_content .spinner').hide();
        // this.element.find('.loading_content .text_spinner').hide();
        this.element.find('.loading_content.results_loader .ctn_slider_loading').fadeIn(1000);
        intervalQuote();


        /* Add loading classes */
        this.element.find('.process_wrapper_content').addClass('loading').removeClass('by_price by_hour by_matriz');

        /* Remove the current content and process */
        this.element.find('.process_wrapper_content .results_scroll .results_content').remove();
        this.animateToProcessPage(numberOfScalesSelected);
      }
    },



    /*
     * Animate page and load results
     */
    animateToProcessPage: function(numberOfScalesSelected) {
      var self = this;
      var offsetTop = this.element.find('.process_page.results').index() * 100 * -1;

      /* Prepare default info in mini_search */
      this.prepareDefaultMinisearch();

      /* Check if the process_page_wrapper is already at 100%, so we don't need to animate it */
      if (this.element.find('.process_page_wrapper').attr('data-view') == 'results') {
        this.loadResults(numberOfScalesSelected);
      }
      else { /* Animate process wrapper to show the new page */
        this.element.find('.process_page_wrapper').addClass('animating_wrapper').animate({
          'top':  offsetTop + '%'
        }, 500, 'easeInOutExpo', function() {
          self.element.find('.process_page_wrapper').removeClass('animating_wrapper');
          self.element.find('.process_page.checkout').remove();

          self.loadResults(numberOfScalesSelected);
        });
      }
    },



    /*
     * Call availability service or get cache results.
     */
    loadResults: function(numberOfScalesSelected) {
      var params = this.resultsParams;
      var self = this;
      var renderedHtml;
      var availabilityServiceUrl;
      var dataMessage = lang('general.error_message');
      var hash = params.airportDeparture + '-' +
                 params.airportArrival + '-' +
                 params.dateDeparture + '-' +
                 ((params.dateArrival) ? params.dateArrival : '0') + '-' +
                 params.paxAdult + '-' +
                 params.paxChild + '-' +
                 params.paxInfant + '-' +
                 params.colective + '-' +
                 ((params.paxAdultResident) ? params.paxAdultResident : '0') + '-' +
                 ((params.paxChildResident) ? params.paxChildResident : '0') + '-' +
                 ((params.paxInfantResident) ? params.paxInfantResident : '0') + '-' +
                 params.market + '-' +
                 params.lang;


      /* Reset noResults */
      self.noResults = false;

      /* Add checkout view flag */
      this.element.find('.process_page_wrapper').attr('data-view', '').attr('data-view', 'results');

      /* Check if search is coming from provider to get proper URL */
      if (params.channel){
          availabilityServiceUrl = getServiceURL('results.flights_provider').replace('{channel}', params.channel);
      }else{
          availabilityServiceUrl = getServiceURL('results.flights');
      }
      
//      availabilityServiceUrl = window.location.protocol + '//' + window.location.hostname + ':8680' + availabilityServiceUrl;


      /* If the results are already cached, show them directly from cache */
      if (hash == this.results.hash) {
        this.finishedLoadingBar = true; /* There's no loading bar, so finish it by code */
        this.prepareResultsHtml(this.results.data, numberOfScalesSelected);

        /* Update Google tag manager */
        updateGtm({
          'ow': (params.dateArrival != 'false') ? 'N' : 'S',
          'origen': params.airportDeparture,
          'destino': params.airportArrival,
          'fechaida': params.dateDeparture,
          'fecharegreso': (params.dateArrival != 'false') ? params.dateArrival : '',
          'residente': (params.paxAdultResident > 0) ? 'S' : 'N',
          'numpax': parseInt(params.paxAdult) + parseInt(params.paxChild) + parseInt(params.paxInfant) + parseInt(params.paxAdultResident) + parseInt(params.paxChildResident) + parseInt(params.paxInfantResident),
          'mercado': window.market,
          'pagina': 'availability',
          'pageArea': 'Comprar vuelos',
          'pageCategory': 'Buscador vuelos',
          'pageContent': 'Resultados de la búsqueda por horas',
          'firstView': 'hour'
        });
      }
      /* If results aren't cached, show loading and ask the service */
      else {
        /* Animate searching bar */
        this.element.find('.loading_topbar').animate({
          'margin-left': '0'
        }, 400, 'linear', function() {});

        self.element.find('.searching_bar').animate({
          'width': '100%'
        }, 2000, 'easeInOutExpo', function() {
          self.finishedLoadingBar = true;

          /* Show blinking dot */
          self.element.find('.loading_content .spinner').show();
          self.element.find('.loading_content .text_spinner').show();

          /* Results */
          if (self.noResults) {
            if (self.finishedLoadingBar && self.finishedHtmlLoad && self.noResults) {

              if (self.results.data.header && self.results.data.header.message) {
                dataMessage = self.results.data.header.message;
              }

              self.backToSearch(dataMessage);
            }
          }
          else {
            /* Update Google tag manager */
            updateGtm({
              'ow': (params.dateArrival != 'false') ? 'N' : 'S',
              'origen': params.airportDeparture,
              'destino': params.airportArrival,
              'fechaida': params.dateDeparture,
              'fecharegreso': (params.dateArrival != 'false') ? params.dateArrival : '',
              'residente': (params.paxAdultResident > 0) ? 'S' : 'N',
              'numpax': parseInt(params.paxAdult) + parseInt(params.paxChild) + parseInt(params.paxInfant) + parseInt(params.paxAdultResident) + parseInt(params.paxChildResident) + parseInt(params.paxInfantResident),
              'mercado': window.market,
              'pagina': 'availability',
              'pageArea': 'Comprar vuelos',
              'pageCategory': 'Buscador vuelos',
              'pageContent': 'Resultados de la búsqueda por horas',
              'firstView': 'hour'
            });

            /* See if the html is loaded */
            if (self.finishedLoadingBar && self.finishedHtmlLoad) {
              self.renderResults(numberOfScalesSelected);
              self.finishedLoadingBar = false;
            }
          }
        });

        /* Call AJAX module to get the results json */
        Bus.publish('ajax', 'getFromService', {
          path: availabilityServiceUrl,
          params: params,
          success: function(data) {
            /* Save this results on cache */
            self.results.hash = hash;
            self.results.data = data;

            self.prepareResultsHtml(data, numberOfScalesSelected);
          }
        });
      }
    },



    /*
     * Prepare results, and render it or back to search (if there's an error or there's no availability)
     */
    prepareResultsHtml: function(data, numberOfScalesSelected) {
      var self = this;
      var params = this.resultsParams;
      var templatePath = eval('AirEuropaConfig.templates.results.farefamily');
      var dataMessage = lang('general.error_message');
      var error = (data.header) ? data.header.error : false;

      if (error !== true) {

        /* Save the data on the module cache */
        self.resultsData = data;

        /* Get the template */
        Bus.publish('ajax', 'getTemplate', {
          path: templatePath,
          success: function(template) {
            self.resultsTemplate = template;

            /* See if the loading bar has finished it's animation */
            self.finishedHtmlLoad = true;

            if (self.finishedLoadingBar && self.finishedHtmlLoad) {
              self.renderResults(numberOfScalesSelected);
              self.finishedHtmlLoad = false;
            }
          }
        });

      } else {

        /* Is there's an error, back to search page */
        this.finishedHtmlLoad = true;
        this.noResults = true;

        if (data.header && (data.header.code == 7002)) {
            updateGtm({
              'pageArea': 'Comprar vuelos',
              'pageCategory': 'Buscador vuelos',
              'pageContent': 'Error_7002. La ruta seleccionada no opera en algún día de la búsqueda indicada por el usuario'
            });
          }

        if (this.finishedLoadingBar && this.finishedHtmlLoad && this.noResults) {
          if (data.header && data.header.message) {
            dataMessage = data.header.message;
          }

          self.backToSearch(dataMessage);
        }

      }
    },



    /*
     * Transform data, and render template.
     */
    renderResults: function(numberOfScalesSelected) {
      var self = this;
      var params = this.resultsParams;
      var data = $.extend(true, {}, this.resultsData);
      var template = this.resultsTemplate;

      var templateData = {};
      var journeyList = data.body.data.journeys;

      /* Check if there are journeys with scales */
      var numberOfScalesList = this.getNumberOfScalesList(journeyList);
      var thereAreJourneysWithScales = (numberOfScalesList.length == 1 && $.inArray(0, numberOfScalesList) !== -1) ? false : true;

      /* Additional info */
      var isRt = (typeof params.dateArrival !== "undefined") ? true : false;
      var journeyConstraint = data.body.data.journeyConstraint;
      var messageItemization = data.body.data.messageItemization;

      /* By default, select minimiun number of scales */
      if (typeof numberOfScalesSelected === "undefined") {
        numberOfScalesSelected = numberOfScalesList[0];
      }

      /* Filter scales */
      journeyList = this.filterByNumberOfScales(journeyList, numberOfScalesSelected);

      /* Filter by interislas */
      if (typeof params.interislasCode !== "undefined") {
        var farebasisCode = params.interislasCode;

        journeyList = this.filterByFarebasisCode(journeyList, farebasisCode);
      }

      /* Mark recommended journeys */
      var recommendedPrices = this.getRecommendedPrices(journeyList);
      journeyList = this.markRecommendedJourneys(journeyList, recommendedPrices);

      /* Mark pre-selected journeys */
      templateData.preselectedJourneys = this.getPreselectedJourneys(journeyList);

      /* Add detailed info for each scale of each journey */
      journeyList = this.addScalesInfo(journeyList);

      /* Build template data object */
      templateData.searchInfo                 = this.getSearchInfo(params);
      templateData.journeyList                = this.groupJourneyList(journeyList);
      templateData.fareFamilyInfo             = this.getFareFamilyInfo(templateData.journeyList);
      templateData.thereAreJourneysWithScales = thereAreJourneysWithScales;
      templateData.isRt                       = isRt;
      templateData.journeyConstraint          = journeyConstraint;
      templateData.messageItemization         = messageItemization;

      /* Render the template */
      this.templateData = templateData;
      html = template(templateData);

      /* Append the results */
      self.appendResults(html);

      /* Fill options in scales filter */
      this.fillScalesFilter(numberOfScalesList, numberOfScalesSelected);

    },



    /*
     * Returns an object with search info selected by user.
     */
    getSearchInfo: function(params) {
      var searchInfo = {}

      var departureDate = moment(params.dateDeparture, "DD/MM/YYYY");

      searchInfo = {
        from:      getData(params.airportDeparture).description,
        to:        getData(params.airportArrival).description,
        departure: {
          day:     departureDate.date(),
          month:   DateUtils.getMonthString(departureDate),
          weekday: DateUtils.getWeekdayString(departureDate)
        }
      }

      if (typeof params.dateArrival !== "undefined") {
        var arrivalDate = moment(params.dateArrival, "DD/MM/YYYY");

        searchInfo.arrival = {
          day:     arrivalDate.date(),
          month:   DateUtils.getMonthString(arrivalDate),
          weekday: DateUtils.getWeekdayString(arrivalDate)
        }
      } else {
        searchInfo.arrival = null;
      }

      return searchInfo;
    },



    /*
     * Returns an object with general info about the list of fare families, given a list of journeys (grouped).
     */
    getFareFamilyInfo: function(groupedJourneyList) {
      var fareFamilyInfo = { hasNobag: false, hasEconomy: false, hasBusiness: false, hasSocial: false};

      $.each(groupedJourneyList, function(type, list) {
        var hasNobag, hasEconomy, hasBusiness, hasSocial;
        var noBagText, economyText, businessText, socialText;

        $.each(list, function(journeyGroupKey, journeyGroup) {

          if ((typeof journeyGroup.journeyList.NOBAG !== "undefined") && (journeyGroup.journeyList.NOBAG.length > 0)) {
            hasNobag  = true;
            noBagText = journeyGroup.journeyList.NOBAG[0].fareFamilyText;
          }

          if ((typeof journeyGroup.journeyList.ECONOMY !== "undefined") && (journeyGroup.journeyList.ECONOMY.length > 0)) {
            hasEconomy  = true;
            economyText = journeyGroup.journeyList.ECONOMY[0].fareFamilyText;
          }

          if ((typeof journeyGroup.journeyList.BUSINESS !== "undefined") && (journeyGroup.journeyList.BUSINESS.length > 0)) {
            hasBusiness  = true;
            businessText = journeyGroup.journeyList.BUSINESS[0].fareFamilyText;
          }

          if ((typeof journeyGroup.journeyList.SOCIAL !== "undefined") && (journeyGroup.journeyList.SOCIAL.length > 0)) {
            hasSocial  = true;
            socialText = journeyGroup.journeyList.SOCIAL[0].fareFamilyText;
          }
        });

        /* Flags */
        fareFamilyInfo.hasNobag    = fareFamilyInfo.hasNobag    || hasNobag;
        fareFamilyInfo.hasEconomy  = fareFamilyInfo.hasEconomy  || hasEconomy;
        fareFamilyInfo.hasBusiness = fareFamilyInfo.hasBusiness || hasBusiness;
        fareFamilyInfo.hasSocial   = fareFamilyInfo.hasSocial   || hasSocial;

        /* Titles */
        fareFamilyInfo.noBagText    = fareFamilyInfo.noBagText    || noBagText;
        fareFamilyInfo.economyText  = fareFamilyInfo.economyText  || economyText;
        fareFamilyInfo.businessText = fareFamilyInfo.businessText || businessText;
        fareFamilyInfo.socialText   = fareFamilyInfo.socialText   || socialText;

      });

      fareFamilyInfo.count = (fareFamilyInfo.hasNobag ? 1 : 0) + (fareFamilyInfo.hasEconomy ? 1 : 0) + (fareFamilyInfo.hasBusiness ? 1 : 0) + (fareFamilyInfo.hasSocial ? 1 : 0);

      return fareFamilyInfo;
    },



    /*
     * Group a list of flights recursively by three iterations:
     * - Flight type (ow, rt).
     * - Departure datetime.
     * - Fare family type.
     *
     * Recieves an array of flights.
     * Returns an object with all flights grouped.
     */
    groupJourneyList: function(journeyList) {
      /* Group by type */
      var groupedJourneyList = this.groupJourneyListByType(journeyList);

      for (var journeyType in groupedJourneyList) {
        /* Foreach flight type, group by departure date */
        groupedJourneyList[journeyType] = this.groupJourneyListByDepartureDate(groupedJourneyList[journeyType]);

        for (var departureDate in groupedJourneyList[journeyType]) {
          /* Foreach departure date, group by fare family */
          groupedJourneyList[journeyType][departureDate].journeyList = this.groupJourneyListByFareFamily(groupedJourneyList[journeyType][departureDate].journeyList);
        }
      }

      return groupedJourneyList;
    },



    /*
     * Group a list of flights in ow an rt lists.
     *
     * Recieves an array of ow and rt flights mixed.
     * Returns an object with two arrays:
     * - ow: contains all ow flights of the given list.
     * - rt: contains all rt flights of the given list.
     */
    groupJourneyListByType: function(journeyList) {
      var groupedJourneyList = {
        ow : journeyList.filter(function(journey) { return (journey.direction == "I"); }),
        rt : journeyList.filter(function(journey) { return (journey.direction == "V"); })
      };

      return groupedJourneyList;
    },



    /*
     * Group a list of flights by departure date and hour.
     *
     * Recieves an array of flights.
     * Returns an object with all flights grouped by same date and hour.
     */
    groupJourneyListByDepartureDate: function(journeyList) {
      var self = this;
      var groupedJourneyList = {};

      $.each(journeyList, function(index, journey) {
        var departureDateUnique = journey.flights[0].dateDeparture;
        /* This unique key (departureDateUnique) will have departureDate plus all its flight codes separated by "_"
         *
         * ex:
         * 17/03/2016 21:10_US6565_UR9018
         * 17/03/2016 21:10_US6565_UR9018_UT8190
         * 17/03/2016 21:10_US6565 */

        $.each(journey.flights, function(flightIndex, flightElement) {
          departureDateUnique += "_"+ flightElement.companyCode+flightElement.number;
        });

        /* If there's no previous element with same departureDateUnique, create object */
        if (!groupedJourneyList.hasOwnProperty(departureDateUnique)) {
          groupedJourneyList[departureDateUnique] = {
            info: self.getJourneyCommonData(journey),
            journeyList: []
          };
        }

        groupedJourneyList[departureDateUnique].journeyList.push(journey);
      });

      /* Sort by its departureDate (associative key) */
      groupedJourneyList = this.sortByDepartureDate(groupedJourneyList);

      return groupedJourneyList;
    },



    /*
     * Group a list of flights by fare family.
     *
     * Recieves an array of flights.
     * Returns an array with all flights grouped by fare family.
     */
    groupJourneyListByFareFamily: function(journeyList) {
      var self = this;
      var groupedJourneyList = {};

      $.each(journeyList, function(index, journey) {
        var fareFamily = journey.fareFamily.code;

        /* If there's no previous element with same fareFamilyCode, create array */
        if (!groupedJourneyList.hasOwnProperty(fareFamily)) {
          groupedJourneyList[fareFamily] = [];
        }

        var journeyData = self.getJourneyData(journey);
        groupedJourneyList[fareFamily].push(journeyData);
      });

      return groupedJourneyList;
    },



    /*
     * Get common data of a journey.
     *
     * Recieves a journey object.
     * Returns an object with the common info of the journey.
     */
    getJourneyCommonData: function(journey) {
      var flightsSize = journey.flights.length;

      var departureDate = moment(journey.flights[0].dateDeparture, "DD/MM/YYYY HH:mm");
      var arrivalDate   = moment(journey.flights[flightsSize-1].dateArrival, "DD/MM/YYYY HH:mm");

      var gmtDepartureDate = moment(journey.flights[0].gmtDateDeparture, "DD/MM/YYYY HH:mm");
      var gmtArrivalDate   = moment(journey.flights[flightsSize-1].gmtDateArrival, "DD/MM/YYYY HH:mm");
      var durationHours    = gmtArrivalDate.diff(gmtDepartureDate, "hours");
      var durationMinutes  = gmtArrivalDate.diff(gmtDepartureDate, "minutes") - durationHours*60;

      /* Get plus days info */
      var departureDateNoTime = moment(journey.flights[0].dateDeparture, "DD/MM/YYYY");
      var arrivalDateNoTime   = moment(journey.flights[flightsSize-1].dateArrival, "DD/MM/YYYY");
      var plusDays            = arrivalDateNoTime.diff(departureDateNoTime, "days");

      /* Set duration text */
      var durationText;
      durationText  = (durationHours > 0)   ? durationHours +'h '   : '';
      durationText += (durationMinutes > 0) ? durationMinutes +'m ' : '';

      /* Get operators list */
      var operatorsList = [];
      $.each(journey.flights, function(flightIndex, flight) {
        var flightOperator = flight.operator;

        if ($.inArray(flightOperator, operatorsList) === -1) {
          operatorsList.push(flightOperator);
        }
      });

      return {
        departureDate:   departureDate.format("DD/MM/YYYY HH:mm"),
        departureCode:   journey.flights[0].airportDeparture.code,
        departure:       journey.flights[0].airportDeparture.description,
        departureHour:   departureDate.format("HH:mm"),
        arrivalCode:     journey.flights[flightsSize-1].airportArrival.code,
        arrival:         journey.flights[flightsSize-1].airportArrival.description,
        arrivalHour:     arrivalDate.format("HH:mm"),
        durationHours:   durationHours,
        durationMinutes: durationMinutes,
        durationText:    $.trim(durationText),
        numberOfScales:  flightsSize-1,
        operatorsList:   operatorsList,
        plusDays:        plusDays,
      }
    },



    /*
     * Get data of a journey that will be showed in the view.
     *
     * Recieves a journey object.
     * Returns an object with the journey info.
     */
    getJourneyData: function(journey) {
      var self = this;
      var flightList = [];

      $.each(journey.flights, function(index, flight) {
        var flightData = self.getFlightData(flight);

        flightList.push(flightData);
      });

      var priceItemization = this.getPriceItemization(journey);
      var baggageInfo = this.getBaggageInfo(journey);

      return {
        itemization:      priceItemization,
        price:            priceItemization.totalPrice,
        currencyCode:     currencyCode,
        identity:         journey.identity,
        recommendationId: journey.recommendationId,
        recommended:      journey.recommended,
        baggageInfo:      baggageInfo,
        fareFamilyCode:   journey.fareFamily.code,
        fareFamilyText:   journey.fareFamily.description,
        flightList:       flightList
      }
    },



    /*
     * Gets baggage info of journey.
     */
    getBaggageInfo: function(journey) {
      var baggageInfo = {};

      baggageInfo.isSupported      = (journey.franchiseInformation !== null) ? journey.franchiseInformation.hiringSupported : null;
      baggageInfo.description      = (journey.franchiseInformation !== null) ? journey.franchiseInformation.description     : null;
      baggageInfo.countBaggage     = (journey.franchiseInformation !== null) ? journey.franchiseInformation.franchise       : null;
      baggageInfo.countHandLuggage = (journey.cabinInformation     !== null) ? journey.cabinInformation.number              : null;

      return baggageInfo;
    },



    /*
     * Get data of a flight that will be showed in the view.
     *
     * Recieves a flight object.
     * Returns an object with the flight info.
     */
    getFlightData: function(flight) {
      var departureDate = moment(flight.dateDeparture, "DD/MM/YYYY HH:mm");
      var arrivalDate   = moment(flight.dateArrival,   "DD/MM/YYYY HH:mm");

      var gmtDepartureDate = moment(flight.gmtDateDeparture, "DD/MM/YYYY HH:mm");
      var gmtArrivalDate   = moment(flight.gmtDateArrival,   "DD/MM/YYYY HH:mm");
      var durationHours    = gmtArrivalDate.diff(gmtDepartureDate, "hours");
      var durationMinutes  = gmtArrivalDate.diff(gmtDepartureDate, "minutes") - durationHours*60;

      /* Get plus days info */
      var departureDateNoTime = moment(flight.dateDeparture, "DD/MM/YYYY");
      var arrivalDateNoTime   = moment(flight.dateArrival,   "DD/MM/YYYY");
      var plusDays            = arrivalDateNoTime.diff(departureDateNoTime, "days");

      /* Set duration text */
      var durationText;
      durationText  = (durationHours   > 0) ? durationHours   +'h ' : '';
      durationText += (durationMinutes > 0) ? durationMinutes +'m ' : '';

      /* Technical stops */
      var technicalStopsList = [];
      $.each(flight.technicalStop.airportStops, function(indexStop, airport) {
        var airportName = getData(airport).description

        technicalStopsList.push(airportName);
      });

      var technicalStopsText  = (technicalStopsList > 0) ? lang('availability_farefamily.technical_stops_plural') : lang('availability_farefamily.technical_stops_singular');
      technicalStopsText += technicalStopsList.join(', ') +'.';

      return {
        departure:          flight.airportDeparture.code,
        departureDate:      departureDate.format("DD") + DateUtils.getMonthString(departureDate, returnShortName = true),
        departureHour:      departureDate.format("HH:mm"),
        departureTerminal:  flight.terminalDeparture,
        arrival:            flight.airportArrival.code,
        arrivalDate:        arrivalDate.format("DD") + DateUtils.getMonthString(arrivalDate, returnShortName = true),
        arrivalHour:        arrivalDate.format("HH:mm"),
        arrivalTerminal:    flight.terminalArrival,
        flightNumber:       flight.companyCode + flight.number,
        plane:              flight.flote.description,
        scaleInfo:          flight.scaleInfo,
        operator:           flight.operator,
        durationHours:      durationHours,
        durationMinutes:    durationMinutes,
        durationText:       durationText,
        plusDays:           plusDays,
        hasTechnicalStops:  (flight.technicalStop.numberStops > 0) ? true : false,
        technicalStopsList: technicalStopsList,
        technicalStopsText: technicalStopsText,
      };
    },



    /*
     * Get the lowest price of a journey list.
     *
     * Recieves a journey list array.
     * Returns an object with the lowest price of each type (ow and rt).
     */
    getRecommendedPrices: function(journeyList) {
      var self = this;
      var prices = { ow: Number.POSITIVE_INFINITY, rt: Number.POSITIVE_INFINITY };

      $.each(journeyList, function(index, journey) {
        var priceItemization = self.getPriceItemization(journey);
        var journeyPrice = priceItemization.totalPrice;

        if (journey.direction == "I") {
          prices.ow = (journeyPrice < prices.ow) ? journeyPrice : prices.ow;
        } else if (journey.direction == "V") {
          prices.rt = (journeyPrice < prices.rt) ? journeyPrice : prices.rt;
        }
      });
      return prices;
    },



    /*
     * Add recommended flag to every journey in the journey list given.
     *
     * Recieves a journey list array and the price recommended.
     * Returns an array of journeys with the recommended flag added.
     */
    markRecommendedJourneys: function(journeyList, recommendedPrices) {
      var self = this;
      var resultJourneyList = journeyList;

      $.each(resultJourneyList, function(index, journey) {
        var priceItemization = self.getPriceItemization(journey);
        var journeyPrice = priceItemization.totalPrice;

        if (journey.direction == "I") {
          resultJourneyList[index].recommended = (journeyPrice == recommendedPrices.ow) ? 1 : 0;
        } else if (journey.direction == "V") {
          resultJourneyList[index].recommended = (journeyPrice == recommendedPrices.rt) ? 1 : 0;
        }
      });

      return resultJourneyList;
    },



    /*
     * Filter journey list by a maximun number of scales.
     *
     * Recieves a journey list array and the number of scales.
     * Returns an array of journeys that has the same or less scales.
     */
    filterByNumberOfScales: function(journeyList, numberOfScalesSelected) {
      var resultJourneyList = journeyList.filter(function(journey) { return (journey.flights.length <= numberOfScalesSelected+1); });

      return resultJourneyList;
    },



    /*
     * Filter journey list by farebasis code (tarifa interislas).
     *
     * Recieves a journey list array and the farebasis code.
     * Returns an array of journeys that has the same farebasis code.
     */
    filterByFarebasisCode: function(journeyList, farebasisCode) {
      var resultJourneyList = journeyList.filter(function(journey) { return (journey.farebasisCode == farebasisCode); });

      return resultJourneyList;
    },



    /*
     * Add detailed info about the scales of each journey.
     *
     * Recieves an array of journeys.
     * Returns the same array of journeys wirh scales info added.
     */
    addScalesInfo: function(journeyList) {
      var resultJourneyList = journeyList;

      $.each(resultJourneyList, function(journeyIndex, journey) {
        $.each(journey.flights, function(flightIndex, flight) {
          var nextFlight = (typeof journey.flights[flightIndex+1] !== "undefined") ? journey.flights[flightIndex+1] : null;

          resultJourneyList[journeyIndex].flights[flightIndex].scaleInfo = false;

          if (nextFlight != null) {
            var scaleStartDate = moment(flight.gmtDateArrival,       "DD/MM/YYYY HH:mm");
            var scaleEndDate   = moment(nextFlight.gmtDateDeparture, "DD/MM/YYYY HH:mm");

            var durationHours   = scaleEndDate.diff(scaleStartDate, "hours");
            var durationMinutes = scaleEndDate.diff(scaleStartDate, "minutes") - durationHours*60;

            /* Set duration text */
            var durationText;
            durationText  = (durationHours > 0)   ? durationHours +'h '   : '';
            durationText += (durationMinutes > 0) ? durationMinutes +'m ' : '';

            resultJourneyList[journeyIndex].flights[flightIndex].scaleInfo = {};
            resultJourneyList[journeyIndex].flights[flightIndex].scaleInfo.code = flight.airportArrival.code;
            resultJourneyList[journeyIndex].flights[flightIndex].scaleInfo.name = flight.airportArrival.description;
            resultJourneyList[journeyIndex].flights[flightIndex].scaleInfo.hours = durationHours;
            resultJourneyList[journeyIndex].flights[flightIndex].scaleInfo.minutes = durationMinutes;
            resultJourneyList[journeyIndex].flights[flightIndex].scaleInfo.durationText = durationText;
          }
        });
      });

      return resultJourneyList;
    },



    /*
     * Get journeys selected by default.
     *
     * Recieves an array of journeys.
     * Returns an object with two journeys (ow and rt) that will be selected by default in results view.
     */
    getPreselectedJourneys: function(journeyList) {
      var result = { ow: null, rt: null };

      var owJourneyList = journeyList.filter(function(journey) { return (journey.direction == "I"); });
      var rtJourneyList = journeyList.filter(function(journey) { return (journey.direction == "V"); });

      var preselectedJourneyOw = this.getFilteredJourney(owJourneyList);
      result.ow = this.getJourneyData(preselectedJourneyOw);

      if (rtJourneyList.length > 0) {
        var preselectedJourneyRt = this.getFilteredJourney(rtJourneyList);
        result.rt = this.getJourneyData(preselectedJourneyRt);
      }

      return result;
    },



    /*
     * Filter journey list applying business rules.
     *
     * Recieves an array of journeys.
     * Returns a journey object.
     */
    getFilteredJourney: function(journeyList) {
      var self = this;
      var preselectedJourneyList = [];

      /* First rule, get "operated by ae" / "partially operated by ae" / "not operated by ae" journeys */
      var operatedByAeList          = [];
      var partiallyOperatedByAeList = [];
      var notOperatedByAeList       = [];

      $.each(journeyList, function(index, journey) {
        var operatedByAe = true;
        var partiallyOperatedByAe = false;

        $.each(journey.flights, function(index, flight) {
          if (flight.operator !== '0') {
            operatedByAe = false;
          } else {
            partiallyOperatedByAe = true;
          }
        });

        if (operatedByAe) {
          operatedByAeList.push(journey);
        } else if (partiallyOperatedByAe) {
          partiallyOperatedByAeList.push(journey);
        } else {
          notOperatedByAeList.push(journey);
        }
      });

      preselectedJourneyList = (operatedByAeList.length > 0) ? operatedByAeList : (partiallyOperatedByAeList.length > 0) ? partiallyOperatedByAeList : notOperatedByAeList;

      /* Second rule, get the cheapest price */
      if (preselectedJourneyList.length > 1) {
        var cheapestPrice = Number.POSITIVE_INFINITY;
        var cheapestPriceJourneyList = [];

        $.each(preselectedJourneyList, function(index, journey) {
          var priceItemization = self.getPriceItemization(journey);
          var journeyPrice = priceItemization.totalPrice;

          if (journeyPrice < cheapestPrice) {
            cheapestPrice = journeyPrice;
            cheapestPriceJourneyList = [ journey ];
          } else if (journeyPrice == cheapestPrice) {
            cheapestPriceJourneyList.push(journey);
          }
        });

        preselectedJourneyList = cheapestPriceJourneyList;
      }

      /* Third rule, get the lowest duration price */
      if (preselectedJourneyList.length > 1) {
        var lowestDuration = Number.POSITIVE_INFINITY;
        var lowestDurationJourneyList = [];

        $.each(preselectedJourneyList, function(index, journey) {
          var flightsSize = journey.flights.length;

          var departureDate = moment(journey.flights[0].dateDeparture, "DD/MM/YYYY HH:mm");
          var arrivalDate = moment(journey.flights[flightsSize-1].dateArrival, "DD/MM/YYYY HH:mm");

          var totalDuration = arrivalDate.diff(departureDate);

          if (totalDuration < lowestDuration) {
            lowestDuration = totalDuration;
            lowestDurationJourneyList = [ journey ];
          } else if (totalDuration == lowestDuration) {
            lowestDurationJourneyList.push(journey)
          }
        });

        preselectedJourneyList = lowestDurationJourneyList;
      }

      return preselectedJourneyList[0];
    },



    /*
     * Sort a journey list by its departure date.
     *
     * Recieves an array of journeys.
     * Returns the same array sorted by departure date.
     */
    sortByDepartureDate: function(journeyList) {
      var journeyListArray  = [];

      /* Transform object into array */
      for (var key in journeyList) {
        journeyList[key].sortKey = key.substr(0, 16); // contains datetime in string format (DD/MM/YYYY HH:mm)
        journeyListArray.push(journeyList[key]);
      }

      /* Sort array by its departureDate */
      journeyListArray.sort(function(journey1, journey2) {
        var date1 = moment(journey1.sortKey, "DD/MM/YYYY HH:mm");
        var date2 = moment(journey2.sortKey, "DD/MM/YYYY HH:mm");

        if (date1.isAfter(date2, "minute")) {
          return 1;
        } else if (date1.isBefore(date2, "minute")) {
          return -1;
        } else {
          return 0;
        }
      });

      /* Delete sortKey attribute in each journey */
      $.each(journeyListArray, function(index, journey) {
        delete journeyListArray[index].sortKey;
      });

      return journeyListArray;
    },



    /*
     * Get detailed itemization info of given journey.
     *
     * Recieves a journey object.
     * Returns an object with itemization info.
     */
    getPriceItemization: function(journey) {
      var serviceResponse = this.resultsData.body.data;
      var priceItemization = {};

      var countAdult  = (serviceResponse.adultPaxResident  > 0) ? serviceResponse.adultPaxResident  : serviceResponse.adultPax;
      var countChild  = (serviceResponse.childPaxResident  > 0) ? serviceResponse.childPaxResident  : serviceResponse.childPax;
      var countInfant = (serviceResponse.infantPaxResident > 0) ? serviceResponse.infantPaxResident : serviceResponse.infantPax;

      var importAdult  = countAdult  * journey.importAdult;
      var importChild  = countChild  * journey.importChild;
      var importInfant = countInfant * journey.importInfant;
      var totalImport  = importAdult + importChild + importInfant;

      var residentDiscount = (serviceResponse.adultPaxResident  * journey.discountAdultResident) +
                             (serviceResponse.childPaxResident  * journey.discountChildResident) +
                             (serviceResponse.infantPaxResident * journey.discountInfantResident);

      var serviceFeeDiscount = (serviceResponse.swisdto == true && serviceResponse.serviceFeeDiscount > 0) ? serviceResponse.serviceFeeDiscount : 0;
      var serviceFee = (serviceResponse.swisfee == true && serviceResponse.serviceFee > 0) ? serviceResponse.serviceFee : 0;
      var serviceFeeResidentDiscount = (serviceResponse.swisfee == true && serviceResponse.serviceFeeResidentDiscount > 0) ? serviceResponse.serviceFeeResidentDiscount : 0;

      var importTaxAdult  = countAdult  * journey.importTaxAdl;
      var importTaxChild  = countChild  * journey.importTaxChd;
      var importTaxInfant = countInfant * journey.importTaxInf;

      var totalTax = importTaxAdult + importTaxChild + importTaxInfant;

      /* Build itemization object */
      priceItemization.adult                      = { count: countAdult,  import: importAdult };
      priceItemization.child                      = { count: countChild,  import: importChild };
      priceItemization.infant                     = { count: countInfant, import: importInfant };
      priceItemization.residentDiscount           = residentDiscount;
      priceItemization.serviceFee                 = serviceFee;
      priceItemization.serviceFeeDiscount         = serviceFeeDiscount;
      priceItemization.serviceFeeResidentDiscount = serviceFeeResidentDiscount;
      priceItemization.totalTax                   = totalTax;

      priceItemization.totalPrice = totalImport + totalTax + serviceFee - residentDiscount - serviceFeeDiscount - serviceFeeResidentDiscount;

      return priceItemization;
    },



    /*
     * Get a list of number of scales, that are common in ow and rt journey lists.
     */
    getNumberOfScalesList: function(journeyList) {
      var resultListOw = [];
      var resultListRt = [];

      $.each(journeyList, function(index, journey) {
        var numberOfScales = journey.flights.length-1;

        if (journey.direction == 'I') {
          var tempArray = resultListOw;
        } else if (journey.direction == 'V') {
          var tempArray = resultListRt;
        }

        if ($.inArray(numberOfScales, tempArray) === -1) {
          tempArray.push(numberOfScales);
        }
      });

      if (resultListRt.length > 0) {
        /* Get max value of the minimium values of each array */
        var owMinimiumNumberOfScales = Math.min.apply(Math, resultListOw);
        var rtMinimiumNumberOfScales = Math.min.apply(Math, resultListRt);
        var minimiumNumberOfScales = Math.max.apply(Math, [ owMinimiumNumberOfScales, rtMinimiumNumberOfScales ]);

        /* Get an array with elements of ow and rt that are greater than the minimiun value */
        var resultValues = [];

        $.each(resultListOw, function(index, number) {
          if ((number >= minimiumNumberOfScales) && ($.inArray(number, resultValues) === -1)) {
            resultValues.push(number);
          }
        });

        $.each(resultListRt, function(index, number) {
          if ((number >= minimiumNumberOfScales) && ($.inArray(number, resultValues) === -1)) {
            resultValues.push(number);
          }
        });
      } else {
        var resultValues = resultListOw;
      }

      return resultValues.sort();
    },



    /*
     * Add results html to page.
     */
    appendResults: function(html) {
      var params = this.resultsParams;
      var $html = $(html);
      var self = this;

      /* Reset parent content */
      this.element.find('.process_wrapper_content .results_scroll').find('.results_topbar').remove();
      this.element.find('.process_wrapper_content .results_scroll').append($html.find('.results_topbar'))

      /* Append the html to results_content div */
      this.element.find('.process_wrapper_content .results_scroll').append($html.find('.results_content').hide().fadeIn(500));

      /* Mark first results as active */
      this.element.find('.result').eq(0).addClass('active');

      /* Hide loader */
      this.element.find('.loading_content').fadeOut(800, function() {
        self.element.find('.process_wrapper_content').removeClass('loading local_loading');
        self.element.find('.loading_content').attr('style', '');
      });

      /* Init Result process */
      Bus.publish('results', 'custom_init');
    },



    /*
     * Add the option list html to the scales filter.
     */
    fillScalesFilter: function(scalesList, selected) {
      if (scalesList.length > 0) {
        var options = '';

        $.each(scalesList, function(scaleIndex, scaleValue) {
          var selectedHtml = (selected == scaleValue) ? ' class="selected"' : '';

          options += '<li><a href="#" id="transfer_'+ scaleValue +'" '+ selectedHtml +'>'+ lang('result.filters_optinons_'+ scaleValue) +'</a></li>';
        });

        this.element.find('.results_topbar .filters .expand_transfers').prepend(options);
      }
    },



    /*
     * Actions to go back to search page.
     */
    backToSearch: function(message) {
      var searchProcessURL = getProcessUrl('search');
      var $searchForm      = this.element.find('.search_form[data-process-name=search]');
      var $searchFormMini  = this.element.find('.mini_search');
      var $airportFrom     = $searchForm.find('.airport.from');
      var $airportTo       = $searchForm.find('.airport.to');
      var departureAirport = getData(this.resultsParams.airportDeparture);
      var arrivalAirport   = getData(this.resultsParams.airportArrival);
      var $calendarOw      = $searchForm.find('.calendar.ow');
      var $calendarRt      = $searchForm.find('.calendar.rt');
      var $residentDiscount = $searchForm.find('.checkbox.resident');
      var $residentDiscountMini = $searchFormMini.find('.checkbox.resident');

      /* Set dates */
      var owDate  = moment(this.resultsParams.dateDeparture, "DD/MM/YYYY");
      var owText  = lang('dates.dayNamesMin_'+ owDate.day()) +' '+ owDate.date() +' '+ lang('dates.monthsNames_'+ owDate.month()).substr(0, 3);
      var owValue = owDate.format("MM-DD-YYYY");

      /* Update form airports with last search params */
      $airportFrom.find('.code').val(this.resultsParams.airportDeparture);
      $airportFrom.find('.helper').val(departureAirport.description);
      $airportTo.find('.code').val(this.resultsParams.airportArrival);
      $airportTo.find('.helper').val(arrivalAirport.description);

      /* Update form dates with last search params */
      $calendarOw.addClass('filled').addClass('filled').find('.input .placeholder').text(owText);
      $calendarOw.addClass('filled').find('.input input').val(owValue);

      /* Rt date */
      if (typeof this.resultsParams.dateArrival != "undefined") {
        /* Set dates */
        var rtDate  = moment(this.resultsParams.dateArrival, "DD/MM/YYYY");
        var rtText  = lang('dates.dayNamesMin_'+ rtDate.day()) +' '+ rtDate.date() +' '+ lang('dates.monthsNames_'+ rtDate.month()).substr(0, 3);
        var rtValue = rtDate.format("MM-DD-YYYY");

        $calendarRt.addClass('filled').find('.input .placeholder').text(rtText);
        $calendarRt.addClass('filled').find('.input input').val(rtValue);
      }


      if(this.resultsParams.resident == 'true'){
        $residentDiscount.addClass('checked');
        $residentDiscount.find('input').attr('checked', true);
      }else{
        $residentDiscount.removeClass('checked');
        $residentDiscount.find('input').attr('checked', false);
      }

      /* Passengers counter */
      var totalPassengers;
      var numAdults, numChilds, numInfants;
      var $adultsCounter = $searchForm.find('.passengers_input .counter_adults');
      var $kidsCounter = $searchForm.find('.passengers_input .counter_kids');
      var $babiesCounter = $searchForm.find('.passengers_input .counter_babies');
      var $adultsListCounter = $searchForm.find('.passengers_list .counter_adults span');
      var $kidsListCounter = $searchForm.find('.passengers_list .counter_kids span');
      var $babiesListCounter = $searchForm.find('.passengers_list .counter_babies span');
      var $kidsPassenger = $searchForm.find('.passengers_list .counter_kids');
      var $babiesPassengers = $searchForm.find('.passengers_list .counter_babies');
      var $adultDetailNum = $searchForm.find('.passengers_detail .passengers_adult span.number');
      var $kidDetailNum = $searchForm.find('.passengers_detail .passengers_kid span.number');
      var $babyDetailNum = $searchForm.find('.passengers_detail .passengers_baby span.number');
      var $sumaPassengers = $searchForm.find('.passengers_total span');

      if (this.resultsParams.resident == 'true') {
        numAdults = parseInt(this.resultsParams.paxAdultResident);
        numChilds = parseInt(this.resultsParams.paxChildResident);
        numInfants = parseInt(this.resultsParams.paxInfantResident);
      } else {
        numAdults = parseInt(this.resultsParams.paxAdult);
        numChilds = parseInt(this.resultsParams.paxChild);
        numInfants = parseInt(this.resultsParams.paxInfant);
      }

      totalPassengers = numAdults + numChilds + numInfants;
        
      $adultsCounter.val(numAdults);
      $kidsCounter.val(numChilds);
      $babiesCounter.val(numInfants);

      $sumaPassengers.text(totalPassengers);

      if(numAdults > 1){
        $adultsListCounter.css({display: "block"});
        $adultsListCounter.text(numAdults);
        $adultDetailNum.text(numAdults);
      }else{
        $adultsListCounter.text(numAdults);
        $adultsListCounter.css({display: "none"});
        $adultDetailNum.text(numAdults);
      }

      if(numChilds != 0){
        $kidsPassenger.css({ display: "list-item"});
        $kidDetailNum.text(numChilds);
        if(numChilds > 1){
          $kidsListCounter.css({display: "block"});
          $kidsListCounter.text(numChilds);
        }else{
          $kidsListCounter.css({display: "none"});
          $kidsListCounter.text(numChilds);
        }
      }else{
        $kidsPassenger.css({ display: "none"});
        $kidDetailNum.text(numChilds);
      }
      if(numInfants != 0){
        $babiesPassengers.css({ display: "list-item"});
        $babyDetailNum.text(numInfants);
        if(numInfants > 1){
          $babiesListCounter.css({display: "block"});
          $babiesListCounter.text(numInfants);
        }else{
          $babiesListCounter.css({display: "none"});
          $babiesListCounter.text(numInfants);
        }
      }else{
        $babiesPassengers.css({ display: "none"});
        $babyDetailNum.text(numInfants);
      }


      var self = this;
      var jointsSocial;
      var $miniSearch = self.element.find('.mini_search');
      var origin = this.resultsParams.airportDeparture;
      var destination = this.resultsParams.airportArrival;
      var $totalCounter = $searchForm.find('.passengers_count_field .passengers_total span');
      var $adults = $searchForm.find('.passengers_count_field .passengers_input .counter_adults');

      /* Se realiza búsqueda con colectivos*/
      if(typeof this.resultsParams.colective != "undefined"){

        /* Añadimos la lista colectivos en el buscador */

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
                  var $SocialRateContainer = $searchForm.find('.passengers_detail .passengers_counter');
                  $searchForm.find('.social_rate').remove();

                  $SocialRateContainer.append($renderedHtmlSocialRate);

                  /* Show button change list rate */
                  $searchForm.find('.switch_detail').removeClass('hidden');


                  /* Cambiamos visualización de la lista */
                  $searchForm.find('.general_rate').addClass('hidden');
                  $searchForm.find('.social_rate').removeClass('hidden');
                  $searchForm.find('.resetPassengers').trigger('click');
                  var typePassenger;

                  
                  /* Recogemos el tipo de colectivo en funcióndel code */
                  switch (self.resultsParams.colective) {
                    case "YTH":
                      typePassenger = 'counter_young';
                      break;
                    case "SRC":
                      typePassenger = 'counter_senior';
                      break;
                    case "SPT":
                      typePassenger = 'counter_federated';
                      break;
                    case "MED":
                      typePassenger = 'counter_medical';
                      break;  
                  }

                  /*Seteamos los valores en los colectivos correspondientes */
                  var $passenger = $searchForm.find('.passengers_count_field .passengers_input .'+typePassenger);
                  var $passengerPlaceholder = $searchForm.find('.passengers_count_field .passengers_counter .'+typePassenger+' .number');
                  var countPassenger = (self.resultsParams.paxAdultResident > 0) ? self.resultsParams.paxAdultResident : self.resultsParams.paxAdult;

                  $totalCounter.text(parseInt(countPassenger));
                  $passenger.val(countPassenger);
                  $passengerPlaceholder.text(countPassenger);

                  /* Reseteamos el valor del adulto ya que por defecto esta a con uno*/
                  // $adults.val(0);

                  /* Añadimos la clase disabled a los li que no estan seleccionados*/
                  $searchForm.find('.social_rate .social_list').not('.'+typePassenger).addClass('disabled');
                  $searchForm.find('.passengers_counter ul li.'+typePassenger).trigger('update');
                }
              });

            }
          }
        });

      } else {  /* Como el colectivo no tiene valor setamos los valores en los tipos de pasajeros habituales */

          /* Visualizamos el listado de social_rate si la combinación de aueropuertos es correcta*/
          var $formSearchHome = this.element.find('form.search_flights');
          var residentIsShow = $formSearchHome.find('.checkbox.resident').is(':visible');

          if(residentIsShow){

            var self = this;
            var jointsSocial;
            var origin = this.resultsParams.airportDeparture;
            var destination = this.resultsParams.airportArrival;


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
                      var $SocialRateContainer = $searchForm.find('.passengers_detail .passengers_counter');
                      $searchForm.find('.social_rate').remove();

                      $SocialRateContainer.append($renderedHtmlSocialRate);

                      /* Show button change list rate */
                      $searchForm.find('.switch_detail').removeClass('hidden');
                    }
                  });
                }
              } 
            }); 

          }

        }



      /* Set message error */
      if ((message) && (this.element.find('.search_flights > .error_message').length == 0)) {
        this.element.find('.search_flights').prepend('<div class="error_message"><p><span>' + message + '</span></p></div>');
        this.element.find('.search_flights').addClass('ready');
      } else if (message) {
        this.element.find('.search_flights > .error_message').empty().append('<p><span>' + message + '</span></p>');
        this.element.find('.search_flights').addClass('ready');
      } 

      Bus.publish('hash', 'change', { hash: searchProcessURL });
    },



    /*
     * Pass data to the view.
     */
    getResultsData: function() {
      /* Logs for FareFamily availability debug */
      // console.log(this.resultsData);
      // console.log(this.resultsParams);
      // console.log(this.templateData);

      Bus.publish('results', 'set_results_data', {
        resultsData: this.resultsData,
        resultsParams: this.resultsParams,
        templateData: this.templateData
      });
    },



    /*
     * Clean data in view.
     */
    cleanResultsData: function() {
      this.resultsData = {};
      this.templateData = {};
      Bus.publish('results', 'set_results_data', {resultsData: this.resultsData, templateData: this.templateData});

      this.results.hash = '';
      this.results.data = {};
    },



    /*
     * Actions and listeners to load the mini-search.
     */
    prepareDefaultMinisearch: function() {
      var params = this.resultsParams;
      var $miniSearch = this.element.find('.mini_search');

      /* Field vars */
      var $airportFrom = $miniSearch.find('.airport.from');
      var $airportTo = $miniSearch.find('.airport.to');
      var $calendarOw = $miniSearch.find('.calendar.ow');
      var $calendarRt = $miniSearch.find('.calendar.rt');
      var $totalCounter = $miniSearch.find('.passengers_count_field .passengers_total span');
      var $adults = $miniSearch.find('.passengers_count_field .passengers_input .counter_adults');
      var $adultsPlaceholder = $miniSearch.find('.passengers_count_field .passengers_counter .passengers_adult .number');
      var $kids = $miniSearch.find('.passengers_count_field .passengers_input .counter_kids');
      var $kidsPlaceholder = $miniSearch.find('.passengers_count_field .passengers_counter .passengers_kid .number');
      var $babies = $miniSearch.find('.passengers_count_field .passengers_input .counter_babies');
      var $babiesPlaceholder = $miniSearch.find('.passengers_count_field .passengers_counter .passengers_baby .number');
      var $resident = $miniSearch.find('.options .resident');
      var $channel = $miniSearch.find('.channel');

      // var $interislas = $miniSearch.find('.interislas');

      /* Prepare airport from */
      var departureAirport = getData(params.airportDeparture);
      $airportFrom.find('.code').val(params.airportDeparture);
      $airportFrom.find('.helper').val(departureAirport.description);
      $airportFrom.find('.editable').text(departureAirport.description);
      if (departureAirport.zone == 'NAC') $airportFrom.addClass('national');
      if (departureAirport.resident) $airportFrom.addClass('resident');

      /* Prepare airport to */
      var arrivalAirport = getData(params.airportArrival);
      $airportTo.find('.code').val(params.airportArrival);
      $airportTo.find('.helper').val(arrivalAirport.description);
      $airportTo.find('.editable').text(arrivalAirport.description);
      if (arrivalAirport.zone == 'NAC') $airportTo.addClass('national');
      if (arrivalAirport.resident) $airportTo.addClass('resident');
      $airportTo.trigger('need_data', [params.airportDeparture]);
      $airportTo.removeClass('disabled');

      /* Ow date */
      var owDate  = moment(params.dateDeparture, "DD/MM/YYYY");
      var owText  = owDate.date() +' '+ lang('dates.monthsNames_'+ owDate.month());
      var owValue = owDate.format("MM-DD-YYYY");

      $calendarOw.find('.input .placeholder').text(owText);
      $calendarOw.find('.input input').val(owValue);

      /* Rt date */
      var rtText, rtValue;
      if (typeof params.dateArrival != "undefined") {
        var rtDate  = moment(params.dateArrival, "DD/MM/YYYY");

        rtText  = rtDate.date() +' '+ lang('dates.monthsNames_' + rtDate.month());
        rtValue = rtDate.format("MM-DD-YYYY");
      } else {
        rtText = $calendarRt.attr('data-default') || '';
        rtValue = undefined;
      }

      $calendarRt.find('.input .placeholder').text(rtText);
      $calendarRt.find('.input input').val(rtValue);

     

      /* Resident */
      var residentVisibility = false;
      if (departureAirport.zone == 'NAC' && arrivalAirport.zone == 'NAC' && (departureAirport.resident || arrivalAirport.resident)) {
        residentVisibility = true;
        $resident.show();
      } else {
        $resident.hide();
      }

      var isResident = (params.paxAdultResident > 0 && residentVisibility == true);
      if (isResident && ($resident.find('input').prop('checked') == false)) {
        $resident.find('input').prop('checked', true).change();
      } else if (!isResident && ($resident.find('input').prop('checked') == true)) {
        $resident.find('input').prop('checked', false).change();
      }

      /* Channel */
      $channel.val(params.channel);

      /* Se realiza búsqueda con colectivos*/
      if(typeof params.colective != "undefined"){

        /* Añadimos la lista colectivos en el buscador */
        var self = this;
        var jointsSocial;
        var origin = ($miniSearch.find('#mini_search_form_from')).val();
        var destination = ($miniSearch.find('#mini_search_form_to')).val();

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
                  var $SocialRateContainer = $miniSearch.find('.passengers_detail .passengers_counter');
                  $miniSearch.find('.social_rate').remove();

                  $SocialRateContainer.append($renderedHtmlSocialRate);

                  /* Show button change list rate */
                  $miniSearch.find('.switch_detail').removeClass('hidden');


                  /* Cambiamos visualización de la lista */
                  $miniSearch.find('.general_rate').addClass('hidden');
                  $miniSearch.find('.social_rate').removeClass('hidden');
                  //$('.mini_search .resetPassengers').trigger('click');

                  var typePassenger;
                  
                  /* Recogemos el tipo de colectivo en funcióndel code */
                  switch (params.colective) {
                    case "YTH":
                      typePassenger = 'counter_young';
                      break;
                    case "SRC":
                      typePassenger = 'counter_senior';
                      break;
                    case "SPT":
                      typePassenger = 'counter_federated';
                      break;
                    case "MED":
                      typePassenger = 'counter_medical';
                      break;  
                  }

                  /*Seteamos los valores en los colectivos correspondientes */
                  var $passenger = $miniSearch.find('.passengers_count_field .passengers_input .'+typePassenger);
                  var $passengerPlaceholder = $miniSearch.find('.passengers_count_field .passengers_counter .'+typePassenger+' .number');
                  var countPassenger = (params.paxAdultResident > 0) ? params.paxAdultResident : params.paxAdult;

                  $totalCounter.text(parseInt(countPassenger));
                  $passenger.val(countPassenger);
                  $passengerPlaceholder.text(countPassenger);

                  /* Reseteamos el valor del adulto ya que por defecto esta a con uno*/
                  $adults.val(0);

                  /* Añadimos la clase disabled a los li que no estan seleccionados*/
                  $miniSearch.find('.social_rate .social_list').not('.'+typePassenger).addClass('disabled');

                  //$('.mini_search .passengers_counter ul li.'+typePassenger).trigger('update');
                }
              });

            }
          }
        });

      } else {  /* Como el colectivo no tiene valor setamos los valores en los tipos de pasajeros habituales */

        /* Visualizamos el listado de social_rate si la combinación de aueropuertos es correcta*/
        var $formSearchHome = this.element.find('form.search_flights');
        var residentIsShow = $formSearchHome.find('.checkbox.resident').is(':visible');

        if(residentIsShow){

          var self = this;
          var jointsSocial;
          var origin = ($miniSearch.find('#mini_search_form_from')).val();
          var destination = ($miniSearch.find('#mini_search_form_to')).val();


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
                    var $SocialRateContainer = $miniSearch.find('.passengers_detail .passengers_counter');
                    $miniSearch.find('.social_rate').remove();

                    $SocialRateContainer.append($renderedHtmlSocialRate);

                    /* Show button change list rate */
                    $miniSearch.find('.switch_detail').removeClass('hidden');
                  }
                });
              }
            } 
          }); 

        }
        
        /* Passengers */
        var countAdult = (params.paxAdultResident > 0) ? params.paxAdultResident : params.paxAdult;
        var countChild = (params.paxChildResident > 0) ? params.paxChildResident : params.paxChild;
        var countInfant = (params.paxInfantResident > 0) ? params.paxInfantResident : params.paxInfant;

        $totalCounter.text(parseInt(countAdult) + parseInt(countChild) + parseInt(countInfant));
        $adults.val(countAdult);
        $adultsPlaceholder.text(countAdult);
        if (countChild) {
          $kids.val(countChild);
          $kidsPlaceholder.text(countChild);
        }
        if (countInfant) {
          $babies.val(countInfant);
          $babiesPlaceholder.text(countInfant);
        }

      }

      /* Trigger change in any mini_search form input to update interislas field visibility */
      $miniSearch.find('#mini_search_form_from').trigger('customChange');
      $miniSearch.find('#mini_search_form_from').trigger('validate');
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
                
    }

  };
});
