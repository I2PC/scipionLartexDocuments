(function($) {

  $.widget("ui.get_info", {
    options: {
    },

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.get_info.instances.push(this.element);

      /* Add events */
      this._addEvents();

      /* Start checkbox status, just in case some of them are checked by default */
      this._initInputsStatus();
    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.get_info.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.get_info.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function(){
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.get_info.instances, function(el) {
        return el !== element;
      });
    },

    /* Events */

    _addEvents: function() {

      /* Change checkbox */
      this._on(this.element, {
        'change input[type=radio]': function(event) {
          this._changeInputStatus(event.currentTarget);
          this.element.find('form').submit();
        }
      });

      /* Submit */
      this._on(this.element, {
        'submit form': function(event) {
          
          event.preventDefault();
          var $selectedInput = this.element.find('.options .checked input');
          if ($selectedInput.length != 0) {
            var url  = $selectedInput.data('url');
            if (url) window.location = url;
          }
        }
      });
    },

    /* Checkboxes status */

    _initInputsStatus: function() {
      var self = this;

      this.element.find('input[type=radio]').each(function() {
        self._changeInputStatus(this);
      });
    },

    _changeInputStatus: function(target) {
      /* Local vars */
      var $input = this.element.find(target);

      $input.closest('.options').find('div.checked').removeClass('checked');

      /* Toggle checked class */
      if ($input.is(':checked')) {
        $input.closest('div').addClass('checked');
      }
    }

  });

  $.extend($.ui.get_info, {
    instances: []
  });

})(jQuery);