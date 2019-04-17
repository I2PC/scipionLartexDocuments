Hydra.module.register('Checkin', function(Bus, Module, ErrorHandler, Api) {

  return {
    selector: '#checkin',
    element: undefined,

    /* Checkin cache */
    checkinCache: {},
    aircraftMap: {},
    tempObject: [],

    events: {
      'checkin': {
        'custom_init': function() {
          this.customInit();
          Bus.publish('prerender', 'restart');
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

      var destinyAddressObject = [];
      this.destinyAddressObject = destinyAddressObject;

      if (this.element.length > 0) {
        /* Get checkin data */
        Bus.publish('process', 'get_checkin_data', {callback: function(checkinCache) {
          self.checkinCache = checkinCache;
        }});

        /* Control content height */
        this.setContentHeight();
        this.controlResize();

        /* Checkin status */
        this.checkinStatus();

        /* Form helpers */
        this.setTabindex();
        this.preparePassengersForm();

        /* Init steps widgets */
        this.initSteps();

        /* Forms */
        this.stepsProcess();
        this.initForm();
        this.initFieldDocumentExpiration();
        this.initFieldBirthdate();
        this.documentExpirationActions();
        this.birthdateActions();
        this.frequentFlyerCheck();

        /* Seats map */
        this.composeSeatMap();

        /* Cards slider */
        this.startCardsSlider();

        /* Cards button actions */
        this.startCardsActions();

        /* Manual booking add */
        this.startBookingAddAction();

        /* Register layout */
        this.startRegisterAction();

        var step = self.element.find('.process_step').attr('data-step');

        if (step === 'cards'){
          /* Listen Twitter Button */
          this.listenTwitterButton();
          this.listenFollowUsTwitterButtom();
          this.listenNotificationsTwitterButtom();

          this.showNotificationsTwitterCheckin();
        }
      }

      /* Close proccess recursive in all the navigation */
      this.element.find('.close_process').find('a').on('click', function(){
        /* Send void checkin session to clean the server session */
        self.removeServerSession();

        /* Back to HOME */
        // Bus.publish('hash', 'change', { hash: '' });
        window.location.href = '#';
      });
    },

    /* Content height */

    setContentHeight: function() {
      var $process_scroll = this.element.find('.process_scroll');
      var $process_top_bar = this.element.find('.process_top_bar');
      var $process_bottom_bar = this.element.find('.process_bottom_bar');
      var $process_content = this.element.find('.process_content');

      var availableHeight = $('body').height() - $process_bottom_bar.outerHeight();

      /* Set the height */
      $process_scroll.css('height', availableHeight);
      $process_top_bar.css('width', $process_content.outerWidth());
    },

    controlResize: function() {
      var self = this;

      $(window).on('resize.ev_checkout', function() {
        self.setContentHeight();
      });

      /* Adjust height because CSS callbacks don't work in IE8 */
      setTimeout(function(){
        self.setContentHeight();
      }, 350);
    },

    /* Checkin status */
    checkinStatus: function() {
      this.element.find('.checkin_status ol li a').off('click');
      this.element.find('.checkin_status ol li a').on('click', function(event) {
        var $this = $(this);
        var $li = $this.closest('li');

        if (!($li.hasClass('done') || $li.hasClass('completed'))) {
          event.preventDefault();
        }
      });
    },

    /* Checkin steps process */
    stepsProcess: function() {
      var self = this;

      this.element.find('.checkin_call a').off('click');
      this.element.find('.checkin_call a').on('click', function(event) {
        event.preventDefault();
        var $this = $(this);

        /* Setting flight Number */
        var flightNumber = self.checkinCache.flightNumber = $this.attr('data-flight-number');
        var locator = $this.attr('data-locator');

        /* Calling to dangerous goods warning check */
        self.checkDangerousGoods(flightNumber);

      });

      /* If locator is activated, get locator flighst data */
      this.element.find('.group_header').find('.radio[data-group=field_locator_group] input[type=radio]').on('change', function(){
        var $this = $(this);

        if ($this.is(':checked')) {
          self.getFlightByLocator($this.val(), $this);
        }
      });
    },

    getFlightByLocator: function(locator) {
      var self = this;
      var dataSent = {
        locator: locator
        // surname: window.cleanSpaces(localStorage.ly_firstSurname+localStorage.ly_secondSurname)
      };
      var $fieldGroup = self.element.find('.check_group.flights_locator_info[data-locator='+locator+']');

      if (!$fieldGroup.attr('data-flights-loaded')) {

        $fieldGroup.addClass('loading');

        $fieldGroup.append('<div class="loading_info"><span>'+ lang('checkin.loading_info') +'</span></div>');

        /* Get flight data service */
        Bus.publish('services', 'getFlightData', {
          data: dataSent,
          success: function(data) {

            $fieldGroup.find('.loading_info').remove();

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

              Bus.publish('process', 'call_parse_checkin_flights', {
                data: data,
                callback: function(response) {
                  /* Set selected locator on root object */
                  response.locator = locator;
                  Bus.publish('ajax', 'getTemplate', {
                    data: response,
                    path: eval('AirEuropaConfig.templates.checkin.bookings_flights'),
                    success: function(template) {
                      $fieldGroup.attr('data-flights-loaded', 'true');

                      /* Remove loading class */
                      $fieldGroup.find('.group_header').removeClass('loading');

                      $fieldGroup.find('.group_body').append(template);
                      /* Remove loading class */
                      $fieldGroup.find('.group_header').removeClass('loading');
                      /* Checkin flight action button */
                      $fieldGroup.find('.checkin_call a').on('click', function(event) {
                        event.preventDefault();
                        var $this = $(this);

                        /* Setting flight Number */
                        var flightNumber = self.checkinCache.flightNumber = $this.attr('data-flight-number');

                        self.checkinCache = response;

                        /* Start checkin */
                        self.startBookingCheckin(locator, flightNumber);
                      });
                    }
                  });
                }
              });

            } /* If there is any error */
            else {

              $fieldGroup.find('.loading_info').remove();

              /* Show an error */
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
                ]});
            }
          }
        });

      }

    },

    startBookingCheckin: function(locator, flightNumber) {
      var self = this;

      var dataSent = {
        locator: locator,
        surname: window.cleanSpaces(localStorage.ly_firstSurname+localStorage.ly_secondSurname)
      };

      /* Post checkinSession to server with the service data */
      var postToSession = getPostURL('checkin');

      /* Compose post object */
      self.checkinCache['locator'] = dataSent.locator;
      self.checkinCache['surname'] = dataSent.surname;
      self.checkinCache['flightNumber'] = flightNumber;

      /* Remove div.booking_block_add if it exists */
      if(self.element.find('.bookings_block_add').length > 0) {
    	self.element.find('.bookings_block_add').remove();
      }
      
      self.checkDangerousGoods(flightNumber);
    },

    checkDangerousGoods: function(flightNumber) {
      var self = this;
      var dangerousGoods = false;
      var breakEach = false;

      if (self.checkinCache.flights) {
        $.each(self.checkinCache.flights, function(flightIndex, flight){
          if (flightNumber==flight.flightNumber) {
            $.each(flight.passengers, function(passengerIndex, passenger){
              if (passenger.dangerousGoods) {
                dangerousGoods = true;
                breakEach = true;
                return false;
              }
            });
            if (breakEach) return false;
          }
        });
      }

      //If some passenger have dangerousGoods to true, show dangerous modal window
      if (dangerousGoods) {
        self.showDangerousGoods();
      }

      //If aren't dangerous good, continue to passengers list
      if (!dangerousGoods) {
        self.continueToPassengersList();
      }
    },


    /* Continue to passengers list if dangerous goods is accepted or is not exist in some passenger */

    continueToPassengersList: function() {
      var self = this;
      var $this = $(this);
      var url = getPostURL('checkin');
      var step = self.element.find('#checkin').attr('class');
      var now = moment();
      /* minutes * 60 (to convert to seconds) * 1000 (to convert to timestamp) + now */
      var calculatedWarningBookingLimit = AirEuropaConfig.warningBookingLimitCkin>0?((AirEuropaConfig.warningBookingLimitCkin*60)*1000)+now.valueOf():-1;

      /* Start widget animation */
      self.element.find('.process_scroll').steps('showLoading', function() {
        /* Set the status bar as completed */
        self.element.find('.checkin .steps .' + step).addClass('completed');

        /* Set warning timestamp only when user click on checkin button, before shows passengers list */
        self.checkinCache.warningBookingLimit = calculatedWarningBookingLimit;

        self.continueStep(url, 'passengers');
      });
    },

    /* Init steps */
    initSteps: function() {
      var checkinProcessURL = getProcessUrl('checkin');

      this.element.find('.process_scroll').steps();

      /* If mode isLogged, change first step of breadcrumb by javascript */
      if (this.element.find('.process_step').attr('data-mode')==='isLogged') {
        var $aLink = this.element.find('.breadcrumb').find('.flights a');
        var altLink = $aLink.attr('data-alt-link');
        $aLink.attr('href', '#/'+checkinProcessURL+ altLink);
      }
    },

    /* Forms */

      initForm: function() {
      var self = this;

      this.element.find('form').form({
        onError: function(form){
         self.showFormError(form.element);
        },
        onSubmit: function(form) {

          var nextStep = form.element.closest('.process_step').attr('data-next');
          var url = getPostURL('checkin');
           

          self.checkinCache.formData = form.element.serializeObject();

          // Validation for seat, we show message if user not select the seat manually
          if (nextStep=='cards') {

            var seatsMessagesList = '';
            var formErrors = 0;
            var callsDone = 0;
            var callsEnded = 0; 

             // Check every passengers data section
            $('.passengers_info').each(function(index, data) {

              var passengerId = $(this).find('a').attr('data-passenger');
                           
              if (self.element.find('#'+self.element.find('label[data-passenger='+passengerId+']').attr('for')).is(':checked')) {

                var seatNumberTemp = $(this).find('input.seat_number_temp').val();
                var seatColumnTemp = $(this).find('input.seat_column_temp').val();
                var seatNumberSelected = $(this).find('input.seat_number_selected').val();
                var seatColumnSelected = $(this).find('input.seat_column_selected').val();

                if (seatNumberSelected=='' || seatColumnSelected=='') {
                  seatsMessagesList += '<li>'+self.element.find('label[data-passenger='+passengerId+']').html()+'</li>';
                }
              }


              var frequentFlyerDataIsOpen = $(this).find('fieldset.opened');

              // Checking if frequent flyer section is open.
              if (frequentFlyerDataIsOpen.length > 0){

                  var $passenger = $(this);

                  var surnameField = $passenger.find('.surname');
                  var frequentFlyerIdentityDiv = $passenger.find('.frequent_flyer_number');
                  var frequentFlyerProgram = $passenger.find('.frequent_flyer_program option:selected').attr('value');
                  var frequentFlyerIdentity = $passenger.find('.frequent_flyer_number input').val();
                  var flyerData;
                  var surname;
                  
                    
                  if(surnameField.length > 0) {
                    surname = surnameField.val();
                  } else {
                    surname = frequentFlyerIdentityDiv.attr('data-passenger-surname');
                  }

                  if (surname != '' && frequentFlyerProgram != '' && frequentFlyerIdentity != '') {

                    flyerData = {
                      surname: surname,
                      frequentFlyerProgram: frequentFlyerProgram,
                      frequentFlyerIdentity: frequentFlyerIdentity
                    };

                    callsDone ++;

                    // Call AJAX module to get the json 
                    Bus.publish('services', 'getFrequentFlyerCheckCheckin', {

                      data: flyerData,

                      success: function (data) {
                          
                        var message = data.header.message;
                        callsEnded++;
              
                        if (data.header.error == true) {
                              
                          // Update error hints 
                          $passenger.find('.frequent_flyer_program').trigger('show_error', [message]);
                          $passenger.find('.frequent_flyer_number').trigger('show_error', [message]);
                              
                          $passenger.find('.frequent_flyer_program').attr('data-format-error', message);
                          $passenger.find('.frequent_flyer_number').attr('data-format-error', message);

                          // Set classes to show the error 
                          $passenger.find('.frequent_flyer_program').addClass('error').removeClass('valid initial_status');
                          $passenger.find('.frequent_flyer_number').addClass('error').removeClass('valid initial_status');

                          //$passenger.find('.frequent_flyer_number').trigger('validate');
                          formErrors++;

                          /*Pop up error*/
                          $('body').ui_dialog({
                            title: data.header.message,
                            error: false,
                            subtitle: lang('checkin_frecuenty_flayer_error_number'),
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
                       
                        }else{

                          $passenger.find('.frequent_flyer_program').removeClass('error initial_status').addClass('valid');
                          $passenger.find('.frequent_flyer_number').removeClass('error initial_status').addClass('valid');
                              
                          $passenger.find('.frequent_flyer_number').trigger('validate');

                        }

                        // If all calls done are finished, we check if there are errors in form
                        // to show no seat selected message or continue to the next step.
                        if ((callsDone == callsEnded)){

                            if (formErrors > 0){

                              var $form = $passenger.closest('form');
                              self.showFormError($form);

                            }else{

                                var $form = self.element.find('.process_step.passengers').find('form');

                                //Form validated, we remove error message.
                                if ($form.find('.block_body .form_error').length > 0) {
                                  $form.find('.block_body .form_error').remove();
                                }

                                if (seatsMessagesList.length>0 && seatsMessagesList!=''){
                                  // Showing no seat selected message
                                  Bus.publish('ajax', 'getTemplate', {

                                    path: eval('AirEuropaConfig.templates.checkin.passengers_seats'),
                                                    
                                    success: function(template) {
                                      // Show message 
                                      $('#checkin').ui_dialog({
                                        title: lang('checkin.not_seat_assigned_title'),
                                        subtitle: lang('checkin.not_seat_assigned_subtitle'),
                                        content: template,
                                        close: {
                                          behaviour: 'close',
                                          href: '#'
                                        },
                                        buttons: [
                                        {
                                          className: 'close',
                                          href: '#',
                                          label: lang('checkin.not_seat_assigned_cancel')
                                        },
                                        {
                                          className: 'next',
                                          href: '#',
                                          label: lang('checkin.not_seat_assigned_continue')
                                        }],
                                                        
                                    render: function($dialog) {
                                      var $form = $dialog.find('form');
                                    
                                      $dialog.find('.dialog_list > ul').html(seatsMessagesList);
                                    
                                      // Buttons behaviour 
                                      $dialog.find('.next a').on('click', function(event) {
                                        event.preventDefault();
                                        $form.trigger('submit');
                                      });
                                    
                                      // Form behaviour 
                                      $form.form({
                                        
                                        onSubmit: function(form) {
                                    
                                          // Close dialog 
                                          $dialog.find('.close_dialog').find('a').click();
                                    
                                          // Continue to next step 
                                          self.continueStep(url, nextStep);
                                          // self.element.find('.submit_button').find('button').click();
                                    
                                        }
                                      });
                                    }
                                    });
                                    }
                                  });

                                }else{
                                  //Everything is ok, form validated, seats selected, go to next step.                        
                                  self.element.find('.process_step.passengers').removeClass('incomplete');
                                  self.continueStep(url, nextStep);
                                }
                            }                          

                        }

                      }  
                    });

                  }else{
                    // If field is empty, is an error
                    formErrors ++;
                    // If frequent flyer data is empty we call to service below to get proper message.
                    var $form = self.element.find('.process_step.passengers').find('form');

                    var mode = self.element.find('.process_steps').attr('data-mode');
                    self.checkinCache.mode = mode;
                    // Only to check field empty
                    Bus.publish('services', 'updateCheckinPassengers', {
                      checkinCache: self.checkinCache,
                      checkinId: self.checkinCache.checkinId,
                      success: function(data) {
                        var totalLenght = data.length;
                        var counterOk = 0;
                        var messageUpdate = undefined;
                        /* If response comes without data.header */
                        if (!data.header) {
                          $.each(data, function(indexData, dataData){
                            switch (dataData.status) {
                              case 'OK':
                                counterOk++;
                                break;
                              case 'UPDATE_FAILED':
                              case 'IMCOMPLETE_DATA':
                                var passengerLabel = self.element.find('label[data-passenger='+dataData.id+']').find('span').text();
                                messageUpdate += '<li class="passenger_name">'+passengerLabel+'</li>';
                                $.each(dataData.errors, function(indexErr, dataErr){
                                  messageUpdate += '<li>- '+dataErr.errorMessage+'</li>';
                                });
                                break;
                            }
                          });
                          if (counterOk<totalLenght) {
                            data = {
                              'header': {
                                'error': true,
                                'message': messageUpdate
                              },
                              'body': {
                                'data': null
                              }
                            };
                          } else {
                            data = {
                              'header': {
                                'error': false
                              },
                              'body': {
                                'data': data
                              }
                            };
                          }
                        }
                        if (data.header.error) {

                          self.element.find('.process_scroll').steps('showErrors');

                          if (data.header.code == 400) {

                            self.showFieldErrors($form, data.body.data);

                          } else {

                            if (typeof messageUpdate != 'undefined') {

                              Bus.publish('ajax', 'getTemplate', {
                                path: eval('AirEuropaConfig.templates.checkin.update_passengers_error'),
                                success: function(template) {
                                  $('#checkin').ui_dialog({
                                    title: lang('general.error_title'),
                                    error: true,
                                    subtitle: lang('checkin.update_passengers_subtitle_error'),
                                    content: template,
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
                                    render: function($dialog) {
                                      $dialog.find('.dialog_list > ul').html(messageUpdate);
                                    }
                                  });
                                }
                              });
                            } else {
                              /* Show an error */
                              $('#checkin').ui_dialog({
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
                                ],
                                render: function($dialog) {
                                  /* update GTM errors */
                                  if (data.header.code == 1004){
                                    updateGtm({
                                      'pageArea': 'Mis vuelos',
                                      'pageCategory': 'Checkin',
                                      'pageContent': 'Error_' + data.header.code + '. Al actualizar datos de pasajero.'
                                    });
                                  }else if (data.header.code == 1005) {
                                    updateGtm({
                                      'pageArea': 'Mis vuelos',
                                      'pageCategory': 'Checkin',
                                      'pageContent': 'Error_' + data.header.code + '. Sesión no válida.'
                                    });
                                  }

                                  if (data.header.code==1005) {
                                    /* Buttons behaviour */
                                    $dialog.find('.close a').on('click', function(event) {
                                      event.preventDefault();
                                      /* Remove server session */
                                      self.removeServerSession();
                                      /* Back to home */
                                      Bus.publish('process', 'kill');
                                    });
                                  }
                                }
                              });
                            }
                          }
                        }
                      }
                    });

                  }

              }


              // Every passenger have been checked and there are no errors and all calls are done.
              if ((index == $('.passengers_info').length - 1) && (formErrors <= 0) && (callsDone == callsEnded)){

                var $form = self.element.find('.process_step.passengers').find('form');

                //Form validated, we remove error message.
                if ($form.find('.block_body .form_error').length > 0) {
                    $form.find('.block_body .form_error').remove();
                }

                if (seatsMessagesList.length>0 && seatsMessagesList!='') {
                  //Showing no seat selected message
                  Bus.publish('ajax', 'getTemplate', {

                        path: eval('AirEuropaConfig.templates.checkin.passengers_seats'),
                                        
                        success: function(template) {
                          // Show message 
                          $('#checkin').ui_dialog({
                            title: lang('checkin.not_seat_assigned_title'),
                            subtitle: lang('checkin.not_seat_assigned_subtitle'),
                            content: template,
                            close: {
                              behaviour: 'close',
                              href: '#'
                            },
                            buttons: [
                            {
                              className: 'close',
                              href: '#',
                              label: lang('checkin.not_seat_assigned_cancel')
                            },
                            {
                              className: 'next',
                              href: '#',
                              label: lang('checkin.not_seat_assigned_continue')
                            }],
                                            
                        render: function($dialog) {
                          var $form = $dialog.find('form');
                        
                          $dialog.find('.dialog_list > ul').html(seatsMessagesList);
                        
                          // Buttons behaviour 
                          $dialog.find('.next a').on('click', function(event) {
                            event.preventDefault();
                            $form.trigger('submit');
                          });
                        
                          // Form behaviour 
                          $form.form({
                            
                            onSubmit: function(form) {
                        
                              // Close dialog 
                              $dialog.find('.close_dialog').find('a').click();
                        
                              // Continue to next step 
                              self.continueStep(url, nextStep);
                              // self.element.find('.submit_button').find('button').click();
                        
                            }
                          });
                        }
                        });
                        }
                  });

                }else{
                  //Everything is ok, form validated, seats selected, go to next step.
                  self.element.find('.process_step.passengers').removeClass('incomplete');
                  self.continueStep(url, nextStep);
                }

              }



            }); 

          }
        } 
      });
    },

    initFieldDocumentExpiration: function () {
      var cadenadias = '';
      var cadenameses = '';
      var cadenaanyos = '';
      var currentyear = (new Date).getFullYear();
      var iaux = '';
      var jaux = '';

      cadenaanyos = '<option value=""></option>';
      cadenadias = '<option value=""></option>';
      cadenameses = '<option value=""></option>';

      // day list
      for (var i = 1; i < 32; i++) {
        if(i < 9){
          iaux = "0" + i;
        }else{
          iaux = i;
        };

        cadenadias = cadenadias + '<option value="' + iaux + '">' + i + '</option>';
      };

      // month list
      for (var j = 0; j < 12; j++) {
        if(j < 9){
          jaux = "0" + (j+1);
        }else{
          jaux = (j+1);
        };

        cadenameses = cadenameses + '<option value="' + jaux + '">' + lang('dates.monthsNames_' + j) + '</option>';
      };

      // year list
      for (var i = currentyear; i < currentyear+31; i++) {
        cadenaanyos = cadenaanyos + '<option value="' + i + '">' + i + '</option>';
      };

      $(".day_input").html(cadenadias);
      $(".month_input").html(cadenameses);
      $(".year_input").html(cadenaanyos);

      // update combos if date is set
      var idsnecesariosp = $("[id$='_document_expiration']");
      idsnecesariosp.each(function(){
        if($(this).val() != ""){
          var targetId  = $(this).attr("id");
          var dateParts = $("#"+targetId).val().split("/");

          $('.' + targetId + '.passport_expirationyear').val(dateParts[2]).trigger('change', [true]);
          $('.' + targetId + '.passport_expirationmonth').val(dateParts[1]).trigger('change', [true]);
          $('.' + targetId + '.passport_expirationday').val(dateParts[0]).trigger('change', [true]);
        }

        $(".passport_accordeon").children(".passport_accordeon").addClass("passport_accordeonocult");
        $(".passport_accordeonocult").removeClass("passport_accordeon");
      });
    },

    initFieldBirthdate: function () {
      var cadenadias = '';
      var cadenameses = '';
      var cadenaanyosadult = '';
      var cadenaanyoskid = '';
      var cadenaanyosbaby = '';
      var currentyear = (new Date).getFullYear();
      var iaux = '';
      var jaux = '';

      cadenaanyosadult = '<option value=""></option>';
      cadenaanyoskid = '<option value=""></option>';
      cadenaanyosbaby = '<option value=""></option>';
      cadenadias = '<option value=""></option>';
      cadenameses = '<option value=""></option>';

      // day list
      for (var i = 1; i < 32; i++) {
        if(i < 10){
          iaux = "0" + i;
        }else{
          iaux = i;
        };

        cadenadias = cadenadias + '<option value="' + iaux + '">' + i + '</option>';
      };

      // month
      for (var j = 0; j < 12; j++) {
        if(j < 9){
          jaux = "0" + (j+1);
        }else{
          jaux = (j+1);
        };

        cadenameses = cadenameses + '<option value="' + jaux + '">' + lang('dates.monthsNames_' + j) + '</option>';
      };

      // year list - adult
      for (var i = currentyear-12; i > currentyear-131; i--) {
        cadenaanyosadult = cadenaanyosadult + '<option value="' + i + '">' + i + '</option>';
      };

      // year list - kid
      for (var i = currentyear-2; i > currentyear-13; i--) {
        cadenaanyoskid = cadenaanyoskid + '<option value="' + i + '">' + i + '</option>';
      };

      // year list - baby
      for (var i = currentyear; i > currentyear-3; i--) {
        cadenaanyosbaby = cadenaanyosbaby + '<option value="' + i + '">' + i + '</option>';
      };

      $(".bday_input").html(cadenadias);
      $(".bmonth_input").html(cadenameses);
      $(".byear_input_adult").html(cadenaanyosadult);
      $(".byear_input_kid").html(cadenaanyoskid);
      $(".byear_input_baby").html(cadenaanyosbaby);

      // update combos if date is set
      var idsnecesarios = $("[id$='_birthdate']");
      idsnecesarios.each(function(){
        if($(this).val() != ""){
          var targetId  = $(this).attr("id");
          var dateParts = $("#"+targetId).val().split("/");

          $('.' + targetId + '.byear').val(dateParts[2]).trigger('change', [true]);
          $('.' + targetId + '.bmonth').val(dateParts[1]).trigger('change', [true]);
          $('.' + targetId + '.bday').val(dateParts[0]).trigger('change', [true]);
        };
      });
    },

    documentExpirationActions: function () {
      $(".date_passport_expiration_input").change(function() {
        var inputtarget = $(this).attr("data-input-target");

        // reset value of the hidden date input
        $("#"+inputtarget).val("");

        var dayValue   = $("." + inputtarget + ".passport_expirationday").val();
        var monthValue = $("." + inputtarget + ".passport_expirationmonth").val();
        var yearValue  = $("." + inputtarget + ".passport_expirationyear").val();

        if (dayValue != "" && monthValue != "" && yearValue != "") {
          // set and validate hidden date input
          var finaldate = dayValue + "/" + monthValue + "/" + yearValue;

          $("#" + inputtarget).val(finaldate);
          $("#" + inputtarget).closest(".document_expiration").trigger('validate');
          $("#" + inputtarget).focus();

          // set/unset error class to all date combos
          if ($("#" + inputtarget).closest(".document_expiration").hasClass("error")) {
            $("." + inputtarget).closest('.select_field').addClass("errorper");
          } else {
            $("." + inputtarget).closest('.select_field').removeClass("errorper");
          }
        }
      });
    },

    birthdateActions: function() {
      $(".date_birthday_input").change(function() {
        var inputtarget = $(this).attr("data-input-target");

        // reset value of the hidden date input
        $("#" + inputtarget).val("");

        var dayValue   = $("." + inputtarget + ".bday").val();
        var monthValue = $("." + inputtarget + ".bmonth").val()
        var yearValue  = $("." + inputtarget + ".byear").val()

        if (dayValue != "" && monthValue != "" && yearValue != "") {
          // set and validate hidden date input
          var finaldate = dayValue + "/" + monthValue + "/" + yearValue;
          $("#" + inputtarget).val(finaldate);

          $("#" + inputtarget).closest(".age").trigger('validate');
          $("#" + inputtarget).focus();

          // set/unset error class to all date combos
          if ($("#" + inputtarget).closest(".age").hasClass("error")) {
            $("." + inputtarget).closest('.select_field').addClass("errorper");
          } else {
            $("." + inputtarget).closest('.select_field').removeClass("errorper");
          }
        }
      });
    },

    /* Function to continue with next step */
    continueStep: function(url, nextStep, finalStep) {
      finalStep = typeof finalStep !== 'undefined' ? finalStep : false;

      var self = this;

      /* First show loading bar */
      self.element.find('.process_scroll').steps('showLoading', function() {

        var mode = self.element.find('.process_steps').attr('data-mode');
        self.checkinCache.mode = mode;

        Bus.publish('ajax', 'postJson', {
          path: url,
          data: { checkin: self.checkinCache },
          success: function() {
            var step = self.element.find('.process_step').attr('data-step');

            if (step=='passengers' && nextStep=='cards' && !finalStep) {

              var $form = self.element.find('.process_step.passengers').find('form');

              /* Update passengers data before cards view. Then, if success, confirm checkin */
              Bus.publish('services', 'updateCheckinPassengers', {
                checkinCache: self.checkinCache,
                checkinId: self.checkinCache.checkinId,
                success: function(data) {
                  var totalLenght = data.length;
                  var counterOk = 0;
                  var messageUpdate = undefined;
                  /* If response comes without data.header */
                  if (!data.header) {
                    $.each(data, function(indexData, dataData){
                      switch (dataData.status) {
                        case 'OK':
                          counterOk++;
                          break;
                        case 'UPDATE_FAILED':
                        case 'IMCOMPLETE_DATA':
                          var passengerLabel = self.element.find('label[data-passenger='+dataData.id+']').find('span').text();
                          messageUpdate += '<li class="passenger_name">'+passengerLabel+'</li>';
                          $.each(dataData.errors, function(indexErr, dataErr){
                            messageUpdate += '<li>- '+dataErr.errorMessage+'</li>';
                          });
                          break;
                      }
                    });
                    if (counterOk<totalLenght) {
                      data = {
                        'header': {
                          'error': true,
                          'message': messageUpdate
                        },
                        'body': {
                          'data': null
                        }
                      };
                    } else {
                      data = {
                        'header': {
                          'error': false
                        },
                        'body': {
                          'data': data
                        }
                      };
                    }
                  }
                  if (!data.header.error) {
                    self.confirmCheckin(url, nextStep);
                  }
                  else {
                    self.element.find('.process_scroll').steps('showErrors');

                    if (data.header.code == 400) {
                      self.showFieldErrors($form, data.body.data);
                    } else {
                      if (typeof messageUpdate != 'undefined') {
                        Bus.publish('ajax', 'getTemplate', {
                          path: eval('AirEuropaConfig.templates.checkin.update_passengers_error'),
                          success: function(template) {
                            $('#checkin').ui_dialog({
                              title: lang('general.error_title'),
                              error: true,
                              subtitle: lang('checkin.update_passengers_subtitle_error'),
                              content: template,
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
                              render: function($dialog) {
                                $dialog.find('.dialog_list > ul').html(messageUpdate);
                              }
                            });
                          }
                        });
                      } else {
                        /* Show an error */
                        $('#checkin').ui_dialog({
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
                          ],
                          render: function($dialog) {
                            /* update GTM errors */
                            if (data.header.code == 1004){
                              updateGtm({
                                'pageArea': 'Mis vuelos',
                                'pageCategory': 'Checkin',
                                'pageContent': 'Error_' + data.header.code + '. Al actualizar datos de pasajero.'
                              });
                            }else if (data.header.code == 1005) {
                              updateGtm({
                                'pageArea': 'Mis vuelos',
                                'pageCategory': 'Checkin',
                                'pageContent': 'Error_' + data.header.code + '. Sesión no válida.'
                              });
                            }

                            if (data.header.code==1005) {
                              /* Buttons behaviour */
                              $dialog.find('.close a').on('click', function(event) {
                                event.preventDefault();
                                /* Remove server session */
                                self.removeServerSession();
                                /* Back to home */
                                Bus.publish('process', 'kill');
                              });
                            }
                          }
                        });
                      }
                    }
                  }
                }
              });

            } else {

              /* Set the status bar as completed */
              self.element.find('.checkin .steps .' + step).addClass('completed');

              /* Change URL */
              var checkinProcessURL = getProcessUrl('checkin');

              Bus.publish('hash', 'change', { hash: checkinProcessURL + '/' + nextStep });

            }
          },
          failure: function() {
            /* Show an error */
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
            self.element.find('.process_scroll').steps('showErrors');
          }
        });

      });
    },


    /* Function to confirm checkin */
    confirmCheckin: function(url, nextStep){
      var self = this;

      /* Confirm checkin */
      Bus.publish('services', 'confirmCheckin', {
        checkinCache: self.checkinCache,
        checkinId: self.checkinCache.checkinId,
        success: function(data) {
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
            // console.log("CONFIRMACION CORRECTA; CONTINUAMOS CARDS");
            //Todo correcto
            self.checkinCache.confirm = data.body.data;
            self.continueStep(url, nextStep, true);
          }
          else {
            /* Check if error code is 1114, INVALID ESTA */
            if (data.header.code == 1114) {
              if (data.body.data.failedPassengers.length > 0) {
                /* If there is not any boardingPass, only ok button, not continue */
                var dialogButtons = [
                  {
                    className: 'cancel',
                    href: '#',
                    label: lang('general.cancel')
                  },
                  {
                    className: 'continue',
                    href: '#',
                    label: lang('general.continue')
                  }
                ];
                if (data.body.data.boardingPasses.length==0) {
                  dialogButtons = [
                    {
                      className: 'close',
                      href: '#',
                      label: lang('general.ok')
                    }
                  ];
                }
                Bus.publish('ajax', 'getTemplate', {
                  data: data.body.data,
                  path: eval('AirEuropaConfig.templates.checkin.confirm_error'),
                  success: function(template) {
                    /* Show an error */
                    $('#checkin').ui_dialog({
                      title: lang('general.error_title'),
                      error: true,
                      content: template,
                      subtitle: lang('checkin.cards_no_create'),
                      close: {
                        behaviour: 'close',
                        href: '#'
                      },
                      buttons: dialogButtons,
                      render: function($dialog) {
                        /* Buttons behaviour */
                        $dialog.find('.cancel a').on('click', function(event) {
                          event.preventDefault();
                          /* Remove server session */
                          self.removeServerSession();
                          /* Back to home */
                          Bus.publish('process', 'kill');
                        });
                        $dialog.find('.continue a').on('click', function(event) {
                          event.preventDefault();

                          self.checkinCache.confirm = data.body.data.boardingPasses;
                          self.continueStep(url, nextStep, true);
                          $dialog.find('.close_dialog').find('a').click();
                        });
                      }
                    });
                  }
                });
              }
            } else {
              self.element.find('.process_scroll').steps('showErrors');

              /* Show an error */
              $('#checkin').ui_dialog({
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
                ],
                render: function($dialog) {
                  if (data.header.code==1005) {
                    /* Buttons behaviour */
                    $dialog.find('.close a').on('click', function(event) {
                      event.preventDefault();
                      /* Remove server session */
                      self.removeServerSession();
                      /* Back to home */
                      Bus.publish('process', 'kill');
                    });
                  }
                }
              });
            }
          }
        }
      });
    },


    /* Cards slider */

    startCardsSlider: function() {
      this.element.find('.cards_slider').cards_slider();
    },


    /* Cards button actions */
    startCardsActions: function() {
      var self = this;
      var checkinId = self.element.find('.process_step.cards').attr('data-checkinid');
      var cardsStep = self.element.find('.process_step').hasClass('cards');

      /* If QRCode exists, show it */
      var $qrCodeElement = self.element.find('.qr_code');
      if ($qrCodeElement.length) {
        $qrCodeElement.show();
      }

      /* Home button */
      self.element.find('.go_to_home .home a').on('click', function(event){
        event.preventDefault();
        /* Call to finishCheckin service */
        Bus.publish('services', 'finishCheckin', {
          checkinId: self.checkinCache.checkinId,
          success: function(data) {
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
              /* Send void checkin session to clean the server session */
              self.removeServerSession();

              /* Back to HOME */
              // Bus.publish('hash', 'change', { hash: '' });
              window.location.href= urlCms ('home'); 
            }
            else {
              /* Remove loading class */
              $this.removeClass('loading');

              /* Show an error */
              $('#checkin').ui_dialog({
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
                ],
                render: function($dialog) {
                  if (data.header.code==1005) {
                    /* Buttons behaviour */
                    $dialog.find('.close a').on('click', function(event) {
                      event.preventDefault();
                      /* Remove server session */
                      self.removeServerSession();
                      /* Back to home */
                      Bus.publish('process', 'kill');
                    });
                  }
                }
              });
            }
          }
        });
      });

      /* If browser is IE8, print button opens PDF in same window */
      if ($('html').hasClass('ie8')) {
        self.element.find('.action_buttons').find('a.print').removeAttr('target');
      }

      /* If there is not more flights, hide select another flight button */
      if (self.checkinCache.flights && self.checkinCache.flights.length>1) {
        self.element.find('.go_to_home .select_another').removeClass('hidden');
      }

      self.element.find('.action_buttons').find('a.share.passbook').on('click', function(event){
        event.preventDefault();
          
          var targetBookingCenter = self.element.find('div.cards_slider li.slide.active');
          var passengerId = targetBookingCenter.attr('data-PassengerId');
          var checkinId = self.checkinCache.checkinId;
          var ticketFlight = self.checkinCache.ticket;
          var url = getServiceURL('checkin.boardingpassPasbook');
          url = url.replace('{checkinId}', checkinId);
          url = url.replace('{ticket}', ticketFlight);
          url = url.replace('{passengerId}', passengerId);

          window.open(url);

      });

      /* Share button */
      self.element.find('.action_buttons').find('a.share.email').on('click', function(event){
        event.preventDefault();

        var $this = $(this);
        var typeSharing = $this.hasClass('email') ? 'MAIL' : 'PASSBOOK';

        Bus.publish('ajax', 'getTemplate', {
          data: self.checkinCache,
          path: eval('AirEuropaConfig.templates.checkin.cards_sharing'),
          success: function(template) {

            /* Show call me back lightbox */
            $('#checkin').ui_dialog({
              title: lang('checkin.cards_sharing_step1_title'),
              subtitle: lang('checkin.cards_sharing_step1_subtitle'),
              content: template,
              close: {
                behaviour: 'close',
                href: '#'
              },
              buttons: [
                {
                  className: 'next',
                  href: '#',
                  label: lang('general.continue')
                }
              ],
              render: function($dialog) {
                var $form = $dialog.find('.step1').find('form');

                /* Hidden step2 */
                $dialog.find('.step2').hide();

                /* Buttons behaviour */
                $dialog.find('.next a').on('click', function(event) {
                  event.preventDefault();
                  $form.trigger('submit');
                });

                /* Checkbox required */
                $dialog.find('.step1').find('.field.checkbox').find('input').on('change', function(){
                  var howMuch = 0;
                  $dialog.find('.step1').find('.field.checkbox').find('input').each(function(){
                    if ($(this).is(':checked')) {
                      howMuch++;
                    }
                    $dialog.find('.step1').find('.field.checkbox').addClass('disabled');
                  });
                  if (howMuch>0) {
                    $dialog.find('.step1').find('.field.checkbox').addClass('disabled');
                  } else {
                    $dialog.find('.step1').find('.field.checkbox').removeClass('disabled');
                  }
                });

                /* Form behaviour */
                $form.form({
                  onError: function() {
                    $dialog.find('.step1').find('.articles_error').show();
                  },
                  onSubmit: function(form) {
                    var passengersCardsChecked = [];
                    var formData = $form.serializeObject();

                    $.each(formData.field_card, function(index, data){
                      if (data.length>0) {
                        passengersCardsChecked.push(data);
                      }
                    });

                    self.initCheckinSharingStep2($dialog, passengersCardsChecked, typeSharing);

                  }
                });
              }
            });
          }
        });
      });

      if (cardsStep) {
        /* Show pax message of boarding gate could change */
        $('#checkin').ui_dialog({
          title: lang('checkin_cards.info_title'),
          error: false,
          subtitle: lang('checkin_cards.boarding_gate_change'),
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

    },


    initCheckinSharingStep2: function(dialog, passengersCardsChecked, typeSharing){
      var self = this;
      var $dialog = dialog;

      var $form = $dialog.find('.step2').find('form');

      $dialog.find('.step1').hide();

      /* Apply jquery placeholder */
      $('input, textarea').placeholder();

      $dialog.find('.step2').show();

      $dialog.find('.dialog_subtitle').html('<p>'+lang('checkin.cards_sharing_step2_subtitle')+'</p>');

      /* Buttons behaviour */
      $dialog.find('.next a').unbind('click');
      $dialog.find('.next a').on('click', function(event) {
        event.preventDefault();
        $form.trigger('submit');
      });

      $form.form({
        onError: function() {
          $dialog.find('.step2').find('.articles_error').show();
        },
        onSubmit: function(form) {
          var formData = $form.serializeObject();

          var userEmailsArray = formData.field_emails.indexOf(",")!=-1?formData.field_emails.split(","):formData.field_emails.split(";");
          /* Trim the emails */
          for (var i = userEmailsArray.length - 1; i >= 0; i--) {
            userEmailsArray[i] = $.trim(userEmailsArray[i]);
          };

          var postObject = {
            "locator": self.checkinCache.locator,
            "userId": localStorage.ly_userId,
            "departureDate": moment(self.checkinCache.selectedFlight.departureDate).format("YYYY-MM-DD"),
            "flightNumber" : self.checkinCache.flightNumber,
            "sharingType" : typeSharing,
            "userFlightIds" : passengersCardsChecked,
            "emails": userEmailsArray,
            "userMessage" : formData.field_message
          };

          $dialog.find('.dialog_content').append('<span class="dialog_spinner"><span class="spinner"></span><strong class="spinner_text">' + lang('inner.loading') + '</strong></span>').addClass('spinner');

          Bus.publish('services', 'shareCheckinCards', {
            data: postObject,
            checkinId: self.checkinCache.checkinId,
            success: function(data) {
              $dialog.find('.next a').show();
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
                $form.remove();
                $dialog.find('.dialog_subtitle').html('<p>'+lang('general.request_sent')+'</p>');
              }
              else {
                /* Show an error */
                $dialog.find('.dialog_subtitle').html('<p>'+data.header.message+'</p>');
              }
              $dialog.find('.dialog_content').removeClass('spinner').find('.dialog_spinner').remove();
            }
          });

          $dialog.find('.next a').text(lang('general.continue'));
          $dialog.find('.next a').unbind('click');
          $dialog.find('.next a').on('click', function(event) {
            event.preventDefault();
            $dialog.find('.close_dialog').find('a').click();
          });

        }
      });

    },


    /* Seats map */

    composeSeatMap: function() {
      var self = this;
      var flight = flightNumber = this.element.find('.seat_field .field_wrapper a').attr('data-id-flight');
      var passenger = this.element.find('.seat_field .field_wrapper a').attr('data-passenger');
      var step = self.element.find('.process_step').attr('data-step');

      if (step=='passengers'){

        /* We allocate seat of selected passenger */
        $.each(self.checkinCache.selectedPassengers, function(passengerIndex, passengerData){
          if (passengerData.flightPassenger.seat) {
            self.element.find('.seat_field').find('input.seat_number_temp.'+passengerData.passenger.id).val(passengerData.flightPassenger.seat.number);
            self.element.find('.seat_field').find('input.seat_column_temp.'+passengerData.passenger.id).val(passengerData.flightPassenger.seat.column);
            self.element.find('.seat_field').find('input.seat_number_selected.'+passengerData.passenger.id).val(passengerData.flightPassenger.seat.number);
            self.element.find('.seat_field').find('input.seat_column_selected.'+passengerData.passenger.id).val(passengerData.flightPassenger.seat.column);

            /* Show seat label */
            self.element.find('.seat_label.'+passengerData.passenger.id).css('display', 'block');
            self.element.find('.seat_label.'+passengerData.passenger.id).text(lang('checkin.assigned_seat') + ': ' + passengerData.flightPassenger.seat.number + passengerData.flightPassenger.seat.column);
          }
        });

        this.element.find('.seat_field .field_wrapper a').on('click', function(event) {
          event.preventDefault();

          var $this = $(this);
          var passengerId = $this.attr('data-passenger');

          /*display none button*/
          $('.submit.confirm').slideUp(500);


          /* Add loading class to the button */
          $this.addClass('loading');

          /* Add class focused to this field */
          $this.closest('.seat_field').addClass('focused');

          /* Call AJAX module to get the json with plane structure */
          Bus.publish('services', 'postAircraftMap', {
            postObject: self.checkinCache,
            checkinId: self.checkinCache.checkinId,
            passengerId: passengerId,
            success: function(data) {
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

                self.aircraftMap = data;

                Bus.publish('ajax', 'getTemplate', {
                  path: eval('AirEuropaConfig.templates.checkin.plane'),
                  success: function(template) {
                    var $html = template(data);

                    /* Remove loading class */
                    $this.removeClass('loading');

                    self.element.append($html);
                    self.initSeatsMap(data, $($this).attr('data-id-flight'), $($this).attr('data-passenger'));

                    /* TGM seats */
                    updateGtm({
                       'origen': self.checkinCache.selectedFlight.departure.airport.code,
                       'destino': self.checkinCache.selectedFlight.arrival.airport.code,
                       'fechaida': self.checkinCache.selectedFlight.departureDate,
                       'numpax': self.checkinCache.selectedFlight.passengers.length,
                       'mercado': window.market,
                       'pageArea': 'Mis vuelos',
                       'pageCategory': 'Checkin',
                       'pageContent': 'Elegir asiento'
                    });

                  }
                });
              }
              else {
                /* Remove loading class */
                $this.removeClass('loading');

                /* Show an error */
                $('#checkin').ui_dialog({
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
                  ],
                  render: function($dialog) {
                    if (data.header.code==1005) {
                      /* Buttons behaviour */
                      $dialog.find('.close a').on('click', function(event) {
                        event.preventDefault();
                        /* Remove server session */
                        self.removeServerSession();
                        /* Back to home */
                        Bus.publish('process', 'kill');
                      });
                    }
                  }
                });
              }
            }
          });

        });

      }
    },

    initSeatsMap: function(data, flightNumber, passenger) {
      var self = this;
      var $seatsMapOverlay = this.element.find('.seats_map_overlay');
      var $seatsMapsWrapper = $seatsMapOverlay.find('.seats_map_wrapper');
      var $seatsMap = $seatsMapsWrapper.find('.seats_map');
      var $seatsTableWrapper = $seatsMapsWrapper.find('.seats_table_wrapper');
      var $seatsTable = $seatsMapsWrapper.find('.seats_table');
      var $gradientLeft = $seatsMapsWrapper.find('.gradient_left');

      /* Hide the overlay sending it outside viewport */
      $seatsMapOverlay.addClass('hidden').show();

      /* Set height and position */
      $seatsMapsWrapper.css({
        'height': $seatsMap.outerHeight(true),
        'margin-top': ($seatsMap.outerHeight(true) / 2) * -1
      });

      /* Set width according to the plane size */
      $seatsTable.css('width', $seatsTable.outerWidth());
      $seatsTableWrapper.css('width', 'auto');

      /* Put data-id-flight and data-passenger attribs to assign correct data */
      this.element.find('.confirm_seats a').attr('data-id-flight', flightNumber);
      this.element.find('.confirm_seats a').attr('data-passenger', passenger);

      /* Get prices */
      var xlPrice = this.getPrices('EXTRASIZE', data);
      var exitPrice = this.getPrices('EMERGENCY', data);
      var babiesPrice = this.getPrices('SUITABLE_ADULT_WITH_INFANT', data);
      var normalPrice = this.getPrices('NORMAL', data);

      /* Add prices to legend */
      if (this.getFeatures('LEG_SPACE_SEAT', data)) $seatsMapsWrapper.find('.legend .xl').removeClass('hidden');
      if (this.getFeatures('EXIT_SEAT', data)) $seatsMapsWrapper.find('.legend .exit').removeClass('hidden');
      if (this.getFeatures('SUITABLE_ADULT_WITH_INFANT', data)) $seatsMapsWrapper.find('.legend .babies').removeClass('hidden');
      console.log('alguno normal?', this.getFeatures('NORMAL', data))
      if (this.getFeatures('NORMAL', data)) $seatsMapsWrapper.find('.legend .normal').removeClass('hidden');

      /* Init arrows events */
      this.seatsMapArrows();

      /* Init seat events */
      this.seatEvents();

      /* We allocate seat of selected passenger */
      var seatNumberTemp = self.element.find('.seat_field').find('input.seat_number_temp.'+passenger).val();
      var seatColumnTemp = self.element.find('.seat_field').find('input.seat_column_temp.'+passenger).val();
      var seatNumberSelected = self.element.find('.seat_field').find('input.seat_number_selected.'+passenger).val();
      var seatColumnSelected = self.element.find('.seat_field').find('input.seat_column_selected.'+passenger).val();
      /* If session object have assigned seat and hidden inputs have same seat data - To control canceled seat */
      if (seatNumberTemp.length>0 && seatColumnTemp.length>0) {
        var selectedSeatNC = seatNumberSelected+'-'+seatColumnSelected;
        $seatsTable.find('.seat.'+selectedSeatNC).removeClass('occupied').addClass('current_selected');
        /* Move seats slide to passenger seat */
        $gradientLeft.show();
        var seatPosition = $seatsTable.find('.seat.'+selectedSeatNC).closest('.column.column_seats').position();
        var newPosition = (-1 * (parseInt(seatPosition.left)/2));
        $seatsTable.animate({
          'left': newPosition
        }, 300);
      }

      /* Set selected seats for another passengers */
      self.element.find('.document_seat').each(function(index, dataEach){
        var $this = $(this);
        var numberSelected = $this.find('input.seat_number_selected').val();
        var columnSelected = $this.find('input.seat_column_selected').val();
        var selectedSeat = numberSelected + '-' + columnSelected;
        if (!$this.find('input.seat_number_selected').hasClass(passenger) && !$this.find('input.seat_column_selected').hasClass(passenger)) {
          $seatsTable.find('.seat.'+selectedSeat).removeClass('occupied').addClass('selected');
        }
      });

      /* Show overlay */
      $seatsMapOverlay.removeClass('hidden');
    },

    getPrices: function(type, data) {
      var price = {
        amount: 0,
        currencyCode: '',
        currencyDescription: ''
      };

      var breakEach = false;

      $.each(data.map, function(idRow, row) {
        $.each(row, function(idSeat, seat) {
          if (seat.priceSeat) {
            if (seat.type == "SEAT" && seat.priceSeat && seat.priceSeat.priceSeatType == type && seat.occupation !== "OCCUPIED") {
              price.amount = seat.priceSeat.price.amount;
              price.currencyCode = seat.priceSeat.price.currency.code;
              price.currencyDescription = seat.priceSeat.price.currency.description;

              /* Break the each */
              breakEach = true;

              /* Break current each */
              return false;
            }
          }
        });

        if (breakEach) return false;
      });

      return price;
    },

    getFeatures: function(type, data) {
      var availableSeats = _.filter(_.flatten(data.map), function (seat) {
        return seat.type == 'SEAT' && seat.occupation === 'FREE';
      });
      var hasFeature = function (s, t) {
        return _.indexOf(s.features, t) !== -1;
      }
      return _.some(availableSeats, function (seat) {
        if (type === 'NORMAL') 
          return seat.features.length === 0;

        if (type === 'LEG_SPACE_SEAT')
          return hasFeature(seat, type);
        
        if (type === 'EXIT_SEAT')
          return hasFeature(seat, type) && !hasFeature(seat, 'LEG_SPACE_SEAT');
        
        if (type === 'SUITABLE_ADULT_WITH_INFANT')
          return hasFeature(seat, type);
        
        return false
      });
    },

    seatsMapArrows: function() {
      var self = this;
      var $seatsMapOverlay = this.element.find('.seats_map_overlay');
      var $seatsMapsWrapper = $seatsMapOverlay.find('.seats_map_wrapper');
      var $seatsMap = $seatsMapsWrapper.find('.seats_map');
      var $seatsTableWrapper = $seatsMapsWrapper.find('.seats_table_wrapper');
      var $seatsTable = $seatsMapsWrapper.find('.seats_table');
      var $gradientLeft = $seatsMapsWrapper.find('.gradient_left');
      var $gradientRight = $seatsMapsWrapper.find('.gradient_right');
      var seatsToJump = parseInt(AirEuropaConfig.seats.seatsToJump);
      var seatWidth = $seatsMapsWrapper.find('.seat').eq(0).outerWidth();
      var pxToJump = seatsToJump * seatWidth;

      /* Click event */
      $seatsMap.on('click', '.arrows a', function(event) {
        event.preventDefault();

        var minLeft = -1 * ($seatsTable.width() + $gradientRight.width() - $seatsTableWrapper.width());
        var $this = $(this);
        var currentPosition = parseInt($seatsTable.css('left').replace('px', '')) || 0;
        var newPosition;

        /* Calc direction */
        if ($this.closest('li').hasClass('prev')) {
          newPosition = currentPosition + pxToJump;
        }
        else if ($this.closest('li').hasClass('next')) {
          newPosition = currentPosition - pxToJump;
        }

        /* Limits */
        if (newPosition >= 0) newPosition = 0;
        if (newPosition <= minLeft) newPosition = minLeft;

        /* Animate */
        $seatsTable.animate({
          'left': newPosition
        }, 300, function() {
          if (newPosition >= 0) $gradientLeft.hide();
          else $gradientLeft.show();
        });
      });

      $seatsMapOverlay.on('click', '.close_seats_map a', function(event) {
        event.preventDefault();
        self.element.find('.seat_field.focused').removeClass('focused');
        $seatsMapOverlay.remove();
      });
    },

    seatEvents: function() {
      var self = this;
      var $seatsMapOverlay = this.element.find('.seats_map_overlay');
      var $seatsMapsWrapper = $seatsMapOverlay.find('.seats_map_wrapper');
      var $seatsTable = $seatsMapsWrapper.find('.seats_table');
      var $seatFieldOpener = self.element.find('.seat_field.focused');

      /* Get vars for service */
      var checkinId = this.element.find('.process_step').attr('data-checkinId');
      var withInfant = ($seatFieldOpener.closest('.check_group').attr('data-with-infant') == 'true');
      var planeHasInfantSeats = ($seatsTable.find('.seat.babies').length > 0);
      var applyIntantSeatsRestriction = (withInfant && planeHasInfantSeats);

      if (applyIntantSeatsRestriction) {
        $seatsTable.addClass('must_choose_infant_seat');
      }
      else {
        $seatsTable.removeClass('must_choose_infant_seat');
      }

      /* Seat click event */
      $seatsTable.on('click', '.seat', function(event) {
        event.preventDefault();

        var $this = $(this);
        var isOccupied = $this.hasClass('occupied');
        var isSelected = $this.hasClass('selected');
        var isEmergency = $this.hasClass('exit');
        var isForBabies = $this.hasClass('babies');

        if ((!(isOccupied || isSelected)) && (!(applyIntantSeatsRestriction && !isForBabies))) {
          if (!$this.hasClass('current_selected')) {
            /* Get vars */
            var number = $this.attr('data-number');
            var column = $this.attr('data-column');

            /* Show emergency popup if necessary */
            if (isEmergency) {
              $seatsMapOverlay.find('.emergency_dialog').addClass('visible');

              /* Emergency button events */
              $seatsMapOverlay.find('.emergency_dialog .dialog_buttons .cancel a').off('click');
              $seatsMapOverlay.find('.emergency_dialog .dialog_buttons .cancel a').on('click', function(event) {
                event.preventDefault();

                /* Hide dialog */
                $seatsMapOverlay.find('.emergency_dialog').removeClass('visible');
              });

              $seatsMapOverlay.find('.emergency_dialog .dialog_buttons .ok a').off('click');
              $seatsMapOverlay.find('.emergency_dialog .dialog_buttons .ok a').on('click', function(event) {
                event.preventDefault();

                /* Hide dialog */
                $seatsMapOverlay.find('.emergency_dialog').removeClass('visible');

                /* Remove current selected if exists */
                $seatsTable.find('.current_selected').removeClass('current_selected');

                /* Set as current selected */
                $this.addClass('current_selected');

                /* Assign number and column to temp fields in opener */
                self.element.find('.seat_field.focused').find('input.seat_number_temp').val(number);
                self.element.find('.seat_field.focused').find('input.seat_column_temp').val(column);
              });

            }
            else {
              /* Remove current selected if exists */
              $seatsTable.find('.current_selected').removeClass('current_selected');

              /* Set as current selected */
              $this.addClass('current_selected');

              /* Assign number and column to temp fields in opener */
              self.element.find('.seat_field.focused').find('input.seat_number_temp').val(number);
              self.element.find('.seat_field.focused').find('input.seat_column_temp').val(column);
            }
          } /* Cancel seat assign */
          else {
            $seatsTable.find('.current_selected').removeClass('current_selected').removeClass('occupied');
            /* Assign number and column to temp fields in opener */
            self.element.find('.seat_field.focused').find('input.seat_number_temp').val('');
            self.element.find('.seat_field.focused').find('input.seat_column_temp').val('');
          }
        }
      });

      /* Confirm seats click event */
      $seatsMapOverlay.on('click', '.confirm_seats a', function(event) {
        event.preventDefault();

        /* Get references */
        var $this = $(this);
        var $selectedSeat = $seatsTable.find('.current_selected');
        var $seatFieldOpenerNumber = $seatFieldOpener.find('input.seat_number_selected');
        var $seatFieldOpenerColumns = $seatFieldOpener.find('input.seat_column_selected');
        var $selectedValuePlaceholder = $seatFieldOpener.find('.selected_value');

        /* Get last number and column */
        var lastNumber = $seatFieldOpenerNumber.val();
        var lastColumn = $seatFieldOpenerColumns.val();

        /* Get passenger Id and flight number */
        var passenger = $this.attr('data-passenger');
        var flightNumber = $this.attr('data-id-flight');

        /* If it's a selected seat, check if it wasn't selected before and call the service to validate it */
        if ($selectedSeat.length > 0) {
          /* Add loading class to the button */
          $this.addClass('loading');

          /* Get current number and column */
          var number = $selectedSeat.attr('data-number');
          var column = $selectedSeat.attr('data-column');

          var flightTempObject = {};
          $.each(self.checkinCache.flights, function(flightIndex, flight){
            if (flight.flightNumber==flightNumber) {
              flightTempObject = {
                "flightNumber": flightNumber,
                "carrierCompanyCode": flight.operatingCompany.code,
                "departureAirportCode": flight.departure.airport.code,
                "arrivalAirportCode": flight.arrival.airport.code,
                "departureDate": flight.departureDate
              };
              return false;
            }
          });

          var passengerTempObject = [];
          $.each(self.checkinCache.selectedPassengers, function(passengerIndex, passengerData){
            if (passenger==passengerData.passenger.id) {
              passengerTempObject[0] = {
                "userFlightId": passengerData.flightPassenger.userFlightId,
                "name": passengerData.passenger.name,
                "surname": passengerData.passenger.surname,
                "gender": passengerData.passenger.gender,
                "type": passengerData.passenger.type,
                "row": number,
                "column": column
              };
              return false;
            }
          });

          /* Prepare object to send */
          var objectToSend = {
              "passengers": passengerTempObject,
              "flight": flightTempObject
          };

          var serviceType = undefined;
          /* If there's a different seat selected, call to service */
          if ((number != lastNumber || column != lastColumn) && (lastNumber.length==0 && lastColumn.length==0)) {
            serviceType = 'allocate';
          } else {
            serviceType = 're-allocate';
          }
          /* Call putCheckinSeat or putCheckinReallocateSeat service */
          Bus.publish('services', 'putCheckinSeat', {
            data: {
              serviceType: serviceType,
              checkinId: checkinId,
              putData: objectToSend
            },
            success: function(data) {
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

                if (data.header.code == 3112) {
                  /* Remove kids seats */
                  self.removeChildrenSeats(data);
                }
                else {
                  /* Pass the temp vars to current selected */
                  $seatFieldOpenerNumber.val(number);
                  $seatFieldOpenerColumns.val(column);

                  /* Update the selected_value text for this seat and set it to filled status */
                  $seatFieldOpener.addClass('filled');
                  $selectedValuePlaceholder.text(number + column);

                  /* If service type is re-allocate, put in html label to confirm */
                  self.element.find('label[data-passenger="'+passenger+'"]').addClass(serviceType);

                  /* Prepare session data to update it */
                  var seatObject = {};
                  var breakEach = false;
                  $.each(self.aircraftMap.map, function(indexMap, dataMap){
                    $.each(dataMap, function(indexMapInside, dataMapInside){
                      if (dataMapInside.number==number && dataMapInside.column==column) {
                        seatObject = {
                            "number": number,
                            "column": column,
                            "type": dataMapInside.type,
                            "occupation": "OCCUPIED",
                            "features": dataMapInside.features
                        };
                        breakEach = false;
                        return false;
                      }
                    });
                    if (breakEach) return false;
                  });
                  $.each(self.checkinCache.selectedPassengers, function(passengerIndex, passengerData){
                    if (passenger==passengerData.flightPassenger.passengerId) {
                      self.checkinCache.selectedPassengers[passengerIndex].seat = seatObject;
                      return false;
                    }
                  });
                  $.each(self.checkinCache.selectedFlight.passengers, function(passengerIndex, passengerData){
                    if (passenger==passengerData.passengerId) {
                      self.checkinCache.selectedFlight.passengers[passengerIndex].seat = seatObject;
                      return false;
                    }
                  });
                  $.each(self.checkinCache.flights, function(flightIndex, flightData){
                    if (flightNumber==flightData.flightNumber){
                      $.each(flightData.passengers, function(passengerIndex, passengerData){
                        if (passenger==passengerData.passengerId) {
                          self.checkinCache.flights[flightIndex].passengers[passengerIndex].seat = seatObject;
                          return false;
                        }
                      });
                      return false;
                    }
                  });

                  /* Show seat label */
                  self.element.find('.seat_label.'+passenger).css('display', 'block');
                  self.element.find('.seat_label.'+passenger).text(lang('checkin.assigned_seat') + ': ' + number + column);
                }

                if($('.current_selected').length){

                  /*display none button*/
                  $('.submit.confirm').slideDown(500);
                  
                }



              }
              /* Show the error if needed */
              else {
                /* If there is an error, clear temp seat assign */
                self.element.find('.seat_field').find('input.seat_number_temp.'+passenger).val('');
                self.element.find('.seat_field').find('input.seat_column_temp.'+passenger).val('');

                var message = data.header.message;
                $('#checkin').ui_dialog({
                  title: lang('general.error_title'),
                  template: '',
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
                  render: function($dialog) {
                    if (data.header.code==1005) {
                      /* Buttons behaviour */
                      $dialog.find('.close a').on('click', function(event) {
                        event.preventDefault();
                        /* Remove server session */
                        self.removeServerSession();
                        /* Back to home */
                        Bus.publish('process', 'kill');
                      });
                    }
                  }
                });
              }

              /* Close the map */
              $seatsMapOverlay.find('.close_seats_map a').trigger('click');

            }
          });
        } /* Cancel seat assign */
        else {
          /* Assign number and column to temp fields in opener */
          self.element.find('.seat_field.focused').find('input.seat_number_selected').val('');
          self.element.find('.seat_field.focused').find('input.seat_column_selected').val('');
          self.element.find('.seat_label.'+passenger).css('display', 'none');
          self.element.find('.seat_label.'+passenger).text('');

          /* Close the map */
          $seatsMapOverlay.find('.close_seats_map a').trigger('click');
        }
      });

    },


    /* Remove children seats when 3112 error code happens */
    removeChildrenSeats: function(data) {
      var self = this;
      var message = '';

      $.each(data.body.data, function(indexError, dataError){
        var $seatFieldError = self.element.find('.check_group.'+dataError.passengerId);
        var $seatFieldErrorNumber = $seatFieldError.find('input.seat_number_selected');
        var $seatFieldErrorColumns = $seatFieldError.find('input.seat_column_selected');
        var $seatFieldErrorNumberTemp = $seatFieldError.find('input.seat_number_temp');
        var $seatFieldErrorColumnsTemp = $seatFieldError.find('input.seat_column_temp');
        var $selectedValueErrorPlaceholder = $seatFieldError.find('.seat_label');

        /* Pass the temp vars to current selected */
        $seatFieldErrorNumber.val('');
        $seatFieldErrorColumns.val('');
        $seatFieldErrorNumberTemp.val('');
        $seatFieldErrorColumnsTemp.val('');
        $selectedValueErrorPlaceholder.text('').hide();

        /* Update the selected_value text for this seat */
        message += dataError.message+'\n';
      });

      /* Shows first index of info message */
      $('#checkin').ui_dialog({
        title: lang('general.info_error_title'),
        error: false,
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
    },


    /* Helper for tabindex setup */
    setTabindex: function() {

      /* Clean previous tab index */
      $('body').find('input[tabindex], select[tabindex]').attr('tabindex', '');

      var tabindex = 1;

      this.element.find('input, select').each(function() {
        if (this.type != "hidden") {
          var $input = $(this);
          if($input.hasClass("ocult")){
            $input.attr('tabindex', -1);
          }else{
            $input.attr('tabindex', tabindex);
            tabindex++;
          }
        }
      });
    },



    /* Helper for input fields dimensions */
    preparePassengersForm: function(){
      var self = this;
      var $this = $(document);
      var cardsNumber = 0;
      var howMuch = 0;
      

      if (self.element.find('.process_step').attr('data-step')=='passengers') {

        /* Get states from US */
        Bus.publish('services', 'getCheckinStatesFromCountry', {
          countryCode: 'US',
          success: function(data) {
            self.checkinCache.address_countries = data;
          }
        });

        /* Control number of cards will be generated */
        $this.find('.group_header').find('input[type=checkbox]').change(function(){
          var $this = $(this);

          if ($this.attr('id').indexOf('field_frequent_flyer')==-1) {
            /* Change title icon */
            var iconClass = $(this).parent().find('label > i').attr('class');

            if ($this.is(':checked')) {

              $this.closest('.passengers_info').addClass('opened');
              cardsNumber++;
              $(this).parent().find('label > i').removeClass(iconClass).addClass(iconClass+'_2');

              if ($this.closest('.passengers_info').attr('data-with-infant')){
                cardsNumber++;
              }

            } else {

              $this.closest('.passengers_info').removeClass('opened');
              cardsNumber--;
              $this.parent().find('label > i').removeClass(iconClass).addClass(iconClass.replace('_2', ''));

              if ($this.closest('.passengers_info').attr('data-with-infant')){
                cardsNumber--;
              }

            }
            
            self.checkCardsGeneration(cardsNumber);

          }

        });

        /* Action for cancel checkin button */
        $this.find('.cancel_checkin').find('a.cta').on('click', function(e){
          e.preventDefault();

          var $this = $(this);
          var passengerId = $this.attr('data-passenger');
          $this.addClass('loading');

          /*display none button*/
          $('.submit.confirm').slideUp(500);


          /* Cancel checkin */
          Bus.publish('services', 'cancelCheckin', {
            checkinCache: self.checkinCache,
            checkinId: self.checkinCache.checkinId,
            passenger: passengerId,
            success: function(data) {
              if (data) {
                /*Hide link booking_card page my booking*/
                if ($('.content_wrapper[data-page=booking_detail]').length !== 0){
                  $('.booking_card').hide();
                  $('.my_booking_cards').hide();
                }

                /* Show checkin cancelation confirmation */
                $('#checkin').ui_dialog({
                  title: lang('checkin.cancelation_success_title'),
                  error: false,
                  subtitle: lang('checkin.cancelation_success'),
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
                  render: function($dialog) {
                    /* Buttons behaviour */
                    $dialog.find('.close a').on('click', function(event) {
                      event.preventDefault();
                      /* Remove server session */
                      self.removeServerSession();
                      /* Back to home */
                      Bus.publish('process', 'kill');
                    });
                  }
                });
              } else {
                $this.removeClass('loading');
                $('#checkin').ui_dialog({
                  title: lang('checkin.no_cancelation_title'),
                  error: true,
                  subtitle: lang('checkin.no_cancelation'),
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

        /* Check ESTA certified */
        $this.find('.group_header').find('label.no-checkbox').on('click', function(e){
          var $this = $(this);

          e.preventDefault();
          $('#checkin').ui_dialog({
            title: lang('general.error_title'),
            error: true,
            subtitle: $this.attr('data-esta-message'),
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
        });

        $.each(self.checkinCache.selectedPassengers, function(passengerIndex, passenger){
          if (passenger.flightPassenger.emptyFields) {
            if (passenger.flightPassenger.emptyFields.indexOf('TITLE')!=-1 &&
                passenger.flightPassenger.emptyFields.indexOf('NATIONALITY')==-1 &&
                passenger.flightPassenger.emptyFields.indexOf('BIRTHDAY')==-1) {
              $this.find('.passengers_info.'+passenger.flightPassenger.passengerId).find('.document_seat').removeClass('quarter').addClass('three_quarters');
            }
            if (passenger.flightPassenger.emptyFields.indexOf('TITLE')==-1 &&
                passenger.flightPassenger.emptyFields.indexOf('NATIONALITY')!=-1 &&
                passenger.flightPassenger.emptyFields.indexOf('BIRTHDAY')==-1) {
              $this.find('.passengers_info.'+passenger.flightPassenger.passengerId).find('.document_seat').removeClass('quarter').addClass('three_quarters');
            }
            if (passenger.flightPassenger.emptyFields.indexOf('TITLE')==-1 &&
                passenger.flightPassenger.emptyFields.indexOf('NATIONALITY')==-1 &&
                passenger.flightPassenger.emptyFields.indexOf('BIRTHDAY')!=-1) {
              $this.find('.passengers_info.'+passenger.flightPassenger.passengerId).find('.document_seat').removeClass('quarter').addClass('half');
            }

            if (passenger.flightPassenger.emptyFields.indexOf('TITLE')!=-1 &&
                passenger.flightPassenger.emptyFields.indexOf('NATIONALITY')!=-1 &&
                passenger.flightPassenger.emptyFields.indexOf('BIRTHDAY')==-1) {
              $this.find('.passengers_info.'+passenger.flightPassenger.passengerId).find('.document_seat').removeClass('quarter').addClass('half');
            }
            if (passenger.flightPassenger.emptyFields.indexOf('TITLE')==-1 &&
                passenger.flightPassenger.emptyFields.indexOf('NATIONALITY')!=-1 &&
                passenger.flightPassenger.emptyFields.indexOf('BIRTHDAY')!=-1) {
              $this.find('.passengers_info.'+passenger.flightPassenger.passengerId).find('.document_seat').removeClass('quarter').addClass('quarter');
            }
            if (passenger.flightPassenger.emptyFields.indexOf('TITLE')!=-1 &&
                passenger.flightPassenger.emptyFields.indexOf('NATIONALITY')==-1 &&
                passenger.flightPassenger.emptyFields.indexOf('BIRTHDAY')!=-1) {
              $this.find('.passengers_info.'+passenger.flightPassenger.passengerId).find('.document_seat').removeClass('quarter').addClass('quarter');
            }
            if (passenger.flightPassenger.emptyFields.indexOf('TITLE')==-1 &&
                passenger.flightPassenger.emptyFields.indexOf('NATIONALITY')==-1 &&
                passenger.flightPassenger.emptyFields.indexOf('BIRTHDAY')==-1) {
              $this.find('.passengers_info.'+passenger.flightPassenger.passengerId).find('.document_seat').removeClass('quarter').addClass('full');
            }
            if (passenger.flightPassenger.emptyFields.indexOf('TITLE')!=-1 &&
                passenger.flightPassenger.emptyFields.indexOf('NATIONALITY')!=-1 &&
                passenger.flightPassenger.emptyFields.indexOf('BIRTHDAY')!=-1) {
              $this.find('.passengers_info.'+passenger.flightPassenger.passengerId).find('.document_seat').removeClass('quarter').addClass('full');
            }
            /* For name and surname */
            if (passenger.flightPassenger.emptyFields.indexOf('NAME')!=-1 &&
                passenger.flightPassenger.emptyFields.indexOf('SURNAME')==-1) {
              $this.find('.passengers_info.'+passenger.flightPassenger.passengerId).find('.name').removeClass('half').addClass('full');
            }
            if (passenger.flightPassenger.emptyFields.indexOf('NAME')==-1 &&
                passenger.flightPassenger.emptyFields.indexOf('SURNAME')!=-1) {
              $this.find('.passengers_info.'+passenger.flightPassenger.passengerId).find('.surname').removeClass('half').addClass('full');
            }
          } else {
            $this.find('.document_seat').removeClass('quarter').addClass('full');
          }

          /* If passenger has infant associated */
          if (passenger.flightPassenger.infant) {
            if (passenger.flightPassenger.infant.emptyFields) {
              /* Only one field */
              if (passenger.flightPassenger.infant.emptyFields.indexOf('GENDER')!=-1 &&
                  passenger.flightPassenger.infant.emptyFields.indexOf('NATIONALITY')==-1 &&
                  passenger.flightPassenger.infant.emptyFields.indexOf('BIRTHDAY')==-1) {
                $this.find('.passengers_info.'+passenger.flightPassenger.passengerId).find('.fieldset_body.'+passenger.flightPassenger.infant.passengerId).find('.document_gender').removeClass('quarter').addClass('full');
              }
              if (passenger.flightPassenger.infant.emptyFields.indexOf('GENDER')==-1 &&
                  passenger.flightPassenger.infant.emptyFields.indexOf('NATIONALITY')!=-1 &&
                  passenger.flightPassenger.infant.emptyFields.indexOf('BIRTHDAY')==-1) {
                $this.find('.passengers_info.'+passenger.flightPassenger.passengerId).find('.fieldset_body.'+passenger.flightPassenger.infant.passengerId).find('.document_nationality').removeClass('quarter').addClass('full');
              }
              if (passenger.flightPassenger.infant.emptyFields.indexOf('GENDER')==-1 &&
                  passenger.flightPassenger.infant.emptyFields.indexOf('NATIONALITY')==-1 &&
                  passenger.flightPassenger.infant.emptyFields.indexOf('BIRTHDAY')!=-1) {
                $this.find('.passengers_info.'+passenger.flightPassenger.passengerId).find('.fieldset_body.'+passenger.flightPassenger.infant.passengerId).find('.document_birthday_container').removeClass('half').addClass('full');
              }
              /* Two fields */
              if (passenger.flightPassenger.infant.emptyFields.indexOf('GENDER')!=-1 &&
                  passenger.flightPassenger.infant.emptyFields.indexOf('NATIONALITY')!=-1 &&
                  passenger.flightPassenger.infant.emptyFields.indexOf('BIRTHDAY')==-1) {
                $this.find('.passengers_info.'+passenger.flightPassenger.passengerId).find('.fieldset_body.'+passenger.flightPassenger.infant.passengerId).find('.document_gender').removeClass('quarter').addClass('half');
              $this.find('.passengers_info.'+passenger.flightPassenger.passengerId).find('.fieldset_body.'+passenger.flightPassenger.infant.passengerId).find('.document_nationality').removeClass('quarter').addClass('half');
              }
              if (passenger.flightPassenger.infant.emptyFields.indexOf('GENDER')!=-1 &&
                  passenger.flightPassenger.infant.emptyFields.indexOf('NATIONALITY')==-1 &&
                  passenger.flightPassenger.infant.emptyFields.indexOf('BIRTHDAY')!=-1) {
                $this.find('.passengers_info.'+passenger.flightPassenger.passengerId).find('.fieldset_body.'+passenger.flightPassenger.infant.passengerId).find('.document_gender').removeClass('quarter').addClass('half');
              }
              if (passenger.flightPassenger.infant.emptyFields.indexOf('GENDER')==-1 &&
                  passenger.flightPassenger.infant.emptyFields.indexOf('NATIONALITY')!=-1 &&
                  passenger.flightPassenger.infant.emptyFields.indexOf('BIRTHDAY')!=-1) {
                $this.find('.passengers_info.'+passenger.flightPassenger.passengerId).find('.fieldset_body.'+passenger.flightPassenger.infant.passengerId).find('.document_nationality').removeClass('quarter').addClass('half');
              }
            }
          }

          //Open or close passenger info if checked is true
          if (passenger.flightPassenger.checked && passenger.passenger.type.passengerType!='INFANT') {
            $this.find('.group_header').find('input[name="field_passenger.'+passenger.flightPassenger.passengerId+'"]').prop('checked', true);
            $this.find('.group_header').find('input[name="field_passenger.'+passenger.flightPassenger.passengerId+'"]').change();
            /* If passenger checked is true, half to seat button and half to cancel checkin */
            $this.find('.passengers_info.'+passenger.flightPassenger.passengerId).find('.document_seat').removeClass('quarter').addClass('full');
          }

          //Frequent flyer
          if (passenger.flightPassenger.frequentFlyer) {
            $this.find('.group_header').find('.field_frequent_flyer'+passenger.flightPassenger.passengerId).prop('checked', true);
          }

          /* How much passengers arent' INFANT */
          if (passenger.passenger.type.passengerType!='INFANT') {
            howMuch++;
          }
        });

        if (howMuch==1 && cardsNumber==0) {
          if (!$this.find('.group_header:first').find('input[type=checkbox]').prop('checked')) {
            $this.find('.group_header:first').find('input[type=checkbox]').prop('checked', true);
            $this.find('.group_header:first').find('input[type=checkbox]').change();
          }
        }

        /* Fill the data-last-flight attribute for age fields */
        self.element.find('.field[data-format=age]').attr('data-last-flight', self.checkinCache.lastFlightDeparture);

        /* Check if session object comes with destiny_address data to set in address select */
        if (self.checkinCache.destinyAddress) {
          var $addressFieldsetGeneric = self.element.find('fieldset.destiny_address');
          var optionsContent = '';
          $addressFieldsetGeneric.find('.destiny_address_select').removeClass('hidden').hide().fadeIn(300);
          $.each(self.checkinCache.destinyAddress, function(index, data){
            optionsContent = '<option value="'+index+'">'+lang('checkin.copy_data_from')+' "'+data.description+'"</option>';
            $addressFieldsetGeneric.find('.destiny_address_select').find('select').append(optionsContent);
          });
        }

        /* Action for main trigger of nationality */
        self.element.find('.passengers_info').find('.resident_country').find('select').on('change', function(){
          var $this = $(this);
          var passenger = $this.attr('data-passenger');
          var $toggleObject = self.element.find('fieldset.destiny_address.'+passenger);

          if ($this.val()!='US') {
            $toggleObject.find('.another_nationality.'+passenger).val('1');
            if ($toggleObject.css('display')=='none') {
              $toggleObject.fadeIn(300);
              $toggleObject.find('.toggle').attr('data-required', 'true').removeClass('valid filled');
              $toggleObject.find('.toggle').attr('data-init', 'restart');
              $toggleObject.closest('form').form('restartFields');
            }
          } else {
            $toggleObject.fadeOut(300);
            /* Empty text and select fields of address form */
            $toggleObject.find('.destiny_address_field').find('input').val('');
            $toggleObject.find('.destiny_address_zip').find('input').val('');
            $toggleObject.find('.destiny_address_city').find('input').val('');
            $toggleObject.find('.destiny_address_country').find('select option[value=""]').prop('selected', 'selected').change();
            $toggleObject.find('.destiny_address_state').find('select option[value=""]').prop('selected', 'selected').change();
            $toggleObject.find('.destiny_address_state_input').val('');
            $toggleObject.find('.another_nationality.'+passenger).val('0');
            $toggleObject.find('.destiny_address_select').find('select option[value=""]').prop('selected', 'selected').change();

            $toggleObject.find('.toggle').attr('data-required', 'false').removeClass('valid filled');
            $toggleObject.find('.toggle').attr('data-init', 'restart');
            $toggleObject.closest('form').form('restartFields');
          }
        });

        /* Actions for destiny address */
        var $addressFieldset = self.element.find('fieldset.destiny_address');
        $addressFieldset.find('.destiny_address_select').find('select').on('change', function(){
          var $this = $(this);
          var passenger = $this.attr('data-passenger');
          var $addressField = self.element.find('fieldset.destiny_address.'+passenger);
          var stateObject = 'input';
          if ($this.val().length>0) {
            stateObject = self.checkinCache.destinyAddress[$this.val()].destiny_address_country=='US'?'select':'input';
          }

          if ($this.val()!='') {
            if (typeof(self.checkinCache.destinyAddress[$this.val()])!="undefined") {
              $addressField.find('.destiny_address_field').find('input').val(self.checkinCache.destinyAddress[$this.val()].destiny_address_field);
              $addressField.find('.destiny_address_field').addClass('valid filled');
              $addressField.find('.destiny_address_zip').find('input').val(self.checkinCache.destinyAddress[$this.val()].destiny_address_zip);
              $addressField.find('.destiny_address_zip').addClass('valid filled');
              $addressField.find('.destiny_address_city').find('input').val(self.checkinCache.destinyAddress[$this.val()].destiny_address_city);
              $addressField.find('.destiny_address_city').addClass('valid filled');
              $addressField.find('.destiny_address_country').find('select option[value="'+self.checkinCache.destinyAddress[$this.val()].destiny_address_country+'"]').prop('selected', 'selected').change();
              if (stateObject=='select') {
                $addressField.find('.destiny_address_state').find('select option[value="'+self.checkinCache.destinyAddress[$this.val()].destiny_address_state+'"]').prop('selected', 'selected').change();
              } else {
                $addressField.find('.destiny_address_state').find('input').val(self.checkinCache.destinyAddress[$this.val()].destiny_address_state);
                $addressField.find('.destiny_address_state').addClass('valid filled');
              }
            }
          } else {
            $addressField.find('.destiny_address_field').find('input').val('');
            $addressField.find('.destiny_address_zip').find('input').val('');
            $addressField.find('.destiny_address_city').find('input').val('');
            $addressField.find('.destiny_address_country').find('select option[value=""]').prop('selected', 'selected').change();
            if (stateObject=='select') {
              $addressField.find('.destiny_address_state').find('select option[value=""]').prop('selected', 'selected').change();
            } else {
              $addressField.find('.destiny_address_state').find('input').val('');
            }
          }
          $addressField.find('.field').attr('data-init', 'restart');
          $addressField.closest('form').form('restartFields');
        });

        /* Prepare address for select */
        $addressFieldset.find('.toggle').find('input').blur(function(){
          self.checkAddAddress($(this));
        });
        self.element.find('.select_field.destiny_address_state').find('select').on('change', function(){
          self.checkAddAddress($(this));
        });

        /* Change action for country select */
        self.element.find('.select_field.destiny_address_country').find('select').on('change', function(){
          var $this = $(this);
          var passenger = $this.attr('data-passenger');
          var $addressFieldset = self.element.find('fieldset.destiny_address.'+passenger);

          if (self.checkinCache.address_countries.type=='CLASSIFY' && $this.val()=='US') {
            $addressFieldset.find('.select_field.destiny_address_state').removeClass('hidden');
            $addressFieldset.find('.select_field.destiny_address_state').attr('data-required', 'true').removeClass('valid filled');
            /* Fill select with states */
            /* De momento se carga como servicio en el inicio con valor US, si en un futuro
            hay listado de estados para otros países habrá que implementar la función de llamada al servicio pasando el countryCode */
            var selectOptions = '<option value=""></option>';
            $.each(self.checkinCache.address_countries.states, function(key, value) {
                selectOptions += '<option value="'+value.code+'">'+value.description+'</option>';
            });
            $addressFieldset.find('.select_field.destiny_address_state').find('select').html(selectOptions);
            $addressFieldset.find('.text_field.destiny_address_state').addClass('hidden');
            $addressFieldset.find('.text_field.destiny_address_state').attr('data-required', 'false').removeClass('valid filled');
            $addressFieldset.find('.text_field.destiny_address_state').find('input').val('');
          } else {
            $addressFieldset.find('.select_field.destiny_address_state').addClass('hidden');
            $addressFieldset.find('.select_field.destiny_address_state').attr('data-required', 'false').removeClass('valid filled');
            $addressFieldset.find('.select_field.destiny_address_state').find('select').val('');
            $addressFieldset.find('.text_field.destiny_address_state').removeClass('hidden');
            $addressFieldset.find('.text_field.destiny_address_state').attr('data-required', 'true').removeClass('valid filled');
          }
          $addressFieldset.find('.select_field.destiny_address_state').attr('data-init', 'restart');
          $addressFieldset.find('.text_field.destiny_address_state').attr('data-init', 'restart');
          $addressFieldset.closest('form').form('restartFields');
          self.checkAddAddress($(this));
        });

        self.checkCardsGeneration(cardsNumber);
      }

    },


    /* Check if append address to select of address destiny */
    checkAddAddress: function($object) {
      var self = this;
      var passenger = $object.closest('fieldset.destiny_address').attr('data-passenger');
      var $addressFieldset = self.element.find('fieldset.destiny_address.'+passenger);
      var $addressFieldsetGeneric = self.element.find('fieldset.destiny_address');
      var stateObject = $addressFieldset.find('.field.destiny_address_country').find('select').val()=='US'?'select':'input';

      if ($addressFieldset.find('.destiny_address_field').find('input').val().length>0 &&
          $addressFieldset.find('.destiny_address_zip').find('input').val().length>0 &&
          $addressFieldset.find('.destiny_address_city').find('input').val().length>0 &&
          $addressFieldset.find('.destiny_address_country').find('select').val().length>0 &&
          $addressFieldset.find('.destiny_address_state').find(stateObject).val().length>0) {
        var stateString = '';
        if (stateObject=='select') {
          stateString = $addressFieldset.find('.destiny_address_state').find('select option[value="'+$addressFieldset.find('.destiny_address_state').find('select').val()+'"]').html();
        } else {
          stateString = $addressFieldset.find('.destiny_address_state').find('input').val();
        }
        var countryString = $addressFieldset.find('.destiny_address_country').find('select option[value="'+$addressFieldset.find('.destiny_address_country').find('select').val()+'"]').html();
        var addressFinal = $addressFieldset.find('.destiny_address_field').find('input').val();
        addressFinal += ', '+$addressFieldset.find('.destiny_address_zip').find('input').val();
        addressFinal += ', '+$addressFieldset.find('.destiny_address_city').find('input').val();
        addressFinal += ' - '+stateString;
        addressFinal += ' / '+countryString;

        /* Searching for same values in object */
        var existsInArray = false;
        var elementIndex = 0;
        var eachObj = self.checkinCache.destinyAddress?self.checkinCache.destinyAddress:self.destinyAddressObject;
        $.each(eachObj, function(index, data){
          if (data.description.toLowerCase() === addressFinal.toLowerCase()) {
            existsInArray = true;
            return false;
          }
        });
        if (!existsInArray) {
          var destinyAddressObjectTemp = {
            'destiny_address_field': $addressFieldset.find('.field.destiny_address_field').find('input').val(),
            'destiny_address_zip': $addressFieldset.find('.field.destiny_address_zip').find('input').val(),
            'destiny_address_city': $addressFieldset.find('.field.destiny_address_city').find('input').val(),
            'destiny_address_country': $addressFieldset.find('.field.destiny_address_country').find('select').val(),
            'destiny_address_state': $addressFieldset.find('.field.destiny_address_state').find(stateObject).val(),
            'description': addressFinal,
            'passenger': passenger
          };
          if (typeof(self.checkinCache.destinyAddress)=='undefined') {
            self.checkinCache.destinyAddress = [];
          }
          elementIndex = self.checkinCache.destinyAddress.push(destinyAddressObjectTemp);

          /* Set addresses to checkinCache object */
          // self.checkinCache.destinyAddress = self.destinyAddressObject;

          var optionsContent = '';
          optionsContent += '<option value="'+(elementIndex-1)+'">'+lang('checkin.copy_data_from')+' "'+addressFinal+'"</option>';
          // $.each($addressFieldsetGeneric, function(index, data){
          //   var $this = $(this);
            // if ($this.attr('data-passenger')!=passenger) {
              $addressFieldsetGeneric.find('.destiny_address_select').find('select').append(optionsContent);
            // }
          // });
        }
        if ($addressFieldsetGeneric.find('.destiny_address_select option').length > 1 && $addressFieldsetGeneric.find('.destiny_address_select').hasClass('hidden')) {
          $addressFieldsetGeneric.find('.destiny_address_select').removeClass('hidden').hide().fadeIn(300);
        }
      }
    },

    /* Check number of cards will be generated and show/hide button */
    checkCardsGeneration: function(cardsNumber){
      var self = this;

      if (cardsNumber>0) {
        var pluralCards = cardsNumber>1?lang('checkin.cards'):lang('checkin.card');
        self.element.find('.submit.confirm').slideDown();
        self.element.find('.submit_button > button').removeAttr('disabled');
        self.element.find('.submit_button > button > span').html(lang('checkin.ok_cards')+' <strong>'+cardsNumber+' '+pluralCards+' '+lang('checkin.landing_cards')+'</strong>');
      } else {
        self.element.find('.submit.confirm').slideUp();
        self.element.find('.submit_button > button').attr('disabled', 'disabled');
      }
    },


    /* Show dangerous goods modal */
    showDangerousGoods: function() {
      var self = this;

      Bus.publish('ajax', 'getTemplate', {
        data: self.checkinCache['services'],
        path: eval('AirEuropaConfig.templates.checkin.dangerousgoods'),
        success: function(template) {

          /* Trace GTM */
          updateGtm({
             'mercado': window.market,
             'pageArea': 'Mis vuelos',
             'pageCategory': 'Checkin',
             'pageContent': 'Mercancias peligrosas'
          });

          /* Show call me back lightbox */
          $('#checkin').ui_dialog({
            title: lang('checkin.dangerousgoods_title'),
            subtitle: lang('checkin.dangerousgoods_subtitle'),
            xxl: true,
            aux_class: 'dangerousgoods',
            content: template,
            close: {
              behaviour: 'close',
              href: '#'
            },
            buttons: [
              {
                className: 'next',
                href: '#',
                label: lang('checkin.dangerousgoods_ok')
              }
            ],
            render: function($dialog) {
              var $form = $dialog.find('form');

              /* Buttons behaviour */
              $dialog.find('.next a').on('click', function(event) {
                event.preventDefault();
                $form.trigger('submit');
              });

              $dialog.find('label[for=accept_dangerous_goods]').html(lang('checkin.dangerousgoods_checkbox_label'));

              /* Form behaviour */
              $form.form({
                onError: function() {
                  $dialog.find('.articles_error').show();
                },
                onSubmit: function(form) {

                  /* Close dialog */
                  $dialog.find('.close_dialog').find('a').click();

                  /* Continue to passengers list */
                  self.continueToPassengersList();

                }
              });
            }
          });
        }
      });
    },

    showFormError: function($form) {
      var $content = this.element.find('.process_scroll');
      var $field = $form.find('.field.error').not('.disabled');

      /* Show the messages */
      $form.addClass('error');
      if ($form.find('.block_body .form_error').length == 0) {
        $form.find('.block_body').prepend('<div class="form_error"><div class="error_message"><p>' + lang('general.formError') + '</p></div></div>');
      }
      $form.find('.initial_status').not('.disabled').removeClass('initial_status');

      /* Scroll to the top of the form to show the error */
      Bus.publish('scroll', 'scrollTo', {element: $content.get(), position: $field.position().top});
    },

    /* Show field errors from passengers form */
    showFieldErrors: function($form, errors) {
      var self = this;
      var techMessage = '';

      $.each(errors, function(indexError, error) {
        /* Get type and index */
        var type = error.field.substr(0, error.field.indexOf('['));
        var index = error.field.substr(error.field.indexOf('[') + 1, 1);
        var field = error.field.substr(error.field.indexOf(']') + 2);

        /* Convert type and index */
        var passengerNumber;

        if (index) {
          passengerNumber = parseInt(index);
        }

        /* Generic technical warning */
        if (typeof type == 'undefined') {
          techMessage += ' / '+error.field+' > '+error.message;
        }
        else if (type == 'passengers' || type == 'frequentflyer') {
          /* Get fieldset and field */
          var $passengerFieldset = self.element.find('fieldset.passengers_info.opened').eq(passengerNumber);
          var $errorField = $passengerFieldset.find('[data-service-name="' + field + '"]').closest('.field');

          if (type == 'frequentflyer') {
            /* Check frequent flyer checkbox if not is opened */
            var $ffCheckbox = $passengerFieldset.find('.frequent_flyer_group').find('.field.checkbox').find('input[type=checkbox]');
            if (!$ffCheckbox.is(':checked')) {
              $ffCheckbox.prop('checked', true);
              $ffCheckbox.change();
            }
          }

          /* Show error and set message */
          $errorField.trigger('show_error', [error.message]);
          $errorField.addClass('error').removeClass('valid initial_status');

          /* Show form error */
          self.showFormError($form);
        }

      });

      if (techMessage.length > 0) {
        /* Show an error */
        $('#checkin').ui_dialog({
          title: lang('general.error_title'),
          error: true,
          subtitle: techMessage,
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
    },


    /* Remove server session object */
    removeServerSession: function(){
      var postSessionURL = getPostURL('checkin');
      var checkinSession = {};

      /* Post void checkoutSession object */
      Bus.publish('ajax', 'postJson', {
        path: postSessionURL,
        data: {checkin: checkinSession},
        success: function() {}
      });
    },


    /* Register layout */
    startRegisterAction: function(){
      var self = this;

      this.element.find('.launch-register').on('click', function (event) {
        var checkin = true;

        Bus.publish('process', 'show_register', {checkin: checkin});

        event.preventDefault();
      });
    },


    /* Add booking manually */
    startBookingAddAction: function() {
      var self = this;

      this.element.find('.add_booking').on('click', function (event) {
        event.preventDefault();

        /* Get the template */
        Bus.publish('ajax', 'getTemplate', {
          path: AirEuropaConfig.templates.loyalty_bookings.add_booking_dialog,
          success: function (template) {

            $('#checkin').ui_dialog({
              title: lang('general.add_booking'),
              error: false,
              close: {
                behaviour: 'close',
                href: '#'
              },
              content: template,
              buttons: [
                {
                  className: 'search',
                  href: '#',
                  label: lang('general.add_booking')
                }
              ],
              render: function ($dialog) {
                var $form = $dialog.find('form');
                var submitTrigged = false;

                /* Buttons behaviour */
                $dialog.find('.search a').on('click', function (event) {
                  event.preventDefault();
                  $form.trigger('submit');
                });

                /* Form behaviour */
                $form.form({
                  onSubmit: function (form) {

                    var locator = form.element.find('#add_booking_locator').val();
                    var surname = form.element.find('#add_booking_surname').val();
                    var userId = localStorage.ly_userId;

                    /* Call to add booking service */
                    Bus.publish('services', 'getExternalBooking', {
                      data: {
                        userId: userId,
                        surname: surname,
                        locator: locator
                      },
                      success: function (addBookingData) {
                        /* Get info from json */
                        var error = addBookingData.header.error;
                        var message = addBookingData.header.message;

                        if (error) {
                          $('#process').ui_dialog({
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
                        }
                        else {
                          /* Refresh bookings section (current) */
                          Bus.publish('process', 'show_checkin_step', {step: 'bookings'});
                          $dialog.find('.close a').click();
                        }
                      }
                    });
                  }
                });
              }
            });
          }
        });


      });
    },
     
    callToFrequentFlyerCheck: function ($passenger) {
        var self = this;
        var surnameField = $passenger.find('.surname');
        var frequentFlyerIdentityDiv = $passenger.find('.frequent_flyer_number');
        var frequentFlyerProgram = $passenger.find('.frequent_flyer_program option:selected').attr('value');
        var frequentFlyerIdentity = $passenger.find('.frequent_flyer_number input').val();
        var flyerData;
        var surname;

        if(surnameField.length > 0) {
          surname = surnameField.val();
        } else {
          surname = frequentFlyerIdentityDiv.attr('data-passenger-surname');
        }

        if (surname != '' && frequentFlyerProgram != '' && frequentFlyerIdentity != '') {
          flyerData = {
            surname: surname,
            frequentFlyerProgram: frequentFlyerProgram,
            frequentFlyerIdentity: frequentFlyerIdentity
          };

          /* Call AJAX module to get the json */
          Bus.publish('services', 'getFrequentFlyerCheckCheckin', {
            data: flyerData,
            success: function (data) {
              var message = data.header.message;

              if (data.header.error == true) {
                /* Update error hints */
                $passenger.find('.frequent_flyer_program').trigger('show_error', [message]);
                $passenger.find('.frequent_flyer_number').trigger('show_error', [message]);
                
                $passenger.find('.frequent_flyer_program').attr('data-format-error', message);
                $passenger.find('.frequent_flyer_number').attr('data-format-error', message);

                /* Set classes to show the error */
                $passenger.find('.frequent_flyer_program').addClass('error').removeClass('valid initial_status');
                $passenger.find('.frequent_flyer_number').addClass('error').removeClass('valid initial_status');
                
                
                //$passenger.find('.frequent_flyer_number').trigger('validate');
              }else {
                $passenger.find('.frequent_flyer_program').removeClass('error initial_status').addClass('valid');
                $passenger.find('.frequent_flyer_number').removeClass('error initial_status').addClass('valid');
                
                $passenger.find('.frequent_flyer_number').trigger('validate');
              }
            }
          });
        }
      },

      showNotificationsTwitterCheckin: function(){

        var divLoginTwitter = this.element.find('.twitter_sharing_checkin');
          
        //Data in JSImport to know if Twitter Social Login was already executed
        // If so, we do not show Social Login option and show notifications.
        // Same behaviour, if customer is already following AirEuropa Twitter account. 
        if(executed){

         var aliasTwitter = this.element.find('div.sharing_text .content_subtitle_twitter span.alias');
         aliasTwitter.html('@' + customerScreenName + ' ');
        //Data in JSImport
          if (following){

              divLoginTwitter.removeClass('step_one step_two');
              divLoginTwitter.addClass('step_three');             
          } else {
              divLoginTwitter.removeClass('step_one');
              divLoginTwitter.addClass('step_two');
          }
        }

          
      },

      listenTwitterButton: function(unbind){
        //paso 1 - login

        var buttonClicked = this.element.find('.content_button div.sharing_button.one button');

        if (typeof unbind !== 'undefined' && unbind === true) {
            buttonClicked.unbind('click');
        }
   
        buttonClicked.on('click', function (event) {
          event.preventDefault();

          Bus.publish('services', 'loginTwitterOAuthCheckin', {
                data: window.location.href,
                success: function (data) {

                    window.location.href = data.authURL;
                  
                }             
          });

        });
      },

      
    listenFollowUsTwitterButtom: function(unbind){

      var divLoginTwitter = this.element.find('.twitter_sharing_checkin');
      var buttonClicked = this.element.find('.content_button div.sharing_button.two button');
      var self = this;
      if (typeof unbind !== 'undefined' && unbind === true) {
         buttonClicked.unbind('click');
      }

      buttonClicked.on('click', function (event) {
        event.preventDefault();
            
            Bus.publish('services', 'followUsTwitterCheckin', {
                  success: function (data) {   

                    if (data === true){
                        
                        divLoginTwitter.removeClass('step_one step_two');
                        divLoginTwitter.addClass('step_three'); 
                      
                      }else{

                        /* Show popup error */
                        $('body').ui_dialog({
                          title: lang('general.error_title'),
                          error: true,
                          subtitle: lang('twitter.error_message'),
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
                        divLoginTwitter.removeClass('step_two step_three');
                        divLoginTwitter.addClass('step_one');
                        var aliasTwitter = self.element.find('div.sharing_text .content_subtitle_twitter span.alias');
                        aliasTwitter.html('');
                      }               
                  }             
            });
        });
    },


    listenNotificationsTwitterButtom: function(unbind){

      
      var divLoginTwitter = this.element.find('.twitter_sharing_checkin');
      var buttonClicked = this.element.find('.content_button div.sharing_button.three button');

      var self = this;

      if (typeof unbind !== 'undefined' && unbind === true) {
         buttonClicked.unbind('click');
      }

      buttonClicked.on('click', function (event) {
        event.preventDefault();

              //Check if customer is following @AirEuropa
              Bus.publish('services', 'followingUsTwitterCheckin', {
                success: function (data) {
  
                  if (data === true){
                      //Data in JSImport
                      following = data;

                      self.callNotificationsTwitter();  

                  }else{

                    /* Show popup info */
                    $('body').ui_dialog({
                      title: lang('general.info_error_title'),
                      error: false,
                      close:  {
                        behaviour: 'close',
                        href: '#'
                      },
                      subtitle: lang('twitter.info_follow_us_message'),
                      buttons: [
                        {
                          className: 'close',
                          href: '#',
                          label: lang('general.ok')
                        }
                      ]
                    });
                    divLoginTwitter.removeClass('step_one step_three');
                    divLoginTwitter.addClass('step_two');

                  }
                } 

              });  
      });
    },

  
    callNotificationsTwitter: function(){

      var self = this;

      var flightObject = {};

      flightObject['flightCode'] = self.checkinCache.selectedFlight.flightNumber;
      flightObject['departureDate'] = self.checkinCache.selectedFlight.departure.date;
      flightObject['arrivalDate'] = self.checkinCache.selectedFlight.arrival.date;
      flightObject['departureAirport'] = self.checkinCache.selectedFlight.departure.airport.code;
      flightObject['arrivalAirport'] = self.checkinCache.selectedFlight.arrival.airport.code;

      Bus.publish('services', 'notificationsTwitterCheckin', {
          data: flightObject,
          success: function (data) {
              
            if (data.statusCode === '200') {

             var buttonClicked = self.element.find('div.sharing_button');

              buttonClicked.hide();
            
            }else{

              /* Show popup error */
              $('body').ui_dialog({
                title: lang('general.error_title'),
                error: true,
                subtitle: lang('twitter.error_message'),
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
        
    },

      
      frequentFlyerCheck: function () {
          var self = this;

          this.element.find('.surname input').on('blur', function () {
            var $this = $(this);
            var $passenger = $this.closest('.passengers_info');

            if ($passenger.find('.frequent_flyer_group .group_header input').is(':checked')) {
              self.callToFrequentFlyerCheck($passenger);
            }
          });

          this.element.find('.frequent_flyer_program select').on('change', function () {
          var $this = $(this);
            var $passenger = $this.closest('.passengers_info');
            self.callToFrequentFlyerCheck($passenger);
          });

          this.element.find('.frequent_flyer_number input').on('blur', function () {
            var $this = $(this);
            var $passenger = $this.closest('.passengers_info');

            self.callToFrequentFlyerCheck($passenger);
          });
        }

  };
});
