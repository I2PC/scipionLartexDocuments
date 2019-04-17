Hydra.module.register('Footer', function(Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#footer',
    element: undefined,
    tagsInitialHeight: 0,

    init: function() {
      /* Save jquery object reference */
      this.element = $(this.selector);

      /* Append extend/collapse button */
      this.appendButton();

      /* Bind nav events */
      this.bindExpandEvent();

      /* Get helpedsk phone */
      this.getHelpdeskPhone();

      //
      var phoneElementList = this.element.find('.footer_contact .customer_care p');

      $.each(phoneElementList, function (index, phoneElement) {
        var $this = $(this);
        var phoneNumber = $.trim($this.text());

        if (phoneNumber != "") {
          if (phoneNumber.length > 12 && phoneNumber.length < 16) {
               $this.css('font-size', '36px');
             } 
             else if (phoneNumber.length >= 16 && phoneNumber.length < 20) {
               $this.css('font-size', '30px');
             }
             else if (phoneNumber.length >= 20) {
               $this.css('font-size', '28px');
             }
        }
      });
    },

    appendButton: function() {
      this.element.find('.tags_bar .wrapper').append('<div class="extend"><a href="#"><span>Expandir</span></a><div class="corner_sub"></div>&nbsp;</div>');
    },

    bindExpandEvent: function() {
      var self = this;

      this.element.on('click', '.extend a', function(event) {
        event.preventDefault();

        /* $this reference */
        var $this = $(this);
        var $tagsExtended = self.element.find('.tags_extended');
        var $tagslist = $tagsExtended.find('.more_tags_list');
        var tagsListHeight = $tagslist.outerHeight();

        /* Toggle view */
        if ($tagsExtended.hasClass('visible')) {
          /* Collapse the tags view */
          $this.closest('.extend').removeClass('extended');
          $tagsExtended.removeClass('visible');

          /* Use jquerypp animate (css when available) */
          self.element.find('.tags_extended').animate({
            height: self.tagsInitialHeight
          }, 400, function(){

          });
        }
        else {
          /* Expand the tags view */
          $this.closest('.extend').addClass('extended');
          $tagsExtended.addClass('visible');

          /* Use jquerypp animate (css when available) */
          self.element.find('.tags_extended').animate({
            height: tagsListHeight
          }, 400, function() {
            /* Send the scroll to the opened div */
            Bus.publish('scroll', 'scrollTo', {position: $('.tags_extended').offset().top});
          });

        }

      });
    },

    getHelpdeskPhone: function() {
      var self = this;
      var tlf = self.element.find('.customer_care p span');

      /* Call SERVICE module to get the json */
      Bus.publish('services', 'getHelpeskPhone', {
        success: function(data) {
          if (data) {
            tlf.text(data);
            
             if (data.length > 12 && data.length < 16) {
               tlf.css('font-size', '36px');
             } 
             else if (data.length >= 16 && data.length < 20) {
               tlf.css('font-size', '30px');
             }
             else if (data.length >= 20 && data.length < 24) {
               tlf.css('font-size', '28px');
             }
           }
        }
      });
    }
  };
});