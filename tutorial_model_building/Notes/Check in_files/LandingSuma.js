Hydra.module.register('LandingController', function (Bus, Module, ErrorHandler, Api) {
  return{

  	selector: '#content.landing_suma',
    element: undefined,

    events: {},

    init: function () {
      /* Save jquery object reference */
      this.element = $(this.selector);

      if (this.element.length > 0) {
      	/* Start loading */
        this.startPromiseLoading();

        /* Load default content on background if needed */
        this.loadContent();

        // Update Google Tag Manager
        if (User.isLoggedIn()) {
          updateGtm({
            'pageArea' : 'SUMA-logueado',
            'pageCategory' : 'home'
          });
        };

      }


    },

    loadContent: function() {
      var self = this;
      var keepInSession = User.isLoggedIn();
//      var templatePath = AirEuropaConfig.templates.landing.suma_anonymous;

      $('.ui_suma_slider').suma_slider();
      
      if(keepInSession){
//        templatePath = AirEuropaConfig.templates.landing.suma_private;
    	  $('.landing_blocks.anonymous').hide();
      } else {
    	  $('.landing_blocks.private').hide();
      }
      
      self.resolvePromiseLoading();

//      Bus.publish('ajax', 'getTemplate', {
//        path: templatePath,
//        success: function (html) {
//          self.element.find('.landing_blocks').append(html); 
//
//          /* Ancillaries slider inside a .block element */
//          $('.ui_suma_slider').suma_slider();
//          
//          self.resolvePromiseLoading();
//          
//        }
//
//      });

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
    }

    };
});