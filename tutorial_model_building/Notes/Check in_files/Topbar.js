Hydra.module.register('Topbar', function (Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#topbar',
    element: undefined,
    timeoutBar: undefined,
    fastBrowser: !($('html').hasClass('ie8') || Modernizr.touch),
    loginLi: '',
    myAccountLi: '',
    events: {
      'subnav': {
        'opened': function (oNotify) {
          /* Remove active class if it exists and add to the opened one */
          this.element.find('li.active').removeClass('active');
          this.element.find('a[href=' + oNotify.panelId + ']').closest('li').addClass('active');
        },
        closed: function (oNotify) {
          /* Remove the active class */
          this.element.find('li.active').removeClass('active');
        }
      },
      'account': {
        'login': function (oNotify) {
          if(accessLoyalty){
            User.showLoyaltyLink();
            User.showLoyaltyTitle();
            User.showLogoff();
          }
        },
        'logoff': function (oNotify) {
          if(accessLoyalty){
            User.removeLoyaltyLink();
            User.removeLoyaltyTitle();
            User.removeLogoff();
          }
        }
      },
      'loyalty': {
        'loaded': function (oNotify) {
          this.createReducedBar();
          this.bindNavEvents();
        }
      }
    },
    init: function () {
      var self = this;

      /* Save jquery object reference */
      this.element = $(this.selector);

      /* Create reduced bar, to show it when user scrolls down */
      this.createReducedBar();

      /* Bind nav events */
      this.bindNavEvents();

      /* Bind scroll listener */
      this.bindScrollListener();

      /* Start custom scroll for languages */
      this.startLanguages();

      /* Start custom scroll for markets */
      this.startMarkets();
    },
    createReducedBar: function () {
      var self = this;
      var $mainBar = this.element.find('.main_bar');
      var $fixedBar = $('<div class="fixed_bar"></div>');
      var $fixedBarContent = $mainBar.clone().removeClass('main_bar').addClass('fixed_bar_content');

      /* Append fixedBarContent to fixedBar */
      $fixedBar.append($fixedBarContent);

      /* Remove logo/s */
      $fixedBar.find('.logo, .logos').remove();

      /* Duplicate main bar in the home page */
      if ($('body').hasClass('home')) {
        var menuIcon = '<div class="menu_icon"><p><a href="#"><span>Nav</span></a></p></div>';

        /* Prepend icon the bar */
        $fixedBar.prepend(menuIcon);

        /* Icon hover event */
        $fixedBar.find('.menu_icon a').on('mouseover', function (event) {
          event.preventDefault();

          /* Expand the bar if it's collapsed */
          if ($fixedBar.hasClass('collapsed') && $fixedBar.hasClass('visible')) {
            self.expandBar();
          }
        });

        $fixedBar.on('mouseleave', function (event) {
          self.collapseBar();
        });

        /* Append the second menuIcon to have a grey/white mask, this one without hover event */
        $fixedBarContent.prepend(menuIcon);

        /* Set both click events to none */
        $fixedBar.find('.menu_icon a').on('click', function (event) {
          event.preventDefault();
        });

        /* Bind hovered status */
        $fixedBar.hover(function () {
          $fixedBar.addClass('hovered');
        }, function () {
          $fixedBar.removeClass('hovered');
        });

        /* Append fixed bar to parent container */
        this.element.append($fixedBar);
      }

      /* Inner pages */
      else if ($('body').hasClass('inner')) {

        /* Append fixed bar to .nav_bar */
        $('.nav_bar .nav_bar_wrapper').append($fixedBar);

      }

    },
    bindNavEvents: function () {

      /* Main nav events, open the subnav for every option */
      $('.main_nav').off('click', 'a:not([rel=process])');
      $('.main_nav').on('click', 'a:not([rel=process])', function (event) {
        event.preventDefault();

        /* References */
        var $this = $(this);
        var href = $this.attr('href');

        /* Call to service status if my_account is opened and siebel is down */
        if (href === '#my_account' && !$(href).hasClass('active') && window.siebelIsDown) {
          Bus.publish('services', 'check_loyalty_status', {
            success: function () {
              var $body = $('body');
              window.siebelIsDown = false;
              $body.removeClass('siebel_is_down');
            }
          });
        }

        /* Publish clicked event */
        Bus.publish('topbar', 'clicked', {panelId: href, reduced: ($this.closest('.fixed_bar').length > 0)});
      });
    },
    bindScrollListener: function () {
      var self = this;
      var $fixedBar = this.element.find('.fixed_bar');
      var $fixedBarContent = $fixedBar.find('.fixed_bar_content');

      /* Add to scroll manager the fixed bar callback */
      Bus.publish('scroll', 'bindScrollListener', {events: [
          {
            condition: function (scrollTop) {
              return scrollTop > ($('#slider').height() + $('#subnav').height());
            },
            yep: function () {
              if (!self.element.find('.fixed_bar').hasClass('visible')) {
                /* Remove all styles to reset it always at the same point */
                $fixedBar.addClass('visible');

                /* Expand the bar only the first time the user scrolls down */
                if (!$fixedBar.hasClass('first_time_expanded')) {
                  $fixedBar.addClass('first_time_expanded');

                  /* Expand the bar */
                  self.expandBar();

                  /* Hide the bar after few seconds showing it */
                  self.timeoutBar = setTimeout(function () {
                    /* Dont hide it if it's hovered */
                    if (!$fixedBar.hasClass('hovered')) {
                      /* Hide the bar */
                      self.collapseBar();
                    }
                  }, 2000);
                }
              }
            },
            nope: function () {
              /* Hide the whole bar when the scroll is too high for it */
              if ($fixedBar.hasClass('visible')) {
                $fixedBar.removeClass('visible');

                /* Hide the bar */
                self.collapseBar();
              }
            }
          }
        ]});

    },
    expandBar: function () {
      var $fixedBar = this.element.find('.fixed_bar');
      var $fixedBarContent = $fixedBar.find('.fixed_bar_content');

      /* Animate to full height and remove collapsed status */
      $fixedBarContent.stop().animate({
        height: '55px'
      }, 175, function () {
        $fixedBar.removeClass('collapsed');
      });
    },
    collapseBar: function () {
      var $fixedBar = this.element.find('.fixed_bar');
      var $fixedBarContent = $fixedBar.find('.fixed_bar_content');

      /* Clear the previous timeout in order to avoid two collapsing events */
      clearTimeout(this.timeoutBar);

      /* Animate to 0 and set the collapsed status */
      $fixedBarContent.stop().animate({
        height: 0
      }, 175, function () {
        $fixedBar.addClass('collapsed');
      });
    },
    startLanguages: function () {
      var $languagesNav = this.element.find('.language_options');

      /* Control language hover for touch, due to an iPad bug in portrait */
      if (Modernizr.touch) {
        $languagesNav.on('touchend', function (event) {
          $languagesNav.addClass('active');

          $('body').off('touchend').on('touchend', function (event) {
            if ($(event.target).closest('.language_options').length <= 0) {
              $languagesNav.removeClass('active');

              $('body').off('touchend');
            }
          });
        });
      }

      /* Start custom scroll */
      if (this.fastBrowser) {
        this.element.find('.languages_list .scroll_wrapper').jScrollPane();
      }
    },
    startMarkets: function () {
      var $marketsNav = this.element.find('.market_options');

      /* Control language hover for touch, due to an iPad bug in portrait */
      if (Modernizr.touch) {
        $marketsNav.on('touchend', function (event) {
          $marketsNav.addClass('active');

          $('body').off('touchend').on('touchend', function (event) {
            if ($(event.target).closest('.market_options').length <= 0) {
              $marketsNav.removeClass('active');

              $('body').off('touchend');
            }
          });
        });
      }

      /* Start custom scroll */
      if (this.fastBrowser) {
        this.element.find('.markets_list .scroll_wrapper').jScrollPane();
      }

    }
  };
});