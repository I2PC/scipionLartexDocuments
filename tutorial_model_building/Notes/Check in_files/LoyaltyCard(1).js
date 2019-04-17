Hydra.module.register('LoyaltyCardController', function (Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#content.loyalty_card',
    element: undefined,
    defaultHashProcess: 'loyalty_card',
    moduleHashes: ['loyalty_card'],
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
        'show_loyalty_card': function (oNotify) {
          this.showLoyaltyCard();
        },
        'show_loyalty_card_passbook': function (oNotify) {
          this.showLoyaltyCardPassbook();
        },
        'show_loyalty_card_duplicate': function (oNotify) {
          this.showLoyaltyCardDuplicate();
        },
        'show_loyalty_card_print': function (oNotify) {
          this.showLoyaltyCardPrint();
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

        /* Update Google Tag Manager */
        updateGtm({
          'pageArea': 'SUMA-logeado',
          'pageCategory': 'mi-tarjeta',
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
        this.showLoyaltyCard();
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

    showLoyaltyCard: function (callback) {
      var self = this;
      var module = 'loyalty_card';
      var page = 'card';
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
          Bus.publish('services', 'getLoyaltyCardInfo', {
            success: function (listsData) {

              Bus.publish('services', 'getLoyaltyMiles', {
                userId: localStorage.ly_userId,
                success: function (response) {
                  if (!response.error && response.body) {
                    var res = response.body.data;
                    listsData.user = {
                      create: res.create,
                      flightLevel: (res.miles !== null) ? res.miles.flightLevel : '',
                      frequentFlyerIdentity: res.frequentFlyerIdentity,
                      frequentFlyerLevel: res.frequentFlyerLevel.frequentFlyerLevel,
                      miles: (res.miles !== null) ? formatCurrency(res.miles.miles) : '',
                      milesLevel: (res.miles !== null) ? formatCurrency(res.miles.milesLevel) : '',
                      name: localStorage.ly_userName + ' ' + localStorage.ly_firstSurname,
                      nextFrequentFlyerLevel: res.frequentFlyerLevel.nextFrequentFlyerLevel,
                      startDate: (res.miles !== null) ? res.miles.rangeLevel.startDate : '',
                      expirationDate: (res.miles !== null) ? res.miles.rangeLevel.endDate : '',
                      tierMiles: (res.miles !== null) ? res.miles.tierMiles : ''
                    };
                  }

                  /* If there is any service calling, put changeContent function in success event */
                  self.changeContent(templatePath, listsData, module, page, callback);
                }
              });

            }
          });
        }
      }

    },
    showLoyaltyCardPassbook: function () {
      if (this.element.find('.add_passbook_expandable').length === 0) {
        this.showLoyaltyCard(function (finishLoadingCallback) {
          Bus.publish('loyalty_card', 'show_card_passbook', {callback: finishLoadingCallback});
        });
      }
      else {
        Bus.publish('loyalty_card', 'show_card_passbook');
      }
    },
    showLoyaltyCardDuplicate: function () {
      if (this.element.find('.duplicate_expandable').length === 0) {
        this.showLoyaltyCard(function (finishLoadingCallback) {
          Bus.publish('loyalty_card', 'show_card_duplicate', {callback: finishLoadingCallback});
        });
      }
      else {
        Bus.publish('loyalty_card', 'show_card_duplicate');
      }
    },
    showLoyaltyCardPrint: function () {
      if (this.element.find('.print_card').length === 0) {
        this.showLoyaltyCard(function (finishLoadingCallback) {
          Bus.publish('loyalty_card', 'show_card_print', {callback: finishLoadingCallback});
        });
      }
      else {
        Bus.publish('loyalty_card', 'show_card_print');
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

          /* Init loyalty view process */
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