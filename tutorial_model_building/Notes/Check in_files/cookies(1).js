Hydra.module.register('Cookies', function(Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#cookies',
    element: undefined,

    init: function() {
      /* Save jquery object reference */
      this.element = $(this.selector);

      /* Check cookie */
      this.checkCookie();

      /* Listen Cookies message */
      this.listenCookiesMessage();
    },

    checkCookie: function() {
      var cookiesAccepted = $.cookie('cookiesAccepted');

      if (cookiesAccepted == undefined) {
        this.element.addClass('need_acceptance');
      }
    },

    listenCookiesMessage: function() {
      var self = this;

      this.element.on('click', '.cookies_accept a', function(event) {
        event.preventDefault();

        /* Hide cookies message and set a permanent cookie */
        self.hideCookiesMessage(function() {
          $.cookie('cookiesAccepted', 'cookiesAccepted', { expires : AirEuropaConfig.cookies.expiration });
        });
      });

      /* Hide cookies message after config timeout */
      setTimeout(function() {
        /* Check if the message is still visible */
        if (self.element.hasClass('need_acceptance')) {
          /* Hide cookies message and set a session cookie */
          self.hideCookiesMessage(function() {
            $.cookie('cookiesAccepted', 'cookiesAccepted');
          });
        }
      }, AirEuropaConfig.cookies.messageTimeout);
    },

    hideCookiesMessage: function(callback) {
      var self = this;

      this.element.animate({
        'height': '0',
        'margin': '0'
      }, 400, function() {
        /* Remove need acceptance class */
        self.element.addClass('need_acceptance');

        /* Execute callback */
        callback();
      });
    }
  };
});