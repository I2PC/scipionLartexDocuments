(function($) {

  $.widget("ui.cards_slider", $.ui.ae_slider, {
    options: {
    },

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.cards_slider.instances.push(this.element);

      /* Calc slider width */
      this._calcSliderWidth();

      /* Super */
      this._super();

      /* Add click over slide */
      this.addCardEvent();
    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.cards_slider.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.cards_slider.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function() {
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.cards_slider.instances, function(el) {
        return el !== element;
      });
    },

    /* Cards methods */

    _calcSliderWidth: function() {
      var slideWidth = this.element.find('.slide_wrapper > .slide').eq(0).width();
      var totalWidth = slideWidth * this.element.find('.slide_wrapper > .slide').length;

      this.element.find('.slide_wrapper').css('width', totalWidth + 'px');
    },

    addCardEvent: function() {
      var self = this;
      var $slides = this.element.find('.slides .slide');

      $slides.on('click', function(event) {
        event.preventDefault();

        var $this = $(this);
        var thisId = parseInt($this.attr('data-slide-id'));

        /* Trigger paginator method */
        self.element.find('.paginator li[data-page=' + thisId + '] a').trigger('click');
      });
    },

    _animate: function(slide, restartInterval) {
      var self = this;
      var $nextActive = this.element.find('.slides > ul > li').slice(slide, slide + this.options.activeElements);
      var $ul = this.element.find('.slides > ul');
      var positionActive = $nextActive.position().left;

      /* Positions prev and next */
      // this.element.find('.slides').prev().addClass('')

      /* Change active class */
      this.element.find('.slides .active').removeClass('active');
      $nextActive.addClass('active');

      /* Move $ul to the new position */
      $ul.animate({
        'left': positionActive * -1
      }, 1000, 'easeInOutExpo', function() {
        /* Remove animating class and add active */
        $nextActive.addClass('active').removeClass('animating');

        /* Finish the animation and remove the blocking class */
        self.element.removeClass('animating');

        /* Restart interval */
        if (restartInterval && self.options.automatic) self._makeItAutomatic();
      });
    }

  });

  $.extend($.ui.cards_slider, {
    instances: []
  });

})(jQuery);