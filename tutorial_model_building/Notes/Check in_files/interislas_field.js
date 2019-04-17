(function($) {

  $.widget("ui.interislas_field", $.ui.form_field, {
    options: {
    },

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.interislas_field.instances.push(this.element);

      /* Super */
      this._super();

      /* Add events */
      this._addEvents();

      /* Propagate change flag */
      this.shouldPropagateChange = this.element.hasClass('propagate_change');

    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.interislas_field.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.interislas_field.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function() {
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.interislas_field.instances, function(el) {
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
        /*'updateField': function(event) {
          this._updateInterislasField();
        },*/
        'change .inter_checks input':function(event) {
          /* Get input */
          var $input = $(event.currentTarget);
          var $label = $input.closest('.field_wrapper').find('label');
          var textColectivo = ($input.attr('id') != 0) ? $label.find('span').text() : "Colectivo interislas";

          this.element.find('.inter_dropdown .label label').text(textColectivo);
        }
      });
    },

    // _updateInterislasField: function() {
    //   var $form        = this.form.element;
    //   var isMiniSearch = ($('.mini_search').length);
    //   var fromValue    = (isMiniSearch) ? $form.find('#mini_search_form_from').val() : $form.find('#search_form_from').val();
    //   var toValue      = (isMiniSearch) ? $form.find('#mini_search_form_to').val()   : $form.find('#search_form_to').val();

    //   /* Hide interislas selector */
    //   $form.find('fieldset.inter_discount').addClass('hidden');

    //   if (fromValue !== "" && toValue !== "") {
    //     // Llamar al servicio para obtener información interislas
    //     var mustShowInterislasSelector = ((fromValue == 'PMI' || fromValue == "IBZ") && (toValue == 'PMI' || toValue == "IBZ"));
    //     var interislasOptions = {
    //       NOT: 'No aplicar descuento de interislas',
    //       OP1: 'Mayores de 64',
    //       OP2: 'Otro colectivo',
    //       OP3: 'Último colectivo'
    //     };

    //     Bus.publish('services', 'getBookingBlock', {
    //       data: {
    //         departureCode: fromValue,
    //         arrivalCode:   toValue
    //       },
    //       success: function(data) {
    //         console.log("INTERISLAS");
    //         console.log(data);
    //         console.log("end - INTERISLAS");
    //       }
    //     });

    //     if (mustShowInterislasSelector) {
    //       /* Update interislas options */
    //       $form.find('fieldset.inter_discount .inter_detail .inter_checks ul').html('');

    //       /* Field attrs */
    //       var fieldDataGroup = (isMiniSearch) ? 'field_minisearch_inter_group' : 'field_search_interislas_group';
    //       var fieldName      = (isMiniSearch) ? 'field_minisearch_inter'       : 'field_search_interislas';
    //       var fieldPrefix    = (isMiniSearch) ? 'mini_' : '';

    //       $.each(interislasOptions, function(optionCode, optionText) {
    //         var newOption = '<li><div class="field radio propagate_change" data-group="'+ fieldDataGroup +'" data-init="false"><div class="field_wrapper">'
    //           + '  <label for="'+ fieldPrefix+optionCode +'"><span>'+ optionText +'</span></label>'
    //           + '  <input type="radio" id="'+ fieldPrefix+optionCode +'" name="'+ fieldName +'" />'
    //           + '</div></div></li>';

    //         $form.find('fieldset.inter_discount .inter_detail .inter_checks ul').append(newOption);
    //       });

    //       /* Show interislas selector */
    //       $form.find('fieldset.inter_discount').removeClass('hidden');

    //       /* Restart fields */
    //       $form.form('restartFields');

    //       /* Set selected element */
    //       var interislasCode = $form.find('input.interislas').val() || false;

    //       var $defaultOptionElement  = $form.find('fieldset.inter_discount .inter_detail .inter_checks ul .field.radio').first();
    //       var $selectedOptionInput   = $form.find('fieldset.inter_discount .inter_detail .inter_checks ul .field.radio input#mini_'+ interislasCode);

    //       if (!interislasCode || !$selectedOptionInput.length) {
    //         /* Set first radio element as checked */
    //         $defaultOptionElement.addClass('checked');
    //       } else {
    //         $selectedOptionInput.closest('.field.radio').addClass('checked');
    //         var textColectivo = $selectedOptionInput.closest('.field_wrapper').find('label span').text();
    //         this.element.find('.inter_dropdown .label label').text(textColectivo);
    //       }
    //     }
    //   }
    // }

  });

  $.extend($.ui.interislas_field, {
    instances: []
  });

})(jQuery);