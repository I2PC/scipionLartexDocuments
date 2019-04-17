(function($) {

  $.widget("ui.checkbox_field", $.ui.form_field, {
    options: {
    },

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.checkbox_field.instances.push(this.element);

      /* Super */
      this._super();

      /* Add events */
      this._addEvents();

      /* Propagate change flag */
      this.shouldPropagateChange = this.element.hasClass('propagate_change');

      /* Toggle first status */
      this._toggleStatus(false);
    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.checkbox_field.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.checkbox_field.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function() {
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.checkbox_field.instances, function(el) {
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
        'change input[type=checkbox]': function(event) {
          this._toggleStatus(true);
        }
      });
    },

    /* Toggle status */

    _toggleStatus: function(propagateChange) {

      /* Local vars */
      var $checkbox = this.element.find('input[type=checkbox]');

      /* Toggle checked class */
      if ($checkbox.is(':checked')) {
        this.element.addClass('checked');
      }
      else {
        this.element.removeClass('checked');
      }

      /* Notify the .process_wrapper parent, if exists, that the form has changed */
      if (this.shouldPropagateChange && propagateChange) {
        this.element.closest('.process_wrapper').addClass('form_changed');
      }

      /* Triggers refresh */
      this._refresh();
    },

    /* Validation methods */

    _testRequired: function() {
      /* Local variables */
      var $checkbox = this.element.find('input[type=checkbox]');
      var valid = false;

      if ($checkbox.is(':checked')) {
        valid = true;
      }
      else {
        this.element.trigger('show_error', this.requiredError);
      }

      return valid;
    }

  });

  $.extend($.ui.checkbox_field, {
    instances: []
  });

})(jQuery);