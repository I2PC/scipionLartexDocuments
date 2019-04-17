Hydra.module.register('Results', function(Bus, Module, ErrorHandler, Api) {

  return {
    selector: '#results',
    element: undefined,
    resultsData: undefined, /* Cache the last data results */
    resultsParams: undefined, /* Cache the last search */
    templateData: undefined, /* Cache the last template data */
    hash: undefined,

    events: {
      'results': {
        'custom_init': function() {
          this.customInit();

          Bus.publish('prerender', 'restart');
        },
        'set_results_data': function(oNotify) {
          this.setResultsData(oNotify);
        }
      }
    },



    init: function() {
      this.customInit();
    },



    customInit: function() {
      var self = this;

      /* Save jquery object reference */
      this.element = $(this.selector);

      if (this.element.length > 0) {
        /* Avoid duplicate event listeners */
        this.element.find('.results_scroll').off('scroll.results');
        this.element.off('click.results');

        /* Get results data from controller */
        Bus.publish('process', 'get_results_data');

        /* Init mini search, delegate it's control to Search module */
        this.initMiniSearch();

        /* Init banner with search information*/
        this.initSearchHeader();

        /* Toggle minisearch */
        this.toggleMinisearch();

        /* Show a modal window if the user is logged in and selected a resident discount */
        this.showResidentDiscountWarning();

        /* Listener when user change scales filter */
        this.initTransfersFilter();

        /* Init day before and after controls */
        this.initDayBeforeAfterControls();

        /* Set all visual effects */
        this.setVisualEffects();

        /* Listen overlay */
        this.listenResultsOverlay();

        /* Select journey listeners */
        this.setJourneysListeners();

        /* Pre selección de vuelos */
        //this.markPreselectedJourneys();

        /*Disabled button block booking*/
        this.initButtonBlockBooking();

        /* Bloqueo de vuelos */
        this.blockBookingListener();

        /* Lightbox actions listener */
        this.lightboxListener();

        /* Interbalearic rates Options */
        this.showInterbalearicRatesOptions();

        /* Expand details in itemization module*/
        this.element.find('.flight_details').trigger('click');

        /* Set initial scroll position to the beginning of the page */
        this.element.find('.results_scroll').animate({ scrollTop: 0 }, 0);

        /* Setting on.scroll events for prices modules */
        this.customPricesModulesScroll();

      }
    },



    /*
     * Set data returned from availability service.
     */
    setResultsData: function(oNotify) {
      this.resultsData = oNotify.resultsData;
      this.resultsParams = oNotify.resultsParams;
      this.templateData = oNotify.templateData;
    },



    /*
     * Add and show seach info in header.
     */
    initSearchHeader: function() {
      $(".process_top_bar").css("display", "block");

      var searchInfo = this.templateData.searchInfo;
      var searchParams = this.resultsParams;
      var isRt = this.templateData.isRt;

      var countAdult = (searchParams.paxAdultResident > 0) ? searchParams.paxAdultResident : searchParams.paxAdult;
      var countChild = (searchParams.paxChildResident > 0) ? searchParams.paxChildResident : searchParams.paxChild;
      var countInfant = (searchParams.paxInfantResident > 0) ? searchParams.paxInfantResident : searchParams.paxInfant;
      var numberOfPassengers = (parseInt(countAdult) + parseInt(countChild) + parseInt(countInfant));

      var textOw = searchInfo.from +" ("+ searchParams.airportDeparture +")";
      var textRt = searchInfo.to   +" ("+ searchParams.airportArrival   +") ";
      var textOwDate = searchInfo.departure.day +" "+ searchInfo.departure.month.substring(0, 3);

      $('.title-personas').html(numberOfPassengers);
      $('.title-ruta').html(textOw);
      $('.title-ruta2').html(textRt);
      $('.title-date1').html(textOwDate);

      $('.title-editable').show();

      /* If it's an RT search */
      if (isRt) {
        var textRtDate = searchInfo.arrival.day +" "+ searchInfo.arrival.month.substring(0, 3);

        $('.title-date2').html(textRtDate);
      } else {
        $('.title-vuelta').hide();
      }

      if (numberOfPassengers > 1) {
        $('.alonep').hide();
      } else {
        $('.multiplep').hide();
      }
    },



    /*
     * Initialize mini search.
     */
    initMiniSearch: function() {
      var self = this;
      var $miniSearchOptions = this.element.find('.mini_search form .options');

      this.element.find('.mini_search form').form({
        triggerValidate: true,

        onSubmit: function() {

          /* Get form vars */
          var fromCode = this.element.find('.airport.from .input .code').val();
          var toCode = this.element.find('.airport.to .input .code').val();
          var ow = this.element.find('.dates .ow .input input').val();
          var rt = this.element.find('.dates .rt .input input').val() || 'false';
          var adults = this.element.find('.passengers .passengers_input .counter_adults').val();
          var kids = this.element.find('.passengers .passengers_input .counter_kids').val() || '0';
          var babies = this.element.find('.passengers .passengers_input .counter_babies').val() || '0';
          var young = this.element.find('.passengers .passengers_input .counter_young').val() || '0';
          var senior = this.element.find('.passengers .passengers_input .counter_senior').val() || '0';
          var federated = this.element.find('.passengers .passengers_input .counter_federated').val() || '0';
          var medical = this.element.find('.passengers .passengers_input .counter_medical').val() || '0';
          var resident = this.element.find('.options .checkbox.resident input').is(':checked') || 'false';
          var interislasCode = this.element.find('.inter_discount:not(.hidden) .inter_detail .inter_checks .field.radio.checked input').first().attr('id') || false;
          var flightsProcessURL = getProcessUrl('flights');


          var codigoColectivo = '';
          var $passengersInput = this.element.find('.passengers_counter .social_rate');

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

          /* TODO: quizas haya que eliminarlo */
          url += '/business/false';

          if(codigoColectivo != ''){
            url += '/colective/' + codigoColectivo;  
          }


          /*
          var currentHash = window.location.hash.substr(2);
          if (currentHash.indexOf('/view') > 0) {
            if (currentHash.indexOf('/view/hour') > 0) {
                url += '/view/hour';
              }
              else if (currentHash.indexOf('/view/price') > 0) {
                url += '/view/price';
              }
              else if (currentHash.indexOf('/view/matriz') > 0) {
                url += '/view/matriz';
              }
          }
          */

          if ($('#results').hasClass('form_changed')){
            $('.mini_search').css({position:'absolute',bottom:'',bottom:0});
            $('.mini_search').animate({bottom:80},500);
            if($('html').hasClass('ie11') || $('html').hasClass('ie10') || $('html').hasClass('ie9') || $('html').hasClass('ie8') || $('html').hasClass('ie7') || $('html').hasClass('ie6')) {
              $('.mini_search').css({bottom:80,'animation-name':'','animation-duration':'','animation-fill-mode':''});
            }
            $('.resume .header').fadeIn();

            var $resume = self.element.find('.resume');
            $resume.stop(true, false).animate({
              'height': 0
            }, 500, 'easeInOutExpo', function() {
              $resume.removeClass('opened');
              $('.process_top_bar').css('z-index', 4);
            });
          };

          /* Navigate to URL */
          Bus.publish('hash', 'change', {hash: flightsProcessURL + '/' + url });

          /* Clear form_changed status */
          setTimeout(function() {
            self.element.removeClass('form_changed');
          }, 50);
          $('#search_form_from').val(fromCode);
          $('#search_form_to').val(toCode);
        }
      });

      /* Control language hover for touch, due to an iPad bug in portrait */
      if (Modernizr.touch) {
        $miniSearchOptions.on('touchend', function(event) {
          $miniSearchOptions.addClass('active');

          $('body').off('touchend').on('touchend', function(event) {
            if ($(event.target).closest('.options').length <= 0) {
              $miniSearchOptions.removeClass('active');

              $('body').off('touchend');
            }
          });
        });
      }
    },



    /*
     * Toggle mini search, located at the top of the page.
     */
    toggleMinisearch: function() {
      var self = this;

      this.element.on('click.results', '.cancel a', function(event) {
        event.preventDefault();
      });

      this.element.on('click.results', '.resume .view_minisearch a', function(event) {
        event.preventDefault();

        $('.dates .ow').trigger('need_dates');

        /* Trigger change in any mini_search form input to update interislas field visibility */
        self.element.find('#mini_search_form_from').trigger('customChange');

        var $a = $(this);
        var fullHeight = self.element.find('.resume .mini_search').outerHeight();
        var $resume = self.element.find('.resume');

        if ($a.closest('p').hasClass('open_minisearch')) {
          $('.resume .header').fadeOut();
          $resume.addClass('opened');
          $('.process_top_bar').css('z-index', 105);
          $('.mini_search').css({position:'absolute',bottom:'',bottom:80});
          $('.mini_search').animate({bottom:0},500);

          if ($('html').hasClass('ie11') || $('html').hasClass('ie10') || $('html').hasClass('ie9') || $('html').hasClass('ie8') || $('html').hasClass('ie7') || $('html').hasClass('ie6')) {
            $('.mini_search').css({bottom:0,'animation-name':'','animation-duration':'','animation-fill-mode':''});
          }

          $resume.stop(true, false).animate({
            'height': fullHeight / 2
          }, 500, 'easeInOutExpo', function() {
          });
        } else if ($a.closest('p').hasClass('close_minisearch')) {
          $resume.stop(true, false).animate({
            'height': 0
          }, 500, 'easeInOutExpo', function() {
            $resume.removeClass('opened');
            $('.process_top_bar').css('z-index', 4);
          });
        }
      });
    },



    /*
     * Listener for the resident warning.
     */
    showResidentDiscountWarning: function() {
      var self = this;
      var $form = this.element.find('.mini_search form');
      var $residentCheckbox = $form.find('.options .checkbox.resident input');

      $residentCheckbox.on('click', function(event){
        event.stopImmediatePropagation();
        if ($(this).is(':checked') && User.isLoggedIn()) {
          $(self.selector).ui_dialog({
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



    /*
     * Listener to load results filtered by transfer.
     */
    initTransfersFilter: function() {
      this.element.on('click.results', '.results_topbar .filters .expand_transfers li a', function(event) {
        event.preventDefault();
        var $a = $(this);

        var index_fijo = ('transfer_').length;
        var transferSelected = $a.attr('id');
        transferSelected = transferSelected.substring(index_fijo);

        Bus.publish('process', 'render_results', { transferSelected:transferSelected });
      });
    },



    /*
     * Listeners for day before or after links.
     */
    initDayBeforeAfterControls: function() {
      var self = this;

      var $dayControls = this.element.find('.day_before_after_controls');

      var todayMoment = moment();
      var upperLimitDateMoment = moment().add(360, 'day');

      /* Flags for show or hide */
      var showOw       = true;
      var showOwBefore = true;
      var showOwAfter  = true;
      var showRt       = true;
      var showRtBefore = true;
      var showRtAfter  = true;

      /* Get current dates from minisearch inputs */
      var owDateString = this.element.find('.mini_search #mini_search_form_ow').val();
      var owDateMoment = moment(owDateString, 'MM-DD-YYYY');
      var rtDateString = this.element.find('.mini_search #mini_search_form_rt').val();
      var rtDateMoment = moment(rtDateString, 'MM-DD-YYYY');

      /* Check items to hide or disable */
      if (owDateMoment.startOf('day').isSame(todayMoment.startOf('day')))           showOwBefore = false; // Is today
      if (owDateMoment.startOf('day').isSame(upperLimitDateMoment.startOf('day')))  showOwAfter = false;  // Is on limit
      if (owDateMoment.startOf('day').isSame(rtDateMoment.startOf('day')))          showOwAfter = false;  // Is same than rt
      if (rtDateMoment.isValid() == false)                                          showRt = false;
      if (rtDateMoment.startOf('day').isSame(owDateMoment.startOf('day')))          showRtBefore = false; // Is same than ow
      if (rtDateMoment.startOf('day').isSame(upperLimitDateMoment.startOf('day')))  showRtAfter = false;  // Is on limit

      /* Show/hide and enable/disable using flags */
      (showOw)       ? $dayControls.find('.ow_control').show()                              : $dayControls.find('.ow_control').hide();
      (showOwBefore) ? $dayControls.find('.ow_control .day_before').removeClass('disabled') : $dayControls.find('.ow_control .day_before').addClass('disabled');
      (showOwAfter)  ? $dayControls.find('.ow_control .day_after').removeClass('disabled')  : $dayControls.find('.ow_control .day_after').addClass('disabled');
      (showRt)       ? $dayControls.find('.rt_control').show()                              : $dayControls.find('.rt_control').hide();
      (showRtBefore) ? $dayControls.find('.rt_control .day_before').removeClass('disabled') : $dayControls.find('.rt_control .day_before').addClass('disabled');
      (showRtAfter)  ? $dayControls.find('.rt_control .day_after').removeClass('disabled')  : $dayControls.find('.rt_control .day_after').addClass('disabled');

      /* Set target dates for each link */
      var dayBeforeOw    = owDateMoment.clone().subtract(1, 'day').format('MM-DD-YYYY');
      var dayBeforeOwISO = owDateMoment.clone().subtract(1, 'day').format();
      var dayAfterOw     = owDateMoment.clone().add(1, 'day').format('MM-DD-YYYY');
      var dayAfterOwISO  = owDateMoment.clone().add(1, 'day').format();
      var dayBeforeRt    = rtDateMoment.clone().subtract(1, 'day').format('MM-DD-YYYY');
      var dayBeforeRtISO = rtDateMoment.clone().subtract(1, 'day').format();
      var dayAfterRt     = rtDateMoment.clone().add(1, 'day').format('MM-DD-YYYY');
      var dayAfterRtISO  = rtDateMoment.clone().add(1, 'day').format();

      var dayBeforeOwTime = new Date(dayBeforeOwISO).getTime();
      if (window.disableddatesOW && window.disableddatesOW.indexOf(dayBeforeOwTime) != -1) {
        $dayControls.find('.ow_control .day_before').addClass('disabled');
      }
      var dayAfterOwTime = new Date(dayAfterOwISO).getTime();
      if (window.disableddatesOW && window.disableddatesOW.indexOf(dayAfterOwTime) != -1) {
        $dayControls.find('.ow_control .day_after').addClass('disabled');
      }
      var dayBeforeRtTime = new Date(dayBeforeRtISO).getTime();
      if (window.disableddatesRT && window.disableddatesRT.indexOf(dayBeforeRtTime) !=- 1) {
        $dayControls.find('.rt_control .day_before').addClass('disabled');
      }
      var dayAfterRtTime = new Date(dayAfterRtISO).getTime();
      if (window.disableddatesRT && window.disableddatesRT.indexOf(dayAfterRtTime) != -1) {
        $dayControls.find('.rt_control .day_after').addClass('disabled');
      }

      /* Set target dates */
      $dayControls.find('.ow_control .day_before').data('target-date', dayBeforeOw);
      $dayControls.find('.ow_control .day_after').data('target-date', dayAfterOw);
      $dayControls.find('.rt_control .day_before').data('target-date', dayBeforeRt);
      $dayControls.find('.rt_control .day_after').data('target-date', dayAfterRt);

      /* Add events */
      this.element.on('click.results', '.day_before_after_controls .ow_control .day_before, .ow_control .day_after', function(event) {
        event.preventDefault();
        if ($(this).hasClass('disabled')) return;
        self.element.find('.mini_search #mini_search_form_ow').val($(this).data('target-date'));
        self.element.find('.mini_search form').trigger('submit');
      });

      this.element.on('click.results', '.day_before_after_controls .rt_control .day_before, .rt_control .day_after', function(event) {
        event.preventDefault();
        if ($(this).hasClass('disabled')) return;
        self.element.find('.mini_search #mini_search_form_rt').val($(this).data('target-date'));
        self.element.find('.mini_search form').trigger('submit');
      });
    },



    /*
     * Overlay for minisearch.
     */
    listenResultsOverlay: function() {
      var self = this;

      this.element.on('click.results', '.mini_search .submit .cancel', function(event) {
        event.preventDefault();

        /* Restore default values */
        Bus.publish('process', 'set_minisearch_default_values');

        /* Restoring cancel button state */
        $('#results').removeClass('form_changed');
        
        /* Hide overlay */
        self.element.find('.results_scroll .overlay').fadeOut(300, function() {
          self.element.find('.results_scroll .overlay').attr('style', '');
        });

        $('.mini_search').css({position:'absolute',bottom:'',bottom:0}).animate({bottom:80},500);
        $('.resume .header').fadeIn();
        var $resume = self.element.find('.resume');
        $resume.stop(true, false).animate({
           'height': 0
        }, 500, 'easeInOutExpo', function() {
          $resume.removeClass('opened');
          $('.process_top_bar').css('z-index', 4);
        });

        if($('html').hasClass('ie11') || $('html').hasClass('ie10') || $('html').hasClass('ie9') || $('html').hasClass('ie8') || $('html').hasClass('ie7') || $('html').hasClass('ie6')) {
          $('.mini_search').css({bottom:80,'animation-name':'','animation-duration':'','animation-fill-mode':''});
        }
      });
    },



    /*
     * Set visual effects.
     */
    setVisualEffects: function() {
      var self = this;

      /* scroll Tabs Destination */
      this.element.on('click.results', '.top_header_results .ctn_top_header a', function(event){
        event.preventDefault();

        var $this = $(this);

        var segmentType = ($this.closest('.top_header_results').hasClass('rt')) ? 'rt' : 'ow';
        var segmentDestination = ($this.closest('.ctn_top_header').hasClass('destiny-rt')) ? 'rt' : 'ow';

        var scrollableElement = self.element.find('.results_scroll');
        var scrollableElementTop = self.element.find('.results_scroll').scrollTop();
        var topBarSize = self.element.find('.results_topbar').height() + self.element.find('.results_topbar').offset().top;

        if (segmentDestination == 'rt') {
          var destinyPosition = self.element.find('.top_header_results.rt').offset().top - topBarSize + scrollableElementTop;
        } else {
          var destinyPosition = self.element.find('.top_header_results.ow').offset().top - topBarSize;
        }

        if (segmentDestination != segmentType) {
          Bus.publish('scroll', 'scrollTo', {
            element: scrollableElement,
            position: destinyPosition
          });
        }
      })

      /* Open/collapse journey details */
      this.element.on('click.results', '.more_details a', function(event) {
        var $this = $(this);

        var isOpened = ($this.hasClass('open')) ? true : false;

        var $detailsContainer = $this.closest('.journey_row').find('.block_info_details');
        var $detailsElement   = $detailsContainer.find('.ctn_details');
        var $centerContainer  = $this.closest('.journey_row').find('.block_table_details');

        if (isOpened) {
          /* Collapse info */
          $detailsContainer.slideUp(300);
          $detailsElement.fadeOut(300);

          $this.removeClass('open');
        } else {
          /* Open info */
          // $detailsElement.fadeIn(300);
          // $detailsContainer.slideDown(300);
          // $centerContainer.height($detailsElement.height());
          // $detailsElement.css('display','table');

          var $journey = $this.closest('.journey_row').find('.prices_row a').first();

          self.updateJourneyDetails($journey); // this method will also add class "open" to link
        }

        event.preventDefault();
      });

      // Initial Result Overlay Detection
      // var resultScroll = $('.results_scroll');
      // var topDistance = resultScroll.scrollTop();
      // if(topDistance < 125){
      //   resultScroll.addClass('results_over');
      // }

      /* Fixed elements effects */
      this.element.find('.results_scroll').on('scroll.results', function() {

        // On Scroll Result Overlay Detection
        // var topDistance = $(this).scrollTop();
        // if(topDistance < 125){
        //   $(this).addClass('results_over');
        // }else{
        //   $(this).removeClass('results_over');
        // }

        var $resultsContent = self.element.find('.results_content');
        var $resultsTable   = self.element.find('.journeys_table');
        var $middleMessage  = self.element.find('.message');
        var isRt = self.templateData.isRt;

        /* Ow elements */
        var $owTableHeader = self.element.find('.journeys_table.ow .header');
        var $owJourneyRow  = self.element.find('.journeys_table.ow .journey_row');
        var $owTitle       = self.element.find('.top_header_results.ow');
        var $owTable       = self.element.find('.journeys_module:not(.return)');

        /* Rt elements */
        var $rtTableHeader = self.element.find('.journeys_table.rt .header');
        var $rtJourneyRow  = self.element.find('.journeys_table.rt .journey_row');
        var $rtTitle       = self.element.find('.top_header_results.rt');
        var $rtTable       = self.element.find('.journeys_module.return');

        /* Check if elements are visible */
        if ($owTitle.length == 0) return;

        /* Calc sizes */
        var topBarSize = self.element.find('.results_topbar').height() + self.element.find('.results_topbar').offset().top;

        var owTitleHeight = $owTitle.height();
        var owTableHeight = $owTableHeader.height();
        var owLimitLastRow = $owJourneyRow.last().offset().top;

        /* Fix/unfix ow and rt titles */
        if (isRt) {
          var offsetMiddleMessage = $middleMessage.offset().top;
          var heightMiddleMessage = $middleMessage.height();
          var rtTitleOffset = $rtTitle.offset().top;

          if (topBarSize+owTitleHeight < offsetMiddleMessage) {
            self.fixOwTitle();
            self.unfixRtTitle();
          } else {
            self.unfixOwTitle();
            self.unfixRtTitle();
          }

          if ((rtTitleOffset <= topBarSize) && !(topBarSize < offsetMiddleMessage+heightMiddleMessage)) {
            self.fixRtTitle();
          } else {
            self.unfixRtTitle();
          }
        }

        /* Fix/unfix ow table header */
        if (topBarSize+owTitleHeight+owTableHeight < owLimitLastRow) {

          /* Fix */
          $owTableHeader.addClass('fixed');
          $owTableHeader.attr('style', '');
          $owTable.css('margin-top', owTableHeight);
          $owTableHeader.width($owTable.width());

        } else {

          /* Unfix */
          $owTable.css('margin-top', '0');
          $owTableHeader.removeClass('fixed');
          $owTableHeader.offset({ top: owLimitLastRow-owTableHeight });

        }

        if (isRt) {
          /* Fix/unfix rt table header */
          var rtTitleHeight = $rtTitle.height();
          var rtTableHeight = $rtTableHeader.height();
          var rtLimitFirstRow = $rtJourneyRow.first().offset().top;
          var rtLimitLastRow = $rtJourneyRow.last().offset().top;

          if (topBarSize+rtTitleHeight+rtTableHeight <= rtLimitFirstRow) {

            /* Normal */
            $rtTableHeader.removeClass('fixed').css('top','0');
            $resultsTable.last().css('margin-top', '0');

          } else if (topBarSize+rtTitleHeight+rtTableHeight < rtLimitLastRow) {

            /* Fix */
            $rtTableHeader.addClass('fixed');
            $rtTableHeader.attr('style', '');
            $resultsTable.last().css('margin-top', rtTableHeight);
            $rtTableHeader.width($rtTable.width());

          } else {

            /* Unfix */
            $resultsTable.last().css('margin-top', '0');
            $rtTableHeader.removeClass('fixed');
            $rtTableHeader.offset({ top: rtLimitLastRow-rtTableHeight });

            // $rtTableHeader.offset({ top: rtLimitLastRow-rtTableHeight });

          }
        }
      });

      /* Set width of fixed elements */
      var pricesModuleWidth = this.element.find('.prices_module').width();
      this.element.find('.prices_header_result').width(pricesModuleWidth);
      this.element.find('.journeys_table.ow .header').width(this.element.find('.journeys_module:not(.return)').width());
      this.element.find('.journeys_table.rt .header').width(this.element.find('.journeys_module.return').width());
      this.element.find('.journeys_module:not(.return)').css('margin-top', this.element.find('.journeys_table.ow .header').height());

      $(window).resize(function() {
        /* Update prices module width */
        var pricesModuleWidth = self.element.find('.prices_module').width();
        self.element.find('.prices_header_result').width(pricesModuleWidth);
        self.element.find('.journeys_table.ow .header').width(self.element.find('.journeys_module:not(.return)').width());
        self.element.find('.journeys_table.rt .header').width(self.element.find('.journeys_module.return').width());
      });


      this.element.on('click.results', '.flight_toggle_wrapper', function(event) {
        var $this = $(this);
        var $flightData = self.element.find('.flight_collapsed');
        var toggleClass = "open";
        event.preventDefault();

        if($this.hasClass(toggleClass)){
          $this.find('a.data.to .detail').show();
          $this.find('a.data.to .legend').hide();
          $this.removeClass(toggleClass);
          $this.find('.slide_content').slideUp(300);
        }else{
          $this.find('a.data.to .detail').hide();
          $this.find('a.data.to .legend').show();
          $this.addClass(toggleClass);
          $this.find('.slide_content').slideDown(300);
        }

      });
    },



    /*
     * Fix ow title
     */
    fixOwTitle: function() {
      var $owTitle = this.element.find('.top_header_results.ow');

      $owTitle.addClass('fixed');
      $owTitle.attr('style', '');

    },

    /*
     * Unfix ow title
     */
    unfixOwTitle: function() {
      var $owTitle            = this.element.find('.top_header_results.ow');
      var owTitleHeight       = $owTitle.height();
      var $middleMessage      = this.element.find('.message');
      var offsetMiddleMessage = $middleMessage.offset().top;

      $owTitle.removeClass('fixed');
      $owTitle.offset({ top: offsetMiddleMessage-owTitleHeight });
    },



    /*
     * Fix rt title
     */
    fixRtTitle: function() {
      var $rtTitle = this.element.find('.top_header_results.rt');
      var $rtTable = this.element.find('.journeys_module.return');
      var rtTitleHeight = $rtTitle.height();

      $rtTitle.addClass('fixed');
      $rtTable.css('margin-top', rtTitleHeight+'px');
    },



    /*
     * Unfix rt title
     */
    unfixRtTitle: function() {
      var $rtTitle = this.element.find('.top_header_results.rt');
      var $rtTable = this.element.find('.journeys_module.return');

      $rtTitle.removeClass('fixed');
      $rtTable.css('margin-top', '0');
    },


    /*
     * Fare family lightbox listeners.
     */
    lightboxListener: function() {
      var self = this;

      /* Open lightbox */
      this.element.on('click.results', '.more-info', function(event) {
        event.preventDefault();
        self.element.find('.dialog.fareFamilyInfo').addClass('visible');
      });

      /* Close lightbox */
      this.element.on('click.results', '.dialog.fareFamilyInfo .close_dialog a , .dialog.fareFamilyInfo .close_dialog_content , .dialog .overlay_closeFunct', function(event) {
        event.preventDefault();
        self.element.find('.dialog.fareFamilyInfo').removeClass('visible');
      });

      /*Append html literal on footer Lightbox results*/
      var footerSrc = lang('availability_farefamilyInfo.lightbox_footerLink');
      var $footerLink = $('.ctn_footer');
      // var infoHtml = ('Consulte <a href="">AQUI</a> las condiciones completas');
      $footerLink.html(footerSrc);


    },



    /*
     * Price click listeners and actions.
     */
    setJourneysListeners: function() {
      var self = this;

      /* Add and remove classes */
      this.element.on('click.results', '.journey_row .prices_row a', function(event, isAutoSelected) {
        event.preventDefault();

        var $this = $(this);
        var isRt = self.templateData.isRt;
        var flightTypeClass = ($this.closest('.journeys_table').hasClass('rt')) ? 'rt' : 'ow';

        var $allJourneyRows     = $this.closest('.journeys_table.'+ flightTypeClass).find('.journey_row');
        var $allPriceLinks      = $this.closest('.journeys_table.'+ flightTypeClass).find('.journey_row .prices_row a');
        var $journeyRowSelected = $this.closest('.journey_row');
        var $relatedPriceLinks  = $this.closest('.prices_row').find('a');

        /* Mark all items unselected removing class 'selected' */
        $allJourneyRows.removeClass('selected');
        $allPriceLinks.removeClass('selected');

        /* Mark selected item with class 'selected' */
        $relatedPriceLinks.addClass('selected');
        $journeyRowSelected.addClass('selected');

        /* Update details info with selected flight */
        self.updateJourneyDetails($this);

        /* Update details info with selected flight */
        self.updateBaggageInfoInTableHeaders($this);

        /* Show flights with same recommendation-id's and hide the rest */
        self.updatePriceVisibility($this);

        /* Update itemization module */
        self.updateItemizationModule($this);


        /* Update visibility button block_Booking*/
        self.updateVisibilityButtonBlockBooking($this);

        /*Update visibility text not compatible*/
        self.updateShowNotAvailable($this);

        /* Hide prices details Collapse info */
        var $detailsContainer = $this.closest('.journeys_table').find('.journey_row:not(.selected) .block_info_details');
        var $detailsElement   = $detailsContainer.find('.ctn_details');
        var $moreInfo         = $this.closest('.journeys_table').find('.journey_row:not(.selected) .more_details a');

        /* Collapse all details info */
        $detailsContainer.slideUp(300);
        $detailsElement.fadeOut(300);
        $moreInfo.removeClass('open');

        /* Expand and collapsed block in itemization module*/
        if(!self.element.find('.flight_data_group.' + flightTypeClass).hasClass('open')){
          self.element.find('.flight_data_group.' + flightTypeClass).trigger('click');
        }

        /* Scroll to RT table when select an OW price (only if isn't a preselected price) */
        /*if (flightTypeClass == 'ow' && !isAutoSelected && isRt) {
          var topBarSize = self.element.find('.results_topbar').height() + self.element.find('.results_topbar').offset().top;
          var rtTablePosition = self.element.find('.top_header_results.rt').offset().top - topBarSize;
          var scrollableElement = self.element.find('.results_scroll');

          Bus.publish('scroll', 'scrollTo', {
            element: scrollableElement,
            position: rtTablePosition
          });
        }*/
      });
    },



    /*
     * Listeners to change selected journey details.
     */
    updateJourneyDetails: function($journeySelected) {
      var self = this;
      var identify = $journeySelected.attr('data-identify');
      var fareFamily = $journeySelected.attr('data-farefamily');
      var direction = $journeySelected.attr('data-direction');
      var fareFamilyText = (fareFamily == 'social') ? this.templateData.fareFamilyInfo.socialText : (fareFamily == 'nobag') ? this.templateData.fareFamilyInfo.noBagText : (fareFamily == 'economy') ? this.templateData.fareFamilyInfo.economyText : this.templateData.fareFamilyInfo.businessText;

      var journeyInfo = this.getJourneyInfo(identify, direction, fareFamily);
      var flightList = journeyInfo.flightList;
      var baggageInfo = {
        isSupported: journeyInfo.baggageInfo.isSupported,
        description: journeyInfo.baggageInfo.description
      };

      /* Update hand lugagge info */
      baggageInfo.countHandLuggage = journeyInfo.baggageInfo.countHandLuggage;
      if (baggageInfo.countHandLuggage > 1) {
        baggageInfo.countHandLuggageText = baggageInfo.countHandLuggage +" "+ lang('availability_farefamily.hand_luggage_plural');
      } else if (baggageInfo.countHandLuggage == 0) {
    	baggageInfo.countHandLuggageText = lang('availability_farefamily.no_hand_luggage');
      } else {
        baggageInfo.countHandLuggageText = baggageInfo.countHandLuggage +" "+ lang('availability_farefamily.hand_luggage_single');
      }

      /* Update baggage info */
      baggageInfo.countBaggage = journeyInfo.baggageInfo.countBaggage;
      if (baggageInfo.countBaggage > 1) {
        baggageInfo.countBaggageText = baggageInfo.countBaggage +" "+ lang('availability_farefamily.baggage_plural');
      } else if (baggageInfo.countBaggage == 0) {
    	baggageInfo.countBaggageText = lang('availability_farefamily.no_baggage');
      } else {
        baggageInfo.countBaggageText = baggageInfo.countBaggage +" "+ lang('availability_farefamily.baggage_single');
      }

      /* Get template and print flight details */
      Bus.publish('ajax', 'getTemplate', {
        data: {
          flightList: flightList,
          baggageInfo: baggageInfo,
          fareFamilyText: fareFamilyText
        },
        path: AirEuropaConfig.templates.results.flight_detail,
        success: function(processedHtml) {
          $journeySelected.closest('.journey_row').find('.block_info_details').html(processedHtml);

          $moreLink = $journeySelected.closest('.journey_row').find('.more_details a');

          var $detailsContainer = $moreLink.closest('.journey_row').find('.block_info_details');
          var $detailsElement   = $detailsContainer.find('.ctn_details');
          var $centerContainer  = $moreLink.closest('.journey_row').find('.block_table_details');

          $detailsElement.fadeIn(300);
          $detailsContainer.slideDown(300);
          $centerContainer.height($detailsElement.height());
          $detailsElement.css('display','table');

          /* Add open class to link */
          $moreLink.addClass('open');
        }
      });
    },

    updateBaggageInfoInTableHeaders: function($journeySelected) {
      var self = this;

      /* Set baggage info */
      $journeySelected.closest('.journeys_table').find('.fare-types .baggage, .fare-types .hand_luggage').hide();
      $journeySelected.closest('.journeys_table').find('.fare-types .baggage, .fare-types .baggage').hide();

      /* Set table header baggage info */
      $journeySelected.closest(".ctn_row").find(".prices_row a.flight").not(".hidden").each(function(index, element) {
        self.updateHeaderBaggageDetails($(element));
      });
    },



    updateHeaderBaggageDetails: function($journey) {
    	var identify = $journey.attr('data-identify');
        var fareFamily = $journey.attr('data-farefamily');
        var direction = $journey.attr('data-direction');
        var fareFamilyText = (fareFamily == 'nobag') ? this.templateData.fareFamilyInfo.noBagText : (fareFamily == 'economy') ? this.templateData.fareFamilyInfo.economyText : this.templateData.fareFamilyInfo.businessText;

        var journeyInfo = this.getJourneyInfo(identify, direction, fareFamily);
        var flightList = journeyInfo.flightList;
        var baggageInfo = {
          isSupported: journeyInfo.baggageInfo.isSupported,
          description: journeyInfo.baggageInfo.description
        };

        /* Update hand lugagge info */
        baggageInfo.countHandLuggage = journeyInfo.baggageInfo.countHandLuggage;
        if (baggageInfo.countHandLuggage > 1) {
          baggageInfo.countHandLuggageText = baggageInfo.countHandLuggage +" "+ lang('availability_farefamily.hand_luggage_plural');
        } else if (baggageInfo.countHandLuggage == 0) {
        	baggageInfo.countHandLuggageText = lang('availability_farefamily.no_hand_luggage');
        } else {
          baggageInfo.countHandLuggageText = baggageInfo.countHandLuggage +" "+ lang('availability_farefamily.hand_luggage_single');
        }

        /* Update baggage info */
        baggageInfo.countBaggage = journeyInfo.baggageInfo.countBaggage;
        if (baggageInfo.countBaggage > 1) {
          baggageInfo.countBaggageText = baggageInfo.countBaggage +" "+ lang('availability_farefamily.baggage_plural');
        } else if (baggageInfo.countBaggage == 0) {
        	baggageInfo.countBaggageText = lang('availability_farefamily.no_baggage');
        } else {
          baggageInfo.countBaggageText = baggageInfo.countBaggage +" "+ lang('availability_farefamily.baggage_single');
        }

    	/* Update hand lugagge info */
        if (baggageInfo.countHandLuggage >= 0) {
          $journey.closest('.journeys_table').find('.fare-types .'+ fareFamily +' .hand_luggage .count').text(baggageInfo.countHandLuggage);
          $journey.closest('.journeys_table').find('.fare-types .'+ fareFamily +' .hand_luggage .description').text(baggageInfo.countHandLuggageText);
          $journey.closest('.journeys_table').find('.fare-types .'+ fareFamily +' .hand_luggage').show();
        }

        /* Update baggage info */
        if (baggageInfo.countBaggage >= 0) {
          $journey.closest('.journeys_table').find('.fare-types .'+ fareFamily +' .baggage .count').text(baggageInfo.countBaggage);
          $journey.closest('.journeys_table').find('.fare-types .'+ fareFamily +' .baggage .description').text(baggageInfo.countBaggageText);
          $journey.closest('.journeys_table').find('.fare-types .'+ fareFamily +' .baggage').show();
        }
    },

    /*
     * Update visibility of journeys.
     */
    updatePriceVisibility: function($journeySelected) {
      var self = this;

      var $relatedPriceLinks    = $journeySelected.closest('.prices_row').find('a');
      var targetFlightTypeClass = ($journeySelected.closest('.journeys_table').hasClass('rt')) ? 'ow' : 'rt';

      this.element.find('.journeys_table.'+ targetFlightTypeClass +' .prices_row a').removeClass('combination-not-available');

      /* Hide all target prices */
      this.element.find('.journeys_table.'+ targetFlightTypeClass +' .prices_row a').addClass('hidden');
      //this.element.find('.journeys_table.'+ targetFlightTypeClass +' .prices_row div.not-available').addClass('hidden');

      /* Show target prices with same recommendationId */
      $.each($relatedPriceLinks, function(index, element) {
        var $element = $(element);
        var recommendationId = $element.attr('data-recommendation-id');

        self.element.find('.journeys_table.'+ targetFlightTypeClass +' .prices_row a[data-recommendation-id='+ recommendationId +']').removeClass('hidden');
      });

      /* If there isn't a price selected, show not-available message (anyway, this case should not happen) */
      // this.element.find('.journeys_table.'+ targetFlightTypeClass +' .prices_row').each(function(priceRowIndex, priceRow) {
      //   var $priceRow = $(priceRow);

      //   if ($priceRow.find('a:not(.hidden)').length == 0) {
      //     $priceRow.find('div.not-available').removeClass('hidden');
      //   }
      // })

      // recorrer los vuelos de la dirección contraria y marcar como no dispnible aquellos que no cumplan el requisito horario
      this.element.find('.journeys_table.'+ targetFlightTypeClass +' .prices_row').each(function(priceRowIndex, priceRow) {
        var identify    = $journeySelected.attr('data-identify');
        var fareFamily  = $journeySelected.attr('data-farefamily');
        var direction   = $journeySelected.attr('data-direction');

        if (targetFlightTypeClass == 'rt') {
          // obtenemos la info del vuelo seleccionado 
          owFlightInfo = self.getJourneyServiceInfo(identify, direction, fareFamily);

          // obtenemos la info del vuelo que estamos iterando
          $targetFlight = $($(priceRow).find('.flight')[0]);
          var targetIdentify    = $targetFlight.attr('data-identify');
          var targetFareFamily  = $targetFlight.attr('data-farefamily');
          var targetDirection   = $targetFlight.attr('data-direction');

          rtFlightInfo = self.getJourneyServiceInfo(targetIdentify, targetDirection, targetFareFamily);
        } else {
          // obtenemos la info del vuelo seleccionado 
          rtFlightInfo = self.getJourneyServiceInfo(identify, direction, fareFamily);

          // obtenemos la info del vuelo que estamos iterando
          $targetFlight = $($(priceRow).find('.flight')[0]);
          var targetIdentify    = $targetFlight.attr('data-identify');
          var targetFareFamily  = $targetFlight.attr('data-farefamily');
          var targetDirection   = $targetFlight.attr('data-direction');

          owFlightInfo = self.getJourneyServiceInfo(targetIdentify, targetDirection, targetFareFamily);
        }

        // hacer cosas
        // obtener arrivalDate del owFlightInfo
         var ocultar = self.compareDepartureSelectedFlights(owFlightInfo, rtFlightInfo);
        
        if (ocultar){
          $(priceRow).find('.flight').addClass('hidden');
        }
      });

      this.element.find('.journeys_table.'+ targetFlightTypeClass +' .prices_row').each(function(priceRowIndex, priceRow) {
        var $priceRow = $(priceRow);
        var firstPrice = $priceRow.find('.flight')[0];

        if ($priceRow.find('a:not(.hidden)').length == 0) {
          $(firstPrice).removeClass('hidden');
          $(firstPrice).addClass('combination-not-available');
        }
      })

      /* Ensure that one price is visible in each FF column */
      /*this.element.find('.journeys_table.'+ targetFlightTypeClass +' .prices_row').each(function(priceRowIndex, priceRow) {
        var $priceRow = $(priceRow);

        if ($priceRow.find('a:not(.hidden)').length == 0) {
          $priceRow.find('a').first().removeClass('hidden');
        } else if ($priceRow.find('a:not(.hidden)').length > 1) {
          var cheapestPrice = Number.POSITIVE_INFINITY;
          var $selectedElement = null;

          $.each($priceRow.find('a:not(.hidden)'), function(priceIndex, priceElement) {
            var price = parseFloat($(priceElement).attr('data-price'));

            if (price < cheapestPrice) {
              cheapestPrice = price;
              $selectedElement = $(this);
            }
          });

          $priceRow.find('a:not(.hidden)').addClass('hidden');
          $selectedElement.removeClass('hidden');
        }
      });*/

    

    },



    /*
     * Update itemization info.
     */
    updateItemizationModule: function($journeySelected) {
      var self = this;

      var identify    = $journeySelected.attr('data-identify');
      var fareFamily  = $journeySelected.attr('data-farefamily');
      var direction   = $journeySelected.attr('data-direction');
      var flightTypeClass = ($journeySelected.closest('.journeys_table').hasClass('rt')) ? 'rt' : 'ow';
      var fareFamilyText = (fareFamily == 'nobag') ? this.templateData.fareFamilyInfo.noBagText : (fareFamily == 'economy') ? this.templateData.fareFamilyInfo.economyText : this.templateData.fareFamilyInfo.businessText;

      /* Set total price */
      var $selectedPrices = this.element.find('.journeys_table .journey_row.selected .prices_row a.selected:not(.hidden)');
      var totalPrice = 0;

      $.each($selectedPrices, function(index, element) {
        var $element = $(element);
        var price = $element.attr('data-price');

        totalPrice = parseFloat(totalPrice) + parseFloat(price);
      });

      this.element.find('.prices_module .price_total span').html(formatCurrency(totalPrice));
      if(totalPrice >= 10000){
        this.element.find('.prices_module .price_total').addClass('large_price');
      } else {
        this.element.find('.prices_module .price_total').removeClass('large_price');
      }
      this.element.find('.prices_module .price_total em').html(currencyCode);

      /* Set flight info */
      var journeyInfo    = this.getJourneyInfo(identify, direction, fareFamily);
      var scaleInfoClass = (journeyInfo.numberOfScales == 0) ? 'direct' : (journeyInfo.numberOfScales == 1) ? 'scale' : 'scales';
      var weekdayText    = (flightTypeClass == 'ow') ? journeyInfo.departure.weekday : journeyInfo.arrival.weekday;
      var dayText        = (flightTypeClass == 'ow') ? journeyInfo.departure.day     : journeyInfo.arrival.day;
      var monthText      = (flightTypeClass == 'ow') ? journeyInfo.departure.month   : journeyInfo.arrival.month;

      var $flightDataModule = this.element.find('.prices_module .flight_data_group.'+ flightTypeClass);

      $flightDataModule.find('a.data.to .detail').text(journeyInfo.departureCode +" "+ journeyInfo.departureHour +" - "+ journeyInfo.arrivalCode +" "+ journeyInfo.arrivalHour);
      $flightDataModule.find('.day_flight span.weekday').html(weekdayText);
      $flightDataModule.find('.day_flight span.date').html(dayText +' '+ monthText);
      $flightDataModule.find('.journey-flight .departure .airport').html(journeyInfo.departureCode);
      $flightDataModule.find('.journey-flight .departure .time').html(journeyInfo.departureHour);
      $flightDataModule.find('.journey-flight .arrival .airport').html(journeyInfo.arrivalCode);
      $flightDataModule.find('.journey-flight .arrival .time').html(journeyInfo.arrivalHour);
      $flightDataModule.find('ul li.tourist').addClass('hidden');
      $flightDataModule.find('ul li.tourist.'+ scaleInfoClass).removeClass('hidden');
      $flightDataModule.find('ul li.tourist.'+ scaleInfoClass +' span.count').text(journeyInfo.numberOfScales);
      $flightDataModule.find('ul li.tourist.'+ fareFamily +' span.text-title').text(fareFamilyText);

      /* Set baggage info */
      var countHandLuggage = journeyInfo.baggageInfo.countHandLuggage;
      var countBaggage     = journeyInfo.baggageInfo.countBaggage;

      if (countHandLuggage >= 0) {
        $flightDataModule.find('ul li.tourist.'+ fareFamily +' .hand_luggage').text(countHandLuggage);
        $flightDataModule.find('ul li.tourist.'+ fareFamily +' .hand_luggage').removeClass('hidden');
        $flightDataModule.find('ul li.tourist.'+ fareFamily).removeClass('hidden');
      } else {
        $flightDataModule.find('ul li.tourist.'+ fareFamily +' .hand_luggage').addClass('hidden');
      }

      if (countBaggage >= 0) {
        $flightDataModule.find('ul li.tourist.'+ fareFamily +' .baggage').text(countBaggage);
        $flightDataModule.find('ul li.tourist.'+ fareFamily +' .baggage').removeClass('hidden');
        $flightDataModule.find('ul li.tourist.'+ fareFamily).removeClass('hidden');
      } else {
        $flightDataModule.find('ul li.tourist.'+ fareFamily +' .baggage').addClass('hidden');
      }

      $flightDataModule.show();

      /* Set detailed prices and discounts */
      var totalItemization = null;

      $.each($selectedPrices, function(index, element) {
        var $element   = $(element);
        var identify   = $element.attr('data-identify');
        var fareFamily = $element.attr('data-farefamily');
        var direction  = $element.attr('data-direction');

        var journeyInfo = self.getJourneyInfo(identify, direction, fareFamily);
        var itemization = journeyInfo.itemization;

        if (totalItemization == null) {
          totalItemization = $.extend(true, {}, itemization);
        } else {
          totalItemization.adult.import               = totalItemization.adult.import  + itemization.adult.import;
          totalItemization.child.import               = totalItemization.child.import  + itemization.child.import;
          totalItemization.infant.import              = totalItemization.infant.import + itemization.infant.import;
          totalItemization.totalTax                   = totalItemization.totalTax      + itemization.totalTax;
          totalItemization.residentDiscount           = totalItemization.residentDiscount + itemization.residentDiscount;
          totalItemization.serviceFee                 = totalItemization.serviceFee + itemization.serviceFee;
          totalItemization.serviceFeeDiscount         = totalItemization.serviceFeeDiscount + itemization.serviceFeeDiscount;
          totalItemization.serviceFeeResidentDiscount = totalItemization.serviceFeeResidentDiscount + itemization.serviceFeeResidentDiscount;
        }
      });

      var $itemizationModule = this.element.find('.flight_details ul');
      $itemizationModule.find('li').hide();

      if (totalItemization.adult.count > 0) {
        $itemizationModule.find('li.adult em').html(totalItemization.adult.count);
        $itemizationModule.find('li.adult strong').html(totalItemization.adult.import);
        $itemizationModule.find('li.adult').show();
      }
      if (totalItemization.child.count > 0) {
        $itemizationModule.find('li.child em').html(totalItemization.child.count);
        $itemizationModule.find('li.child strong').html(totalItemization.child.import);
        $itemizationModule.find('li.child').show();
      }
      if (totalItemization.infant.count > 0) {
        $itemizationModule.find('li.infant em').html(totalItemization.infant.count);
        $itemizationModule.find('li.infant strong').html(totalItemization.infant.import);
        $itemizationModule.find('li.infant').show();
      }
      if (totalItemization.totalTax > 0) {
        $itemizationModule.find('li.tax strong').html(formatCurrency(totalItemization.totalTax));
        $itemizationModule.find('li.tax').show();
      }
      if (totalItemization.residentDiscount > 0) {
        $itemizationModule.find('li.resident_discount strong').html(formatCurrency(totalItemization.residentDiscount*-1));
        $itemizationModule.find('li.resident_discount').show();
      }
      if (totalItemization.serviceFee > 0) {
        $itemizationModule.find('li.service_fee strong').html(formatCurrency(totalItemization.serviceFee));
        $itemizationModule.find('li.service_fee').show();
      }
      if (totalItemization.serviceFeeDiscount > 0) {
        $itemizationModule.find('li.service_fee_discount strong').html(formatCurrency(totalItemization.serviceFeeDiscount*-1));
        $itemizationModule.find('li.service_fee_discount').show();
      }
      if (totalItemization.serviceFeeResidentDiscount > 0) {
        $itemizationModule.find('li.service_fee_resident_discount strong').html(formatCurrency(totalItemization.serviceFeeResidentDiscount*-1));
        $itemizationModule.find('li.service_fee_resident_discount').show();
      }
    },

    /*
    * Update Button Block Booking
    */
    updateVisibilityButtonBlockBooking: function($journeySelected) {
      var self = this;
      var isRt = self.templateData.isRt;
      var rtDirection = false;
      var owDirection = false;

      /*Buttons block booking*/
      var $pricesModule = this.element.find('.prices_module .prices_header_result');
      var $buttonSubmitConfirm = this.element.find('.ctn_journey_wrapper .submit.confirm');
      var $textTitlePrice = $pricesModule.find('.price_title span');

      var isButtonDisabled = $pricesModule.hasClass('disabled');

      /* Onli if button disabled*/
      if(isButtonDisabled){

         /* Find directión */
        var $selectedPrices = this.element.find('.journeys_table .journey_row.selected .prices_row a.selected:not(.hidden)');

        $.each($selectedPrices, function(index, element) {
          var $element = $(element);

          if($element.attr('data-direction') == 'ow'){
            owDirection = true;

            /*Change text title*/
            $textTitlePrice.text(lang('availability_farefamily.price_title_ow_selecte'));
          }

          if($element.attr('data-direction') == 'rt'){
            rtDirection = true;
            /*Change text title*/
            $textTitlePrice.text(lang('availability_farefamily.price_title_rt_selecte'));
          }
        });

        /* activate button*/
        if(owDirection && rtDirection && isRt){

          /* display button prices module*/
          $pricesModule.removeClass('disabled');

          /*Change text title*/
          $textTitlePrice.text(lang('availability_farefamily.price_title_all_selecte'));

          /*display none button confirm*/
          $buttonSubmitConfirm.slideDown(500);

        }else if(owDirection && !isRt){

           /* display button prices module*/
          $pricesModule.removeClass('disabled');

          /*Change text title*/
          $textTitlePrice.text(lang('availability_farefamily.price_title_all_selecte'));

          /*display none button confirm*/
          $buttonSubmitConfirm.slideDown(500);

        }

      }

    },

    updateShowNotAvailable: function($journeySelected) {
      var self = this;
      var isNotAvailable= false;

      /*Buttons block booking*/
      var $pricesModule = this.element.find('.prices_module .prices_header_result');
      var $buttonSubmitConfirm = this.element.find('.ctn_journey_wrapper .submit.confirm');
      var $textTitlePrice = $pricesModule.find('.price_title span');

      if(!$pricesModule.hasClass('disabled')){
        var $selectedPrices = this.element.find('.journeys_table .journey_row.selected .prices_row a.selected:not(.hidden)');
        $.each($selectedPrices, function(index, element) {
          var $element = $(element);

          if($element.hasClass('combination-not-available')){
            isNotAvailable =true;
          }
        });

        if(isNotAvailable){
          /* hide button prices module*/
          $pricesModule.addClass('disabled');

          /*Change text title*/
          $textTitlePrice.text(lang('availability_farefamily.price_title_all_selecte'));

          /*Hide price*/
          $pricesModule.find('.price_total').hide();

          /*Show not available*/
          $pricesModule.find('.price_not_combination').show();

          /*hide none button confirm*/
          $buttonSubmitConfirm.slideUp(500);
        }else{
          /* display button prices module*/
          $pricesModule.removeClass('disabled');

          /*Show price*/
          $pricesModule.find('.price_total').show();

          /*Hide not available*/
          $pricesModule.find('.price_not_combination').hide();

          /*display none button confirm*/
          $buttonSubmitConfirm.slideDown(500);

        }

      }
    },


    /*
     * Returns journey view info.
     */
    getJourneyInfo: function(identify, direction, fareFamily) {
      var templateData = this.templateData;
      var resultJourneyInfo;
      var departureHourList = templateData.journeyList[direction];
      $.each(departureHourList, function(departureHourIndex, departureHourElement) {
        var journeyList = (typeof departureHourElement.journeyList[fareFamily.toUpperCase()] !== "undefined") ? departureHourElement.journeyList[fareFamily.toUpperCase()] : [];
        $.each(journeyList, function(journeyIndex, journeyElement) {
          if (journeyElement.identity == identify) {
            resultJourneyInfo = $.extend({}, departureHourElement.info, journeyElement, templateData.searchInfo);
          }
        });
      });
      return resultJourneyInfo;
    },



    /*
     * Returns journey service info.
     */
    getJourneyServiceInfo: function(identify, direction, fareFamily) {
      var resultsData = this.resultsData;
      var resultJourneyInfo;
      var direction = (direction == 'ow') ? 'I' : 'V';

      $.each(resultsData.body.data.journeys, function(index, journeyElement) {
        if (journeyElement.identity == identify && journeyElement.direction == direction) {
          resultJourneyInfo = $.extend(true, {}, journeyElement);
        }
      });

      return resultJourneyInfo;
    },

  
    /*compare info houre flights*/
    compareDepartureSelectedFlights: function(flightOw, flightRt) {
      
      // var dateNew = moment();
      // moment().format("DD, MM, YYYY, h:mm:ss a");
      // 1. obtener el diahora de salida (dateDeparture del ultimo flight)
      var firstFlight = moment(flightOw.flights[flightOw.flights.length -1].dateArrival, "DD/MM/YYYY HH:mm").add(5, 'h');
      // 2. obtener el diahora de llegada (dateArrival del primero flight)
      // sumar 5 horas a 1 .add
      var secondFlight = moment(flightRt.flights[0].dateDeparture, "DD/MM/YYYY HH:mm");
      // comparar fechas .diff
      // firstFlight > secondFlight
      return (firstFlight > secondFlight);
    },


    /*
     * Marks journeys selected by default in html.
     */
    markPreselectedJourneys: function() {
      var templateData = this.templateData;
      var preSelectedJourneys = templateData.preselectedJourneys;

      var owIdentify = preSelectedJourneys.ow.identity;
      this.element.find('.journeys_table.ow .journey_row .prices_row a[data-identify='+ owIdentify +']').trigger('click', true);

      if (templateData.isRt) {
        var rtIdentify = preSelectedJourneys.rt.identity;
        this.element.find('.journeys_table.rt .journey_row .prices_row a[data-identify='+ rtIdentify +']').trigger('click', true);
      }
    },

    initButtonBlockBooking: function(){
      /* disabled button*/
      var $pricesModule = this.element.find('.prices_module .prices_header_result');
      var $buttonSubmitConfirm = this.element.find('.ctn_journey_wrapper .submit.confirm');

      $pricesModule.addClass('disabled');
      $buttonSubmitConfirm.slideUp(500);

      /*Hide not available*/
      $pricesModule.find('.price_not_combination').hide();
    },


    /*
     * Block booking.
     */
    blockBookingListener: function() {
      var self = this;

      this.element.on('click.results', '.prices_module a.block_booking, fieldset.submit.confirm .submit_button button', function(event) {
        event.preventDefault();

        /*If not button disabled */
        if(!$(this).closest('.prices_header_result').hasClass('disabled')){
          
          var $this = $(this);
          var serviceResponse = self.resultsData.body.data;
          var valid = true;
          var $owSelectedJourney = self.element.find('.journeys_table.ow .journey_row.selected .prices_row a.selected:not(.hidden)');
          var $rtSelectedJourney = self.element.find('.journeys_table.rt .journey_row.selected .prices_row a.selected:not(.hidden)');

          var owIdentify = ($owSelectedJourney.length == 1) ? $owSelectedJourney.attr('data-identify') : '';
          var rtIdentify = ($rtSelectedJourney.length == 1) ? $rtSelectedJourney.attr('data-identify') : '';
          var recommendationId = ($owSelectedJourney.length == 1) ? $owSelectedJourney.attr('data-recommendation-id') : '';

          if ((owIdentify == '') || (recommendationId == '')) {
            valid = false;
          }

          if (valid) {
            /* Remove tooltips */
            $('.process_top_bar').addClass('hidden_process_topbar');

            /* Start loading */
            self.createNewPage(function() {
              /* Call to block booking service */
              Bus.publish('services', 'getBookingBlock', {
                data: {
                  resultsData:      serviceResponse,
                  departureCode:    owIdentify,
                  arrivalCode:      rtIdentify,
                  recommendationId: recommendationId
                },
                success: function(data) {
                  var goToCheckout = !(data.header.error);
                  var message      = data.header.message;
                  var errorCode    = data.header.code;
                  var passengers   = [];
                  var adultNumber  = parseInt(self.element.find('.passengers_count_field .passengers_input .counter_adults').val()) || 0 ;
                  var kidsNumber   = parseInt(self.element.find('.passengers_count_field .passengers_input .counter_kids').val()) || 0;
                  var babiesNumber = parseInt(self.element.find('.passengers_count_field .passengers_input .counter_babies').val()) || 0;
                  var now          = moment();

                  if ($owSelectedJourney.attr('data-farefamily') === 'social') {
                	if(self.resultsParams.paxAdult > 0) {
                		adultNumber = self.resultsParams.paxAdult;
                	} else {
                		adultNumber = self.resultsParams.paxAdultResident;
                	}
                  };

                  /* minutes * 60 (to convert to seconds) * 1000 (to convert to timestamp) + now */
                  var calculatedWarningBookingLimit = ((AirEuropaConfig.warningBookingLimit*60)*1000)+now.valueOf();

                  if (goToCheckout) {
                    /* Compose passengers object */
                    for (i = 0; i < adultNumber; i++) {
                      var passengerObject = {
                        passengerType: 'ADULT',
                        type: convertTypeToWeb('ADULT'),
                        info: {}
                      };

                      passengers.push(passengerObject)
                    }

                    for (i = 0; i < kidsNumber; i++) {
                      var passengerObject = {
                        passengerType: 'CHILD',
                        type: convertTypeToWeb('CHILD'),
                        info: {}
                      };

                      passengers.push(passengerObject)
                    }

                    for (i = 0; i < babiesNumber; i++) {
                      var passengerObject = {
                        passengerType: 'INFANT',
                        type: convertTypeToWeb('INFANT'),
                        info: {}
                      };

                      passengers.push(passengerObject)
                    }

                    /* Compose post Object */
                    /*postObject = {
                      sessionId: self.resultsData.sessionId,
                      idPet: self.resultsData.availabilityId,
                      journeys: self.getSelectedJourneys(owId, rtId, cabin),
                      cabinClass: cabin,
                      prices: self.getSelectedPrice(owId, rtId, cabin),
                      passengers: passengers,
                      largeFamily: data.body.data.largeFamily,
                      sateDiscount: data.body.data.sateDiscount,
                      typeDocumentation: data.body.data.typeDocumentation,
                      largeFamilyDiscounts: data.body.data.largeFamilyDiscounts,
                      resident: self.element.find('.mini_search .options .resident input').is(':checked'),
                      journeyConstraint: self.resultsData.journeyConstraint,
                      journeyConstraintBlock: data.body.data.journeyConstraint,
                      swidto: self.resultsData.swidto,
                      searchHash: window.location.hash,
                      resultsParams: self.resultsParams,
                      warningBookingLimit: calculatedWarningBookingLimit,
                      resultView: self.resultsParams.view
                    };*/

                    var owDate  = moment(self.resultsParams.dateDeparture, "DD/MM/YYYY");
                    var owValue = owDate.format("MM-DD-YYYY");
                    
                    var rtValue  = null;

                    if(typeof self.resultsParams.dateArrival !== "undefined"){
                      var rtDate  = moment(self.resultsParams.dateArrival, "DD/MM/YYYY");
                      rtValue = rtDate.format("MM-DD-YYYY");
                    }

                    


                    postObject = {
                      largeFamily: data.body.data.largeFamily,
                      sateDiscount: data.body.data.sateDiscount,
                      typeDocumentation: data.body.data.typeDocumentation,
                      largeFamilyDiscounts: data.body.data.largeFamilyDiscounts,
                      journeyConstraintBlock: data.body.data.journeyConstraint,
                      passengers: passengers,
                      searchHash: window.location.hash,
                      warningBookingLimit: calculatedWarningBookingLimit,
                      resident: self.element.find('.mini_search .options .resident input').is(':checked'),
                      ow: owValue,
                      rt: rtValue,
                      resultsParams: self.resultsParams,
                      airportDeparture: self.resultsParams.airportDeparture,
                      airportArrival: self.resultsParams.airportArrival,
                      paxAdult: self.resultsParams.paxAdult,
                      paxChild: self.resultsParams.paxChild,
                      paxInfant: self.resultsParams.paxInfant,
                      paxAdultResident: self.resultsParams.paxAdultResident,
                      paxChildResident: self.resultsParams.paxChildResident,
                      paxInfantResident: self.resultsParams.paxInfantResident,
                      market: self.resultsParams.mkt,
                      application: AirEuropaConfig.ajax.defaultParams.application,
                      sessionId: self.resultsData.body.data.sessionId,
                      idPet: self.resultsData.body.data.availabilityId,
                      journeyConstraint: self.resultsData.body.data.journeyConstraint,
                      swidto: self.resultsData.body.data.swidto,
                      journeys: self.getSelectedJourneys(),
                      prices: {}, /* not used */
                      cabinClass: '', /* not used */
                      resultView: '' /* not used */
                    };

                    Bus.publish('ajax', 'postJson', {
                      path: getPostURL('results'),
                      data: { checkout: postObject },
                      success: function() {

                        // Close the minisearch if you have it opened
                        if($('.process_top_bar .resume').hasClass('opened')){
                          $('.mini_search .submit .cancel').click();
                        }

                        /* Hide fixed elements to avoid visualization problems */
                        self.element.find('.prices_module, .top_header_results, .overlay_resuts, .results_topbar, .journeys_table .header').addClass('hidden');
                        self.element.find('.best_prices_journey').hide();

                        /* Navigate to Checkout URL */
                        var checkoutProcessURL = getProcessUrl('checkout');

                        Bus.publish('process', 'clean_results_data');
                        Bus.publish('hash', 'change', { hash: checkoutProcessURL });
                      },
                      failure: function() {
                        self.deleteNewPage();

                        $('#results').ui_dialog({
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
                  } else {
                    self.deleteNewPage();

                    $('#results').ui_dialog({
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
                      ],
                      render: function ($dialog) {
                        $dialog.find('.close a').on('click', function (event) {

                          /*clean*/
                           Bus.publish('process', 'cleanResultsParams');
                           var hash = (location.hash).replace('#/','');

                           /*Add recharge/remove recharge url*/
                           if(hash.indexOf('/recharge') == -1){
                              hash = hash + '/recharge';
                           }else{
                              hash = hash.replace('/recharge','');
                           }
                          var url = hash;
                          Bus.publish('hash', 'change', {hash: url });
                        });
                      }
                    });

                    /* check GTM errors in block */
                    if (errorCode == 301){
                      /* Update Google Tag Manager */
                      updateGtm({
                        'pageArea': 'Comprar vuelos',
                        'pageCategory': 'Buscador vuelos',
                        'pageContent': 'Error_' + errorCode + '. Las plazas que intenta bloquear el usuario no están disponibles en Amadeus'
                      });
                    } else if (errorCode == 303){
                      updateGtm({
                        'pageArea': 'Comprar vuelos',
                        'pageCategory': 'Buscador vuelos',
                        'pageContent': 'Error_' + errorCode + '. La recuperación del desglose de tasas por parte del FlexPricer no ha sido correcta'
                      });
                    }
                  }
                }
              });
            });
          }


        }
      });
    },



    /*
     * Get selected journeys by user.
     */
    getSelectedJourneys: function() {
      var selectedJourneys = { ow: undefined, rt: undefined };

      var $owSelectedJourney = this.element.find('.journeys_table.ow .journey_row.selected .prices_row a.selected:not(.hidden)');
      var $rtSelectedJourney = this.element.find('.journeys_table.rt .journey_row.selected .prices_row a.selected:not(.hidden)');

      var owIdentify   = $owSelectedJourney.attr('data-identify');
      var owFareFamily = $owSelectedJourney.attr('data-farefamily');
      var owDirection  = $owSelectedJourney.attr('data-direction');

      selectedJourneys.ow = this.getJourneyServiceInfo(owIdentify, owDirection, owFareFamily);

      if ($rtSelectedJourney.length == 1) {
        var rtIdentify   = $rtSelectedJourney.attr('data-identify');
        var rtFareFamily = $rtSelectedJourney.attr('data-farefamily');
        var rtDirection  = $rtSelectedJourney.attr('data-direction');

        selectedJourneys.rt = this.getJourneyServiceInfo(rtIdentify, rtDirection, rtFareFamily);
      }

      return selectedJourneys;
    },



    /*
     * Create page.
     */
     createNewPage: function(callback) {
      var self = this;
      var callback = (callback) ? callback : function() {};

      /* Create the new page */
      var $newPage = $('<div class="process_page checkout"><div class="process_page_loading"><span class="text_spinner">' + lang('checkout.text_spinner') + '</span><span class="spinner"></span></div></div>');

      /* Append the new page to the process */
      this.element.closest('.process_page_wrapper').append($newPage);

      /* Get the current offset */
      var offsetTop = this.element.closest('.process_page_wrapper').find('.process_page.checkout').index() * 100 * -1;

      /* Start background color animation */
      setTimeout(function() {
        self.element.closest('.process_page_wrapper').find('.process_page.checkout .process_page_loading').addClass('showing');
      }, 200);

      /* Animate wrapper to show it */
      this.element.closest('.process_page_wrapper').animate({
        'top': offsetTop + '%'
      }, 500, 'easeInOutExpo', function() {
        /* Show spinner */
        self.element.closest('.process_page_wrapper').find('.process_page.checkout .process_page_loading .spinner').show();
        self.element.closest('.process_page_wrapper').find('.process_page.checkout .process_page_loading .text_spinner').show();

        /* Execute callback */
        callback();
      });
    },



    /*
     * Delete page.
     */
    deleteNewPage: function(callback) {
      var self = this;
      var callback = (callback) ? callback : function() {};

      /* Get the current offset */
      var offsetTop = this.element.closest('.process_page_wrapper').find('.process_page.results').index() * 100 * -1;

      /* Animate wrapper to show it */
      this.element.closest('.process_page_wrapper').animate({
        'top': offsetTop + '%'
      }, 500, 'easeInOutExpo', function() {
        /* Delete the new page */
        self.element.closest('.process_page_wrapper').find('.process_page.checkout').remove();

        /* Execute callback */
        callback();
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
      /*
     * Interbalearic flights options.
     */
    showInterbalearicRatesOptions: function() {
      var self = this;
      var jointsSocial;
      var $form = this.element.find('.mini_search_form_wrapper form');

      $('#mini_search_form_to').on('blur',function(){

        var origin = ($form.find('#mini_search_form_from')).val(),
            destination = ($form.find('#mini_search_form_to')).val(),
            residentIsShow = $form.find('.checkbox.resident').is(':visible');

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

    /*
     * This needs a refactor!!!!!
     * Function that controll top position of prices module
     */
    customPricesModulesScroll: function(){

      var mooved = false;

      this.element.find('.results_scroll').on('scroll.results', function(){

        var $prices_moduleHeight = $('.prices_module').height();
        var $containerHeight = $(window).height() - 204;
        var $submitConfirm = $('.submit.confirm')
        var submitConfirmHeight = $submitConfirm.height();
        var lastJourney = $('.journeys_module').last();

        if ($prices_moduleHeight > $containerHeight) {

          var prices_moduleBottom = $('.prices_module').offset().top + $prices_moduleHeight;

          if ($submitConfirm.css('display') === 'block') {

            var submitConfirmBottom = $submitConfirm.offset().top + submitConfirmHeight;

            if (prices_moduleBottom > submitConfirmBottom) {

              var top = submitConfirmBottom - $prices_moduleHeight + 30;
              $('.prices_module').css('top',top)
              mooved = true;

            }else if($('.prices_module').offset().top > 204 && mooved){
              
              $('.prices_module').css('top','204px');
              mooved = false;
            
            }else if(mooved){

              var top = submitConfirmBottom - $prices_moduleHeight;
              $('.prices_module').css('top',top)

            };

          }else{

            var lastJourneyBottom = lastJourney.offset().top + lastJourney.height();

            if (prices_moduleBottom > lastJourneyBottom) {

              var top = lastJourneyBottom - $prices_moduleHeight;
              $('.prices_module').css('top',top);
              mooved = true;

            }else if($('.prices_module').offset().top > 204 && mooved){
              
              $('.prices_module').css('top','204px');
              mooved = false;
            
            }else if(mooved){

              var top = lastJourneyBottom - $prices_moduleHeight;
              $('.prices_module').css('top',top)

            };
          };

        }else{

          return false;
        };

      });
    }


  };
});
