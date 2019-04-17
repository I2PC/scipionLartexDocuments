Hydra.module.register('Flightinfo', function(Bus, Module, ErrorHandler, Api) {

  return {
    selector: '#flight_info',
    element: undefined,

    events: {
      'flight_info': {
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
      /* Save jquery object reference */
      this.element = $(this.selector);

      if (this.element.length > 0) {

        /* Control content height */
        this.setContentHeight();
        this.controlResize();

        /* Init tabs */
        this.initTabs();
      }
    },

    /* Content height */

    setContentHeight: function() {
      var $process_scroll = this.element.find('.process_scroll');
      var $process_bottom_bar = this.element.find('.process_bottom_bar');

      var availableHeight = $('body').height() - $process_bottom_bar.outerHeight();

      /* Set the height */
      $process_scroll.css('height', availableHeight);
    },

    controlResize: function() {
      var self = this;

      $(window).on('resize.ev_checkout', function() {
        self.setContentHeight();
      });
    },

    /* Init tabs */

    initTabs: function() {
      this.element.find('.tabs_nav').ui_tabs();
    }

  };
});