(function($) {

  $.widget("ui.ui_dialog", {
    options: {
    },

    template: undefined,
    html: undefined,
    $html: undefined,

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.ui_dialog.instances.push(this.element);

      /* Render the html */
      this.html = undefined;

      /* Get a reference to html */
      this.$html = undefined;

    },

    _init: function() {
      /* Render the html */
      this.html = undefined;

      /* Get a reference to html */
      this.$html = undefined;

      /* Load Handlebars template */
      this._loadTemplate();

      /* Render the template */
      this._render();

      /* Add events */
      this._addEvents();
    },

    _destroy: function() {
      /* Reset options */
      this.options = {};

      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.ui_dialog.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.ui_dialog.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function(){
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.ui_dialog.instances, function(el) {
        return el !== element;
      });
    },

    /* Templates */

    _loadTemplate: function() {
      this.template = window.getTemplate('widgets.dialog');
    },

    /* Render the template with the options */

    _render: function() {
      /* Render the html */
      this.html = this.template(this.options);

      /* Get a reference to html */
      this.$html = $(this.html);

      /* Append to the existing element */
      this.element.append(this.$html.addClass('visible'));

      /* Execute call back if exists */
      if (typeof this.options.render == 'function') {
        this.options.render(this.$html);
      }
    },

    /* Events */

    _addEvents: function() {
      var self = this;

      this._on(this.$html, {
        'click .close a': function(event) {
          event.preventDefault();
          event.stopPropagation();

          //console.log("Cierra el popup desde el widget");
          //console.log(event);

          this.$html.fadeOut(300, function() {
            self.$html.remove();
            self._destroy();
          });
        }
      });
    }


  });

  $.extend($.ui.ui_dialog, {
    instances: []
  });

})(jQuery);