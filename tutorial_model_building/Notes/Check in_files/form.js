(function($) {

  $.widget("ui.form", {
    options: {
    },

    ready: false,
    fields: [],
    onSubmitCallback: function() {},
    onErrorCallback: function() {},

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.form.instances.push(this.element);

      /* Restart instance attributes due to some reference problem */
      this.ready = true;
      this.fields = [];

      /* Sabe onSubmit callback */
      if (typeof this.options.onSubmit === 'function') {
        this.onSubmitCallback = this.options.onSubmit;
      }

      if (typeof this.options.onError === 'function') {
        this.onErrorCallback = this.options.onError;
      }

      /* Form validation event: every field will trigger this method after validation to show/hide submit button */
      this._listenFormValidate();

      /* Listen form submit */
      this._listenSubmit();

      /*
      Start fields. This function contains generic starters, but in every child form it can be overwritten to
      any configuration parameter.
      */
      this._startFields();

      /* First children fields' validation */
      if (this.options.triggerValidate) {
        this._valideFields();
      }
    },

    _init: function() {

    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.form.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.form.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function(){
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.form.instances, function(el) {
        return el !== element;
      });
    },

    /* Validate functions */

    _listenFormValidate: function() {

      this._on(this.element, {
        'validate': function(event) {
          var formValid = this._checkFields();

          if (formValid) {
            this.element.addClass('ready');
          }
          else {
            this.element.removeClass('ready');
          }

          this.ready = formValid;
        }
      });
    },

    _checkFields: function() {
      // debugger;
      var error = false;

      /* Validate each field */
      $.each(this.fields, function(index, field) {
        if (!(field.element.hasClass('disabled'))) {

          // console.log("-------------------")
          // console.log(field.element.attr('class'));
          // console.log(field.valid);
          // console.log("-------------------")

          /* Check valid property */
          if (!field.valid) {
            /* Not valid */
            error = true;
          }
        }
      });

      return !error;
    },

    _valideFields: function() {
      // debugger;
      /* Validate each field */
      $.each(this.fields, function(index, field) {
        if (!(field.element.hasClass('disabled'))) {
          field.element.trigger('validate');
        }
      });
    },

    /* Start fields */

    restartFields: function() {
      this._startFields();
    },

    _startFields: function() {
      var form = this;

      /* Start fields for this view */

      /* Check group */
      this.element.find('.check_group').not('[data-init=true]').each(function() {
        var $field = $(this);

        if ($field.attr('data-init') == 'restart') {
          $field.check_group('customInit').trigger('validate');
        }
        else {
          form.fields.push($field.check_group({form: form }).data('ui-check_group'));
        }

        $field.attr('data-init', 'true');
      });

      /* Text fields */
      this.element.find('.text_field').not('[data-init=true]').each(function() {
        var $field = $(this);

        if ($field.attr('data-init') == 'restart') {
          $field.text_field('customInit').trigger('validate');
        }
        else {
          form.fields.push($field.text_field({form: form }).data('ui-text_field'));
        }

        $field.attr('data-init', 'true');
      });

      /* Text fields */
      this.element.find('.textarea_field').not('[data-init=true]').each(function() {
        var $field = $(this);

        if ($field.attr('data-init') == 'restart') {
          $field.textarea_field('customInit').trigger('validate');
        }
        else {
          form.fields.push($field.textarea_field({form: form }).data('ui-textarea_field'));
        }

        $field.attr('data-init', 'true');
      });

      /* Select fields */
      this.element.find('.select_field').not('[data-init=true]').each(function() {
        var $field = $(this);

        if ($field.attr('data-init') == 'restart') {
          $field.select_field('customInit').trigger('validate');
        }
        else {
          form.fields.push($field.select_field({form: form }).data('ui-select_field'));
        }

        $field.attr('data-init', 'true');
      });

      /* Multi Select fields */
      this.element.find('.multiselect_field').not('[data-init=true]').each(function() {
        var $field = $(this);

        if ($field.attr('data-init') == 'restart') {
          $field.multiselect_field('customInit').trigger('validate');
        }
        else {
          form.fields.push($field.multiselect_field({form: form }).data('ui-multiselect_field'));
        }

        $field.attr('data-init', 'true');
      });

      /* Airports */
      this.element.find('.airports .airport').not('[data-init=true]').each(function() {
        var $field = $(this);

        if ($field.attr('data-init') == 'restart') {
          $field.airport_field('customInit').trigger('validate');
        }
        else {
          form.fields.push($field.airport_field({form: form }).data('ui-airport_field'));
        }

        $field.attr('data-init', 'true');
      });

      /* Calendar */
      this.element.find('.dates .calendar').not('[data-init=true]').each(function() {
        var $field = $(this);

        if ($field.attr('data-init') == 'restart') {
          $field.datepicker_field('customInit').trigger('validate');
        }
        else {
          //alert("aqui se crea el calendario");
          form.fields.push($field.datepicker_field({form: form }).data('ui-datepicker_field'));
        }

        $field.attr('data-init', 'true');
      });

      /* Checkbox field */
      this.element.find('.checkbox').not('[data-init=true]').each(function() {
        var $field = $(this);

        if ($field.attr('data-init') == 'restart') {
          $field.checkbox_field('customInit').trigger('validate');
        }
        else {
          form.fields.push($field.checkbox_field({form: form }).data('ui-checkbox_field'));
        }

        $field.attr('data-init', 'true');
      });

      /* Radio field */
      this.element.find('.radio').not('[data-init=true]').each(function() {
        var $field = $(this);

        if ($field.attr('data-init') == 'restart') {
          $field.radio_field('customInit').trigger('validate');
        }
        else {
          form.fields.push($field.radio_field({form: form }).data('ui-radio_field'));
        }

        $field.attr('data-init', 'true');
      });

      /* Passengers count */
      this.element.find('.passengers_count_field').not('[data-init=true]').each(function() {
        var $field = $(this);

        if ($field.attr('data-init') == 'restart') {
          $field.passengers_count_field('customInit').trigger('validate');
        }
        else {
          form.fields.push($field.passengers_count_field({form: form }).data('ui-passengers_count_field'));
        }

        $field.attr('data-init', 'true');
      });

      /* Counter field */
      this.element.find('.counter_field').not('[data-init=true]').each(function() {
        var $field = $(this);

        if ($field.attr('data-init') == 'restart') {
          $field.counter_field('customInit').trigger('validate');
        }
        else {
          form.fields.push($field.counter_field({form: form }).data('ui-counter_field'));
        }

        $field.attr('data-init', 'true');
      });

      /* Slider field */
      this.element.find('.slider_field').not('[data-init=true]').each(function() {
        var $field = $(this);

        if ($field.attr('data-init') == 'restart') {
          $field.slider_field('customInit').trigger('validate');
        }
        else {
          form.fields.push($field.slider_field({form: form }).data('ui-slider_field'));
        }

        $field.attr('data-init', 'true');
      });

      /* Reserve field */
      this.element.find('.reserve_field').not('[data-init=true]').each(function() {
        var $field = $(this);

        if ($field.attr('data-init') == 'restart') {
          $field.reserve_field('customInit').trigger('validate');
        }
        else {
          form.fields.push($field.reserve_field({form: form }).data('ui-reserve_field'));
        }

        $field.attr('data-init', 'true');
      });

      /* Flight field */
      this.element.find('.flight_field').not('[data-init=true]').each(function() {
        var $field = $(this);

        if ($field.attr('data-init') == 'restart') {
          $field.flight_field('customInit').trigger('validate');
        }
        else {
          form.fields.push($field.flight_field({form: form }).data('ui-flight_field'));
        }

        $field.attr('data-init', 'true');
      });

      /* Passengers count */
      this.element.find('.interislas_field').not('[data-init=true]').each(function() {
        var $field = $(this);

        if ($field.attr('data-init') == 'restart') {
          $field.interislas_field('customInit').trigger('validate');
        }
        else {
          form.fields.push($field.interislas_field({form: form }).data('ui-interislas_field'));
        }

        $field.attr('data-init', 'true');
      });


    },

    /* Form submit */

    _listenSubmit: function() {
      this._on(this.element, {
        'submit': function(event) {
          event.preventDefault();

          /* Call to validate */
          this.element.trigger('validate');

          /* Remove inital status after user validation */
          this.element.find('.initial_status').not('.disabled').removeClass('initial_status');

          //Forze focus on window to blur current element focused
          window.focus();

          //console.log("READY?: " + this.ready)

          /* Send the form after validation, just if it's ready */
          if (this.ready) {
            this.onSubmitCallback(this);
            $('.search_flights').removeClass('ready'); 
          }
          else {
            this.onErrorCallback(this);
          }
        }
      });
    }

  });

  $.extend($.ui.form, {
    instances: []
  });

})(jQuery);