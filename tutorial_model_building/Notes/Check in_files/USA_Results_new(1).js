Hydra.module.register('USAResults', function(Bus, Module, ErrorHandler, Api) {

  return {
    selector: '#results',
    element: undefined,
    resultsData: undefined, /* Cache the last data results */
    resultsParams: undefined, /* Cache the last search */
    hash: undefined,

    events: {
      'results': {
        'USA_custom_init': function() {
          this.customInit();
          Bus.publish('prerender', 'restart');
        },
        'USA_set_results_data': function(oNotify) {
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
        /* Get results data */
        Bus.publish('process', 'USA_get_results_data');

        /* Journeys height by hour */
        if (this.element.find('.results_by_hour').length > 0) {
          this.setJourneysHeight();
          this.journeysHeight();
        }
        else {
          $(window).off('resize.results');
        }

        /* Show a modal window if the user is logged in and selected a resident discount */
        this.showResidentDiscountWarning();

        this.showInterbalearicRatesWarning();

        /* Init mini search, delegate it's control to Search module */
        this.initMiniSearch();

        /* Init banner with search information*/
        this.initSearchHeader();

        /* Toggle minisearch */
        this.toggleMinisearch();

        /* Init day before and after controls */
        this.initDayBeforeAfterControls();

        /* Init results view modes and filters */
        this.initViewModes();
        this.initTransfersFilter();

        /* Start scroll stuff */
        this.scrollSpy();
        this.listenKeyboard();

        /* Select journey events */
        this.listenSelectJourney();
        this.selectByDefault();
        if (this.element.find('.results_by_hour').length > 0) {
        	this.showAllCheapestPrice();
        }

        /* Start graphics */
        this.initGroupedGraphics();

        /* Init prices tooltips */
        this.initPricesTooltips();

        /* Listen overlay */
        this.listenResultsOverlay();
        this.listenResultsHoverPrices();

        /* Matrix functions */
        this.initMatrixFunctions();
        this.scrollSpyMatrix();
        this.settingMinHeightMatrix();
        this.settingShadowRowColumnsWidth();
        this.byHourCheckHeights();

      }
    },

    /* Journeys */

    journeysHeight: function() {
      var self = this;

      $(window).off('resize.results');
      $(window).on('resize.results', function() {
        self.setJourneysHeight();
      });
    },

    byHourCheckHeights: function() {
      var $jorneysGroupBody = this.element.find('.results_by_hour .journeys_group .body');

      if ($jorneysGroupBody.length > 0 ) {
        var max_height = 0;
        $.each($jorneysGroupBody, function() {
          var $this = $(this);
          max_height = Math.max(max_height, $this.height());
        });
        $jorneysGroupBody.css('height', max_height);
      }
    },
    setJourneysHeight: function() {
      var $jorneysGroupHeader = this.element.find('.results_by_hour .journeys_group').eq(0).find('.header');
      var $jorneysGroupBody = this.element.find('.results_by_hour .journeys_group .body');
      var $resultsByHour = this.element.find('.results_by_hour');
      var $resultsTopbar = this.element.find('.results_topbar');
      var $resultsScroll = this.element.find('.results_by_hour').closest('.results_scroll');
      var height;

      if ($resultsScroll.length > 0 && $resultsByHour.length > 0 && $resultsTopbar.length > 0 && $jorneysGroupHeader.length > 0) {
        height = $resultsScroll.height() - $resultsByHour.position().top - $resultsTopbar.height() - $jorneysGroupHeader.height() - 46;
      }

      $jorneysGroupBody.css('min-height', height);
    },

    /* SearchHeader */

    initSearchHeader: function() {

      $(".process_top_bar").css("display", "block");

      var adultos = 0;
      var ninos = 0;
      var bebes = 0;
      var personas = 0;
      var vuelofindestino = this.resultsData["journeys"]["ow"][0]["fragments"].length - 1;

      if(this.resultsData["journeys"]["ow"][0]["price"]["economy"] == null){
        adultos = this.resultsData["journeys"]["ow"][0]["price"]["business"]["costs"][0]["description"].split("x");
      }else{
        adultos = this.resultsData["journeys"]["ow"][0]["price"]["economy"]["costs"][0]["description"].split("x");
      }

      $('.title-editable').show();
      $('.title-ruta').html(this.resultsData["owDescription"] + ' (' +   this.resultsData["owIATA"] + ') ');

      $('.title-ruta2').html(this.resultsData["rtDescription"] + ' (' + this.resultsData["rtIATA"] + ') ');

      $('.title-date1').html(this.resultsData["owDate"].split(" ")[1] + " " + this.resultsData["owDate"].split(" ")[2].substring(0, 3) + " ");

      if(this.resultsData["rtDate"] != null){
        $('.title-date2').html(this.resultsData["rtDate"].split(" ")[1] + " " + this.resultsData["rtDate"].split(" ")[2].substring(0, 3) + " ");
      }

      if(this.resultsData["rtDate"] != null){
        $('.title-date2').html(this.resultsData["rtDate"].split(" ")[1] + " " + this.resultsData["rtDate"].split(" ")[2].substring(0, 3) + " ");
      }

      adultos = adultos[1].split(")")[0];

      if(this.resultsData["journeys"]["ow"][0]["price"]["economy"] == null){
        if(this.resultsData["journeys"]["ow"][0]["price"]["business"]["costs"].length > 2){
          ninos = this.resultsData["journeys"]["ow"][0]["price"]["business"]["costs"][1]["description"].split("x");
          bebes = this.resultsData["journeys"]["ow"][0]["price"]["business"]["costs"][2]["description"].split("x");
        }
      }else{
         if(this.resultsData["journeys"]["ow"][0]["price"]["economy"]["costs"].length > 2){
          ninos = this.resultsData["journeys"]["ow"][0]["price"]["economy"]["costs"][1]["description"].split("x");
          bebes = this.resultsData["journeys"]["ow"][0]["price"]["economy"]["costs"][2]["description"].split("x");
        }
      }

      if(this.resultsData["journeys"]["ow"][0]["price"]["economy"] != null){
        if(this.resultsData["journeys"]["ow"][0]["price"]["economy"]["costs"].length > 1){
          if (this.resultsData["journeys"]["ow"][0]["price"]["economy"]["costs"][1]["type"] == "Child" || this.resultsData["journeys"]["ow"][0]["price"]["economy"]["costs"][1]["type"] == "Infant"){
            ninos = ninos[1].split(")")[0];
          }else{
            ninos = 0;
          }
        }
      }

      if(this.resultsData["journeys"]["ow"][0]["price"]["economy"] != null){
        if(this.resultsData["journeys"]["ow"][0]["price"]["economy"]["costs"].length > 2){
          if (this.resultsData["journeys"]["ow"][0]["price"]["economy"]["costs"][2]["type"] == "Child" || this.resultsData["journeys"]["ow"][0]["price"]["economy"]["costs"][2]["type"] == "Infant"){
            bebes = bebes[1].split(")")[0];
          }else{
            bebes = 0;
          }
        }
      }


      personas = parseInt(adultos) + parseInt(ninos) + parseInt(bebes);

      $('.title-personas').html(personas);

      if(this.resultsData["rtDate"] == null){
        $('.title-vuelta').hide();
      }

      if(personas > 1){
        $('.alonep').hide();
      }else{
        $('.multiplep').hide();
      }

    },

    /* Mini search */

    initMiniSearch: function() {

      var self = this,
          $miniSearchOptions = this.element.find('.mini_search form .options');

      /* Init search form */
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
          var resident = this.element.find('.options .checkbox.resident input').is(':checked') || 'false';
          var business = this.element.find('.options .checkbox.business input').is(':checked') || 'false';
          var flightsProcessURL = getProcessUrl('flights');

          /* Compose URL */
          var url = 'from/' + fromCode + '/to/' + toCode + '/ow/' + ow + '/adults/' + adults;

          /* Optional parameters */
          url += '/rt/' + rt;
          url += '/kids/' + kids;
          url += '/babies/' + babies;
          url += '/resident/' + resident;
          url += '/business/' + business;

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

          if ($('#results').hasClass('form_changed')){
            $('.mini_search').css({position:'absolute',bottom:'',bottom:0});
            $('.mini_search').animate({bottom:80},500);
            if($('html').hasClass('ie11') || $('html').hasClass('ie10') || $('html').hasClass('ie9') || $('html').hasClass('ie8') || $('html').hasClass('ie7') || $('html').hasClass('ie6')) {
            	$('.mini_search').css({bottom:80,'animation-name':'','animation-duration':'','animation-fill-mode':''});
            }
            $('.header').fadeIn();
            var $resume = self.element.find('.resume');
            $resume.stop(true, false).animate({
              'height': 0
            }, 500, 'easeInOutExpo', function() {
              //self.setContentHeight();
              $resume.removeClass('opened');
              $('.process_top_bar').css('z-index', 2);
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

    /* Minisearch */

    toggleMinisearch: function() {

      var self = this;

      this.element.find('.cancel').on('click', 'a', function(event) {
        event.preventDefault();
      });

      this.element.find('.resume .view_minisearch').on('click', 'a', function(event) {
        event.preventDefault();

        $('.dates .ow').trigger('need_dates');

        var $a = $(this);
        var fullHeight = self.element.find('.resume .mini_search').outerHeight();
        var $resume = self.element.find('.resume');

        if ($a.closest('p').hasClass('open_minisearch')) {
          $('.header').fadeOut();
          $resume.addClass('opened');
          $('.process_top_bar').css('z-index', 25);
          $('.mini_search').css({position:'absolute',bottom:'',bottom:80});
          $('.mini_search').animate({bottom:0},500);
          if($('html').hasClass('ie11') || $('html').hasClass('ie10') || $('html').hasClass('ie9') || $('html').hasClass('ie8') || $('html').hasClass('ie7') || $('html').hasClass('ie6')) {
          	$('.mini_search').css({bottom:0,'animation-name':'','animation-duration':'','animation-fill-mode':''});
          }
          $resume.stop(true, false).animate({
            'height': fullHeight / 2
          }, 500, 'easeInOutExpo', function() {
            //self.setContentHeight();
          });
        }
        else if ($a.closest('p').hasClass('close_minisearch')) {
          $resume.stop(true, false).animate({
            'height': 0
          }, 500, 'easeInOutExpo', function() {
            //self.setContentHeight();
            $resume.removeClass('opened');
            $('.process_top_bar').css('z-index', 2);
          });
        }
      });

    },

    initDayBeforeAfterControls : function(){

      var self = this;

      // Cache day controls
      var $dayControls = this.element.find('.day_before_after_controls');

      // Reference dates
      var todayMoment = moment();
      var upperLimitDateMoment = moment().add(360, 'day');

      /* Flags for show or hide */
      var showOw = true;
      var showOwBefore = true;
      var showOwAfter = true;
      var showRt = true;
      var showRtBefore = true;
      var showRtAfter = true;

      /* Get current dates from minisearch inputs */
      var owDateString = this.element.find('.mini_search #mini_search_form_ow').val();
      var owDateMoment = moment(owDateString, 'MM-DD-YYYY');
      var rtDateString = this.element.find('.mini_search #mini_search_form_rt').val();
      var rtDateMoment = moment(rtDateString, 'MM-DD-YYYY');

      /* Check items to hide or disable */
      if (owDateMoment.startOf('day').isSame(todayMoment.startOf('day'))) showOwBefore = false; // Is today
      if (owDateMoment.startOf('day').isSame(upperLimitDateMoment.startOf('day'))) showOwAfter = false; // Is on limit
      if (owDateMoment.startOf('day').isSame(rtDateMoment.startOf('day'))) showOwAfter = false; // Is same than rt
      if (rtDateMoment.isValid() == false) showRt = false;
      if (rtDateMoment.startOf('day').isSame(owDateMoment.startOf('day'))) showRtBefore = false; // Is same than ow
      if (rtDateMoment.startOf('day').isSame(upperLimitDateMoment.startOf('day'))) showRtAfter = false; // Is on limit

      /* Show/hide and enable/disable using flags */
      (showOw) ? $dayControls.find('.ow_control').show() : $dayControls.find('.ow_control').hide();
      (showOwBefore) ? $dayControls.find('.ow_control .day_before').removeClass('disabled') : $dayControls.find('.ow_control .day_before').addClass('disabled');
      (showOwAfter)  ? $dayControls.find('.ow_control .day_after').removeClass('disabled') : $dayControls.find('.ow_control .day_after').addClass('disabled');
      (showRt) ? $dayControls.find('.rt_control').show() : $dayControls.find('.rt_control').hide();
      (showRtBefore) ? $dayControls.find('.rt_control .day_before').removeClass('disabled') : $dayControls.find('.rt_control .day_before').addClass('disabled');
      (showRtAfter)  ? $dayControls.find('.rt_control .day_after').removeClass('disabled')  : $dayControls.find('.rt_control .day_after').addClass('disabled');

      /* Set target dates for each link */
      var dayBeforeOw = owDateMoment.clone().subtract(1, 'day').format('MM-DD-YYYY');
      var dayBeforeOwISO = owDateMoment.clone().subtract(1, 'day').format();
      var dayAfterOw  = owDateMoment.clone().add(1, 'day').format('MM-DD-YYYY');
      var dayAfterOwISO  = owDateMoment.clone().add(1, 'day').format();
      var dayBeforeRt = rtDateMoment.clone().subtract(1, 'day').format('MM-DD-YYYY');
      var dayBeforeRtISO = rtDateMoment.clone().subtract(1, 'day').format();
      var dayAfterRt  = rtDateMoment.clone().add(1, 'day').format('MM-DD-YYYY');
      var dayAfterRtISO  = rtDateMoment.clone().add(1, 'day').format();

      var dayBeforeOwTime= new Date(dayBeforeOwISO).getTime();
      if(window.disableddatesOW && window.disableddatesOW.indexOf(dayBeforeOwTime) !=-1){
    	  $dayControls.find('.ow_control .day_before').addClass('disabled');
      }
      var dayAfterOwTime  = new Date(dayAfterOwISO).getTime();
      if(window.disableddatesOW && window.disableddatesOW.indexOf(dayAfterOwTime) !=-1){
    	  $dayControls.find('.ow_control .day_after').addClass('disabled');
      }
      var dayBeforeRtTime = new Date(dayBeforeRtISO).getTime();
      if(window.disableddatesRT && window.disableddatesRT.indexOf(dayBeforeRtTime) !=-1){
    	  $dayControls.find('.rt_control .day_before').addClass('disabled');
      }
      var dayAfterRtTime  = new Date(dayAfterRtISO).getTime();
      if(window.disableddatesRT && window.disableddatesRT.indexOf(dayAfterRtTime) !=-1){
    	  $dayControls.find('.rt_control .day_after').addClass('disabled');
      }

      /* Set target dates */
      $dayControls.find('.ow_control .day_before').data('target-date', dayBeforeOw);
      $dayControls.find('.ow_control .day_after').data('target-date', dayAfterOw);
      $dayControls.find('.rt_control .day_before').data('target-date', dayBeforeRt);
      $dayControls.find('.rt_control .day_after').data('target-date', dayAfterRt);

      /* Add events */
      $dayControls.on('click', '.ow_control .day_before, .ow_control .day_after', function(event){
        event.preventDefault();
        if ($(this).hasClass('disabled')) return;
        self.element.find('.mini_search #mini_search_form_ow').val($(this).data('target-date'));
        self.element.find('.mini_search form').trigger('submit');
      });
      $dayControls.on('click', '.rt_control .day_before, .rt_control .day_after', function(event){
        event.preventDefault();
        if ($(this).hasClass('disabled')) return;
        self.element.find('.mini_search #mini_search_form_rt').val($(this).data('target-date'));
        self.element.find('.mini_search form').trigger('submit');
      });

    },

    listenResultsOverlay: function() {
      var self = this;

      this.element.find('.mini_search .submit .cancel').on('click.results', function(event) {
        event.preventDefault();


        /* Restore default values */
        Bus.publish('process', 'USA_miniSearchDefaultValues');

        /* Hide overlay */
        self.element.find('.results_scroll .overlay').fadeOut(300, function() {
          self.element.removeClass('form_changed');
          self.element.find('.results_scroll .overlay').attr('style', '');
        });

        $('.mini_search').css({position:'absolute',bottom:'',bottom:0}).animate({bottom:80},500);
        $('.header').fadeIn();
        var $resume = self.element.find('.resume');
        $resume.stop(true, false).animate({
           'height': 0
        }, 500, 'easeInOutExpo', function() {
          //self.setContentHeight();
          $resume.removeClass('opened');
          $('.process_top_bar').css('z-index', 2);
        });
        if($('html').hasClass('ie11') || $('html').hasClass('ie10') || $('html').hasClass('ie9') || $('html').hasClass('ie8') || $('html').hasClass('ie7') || $('html').hasClass('ie6')) {
          	$('.mini_search').css({bottom:80,'animation-name':'','animation-duration':'','animation-fill-mode':''});
        }
      });
    },

    listenResultsHoverPrices: function() {
        this.element.find('.price.cell').hover(function(event) {
       	  event.preventDefault();
       	  var $this = $(this);
       	  var $group = $this.closest('.journeys_group');
       	  var $block = $this.closest('.journeys_block');
       	  var $thisResult = $this.closest('.result');
       	  var economyPrice, businessPrice;
       	  var owId, rtId, busOwId, busRtId;
       	  var hourOw, hourRt;
       	  var hourOwFlight, hourRtFlight;

       	  if(!($this.hasClass('no_dispo'))) {

  		    /*Set hour highlight*/
     		hourOwFlight =$this.attr('data-hourOw');
      		hourRtFlight =$this.attr('data-hourRt');
      		hourOw= $group.find('.departure_flights .journey.matrix[data-positionOW='+hourOwFlight+']');
      		if(hourOw){
      		  hourOw.parent().addClass('highlight');
      		}
      		hourRt = $group.find('.return_flights .journey.matrix[data-positionRT='+hourRtFlight+']');
      		if(hourRt){
      		  hourRt.parent().addClass('highlight');
      		}
          }
        },function(event){
          event.preventDefault();

          var $this = $(this);
       	  var $group = $this.closest('.journeys_group');

       	  $group.find('.return_header.cell.highlight').removeClass('highlight');
  		  $group.find('.departure_header.cell.highlight').removeClass('highlight');

        });
      },

    /* View modes */
    initViewModes: function() {
      this.element.off('.results');
      this.element.on('click.results', '.results_topbar .options li a', function(event) {
        event.preventDefault();

        var $a = $(this);
        var mode = $a.closest('li').attr('data-mode');
        var isActive = ($a.closest('li').hasClass('active'));
        var currentHash = window.location.hash.substr(2);
        var newHash = '';

        if (!isActive) {
          /* Toggle the button status */
          $a.closest('ul').find('.active').removeClass('active');
          $a.closest('li').addClass('active');

          /* Toggle view mode */
          if (currentHash.indexOf('/view') > 0) {
            if (currentHash.indexOf('/view/hour') > 0) {
              var sustituteHash = '/view/'+ mode;
              newHash = currentHash.replace('/view/hour', sustituteHash);
            }
            else if (currentHash.indexOf('/view/price') > 0) {
              var sustituteHash = '/view/'+ mode;
              newHash = currentHash.replace('/view/price', sustituteHash);
            }
            else if (currentHash.indexOf('/view/matriz') > 0) {
              var sustituteHash = '/view/'+ mode;
              newHash = currentHash.replace('/view/matriz', sustituteHash);
            }

          }
          else {
            newHash = currentHash + '/view/' + mode;
          }

          if (currentHash != newHash) {
            /* Change the hash to call again to the search */
            Bus.publish('hash', 'change', {hash: newHash});
          }
        }
      });
    },

    /* Filters */
    initTransfersFilter: function() {
      this.element.on('click.results', '.results_topbar .filters .expand_transfers li a', function(event) {
        event.preventDefault();
        var $a = $(this);

        var index_fijo = ('transfer_').length;
        var transferSelected = $a.attr('id');
        transferSelected = transferSelected.substring(index_fijo);

        Bus.publish('process', 'USA_render_results', {transferSelected:transferSelected});
      });
    },

    /* Scroll stuff */

    scrollSpy: function() {
      var self = this;
      var $resultScroll, $scrollItems, pricesHeight, pricesStartMove, pricesStopMove;

      if (this.element.find('.process_wrapper_content').hasClass('by_price'))  {

        /* Start controls for by_price view */
        this.byPriceControls();

        /* Get vars */
        $resultScroll = this.element.find('.results_scroll');
        $topBar = this.element.find('.results_topbar');
        $scrollItems = this.element.find('.results_content .results_list .result');
        pricesHeight = $scrollItems.eq(0).find('.prices').height();

        /* Bind scroll */
        $resultScroll.on('scroll.results', function () {
          var scrollTop = $resultScroll.scrollTop(); /* Current scroll position */

          /* Get the active item */
          var $activeItem = $scrollItems.map(function() {
            if (($(this).position().top - pricesHeight) < scrollTop) {
              return this;
            }
          });

          var $passedElements = $activeItem.filter(':not(:last)');
          $activeItem = $activeItem.last();

          /* Change active status */
          if (!$activeItem.hasClass('active')) {
            /* Set active status */
            self.element.find('.results_content .results_list .result.active').removeClass('active');
            $activeItem.addClass('active');

            /* Set passed status for previous elements */
            self.element.find('.results_content .results_list .result.passed').removeClass('passed');
            $passedElements.addClass('passed');
          }

          /* Set price block fixed/absoute */
          pricesStartMove = $activeItem.position().top + 20;
          pricesStopMove = pricesStartMove + $topBar.height() + $activeItem.height() - $activeItem.find('.prices').height();

          if (scrollTop >= pricesStartMove && scrollTop < pricesStopMove) {
            $activeItem.find('.prices').addClass('following').removeClass('stopped');
          }
          else {
            $activeItem.find('.prices').removeClass('following');
          }

          /* Clean passed */
          if ($passedElements.find('.prices').hasClass('following')) {
            $passedElements.find('.prices').removeClass('following');
          }

          /* Clean not active not passed items */
          var $notPassedElements = self.element.find('.results_content .results_list .result').not('.passed').not('.active');
          if ($notPassedElements.find('.prices').hasClass('following')) {
            $notPassedElements.find('.prices').removeClass('following');
          }
        });

      }


    },

    /* Scroll stuff for the matrix view */

    scrollSpyMatrix: function() {
      var self = this;
      var $resultScroll, $scrollItems ,$topBar, pricesHeight, pricesStartMove, $prices,
          pricesStopMove, $leftBar, $top_wrapper, $topMessage, $topBarMatrix, wrapper_width,$matrixTable;

      if ((this.element.find('.by_matriz').length > 0 )&&(this.element.find('.avoid_fixing').length == 0)) {

        /* Get Vars */
        $top_wrapper = this.element.find('.top_wrapper');
        $topBar = this.element.find('.results_topbar');
        $topBarMatrix = this.element.find('.top-bar-matrix');
        $topMessage = this.element.find('.top-message-matrix');
        $matrixTable = this.element.find('.matrix_table');
        $leftBar = this.element.find('.left-bar-matrix');
        $prices = this.element.find('.prices');
        $resultScroll = this.element.find('.results_scroll');
        wrapper_width = $top_wrapper.width();
        message_width = $topMessage.width();
        topBarMatrix_width = $topBarMatrix.width();

        /*Setting css by scripting */
        $top_wrapper.css('width', wrapper_width);
        $topMessage.css('width', message_width - 50);
        $topBarMatrix.css('width', topBarMatrix_width);
        $prices.css('left', topBarMatrix_width + 48);

        /*adding fixed classes to elements */
        $top_wrapper.addClass('fixed');
        $topBar.addClass('fixed');
        $topMessage.addClass('fixed');
        $matrixTable.addClass('fixed-compensated');
        $topBarMatrix.addClass('fixed');
        $leftBar.addClass('fixed');
        $prices.addClass('fixed');

        //things to do when scroll begins
        $resultScroll.on('scroll.results', function () {
          $top_wrapper.addClass('shadow');
        });

        //after resizing we recalculate
        $( window ).resize(function() {

          if ($('.process_page_wrapper').attr('data-view') !== 'checkout'){
            //removing the fixed class to recalculate dimensions
            $top_wrapper.removeClass('shadow');
            $top_wrapper.removeClass('fixed');
            $topBar.removeClass('fixed');
            $topMessage.removeClass('fixed');
            $matrixTable.removeClass('fixed-compensated');
            $topBarMatrix.removeClass('fixed');
            $leftBar.removeClass('fixed');
            $prices.removeClass('fixed');

            /*reseting css by scripting */
            $top_wrapper.css('width', '100%');
            $topMessage.css('width', '100%');
            $topBarMatrix.css('width', '100%');
            $prices.css('left', 'initial');

            /*calculating dimensions*/
            wrapper_width = $top_wrapper.width();
            message_width = $topMessage.width();
            topBarMatrix_width = $topBarMatrix.width();

            /*Setting css by scripting */
            $top_wrapper.css('width', wrapper_width);
            $topMessage.css('width', message_width - 50);
            $topBarMatrix.css('width', topBarMatrix_width);
            $prices.css('left', topBarMatrix_width + 48);


            /*adding fixed classes to elements */
            $top_wrapper.addClass('fixed');
            $topBar.addClass('fixed');
            $topMessage.addClass('fixed');
            $matrixTable.addClass('fixed-compensated');
            $topBarMatrix.addClass('fixed');
            $leftBar.addClass('fixed');
            $prices.addClass('fixed');
          }
        });

        /* Hover over brackets to show Graphic Wrapper*/
        this.hoverOverBrackets;
      }
    },

    byPriceControls: function() {
      var self = this;

      /* Bind click event for controls */
      this.element.find('.results_controls li a').on('click.results', function(event) {
        event.preventDefault();

        /* Get vars */
        var $a = $(this);
        var $resultsScroll = self.element.find('.results_scroll');
        var $list = self.element.find('.results_content .results_list');
        var $currentItem = self.element.find('.results_content .results_list .result.active');
        var currentItemIndex = $currentItem.index();
        var $newActive;
        var position = 0;

        if (!$list.hasClass('scrolling')) {

          /* Set blocking class */
          $list.addClass('scrolling');

          if ($a.closest('li').hasClass('next')) { /* Next arrow */
            /* Control limits */
            if (currentItemIndex >= $list.children().length - 1) $newActive = $currentItem;
            else $newActive = $list.find('.result').eq(currentItemIndex + 1);
          }
          else if ($a.closest('li').hasClass('prev')) { /* Prev arrow */
            /* Control limits */
            if (currentItemIndex <= 0) $newActive = $currentItem;
            else $newActive = $list.find('.result').eq(currentItemIndex - 1);
          }

          /* Find out first result */
          if ($newActive.is(':first-child')) {
            position = 0;
          }
          else {
            position = $newActive.position().top + 20;
          }

          /* Scroll to new item position */
          $resultsScroll.stop().animate({
            scrollTop: position
          }, 600, 'easeInOutExpo', function() {
            /* Unset blocking class */
            $list.removeClass('scrolling');
          });
        }

      });
    },

    listenKeyboard: function() {
      var self = this;

      $(document).on('keydown.results', function(e) {
        switch (e.keyCode) {
          case 40: /* Down key */
            e.preventDefault();
            if (!self.element.find('.mini_search form').hasClass('focused')) {
              self.element.find('.results_controls li.next a').trigger('click');
            }
            break;
          case 38: /* Up key */
            e.preventDefault();
            if (!self.element.find('.mini_search form').hasClass('focused')) {
              self.element.find('.results_controls li.prev a').trigger('click');
            }
            break;
        }
      });
    },

    /* Select journey events */

    listenSelectJourney: function() {
      var self = this;

      /* Select price matriz*/
      this.element.find('.results_list .price.cell').on('click.results', function(event) {

    	var $this = $(this);
		var $group = $this.closest('.journeys_group');
		var $block = $this.closest('.journeys_block');
		var $thisResult = $this.closest('.result');
		var economyPrice, businessPrice;
		var owId, rtId, busOwId, busRtId;
		var hourOw, hourRt;
		var hourOwFlight, hourRtFlight;
		var busNotCompatible = false;

		if (!$this.hasClass('selected')) {
			/* Set this prices as selected */
			$group.find('.price.cell.selected').removeClass('selected');
		  	$this.addClass('selected');

		  	 /*Set hour selected*/
		    $group.find('.return_header.cell.selected').removeClass('selected');
		    $group.find('.departure_header.cell.selected').removeClass('selected');

		    hourOwFlight =$this.attr('data-hourOw');
		    hourRtFlight =$this.attr('data-hourRt');
		  	hourOw= $group.find('.departure_flights .journey.matrix[data-positionOW='+hourOwFlight+']');
		  	if(hourOw){
		  		hourOw.parent().addClass('selected');
		  	}
		  	hourRt = $group.find('.return_flights .journey.matrix[data-positionRT='+hourRtFlight+']');
		  	if(hourRt){
		  		hourRt.parent().addClass('selected');
		  	}


		  	/* Price unavailable by default */
		  	$thisResult.find('.price_block.business').addClass('price_unavailable');
		  	$thisResult.find('.price_block.economy').addClass('price_unavailable');

		  	/* economyPrice: Set the index object ow.id-rt.id */
		    owId = $this.attr('data-owidtur');
		    rtId = $this.attr('data-rtidtur');
		    economyPrice = 'TUR_' + owId + '-' + 'TUR_' + rtId;

			 /* Clean economy indexes if it's an only business search */
			if ($thisResult.closest('.only_business').length > 0) {
				economyPrice = undefined;
			}

			/* Control if business price exists */
			busOwId = $this.attr('data-owidbus');
			busRtId = $this.attr('data-rtidbus');
			if (busOwId && busRtId) {
				businessPrice = 'BUS_' + busOwId + '-' + 'BUS_' + busRtId;
			}

			/* Prices calc if it's the by_hour view */
			self.getByHourPrices(economyPrice, businessPrice,busNotCompatible, {owId: owId, rtId: rtId}, {owId: busOwId, rtId: busRtId});
		}
      });

      /* Select journey */
      this.element.find('.results_list .journey').on('click.results', function(event) {
    	var $this = $(this);
    	var $group = $this.closest('.journeys_group');
    	var $block = $this.closest('.journeys_block');
    	var $thisResult = $this.closest('.result');
        var $otherGroup;
        var $otherGroupSelected;
        var thisId = $this.attr('data-id');
        var thisOriginalId = $this.attr('data-original-id');
        var otherOriginalId;
        var economyPrice, businessPrice;
        var flight = $this.attr('data-flight');
        var otherFlight;
        var owId, rtId, busOwId, busRtId;
        var owArrivalDate, owArrivalMoment, rtDepartureDate, rtDepartureMoment;
        var isRt = !($this.closest('.process_wrapper_content').hasClass('no_rt'));
        var noCompatibleMessage;
        var transfers = $this.attr('data-transfers');
        var busNotCompatible = false;

        /* Prepare the other group journeys */
        if ($group.hasClass('ow')) $otherGroup = $block.find('.journeys_group.rt');
        else $otherGroup = $block.find('.journeys_group.ow');

        /* If it's not selected, select it and make all logic */
        if (!$this.hasClass('selected')) {
          /* Set this journey as selected */
          $group.find('.journey.selected').removeClass('selected');
          $this.addClass('selected');

          /* Select as well the duplicated flights */
          $group.find('.journey[data-flight=' + flight + '][data-transfers='+ transfers + ']').addClass('selected');

          /* Ow + Rt compatible flights functionality */
          if (isRt) {
            /* Get the compatible journeys of the selected flight */
            var compatibleJourneys = [];
            var flightsFound = [];
            var thisCompatibleJourneys = $this.attr('data-compatible-journeys').split(',');

            // console.log("Este es el ID: " + thisId);

            /* Save the compatible journey and the flight number */
            $.each(thisCompatibleJourneys, function(index, id) {
              var $thisFlight = $otherGroup.find('.journey[data-id=' + id + ']');
              var flight = $thisFlight.attr('data-flight');
              var isBusiness = ($thisFlight.closest('.economy_and_business').length > 0) ? $thisFlight.hasClass('BUS') : false;

              if ($.inArray(flight, flightsFound) < 0 && !isBusiness) {
                compatibleJourneys.push(parseInt(id));
                compatibleJourneys.push(id);
                flightsFound.push(flight);
              }
            });

            // console.log("Compatibles inicialmente");
            // console.log(compatibleJourneys);

            /* Get the compatible journeys for duplicated flights */
            $group.find('.journey[data-flight=' + flight + ']').not('[data-id=' + thisId + ']').each(function() {
              var $this = $(this);
              var thisJourneys = $this.attr('data-compatible-journeys').split(',');

              // console.log("COMPATIBLE: " + thisJourneys)

              $.each(thisJourneys, function(index, id) {
                var $thisFlight = $otherGroup.find('.journey[data-id=' + id + ']');
                var flight = $thisFlight.attr('data-flight');
                var isBusiness = ($thisFlight.closest('.economy_and_business').length > 0) ? $thisFlight.hasClass('BUS') : false;

                // console.log("El flight encontrado es: " + flight);
                // console.log("El id que estamos buscando es: " + id);

                if ($.inArray(flight, flightsFound) < 0 && !isBusiness) {
                  // console.log("En el compatible journeys guardamos: " + parseInt(id));
                  // console.log("En el compatible journeys guardamos: " + id);
                  compatibleJourneys.push(id);
                  flightsFound.push(flight);
                }
              });
            });

            // console.log("Vuelo seleccionado: " + flight);
            // console.log("Estos son los vuelos compatibles");
            // console.log(compatibleJourneys);

            /* Make disabled the non compatible flights of the other group */
            $otherGroup.find('.journey').each(function() {
              var $journey = $(this);
              var id = $journey.attr('data-id');

              /* Compatible flights */
              if ($.inArray(id, compatibleJourneys) >= 0) {
                // console.log("SIN DISABLED SIN VISIBLE: " + id)
                $journey.removeClass('disabled').removeClass('visible');
              }

              /* No compatible flights */
              else {
                // console.log("DISABLED: " + id);
                $journey.addClass('disabled').removeClass('visible');
              }
            });

            /* Be sure that one of the duplicated and disabled flights is visible */
            $otherGroup.find('.journey.duplicated.disabled').each(function() {
              /* Get flight number */
              var $this = $(this);
              var flight = $this.attr('data-flight');

              /* Get the flights with same number*/
              var $duplicatedFlights = $otherGroup.find('.journey[data-flight=' + flight + ']');

              /* Make first of them visible if all are invisible */
              if ($duplicatedFlights.not('.disabled').length == 0 && $duplicatedFlights.filter('.visible').length == 0) {
                $duplicatedFlights.eq(0).addClass('visible');
              }
            });

            /* Mark the uncompatible flights by hour (it means the ow flight arrives to the destiny later than the rt flight returns) */
            if (isRt) {
              /* Get the ow arrival date and the rt depature date */
              if ($group.hasClass('ow')) {
                // console.log("Es un viaje seleccionado de ida");
                owArrivalDate = $this.attr('data-gmt-arrival');
              }
              else {
                // console.log("Es un viaje seleccionado de vuelta");
                owArrivalDate = $otherGroup.find('.selected').not('.disabled').attr('data-gmt-arrival');
              }

              // console.log("La fecha de llegada del vuelo de ida: " + owArrivalDate);

              /* Clean disabled by hour state */
              $otherGroup.find('.journey').removeClass('disabled_by_hour');

              /* If there flights are compatible, check if ow arrival is previous to rt departure */
              if (owArrivalDate) {

                /* If the click is over the ow group */
                if ($group.hasClass('ow')) {
                  /* Create moment object */
                  owArrivalMoment = moment(owArrivalDate, 'DD/MM/YYYY HH:mm"');

                  $block.find('.journeys_group.rt').find('.journey').not('disabled').each(function() {
                    var $this = $(this);
                    var rtDepartureDate = $this.attr('data-gmt-departure');
                    var rtDepartureMoment = moment(rtDepartureDate, 'DD/MM/YYYY HH:mm"');
                    var diffMinutes = rtDepartureMoment.diff(owArrivalMoment, 'minutes');

                    if (diffMinutes <= 0) {
                      $this.addClass('disabled_by_hour');
                    }
                  });
                }

                /* Click over the rt group */
                else {
                  /* Create moment object */
                  rtDepartureDate = $this.attr('data-gmt-departure');
                  rtDepartureMoment = moment(rtDepartureDate, 'DD/MM/YYYY HH:mm"');

                  $block.find('.journeys_group.ow').find('.journey').not('disabled').each(function() {
                    var $this = $(this);

                    var owArrivalDate = $this.attr('data-gmt-arrival');
                    var owArrivalMoment = moment(owArrivalDate, 'DD/MM/YYYY HH:mm"');
                    var diffMinutes = rtDepartureMoment.diff(owArrivalMoment, 'minutes');

                    if (diffMinutes <= 0) {
                      $this.addClass('disabled_by_hour');
                    }
                  });
                }

              }
            }
          }

          /* Price unavailable by default */
          $thisResult.find('.price_block.business').addClass('price_unavailable');
          $thisResult.find('.price_block.economy').addClass('price_unavailable');

          /* Check no compatible flights */
          if ($otherGroup.find('.journey').length > 0 && $otherGroup.find('.selected').length > 0) { /* Ow + rt && both flights selected */
            $thisGroupSelected = $group.find('.selected').not('.disabled').not('.disabled_by_hour');
            $otherGroupSelected = $otherGroup.find('.selected').not('.disabled').not('.disabled_by_hour');

            /* Check if the two flights are not disabled */
            if ($otherGroupSelected.length == 0 || $thisGroupSelected.length == 0) {

              if ($group.find('.selected').eq(0).hasClass('disabled_by_hour') || $otherGroup.find('.selected').eq(0).hasClass('.disabled_by_hour')) {
                noCompatibleMessage = lang('results.no_compatible_hours');
              }
              else {
                noCompatibleMessage = lang('results.no_compatible');
              }

              if ($thisResult.find('.no_compatible_warning').length == 0) {
                $thisResult.find('.prices .prices_block').append('<div class="no_compatible_warning"><p>' + noCompatibleMessage + '</p></div>');
              }
              else {
                $thisResult.find('.no_compatible_warning p').text(noCompatibleMessage);
              }

              /* Clean prices */
              self.cleanPrices();

              /* Add class */
              $thisResult.addClass('no_compatible');
            }
            else { /* Flights are compatible, get prices */

              $thisResult.removeClass('no_compatible');

              /* Ask for the price just in case there are two flights selected */
              otherOriginalId = $otherGroupSelected.attr('data-original-id');
              otherFlight = $otherGroupSelected.attr('data-flight');

              /* economyPrice: Set the index object ow.id-rt.id */
              if ($group.hasClass('ow')) {
                economyPrice = 'TUR_' + thisOriginalId + '-' + 'TUR_' + otherOriginalId;
                owId = thisOriginalId;
                rtId = otherOriginalId;
              }
              else {
                economyPrice = 'TUR_' + otherOriginalId + '-' + 'TUR_' + thisOriginalId;
                owId = otherOriginalId;
                rtId = thisOriginalId;
              }

              /* businessPrice */
              var businessPriceObject = self.getBusinessIds($group.find('.journey.BUS[data-flight=' + flight + ']'), $otherGroup.find('.journey.BUS[data-flight=' + otherFlight + ']'));

              /* Clean economy indexes if it's an only business search */
              if ($thisResult.closest('.only_business').length > 0) {
                economyPrice = undefined;
              }

              /* Control if business price exists */
              if (businessPriceObject) {
                businessPrice = 'BUS_' +  businessPriceObject.busId + '-' + 'BUS_' + businessPriceObject.otherBusId;
                busOwId = businessPriceObject.busId;
                busRtId = businessPriceObject.otherBusId;
              }

              // console.log("Índice de precios economy: " + economyPrice);
              // console.log("Índice de precios business: " + businessPrice);

              /* Prices calc if it's the by_hour view */
              if (self.element.find('.process_wrapper_content').hasClass('by_hour')) {
                self.getByHourPrices(economyPrice, businessPrice, busNotCompatible, {owId: owId, rtId: rtId}, {owId: busOwId, rtId: busRtId});
              }
              else {

            	if(economyPrice){
            		/* Update data ids */
                    $thisResult.find('.price_block.economy').attr('data-owid', owId);
                    $thisResult.find('.price_block.economy').attr('data-rtid', rtId);
                    $thisResult.find('.price_block.economy').removeClass('price_unavailable');
            	}else{
            		$thisResult.find('.price_block.economy').attr('data-owid', '');
                    $thisResult.find('.price_block.economy').attr('data-rtid', '');

                    // console.log("NO TENEMOS PRECIO ECONOMY ELIMINAR");
                    $thisResult.find('.price_block.economy').addClass('price_unavailable');
            	}

                if (businessPrice) {
                  $thisResult.find('.price_block.business').attr('data-owid', busOwId);
                  $thisResult.find('.price_block.business').attr('data-rtid', busRtId);

                  // console.log("TENEMOS VUELO BUSINESS ASÍ QUE HAY QUE PINTAR EL PRECIO")
                  $thisResult.find('.price_block.business').removeClass('price_unavailable');
                }
                else {
                  $thisResult.find('.price_block.business').attr('data-owid', '');
                  $thisResult.find('.price_block.business').attr('data-rtid', '');

                  // console.log("NO TENEMOS PRECIO BUSINESS, ELIMINAR");
                  $thisResult.find('.price_block.business').addClass('price_unavailable');
                }
              }
            }
          }
          else if ($otherGroup.find('.journey').length == 0) { /* Only ow */
            // console.log("Sólo es de IDA");

            if ($this.hasClass('BUS')) {
              var $flightList = $group.find('.journey.TUR[data-flight=' + flight + ']');
              if ($flightList.length > 0) {
                thisOriginalId = $flightList.eq(0).attr('data-original-id');
              }
            }

            economyPrice = 'TUR_' + thisOriginalId;
            economyId = thisOriginalId;
            if($group.find('.journey').hasClass('matrix')){
            	businessPrice = 'BUS_' + $group.find('.journey.matrix[data-flight=' + flight + ']').eq(0).attr('data-idbus');
            	busId = $group.find('.journey.matrix[data-flight=' + flight + ']').eq(0).attr('data-idbus');
            }else{
            	businessPrice = 'BUS_' + $group.find('.journey.BUS[data-flight=' + flight + ']').eq(0).attr('data-original-id');
            	busId = $group.find('.journey.BUS[data-flight=' + flight + ']').eq(0).attr('data-original-id');
            }

            if($group.find('.journey.BUS.busNotCompatible[data-flight=' + flight + ']').length != 0){
              busNotCompatible =  true;
            }


            /* Clean economy indexes if it's an only business search */
            if (($thisResult.closest('.only_business').length > 0) || (busNotCompatible)) {
              economyPrice = undefined;
            }


            // console.log("El economyPriceIndex es: " + economyPrice);
            // console.log("El businessPrice es: " + businessPrice);

            /* Prices calc if it's the by_hour view */
            if (self.element.find('.process_wrapper_content').hasClass('by_hour') || self.element.find('.process_wrapper_content').hasClass('by_matriz')) {
              self.getByHourPrices(economyPrice, businessPrice,busNotCompatible, {owId: thisOriginalId}, {owId: busId});
            }
            else {

              /* Update data ids */
              $thisResult.find('.price_block.economy').attr('data-owid', economyId);

              // console.log(busId);
              // console.log(businessPrice);

              if (busId) {
                $thisResult.find('.price_block.business').attr('data-owid', busId);

                // console.log("TENEMOS VUELO BUSINESS ASÍ QUE HAY QUE PINTAR EL PRECIO")
                $thisResult.find('.price_block.business').removeClass('price_unavailable');
              }
              else {
                $thisResult.find('.price_block.business').attr('data-owid', '');

                // console.log("NO TENEMOS PRECIO BUSINESS, ELIMINAR");
                $thisResult.find('.price_block.business').addClass('price_unavailable');
              }
            }
          }
        }
        var listJourneyVisibleIdsOW = [];
        var listJourneyVisibleIdsRT = [];
        var $listJourneyOW = self.element.find('.results_list .journeys_group.ow .journey').not('.disabled');
        var $listJourneyRT = self.element.find('.results_list .journeys_group.rt .journey').not('.disabled');

        $thisResult.find('.journeys_group.ow .journey .from').removeClass('best-price');

        $listJourneyOW.each(function() {
        	 var $this = $(this);
             var journeyId = $this.attr('data-id'); /*TUR_2*/
             listJourneyVisibleIdsOW.push(journeyId);
		});

        $listJourneyRT.each(function() {
       	 var $this = $(this);
            var journeyId = $this.attr('data-id'); /*TUR_2*/
            listJourneyVisibleIdsRT.push(journeyId);
		});

        Bus.publish('process', 'USA_get_all_cheapest_price_visible', {
        	listJourneyVisibleIdsOW :listJourneyVisibleIdsOW,
        	listJourneyVisibleIdsRT: listJourneyVisibleIdsRT,
        	callback: function(isBusiness, cheapesPricesFlightsListOW, cheapesPricesFlightsListRT) {

          var cabinClass = (isBusiness ? 'BUS_' : 'TUR_');

          $.each(cheapesPricesFlightsListOW, function(cheapesPricesFlightsIndex, cheapesPricesFlightsOW) {
            var $firstOwJourneyFrom = $thisResult.find('.journeys_group.ow .journey[data-id=' + cabinClass + cheapesPricesFlightsOW.ow + '] .from ');
            $firstOwJourneyFrom.addClass('best-price');
          });

          $.each(cheapesPricesFlightsListRT, function(cheapesPricesFlightsIndex, cheapesPricesFlightsRT) {
            var $lastRtJourneyFrom = $thisResult.find('.journeys_group.rt .journey[data-id=' + cabinClass + cheapesPricesFlightsRT.ow + '] .from ');
            $lastRtJourneyFrom.addClass('best-price');
          });

        }});

      });

      /* Select price */
      this.element.find('.results_list .prices .price_block a').on('click.results', function(event) {
        event.preventDefault();

        $('.cancel').trigger('click');

        var valid = true;
        var $this = $(this);
        var $result = $this.closest('.result');
        var $groups = (self.element.find('.process_wrapper_content').hasClass('no_rt')) ? $result.find('.journeys_group.ow') : $result.find('.journeys_group');
        var owId = undefined;
        var owRecommendationId = '';
        var rtId = undefined;
        var flights = '';
        var $priceBlock = $this.closest('.price_block');
        var cabin = $priceBlock.attr('data-cabin');
        var postObject = {};
        var selectedJourneys = {};
        var totalAmount = parseFloat($priceBlock.find('.price span').text());

        /* Loop groups to see if they have selected flights */
        $groups.each(function() {
          var $group = $(this);

          if (($group.find('.journey.selected').not('.disabled').length == 0) && (!$group.find('.journey').hasClass('matrix'))) {
            valid = false;
          }
        });

        /* Actions */
        if (valid) {
          /* Remove tooltips */
          $('.ui-tooltip').remove();
          $('.process_top_bar').addClass('hidden_process_topbar');
          /* Start loading */
          self.createNewPage(function() {

            /* Get fliths ids */
            owId = $priceBlock.attr('data-owid');
            rtId = $priceBlock.attr('data-rtid');

            /* Setting focus on window to forze tooltip disappear */
            window.focus();

            /* Create data objects to send to service and session server */
            selectedJourneys = self.getSelectedJourneys(owId, rtId, cabin);

            // console.log(owId);
            // console.log(rtId);
            // console.log(selectedJourneys)

            Bus.publish('services', 'USA_getBookingBlock', {
              data: {
                resultsData: self.resultsData,
                selectedJourneys: selectedJourneys
              },
              success: function(data) {
              	if ($('.by_matriz').length ) {
            	      var $top_wrapper = $('.top_wrapper');
            	      var $topBar = $('.results_topbar');
            	      var $topBarMatrix = $('.top-bar-matrix');
            	      var $topMessage = $('.top-message-matrix');
            	      var $matrixTable = $('.matrix_table');
            	      var $leftBar = $('.left-bar-matrix');
            	      var $prices = $('.prices');


            	        /*adding fixed classes to elements */
            	      $top_wrapper.removeClass('fixed');
            	      $topBar.removeClass('fixed');
            	      $topMessage.removeClass('fixed');
            	      $matrixTable.removeClass('fixed-compensated');
            	      $topBarMatrix.removeClass('fixed');
            	      $leftBar.removeClass('fixed');
            	      $prices.removeClass('fixed');
                  }

                var goToCheckout = !(data.header.error);
                var message = data.header.message;
                var errorCode = data.header.code;
                var passengers = [];
                var adultNumber = parseInt(self.element.find('.passengers_count_field .passengers_input .counter_adults').val());
                var kidsNumber = parseInt(self.element.find('.passengers_count_field .passengers_input .counter_kids').val());
                var babiesNumber = parseInt(self.element.find('.passengers_count_field .passengers_input .counter_babies').val());
                var now = moment();
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
                  //console.log('---');
                  //console.log('self.resultsData:', self.resultsData);
                  //console.log('self.resultsParams:', self.resultsParams);

                  /* Compose post Object */
                  postObject = {
                    sessionId: self.resultsData.sessionId,
                    idPet: self.resultsData.availabilityId,
                    journeys: self.getSelectedJourneys(owId, rtId, cabin),
                    cabinClass: cabin,
                    prices: self.getSelectedPrice(owId, rtId, cabin),
                    passengers: passengers,
                    largeFamily: data.body.data.largeFamily,
                    sateDiscount: data.body.data.sateDiscount,
                    typeDocumentation: data.body.data.documentations,
                    largeFamilyDiscounts: data.body.data.largeFamilyDiscounts,
                    resident: self.element.find('.mini_search .options .resident input').is(':checked'),
                    journeyConstraint: self.resultsData.journeyConstraint,
                    journeyConstraintBlock: data.body.data.journeyConstraint,
                    swidto: self.resultsData.swidto,
                    searchHash: window.location.hash,
                    resultsParams: self.resultsParams,
                    warningBookingLimit: calculatedWarningBookingLimit,
                    resultView: self.resultsParams.view
                  };

                  Bus.publish('ajax', 'postJson', {
                    path: getPostURL('USA_results'),
                    data: {checkout: postObject},
                    success: function() {
                      /* Navigate to Checkout URL */
                      var checkoutProcessURL = getProcessUrl('checkout');
                      Bus.publish('process', 'USA_clean_results_data');
                      Bus.publish('hash', 'change', {hash: checkoutProcessURL });
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

                }
                else {
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
                    ]
                  });

                  /* check GTM errors in block */
                  if (errorCode == 301){
                    /* Update Google Tag Manager */
                    updateGtm({
                      'pageArea': 'Comprar vuelos',
                      'pageCategory': 'Buscador vuelos',
                      'pageContent': 'Error_' + errorCode + '. Las plazas que intenta bloquear el usuario no están disponibles en Amadeus'
                    });
                  }else if (errorCode == 303){
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

      });
    },

    createNewPage: function(callback) {
      var self = this;
      var callback = (callback) ? callback : function() {};

      /* Create the new page */
//      var $newPage = $('<div class="process_page checkout"><div class="process_page_loading"><span class="spinner"></span></div></div>');
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

    getBusinessIds: function($group, $otherGroup) {

      // console.log("------")
      // console.log("El grupo es: ");
      // console.log($group);
      // console.log($otherGroup);
      // console.log("------")

      var foundBusId = undefined;
      var foundOtherBusId = undefined;
      var $owGroup, $rtGroup;
      var foundPossibleIds = [];

      /* Order groups */
      if ($group.closest('.journeys_group').hasClass('ow')) {
        // console.log("EL GROUP ES DE IDA");
        $owGroup = $group;
        $rtGroup = $otherGroup;
      }
      else {
        // console.log("EL GROUP PRINCPAL ES DE VUELTA");
        $owGroup = $otherGroup;
        $rtGroup = $group;

        // console.log($owGroup);
      }

      /* Ow + Rt */
      $owGroup.each(function() {
        var $this = $(this);
        var busId = $this.attr('data-id');
        var busOriginalId = $this.attr('data-original-id');
        var busCompatibleJourneys = $this.attr('data-compatible-journeys').split(',');

        $rtGroup.each(function() {
          var $this = $(this);
          var otherBusId = $this.attr('data-id');
          var otherBusOriginalId = $this.attr('data-original-id');

          if ($.inArray(otherBusId, busCompatibleJourneys) >= 0) {
            // console.log("ENCONTRRAMOS EN EL ARRAY EL: " + busOriginalId + " - " +otherBusOriginalId);
            foundPossibleIds.push({
              busId: busOriginalId,
              otherBusId: otherBusOriginalId
            });
          }
        });
      });

      /* If there's more than one combination of ids, choose the right one */
      if (foundPossibleIds.length > 1) {
        // console.log("TENEMOS QUE ELEGIR UNA ÚNICA COMBINACION");

        Bus.publish('process', 'USA_get_best_business_id', {
          flights: foundPossibleIds,
          callback: function(businessIds) {
            // console.log("EL MEJOR ES");
            // console.log(businessIds)

            foundPossibleIds = businessIds;
          }
        });

        return foundPossibleIds;
      }
      else if (foundPossibleIds.length == 1) {
        // console.log("LOS IDS A BUSCAR EN BUSINESS");
        // console.log(foundPossibleIds[0].busId + " - " + foundPossibleIds[0].otherBusId);

        return foundPossibleIds[0];
      }
      else {
        return undefined;
      }
    },

    selectByDefault: function() {

      /* Get the result list */
      var $result = this.element.find('.results_list .result');

      if (this.element.find('.process_wrapper_content').hasClass('by_price')) {
        /* Select default flights for every result */
        $result.each(function() {
          var $thisResult = $(this);

          // console.log("---------------------------------------------")

          /* Get first ow journey */
          var $firstOwJourney
          if ($thisResult.closest('.economy_and_business').length > 0) {
            $firstOwJourney = $thisResult.find('.journeys_group.ow .journey').not('.BUS').eq(0);
          }
          else {
            $firstOwJourney = $thisResult.find('.journeys_group.ow .journey').eq(0);
          }

          /* Get info about this flight */
          var flight = $firstOwJourney.attr('data-flight');
          var compatibleJourneys = [];
          var flightsFound = [];

          $thisResult.find('.journey[data-flight=' + flight + ']').each(function() {
            var $this = $(this);
            var thisJourneys = $this.attr('data-compatible-journeys').split(',');

            // console.log("COMPATIBLE: " + thisJourneys)

            $.each(thisJourneys, function(index, id) {
              var $thisFlight = $thisResult.find('.journeys_group.rt .journey[data-id=' + id + ']');
              var flight = $thisFlight.attr('data-flight');
              var isBusiness = ($thisFlight.closest('.economy_and_business').length > 0) ? $thisFlight.hasClass('BUS') : false;

              // console.log("El flight encontrado es: " + flight);
              // console.log("El id que estamos buscando es: " + id);

              if ($.inArray(flight, flightsFound) < 0 && !isBusiness) {
                //console.log("En el compatible journeys guardamos: " + parseInt(id));
                // console.log("En el compatible journeys guardamos: " + id);
                //compatibleJourneys.push(parseInt(id));
                compatibleJourneys.push(id);
                flightsFound.push(flight);
              }
            });
          });

          // console.log("Journeys compatibles: ")
          // console.log(compatibleJourneys)
          // console.log("--")

          /* Get last compatible rt journey */
          var $compatibleJourneys
          if ($thisResult.closest('.economy_and_business').length > 0) {
            $compatibleJourneys = $thisResult.find('.journeys_group.rt .journey').not('.BUS').filter(function() {
              var $this = $(this);
              var flightId = $this.attr('data-id');
              //var flightId = parseInt($this.attr('data-id'));
              return ($.inArray(flightId, compatibleJourneys) >= 0);
            });
          }
          else {
            $compatibleJourneys = $thisResult.find('.journeys_group.rt .journey').filter(function() {
              var $this = $(this);
              var flightId = $this.attr('data-id');
              //var flightId = parseInt($this.attr('data-id'));
              return ($.inArray(flightId, compatibleJourneys) >= 0);
            });
          }


          // console.log($compatibleJourneys);

          var $lastRtJourney = $compatibleJourneys.last();

          // console.log("ULTIMO VUELO COMPATIBLE: ");
          // console.log($lastRtJourney)
          // console.log("---------------------------------------------")

          /* Select first ow journey */
          $firstOwJourney.trigger('click');

          /* If there's an rt compatible journey, select it too */
          if ($lastRtJourney.length > 0) {
            $lastRtJourney.trigger('click');
          }
        });
      }
      else {
        Bus.publish('process', 'USA_get_cheapest_price', {callback: function(isBusiness, cheapesPricesFlightsList) {
//          var cabinClass = (isBusiness ? 'BUS_' : 'TUR_');

        	if ($result.find('.journeys').hasClass('matriz')) {

        	  $.each(cheapesPricesFlightsList, function(cheapesPricesFlightsIndex, cheapesPricesFlights) {
        		  var cabinClass = cheapesPricesFlights.cabinClass+ '_';

	        	  if(typeof cheapesPricesFlights.rt !== 'undefined' && cheapesPricesFlights.rt.length != 0){

	        		  if(isBusiness){
	        			  var $firstPrice = $result.find('.prices_matrix .price.cell[data-owIdBus='+ cheapesPricesFlights.ow +'][data-rtIdBus=' + cheapesPricesFlights.rt +']');

			        	  /* Select first price journey */
			              $firstPrice.trigger('click');

	        		  }else{
			        	  var $firstPrice = $result.find('.prices_matrix .price.cell[data-owIdTur='+ cheapesPricesFlights.ow +'][data-rtIdTur=' + cheapesPricesFlights.rt +']');

			        	  /* Select first price journey */
			              $firstPrice.trigger('click');
	        		  }
	        	  }else{
	        		  var $firstOwJourney = $result.find('.journeys_group.ow .journey[data-id=' + cabinClass + cheapesPricesFlights.ow + ']');
	        		  /* Select first ow journey */
	    	          $firstOwJourney.trigger('click');
	        	  }
        	  });

          }else{

            $.each(cheapesPricesFlightsList, function(cheapesPricesFlightsIndex, cheapesPricesFlights) {
            	var cabinClass = cheapesPricesFlights.cabinClass+'_';

	            var $firstOwJourney = $result.find('.journeys_group.ow .journey[data-id=' + cabinClass + cheapesPricesFlights.ow + ']');
	            var $lastRtJourney = $result.find('.journeys_group.rt .journey[data-id=' + cabinClass + cheapesPricesFlights.rt + ']');

	            /* Select first ow journey */
	            $firstOwJourney.trigger('click');

	            /* If there's an rt compatible journey, select it too */
	            if ($lastRtJourney.length > 0) {
	              $lastRtJourney.trigger('click');
	            }
            });
          }

        }});
      }

    },

    /* Show all cheapest prices */
    showAllCheapestPrice: function() {

    	/* Get the result list */
       var $result = this.element.find('.results_list .result');
        if ($result.find('.journeys').hasClass('matriz')) {
    	  Bus.publish('process', 'USA_get_all_cheapest_price', {callback: function(isBusiness, cheapestPricesFlightsListIds) {
    		var cabinClass = (isBusiness ? 'BUS_' : 'TUR_');
    		 /* Loop over ow journeys */
            $.each(cheapestPricesFlightsListIds, function(cheapesPricesFlightsIndex, cheapesPricesFlights) {

          	    if(typeof cheapesPricesFlights.rt !== 'undefined' && cheapesPricesFlights.rt.length != 0){

          		    if(isBusiness){
          			  var $firstPrice = $result.find('.prices_matrix .price.cell[data-owIdBus='+ cheapesPricesFlights.ow +'][data-rtIdBus=' + cheapesPricesFlights.rt +'] .price_wrapper');

  		        	  /* Select first price journey */
  		              $firstPrice.addClass('best-price');

          		    }else{
  		        	  var $firstPrice = $result.find('.prices_matrix .price.cell[data-owIdTur='+ cheapesPricesFlights.ow +'][data-rtIdTur=' + cheapesPricesFlights.rt +'] .price_wrapper');

  		        	  /* Select first price journey */
  		        	  $firstPrice.addClass('best-price');
          		    }
          	     }else{
          		   var $firstOwJourney = $result.find('.journeys_group.ow .journey[data-id=' + cabinClass + cheapesPricesFlights.ow + '] .price_wrapper');
          		   /* Select first ow journey */
      	           $firstOwJourney.addClass('best-price');
          	     }
            });
    	  }});
        }
	},


    getByHourPrices: function(economyPrice, businessPrice, busNotCompatible,economyIds, businessIds) {
      var self = this;

      // console.log("Si economyPrice: ")
      // console.log(economyPrice);
      // console.log(economyIds.owId);

      if (economyPrice) {
        Bus.publish('process', 'USA_get_prices', {
          flights: economyPrice,
          callback: function(economyPricesBlock) {
            // console.log("Economy PRICES");
            // console.log(economyPricesBlock.economy)

            if (economyPricesBlock.economy) {
              self.updatePrices('economy', economyPricesBlock.economy.totalAmount, economyPricesBlock.economy.costs, economyIds);
              self.element.find('.process_wrapper_content .prices_block .price_block.economy').removeClass('price_unavailable');
              self.element.find('.process_wrapper_content .prices_block .price_block.economy').show();
            }
          }
        });
      }else if(busNotCompatible){
    	  Bus.publish('process', 'USA_get_prices', {
              flights: businessPrice,
              callback: function(businessPricesBlock) {
                // console.log("Business PRICES");
                // console.log(businessPricesBlock.business)

                if (businessPricesBlock.business) {
                  self.updatePrices('business', businessPricesBlock.business.totalAmount, businessPricesBlock.business.costs, businessIds);
                  self.element.find('.process_wrapper_content .prices_block .price_block.business').removeClass('price_unavailable');
                }
              }
            });

      }
      else {
        self.element.find('.process_wrapper_content .prices_block .price_block.economy').hide();
      }

      // console.log("Si BUSINESPRICE: ")
      // console.log(businessPrice);
      // console.log(businessIds.owId);

      if (businessIds.owId) {
        Bus.publish('process', 'USA_get_prices', {
          flights: businessPrice,
          callback: function(businessPricesBlock) {
            // console.log("Business PRICES");
            // console.log(businessPricesBlock.business)

            if (businessPricesBlock.business) {
              self.updatePrices('business', businessPricesBlock.business.totalAmount, businessPricesBlock.business.costs, businessIds);
              self.element.find('.process_wrapper_content .prices_block .price_block.business').removeClass('price_unavailable');
            }
          }
        });
      }
      else {
        self.element.find('.process_wrapper_content .prices_block .price_block.business').addClass('price_unavailable');
      }
    },

    updatePrices: function(type, totalAmount, costs, ids) {

      // console.log(type + " : " + totalAmount)

      var $pricesBlock = this.element.find('.process_wrapper_content .prices_block .price_block.' + type);
      var costsBuffer = '';

      /* Update main prices  */
      $pricesBlock.find('.price span').html(formatCurrency(totalAmount));
      $pricesBlock.find('.price_tooltip .total strong').html(formatCurrency(totalAmount));

      /* Update ids */
      $pricesBlock.attr('data-owid', ids.owId);
      $pricesBlock.attr('data-rtid', ids.rtId);

      /* Update tooltip */
      $pricesBlock.find('.price_tooltip .cost_tooltip ul').empty();

      if (costs) {
        $.each(costs, function(index, cost) {
          costsBuffer += '<li><span>' + cost.description + '</span> <strong>' + formatCurrency(cost.amount) + '</strong></li>';
        });

        $pricesBlock.find('.price_tooltip .cost_tooltip ul').append(costsBuffer);
      }
    },

    cleanPrices: function($result) {
      var $pricesBlock = this.element.find('.process_wrapper_content.by_hour .prices_block');

      /* Update main prices  */
      $pricesBlock.find('.economy .price span').text('-');
      $pricesBlock.find('.business .price span').text('-');

      /* Remove ready status to the price */
      $pricesBlock.find('.economy').removeClass('ready');
      $pricesBlock.find('.business').removeClass('ready');

      /* Update tooltips */
      $pricesBlock.find('.economy .price_tooltip .cost_tooltip ul').empty();
      $pricesBlock.find('.business .price_tooltip .cost_tooltip ul').empty();
    },

    /* Data set and filters */

    setResultsData: function(oNotify) {
      this.resultsData = oNotify.resultsData;
      this.resultsParams = oNotify.resultsParams;
    },

    getSelectedJourneys: function(owId, rtId, cabin) {
      var selectedJourneys = {
        ow: undefined,
        rt: undefined
      };

      var cabinType = window.convertCabinType(cabin);

      /* By hour */
      if (this.element.find('.process_wrapper_content').hasClass('by_hour') || this.element.find('.process_wrapper_content').hasClass('by_matriz')) {

        /* Loop over ow journeys */
        $.each(this.resultsData.journeys.ow, function(journeyIndex, journey) {
          if (journey.identity == owId && journey.cabinClass == cabinType) {
            selectedJourneys.ow = journey;
          }
        });

        /* Loop over rt journeys */
        if (this.resultsData.journeys.rt && this.resultsData.journeys.rt.length > 0) {
          $.each(this.resultsData.journeys.rt, function(journeyIndex, journey) {
            if (journey.identity == rtId && journey.cabinClass == cabinType) {
              selectedJourneys.rt = journey;
            }
          });
        }
      }
      /* By price */
      else {
        /* Loop over prices */
        $.each(this.resultsData.prices, function(priceIndex, price) {

          /* Loop over ow journeys */
          $.each(price.journeys.ow, function(journeyIndex, journey) {
            if (journey.identity == owId && journey.cabinClass == cabinType) {
              selectedJourneys.ow = journey;
            }
          });

          /* Loop over rt journeys */
          if (price.journeys.rt && price.journeys.rt.length > 0) {
            $.each(price.journeys.rt, function(journeyIndex, journey) {
              if (journey.identity == rtId && journey.cabinClass == cabinType) {
                selectedJourneys.rt = journey;
              }
            });
          }

        });
      }

      return selectedJourneys;
    },


    getSelectedPrice: function(owId, rtId, cabinClass) {
      var selectedPrice = undefined;
      var selectedIndex;

      var cabinType = window.convertCabinType(cabinClass);

      /* By hour */
      if (this.element.find('.process_wrapper_content').hasClass('by_hour') || this.element.find('.process_wrapper_content').hasClass('by_matriz')) {
        if (rtId) {
          selectedIndex = cabinType + '_' + owId+'-' + cabinType + '_' +rtId;
        }
        else {
          selectedIndex = cabinType + '_' + owId;
        }
        selectedPrice = this.resultsData.prices[selectedIndex][cabinClass];
      }
      /* By price */
      else {
        /* Loop over prices */
        $.each(this.resultsData.prices, function(priceIndex, price) {

          /* Loop over ow journeys */
          $.each(price.journeys.ow, function(journeyIndex, journey) {
            if (journey.identity == owId) {
              selectedPrice = price[cabinClass];
            }
          });

        });
      }

      return selectedPrice;
    },

    /* Init graphics */

    initGroupedGraphics: function() {
      this.element.find('.journeys_group').each(function() {
        var $this = $(this);
        var $journeys = $this.find('.journey');
        var maxDuration = 0;
        var minDuration = 99999;

        /* Loop journeys to know the max and min values */
        $journeys.each(function() {
          var $this = $(this);
          var duration = parseInt($this.data('duration') || 0);

          if (duration > maxDuration) maxDuration = duration;
          if (duration < minDuration) minDuration = duration;
        });

        /* Loop over journeys to set the width depending on max and min durations */
        $journeys.each(function() {
          var $this = $(this);
          var currentDuration = parseInt($this.data('duration') || 0);
          var positionBetweenLimits = (currentDuration - minDuration) * 100 / (maxDuration - minDuration) * 0.01;
          var journeyWidth = ((AirEuropaConfig.graphic.comparedJourneys.maxWidth - AirEuropaConfig.graphic.comparedJourneys.minWidth) * positionBetweenLimits) + AirEuropaConfig.graphic.comparedJourneys.minWidth;

          /* Set the width to this graphic */
          $this.find('.graphic').css('width', journeyWidth + '%');

          /* Prepare graphic */
          $this.find('.graphic').graphic({
            minFlightWidth: AirEuropaConfig.graphic.minFlightWidth,
            maxTransferWidth: AirEuropaConfig.graphic.maxTransferWidth,
            minTransferWidth: AirEuropaConfig.graphic.minTransferWidth,
            highlights: AirEuropaConfig.graphic.highlights
          });
        });

      });

    },

    initPricesTooltips: function() {
      this.element.find('.result').tooltip({
        show: false,
        hide: false,
        tooltipClass: 'plain',
        items: this.element.find('.prices .price_block'),
        track: false,
        position: { my: "center-148 top-65", at: "left", collision: "flipfit" },
        content: function() {
          var $price = $(this);
          if($.find('.process_page.checkout').length == 0 && $.find('.dialog.visible:not(.no_bg)').length == 0){
        	if (!$price.hasClass('price_unavailable') && !$price.closest('.result').hasClass('no_compatible') && $price.find('.price_tooltip .cost_tooltip ul li').length > 0) {
              return $price.find('.price_tooltip').clone();
        	}
          }

          return '';
        }
      });
    },

    //set the width of shadow row cols in order to get aligned to matriz cols
    settingShadowRowColumnsWidth: function() {
      if ($('.col1').length || $('.col2').length || $('.col3').length) {
        var width;
        var $priceCell = $('.price.cell');
        width = $priceCell.outerWidth();
        var $rows = $('.shadow_row .cell');
        $rows.splice(0,1);
        $.each($rows,function() {
          var $this = $(this);
          $this.css('width', width);
        });
        //adding class last to the last col
        $rows.eq($rows.length-1).addClass('last');

        $(window).resize(function() {
          width = $priceCell.outerWidth();
          $.each($rows,function() {
            var $this = $(this);
            $this.css('width', width);
          });
        });
      }
    },
    //set min height for the matrix container //
    settingMinHeightMatrix: function() {

      var $jorneysGroupBody = $('.by_matriz .journeys_group .body');
      var $resultsByHour = $('.by_matriz');
      var $resultsTopbar = $('.results_topbar');
      var $resultsScroll = $('.by_matriz').closest('.results_scroll');
      var $leftBarMatrix = $('.left-bar-matrix');
      var $departure_flights = $('.departure_flights');
      var $top_wrapper = $('.top-wrapper');


      //setting min height to the body
      var height;
      var min_height_left_bar = (($('.departure_flights .cell').length + 1) * 65);

      if ($resultsScroll.length > 0 && $resultsByHour.length > 0 && $resultsTopbar.length > 0 ) {
        height = $resultsScroll.height() - $resultsByHour.position().top - $resultsTopbar.height() - 21;
      }

      $jorneysGroupBody.css('min-height', height);
      $leftBarMatrix.css('min-height', min_height_left_bar - 65);

      //setting height of left-top-bar
      if ($leftBarMatrix.hasClass('fixed')) {
        $leftBarMatrix.css('height', $jorneysGroupBody.height() - 170);
      }
      else {
        $leftBarMatrix.css('height', $jorneysGroupBody.height() - 90);
      }

      $(window).resize(function() {
        if ($resultsScroll.length > 0 && $resultsByHour.length > 0 && $resultsTopbar.length > 0 ) {
          height = $resultsScroll.height() - $resultsByHour.position().top - $resultsTopbar.height() - 21;
        }

        $jorneysGroupBody.css('min-height', height);

        //setting height of left-top-bar
        if ($leftBarMatrix.hasClass('fixed')) {
          $leftBarMatrix.css('height', $jorneysGroupBody.height() - 105);
        }
        else {
          $leftBarMatrix.css('height', $jorneysGroupBody.height() - 25);
        }
      });
    },

    /*inits functions for Matrix results view*/
    initMatrixFunctions: function() {
	    if(this.element.find('.return_flights').hasClass('header_row')){

	      /*jquery variables used in the functions*/
	      var return_header = $('.return_header');
	      var longitud_ret = return_header.length;
	      var matrix_scroll_left = $('.top-bar-matrix .earlier');
	      var matrix_scroll_right = $('.top-bar-matrix .later');
	      var departure_header = $('.departure_header');
	      var longitud_dep = departure_header.length;

	      /* behaviour setup of the matrix */
	      if( longitud_ret <=7) {
	        matrix_scroll_left.hide();
	        matrix_scroll_right.hide();
	      }
	      else {
	        matrix_scroll_left.hide();
	      }

	      $('.return_header .journey').unbind('click');
	      $('.departure_header .journey').unbind('click');
          $('.departure_header .cell').unbind('click');
          $('.cell.no_dispo').unbind('click');
	      /* scroll of the matrix when clicking arrows*/
	      matrix_scroll_left.on("click", function() {
	        var long_inv = $('.return_header.invisible').length;
	        $(return_header[long_inv-1]).removeClass('invisible');
	        $(return_header[long_inv-1]).addClass('visible');
	        long_inv = $('.return_header.invisible').length;
	        var rem_vis_index = (($('.return_header.visible').length) + long_inv - 1);
	        $(return_header[rem_vis_index]).removeClass('visible').removeClass('last');
	        $(return_header[rem_vis_index-1]).addClass('last');
	        for(var i = 0; i < longitud_dep; i++) {
	          $($('.prices_row')[i].children[long_inv]).removeClass('invisible');
	          $($('.prices_row')[i].children[long_inv]).addClass('visible');
	          $($('.prices_row')[i].children[rem_vis_index]).removeClass('visible').removeClass('last');
	          $($('.prices_row')[i].children[rem_vis_index-1]).addClass('last');
	        }
	        matrix_scroll_right.show();
	        if (long_inv == 0) {
	          matrix_scroll_left.hide();
	        }
	      });

	      matrix_scroll_right.on("click", function() {
	        var long_inv = $('.return_header.invisible').length;
	        $(return_header[long_inv]).addClass('invisible');
	        $(return_header[long_inv]).removeClass('visible');
	        var add_vis_index = ($('.return_header.invisible').length + $('.return_header.visible').length);
	        $(return_header[add_vis_index]).addClass('visible').addClass('last');
	        $(return_header[add_vis_index-1]).removeClass('last');


	        for(var i = 0; i < longitud_dep; i++) {
	          $($('.prices_row')[i].children[long_inv]).addClass('invisible');
	          $($('.prices_row')[i].children[long_inv]).removeClass('visible');
	          $($('.prices_row')[i].children[add_vis_index]).addClass('visible').addClass('last');
	          $($('.prices_row')[i].children[add_vis_index-1]).removeClass('last');
	        }

	        long_inv = $('.return_header.invisible').length;
	        matrix_scroll_left.show();

	        if ((longitud_ret - long_inv) == 7) {
	          matrix_scroll_right.hide();
	        }
	      });

	      /*making visible the column where is the initial selected*/
	      var column_selected = $('.price.cell.selected').index() + 1;

	      if (column_selected > 7) {

	        for( var i=7; i < column_selected; i++) {
	          matrix_scroll_right.trigger("click");
	        }
	      }
	      if( $('.results_scroll').length > 0 ) {
            /*animate the scroll down to the selected price row */
          if(window.location.toString().indexOf("view/matriz") != -1){
            var alturamejor = $('.prices_matrix .prices_row .cell .best-price').offset().top - $('.prices_matrix').offset().top - 95;
            $('.results_scroll').animate({
                        scrollTop: alturamejor
                      }, 1000);
          }else{
                      $('.results_scroll').animate({
                        scrollTop: $('.price.cell.selected').offset().top
                      }, 1000);
          }
        }

          //adding more padding to tabs
          $('.results_topbar .options').css("padding-left", "45px");
	    }
        //*asociating hover over plus-brackets to show graphic wrapper
        $plusBrackets = $('.plus-brackets');
        $plusBrackets.mouseover(function(e) {
          e.stopPropagation();
          $(this).parent().parent().find('.graphic_wrapper').addClass('showing');
        });
        $plusBrackets.mouseout(function(e) {
          e.stopPropagation();
          $(this).parent().parent().find('.graphic_wrapper').removeClass('showing');
        });
    },

    showInterbalearicRatesWarning: function() {
      var self = this,
          $form = this.element.find('.mini_search form'),
          $islands = ['PMI','IBZ','MAH'];

      $('#mini_search_form_to').on('blur',function(event){
        event.stopImmediatePropagation();
        var $origin = ($form.find('#mini_search_form_from')).val(),
            $destination = ($form.find('#mini_search_form_to')).val(),
            $interbalearic = $.inArray($origin,$islands) > -1 && $.inArray($destination,$islands) > -1;

        if($interbalearic){
          $(self.selector).ui_dialog({
            title: lang('general.info_error_title'),
            error: false,
            subtitle: lang('results.interbalearic_rates'),
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

    showResidentDiscountWarning: function() {
      var self = this;
      var $form = this.element.find('.mini_search form');
      var $residentCheckbox = $form.find('.options .checkbox.resident input');

      $residentCheckbox.on('click',function(event){
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
  };
});
