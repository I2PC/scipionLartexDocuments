Hydra.module.register('USASearchController', function(Bus, Module, ErrorHandler, Api) {
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
    results: {},

    /* GTM */
    firstView: undefined,

    events: {
      'process': {
        'USA_show_flights': function(oNotify) {
          /* Clean some params */
          if (oNotify.params.view != 'price' && oNotify.params.view != 'hour' && oNotify.params.view != 'matriz') {
            oNotify.params.view = 'hour';
          }

          this.showFlights(oNotify.params);
        },
        'USA_get_results_data': function(oNotify) {
          this.getResultsData();
        },
        'USA_clean_results_data': function(oNotify) {
          this.cleanResultsData();
        },
        'USA_get_prices': function(oNotify) {
          var by_hour = (this.element.find('.process_wrapper_content').hasClass('by_hour') || this.element.find('.process_wrapper_content').hasClass('by_matriz'));
          this.getPrices(oNotify.flights, by_hour, oNotify.callback);
        },
        'USA_get_cheapest_price': function(oNotify) {
          this.getCheapestPrice(oNotify.callback);
        },
        'USA_get_all_cheapest_price': function(oNotify) {
          this.getAllCheapestPrice(oNotify.callback);
        },
        'USA_get_all_cheapest_price_visible':function(oNotify){
          this.getAllCheapestPriceVisible(oNotify.listJourneyVisibleIdsOW, oNotify.listJourneyVisibleIdsRT, oNotify.callback);
        },
        'USA_get_best_business_id': function(oNotify) {
          this.getBestBusinessIds(oNotify.flights, oNotify.callback);
        },
        'USA_render_results': function(oNotify) {
          this.prepareResultsStructure(oNotify.transferSelected);
        },
        'USA_miniSearchDefaultValues': function(oNotify) {
          this.prepareDefaultMinisearch();
        }
      }
    },

    init: function() {
      /* Save jquery object reference */
      this.element = $(this.selector);
    },

    /* Results process */
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
            //self.prepareResultsStructure();
            self.showCheckoutWarning();

          }
        });
      }
      /* The results page already exists, so move the process */
      else {
        //this.prepareResultsStructure();
        this.showCheckoutWarning();
      }
    },

    showCheckoutWarning: function(transferSelected) {
      //console.log(this.element.find('.process_page.checkout').length);

      if (this.element.find('.process_page.checkout').length == 0) {
        /* We come from the normal workflow: from search or from the same results page in a minisearch submit or change */
        this.prepareResultsStructure();
      }
      else {
        /* We come from the checkout page, so first thing we need to do is show the checkout popup */
        this.initCancel();
      }
    },

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

    prepareResultsStructure: function(transferSelected) {
      var self = this;
      var params = this.resultsParams;
      var hash = params.from + '-' +
                 params.to + '-' +
                 params.ow + '-' +
                 ((params.rt) ? params.rt : '0') + '-' +
                 params.adults + '-' +
                 params.kids + '-' +
                 params.babies + '-' +
                 ((params.resident) ? params.resident : '0') + '-' +
                 ((params.business) ? params.business : '0');

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
            self.animateToProcessPage(transferSelected);
          });
        }
        else {
          /* The results are cached so just show the spinner for a short time */
          this.element.find('.loading_topbar').css('margin-left', '0');
          this.element.find('.searching_bar').css('width', '100%');
          this.element.find('.loading_content .spinner').show();
          this.element.find('.loading_content .text_spinner').show();

          this.element.find('.process_wrapper_content').addClass('loading');
          this.animateToProcessPage(transferSelected);
        }
      }
      else {
        /* Reset topbar values, so it can start the animation again */
        this.element.find('.loading_topbar').css('margin-left', '-208px');
        this.element.find('.searching_bar').css('width', '0');
        this.element.find('.loading_content .spinner').hide();
        this.element.find('.loading_content .text_spinner').hide();

        /* Add loading classes */
        this.element.find('.process_wrapper_content').addClass('loading').removeClass('by_price by_hour by_matriz');

        /* Remove the current content and process */
        this.element.find('.process_wrapper_content .results_scroll .results_content').remove();
        this.animateToProcessPage(transferSelected);
      }

    },

    animateToProcessPage: function(transferSelected) {
      var self = this;
      var offsetTop = this.element.find('.process_page.results').index() * 100 * -1;

      /* Prepare default info in mini_search */
      this.prepareDefaultMinisearch();

      /* Check if the process_page_wrapper is already at 100%, so we don't need to animate it */
      if (this.element.find('.process_page_wrapper').attr('data-view') == 'results') {
        this.loadResults(transferSelected);
      }
      else { /* Animate process wrapper to show the new page */
        this.element.find('.process_page_wrapper').addClass('animating_wrapper').animate({
          'top':  offsetTop + '%'
        }, 500, 'easeInOutExpo', function() {
          self.element.find('.process_page_wrapper').removeClass('animating_wrapper');
          self.element.find('.process_page.checkout').remove();
          self.loadResults(transferSelected);
        });
      }
    },

    loadResults: function(transferSelected) {
      var params = this.resultsParams;
      var self = this;
      var renderedHtml;
      var view = params.view;
      var jsonPath = getServiceURL('results.USA_flights');
      var dataMessage = lang('general.error_message');
      var hash = params.from + '-' +
                 params.to + '-' +
                 params.ow + '-' +
                 ((params.rt) ? params.rt : '0') + '-' +
                 params.adults + '-' +
                 params.kids + '-' +
                 params.babies + '-' +
                 ((params.resident) ? params.resident : '0') + '-' +
                 ((params.business) ? params.business : '0') + '-' +
                 params.market + '-' +
                 params.lang;


      /* Reset noResults */
      self.noResults = false;

      /* Add checkout view flag */
      this.element.find('.process_page_wrapper').attr('data-view', '').attr('data-view', 'results');

      /* If the results are already cached, show them directly from cache */
      if (hash == this.results.hash) {
        this.finishedLoadingBar = true; /* There's no loading bar, so finish it by code */
        this.prepareResultsHtml(this.results.data, transferSelected);

        /* Update Google tag manager */
        updateGtm({
          'ow': (params.rt != 'false') ? 'N' : 'S',
          'business': (params.business == 'true') ? 'BUS' : 'TUR',
          'origen': params.from,
          'destino': params.to,
          'fechaida': params.ow,
          'fecharegreso': (params.rt != 'false') ? params.rt : '',
          'residente': (params.resident == 'true') ? 'S' : 'N',
          'numpax': parseInt(params.adults) + parseInt(params.kids) + parseInt(params.babies),
          'mercado': window.market,
          'pagina': 'availability',
          'pageArea': 'Comprar vuelos',
          'pageCategory': 'Buscador vuelos',
          'pageContent': 'Resultados de la búsqueda ' + window.getResultsViewName(params.view),
          'firstView': self.firstView
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

              /* Back to search */
              //console.log("Volvemos al search en loadResults")
              self.backToSearch(dataMessage);
            }
          }
          else {

            if ( typeof self.firstView == "undefined" )
            {
              self.firstView = params.view;
            }

            /* Update Google tag manager */
            updateGtm({
              'ow': (params.rt != 'false') ? 'N' : 'S',
              'business': (params.business == 'true') ? 'BUS' : 'TUR',
              'origen': params.from,
              'destino': params.to,
              'fechaida': params.ow,
              'fecharegreso': (params.rt != 'false') ? params.rt : '',
              'residente': (params.resident == 'true') ? 'S' : 'N',
              'numpax': parseInt(params.adults) + parseInt(params.kids) + parseInt(params.babies),
              'mercado': window.market,
              'pagina': 'availability',
              'pageArea': 'Comprar vuelos',
              'pageCategory': 'Buscador vuelos',
              'pageContent': 'Resultados de la búsqueda ' + window.getResultsViewName(params.view),
              'firstView': self.firstView
            });

            /* See if the html is loaded */
            if (self.finishedLoadingBar && self.finishedHtmlLoad) {
              self.renderResults(transferSelected);
              self.finishedLoadingBar = false;
            }
          }
        });

        /* Call AJAX module to get the results json */
        Bus.publish('ajax', 'getFromService', {
          path: jsonPath,
          params: params,
          success: function(data) {

            /* Save this results on cache */
            self.results.hash = hash;
            self.results.data = data;

            /* Prepare results */
            self.prepareResultsHtml(data, transferSelected);
          }
        });
      }
    },

    prepareResultsHtml: function(data, transferSelected) {
      var params = this.resultsParams;
      var self = this;
      var view = params.view;
      var templatePath = eval('AirEuropaConfig.templates.results.by_' + view);
      var dataMessage = lang('general.error_message');

      /* Filter data depending on the view */
      if (eval('data.by_' + view) != undefined) {
        data = eval('data.by_' + view);
      }

      /* If there are results, ask for template */
      if (data && data.totalJourneys > 0) {

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
              self.renderResults(transferSelected);
              self.finishedHtmlLoad = false;
            }
          }
        });
      }

      /* If there are no results, go back to the search */
      else {
        /* See if the loading bar has finished it's animation */
        this.finishedHtmlLoad = true;
        this.noResults = true;

        if ( data.header && (data.header.code == 7002)){
            /* update GTM */
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

          /* Back to search */
          //console.log("Volvemos al search en el prepareResultsHTML")
          self.backToSearch(dataMessage);
        }
      }
    },

    renderResults: function(transferSelected) {
      var self = this;
      var params = this.resultsParams;
      var data = $.extend(true, {}, this.resultsData);
      var template = this.resultsTemplate;
      var listNumberTransfers = [];

      /* Figure out if we have to remove the transfers or not */
     /* if (transferSelected == undefined) transferSelected = AirEuropaConfig.results.defaulttransferSelected;*/

      // console.log("DENTRO DE RENDER RESULTS");
      // console.log(data.totalJourneys);

      /* Create filter transfer */
      if(data.flightsWithScales){
    	  listNumberTransfers = this.getnumberTransfers(data);

    	  if (transferSelected == undefined) transferSelected = listNumberTransfers[0];

      }else{

    	  if (transferSelected == undefined) transferSelected = '0';
      }



      /* Filter json */
      data = this.filterJsonTransfers(data, transferSelected);
      data = this.filterDuplicatFlights(data);
      data = this.orderResults(data);
      data = this.countTotal(data);
      data = this.setGmtDates(data);

      // console.log(data.totalJourneys);

      /* Render the template */
      html = template(data);

      /* Append the results */
      self.appendResults(html, listNumberTransfers, data.flightsWithScales,transferSelected);
    },

    getnumberTransfers: function(data) {
    	var params = this.resultsParams;
    	var listNumberTransfersRT = [];
    	var listNumberTransfersOW = [];
    	var listNumberTransfers = [];
    	var isRt = (data.rtDate != null);
        var isBusiness = (params.business == 'true');
        var flightsToFilter = (isBusiness ? 'BUS' : 'TUR');

    	if (params.view == 'price') {
          $.each(data.prices, function(indexPrice, price) {
    	    $.each(price.journeys.ow, function(indexOwJourney, journey) {
    	    	if (journey.cabinClass == flightsToFilter) {
	    	    	 if (listNumberTransfersOW.indexOf(journey.transfers) == -1) {
	    	    		 listNumberTransfersOW.push(journey.transfers);
	    	    	 }
    	    	}
            });

    	    if (isRt) {
              $.each(price.journeys.rt, function(indexRtJourney, journey) {
      	    	if (journey.cabinClass == flightsToFilter) {
	            	  if (listNumberTransfersRT.indexOf(journey.transfers) == -1) {
	            		  listNumberTransfersRT.push(journey.transfers);
	     	    	 }
      	    	}
              });
    	    }
          });
    	}else if ((params.view == 'hour') || (params.view == 'matriz')) {
          $.each(data.journeys.ow, function(indexOwJourney, journey) {
  	    	if (journey.cabinClass == flightsToFilter) {
	        	 if (listNumberTransfersOW.indexOf(journey.transfers) == -1) {
	        		 listNumberTransfersOW.push(journey.transfers);
	  	    	 }
  	    	}
    	  });

          /* Loop over rt journeys */
    	  if (isRt) {
   	        $.each(data.journeys.rt, function(indexRtJourney, journey) {
    	    	if (journey.cabinClass == flightsToFilter) {
	   	          if (listNumberTransfersRT.indexOf(journey.transfers) == -1) {
	   	        	listNumberTransfersRT.push(journey.transfers);
	    	      }
    	    	}
    	    });
   	        
   	        $.each(listNumberTransfersRT, function(indexTransferRT, transferRT) { 
   	        	if ($.inArray(transferRT, listNumberTransfersOW) != -1) {
   	        		listNumberTransfers.push(transferRT);
   	        	}
   	        });
    	  }else{
    		  listNumberTransfers = listNumberTransfersOW;
    	  }
    	}

    	listNumberTransfers.sort(function(a, b){return a-b});
    	return listNumberTransfers;
    },

    filterJsonTransfers: function(data, transferSelected) {
      var self = this;
      var params = this.resultsParams;
      var totalJourneys = 0;
      var totalPrices = 0;
      var isRt = (data.rtDate != null);
      var isOnlyBusiness = (params.business === 'true');

      /* Remove the direct flights if it's setted, if not, just return the original data which contains them */

      /* Logic for price view */
        if (params.view == 'price') {
          /* Prices to delete helper */
          var pricesToDelete = [];
          var directFlightsLength = 0;
          var rtDirectFlightsLength = 0;

          /* Get direct flights */
          $.each(data.prices, function(indexPrice, price) {
            /* Loop over ow journeys */
            $.each(price.journeys.ow, function(indexOwJourney, journey) {
              if (journey.transfers == transferSelected) {
                if (!isOnlyBusiness) {
                  if (journey.cabinClass == 'TUR') {
                    directFlightsLength += 1;
                  }
                }
                else {
                  directFlightsLength += 1;
                }
              }
            });

            /* Loop over rt journeys */
            if (isRt) {
              $.each(price.journeys.rt, function(indexRtJourney, journey) {
                if (journey.transfers > transferSelected) {
                }
                else {
                  if (!isOnlyBusiness) {
                    if (journey.cabinClass == 'TUR') {
                      rtDirectFlightsLength += 1;
                    }
                  }
                  else {
                    rtDirectFlightsLength += 1;
                  }
                }
              });
            }

          });

          /* Loop over prices */
          $.each(data.prices, function(indexPrice, price) {
            /* Journeys to delete helper */
            var journeysToDelete = [];

            /* Loop over ow journeys */
            $.each(price.journeys.ow, function(indexOwJourney, journey) {
              if (journey.transfers > transferSelected) {
                journeysToDelete.push(indexOwJourney);
              }
            });

            /* Check if we have to apply the filter */
            if ((isRt && (directFlightsLength > 0 && rtDirectFlightsLength > 0)) || (!isRt && directFlightsLength > 0)) {
              /* Delete ow journeys */
              journeysToDelete.reverse();
              $.each(journeysToDelete, function(index, value) {
                data.prices[indexPrice].journeys.ow.splice(value, 1)
              });

              /* If there's a ow+rt flight, filter rt journeys too */
              if (isRt) {
                /* Clean journeys to delete helper */
                journeysToDelete = [];

                /* Loop over rt journeys */
                $.each(price.journeys.rt, function(indexRtJourney, journey) {
                  if (journey.transfers > transferSelected) {
                    journeysToDelete.push(indexRtJourney);
                  }
                });

                /* Delete ow journeys */
                journeysToDelete.reverse();
                $.each(journeysToDelete, function(index, value) {
                  data.prices[indexPrice].journeys.rt.splice(value, 1)
                });
              }
            }

            /* If this price has 0 journeys of ow or rt, delete the price */
            if (data.prices[indexPrice].journeys.ow.length == 0 || (isRt && data.prices[indexPrice].journeys.rt.length == 0)) {
              pricesToDelete.push(indexPrice);
            }

          });

          /* Delete void prices*/
          pricesToDelete.reverse();
          $.each(pricesToDelete, function(index, value) {
            data.prices.splice(value, 1);
          });

          /* Loop over prices in order to figure out the total journeys */
          $.each(data.prices, function(indexPrice, price) {
            totalPrices += 1;
            totalJourneys += data.prices[indexPrice].journeys.ow.length;

            if (isRt) {
              totalJourneys += data.prices[indexPrice].journeys.rt.length;
            }
          });

          /* Update totals */
          data.totalJourneys = totalJourneys;
          data.totalPrices = totalPrices;

          if ((isRt && (directFlightsLength == 0 || rtDirectFlightsLength == 0)) || (!isRt && directFlightsLength == 0)) {
            data.noDirectFlights = true;
          }

        }
        /* Logic for hour view */
        else if ((params.view == 'hour') || (params.view == 'matriz')) {

          /* Create an object copy for filtered prices */
          self.filteredPrices = $.extend(true, {}, self.resultsData.prices);

          /* Journeys to delete helper */
          var journeysToDelete = [];
          var directFlightsLength = 0;
          var rtDirectFlightsLength = 0;
          var pricesToDelete = [];

          /* Loop over ow journeys */
          $.each(data.journeys.ow, function(indexOwJourney, journey) {
            if (journey.transfers > transferSelected) {
              journeysToDelete.push(indexOwJourney);
              pricesToDelete.push(journey.cabinClass + '_' + journey.identity);
            }
            else {
              if (!isOnlyBusiness) {
                if (journey.cabinClass == 'TUR') {
                  directFlightsLength += 1;
                }
              }
              else {
                directFlightsLength += 1;
              }
            }
          });

          /* Loop over rt journeys */
          if (isRt) {
            $.each(data.journeys.rt, function(indexRtJourney, journey) {
              if (journey.transfers > transferSelected) {
              }
              else {
                //console.log(isOnlyBusiness);
                if (!isOnlyBusiness) {
                  if (journey.cabinClass == 'TUR') {
                    rtDirectFlightsLength += 1;
                  }
                }
                else {
                  rtDirectFlightsLength += 1;
                }
              }
            });
          }

          /* Check if we have to apply the filter */
          if ((isRt && (directFlightsLength > 0 && rtDirectFlightsLength > 0)) || (!isRt && directFlightsLength > 0)) {
            /* Delete ow journeys */
            journeysToDelete.reverse();

            $.each(journeysToDelete, function(index, value) {
              data.journeys.ow.splice(value, 1);
            });

            // console.log(pricesToDelete);

            /* Delete prices for ow flights with transfers */
            $.each(data.prices, function(index, value) {
              var owIndex = index.split('-')[0];
              // console.log(owIndex)

              if ($.inArray(owIndex, pricesToDelete) >= 0) {
                // console.log("Hay que borrar", index);
                delete self.filteredPrices[index];
                // console.log(self.filteredPrices[index]);
              }
            });

            /* Update totals */
            data.totalJourneys = totalJourneys;

            /* Figure out the total journeys */
            totalJourneys += data.journeys.ow.length;

            /* If there's a ow+rt flight, filter rt journeys too */
            if (isRt) {

              /* Clean journeys to delete helper */
              journeysToDelete = [];
              pricesToDelete = [];

              /* Loop over rt journeys */
              $.each(data.journeys.rt, function(indexRtJourney, journey) {
                if (journey.transfers > transferSelected) {
                  journeysToDelete.push(indexRtJourney);
                  pricesToDelete.push(journey.cabinClass + '_' + journey.identity);
                }
              });

              /* Delete ow journeys */
              journeysToDelete.reverse();
              $.each(journeysToDelete, function(index, value) {
                data.journeys.rt.splice(value, 1)
              });

              // console.log(pricesToDelete);

              /* Delete prices for ow flights with transfers */
              $.each(data.prices, function(index, value) {
                var rtIndex = index.split('-')[1];
                // console.log(rtIndex)

                if ($.inArray(rtIndex, pricesToDelete) >= 0) {
                  // console.log("Hay que borrar", index);
                  delete self.filteredPrices[index];
                  // console.log(self.filteredPrices[index]);
                }
              });

              /* Figure out the total journeys */
              totalJourneys += data.journeys.ow.length + data.journeys.rt.length;
            }
          }

          // console.log("Vuelos OW directos: " + directFlightsLength);
          // console.log("Vuelos RT directos: " + rtDirectFlightsLength);

          else {
            data.noDirectFlights = true;
          }
          
          if(params.view == 'matriz'){
              var idsRtDelete = [];

              if (isRt) {  
              	
              	var copiJourneysViewRt = data.journeysView.rt.slice();
                
                /* Loop over rt journeys */
                $.each(copiJourneysViewRt, function(indexRTJourney, journey) {
                  if (journey.transfers > transferSelected) {
              	  /*save id*/
//                    idsRtDelete.push(journey.identity);
                	  idsRtDelete.push(indexRTJourney);
                    data.journeysView.rt = self.deleteJourneyView(data.journeysView.rt, journey);
                  }
                });

                var copiJourneysViewOW = data.journeysView.ow.slice();
              
                idsRtDelete.reverse();
                /* Loop over ow journeys */
                $.each(copiJourneysViewOW, function(indexOWJourney, journey) {
                  if (journey.transfers > transferSelected) {
                  	data.journeysView.ow = self.deleteJourneyView(data.journeysView.ow, journey);                	
                  }
                  else {
                   
                    $.each(idsRtDelete, function(index, value) {
                    	journey.pricesView.splice(value, 1);
                    });
                    
                  }
                });
                
            }
          }
          
        }
      return data;
    },

    deleteJourneyView:function(listJourney, journey){
      for (var i = 0, l = listJourney.length; i < l; i++ ) {
        var journeyView =  listJourney[i];
    	if(journey.identity === journeyView.identity){
    	  listJourney.splice(i,1);
    	  return listJourney;
        } 
      }
      return listJourney;
    },
    deletePriceView:function(listPrices, price){
      for (var i = 0, l = listPrices.length; i < l; i++ ) {
    	var priceView = listPrices[i];
  		if(price.rtIdTur === priceView.rtIdTur){
  			listPrices.splice(i, 1);
  		  return listPrices;
  		}
  	  }
      return listPrices;
    },
    
    filterDuplicatFlights: function(data) {
      var isRt = (data.rtDate != null);
      var flightsFound = [];
      var filteredReferences = [];
      var filteredOw = [];
      var params = this.resultsParams;
      var self = this;
      var pricesFlightsListOperatebyAE = [];
      var isBusiness = (params.business == 'true');
      var flightsToFilter = (isBusiness ? 'BUS' : 'TUR');

      if (!isRt) {
        // console.log(data);

        if (params.view == 'price') {
          // console.log("Primer each");
          $.each(data.prices, function(priceIndex, price) {
            var flightsFound = [];
            var filteredReferences = [];
            var filteredOw = [];

            // console.log("---------");

            $.each(price.journeys.ow, function(index, flight) {
              var flightInternalReference = flight.flight + flight.cabinClass + flight.transfers;

              // console.log(flightInternalReference);
              // console.log(flightsFound);
              // console.log("ESTÁ EN EL ARRAY? " + $.inArray(flightInternalReference, flightsFound) < 0)

              /* Search if it's in the price */
              if ($.inArray(flightInternalReference, flightsFound) > -1) {
                filteredReferences[flightInternalReference] = flight;
              }
              else {
                // console.log("Como no está, guardamos la referenncia");
                /* Save the reference in the filtered results */
                filteredReferences[flightInternalReference] = flight;

                /* Save reference in the control array */
                flightsFound.push(flightInternalReference);
              }

            });

            // console.log("<------------------");
            // console.log("El array de resultados queda así:");
            // console.log(filteredReferences);
            // console.log("------------------>");

            for (var flightNumber in filteredReferences) {
              if (filteredReferences.hasOwnProperty(flightNumber)) {
                // console.log(flightNumber + " -> " + filteredReferences[flightNumber]);
                filteredOw.push(filteredReferences[flightNumber]);
              }
            }

            // console.log("<------------------");
            // console.log("El array limpio queda así:");
            // console.log(filteredOw);
            // console.log("------------------>");

            /* Save the filtered ow in the global object */
            data.prices[priceIndex].journeys.ow = filteredOw;

          });


        }
        else if (params.view == 'hour' || params.view == 'matriz') {
          var flightOperatebyAe = [];
          var flightOperatebyAeKeys = [];

          /* Get a flight list grouped by reference, departure hour, cabinType and number of transfers */
          $.each(data.journeys.ow, function(index, flight) {
            var flightReferenceOperatebyAe = [];
            var flightInternalReference = flight.flight + flight.cabinClass + flight.transfers;

            /* For some rare cases:
               - If    flight is BUS
               - and   there are TUR flights that departure at same time
               - and   there aren't TUR flights that have the same duration
               - then  flight must be skipped
            */
            if (flight.cabinClass === 'BUS') {
              var thereAreDeparturesAtSameTime    = false;
              var thereAreFlightsWithSameDuration = false;

              $.each(data.journeys.ow, function(comparationIndex, comparationFlight) {
                if ((comparationFlight.cabinClass === 'TUR') && (comparationFlight.flight === flight.flight)) {
                  thereAreDeparturesAtSameTime = true;
                }

                if ((comparationFlight.cabinClass === 'TUR') && (comparationFlight.transfers === flight.transfers) && (comparationFlight.totalMinutes === flight.totalMinutes)) {
                  thereAreFlightsWithSameDuration = true;
                }
              });

              if (thereAreDeparturesAtSameTime && !thereAreFlightsWithSameDuration) {
                return;
              }
            }

            /* Add 'operated by' info to flight */
            flight.operatebyAe = self.getOperateByAe(flight);
            flight.operatebyAeSomeFragament = self.getOperateByAeSomeFragament(flight);

            if(typeof flightOperatebyAe[flightInternalReference] !== 'undefined'){
              flightReferenceOperatebyAe = flightOperatebyAe[flightInternalReference];
            }

            flightReferenceOperatebyAe.push(flight);
            flightOperatebyAe[flightInternalReference] = flightReferenceOperatebyAe;

            if ($.inArray(flightInternalReference, flightOperatebyAeKeys) == -1) {
              flightOperatebyAeKeys.push(flightInternalReference);
            }
          });

          // console.log("Grouped flight list:");
          // console.log(flightOperatebyAe);

          /* After that, proceed to filter that flight list */
          $.each(flightOperatebyAeKeys, function(index, key) {
            var flightReferenceOperatebyAe = flightOperatebyAe[key];
            var someOperatedbyAe = false;

            $.each(flightReferenceOperatebyAe, function(index, flight) {
              if(flight.operatebyAe){
                someOperatedbyAe = true;
                return;
              }
            });

            if (!someOperatedbyAe) {
              /* Any of them is operated by AE */
              var someOperatedbyAeFragament = false;

              $.each(flightReferenceOperatebyAe, function(index, flight) {
                if (flight.operatebyAeSomeFragament) {
                  someOperatedbyAeFragament = true;
                  return;
                }
              });

              if (!someOperatedbyAeFragament) {
                /* Any of them is partially operatied by AE */

                $.each(flightReferenceOperatebyAe, function(index, flight) {
                  var flightInternalReference = flight.flight + flight.cabinClass + flight.transfers;

                  self.getPrices(flight.cabinClass + '_' + flight.identity, true, function(pricesBlock) {
                    if (flight.cabinClass == "TUR") {
                      flight.calcPrice = pricesBlock.economy.totalAmount;
                    } else if (flight.cabinClass == "BUS") {
                      flight.calcPrice = pricesBlock.business.totalAmount;
                    }
                  });

                  /* Search if it's in the price */
                  if ($.inArray(flightInternalReference, flightsFound) > -1) {
                    /* Compare the price with the same flight */
                    if (flight.calcPrice < filteredReferences[flightInternalReference].calcPrice) {
                      /* Change last flight if necessary */
                      filteredReferences[flightInternalReference] = flight;
                    } else if (flight.calcPrice == filteredReferences[flightInternalReference].calcPrice) {
                      /* Compare the price with the same flight */
                      if (flight.totalMinutes < filteredReferences[flightInternalReference].totalMinutes) {
                        /* Change last flight if necessary */
                        filteredReferences[flightInternalReference] = flight;
                      }
                    }
                  } else {
                    /* Save the reference in the filtered results */
                    filteredReferences[flightInternalReference] = flight;

                    /* Save reference in the control array */
                    flightsFound.push(flightInternalReference);
                  }
                });

              } else {
                /* There're one (or more) flights partially operated by AE */

                $.each(flightReferenceOperatebyAe, function(index, flight) {
                  if(flight.operatebyAeSomeFragament == true) {
	                  var flightInternalReference = flight.flight + flight.cabinClass + flight.transfers;
	
	                  self.getPrices(flight.cabinClass + '_' + flight.identity, true, function(pricesBlock) {
	                    if (flight.cabinClass == "TUR") {
	                      flight.calcPrice = pricesBlock.economy.totalAmount;
	                    }
	                    else if (flight.cabinClass == "BUS") {
	                      flight.calcPrice = pricesBlock.business.totalAmount;
	                    }
	                  });
	
	                  /* Search if it's in the price */
	                  if ($.inArray(flightInternalReference, flightsFound) > -1) {
                        if (flight.calcPrice < filteredReferences[flightInternalReference].calcPrice) {
                          /* Change last flight if necessary */
                          filteredReferences[flightInternalReference] = flight;
                        } else if (flight.calcPrice == filteredReferences[flightInternalReference].calcPrice) {
                          /* Compare the price with the same flight */
                          if (flight.totalMinutes < filteredReferences[flightInternalReference].totalMinutes) {
                            /* Change last flight if necessary */
                            filteredReferences[flightInternalReference] = flight;
                          }
                        }
	                  } else {
                        /* Save the reference in the filtered results */
                        filteredReferences[flightInternalReference] = flight;

                        /* Save reference in the control array */
                        flightsFound.push(flightInternalReference);
	                 }
                  }
                });
              }

            } else {
              /* There're one (or more) flights operated by AE */

              $.each(flightReferenceOperatebyAe, function(index, flight) {
            	if(flight.operatebyAe == true) {
	                var flightInternalReference = flight.flight + flight.cabinClass + flight.transfers;
	
	                self.getPrices(flight.cabinClass + '_' + flight.identity, true, function(pricesBlock) {
	                  if (flight.cabinClass == "TUR") {
	                    flight.calcPrice = pricesBlock.economy.totalAmount;
	                  } else if (flight.cabinClass == "BUS") {
	                    flight.calcPrice = pricesBlock.business.totalAmount;
	                  }
	                });
	
	                /* Search if it's in the price */
	                if ($.inArray(flightInternalReference, flightsFound) > -1) {
	                      if (flight.calcPrice < filteredReferences[flightInternalReference].calcPrice) {
	                        /* Change last flight if necessary */
	                        filteredReferences[flightInternalReference] = flight;
	                      } else if (flight.calcPrice == filteredReferences[flightInternalReference].calcPrice) {
	                        /* Compare the price with the same flight */
	                        if (flight.totalMinutes < filteredReferences[flightInternalReference].totalMinutes) {
	                          /* Change last flight if necessary */
	                          filteredReferences[flightInternalReference] = flight;
	                        }
	                      }
	                } else {
	                      /* Save the reference in the filtered results */
	                      filteredReferences[flightInternalReference] = flight;
	
	                      /* Save reference in the control array */
	                      flightsFound.push(flightInternalReference);
	                }
            	}
              });
            }
          });

          for (var flightNumber in filteredReferences) {
            if (filteredReferences.hasOwnProperty(flightNumber)) {
              filteredOw.push(filteredReferences[flightNumber]);
            }
          }

          // console.log("Filtered flight list:");
          // console.log(filteredOw);

          /* Save the filtered ow in the global object */
          data.journeys.ow = filteredOw;
        }
      }

      return data;
    },

    orderResults: function(data) {
      var self = this;
      var params = this.resultsParams;

      if (params.view == 'price') {
        /* Loop over prices */
        $.each(data.prices, function(indexPrice, price) {
          var ow = price.journeys.ow;
          var rt = price.journeys.rt;

          ow.sort(self.sortJourneys);

          if (rt) {
            rt.sort(self.sortJourneys);
          }
        });
      }

      return data;
    },

    countTotal: function(data) {
      var params = this.resultsParams;
      var totalJourneys = 0;
      var isRt = (data.rtDate != null);
      var owFlightsFound = [];
      var rtFlightsFound = [];

      if (params.view == 'hour' || params.view == 'matriz' ) {
        /* Loop over ow journeys */
        $.each(data.journeys.ow, function(indexOwJourney, journey) {
          var flightInternalReference = journey.flight;

          /* Search if it's in the price */
          if (!($.inArray(flightInternalReference, owFlightsFound) > -1)) {
            /* Save reference in the control array */
            owFlightsFound.push(flightInternalReference);
          }
        });

        /* Loop over rt journeys */
        if (data.journeys.rt) {
          $.each(data.journeys.rt, function(indexOwJourney, journey) {
            var flightInternalReference = journey.flight;

            /* Search if it's in the price */
            if (!($.inArray(flightInternalReference, rtFlightsFound) > -1)) {
              /* Save reference in the control array */
              rtFlightsFound.push(flightInternalReference);
            }
          });
        }
      }

      /* Calc totalJourneys */
      if (owFlightsFound.length == 1 && rtFlightsFound.length < 2) {
        totalJourneys = 1;
      }
      else {
        totalJourneys = 999;
      }

      /* Update totals */
      data.totalJourneys = totalJourneys;

      return data;
    },

    setGmtDates: function(data) {
      var params = this.resultsParams;

      if (params.view == 'hour' || params.view == 'matriz') {
        /* Loop over ow journeys */
        $.each(data.journeys.ow, function(indexOwJourney, journey) {
          journey.gmtDateDeparture = journey.fragments[0].gmtDateDeparture;
          journey.gmtDateArrival = journey.fragments[journey.fragments.length - 1].gmtDateArrival;
        });

        /* Loop over rt journeys */
        if (data.journeys.rt) {
          $.each(data.journeys.rt, function(indexOwJourney, journey) {
            journey.gmtDateDeparture = journey.fragments[0].gmtDateDeparture;
            journey.gmtDateArrival = journey.fragments[journey.fragments.length - 1].gmtDateArrival;
          });
        }

      }
      else {
        $.each(data.prices, function(priceIndex, price) {
          $.each(price.journeys.ow, function(index, journey) {
            journey.gmtDateDeparture = journey.fragments[0].gmtDateDeparture;
            journey.gmtDateArrival = journey.fragments[journey.fragments.length - 1].gmtDateArrival;
          });

          /* Loop over rt journeys */
          if (price.journeys.rt) {
            $.each(price.journeys.rt, function(indexOwJourney, journey) {
              journey.gmtDateDeparture = journey.fragments[0].gmtDateDeparture;
              journey.gmtDateArrival = journey.fragments[journey.fragments.length - 1].gmtDateArrival;
            });
          }

        });
      }

      return data;
    },

    sortJourneys: function(a, b) {
      var aMinutes = a.totalMinutes;
      var bMinutes = b.totalMinutes;
      var aArrivalHour = a.fragments[a.fragments.length - 1].arrival.time;
      var bArrivalHour = b.fragments[b.fragments.length - 1].arrival.time;
      var result = 0;

      if (aMinutes == bMinutes) {
        result = (aArrivalHour < bArrivalHour) ? -1 : (aArrivalHour > bArrivalHour) ? 1 : 0;
      }
      else {
        result = (aMinutes < bMinutes) ? -1 : 1;
      }

      return result;
    },

    appendResults: function(html, listNumberTransfers,flightsWithScales,transferSelected) {
      var params = this.resultsParams;
      var $html = $(html);
      var self = this;

      /* Remove loading status class */
      this.element.find('.process_wrapper_content').addClass('by_' + params.view);

      /* Set just business flag */
      if (params.business == 'true') {
        this.element.find('.process_wrapper_content').removeClass('economy_and_business').addClass('only_business');
      }
      else {
        this.element.find('.process_wrapper_content').removeClass('only_business').addClass('economy_and_business');
      }

      /* Reset parent content */
      this.element.find('.process_wrapper_content .results_scroll').find('.results_topbar').remove();
      this.element.find('.process_wrapper_content .results_scroll').append($html.find('.results_topbar'))

      /* Append the html to results_content div */
      this.element.find('.process_wrapper_content .results_scroll').append($html.find('.results_content').hide().fadeIn(500));

      /* Hide the rt group if it's just ow travel */
      if (this.element.find('.journeys_group.rt').find('.journey').length == 0) this.element.find('.process_wrapper_content').addClass('no_rt')
      else this.element.find('.process_wrapper_content').removeClass('no_rt')

      /* Default behaviour for flights with transfers */
      if (flightsWithScales){
    	  var options = '';
    	  $.each(listNumberTransfers, function(indexTransfer, transfer) {
    		  if (transfer == transferSelected) {
					var option = '<li><a href = "#" id = transfer_'+ transfer +' class ="selected">'+lang('result.filters_optinons_'+transfer)+'</a></li>';
				} else {
					var option = '<li><a href = "#" id = transfer_'+ transfer +'>'+lang('result.filters_optinons_'+transfer)+'</a></li>';
				}
				options = options + option;
    	  });
    	  this.element.find('.results_topbar .filters .expand_transfers').prepend(options);
      }

      /* Mark first results as active */
      this.element.find('.result').eq(0).addClass('active');

      /* Hide loader */
      this.element.find('.loading_content').fadeOut(800, function() {
        self.element.find('.process_wrapper_content').removeClass('loading local_loading');
        self.element.find('.loading_content').attr('style', '');
      });

      /* Init Result process */
      Bus.publish('results', 'USA_custom_init');
    },

    backToSearch: function(message) {
      var searchProcessURL = getProcessUrl('search');
      var $searchForm = this.element.find('.search_form[data-process-name=search]');
      var $airportFrom = $searchForm.find('.airport.from');
      var $airportTo = $searchForm.find('.airport.to');
      var departureAirport = getData(this.resultsParams.from);
      var arrivalAirport = getData(this.resultsParams.to);
      var owDate = new Date(this.resultsParams.ow.replace(/\-/g, '/'));
      //var owFormatted = owDate.getDate() + ' ' + lang('dates.monthsNames_' +owDate.getMonth());
      var owFormatted = lang('dates.dayNamesMin_' + owDate.getDay()) + ' ' + owDate.getDate() + ' ' + lang('dates.monthsNames_' + owDate.getMonth()).substr(0, 3);
      var $calendarOw = $searchForm.find('.calendar.ow');
      var $calendarRt = $searchForm.find('.calendar.rt');
      var rtFormatted = '';
      var rtOriginalDate = '';
      var rtDate;

      /* Update form airports with last search params*/
      $airportFrom.find('.code').val(this.resultsParams.from);
      $airportFrom.find('.helper').val(departureAirport.description);
      $airportTo.find('.code').val(this.resultsParams.to);
      $airportTo.find('.helper').val(arrivalAirport.description);

      /* Update form dates with last search params */
      $calendarOw.addClass('filled').addClass('filled').find('.input .placeholder').text(owFormatted);
      $calendarOw.addClass('filled').find('.input input').val(this.resultsParams.ow);

      /* Rt date */
      if ((this.resultsParams.rt != 'false')) {
        rtOriginalDate = this.resultsParams.rt;
        rtDate = new Date(this.resultsParams.rt.replace(/\-/g, '/'));
        //rtFormatted = rtDate.getDate() + ' ' + lang('dates.monthsNames_' + rtDate.getMonth());
        rtFormatted = lang('dates.dayNamesMin_' + rtDate.getDay()) + ' ' + rtDate.getDate() + ' ' + lang('dates.monthsNames_' + rtDate.getMonth()).substr(0, 3);

        $calendarRt.addClass('filled').find('.input .placeholder').text(rtFormatted);
        $calendarRt.addClass('filled').find('.input input').val(rtOriginalDate);
      }

      /* Set message error */
      if (message) {
        if (this.element.find('.search_flights > .error_message').length == 0) {
          this.element.find('.search_flights').prepend('<div class="error_message"><p><span>' + message + '</span></p></div>');
        }
        else {
          this.element.find('.search_flights > .error_message').empty().append('<p><span>' + message + '</span></p>');
        }
      }

      Bus.publish('hash', 'change', {hash: searchProcessURL });

    },

    getResultsData: function() {
      Bus.publish('results', 'USA_set_results_data', {
        resultsData: this.resultsData,
        resultsParams: this.resultsParams
      });
    },

    cleanResultsData: function() {
      /* Reset results data */
      this.resultsData = {};
      Bus.publish('results', 'USA_set_results_data', {resultsData: this.resultsData});

      this.results.hash = '';
      this.results.data = {};

      //console.log("limpiamos resultados");
      //console.log(this.resultsData);
    },

    getPrices: function(flights, by_hour, callback) {
      /* Just get the prices if it's a by_hour view */
      if (by_hour) {
        // console.log("Prices pedidos son: " + flights);
        var pricesBlock = this.resultsData.prices[flights];

        // console.log("El bloque contiene");
        // console.log(pricesBlock);
        // console.log("----------------------------------");

        if (typeof callback == 'function') {
          callback(pricesBlock);
        }
      }
    },
    
    getFlightsClass: function(pricesFlightsListOperatebyAE, flightsToFilter) {
    	for (var i = 0, l = pricesFlightsListOperatebyAE.length; i < l; i++ ) {
    		var ids = pricesFlightsListOperatebyAE[i];
    		if(ids.indexOf(flightsToFilter) !== -1) {
    			return true;
    		}
    	}
    	return false;
    },

    getCheapestPrice: function(callback) {
      var self = this;
      var lowestPrice = 999999999;
      var lowestDuration = 999999999;
      var cheapestPricesFlightsList = [];
      var cheapestPricesFlightsListIds = [];
      var cheapestShortestPricesFlightsList = [];
      var cheapestShortestPricesFlightsListIds = [];
      var cheapestShortestFirstPricesFlightsList = [];
      var cheapestShortestFirstPricesFlightsListIds = [];
      var cheapestShortestFirstLatestPricesFlightsList = [];
      var cheapestShortestFirstLatestPricesFlightsListIds = [];
      var pricesFlightsListOperatebyAE = [];
      var firstFlightDeparture = "23:59";
      var firstFlightDepartureRT = "00:00";
      var firstFlightArrivalOw = "23:59";
      var lastFlightDeparture = "00:00";
      var firstFlightGapOw = 10;
      var params = this.resultsParams;
      var isBusiness = (params.business == 'true');
      var flightsToFilter = (isBusiness ? 'BUS' : 'TUR');

      // console.log(this.filteredPrices);

      /* Get the all frgaments flights operate by airEuropa*/
      _.each(this.filteredPrices, function(currentPriceBlock, index, list) {
        var currentFlightIndex = self.getIndexesFromKey(index);
    	  var operatebyAe = true;

          /* Loop over ow flights */
          _.each(self.resultsData.journeys.ow, function(thisFlight) {
            if (thisFlight.cabinClass == currentFlightIndex.cabinClass && thisFlight.identity == currentFlightIndex.ow) {
            	operatebyAe = self.getOperateByAe(thisFlight);
            	return operatebyAe;
            }
          });

          if(operatebyAe){
	          /* Loop over rt flights */
	          if (currentFlightIndex.rt !== undefined) {
	            _.each(self.resultsData.journeys.rt, function(thisFlight) {
	              if (thisFlight.cabinClass == currentFlightIndex.cabinClass && thisFlight.identity == currentFlightIndex.rt) {
                  operatebyAe = self.getOperateByAe(thisFlight);
                  return operatebyAe;
	              }
	            });
	          }
           }

          if(operatebyAe){
        	  pricesFlightsListOperatebyAE.push(index);
          }

      });

//      if(pricesFlightsListOperatebyAE.length == 0 || !self.getFlightsClass(pricesFlightsListOperatebyAE, flightsToFilter)){
      if(pricesFlightsListOperatebyAE.length == 0){

    	  /* Get the any frgaments flights operate by airEuropa*/
    	  _.each(this.filteredPrices, function(currentPriceBlock, index, list) {
        	  var currentFlightIndex = self.getIndexesFromKey(index);
        	  var operatebyAe = false;

              /* Loop over ow flights */
              _.each(self.resultsData.journeys.ow, function(thisFlight) {
               if (thisFlight.cabinClass == currentFlightIndex.cabinClass && thisFlight.identity == currentFlightIndex.ow) {
                	operatebyAe = self.getOperateByAeSomeFragament(thisFlight);
                	return operatebyAe;
                }
              });

              if(!operatebyAe){
    	          /* Loop over rt flights */
    	          if (currentFlightIndex.rt !== undefined) {
    	            _.each(self.resultsData.journeys.rt, function(thisFlight) {
     	              if (thisFlight.cabinClass == currentFlightIndex.cabinClass && thisFlight.identity == currentFlightIndex.rt) {
    	            	  operatebyAe = self.getOperateByAeSomeFragament(thisFlight);
    	            	  return operatebyAe;
    	              }
    	            });
    	          }
               }

              if(!operatebyAe){
            	  pricesFlightsListOperatebyAE.push(index);
              }

          });
      }

      /* Get the chapest prices */
      _.each(this.filteredPrices, function(currentPriceBlock, index, list) {
        var priceToEval;

//        if((pricesFlightsListOperatebyAE.length == 0 || !self.getFlightsClass(pricesFlightsListOperatebyAE, flightsToFilter)) || 
//        		pricesFlightsListOperatebyAE.indexOf(index) !== -1){
          if(pricesFlightsListOperatebyAE.length == 0 || pricesFlightsListOperatebyAE.indexOf(index) !== -1){

//          if (index.indexOf(flightsToFilter) >= 0) { /* Skip business flights */

            if (isBusiness) {
              priceToEval = currentPriceBlock.business.totalAmount;
            }
            else {
              if(currentPriceBlock.economy){
                priceToEval = currentPriceBlock.economy.totalAmount;
              }else if(currentPriceBlock.business){
            	priceToEval = currentPriceBlock.business.totalAmount;
              }
              
            }

            /* If the price is lower, change the results array */
            if (priceToEval < lowestPrice) {
              lowestPrice = priceToEval;
              cheapestPricesFlightsList = [index];
              return;
            }

            /* If the price is the same price, add the flight to the results */
            else if (priceToEval === lowestPrice) {
              lowestPrice = priceToEval;
              cheapestPricesFlightsList.push(index);
              return;
            }
//          }
        }

      });

      // console.log(cheapestPricesFlightsList);

      /* If there's just one, select it */
      if (cheapestPricesFlightsList.length == 1) {
        /* Get ids and Execute callback */
        if (typeof callback == 'function') {
          _.each(cheapestPricesFlightsList, function(currentIndex) {
            var currentFlightIndex = self.getIndexesFromKey(currentIndex);
            cheapestPricesFlightsListIds.push(currentFlightIndex);
          });
          callback(isBusiness, cheapestPricesFlightsListIds);
        }

        return;
      }
    
        /* If there's more than one, the first one and last one */
        else {
          

          /* Find the flight more time on the arrival */
          _.each(cheapestPricesFlightsList, function(currentIndex) {
            var currentFlightIndex = self.getIndexesFromKey(currentIndex);
            var currentTimeArrivalOw;
            var currentTimeDepartureRt;
            var currentGapOw;

            /* Loop over ow flights */
            _.each(self.resultsData.journeys.ow, function(thisFlight) {
              if (thisFlight.cabinClass == currentFlightIndex.cabinClass && thisFlight.identity == currentFlightIndex.ow) {
                currentTimeArrivalOw = thisFlight.timeArrival;
                currentGapOw = thisFlight.gapArrival;
                return false;
              }
            });
            
            if(self.resultsData.journeys.rt){
	          /* Loop over ow flights */
	          _.each(self.resultsData.journeys.rt, function(thisFlight) {
	            if (thisFlight.cabinClass == currentFlightIndex.cabinClass && thisFlight.identity == currentFlightIndex.rt) {
	              currentTimeDepartureRt = thisFlight.timeDeparture;
	              return false;
	            }
	          });
	          
	          // console.log(currentTimeDeparture + " ---- " +  firstFlightDeparture);
	          	
	           /* Check time arrival jpourney ow, gap journey ow and time departure journey rt (more time on the arrival)*/
	           if((currentGapOw < firstFlightGapOw) || (currentGapOw === firstFlightGapOw)){
	             if ((currentTimeArrivalOw < firstFlightArrivalOw) && (currentTimeDepartureRt > firstFlightDepartureRT)
	            		|| (currentTimeArrivalOw < firstFlightArrivalOw)  && (currentTimeDepartureRt === firstFlightDepartureRT)
	            		|| (currentTimeArrivalOw === firstFlightArrivalOw)  && (currentTimeDepartureRt > firstFlightDepartureRT)) {
	            	
	            	  firstFlightGapOw = currentGapOw;
		              firstFlightArrivalOw = currentTimeArrivalOw
		              firstFlightDepartureRT=currentTimeDepartureRt
		              cheapestShortestFirstPricesFlightsList = [currentIndex];
		              return;
	              }
	            }

	            if ((currentTimeArrivalOw === firstFlightArrivalOw) && (currentTimeDepartureRt === firstFlightDepartureRT) && (currentGapOw === firstFlightGapOw)) {
	              firstFlightArrivalOw = currentTimeArrivalOw
		          firstFlightDepartureRT=currentTimeDepartureRt
	              cheapestShortestFirstPricesFlightsList.push(currentIndex);
	              return;
	            }
	          
            }
            /*Only journyes ow*/
            else{
              
             /* Check time arrival journey Ow and gap*/
              if ((currentTimeArrivalOw < firstFlightArrivalOw) && ((currentGapOw < firstFlightGapOw) || (currentGapOw === firstFlightGapOw))) {
            	  firstFlightGapOw = currentGapOw;
            	  firstFlightArrivalOw = currentTimeArrivalOw;
                cheapestShortestFirstPricesFlightsList = [currentIndex];
                return;
              }

              if (currentTimeArrivalOw === firstFlightArrivalOw && (currentGapOw === firstFlightGapOw)) {
            	  firstFlightGapOw = currentGapOw;
            	  firstFlightArrivalOw = currentTimeArrivalOw;
                cheapestShortestFirstPricesFlightsList.push(currentIndex);
                return;
              }
            }
          });
          /* If there's just one, select it */
          if (cheapestShortestFirstPricesFlightsList.length == 1) {
            /* Get ids and Execute callback */
            if (typeof callback == 'function') {
              _.each(cheapestShortestFirstPricesFlightsList, function(currentIndex) {
                var currentFlightIndex = self.getIndexesFromKey(currentIndex);
                cheapestShortestFirstPricesFlightsListIds.push(currentFlightIndex);
              });
              callback(isBusiness, cheapestShortestFirstPricesFlightsListIds);
            }
            return;
          }
          /* If there's more than one, check the duration ow (+ rt) */
          else {
            // console.log("Hay más de uno");
            // console.log("---------------")

            /* Check the duration ow (+ rt) */
            _.each(cheapestShortestFirstPricesFlightsList, function(currentIndex) {
              var currentFlightIndex = self.getIndexesFromKey(currentIndex);
              var currentFlightDuration = 0;

              // console.log(currentFlightIndex);
              // console.log(currentIndex)

              /* Loop over ow flights */
              _.each(self.resultsData.journeys.ow, function(thisFlight) {
               if (thisFlight.cabinClass == currentFlightIndex.cabinClass && thisFlight.identity == currentFlightIndex.ow) {
                  currentFlightDuration += thisFlight.totalMinutes;
                  // console.log("Duración OW", thisFlight.totalMinutes)
                  return false;
                }
              });

              /* Loop over rt flights */
              if (currentFlightIndex.rt !== undefined) {
                _.each(self.resultsData.journeys.rt, function(thisFlight) {
                  if (thisFlight.cabinClass === currentFlightIndex.cabinClass && thisFlight.identity == currentFlightIndex.rt) {
                    currentFlightDuration += thisFlight.totalMinutes;
                    // console.log("Duración RT", thisFlight.totalMinutes)
                    return false;
                  }
                });
              }

              // console.log(currentFlightDuration)
              // console.log("---------------")

              /* Get the cheapest and shortest */
              if (currentFlightDuration < lowestDuration) {
                lowestDuration = currentFlightDuration;
                cheapestShortestPricesFlightsList = [currentIndex];
                return;
              }

              if (currentFlightDuration === lowestDuration) {
                lowestDuration = currentFlightDuration;
                cheapestShortestPricesFlightsList.push(currentIndex);
                return;
              }

            });

            // console.log(cheapestShortestPricesFlightsList)

            /* If there's just one, select it */
            if (cheapestShortestPricesFlightsList.length == 1) {
              /* Get ids and Execute callback */
              if (typeof callback == 'function') {
                _.each(cheapestShortestPricesFlightsList, function(currentIndex) {
                  var currentFlightIndex = self.getIndexesFromKey(currentIndex);
                  cheapestShortestPricesFlightsListIds.push(currentFlightIndex);
                });
                callback(isBusiness, cheapestShortestPricesFlightsListIds);
              }
          
            }else{
              if (typeof callback == 'function') {
                _.each(cheapestShortestFirstPricesFlightsList, function(currentIndex) {
                  var currentFlightIndex = self.getIndexesFromKey(currentIndex);
                  cheapestShortestFirstPricesFlightsListIds.push(currentFlightIndex);
                });
               // console.log("Llamada: " + JSON.stringify(cheapestShortestFirstPricesFlightsListIds);
                callback(isBusiness, cheapestShortestFirstPricesFlightsListIds);
              }
            }
            return;
        }
        
      }
     
    },

    getOperateByAe: function(thisFlight){
    	for (var i = 0, l = thisFlight.fragments.length; i < l; i++ ) {
    		var fragment = thisFlight.fragments[i];
    		if(typeof fragment.operatedBy !== 'undefined' && fragment.operatedBy !== '0'){
    			return false;
    		}
    	}
    	return true;
    },

    getOperateByOtherCia: function(thisFlight){
    	var operatebyAe = true;
    	for (var i = 0, l = thisFlight.fragments.length; i < l; i++ ) {
    		var fragment = thisFlight.fragments[i];
    		if(typeof fragment.operatedBy !== 'undefined' && fragment.operatedBy !== '0'){
    			return true;
    		}
    	}
    	return false;
    },
    
    getOperateByAeSomeFragament: function(thisFlight){
    	for (var i = 0, l = thisFlight.fragments.length; i < l; i++ ) {
    		var fragment = thisFlight.fragments[i];
    		if(typeof fragment.operatedBy !== 'undefined' && fragment.operatedBy == '0'){
    			return true;
    		}
    	}
    	return false;
    },

    getIndexesFromKey: function(key) {
      var indexes = {
        ow: undefined
      };

      if (key.indexOf('-') >= 0) {
        /* Ow index */
        indexes.ow = parseInt(key.substring(4, key.indexOf('-'))); // 4 is the length of TUR_ and BUS_
        /* Rt index */
        indexes.rt = parseInt(key.substring(key.indexOf('-') + 1 + 4)); // 4 is the length of TUR_ and BUS_
      }
      else {
        indexes.ow = parseInt(key.substring(4));
      }
      
      /*Class index*/
      indexes.cabinClass= key.substring(0,3);

      return indexes;
    },

    getBestBusinessIds: function(possibleIds, callback) {
      var bestFlight = undefined;
      var lowestPrice = 9999999;
      var self = this;

      $.each(possibleIds, function(indexIds, ids) {
        // console.log("Recorremos ids:")
        // console.log(ids);

        var pricesBlock = self.resultsData.prices['BUS_' + ids.busId + '-BUS_' + ids.otherBusId];

        /* Save lowest price */
        if (pricesBlock && pricesBlock.business && pricesBlock.business.totalAmount) {
          if (pricesBlock.business.totalAmount < lowestPrice) {
            lowestPrice = pricesBlock.business.totalAmount;
            bestFlight = {
              busId: ids.busId,
              otherBusId: ids.otherBusId
            };
          }
        }
        else {
          //console.log("No se ha encontrado el objeto: " + 'BUS_' + ids.busId + '-BUS_' + ids.otherBusId)
        }
      });

      if (typeof callback == 'function') {
        callback(bestFlight);
      }
    },

    getCheckoutData: function() {
      Bus.publish('checkout', 'set_checkout_data', {checkoutCache: this.checkoutCache});
    },

    getAllCheapestPrice:function(callback){
        var self = this;
        var lowestPrice = 999999999;
        var cheapestPricesFlightsList = [];
        var cheapestPricesFlightsListIds=[];
        var params = this.resultsParams;
        var isBusiness = (params.business == 'true');
        var flightsToFilter = (isBusiness ? 'BUS' : 'TUR');


    	 /* Get the chapest prices */
        _.each(this.filteredPrices, function(currentPriceBlock, index, list) {
          var priceToEval;

          if (index.indexOf(flightsToFilter) >= 0) { /* Skip business flights */

            if (isBusiness) {
              priceToEval = currentPriceBlock.business.totalAmount;
            }
            else {
              priceToEval = currentPriceBlock.economy.totalAmount;
            }

            /* If the price is lower, change the results array */
            if (priceToEval < lowestPrice) {
              lowestPrice = priceToEval;
              cheapestPricesFlightsList = [index];
              return;
            }

            /* If the price is the same price, add the flight to the results */
            else if (priceToEval === lowestPrice) {
              lowestPrice = priceToEval;
              cheapestPricesFlightsList.push(index);
              return;
            }
          }
        });

        _.each(cheapestPricesFlightsList, function(currentIndex) {
            var currentFlightIndex = self.getIndexesFromKey(currentIndex);
            cheapestPricesFlightsListIds.push(currentFlightIndex);
        });

        /* Get ids and Execute callback */
        if (typeof callback == 'function') {
          callback(isBusiness, cheapestPricesFlightsListIds);
        }

        return;

    },
    
    getAllCheapestPriceVisible:function(listJourneyVisibleIdsOW, listJourneyVisibleIdsRT, callback){
    	var params = this.resultsParams;
        var isBusiness = (params.business == 'true');
    	var data = $.extend(true, {}, this.resultsData);
        
    	var cheapestPricesFlightsListIdsOW = this.getChapestPriceList(isBusiness,listJourneyVisibleIdsOW, data.journeys.ow);
        var cheapestPricesFlightsListIdsRT = this.getChapestPriceList(isBusiness,listJourneyVisibleIdsRT, data.journeys.rt);
        
        /* Get ids and Execute callback */
        if (typeof callback == 'function') {
          callback(isBusiness, cheapestPricesFlightsListIdsOW,cheapestPricesFlightsListIdsRT);
        }

        return;
    },
    
    getChapestPriceList: function(isBusiness,listJourneyVisibleIds, listJourney) {
    	 var self = this;
         var lowestPrice = 999999999;
         var cheapestPricesFlightsList = [];
         var cheapestPricesFlightsListIds=[];
         var flightsToFilter = (isBusiness ? 'BUS' : 'TUR');
    	
    	/* Get the chapest prices journeys list */
        _.each(listJourneyVisibleIds, function(idVisible, index, list) {
        	
          _.each(listJourney, function(journey, index, list) {	
          
            var id = journey.cabinClass +'_'+ journey.identity;
            if(id === idVisible){
              var priceToEval;

              if (id.indexOf(flightsToFilter) >= 0) { /* Skip business flights */

                if (isBusiness) {
                  priceToEval = journey.price.business.totalAmount;
                }
                else {
                  priceToEval = journey.price.economy.totalAmount;
                }

                /* If the price is lower, change the results array */
                if (priceToEval < lowestPrice) {
                  lowestPrice = priceToEval;
                  cheapestPricesFlightsList = [id];
                return;
                }

                /* If the price is the same price, add the flight to the results */
                else if (priceToEval === lowestPrice) {
                  lowestPrice = priceToEval;
                  cheapestPricesFlightsList.push(id);
                  return;
                }
              }
            }
          });
        });
        
        _.each(cheapestPricesFlightsList, function(currentIndex) {
            var currentFlightIndex = self.getIndexesFromKey(currentIndex);
            cheapestPricesFlightsListIds.push(currentFlightIndex);
        });
        
        return cheapestPricesFlightsListIds;
	},

    prepareDefaultMinisearch: function() {
      var params = this.resultsParams;
      var $miniSearch = this.element.find('.mini_search');
      
      //params.channel = '';

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
      var $business = $miniSearch.find('.options .business');
      var $channel = $miniSearch.find('.channel');

      /* Prepare airport from */
      var departureAirport = getData(params.from);
      $airportFrom.find('.code').val(params.from);
      $airportFrom.find('.helper').val(departureAirport.description);
      $airportFrom.find('.editable').text(departureAirport.description);
      if (departureAirport.zone == 'NAC') $airportFrom.addClass('national');
      if (departureAirport.resident) $airportFrom.addClass('resident');

      /* Prepare airport to */
      var arrivalAirport = getData(params.to);
      $airportTo.find('.code').val(params.to);
      $airportTo.find('.helper').val(arrivalAirport.description);
      $airportTo.find('.editable').text(arrivalAirport.description);
      if (arrivalAirport.zone == 'NAC') $airportTo.addClass('national');
      if (arrivalAirport.resident) $airportTo.addClass('resident');

      /* Ow date */
      var owDate = new Date(params.ow.replace(/\-/g, '/'));
      var owFormatted = owDate.getDate() + ' ' + lang('dates.monthsNames_' +owDate.getMonth());
      $calendarOw.find('.input .placeholder').text(owFormatted);
      $calendarOw.find('.input input').val(params.ow);

      /* Rt date */
      var rtFormatted = '';
      var rtOriginalDate = '';
      if ((params.rt != 'false')) {
        var rtOriginalDate = params.rt;
        var rtDate = new Date(params.rt.replace(/\-/g, '/'));
        rtFormatted = rtDate.getDate() + ' ' + lang('dates.monthsNames_' + rtDate.getMonth());
      }
      else {
        rtFormatted = $calendarRt.attr('data-default') || '';
      }

      $calendarRt.find('.input .placeholder').text(rtFormatted);
      $calendarRt.find('.input input').val(rtOriginalDate);

      /* Passengers */
      $totalCounter.text(parseInt(params.adults) + parseInt(params.kids) + parseInt(params.babies));
      $adults.val(params.adults);
      $adultsPlaceholder.text(params.adults);
      if (params.kids) {
        $kids.val(params.kids);
        $kidsPlaceholder.text(params.kids);
      }
      if (params.babies) {
        $babies.val(params.babies);
        $babiesPlaceholder.text(params.babies);
      }

      /* Resident and business */
      var residentVisibility = false;
      if (departureAirport.zone == 'NAC' &&
          arrivalAirport.zone == 'NAC' &&
          (
            departureAirport.resident || arrivalAirport.resident
          )) {
        residentVisibility = true;
        $resident.show();
      }
      else {
        $resident.hide();
      }

      if (params.resident == 'true' && residentVisibility == true) {
        if ($resident.find('input').prop('checked') == false) {
          $resident.find('input').prop('checked', true).change();
        }
      }
      else {
        if ($resident.find('input').prop('checked') == true) {
          $resident.find('input').prop('checked', false).change();
        }
      }

      if (params.business == 'true') {
        if ($business.find('input').prop('checked') == false) {
          $business.find('input').prop('checked', true).change();
        }
      }
      else {
        if ($business.find('input').prop('checked') == true) {
          $business.find('input').prop('checked', false).change();
        }
      }

      /* Channel */
      $channel.val(params.channel);
     
    }

  };
});
