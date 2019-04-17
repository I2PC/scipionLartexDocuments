(function($) {

  $.widget("ui.ancillaries_slider", $.ui.ae_slider, {
    options: {
    },

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.ancillaries_slider.instances.push(this.element);

      /* Super */
      this._super();
    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.ancillaries_slider.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.ancillaries_slider.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function() {
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.ancillaries_slider.instances, function(el) {
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

      /* Calculate current width of the slide */
      var currentActiveWidth = $currentActive.width()-2;

      /* Animate header */
      $currentActive.find('.header').fadeOut();

      $currentActive.find('.body').css({
        right: 0
      });

      /* Animate current active */
      $currentActive.find('.body').animate({
        right: '-'+currentActiveWidth+'px'
      }, 500, function() {

        /* Reset the style status */
        $currentActive.find('.body').attr('style', '');

      });

      /* Animate header */
      $nextActive.find('.header').fadeIn();

      $nextActive.find('.body').css({
        right: currentActiveWidth+'px'
      });

      /* Animation for ancillaries slider */
      $nextActive.addClass('animating').find('.body').animate({
        right: 0
      }, 500, function() {
        /* Remove last active class */
        self.element.find('.slides .active').removeClass('active');

        /* Remove animating class and add active */
        $nextActive.addClass('active').removeClass('animating');

        /* Reset the style status */
        $nextActive.attr('style', '');

        /* Finish the animation and remove the blocking class */
        self.element.removeClass('animating');

        /* Restart interval */
        if (restartInterval && self.options.automatic) self._makeItAutomatic();
      });

      /* Change paginator style depending on the left block */
      if ($nextActive.find('.article').hasClass('white_block')) this.element.find('.paginator').addClass('white_block');
      else this.element.find('.paginator').removeClass('white_block');

    }

  });

  $.extend($.ui.ancillaries_slider, {
    instances: []
  });

})(jQuery);