(function($) {

  $.widget("ui.flight_field", $.ui.form_field, {
    options: {
    },

    codeOperator: '',

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
      $.ui.flight_field.instances.push(this.element);

      /* Super */
      this._super();

      /* Save code operator */
      this.codeOperator = this.element.find('.input .field_wrapper .operator_code').text();

      /* Add events */
      this._addEvents();

      /* Toggle first status */
      this._toggleStatus();
    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.flight_field.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.flight_field.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function() {
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.flight_field.instances, function(el) {
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
        'focus input': function(event) {
          this._setFocused();
        },
        'blur input': function(event) {
          this._setBlurred();
          this._toggleStatus();
        },
        'keyup input': function(event) {
          if (event.keyCode != this.keyCode.TAB &&
              event.keyCode != this.keyCode.MAYUS) {
            this._toggleStatus();
          }
        }
      });
    },

    /* Toggle status */

    _toggleStatus: function() {

      /* Get input value */
      var $input = this.element.find('input');

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
      var inputValue = this.element.find('input').val();
      var valid = false;

      if (inputValue != '') {
        this.element.find('label .selected_value').text(this.codeOperator + inputValue);
        valid = true;
      }
      else {
        this.element.find('label .selected_value').text('');
        this.element.trigger('show_error', this.requiredError);
      }

      return valid;
    },

    _testFormat: function() {
      /* Local variables */
      var inputValue = this.element.find('input').val();
      var valid = false;
      var format;

      /* Check if the format is an alias inside the default formats group */
      if (this.format.substring(0, 1) != '^') {
        if (eval('this.formats.' + this.format)) {
          format = eval('this.formats.' + this.format);
        }
      }
      else {
        format = this.format;
      }

      /* Create the regexp */
      var regExp = new RegExp(format);

      if (inputValue != '') {
        if (regExp.test(inputValue)) {
          this.element.find('label .selected_value').text(this.codeOperator + inputValue);
          valid = true;
        }
        else {
          this.element.find('label .selected_value').text('');
          this.element.trigger('show_error', this.formatError);
        }
      }

      return valid;
    }

  });

  $.extend($.ui.flight_field, {
    instances: []
  });

})(jQuery);