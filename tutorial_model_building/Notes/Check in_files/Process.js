Hydra.module.register('Process', function(Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#process',
    element: undefined,

    events: {
      'process': {
        'kill': function(oNotify) {
          this.killProcess();
        },
        'start': function(oNotify) {
          this.startProcess(oNotify.process, oNotify.screenName);
        },
        'reset': function(oNotify) {
          this.resetProcess();
        }
      }
    },

    init: function() {
      /* Save jquery object reference */
      this.element = $(this.selector);

      /* Start events */
      this.addEvents();
    },

    addEvents: function() {
      var self = this;

      /* Search event */
      $('body').on('click', 'a[rel=process]', function(event) {
        event.preventDefault();
        var $a = $(this);
        var hash = $a.attr('data-process');
        var searchProcessURL = getProcessUrl(hash);

        if ((!$('body').hasClass('processing')) || ($('body').hasClass('processing') && $('body').attr('data-processing') != hash)) {
          /* Change hash to start the process */
          Bus.publish('hash', 'change', {hash: searchProcessURL});
        }
        else {
          self.killProcess();
        }

      });

      /* Close process */
      this.element.on('click', '.close p a', function(event) {
        event.preventDefault();
        /*Close landing checkin*/
        if(document.body.className.indexOf('landing_checkin') != -1){
        	 window.location.href = urlCms('home');
        }else{
        	 /* Remove the routes lightbox if it's on the DOM */
        	if($('.routes_overlay').length) {
        		$('.routes_overlay').remove();
        	} else {
            /* Kill all processes if routes lightbox isn't on the DOM */
        		self.killProcess();
        	}
        }
      });

      /* Buttons behaviour */
      this.element.on('click', '.close_process p a', function(event) {
        event.preventDefault();
        if(document.body.className.indexOf('landing_checkin') != -1){
        	 window.location.href = urlCms('home');
        }else{
        	Bus.publish('process', 'kill');
        }
      });

      /* Trim spaces in checkin form */
      this.element.find('form.checkin_form #checkin_form_reserve_number').on('change', function() {
        var actual = $(this).val();
        var nuevoValor = $.trim(actual);

        $(this).val(nuevoValor);
      });

      this.element.find('form.checkin_form #checkin_form_surname').on('change',function(){
        var surname = $(this).val();
        var newSurname = $.trim(surname);

        $(this).val(newSurname);
      });

      /* Trim spaces in ancillaries form */
      this.element.find('form.ancillaries_form #ancillaries_form_reserve_number').on('change', function() {
        var actual = $(this).val();
        var nuevoValor = $.trim(actual);

        $(this).val(nuevoValor);
      });

      this.element.find('form.ancillaries_form #ancillaries_form_surname').on('change',function(){
        var surname = $(this).val();
        var newSurname = $.trim(surname);

        $(this).val(newSurname);
      });

      /* Trim spaces in pmr form */
      this.element.find('form.pmr_form #pmr_form_reserve_number').on('change', function() {
        var actual = $(this).val();
        var nuevoValor = $.trim(actual);

        $(this).val(nuevoValor);
      });

      this.element.find('form.pmr_form #pmr_form_surname').on('change',function(){
        var surname = $(this).val();
        var newSurname = $.trim(surname);

        $(this).val(newSurname);
      });
    },

    /* Processes */

    killProcess: function() {
      if(document.body.className.indexOf('landing_checkin') == -1){
		  var self = this;
		  var process = $('body').attr('data-processing');
		  var screenName = $('body').attr('data-processing-screen');

      /* Close subnav */
      var $header = self.element.closest('#wrapper').find('#header');
      $header.find('#subnav').removeClass('active').attr('style', '');
      $header.find('.panel.active').removeClass('active').attr('style', '');
      $header.find('#topbar .nav .main_nav li.active').removeClass('active');

		  if (screenName == 'form') {

		    /* Reset finished status */
		    self.element.find('#search').removeClass('finished');

		    /* Remove process status */
		    $('body').removeClass('processing showing_routes').attr('data-processing', '').attr('data-processing-screen', '');

		    setTimeout(function() { /* Needed to fix a Firefox bug */
		      self.element.find('#search').removeClass('visible');
		    }, 25)

		    setTimeout(function() { /* Needed because the transition callback doesn't fire properly on webkit */
		      self.element.removeClass('full');
		      self.resetAllProcessElements();
		    }, 425);

		  }
		  else {
		    self.element.removeClass('full');
		    self.element.find('#search').removeClass('visible');
		    $('body').removeClass('processing showing_routes').attr('data-processing', '').attr('data-processing-screen', '');
		    self.resetAllProcessElements();
		  }

		  /* Trigger a GTM update to track the page view */
		  var gtmPageData = window.getGTMPageData(restofurl);
		  updateGtm({
		    'mercado': window.market,
		    'pageArea': gtmPageData.pageArea,
		    'pageCategory': gtmPageData.pageCategory,
		    'pageContent': gtmPageData.pageContent
		  });

		  /* Remove intervalId of booking warning message */
		  if (window.warningBookingIntervalId) {
		    clearTimeout(window.warningBookingIntervalId);
		  }
      }
    },

    resetAllProcessElements: function() {
      var self = this;

      /* Hide datepicker */
      self.element.find('.input input').datepicker('hide');

      self.element.find('.search_form').removeClass('active process_launched');
      self.element.find('.search_form[data-process-name=ancillaries]').find('.search_form_title').hide();
      self.element.find('.search_form[data-process-name=ancillaries]').attr('data-process-start', '');
      self.element.find('.process_page_wrapper').css('top', '0');
      self.element.find('.process_page_wrapper .process_page').not(':first-child').remove();

      /* Clean search forms to restart completely the process */
      self.element.find('.airport input, .flight_field input, .reserve_field input, .extra_locator input, .calendar input').val('');
      self.element.find('.reserve_field').removeClass('locator ticket_number').find('.selected_value').text('');
      self.element.find('.text_field input').val('');
      self.element.find('.flight_field .selected_value').text('');
      self.element.find('.passengers_count_field input').val('');
      self.element.find('.passengers_count_field input.counter_adults').val('1');
      self.element.find('.passengers_count_field .counter_detail .number').text('0');
      self.element.find('.passengers_total span').text('1');
      self.element.find('.passengers_count_field .counter_detail.passengers_adult .number').text('1');
      self.element.find('.passengers_list .kid, .passengers_list .baby').hide();
      self.element.find('.passengers_list .kid span, .passengers_list .baby span').text('0').hide();
      self.element.find('.passengers_list .adult span').text('1').hide();
      self.element.find('.calendar .placeholder').text('');
      self.element.find('.checkin_form').removeClass('second_step ticket_number locator');
      self.element.find('form').removeClass('ready focused');
      self.element.find('.airport, .calendar, .field, .flight_field').removeClass('valid error national resident filled');
      self.element.find('form.info_form').find('.flight_field').addClass('off disabled');
      self.element.find('form.info_form').find('.airport').removeClass('off disabled');
      self.element.find('.search_flights .calendar.rt').addClass('off');
      self.element.find('.checkbox').removeClass('checked').find('input').attr('checked', false);
      self.element.find('.checkbox.resident').hide();
      self.element.find('.search_flights > .error_message, .ancillaries_form > .error_message, .checkin_form > .error_message').remove();
      self.element.find('.ancillaries_form fieldset').show();
      self.element.find('p.ancillaries_description').show();
      self.element.find('h3.ancillaries_error_type').remove();
      self.element.find('p.ancillaries_error_description').hide();

      /*hidden form phisical card*/
      self.element.find('#phisical_card_address').addClass('hidden');


      /* clean external login class flags */
      self.element.find('.search_form[data-process-name=login]').removeClass('ly_ancillaries');
      self.element.find('.search_form[data-process-name=login]').removeClass('ly_checkin');
      self.element.find('.login_form .field, .restore_form .field, .register_form .field').not('.small_checkbox').addClass('initial_status error');

      /* Trigger validates */
      self.element.find('.search_form_wrapper > form .field').trigger('validate');
      self.element.find('.calendar').trigger('validate');
      self.element.find('.airport').trigger('validate');
      self.element.find('.flight_field').trigger('validate');

      /* Keep the body scroll at the same point after cleaning the location.hash */
      var scr = document.body.scrollTop;
      window.location.hash = '';
      document.body.scrollTop = scr;

      /* Deactivate links */
      $('a[rel=process]').closest('p, li').removeClass('active');

      /* Reset paypal loading */
      $('body').removeClass('hide_process');
      $('.loading_process').remove();

      /* Restart main slider interval */
      $('.ui_main_slider').trigger('start');
    },

    startProcess: function(process, screenName) {
      if ($('body').hasClass('processing') && $('body').attr('data-processing') != process) { /* Reset the process, kill the active and show other */
        // console.log("RESETEA EL PROCESO, ALGUNA VEZ?");
        this.resetProcess();
      }

      /* Make sure the dark site is hidden */
      $('#ds').removeClass('visible');

      /* Kill the main slider interval */
      $('.ui_main_slider').trigger('stop');

      /* Set the processing data */
      $('body').attr('data-processing', process).attr('data-processing-screen', screenName);

      /* Reset data-view */
      this.element.find('.process_page_wrapper').attr('data-view', '');

      this.element.find('div.search_form_title').hide();
      this.element.find('p.ancillaries_description').show();
      this.element.find('p.ancillaries_error_description').hide();
      this.element.find('h3.ancillaries_error_type').remove();

      /* Enlarge process container */
      // console.log("Añadimos la clase full al #process");
      this.element.addClass('full');

      /* Lock body scroll */
      if (screenName != 'form') {
        // console.log("Añadimos la clase processing al body")
        $('body').addClass('processing');
      }
      else {
        var tabindex = 1;

        this.element.find('input, select').each(function() {
          if (this.type != "hidden") {
            var $input = $(this);
            if (!$input.parent().parent().hasClass('takeleft')) {
              $input.attr('tabindex', tabindex);
              tabindex++;
            }
          }
        });
      }

      /* GTM updates */
      // To catch .active this function has to be last in stack
      window.setTimeout(function() {
        var stage = $('div.search_form.active');
        var process_name = stage.attr('data-process-name');

        switch(process_name) {
            case 'suma':
              updateGtm({
                'pageArea': 'SUMA-Micuenta',
                'pageCategory': 'home'
              });
              break;
            case 'login':
              updateGtm({
                'pageArea': 'SUMA-Micuenta',
                'pageCategory': 'acceder',
                'pageContent': 'formulario'
              });
              break;
            case 'register':
              updateGtm({
                'pageArea': 'SUMA-Micuenta',
                'pageCategory': 'registrarse',
                'pageContent': 'formulario'
              });
              break;
        };
      }, 0);
    },

    resetProcess: function() {
      var process = $('body').attr('data-processing');

      /* Deactivate current process */
      this.element.find('.search_form').removeClass('active');

      /* Clean process pages status */
      this.element.find('.process_page_wrapper').css('top', '0');
      this.element.find('.process_page_wrapper .process_page').not(':first-child').remove();

      /* Deactivate links */
      $('a[rel=process]').closest('p, li').removeClass('active');
    }

  };
});
