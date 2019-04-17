(function($) {

  $.widget("ui.text_field", $.ui.form_field, {
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

    isModified : false,
    liveValidation : false,

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.text_field.instances.push(this.element);

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
      var position = $.inArray(element, $.ui.text_field.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.text_field.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function() {
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.text_field.instances, function(el) {
        return el !== element;
      });
    },

    _refresh: function() {
      /* Triggers validation to set the valid flag */
      this.element.trigger('validate', this.isModified);
    },

    /* Events */

    _addEvents: function() {

      this.liveValidation = (this.element.attr('data-live-validation') == 'true');

      this._on(this.element, {
        'focus input': function(event) {
          this._setFocused();

          if (this.element.hasClass('non_editable')) {
            this.element.find('input').blur();
          }
        },
        'blur input': function(event) {
          this._setBlurred();
          this._toggleStatus();
        },
        'keyup input': function(event) {
          if (this.liveValidation) {
            if (event.keyCode != this.keyCode.TAB &&
                event.keyCode != this.keyCode.MAYUS) {
                  this._toggleStatus();
            }
          }
        },
        'keypress input': function(event) {
          if (event.keyCode == this.keyCode.ENTER) {

            this._toggleStatus();
            this.element.closest('form').trigger('submit');

            event.preventDefault();
          }
        }
      });

      this._mayusChecker()
    },

    /* Show info if mayus is active writting on password fields */

    _mayusChecker: function() {
      var $targetInput = this.element.find('input[type=password]');

      $targetInput.keypress(function(e) {
        var charKeyCode = e.keyCode ? e.keyCode : e.which; // To work with both MSIE & Netscape
        var shiftKey = e.shiftKey ? e.shiftKey : ((charKeyCode == 16) ? true : false);

        if (((charKeyCode >= 65 && charKeyCode <= 90) && !shiftKey) || ((charKeyCode >= 97 && charKeyCode <= 122) && shiftKey)) {
          // show caps lock activated message
          $(this).closest('.field_wrapper').find('.info_hint').hide();

          $(this).closest('.field_wrapper').find('.caps_hint').remove();
          $(this).closest('.field_wrapper').append('<div class="caps_hint">'+lang('account.caps_lock_activated')+'</div>');
        } else {
          // hide caps lock activated message
          $(this).closest('.field_wrapper').find('.caps_hint').remove();
        }
      });

      $targetInput.on('blur', function() {
        $(this).closest('.field_wrapper').find('.caps_hint').remove();
      });
    },

    /* Toggle status */

    _toggleStatus: function() {

      /* Get input value */
      var $input = this.element.find('input');

      /* Set lowercase for email fields */
      // var format = this.element.attr('data-format') || '';
      // if (format == 'email') this.element.addClass('lowercase');

      /* Add or remove filled class to container div */
      if ($input.val() != '') {
        this.element.addClass('filled');

        /* Flag as modified */
        this.isModified = true;
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
        this.element.trigger('show_error', this.requiredError);
      }

      return valid;
    },

    _testFormat: function(notRequired) {
      /* Local variables */
      if (notRequired == null) {
        notRequired = false;
      }

      var inputValue = this.element.find('input').val();
      var valid = false;
      var format;

      /* If it's not required and doesn't have value, return valid status */
      if (inputValue == '' && notRequired) {
        return true;
      }

      if (this.format.substring(0, 1) != '^') {
        if (eval('this.formats.' + this.format)) {
          format = eval('this.formats.' + this.format);
        }
      }
      else {
        format = this.format;
      }

      if (typeof format == 'function') {
        if (inputValue != '') {
          valid = format(inputValue, this);
        }
      }
      else {
        /* Create the regexp */
        var regExp = new RegExp(format);

        if (inputValue != '') {
          if (regExp.test(inputValue)) {
            valid = true;
          }
        }
      }

      if (!valid) {
        this.element.trigger('show_error', this.formatError);
      }

      return valid;
    }


  });

  $.extend($.ui.text_field, {
    instances: []
  });

})(jQuery);