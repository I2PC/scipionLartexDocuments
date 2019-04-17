Hydra.module.register('LoyaltyBookings', function (Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#content.loyalty_bookings',
    element: undefined,
    bookingData: undefined,
    cardsCache: {},
    bookingId: undefined,
    events: {
      'loyalty_bookings': {
        'custom_init': function () {
          this.customInit();
          Bus.publish('prerender', 'restart');

          /* Remove dont_init state to current slider and then start it */
          this.element.find('#slider').removeClass('dont_init');
          Bus.publish('slider', 'restart');
        },
        'show_add_bookings_dialog': function (oNotify) {
          var callback = (oNotify && oNotify.callback) ? oNotify.callback : function () {};

          this.showAddBookingDialog(callback);
        },
        'scroll_to_passengers': function(oNotify) {
          var callback = (oNotify && oNotify.callback) ? oNotify.callback : function () {};

          this.scrollToSection('passengers', callback);
        },
        'scroll_to_payment': function(oNotify) {
          var callback = (oNotify && oNotify.callback) ? oNotify.callback : function () {};

          this.scrollToSection('payment_methods', callback);
        },
        'scroll_to_itemization': function(oNotify) {
          var callback = (oNotify && oNotify.callback) ? oNotify.callback : function () {};

          this.scrollToSection('itemization', callback);
        }
      }
    },
    init: function () {
      this.customInit();
    },
    customInit: function () {
      var self = this;

      /* Save jquery object reference */
      this.element = $(this.selector);

      if (this.element.length > 0) {

        /* Get bookingId data */
        Bus.publish('loyalty', 'getBookingId', {callback: function (bookingId) {
          self.bookingId = bookingId;
        }});

        /* Get checkout data */
        Bus.publish('loyalty', 'getLoyaltyBookingData', {callback: function (bookingData) {
          self.bookingData = bookingData;
        }});

        /* Start graphics */
        this.initGraphics();

        /* Listen external form links - to launch ancillaries and checkin */
        this.listenProcessLaunch();

        /*Inicializamos Journeys*/
        this.initJourneySummary(); //TODO: poner dentro del if

        /* Itemization, get the data, process it and create the itemization */
        if (this.bookingData && this.bookingData.passengers && this.bookingData.paymentInfo) {
          this.createItemization();
        }

        this.bookingShareEvent();
        this.listenDeleteBooking();
        this.listenRefreshBooking();
        this.startCardsSlider();
        this.startCardsActions();
        this.listenTwitterButton();
        this.listenFollowUsTwitterButtom();
        this.listenNotificationsTwitterButtom();

        this.showNotificationsTwitterLoyalty();

        this.fixPrice();

        

      }
    },

    showNotificationsTwitterLoyalty: function(){

      var divLoginTwitter = this.element.find('.twitter_sharing_bookings');
        
      //Data in JSImport to know if Twitter Social Login was already executed
      // If so, we do not show Social Login option and show notifications.
      // Same behaviour, if customer is already following AirEuropa Twitter account. 
      if(executed){

       var aliasTwitter = this.element.find('div.sharing_text .content_subtitle_twitter span.alias');
       aliasTwitter.html('@' + customerScreenName + ' ');

      if (following){

              divLoginTwitter.removeClass('step_one step_two');
              divLoginTwitter.addClass('step_three');             
          } else {
              divLoginTwitter.removeClass('step_one');
              divLoginTwitter.addClass('step_two');
          }
        }    
      },

    initGraphics: function () {

      /* Prepare graphic */
      this.element.find('.graphic').graphic({
        minFlightWidth: AirEuropaConfig.graphic.minFlightWidth,
        maxTransferWidth: AirEuropaConfig.graphic.maxTransferWidth,
        minTransferWidth: AirEuropaConfig.graphic.minTransferWidth,
        highlights: AirEuropaConfig.graphic.highlights
      });

    },
    initJourneySummary: function () {
      /*Evento que escucha las cabeceras del journey*/
      this.element.find('.block_header.journey-summary').on('click', function (event) {
        event.preventDefault();
        var $this = $(this);

        /*Comprobamos si ya esta visible la capa*/
        if ($this.closest('.journey').hasClass('expanded')) {
          $this.closest('.journey').find('.block_body').slideUp(300);
          $this.closest('.journey').removeClass('expanded');
          $this.removeClass('expanded');
        } else {
          $this.closest('.journey').find('.block_body').slideDown(300);
          $this.closest('.journey').addClass('expanded');
          $this.addClass('expanded');
        }
      });
    },
    startCardsSlider: function () {
      this.element.find('.cards_slider').cards_slider();
    },
    /* Launch process */
    listenProcessLaunch: function (unbind) {
      if (typeof unbind !== 'undefined' && unbind === true) {
        this.element.find('a[rel=launch_process]').unbind('click');
      }

      this.element.find('a[rel=launch_process]').on('click', function (event) {
        event.preventDefault();

        var $this = $(this);
        var $process = $('#process');
        var formName = $this.attr('data-form');
        var processName = $this.attr('data-process-start');
        var locator = $this.attr('data-locator');
        var $form = $process.find('.' + formName);

        if (locator) {
          /* Full process */
          $process.addClass('full');

          /* Add data to form */
          if (processName) {
            $form.closest('.search_form').addClass('process_launched').attr('data-process-start', processName);
          }
          $form.find('.reserve_field input').val(locator).trigger('validate');
          $form.find('.text_field').attr('data-required', 'false').attr('data-init', 'restart').find('input').val('');
          $form.form('restartFields');

          /* Submit */
          $form.trigger('submit');
        }
      });

    },
    /* Add booking */

    showAddBookingDialog: function (callback) {
      var self = this;

      /* Get the template */
      Bus.publish('ajax', 'getTemplate', {
        path: AirEuropaConfig.templates.loyalty_bookings.add_booking_dialog,
        success: function (template) {

          self.element.ui_dialog({
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
              var $submitButton = $dialog.find('.search a');

              /* Execute callback if it's defined */
              if (callback) {
                callback();
              }

              /* Close button */
              $dialog.find('.close a').on('click', function (event) {
                window.location.hash = '#/' + getProcessUrl('loyalty_bookings');
              });

              /* Buttons behaviour */
              $submitButton.on('click', function (event) {
                event.preventDefault();
                /* Add loading behaviour */
                $submitButton.addClass('loading');
                $form.trigger('submit');
              });

              /* Form behaviour */
              $form.form({
                onSubmit: function (form) {

                  var locator = form.element.find('#add_booking_locator').val();
                  var surname = form.element.find('#add_booking_surname').val();

                  /* Show spinner */

                  /* Call to add booking service */
                  Bus.publish('services', 'getExternalBooking', {
                    data: {
                      userId: localStorage.ly_userId,
                      surname: surname,
                      locator: locator
                    },
                    success: function (addBookingData) {
                      /* Get info from json */
                      var error = addBookingData.header.error;
                      var message = addBookingData.header.message;

                      /* Remove loading behaviour */
                      $submitButton.removeClass('loading');

                      if (error) {
                        $('body').ui_dialog({
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

                        //Adding new booking to bookingData Object
                        self.bookingData.push(addBookingData.body.data.booking);
                        var numBookings = self.bookingData.length; 

                        /* Get the single card template */
                        Bus.publish('ajax', 'getTemplate', {
                          path: AirEuropaConfig.templates.loyalty_bookings.single_card,
                          success: function (template) {

                            /* Process the flight using the controller helper function for that */
                            Bus.publish('loyalty', 'processFlight', {
                              flight: addBookingData.body.data.booking,
                              callback: function (processedFlight) {

                                /* Call to my checkin bookings service */
                                Bus.publish('services', 'getCheckinBookings', {
                                  userId: localStorage.ly_userId,
                                  success: function (checkinBookingsData) {

                                    var checkinBookings = [];
                                    if (!checkinBookingsData.header.error) {
                                      checkinBookings = checkinBookingsData.body.data;
                                    }

                                    _.each(checkinBookings, function (booking, index, list) {
                                      var checkinBookingId = booking.bookingId;

                                      if (checkinBookingId == processedFlight.bookingId) {
                                        processedFlight.checkinStatus = {
                                          status: "OPEN"
                                        };
                                      }
                                    });

                                    var html = template(processedFlight);

                                    if (self.element.find('.flight_cards').length > 0) {
                                      self.element.find('.flight_cards').prepend(html);
                                    } else {
                                      self.element.find('.inner_block_page_wrapper').find('.inner_block_page').addClass('fallback');
                                      self.element.find('.inner_block_page_wrapper').append('<div class="inner_block_page"><div class="flight_cards">' + html + '</div></div>');
                                    }

                                    //Adding data-index attribute to manage new booking in twitter functionality
                                    self.element.find('.flight_card_wrapper').first().find('.twitter_sharing_bookings').attr('data-index', numBookings - 1);

                                    var unbindListeners = true;
                                    self.listenProcessLaunch(unbindListeners);
                                    self.listenDeleteBooking(unbindListeners);
                                    self.listenRefreshBooking(unbindListeners);
                                    self.listenTwitterButton(unbindListeners);
                                    self.listenFollowUsTwitterButtom(unbindListeners);
                                    self.listenNotificationsTwitterButtom(unbindListeners);

                                    //Call to show twitter buttons
                                    self.showNotificationsTwitterLoyalty();

                                    $dialog.find('.close_dialog .close a').trigger('click');

                                  }
                                });
                              }
                            });
                          }
                        });

                      }
                    }
                  });
                }
              });
            }
          });
        }
      });

    },

    /*Scroll to */

    scrollToSection: function(section, callback) {
      var $section = $('#' + section);
      var position = $section.offset().top - $('.nav_bar').outerHeight() + 2;

      Bus.publish('scroll', 'scrollTo', {
        position : position,
        callback: function() {
          callback();
        }
      });
    },

    /* Itemization */

    createItemization: function () {
      var self = this;
      var itemization = {
        adult: {number: 0},
        kid: {number: 0},
        baby: {number: 0},
        tax: {},
        ancillaries: {},
        fees: {},
        resident: {},
        largeFamily: {},
        discounts: {}
      };

      var total;
      var baseFare = 0;
      var serviceItemization = self.bookingData.passengers;

      $.each(serviceItemization, function (index, passenger) {
        /* Adult passengers base */
        if (passenger.passengerType == "ADULT") {
          itemization.adult = {
            number: itemization.adult.number + 1,
            description: passenger.base.description,
            amount: passenger.base.amount + (itemization.adult.amount || 0)
          };
        }

        /* Kid (child) passengers base */
        if (passenger.passengerType == "CHILD") {
          itemization.kid = {
            number: itemization.kid.number + 1,
            description: passenger.base.description,
            amount: passenger.base.amount + (itemization.kid.amount || 0)
          };
        }

        /* Baby (infant) passengers base */
        if (passenger.passengerType == "INFANT") {
          itemization.baby = {
            number: itemization.baby.number + 1,
            description: passenger.base.description,
            amount: passenger.base.amount + (itemization.baby.amount || 0)
          };
        }

        /* Sum base fare */
        baseFare += passenger.base.amount;

        /* Taxes */
        itemization.tax = {
          description: passenger.tax.description, // lang('general.taxes')
          amount: passenger.tax.amount + (itemization.tax.amount || 0)
        };

        /* Ancillary */
        if (passenger.ancillaryItemization && passenger.ancillaryItemization.length > 0) {
          $.each(passenger.ancillaryItemization, function (ancIndex, ancillary) {
            itemization.ancillaries[ancillary.ancillaryType] = {
              type: ancillary.ancillaryType,
              description: ancillary.price.description,
              amount: ancillary.price.amount + (itemization.ancillaries[ancillary.ancillaryType] ? itemization.ancillaries[ancillary.ancillaryType].amount || 0 : 0)
            };
          });
        }

        /* Fee */
        if (passenger.feeItemization && passenger.feeItemization.length > 0) {
          $.each(passenger.feeItemization, function (feeIndex, fee) {
            itemization.fees[fee.feeType] = {
              type: fee.feeType,
              description: fee.price.description,
              amount: fee.price.amount + (itemization.fees[fee.feeType] ? itemization.fees[fee.feeType].amount || 0 : 0)
            };
          });
        }

        /* Discount */
        if (passenger.discountItemization && passenger.discountItemization.length > 0) {
          $.each(passenger.discountItemization, function (discountIndex, discount) {
            if (discount.discountType == 'RESIDENT') {
              itemization.resident = {
                description: lang('general.resident_discount'),
                amount: discount.price.amount + (itemization.resident.amount || 0)
              };
            }
            else if (discount.discountType == 'LARGEFAMILY_NORMAL') {
              itemization.largeFamily = {
                description: lang('general.large_family_discount'),
                amount: discount.price.amount + (itemization.largeFamily.amount || 0)
              };
            }
            else if (discount.discountType == 'LARGEFAMILY_SPECIAL') {
              itemization.largeFamily = {
                description: lang('general.large_family_discount'),
                amount: discount.price.amount + (itemization.largeFamily.amount || 0)
              };
            }
            else {
              itemization.discounts = {
                description: lang('general.discount'),
                amount: discount.price.amount + (itemization.discounts.amount || 0)
              };
            }
          });
        }

        /* Total price */
        total = {
          description: passenger.total.description,
          currency: passenger.total.currency.code,
          //amount: Math.floor((passenger.total.amount + (total ? total.amount : 0)) * 100) / 100
          amount: (passenger.total.amount + (total ? total.amount : 0))
        };

      });

      /* Make discount negative */
      itemization.resident.amount = itemization.resident.amount * -1;
      itemization.discounts.amount = itemization.discounts.amount * -1;
      itemization.largeFamily.amount = itemization.largeFamily.amount * -1;

      // console.log("Objeto itemization");
      // console.log(itemization);
      // console.log(total);

      /* Print itemization */
      this.printItemization(itemization, total);
    },
    printItemization: function (itemization, total) {
      var itemHtml;
      var cacheHtml = '';

      /* Adult */
      if (itemization.adult.amount > 0) {
        cacheHtml += '<li class="adults" data-value="' + itemization.adult.amount + '"><span>' + itemization.adult.description + ' (x' + itemization.adult.number + ')' + '</span> <strong>' + formatCurrency(itemization.adult.amount) + '</strong></li>';
      }

      /* Kid */
      if (itemization.kid.amount > 0) {
        cacheHtml += '<li class="kids" data-value="' + itemization.kid.amount + '"><span>' + itemization.kid.description + ' (x' + itemization.kid.number + ')' + '</span> <strong>' + formatCurrency(itemization.kid.amount) + '</strong></li>';
      }

      /* Baby */
      if (itemization.baby.amount > 0) {
        cacheHtml += '<li class="babies" data-value="' + itemization.baby.amount + '"><span>' + itemization.baby.description + ' (x' + itemization.baby.number + ')' + '</span> <strong>' + formatCurrency(itemization.baby.amount) + '</strong></li>';
      }

      /* Resident discount */
      if (itemization.resident.amount < 0) {
        cacheHtml += '<li class="resident" data-value="' + itemization.resident.amount + '"><span>' + itemization.resident.description + '</span> <strong>' + formatCurrency(itemization.resident.amount) + '</strong></li>';
      }

      /* Tax */
      if (itemization.tax.amount > 0) {
        cacheHtml += '<li class="tax" data-value="' + itemization.tax.amount + '"><span>' + itemization.tax.description + '</span> <strong>' + formatCurrency(itemization.tax.amount) + '</strong></li>';
      }

      /* Large family discount */
      if (itemization.largeFamily.amount < 0) {
        cacheHtml += '<li class="large_family" data-value="' + itemization.largeFamily.amount + '"><span>' + itemization.largeFamily.description + '</span> <strong>' + formatCurrency(itemization.largeFamily.amount) + '</strong></li>';
      }

      /* Ancillaries */
      $.each(itemization.ancillaries, function (ancIndex, ancillary) {
        if (ancillary.amount > 0) {
          cacheHtml += '<li class="' + ancillary.type + '" data-value="' + ancillary.amount + '"><span>' + ancillary.description + '</span> <strong>' + formatCurrency(ancillary.amount) + '</strong></li>';
        }
      });

      /* Fee */
      $.each(itemization.fees, function (feeIndex, fee) {
        if (fee.amount > 0) {
          cacheHtml += '<li class="' + fee.type + '" data-value="' + fee.amount + '"><span>' + fee.description + '</span> <strong>' + formatCurrency(fee.amount) + '</strong></li>';
        }
      });

      /* Discount */
      if (itemization.discounts.amount < 0) { /* Negative value */
        cacheHtml += '<li class="discount" data-value="' + itemization.discounts.amount + '"><span>' + itemization.discounts.description + '</span> <strong>' + formatCurrency(itemization.discounts.amount) + '</strong></li>';
      }

      /* Append itemization to prices block */
      this.element.find('.paid_detail .price_detail ul').empty().append(cacheHtml);
    },
    /* Called whe user shares a booking by e-mail */

    bookingShareEvent: function () {
      var self = this;

      this.element.find('.inner_actions a.booking_share').on('click', function (event) {

        var $this = $(this);
        var bookingId = $this.attr('data-bookingId');

        Bus.publish('ajax', 'getTemplate', {
          path: eval('AirEuropaConfig.templates.loyalty_bookings.booking_share'),
          success: function (template) {

            /* Show call me back lightbox */
            $('.booking_detail').ui_dialog({
              title: lang('my_booking.share_title'),
              error: false,
              subtitle: lang('my_booking.share_form'),
              content: template,
              with_scroll: true,
              close: {
                behaviour: 'close',
                href: '#'
              },
              buttons: [
                {
                  className: 'next',
                  href: '#',
                  label: lang('my_booking.share_button')
                }
              ],
              render: function ($dialog) {
                var $form = $dialog.find('.form_booking_share');

                /* Buttons behaviour */
                $dialog.find('.next a').on('click', function (event) {
                  event.preventDefault();
                  $dialog.find('.dialog_content').append('<span class="dialog_spinner"><span class="spinner"></span><strong class="spinner_text">' + lang('inner.loading') + '</strong></span>').addClass('spinner');
                  $form.trigger('submit');
                });

                $form.form({
                  onSubmit: function (form) {
                    var formData = $form.serializeObject();
                    var userEmailsArray = (formData.field_emails.indexOf(",") !== -1) ? formData.field_emails.split(",") : formData.field_emails.split(";");

                    var data = {
                      'emails': userEmailsArray
                    };

                    Bus.publish('services', 'shareBooking', {
                      data: data,
                      bookingId: bookingId,
                      success: function (data) {
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
                        self.onSharedBooking($dialog, !data.header.error);
                      }
                    });
                  }
                });
              }
            });
          }
        });

        return false;
      });
    },
    onSharedBooking: function ($dialog, success) {
      $dialog.find('.close a').click(); // Close previously opened dialog

      var subtitle = (success) ? 'my_booking.share_subtitle' : 'my_booking.share_error_subtitle';

      this.element.ui_dialog({/* Append to body because another dialog could be already present */
        title: lang('my_booking.share_title'),
        error: false,
        subtitle: lang(subtitle),
        close: {
          behaviour: 'close',
          href: '#'
        },
        buttons: [
          {
            className: 'close',
            href: '#',
            label: lang('my_info_unsubscribe.close_dialog')
          }
        ]
      });
    },
    /* Cards button actions */

    startCardsActions: function () {
      var self = this;

      /* Get checkout data */
      Bus.publish('loyalty', 'getLoyaltyCardsData', {callback: function (cardsCache) {
          self.cardsCache = cardsCache;
        }});

      this.element.find('.link').find('a.share').on('click', function (event) {
        event.preventDefault();
        var $this = $(this);
        var typeSharing = $this.hasClass('email') ? 'MAIL' : 'PASSBOOK';
        var shareData = {
          cards: self.cardsCache
        }

        Bus.publish('ajax', 'getTemplate', {
          data: shareData,
          path: eval('AirEuropaConfig.templates.loyalty_bookings.cards_sharing'),
          success: function (template) {

            /* Show call me back lightbox */
            $('.booking_detail').ui_dialog({
              title: lang('checkin.cards_sharing_step1_title'),
              subtitle: lang('checkin.cards_sharing_step1_subtitle'),
              content: template,
              with_scroll: true,
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
              render: function ($dialog) {
                var $form = $dialog.find('.step1').find('form');

                /* Hidden step2 */
                $dialog.find('.step2').hide();

                /* Buttons behaviour */
                $dialog.find('.next a').on('click', function (event) {
                  event.preventDefault();
                  $form.trigger('submit');
                });

                /* Checkbox required */
                $dialog.find('.step1').find('.field.checkbox').find('input').on('change', function () {
                  var howMuch = 0;
                  $dialog.find('.step1').find('.field.checkbox').find('input').each(function () {
                    if ($(this).is(':checked')) {
                      howMuch++;
                    }
                    $dialog.find('.step1').find('.field.checkbox').addClass('disabled');
                  });
                  if (howMuch > 0) {
                    $dialog.find('.step1').find('.field.checkbox').addClass('disabled');
                  } else {
                    $dialog.find('.step1').find('.field.checkbox').removeClass('disabled');
                  }
                });

                /* Form behaviour */
                $form.form({
                  onError: function () {
                    $dialog.find('.step1').find('.articles_error').show();
                  },
                  onSubmit: function (form) {
                    var passengersCardsChecked = [];
                    var formData = $form.serializeObject();

                    $.each(formData.field_card, function (index, data) {
                      if (data.length > 0) {
                        passengersCardsChecked.push(data);
                      }
                    });

                    self.initBookingSharingStep2($dialog, passengersCardsChecked, typeSharing);

                  }
                });
              }
            });
          }
        });
      });
    },
    initBookingSharingStep2: function (dialog, passengersCardsChecked, typeSharing) {
      var self = this;
      var $dialog = dialog;
      // var locator = this.element.find('.booking_detail').attr('data-locator');
      var locator = this.element.find('.booking_header').attr('data-locator');

      var $form = $dialog.find('.step2').find('form');

      $dialog.find('.step1').hide();
      $dialog.find('.step2').show();

      $dialog.find('.dialog_subtitle').html('<p>' + lang('checkin.cards_sharing_step2_subtitle') + '</p>');

      /* Buttons behaviour */
      $dialog.find('.next a').unbind('click');
      $dialog.find('.next a').on('click', function (event) {
        event.preventDefault();
        $form.trigger('submit');
      });

      $form.form({
        onError: function () {
          $dialog.find('.step2').find('.articles_error').show();
        },
        onSubmit: function (form) {
          var formData = $form.serializeObject();
          var userEmailsArray = formData.field_emails.indexOf(",") != -1 ? formData.field_emails.split(",") : formData.field_emails.split(";");
          var postObject = {};
          var counter = 0;

          $dialog.find('.dialog_content').append('<span class="dialog_spinner"><span class="spinner"></span><strong class="spinner_text">' + lang('inner.loading') + '</strong></span>').addClass('spinner');

          $.each(self.cardsCache, function(indexCache, dataCache){
            postObject = {
              "locator": locator,
              "userId": localStorage.ly_userId,
              "departureDate": moment(dataCache.departure.date).format("DD/MM/YYYY"),
              "flightNumber": dataCache.flight.number,
              "sharingType": typeSharing,
              "passengerFlightIds": passengersCardsChecked,
              "emails": userEmailsArray,
              "userMessage": formData.field_message
            };
            Bus.publish('services', 'shareBookingCards', {
              data: postObject,
              bookingId: self.bookingId,
              success: function (data) {
                counter++;
                if (counter > 1){
                  if (data.header && data.header.error) {
                    data.header.message += ' '+data.header.message;
                  }
                }
                if (self.cardsCache.length == counter){
                  self.checkShareForm($dialog, $form, data);
                }
              }
            });
          });
        }
      });

    },
    checkShareForm: function($dialog, $form, data){
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
        $dialog.find('.dialog_subtitle').html('<p>' + lang('general.request_sent') + '</p>');
      }
      else {
        /* Show an error */
        $dialog.find('.dialog_subtitle').html('<p>' + data.header.message + '</p>');
      }
      $dialog.find('.dialog_content').removeClass('spinner').find('.dialog_spinner').remove();

      $dialog.find('.next a').text(lang('general.continue'));
      $dialog.find('.next a').unbind('click');
      $dialog.find('.next a').on('click', function (event) {
        event.preventDefault();
        $dialog.find('.close_dialog').find('a').click();
      });
    },
    listenDeleteBooking: function (unbind) {
      var self = this;

      if (typeof unbind !== 'undefined' && unbind === true) {
        this.element.find('.flight_card .actions a.delete').unbind('click');
      }

      this.element.find('.flight_card .actions a.delete').on('click', function (event) {
        event.preventDefault();

        var $this = $(this);
        var bookingId = $this.attr('data-bookingId');
        var $flightCard = $this.closest('.flight_card');

        /* Call to add booking service */
        Bus.publish('services', 'putBookingStatus', {
          userId: localStorage.ly_userId,
          bookingId: bookingId,
          status: 'disabled',
          success: function (addBookingData) {
            /* Get info from json */
            var error = addBookingData.header.error;
            var message = addBookingData.header.message;

            if (error) {
              $('body').ui_dialog({
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
              $('body').ui_dialog({
                title: lang('general.info_error_title'),
                error: false,
                subtitle: lang('my_booking.booking_delete_info'),
                close: {
                  behaviour: 'close',
                  href: '#'
                },
                buttons: [
                  {
                    className: 'close_booking',
                    href: urlCms('my_bookings'),
                    label: lang('my_booking.booking_accept')
                  },
                  {
                    className: 'close',
                    href: '#',
                    label: lang('my_booking.booking_cancel')
                  }
                ]
              });

              

              /* Show fallback */
              if (self.element.find('.flight_cards').children().length == 0) {
                self.element.find('.inner_block_page_wrapper .inner_block_page').not('.fallback').remove();
                self.element.find('.inner_block_page_wrapper .inner_block_page.fallback').removeClass('fallback');
              }
            }
          }
        });

      });
    },
    listenRefreshBooking: function(unbind) {
        var self = this;

        /*
          Check param to ubind or not old listeners.
          This is necesary to avoid duplicate listeners when this functions is called more than once.
        */
        if (typeof unbind !== 'undefined' && unbind === true) {
          this.element.find('.flight_card .actions a.refresh').unbind('click');
        }

        this.element.find('.flight_card .actions a.refresh').on('click', function (event) {
          event.preventDefault();

          var $this = $(this);
          var locator = $this.attr('data-locator');
          var $flightCard = $this.closest('.flight_card');
          var bookingId = $this.attr('data-bookingId');

          Bus.publish('services', 'getBookingDetail', {
              data: {
                userId: localStorage.ly_userId,
                bookingId: bookingId,
              },
              success: function (data) {

                /* Get info from json */
                var error = (data.header ? data.header.error : (data.error));

                /* Process bookings */
                if (!error && data.body && data.body.data && data.body.data.passengers) {
                	var surname = data.body.data.passengers[0].surname;

                	/* Call to refresh booking service */
                    Bus.publish('services', 'refreshBookingStatus', {
                      userId: localStorage.ly_userId,
                      locator: locator,
                      surname: surname,
                      success: function (refreshBookingData) {
                        /* Get info from json */
                        var error = refreshBookingData.header.error;
                        var message = refreshBookingData.header.message;

                        if (error) {
                          $('body').ui_dialog({
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
                            $('body').ui_dialog({
                              title: lang('my_bookings.refresh_success_title'),
                              error: false,
                              subtitle: lang('my_bookings.refresh_success_body'),
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
                else {
                  /* Show error dialog */
                  self.element.ui_dialog({
                    title: lang('general.error_title'),
                    subtitle: lang('my_booking.detail_loading_error'),
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
    },

    listenTwitterButton: function(unbind){

      var buttonClicked = this.element.find('div.sharing_button_bookings.one button');

        if (typeof unbind !== 'undefined' && unbind === true) {
          buttonClicked.unbind('click');
        }

        buttonClicked.on('click', function (event) {
          event.preventDefault();

          Bus.publish('services', 'loginTwitterOAuthLoyalty', {
                data: window.location.href,
                success: function (data) {

                  //Launch URL provided by Twitter to do Social Login.
                  window.location.href = data.authURL;
                  
                }            
          });

        });
    },

    listenFollowUsTwitterButtom: function(unbind){

      var divLoginTwitter = this.element.find('.twitter_sharing_bookings');
      var buttonClicked = this.element.find('div.sharing_button_bookings.two button');
      var self = this;

      if (typeof unbind !== 'undefined' && unbind === true) {
          buttonClicked.unbind('click');
      }

      buttonClicked.on('click', function (event) {
        event.preventDefault();

            Bus.publish('services', 'followUsTwitterLoyalty', {
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

      var divLoginTwitter = this.element.find('.twitter_sharing_bookings');
      var buttonClicked = this.element.find('div.sharing_button_bookings.three button');

      var self = this;

      if (typeof unbind !== 'undefined' && unbind === true) {
          buttonClicked.unbind('click');
      }

      buttonClicked.on('click', function (event) {
        event.preventDefault();

              var indexBooking = $(this).closest('div.twitter_sharing_bookings').attr('data-index');
              var element = this;

              //Check if customer is following @AirEuropa
              Bus.publish('services', 'followingUsTwitterCheckin', {
                success: function (data) {
  
                  if (data === true){
                      //Data in JSImport
                      following = data;

                      self.callNotificationsTwitter(indexBooking, $(element).closest('div.twitter_sharing_bookings'));

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

    callNotificationsTwitter: function(indexBooking, wrapper){

      var self = this;
      var numFlightsOneWay = 0;
      var numFlightsReturn = 0;

      //Calculate nummber of journeys, one way and return to register for twitter notifications
      if (self.bookingData[indexBooking].journey.oneWayFlights){

        numFlightsOneWay = self.bookingData[indexBooking].journey.oneWayFlights.length;
      }

      if (self.bookingData[indexBooking].journey.returnFlights){

        numFlightsReturn = self.bookingData[indexBooking].journey.returnFlights.length;
      }
      

      //Number of calls done and calls returned ok.
      var numOks = 0;
      var numCalls = 0;

        //Flights one way
        for (var i = 0;  i < numFlightsOneWay; i++){

          //Object with one way flight data needed to call twitter notifications service.
          var flightObjectOneWay = {};

          flightObjectOneWay['flightCode'] = self.bookingData[indexBooking].journey.oneWayFlights[i].number;
          flightObjectOneWay['departureDate'] = self.bookingData[indexBooking].journey.oneWayFlights[i].dateDeparture;
          flightObjectOneWay['arrivalDate'] = self.bookingData[indexBooking].journey.oneWayFlights[i].dateArrival;
          flightObjectOneWay['departureAirport'] = self.bookingData[indexBooking].journey.oneWayFlights[i].airportDeparture.code;
          flightObjectOneWay['arrivalAirport'] = self.bookingData[indexBooking].journey.oneWayFlights[i].airportArrival.code;

          Bus.publish('services', 'notificationsTwitterLoyalty', {
              data: flightObjectOneWay,
              success: function (data) {
                
                ++numCalls;

                if (data.statusCode === '200') {

                  ++numOks;
                
                }else{

                  --numOks;
                }
              }          
          });

        }
    
        //Flights return
        for (var j = 0; j < numFlightsReturn; j++){

          //Object with one way flight data needed to call twitter notifications service.
          var flightObjectReturn = {};

          flightObjectReturn['flightCode'] = self.bookingData[indexBooking].journey.returnFlights[j].number;
          flightObjectReturn['departureDate'] = self.bookingData[indexBooking].journey.returnFlights[j].dateDeparture;
          flightObjectReturn['arrivalDate'] = self.bookingData[indexBooking].journey.returnFlights[j].dateArrival;
          flightObjectReturn['departureAirport'] = self.bookingData[indexBooking].journey.returnFlights[j].airportDeparture.code;
          flightObjectReturn['arrivalAirport'] = self.bookingData[indexBooking].journey.returnFlights[j].airportArrival.code;

          Bus.publish('services', 'notificationsTwitterLoyalty', {
            data: flightObjectReturn,
            success: function (data) {
              
              ++numCalls;

              if (data.statusCode === '200') {

                ++numOks;
                     
              }else{

                --numOks;
              }
            }             
          });
        }

        //Function to wait calls done and check if they are ok to hide and show each component.
        var checkComplete = function () {

          if (numCalls === (numFlightsOneWay + numFlightsReturn)) {
            if (numOks === (numFlightsOneWay + numFlightsReturn)) {
              
             var buttonClicked = wrapper.find('div.sharing_button_bookings');

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

          }else {
            setTimeout(checkComplete, 100);
          }
        } 

        checkComplete();

    },

    fixPrice: function(){

      $('.total_price span').css('font-size', '1em');
      while( $('.total_price span').width() > $('.total_price').width() ) {
          $('.total_price span').css('font-size', (parseInt($('.total_price span').css('font-size')) - 1) + "px" );
      }
    }

  };
});
