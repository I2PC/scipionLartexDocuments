(function($) {

  $.widget("ui.steps", {
    options: {
    },

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.steps.instances.push(this.element);
    },

    _init: function() {

    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.steps.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.steps.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function(){
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.steps.instances, function(el) {
        return el !== element;
      });
    },

    /* Exit step animation */

    _closeTopbar: function(callback) {
      var callback = (callback) ? callback : function() {};

      if (this.element.find('.process_top_bar .resume').hasClass('opened')) {
        this.element.find('.process_top_bar .resume').find('.close_itinerary a').trigger('click');

        setTimeout(function() {
          callback();
        }, 500);
      }
      else {
        callback();
      }
    },

    _changeTobarColor: function(callback) {
      var callback = (callback) ? callback : function() {};

      callback();
    },

    _showPlane: function(callback) {
      var self = this;
      var callback = (callback) ? callback : function() {};
      var nextStep = $(".process_step").attr('data-next');

      /* Append topbar */
      if (this.element.find('.loading_content').length == 0) {
//        this.element.append('<div class="loading_content"><div class="loading_topbar"><div class="searching_bar"><div class="loader"><span class="icon"></span></div></div></div><span class="spinner"></span></div>');
    	  this.element.append('<div class="loading_content"><div class="loading_topbar"><div class="searching_bar"><div class="loader"><span class="icon"></span></div></div></div><span class="text_spinner">' + lang('checkout_' + nextStep + '.text_spinner') + '</span><span class="spinner"></span></div>');
      }

      /* Set topbar width */
      this.element.find('.loading_content').css('width', this.element.find('.process_content').outerWidth());

      /* Animate searching bar */
      this.element.find('.loading_topbar').animate({
        'margin-left': '0'
      }, 300, 'linear', function() {});

      this.element.find('.searching_bar').animate({
        'width': '100%'
      }, 1500, 'easeInOutExpo', function() {
        self.finishedLoadingBar = true;

        /* Show blinking dot */
        self.element.find('.loading_content .spinner').show();
        self.element.find('.loading_content .text_spinner').show();

        /* Execute callback */
        callback();
      });
    },

    _hideStep: function(direction) {
      var $step = this.element.find('.process_step');
      var newTop = ($step.height() + 100)* -1;

      if (direction == 'bottom') {
        newTop = this.element.height() - this.element.find('.process_top_bar').height() + 30;
      }

      $step.animate({
        top: newTop
      }, 1500, 'easeInOutExpo');
    },

    /* Reset methods */

    _resetPlane: function() {
      this.element.find('.loading_content').remove();
    },

    _resetScroll: function(callback) {
      var callback = (callback) ? callback : function() {};
      var scrollTop = this.element.scrollTop();

      if (scrollTop > 0) {
        this.element.stop().animate({
          scrollTop: 0
        }, 300, 'easeInOutExpo', function() {
          callback();
        });
      }
      else {
        callback();
      }
    },

    /* Enter step animation */

    _hidePlane: function(callback) {
      var self = this;
      var callback = (callback) ? callback : function() {};

      if (this.element.find('.loading_content').length > 0) {
        this.element.find('.loading_content').fadeOut(500, function() {
          self.element.find('.loading_content').remove();;
        });
      }
      else {
        callback();
      }
    },

    _showStep: function(callback, after, $step, $currentStep) {
      var callback = (callback) ? callback : function() {};

      if ($currentStep.length == 0) {
        $step.show();
        callback();
      }
      else {
        var contentHeight = this.element.height() - this.element.find('.process_top_bar').height();
        $currentStep.css('position', 'absolute');

        $step.css({
          'top': (after) ? contentHeight : ($step.height() + 30) * -1
        });

        $step.show();

        $step.animate({
          top: 0
        }, 1000, 'easeInOutExpo', function() {
          callback();
        });

      }
    },

    /* Public methods */

    showLoading: function(callback, direction) {
      var self = this;
      var callback = (callback) ? callback : function() {};
      var direction = (direction) ? direction : 'top';

      // callback();
      // return false;

      /* Disable submit button */
      this.element.find('.process_step .submit_button button').attr('disabled', 'disabled');

      /* Animation */
      this._closeTopbar(function() { /* 1) close the topbar if it's needed */
        self._changeTobarColor(function() { /* 2) Change topbar color if needed */
          self._hideStep(direction); /* 3) Hide step on the top of the page */

          self._showPlane(function() { /* 3) Show plane and start animation */
            self._resetScroll(function() { /* 4) Reset scroll */
              /* Set the animation flag to done */
              self.element.attr('data-exit-animation-shown', 'true');

              /* Execute the callback */
              callback();
            });
          });
        });

      });
    },

    showErrors: function() {
      var $step = this.element.find('.process_step');

      /* Disable submit button */
      this.element.find('.process_step .submit_button button').removeAttr('disabled');

      /* Reset scroll bar */
      this._resetPlane();

      /* Animate back the step to show errors */
      $step.animate({
        top: 0
      }, 500, 'easeInOutExpo');
    },

    showNextStep: function(callback, after, $step, $currentStep) {
      var self = this;
      var callback = (callback) ? callback : function() {};

      /* Disable submit button */
      this.element.find('.process_step .submit_button button').removeAttr('disabled');

      this._hidePlane();
      this._showStep(callback, after, $step, $currentStep);
      this.element.attr('data-exit-animation-shown', '');
    }

  });

  $.extend($.ui.steps, {
    instances: []
  });

})(jQuery);