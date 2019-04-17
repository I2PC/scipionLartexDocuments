Hydra.module.register('Subnav', function(Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#subnav',
    element: undefined,
    initialHeight: 0,

    events: {
      'topbar': {
        'clicked': function(oNotify) {
          this.toggleSubnav(oNotify.panelId, oNotify.reduced);
        }
      },
      'account': {
        'login': function(oNotify) {
          this.appendLoyaltyNav();
        },
        'logoff': function(oNotify) {
          this.removeLoyaltyNav();
        }
      }
    },

    init: function() {
      var self = this;

      /* Save jquery object reference */
      this.element = $(this.selector);

      /* Save reference to initial height */
      this.initialHeight = this.element.height();

      /* Bind close events */
      this.bindCloseEvents();

      /* If the user is logged in append loyalty navigation */
      $.when(preload, ready)
      .done(function() {
        if (User.isLoggedIn()) {
          self.appendLoyaltyNav();
        } else {
          User.displayLogin();
        }
      });

    },

    /* Close buttons */

    bindCloseEvents: function() {
      var self = this;

      this.element.on('click', '.close a', function(event) {
        event.preventDefault();

        if ($(window).scrollTop() > 0) {
          Bus.publish('scroll', 'scrollTo', {callback: function() {
            self.closeSubnav();
          }});
        }
        else {
          self.closeSubnav();
        }

      });
    },

    /* Toogle subnav */

    toggleSubnav: function(panelId, clickFromReduced) {
      var self = this;
      var $panel;

      if ($(".literalesEditables textarea").length === 0) {
        /* Get panel reference */
        $panel = $(panelId);

        /* Toggle the panel */
        if ($panel.hasClass('active')) { /* The panel is active, so close it */
          if ($(window).scrollTop() > 0) {
            Bus.publish('scroll', 'scrollTo', {callback: function() {
              self.closeSubnav();
            }});
          }
          else {
            self.closeSubnav();
          }
        }
        else {
          if (this.element.find('.panel.active').length > 0) { /* There's other active panel */
            if ($(window).scrollTop()) {
              Bus.publish('scroll', 'scrollTo', {callback: function() {
                self.changePanel(panelId);
              }});
            }
            else {
              self.changePanel(panelId);
            }

          }
          else { /* Open this panel */
            if ($(window).scrollTop()) {
              Bus.publish('scroll', 'scrollTo', {callback: function() {
                self.openSubnav(panelId);
              }});
            }
            else {
              self.openSubnav(panelId);
            }
          }
        }
      }
    },

    openSubnav: function(panelId) {
      /* Get panel reference */
      var $panel = $(panelId);
      var panelHeight;

      /* Change subnav status and to the panel */
      this.element.addClass('active');
      $panel.addClass('active');

      /* Show panel and get its height if greater than 330px */
      /* This is to make room for the close button in markets with few menu options */
      panelHeight = Math.max($('#fly_with_ae').outerHeight(), $('#info').outerHeight());

      $panel.css('height', (panelHeight - 75)); // update inner panel height minus panel padding

      /* Expand subnav container to show the panel */
      /* Use jquerypp animate (css when available) */
      this.element.animate({height: panelHeight}, 400, function(){});

      /* Notify the panel is opened */
      Bus.publish('subnav', 'opened', {panelId: panelId});
    },

    closeSubnav: function() {
      /* Change subnav status */
      this.element.removeClass('active');
      this.element.find('.panel.active').removeClass('active');

      /* Collapse subnav container to show the panel */
      /* Use jquerypp animate (css when available) */
      this.element.animate({height: this.initialHeight}, 400, function(){});

      /* Notify all the panels are closed */
      Bus.publish('subnav', 'closed');
    },

    changePanel: function(panelId) {
      /* Hide the active panel */
      this.element.find('.panel.active').removeClass('active');

      /* Open the selected one */
      this.openSubnav(panelId);
    },

    /* Account */

    appendLoyaltyNav: function() {
      var self = this;

      /* Get the structure template */
      Bus.publish('ajax', 'getTemplate', {
        path: AirEuropaConfig.templates.account.subnav,
        success: function(template) {
          var data = {
            userName: localStorage.ly_userName,
            userMiles: localStorage.ly_accumulatedMiles,
            userTypeCard: localStorage.ly_loyaltyTierType
          };
          var subnav = template(data);

          self.element.find("#my_account.panel .panel_title").append(subnav);
        }
      });
    },

    removeLoyaltyNav: function() {
      this.element.find('#my_account.panel .panel_title span').remove();
    }

  };
});