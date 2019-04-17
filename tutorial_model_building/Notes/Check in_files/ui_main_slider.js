(function($) {

  $.widget("ui.main_slider", $.ui.ae_slider, {
    options: {
    },

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.main_slider.instances.push(this.element);

      /* Super */
      this._super();

      /* Add static class to element */
      this.element.addClass('static');
    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.main_slider.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.main_slider.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function() {
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.main_slider.instances, function(el) {
        return el !== element;
      });
    },

    _goToSlide: function(slide, restartInterval) {

      /* Make the change just if it's not currently animating */
      if (!this.element.hasClass('animating')) {

        /* Set animating status */
        this.element.removeClass('static').addClass('animating');

        /* Default animate behaviour */
        this._animate(slide, restartInterval);

        /* Update new currentSlide */
        this.currentSlide = slide;

        /* Set the current paginator active */
        this.element.find('.paginator .active').removeClass('active');
        this.element.find('.paginator li').eq(Math.floor(this.currentSlide / this.options.activeElements)).addClass('active');
      }

    },

    _animate: function(slide, restartInterval) {
      var $nextActive = this.element.find('.slides > ul > li').slice(slide, slide + this.options.activeElements);
      var self = this;

      // if (Modernizr.cssmask) { /* If cssmask, listen the end callback */

      //   /* Add class animating */
      //   $nextActive.find('.background').hide();
      //   $nextActive.addClass('animating');

      //   /* Trigger Change slide */
      //   this.element.trigger('change_slide');

      //   $nextActive.find('.background').fadeIn(900);

      //   /* Bind end animation callback */
      //   $nextActive.eq(0).on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd webkitAnimationEnd animationend', function() {

      //     /* Remove last active class */
      //     self.element.find('.slides .active').removeClass('active');

      //     /* Remove animating class and add active */
      //     $nextActive.addClass('active').removeClass('animating')

      //     /* Finish the animation and remove the blocking class */
      //     self.element.removeClass('animating').addClass('static');

      //     /* Unbind event */
      //     $nextActive.eq(0).off('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd webkitAnimationEnd animationend');

      //     /* Restart interval */
      //     if (restartInterval && self.options.automatic) self._makeItAutomatic();
      //   });
      // }
      // else { /* Fallback for browsers without css mask */

        $nextActive.addClass('animating').hide();

        /* Trigger Change slide */
        this.element.trigger('change_slide');

        $nextActive.fadeIn(900, function() {
          /* Remove last active class */
          self.element.find('.slides .active').removeClass('active');

          /* Remove animating class and add active */
          $nextActive.addClass('active').removeClass('animating')

          /* Finish the animation and remove the blocking class */
          self.element.removeClass('animating').addClass('static');

          /* Restart interval */
          if (restartInterval && self.options.automatic) self._makeItAutomatic();
        });

      // }

    }

  });

  $.extend($.ui.main_slider, {
    instances: []
  });

})(jQuery);