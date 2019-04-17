(function($) {

  $.widget("ui.graphic", {
    options: {
      maxTransferWidth: 10
    },

    totalTransfer: 0,
    totalDuration: 0,
    fragmentsWidth: [],
    freePercentage: 100,
    consumedDuration: 0,
    colorCounter: 0,
    companies: [],

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.graphic.instances.push(this.element);

      /* Initialize */
      if (!this.element.hasClass('initialized')) {
        /* Start vars */
        this.fragmentsWidth = [];
        this.freePercentage = 100;
        this.consumedDuration = 0;
        this.colorCounter = 0;
        this.companies = [];

        /* Set widths */
        this.sumTotalDuration();
        this.renderFragments();
      }

      /* Set as initialized */
      this.element.addClass('initialized');
    },

    _init: function() {

    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.graphic.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.graphic.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function(){
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.graphic.instances, function(el) {
        return el !== element;
      });
    },

    /* Widths */

    sumTotalDuration: function() {
      var self = this;

      /* Sum total duration */
      this.element.find('.fragment').each(function(index) {
        var $this = $(this);
        if($this.hasClass('flight')){
          self.fragmentsWidth.push({
            index: index,
            duration: parseInt($this.data('duration') || 0)
          });
         self.totalDuration += parseInt($this.data('duration') || 0);
        }else{
          self.totalTransfer = self.totalTransfer + 1;
        }
      });

      /* Order the fragments array by duration */
      this.fragmentsWidth.sort(function(a, b) {
        return (a.duration - b.duration);
      });
    },

    setFragmentWidth: function($fragment) {
      var currentDuration = parseInt($fragment.data('duration') || 0);
      var fragmentWidth = currentDuration * this.freePercentage / (this.totalDuration - this.consumedDuration);

      /* If it's a transfer */
      if ($fragment.hasClass('transfer')) {
          //Width fixed
    	  fragmentWidth = 10;
      }

      /* If it's a flight */
      if ($fragment.hasClass('flight')) {
        if (fragmentWidth < this.options.minFlightWidth) {
          fragmentWidth = this.options.minFlightWidth;
        }
      }

      /* Save width consumed by transfers */
      this.freePercentage = this.freePercentage - fragmentWidth;

      /* Save time of every transfers */
      this.consumedDuration += currentDuration;

      /* Set its width */
      $fragment.css('width', fragmentWidth + '%');
    },

    /* Operated by */

    operatedBy: function($fragment) {
      var operatedBy = $fragment.data('operated');
      var newColor = false;
      var color = undefined;

      if (operatedBy != '' && operatedBy != undefined && operatedBy != 'UX') {

        /* Look if the company has already a color assigned */
        $.each(this.companies, function(indexCompany, company) {
          if (company.companyName == operatedBy) {
            color = company.color;
          }
        });

        /* Assign a color */
        if (!color) {
          newColor = true;
          color = this.options.highlights[this.colorCounter];
        }

        /* Set the color to element */
        $fragment.find('.point_wrapper').css('border-color', color);
        $fragment.find('.point_wrapper .point').css('background-color', color);
        $fragment.find('.duration').css('background-color', color);

        /* If it's a new color, save it to reuse later */
        if (newColor) {
          /* Save the color in the info extra block */
          $fragment.closest('.journey').find('.info .extras').append('<span class="extra" style="color: ' + color + '"><span style="background-color: ' + color + '"></span> ' + lang('general.operated_by') + ' <strong>' + operatedBy + '</strong></span>');

          /* +1 to color counter */
          this.colorCounter += 1;

          /* Save this color for this company */
          this.companies.push({
            companyName: operatedBy,
            color: color
          });
        }

      }
    },

    /* Render function */

    renderFragments: function() {
      var self = this;
      
      //calculate total percent transfer
      var transferPercentage = self.totalTransfer * 8;
      self.freePercentage =  self.freePercentage - transferPercentage;

      $.each(this.fragmentsWidth, function(index, fragment) {
        var $fragment = self.element.find('.fragment').eq(fragment.index);

        self.setFragmentWidth($fragment);
        self.operatedBy($fragment);
      });

    }

  });

  $.extend($.ui.graphic, {
    instances: []
  });

})(jQuery);