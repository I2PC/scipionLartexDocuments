Hydra.module.register('DarkSite', function(Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#ds',
    element: undefined,

    init: function() {
      /* Save jquery object reference */
      this.element = $(this.selector);

      /* Check if we have to show it */
      this.checkIfVisible();

      /* Listen flags */
      this.listenFlags();

      /* Listen Cookies message */
      this.listenGoHomeButton();
    },

    checkIfVisible: function() {
      var dsCookie = $.cookie('dsCookie');
      var itsProcessing = (window.location.hash != '');

      if (dsCookie == undefined && !itsProcessing && this.element.length > 0) {
        this.element.addClass('visible');
        $('body').addClass('processing showing_ds');
      }
    },

    listenFlags: function() {
      this.element.on('click', '.en_flag a, .es_flag a', function(event) {
        event.preventDefault();

        var $this = $(this);
        var version = $this.closest('li').attr('data-version');
        var $currentVersion = $this.closest('#ds').find('.ds_info:visible');
        var $newVersion = $this.closest('#ds').find('.ds_info.' + version);

        $currentVersion.fadeOut(800, function() {
          $newVersion.css({
            'display': 'table-cell',
            'opacity': 0
          }).animate({
            'opacity': 1
          }, 800);
        });

      });
    },

    listenGoHomeButton: function() {
      var self = this;

      this.element.on('click', '.go_to_home a, .logos .logo_aireuropa', function(event) {
        event.preventDefault();

        /* Calc expiration date */
        var date = new Date();
        var minutes = AirEuropaConfig.ds.cookieExpiration;
        date.setTime(date.getTime() + (minutes * 60 * 1000));

        /* Set the cookie */
        $.cookie('dsCookie', 'dsCookie', { expires: date });

        /* Recover the main scroll */
        $('body').removeClass('processing showing_ds');

        /* Fadeout dark site */
        self.element.fadeOut(800, function() {

          self.element.removeClass('visible').attr('style', '');
        });
      });
    }

  };
});