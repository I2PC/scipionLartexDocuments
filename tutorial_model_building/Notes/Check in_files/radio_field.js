(function($) {

  $.widget("ui.radio_field", $.ui.form_field, {
    options: {
    },

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.radio_field.instances.push(this.element);

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
      var position = $.inArray(element, $.ui.radio_field.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.radio_field.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function() {
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.radio_field.instances, function(el) {
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
        'change input[type=radio]': function(event) {
          this._toggleStatus(true);
        }
      });
    },

    /* Toggle status */

    _toggleStatus: function(propagateChange) {

      /* Local vars */
      var $radio = this.element.find('input[type=radio]');

      /* Toggle checked class */
      if ($radio.is(':checked')) {
        this.element.addClass('checked');
      }
      else {
        this.element.removeClass('checked');
      }

      /* Notify the .process_wrapper parent, if exists, that the form has changed */
      if (this.shouldPropagateChange && propagateChange) {
        this.element.closest('.process_wrapper').addClass('form_changed');
      }

      /* Unselect other radios */
      var name = $radio.attr('name');
      var $otherRadioFields = $('input[name="' + name + '"]').closest('.radio');

      $otherRadioFields.each(function() {
        var $this = $(this);

        if (!$this.find('input[type=radio]').is(':checked')) {
          $this.removeClass('checked');
        }
      });

      /* Triggers refresh */
      this._refresh();
    },

    /* Validation methods */

    _testRequired: function() {
      /* Local variables */
      var $radio = this.element.find('input[type=radio]');
      var valid = false;
      var name = $radio.attr('name');

      if (this.form.element.find('input[name="' + name + '"]').is(':checked')) {
        valid = true;
      }

      return valid;
    }

  });

  $.extend($.ui.radio_field, {
    instances: []
  });

})(jQuery);