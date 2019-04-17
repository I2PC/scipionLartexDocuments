Hydra.module.register('LoyaltyInfoController', function (Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#content.loyalty_info',
    element: undefined,
    defaultHashProcess: 'loyalty_info',
    moduleHashes: ['loyalty_companion', 'loyalty_info', 'loyalty_payment_methods', 'loyalty_preferences', 'loyalty_unsubscribe'],
    currentHash: undefined,
    events: {
      'process': {
        'kill': function () {
          var newHash;
          if (this.element.length > 0) {

            newHash = '#/' + getProcessUrl(this.defaultHashProcess);

            if (this.currentHash) {
              newHash = this.currentHash;
            }

            window.location.hash = newHash;
          }
        }
      },
      'loyalty': {
        'show_loyalty_info': function (oNotify) {
          this.showLoyaltyInfo();
        },
        'show_loyalty_companion': function (oNotify) {
          this.showLoyaltyCompanion();
        },
        'show_loyalty_preferences': function (oNotify) {
          this.showLoyaltyPreferences();
        },
        'show_loyalty_payment_methods': function (oNotify) {
          this.showLoyaltyPaymentMethods();
        },
        'show_loyalty_unsubscribe': function (oNotify) {
          this.showLoyaltyUnsubscribe();
        },
        'loyalty_info_data_list': function (oNotifiy) {
          this.loyaltyInfoDataList(oNotifiy.callback);
        }
      }
    },
    init: function () {
      /* Save jquery object reference */
      this.element = $(this.selector);

      if (this.element.length > 0) {
        /* Launch default hash for this module */
        this.launchDefaultHash();

        /* Load default content on background if needed */
        this.loadDefaultContent();

        // Updating GTM
        updateGtm({
          'pageArea' : 'SUMA-logeado',
          'pageCategory' : 'mis-datos'
        });
      }
    },
    /* Complete empty fields */
    completeUser: function (response) {
      var res = response.body.data.user;

      if (res.identificationDocument.expeditionCountry === null) {
        res.identificationDocument.expeditionCountry = {
          code: ''
        };
      }
      if (res.userGrant.residentGrant.residentTown === null) {
        res.userGrant.residentGrant.residentTown = {
          code: ''
        };
      }
      if (res.contactInformation.emergencyContact === null) {
        res.contactInformation.emergencyContact = {
          name: '',
          telephone: ''
        };
      }
      if (res.contactInformation.telephone === null) {
        res.contactInformation.telephone = {
          number: '',
          prefix: '',
          type: ''
        };
      }
      if (res.contactInformation.address.country === null) {
        res.contactInformation.address.country = {
          code: ''
        };
      }

      return res;
    },
    /* Return data list info */
    loyaltyInfoDataList: function (callback) {
      callback(this.dataLists);
    },
    /* Returns user data received from service */
    parseUser: function (response) {
      var res = this.completeUser(response);
      
      var user = {
        name: res.personCompleteName.name,
        identity: res.identity,
        surname: res.personCompleteName.firstSurname,
        surname2: res.personCompleteName.secondSurname,
        title: res.title,
        born: res.born,
        country_code: res.citizenship.code,
        document_type_code: res.identificationDocument.documentType.code,
        document_identity: res.identificationDocument.identity,
        document_country_code: res.identificationDocument.expeditionCountry,
        expiration: res.identificationDocument.expiration,
        telephone: res.contactInformation.telephone.number,
        telephone_prefix: res.contactInformation.telephone.prefix,
        telephone_type: res.contactInformation.telephone.type,
        resident: res.userGrant.residentGrant.resident,
        resident_town_code: (res.userGrant.residentGrant.residentTown !== null) ? res.userGrant.residentGrant.residentTown.code : null,
        large_family: res.userGrant.largeFamilyGrant.largeFamily,
        large_family_region_code: (res.userGrant.largeFamilyGrant.largeFamilyCommunity !== null) ? res.userGrant.largeFamilyGrant.largeFamilyCommunity.code : null,
        large_family_type: res.userGrant.largeFamilyGrant.largeFamilyTypeSubvention,
        large_family_number: res.userGrant.largeFamilyGrant.largeFamilyIdentity,
        emergency_contact_name: res.contactInformation.emergencyContact.name,
        emergency_contact_phone: res.contactInformation.emergencyContact.telephone,
        address_type: res.contactInformation.address.typeRoad,
        street: res.contactInformation.address.street,
        street_number: res.contactInformation.address.streetNumber,
        additional_address: res.contactInformation.address.additionalAddress,
        city: res.contactInformation.address.city,
        state: res.contactInformation.address.state,
        zip_code: res.contactInformation.address.zipCode,
        address_country_code: res.contactInformation.address.country.code
      };

      if (typeof res.frequentFlyerInformation !== 'undefined') {
        user.frequent_flyer = res.frequentFlyerInformation.frequentFlyer;
        user.frequent_flyer_type = res.frequentFlyerInformation.frequentFlyerLevel.frequentFlyerLevel;
        user.frequent_flyer_number = res.frequentFlyerInformation.frequentFlyerIdentity;
      }


      return user;
    },
    launchDefaultHash: function () {
      /* Get the default hash for this module */
      var defaultHash = getProcessUrl(this.defaultHashProcess);

      if (window.location.hash === '') {
        window.location.hash = '#/' + defaultHash;
      }
    },
    loadDefaultContent: function () {
      /* Loop over module hashes to figure out if the hash belongs to this module. If not, probably will be a process
       so we have to load on the background the default content */
      if (!this.checkHash(window.location.hash)) {
        this.showLoyaltyInfo();
      }
    },
    checkHash: function (hash) {
      var hashFound = false;

      _.each(this.moduleHashes, function (hashProcess) {
        var thisHash = getProcessUrl(hashProcess);

        if (hash.indexOf('#/' + thisHash) == 0) {
          hashFound = true;
        }
      });

      return hashFound;
    },
    startPromiseLoading: function () {
      var self = this;
      this.loadingPromise = $.Deferred();

      /* Show loading */
      self.element.addClass('loading');

      /* Start loading animation, it's in a setTimeout to fix the animation */
      setTimeout(function () {
        self.element.addClass('start_loading');
      }, 1);

      /* Reset scroll */
      $(window).scrollTop(0);

      /* Resolve the promise after animation */
      // setTimeout(function () {
        self.loadingPromise.resolve();
      // }, 2500);
    },
    resolvePromiseLoading: function () {
      var self = this;

      /* Fade out loading screen */
      this.element.addClass('loading_finished');

      /* After 500ms, reste all loading classes to get it ready for the next click */
      setTimeout(function () {
        self.element.removeClass('loading start_loading loading_finished');
      }, 500);
    },
    /* Control routes for each hash */
    showLoyaltyCompanion: function () {

      var self = this;
      var module = 'loyalty_info';
      var page = 'companion';
      var templatePath = AirEuropaConfig.templates[module][page];
      var data = {};

      /* Save current hash */
      if (this.checkHash(window.location.hash)) {
        this.currentHash = window.location.hash;
      }
      else {
        this.currentHash = '';
      }

      /* Security check: the functionality has to execute just for this selector + the user must be logged in */
      if (this.element.length > 0 && this.element.find('.content_wrapper').attr('data-page') !== page) { /* @todo: Security check */

        /* Start loading */
        this.startPromiseLoading();

        if (!(($('body').hasClass('siebel_needed') && $('body').hasClass('siebel_is_down')))) {
          /* Get several data from services */
          Bus.publish('services', 'getLoyaltyInfoLists', {
            success: function (response) {
              var data = response;
              self.dataLists = response;
              /* Call to companion service */
              Bus.publish('services', 'getFrequentPassengers', {
                userId: localStorage.ly_userId,
                success: function (response) {
                  data.companion = (typeof response !== 'undefined' && response.body) ? response.body.data : [];
                  self.changeContent(templatePath, data, module, page);
                },
                failure: function () {
                  /** @todo */
                }
              });
            }
          });
        }
      }

      //Update Gtm
      updateGtm({
        'pageArea': 'SUMA-logeado',
        'pageCategory': 'mis-datos',
        'pageContent': 'acompañantes'
      });

    },
    showLoyaltyInfo: function () {
      var self = this;
      var module = 'loyalty_info';
      var page = 'my_info';
      var templatePath = AirEuropaConfig.templates[module][page];

      /* Save current hash */
      if (this.checkHash(window.location.hash)) {
        this.currentHash = window.location.hash;
      }
      else {
        this.currentHash = '';
      }

      /* Security check: the functionality has to execute just for this selector + the user must be logged in */
      if (this.element.length > 0 && this.element.find('.content_wrapper').attr('data-page') !== page) { /* @todo: Security check */

        /* Start loading */
        this.startPromiseLoading();

        if (!(($('body').hasClass('siebel_needed') && $('body').hasClass('siebel_is_down')))) {

          Bus.publish('services', 'getLoyaltyInfoLists', {
            success: function (listsData) {
              self.dataLists = listsData;
              Bus.publish('services', 'getUser', {
                success: function (response) {
                  var data = {
                    communities: listsData['communities'],
                    countries: listsData['countries'],
                    documentation: listsData['document_type'],
                    typeFF: listsData['frequent_flyer'],
                    categoriesLargeFamily: listsData['large_family'],
                    towns: listsData['towns'],                                           
                    market: window.market,
                    user: self.parseUser(response)
                  };                  

                  self.changeContent(templatePath, data, module, page);
                }
              });

            }
          });

        }

      }

    },
    /* Payment Methods */
    showLoyaltyPaymentMethods: function () {
      var self = this;
      var module = 'loyalty_info';
      var page = 'payment_methods';
      var templatePath = AirEuropaConfig.templates[module][page];
      var data = {};

      /* Save current hash */
      if (this.checkHash(window.location.hash)) {
        this.currentHash = window.location.hash;
      }
      else {
        this.currentHash = '';
      }

      /* Update Google Tag Manager */
      updateGtm({
        'pageArea': 'SUMA-logeado',
        'pageCategory': 'mis-datos',
        'pageContent': 'metodos-pago'
      });      

      /* Security check: the functionality has to execute just for this selector + the user must be logged in */
      if (this.element.length > 0 && this.element.find('.content_wrapper').attr('data-page') !== page) { /* @todo: Security check */

        /* Start loading */
        this.startPromiseLoading();

        if (!(($('body').hasClass('siebel_needed') && $('body').hasClass('siebel_is_down')))) {
          Bus.publish('services', 'getPaymentList', {
            userId: localStorage.ly_userId,
            success: function (response) {
              $.each(response.user_payment_methods, function (indexUserPaymentMethod, userMethod) {
                userMethod.payment_methods = response.payment_methods
              });

              var data = {
                user_payment_methods: response.user_payment_methods,
                payment_methods: response.payment_methods,
              };
              self.dataLists = {
                payment_methods: response.payment_methods
              };

              /* Call to the change content function */
              self.changeContent(templatePath, data, module, page);
            }
          });
        }
      }
    },
    showLoyaltyPreferences: function () {
      var self = this;
      var module = 'loyalty_info';
      var page = 'preferences';
      var templatePath = AirEuropaConfig.templates[module][page];
      var data = {
        fakeBookings: true
      };

      /* Save current hash */
      if (this.checkHash(window.location.hash)) {
        this.currentHash = window.location.hash;
      }
      else {
        this.currentHash = '';
      }

      //Update Gtm
      updateGtm({
        'pageArea': 'SUMA-logeado',
        'pageCategory': 'mis-datos',
        'pageContent': 'preferencias'
      });

      /* Security check: the functionality has to execute just for this selector + the user must be logged in */
      if (this.element.length > 0 && this.element.find('.content_wrapper').attr('data-page') !== page) { /* @todo: Security check */

        /* Start loading */
        this.startPromiseLoading();

        if (!(($('body').hasClass('siebel_needed') && $('body').hasClass('siebel_is_down')))) {
          /* Call to loyalty preferences service */
          Bus.publish('services', 'getPreferences', {
            userId: localStorage.ly_userId,
            success: function (response) {
              var preference = response.body.data.preference;
              var appPreference = preference.appPreference;
              var timelinePreference = appPreference.timelinePreference;
              var data = {
                preferences: {
                  alert: appPreference.alert,
                  allowAnalytics: appPreference.allowAnalytics,
                  cepsaPtv: preference.cepsa,
                  communicationTypes: {
                    app: (preference.communicationTypes.indexOf('APP') >= 0),
                    mail: (preference.communicationTypes.indexOf('MAIL') >= 0),
                    phone: (preference.communicationTypes.indexOf('PHONE') >= 0),
                    mobile: (preference.communicationTypes.indexOf('MOBILE') >= 0),
                    appSocial: (preference.communicationTypes.indexOf('APP_SOCIAL') >= 0),
                    web: (preference.communicationTypes.indexOf('WEB') >= 0)
                  },
                  loyaltySubscriptionType: preference.loyaltySubscriptionType,
                  contactAccess: appPreference.contactAccess,
                  geolocation: appPreference.geolocation,
                  historySearch: appPreference.historySearch,
                  informationType: preference.loyaltySubscriptionType,
                  language: preference.language,
                  preferenceAirport: preference.preferenceAirport,
                  timeLineBaggageBelt: timelinePreference.timeLineBaggageBelt,
                  timeLineBookings: timelinePreference.timeLineBookings,
                  timeLineCloseCki: timelinePreference.timeLineCloseCki,
                  timeLineHelp: timelinePreference.timeLineHelp,
                  timeLineLoyaltyMiles: timelinePreference.timeLineLoyaltyMiles,
                  timeLineLoyaltyWelcome: timelinePreference.timeLineLoyaltyWelcome,
                  timeLineOpenCki: timelinePreference.timeLineOpenCki,
                  timeLineParkingRemainder: timelinePreference.timeLineParkingRemainder,
                  timeLineStartBoarding: timelinePreference.timeLineStartBoarding,
                  timeLineWelcome: timelinePreference.timeLineWelcome
                }
              };

              // Get languages
              Bus.publish('services', 'getLanguages', {
                success: function (languageList) {
                  
                  data.languages = languageList;                         

                  // Get preference airports
                  Bus.publish('services', 'getUserPreferenceAirport', {
                    success: function (preferenceAirports) {
                      data.preferenceAirports = self.orderAirportsByZone(preferenceAirports);

                      self.changeContent(templatePath, data, module, page);

                    }
                  });

                }
              });

            }
          });
        }

      }
    },
    showLoyaltyUnsubscribe: function () {
      var self = this;
      var module = 'loyalty_info';
      var page = 'unsubscribe';
      var templatePath = AirEuropaConfig.templates[module][page];
      var data = {};

      /* Save current hash */
      if (this.checkHash(window.location.hash)) {
        this.currentHash = window.location.hash;
      }
      else {
        this.currentHash = '';
      }

      /* Update Google Tag Manager */
      updateGtm({
        'pageArea': 'SUMA-logeado',
        'pageCategory': 'mis-datos',
        'pageContent': 'baja'
      });

      /* Security check: the functionality has to execute just for this selector + the user must be logged in */
      if (this.element.length > 0 && this.element.find('.content_wrapper').attr('data-page') !== page) { /* @todo: Security check */

        /* Start loading */
        this.startPromiseLoading();

        if (!(($('body').hasClass('siebel_needed') && $('body').hasClass('siebel_is_down')))) {
          /* @todo: Call to my bookings service */

          /* Call to the change content function */
          self.changeContent(templatePath, data, module, page);
        }
      }
    },
    /* Main change content engine */

    changeContent: function (templatePath, data, module, page) {
      var self = this;

      /* Get the structure template */
      Bus.publish('ajax', 'getTemplate', {
        path: templatePath,
        success: function (template) {

          /* Render the template */
          var renderedHtml = template(data);
          var $html = $(renderedHtml);

          /* Get the template partials */
          var $header = $html.find('.loyalty_header, .info_header');
          var $navBar = $html.find('.nav_bar');
          var $innerContent = $html.find('.inner_content');

          /* Get the current content */
          var $currentContent = self.element.find('.inner_content .inner_block_page');

          /* Clean the current content */
          self.element.find('.content_wrapper').empty();

          /* Append the structure */
          self.element.find('.content_wrapper').append($header);
          self.element.find('.content_wrapper').append($navBar);

          /* Check if the template has any .inner_block_page content, if it has content, use it, if not
           use the default html content if any */
          if ($innerContent.find('.inner_block_page_wrapper .inner_block_page').length == 0) {
            $innerContent.find('.inner_block_page_wrapper').append($currentContent);
          }

          /* Delete current content */
          self.element.find('.inner_content').remove();

          /* Append new inner content */
          self.element.find('.content_wrapper').append($innerContent);

          /* Save the data attribute */
          self.element.find('.content_wrapper').attr('data-page', page);

          /* Restart */
          Bus.publish('inner', 'custom_init');

          /* Init loyalty view process */
          Bus.publish(module, 'custom_init');

          /* Call to loyalty loaded event */
          Bus.publish('loyalty', 'loaded');

          /* Close navigation */
          var $header = self.element.closest('#wrapper').find('#header');
          $header.find('#subnav').removeClass('active').attr('style', '');
          $header.find('.panel.active').removeClass('active').attr('style', '');
          $header.find('#topbar .nav .main_nav li.active').removeClass('active');

          /* Hide loading screen */
          $.when(self.loadingPromise)
          .done(function () {
            self.resolvePromiseLoading();
          });
        }
      });

    },
    
    orderAirportsByZone: function (airports) {
      var results = new Array();
      var airportsPerZone = {};
      var orderedAirportsPerZone = {};

      /* Order the airports per zone */
      $.each(airports, function (index, airport) {
        if (airport.zone) { /* If the airport is classified by zone */
          if (airportsPerZone[airport.zone] == undefined) {
            airportsPerZone[airport.zone] = [];
          }

          airportsPerZone[airport.zone].push({
            description: airport.description,
            code: airport.code,
            resident: airport.resident,
            zone: airport.zone
          });
        }
        else { /* If it doesn't have, save it in a generic category */
          if (airportsPerZone['generic'] == undefined) {
            airportsPerZone['generic'] = [];
          }

          airportsPerZone['generic'].push({
            description: airport.description,
            code: airport.code,
            resident: airport.resident,
            zone: airport.zone
          });

        }
      });

      /* Order the zones like in the config */
      if (AirEuropaConfig.zonesAvailable != undefined) {
        $.each(AirEuropaConfig.zonesAvailable, function (index, zone) {

          /* If the zone has some results, save it on the new array */
          if (airportsPerZone[zone]) {
            orderedAirportsPerZone[zone] = airportsPerZone[zone];
          }
        });
      }

      /* Append at the end the generic category if it's needed */
      if (airportsPerZone['generic']) {
        orderedAirportsPerZone['generic'] = airportsPerZone['generic'];
      }

      /* Create the array to loop through Handlebars */
      $.each(orderedAirportsPerZone, function (index, zone) {

        results.push({
          code: index,
          name: (index != 'generic') ? lang('zones.' + index) : undefined,
          airports: zone
        });
      });

      return results;
    }

  };
});