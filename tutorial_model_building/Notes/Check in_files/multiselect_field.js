(function($) {

  $.widget("ui.multiselect_field", $.ui.form_field, {
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

    smartComponent: true,

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.multiselect_field.instances.push(this.element);

      /* Super */
      this._super();

      /* Activate smart component */
      this.smartComponent = true;//!Modernizr.touch;

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
      var position = $.inArray(element, $.ui.multiselect_field.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.multiselect_field.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function() {
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.multiselect_field.instances, function(el) {
        return el !== element;
      });
    },

    _refresh: function() {
      /* Triggers validation to set the valid flag */
      this.element.trigger('validate');
    },

    /* Start */

    _startComponent: function() {
      var self = this;

      this.element.find('select').multipleSelect();
    },

    /* Events */

    _addEvents: function() {
      var self = this;

      this._on(this.element, {
        'focus select': function(event) {
          this._setFocused();
        },
        'blur select': function(event) {
          this._setBlurred();
          this._toggleStatus();
        },
        'change select': function(event) {
          this._toggleStatus();
        }
      });
    },

    /* Toggle status */

    _toggleStatus: function() {

      /* Get select value and text */
      var $select = this.element.find('select');
      var $option = $select.find('option:selected');
      var value = $option.attr('value');
      var text = '';

      $option.each(function() {
        var $this = $(this);

        if (text != '') text += ', ';

        text += $this.text();
      });

      /* Control field status */
      //console.log("VALUE EN TOGGLE: " + value);
      if (value != undefined) {
        /* Add filled class */
        this.element.addClass('filled');

        /* Fill the value indicator */
        this.element.find('.selected_value').text(text);
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

      //console.log("VALUE EN REQUIRED: " + value);

      if (value != undefined) {
        valid = true;
      }
      else {
        this.element.trigger('show_error', this.requiredError);
      }

      return valid;
    }


  });

  $.extend($.ui.multiselect_field, {
    instances: []
  });

})(jQuery);