Hydra.module.register('Scroll', function(Bus, Module, ErrorHandler, Api) {
  return {
    moving: false,
    events: [],

    events: {
      'scroll': {
        'scrollTo': function(oNotify) {
          var element = (oNotify.element) ? oNotify.element : 'html, body';
          var position = (oNotify.position) ? oNotify.position : 0;
          var callback = (oNotify.callback) ? oNotify.callback : function() {};

          this.scrollTo(element, position, callback);
        },
        'bindScrollListener': function(oNotify) {
          var element = (oNotify.element) ? oNotify.element : window;

          if (oNotify.events) this.bindScrollListener(element, oNotify.events);
        }
      }
    },

    init: function() {},

    bindScrollListener: function(element, events) {
      var self = this;
      var jQuerySelector = (element == window) ? 'body' : element;

      /* Extend the current events with new ones */
      if (this.events[jQuerySelector] == undefined) {
        this.events[jQuerySelector] = new Array();
      }

      this.events[jQuerySelector] = this.events[jQuerySelector].concat(events);

      /* If the scroll is not binded, bind it and add the events array */
      if (!$(jQuerySelector).hasClass('scroll_binded')) {

        $(element).scroll(function () {
          var scrollTop = $(element).scrollTop(); /* Current scroll position */

          /* Eval the events for this element */
          $.each(self.events[jQuerySelector], function(index, event) {
            if (event.condition(scrollTop)) event.yep();
            else event.nope();
          });

        });

        /* Add the flag to the element */
        $(jQuerySelector).addClass('scroll_binded');
      }

    },

    scrollTo: function(element, position, callback) {
      var self = this;

      if (!this.moving) {
        this.moving = true;

        $(element).stop().animate({
          scrollTop: position
        }, 800, 'easeInOutExpo', function() {
          self.moving = false;

          /* Execute just once, needed for html,body animation */
          if (typeof callback == 'function') {
            callback();
          }
          callback = null;
        });
      }
    }
  };
});