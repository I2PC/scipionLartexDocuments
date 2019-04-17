Hydra.module.register('BrowserWarningOverlay', function (Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#browserWarningOverlay',
    element: undefined,
    init: function () {
      var self = this;

      /* Save jquery object reference */
      this.element = $(this.selector);

      /* Check if the IE8 warning has been already accepted */
      this.checkBrowserAccepted();

      /* Create a wanring message if IE8 */
      this.createWarning();

      /* Resrets warning margin-top when scrolling */
      this.windowScroll();

    },
    checkBrowserAccepted: function() {
      var browserAccepted = $.cookie('browserAccepted');
      if (browserAccepted == undefined) {
        this.element.addClass('need_acceptance');
      }
    },
    createWarning: function () {
      var self = this;
      var closer = self.element.find('.warning_closer');
      $('html').hasClass('ie8') && self.element.hasClass('need_acceptance') ? self.expandWarning(this) : '';

      closer.on('click',function(event){
        self.collapseWarning();
        self.element.removeClass('need_acceptance');
        $.cookie('browserAccepted', 'browserAccepted');
      });
    },
    expandWarning: function () {
      this.element.show();
      this.element.find('.browserWarning').animate({
        height: '230px'
      },1000);
    },
    collapseWarning: function () {
      this.element.hide();
      this.element.find('.browserWarning').animate({
        height: '0'
      },1000);
    },
    windowScroll: function(){
      var topBarHeight = $('#topbar').outerHeight();
      $(window).on('scroll',function(){
        if($(window).scrollTop() < topBarHeight ){
          $('.browserWarning').css('margin-top', topBarHeight - $(window).scrollTop());
        } else {
          $('.browserWarning').css({
            'margin-top':0,
            'position':'fixed'
          });
        }
      });
    }
  };
});

