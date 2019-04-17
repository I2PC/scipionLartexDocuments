(function($) {

  $.widget("ui.promo_slider", $.ui.ae_slider, {
    options: {
    },

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.promo_slider.instances.push(this.element);

      /* Super */
      this._super();
    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.promo_slider.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.promo_slider.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function() {
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.promo_slider.instances, function(el) {
        return el !== element;
      });
    },

    /* Animate method */

    _animate: function(slide, restartInterval) {

      var self = this;

      var $currentActive = this.element.find('.slides > ul > li.active');
      var $nextActive = this.element.find('.slides > ul > li').slice(slide, slide + this.options.activeElements);
      
      /* Is next active is the current active, do nothing */
      if ($nextActive.hasClass('active')) {
        /* Finish the animation and remove the blocking class */
        self.element.removeClass('animating');

        /* Restart interval */
        if (restartInterval && self.options.automatic) self._makeItAutomatic();
        return;
      }

      /* Calculate current height of the slider */
      var currentActiveHeight = $currentActive.height();

      /* Animate right side */
      $nextActive.find('.header, .right_side').animate({
        opacity: 1
      }, 400, function(){});

      /* Place initial position for animation */
      $currentActive.find('.body, .left_side').css({
        top: '0px'
      });

      /* Animate current active */
      $currentActive.find('.body, .left_side').animate({
        top: '-'+currentActiveHeight+'px'
      }, 400, function() {

        /* Reset the style status */
        $currentActive.find('.header, .right_side').attr('style', '');
        $currentActive.find('.body, .left_side').attr('style', '');

      });

      /* Place initial position for animation */
      $nextActive.find('.body, .left_side').css({
        top: currentActiveHeight+'px'
      });

      /* Animate left side of the slider to top */
      $nextActive.addClass('animating').find('.body, .left_side').animate({
        top: 0
      }, 400, function() {

        /* Remove last active class */
        self.element.find('.slides .active').removeClass('active');

        /* Remove animating class and add active */
        $nextActive.addClass('active').removeClass('animating');

        /* Reset the style status */
        $nextActive.find('.header, .right_side').attr('style', '');
        $nextActive.find('.body, .left_side').attr('style', '');

        /* Finish the animation and remove the blocking class */
        self.element.removeClass('animating');

        /* Restart interval */
        if (restartInterval && self.options.automatic) self._makeItAutomatic();
      });
    }

  });

  $.extend($.ui.promo_slider, {
    instances: []
  });

})(jQuery);