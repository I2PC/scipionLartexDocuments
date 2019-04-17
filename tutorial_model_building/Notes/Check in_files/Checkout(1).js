Hydra.module.register('Checkout', function (Bus, Module, ErrorHandler, Api) {

  return {
    selector: '#checkout',
    element: undefined,
    checkoutData: undefined,
    ancillariesServiceObject: undefined,
    baseFare: 0,
    lastStepErrors: undefined,
    saraData: undefined,
    saraTemplateData: undefined,
    lastCheckCardValue: '',
    lastCheckCardValid: false,
    showCallMeBackAtStart: false,
    checkFrequent_Flyer_in_autoComplete: false,
    isAutoComplete: false,
    isPaymentSave: false,
    events: {
      'checkout': {
        'custom_init': function () {
          this.customInit();
          Bus.publish('prerender', 'restart');
        },
        'init_cancel': function () {
          this.initCancel();
        },
        'show_call_me_back': function () {
          this.showCallMeBack();
        },
        'init_swiper': function (){
          this.initSwiper();
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

      this.saraData = undefined;
      this.saraTemplateData = undefined;

      if (this.element.length > 0) {
        /* Get checkout data */
        Bus.publish('process', 'get_checkout_data', {callback: function (checkoutData) {
            self.checkoutData = checkoutData;
          }});

        /* Clean key event */
        $(document).off('.results');

        /* Control content height */
        this.setContentHeight();
        this.controlResize();

        /* Create prices (itemization) content */
        this.createItemization();

        /* Bind prices behaviour */
        this.pricesScrollListener();

        /* Control status bar links */
        this.checkoutStatus();

        /* Control cancel button */
        this.initCancel();

        /* Toggle itinerary */
        this.toggleItinerary();

        /* show loyalty login */
        this.showLogin();

        /* Start graphics */
        this.initGraphics();

        /* Init steps widgets */
        this.initSteps();

        /* set total Miles content when step is payment */
        this.setTotalMilesContent();

        /* Form helpers */
        this.setTabindex();
        this.largeFamilyDiscount();
        this.ageField();
        this.babyTravelwith();
        this.documentType(false);
        this.creditCardCheck();
        this.myAeLogin();
        this.promoCode();
        this.aeCard();
        this.paypal();
        this.myMiles();
        this.promoPaypalCode();
        this.promoCreditCardCode();

        /* Forms */
        this.initForm();
        this.creditCardFee();
        this.paymentMethods();
        this.registerForm();
        this.initFieldDocumentExpiration();
        this.initFieldCardExpiration();
        this.autocompleteSelects();
        this.documentExpirationActions();
        this.cardExpirationActions();
        this.birthdateActions();
        this.creditCardHolderDocumentCheck();
        this.creditCardHolderDocumentCheckMiles();
        this.creditCardHolderDocumentCheckPaypal();
        this.creditCardHolderDocumentCheckTarjetAe();
        this.creditCardHolderDocumentCheckDiscount();
        this.creditCardHolderDocumentCheckMyae();
        this.creditCardHolderDocumentCheckPaypalNoPromo();


        /*Inicializamos Journeys*/
        this.initJourneySummary();

        /*Inicializamos Pasajeros*/
        this.initPassengersSummary();

        /*Inicializar tabs*/
        this.initTabsPaymentMethods();

        /* Control paypal confirmation */
        this.confirmPaypal();

        /* Seats map */
        this.composeSeatMap();

        /* Send ancillaries when selected*/
        this.listenInsurance();
        this.initControlPrices();
        this.listenAncillaries();

        /* Cancelling events on collapses */
        this.element.off('click.results');

        /* Set visual collapses */
        this.setVisualEffects();

        /* Init final screen events */
        this.initHotelEvents();

        this.frequentFlyerCheck();

        this.fixPrice();

        if (self.checkoutData['step'] === 'confirm'){

          /* Listen Twitter Buttons */
          this.listenTwitterButton();
          this.listenFollowUsTwitterButtom();
          this.listenNotificationsTwitterButton();

          this.showNotificationsTwitterCheckout();

        }

        /* Print last step errors if exists */
        if (this.lastStepErrors) {
          setTimeout(function () {
            self.showFieldErrors(self.element.find('form'), self.element.find('.process_step').attr('data-step'), self.lastStepErrors);
            self.lastStepErrors = undefined;
          }, 150);
        }
        this.setContentHeight();
      }
    },

    initSwiper: function () {
      var mySwiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: false,
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        slidesPerView: 3,
        grabCursor: false,
        spaceBetween: 30
      });

      var $next = $('.swiper-button-next');
      var $prev = $('.swiper-button-prev');
      var slidesLenght = mySwiper.slides.length;
      var $slideFirst = $(mySwiper.slides[0]);
      var $slideLast = $(mySwiper.slides[slidesLenght - 1]);
      var $slideAntepenultimate = $(mySwiper.slides[slidesLenght - 3]);

      //Add translate 0sec
      mySwiper.setWrapperTranslate(0);

      if(slidesLenght < 4){
        //Hide button next
        $next.hide();
      }

      //Hide button prev
      $prev.hide();

      //"Next" button - some HTML element with "button-next" class
      $next.click(function(){
        mySwiper.swipeNext();

        if(!$slideFirst.hasClass('swiper-slide-visible')){
          $prev.show();
        }
        if($slideLast.hasClass('swiper-slide-visible') && $slideAntepenultimate.hasClass('swiper-slide-active')){
          $next.hide();
        }

      });
      //"Prev" button - some HTML element with "button-prev" class
      $prev.click(function(){
        mySwiper.swipePrev();

        if($slideFirst.hasClass('swiper-slide-visible')){
          $prev.hide();
        }
        if(!$slideLast.hasClass('swiper-slide-visible') && !$slideAntepenultimate.hasClass('swiper-slide-active')){
          $next.show();
        }

      });
    },

    
    /* Content height */

    setContentHeight: function () {
      var $process_scroll = this.element.find('.process_scroll');
      var $process_top_bar = this.element.find('.process_top_bar');
      var $process_bottom_bar = this.element.find('.process_bottom_bar');
      var $process_content = this.element.find('.process_content');
      var $prices_block = this.element.find('.process_content .prices .prices_block');
      var proccessContentPaddingBottom = parseInt($process_content.css('padding-bottom').replace('px', ''));

      var availableHeight = $('body').height() - $process_bottom_bar.outerHeight();

      /* Set the height */
      $process_scroll.css('height', availableHeight);
      $process_top_bar.css('width', $process_content.outerWidth());

      /* Figure out if the screen is big enough for the itemization (making room for the bottom padding) */
      if ((availableHeight - parseInt($process_content.css('padding-top').replace('px', ''))) < ($prices_block.height() + proccessContentPaddingBottom)) {
        if (!$prices_block.hasClass('no_follow')) {
          $prices_block.addClass('no_follow');
        }
      }
      else {
        if ($prices_block.hasClass('no_follow')) {
          $prices_block.removeClass('no_follow');
        }
      }

    },
    controlResize: function () {
      var self = this;

      $(window).on('resize.ev_checkout', function () {
        self.setContentHeight();
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
        discounts: {},
        mymiles: {},
        promotion: {},
        discountResident: {},
        discountLargeFamily: {}
      };

      var total;
      var serviceItemization = this.checkoutData['itemization'].itemization;
      var step = this.checkoutData['step'];

      if (step == 'finish') {

        if ($("li.isseat").length){

          $("li.isseat").parents().parents().siblings("dt.etiquetasientos").show();

        };

        $('.process_scroll').animate({scrollTop: $(document).height()}, 3000);

      }

      if (this.checkoutData.finalPassengers != undefined && step == 'confirm') {
        serviceItemization = this.checkoutData.finalPassengers;
      }

      self.baseFare = 0;

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
        self.baseFare += passenger.base.amount;

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
            else if (discount.discountType == 'PROMOTION') {
              itemization.promotion = {
                description: lang('general.promotional_discount'),
                amount: discount.price.amount + (itemization.promotion.amount || 0)
              };
            }
            else if (discount.discountType == 'MILES') {
              itemization.mymiles = {
                description: discount.price.description,
                amount: discount.price.amount + (itemization.mymiles.amount || 0)
              };
            }
            else if(discount.discountType == 'SERVICE_FEE_RESIDENT'){
              itemization.discountResident = {
                description: discount.price.description,
                amount: discount.price.amount + (itemization.discountResident.amount || 0)
              };
            }
            else if(discount.discountType == 'SERVICE_FEE_LARGEFAMILY'){
              itemization.discountLargeFamily = {
                description: discount.price.description,
                amount: discount.price.amount + (itemization.discountLargeFamily.amount || 0)
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
      itemization.mymiles.amount = itemization.mymiles.amount * -1;
      itemization.promotion.amount = itemization.promotion.amount * -1;
      itemization.discountLargeFamily.amount = itemization.discountLargeFamily.amount * -1;
      itemization.discountResident.amount = itemization.discountResident.amount * -1;

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

      /* Promotion */
      if (itemization.promotion.amount < 0) { /* Negative value */
        cacheHtml += '<li class="promotion" data-value="' + itemization.promotion.amount + '"><span>' + itemization.promotion.description + '</span> <strong>' + formatCurrency(itemization.promotion.amount) + '</strong></li>';
      }

      /* Resident discount */
      if (itemization.resident.amount < 0) {
        cacheHtml += '<li class="resident" data-value="' + itemization.resident.amount + '"><span>' + itemization.resident.description + '</span> <strong>' + formatCurrency(itemization.resident.amount) + '</strong></li>';
      }

      /* Large family discount */
      if (itemization.largeFamily.amount < 0) {
        cacheHtml += '<li class="large_family" data-value="' + itemization.largeFamily.amount + '"><span>' + itemization.largeFamily.description + '</span> <strong>' + formatCurrency(itemization.largeFamily.amount) + '</strong></li>';
      }

      /* Tax */
      if (itemization.tax.amount > 0) {
        cacheHtml += '<li class="tax" data-value="' + itemization.tax.amount + '"><span>' + itemization.tax.description + '</span> <strong>' + formatCurrency(itemization.tax.amount) + '</strong></li>';
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

      /* Miles Discount */
      if (itemization.mymiles.amount < 0) { /* Negative value */
        cacheHtml += '<li class="mymiles" data-value="' + itemization.mymiles.amount + '"><span>' + itemization.mymiles.description + '</span> <strong>' + formatCurrency(itemization.mymiles.amount) + '</strong></li>';
      }

      /* Large Family Discount */
      if (itemization.discountLargeFamily.amount < 0) { /* Negative value */
        cacheHtml += '<li class="fee_large_family" data-value="' + itemization.discountLargeFamily.amount + '"><span>' + itemization.discountLargeFamily.description + '</span> <strong>' + formatCurrency(itemization.discountLargeFamily.amount) + '</strong></li>';
      }

      /* Resident Discount */
      if (itemization.discountResident.amount < 0) { /* Negative value */
        cacheHtml += '<li class="fee_resident" data-value="' + itemization.discountResident.amount + '"><span>' + itemization.discountResident.description + '</span> <strong>' + formatCurrency(itemization.discountResident.amount) + '</strong></li>';
      }

      /* Append itemization to prices block */
      this.element.find('.prices .body .price_block ul').empty().append(cacheHtml);

      /* Update total */
      if (total) {
        this.element.find('.prices .body .price_total span').html(formatCurrency(total.amount));
        this.element.find('.prices .body .price_total em').text(total.currency);
      }
    },
    /* Scroll listener */

    pricesScrollListener: function () {

      var self = this;
      var $prices = this.element.find('.process_scroll .process_content .prices');
      var $topbar = this.element.find('.process_scroll .process_top_bar');

      /* Add to scroll manager the fixed bar callback */
      Bus.publish('scroll', 'bindScrollListener', {element: '#checkout .process_scroll', events: [
          {
            condition: function (scrollTop) {
              return scrollTop < $topbar.height()
            },
            yep: function () {

              if ($prices.hasClass('fixed')) {
                $prices.removeClass('fixed');
              }
            },
            nope: function () {
              if (!$prices.hasClass('fixed')) {
                $prices.addClass('fixed');
              }
            }
          }
        ]});

    },
    /* Checkout status */

    checkoutStatus: function () {

      /* Search link */
      this.element.find('.checkout_status ol li.search a').attr('href', this.checkoutData.searchHash);

      /* Click events */
      this.element.find('.checkout_status ol li a').off('click');
      this.element.find('.checkout_status ol li a').on('click', function (event) {
        var $this = $(this);
        var $li = $this.closest('li');

        if (!($li.hasClass('done') || $li.hasClass('completed'))) {
          event.preventDefault();
        }
      });
    },
    /* Cancel button */

    initCancel: function () {
      var self = this;

      if(self.element.find('.check_group.payment_method.reserve').length){
          $('.checkout_cancel').find('.transfer').show();
          $('.checkout_cancel').find('.no-transfer').hide();
      } else {
          $('.checkout_cancel').find('.transfer').hide();
          $('.checkout_cancel').find('.no-transfer').show();
      }

      /* Show cancel window */
      this.element.on('click', '.close_checkout a', function (event) {
        event.preventDefault();

        /* Show cancel window */
        self.element.find('.checkout_cancel').addClass('visible');
      });

      /* Unbind previous click events */
      this.element.off('click', '.checkout_cancel .close_dialog a, .checkout_cancel .close a');
      this.element.off('click', '.checkout_cancel .cancel_process a');

      /* Buttons inside cancel windows */
      this.element.on('click', '.checkout_cancel .close_dialog a, .checkout_cancel .close a', function (event) {
        event.preventDefault();
        event.stopPropagation();

        /* Hide cancel window */
        self.element.find('.checkout_cancel').removeClass('visible');
      });

      this.element.on('click', '.checkout_cancel .cancel_process a', function (event) {
        event.preventDefault();

        /* Get vars */
        var postSessionURL = getPostURL('checkout');
        var checkoutSession = {};

        /* Post void checkoutSession object */
        Bus.publish('ajax', 'postJson', {
          path: postSessionURL,
          data: {checkout: checkoutSession},
          success: function () {
          }
        });

        /* Update GTM */
        self.traceManager('cancel_cko', self.checkoutData, null, null);

        /* Kill process */
        Bus.publish('process', 'kill');

      });
    },
    /* Itinerary */

    toggleItinerary: function () {

      var self = this;

      this.element.find('.resume .view_itinerary').on('click', 'a', function (event) {
        event.preventDefault();

        var $a = $(this);
        var fullHeight = self.element.find('.resume .itinerary').outerHeight();
        var $resume = self.element.find('.resume');

        if ($a.closest('p').hasClass('open_itinerary')) {

          self.element.find('.resume .view_itinerary .open_itinerary').fadeOut(300, function () {
            self.element.find('.resume .view_itinerary .close_itinerary').fadeIn(300);
          });

          $resume.addClass('opened');
          $resume.stop(true, false).animate({
            'height': fullHeight
          }, 500, 'easeInOutExpo', function () {
            self.setContentHeight();

          });
        }
        else if ($a.closest('p').hasClass('close_itinerary')) {

          self.element.find('.resume .view_itinerary .close_itinerary').fadeOut(300, function () {
            self.element.find('.resume .view_itinerary .open_itinerary').fadeIn(300);
          });

          $resume.stop(true, false).animate({
            'height': 0
          }, 500, 'easeInOutExpo', function () {
            self.setContentHeight();
            $resume.removeClass('opened');
          });
        }
      });

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
    initSteps: function () {
      this.element.find('.process_scroll').steps();
    },
    /* Forms */
    initForm: function () {
      var self = this;
      var $mainForm = this.element.find('form').not('.subform');
      var userData = {};
      var step = this.element.find('.process_step').attr('data-step');

      userData = $mainForm.serializeObject();


      /* hide login box */
      (step != 'passengers') ? $('.checkout_block.login').slideUp() : $('.checkout_block.login').slideDown();

      var errorsForm = [];
      $mainForm.form({
        onError: function (form) {

          /*check if is finnish step*/
          errorsForm = (form.element.parent().hasClass('finish'))
                  ? ['CondicionesCompra', 'ComunicacionesComerciales'] : self.getErrorsInForm(form.element);

          /* gtm trace errors */
          self.traceManager('error_form', self.checkoutData, null, null, errorsForm, form.element.parent().attr('data-step'));

          self.showFormError(form.element);
        },
        onSubmit: function (form) {
          var nextStep = form.element.closest('.process_step').attr('data-next');
          var postSessionURL = getPostURL('checkout');
          var checkoutSession = {};
          var doSubmit = true;

          var checkoutProcessURL = getProcessUrl('checkout');
          var $checkGroup = $mainForm.find('.check_group.payment_method.valid.opened');

          //Si el usuario esta logado, comprobamos que la cuenta siga activa
          if (User.isLoggedIn()) {
        	  Bus.publish('services', 'check_user_status', {
        		  failure: function () {

        			  self.element.find('.user_info_miles').addClass('hidden');

        			  /* Show the dialog error*/
        			  self.element.find('.process_wrapper').ui_dialog({
        				  title: lang('general.info_error_title'),
        				  error: true,
        				  xxl: true,
        				  subtitle: lang('checkout.user_check_error'),
        				  buttons: [
        				            {
        				            	className: 'close',
        				            	href: '#',
        				            	label: lang('checkout.user_close')
        				            }
        				           ]
        			  });

        		  }
        	  });
          }

          /* Set selected payment method on form hidden input */
          $mainForm.find('.payment_method_type').val($checkGroup.attr('data-method'));

          if(step == "payment") {

          	if($checkGroup.hasClass("credit_card")) {
  	        	var documentField = self.element.find('input#field_credit_card_document_number');
            	var documentFieldDiv = documentField.closest(".field");
            	var passengers = self.checkoutData.calculatePassengers;
            	var message = lang('checkout.payment_document_child_error');
    	  			var document = $(documentField).val();
    	  			for(var i = 0; i < passengers.length;i++) {
    	  				if(document.toUpperCase() == passengers[i].identificationDocument.identity.toUpperCase() && (passengers[i].passengerType == "CHILD" || passengers[i].passengerType == "INFANT")) {
    	  					/* Update error hints */
    	  					documentFieldDiv.trigger('show_error', [message]);

    	  	        /* Set classes to show the error */
    	  					documentFieldDiv.addClass('error').removeClass('valid initial_status');

    	  					doSubmit = false;

    	  					/*check if is finnish step*/
  		            errorsForm = self.getErrorsInForm(form.element);

  		            /* gtm trace errors */
  		            self.traceManager('error_form', self.checkoutData, null, null, errorsForm, form.element.parent().attr('data-step'));

  		            self.showFormError(form.element);
    	  				}
    	  			}
          	}

            if($checkGroup.hasClass("paypal")) {
              var documentField = self.element.find('input#field_paypal_document_number');
                var documentFieldDiv = documentField.closest(".field");
                var passengers = self.checkoutData.calculatePassengers;
                var message = lang('checkout.payment_document_child_error');
            var document = $(documentField).val();
            for(var i = 0; i < passengers.length;i++) {
              if(document.toUpperCase() == passengers[i].identificationDocument.identity.toUpperCase() && (passengers[i].passengerType == "CHILD" || passengers[i].passengerType == "INFANT")) {
                /* Update error hints */
                documentFieldDiv.trigger('show_error', [message]);

                        /* Set classes to show the error */
                documentFieldDiv.addClass('error').removeClass('valid initial_status');

                doSubmit = false;

                 /*check if is finnish step*/
                      errorsForm = self.getErrorsInForm(form.element);

                      /* gtm trace errors */
                      self.traceManager('error_form', self.checkoutData, null, null, errorsForm, form.element.parent().attr('data-step'));

                      self.showFormError(form.element);
              }
            }
            }
            if($checkGroup.hasClass("promotion_paypal")) {
              var documentField = self.element.find('input#field_paypal_promo_document_number');
                var documentFieldDiv = documentField.closest(".field");
                var passengers = self.checkoutData.calculatePassengers;
                var message = lang('checkout.payment_document_child_error');
            var document = $(documentField).val();
            for(var i = 0; i < passengers.length;i++) {
              if(document.toUpperCase() == passengers[i].identificationDocument.identity.toUpperCase() && (passengers[i].passengerType == "CHILD" || passengers[i].passengerType == "INFANT")) {
                /* Update error hints */
                documentFieldDiv.trigger('show_error', [message]);

                        /* Set classes to show the error */
                documentFieldDiv.addClass('error').removeClass('valid initial_status');

                doSubmit = false;

                 /*check if is finnish step*/
                      errorsForm = self.getErrorsInForm(form.element);

                      /* gtm trace errors */
                      self.traceManager('error_form', self.checkoutData, null, null, errorsForm, form.element.parent().attr('data-step'));

                      self.showFormError(form.element);
              }
            }
            }
            if($checkGroup.hasClass("promotion")) {
              var documentField = self.element.find('input#field_promotion_card_document_number');
                var documentFieldDiv = documentField.closest(".field");
                var passengers = self.checkoutData.calculatePassengers;
                var message = lang('checkout.payment_document_child_error');
            var document = $(documentField).val();
            for(var i = 0; i < passengers.length;i++) {
              if(document.toUpperCase() == passengers[i].identificationDocument.identity.toUpperCase() && (passengers[i].passengerType == "CHILD" || passengers[i].passengerType == "INFANT")) {
                /* Update error hints */
                documentFieldDiv.trigger('show_error', [message]);

                        /* Set classes to show the error */
                documentFieldDiv.addClass('error').removeClass('valid initial_status');

                doSubmit = false;

                 /*check if is finnish step*/
                      errorsForm = self.getErrorsInForm(form.element);

                      /* gtm trace errors */
                      self.traceManager('error_form', self.checkoutData, null, null, errorsForm, form.element.parent().attr('data-step'));

                      self.showFormError(form.element);
              }
            }
            }
            if($checkGroup.hasClass("ae")) {
              var documentField = self.element.find('input#field_ae_card_document_number');
                var documentFieldDiv = documentField.closest(".field");
                var passengers = self.checkoutData.calculatePassengers;
                var message = lang('checkout.payment_document_child_error');
            var document = $(documentField).val();
            for(var i = 0; i < passengers.length;i++) {
              if(document.toUpperCase() == passengers[i].identificationDocument.identity.toUpperCase() && (passengers[i].passengerType == "CHILD" || passengers[i].passengerType == "INFANT")) {
                /* Update error hints */
                documentFieldDiv.trigger('show_error', [message]);

                        /* Set classes to show the error */
                documentFieldDiv.addClass('error').removeClass('valid initial_status');

                doSubmit = false;

                 /*check if is finnish step*/
                      errorsForm = self.getErrorsInForm(form.element);

                      /* gtm trace errors */
                      self.traceManager('error_form', self.checkoutData, null, null, errorsForm, form.element.parent().attr('data-step'));

                      self.showFormError(form.element);
              }
            }
            }

          	if($checkGroup.hasClass("mymiles")) {
  	  			  var documentField = self.element.find('input#field_mymiles_card_document_number');
            	var documentFieldDiv = documentField.closest(".field");
            	var passengers = self.checkoutData.calculatePassengers;
            	var message = lang('checkout.payment_document_child_error');
    	  			var document = $(documentField).val();
    	  			for(var i = 0; i < passengers.length;i++) {
    	  				if(document.toUpperCase() == passengers[i].identificationDocument.identity.toUpperCase() && (passengers[i].passengerType == "CHILD" || passengers[i].passengerType == "INFANT")) {
    	  					/* Update error hints */
    	  					documentFieldDiv.trigger('show_error', [message]);

    	  	        /* Set classes to show the error */
    	  					documentFieldDiv.addClass('error').removeClass('valid initial_status');

    	  					doSubmit = false;

    	  					/*check if is finnish step*/
  		            errorsForm = self.getErrorsInForm(form.element);

  		            /* gtm trace errors */
  		            self.traceManager('error_form', self.checkoutData, null, null, errorsForm, form.element.parent().attr('data-step'));

  		            self.showFormError(form.element);
    	  				}
    	  			}
          	}
          }

          if(doSubmit) {
	          /* Start widget animation */
	          self.element.find('.process_scroll').steps('showLoading', function () {

              if(step == 'payment'){
                /* Removing close button */
                self.element.find('.close_checkout').remove();
              }

	            /* Compose post object */
	            checkoutSession = self.addFormData(form.element);

	            /* Call to services to send data, calc scoring... */
	            self.addServiceData(step, checkoutSession, function (checkoutSession, goToNextStep, showScoring, message, errors) {

	              Bus.publish('ajax', 'postJson', {
	                path: postSessionURL,
	                data: {checkout: checkoutSession},
	                success: function () {

	                  if (!form.element.hasClass('standalone')) {
	                    /* Attribute to control sate error continue by submitting the form with the button */
	                    if (goToNextStep) {
	                      //console.log("Continuamos");
	                      /* Set the status bar as completed */
	                      self.element.find('.checkout_status .steps .' + step).addClass('completed');

	                      /* Change URL */
	                      Bus.publish('hash', 'change', {hash: checkoutProcessURL + '/' + nextStep});
	                    }
	                    else {
	                      if (showScoring) {
	                        /* Update GTM */
	                        self.traceManager('cko_callmeback', checkoutSession, null, null);

	                        self.showCallMeBack();
	                        self.element.find('.process_scroll').steps('showErrors');
	                      }
	                      else {
	                        if (errors) {
	                          if (step == 'payment') {
	                            if (errors.saraError) {
	                              /* SARA error - show sara popup */
	                              /* Download the popup template */
	                              Bus.publish('ajax', 'getTemplate', {
	                                data: self.saraTemplateData,
	                                path: eval('AirEuropaConfig.templates.checkout.sara_error'),
	                                success: function (template) {

	                                  /* Show the dialog error with the sara template */
	                                  $('#checkout').find('.process_wrapper').ui_dialog({
	                                    title: lang('general.error_title'),
	                                    error: false,
	                                    xxl: true,
	                                    with_scroll: true,
	                                    content: template,
	                                    title: lang('checkout.sara_dialog_title'),
	                                            subtitle: lang('checkout.sara_dialog_subtitle'),
	                                    buttons: [
	                                      {
	                                        className: 'continue',
	                                        href: '#',
	                                        label: lang('checkout.sara_dialog_verify')
	                                      }
	                                    ],
	                                    render: function ($dialog) {
	                                      /* By default, show the last step behind the popup */
	                                      self.element.find('.process_scroll').steps('showErrors');

	                                      /* Call the document type function to manage popup document type fields */
	                                      self.documentType(false);

	                                      /* Init the form inside the dialog */
	                                      $dialog.find('.standard_form').form({
	                                        onSubmit: function (form) {
	                                          /* Save the data */
	                                          self.saraData = $dialog.find('.standard_form').serializeObject();

	                                          /* Submit again the main form */
	                                          $mainForm.submit();

	                                          /* Close this dialog */
	                                          $dialog.fadeOut(300);
	                                        }
	                                      });

	                                      /* Trigger document_type change to start number validation */
	                                      $dialog.find('.standard_form .document_type select').change();
	                                      $dialog.find('.standard_form .document_number').addClass('filled');
	                                      $dialog.find('.standard_form .document_number input').trigger('validate');

	                                      /* Continue button */
	                                      $dialog.find('.continue a, .close_dialog a').click(function (event) {

	                                        $dialog.find('.standard_form').submit();

	                                        event.stopPropagation();
	                                        event.preventDefault();
	                                      });
	                                    }
	                                  });
	                                }
	                              });
	                            }
	                            else if (errors.goToHome) {

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
	                                ],
	                                render: function ($dialog) {
	                                  /* By default, show the last step behind the popup */
	                                  self.element.find('.process_scroll').steps('showErrors');

	                                  /* Continue button */
	                                  $dialog.find('.close a, .close_dialog a').click(function (event) {

	                                    /* Kill the session */
	                                    Bus.publish('ajax', 'postJson', {
	                                      path: postSessionURL,
	                                      data: {checkout: {}},
	                                      success: function () {
	                                      }
	                                    });

	                                    /* Kill process and go home */
	                                    Bus.publish('process', 'kill');

	                                    event.stopPropagation();
	                                    event.preventDefault();
	                                  });
	                                }
	                              });
	                            }
	                            else if (errors.paypal) {
	                              /* Paypal error - go back to payment screen */
	                              Bus.publish('hash', 'change', {hash: checkoutProcessURL + '/payment'});
	                            }
	                            else {
	                              /* Payment error - go back to payment screen */
	                              //console.log("Deberíamos volver al paso anterior y sacar los mensajes de error");
	                              Bus.publish('hash', 'change', {hash: checkoutProcessURL + '/payment'});
	                              self.lastStepErrors = errors;
	                            }
	                          }
	                          else if (step == 'passengers' && errors.invalidPassengers) {
	                            var viewErrorsFinal = [];
	                            var warningArray = [];
	                            $.each(errors.invalidPassengers, function (errorIndex, errorData) {
	                              var secondSurname = typeof (self.checkoutData.passengers[(errorData.number - 1)].info.surname_2) != 'undefined' ? ' ' + self.checkoutData.passengers[(errorData.number - 1)].info.surname_2 : '';
	                              var passengerString = self.checkoutData.passengers[(errorData.number - 1)].info.surname_1 + secondSurname + ', ' + self.checkoutData.passengers[(errorData.number - 1)].info.name;
	                              /* Remove SATE document number of passenger from session cache */
	                              checkoutSession.passengers[(errorData.number - 1)].info.sate_document_number = null;
	                              $.each(errorData.passengerWarningsType, function (indexWarning, dataWarning) {
	                                if (errors.codes[indexWarning].code == dataWarning) {
	                                  warningArray.push(errors.codes[indexWarning].description);
	                                }
	                              });
	                              var lineMessage = warningArray.join(', ');
	                              viewErrorsFinal[errorIndex] = {
	                                'passenger': passengerString,
	                                'description': lineMessage
	                              };
	                            });

	                            /* Download the popup template */
	                            Bus.publish('ajax', 'getTemplate', {
	                              data: viewErrorsFinal,
	                              path: eval('AirEuropaConfig.templates.checkout.add_passenger_error'),
	                              success: function (template) {
	                                /* By default, show the last step behind the popup */
	                                self.element.find('.process_scroll').steps('showErrors');

	                                /* Show an error */
	                                $('#checkout').ui_dialog({
	                                  title: lang('general.error_title'),
	                                  error: true,
	                                  content: template,
	                                  subtitle: message,
	                                  close: {
	                                    behaviour: 'close',
	                                    href: '#'
	                                  },
	                                  buttons: [
	                                    {
	                                      className: 'cancel',
	                                      href: '#',
	                                      label: lang('general.back')
	                                    },
	                                    {
	                                      className: 'continue',
	                                      href: '#',
	                                      label: lang('general.continue')
	                                    }
	                                  ],
	                                  render: function ($dialog) {
	                                    /* Buttons behaviour */
	                                    $dialog.find('.cancel a').on('click', function (event) {
	                                      event.preventDefault();
	                                      $dialog.find('.close_dialog').find('a').click();
	                                    });
	                                    $dialog.find('.continue a').on('click', function (event) {
	                                      event.preventDefault();
	                                      $dialog.find('.close_dialog').find('a').click();
	                                      /* Set the status bar as completed */
	                                      self.element.find('.checkout_status .steps .' + step).addClass('completed');
	                                      self.element.find('.process_scroll').steps('showLoading');
	                                      /* Change URL */
	                                      Bus.publish('hash', 'change', {hash: checkoutProcessURL + '/' + nextStep});
	                                    });
	                                  }
	                                });
	                              }
	                            });
	                          }
	                          else {
	                            self.showFieldErrors(form.element, step, errors);
	                            self.element.find('.process_scroll').steps('showErrors');
	                          }
	                        }
	                        else {
	                          // console.log("diálogo de error")
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

	                          self.element.find('.process_scroll').steps('showErrors');
	                        }

	                      }
	                    }
	                  }

	                  form.element.removeClass('standalone');
	                },
	                failure: function () {
	                  /* Session error */
	                  $('#checkout').ui_dialog({
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

	          });
	        }
        }
      });

    },
    traceManager: function (step, checkoutSession, errorCode, seatType, errorsForm, formName) {
      var self = this;

      /* Prepare flags for luggage and seats info for tag manager */
      var equipageIda = false;
      var equipageVuelta = false;
      var asientoIda = false;
      var asientoVuelta = false;

      if (checkoutSession && checkoutSession.servicePassengers) {
        _.each(checkoutSession.servicePassengers, function (passenger, index, list) {

          /* Look for luggage extra in any passenger */
          if (passenger.extras &&
                  passenger.extras.luggage) {
            if (passenger.extras.luggage.amount != '0' && passenger.extras.luggage.journey == 'ONEWAY')
              equipageIda = true;
            if (passenger.extras.luggage.amount != '0' && passenger.extras.luggage.journey == 'RETURNWAY')
              equipageVuelta = true;
            if (passenger.extras.luggage.amount != '0' && passenger.extras.luggage.journey == 'ROUNDTRIP') {
              equipageIda = true;
              equipageVuelta = true;
            }
          }

          /* Look for luggage extra in any passenger */
          if (passenger.seats) {
            if (passenger.seats.ow) {
              _.each(passenger.seats.ow, function (item, index, list) {
                if (item.column != '' && item.number != '')
                  asientoIda = true;
              });

            }
            if (passenger.seats.rt) {
              _.each(passenger.seats.rt, function (item, index, list) {
                if (item.column != '' && item.number != '')
                  asientoVuelta = true;
              });
            }
          }
        });
      }

      /* Update Google tag manager */
      if (market.toUpperCase() === "US") {
        updateGtm({
          'ow': (checkoutSession.resultsParams.rt != 'false') ? 'N' : 'S',
          'business': (checkoutSession.resultsParams.business == 'true') ? 'BUS' : 'TUR',
          'origen': checkoutSession.resultsParams.from,
          'destino': checkoutSession.resultsParams.to,
          'fechaida': checkoutSession.resultsParams.ow,
          'fecharegreso': (checkoutSession.resultsParams.rt != 'false') ? checkoutSession.resultsParams.rt : '',
          'residente': (checkoutSession.resultsParams.resident == 'true') ? 'S' : 'N',
          'numpax': parseInt(checkoutSession.resultsParams.adults) + parseInt(checkoutSession.resultsParams.kids) + parseInt(checkoutSession.resultsParams.babies),
          'asientoida': asientoIda ? 'S' : 'N',
          'asientovuelta': asientoVuelta ? 'S' : 'N',
          'equipajeida': equipageIda ? 'S' : 'N',
          'equipajevuelta': equipageVuelta ? 'S' : 'N',
          'opcioncambio': (checkoutSession.extras && checkoutSession.extras.journeyRelated && checkoutSession.extras.journeyRelated.change && checkoutSession.extras.journeyRelated.change == '1') ? 'S' : 'N',
          'seguro': (checkoutSession.extras && checkoutSession.extras.journeyRelated && checkoutSession.extras.journeyRelated.insurance) ? checkoutSession.extras.journeyRelated.insurance : '',
          'divisa': window.appConfig.currentCurrency.code || 'EUR',
          'mercado': window.market,
          'pageArea': 'Comprar vuelos',
          'pageCategory': 'Checkout',
          'pageContent': self.getPageContent(step, errorCode, seatType, formName),
          'errors': (errorsForm) ? errorsForm : []
        });
      } else {
        updateGtm({
          'ow': (typeof checkoutSession.resultsParams.dateArrival != 'undefined') ? 'N' : 'S',
          'origen': checkoutSession.resultsParams.airportDeparture,
          'destino': checkoutSession.resultsParams.airportArrival,
          'fechaida': checkoutSession.resultsParams.dateDeparture,
          'fecharegreso': (typeof checkoutSession.resultsParams.dateArrival != 'undefined') ? checkoutSession.resultsParams.dateArrival : '',
          'residente': (checkoutSession.resultsParams.paxAdultResident > 0) ? 'S' : 'N',
          'numpax': parseInt(checkoutSession.resultsParams.paxAdult) + parseInt(checkoutSession.resultsParams.paxChild) + parseInt(checkoutSession.resultsParams.paxInfant) + parseInt(checkoutSession.resultsParams.paxAdultResident) + parseInt(checkoutSession.resultsParams.paxChildResident) + parseInt(checkoutSession.resultsParams.paxInfantResident),
          'asientoida': asientoIda ? 'S' : 'N',
          'asientovuelta': asientoVuelta ? 'S' : 'N',
          'equipajeida': equipageIda ? 'S' : 'N',
          'equipajevuelta': equipageVuelta ? 'S' : 'N',
          'opcioncambio': (checkoutSession.extras && checkoutSession.extras.journeyRelated && checkoutSession.extras.journeyRelated.change && checkoutSession.extras.journeyRelated.change == '1') ? 'S' : 'N',
          'seguro': (checkoutSession.extras && checkoutSession.extras.journeyRelated && checkoutSession.extras.journeyRelated.insurance) ? checkoutSession.extras.journeyRelated.insurance : '',
          'divisa': window.appConfig.currentCurrency.code || 'EUR',
          'mercado': window.market,
          'pageArea': 'Comprar vuelos',
          'pageCategory': 'Checkout',
          'pageContent': self.getPageContent(step, errorCode, seatType, formName),
          'errors': (errorsForm) ? errorsForm : []
        });
      }
    },
    getPageContent: function (step, code, seatType, formName) {
      var result = '';

      if (step != 'cko_error') {
        switch (step) {

          case "cko_callmeback":
            result = 'Call me back';
            break;

          case "show_seats_pe":
            result = 'Selección de asiento PE ' + seatType;
            break;

          case "show_seats":
            result = 'Selección de asiento ' + seatType;
            break;

          case "error_form":
            result = 'Error en el formulario ' + formName;
            break;

          default:
            result = 'Cancelar proceso de compra';
        }
      }
      else {
        switch (code) {
          case "4223":
            result = 'Error_' + code + '. Sesion no valida';
            break;

          case "4224":
            result = 'Error_' + code + '. No se pudo confirmar la reserva';
            break;

          case "4225":
            result = 'Error_' + code + '. No se pudo realizar la reserva';
            break;

          case "4230":
          case "4236":
            result = 'Error_' + code + '. Ya ha realizado el pago';
            break;

          case "4263":
            result = 'Error_' + code + '. Ha superado el tiempo';
            break;

          case "4048":
            result = 'Error_' + code + '. No existe ninguna reserva para esta sesion';
            break;

          case "5200":
            result = 'Error_' + code + '. Error en la selección de asientos';
            break;

          case "11000":
            result = 'Error_' + code + '. Inserción de un código de promoción que no exista o este dado de baja o caducado';
            break;

          case "11001":
            result = 'Error_' + code + '. El código de la promoción está inactivo';
            break;

          case "4610":
            result = 'Error_' + code + '. Error en el cobro denegado por el banco';
            break;

          default:
            result = 'checkout';
        }
      }

      return result;
    },
    showFormError: function ($form) {
      var $content = this.element.find('.process_scroll');
      var $field = $form.find('.field.error').not('.disabled');

      /* Show the messages */
      $form.addClass('error');
      if ($form.find('.block_body .form_error').length == 0) {
        $form.find('.block_body').not('.info').prepend('<div class="form_error"><div class="error_message"><p>' + lang('general.formError') + '</p></div></div>');
      }
      $form.find('.initial_status').not('.disabled').removeClass('initial_status');

      /* Scroll to the top of the form to show the error */
      Bus.publish('scroll', 'scrollTo', {element: $content.get(), position: $field.position().top});
    },
    showFieldErrors: function ($form, step, errors) {
      var self = this;

      // console.log(errors);
      // console.log(step);
      // console.log("El fieldset abierto: ");
      // console.log(self.element.find('fieldset.payment_method.opened'));

      // console.log("Marcamos errores");
      $.each(errors, function (indexError, error) {
        if (step == 'passengers') {

          /* Get type and index */
          var type = error.field.substr(0, error.field.indexOf('['));
          var index = error.field.substr(error.field.indexOf('[') + 1, 1);
          var field = error.field.substr(error.field.indexOf(']') + 2);

          /* Convert type and index */
          var passengerNumber, passengerType;

          if (index) {
            passengerNumber = parseInt(index);
          }

          if (type == 'adultPassengers')
            passengerType = 'adult';
          else if (type == 'childPassengers')
            passengerType = 'kid';
          else if (type == 'infantPassengers')
            passengerType = 'baby';

          /* Get fieldset and field */
          var $passengerFieldset = self.element.find('fieldset.passenger.' + passengerType).eq(passengerNumber);
          var $errorField = $passengerFieldset.find('[data-service-name=' + field + ']').closest('.field');
        }
        else {
          /* Get type */
          var field = error.field.replace(/\./g, '_');

          /* Get fieldset and field */
          var $fieldset = self.element.find('fieldset.payment_method.opened');
          // console.log($fieldset.length)
          var $errorField = $fieldset.find('[data-service-name=' + field + ']').closest('.field');
        }

        /* Show error and set message */
        $errorField.trigger('show_error', [error.message]);
        $errorField.addClass('error').removeClass('valid initial_status');

        /* Show form error */
        self.showFormError($form);

      });
    },
    addFormData: function ($form) {
      var postObject = {};

      /* Compose object to post to the object */
      postObject = this.checkoutData;

      /* Get the data from the user form */
      userData = $form.serializeObject();
      step = userData.step;

      /* Delete services to send to session */
      postObject.services = null;
      postObject.user_info = null;
      postObject.frequent_payment = null;

      /* frequent_passengers info will be deleted only is step is different than 'passengers', to avoid loose data if service returns error */
      if (step != 'passengers') {
        postObject.frequent_passengers = null;
      }

      /* Restart sendSaraData */
      //postObject.sendSaraData = false;

      /* Add the data needed in every step */
      if (step == 'passengers') {

        /* Name and surname of each passenger to uppercase */
        _.each(userData.passengers, function (passenger, index, list) {
          passenger.info.name      = passenger.info.name.toUpperCase();
          passenger.info.surname_1 = passenger.info.surname_1.toUpperCase();
          passenger.info.surname_2 = passenger.info.surname_2.toUpperCase();
        });

        postObject.passengers = userData.passengers;
      }
      else if (step == 'extras') {
        //console.log("Post passengers");
        //console.log(postObject.passengers);

        //console.log(userData);

        if (userData.servicePassengers) {
          for (var index in userData.servicePassengers) {
            var servicePassenger = userData.servicePassengers[index];

            //console.log(index);
            // postObject.servicePassengers[index].seats = servicePassenger.seats;
            postObject.servicePassengers[index].extras = servicePassenger.extras;
          }
        }

        postObject.extras = userData.extras;
        postObject.ancillaries = this.ancillariesServiceObject;
      }
      else if (step == 'payment') {

        if(!window.paypalPayment){
          userData.payment.credit_card = (userData.payment_type == 'credit_card') ? 1 : 0;
          userData.payment.ae_card = (userData.payment_type == 'ae_card') ? 1 : 0;
          userData.payment.reserve = (userData.payment_type == 'reserve') ? 1 : 0;
          userData.payment.myae = (userData.payment_type == 'myae') ? 1 : 0;
          userData.payment.promotion = (userData.payment_type == 'promotion') ? 1 : 0;
          userData.payment.paypal = (userData.payment_type == 'paypal') ? 1 : 0;
          userData.payment.mymiles = (userData.payment_type == 'mymiles') ? 1 : 0;
          userData.payment.promotion_paypal = (userData.payment_type == 'promotion_paypal') ? 1 : 0;

          /* Clean card details if it's paid with a saved card */
          if (userData.payment_type == 'credit_card') {
            if (userData.payment.credit_card_hashId) {
              userData.payment.credit_card_type = "";
              userData.payment.credit_card_number = "";
            }
          }

          if (userData.payment_type == 'mymiles') {
            if (userData.payment.mymiles_credit_card_hashId) {
              userData.payment.mymiles_card_type = "";
              userData.payment.mymiles_card_number = "";
            }
          }

          if (userData.payment_type == 'promotion') {
            if (userData.payment.promotion_card_hashId) {
              userData.payment.promotion_card_type = "";
              userData.payment.promotion_card_number = "";
            }
          }

          postObject.sendComunication = (userData.field_comunication == 'on') ? "NONE" : "ONLY_AIREUROPA";

          postObject.sendSaraData = false;
          postObject.payment = userData.payment;

        }else{
          postObject.sendSaraData = false;
          // postObject.payment = checkoutSession.payment;
        }


        if(this.saraData != undefined){
          postObject.saraData = this.saraData;
          postObject.sendSaraData = true;
        }
      }
//      else if (step == 'finish' && this.saraData != undefined) {
//        postObject.saraData = this.saraData;
//        postObject.sendSaraData = true;
//      }

      return postObject;

    },
    addServiceData: function (step, checkoutSession, callback) {
      var self = this;

      if (step == 'passengers') {
        Bus.publish('services', 'postPassengers', {
          checkoutSession: checkoutSession,
          sessionId: self.element.find('.process_step').attr('data-sessionId'),
          success: function (data) {
            var goToNextStep = !(data.header.error == true);
            var code = data.header.code;
            var message = data.header.message;
            var errors;

            if (goToNextStep) {
              checkoutSession['passengers_added'] = true;
            }
            else {
              checkoutSession['passengers_added'] = false;

              if (code == 400 || code == 6001) {
                errors = data.body.data;

                /* Add passenger to true */
                if (code == 6001) {
                  checkoutSession['passengers_added'] = true;
                }
              }
            }

            callback(checkoutSession, goToNextStep, false, message, errors);
          }
        });
      }
      else if (step == 'extras') {
        Bus.publish('services', 'postAncillaries', {
          postObject: this.ancillariesServiceObject,
          sessionId: self.element.find('.process_step').attr('data-sessionId'),
          success: function (ancillariesData) {
            var goToNextStep = !(ancillariesData.header.error == true);
            var message = ancillariesData.header.message;

            /* The ancillaries are post successfully, so get the payment methods to evaluate scoring and go to the next step */
            if (goToNextStep) {
              callback(checkoutSession, goToNextStep, false, message, undefined);

              // Bus.publish('services', 'getPaymentMethods', {
              //   checkoutSession: checkoutSession,
              //   sessionId: self.element.find('.process_step').attr('data-sessionId'),
              //   success: function(data) {

              //     var goToNextStep = !(data.header.error == true);
              //     var showScoring = (data.header.code == 4025);
              //     var message = data.header.message;

              //     /* Save payment methods in checkoutSession object */
              //     if (goToNextStep) {
              //       checkoutSession['methods'] = data.body.data;
              //     }

              //     /* Save a scoring flag */
              //     if (showScoring) {
              //       checkoutSession['scoring1'] = false;
              //     }
              //     else {
              //       checkoutSession['scoring1'] = true;
              //     }

              //     callback(checkoutSession, goToNextStep, showScoring, message, undefined);
              //   }
              // });
            }
            else {
              self.element.find('.process_scroll').steps('showErrors');
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

          }
        });
      }
//      else if (step == 'payment') {
//        Bus.publish('services', 'postPaymentData', {
//          checkoutSession: checkoutSession,
//          sessionId: self.element.find('.process_step').attr('data-sessionId'),
//          success: function (data) {
//            var goToNextStep = !(data.header.error == true);
//            var showScoring = (data.header.code == 4025);
//            var code = data.header.code;
//            var message = data.header.message;
//            var errors;
//
//            /* Save payment info in checkoutSession object */
//            if (goToNextStep) {
//              checkoutSession['paymentInfo'] = data.body.data.paymentInfo;
////              checkoutSession['calculatePassengers'] = data.body.data.passengerInfo;
//              checkoutSession['constraintESTA'] = data.body.data.journeyConstraint;
//
//              /* Get SATE document of checkoutSession object to put in passengerInfo service response */
//              // $.each(data.body.data.passengerInfo, function(indexP, dataP){
//              //   checkoutSession['calculatePassengers'][indexP]['sateDocument'] = checkoutSession.passengers[indexP].info.sate_document_number;
//              // });
//
//              /* Add extra and seats objects from servicePassengers global object, so they can be available in the next screen */
//              $.each(checkoutSession['calculatePassengers'], function (indexPassenger, passenger) {
//                if (passenger.identity != null) {
//                  var extrasPassenger = self.getExtraPassengersByIdentity(passenger.identity);
//
//                  checkoutSession['calculatePassengers'][indexPassenger].extras = extrasPassenger.extras;
//                  checkoutSession['calculatePassengers'][indexPassenger].seats = extrasPassenger.seats;
//                  checkoutSession['calculatePassengers'][indexPassenger].seatsLength = window.objectLength(extrasPassenger.seats.ow) + window.objectLength(extrasPassenger.seats.rt);
//                }
//              });
//            }
//
//            /* Save a scoring flag */
//            if (showScoring) {
//              checkoutSession['scoring2'] = false;
//            }
//            else {
//              checkoutSession['scoring2'] = true;
//
//              if (code == 400) {
//                errors = data.body.data;
//              }
//            }
//
//            callback(checkoutSession, goToNextStep, showScoring, message, errors);
//          }
//        });
//      }
      else if (step == 'payment') {
        if (!checkoutSession.sendSaraData) {
          Bus.publish('services', 'postPayment', {
            checkoutSession: checkoutSession,
            sessionId: self.element.find('.process_step').attr('data-sessionId'),
            success: function (data) {
              var goToNextStep = !(data.header.error == true);
              var message = data.header.message;
              var code = data.header.code;
              var showScoring = (data.header.code == 4025);
              var errors;

              /* Save a scoring flag */
              if (showScoring) {
                checkoutSession['scoring2'] = false;
              }
              else {
                checkoutSession['scoring2'] = true;

                if (code == 400) {
                  errors = data.body.data;
                }
              }

              /* Save booking data */
              if (goToNextStep) {
                /* PayPal payment redirection */
                if (code === 4055) {
                  var postSessionURL = getPostURL('checkout');

                  Bus.publish('ajax', 'postJson', {
                    path: postSessionURL,
                    data: {checkout: checkoutSession},
                    success: function () {
                      window.location.href = data.body.data.redirectTo;
                    }
                  });

                  return;
                }
                else {

                  checkoutSession['finalPaymentInfo'] = data.body.data.summary.paymentInfo;
                  checkoutSession['booking'] = data.body.data.summary.booking;
                  checkoutSession['finalPassengers'] = data.body.data.summary.passengers;
                  checkoutSession['totalInEuros'] = data.body.data.summary.totalInEuros;
                  checkoutSession['postConfirmEvents'] = data.body.data.postConfirmEvents;
                  checkoutSession['loyaltyMiles'] = data.body.data.summary.loyaltyMiles;

                  /* Get SATE document of checkoutSession object to put in passengerInfo service response */
                  // $.each(data.body.data.summary.passengers, function(indexP, dataP){
                  //   checkoutSession['finalPassengers'][indexP]['sateDocument'] = checkoutSession.passengers[indexP].info.sate_document_number;
                  // });

                  /* Add extra and seats objects from servicePassengers global object, so they can be available in the next screen */
                  $.each(checkoutSession['finalPassengers'], function (indexPassenger, passenger) {
                    if (passenger.identity != null) {
                      var extrasPassenger = self.getExtraPassengersByIdentity(passenger.identity);

                      checkoutSession['finalPassengers'][indexPassenger].extras = extrasPassenger.extras;
                      checkoutSession['finalPassengers'][indexPassenger].seats = extrasPassenger.seats;
                      checkoutSession['finalPassengers'][indexPassenger].seatsLength = window.objectLength(extrasPassenger.seats.ow) + window.objectLength(extrasPassenger.seats.rt);
                    }
                  });
                }
              }
              else {
                if (code == 400) {
                  errors = data.body.data;
                }
                else if (code == 409 || code == 6023) {
                  /* Get the error body, including all fields, to use in the callback method */
                  errors = {};
                  errors.saraError = true;
                  self.saraTemplateData = data.body.data;
                }
                else if (code == 4223 || code == 4224 || code == 4225 || code == 4230 || code == 4236 || code == 4048 || code == 4263) {
                  /* Update GTM */
                  self.traceManager('cko_error', checkoutSession, code, null);

                  errors = {};
                  errors.goToHome = true;
                }
                else if (code === 4610) {
                  /* Update GTM */
                  self.traceManager('cko_error', checkoutSession, code.toString(), null);
                }

              }

              callback(checkoutSession, goToNextStep, showScoring, message, errors);
            }
          });
        }
        else {
          Bus.publish('services', 'putPaymentWithSara', {
            checkoutSession: checkoutSession,
            sessionId: self.element.find('.process_step').attr('data-sessionId'),
            success: function (data) {
              var goToNextStep = !(data.header.error == true);
              var message = data.header.message;
              var code = data.header.code;
              var showScoring = (data.header.code == 4025);
              var errors;

              /* Save a scoring flag */
              if (showScoring) {
                checkoutSession['scoring2'] = false;
              }
              else {
                checkoutSession['scoring2'] = true;

                if (code == 400) {
                  errors = data.body.data;
                }
              }

              /* Save booking data */
              if (goToNextStep) {
                /* PayPal payment redirection */
                if (code === 4055) {
                  var postSessionURL = getPostURL('checkout');

                  Bus.publish('ajax', 'postJson', {
                    path: postSessionURL,
                    data: {checkout: checkoutSession},
                    success: function () {
                      window.location.href = data.body.data.redirectTo;
                      return;
                    }
                  });
                }
                else {

                  checkoutSession['finalPaymentInfo'] = data.body.data.summary.paymentInfo;
                  checkoutSession['booking'] = data.body.data.summary.booking;
                  checkoutSession['finalPassengers'] = data.body.data.summary.passengers;
                  checkoutSession['totalInEuros'] = data.body.data.summary.totalInEuros;
                  checkoutSession['postConfirmEvents'] = data.body.data.postConfirmEvents;
                  checkoutSession['loyaltyMiles'] = data.body.data.summary.loyaltyMiles;

                  /* Add extra and seats objects from servicePassengers global object, so they can be available in the next screen */
                  $.each(checkoutSession['finalPassengers'], function (indexPassenger, passenger) {
                    if (passenger.identity != null) {
                      var extrasPassenger = self.getExtraPassengersByIdentity(passenger.identity);

                      checkoutSession['finalPassengers'][indexPassenger].extras = extrasPassenger.extras;
                      checkoutSession['finalPassengers'][indexPassenger].seats = extrasPassenger.seats;
                      checkoutSession['finalPassengers'][indexPassenger].seatsLength = window.objectLength(extrasPassenger.seats.ow) + window.objectLength(extrasPassenger.seats.rt);
                    }
                  });
                }

              }
              else {
                if (code == 400) {

                  /* A 400 code in revalidation service means there's an error in the fields, so we have to
                   show the sara popup again and show the info popup with the error message */
                  errors = {};
                  errors.saraError = true; /* Show the sara popup again */

                  /* Show the info message popup with the error */
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
                else if (code === 4056 || code === 4057) { // Paypal errors - user abandons or paypal refuses the payment
                  errors = {};
                  errors.paypal = true;

                  /* Show the info message popup with the error */
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
                else if (code == 409 || code == 6023) {
                  /* Get the error body, including all fields, to use in the callback method */
                  errors = {};
                  errors.saraError = true;
                  self.saraTemplateData = data.body.data;
                }
                else if (code == 4223 || code == 4224 || code == 4225 || code == 4230 || code == 4236 || code == 4048 || code == 4263) {
                  /* Update GTM */
                  self.traceManager('cko_error', checkoutSession, code, null);

                  errors = {};
                  errors.goToHome = true;
                }
              }

              callback(checkoutSession, goToNextStep, showScoring, message, errors);
            }
          });
        }
      }
    },
    confirmPaypal: function () {
      var self = this;
      var $mainForm = this.element.find('form').not('.subform');
      var step = this.element.find('.process_step').attr('data-step');

      if (window.paypalTemp) {
        /* Reset the temporary status */
        window.paypalTemp = false;
        window.paypalPayment = true;

        if ((step == 'payment' && this.checkoutData.payment.paypal == 1) || (step == 'payment' && this.checkoutData.payment.promotion_paypal == 1)){
          this.element.find('.top_bar_content.warning').hide();
          this.element.find('.prices').hide();

          /* Reset saraData */
          this.saraData = [];

          /* Make temporary the fields not required */
          $mainForm.find('.field').attr('data-required', '');
          $mainForm.find('.field').attr('data-init', 'restart');

          /* Reassign forms to validate the added fields */
          $mainForm.form('restartFields');

          /* Submit the main form */
          $mainForm.submit();

          /* Show the process again and delete the loading_process screen */
          setTimeout(function () {
            $('body').removeClass('hide_process');
            $('.loading_process').remove();
          }, 1500);
        }
        else {
          /* Show the process again and delete the loading_process screen */
          setTimeout(function () {
            $('body').removeClass('hide_process');
            $('.loading_process').remove();
          }, 1500);
        }
      }

      else {
        /* Show the process again and delete the loading_process screen */
        setTimeout(function () {
          $('body').removeClass('hide_process');
          $('.loading_process').remove();
        }, 1500);
      }
    },
    /* Form helpers */

    setTabindex: function () {

      /* Clean previous tab index */
      $('body').find('input[tabIndex], select[tabIndex]').attr('tabIndex', '');

      var tabIndex = 100;

      this.element.find('input, select').each(function () {
        if (this.type != "hidden") {
          var $input = $(this);
          if($input.hasClass("ocult")){
             $input.attr('tabIndex', -1);
          }else{
            $input.attr('tabIndex', tabIndex);
            tabIndex++;
          }
        }
      });
    },

    setTablistener: function () {
      $('#field_login_cko_email').on('blur', function () {
        $('#field_login_cko_password').focus();
      });
    },

    ageField: function () {
      /* Set the last flight date to compare the age of passengers */
      var lastFlightDepartureDate = this.element.find('.process_top_bar .journey .fragment[data-departure-date!=""]').last().attr('data-departure-date');

      /* Fill the data-last-flight attribute for age fields */
      this.element.find('.field.age').attr('data-last-flight', lastFlightDepartureDate);
    },
    babyTravelwith: function () {
      var self = this;

      if (this.element.find('.passenger.baby').length > 0) {
        var $adults = this.element.find('.passenger.adult');
        var $babies = this.element.find('.passenger.baby');
        var $select = $babies.find('select.adult_with');

        $select.on('change', function () {
          var $this = $(this);
          var $option = $this.find('option:selected');
          var value = $option.attr('value');

          /* Disable the option in other select when it's selected in one of them */
          if (value != '') {
            $select.not($this).find('option[value=' + value + ']').attr('disabled', 'disabled');
          }
        });

        $adults.each(function () {
          var $fieldset = $(this);
          var $name       = $fieldset.find('.name');
          var $surname_1  = $fieldset.find('.surname_1');
          var $surname_2  = $fieldset.find('.surname_2');
          var passengerId = parseInt($fieldset.attr('data-passenger'));

          /* Blur on name and surnames to update babies select */
          $name.on('blur', function () {
            self.updateAdultName(passengerId, $name.val(), $surname_1.val(), $surname_2.val());
          });

          $surname_1.on('blur', function () {
            self.updateAdultName(passengerId, $name.val(), $surname_1.val(), $surname_2.val());
          });

          $surname_2.on('blur', function () {
            self.updateAdultName(passengerId, $name.val(), $surname_1.val(), $surname_2.val());
          });

        });
      }
    },
    largeFamilyDiscount: function () {
      var self = this;
      var generalDiscountBeforeLargeFamily = parseFloat(self.element.find('.price_block ul li.discount').attr('data-value') || 0);

      this.element.find('.large_family_check').on('change', function () {
        self.calcLargeFamilyDiscount(generalDiscountBeforeLargeFamily);
      }).change();

      this.element.find('.large_family_type').on('change', function () {
        self.calcLargeFamilyDiscount(generalDiscountBeforeLargeFamily);
      }).change();
    },
    calcLargeFamilyDiscount: function (generalDiscountBeforeLargeFamily) {
      var self = this;
      var globalDiscounts = {};
      var currentGeneralDiscount = parseFloat(self.element.find('.price_block ul li.discount').attr('data-value') || 0);

      /* Loop passengers */
      this.element.find('.passenger').each(function () {
        var $fieldset = $(this);
        var $largeFamilyCheck = $fieldset.find('.large_family_check');
        var $largeFamilyCommunity = $fieldset.find('.large_family_community');
        var $largeFamilyType = $fieldset.find('.large_family_type');
        var $largeFamilyNumber = $fieldset.find('.large_family_number');
        var applyDiscount = $largeFamilyCheck.is(':checked');

        if (applyDiscount) {
          /* Get type of passenger */
          var passengerType = $fieldset.find('.passenger_type').val();

          /* Get large family community */
          var largeFamilyCommunity = $largeFamilyCommunity.find('option:selected').attr('value');

          /* Get type of large family discount - using helper due to difference in the services */
          var largeFamilyType = convertLargeFamilyType($largeFamilyType.find('option:selected').attr('value'));

          /* Get large family number */
          var largeFamilyNumber = $largeFamilyNumber.val();

          /* Get the discount if applies */
          if (passengerType) {
            // console.log("Entra a buscar lo descuentos con estos datos");
            // console.log("passengerType: " + passengerType);
            // console.log("largeFamilyType: " + largeFamilyType);
            /* Loop passengers type discounts available in checkoutData */
            $.each(self.checkoutData.largeFamilyDiscounts, function (indexPassengerType, passenger) {

              // console.log(passenger);

              /* If we find the passengerType, loop the discounts */
              if (passenger.passengerType == passengerType) {

                // console.log("Encuentra el tipo: " + passengerType);

                /* Loop the type discounts inside this passenger type */
                $.each(passenger.largeFamilyItemizationDiscounts, function (indexDiscount, discount) {

                  // console.log("El objeto del descuento es: ");
                  // console.log(discount);

                  /* If we find the family type, that's the price we need to get */
                  if (discount.largeFamilyType == largeFamilyType) {

                    /* Loop the final discounts for this type */
                    $.each(discount.discounts, function (indexFinalDiscount, finalDiscount) {

                      var className = (finalDiscount.discountType == 'SERVICE_FEE_LARGEFAMILY') ? 'fee_large_family' : 'large_family';

                      if (globalDiscounts[className] == undefined) {
                        globalDiscounts[className] = {
                          amount: finalDiscount.price.amount * -1,
                          description: finalDiscount.price.description,
                          className: finalDiscount.discountType
                        }
                      }
                      else {
                        globalDiscounts[className] = {
                          amount: (finalDiscount.price.amount + ((globalDiscounts[className].amount) * -1 || 0)) * -1,
                          description: finalDiscount.price.description,
                          className: finalDiscount.discountType
                        }
                      }
                    });
                  }
                });
              }
            });
          }
        }
      });

      /* Clean large family discounts */
      if (generalDiscountBeforeLargeFamily < 0) {
        if (generalDiscountBeforeLargeFamily != currentGeneralDiscount) {
          self.addPrice('discount', lang('general.discount'), generalDiscountBeforeLargeFamily);
        }
      }
      else {
        this.cleanPrice('discount');
      }

      this.cleanPrice('large_family');

      /* Apply discounts to itemization */
      $.each(globalDiscounts, function (index, discount) {

        if (discount.amount < 0) {

          if (discount.className == 'SERVICE_FEE_LARGEFAMILY') { /* SERVICE_FEE discount has to go to general discount line */

            /* Update itemization */
            var currentDiscount = parseFloat(self.element.find('.price_block ul li.fee_large_family').attr('data-value') || 0);
            var newDiscount = currentDiscount;

            newDiscount = currentDiscount + discount.amount;
            if (newDiscount != currentDiscount) {
              self.addPrice('discount', lang('general.fee_large_family_discount'), newDiscount);
            }

          }
          else { /* Other types of discounts has its own line on the itemization */
            self.addPrice('large_family', lang('general.large_family_discount'), discount.amount);
          }

        }


      });

    },
    updateAdultName: function (id, name, surname_1, surname_2) {
      var $babies = this.element.find('.passenger.baby');
      var completeName = name + ' ' + surname_1 + ' ' + surname_2;

      $babies.each(function () {
        var $fieldset = $(this);
        var $select = $fieldset.find('select.adult_with');

        /* Update option texts */
        $select.find('option[value=' + id + ']').text(completeName.toUpperCase());

        /* If the select has a selected value, then trigger change */
        if ($select.find('option:selected').val() != '') {
          $select.trigger('change');
        }

      });
    },
    completeRegisterData: function (data) {
      var self = this;
      var honorific;

      /* set honorific code */
      if (data.honorific == 'sr') {
        honorific = 'MR';
      } else if (data.honorific == 'sra') {
        honorific = 'MRS';
      } else if (data.honorific == 'srta') {
        honorific = "MISS";
      }

      /* update fields if they are needed */
      self.updateField(self, data.email, 'field_register_email');
      self.updateField(self, data.name, 'field_register_name');
      self.updateField(self, data.surname_1, 'field_register_surname');
      self.updateField(self, data.surname_2, 'field_register_surname2');
      self.updateField(self, data.birthdate, 'field_register_birthdate');
      self.updateField(self, data.document_number, 'field_register_document_number');
      self.updateSelect(self, data.nationality, 'field_register_document_nationality');
      // self.updateSelect(self, data.preference_airport, 'field_register_preference_airport');
      self.updateSelect(self, honorific, 'field_register_honorific');
      self.updateSelect(self, data.document_type, 'field_register_document_type');
    },
    updateField: function ($this, dataValue, serviceName) {
      var $element = $this.element.find('.register_form input[name="' + serviceName + '"]');
      $element.val(dataValue);
      $element.trigger('blur').closest('.field').addClass('initial_status');
    },
    updateSelect: function ($this, dataValue, serviceName) {
      var $element = $this.element.find('.register_form select[name="' + serviceName + '"]');
      $element.val(dataValue);
      $element.closest('.selected_value').val(dataValue)
      $element.trigger('change', [true]);
    },
    documentType: function (isRegister) {
      var $documentBlocks = this.element.find('.document_block');
      var self = this;

      $documentBlocks.each(function () {
        var $this = $(this);
        var $type = $this.find('.document_type');
        var $number = $this.find('.document_number');
        var $country = $this.find('.document_country');
        var $expiration = $this.find('.document_expiration');
        var $expiration_selects = $this.find('.passport_accordeon');
        var $expiration_selects_requierd = $this.find('.passport_accordeon .field.select_field');
        var $fieldsetBody = $this.closest('.fieldset_body');
        var firstLoad = true;

        /* Document type change event, depending on which document type the user selects we have to apply different rules */
        $type.find('select').on('change', function () {

          /* Get select value and text */
          var $select = $(this);
          var $option = $select.find('option:selected');
          var value = $option.attr('value');

          /* Document number text field with no background color by default */
          $number.find('input').closest('.field').removeClass('non_editable');

          /* Passport */
          if (value == 'PP') {
            /* Required status */
            $number.attr('data-required', 'true').removeClass('valid filled');
            if (!isRegister)
            {
              $country.attr('data-required', 'true').removeClass('valid filled').slideDown();
              $expiration.attr('data-required', 'true').attr('data-format', 'expiration').addClass('half').removeClass('valid filled full').slideDown();
            }
            $country.attr('data-required', 'true').removeClass('valid filled').slideDown();
            $expiration.attr('data-required', 'true').attr('data-format', 'expiration').addClass('half').removeClass('valid filled full').slideDown();
            $expiration_selects_requierd.attr('data-required', 'true');
            $expiration_selects.slideDown();

            /* Format status */
            $number.attr('data-format', 'passport');

            /* Show large family checkbox */
            $fieldsetBody.find('.check_group.large_family').addClass('hidden');
          }

          /* DNI / Congress */
          else if (value == 'NI' || value == 'GR') {
            /* Required status */
            $number.attr('data-required', 'true').removeClass('valid filled');
            if (!isRegister)
            {
              $country.attr('data-required', 'false').removeClass('valid filled').slideUp();
            }
            if (self.checkoutData.journeyConstraintBlock) {
              $expiration.attr('data-required', 'true').attr('data-format', 'expiration').addClass('full').removeClass('valid filled half').slideDown();
              $expiration_selects_requierd.attr('data-required', 'true');
              $expiration_selects.slideDown();
            }
            else {
              $expiration.attr('data-required', 'false').removeAttr('data-format').removeClass('valid filled').slideUp();
              $expiration_selects_requierd.attr('data-required', 'false');
              $expiration_selects.slideUp();
            }

            /* Format status */
            $number.attr('data-format', 'dni');

            /* Show large family checkbox */
            $fieldsetBody.find('.check_group.large_family').removeClass('hidden');
          }

          /* European ID */
          else if (value == 'DL') {
            /* Required status */
            $number.attr('data-required', 'true').removeClass('valid filled');
            if (!isRegister)
            {
              $country.attr('data-required', 'false').removeClass('valid filled').slideUp();
              $expiration.attr('data-required', 'false').removeAttr('data-format').removeClass('valid filled').slideUp();
              $expiration_selects.slideUp();
            }
            $country.attr('data-required', 'false').removeClass('valid filled').slideUp();
            $expiration.attr('data-required', 'false').removeAttr('data-format').removeClass('valid filled').slideUp();
            $expiration_selects_requierd.attr('data-required', 'false');
            $expiration_selects.slideUp();

            /* Format status */
            $number.attr('data-format', 'passport');

            /* Show large family checkbox */
            $fieldsetBody.find('.check_group.large_family').removeClass('hidden');
          }

          /* NIE */
          else if (value == 'ID') {
            /* Required status */
            $number.attr('data-required', 'true').removeClass('valid filled');
            if (!isRegister)
            {
              $country.attr('data-required', 'false').removeClass('valid filled').slideUp();
              $expiration.attr('data-required', 'false').removeAttr('data-format').removeClass('valid filled').slideUp();
              $expiration_selects.slideUp();
            }
            $country.attr('data-required', 'false').removeClass('valid filled').slideUp();
            $expiration.attr('data-required', 'false').removeAttr('data-format').removeClass('valid filled').slideUp();
            $expiration_selects_requierd.attr('data-required', 'false');
            $expiration_selects.slideUp();

            /* Format status */
            $number.attr('data-format', 'nie');

            /* Show large family checkbox */
            $fieldsetBody.find('.check_group.large_family').removeClass('hidden');
          }

          /* Under 14, no ID */
          else if (value == 'MN') {
            /* Required status */
            $number.attr('data-required', 'false');
            if (!isRegister)
            {
              $country.attr('data-required', 'false').slideUp();
              $expiration.attr('data-required', 'false').removeAttr('data-format').slideUp();
              $expiration_selects_requierd.attr('data-required', 'false');
              $expiration_selects.slideUp();
            }
            $country.attr('data-required', 'false').slideUp();
            $expiration.attr('data-required', 'false').removeAttr('data-format').slideUp();
            $expiration_selects_requierd.attr('data-required', 'false');
            $expiration_selects.slideUp();

            /* Format status */
            $number.removeAttr('data-format');

            /* Put document number text field in grey #dadada */
            $number.find('input').val('').closest('.field').addClass('non_editable').removeClass('filled valid');

            /* Hide large family checkbox */
            $fieldsetBody.find('.check_group.large_family').removeClass('hidden');
          }

          /* Uncheck large family checkbox */
          if ($fieldsetBody.find('.check_group.large_family').hasClass('hidden')) {
            $fieldsetBody.find('.large_family_check').prop('checked', false).change();
          }

          /* Restart fields */
          if (!firstLoad) {
            $number.attr('data-init', 'restart');
            $country.attr('data-init', 'restart');
            $expiration.attr('data-init', 'restart');
            $expiration_selects_requierd.attr('data-init', 'restart');

            /* Reassign forms to validate the added fields */
            $select.closest('form').form('restartFields');
          }

        });

        $type.find('select').trigger('change');

        firstLoad = false;
      });
    },
    frequentFlyerCheck: function () {
      var self = this;

      this.element.find('.surname_1').on('blur', function () {
        var $this = $(this);
        var $passenger = $this.closest('.passenger');

        if ($passenger.find('.frequent_flyer_group .group_header input').is(':checked')) {
          self.callToFrequentFlyerCheck($passenger);
        }
      });

      this.element.find('.frequent_flyer_program select').on('change', function () {
        var $this = $(this);
        var $passenger = $this.closest('.passenger');

        if(self.isAutoComplete){
          /* If is autoComplete, the check has to be fired only once, so we have to check the boolean */
          if (self.checkFrequent_Flyer_in_autoComplete){
            self.callToFrequentFlyerCheck($passenger);
          }
          self.isAutoComplete = false;
        }else{
          /* If not is Autocomplete case, then we have to check the FF because is from select change */
          self.callToFrequentFlyerCheck($passenger);
        }

      });

      this.element.find('.frequent_flyer_number input').on('blur', function () {
        var $this = $(this);
        var $passenger = $this.closest('.passenger');

        self.callToFrequentFlyerCheck($passenger);
      });
    },
    callToFrequentFlyerCheck: function ($passenger) {
      var surname = $passenger.find('.surname_1').val();
      var frequentFlyerProgram = $passenger.find('.frequent_flyer_program option:selected').attr('value');
      var frequentFlyerIdentity = $passenger.find('.frequent_flyer_number input').val();
      var flyerData;

      if (surname != '' && frequentFlyerProgram != '' && frequentFlyerIdentity != '') {
        flyerData = {
          surname: surname,
          frequentFlyerProgram: frequentFlyerProgram,
          frequentFlyerIdentity: frequentFlyerIdentity
        };

        /* Call AJAX module to get the json */
        Bus.publish('services', 'getFrequentFlyerCheck', {
          data: flyerData,
          success: function (data) {
            var message = data.header.message;

            if (data.header.error == true) {
              /* Update error hints */
              $passenger.find('.frequent_flyer_program').trigger('show_error', [message]);
              $passenger.find('.frequent_flyer_number').trigger('show_error', [message]);

              /* Set classes to show the error */
              $passenger.find('.frequent_flyer_program').addClass('error').removeClass('valid initial_status');
              $passenger.find('.frequent_flyer_number').addClass('error').removeClass('valid initial_status');
            }
            else {
              $passenger.find('.frequent_flyer_program').removeClass('error initial_status').addClass('valid');
              $passenger.find('.frequent_flyer_number').removeClass('error initial_status').addClass('valid');
            }
          }
        });
      }
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

      // if (this.lastCheckCardValue == currentValue) {

      //   if (!this.lastCheckCardValid) {
      //      Set classes to show the error 
      //     $paymentMethod.find('.credit_card_number').addClass('error').removeClass('valid initial_status');
      //   }
      // }

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

                  /* Show popup error */
                  // $paymentMethod.closest('form').find('select').trigger('blur');
                  // $('#checkout').ui_dialog({
                  //   title: errorTitle,
                  //   error: errorType,
                  //   subtitle: message,
                  //   close: {
                  //     behaviour: 'close',
                  //     href: '#'
                  //   },
                  //   buttons: [
                  //     {
                  //       className: 'close',
                  //       href: '#',
                  //       label: lang('general.ok')
                  //     }
                  //   ]
                  // });

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
    },
    paymentMethods: function () {
      var self = this;

      /* Show card name field when card holder is not a passenger (value == 'other') */
      this.element.find('.card_holder select').on('change', function () {
        var $this = $(this);
        var $option = $this.find('option:selected');
        var value = $option.attr('value');
        var $cardName = $this.closest('.group_body').find('.card_name');
        var $documentType = $this.closest('.group_body').find('.document_block .document_type');
        var $documentNumber = $this.closest('.group_body').find('.document_block .document_number');
        var $email = $this.closest('.group_body').find('.document_block .email');
        var passenger = undefined;

        if (value == 'other' || value == '') {

          if (value == 'other' && $cardName.find('input').val() == '') {
            $cardName.find('input').val('');
            $documentNumber.find('input').val('');
            $email.find('input').val('');
            setTimeout(function() {
                $('.field.text_field.third.email').addClass('initial_status');
                $('.field.select_field.third.document_type').addClass('initial_status');
                $('.field.text_field.third.document_number').addClass('initial_status');
            }, 0);
            $documentType.find('select').find('option:selected').prop('selected', false);
          }

          $cardName.attr('data-required', 'true');
          $cardName.attr('data-init', 'restart').removeClass('valid filled');
          $cardName.stop().slideDown(300);

          /* Reassign forms to validate the added fields */
          $cardName.closest('form').form('restartFields');

          /* Clean document type, document number and email */
          $documentType.removeClass('filled non_editable').find('select').find('option:selected').change();
          $documentNumber.removeClass('filled non_editable').find('input').trigger('validate');
          $email.removeClass('filled non_editable').find('input').trigger('validate');
        }
        else {
          $cardName.stop().slideUp(300, function () {
            $cardName.find('input').val('');
            $cardName.attr('data-required', 'false');
            $cardName.attr('data-init', 'restart');

            /* Reassign forms to validate the added fields */
            $cardName.closest('form').form('restartFields');
          });
          passenger = self.getPassengerByIndex(value);

          /* Fill document type, document number and email with the saved data for this passenger */
          $documentType.addClass('filled non_editable').find('select').find('option[value=' + passenger.info.document_type + ']').prop('selected', true).change();
          $documentNumber.addClass('filled non_editable').find('input').val(passenger.info.document_number).trigger('validate');
          if (passenger.info.email) {
            $email.addClass('filled non_editable').find('input').val(passenger.info.email).trigger('validate');
          }
          else {
            $email.removeClass('filled non_editable').find('input').val('').trigger('validate');
          }
        }
      });

      /* Trigger change in the first load */
      this.element.find('.card_holder select').each(function () {
        var $this = $(this);
        var $option = $this.find('option:selected');

        if ($option.attr('value') != '') {
          $this.trigger('change');
        }

      });
    },

    registerForm: function () {
      var self = this;
      /* If the user is not logged in, clone the register form */
      if (!User.isLoggedIn()) {

        Bus.publish('ajax', 'getTemplate', {
          path: AirEuropaConfig.templates.account.register_form,
          success: function (html) {

            Bus.publish('services', 'get_account_lists', {
              preconditionDocsType: 'LOYALTY',
              success: function (response) {
                var $registerForm = html(response);

                /* Append form */
                self.element.find('.register .register_body').append($registerForm);

                self.documentType(true);

                /* Reinit form */
                Bus.publish('account', 'init_register_form', {
                  parentDivClass: 'register_body'
                });

                self.setPreferenceAirport();
                self.completeRegisterData(self.checkoutData.passengers[0].info);

                /* password validation */
                //self.listenPassword('#field_cko_register_password', '#field_cko_register_password2');
                self.listenPassword('#field_cko_register_password_wrapper', '#field_cko_register_password_wrapper_2');

              }
            });
          }
        });
      }
    },

    initTabsPaymentMethods: function() {
      var self = this;

      /*En base a el numero de methos poner el width al .tab-list .li*/
      //checkoutData.methods

      var step = self.element.find('.process_step').attr('data-step');
      var $milesBlock = self.element.find('.miles_block');

      if (step == 'payment') {

        /*Buscar el ultimo y poner el last*/
        self.element.find('.tab-list li').last().addClass('ultimo');

        /*Evento que escucha payment_method_tab y lanza el radio del group_header*/
        this.element.find('.tab-list li').on('click', function(event) {
          event.preventDefault();
          var $this = $(this);
          var $milesPoints = $this.find('a');

          /*Comprobamos si el clicado ya estaba activo*/
          if (!$this.hasClass('active')) {
            var idInput = $this.find('a').attr('href');

            /*Eliminamos el que este activo*/
            $this.closest('ul').find('.active').removeClass('active');
            self.element.find('.check_group.payment_method').removeClass('expanded_method');

            /*poner activo el seleccionado*/
            $this.addClass('active');

            /*ponemos a checked el radio buton correspondiente*/
            self.element.find('.check_group.payment_method .group_header input'+idInput).prop('checked', true);
            self.element.find('.check_group.payment_method .group_header input'+idInput).change();

              
            var pageContent = '';
            switch(idInput) {
              case '#field_payment_credit_card':
              pageContent = 'Pago del vuelo por horas tarjeta credito';
              break;
              case '#field_payment_promotion_paypal':
              case '#field_payment_paypal':
              pageContent = 'Pago del vuelo por horas paypal';
              break;
              case '#field_payment_miles':
              pageContent = 'Pago del vuelo por horas pago millas';
              break;
              case '#field_payment_ae_card':
              pageContent = 'Pago del vuelo por horas tarjeta aireuropa';
              break;
              case '#field_payment_reserve':
              pageContent = 'Pago del vuelo por horas 72 horas';
              break;
              case '#field_payment_promotion':
              pageContent = 'Pago del vuelo por horas codigo descuento';
              break;
            } 
            updateGtm({
            'pageArea': 'Comprar vuelos',
            'pageCategory': 'checkout',
            'pageContent': pageContent
              });
          }

          $milesBlock.hide();

          if ($milesPoints.hasClass('points') && !self.element.find('.mymiles .slider_field').hasClass('disabled')) {
            $milesBlock.show();
          }

          /* if payment_miles is active and it's no available, hide ok-button and conditions blocks */
          var isAvailablePayment = $this.attr('data-method-available');
          var isSelectedPaymentMiles = (self.element.find('.check_group.payment_method .group_header input#field_payment_miles').prop('checked') == true);
          var thereAreNoMiles = (self.element.find('.mymiles .slider_field').length == 0);

          if (!isAvailablePayment || (isSelectedPaymentMiles && thereAreNoMiles)) {
            self.element.find('.checkout_block.conditions').hide();
            self.element.find('.submit.confirm').hide();
          } else {
            self.element.find('.checkout_block.conditions').show();
            self.element.find('.submit.confirm').show();
          }

          if (isSelectedPaymentMiles) {
            self.element.find('.payment_method.mymiles .field.slider_field .slider_range').trigger('slide');
          }
        });

        this.element.find('.tab-list li').first().trigger("click");
      }
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
        if (i < 9) {
          iaux = "0" + i;
        } else {
          iaux = i;
        };
        cadenadias = cadenadias + '<option value="' + iaux + '"> ' + i + '</option>';
      };

      // month list
      for (var j = 0; j < 12; j++) {
        if (j < 9) {
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
      idsnecesariosp.each(function() {
        if ($(this).val() != "") {
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

            /* Focus current element */
            $(this).focus();
          }
        }
      });
    },

    cardExpirationActions: function () {
      $(".date_card_expiration_input").change(function(){
        var inputtarget = $(this).attr("data-input-target");

        // reset value of the hidden date input
        $("#"+inputtarget).val("");

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

    birthdateActions: function() {
      var self = this;

      // get last departure flight date
      var lastFlightDepartureDate = this.element.find('.process_top_bar .journey .fragment[data-departure-date!=""]').last().attr('data-departure-date').slice(0, 10);
      var lastFlightDepartureDateParts = lastFlightDepartureDate.split("-");

      // yesterday date
      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() -1);
      var yesterdayDay   = ("0"+yesterday.getDate()).slice(-2);      // two digits format
      var yesterdayMonth = ("0"+(yesterday.getMonth()+1)).slice(-2); // two digits format

      // flight date
      var flight      = new Date(lastFlightDepartureDateParts[2], lastFlightDepartureDateParts[1] - 1, lastFlightDepartureDateParts[0]);
      var flightDay   = ("0"+flight.getDate()).slice(-2);      // two digits format
      var flightMonth = ("0"+(flight.getMonth()+1)).slice(-2); // two digits format

      // next day of flight date
      var flightNext = new Date(lastFlightDepartureDateParts[2], lastFlightDepartureDateParts[1] - 1, lastFlightDepartureDateParts[0]);
      flightNext.setDate(flightNext.getDate() + 1);
      var flightNextDay   = ("0"+flightNext.getDate()).slice(-2);      // two digits format
      var flightNextMonth = ("0"+(flightNext.getMonth()+1)).slice(-2); // two digits format

      // iterate over adult date fields and initialize data
      self.element.find(".byear_input_adult").each(function() {
        var targetInput = $(this).attr("data-input-target");

        var maxDate = flight.getFullYear()-130 +'-'+ flightMonth +'-'+ flightDay;
        var minDate = flight.getFullYear()-12  +'-'+ flightMonth +'-'+ flightDay;

        if($(this).closest('.process_step').attr('data-step') == 'confirm'){
          ComboDates.fillData(
            self.element.find("."+targetInput+".bday_input"),
            self.element.find("."+targetInput+".bmonth_input"),
            self.element.find("."+targetInput+".byear_input_adult"),
            maxDate,
            minDate
          );
        }else{
          ComboDates.fillData(
            self.element.find("."+targetInput+".bday_input_adult"),
            self.element.find("."+targetInput+".bmonth_input_adult"),
            self.element.find("."+targetInput+".byear_input_adult"),
            maxDate,
            minDate
          );
        }
      });

      // iterate over kid date fields and initialize data
      self.element.find(".byear_input_kid").each(function() {
        var targetInput = $(this).attr("data-input-target");

        var maxDate = flightNext.getFullYear()-12 +'-'+ flightNextMonth +'-'+ flightNextDay;
        var minDate = flight.getFullYear()-2      +'-'+ flightMonth     +'-'+ flightDay;

        ComboDates.fillData(
          self.element.find("."+targetInput+".bday_input_kid"),
          self.element.find("."+targetInput+".bmonth_input_kid"),
          self.element.find("."+targetInput+".byear_input_kid"),
          maxDate,
          minDate
        );
      });

      // iterate over baby date fields and initialize data
      self.element.find(".byear_input_baby").each(function() {
        var targetInput = $(this).attr("data-input-target");

        var maxDate = flightNext.getFullYear()-2 +'-'+ flightNextMonth +'-'+ flightNextDay;
        var minDate = yesterday.getFullYear()    +'-'+ yesterdayMonth  +'-'+ yesterdayDay;

        ComboDates.fillData(
          self.element.find("."+targetInput+".bday_input_baby"),
          self.element.find("."+targetInput+".bmonth_input_baby"),
          self.element.find("."+targetInput+".byear_input_baby"),
          maxDate,
          minDate
        );
      });

      self.element.find('.date_birthday_input').on('change', function() {
        var dayValue   = self.element.find(".bday").val();
        var monthValue = self.element.find(".bmonth").val();
        var yearValue  = self.element.find(".byear").val();

        /* If age selected is under 18, show cepsa checkbox */
        var userDate = yearValue +'-'+ monthValue +'-'+ dayValue;


        if (self.calcularEdad(userDate) >= 18) {
          self.element.find('#cepsa_checkout').removeClass('hidden');
        } else {
          self.element.find('#cepsa_checkout').addClass('hidden');
        }
      });

      // iterate over all hidden date fields and update combo values if hidden data is set
      self.element.find("[id$='_birthdate']").each(function(){
        if($(this).val() != ""){
          var targetId  = $(this).attr("id");

          var dateParts = $("#"+targetId).val().split("/");

          self.element.find('.'+targetId+'.byear').val(dateParts[2]).trigger('change', [true]);
          self.element.find('.'+targetId+'.bmonth').val(dateParts[1]).trigger('change', [true]);
          self.element.find('.'+targetId+'.bday').val(dateParts[0]).trigger('change', [true]);
        };
      });

      // add listeners to update hidden date value when any of the combos changes
      ComboDates.addListeners(self.element, "date_birthday_input", "byear", "bmonth", "bday");
    },

    setPreferenceAirport: function(){
        var self = this;

        Bus.publish('services', 'getPreferenceAirport', {
          success: function (preference_airport) {

            if (self.element.find('#field_cko_register_preference_airport option').length == 1 )
            {
              // var ordered_airports = self.orderAirportsByZone(preference_airport);
              var ordered_airports = preference_airport;

              $.each(ordered_airports, function (indexGroup) {

                  var optgroup = $('<optgroup>');
                  optgroup.attr('label',ordered_airports[indexGroup].name);

                   $.each(ordered_airports[indexGroup].airports, function (index, airport) {

                      var option = $("<option></option>");
                      option.val(airport.code);
                      option.text(airport.description);

                      optgroup.append(option);
                   });
                   self.element.find("#field_cko_register_preference_airport").append(optgroup);
              });

            }

          }
        });
    },

    /*
     * Calculate birthdate of give date (in format YYYY-MM-DD)
     */
    calcularEdad: function(userDateString) {
      var today = moment();
      var userDate = moment(userDateString, "YYYY-MM-DD");

      var userYears = today.diff(userDate, 'years', true);

      return userYears;
    },

    myAeLogin: function () {
      var self = this;
      var $fieldset = this.element.find('.payment_method.myae')
      var $user = $fieldset.find('#field_myae_user');
      var $password = $fieldset.find('#field_myae_password');

      /* Load */
      if ($fieldset.find('.myae_logedin').val() == 1) {
        setTimeout(function () {
          $user.closest('.field').addClass('disabled');
          $password.closest('.field').addClass('disabled');
        }, 300);
      }

      /* Listen parent radio button to set the price if it's previously selected */
      $fieldset.find('.group_header input').on('change', function () {
        if ($fieldset.find('.myae_logedin').val() == 1) {
          setTimeout(function () {
            $user.closest('.field').addClass('disabled');
            $password.closest('.field').addClass('disabled');
          }, 300);
        }
      });

      this.element.find('.my_ae_login button').on('click', function (event) {
        event.preventDefault();

        /* Get form vars */
        var $button = $(this);
        var $fieldset = $button.closest('.payment_method.myae');
        var $groupBody = $button.closest('.group_body');
        var $myAeLogin = $button.closest('.my_ae_login');
        var $myAeOptions = $button.closest('.group_body').find('.my_ae_options');
        var $user = $myAeLogin.find('#field_myae_user');
        var $password = $myAeLogin.find('#field_myae_password');
        var $slider = $myAeOptions.find('.slider_field');
        var userValid = $user.closest('.field').hasClass('valid');
        var passwordValid = $password.closest('.field').hasClass('valid');
        var user = $user.val() || '';
        var password = $password.val() || '';

        if (userValid && passwordValid) {
          /* Get sessionId */
          var sessionId = self.element.find('.process_step').attr('data-sessionId');

          /* Call AJAX module to get the json */
          Bus.publish('services', 'postMyAeLogin', {
            sessionId: self.element.find('.process_step').attr('data-sessionId'),
            credentials: {email: user, password: password},
            success: function (data) {
              var points;
              var minValue;

              if (data.header.code == 200) {

                /* Update flag  */
                $groupBody.find('.myae_logedin').val('1');

                /* Get points */
                points = data.body.data.points;

                /* Figure out which value is min: points or basefare */
                if (points > self.baseFare) {
                  minValue = self.baseFare;
                }
                else {
                  minValue = points;
                }

                /* Set the min value to the slider total value */
                $slider.attr('data-total', minValue);
                $slider.attr('data-init', 'restart');
                $slider.find('input.total_points').val(minValue);

                /* Reassign forms to validate the added fields */
                $slider.closest('form').form('restartFields');

                /* Animation to hide login form and show options */
                $myAeLogin.slideUp(300, function () {

                  $user.closest('.field').addClass('disabled');
                  $password.closest('.field').addClass('disabled');

                  /* Show error message */
                  $fieldset.removeClass('error');
                  if ($fieldset.find('.group_body .my_ae_login .form_error').length > 0) {
                    $fieldset.find('.group_body .my_ae_login .form_error').remove();
                  }

                  $myAeOptions.slideDown(300);
                })
              }
              else {

                /* Show error message */
                $fieldset.addClass('error');
                if ($fieldset.find('.group_body .my_ae_login .form_error').length > 0) {
                  $fieldset.find('.group_body .my_ae_login .form_error').remove();
                }

                $fieldset.find('.group_body .my_ae_login .fieldset_header').after('<div class="form_error"><div class="error_message"><p>' + data.header.message + '</p></div></div>');

                /* Show field errors */
                $user.closest('.field').removeClass('initial_status');
                $password.closest('.field').removeClass('initial_status');
              }
            }
          });
        }
        else {
          /* Show error message */
          $fieldset.addClass('error');
          if ($fieldset.find('.group_body .my_ae_login .form_error').length > 0) {
            $fieldset.find('.group_body .my_ae_login .form_error').remove();
          }

          $fieldset.find('.group_body .my_ae_login .fieldset_header').after('<div class="form_error"><div class="error_message"><p>' + lang('general.incorrect_login') + '</p></div></div>');

          /* Show field errors */
          $user.closest('.field').removeClass('initial_status');
          $password.closest('.field').removeClass('initial_status')
        }

      });
    },
    promoCode: function () {
      var self = this;
      var $fieldset = this.element.find('.payment_method.promotion');
      var $promotionCodeField = $fieldset.find('#promotion_code');
      var totalDiscount = 0;
      var newResidentDiscount = 0;
      var newLargeFamilyDiscount = 0;
      var newFeeResidentDiscount = 0;
      var newFeeLargeFamilyDiscount = 0;
      var oldResidentDiscount = 0;
      var oldLargeFamilyDiscount = 0;
      var oldFeeResidentDiscount = 0;
      var oldFeeLargeFamilyDiscount = 0;
      var discountApplied = false;
      var promotionDiscount = 0;

      oldResidentDiscount = parseFloat(self.element.find('.price_block ul li.resident').attr('data-value') || 0);
      oldLargeFamilyDiscount = parseFloat(self.element.find('.price_block ul li.large_family').attr('data-value') || 0);
      oldFeeResidentDiscount = parseFloat(self.element.find('.price_block ul li.fee_resident').attr('data-value') || 0);
      oldFeeLargeFamilyDiscount = parseFloat(self.element.find('.price_block ul li.fee_large_family').attr('data-value') || 0);


      if (self.checkoutData.payment) {
        if (self.checkoutData.payment.promotion_total_discount) {
          totalDiscount = parseFloat(self.checkoutData.payment.promotion_total_discount);
        }

        if (self.checkoutData.payment.promotion_new_resident_discount) {
          newResidentDiscount = parseFloat(self.checkoutData.payment.promotion_new_resident_discount);
        }

        if (self.checkoutData.payment.promotion_new_large_family_discount) {
          newLargeFamilyDiscount = parseFloat(self.checkoutData.payment.promotion_new_large_family_discount);
        }

        if (self.checkoutData.payment.promotion_new_fee_resident_discount) {
          newFeeResidentDiscount = parseFloat(self.checkoutData.payment.promotion_new_fee_resident_discount);
        }

         if (self.checkoutData.payment.promotion_new_fee_large_family_discount) {
          newFeeLargeFamilyDiscount = parseFloat(self.checkoutData.payment.promotion_new_fee_large_family_discount);
        }

      }

      // delete space
        $promotionCodeField.on('change',function(){
        var surname = $(this).val();
        var newSurname = $.trim(surname);

        $(this).val(newSurname);
      });

      /* Load */
      if ($fieldset.find('.promotion_valid').val() == 1) {
        setTimeout(function () {
          $promotionCodeField.closest('.field').addClass('disabled');
        }, 300);
      }

      /* Button click */
      this.element.find('.promotion_code button').on('click', function (event) {
        event.preventDefault();

        /* Get form vars */
        var $button = $(this);
        var $fieldset = $button.closest('.payment_method.promotion')
        var $groupBody = $button.closest('.group_body');
        var $promoForm = $button.closest('.promotion_code');
        var $promoCard = $button.closest('.group_body').find('.promotion_card');
        var $promotionCodeField = $promoForm.find('#promotion_code');
        var codeValid = $promotionCodeField.closest('.field').hasClass('valid');
        var code = $.trim($promotionCodeField.val()) || '';

        oldResidentDiscount = parseFloat(self.element.find('.price_block ul li.resident').attr('data-value') || 0);
        oldLargeFamilyDiscount = parseFloat(self.element.find('.price_block ul li.large_family').attr('data-value') || 0);
        oldFeeResidentDiscount = parseFloat(self.element.find('.price_block ul li.fee_resident').attr('data-value') || 0);
        oldFeeLargeFamilyDiscount = parseFloat(self.element.find('.price_block ul li.fee_large_family').attr('data-value') || 0);

        if (codeValid) {
          /* Get sessionId */
          var sessionId = self.element.find('.process_step').attr('data-sessionId');

          /* Call AJAX module to get the json */
          Bus.publish('services', 'getPromotionCode', {
            sessionId: self.element.find('.process_step').attr('data-sessionId'),
            promoCode: code,
            paymentMethodType: 'PROMOTION',
            success: function (data) {
              var points;
              var minValue;

              if (data.header.code == 200 && data.body.data.passengers.length > 0) {
                var currentDiscount = 0;
                var description = data.body.data.promotion.description;
                var passengers = data.body.data.passengers;
                var currency = data.body.data.passengers[0].discounts[0].currency.code;

                /* Calc total discount */
                $.each(passengers, function (indexPassenger, passenger) {
                  $.each(passenger.discounts, function (indexDiscount, discount) {

                    /* Sum total promo discount */
                    if (discount.type == 'PROMOTION') {
                      totalDiscount += discount.amount;
                    }

                    /* Sum total resident discount */
                    if (discount.type == 'RESIDENT') {
                      newResidentDiscount += discount.amount;
                    }

                    /* Sum total large family discount */
                    if (discount.type == 'LARGEFAMILY_NORMAL' || discount.type == 'LARGEFAMILY_SPECIAL') {
                      newLargeFamilyDiscount += discount.amount;
                    }

                    if(discount.type == 'SERVICE_FEE_RESIDENT'){
                      newFeeResidentDiscount += discount.amount;
                    }

                    if(discount.type == 'SERVICE_FEE_LARGEFAMILY'){
                      newFeeLargeFamilyDiscount += discount.amount;
                    }

                  });
                });

                // console.log("El descuento acumulado es: ", totalDiscount);
                // console.log("El nuevo resident discount es: ", newResidentDiscount);
                // console.log("El nuevo large family discount es: ", newLargeFamilyDiscount);

                /* Update description and total */
                $groupBody.find('.promotion_valid').val('1');
                $promoCard.find('.promotion_discount .discount_title strong').html(formatCurrency(totalDiscount) + ' ' + currency);
                $promoCard.find('.promotion_discount .discount_subtitle span').text(description);
                $promoCard.find('.input_total_discount').val(totalDiscount);
                $promoCard.find('.input_promotion_description').val(description);
                $promoCard.find('.input_new_resident_discount').val(newResidentDiscount);
                $promoCard.find('.input_new_large_family_discount').val(newLargeFamilyDiscount);
                $promoCard.find('.input_new_fee_resident_discount').val(newFeeResidentDiscount);
                $promoCard.find('.input_new_fee_large_family_discount').val(newFeeLargeFamilyDiscount);


                /* Update itemization discount */
                // var currentDiscount = parseFloat(self.element.find('.price_block ul li.discount').attr('data-value') || 0);
                // currentDiscount = currentDiscount - totalDiscount;
                // self.addPrice('discount', lang('general.discount'), currentDiscount);

                self.addPrice('promotion_discount', lang('general.promotional_discount'), totalDiscount * -1);

                /* Update itemization resident - Replace the current discount for this one */
                self.addPrice('resident', lang('general.resident_discount'), newResidentDiscount * -1);

                /* Update itemization resident - Replace the current discount for this one */
                self.addPrice('large_family', lang('general.large_family_discount'), newLargeFamilyDiscount * -1);

                self.addPrice('fee_resident', lang('general.fee_resident_discount'), newFeeResidentDiscount * -1);

                self.addPrice('fee_large_family', lang('general.fee_large_family_discount'), newFeeLargeFamilyDiscount * -1);

                /* Update discountApplied flag */
                discountApplied = true;

                /* Animation to hide login form and show options */
                $promoForm.slideUp(300, function () {

                  $promotionCodeField.closest('.field').addClass('disabled');

                  /* Show error message */
                  $fieldset.removeClass('error');
                  if ($fieldset.find('.group_body .my_ae_login .form_error').length > 0) {
                    $fieldset.find('.group_body .my_ae_login .form_error').remove();
                  }

                  $promoCard.slideDown(300);
                })
              }
              else {
                var message = (data.header.message) ? data.header.message : lang('general.incorrect_code');

                if (data.header &&
                        (data.header.code === 11000 || (data.header.code === 11001)))
                {
                  self.traceManager('cko_error', self.checkoutData, data.header.code.toString(), null);
                }

                /* Show error message */
                $fieldset.addClass('error');
                if ($fieldset.find('.group_body .promotion_code .form_error').length > 0) {
                  $fieldset.find('.group_body .promotion_code .form_error').remove();
                }

                $fieldset.find('.group_body .promotion_code .fieldset_header').after('<div class="form_error"><div class="error_message"><p>' + message + '</p></div></div>');

                /* Show field errors */
                $promotionCodeField.closest('.field').removeClass('initial_status');
              }
            }
          });
        }
        else {
          /* Show error message */
          $fieldset.addClass('error');
          if ($fieldset.find('.group_body .promotion_code .form_error').length > 0) {
            $fieldset.find('.group_body .promotion_code .form_error').remove();
          }

          $fieldset.find('.group_body .promotion_code .fieldset_header').after('<div class="form_error"><div class="error_message"><p>' + lang('general.incorrect_code') + '</p></div></div>');

          /* Show field errors */
          $promotionCodeField.closest('.field').removeClass('initial_status');
        }

      });

      /* Listen parent radio button to set the price if it's previously selected */
      this.element.find('.promotion_code').closest('.payment_method').find('.group_header input').on('change', function () {
        // console.log("Lanza el change con totalDiscount a: " + totalDiscount)
        if (totalDiscount > 0) {

          setTimeout(function () {
            // console.log("Salta el select del código promo");
            // console.log("Seteamos resident discount a: ", newResidentDiscount)
            // console.log("Seteamos large large_family discount a: ", newLargeFamilyDiscount)

            /* Update itemization */
            // var currentDiscount = parseFloat(self.element.find('.price_block ul li.discount').attr('data-value') || 0);
            // currentDiscount = currentDiscount - totalDiscount;
            // self.addPrice('discount', lang('general.discount'), currentDiscount);

            self.addPrice('promotion_discount', lang('general.promotional_discount'), totalDiscount * -1);

            /* Update itemization resident - Replace the current discount for this one */
            //oldResidentDiscount = parseFloat(self.element.find('.price_block ul li.resident').attr('data-value') || 0);
            self.addPrice('resident', lang('general.resident_discount'), newResidentDiscount * -1);

            /* Update itemization resident - Replace the current discount for this one */
            //oldLargeFamilyDiscount = parseFloat(self.element.find('.price_block ul li.large_family').attr('data-value') || 0);
            self.addPrice('large_family', lang('general.large_family_discount'), newLargeFamilyDiscount * -1);

            self.addPrice('fee_resident', lang('general.fee_resident_discount'), newFeeResidentDiscount * -1);

            self.addPrice('fee_large_family', lang('general.fee_large_family_discount'), newFeeLargeFamilyDiscount * -1);


            discountApplied = true;
          }, 300);
        }

        /* Disable the promotion field if it's already logged in */
        if ($fieldset.find('.promotion_valid').val() == 1) {
          setTimeout(function () {
            $promotionCodeField.closest('.field').addClass('disabled');
          }, 300);
        }
      });

      /* Listen parent radio button to clean the price */
      this.element.find('.promotion_code').closest('.payment_method').find('.group_header input').on('unselect', function () {
        // console.log("Lanza el unselect con totalDiscount a: " + totalDiscount)
        if (totalDiscount > 0 && discountApplied) {
          // console.log("Salta el unselect del código promo");
          // console.log("Reseteamos resident discount a: ", oldResidentDiscount)
          // console.log("Reseteamos large large_family discount a: ", oldLargeFamilyDiscount)

          /* Update itemization */
          // var currentDiscount = parseFloat(self.element.find('.price_block ul li.discount').attr('data-value') || 0);
          // currentDiscount = currentDiscount + totalDiscount;
          // self.addPrice('discount', lang('general.discount'), currentDiscount);
          self.cleanPrice('promotion_discount');

          /* Update itemization resident - Replace the current discount for this one */
          self.addPrice('resident', lang('general.resident_discount'), oldResidentDiscount);

          /* Update itemization resident - Replace the current discount for this one */
          self.addPrice('large_family', lang('general.large_family_discount'), oldLargeFamilyDiscount);

          self.addPrice('fee_resident', lang('general.fee_resident_discount'), newFeeResidentDiscount * -1);

          self.addPrice('fee_large_family', lang('general.fee_large_family_discount'), newFeeLargeFamilyDiscount * -1);

          discountApplied = false;
        }
      });

      /* Trigger change for the selected payment method */
      if (this.element.find('.promotion_code').closest('.payment_method').find('.group_header input').is(':checked')) {
        this.element.find('.promotion_code').closest('.payment_method').find('.group_header input').trigger('change');
      }

    },

    promoCreditCardCode : function () {
    	var self = this;
        var $fieldset = this.element.find('.payment_method.credit_card');
        var $promotionCodeField = $fieldset.find('#promotion_credit_code');
        var totalDiscount = 0;
        var newResidentDiscount = 0;
        var newLargeFamilyDiscount = 0;
        var newFeeResidentDiscount = 0;
        var newFeeLargeFamilyDiscount = 0;
        var oldResidentDiscount = 0;
        var oldLargeFamilyDiscount = 0;
        var oldFeeResidentDiscount = 0;
        var oldFeeLargeFamilyDiscount = 0;
        var discountApplied = false;
        var promotionDiscount = 0;

        oldResidentDiscount = parseFloat(self.element.find('.price_block ul li.resident').attr('data-value') || 0);
        oldLargeFamilyDiscount = parseFloat(self.element.find('.price_block ul li.large_family').attr('data-value') || 0);
        oldFeeResidentDiscount = parseFloat(self.element.find('.price_block ul li.fee_resident').attr('data-value') || 0);
        oldFeeLargeFamilyDiscount = parseFloat(self.element.find('.price_block ul li.fee_large_family').attr('data-value') || 0);

        if (self.checkoutData.payment) {
	      if (self.checkoutData.payment.promotion_credit_total_discount) {
	        totalDiscount = parseFloat(self.checkoutData.payment.promotion_credit_total_discount);
	      }

	      if (self.checkoutData.payment.promotion_credit_new_resident_discount) {
	        newResidentDiscount = parseFloat(self.checkoutData.payment.promotion_credit_new_resident_discount);
	      }

	      if (self.checkoutData.payment.promotion_credit_new_large_family_discount) {
	        newLargeFamilyDiscount = parseFloat(self.checkoutData.payment.promotion_credit_new_large_family_discount);
	      }

	      if (self.checkoutData.payment.promotion_credit_new_fee_resident_discount) {
	        newFeeResidentDiscount = parseFloat(self.checkoutData.payment.promotion_credit_new_fee_resident_discount);
	      }

	       if (self.checkoutData.payment.promotion_credit_new_fee_large_family_discount) {
	        newFeeLargeFamilyDiscount = parseFloat(self.checkoutData.payment.promotion_credit_new_fee_large_family_discount);
	      }
	    }

	    // delete space
	    $promotionCodeField.on('change',function(){
	      var surname = $(this).val();
	      var newSurname = $.trim(surname);

	      $(this).val(newSurname);
	    });

	    /* Load */
	    if ($fieldset.find('.promotion_valid').val() == 1) {
	      setTimeout(function () {
	        $promotionCodeField.closest('.field').addClass('disabled');
	      }, 300);
	    }

	    /* Button click */
	    this.element.find('.promotion_credit_code button').on('click', function (event) {
	      event.preventDefault();

	      /* Get form vars */
	      var $button = $(this);
	      var $fieldset = $button.closest('.payment_method.credit_card');
	      var $groupBody = $button.closest('.group_body');
	      var $promoForm = $button.closest('.promotion_credit_code');
	      var $promoCard = $button.closest('.group_body').find('.credit_card');
	      var $promoCardDiscount = $promoCard.find('.promotion_credit_discount');
	      var $promotionCodeField = $promoForm.find('#promotion_credit_code');
	      var codeValid = $promotionCodeField.closest('.field').hasClass('valid');
	      var code = $.trim($promotionCodeField.val()) || '';

	      oldResidentDiscount = parseFloat(self.element.find('.price_block ul li.resident').attr('data-value') || 0);
	      oldLargeFamilyDiscount = parseFloat(self.element.find('.price_block ul li.large_family').attr('data-value') || 0);
	      oldFeeResidentDiscount = parseFloat(self.element.find('.price_block ul li.fee_resident').attr('data-value') || 0);
	      oldFeeLargeFamilyDiscount = parseFloat(self.element.find('.price_block ul li.fee_large_family').attr('data-value') || 0);

	      if (codeValid) {
	        /* Get sessionId */
	        var sessionId = self.element.find('.process_step').attr('data-sessionId');

	        /* Call AJAX module to get the json */
	        Bus.publish('services', 'getPromotionCode', {
	          sessionId: self.element.find('.process_step').attr('data-sessionId'),
	          promoCode: code,
	          paymentMethodType: 'PROMOTION',
	          success: function (data) {
	            var points;
	            var minValue;

	            if (data.header.code == 200 && data.body.data.passengers.length > 0) {
	              var currentDiscount = 0;
	              var description = data.body.data.promotion.description;
	              var passengers = data.body.data.passengers;
	              var currency = data.body.data.passengers[0].discounts[0].currency.code;

	              /* Calc total discount */
	              $.each(passengers, function (indexPassenger, passenger) {
	                $.each(passenger.discounts, function (indexDiscount, discount) {

	                  /* Sum total promo discount */
	                  if (discount.type == 'PROMOTION') {
	                    totalDiscount += discount.amount;
	                  }

	                  /* Sum total resident discount */
	                  if (discount.type == 'RESIDENT') {
	                    newResidentDiscount += discount.amount;
	                  }

	                  /* Sum total large family discount */
	                  if (discount.type == 'LARGEFAMILY_NORMAL' || discount.type == 'LARGEFAMILY_SPECIAL') {
	                    newLargeFamilyDiscount += discount.amount;
	                  }

	                  if(discount.type == 'SERVICE_FEE_RESIDENT'){
	                    newFeeResidentDiscount += discount.amount;
	                  }

	                  if(discount.type == 'SERVICE_FEE_LARGEFAMILY'){
	                    newFeeLargeFamilyDiscount += discount.amount;
	                  }

	                });
	              });

	              /* Update description and total */
	              $groupBody.find('.promotion_credit_valid').val('true');
	              $promoCard.find('.promotion_credit_discount .discount_title strong').html(formatCurrency(totalDiscount) + ' ' + currency);
	              $promoCard.find('.promotion_credit_discount .discount_subtitle span').text(description);
	              $promoCard.find('.input_credit_total_discount').val(totalDiscount);
	              $promoCard.find('.input_credit_promotion_description').val(description);
	              $promoCard.find('.input_credit_new_resident_discount').val(newResidentDiscount);
	              $promoCard.find('.input_credit_new_large_family_discount').val(newLargeFamilyDiscount);
	              $promoCard.find('.input_credit_new_fee_resident_discount').val(newFeeResidentDiscount);
	              $promoCard.find('.input_credit_new_fee_large_family_discount').val(newFeeLargeFamilyDiscount);


	              /* Update itemization discount */
	              // var currentDiscount = parseFloat(self.element.find('.price_block ul li.discount').attr('data-value') || 0);
	              // currentDiscount = currentDiscount - totalDiscount;
	              // self.addPrice('discount', lang('general.discount'), currentDiscount);

	              self.addPrice('promotion_discount', lang('general.promotional_discount'), totalDiscount * -1);

	              /* Update itemization resident - Replace the current discount for this one */
	              self.addPrice('resident', lang('general.resident_discount'), newResidentDiscount * -1);

	              /* Update itemization resident - Replace the current discount for this one */
	              self.addPrice('large_family', lang('general.large_family_discount'), newLargeFamilyDiscount * -1);

	              self.addPrice('fee_resident', lang('general.fee_resident_discount'), newFeeResidentDiscount * -1);

	              self.addPrice('fee_large_family', lang('general.fee_large_family_discount'), newFeeLargeFamilyDiscount * -1);

	              /* Update discountApplied flag */
	              discountApplied = true;

	              /* Animation to hide login form and show options */
	              $promoForm.slideUp(300, function () {

	                $promotionCodeField.closest('.field').addClass('disabled');

	                /* Show error message */
	                $fieldset.removeClass('error');
	                if ($fieldset.find('.group_body .my_ae_login .form_error').length > 0) {
	                  $fieldset.find('.group_body .my_ae_login .form_error').remove();
	                }

	                $promoCardDiscount.slideDown(300);
	              })
	            }
	            else {
	              var message = (data.header.message) ? data.header.message : lang('general.incorrect_code');

	              if (data.header &&
	                      (data.header.code === 11000 || (data.header.code === 11001)))
	              {
	                self.traceManager('cko_error', self.checkoutData, data.header.code.toString(), null);
	              }

	              /* Show error message */
	              $fieldset.addClass('error');
	              if ($fieldset.find('.group_body .promotion_credit_code .form_error').length > 0) {
	                $fieldset.find('.group_body .promotion_credit_code .form_error').remove();
	              }

	              $fieldset.find('.group_body .promotion_credit_code .fieldset_header').after('<div class="form_error"><div class="error_message"><p>' + message + '</p></div></div>');

	              /* Show field errors */
	              $promotionCodeField.closest('.field').removeClass('initial_status');
	            }
	          }
	        });
	      }
	      else {
	        /* Show error message */
	        $fieldset.addClass('error');
	        if ($fieldset.find('.group_body .promotion_credit_code .form_error').length > 0) {
	          $fieldset.find('.group_body .promotion_credit_code .form_error').remove();
	        }

	        $fieldset.find('.group_body .promotion_credit_code .fieldset_header').after('<div class="form_error"><div class="error_message"><p>' + lang('general.incorrect_code') + '</p></div></div>');

	        /* Show field errors */
	        $promotionCodeField.closest('.field').removeClass('initial_status');
	      }

	    });

	    /* Listen parent radio button to set the price if it's previously selected */
	    this.element.find('.promotion_credit_code').closest('.payment_method').find('.group_header input').on('change', function () {
	      // console.log("Lanza el change con totalDiscount a: " + totalDiscount)
	      if (totalDiscount > 0) {

	        setTimeout(function () {
	          // console.log("Salta el select del código promo");
	          // console.log("Seteamos resident discount a: ", newResidentDiscount)
	          // console.log("Seteamos large large_family discount a: ", newLargeFamilyDiscount)

	          /* Update itemization */
	          // var currentDiscount = parseFloat(self.element.find('.price_block ul li.discount').attr('data-value') || 0);
	          // currentDiscount = currentDiscount - totalDiscount;
	          // self.addPrice('discount', lang('general.discount'), currentDiscount);

	          self.addPrice('promotion_discount', lang('general.promotional_discount'), totalDiscount * -1);

	          /* Update itemization resident - Replace the current discount for this one */
	          //oldResidentDiscount = parseFloat(self.element.find('.price_block ul li.resident').attr('data-value') || 0);
	          self.addPrice('resident', lang('general.resident_discount'), newResidentDiscount * -1);

	          /* Update itemization resident - Replace the current discount for this one */
	          //oldLargeFamilyDiscount = parseFloat(self.element.find('.price_block ul li.large_family').attr('data-value') || 0);
	          self.addPrice('large_family', lang('general.large_family_discount'), newLargeFamilyDiscount * -1);

	          self.addPrice('fee_resident', lang('general.fee_resident_discount'), newFeeResidentDiscount * -1);

	          self.addPrice('fee_large_family', lang('general.fee_large_family_discount'), newFeeLargeFamilyDiscount * -1);


	          discountApplied = true;
	        }, 300);
	      }

	      /* Disable the promotion field if it's already logged in */
	      if ($fieldset.find('.promotion_credit_valid').val() == 'true') {
	        setTimeout(function () {
	          $promotionCodeField.closest('.field').addClass('disabled');
	        }, 300);
	      }
	    });

	    /* Listen parent radio button to clean the price */
	    this.element.find('.promotion_credit_code').closest('.payment_method').find('.group_header input').on('unselect', function () {
	      // console.log("Lanza el unselect con totalDiscount a: " + totalDiscount)
	      if (totalDiscount > 0 && discountApplied) {
	        // console.log("Salta el unselect del código promo");
	        // console.log("Reseteamos resident discount a: ", oldResidentDiscount)
	        // console.log("Reseteamos large large_family discount a: ", oldLargeFamilyDiscount)

	        /* Update itemization */
	        // var currentDiscount = parseFloat(self.element.find('.price_block ul li.discount').attr('data-value') || 0);
	        // currentDiscount = currentDiscount + totalDiscount;
	        // self.addPrice('discount', lang('general.discount'), currentDiscount);
	        self.cleanPrice('promotion_discount');

	        /* Update itemization resident - Replace the current discount for this one */
	        self.addPrice('resident', lang('general.resident_discount'), oldResidentDiscount);

	        /* Update itemization resident - Replace the current discount for this one */
	        self.addPrice('large_family', lang('general.large_family_discount'), oldLargeFamilyDiscount);

	        self.addPrice('fee_resident', lang('general.fee_resident_discount'), newFeeResidentDiscount * -1);

	        self.addPrice('fee_large_family', lang('general.fee_large_family_discount'), newFeeLargeFamilyDiscount * -1);

	        discountApplied = false;
	      }
	    });

	    /* Trigger change for the selected payment method */
	    if (this.element.find('.promotion_credit_code').closest('.payment_method').find('.group_header input').is(':checked')) {
	      this.element.find('.promotion_credit_code').closest('.payment_method').find('.group_header input').trigger('change');
	    }
    },

    promoPaypalCode: function () {
      var self = this;
      var $fieldsetPromoPaypal = this.element.find('.payment_method.promotion_paypal');
      var $promotionPaypalCodeField = $fieldsetPromoPaypal.find('#promotion_paypal_code');
      var totalDiscount = 0;
      var newResidentDiscount = 0;
      var newLargeFamilyDiscount = 0;
      var newFeeResidentDiscount = 0;
      var newFeeLargeFamilyDiscount = 0;
      var oldResidentDiscount = 0;
      var oldLargeFamilyDiscount = 0;
      var oldFeeResidentDiscount = 0;
      var oldFeeLargeFamilyDiscount = 0;
      var discountApplied = false;
      var promotionDiscount = 0;

      oldResidentDiscount = parseFloat(self.element.find('.price_block ul li.resident').attr('data-value') || 0);
      oldLargeFamilyDiscount = parseFloat(self.element.find('.price_block ul li.large_family').attr('data-value') || 0);
      oldFeeResidentDiscount = parseFloat(self.element.find('.price_block ul li.fee_resident').attr('data-value') || 0);
      oldFeeLargeFamilyDiscount = parseFloat(self.element.find('.price_block ul li.fee_large_family').attr('data-value') || 0);
      $fieldsetPromoPaypal.find('.input_code_promotion_valid').val('false');

      if (self.checkoutData.payment) {
        if (self.checkoutData.payment.promotion_paypal_total_discount) {
          totalDiscount = parseFloat(self.checkoutData.payment.promotion_paypal_total_discount);
        }

        if (self.checkoutData.payment.promotion_paypal_new_resident_discount) {
          newResidentDiscount = parseFloat(self.checkoutData.payment.promotion_paypal_new_resident_discount);
        }

        if (self.checkoutData.payment.promotion_paypal_new_large_family_discount) {
          newLargeFamilyDiscount = parseFloat(self.checkoutData.payment.promotion_paypal_new_large_family_discount);
        }

        if (self.checkoutData.payment.promotion_paypal_new_fee_resident_discount) {
          newFeeResidentDiscount = parseFloat(self.checkoutData.payment.promotion_paypal_new_fee_resident_discount);
        }

         if (self.checkoutData.payment.promotion_paypal_new_fee_large_family_discount) {
          newFeeLargeFamilyDiscount = parseFloat(self.checkoutData.payment.promotion_paypal_new_fee_large_family_discount);
        }

      }

      // delete space
      $promotionPaypalCodeField.on('change',function(){
        var surname = $(this).val();
        var newSurname = $.trim(surname);

        $(this).val(newSurname);
      });

      /* Load */
      if ($fieldsetPromoPaypal.find('.promotion_paypal_valid').val() == 1) {
        setTimeout(function () {
          $promotionPaypalCodeField.closest('.field').addClass('disabled');
        }, 300);
      }

      /* Button click */
      this.element.find('.promotion_paypal_code button').on('click', function (event) {
        event.preventDefault();

        /* Get form vars */
        var $button = $(this);
        var $fieldsetPromoPaypal = $button.closest('.payment_method.promotion_paypal')
        var $groupBody = $button.closest('.group_body');
        var $promoForm = $button.closest('.promotion_paypal_code');
        var $promoPaypal = $button.closest('.group_body').find('.promotion_paypal');
        var $promoPaypalDiscount = $promoPaypal.find('.promotion_paypal_discount');
        var $promotionPaypalCodeField = $promoForm.find('#promotion_paypal_code');
        var codeValid = $promotionPaypalCodeField.closest('.field').hasClass('valid');
        var code = $.trim($promotionPaypalCodeField.val()) || '';

        // if(code == ''){
        //   /* Show an error */
        //   $('#checkout').ui_dialog({
        //     title: lang('general.error_title'),
        //     error: true,
        //     subtitle: lang('general.error_title'),
        //     close: {
        //       behaviour: 'close',
        //       href: '#'
        //     },
        //     buttons: [
        //       {
        //         className: 'close',
        //         href: '#',
        //         label: lang('general.ok')
        //       }
        //     ]
        //   });

        // }else{
          oldResidentDiscount = parseFloat(self.element.find('.price_block ul li.resident').attr('data-value') || 0);
          oldLargeFamilyDiscount = parseFloat(self.element.find('.price_block ul li.large_family').attr('data-value') || 0);
          oldFeeResidentDiscount = parseFloat(self.element.find('.price_block ul li.fee_resident').attr('data-value') || 0);
          oldFeeLargeFamilyDiscount = parseFloat(self.element.find('.price_block ul li.fee_large_family').attr('data-value') || 0);

          if (codeValid) {
            /* Get sessionId */
            var sessionId = self.element.find('.process_step').attr('data-sessionId');

            /* Call AJAX module to get the json */
            Bus.publish('services', 'getPromotionCode', {
              sessionId: self.element.find('.process_step').attr('data-sessionId'),
              promoCode: code,
              paymentMethodType: 'PROMOPAYPAL',
              success: function (data) {
                var points;
                var minValue;

                if (data.header.code == 200 && data.body.data.passengers.length > 0) {
                  var currentDiscount = 0;
                  var description = data.body.data.promotion.description;
                  var passengers = data.body.data.passengers;
                  var currency = data.body.data.passengers[0].discounts[0].currency.code;

                  /* Calc total discount */
                  $.each(passengers, function (indexPassenger, passenger) {
                    $.each(passenger.discounts, function (indexDiscount, discount) {

                      /* Sum total promo discount */
                      if (discount.type == 'PROMOTION') {
                        totalDiscount += discount.amount;
                      }

                      /* Sum total resident discount */
                      if (discount.type == 'RESIDENT') {
                        newResidentDiscount += discount.amount;
                      }

                      /* Sum total large family discount */
                      if (discount.type == 'LARGEFAMILY_NORMAL' || discount.type == 'LARGEFAMILY_SPECIAL') {
                        newLargeFamilyDiscount += discount.amount;
                      }

                      if(discount.type == 'SERVICE_FEE_RESIDENT'){
                        newFeeResidentDiscount += discount.amount;
                      }

                      if(discount.type == 'SERVICE_FEE_LARGEFAMILY'){
                        newFeeLargeFamilyDiscount += discount.amount;
                      }

                    });
                  });

                  // console.log("El descuento acumulado es: ", totalDiscount);
                  // console.log("El nuevo resident discount es: ", newResidentDiscount);
                  // console.log("El nuevo large family discount es: ", newLargeFamilyDiscount);

                  /* Update description and total */
                  $groupBody.find('.promotion_valid').val('1');
                  $promoPaypal.find('.promotion_paypal_discount .discount_title strong').html(formatCurrency(totalDiscount) + ' ' + currency);
                  $promoPaypal.find('.promotion_paypal_discount .discount_subtitle span').text(description);
                  $promoPaypal.find('.input_total_discount').val(totalDiscount);
                  $promoPaypal.find('.input_promotion_paypal_description').val(description);
                  $promoPaypal.find('.input_new_resident_discount_paypal_promo').val(newResidentDiscount);
                  $promoPaypal.find('.input_new_large_family_discount_paypal_promo').val(newLargeFamilyDiscount);
                  $fieldsetPromoPaypal.find('.input_code_promotion_valid').val('true');

                  //$promoPaypal.find('.input_new_fee_resident_discount').val(newFeeResidentDiscount);
                  //$promoPaypal.find('.input_new_fee_large_family_discount').val(newFeeLargeFamilyDiscount);


                  /* Update itemization discount */
                  // var currentDiscount = parseFloat(self.element.find('.price_block ul li.discount').attr('data-value') || 0);
                  // currentDiscount = currentDiscount - totalDiscount;
                  // self.addPrice('discount', lang('general.discount'), currentDiscount);

                  self.addPrice('promotion_paypal_discount', lang('general.promotional_paypal_discount'), totalDiscount * -1);

                  /* Update itemization resident - Replace the current discount for this one */
                  self.addPrice('resident', lang('general.resident_discount'), newResidentDiscount * -1);

                  /* Update itemization resident - Replace the current discount for this one */
                  self.addPrice('large_family', lang('general.large_family_discount'), newLargeFamilyDiscount * -1);

                  self.addPrice('fee_resident', lang('general.fee_resident_discount'), newFeeResidentDiscount * -1);

                  self.addPrice('fee_large_family', lang('general.fee_large_family_discount'), newFeeLargeFamilyDiscount * -1);

                  /* Update discountApplied flag */
                  discountApplied = true;

                  /* Animation to hide login form and show options */
                  $promoForm.slideUp(300, function () {

                    $promotionPaypalCodeField.closest('.field').addClass('disabled');

                    /* Show error message */
                    $fieldsetPromoPaypal.removeClass('error');
                    if ($fieldsetPromoPaypal.find('.group_body .my_ae_login .form_error').length > 0) {
                      $fieldsetPromoPaypal.find('.group_body .my_ae_login .form_error').remove();
                    }

                    $promoPaypal.slideDown(300);
                  });

                  $promoPaypalDiscount.slideDown(300);
                }
                else {
                  var message = (data.header.message) ? data.header.message : lang('general.incorrect_code');

                  if (data.header &&
                          (data.header.code === 11000 || (data.header.code === 11001)))
                  {
                    self.traceManager('cko_error', self.checkoutData, data.header.code.toString(), null);
                  }

                  /* Show error message */
                  $fieldsetPromoPaypal.addClass('error');
                  if ($fieldsetPromoPaypal.find('.group_body .promotion_paypal_code .form_error').length > 0) {
                    $fieldsetPromoPaypal.find('.group_body .promotion_paypal_code .form_error').remove();
                  }

                  $fieldsetPromoPaypal.find('.group_body .promotion_paypal_code .fieldset_header').after('<div class="form_error"><div class="error_message"><p>' + message + '</p></div></div>');

                  $promoPaypal.find('.input_code_promotion_valid').val('false');

                  /* Show field errors */
                  $promotionPaypalCodeField.closest('.field').removeClass('initial_status');
                }
              }
            });
          }
          else {
            /* Show error message */
            $fieldsetPromoPaypal.addClass('error');
            if ($fieldsetPromoPaypal.find('.group_body .promotion_paypal_code .form_error').length > 0) {
              $fieldsetPromoPaypal.find('.group_body .promotion_paypal_code .form_error').remove();
            }

            $fieldsetPromoPaypal.find('.group_body .promotion_paypal_code .fieldset_header').after('<div class="form_error"><div class="error_message"><p>' + lang('general.incorrect_code') + '</p></div></div>');

            /* Show field errors */
            $promotionPaypalCodeField.closest('.field').removeClass('initial_status');
          }


        // }

      });

      /* Listen parent radio button to set the price if it's previously selected */
      this.element.find('.promotion_paypal_code').closest('.payment_method').find('.group_header input').on('change', function () {
        // console.log("Lanza el change con totalDiscount a: " + totalDiscount)
        if (totalDiscount > 0) {

          setTimeout(function () {
            // console.log("Salta el select del código promo");
            // console.log("Seteamos resident discount a: ", newResidentDiscount)
            // console.log("Seteamos large large_family discount a: ", newLargeFamilyDiscount)

            /* Update itemization */
            // var currentDiscount = parseFloat(self.element.find('.price_block ul li.discount').attr('data-value') || 0);
            // currentDiscount = currentDiscount - totalDiscount;
            // self.addPrice('discount', lang('general.discount'), currentDiscount);

            self.addPrice('promotion_paypal_discount', lang('general.promotional_discount'), totalDiscount * -1);

            /* Update itemization resident - Replace the current discount for this one */
            //oldResidentDiscount = parseFloat(self.element.find('.price_block ul li.resident').attr('data-value') || 0);
            self.addPrice('resident', lang('general.resident_discount'), newResidentDiscount * -1);

            /* Update itemization resident - Replace the current discount for this one */
            //oldLargeFamilyDiscount = parseFloat(self.element.find('.price_block ul li.large_family').attr('data-value') || 0);
            self.addPrice('large_family', lang('general.large_family_discount'), newLargeFamilyDiscount * -1);

            self.addPrice('fee_resident', lang('general.fee_resident_discount'), newFeeResidentDiscount * -1);

            self.addPrice('fee_large_family', lang('general.fee_large_family_discount'), newFeeLargeFamilyDiscount * -1);


            discountApplied = true;
          }, 300);
        }

        /* Disable the promotion field if it's already logged in */
        if ($fieldsetPromoPaypal.find('.promotion_paypal_valid').val() == 1) {
          setTimeout(function () {
            $promotionPaypalCodeField.closest('.field').addClass('disabled');
          }, 300);
        }
      });

      /* Listen parent radio button to clean the price */
      this.element.find('.promotion_paypal_code').closest('.payment_method').find('.group_header input').on('unselect', function () {
        // console.log("Lanza el unselect con totalDiscount a: " + totalDiscount)
        if (totalDiscount > 0 && discountApplied) {
          // console.log("Salta el unselect del código promo");
          // console.log("Reseteamos resident discount a: ", oldResidentDiscount)
          // console.log("Reseteamos large large_family discount a: ", oldLargeFamilyDiscount)

          /* Update itemization */
          // var currentDiscount = parseFloat(self.element.find('.price_block ul li.discount').attr('data-value') || 0);
          // currentDiscount = currentDiscount + totalDiscount;
          // self.addPrice('discount', lang('general.discount'), currentDiscount);
          self.cleanPrice('promotion_paypal_discount');

          /* Update itemization resident - Replace the current discount for this one */
          self.addPrice('resident', lang('general.resident_discount'), oldResidentDiscount);

          /* Update itemization resident - Replace the current discount for this one */
          self.addPrice('large_family', lang('general.large_family_discount'), oldLargeFamilyDiscount);

          self.addPrice('fee_resident', lang('general.fee_resident_discount'), newFeeResidentDiscount * -1);

          self.addPrice('fee_large_family', lang('general.fee_large_family_discount'), newFeeLargeFamilyDiscount * -1);

          discountApplied = false;
        }
      });

      /* Trigger change for the selected payment method */
      if (this.element.find('.promotion_paypal_code').closest('.payment_method').find('.group_header input').is(':checked')) {
        this.element.find('.promotion_paypal_code').closest('.payment_method').find('.group_header input').trigger('change');
      }

    },
    creditCardFee: function () {
      var self = this;
      var $creditCardType = this.element.find('.credit_card_type');

      $creditCardType.each(function () {
        var $field = $(this);
        var fee;
        var $inputRadio = $field.closest('.check_group').find('.group_header input[type=radio]');

        /* Listen change to the card select */
        $field.find('select').on('change', function () {
          var $select = $(this);
          var $option = $select.find('option:selected');
          fee = parseFloat($option.attr('data-fee'));

          // console.log("Método: " + $select.closest('fieldset').attr('class'))
          // console.log("Opción elegida: " + $option.attr('value'))
          // console.log("Fee: " + fee);

          self.cleanPrice('CARD_TYPE_PAYMENT');
          if (fee > 0) {
            self.addPrice('CARD_TYPE_PAYMENT ' + $inputRadio.val(), lang('general.card_fee'), fee);
          }
        });

        // console.log("Evalua: " + $field.closest('fieldset').attr('class'))
        // console.log($field.closest('.check_group').hasClass('opened'))
        // console.log($field.closest('.check_group').find('.group_header input[type=radio]').is(':checked'));

        /* Trigger change for the selected payment method */
        if ($inputRadio.is(':checked')) {
          // console.log("Está activo: " + $field.closest('fieldset').attr('class'))
          $field.find('select').trigger('change');
        }

        /* Listen parent radio button to set the price if it's previously selected */
        $field.closest('.payment_method').find('.group_header input').on('change', function () {
          if (fee > 0) {
            $field.find('select').trigger('change');
          }
        });

        /* Listen parent radio button to clean the price */
        $field.closest('.payment_method').find('.group_header input').on('unselect', function () {
          self.cleanPrice('CARD_TYPE_PAYMENT.'+$inputRadio.val());
        });
      });
    },
    aeCard: function () {
      var self = this;
      var $aeCardPaymentMethod = this.element.find('.payment_method.ae');
      var totalBaseFare = self.baseFare;
      var aeCardDiscountAmount = 0;
      var newResidentDiscount = 0;
      var newLargeFamilyDiscount = 0;
      var newFeeResidentDiscount = 0;
      var newFeeLargeFamilyDiscount = 0;
      var oldResidentDiscount = 0;
      var oldLargeFamilyDiscount = 0;
      var oldFeeResidentDiscount = 0;
      var oldFeeLargeFamilyDiscount = 0;
      var discountApplied = false;

      oldResidentDiscount = parseFloat(self.element.find('.price_block ul li.resident').attr('data-value') || 0);
      oldLargeFamilyDiscount = parseFloat(self.element.find('.price_block ul li.large_family').attr('data-value') || 0);
      oldFeeResidentDiscount = parseFloat(self.element.find('.price_block ul li.fee_resident').attr('data-value') || 0);
      oldFeeLargeFamilyDiscount = parseFloat(self.element.find('.price_block ul li.fee_large_family').attr('data-value') || 0);

      if (self.checkoutData.methods) {
        $.each(self.checkoutData.methods, function (indexMethod, method) {
          if (method.type == 'AIREUROPA_CREDITCARD') {
            $.each(method.discountsToApply, function (indexMethod, passenger) {

              // console.log(passenger);

              $.each(passenger.discountItemization, function (indexDiscount, discount) {

                /* Sum total promo discount */
                if (discount.discountType == 'AIREUROPA_CREDITCARD') {
                  aeCardDiscountAmount += discount.price.amount;
                }

                /* Sum total resident discount */
                if (discount.discountType == 'RESIDENT') {
                  newResidentDiscount += discount.price.amount;
                }

                /* Sum total large family discount */
                if (discount.discountType == 'LARGEFAMILY_NORMAL' || discount.type == 'LARGEFAMILY_SPECIAL') {
                  newLargeFamilyDiscount += discount.price.amount;
                }

                /* Sum total resident discount */
                if (discount.discountType == 'SERVICE_FEE_RESIDENT') {
                  newFeeResidentDiscount += discount.price.amount;
                }

                /* Sum total resident discount */
                if (discount.discountType == 'SERVICE_FEE_LARGEFAMILY') {
                  newFeeLargeFamilyDiscount += discount.price.amount;
                }
              });
            });
          }
        });
      }

      // console.log("Base fare: ", totalBaseFare);
      // console.log("Descuento a añadir: ", aeCardDiscountAmount);
      // console.log("El nuevo resident discount es: ", newResidentDiscount);
      // console.log("El nuevo large family discount es: ", newLargeFamilyDiscount);
      // console.log("El old resident discount es: ", oldResidentDiscount);
      // console.log("El old large family discount es: ", oldLargeFamilyDiscount);


      /* Listen parent radio button to set the price if it's previously selected */
      $aeCardPaymentMethod.find('.group_header input').on('change', function () {
        if (aeCardDiscountAmount > 0) {
          setTimeout(function () {
            // console.log("Salta el select de AE");
            // console.log("Seteamos resident discount a: ", newResidentDiscount)
            // console.log("Seteamos large large_family discount a: ", newLargeFamilyDiscount)

            /* Update itemization */
            var currentDiscount = parseFloat(self.element.find('.price_block ul li.discount').attr('data-value')) || 0;
            currentDiscount = currentDiscount - aeCardDiscountAmount;
            self.addPrice('discount', lang('general.discount'), currentDiscount);

            /* Update itemization resident - Replace the current discount for this one */
            // oldResidentDiscount = parseFloat(self.element.find('.price_block ul li.resident').attr('data-value') || 0);
            self.addPrice('resident', lang('general.resident_discount'), newResidentDiscount * -1);

            /* Update itemization resident - Replace the current discount for this one */
            // oldLargeFamilyDiscount = parseFloat(self.element.find('.price_block ul li.large_family').attr('data-value') || 0);
            self.addPrice('large_family', lang('general.large_family_discount'), newLargeFamilyDiscount * -1);

            self.addPrice('fee_resident', lang('general.fee_resident_discount'), newFeeResidentDiscount * -1);

            self.addPrice('fee_large_family', lang('general.fee_large_family_discount'), newFeeLargeFamilyDiscount * -1);


            discountApplied = true;

          }, 300);
        }
      });

      /* Listen parent radio button to clean the price */
      $aeCardPaymentMethod.find('.group_header input').on('unselect', function () {
        if (aeCardDiscountAmount > 0 && discountApplied) {
          // console.log("Salta el unselect de AE");
          // console.log("Reseteamos resident discount a: ", oldResidentDiscount)
          // console.log("Reseteamos large large_family discount a: ", oldLargeFamilyDiscount)

          /* Update itemization */
          var currentDiscount = parseFloat(self.element.find('.price_block ul li.discount').attr('data-value') || 0);
          currentDiscount = currentDiscount + aeCardDiscountAmount;
          self.addPrice('discount', lang('general.discount'), currentDiscount);

          /* Update itemization resident - Replace the current discount for this one */
          self.addPrice('resident', lang('general.resident_discount'), oldResidentDiscount);

          /* Update itemization resident - Replace the current discount for this one */
          self.addPrice('large_family', lang('general.large_family_discount'), oldLargeFamilyDiscount);

          self.addPrice('fee_resident', lang('general.fee_resident_discount'), newFeeResidentDiscount * -1);

          self.addPrice('fee_large_family', lang('general.fee_large_family_discount'), newFeeLargeFamilyDiscount * -1);

          discountApplied = false;
        }
      });

      /* Trigger change for the selected payment method */
      if ($aeCardPaymentMethod.find('.group_header input').is(':checked')) {
        $aeCardPaymentMethod.find('.group_header input').trigger('change');
      }

    },
    paypal: function () {
      var self = this;
      var $paypalCardPaymentMethod = this.element.find('.payment_method.paypal');
      var fee = parseFloat($paypalCardPaymentMethod.find('.group_header input').attr('data-fee'));

      /* Listen parent radio button to set the price if it's previously selected */
      $paypalCardPaymentMethod.find('.group_header input').on('change', function () {
        if (fee > 0) {
          self.addPrice('PAYPAL_FEE', lang('general.paypal_fee'), fee);
        }
        else {
          self.cleanPrice('PAYPAL_FEE');
        }
      });

      /* Listen parent radio button to clean the price */
      $paypalCardPaymentMethod.find('.group_header input').on('unselect', function () {
        self.cleanPrice('PAYPAL_FEE');
      });

      /* Trigger change for the selected payment method */
      if ($paypalCardPaymentMethod.find('.group_header input').is(':checked')) {
        $paypalCardPaymentMethod.find('.group_header input').trigger('change');
      }

    },

    myMiles: function() {
      var $myMilesPaymentMethod = this.element.find('.payment_method.mymiles');
      var $myMilesPaymentMethodSlider = $myMilesPaymentMethod.find('.slider_field');
      var $myMilesPaymentMethodSliderRange = $myMilesPaymentMethodSlider.find('.slider_range');
      /* set totalMiles in the resume */
      var $myMilesTotalResume = this.element.find('.miles_block .miles_total');

      var self = this;

      $myMilesPaymentMethod.find('.slider_field .slider_range').on('slide', function(event, ui) {
        var $this = $(this);
        var amount;
        var redemptionFactor;
        var amountMiles;
        var max = $myMilesPaymentMethodSlider.attr('data-max');

        redemptionFactor = $myMilesPaymentMethodSlider.attr('data-redemption-factor') ? $myMilesPaymentMethodSlider.attr('data-redemption-factor') : 1;

        /* Calc percentage and amount */
        amountMiles = (ui && ui.value) || parseInt($myMilesPaymentMethodSlider.attr('data-min'));

        if (amountMiles > max){
          amountMiles = max;
        }

        amount = window.roundDecimals((redemptionFactor * amountMiles), 'ceil');

        self.addPrice('MILES_FEE', lang('general.miles_fee'), amount*-1);

        /* show total miles under the total prize */
        $myMilesTotalResume.text(amountMiles);
      });

      /* Listen parent radio button to set the price if it's previously selected */
      $myMilesPaymentMethod.find('.group_header input').on('change', function () {
        $myMilesPaymentMethodSliderRange.trigger('slide');
      });

      /* Listen parent radio button to clean the price */
      $myMilesPaymentMethod.find('.group_header input').on('unselect', function () {
        $myMilesPaymentMethodSliderRange.slider('value', parseInt($myMilesPaymentMethodSlider.attr('data-min')));
        self.cleanPrice('MILES_FEE');
      });

      /* Trigger change for the selected payment method */
      if ($myMilesPaymentMethod.find('.group_header input').is(':checked')) {
        $myMilesPaymentMethod.find('.group_header input').trigger('change');
      }

    },

    autocompleteSelects: function () {
      var self = this;
      /* dont check FF yet */
      self.checkFrequent_Flyer_in_autoComplete = false;

      this.element.find('.select_field.data_autocomplete').on('change', function (event) {
        var $this = $(this);
        var $fieldset = $this.closest('fieldset');
        var $passenger = $this.closest('.passenger');
        var object = $this.attr('data-object');
        var $option = $this.find('option:selected');
        var value = $option.attr('value');
        var shouldDisable = $this.hasClass('autocomplete_disable') && (value);
        var autocompleteData;

        /* change FF passenger, so AutoComplete is true, to check the FF validation */
        self.isAutoComplete = true;

        self.isPaymentSave = false;

        _.each(self.checkoutData[object], function (element, index, list) {
          if (element.identity === parseInt(value) || element.hashId === value) {
            autocompleteData = element;
            self.isPaymentSave = true;
          }
        });

        /* Autocomplete selects */
        $fieldset.find('select[data-autocomplete-name]').each(function () {
          var $field = $(this);
          var autocompleteName = $field.attr('data-autocomplete-name');
          var newValue = Object.byString(autocompleteData, autocompleteName);

          // console.log($field, autocompleteName, newValue);

          if (newValue) {
            // console.log($field, "Marca la opción", newValue);
            $field.find('option[data-autocomplete-value="' + newValue + '"]').prop('selected', 'selected').trigger('change',  [true]);
          }
          else {
            $field.find('option[value=""]').first().prop('selected', 'selected').trigger('change',  [true]).closest('.field').addClass('initial_status');
          }

          if (shouldDisable) {
            $field.closest('.field').addClass('non_editable disabled');
          }
          else {
            $field.closest('.field').removeClass('non_editable disabled');
          }
        });

        /* Autocomplete text fields */
        $fieldset.find('input[type=text][data-autocomplete-name]').each(function () {
          var $field = $(this);
          var autocompleteName = $field.attr('data-autocomplete-name');
          var newValue = Object.byString(autocompleteData, autocompleteName);

          if (newValue) {
            $field.val(newValue).trigger('validate').trigger('blur');
          }
          else {
            $field.val('').trigger('validate').closest('.field').addClass('initial_status');
          }

          if (shouldDisable) {
            $field.closest('.field').addClass('non_editable disabled');
          }
          else {
            $field.closest('.field').removeClass('non_editable disabled');
          }
        });

        /* Autocomplete checkboxes */
        $fieldset.find('input[type=checkbox][data-autocomplete-name]').each(function () {
          var $field = $(this);
          var autocompleteName = $field.attr('data-autocomplete-name');
          var newValue = Object.byString(autocompleteData, autocompleteName);

          // don't autocomplete resident checkbox
          if (autocompleteName !== 'resident') {
            if (newValue === true) {
              $field.prop('checked', true).change();
            }
            else {
              $field.prop('checked', false).change();
            }

            if (shouldDisable) {
              $field.closest('.field').addClass('non_editable disabled');
            }
            else {
              $field.closest('.field').removeClass('non_editable disabled');
            }
          }
        });

        if ($passenger.find('.frequent_flyer_group .group_header input').is(':checked')) {
            self.callToFrequentFlyerCheck($passenger);
            checkFrequent_Flyer_in_autoComplete = true;
        }

        // update bithdate combos by its hidden input value
        $fieldset.find('.edad').each(function() {
          var ageValue = $(this).val();
          var targetId = $(this).attr("id");

          $("."+targetId+".byear option:selected").removeAttr("selected");
          $("."+targetId+".bmonth option:selected").removeAttr("selected");
          $("."+targetId+".bday option:selected").removeAttr("selected");

          if (ageValue != "") {
            var dateParts = $("#"+targetId).val().split("/");

            $("."+targetId+".byear").val(dateParts[2]).trigger('change', [true]);
            $("."+targetId+".bmonth").val(dateParts[1]).trigger('change', [true]);
            $("."+targetId+".bday").val(dateParts[0]).trigger('change', [true]);
          } else {
            $("."+targetId+".byear").val("").trigger('change', [true]).closest('.field').addClass('initial_status');
            $("."+targetId+".bmonth").val("").trigger('change', [true]).closest('.field').addClass('initial_status');
            $("."+targetId+".bday").val("").trigger('change',  [true]).closest('.field').addClass('initial_status');

            // class 'initial_value' must be added when value is empty, to avoid 'required field error'
          };
        });

        // update bithdate combos by its hidden input value
        $fieldset.find('.doc-expiration').each(function() {
          var ageValue = $(this).val();
          var targetId = $(this).attr("id");

          $("."+targetId+".year_input option:selected").removeAttr("selected");
          $("."+targetId+".month_input option:selected").removeAttr("selected");
          $("."+targetId+".day_input option:selected").removeAttr("selected");

          if (ageValue != "") {
            var dateParts = $("#"+targetId).val().split("/");

            $("."+targetId+".year_input").val(dateParts[2]).trigger('change', [true]);
            $("."+targetId+".month_input").val(dateParts[1]).trigger('change', [true]);
            $("."+targetId+".day_input").val(dateParts[0]).trigger('change', [true]);
          } else {
            $("."+targetId).closest('.field').addClass('initial_status');

            $("."+targetId+".year_input").val("").trigger('change', [true]).closest('.field').addClass('initial_status');
            $("."+targetId+".month_input").val("").trigger('change', [true]).closest('.field').addClass('initial_status');
            $("."+targetId+".day_input").val("").trigger('change', [true]).closest('.field').addClass('initial_status');

            // class 'initial_value' must be added when value is empty, to avoid 'required field error'
          };
        });

        // update expiration card combos by its hidden input value
        $fieldset.find(".expirationremember").each(function() {
          var expirationValue = $(this).val();
          var targetId        = $(this).attr("id");

          $("."+targetId+".card_expirationyear option:selected").removeAttr("selected");
          $("."+targetId+".card_expirationmonth option:selected").removeAttr("selected");

          if (expirationValue != "") {
            var dateParts = $("#"+targetId).val().split("/");

            $("."+targetId+".card_expirationyear").val(dateParts[1]).trigger('change', [true]);
            $("."+targetId+".card_expirationmonth").val(dateParts[0]).trigger('change', [true]);
          } else {
            $("."+targetId).closest('.field').addClass('initial_status');

            $("."+targetId+".card_expirationyear").val("").trigger('change', [true]).closest('.field').addClass('initial_status');
            $("."+targetId+".card_expirationmonth").val("").trigger('change', [true]).closest('.field').addClass('initial_status');

            // class 'initial_value' must be added when value is empty, to avoid 'required field error'
          };
        });

        /* Put extra class on check_group payment_method fieldset for payment method owner and input positions */
        if (value!='') {
          $fieldset.addClass('autocomplete_data');
          /* Put first pax email if select saved payment method */
          if (self.checkoutData.calculatePassengers && self.checkoutData.calculatePassengers[0].email && self.checkoutData.calculatePassengers[0].email!='') {
            $fieldset.find('.field.text_field.email').find('input').val(self.checkoutData.calculatePassengers[0].email);
            $fieldset.find('.field.text_field.email').find('input').trigger('validate');
          }
        } else {
          $fieldset.removeClass('autocomplete_data');
          $fieldset.find('.field.text_field.email').find('input').val('');
        }

      });

      this.element.find('.select_field.data_autocomplete').each(function () {
        var $this = $(this);
        var $option = $this.find('option:selected');
        var value = $option.attr('value');

        if (value) {
          /* We put a setTimeout function because in check_group.js from widgets/form/fields, we
          trigger and _enableFields each time check_group is checked with 100ms delay to enable that check_group fields.
          Convenient SERIOUS refactor of check_group.js removing setTimeout! */
          setTimeout(function(){ $this.trigger('change'); }, 150);
        }
      });

    },

    /* Seats map */

    composeSeatMap: function () {
      var self = this;

      this.element.find('.seat_field .field_wrapper a').on('click', function (event) {
        event.preventDefault();

        var $this = $(this);
        var classSeatType = $this.closest('.extra_options').hasClass('premium_economy') ? 'premium_economy' : 'seat';
        var seatMapService = classSeatType == 'premium_economy' ? 'premium' : 'seat';
        var sessionId = self.element.find('.process_step').attr('data-sessionId');
        var segment = $this.closest('.seat_field').attr('data-segment');
        var passenger = $this.closest('.check_group').attr('data-passenger');

        /* Add loading class to the button */
        $this.addClass('loading');

        /* Add class focused to this field */
        $this.closest('.seat_field').addClass('focused');

        /* Call AJAX module to get the json with plane structure */
        Bus.publish('services', 'getSeatMap', {
          data: {
            sessionId: sessionId,
            segment: segment,
            passenger: passenger
          },
          type: seatMapService,
          success: function (data) {
            if (!data.header.error) {
              data = data.body.data;

              data.flightATR = (data.aircraftType.model === 'ATR');
              data.flightATRMessage = '';
              if (data.flightATR)
                data.flightATRMessage = lang('message_flight_ATR');

              /* Get the template */
              Bus.publish('ajax', 'getTemplate', {
                path: AirEuropaConfig.templates.checkout.plane,
                success: function (template) {
                  var $html = template(data);

                  /* Remove loading class */
                  $this.removeClass('loading');

                  self.element.append($html);
                  self.initSeatsMap(data, seatMapService);
                }
              });
            }
            else {
              /* Remove loading class */
              $this.removeClass('loading');
              $this.closest('.seat_field').removeClass('focused');

              /* Show an error */
              $('#checkout').ui_dialog({
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
    initSeatsMap: function (data, type) {
      var self = this;
      var $seatsMapOverlay = this.element.find('.seats_map_overlay');
      var $seatsMapsWrapper = $seatsMapOverlay.find('.seats_map_wrapper');
      var $seatsMap = $seatsMapsWrapper.find('.seats_map');
      var $seatsTableWrapper = $seatsMapsWrapper.find('.seats_table_wrapper');
      var $seatsTable = $seatsMapsWrapper.find('.seats_table');
      var $gradientLeft = $seatsMapsWrapper.find('.gradient_left');

      /* Hide the overlay sending it outside viewport */
      $seatsMapOverlay.addClass('hidden').show();

      /* If Premium Economy is opened, add premium class */
      if (typeof type != 'undefined' && type == 'premium') {
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
      this.element.find('.extra_options.seats .seat_field[data-id-flight=' + idFlight + ']').each(function () {
        var $seatField = $(this);
        var selectedSeat = $seatField.find('input.seat_number_selected').val() + '-' + $seatField.find('input.seat_column_selected').val();

        if (selectedSeat != '-') {
          if (selectedSeat == currentValue) {
            /* If seat is premium and the map is not premium, user can't select same seat if changes */
            if ($seatsMapsWrapper.hasClass('premium')) {
              if ($seatsTable.find('.seat.' + selectedSeat).hasClass('premium'))
                $seatsTable.find('.seat.' + selectedSeat).removeClass('occupied');
            } else {
              if (!$seatsTable.find('.seat.' + selectedSeat).hasClass('premium'))
                $seatsTable.find('.seat.' + selectedSeat).removeClass('occupied');
            }
            $seatsTable.find('.seat.' + selectedSeat).addClass('current_selected');

            /* Move seats slide to passenger seat */
            $gradientLeft.show();
            var seatPosition = $seatsTable.find('.seat.' + selectedSeat).closest('.column.column_seats').position();
            if (seatPosition) {
              var newPosition = (-1 * (parseInt(seatPosition.left) / 2));
              if(newPosition === 0){
                $gradientLeft.hide();
              }
              $seatsTable.animate({
                'left': newPosition
              }, 300);
            }
          }
          else {
            $seatsTable.find('.seat.' + selectedSeat).addClass('selected');
          }
        }
      });

      /* Init arrows events */
      this.seatsMapArrows();

      /* Init seat events */
      this.seatEvents();

      /* Get prices */
      var xlPrice = this.getPrices('EXTRASIZE', data);
      var exitPrice = this.getPrices('EMERGENCY', data);
      var babiesPrice = this.getPrices('SUITABLE_ADULT_WITH_INFANT', data);
      var normalPrice = this.getPrices('NORMAL', data);
      var premiumPrice = this.getPrices('PREMIUM', data);

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
        if (xlPrice)
          $seatsMapsWrapper.find('.legend .xl').attr('data-value', xlPrice.amount).removeClass('hidden').find('span').append(" " + formatCurrency(xlPrice.amount) + " " + xlPrice.currencyCode);
        if (exitPrice)
          $seatsMapsWrapper.find('.legend .exit').attr('data-value', exitPrice.amount).removeClass('hidden').find('span').append(" " + formatCurrency(exitPrice.amount) + " " + exitPrice.currencyCode);
        if (babiesPrice)
          $seatsMapsWrapper.find('.legend .babies').attr('data-value', babiesPrice.amount).removeClass('hidden').find('span').append(" " + formatCurrency(babiesPrice.amount) + " " + babiesPrice.currencyCode);
        if (normalPrice)
          $seatsMapsWrapper.find('.legend .normal').attr('data-value', normalPrice.amount).removeClass('hidden').find('span').append(" " + formatCurrency(normalPrice.amount) + " " + normalPrice.currencyCode);
        if (premiumPrice)
          $seatsMapsWrapper.find('.legend .premium').attr('data-value', premiumPrice.amount).removeClass('hidden').find('span').append(" " + formatCurrency(premiumPrice.amount) + " " + premiumPrice.currencyCode);
      }

      /* Show overlay */
      $seatsMapOverlay.removeClass('hidden');

      /* Trace manager gtm */
      (typeof type != 'undefined' && type == 'premium')
              ? self.traceManager('show_seats_pe', self.checkoutData, null, type)
              : self.traceManager('show_seats', self.checkoutData, null, type);

    },
    getPrices: function (type, data) {
      var price = false;
      var breakEach = false;

      $.each(data.map, function (idRow, row) {
        $.each(row, function (idSeat, seat) {
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

        if (breakEach)
          return false;
      });

      return price;
    },
    seatsMapArrows: function () {
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
      $seatsMap.on('click', '.arrows a', function (event) {
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
        if (newPosition >= 0)
          newPosition = 0;
        if (newPosition <= minLeft)
          newPosition = minLeft;

        /* Animate */
        $seatsTable.animate({
          'left': newPosition
        }, 300, function () {
          if (newPosition >= 0)
            $gradientLeft.hide();
          else
            $gradientLeft.show();
        });
      });

      $seatsMapOverlay.on('click', '.close_seats_map a', function (event) {
        event.preventDefault();
        self.element.find('.seat_field.focused').removeClass('focused');
        $seatsMapOverlay.remove();
      });
    },
    seatEvents: function () {
      var self = this;
      var $seatsMapOverlay = this.element.find('.seats_map_overlay');
      var $seatsMapsWrapper = $seatsMapOverlay.find('.seats_map_wrapper');
      var $seatsTable = $seatsMapsWrapper.find('.seats_table');
      var $seatFieldOpener = self.element.find('.seat_field.focused');

      /* Get vars for service */
      var sessionId = this.element.find('.process_step').attr('data-sessionId');
      var segment = $seatFieldOpener.attr('data-segment');
      var direction = $seatFieldOpener.attr('data-direction');
      var passenger = $seatFieldOpener.closest('.check_group').attr('data-passenger');
      var passengerIndex = $seatFieldOpener.closest('.check_group').attr('data-index-passenger');
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
      $seatsTable.on('click', '.seat', function (event) {
        event.preventDefault();

        var $this = $(this);
        var isOccupied = $this.hasClass('occupied');
        var isSelected = $this.hasClass('selected');
        var isEmergency = $this.hasClass('exit');
        var isForBabies = $this.hasClass('babies');

        if ((!(isOccupied || isSelected)) && (!(applyIntantSeatsRestriction && !isForBabies))) {
          if ($this.hasClass('current_selected')) {
            /* Remove current selected */
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
              $seatsMapOverlay.find('.emergency_dialog .dialog_buttons .cancel a').on('click', function (event) {
                event.preventDefault();

                /* Hide dialog */
                $seatsMapOverlay.find('.emergency_dialog').removeClass('visible');
              });

              $seatsMapOverlay.find('.emergency_dialog .dialog_buttons .ok a').off('click');
              $seatsMapOverlay.find('.emergency_dialog .dialog_buttons .ok a').on('click', function (event) {
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
      $seatsMapOverlay.on('click', '.confirm_seats a', function (event) {
        event.preventDefault();

        /* Get references */
        var $this = $(this);
        var $selectedSeat = $seatsTable.find('.current_selected');
        var $seatFieldOpenerNumber = $seatFieldOpener.find('input.seat_number_selected');
        var $seatFieldOpenerColumns = $seatFieldOpener.find('input.seat_column_selected');
        var $seatFieldOpenerPrice = $seatFieldOpener.find('input.price_selected');
        var $selectedValuePlaceholder = $seatFieldOpener.find('.selected_value');
        var $seatFieldOpenerType = $seatFieldOpener.find('input.seat_type');

        /* Get last number and column */
        var lastNumber = $seatFieldOpenerNumber.val();
        var lastColumn = $seatFieldOpenerColumns.val();

        /* Get seat type from */
        var selectedSeatType;

        /* Check premium economy - it can have other classes but premium economy is more important */
        if ($selectedSeat.hasClass('premium')) {
          selectedSeatType = 'premium_economy';
        }
        else {
          /* Check other seats */
          if ($selectedSeat.hasClass('xl')) {
            selectedSeatType = 'xl';
          }
          else if ($selectedSeat.hasClass('exit')) {
            selectedSeatType = 'exit';
          }
          else {
            selectedSeatType = 'seats';
          }
        }

        /* Assign seat type to the opener input */
        $seatFieldOpenerType.val(selectedSeatType);

        /* If $seatsMapsWrapper has class premium, Premium Economy map is opened */
        var seatMapClass = 'seat';
        if ($seatsMapsWrapper.hasClass('premium')) {
          seatMapClass = 'premium';
        }

        /* If it's a selected seat, check if it wasn't selected before and call the service to validate it */
        if ($selectedSeat.length > 0) {
          /* Add loading class to the button */
          $this.addClass('loading');

          /* Get current number and column */
          var number = $selectedSeat.attr('data-number');
          var column = $selectedSeat.attr('data-column');
          var price = $selectedSeat.attr('data-price');

          /* If there's a different seat selected, call to service */
          if (number != lastNumber || column != lastColumn) {
            /* Call putSeat service */
            Bus.publish('services', 'putSeat', {
              data: {
                sessionId: sessionId,
                segment: segment,
                passenger: passenger,
                number: number,
                column: column
              },
              type: seatMapClass,
              success: function (data) {
                var message = data.header.message;

                if (data.header.code == 200 || data.header.code == 3112) {
                  $seatFieldOpener.attr('data-add-price', 'true');

                  /* Pass the temp vars to current selected */
                  $seatFieldOpenerNumber.val(number);
                  $seatFieldOpenerColumns.val(column);
                  $seatFieldOpenerPrice.val(price).change();

                  /* Put selected seat in passenger info session object */
                  var seatObject = {
                    number: number,
                    column: column,
                    price: price
                  };

                  /* Create the seats object for this passenger */
                  if (!self.checkoutData.servicePassengers[passengerIndex].seats) {
                    self.checkoutData.servicePassengers[passengerIndex].seats = {};
                  }

                  if (!self.checkoutData.servicePassengers[passengerIndex].seats[direction]) {
                    self.checkoutData.servicePassengers[passengerIndex].seats[direction] = {};
                  }

                  // if (!self.checkoutData.servicePassengers[passengerIndex].seats[direction][segment]) {
                  self.checkoutData.servicePassengers[passengerIndex].seats[direction][segment] = {
                    number: number,
                    column: column,
                    price: price,
                    seat_type: selectedSeatType
                  };
                  // }

                  /* And set session */
                  var postSessionURL = getPostURL('checkout');
                  Bus.publish('ajax', 'postJson', {
                    path: postSessionURL,
                    data: {checkout: self.checkoutData},
                    success: function () {
                    }
                  });

                  /* Update the selected_value text for this seat and set it to filled status */
                  $seatFieldOpener.addClass('filled');
                  $selectedValuePlaceholder.html('<em>' + lang('general.seat') + ':</em>' + number + column);

                  /* Set same seat values to another seat zone */
                  self.clearNoSelectedSeatType(selectedSeatType, number, column, price, passengerIndex, direction, segment);

                  /* Remove kids seats */
                  if (data.header.code === 3112) {
                    self.removeChildrenSeats(data, segment, direction, selectedSeatType);
                  }
                }
                /* Show the error if needed */
                else {

                  /* Trace GTM */
                  if (data.header.code === 5200)
                  {
                    self.traceManager('cko_error', self.checkoutData, data.header.code.toString(), null);
                  }

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
          } else {
            /* Close the map */
            $seatsMapOverlay.find('.close_seats_map a').trigger('click');
          }

        }

        /* If it's not a current selected seat, but it was one before, call the delete seat service */
        else {
          /* If there was a seat selected, call to delete service */
          if (lastNumber != '' || lastColumn != '') {
            /* Add loading class to the button */
            $this.addClass('loading');

            /* Call deleteSeat service */
            Bus.publish('services', 'deleteSeat', {
              data: {
                sessionId: sessionId,
                segment: segment,
                passenger: passenger
              },
              type: seatMapClass,
              success: function (data) {
                // console.log(data)

                var message = data.header.message;

                if (data.header.code == 200) {
                  /* @TODO llamar a set de session con borrado de asiento */
                  $seatFieldOpener.attr('data-add-price', 'false');

                  self.checkoutData.servicePassengers[passengerIndex].seats[direction][segment] = {};

                  /* Delete temp vars and current selected */
                  $seatFieldOpenerNumber.val('');
                  $seatFieldOpenerColumns.val('');
                  $seatFieldOpener.find('input.seat_number_temp').val('');
                  $seatFieldOpener.find('input.seat_column_temp').val('');
                  $seatFieldOpener.find('input.price_selected').val(0).change();

                  /* Clean the selected_value text for this seat and clean filled status */
                  $seatFieldOpener.removeClass('filled');
                  $selectedValuePlaceholder.text('');
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

                /* Set same seat values to another seat zone */
                selectedSeatType = selectedSeatType == 'seats' ? 'premium_economy' : 'seats';
                self.clearNoSelectedSeatType(selectedSeatType, '', '', '', passengerIndex, direction, segment);
              }
            });
          }
        }
      });

    },

    /* Remove children seats when 3112 error code happens */
    removeChildrenSeats: function(data, segment, direction, selectedSeatType) {
      var self = this;
      var message = '';

      $.each(data.body.data, function(indexError, dataError){
        var $seatFieldError = self.element.find('.check_group[data-passenger='+dataError.passengerId+']');
        var $seatFieldErrorNumber = $seatFieldError.find('input.seat_number_selected');
        var $seatFieldErrorColumns = $seatFieldError.find('input.seat_column_selected');
        var $seatFieldErrorNumberTemp = $seatFieldError.find('input.seat_number_temp');
        var $seatFieldErrorColumnsTemp = $seatFieldError.find('input.seat_column_temp');
        var $seatFieldErrorPrice = $seatFieldError.find('input.price_selected');
        var $selectedValueErrorPlaceholder = $seatFieldError.find('.selected_value');

        $seatFieldError.attr('data-add-price', 'false');

        /* Get passenger index by passengerId */
        passengerIndex = $seatFieldError.attr('data-index-passenger');

        /* Pass the temp vars to current selected */
        $seatFieldErrorNumber.val('');
        $seatFieldErrorColumns.val('');
        $seatFieldErrorNumberTemp.val('');
        $seatFieldErrorColumnsTemp.val('');
        $seatFieldErrorPrice.val(0).change();

        self.checkoutData.servicePassengers[passengerIndex].seats = {};
        self.checkoutData.servicePassengers[passengerIndex].seats[direction] = {};

        self.checkoutData.servicePassengers[passengerIndex].seats[direction][segment] = {
          number: '',
          column: '',
          price: 0,
          seat_type: selectedSeatType
        };

        /* Update the selected_value text for this seat and set it to filled status */
        $seatFieldError.find('.field.seat_field').removeClass('filled');
        message += dataError.message+'\n';
      });

      /* And set session */
      var postSessionURL = getPostURL('checkout');
      Bus.publish('ajax', 'postJson', {
        path: postSessionURL,
        data: {checkout: self.checkoutData},
        success: function() {}
      });

      /* Shows first index of info message */
      $('#checkout').ui_dialog({
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

    /* Clear no selected seat type */
    clearNoSelectedSeatType: function (selectedType, number, column, price, passengerIndex, direction, segment) {
      var self = this;

      /* Clear the other seat selection */
      var noSelectedSeatType = (selectedType == 'premium_economy') ? 'seats' : 'premium_economy';
      var $noSelectedFieldset = self.element.find('fieldset.extra_options.' + noSelectedSeatType).find('.check_group[data-index-passenger=' + passengerIndex + ']');
      var $noSelectedFieldOpener = $noSelectedFieldset.find('.seat_field[data-direction=' + direction + '][data-segment=' + segment + ']');

      $noSelectedFieldOpener.find('input.seat_type').val(selectedType);
      $noSelectedFieldOpener.find('input.seat_number_temp').val(number);
      $noSelectedFieldOpener.find('input.seat_column_temp').val(column);
      $noSelectedFieldOpener.find('input.seat_number_selected').val(number);
      $noSelectedFieldOpener.find('input.seat_column_selected').val(column);
      $noSelectedFieldOpener.find('input.price_selected').val(0).change();
      $noSelectedFieldOpener.removeClass('filled');
      $noSelectedFieldOpener.find('.selected_value').text('');
      self.element.find('.field.seat_field').not('.filled').attr('data-add-price', 'false');
    },
    /* Data set and filters */
    getPassengerByIndex: function (passengerIndex) {
      return this.checkoutData.passengers[passengerIndex];
    },
    getExtraPassengersByIdentity: function (identity) {
      var foundPassenger = undefined;
      var cleanSeats = {ow: {}, rt: {}};

      if (this.checkoutData['servicePassengers'].length > 0) {
        $.each(this.checkoutData['servicePassengers'], function (indexPassenger, passenger) {
          if (identity == passenger.identity) {
            foundPassenger = $.extend({}, passenger); /* Clone the object */
            return false;
          }
        });
      }

      /* Loop seats to clean void ones */
      if (foundPassenger) {
        if (foundPassenger.seats && foundPassenger.seats.ow) {
          for (var segmentId in foundPassenger.seats.ow) {
            var segment = foundPassenger.seats.ow[segmentId];
            if (segment.number != '' && segment.column != '') {
              cleanSeats.ow[segmentId] = segment;
            }
          }
        }

        if (foundPassenger.seats && foundPassenger.seats.rt) {
          for (var segmentId in foundPassenger.seats.rt) {
            var segment = foundPassenger.seats.rt[segmentId];
            if (segment.number != '' && segment.column != '') {
              cleanSeats.rt[segmentId] = segment;
            }
          }
        }

        foundPassenger.seats = cleanSeats;
      }

      return foundPassenger;
    },
    setCheckoutsData: function (checkoutData) {
      /* Clean services data */
      checkoutData['services'] = null;

      /* Cache de data */
      this.checkoutData = checkoutData;
    },
    /* Send ancillaries */

    listenAncillaries: function () {
      var self = this;

      /* Selects */
      this.element.find('.field.select_field[data-add-ancillary=true] select').on('change', function () {
        var $this = $(this);
        var $ancillaryBlock = $this.closest('[data-ancillary-related]');

        /* Remove active class */
        $ancillaryBlock.removeClass('ancillary_active');

        /* Find selects and set active class if one of them has value*/
        $ancillaryBlock.find('.field.select_field[data-add-ancillary=true] select').each(function () {
          var $this = $(this);
          var $counter = $ancillaryBlock.find('.field.counter_field[data-add-ancillary=true] input');
          var active = false;

          /* If the select is a stand alone field, no counter */
          if ($counter.length == 0) {
            if ($this.val() != '') {
              active = true;
            }
          }
          /* If it has a counter associated */
          else {
            if ($this.val() != '' && parseInt($counter.val()) > 0) {
              active = true;
            }
          }

          if (active) {
            $ancillaryBlock.addClass('ancillary_active');
          }
        });

        self.composeAncillariesObject();
      }).change();

      /* Counter input */
      this.element.find('.field.counter_field[data-add-ancillary=true] input').on('change', function () {
        var $this = $(this);

        var $ancillaryBlock = $this.closest('[data-ancillary-related]');

        /* Remove active class */
        $ancillaryBlock.removeClass('ancillary_active');

        $ancillaryBlock.find('.field.counter_field[data-add-ancillary=true] input').each(function () {
        	var $this = $(this);
        	var active = false;

            if (parseInt($this.val()) > 0) {
                active = true;
              }

            if (active) {
                $ancillaryBlock.addClass('ancillary_active');
            }
        });

        self.composeAncillariesObject();
      }).change();

      /* Checkbox input */
      this.element.find('.field.checkbox[data-add-ancillary=true] input').on('change', function () {
        var $this = $(this);
        var $ancillaryBlock = $this.closest('[data-ancillary-related]');

        /* Remove active class */
        $ancillaryBlock.removeClass('ancillary_active');

        /* Find checkboxes and set active class if one of them is checked */
        $ancillaryBlock.find('.field.checkbox[data-add-ancillary=true] input').each(function () {
          var $this = $(this);

          if ($this.is(':checked')) {
            $ancillaryBlock.addClass('ancillary_active');
          }
        });

        self.composeAncillariesObject();
      }).change();

      /* Radio input */
      this.element.find('.field.radio[data-add-ancillary=true] input').on('change', function () {
        var $this = $(this);
        var $ancillaryBlock = $this.closest('[data-ancillary-related]');

        /* Remove active class */
        $ancillaryBlock.removeClass('ancillary_active');

        /* Find checkboxes and set active class if one of them is checked */
        $ancillaryBlock.find('.field.radio[data-add-ancillary=true] input').each(function () {
          var $this = $(this);

          if ($this.is(':checked')) {
            $ancillaryBlock.addClass('ancillary_active');
          }
        });

        self.composeAncillariesObject();
      }).change();
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
      initPassengersSummary: function () {
      /*Evento que escucha las cabeceras de pasajeros*/
      this.element.find('.checkout_block.passengers .block_header').on('click', function (event) {
        event.preventDefault();
        var $this = $(this);

        /*Comprobamos si ya esta visible la capa*/
        if ($this.hasClass('expanded')) {
          $this.closest('.passengers').find('.block_body').slideUp(400);
          $this.removeClass('expanded');
        } else {
          $this.closest('.passengers').find('.block_body').slideDown(400);
          $this.addClass('expanded');
        }
      });
    },
    composeAncillariesObject: function () {
      var postObject = {};
      var self = this;

      this.element.find('.ancillary_active[data-ancillary-related]').each(function () {
        /* Get field variables */
        var $ancillaryBlock = $(this);

        /* Get related (main object), and type (name of the ancillary) */
        var related = $ancillaryBlock.attr('data-ancillary-related');
        var type = $ancillaryBlock.attr('data-ancillary-type');
        // var passengerIndex;
        var passengerIndex = $ancillaryBlock.attr('data-index-passenger');
        var passengerId = $ancillaryBlock.attr('data-passenger');
        var baggageObject = {};

        /* Compose ancillary object */
        var ancillaryObject = {
          ancillaryType: type
        };

        /* Get subfields */
        var subFields = {};

        $ancillaryBlock.find('.field [data-property]').each(function () {
          var $this = $(this);
          var property = $this.attr('data-property');
          var value = $this.val();
          var $fieldsetBody = $this.closest('.fieldset_body[data-property]');
          var fieldObject = {};
          var valid = false;

          /* Figure out if the input is valid to add the property */
          if ($this.attr('type') == 'checkbox' && $this.is(':checked')) {
            valid = true;
          }

          if ($this.attr('type') == 'radio' && $this.is(':checked')) {
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
              /* Check if baggage... */
              if (ancillaryObject.ancillaryType == 'BAGGAGE') {
                var segmentType = $this.attr('data-segment-type');
                var nameAttr = $this.attr('name');
                var passengerIndex = $this.attr('data-passenger-id');

                /* Init baggage object for that passenger */
                baggageObject[passengerIndex] = {};

                /* Find element of other segment */
                var otherSegment = (segmentType == 'ONEWAY') ? 'RETURNWAY' : 'ONEWAY';
                var $otherSegmentElement = self.element.find('.field [data-property][data-segment-type="'+otherSegment+'"][name="'+nameAttr+'"]');
                var otherSegmentElementValue = ($otherSegmentElement.length > 0) ? parseInt($($otherSegmentElement.get(0)).val()) : 0;

                /* Check if ancillary info has been calculated before */
                // if (segçmentType == 'RETURNWAY' && otherSegmentElementValue > 0) {
                  // return;
                // }

                var purchaseSegmentTypeBaggages = [];
                purchaseSegmentTypeBaggages.push({ amount: value, segmentType: segmentType });

                /* Add other segment baggage info (if exist) */
                $otherSegmentElement.each(function(index, element) {
                  purchaseSegmentTypeBaggages.push({ amount: $(element).val(), segmentType: $(element).attr('data-segment-type') });
                });

                baggageObject[passengerIndex] = purchaseSegmentTypeBaggages;

              } else {
                subFields[property] = value;
              }
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

            postObjectPassengerIndex = postObject[related].length - 1;
          }

          if (ancillaryObject.ancillaryType == 'BAGGAGE') {
            ancillaryObject['purchaseSegmentTypeBaggages'] = baggageObject[passengerIndex];

            $.each(postObject[related][postObjectPassengerIndex]['ancillaryBooking'], function(ancillaryIndex, ancillaryElement) {
              if (ancillaryElement.ancillaryType == 'BAGGAGE') {
                postObject[related][postObjectPassengerIndex]['ancillaryBooking'].splice(ancillaryIndex, 1);
              }
            });
          }

          postObject[related][postObjectPassengerIndex]['ancillaryBooking'].push(ancillaryObject);
        }
      });

      // console.log(postObject);

      /* Cache the postObject to send it with checkout session */
      this.ancillariesServiceObject = postObject;
    },
    getPassengerIndex: function (postObject, passengerId) {
      var foundIndex = undefined;

      $.each(postObject.passengerRelated, function (index, passenger) {
        if (passenger.passengerId == passengerId) {
          foundIndex = index;
          return false;
        }
      });

      return foundIndex;
    },
    /* Call me back */

    showCallMeBack: function () {

      var self = this;

      Bus.publish('services', 'getCheckoutLists', {
        sessionId: self.element.find('.process_step').attr('data-sessionId'),
        success: function (listsData) {

          Bus.publish('ajax', 'getTemplate', {
            data: listsData,
            path: eval('AirEuropaConfig.templates.checkout.callmeback'),
            success: function (template) {

              /* Show call me back lightbox */
              $('#checkout').ui_dialog({
                title: lang('checkout.call_me_back_title'),
                subtitle: lang('checkout.call_me_back_subtitle'),
                xl: true,
                content: template,
                buttons: [
                  {
                    className: 'return',
                    href: '#',
                    label: lang('checkout.call_me_back_cancel')
                  },
                  {
                    className: 'ok',
                    href: '#',
                    label: lang('checkout.call_me_back_contact')
                  }
                ],
                render: function ($dialog) {
                  var $form = $dialog.find('form');

                  /* Buttons behaviour */
                  $dialog.find('.return a').on('click', function (event) {
                    event.preventDefault();
                    Bus.publish('process', 'kill');
                  });

                  $dialog.find('.ok a').on('click', function (event) {
                    event.preventDefault();
                    $form.trigger('submit');
                  });

                  /* Form behaviour */
                  $form.form({
                    onError: function (form) {
                      if ($form.find('.dialog_form_error').length == 0) {
                        $form.find('.dialog_form').prepend('<div class="dialog_form_error"><p>' + lang('checkout.call_me_back_form_error') + '</p></div>');
                      }
                      /* prepare call me back gtm errors */
                      errorsForm = self.getErrorsInForm(form.element);
                      self.traceManager('error_form', self.addFormData(form.element), null, null, errorsForm, 'callmeback');
                    },
                    onSubmit: function (form) {
                      /* Remove error */
                      $form.find('.dialog_form_error').remove();

                      /* Show spinner */
                      $dialog.find('.dialog_content').append('<span class="dialog_spinner"><span class="spinner"></span><strong class="spinner_text">' + lang('inner.loading') + '</strong></span>');
                      $dialog.find('.dialog_content').addClass('spinner');

                      /* Call to the call me back service */
                      Bus.publish('services', 'postCallMeBack', {
                        contactInfo: form.element.serializeObject(),
                        sessionId: self.element.find('.process_step').attr('data-sessionId'),
                        success: function (data) {

                          if (!data.header.error) {
                            /* Change dialog content */
                            $dialog.find('.dialog_content').append('<div class="dialog_success"></div>');
                            $dialog.find('.dialog_content .dialog_success').append('<div class="dialog_subtitle"><p>' + lang('checkout.call_me_back_success') + '</p></div>')
                            $dialog.find('.dialog_content .dialog_success').append('<div class="dialog_buttons"><p><a href="' + urlCms('home') + '"><span>' + lang('general.go_to_home') + '</span></a></p></div>');

                            /* Go to home event */
                            $dialog.find('.dialog_success a').on('click', function (event) {
                              event.preventDefault();
                              Bus.publish('process', 'kill');
                            });

                            /* Remove spinner */
                            $dialog.find('.dialog_content .dialog_spinner').remove();
                            $dialog.find('.dialog_content').addClass('success').removeClass('spinner');

                          }
                          else {
                            /* quit the previous dialog */
                            self.element.find('.dialog').remove();
                            /* Show an error */
                            $('#checkout').ui_dialog({
                              title: lang('general.error_title'),
                              error: true,
                              content: "",
                              subtitle: data.header.message,
                              buttons: [
                                {
                                  className: 'close',
                                  href: '#',
                                  label: lang('general.ok')
                                }
                              ],
                              render: function ($dialog) {
                                /* Buttons behaviour */
                                $dialog.find('.close a').on('click', function (event) {
                                  event.preventDefault();
                                  Bus.publish('process', 'kill');
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

        }
      });
    },
    /* Prices control */

    listenInsurance: function () {
      var $insuranceRadio = this.element.find('.extra_options.insurance input[type=radio]');
      var $insuranceLabel = this.element.find('.extra_options.insurance .field.radio label');

      $insuranceLabel.on('click', function (event) {
        var $this = $(this);
        var $radio = $this.closest('.field.radio').find('input[type=radio]');

        if ($radio.is(':checked')) {
          event.preventDefault();
          $radio.prop('checked', false).change();
        }
      });

    },
    initControlPrices: function () {
      var self = this;

      /* Each .extra_options fieldset */
      this.element.find('.extra_options').each(function () {
        var $fieldset = $(this);
        var $select = $fieldset.find('.select_field[data-add-ancillary=true] select');
        var $counter = $fieldset.find('.counter_field[data-add-ancillary=true] input')
        var $checkbox = $fieldset.find('.checkbox[data-add-ancillary=true] input[type=checkbox]');
        var $radio = $fieldset.find('.radio[data-add-ancillary=true] input[type=radio]');
        var $checkboxTrigger = $fieldset.find('.check_group[data-add-ancillary=true] .checkbox input[type=checkbox]');
        var $seatField = $fieldset.find('.seat_field[data-add-price=true] input.price_selected');

        //console.log("SEAT FIELDS: " + $seatField.length);

        /* Seat field behaviour */
        $seatField.on('change', function (event) {
          // console.log("Salta el change");

          /* Reset extra counters */
          $fieldset.find('.extra_inputs input').val('0');

          /* Add counter to each field */
          $fieldset.find('[data-add-price=true]').each(function () {
            var $field = $(this);
            var value = $field.find('input.seat_number_selected').val();
            var price = parseFloat($field.find('input.price_selected').val());

            if (value != '' && price != '') {
              /* Update the input controller value */
              var currentValue = parseFloat($fieldset.find('.extra_inputs input').val());
              var newValue = Math.round((currentValue + price) * 100) / 100;
              $fieldset.find('.extra_inputs input').val(newValue);
            }
          });

          // console.log("El valor actualizado: " + $fieldset.find('.extra_inputs input').val())

          /* Send to the prices block the new blocks: label + price */
          $fieldset.find('.extra_inputs input').each(function () {
            var $input = $(this);
            var price = parseFloat($input.val());
            var className = $input.attr('class');
            var label = $input.attr('data-price-label');

            // console.log("El className: " + className);
            // console.log("El label: " + label);
            // console.log("El precio: " + price+' - '+$input.val());

            if (price > 0) {
              /* Add price */
              self.addPrice(className, label, price);
            }
            else {
              /* Clean this price */
              self.cleanPrice(className);
            }
          });

        });

        /* Select behaviour */
        $select.on('change', function (event) {
          var $thisSelect = $(this);
          var allPassengersPrice = 0;
          var className = $thisSelect.attr('class');
          var label = $thisSelect.attr('data-price-label');

          /* Reset extra counters */
          $fieldset.find('.extra_inputs input').val('0');

          /* Add counter to each field */
          $fieldset.find('.select_field[data-add-ancillary=true]').each(function () {
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
              $field.closest('.counter_select_group').find('.total_counter strong').text(totalPrice);

              /* Update total price for input submit */
              allPassengersPrice += totalPrice;
            }
          });

          if (allPassengersPrice > 0) {
            self.addPrice(className, label, allPassengersPrice);
          }
          else {
            /* Clean this price */
            self.cleanPrice(className);
          }
        });

        /* Counter behaviour */
        $counter.on('change', function (event) {
          var $input = $(this);
          var allPassengersPrice = 0;
          var className = $input.attr('data-class');
          var label = $input.attr('data-price-label');

          /* Reset extra counters */
          $fieldset.find('.extra_inputs input').val('0');

          /* Add counter to each field */
          $fieldset.find('.counter_field[data-add-ancillary=true]').each(function () {
            var $field = $(this);
            var number;
            var totalPrice = 0;
            var segmentType = $field.attr('data-segment-type');
            var passengerType = $field.attr('data-passenger-type');
            var frequentFlyerLevel = $field.attr('data-frequentflyer-level');

            /* Figure out the number with the counter or an attribute */
            if ($field.closest('.counter_select_group_body').find('.input_counter').length > 0) {
              number = parseInt($field.closest('.counter_select_group_body').find('.input_counter').val());
            }
//            else if ($field.attr('data-number') != undefined) {
//              number = parseInt($field.attr('data-number'));
//            }
            else {
              number = 0;
            }

            for (i = 1; i <= number; i++) {
              /* Update the input controller value */
              var $input = $fieldset.find('.extra_inputs input.' + segmentType + '_' + passengerType + '_' + i);

              /* Check if passenger is ELITE_PLUS */
              if (typeof frequentFlyerLevel !== "undefined" && frequentFlyerLevel === "ELITE_PLUS") {
                $input = $fieldset.find('.extra_inputs input.' + segmentType + '_ELITE_PLUS_' + i);
              }

              var currentValue = parseInt($input.val());
              var newValue = currentValue + 1;
              $input.val(newValue);

              /* Update the price per row */
              var price = parseFloat($input.attr('data-price'));
              totalPrice += price;
            }

            /* Update passenger price */
            $field.closest('.counter_select_group').find('.total_counter strong').text(totalPrice);

            /* Update total price for input submit */
            allPassengersPrice += totalPrice;
          });

          if (allPassengersPrice > 0) {
            self.addPrice(className, label, allPassengersPrice);
          }
          else {
            /* Clean this price */
            self.cleanPrice(className);
          }
        });

        /* Checkbox behaviour */
        $checkbox.on('change', function (event) {
          var totalPrice = 0;
          var pricesToUpdate = {};

          $fieldset.find('.checkbox[data-add-ancillary=true]').each(function () {
            var $input = $(this).find('input');
            var isChecked = $input.is(':checked');
            var price = (isChecked) ? parseInt($input.attr('data-price')) : 0;
            var className = $input.attr('class');
            var label = $input.attr('data-price-label');

            if (pricesToUpdate[className] != undefined) {
              pricesToUpdate[className].totalPrice += price;
            }
            else {
              pricesToUpdate[className] = {
                totalPrice: price,
                label: label,
                className: className
              };
            }
          });

          $.each(pricesToUpdate, function (index, priceToUpdate) {
            if (priceToUpdate.totalPrice > 0) {
              self.addPrice(priceToUpdate.className, priceToUpdate.label, priceToUpdate.totalPrice);
            }
            else {
              self.cleanPrice(priceToUpdate.className);
            }
          });

        });

        /* Checkbox trigger behaviour */
        $checkboxTrigger.on('change', function (event) {
          var $input = $(this);
          var isChecked = $input.is(':checked');
          var $checkGroup = $input.closest('.check_group');
          var $selects = $checkGroup.find('.select_field[data-add-price=true] select');

          if (isChecked) {
            $selects.each(function () {
              var $this = $(this);
              $this.find('option').prop('selected', false);
              $this.find('option').eq(1).prop('selected', true);
              $this.trigger('change');
            });
          }
          else {
            $selects.each(function () {
              var $this = $(this);
              $this.find('option').prop('selected', false);
              $this.find('option').eq(0).prop('selected', true);
              $this.trigger('change');
            });
          }
        });

        /* Checkbox behaviour */
        $radio.on('change', function (event) {
          var totalPrice = 0;
          var pricesToUpdate = {};

          $fieldset.find('.radio[data-add-ancillary=true]').each(function () {
            var $input = $(this).find('input');
            var isChecked = $input.is(':checked');
            var price = (isChecked) ? parseInt($input.attr('data-price')) : 0;
            var className = $input.attr('class');
            var label = $input.attr('data-price-label');

            if (pricesToUpdate[className] != undefined) {
              pricesToUpdate[className].totalPrice += price;
            }
            else {
              pricesToUpdate[className] = {
                totalPrice: price,
                label: label,
                className: className
              };
            }
          });

          $.each(pricesToUpdate, function (index, priceToUpdate) {
            if (priceToUpdate.totalPrice > 0) {
              self.addPrice(priceToUpdate.className, priceToUpdate.label, priceToUpdate.totalPrice);
            }
            else {
              self.cleanPrice(priceToUpdate.className);
            }
          });

        });

      });
    },
    addPrice: function (className, label, price) {

      if (price == 0) {
        this.cleanPrice(className);
      }
      else
      {
        /* Check if there's a price line for the same concept */
        if (this.element.find('.price_block ul li.' + className).length > 0) {
          /* Update the new li to the price list */
          this.element.find('.price_block ul li.' + className).empty();
          this.element.find('.price_block ul li.' + className).attr('data-value', price).addClass('updated').append('<span>' + label + '</span> <strong>' + formatCurrency(price) + '</strong>');
        }
        else {
          /* Append the new li to the price list */
          switch (className) {
            case 'promotion_discount':
              this.element.find('.price_block ul li.adults').after('<li class="added ' + className + '" data-value="' + price + '"><span>' + label + '</span> <strong>' + formatCurrency(price) + '</strong></li>');
              break;
            /* Miles fee must be go after another discount */
            case 'MILES_FEE':
              this.element.find('.price_block ul').append('<li class="added ' + className + '" data-value="' + price + '"><span>' + label + '</span> <strong>' + formatCurrency(price) + '</strong></li>');
              /* TODO: show myMiles blocks */
              break;
            case 'resident':
              if (this.element.find('.price_block ul li.discount').length < 1) {
                this.element.find('.price_block ul li.tax').before('<li class="added ' + className + '" data-value="' + price + '"><span>' + label + '</span> <strong>' + formatCurrency(price) + '</strong></li>');
              } else {
                this.element.find('.price_block ul li.large_family').before('<li class="added ' + className + '" data-value="' + price + '"><span>' + label + '</span> <strong>' + formatCurrency(price) + '</strong></li>');
              }
              break;
            case 'large_family':
              this.element.find('.price_block ul li.tax').before('<li class="added ' + className + '" data-value="' + price + '"><span>' + label + '</span> <strong>' + formatCurrency(price) + '</strong></li>');
              break;
            default:
              /* Card payment must be go after tax line */
              if (className.indexOf('CARD_TYPE_PAYMENT')!=-1) {
                this.element.find('.price_block ul li.tax').after('<li class="added ' + className + '" data-value="' + price + '"><span>' + label + '</span> <strong>' + formatCurrency(price) + '</strong></li>');
              } else {
                if (this.element.find('.price_block ul li.discount').length < 1) {
                  this.element.find('.price_block ul').append('<li class="added ' + className + '" data-value="' + price + '"><span>' + label + '</span> <strong>' + formatCurrency(price) + '</strong></li>');
                } else {
                  this.element.find('.price_block ul li.discount').before('<li class="added ' + className + '" data-value="' + price + '"><span>' + label + '</span> <strong>' + formatCurrency(price) + '</strong></li>');
                }
              }
          }
        }
      }

      /* Update prices */
      this.updateTotalPrice();
    },

    cleanPrice: function (className) {
      if (this.element.find('.price_block ul li.' + className).length > 0) {
        this.element.find('.price_block ul li.' + className).remove();
      }

      /* Update prices */
      this.updateTotalPrice();
    },
    updateTotalPrice: function () {
      var totalPrice = 0;

      /* Sum prices to update the total */
      this.element.find('.price_block ul li').each(function () {
        var $this = $(this);

        totalPrice += Math.round(parseFloat($this.attr('data-value') || 0) * 100) / 100;
      });

      totalPrice = Math.round(totalPrice * 100) / 100;

      this.element.find('.price_block .total .price_total span').html(formatCurrency(totalPrice));
      this.fixPrice();
    },
    initHotelEvents: function () {
      var self = this;
      var step = this.checkoutData['step'];

      //TODO comprobar bloque HOTEL

      /* If last step */
      if (step == 'confirm') {

        var $hotelBlock = self.element.find('.hotel');
        var $hotelStep1 = $hotelBlock.find('.step1');
        var $hotelStep2 = $hotelBlock.find('.step2');
        var nights = 0;
        var $hotelForm = $hotelBlock.find('form');

        /* First checkbox */
        $('#field_night').click(function () {
          var $this = $(this);
          if ($this.prop('checked')) {
            nights = 1;
            $hotelBlock.find('fieldset.submit').fadeIn();
            $hotelBlock.find('.more-nights').removeClass('hidden');
          } else {
            $hotelBlock.find('fieldset.submit').fadeOut();
            $hotelBlock.find('.more-nights').addClass('hidden');
          }
        });

        /* Second checkbox */
        $('#field_night_more').click(function () {
          var $this = $(this);
          if ($this.prop('checked')) {
            nights = 2;
          }
        });

        $hotelForm.form({
          onError: function (form) {
            self.showFormError(form.element);
          },
          onSubmit: function (form) {
            /* Put button loading state */
            $hotelForm.find('.submit').find('button').addClass('loading');

            /* Insert hotel nights in USA promotion */
            Bus.publish('services', 'setHotelNights', {
              bookingId: self.checkoutData.booking.bookingId,
              nightsHotels: nights,
              success: function (data) {
                var message = data.header.message;
                $hotelForm.find('.submit').find('button').removeClass('loading');

                if (!data.header.error) {
                  $hotelStep1.slideUp('slow', function () {
                    $hotelStep2.fadeIn('slow');
                  });
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
              }
            });
          }
        });

      }
    },

    showLogin: function () {
      var self = this;

      this.element.find('.login .action').on('click', 'a', function (event) {
        event.preventDefault();


        Bus.publish('ajax', 'getTemplate', {
          path: eval('AirEuropaConfig.templates.checkout.login_loyalty'),
          success: function (template) {
            /* Show login lightbox */
            $('#checkout').ui_dialog({
              title: lang('account.login_title'),
              xxxl: true,
              content: template,
              close: {
                behaviour: 'close',
                href: '#'
              },
              buttons: [
                {
                  className: 'submit_login',
                  href: '#',
                  label: lang('account.login_button')
                }
              ],
              render: function ($dialog) {

                self.setTabindex();

                var $form = $dialog.find('form');

                Bus.publish('external_login', 'checkout_login', $form.closest('.dialog'));

                self.setTablistener();
              }
            });
          }
        });

        updateGtm({
          'pageArea': 'SUMA-checkout',
          'pageCategory': 'acceder',
          'pageContent': 'formulario'
        });

        setTimeout(function() {
            $('.dialog_content .login_form input[type=text]').each(function(index, element) {
              var inputValue = $(element).val();

              if ((typeof inputValue !== 'undefined') && (inputValue != '')) {
              $(element).blur();
            }
          });
        }, 300);

        setTimeout(function(){
         $('#field_login_cko_email').placeholderIE();
         $('#field_login_cko_password').placeholderIE();
        },300);



      });

    },

    /*listenPassword: function (fieldPassword, fieldPassword2) {
      var self = this;
      var $password = this.element.find(fieldPassword);
      var $password2 = this.element.find(fieldPassword2);

      $password2.on('blur', function(event) {

        if ($password2.closest('.field').hasClass('valid') && ($password2.val() != $password.val())){
          self.showPasswordError($password2.attr('data-service-name'), this.element);
        }

        if (! $password.closest('.field').hasClass('valid'))
        {
          $password2.closest('.field').addClass('non_editable');
          $password2.val('');
          $password2.closest('.field').removeClass('valid');
        }

      });

      $password.on('blur', function(event) {

        if ($password.closest('.field').hasClass('valid') && ($password2.val() != $password.val())){
          self.showPasswordError($password2.attr('data-service-name'), this.element);
          $password2.closest('.field').removeClass('non_editable');
        }

        if (($password.val() == '') && !($password2.closest('.field').hasClass('non_editable'))
          || (! $password.closest('.field').hasClass('valid')))
        {
          $password2.closest('.field').removeClass('valid');
          $password2.closest('.field').addClass('non_editable');
          $password2.val('');
        }

      });

    },*/

    /* When user change the password, check the confirm password */
    listenPassword: function(fieldPassword, fieldPassword2) {
      var self = this;
      var $password = this.element.find(fieldPassword);
      var $password2 = this.element.find(fieldPassword2);

      var $passwordInput = $password.find('input');
      var $passwordInput2 = $password2.find('input');

      $passwordInput2.on('blur', function(event) {

        if ($password2.closest('.field').hasClass('valid') && ($passwordInput2.val() != $passwordInput.val())){
          self.showPasswordError($password2.attr('data-service-name'), this.element);
        }

        if (! $password.closest('.field').hasClass('valid'))
        {
          $password2.closest('.field').addClass('non_editable');
          $passwordInput2.attr('readonly', true);
          $passwordInput2.val('');
          $password2.closest('.field').removeClass('valid');
        }

      });

      $passwordInput.on('blur', function(event) {

        if ($password.closest('.field').hasClass('valid') && ($passwordInput2.val() != $passwordInput.val())){

          self.showPasswordError($password2.attr('data-service-name'),this.element);
          $password2.closest('.field').removeClass('non_editable');
          $passwordInput2.attr('readonly', false);
        }

        if (($passwordInput.val() == '') && !($password2.closest('.field').hasClass('non_editable'))
          || (! $password.closest('.field').hasClass('valid')))
        {
          $password2.closest('.field').removeClass('valid');
          $password2.closest('.field').addClass('non_editable');
          $passwordInput2.attr('readonly', true);
          $passwordInput2.val('');
        }

      });
    },


    showPasswordError: function (fieldName, $element) {
      var $errorField = $element.find('[data-service-name = ' + fieldName + ']').closest('.field');

      /* Show error and set message */
      $errorField.trigger('show_error', lang('account.error_match_password2'));
      $errorField.addClass('error').removeClass('valid initial_status');

      /* Send the event to put the field invalid, so the user can't do the submit */
      $errorField.trigger('set_valid', [false]);
    },

    getErrorsInForm: function ($form) {
      var result = [];
      /* search for error in the form with not disabled class */
      $.each($form.find('.field.error').not('.disabled'), function () {
        /* search for data-service-name inputs and selects */
        var inputError = $(this).find('input').attr('data-gtm-name');
        var selectError = $(this).find('select').attr('data-gtm-name');

        /* check specials forms */
        if ((inputError == 'promotionCode') || (inputError == 'myaePassword')) {
          result.push(inputError)
          return false;
        }

        if (inputError) {
          result.push(inputError)
        }
        if (selectError) {
          result.push(selectError)
        }
      });

      /* filter MyAe array */
      if (result.length >= 2) {
        if ((result[0] == 'myaeUser') && (result[1] == 'myaePassword')) {
          result = result.slice(0, 2);
        } else if ((result[0] == 'myaeUser') || (result[0] == 'myaePassword')) {
          result = result.slice(0, 1);
        }
      }

      return result;
    },

    setTotalMilesContent: function(){
      var self = this;
      var step = this.element.find('.process_step').attr('data-step');
      /* hide miles_block if the step is not confirm */
      if (step == "payment"){
        if ( self.element.find('.miles_block').length == 0 ){
          var total_miles_html = "<div class='miles_block'><ul><li class='total_miles'><span>" + lang('checkout_payment.total_miles_title') + "<strong class='miles_total'></strong></span></li></ul></div>";
          self.element.find('.prices_block .body').append(total_miles_html);
        }
      }else{
        self.element.find('.miles_block').hide();
      }
    },

    fixPrice: function() {
      $('.price_total span').css('font-size', '1em');
      while( $('.price_total span').width() > $('.price_total').width() ) {
          $('.price_total span').css('font-size', (parseInt($('.price_total span').css('font-size')) - 1) + "px" );
      }
    },

    showNotificationsTwitterCheckout: function(){

      var divLoginTwitter = this.element.find('.twitter_sharing');
        
      //Data in JSImport to know if Twitter Social Login was already executed
      // If so, we do not show Social Login option and show notifications.
      // Same behaviour, if customer is already following AirEuropa Twitter account. 
      if(executed){

        var imageTwitter = this.element.find('div.content_foto_name img');
        var imageUrl = "https://twitter.com/" + customerScreenName + "/profile_image?size=mini";
        imageTwitter.attr('src', imageUrl);

        var nameTwitter = this.element.find('div.content_foto_name .name');
        nameTwitter.html(customerName);

        var aliasTwitter = this.element.find('div.content_foto_name .alias');
        aliasTwitter.html('@' + customerScreenName);


          //Data in JSImport
          if (following){
              //Mostrar paso 3 
              divLoginTwitter.removeClass('step_one step_two');
              divLoginTwitter.addClass('step_three');         
          } else {
            //mostrar paso 2
              divLoginTwitter.removeClass('step_one');
              divLoginTwitter.addClass('step_two');

           
          }

                
      } else {
        var content_info = this.element.find('div.sharing_text .content_info');
        content_info.addClass('no_foto');
                    
        var buttom = this.element.find('.sharing_button_checkout');
      }
    },


    listenTwitterButton: function(unbind){
        //paso 1 - login

        var buttonClicked = this.element.find('div.sharing_button_checkout.one button');


        if (typeof unbind !== 'undefined' && unbind === true) {
            buttonClicked.unbind('click');
        }

        buttonClicked.on('click', function (event) {
          event.preventDefault();
          Bus.publish('services', 'loginTwitterOAuthCheckout', {
                data: window.location.href,
                success: function (data) {
                    window.location.href = data.authURL;

                }
          });

        });
      },

    listenFollowUsTwitterButtom: function(unbind){
      //Paso 2 - seguir a aireuropa
      var divLoginTwitter = this.element.find('.twitter_sharing');
      var buttonClicked = this.element.find('div.sharing_button_checkout.two button');
      var noFoto = this.element.find('div.content_info');
      noFoto.removeClass('no_foto');
      var self = this;
      if (typeof unbind !== 'undefined' && unbind === true) {
          buttonClicked.unbind('click');
      }

      buttonClicked.on('click', function (event) {
        event.preventDefault();

            Bus.publish('services', 'followUsTwitterCheckout', {
                  success: function (data) {   

                    if (data === true){
                        //Mostrar paso 3
                        divLoginTwitter.removeClass('step_one step_two');
                        divLoginTwitter.addClass('step_three'); 
                        var noFoto = this.element.find('div.content_info');
                        noFoto.removeClass('no_foto'); 
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
                        var content_info = self.element.find('div.sharing_text .content_info');
                        content_info.addClass('no_foto');

                        var buttom = this.element.find('.sharing_button_checkout');

                      }               
                  }             
            });
          
        });
    },

    listenNotificationsTwitterButton: function(unbind){
      //Paso 3 - Recibir infomacion vuelo
      var divLoginTwitter = this.element.find('.twitter_sharing');
      var buttonClicked = this.element.find('div.sharing_button_checkout.three button');

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
      var numFlightsOneWay = 0;
      var numFlightsReturn = 0;

      //Calculate nummber of journeys, one way and return to register for twitter notifications
      if (self.checkoutData.booking.journey.oneWayFlights){

        numFlightsOneWay = self.checkoutData.booking.journey.oneWayFlights.length;
      }

      if (self.checkoutData.booking.journey.returnFlights){

        numFlightsReturn = self.checkoutData.booking.journey.returnFlights.length;
      }
      

      //Number of calls done and calls returned ok.
      var numOks = 0;
      var numCalls = 0;

      //Flights one way
      for (var i = 0;  i < numFlightsOneWay; i++){

        //Object with one way flight data needed to call twitter notifications service.
        var flightObjectOneWay = {};

        flightObjectOneWay['flightCode'] = self.checkoutData.booking.journey.oneWayFlights[i].number;
        flightObjectOneWay['departureDate'] = self.checkoutData.booking.journey.oneWayFlights[i].dateDeparture;
        flightObjectOneWay['arrivalDate'] = self.checkoutData.booking.journey.oneWayFlights[i].dateArrival;
        flightObjectOneWay['departureAirport'] = self.checkoutData.booking.journey.oneWayFlights[i].airportDeparture.code;
        flightObjectOneWay['arrivalAirport'] = self.checkoutData.booking.journey.oneWayFlights[i].airportArrival.code;

        Bus.publish('services', 'notificationsTwitterCheckout', {
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

        flightObjectReturn['flightCode'] = self.checkoutData.booking.journey.returnFlights[j].number;
        flightObjectReturn['departureDate'] = self.checkoutData.booking.journey.returnFlights[j].dateDeparture;
        flightObjectReturn['arrivalDate'] = self.checkoutData.booking.journey.returnFlights[j].dateArrival;
        flightObjectReturn['departureAirport'] = self.checkoutData.booking.journey.returnFlights[j].airportDeparture.code;
        flightObjectReturn['arrivalAirport'] = self.checkoutData.booking.journey.returnFlights[j].airportArrival.code;

        Bus.publish('services', 'notificationsTwitterCheckout', {
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

              var buttonClicked = self.element.find('div.sharing_button_checkout');

              buttonClicked.hide();
            
            }else {

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

      creditCardHolderDocumentCheck: function() {
      	var step = this.element.find('.process_step').attr('data-step');
      	var documentField = this.element.find('input#field_credit_card_document_number');
      	var documentFieldDiv = documentField.closest(".field");
      	var passengers = this.checkoutData.calculatePassengers;
      	var message = lang('checkout.payment_document_child_error');
      	if(step == "payment") {
      		documentField.on('blur', function() {
      			var document = $(this).val();
      			for(var i = 0; i < passengers.length;i++) {
      				if(document.toUpperCase() == passengers[i].identificationDocument.identity.toUpperCase() && (passengers[i].passengerType == "CHILD" || passengers[i].passengerType == "INFANT")) {
      					/* Update error hints */
      					documentFieldDiv.trigger('show_error', [message]);

      	                /* Set classes to show the error */
      					documentFieldDiv.addClass('error').removeClass('valid initial_status');
      				}
      			}
      		});
      	}
      },


    creditCardHolderDocumentCheckPaypal: function() {
      var step = this.element.find('.process_step').attr('data-step');
      var documentField = this.element.find('input#field_paypal_promo_document_number');
      var documentFieldDiv = documentField.closest(".field");
      var passengers = this.checkoutData.calculatePassengers;
      var message = lang('checkout.payment_document_child_error');
      if(step == "payment") {
        documentField.on('blur', function() {
          var document = $(this).val();
          for(var i = 0; i < passengers.length;i++) {
            if(document.toUpperCase() == passengers[i].identificationDocument.identity.toUpperCase() && (passengers[i].passengerType == "CHILD" || passengers[i].passengerType == "INFANT")) {
              /* Update error hints */
              documentFieldDiv.trigger('show_error', [message]);

                      /* Set classes to show the error */
              documentFieldDiv.addClass('error').removeClass('valid initial_status');
            }
          }
        });
      }
    },

    creditCardHolderDocumentCheckPaypalNoPromo: function() {
      var step = this.element.find('.process_step').attr('data-step');
      var documentField = this.element.find('input#field_paypal_document_number');
      var documentFieldDiv = documentField.closest(".field");
      var passengers = this.checkoutData.calculatePassengers;
      var message = lang('checkout.payment_document_child_error');
      if(step == "payment") {
        documentField.on('blur', function() {
          var document = $(this).val();
          for(var i = 0; i < passengers.length;i++) {
            if(document.toUpperCase() == passengers[i].identificationDocument.identity.toUpperCase() && (passengers[i].passengerType == "CHILD" || passengers[i].passengerType == "INFANT")) {
              /* Update error hints */
              documentFieldDiv.trigger('show_error', [message]);

                      /* Set classes to show the error */
              documentFieldDiv.addClass('error').removeClass('valid initial_status');
            }
          }
        });
      }
    },

    creditCardHolderDocumentCheckTarjetAe: function() {
      var step = this.element.find('.process_step').attr('data-step');
      var documentField = this.element.find('input#field_ae_card_document_number');
      var documentFieldDiv = documentField.closest(".field");
      var passengers = this.checkoutData.calculatePassengers;
      var message = lang('checkout.payment_document_child_error');
      if(step == "payment") {
        documentField.on('blur', function() {
          var document = $(this).val();
          for(var i = 0; i < passengers.length;i++) {
            if(document.toUpperCase() == passengers[i].identificationDocument.identity.toUpperCase() && (passengers[i].passengerType == "CHILD" || passengers[i].passengerType == "INFANT")) {
              /* Update error hints */
              documentFieldDiv.trigger('show_error', [message]);

                      /* Set classes to show the error */
              documentFieldDiv.addClass('error').removeClass('valid initial_status');
            }
          }
        });
      }
    },

    creditCardHolderDocumentCheckDiscount: function() {
      var step = this.element.find('.process_step').attr('data-step');
      var documentField = this.element.find('input#field_promotion_card_document_number');
      var documentFieldDiv = documentField.closest(".field");
      var passengers = this.checkoutData.calculatePassengers;
      var message = lang('checkout.payment_document_child_error');
      if(step == "payment") {
        documentField.on('blur', function() {
          var document = $(this).val();
          for(var i = 0; i < passengers.length;i++) {
            if(document.toUpperCase() == passengers[i].identificationDocument.identity.toUpperCase() && (passengers[i].passengerType == "CHILD" || passengers[i].passengerType == "INFANT")) {
              /* Update error hints */
              documentFieldDiv.trigger('show_error', [message]);

                      /* Set classes to show the error */
              documentFieldDiv.addClass('error').removeClass('valid initial_status');
            }
          }
        });
      }
    },

    creditCardHolderDocumentCheckMyae: function() {
      var step = this.element.find('.process_step').attr('data-step');
      var documentField = this.element.find('input#field_myae_card_document_number');
      var documentFieldDiv = documentField.closest(".field");
      var passengers = this.checkoutData.calculatePassengers;
      var message = lang('checkout.payment_document_child_error');
      if(step == "payment") {
        documentField.on('blur', function() {
          var document = $(this).val();
          for(var i = 0; i < passengers.length;i++) {
            if(document.toUpperCase() == passengers[i].identificationDocument.identity.toUpperCase() && (passengers[i].passengerType == "CHILD" || passengers[i].passengerType == "INFANT")) {
              /* Update error hints */
              documentFieldDiv.trigger('show_error', [message]);

                      /* Set classes to show the error */
              documentFieldDiv.addClass('error').removeClass('valid initial_status');
            }
          }
        });
      }
    },







    creditCardHolderDocumentCheckMiles: function() {
    	var step = this.element.find('.process_step').attr('data-step');
    	var documentField = this.element.find('input#field_mymiles_card_document_number');
    	var documentFieldDiv = documentField.closest(".field");
    	var passengers = this.checkoutData.calculatePassengers;
    	var message = lang('checkout.payment_document_child_error');
    	if(step == "payment") {
    		documentField.on('blur', function() {
    			var document = $(this).val();
    			for(var i = 0; i < passengers.length;i++) {
    				if(document.toUpperCase() == passengers[i].identificationDocument.identity.toUpperCase() && (passengers[i].passengerType == "CHILD" || passengers[i].passengerType == "INFANT")) {
    					/* Update error hints */
    					documentFieldDiv.trigger('show_error', [message]);

    	                /* Set classes to show the error */
    					documentFieldDiv.addClass('error').removeClass('valid initial_status');
    				}
    			}
    		});
    	}
    },

    /*
     * Set visual effects of confirm page.
     */
    setVisualEffects: function() {
      var self = this;

      this.element.on('click.results', '.passenger .more_details', function(event){
        event.preventDefault();

        var $this = $(this);

        var isOpened = ($this.children().hasClass('open')) ? true : false;

        var $infoBlock = $('.more_info_block');

        if (isOpened) {
          /* Collapse info */
          $infoBlock.slideUp(300);
          $this.children().removeClass('open');
        } else {
          /* Open info */
          $infoBlock.slideDown(300);
          $this.children().addClass('open');
        };
      });

      this.element.on('click.results', '.register .register_header', function(event){
        event.preventDefault();

        var $this = $(this);

        var isOpened = ($this.hasClass('open')) ? true : false;

        var $registerBody = $('.register_body');
        var $registerBodyBtn = $('.register_header .register_btn');

        if (isOpened) {
          /* Collapse info */
          $registerBody.slideUp(300);
          $registerBodyBtn.show();
          $this.removeClass('open');
        } else {
          /* Open info */
          $registerBody.slideDown(300);
          $registerBodyBtn.hide();
          $this.addClass('open');

          if (market.toUpperCase() === "US") {
                  updateGtm({
                    'ow': (self.checkoutCache.booking.dateArrival) ? 'N' : 'S',
                    'business': self.checkoutCache.booking.cabinClass,
                    'origen': self.checkoutCache.booking.airportDeparture.code,
                    'destino': self.checkoutCache.booking.airportArrival.code,
                    'fechaida': self.checkoutCache.booking.dateDeparture,
                    'fecharegreso': self.checkoutCache.booking.dateArrival,
                    'residente': (self.checkoutCache.resident) ? 'S' : 'N',
                    'numpax': self.checkoutCache.finalPassengers.length,
                    'asientoida': asientoIda ? 'S' : 'N',
                    'asientovuelta': asientoVuelta ? 'S' : 'N',
                    'equipajeida': equipageIda ? 'S' : 'N',
                    'equipajevuelta': equipageVuelta ? 'S' : 'N',
                    'formapago': self.checkoutCache.payment.payment_method_type,
                    'opcioncambio': (self.checkoutCache.extras && self.checkoutCache.extras.journeyRelated && self.checkoutCache.extras.journeyRelated.change && self.checkoutCache.extras.journeyRelated.change == '1') ? 'S' : 'N',
                    'seguro': (self.checkoutCache.extras && self.checkoutCache.extras.journeyRelated && self.checkoutCache.extras.journeyRelated.insurance) ? self.checkoutCache.extras.journeyRelated.insurance : '',
                    'expediente': self.checkoutCache.finalPaymentInfo.purchaseReference,
                    'valorventa': self.checkoutCache.totalInEuros.amount,
                    'valordivisa': self.checkoutCache.prices.totalAmount,
                    'amadeus': self.checkoutCache.booking.locator,
                    'divisa': window.appConfig.currentCurrency.code || 'EUR',
                    'mercado': window.market,
                    'pageArea': 'Comprar vuelos',
                    'pageCategory': 'Checkout',
                    'pageContent': 'Confirmación de compra ' + window.getResultsViewName(self.checkoutCache.resultView)+'_formularioSUMA',
                    'canjeo-millas' : checkoutCache.payment.mymiles == 1 ? 'SI' : 'NO',
                    'millas-canjeadas' : checkoutCache.payment.mymiles_percentage_points || '0'
                  });
                } else {
                  updateGtm({
                    'ow': (typeof self.checkoutCache.resultsParams.dateArrival != 'undefined') ? 'N' : 'S',
                    'origen': self.checkoutCache.resultsParams.airportDeparture,
                    'destino': self.checkoutCache.resultsParams.airportArrival,
                    'fechaida': self.checkoutCache.resultsParams.dateDeparture,
                    'fecharegreso': (typeof self.checkoutCache.resultsParams.dateArrival != 'undefined') ? self.checkoutCache.resultsParams.dateArrival : '',
                    'residente': (self.checkoutCache.resultsParams.paxAdultResident > 0) ? 'S' : 'N',
                    'numpax': parseInt(self.checkoutCache.resultsParams.paxAdult) + parseInt(self.checkoutCache.resultsParams.paxChild) + parseInt(self.checkoutCache.resultsParams.paxInfant) + parseInt(self.checkoutCache.resultsParams.paxAdultResident) + parseInt(self.checkoutCache.resultsParams.paxChildResident) + parseInt(self.checkoutCache.resultsParams.paxInfantResident),
                    'asientoida': asientoIda ? 'S' : 'N',
                    'asientovuelta': asientoVuelta ? 'S' : 'N',
                    'equipajeida': equipageIda ? 'S' : 'N',
                    'equipajevuelta': equipageVuelta ? 'S' : 'N',
                    'opcioncambio': (self.checkoutCache.extras && self.checkoutCache.extras.journeyRelated && self.checkoutCache.extras.journeyRelated.change && self.checkoutCache.extras.journeyRelated.change == '1') ? 'S' : 'N',
                    'seguro': (self.checkoutCache.extras && self.checkoutCache.extras.journeyRelated && self.checkoutCache.extras.journeyRelated.insurance) ? self.checkoutCache.extras.journeyRelated.insurance : '',
                    'formapago': self.checkoutCache.payment.payment_method_type,
                    'expediente': self.checkoutCache.finalPaymentInfo.purchaseReference,
                    'valorventa': self.checkoutCache.totalInEuros.amount,
                    'valordivisa': self.checkoutCache.prices.totalAmount,
                    'amadeus': self.checkoutCache.booking.locator,
                    'divisa': window.appConfig.currentCurrency.code || 'EUR',
                    'mercado': window.market,
                    'pageArea': 'Comprar vuelos',
                    'pageCategory': 'Checkout',
                    'pageContent': 'Confirmación de compra por horas_formularioSUMA',
                    'canjeo-millas' : checkoutCache.payment.mymiles == 1 ? 'SI' : 'NO',
                    'millas-canjeadas' : checkoutCache.payment.mymiles_percentage_points || '0'
                  });
                }
        };
      });

    }
};

});
