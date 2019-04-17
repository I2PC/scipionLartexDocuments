(function($) {

  $.widget("ui.textarea_field", $.ui.form_field, {
    options: {
    },

    keyCode: {
      BACKSPACE: 8,
      DOWN: 40,
      ENTER: 13,
      ESCAPE: 27,
      NUMPAD_ENTER: 108,
      PAGE_DOWN: 34,
      PAGE_UP: 33,
      SPACE: 32,
      TAB: 9,
      UP: 38,
      MAYUS: 16
    },

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.textarea_field.instances.push(this.element);

      /* Super */
      this._super();

      /* Add events */
      this._addEvents();

      /* Toggle first status */
      this._toggleStatus();
    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.textarea_field.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.textarea_field.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function() {
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.textarea_field.instances, function(el) {
        return el !== element;
      });
    },

    _refresh: function() {
      /* Triggers validation to set the valid flag */
      this.element.trigger('validate');
    },

    /* Events */

    _addEvents: function() {
      this._on(this.element, {
        'focus textarea': function(event) {
          this._setFocused();
        },
        'blur textarea': function(event) {
          this._setBlurred();
          this._toggleStatus();
        }
      });
    },

    /* Toggle status */

    _toggleStatus: function() {

      /* Get input value */
      var $input = this.element.find('textarea');

      /* Add or remove filled class to container div */
      if ($input.val() != '') {
        this.element.addClass('filled');
      }
      else {
        this.element.removeClass('filled');
      }

      /* Triggers refresh */
      this._refresh();
    },

    /* Validation methods */

    _testRequired: function() {
      /* Local variables */
      var inputValue = this.element.find('textarea').val();
      var valid = false;

      if (inputValue != '') {
        valid = true;
      }
      else {
        this.element.trigger('show_error', this.requiredError);
      }

      return valid;
    }


  });

  $.extend($.ui.textarea_field, {
    instances: []
  });

})(jQuery);