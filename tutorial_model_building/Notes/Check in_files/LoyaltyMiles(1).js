Hydra.module.register('LoyaltyMilesController', function (Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#content.loyalty_miles',
    element: undefined,
    defaultHashProcess: 'loyalty_my_miles',
    moduleHashes: ['loyalty_my_miles','loyalty_detail','loyalty_activity', 'loyalty_spend', 'loyalty_transfer', 'loyalty_claim' ],
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
        'show_loyalty_my_miles': function(oNotify){
          /* default hash select from top menu */
          this.showLoyaltyActivity();
        },

        'show_loyalty_detail': function (oNotify) {
          this.showLoyaltyDetail();
        },

        'show_loyalty_activity': function (oNotify) {
          this.showActivityList();
        },
        'show_loyalty_spend': function (oNotify) {
          this.showLoyaltySpend();
        },
        'show_loyalty_transfer': function (oNotify) {
          this.showLoyaltyTransfer();
        },
        'show_loyalty_claim': function (oNotify) {
          this.showLoyaltyClaim();
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
          'pageCategory' : 'mis-millas'
        });
      }
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
        this.showLoyaltyActivity();
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

    showLoyaltyDetail: function () {

      if (this.element.find('.inner_content #detail').length === 0) {
        this.showLoyaltyActivity(function (finishLoadingCallback) {
          Bus.publish('loyalty_miles', 'show_loyalty_detail_miles', {callback: finishLoadingCallback});
        });
      }
      else {
        Bus.publish('loyalty_miles', 'show_loyalty_detail_miles');
      }
    },

    showActivityList: function () {

      if (this.element.find('.inner_content #activity').length === 0) {
        this.showLoyaltyActivity(function (finishLoadingCallback) {
          Bus.publish('loyalty_miles', 'show_loyalty_activity_list', {callback: finishLoadingCallback});
        });
      }
      else {
        Bus.publish('loyalty_miles', 'show_loyalty_activity_list');
      }
    },

    showLoyaltyActivity: function (callback) {
      var self = this;
      var module = 'loyalty_miles';
      var page = 'activity';
      var templatePath = AirEuropaConfig.templates[module][page];
      var data = {};

      /* Save current hash */
      if (this.checkHash(window.location.hash)) {
        this.currentHash = window.location.hash;
      } else {
        this.currentHash = '';
      }

      /* Security check: the functionality has to execute just for this selector + the user must be logged in */
      if (this.element.length > 0 && this.element.find('.content_wrapper').attr('data-page') !== page) {

        /* Start loading */
        this.startPromiseLoading();

        if (!(($('body').hasClass('siebel_needed') && $('body').hasClass('siebel_is_down')))) {
          Bus.publish('services', 'getLoyaltyTiers', {
            success: function (response) {
              data.loyaltyTier = [];
              for (var i = 0; i < response.body.data.length; i++) {
                var tier = response.body.data[i];
                data.loyaltyTier.push({
                  name: tier.loyaltyTierType,
                  flights: tier.flights,
                  miles: tier.miles
                });
              }

              Bus.publish('services', 'getLoyaltyMiles', {
                userId: localStorage.ly_userId,
                success: function (response) {
                  var res = response.body.data;
                  var hasMiles = typeof res.miles !== 'undefined';
                  if (hasMiles) {
                    hasMiles = res.miles !== null;
                  }
                  data.user = {
                    numMiles: (hasMiles) ? res.miles.miles : '',
                    numMilesLevel : (hasMiles) ? res.miles.tierMiles : '',
                    endDate: (hasMiles) ? res.miles.rangeLevel.endDate : '',
                    milesLevel: (hasMiles) ? res.miles.milesLevel : '',
                    flightLevel: (hasMiles) ? res.miles.flightLevel : '',
                    frequentFlyerLevel: res.frequentFlyerLevel.frequentFlyerLevel,
                    operation: []
                  };

                  // Bus.publish('services', 'getMilesPartners', { /* @todo */
                  //   success: function (response) {
                  //     data.partner = [];
                  //     for (var i = 0; i < 0; i++) { /* @todo */
                  //       var partner = response.body.data[i];
                  //       data.partner.push({
                  //       });
                  //     }

                  Bus.publish('services', 'getLoyaltyOperations', {
                    userId: localStorage.ly_userId,
                    data: {
                      //numberRecords: AirEuropaConfig.miles.numResults /* Documented but doesn´t work */
                    },
                    success: function (response) {
                      if (response.header.error) {
                        data.errorMessage = response.header.message;
                      }
                      else {
                        if (typeof response.body.data !== 'undefined') {
                          for (var i = 0; i < response.body.data.length; i++) {
                            var operation = response.body.data[i];
                            data.user.operation.push({
                              bookingClass: operation.bookingClass,
                              departure: (typeof operation.departure !== 'undefined') ? operation.departure.code : '',
                              description: operation.description,
                              destination: (typeof operation.arrival !== 'undefined') ? operation.arrival.code : '',
                              flight: operation.flightNumber,
                              miles: operation.miles,
                              levelMiles: operation.levelMiles,
                              partner: operation.partner,
                              transactionDate: operation.operationDate,
                              transactionTypeCode: (typeof operation.loyaltyOperationType !== 'undefined') ? operation.loyaltyOperationType.code : '',
                              transactionType: (typeof operation.loyaltyOperationType !== 'undefined') ? operation.loyaltyOperationType.description : ''
                            });
                          }
                        }
                      }

                      self.changeContent(templatePath, data, module, page, callback);
                    }
                  });
                  // }
                  // });
                }
              });
            }
          });
        }

      }
    },
    showLoyaltySpend: function () {
      var self = this;
      var module = 'loyalty_miles';
      var page = 'spend';
      var data;
      var templatePath = AirEuropaConfig.templates[module][page];

      /* Save current hash */
      if (this.checkHash(window.location.hash)) {
        this.currentHash = window.location.hash;
      } else {
        this.currentHash = '';
      }

      /* Security check: the functionality has to execute just for this selector + the user must be logged in */
      if (this.element.length > 0 && this.element.find('.content_wrapper').attr('data-page') !== page) {

        /* Start loading */
        this.startPromiseLoading();

        if (!(($('body').hasClass('siebel_needed') && $('body').hasClass('siebel_is_down')))) {
          self.changeContent(templatePath, data, module, page);
        }
      }
    },
    showLoyaltyTransfer: function () {
      var self = this;
      var module = 'loyalty_miles';
      var page = 'transfer';
      var data;
      var templatePath = AirEuropaConfig.templates[module][page];

      /* Save current hash */
      if (this.checkHash(window.location.hash)) {
        this.currentHash = window.location.hash;
      } else {
        this.currentHash = '';
      }

      /* Security check: the functionality has to execute just for this selector + the user must be logged in */
      if (this.element.length > 0 && this.element.find('.content_wrapper').attr('data-page') !== page) {

        /* Start loading */
        this.startPromiseLoading();

        if (!(($('body').hasClass('siebel_needed') && $('body').hasClass('siebel_is_down')))) {
          Bus.publish('services', 'getFrequentPassengers', {
            userId: localStorage.ly_userId,
            success: function (response) {
              var data = {
                companion: (typeof response !== 'undefined' && response.body && response.body.data) ? response.body.data : []
              };
              self.changeContent(templatePath, data, module, page);
            }
          });
        }
      }
    },
    showLoyaltyClaim: function () {
      var self = this;
      var module = 'loyalty_miles';
      var page = 'claim';
      var templatePath = AirEuropaConfig.templates[module][page];

      /* Save current hash */
      if (this.checkHash(window.location.hash)) {
        this.currentHash = window.location.hash;
      } else {
        this.currentHash = '';
      }

      /* Security check: the functionality has to execute just for this selector + the user must be logged in */
      if (this.element.length > 0 && this.element.find('.content_wrapper').attr('data-page') !== page) {

        /* Start loading */
        this.startPromiseLoading();

        if (!(($('body').hasClass('siebel_needed') && $('body').hasClass('siebel_is_down')))) {
          Bus.publish('services', 'getLoyaltyMilesLists', {
            success: function (data) {
              self.changeContent(templatePath, data, module, page);
            }
          });
        }
      }
    },
    /* Main change content engine */

    changeContent: function (templatePath, data, module, page, callback) {
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

          /* Init miles view process */
          Bus.publish(module, 'custom_init');

          /* Call to loyalty loaded event */
          Bus.publish('loyalty', 'loaded');

          /* Close navigation */
          var $header = self.element.closest('#wrapper').find('#header');
          $header.find('#subnav').removeClass('active').attr('style', '');
          $header.find('.panel.active').removeClass('active').attr('style', '');
          $header.find('#topbar .nav .main_nav li.active').removeClass('active');

          if (callback) {
            callback(function () {
              /* Hide loading screen */
              $.when(self.loadingPromise)
              .done(function () {
                self.resolvePromiseLoading();
              });

            });
          }
          else {
            /* Hide loading screen */
            $.when(self.loadingPromise)
            .done(function () {
              self.resolvePromiseLoading();
            });
          }

        }
      });

    }

  };
});