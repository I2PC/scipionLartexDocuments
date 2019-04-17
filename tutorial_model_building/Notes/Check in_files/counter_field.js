(function($) {

  $.widget("ui.counter_field", $.ui.form_field, {
    options: {
    },

    $input: undefined,
    counter: 0,
    minValue: 0,
    maxValue: 10,

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.counter_field.instances.push(this.element);

      /* Super */
      this._super();

      /* Start vars */
      this.$input = this.element.find('.input_counter');
      this.maxValue = parseInt(this.element.attr('data-max-value') || 10);
      this.minValue = parseInt(this.element.attr('data-min-value') || 0);

      /* Set input value to 0 if it's undefined */
      if (!this.$input .val()) {
        this.$input.val(this.minValue);
      }

      this.counter = parseInt(this.$input.val());

      /* Add events */
      this._addEvents();

      /* Toggle first status */
      this._changeValue();
    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.counter_field.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.counter_field.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function() {
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.counter_field.instances, function(el) {
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
        'click .plus strong': function(event) {
          event.preventDefault();

          /* Control to limit the max value */
          if (this.counter < this.maxValue) {
            /* +1 to counter */
            this.counter++;
          }

          /* Refresh value */
          this._changeValue();
        },
        'click .less strong': function(event) {
          event.preventDefault();

          /* Control to don't get negative values on the counter */
          if (this.counter > this.minValue) {
            /* -1 to counter */
            this.counter--;
          }

          /* Refresh value */
          this._changeValue();
        }
      });
    },

    /* Toggle status */

    _changeValue: function() {

      /* Update input and span.counter withe the new counter value */
      this.updateValues();

      /* Update field classes */
      this.updateClasses();

      /* Triggers refresh */
      this._refresh();
    },

    /* Internal functions */

    updateValues: function() {
      /* Clean this counter values */
      if (isNaN(this.counter)) {
        this.counter = 0;
      }
      this.counter = parseInt(this.counter);

      /* Update local values */
      this.$input.val(this.counter).trigger('change');
      this.element.find('.selected_value').text(this.counter);
    },

    updateClasses: function() {
      /* Set classes */
      if (this.counter > 0) {
        this.element.addClass('filled')
      }
      else {
        this.element.removeClass('filled')
      }
    },

    /* Validation methods */

    _testRequired: function() {
      /* Local variables */
      var valid = false;

      if (this.counter > 0) {
        valid = true;
      }

      return valid;
    }

  });

  $.extend($.ui.counter_field, {
    instances: []
  });

})(jQuery);