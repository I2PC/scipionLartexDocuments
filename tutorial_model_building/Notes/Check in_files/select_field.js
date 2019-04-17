(function($) {

  $.widget("ui.select_field", $.ui.form_field, {
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
      TAB_MAYS: 224,
      UP: 38,
      MAYUS: 16
    },

    smartComponent: false,
    isModified : false,

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.select_field.instances.push(this.element);

      /* Super */
      this._super();

      /* Activate smart component */
      this.smartComponent = false;//!Modernizr.touch;

      /* Start component */
      this._startComponent();

      /* Add events */
      this._addEvents();

      /* Toggle first status */
      this._toggleStatus();
    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.select_field.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.select_field.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function() {
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.select_field.instances, function(el) {
        return el !== element;
      });
    },

    _refresh: function() {
      /* Triggers validation to set the valid flag */
      this.element.trigger('validate', this.isModified);
    },

    /* Start */

    _startComponent: function() {
      var self = this;

      if (this.smartComponent) { /* Create dropdown list just for non touch devices */
        this._createDropdown();
      }
    },

    _createDropdown: function() {
      this.element.addClass('transformed');

      /* Create dropdown */
      var dropdown = '<div class="dropdown"><ul>';

      this.element.find('select option').each(function() {
        var $this = $(this);

        dropdown += '<li data-value="' + $this.attr('value') + '"><span>' + $this.text() + '</span></li>';
      });

      dropdown += '</ul></div>';

      this.element.find('.field_wrapper').append(dropdown);
    },

    /* Events */

    _addEvents: function() {
      var self = this;

      this._on(this.element, {
        'click select': function(event) {
          if (this.smartComponent) {
            event.preventDefault();

            /* Open the element */
            this.element.toggleClass('opened');

            /* Add html listener to close the dropdown */
            // $('html').on('click', function() {
            //   self.element.removeClass('opened');

            //   $('html').off('click');
            // });
          }
        },
        'click .dropdown li': function(event) {
          var $target = $(event.target).closest('li');
          var value = $target.attr('data-value');

          /* Select the clicked option */
          this.element.find('select option[value=' + value + ']').prop('selected', 'selected');
          this.element.find('select').change();

          /* Close the dropdown helper */
          this.element.removeClass('opened');
        },
        'focus select': function(event) {
          this._setFocused();
        },
        'blur select': function(event) {
          this._setBlurred();
          this._toggleStatus();
        },
        'change select': function(event) {
          this._toggleStatus();
        },
        'keyup select': function(event) {
          if (event.keyCode != this.keyCode.TAB &&
              event.keyCode != this.keyCode.MAYUS) {
            this._toggleStatus();
          }
        },
        'keypress select': function(event) {
          if (event.keyCode == this.keyCode.ENTER) {
            this._toggleStatus();
            this.element.closest('form').trigger('submit');

            event.preventDefault();
          }
        }
      });
    },

    /* Toggle status */

    _toggleStatus: function() {

      /* Get select value and text */
      var $select = this.element.find('select');
      var $option = $select.find('option:selected');
      var value = $option.attr('value');
      var text = $option.text();

      /* Control field status */
      if (value != '') {
        /* Add filled class */
        this.element.addClass('filled');

        /* Fill the value indicator */
        this.element.find('.selected_value').text(text);

        /* Flag as modified */
        this.isModified = true;
      }
      else {
        /* Remove filled class */
        this.element.removeClass('filled');

        /* Clean selected value text */
        this.element.find('.selected_value').text('');
      }

      /* Triggers refresh */
      this._refresh();
    },

    /* Validation methods */

    _testRequired: function() {
      /* Local variables */
      var $select = this.element.find('select');
      var $option = $select.find('option:selected');
      var value = $option.attr('value');
      var text = $option.text();
      var valid = false;

      if (value != '') {
        valid = true;
      }
      else {
        this.element.trigger('show_error', this.requiredError);
      }

      return valid;
    },

    testFormat: function() {
      /* Local variables */
      var $select = this.element.find('select');
      var $option = $select.find('option:selected');
      var value = $option.attr('value');
      var text = $option.text();
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

      if (regExp.test(value)) {
        valid = true;
      }
      else {
        this.element.trigger('show_error', this.formatError);
      }

      return valid;
    }


  });

  $.extend($.ui.select_field, {
    instances: []
  });

})(jQuery);