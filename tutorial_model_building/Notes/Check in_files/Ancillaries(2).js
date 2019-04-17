Hydra.module.register('Ancillaries', function(Bus, Module, ErrorHandler, Api) {

  return {
    selector: '#ancillaries',
    element: undefined,
    ancillariesServiceObject: undefined,
    totalPrice: 0,
    seatMapCache: undefined,
    seatMapType: undefined,

    /* Ancillary cache */
    ancillaryCache: {},

    events: {
      'ancillaries': {
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

      if (this.element.length > 0) {
        /* Get ancillaries data */
        Bus.publish('process', 'get_ancillaries_data', {callback: function(ancillaryCache) {
          self.ancillaryCache = ancillaryCache;

          // console.log(self.ancillaryCache);
        }});

        /* Steps */
        this.initSteps();

        /* Control content height */
        this.setContentHeight();
        this.controlResize();

        /* Forms */
        this.listenChanges();
        this.initForm();
        this.paymentMethods();
        this.documentType();
        this.initFieldCardExpiration();
        this.cardExpirationActions();

        /* Seats map */
        this.composeSeatMap();

        /* Control prices */
        this.initControlPrices();

        /* Set tabindex for inputs and selects */
        this.setTabindex();

        this.creditCardCheck();
      }
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
    },

    /* Forms */

    listenChanges: function() {

      /* Selects */
      this.element.find('.field.select_field[data-add-ancillary=true] select').on('change', function() {
        var $this = $(this);
        var $ancillaryBlock = $this.closest('[data-ancillary-related]');

        /* Remove active class */
        $ancillaryBlock.removeClass('ancillary_active').closest('form').addClass('pristine');

        /* Find selects and set active class if one of them has value*/
        $ancillaryBlock.find('.field.select_field[data-add-ancillary=true] select').each(function() {
          var $this = $(this);
          var $counter = $ancillaryBlock.find('.field.counter_field[data-add-ancillary=true] input');

          /* Check if passenger element must be active */
          var isActive = false;
          if (($counter.length == 0 && $this.val() != '') || ($this.val() != '' && parseInt($counter.val()) > 0)) {
              isActive = true;
          }

          if (isActive) {
              $ancillaryBlock.addClass('ancillary_active').closest('form').removeClass('pristine');
          }

          if ($counter.length != 0) {
            /* Check if submit button must be visible */
            var isPristine = true;
            $ancillaryBlock.closest('form').find('.field.counter_field[data-add-ancillary=true] input').each(function() {
                var $this = $(this);
                $select = $this.closest('.field.select_field[data-add-ancillary=true] select');
                if ($select.val() != '' && parseInt($this.val()) > 0) {
                    isPristine = false;
                }
            });

            if (!isPristine) {
                $ancillaryBlock.closest('form').removeClass('pristine');
            }
          }
        });
      });

      /* Counter input */
      this.element.find('.field.counter_field[data-add-ancillary=true] input').on('change', function() {
        var $this = $(this);
        var $ancillaryBlock = $this.closest('[data-ancillary-related]');

        $ancillaryBlock.find('select').trigger('change');

        /* Remove active class */
        $ancillaryBlock.removeClass('ancillary_active').closest('form').addClass('pristine');

        /* Find selects and set active class if one of them has value*/
        $ancillaryBlock.find('.field.counter_field[data-add-ancillary=true] input').each(function() {
          var $this = $(this);
          var $counter = $ancillaryBlock.find('.field.counter_field[data-add-ancillary=true] input');

          /* Check if passenger element must be active */
          var isActive = false;
          if (($counter.length == 0 && $this.val() != '') || ($this.val() != '' && parseInt($counter.val()) > 0)) {
              isActive = true;
          }

          if (isActive) {
              $ancillaryBlock.addClass('ancillary_active').closest('form').removeClass('pristine');
          }

          if ($counter.length != 0) {
            /* Check if submit button must be visible */
            var isPristine = true;
            $ancillaryBlock.closest('form').find('.field.counter_field[data-add-ancillary=true] input').each(function() {
                var $this = $(this);
                $select = $this.closest('.field.select_field[data-add-ancillary=true] select');
                if ($select.val() != '' && parseInt($this.val()) > 0) {
                    isPristine = false;
                }
            });

            if (!isPristine) {
                $ancillaryBlock.closest('form').removeClass('pristine');
            }
          }
        });
      });

    },

    initSteps: function() {
      var self = this;
      var step = this.element.find('.process_step').attr('data-step');
      var $seatFieldOpener = self.element.find('.seat_field');
      var breakEach = false;

      this.element.find('.process_scroll').steps();

      /* Check session object for active seat selection */
      if (step == 'seats' || step == 'premium_seats') {
        $.each(self.ancillaryCache.ancillary.passengerSeats, function(indexPax, dataPax){
          $.each(dataPax.reservedSeats, function(indexSeat, dataSeat){
            if (dataSeat.active) {
              breakEach = true;
              return false;
            }
          });
          if (breakEach) return false;
        });
        /* If there is an active seat choice, activate this ancillary */
        if (breakEach) $seatFieldOpener.closest('[data-ancillary-related]').addClass('ancillary_active').closest('form').removeClass('pristine');
      }
    },

    initForm: function() {
      var self = this;

      this.element.find('form').form({
        onSubmit: function(form) {
          var nextStep = form.element.closest('.process_step').attr('data-next');
          var step = self.element.attr('class');
          var postObject = {};
          var sessionId = self.element.find('.process_step').attr('data-sessionId');
          var $ancillaryActive = self.element.find('.ancillary_active[data-ancillary-related]');
          var sendPost = true;

          /* Check if there's any active ancillary to execute the submit */
          if (step == 'luggage' && $ancillaryActive.length == 0) {
            sendPost = false;
          }
          if (step == 'seats' && $ancillaryActive.length == 0) {
            sendPost = false;
          }
          if (step == 'premium_seats' && $ancillaryActive.length == 0) {
            sendPost = false;
          }

          if (sendPost) {
            /* Start widget animation */
            self.element.find('.process_scroll').steps('showLoading', function() {

              // console.log("DEBE MANDAR EL POST?" + sendPost);
              // console.log("EL PRECIO A PAGAR SON: " + self.totalPrice);

              /* Add form info to ancillaries cache object */
              self.addFormData(step, form.element);

              if (sendPost) {
                self.addServiceData(step, function(goToNextStep, message, errors) {
                  /* Go to next step */
                  if (goToNextStep) {
                    /* Set the status bar as completed */
                    self.element.find('.ancillaries_status .steps .' + step).addClass('completed');

                    if (self.element.closest('.process_page').hasClass('seats')) {
                      var ancillariesSeatsProcessURL = getProcessUrl('ancillaries_seats');
                      Bus.publish('hash', 'change', {hash: ancillariesSeatsProcessURL + '/' + nextStep });
                    }
                    else if (self.element.closest('.process_page').hasClass('luggage')) {
                      var ancillariesLuggageProcessURL = getProcessUrl('ancillaries_luggage');
                      Bus.publish('hash', 'change', {hash: ancillariesLuggageProcessURL + '/' + nextStep });
                    }
                    else if (self.element.closest('.process_page').hasClass('premium_seats')) {
                      var ancillariesPremiumSeatsProcessURL = getProcessUrl('ancillaries_premium');
                      Bus.publish('hash', 'change', {hash: ancillariesPremiumSeatsProcessURL + '/' + nextStep });
                    }
                  }
                  /* Show an error */
                  else {
                    $('#ancillaries').ui_dialog({
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

                    self.element.find('.process_scroll').steps('showErrors');
                  }
                });
              }

            });
          }
        }
      });
    },

    addFormData: function(step, $form) {
      var self = this;
      var postObject = {};

      /* Get the data from the user form */
      userData = $form.serializeObject();

      /* Seats data to session object */
      if (step == 'seats' || step == 'premium_seats') {
        $.each(userData.passengers, function(index, data){
          if(self.ancillaryCache.ancillary.passengerSeats[index]){
            self.ancillaryCache.ancillary.passengerSeats[index].reservedSeats = [];
            if (data.seats.ow) {
              var objectToPush = {
                column: data.seats.ow.column,
                number: data.seats.ow.number,
                segmentId: data.seats.ow.segment,
                premiumEconomy: data.seats.ow.type=='premium'?true:false,
                active: data.seats.ow.active=='true'?true:false
              }
              self.ancillaryCache.ancillary.passengerSeats[index].reservedSeats.push(objectToPush);
            }
            if (data.seats.rt) {
              var objectToPush = {
                column: data.seats.rt.column,
                number: data.seats.rt.number,
                segmentId: data.seats.rt.segment,
                premiumEconomy: data.seats.rt.type=='premium'?true:false,
                active: data.seats.rt.active=='true'?true:false
              }
              self.ancillaryCache.ancillary.passengerSeats[index].reservedSeats.push(objectToPush);
            }
          }
        });
      }

      if (step === 'luggage') {
        this.ancillaryCache.passengers = userData.passengers;
      }

      /* Payment data */
      if (step == 'payment') {
        /* Force credit card to 1, since it's the only available method */
        userData.payment.credit_card = 1;

        this.ancillaryCache.payment = userData.payment;
      }
    },

    addServiceData: function(step, callback) {
      var self = this;
      var sessionId = self.element.find('.process_step').attr('data-sessionId');
      var postObject = {};
      var postSessionURL = getPostURL('ancillaries_luggage');

      /* Submit depending on the step */
      if (step == 'luggage') {
        postObject = self.composeAncillariesObject();

        /* Post config object to the service */
        Bus.publish('services', 'postExtraLuggage', {
          postObject: postObject,
          sessionId: sessionId,
          success: function(data) {
            var goToNextStep = !(data.header.error == true);
            var message = data.header.message;

            /* Save payment methods in ancillaryCache object */
            if (goToNextStep) {
              self.ancillaryCache['passengerRelated'] = postObject;
              self.ancillaryCache['totalPrice'] = self.totalPrice;
            }

            // console.log(postObject);

            Bus.publish('ajax', 'postJson', {
              path: postSessionURL,
              data: {ancillary: self.ancillaryCache},
              success: function() {
                callback(goToNextStep, message, undefined);
              },
              failure: function() {
                /* Session error */
                $('#ancillaries').ui_dialog({
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
        });
      }
      if (step == 'seats' || step == 'premium_seats') {

        self.ancillaryCache['passengerRelated'] = true;
        self.ancillaryCache['totalPrice'] = self.totalPrice;

        // console.log(self.ancillaryCache);

        Bus.publish('ajax', 'postJson', {
          path: postSessionURL,
          data: {ancillary: self.ancillaryCache},
          success: function() {
            callback(true, undefined, undefined);
          },
          failure: function() {
            /* Session error */
            $('#ancillaries').ui_dialog({
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
      else if (step == 'payment') {
        /* Post extra payment */
        Bus.publish('services', 'postExtraPayment', {
          ancillarySession: self.ancillaryCache,
          sessionId: self.element.find('.process_step').attr('data-sessionId'),
          mode: self.ancillaryCache.mode,
          success: function(data) {
            var goToNextStep = !(data.header.error == true);
            var message = data.header.message;

            /* Save booking data */
            if (goToNextStep) {
              self.ancillaryCache['ancillary_paid'] = true
            }else if (data.header.code === 406){
              /* TGM error seats */
              updateGtm({
                 'mercado': window.market,
                 'pageArea': 'Mis vuelos',
                 'pageCategory': 'Ancillaries asientos',
                 'pageContent': 'Error_'+ data.header.code + '. Error al realizar el cobro. ' + self.ancillaryCache.mode
              });
            }

            callback(goToNextStep, message, undefined);
          }
        });
      }
    },

    paymentMethods: function() {
      /* Show card name field when card holder is not a passenger (value == 'other') */
      this.element.find('.card_holder select').on('change', function() {
        var $this = $(this);
        var $option = $this.find('option:selected');
        var value = $option.attr('value');
        var $cardName = $this.closest('.group_body').find('.card_name');

        if (value == 'other') {
          $cardName.find('input').val('');
          $cardName.attr('data-required', 'true');
          $cardName.attr('data-init', 'restart').removeClass('valid filled');
          $cardName.slideDown(300);

          /* Reassign forms to validate the added fields */
          $cardName.closest('form').form('restartFields');

        }
        else {
          $cardName.slideUp(300, function() {
            $cardName.find('input').val('');
            $cardName.attr('data-required', 'false');
            $cardName.attr('data-init', 'restart');

            /* Reassign forms to validate the added fields */
            $cardName.closest('form').form('restartFields');

          });
        }
      });

      /* Trigger change in the first load */
      if (this.element.find('.card_holder select option:selected').attr('value') != '') {
        this.element.find('.card_holder select').trigger('change');
      }
    },

    initFieldCardExpiration: function () {
      var cadenameses = '';
      var cadenaanyos = '';
      var currentyear = (new Date).getFullYear();
      var iaux = '';
      var jaux = '';

      cadenaanyos = '<option value=""></option>';
      cadenameses = '<option value=""></option>';

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
        var valyearaux = i % 100;
        if(valyearaux < 10 ){
          valyearaux = "0" + valyearaux;
        }

        cadenaanyos = cadenaanyos + '<option value="' + valyearaux + '">' + i + '</option>';
      };

      $(".card_month_input").html(cadenameses);
      $(".card_year_input").html(cadenaanyos);

      // update combos if date is set
      var idsnecesariosc = $(".expirationremember");
      idsnecesariosc.each(function(){
        if($(this).val() != ""){
          var targetId  = $(this).attr("id");
          var dateParts = $("#"+targetId).val().split("/");

          $('.' + targetId + '.card_year_input').val(dateParts[1]).trigger('change', [true]);
          $('.' + targetId + '.card_month_input').val(dateParts[0]).trigger('change', [true]);
        };
      });
    },

    cardExpirationActions: function () {
      $(".date_card_expiration_input").change(function(){
        var inputtarget = $(this).attr("data-input-target");

        // reset value of the hidden date input
        $("#"+inputtarget).val("");

        var today      = new Date();
        var todayMonth = today.getMonth()+1;
        var todayYear  = today.getFullYear();

        var monthValue = $("." + inputtarget + ".card_expirationmonth").val();
        var yearValue  = $("." + inputtarget + ".card_expirationyear").val();

        if (monthValue != "" && yearValue != "") {
          // set and validate hidden date input
          var finaldate = monthValue + "/" + yearValue;

          $("#" + inputtarget).val(finaldate);
          $("#" + inputtarget).closest(".document_expiration").trigger('validate');
          $("#" + inputtarget).focus();

          // set/unset error class to all date combos
          if ($("#" + inputtarget).closest(".document_expiration").hasClass("error")) {
            $("." + inputtarget).closest('.select_field').addClass("errorper");
          } else {
            $("." + inputtarget).closest('.select_field').removeClass("errorper");

            /* Focus current element */
            $(this).focus();
          }
        }
      });
    },

    documentType: function() {
      var $documentBlocks = this.element.find('.document_block');
      var self = this;

      $documentBlocks.each(function() {
        var $this = $(this);
        var $type = $this.find('.document_type');
        var $number = $this.find('.document_number');

        /* Document type change event, depending on which document type the user selects we have to apply different rules */
        $type.find('select').on('change', function() {

          /* Get select value and text */
          var $select = $(this);
          var $option = $select.find('option:selected');
          var value = $option.attr('value');

          /* Passport */
          if (value == 'PP') {
            /* Required status */
            $number.attr('data-required', 'true').removeClass('valid filled');

            /* Format status */
            $number.attr('data-format', 'passport');
          }

          /* DNI / Congress */
          else if (value == 'NI' || value == 'GR') {
            /* Required status */
            $number.attr('data-required', 'true').removeClass('valid filled');

            /* Format status */
            $number.attr('data-format', 'dni');
          }

          /* European ID / NIE */
          else if (value == 'DL' || value == 'ID') {
            /* Required status */
            $number.attr('data-required', 'true').removeClass('valid filled');

            /* Format status */
            $number.removeAttr('data-format');
          }

          /* Under 14, no ID */
          else if (value == 'MN') {
            /* Required status */
            $number.attr('data-required', 'false');
            /* Format status */
            $number.removeAttr('data-format');
          }

          /* Restart fields */
          $number.attr('data-init', 'restart');

          /* Reassign forms to validate the added fields */
          $select.closest('form').form('restartFields');

        });
      });
    },

    /* Seats map */

    composeSeatMap: function() {
      var self = this;

      this.element.find('.seat_field .field_wrapper a').on('click', function(event) {
        event.preventDefault();

        var $this = $(this);
        var sessionId = self.element.find('.process_step').attr('data-sessionId');
        var segment = $this.closest('.seat_field').attr('data-segment');
        var passenger = $this.closest('.check_group').attr('data-passenger');
        var type = $(self.selector).hasClass('premium_seats')?'premium':'seats';

        /* Add loading class to the button */
        $this.addClass('loading');

        /* Add class focused to this field */
        $this.closest('.seat_field').addClass('focused');

        /* Call AJAX module to get the json with plane structure */
        Bus.publish('services', 'getExtraSeatMap', {
          data: {
            sessionId: sessionId,
            segment: segment,
            passenger: passenger
          },
          type: type,
          success: function(data) {
            if (!data.header.error) {
              data = data.body.data;

              data.flightATR = (data.aircraftType.model === 'ATR');
              data.flightATRMessage = '';
              if (data.flightATR)
                data.flightATRMessage = lang('message_flight_ATR');

              /* Get the template */
              Bus.publish('ajax', 'getTemplate', {
                path: AirEuropaConfig.templates.ancillaries.plane,
                success: function(template) {
                  var $html = template(data);

                  /* Remove loading class */
                  $this.removeClass('loading');

                  self.element.append($html);
                  self.seatMapCache = data;
                  self.seatMapType = type;
                  self.initSeatsMap();

                  /* TGM seats */
                  updateGtm({
                     'mercado': window.market,
                     'pageArea': 'Mis vuelos',
                     'pageCategory': 'Ancillaries asientos',
                     'pageContent': 'Mapa selección de asientos '+ ((type == 'premium') ? 'PE': '')
                  });

                }
              });

            }
            else {
              /* Remove loading class */
              $this.removeClass('loading');

              /* Show an error */
              $('#ancillaries').ui_dialog({
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

      });
    },

    initSeatsMap: function() {
      var $seatsMapOverlay = this.element.find('.seats_map_overlay');
      var $seatsMapsWrapper = $seatsMapOverlay.find('.seats_map_wrapper');
      var $seatsMap = $seatsMapsWrapper.find('.seats_map');
      var $seatsTableWrapper = $seatsMapsWrapper.find('.seats_table_wrapper');
      var $seatsTable = $seatsMapsWrapper.find('.seats_table');
      var $gradientLeft = $seatsMapsWrapper.find('.gradient_left');

      /* Hide the overlay sending it outside viewport */
      $seatsMapOverlay.addClass('hidden').show();

      /* add prmium class if needed */
      if (typeof this.seatMapType != 'undefined' && this.seatMapType == 'premium') {
        $seatsMapsWrapper.addClass('premium');
      }

      /* Set height and position */
      $seatsMapsWrapper.css({
        'height': $seatsMap.outerHeight(true),
        'margin-top': ($seatsMap.outerHeight(true) / 2) * -1
      });

      /* Set width according to the plane size */
      $seatsTable.css('width', $seatsTable.outerWidth());
      $seatsTableWrapper.css('width', 'auto');

      /* Set selected seats for the same flight */
      var idFlight = this.element.find('.seat_field.focused').attr('data-id-flight');
      var currentValue = this.element.find('.seat_field.focused').find('input.seat_number_selected').val() + '-' + this.element.find('.seat_field.focused').find('input.seat_column_selected').val();
      this.element.find('.extra_options.seats .seat_field[data-id-flight=' + idFlight + ']').each(function() {
        var $seatField = $(this);
        var selectedSeat = $seatField.find('input.seat_number_selected').val() + '-' + $seatField.find('input.seat_column_selected').val();

        if (selectedSeat != '-') {
          if (selectedSeat == currentValue) {
            $seatsTable.find('.seat.' + selectedSeat).removeClass('occupied').addClass('current_selected');
            /* Move seats slide to passenger seat */
            $gradientLeft.show();
            var seatPosition = $seatsTable.find('.seat.'+selectedSeat).closest('.column.column_seats').position();
            var newPosition = (-1 * (parseInt(seatPosition.left)/2));
            $seatsTable.animate({
              'left': newPosition
            }, 300);
          }
          else {
            $seatsTable.find('.seat.' + selectedSeat).addClass('selected');
          }
        }
      });

      /* Init seat events */
      this.seatEvents();

      /* Get prices */
      var xlPrice = this.getPrices('EXTRASIZE');
      var exitPrice = this.getPrices('EMERGENCY');
      var babiesPrice = this.getPrices('SUITABLE_ADULT_WITH_INFANT');
      var normalPrice = this.getPrices('NORMAL');
      var premiumPrice = this.getPrices('PREMIUM');

      /* Add prices to legend */
      if ($seatsTable.hasClass('must_choose_infant_seat')) {
        if (!babiesPrice) {
          babiesPrice = {};
          babiesPrice.amount = normalPrice.amount;
          babiesPrice.currencyCode = normalPrice.currencyCode;
          if ($seatsMapsWrapper.hasClass('premium')) {
            babiesPrice.amount = premiumPrice.amount;
            babiesPrice.currencyCode = premiumPrice.currencyCode;
          }
        }
        $seatsMapsWrapper.find('.legend .babies').attr('data-value', babiesPrice.amount).removeClass('hidden').find('span').append(" " + formatCurrency(babiesPrice.amount) + " " + babiesPrice.currencyCode);
      }
      else {
        if (xlPrice) $seatsMapsWrapper.find('.legend .xl').removeClass('hidden').find('span').append(" " + formatCurrency(xlPrice.amount) + " " + xlPrice.currencyCode);
        if (exitPrice) $seatsMapsWrapper.find('.legend .exit').removeClass('hidden').find('span').append(" " + formatCurrency(exitPrice.amount) + " " + exitPrice.currencyCode);
        if (babiesPrice) $seatsMapsWrapper.find('.legend .babies').removeClass('hidden').find('span').append(" " + formatCurrency(babiesPrice.amount) + " " + babiesPrice.currencyCode);
        if (normalPrice) $seatsMapsWrapper.find('.legend .normal').removeClass('hidden').find('span').append(" " + formatCurrency(normalPrice.amount) + " " + normalPrice.currencyCode);
        if (premiumPrice) $seatsMapsWrapper.find('.legend .premium').removeClass('hidden').find('span').append(" " + formatCurrency(premiumPrice.amount) + " " + premiumPrice.currencyCode);
      }

      /* Init arrows events */
      this.seatsMapArrows();

      /* Show overlay */
      $seatsMapOverlay.removeClass('hidden');
    },

    getPrices: function(type) {
      var price = false;
      var breakEach = false;

      $.each(this.seatMapCache.map, function(idRow, row) {
        $.each(row, function(idSeat, seat) {
          if (seat.type == "SEAT" && seat.priceSeat && seat.priceSeat.priceSeatType == type && seat.occupation !== "OCCUPIED") {
            price = {
              amount: seat.priceSeat.price.amount,
              currencyCode: seat.priceSeat.price.currency.code,
              currencyDescription: seat.priceSeat.price.currency.description
            };

            /* Break the each */
            breakEach = true;

            /* Break current each */
            return false;
          }
        });

        if (breakEach) return false;
      });

      return price;
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
      var sessionId = this.element.find('.process_step').attr('data-sessionId');
      var segment = $seatFieldOpener.attr('data-segment');
      var passenger = $seatFieldOpener.closest('.check_group').attr('data-passenger');
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
          if ($this.hasClass('current_selected')) {
            /* Set as current selected */
            // $this.removeClass('current_selected');
            $seatsTable.find('.current_selected').removeClass('current_selected').removeClass('occupied');
            /* Assign number and column to temp fields in opener */
            self.element.find('.seat_field.focused').find('input.seat_number_temp').val('');
            self.element.find('.seat_field.focused').find('input.seat_column_temp').val('');
          }
          else {
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

        /* If it's a selected seat, check if it wasn't selected before and call the service to validate it */
        if ($selectedSeat.length > 0) {
          /* Add loading class to the button */
          $this.addClass('loading');

          /* Get current number and column */
          var number = $selectedSeat.attr('data-number');
          var column = $selectedSeat.attr('data-column');
          var price = $selectedSeat.attr('data-price');
          var currency = {
            code: $selectedSeat.attr('data-price-currency'),
            description: $selectedSeat.attr('data-price-currency-description')
          };

          /* If there's a different seat selected, call to service */
          if (number != lastNumber || column != lastColumn) {
            /* Call putSeat service */
            Bus.publish('services', 'putExtraSeat', {
              data: {
                sessionId: sessionId,
                segment: segment,
                passenger: passenger,
                number: number,
                column: column
              },
              type: $(self.selector).hasClass('premium_seats')?'premium':'seats',
              success: function(data) {
                var message = data.header.message;

                if (data.header.code == 200 || data.header.code == 3112) {
                  /* Pass the temp vars to current selected */
                  $seatFieldOpenerNumber.val(number);
                  $seatFieldOpenerColumns.val(column);

                  /* Update the selected_value text for this seat and set it to filled status */
                  $seatFieldOpener.addClass('filled');
                  $selectedValuePlaceholder.html('<em>' + lang('general.seat') + ':</em>' + number + column);

                  /* Activate this ancillary */
                  $seatFieldOpener.closest('[data-ancillary-related]').addClass('ancillary_active').closest('form').removeClass('pristine');

                  /* Set the price for this seat */
                  $seatFieldOpener.attr('data-price', price);
                  $seatFieldOpener.attr('data-price-currency', currency.code),
                  $seatFieldOpener.attr('data-price-currency-description', currency.description);

                  /* Update total price */
                  var allPassengersPrice = 0;
                  self.element.find('.seat_field[data-add-ancillary=true]').each(function() {
                    var $this = $(this);
                    // console.log($this);
                    // console.log("El data price:");
                    // console.log($this.attr('data-price'))
                    var thisPrice =  parseInt($this.attr('data-price') || 0);
                    // console.log("El precio de este asiento es: " + thisPrice)

                    allPassengersPrice += thisPrice;
                  });


                  // console.log("El precio total es: " + allPassengersPrice)
                  self.totalPrice = allPassengersPrice;

                  if (data.header.code === 3112) {
                    self.removeChildrenSeats(data, price, currency);
                  }

                }
                /* Show the error if needed */
                else {
                  $('#checkout').ui_dialog({
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

                /* Close the map */
                $seatsMapOverlay.find('.close_seats_map a').trigger('click');

              }
            });
          }
        }

        /* If it's not a current selected seat, but it was one before, call the delete seat service */
        else {
          /* If there was a seat selected, call to delete service */
          if (lastNumber != '' || lastColumn != '') {
            /* Add loading class to the button */
            $this.addClass('loading');

            /* Call deleteSeat service */
            Bus.publish('services', 'deleteExtraSeat', {
              data: {
                sessionId: sessionId,
                segment: segment,
                passenger: passenger
              },
              type: $(self.selector).hasClass('premium_seats')?'premium':'seats',
              success: function(data) {
                // console.log(data)

                var message = data.header.message;

                if (data.header.code == 200) {
                  /* Delete temp vars and current selected */
                  $seatFieldOpenerNumber.val('');
                  $seatFieldOpenerColumns.val('');
                  $seatFieldOpener.find('input.seat_number_temp').val('');
                  $seatFieldOpener.find('input.seat_column_temp').val('');

                  /* Clean the selected_value text for this seat and clean filled status */
                  $seatFieldOpener.removeClass('filled');
                  $selectedValuePlaceholder.text('');

                  /* Deactivate this ancillary */
                  if($seatFieldOpener.closest('.passengers_info').find('.seat_field.filled').length ==0){
                    $seatFieldOpener.closest('[data-ancillary-related]').removeClass('ancillary_active').closest('form').addClass('pristine');
                  }

                  /* Set the price for this seat */
                  $seatFieldOpener.attr('data-price', '');
                  $seatFieldOpener.attr('data-price-currency', ''),
                  $seatFieldOpener.attr('data-price-currency-description', '');

                  /* Update total price */
                  var allPassengersPrice = 0;
                  self.element.find('.seat_field[data-add-ancillary=true]').each(function() {
                    var $this = $(this);
                    // console.log($this);
                    // console.log("El data price:");
                    // console.log($this.attr('data-price'))
                    var thisPrice =  parseInt($this.attr('data-price') || 0);
                    // console.log("El precio de este asiento es: " + thisPrice)

                    allPassengersPrice += thisPrice;
                  });

                  // console.log("El precio total es: " + allPassengersPrice)
                  self.totalPrice = allPassengersPrice;

                }
                /* Show the error if needed */
                else {
                  $('#checkout').ui_dialog({
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

                /* Close the map */
                $seatsMapOverlay.find('.close_seats_map a').trigger('click');
              }
            });
          }
        }
      });

    },

    /* Remove children seats when 3112 error code happens */
    removeChildrenSeats: function(data, price, currency) {
      var self = this;
      var message = '';

      $.each(data.body.data, function(indexError, dataError){
        var passenger = dataError.passengerId;
        var $seatFieldError = self.element.find('.check_group[data-passenger='+passenger+']');
        var $seatFieldErrorNumber = $seatFieldError.find('input.seat_number_selected');
        var $seatFieldErrorColumns = $seatFieldError.find('input.seat_column_selected');
        var $seatFieldErrorNumberTemp = $seatFieldError.find('input.seat_number_temp');
        var $seatFieldErrorColumnsTemp = $seatFieldError.find('input.seat_column_temp');
        var $selectedValueErrorPlaceholder = $seatFieldError.find('.selected_value');

        /* Remove child seat */
        $seatFieldErrorNumber.val('');
        $seatFieldErrorColumns.val('');
        $seatFieldErrorNumberTemp.val('');
        $seatFieldErrorColumnsTemp.val('');

        /* Update the selected_value text for this seat and set it to filled status */
        $seatFieldError.find('.field.seat_field').removeClass('filled');
        $selectedValueErrorPlaceholder.html('');

        /* Activate this ancillary */

        if($seatFieldOpener.closest('.passengers_info').find('.seat_field.filled').length ==0){
          $seatFieldOpener.closest('[data-ancillary-related]').removeClass('ancillary_active').closest('form').addClass('pristine');
        }

        /* Set the price for this seat */
        $seatFieldError.attr('data-price', price);
        $seatFieldError.attr('data-price-currency', currency.code),
        $seatFieldError.attr('data-price-currency-description', currency.description);

        /* Update total price */
        var allPassengersPrice = 0;
        self.element.find('.seat_field[data-add-ancillary=true]').each(function() {
          var $this = $(this);
          var thisPrice =  parseInt($this.attr('data-price') || 0);
          allPassengersPrice -= thisPrice;
        });

        self.totalPrice = allPassengersPrice;

        message += dataError.message+'\n';
      });

      /* Shows first index of info message */
      $('#ancillaries').ui_dialog({
        title: lang('general.info_error_title'),
        template: '',
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


    /* Control prices */

    initControlPrices: function() {
      var self = this;

      /* Each .extra_options fieldset */
      this.element.find('.extra_options').each(function() {
        var $fieldset = $(this);
        var $select = $fieldset.find('.select_field[data-add-ancillary=true] select');
        var $counter = $fieldset.find('.counter_field[data-add-ancillary=true] input');
        var $form = $fieldset.closest('form');

        /* Select behaviour */
        $select.on('change', function(event) {

          var allPassengersPrice = 0;

          /* Reset extra counters */
          $fieldset.find('.extra_inputs input').val('0');

          /* Add counter to each field */
          $fieldset.find('.select_field[data-add-ancillary=true]').each(function() {
            var $field = $(this);
            var number;
            var value = $field.find('select option:selected').attr('value');
            var totalPrice = 0;

            /* Figure out the number with the counter or an attribute */
            if ($field.closest('.counter_select_group_body').find('.input_counter').length > 0) {
              number = parseInt($field.closest('.counter_select_group_body').find('.input_counter').val());
            }
            else if ($field.attr('data-number') != undefined) {
              number = parseInt($field.attr('data-number'));
            }
            else {
              number = 0;
            }

            if (value != '') {
              for (i = 1; i <= number; i++) {
                /* Update the input controller value */
                var $input = $fieldset.find('.extra_inputs input.' + value + '_' + i);
                var currentValue = parseInt($input.val());
                var newValue = currentValue + 1;
                $input.val(newValue);

                /* Update the price per row */
                var price = parseFloat($input.attr('data-price'));
                totalPrice += price;
              }

              /* Update passenger price */
              $field.closest('.counter_select_group').find('.total_counter strong').html(formatCurrency(totalPrice));

              /* Update total price for input submit */
              allPassengersPrice += totalPrice;
            }
          });

          self.totalPrice = allPassengersPrice;
          self.element.find('.submit_button button strong').html(formatCurrency(allPassengersPrice));
        });

        /* Counter behaviour */
        $counter.on('change', function(event) {
          var $input = $(this);
          var $select = $input.closest('.counter_select_group_body').find('.select_field select');

          $select.trigger('change');

          var allPassengersPrice = 0;

          /* Reset extra counters */
          $fieldset.find('.extra_inputs input').val('0');

          /* Add counter to each field */
          $fieldset.find('[data-add-ancillary=true]').each(function() {
            var $field = $(this);
            var number;
            var value = $field.attr('data-segment-type');
            var passengerType = $field.attr('data-passenger-type');
            var frequentFlyerLevel = $field.attr('data-frequentflyer-level');
            var totalPrice = 0;

            /* Figure out the number with the counter or an attribute */
            if ($field.closest('.counter_select_group_body').find('.input_counter').length > 0) {
              number = parseInt($field.find('.input_counter').val());
            } else if ($field.attr('data-number') != undefined) {
              number = parseInt($field.attr('data-number'));
            } else {
              number = 0;
            }

            for (i = 1; i <= number; i++) {
              /* Update the input controller value */
              var $input = $fieldset.find('.extra_inputs input.'+ value +'_'+ passengerType +'_'+ i);

              /* Check if passenger is ELITE_PLUS */
              if (typeof frequentFlyerLevel !== "undefined" && frequentFlyerLevel === "ELITE_PLUS") {
                $input = $fieldset.find('.extra_inputs input.' + value + '_ELITE_PLUS_' + i);
              }

              var currentValue = parseInt($input.val());
              var newValue = currentValue + 1;
              $input.val(newValue);

              /* Update the price per row */
              var price = parseFloat($input.attr('data-price'));
              totalPrice += price;
            }

            /* Update passenger price */
            $field.closest('.counter_select_group').find('.total_counter strong').html(formatCurrency(totalPrice));

            /* Update total price for input submit */
            allPassengersPrice += totalPrice;
          });

          self.totalPrice = allPassengersPrice;
          self.element.find('.submit_button button strong').html(formatCurrency(allPassengersPrice));
        });

        /* Trigger change for first time */
        $select.trigger('change');
      });
    },

    /* Send ancillaries */

    composeAncillariesObject: function() {
      var postObject = {};
      var self = this;

      this.element.find('.ancillary_active[data-ancillary-related]').each(function() {
        /* Get field variables */
        var $ancillaryBlock = $(this);

        /* Get related (main object), and type (name of the ancillary) */
        var related = $ancillaryBlock.attr('data-ancillary-related');
        var type = $ancillaryBlock.attr('data-ancillary-type');
        var passengerIndex = $ancillaryBlock.attr('data-index-passenger');
        var passengerId = $ancillaryBlock.attr('data-passenger');
        var baggageObject = {};

        /* Compose ancillary object */
        var ancillaryObject = {
          ancillaryType: type
        };

        /* Get subfields */
        var subFields = {};

        $ancillaryBlock.find('.field [data-property]').each(function() {
          var $this = $(this);
          var property = $this.attr('data-property');
          var value = $this.val();
          var $fieldsetBody = $this.closest('.fieldset_body[data-property]');
          var fieldObject = {};
          var valid  = false;

          /* Figure out if the input is valid to add the property */
          if ($this.attr('type') == 'checkbox' && $this.is(':checked')) {
            valid = true;
          }

          if ($this.is('select') && $this.val() != '') {
            valid = true;
          }

          if ($this.hasClass('input_counter') && parseInt($this.val()) > 0) {
            valid = true;
          }

          /* Valid property */
          if (valid) {
            /* Add fieldobject to subfields */
            if ($fieldsetBody.length > 0) {
              /* Compose fieldobject */
              fieldObject[property] = value;

              var fieldsetProperty = $fieldsetBody.attr('data-property');

              /* Create the subfield container */
              if (subFields[fieldsetProperty] == undefined) {
                subFields[fieldsetProperty] = [];
              }

              /* Add subfield object to subfield container */
              subFields[fieldsetProperty].push(fieldObject)
            }
            else {
              var segmentType = $this.attr('data-segment-type');
              var nameAttr = $this.attr('name');
              var passengerIndexId = $this.attr('data-passenger-id');

              /* Init baggage object for that passenger */
              baggageObject[passengerIndexId] = {};

              /* Find element of other segment */
              var otherSegment = (segmentType == 'ONEWAY') ? 'RETURNWAY' : 'ONEWAY';
              var $otherSegmentElement = self.element.find('.field [data-property][data-segment-type="'+otherSegment+'"][name="'+nameAttr+'"]');
              var otherSegmentElementValue = ($otherSegmentElement.length > 0) ? parseInt($($otherSegmentElement.get(0)).val()) : 0;

              var purchaseSegmentTypeBaggages = [];
              purchaseSegmentTypeBaggages.push({ amount: value, segmentType: segmentType });

              /* Add other segment baggage info (if exist) */
              $otherSegmentElement.each(function(index, element) {
                purchaseSegmentTypeBaggages.push({ amount: $(element).val(), segmentType: $(element).attr('data-segment-type') });
              });

              baggageObject[passengerIndexId] = purchaseSegmentTypeBaggages;
            }
          }
        });

        ancillaryObject = $.extend(ancillaryObject, subFields);

        /* Create the main contenter if it doesn't exist */
        if (postObject[related] == undefined) {
          postObject[related] = [];
        }

        /* Add the ancillary object to the post object */
        if (related == 'journeyRelated') {
          postObject[related].push(ancillaryObject);
        }
        else if (related == 'passengerRelated') {
          postObjectPassengerIndex = self.getPassengerIndex(postObject, passengerId);

          if (postObjectPassengerIndex == undefined) {
            postObject[related].push({
              passengerId: passengerId,
              ancillaryBooking: []
            });

            postObjectPassengerIndex = postObject[related].length-1;
          }

          ancillaryObject['purchaseSegmentTypeBaggages'] = baggageObject[passengerIndex];

          $.each(postObject[related][postObjectPassengerIndex]['ancillaryBooking'], function(ancillaryIndex, ancillaryElement) {
            if (ancillaryElement.ancillaryType == 'BAGGAGE') {
              postObject[related][postObjectPassengerIndex]['ancillaryBooking'].splice(ancillaryIndex, 1);
            }
          });

          postObject[related][postObjectPassengerIndex]['ancillaryBooking'].push(ancillaryObject);
        }
      });

      /* Cache the postObject to send it with checkout session */
      this.ancillariesServiceObject = postObject;

      //console.log(postObject);

      return postObject;
    },

    getPassengerIndex: function(postObject, passengerId) {
      var foundIndex = undefined;

      $.each(postObject.passengerRelated, function(index, passenger) {
        if (passenger.passengerId == passengerId) {
          foundIndex = index;
          return false;
        }
      });

      return foundIndex;
    },

    setTabindex: function() {
      /* Clean previous tab index */
      $('body').find('input[tabindex], select[tabindex]').attr('tabindex', '');

      var tabindex = 100;

      this.element.find('input, select').each(function () {
        var $input = $(this);

        if (this.type != "hidden") {
          if ($input.hasClass("ocult")) {
             $input.attr('tabindex', -1);
          } else {
            $input.attr('tabindex', tabindex);
            tabindex++;
          }
        }
      });
    },

    creditCardCheck: function() {
      var self = this;
      var $creditCardType = this.element.find('.credit_card_type');
      var $creditCardNumber = this.element.find('.credit_card_number');
      var $creditCardExpirationMonth = this.element.find('.card_expirationmonth');
      var $creditCardExpirationYear = this.element.find('.card_expirationyear');

      $creditCardType.each(function() {
        var $field = $(this);
        var $paymentMethod = $field.closest('.payment_method');

        $field.find('select').on('change', function (event, blockServiceValidation) {
          if (!blockServiceValidation) {
            self.callToCreditCardCheck($paymentMethod);
          }
        });
      });

      $creditCardNumber.each(function() {
        var $field = $(this)
        var $paymentMethod = $field.closest('.payment_method');

        $field.find('input').on('blur', function () {
          self.callToCreditCardCheck($paymentMethod);
        });
      });

      $creditCardExpirationYear.each(function() {
        var $field = $(this);
        var $paymentMethod = $field.closest('.payment_method');

        $field.on('change', function (event) {
            self.callToCreditCardCheck($paymentMethod);
        });
      });

      $creditCardExpirationMonth.each(function() {
        var $field = $(this);
        var $paymentMethod = $field.closest('.payment_method');

        $field.on('change', function (event) {
            self.callToCreditCardCheck($paymentMethod);
        });
      });
    },

    callToCreditCardCheck: function ($paymentMethod) {
      var self = this;
      var cardType = $paymentMethod.find('.credit_card_type select option:selected').attr('value');
      var cardNumber = $paymentMethod.find('.credit_card_number input').val();
      var cardObject = {};
      var expirationMonth = $paymentMethod.find('.card_expirationmonth').val();
      var expirationYear = $paymentMethod.find('.card_expirationyear').val();
      var currentValue = cardType + '-' + cardNumber + '-' + expirationMonth + '-' +expirationYear;

      if (expirationMonth != '' && expirationYear != '' && typeof (cardNumber) != 'undefined' && cardNumber != '' && cardNumber.length > 11 && cardNumber.length < 19 /*&& this.lastCheckCardValue !== currentValue*/) {
        /* Disable select to avoid multiple validations */
        $paymentMethod.find('.credit_card_type select').attr('disabled', 'disabled');

        if(cardType === "") {
          cardType = "TD";
        }

        /* Build post object */
        cardObject = {
          cardType: {
            identity: cardType
          },
          cardNumber: cardNumber
        }

        if(self.isPaymentSave){
          /* Set the valid flag to true */
          self.lastCheckCardValid = true;

          /* Mark the card number as valid */
          $paymentMethod.find('.credit_card_number').trigger('set_valid', [true]);
          $paymentMethod.find('.credit_card_number').removeClass('error').addClass('valid');

          /* Enable select again */
          $paymentMethod.find('.credit_card_type select').removeAttr('disabled');

        }else{
          /* Call AJAX module to validate the credit card */
          Bus.publish('services', 'postCreditCardCheck', {
            data: cardObject,
            success: function (data) {
              var message = data.header.message;
              var error = data.header.error;
              var code = data.header.code;
              var identityCard = '';
              var $correctIdentityCard = null;
              var errorType;
              var errorTitle = lang('general.error_title');

              /* Errors control */
              if (error === true) {

                // console.log("Se produce error: ", code, message);

                /* Set the valid flag to false */
                self.lastCheckCardValid = false;

                /* Show specific field error */
                if (code == 400) {
                  message = data.body.data[0].message;

                  /* Update error hints */
                  $paymentMethod.find('.credit_card_number .error_hint').remove();
                  $paymentMethod.find('.credit_card_number').trigger('show_error', [message]).trigger('set_valid', [false]);

                  /* Set classes to show the error */
                  $paymentMethod.find('.credit_card_number').addClass('error').removeClass('valid initial_status');
                }

                /* Generic error, show the popup error */
                else {
                  errorType = true;

                  /* check if the ui_dialog is an advise and not an error */
                  if (code === 4050 || code === 4052 || code === 4054) {
                    errorType = false;
                    errorTitle = lang('general.info_error_title');
                  }

                  /* Wrong identity, show the popup error and switch the identity */
                  if (code === 4050 || code === 4052 || code === 4054) {
                    /* Get the correct identity card for this number */
                    identityCard = data.body.data.identity;

                    /* Assign its option */
                    $correctIdentityCard = $paymentMethod.find('.credit_card_type option[value=' + identityCard + ']');

                    /* Clean the select and mark the right identity card */
                    if ($correctIdentityCard.length > 0) {

                      /* Avoid triggering the validation again */
                      self.lastCheckCardValue = identityCard + '-' + cardNumber + '-' + expirationMonth + '-' + expirationYear;
                      self.lastCheckCardValid = true;

                      /* Select the correct identity */
                      $paymentMethod.find('.credit_card_type option:selected').prop('selected', false);
                      $correctIdentityCard.prop('selected', true);
                      $correctIdentityCard.closest('select').trigger('change', [true]);

                      /* Mark the card number as valid */
                      $paymentMethod.find('.credit_card_number').trigger('set_valid', [true]);
                      $paymentMethod.find('.credit_card_number').removeClass('error').addClass('valid');
                    }
                  }
                  else {
                    /* Update error hints */
                    $paymentMethod.find('.credit_card_number .error_hint').remove();
                    $paymentMethod.find('.credit_card_number').trigger('show_error', [message]).trigger('set_valid', [false]);

                    /* Set classes to show the error */
                    $paymentMethod.find('.credit_card_number').addClass('error').removeClass('valid initial_status');
                  }

                }
              }
              /* Success control */
              else {
                /* Set the valid flag to true */
                self.lastCheckCardValid = true;

                /* If credit card type is empty, set it to default value */
                if($paymentMethod.find('.credit_card_type select option:selected').attr('value') === '') {
                  $paymentMethod.find('.credit_card_type option:selected').prop('selected', false);
                  $correctIdentityCard = $paymentMethod.find('.credit_card_type option[value=TD]');
                  $correctIdentityCard.prop('selected', true);
                  $correctIdentityCard.closest('select').trigger('change', [true]);
                }

                /* Mark the card number as valid */
                $paymentMethod.find('.credit_card_number').trigger('set_valid', [true]);
                $paymentMethod.find('.credit_card_number').removeClass('error').addClass('valid');
              }

              /* Enable select again */
              $paymentMethod.find('.credit_card_type select').removeAttr('disabled');
            }
          });
        }

      }

      this.lastCheckCardValue = currentValue;
    }

  };
});