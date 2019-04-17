(function($) {

  $.widget("ui.ui_tabs", {
    options: {
    },

    contents: [],

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.ui_tabs.instances.push(this.element);

      /* Start vars */
      this.contents = [];

      /* Hide non active contents */
      this._hideContents();

      /* Add events */
      this._addEvents();
    },

    _init: function() {

    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.ui_tabs.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.ui_tabs.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function(){
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.ui_tabs.instances, function(el) {
        return el !== element;
      });
    },

    /* Prepare the widget */

    _hideContents: function() {
      var self = this;

      this.element.find('ul li a').each(function() {
        var $a = $(this);
        var href = $a.attr('href');
        var $li = $a.closest('li');
        var $tabContent;

        /* Save the containers ids */
        self.contents.push(href);

        /* Hide the non active containers */
        if (!$li.hasClass('active')) {
          $tabContent = $(href);
          $tabContent.hide();
        }
      });
    },

    /* Events */

    _addEvents: function() {
      /* Click on a tab */
      this._on(this.element, {
        'click li a': function(event) {
          event.preventDefault();

          var $a = $(event.currentTarget);
          var href = $a.attr('href');
          var $li = $a.closest('li');

          /* Active tab */
          this.element.find('li.active').removeClass('active');
          $li.addClass('active');

          /* Active contents */
          this._activeTab(href);
        }
      });
    },

    /* Tabs */

    _activeTab: function(id) {
      /* Active contents */
      var $activeContent = $(id);

      $.each(this.contents, function(indexContent, href) {
        var $tabContent = $(href);

        $tabContent.hide();
      });

      $activeContent.show();
    }

  });

  $.extend($.ui.ui_tabs, {
    instances: []
  });

})(jQuery);