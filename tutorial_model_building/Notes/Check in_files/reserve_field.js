(function($) {

  $.widget("ui.reserve_field", $.ui.form_field, {
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
      $.ui.reserve_field.instances.push(this.element);

      /* Super */
      this._super();

      /* Alternative format */
      this.alternativeFormat = this.element.attr('data-alternative-format');

      /* Add events */
      this._addEvents();

      /* Toggle first status */
      this._toggleStatus();
    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.reserve_field.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.reserve_field.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function() {
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.reserve_field.instances, function(el) {
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
        valid = true;
      }
      else {
        this.element.removeClass('locator ticket_number');
        this.element.find('label .selected_value').text('');
        this.element.trigger('show_error', this.requiredError);
      }

      return valid;
    },

    _testFormat: function() {
      /* Local variables */
      var inputValue = this.element.find('input').val();
      var valid = false;
      var format, alternativeFormat;

      /* Check if the format is an alias inside the default formats group */
      if (this.format.substring(0, 1) != '^') {
        if (eval('this.formats.' + this.format)) {
          format = eval('this.formats.' + this.format);
        }
      }
      else {
        format = this.format;
      }

      /* Alternative format */
      if (this.alternativeFormat.substring(0, 1) != '^') {
        if (eval('this.formats.' + this.alternativeFormat)) {
          alternativeFormat = eval('this.formats.' + this.alternativeFormat);
        }
      }
      else {
        alternativeFormat = this.alternativeFormat;
      }

      /* Create the regexp */
      var regExp = new RegExp(format);
      var regExp2 = new RegExp(alternativeFormat);

      if (inputValue != '') {
        if (regExp.test(inputValue)) {
          this.element.addClass('locator').removeClass('ticket_number');
          this.element.find('label .selected_value').text(inputValue);
          valid = true;
        }
        else if (regExp2.test(inputValue)) {
          this.element.removeClass('locator').addClass('ticket_number');
          this.element.find('label .selected_value').text(inputValue);
          valid = true;
        }
        else {
          this.element.removeClass('locator ticket_number');
          this.element.find('label .selected_value').text('');
          this.element.trigger('show_error', this.formatError);
        }
      }
      else {
        this.element.removeClass('locator ticket_number');
        this.element.find('label .selected_value').text('');
      }

      return valid;
    }


  });

  $.extend($.ui.reserve_field, {
    instances: []
  });

})(jQuery);