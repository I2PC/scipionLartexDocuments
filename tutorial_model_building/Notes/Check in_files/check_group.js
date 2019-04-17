(function($) {

  $.widget("ui.check_group", $.ui.form_field, {
    options: {
    },

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.check_group.instances.push(this.element);

      /* Super */
      this._super();

      /* Add events */
      this._addEvents();

      var self = this;

      /* Toggle first status */
      setTimeout(function() {
        self._toggleStatus();
      }, 100)

    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.check_group.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.check_group.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function() {
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.check_group.instances, function(el) {
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
        'change > .check_group_wrapper .group_header input': function(event) {
          /* Get input */
          var $input = $(event.currentTarget);

          /* Default behaviour */
          this._toggleStatus($input);

          /* Trigger unselect */
          $('input[name="' + $input.attr('name') + '"]').not($input).trigger('unselect');
        }
      });
    },

    /* Toggle status */

    _toggleStatus: function($input) {

      var $headerInput;
      var $groupBody;

      if ($input) {
        $headerInput = $input;
        $groupBody = $input.closest('.check_group_wrapper').find('.group_body').eq(0);
      }
      else {
        $headerInput = this.element.find('.group_header input').eq(0);
        $groupBody = this.element.find('.group_body').eq(0);
      }


      /* Toggle group body */
      if ($headerInput.is(':checked')) {
        if($headerInput.attr('name') !== 'payment_type'){ 
          $groupBody.slideDown(300);
        }else{
          $groupBody.find('.check_group_wrapper').slideDown(300);
        }
        this._enableFields();
        $headerInput.closest('.check_group').addClass('opened');
      }
      else {
        if($headerInput.attr('name') !== 'payment_type'){
    	  $groupBody.slideUp(300);
        }else{
    	  $groupBody.find('.check_group_wrapper').slideDown(300);
    	}
        this._disableFields();
        if(!this.element.hasClass('expanded_method')) {
          // Specific part for frequent flyer. Before this fix, when you did
          // uncheck for frequent flyer section, it did uncheck for passenger section as well.
          if ($headerInput.attr('id') && ($headerInput.attr('id').indexOf('field_frequent_flyer') == -1)){

              this.element.removeClass('opened');

            }else{

              $headerInput.closest('fieldset.check_group').removeClass('opened');
            }
          
        }
      }

      /* If it's a radio button, start the accordion behaviour */
      // var $headerInput = this.element.find('.group_header input').eq(0);
      if ($headerInput.is('[type=radio]')) {
        var name = $headerInput.attr('name');
        var $otherGroups = $('input[name=' + name + ']').closest('.check_group');

        $otherGroups.each(function() {
          var $this = $(this);
          var $thisHeaderInput = $this.find('.group_header input');

          if (!$thisHeaderInput.is(':checked')) {
            if($headerInput.attr('name') !== 'payment_type'){
              $this.find('.group_body').slideUp(300);
            }
            if(!$this.hasClass('expanded_method')){
              $this.find('.group_body').find('.field').addClass('disabled');
              $this.removeClass('opened');
            }
          }
        });
      }

      this._refresh();
    },

    _enableFields: function() {
      this.element.find('.group_body .field').removeClass('disabled');
    },

    _disableFields: function() {
      if(!this.element.hasClass('expanded_method')){
        this.element.find('.group_body .field').addClass('disabled');
      }
    }

  });

  $.extend($.ui.check_group, {
    instances: []
  });

})(jQuery);