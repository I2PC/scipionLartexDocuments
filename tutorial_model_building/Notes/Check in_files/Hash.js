Hydra.module.register('Hash', function(Bus, Module, ErrorHandler, Api) {
  return {

    events: {
      'hash': {
        'change': function(oNotify) {
          window.location.hash = '#/' + oNotify.hash;
        }
      }
    },

    init: function() {
      /* Init routes */
      this.initRoutes();

      /* Listen to the defined routes */
      Path.listen();
    },

    /* Routes */
    initRoutes: function() {
      var self = this;

      /* Basic Processes */
      var searchProcessURL = getProcessUrl('search');
      var flightsProcessURL = getProcessUrl('flights');
      var checkoutProcessURL = getProcessUrl('checkout');
      var checkinProcessURL = getProcessUrl('checkin');
      var ancillariesLuggageProcessURL = getProcessUrl('ancillaries_luggage');
      var ancillariesSeatsProcessURL = getProcessUrl('ancillaries_seats');
      var ancillariesPremiumSeatsProcessURL = getProcessUrl('ancillaries_premium');
      var infonProcessURL = getProcessUrl('info');

      /* Login and register */
      var loginURL = getProcessUrl('login');
      var registerURL = getProcessUrl('register');
      var confirmLoyaltyURL = getProcessUrl('confirm_user');
      var restorePasswordURL = getProcessUrl('restore-password');
      var registerDistnaceURL = getProcessUrl('register_distnace');
      var restoreLoyaltyUser = getProcessUrl('restore_loyalty_user');
      var sumaURL = getProcessUrl('suma');
      var registerSiebelURL = getProcessUrl('register_siebel');

      /* Loyalty bookings */
      var loyaltyBookingsURL = getProcessUrl('loyalty_bookings');
      var loyaltyBookingsAddURL = getProcessUrl('loyalty_bookings_add');

      /* Loyalty my info */
      var loyaltyInfoURL = getProcessUrl('loyalty_info');
      var loyaltyCompanionURL = getProcessUrl('loyalty_companion');
      var loyaltyPreferencesURL = getProcessUrl('loyalty_preferences');
      var loyaltyPaymentMethodsURL = getProcessUrl('loyalty_payment_methods');
      var loyaltyUnsubscribeURL = getProcessUrl('loyalty_unsubscribe');
      var account_unsuscribeURL = getProcessUrl('account_unsuscribe');

      /* Loyalty my card */
      var loyaltyCardURL = getProcessUrl('loyalty_card');
      var loyaltyCardPassbookURL = getProcessUrl('loyalty_card_passbook');
      var loyaltyCardDuplicateURL = getProcessUrl('loyalty_card_duplicate');
      var loyaltyCardPrintURL = getProcessUrl('loyalty_card_print');

      /* Loyalty my miles */
      var loyaltyMyMilesURL = getProcessUrl('loyalty_my_miles');
      var loyaltyDetailURL = getProcessUrl('loyalty_detail');
      var loyaltyActivityURL = getProcessUrl('loyalty_activity');
      var loyaltySpendURL = getProcessUrl('loyalty_spend');
      var loyaltyTransferURL = getProcessUrl('loyalty_transfer');
      var loyaltyClaimURL = getProcessUrl('loyalty_claim');

      /* Partners */
      var partnersURL = getProcessUrl('partners');
      var partnersAmazonURL = getProcessUrl('amazon');
      var partnersCepsaURL = getProcessUrl('cepsa');
      var partnersEuropcarURL = getProcessUrl('europcar');
      var partnersHalconURL = getProcessUrl('halconviajes');
      var partnersEcuadorURL = getProcessUrl('ecuador');
      var partnersBeLiveURL = getProcessUrl('belive');
      var partnersNhURL = getProcessUrl('nhhoteles');
      var partnersAirEuropaURL = getProcessUrl('aireuropa');
      var partnersSkyteamURL = getProcessUrl('skyteam');

      /*PMR*/
      var pmrProcessURL = getProcessUrl('pmr_form');

      
      /*H72*/
      var h72ProcessURL = getProcessUrl('h72_payment');


      /* No process, kill them all */
      Path.map('').to(function() {
        var itsProcessing = ($('body').hasClass('processing'));

        if (itsProcessing) {
          Bus.publish('process', 'kill');
        }
      });

      /* Search process */
      Path.map('#/' + searchProcessURL + '(/:from)(/:to)').to(function() {
        var from = this.params['from'] || undefined;
        var to = this.params['to'] || undefined;

        if (from) from = from.toUpperCase();
        if (to) to = to.toUpperCase();

        Bus.publish('process', 'show_search', {from: from, to: to});
      });

      /* Results process */
      Path.map('#/flights/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/flights/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/view/:view').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/flights/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/view/:view/channel/:channel').to(function() {
        self.triggerSearch(this.params);
      });
      Path.map('#/flights/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/view/:view/channel/:channel/mkt/:mkt/lang/:lang').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/flights/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/flights/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel/mkt/:mkt/lang/:lang').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/flights/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel/view/:view').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/flights/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel/mkt/:mkt/lang/:lang/view/:view').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/recharge').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/view/:view').to(function() {
        this.params['channel'] = '';
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/view/:view/recharge').to(function() {
        this.params['channel'] = '';
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/view/:view/channel/:channel').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/view/:view/channel/:channel/recharge').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/view/:view/channel/:channel/mkt/:mkt/lang/:lang').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/view/:view/channel/:channel/mkt/:mkt/lang/:lang/recharge').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel/recharge').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel/mkt/:mkt/lang/:lang').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel/mkt/:mkt/lang/:lang/recharge').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel/view/:view').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel/view/:view/recharge').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel/mkt/:mkt/lang/:lang/view/:view').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel/mkt/:mkt/lang/:lang/view/:view/recharge').to(function() {
        self.triggerSearch(this.params);
      });

      /*url social_rate*/
      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/colective/:colective').to(function() {
        this.params['channel'] = '';
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/colective/:colective/recharge').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/view/:view/colective/:colective').to(function() {
        this.params['channel'] = '';
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/view/:view/colective/:colective/recharge').to(function() {
        this.params['channel'] = '';
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/view/:view/channel/:channel/colective/:colective').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/view/:view/channel/:channel/colective/:colective/recharge').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/view/:view/channel/:channel/mkt/:mkt/lang/:lang/colective/:colective').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/view/:view/channel/:channel/mkt/:mkt/lang/:lang/colective/:colective/recharge').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel/colective/:colective').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel/colective/:colective/recharge').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel/mkt/:mkt/lang/:lang/colective/:colective').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel/mkt/:mkt/lang/:lang/colective/:colective/recharge').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel/view/:view/colective/:colective').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel/view/:view/colective/:colective/recharge').to(function() {
        self.triggerSearch(this.params);
      });

      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel/mkt/:mkt/lang/:lang/view/:view/colective/:colective').to(function() {
        self.triggerSearch(this.params);
      });


      Path.map('#/' + flightsProcessURL + '/from/:from/to/:to/ow/:ow/adults/:adults/rt/:rt/kids/:kids/babies/:babies/resident/:resident/business/:business/channel/:channel/mkt/:mkt/lang/:lang/view/:view/colective/:colective/recharge').to(function() {
        self.triggerSearch(this.params);
      });


      /* Checkout process */
      Path.map('#/' + checkoutProcessURL + '(/:step)').to(function() {
        var step = this.params['step'] || '';

        Bus.publish('process', 'show_checkout', {step: step});
      });

      /* Checkin process */
      Path.map('#/' + checkinProcessURL + '').to(function() {
        Bus.publish('process', 'show_checkin');
      });

      Path.map('#/' + checkinProcessURL + '/:step').to(function() {
        var step = this.params['step'] || '';
        var mode;

        if (step === 'bookings') {
          mode = 'isLogged';
        } else if (step === 'flights') {
          mode = 'notLogged';
        }

        Bus.publish('process', 'show_checkin_step', {mode: mode, step: step});
      });

      Path.map('#/' + checkinProcessURL + '/locator/:locator/surname/:surname').to(function() {
      var locator = this.params['locator'] || '';
        var surname = this.params['surname'] || '';
        Bus.publish('process', 'show_checkin_deeplink',{locator: locator,surname: surname});
      });

      Path.map('#/' + checkinProcessURL + '/locator/:locator/surname/:surname/channel/:channel').to(function() {
      var locator = this.params['locator'] || '';
        var surname = this.params['surname'] || '';
        Bus.publish('process', 'show_checkin_deeplink',{locator: locator,surname: surname});
      });

      /* Ancillaries process */
      Path.map('#/' + ancillariesLuggageProcessURL).to(function() {
        var mode = 'luggage';
        Bus.publish('process', 'show_ancillaries', {mode: mode});
      });

      Path.map('#/' + ancillariesLuggageProcessURL + '/:step').to(function() {
        var mode = 'luggage';
        var step = this.params['step'] || '';

        Bus.publish('process', 'show_ancillaries_step', {mode: mode, step: step});
      });

      Path.map('#/' + ancillariesLuggageProcessURL +'/locator/:locator/surname/:surname').to(function() {
        var mode = 'luggage';
        var locator = this.params['locator'] || '';
        var surname = this.params['surname'] || '';
        Bus.publish('process', 'show_ancillaries_deeplink', {mode: mode,locator: locator,surname: surname});
      });

      Path.map('#/' + ancillariesLuggageProcessURL +'/locator/:locator/surname/:surname/channel/:channel').to(function() {
        var mode = 'luggage';
        var locator = this.params['locator'] || '';
        var surname = this.params['surname'] || '';
        Bus.publish('process', 'show_ancillaries_deeplink', {mode: mode,locator: locator,surname: surname});
      });

      Path.map('#/' + ancillariesSeatsProcessURL).to(function() {
        var mode = 'seats';
        Bus.publish('process', 'show_ancillaries', {mode: mode});
      });

      Path.map('#/' + ancillariesSeatsProcessURL + '/:step').to(function() {
        var mode = 'seats';
        var step = this.params['step'] || '';

        Bus.publish('process', 'show_ancillaries_step', {mode: mode, step: step});
      });

      Path.map('#/' + ancillariesSeatsProcessURL +'/locator/:locator/surname/:surname').to(function() {
        var mode = 'seats';
        var locator = this.params['locator'] || '';
        var surname = this.params['surname'] || '';
        Bus.publish('process', 'show_ancillaries_deeplink', {mode: mode,locator: locator,surname: surname});
      });

      Path.map('#/' + ancillariesSeatsProcessURL +'/locator/:locator/surname/:surname/channel/:channel').to(function() {
        var mode = 'seats';
        var locator = this.params['locator'] || '';
        var surname = this.params['surname'] || '';
        Bus.publish('process', 'show_ancillaries_deeplink', {mode: mode,locator: locator,surname: surname});
      });

      Path.map('#/' + ancillariesPremiumSeatsProcessURL).to(function() {
        var mode = 'premium_seats';
        Bus.publish('process', 'show_ancillaries', {mode: mode});
      });

      Path.map('#/' + ancillariesPremiumSeatsProcessURL + '/:step').to(function() {
        var mode = 'premium_seats';
        var step = this.params['step'] || '';

        Bus.publish('process', 'show_ancillaries_step', {mode: mode, step: step});
      });

      Path.map('#/' + ancillariesPremiumSeatsProcessURL +'/locator/:locator/surname/:surname').to(function() {
        var mode = 'premium_seats';
        var locator = this.params['locator'] || '';
        var surname = this.params['surname'] || '';
        Bus.publish('process', 'show_ancillaries_deeplink', {mode: mode,locator: locator,surname: surname});
      });


      /* Info process */
      Path.map('#/' + infonProcessURL).to(function() {
        Bus.publish('process', 'show_info');
      });

      Path.map('#/' + infonProcessURL + '/from/:from/to/:to').to(function() {
        var from = this.params['from'] || '';
        var to = this.params['to'] || '';

        Bus.publish('process', 'show_info_details', {from: from, to: to});
      });

      Path.map('#/' + infonProcessURL + '/flight/:flight').to(function() {
        var flight = this.params['flight'] || '';

        Bus.publish('process', 'show_info_details', {flight: flight});
      });

      /* Login User */
      Path.map('#/' + loginURL + '').to(function() {
        Bus.publish('process', 'show_login');
      });

      Path.map('#/' + registerURL + '').to(function() {
        Bus.publish('process', 'show_register');
      });

      Path.map('#/' + sumaURL + '').to(function() {
        Bus.publish('process', 'show_suma');
      });

      Path.map('#/' + registerDistnaceURL + '/token/:token').to(function() {
        var token = this.params['token'] || '';
        (token == '')
          ? window.location.href = '/'
          : Bus.publish('account', 'init_register_distnace_form', {token: token});
      });

      Path.map('#/' + restoreLoyaltyUser + '/token/:token').to(function() {
        var token = this.params['token'] || '';
        (token == '')
          ? window.location.href = '/'
          : Bus.publish('account', 'init_restore_loyalty_user_form', {token: token});
      });

      Path.map('#/' + confirmLoyaltyURL + '/token/:token').to(function() {
        var token = this.params['token'] || '';

        (token == '')
          ? window.location.href = '/'
          : Bus.publish('process', 'show_confirmation', {token: token});
      });

      Path.map('#/' + confirmLoyaltyURL + '/email/token/:token').to(function() {
        var token = this.params['token'] || '';

        (token == '')
          ? window.location.href = '/'
          : Bus.publish('process', 'show_confirmation_email', { token: token });
      });

      Path.map('#/' + restorePasswordURL + '').to(function() {
        Bus.publish('process', 'show_restore');
      });

      Path.map('#/' + registerSiebelURL + '/token/:token').to(function() {
          Bus.publish('account', 'init_register_siebel_form', {token: token});
      });

      /* Loyalty bookings */
      Path.map('#/' + loyaltyBookingsURL).to(function() {
        if (self.checkIfUserIsLogged()) {
          Bus.publish('loyalty', 'show_my_bookings');
        }
      });

      Path.map('#/' + loyaltyBookingsAddURL).to(function() {
        if (self.checkIfUserIsLogged()) {
          Bus.publish('loyalty', 'show_add_bookings');
        }
      });

      Path.map('#/' + loyaltyBookingsURL +'/:bookingId').to(function() {
        if (self.checkIfUserIsLogged()) {
          var bookingId = this.params['bookingId'] || '';
          Bus.publish('loyalty', 'show_booking_detail', {bookingId: bookingId});
        }
      });

      Path.map('#/' + loyaltyBookingsURL +'/:bookingId/passengers').to(function() {
        if (self.checkIfUserIsLogged()) {
          var bookingId = this.params['bookingId'] || '';
          Bus.publish('loyalty', 'show_booking_detail_passengers', {bookingId: bookingId});
        }
      });

      Path.map('#/' + loyaltyBookingsURL +'/:bookingId/payment').to(function() {
        if (self.checkIfUserIsLogged()) {
          var bookingId = this.params['bookingId'] || '';
          Bus.publish('loyalty', 'show_booking_detail_payment', {bookingId: bookingId});
        }
      });

      Path.map('#/' + loyaltyBookingsURL +'/:bookingId/itemization').to(function() {
        if (self.checkIfUserIsLogged()) {
          var bookingId = this.params['bookingId'] || '';
          Bus.publish('loyalty', 'show_booking_detail_itemization', {bookingId: bookingId});
        }
      });

      Path.map('#/' + loyaltyBookingsURL +'/:bookingId/card').to(function() {
        if (self.checkIfUserIsLogged()) {
          var bookingId = this.params['bookingId'] || '';
          Bus.publish('loyalty', 'show_booking_card', {bookingId: bookingId});
        }
      });

      Path.map('#/' + loyaltyBookingsURL +'/:bookingId/flight').to(function() {
        if (self.checkIfUserIsLogged()) {
          var bookingId = this.params['bookingId'] || '';
          Bus.publish('loyalty', 'show_booking_flight', {bookingId: bookingId});
        }
      });

      Path.map('#/' + loyaltyBookingsURL + '/:bookingId/documentation').to(function() {
        if (self.checkIfUserIsLogged()) {
          var bookingId = this.params['bookingId'] || '';
          Bus.publish('loyalty', 'show_booking_documentation', {bookingId: bookingId});
        }
      });

      /* Loyalty info */
      Path.map('#/' + loyaltyInfoURL).to(function() {
        if (self.checkIfUserIsLogged()) {
          Bus.publish('loyalty', 'show_loyalty_info');
        }
      });

      Path.map('#/' + loyaltyCompanionURL).to(function() {
        if (self.checkIfUserIsLogged()) {
          Bus.publish('loyalty', 'show_loyalty_companion');
        }
      });

      Path.map('#/' + loyaltyPreferencesURL).to(function() {
        if (self.checkIfUserIsLogged()) {
          Bus.publish('loyalty', 'show_loyalty_preferences');
        }
      });

      Path.map('#/' + loyaltyPaymentMethodsURL).to(function() {
        if (self.checkIfUserIsLogged()) {
          Bus.publish('loyalty', 'show_loyalty_payment_methods');
        }
      });

      Path.map('#/' + loyaltyUnsubscribeURL).to(function() {
        if (self.checkIfUserIsLogged()) {
          Bus.publish('loyalty', 'show_loyalty_unsubscribe');
        }
      });

      Path.map('#/' + account_unsuscribeURL + '/token/:token').to(function() {

        var token = this.params['token'] || '';

        if (token == ''){
          window.location.href = '/'
        }else{
          //if (self.checkIfUserIsLogged()) {
            Bus.publish('account', 'unsuscribe', {token: token});
          //}
        }

      });

      /* Loyalty card */
      Path.map('#/' + loyaltyCardURL).to(function() {
        if (self.checkIfUserIsLogged()) {
          Bus.publish('loyalty', 'show_loyalty_card');
        }
      });

      Path.map('#/' + loyaltyCardPassbookURL).to(function() {
        if (self.checkIfUserIsLogged()) {
          Bus.publish('loyalty', 'show_loyalty_card_passbook');
        }
      });

      Path.map('#/' + loyaltyCardDuplicateURL).to(function() {
        if (self.checkIfUserIsLogged()) {
          Bus.publish('loyalty', 'show_loyalty_card_duplicate');
        }
      });

      Path.map('#/' + loyaltyCardPrintURL).to(function() {
        if (self.checkIfUserIsLogged()) {
          Bus.publish('loyalty', 'show_loyalty_card_print');
        }
      });

      /* Loyalty miles */
      Path.map('#/' + loyaltyMyMilesURL).to(function() {
        if (self.checkIfUserIsLogged()) {
          Bus.publish('loyalty', 'show_loyalty_my_miles');
        }
      });

      Path.map('#/' + loyaltyDetailURL).to(function() {
        if (self.checkIfUserIsLogged()) {
          Bus.publish('loyalty', 'show_loyalty_detail');
        }
      });

      Path.map('#/' + loyaltyActivityURL).to(function() {
        if (self.checkIfUserIsLogged()) {
          Bus.publish('loyalty', 'show_loyalty_activity');
        }
      });

      Path.map('#/' + loyaltySpendURL).to(function() {
        if (self.checkIfUserIsLogged()) {
          Bus.publish('loyalty', 'show_loyalty_spend');
        }
      });

      Path.map('#/' + loyaltyTransferURL).to(function() {
        if (self.checkIfUserIsLogged()) {
          Bus.publish('loyalty', 'show_loyalty_transfer');
        }
      });

      Path.map('#/' + loyaltyClaimURL).to(function() {
        if (self.checkIfUserIsLogged()) {
          Bus.publish('loyalty', 'show_loyalty_claim');
        }
      });

      /* Partners */
      Path.map('#/' + partnersURL).to(function(){
        self.checkIfUserIsLogged();
      });

      Path.map('#/' + partnersAmazonURL).to(function() {
        if(self.checkIfUserIsLogged()) {
          Bus.publish('partnersView', 'showPartner', {
            partner : 'amazon'
          });
        }
      });

      Path.map('#/' + partnersCepsaURL).to(function() {
        if(self.checkIfUserIsLogged()) {
          Bus.publish('partnersView', 'showPartner', {
            partner : 'cepsa'
          });
        }
      });

      Path.map('#/' + partnersEuropcarURL).to(function() {
        if(self.checkIfUserIsLogged()) {
          Bus.publish('partnersView', 'showPartner', {
            partner : 'europcar'
          });
        }
      });

      Path.map('#/' + partnersHalconURL).to(function() {
        if(self.checkIfUserIsLogged()) {
          Bus.publish('partnersView', 'showPartner', {
            partner : 'halconviajes'
          });
        }
      });

      Path.map('#/' + partnersEcuadorURL).to(function() {
        if(self.checkIfUserIsLogged()) {
          Bus.publish('partnersView', 'showPartner', {
            partner : 'ecuador'
          });
        }
      });

      Path.map('#/' + partnersBeLiveURL).to(function() {
          if(self.checkIfUserIsLogged()) {
            Bus.publish('partnersView', 'showPartner', {
              partner : 'belive'
            });
          }
      });

      Path.map('#/' + partnersNhURL).to(function() {
        if(self.checkIfUserIsLogged()) {
          Bus.publish('partnersView', 'showPartner', {
            partner : 'nhhoteles'
          });
        }
      });

      Path.map('#/' + partnersAirEuropaURL).to(function() {
        if(self.checkIfUserIsLogged()) {
          Bus.publish('partnersView', 'showPartner', {
            partner : 'aireuropa'
          });
        }
      });

      Path.map('#/' + partnersSkyteamURL).to(function() {
        if(self.checkIfUserIsLogged()) {
          Bus.publish('partnersView', 'showPartner', {
            partner : 'skyteam'
          });
        }
      });
      
      /*PMR*/
      Path.map('#/' + pmrProcessURL).to(function() {
        Bus.publish('process', 'show_pmrform');
      });

      Path.map('#/' + pmrProcessURL + '/:step').to(function() {
        var step = this.params['step'] || '';


        Bus.publish('process', 'show_pmrform_step', {step: step});
      });

      /*H72*/
      Path.map('#/' + h72ProcessURL).to(function() {
        Bus.publish('process', 'show_h72form');
      });

      Path.map('#/' + h72ProcessURL + '/:step').to(function() {
        var step = this.params['step'] || '';
        Bus.publish('process', 'show_h72form_step', {step: step});
      });

      Path.map('#/' + h72ProcessURL + '/locator/:locator/surname/:surname').to(function() {
        var locator = this.params['locator'] || '';
        var surname = this.params['surname'] || '';
        Bus.publish('process', 'show_h72form_deeplink', {locator: locator, surname: surname });
      });
      
      /*PMR*/

      Path.map('#/' + pmrProcessURL + '/locator/:locator/surname/:surname').to(function() {
        var locator = this.params['locator'] || '';
        var surname = this.params['surname'] || '';
        Bus.publish('process', 'show_pmrform_deeplink',{locator: locator,surname: surname});
      });

      Path.map('#/' + pmrProcessURL + '/bookingId/:bookingId/locator/:locator').to(function() {
        var bookingId = this.params['bookingId'] || '';
        var locator = this.params['locator'] || '';

        Bus.publish('process', 'launchPmrInternal', {
          bookingId: bookingId,
          locator: locator
        });
      });

    },

    /* Triggers */
    triggerSearch: function(urlParams) {
      /* Check if market is US, then render result in old view (not fare family) */
      if (market.toUpperCase() === "US") {
        this.triggerUSASearch(urlParams);
      } else {
        this.triggerGeneralSearch(urlParams);
      }
    },

    triggerGeneralSearch: function(urlParams) {
      var params = {};

      /* Passengers info */
      if (urlParams['resident'] === "true") {
        params.paxAdultResident = urlParams['adults'] || 1;
        params.paxChildResident = urlParams['kids'] || 0;
        params.paxInfantResident = urlParams['babies'] || 0;
        params.paxAdult = 0;
        params.paxChild = 0;
        params.paxInfant = 0;
        params.resident = 'true';
      } else {
        params.paxAdult = urlParams['adults'] || 1;
        params.paxChild = urlParams['kids'] || 0;
        params.paxInfant = urlParams['babies'] || 0;
        params.paxAdultResident = 0;
        params.paxChildResident = 0;
        params.paxInfantResident = 0;
        params.resident = 'false';
      }
      /* Passengers Social Rate*/
        params.colective = urlParams['colective'] || undefined;


      /* Departure and arrival info */
      params.airportDeparture = urlParams['from'] || undefined;
      params.airportArrival = urlParams['to'] || undefined;

      /* Departure and arrival dates */
      params.dateDeparture = (urlParams['ow'] !== "false") ? moment(urlParams['ow'], "MM-DD-YYYY").format("DD/MM/YYYY") : undefined;
      params.dateArrival = (urlParams['rt'] !== "false") ? moment(urlParams['rt'], "MM-DD-YYYY").format("DD/MM/YYYY") : undefined;

      /* Other info */
      params.channel = urlParams['channel'] || undefined;
      params.mkt = urlParams['mkt'] || undefined;
      params.lang = urlParams['lang'] || undefined;
      params.tryType = (urlParams['rt'] !== "false") ? 'RT' : 'OW';
      params.cabineType = '';
      params.currencyCode = currencyCode; /* JSimport global variable */
      params.country = realMarket; /* JSimport global variable */
      params.idClient = (+{} + [])[+!![]] + ([][[]] + [])[!+[] + !![] + !![]] + (+{} + [])[+!![]] + [][(![] + [])[!+[] + !![] + !![]] + ([] + {})[+!![]] + (!![] + [])[+!![]] + (!![] + [])[+[]]][([] + {})[!+[] + !![] + !![] + !![] + !![]] + ([] + {})[+!![]] + ([][[]] + [])[+!![]] + (![] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+[]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (!![] + [])[+[]] + ([] + {})[+!![]] + (!![] + [])[+!![]]]((!![] + [])[+!![]] + ([][[]] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + ([][[]] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+!![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![] + !![] + !![]] + ([][[]] + [])[+[]] + ([][[]] + [])[+!![]] + ([][[]] + [])[!+[] + !![] + !![]] + (![] + [])[!+[] + !![] + !![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (+{} + [])[+!![]] + ([] + [][(![] + [])[!+[] + !![] + !![]] + ([] + {})[+!![]] + (!![] + [])[+!![]] + (!![] + [])[+[]]][([] + {})[!+[] + !![] + !![] + !![] + !![]] + ([] + {})[+!![]] + ([][[]] + [])[+!![]] + (![] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+[]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (!![] + [])[+[]] + ([] + {})[+!![]] + (!![] + [])[+!![]]]((!![] + [])[+!![]] + ([][[]] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + ([][[]] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+!![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![] + !![] + !![]] + (![] + [])[!+[] + !![]] + ([] + {})[+!![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (+{} + [])[+!![]] + (!![] + [])[+[]] + ([][[]] + [])[!+[] + !![] + !![] + !![] + !![]] + ([] + {})[+!![]] + ([][[]] + [])[+!![]])())[!+[] + !![] + !![]] + ([][[]] + [])[!+[] + !![] + !![]])()([][(![] + [])[!+[] + !![] + !![]] + ([] + {})[+!![]] + (!![] + [])[+!![]] + (!![] + [])[+[]]][([] + {})[!+[] + !![] + !![] + !![] + !![]] + ([] + {})[+!![]] + ([][[]] + [])[+!![]] + (![] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+[]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (!![] + [])[+[]] + ([] + {})[+!![]] + (!![] + [])[+!![]]]((!![] + [])[+!![]] + ([][[]] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + ([][[]] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+!![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![] + !![] + !![]] + ([][[]] + [])[!+[] + !![] + !![]] + (![] + [])[!+[] + !![] + !![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (+{} + [])[+!![]] + ([] + [][(![] + [])[!+[] + !![] + !![]] + ([] + {})[+!![]] + (!![] + [])[+!![]] + (!![] + [])[+[]]][([] + {})[!+[] + !![] + !![] + !![] + !![]] + ([] + {})[+!![]] + ([][[]] + [])[+!![]] + (![] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+[]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (!![] + [])[+[]] + ([] + {})[+!![]] + (!![] + [])[+!![]]]((!![] + [])[+!![]] + ([][[]] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + ([][[]] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+!![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![] + !![] + !![]] + (![] + [])[!+[] + !![]] + ([] + {})[+!![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (+{} + [])[+!![]] + (!![] + [])[+[]] + ([][[]] + [])[!+[] + !![] + !![] + !![] + !![]] + ([] + {})[+!![]] + ([][[]] + [])[+!![]])())[!+[] + !![] + !![]] + ([][[]] + [])[!+[] + !![] + !![]])()(([] + {})[+[]])[+[]] + (!+[] + !![] + !![] + !![] + !![] + !![] + !![] + []) + (!+[] + !![] + !![] + !![] + !![] + !![] + !![] + [])) + ([][[]] + [])[!+[] + !![] + !![]] + ([] + {})[!+[] + !![]];

      /* Interislas code */
      // params.interislasCode = (typeof urlParams['interislas'] !== "undefined" && urlParams['interislas'] != 0) ? urlParams['interislas'] : undefined;

      Bus.publish('process', 'show_flights', { params: params });
    },

    triggerUSASearch: function(urlParams) {
      var params = {
        from: urlParams['from'] || undefined,
        to: urlParams['to'] || undefined,
        ow: urlParams['ow'] || undefined,
        rt: urlParams['rt'] || 'false',
        adults: urlParams['adults'] || 1,
        kids: urlParams['kids'] || 0,
        babies: urlParams['babies'] || 0,
        resident: urlParams['resident'] || 'false',
        business: urlParams['business'] || 'false',
        view: AirEuropaConfig.results.defaultResultsView,
        channel: urlParams['channel'] || undefined,
        mkt: urlParams['mkt'] || undefined ,
        lang: urlParams['lang'] || undefined
      };

      Bus.publish('process', 'USA_show_flights', { params: params });
    },

    /* Checks */
    checkIfUserIsLogged: function() {
      if (!User.isLoggedIn()) {
        window.location = '/';
        return false;
      }

      return true;
    }

  };
});
