function updateMilesSliders() {
  showUpdatedSlider1();
  showUpdatedSlider2();
}

function updateMilesEquivalence(total) {
  var maxShownFlights = 2;
  var numEquivalences = 2;

  var equivalences = [
    { kms: 4750, text: lang('simulator.DestinyBaleares'), img: 'MapaSUMA.jpg'},
    { kms: 9000, text: lang('simulator.DestinyEurope'), img: 'MapaSUMA.jpg'}, 
    { kms: 14000, text: lang('simulator.DestinyCanarias'), img: 'MapaSUMA.jpg'}, 
    { kms: 25500, text: lang('simulator.DestinyCaribe'), img: 'MapaSUMA.jpg'}, 
    { kms: 34000, text: lang('simulator.DestinyLong'), img: 'MapaSUMA.jpg'}
  ];

  for (var i = equivalences.length - 1; i >= 0; --i) 
    equivalences[i].number = 0;

  var millas = total;
  var found = true;
  while (found && (millas > 0)) {
    found = false;
    for (var i = equivalences.length - 1; i >= 0; --i) {
      if (millas >= equivalences[i].kms) {
        ++equivalences[i].number;
        millas -= equivalences[i].kms;
        found = true;
        break;
      }
    }
  }

  var result = [];
  for (var i = equivalences.length - 1; i >= 0; --i) 
    if (equivalences[i].number > 0) 
      result.push(equivalences[i]);

  $('.visa-results .flights').hide();
  for (var i = 1; i <= numEquivalences; ++i) {
    $('#miles-equivalence-image' + i).hide();
    $('#miles-equivalence-phrase' + i).hide();
  }

  if (result.length > 0)
    $('.visa-results .flights').show();

  var equivalenceTextPrefixes = [
    lang('simulator.equivalenceFlight'),
    lang('simulator.equivalenceFlights')
  ];
  
  var totalShownFlights = 0;

  for (var i = 1; i <= result.length; ++i) {
    if (totalShownFlights >= maxShownFlights)
      break;
    var equivalence = result[i - 1];
    var image = $('#miles-equivalence-image' + i);
    if (image)
      image
        .attr('src', '/airstatic/assets/graphic/loyalty/' + equivalence.img)
        .show();
    var plural = (equivalence.number !== 1);
    var prefix = equivalenceTextPrefixes[plural ? 1 : 0];
    if (plural) {
      var number = equivalence.number;
      if (number > maxShownFlights)
        number = maxShownFlights;
      prefix = number + ' ' + prefix;
    }
    $('#miles-equivalence-text' + i).html(prefix + ' ' + equivalence.text);
    $('#miles-equivalence-phrase' + i).show();
    totalShownFlights += equivalence.number;
  }
}

function updateMilesTotal() {
  var val1 = window.milesSlider1 || '0';
  var val2 = window.milesSlider2 || '0';
  var total = parseInt(val1) + parseInt(val2);
  var promoElement = $('.ctn_promotion .prm-num');
  var promoMiles = parseInt(promoElement.data('miles'));
  total += promoMiles;
  var totalText = formatCurrency(total);
  var totalElement = $('.visa-miles .total-miles');
  totalElement.html(totalText);
  updateMilesEquivalence(total);
}

function showUpdatedSlider1() {
  var money = window.moneySlider1;

  // Aplazado, Fin mes
  var factors = [60, 6];

  var deferred = $('#deferred_payment').is(':checked');
  var index = deferred ? 0 : 1;
  var factor = factors[index];

  var milesValue = factor * money;
  window.milesSlider1 = milesValue;
  var miles = formatCurrency(milesValue);
  $('#anual-miles .value-miles').html(miles);
  updateMilesTotal();
}

function showUpdatedSlider2() {
  var money = window.moneySlider2;

  // Aplazado, Fin mes
  var factors = [10, 2];

  var deferred = $('#deferred_payment').is(':checked');
  var index = deferred ? 0 : 1;
  var factor = factors[index];

  var milesValue = factor * money;
  window.milesSlider2 = milesValue;
  var miles = formatCurrency(milesValue);
  $('#anualMiles .value-miles').html(miles);
  updateMilesTotal();
}

(function($) {

  function showPromoMiles() {
    var promoElement = $('.ctn_promotion .prm-num');
    var promoMiles = parseInt(promoElement.data('miles'));
    var promoAmountElement = $('.amount', promoElement);
    var totalElement = $('.visa-miles .total-miles');
    promoAmountElement.html('+ ' + promoMiles);
    totalElement.html(promoMiles);
  }
  
  function updateSlider1(that, ui) {
    var min = that.element.data('min');
    var max = that.element.data('max');
    that.element.find('.marker-0').text(formatCurrency(min));
    that.element.find('.marker-100').text(formatCurrency(max));

    var money = ui.value;
    var percentage = 100 * (money - min) / max;
    for (var tick = 0; tick <= 100; tick += 25) {
      that.element.find('.marker-' + tick).removeClass('active');
      if (percentage >= tick) {
        that.element.find('.marker-' + tick).addClass('active');
      }
    }
    window.moneySlider1 = money;
  
    var value = '<span class="money">' + formatCurrency(money) + ' €</span>';
    if ((percentage === 0) || (percentage === 100))
      value = '';
    that.element.find('.ui-slider-handle').empty();
    that.element.find('.ui-slider-handle').append('<span class="value">' + value + '</span>');

    showUpdatedSlider1();
  }

  function updateSlider2(that, ui) {
      var min = that.element.data('min');
      var max = that.element.data('max');
      that.element.find('.marker-0').text(formatCurrency(min));
      that.element.find('.marker-100').text(formatCurrency(max));

      var money = ui.value;
      var percentage = 100 * (money - min) / max;
      for (var tick = 0; tick <= 100; tick += 25) {
        that.element.find('.marker-' + tick).removeClass('active');
        if (percentage >= tick) {
          that.element.find('.marker-' + tick).addClass('active');
        }
      }
      window.moneySlider2 = money;

      var value = '<span class="money">' + formatCurrency(money) + ' €</span>';
      if ((percentage === 0) || (percentage === 100))
        value = '';
      that.element.find('.ui-slider-handle').empty();
      that.element.find('.ui-slider-handle').append('<span class="value">' + value + '</span>');

      showUpdatedSlider2();
  }

  $.widget("ui.slider_field", $.ui.form_field, {
    options: {
    },

    /* Create and destroy */

    callbacks: {
      'default': function(event, ui) {
        var value;
        var percentage;
        var amount;

        /* Calc percentage and amount */
        percentage = ui.value;
        amount = Math.floor(parseFloat(parseFloat(this.element.attr('data-total')) * ui.value / 100) * 100) / 100;
        value = formatCurrency(amount) + getCurrentCurrency()  + ' (' + percentage + '%)';

        /* Update tooltip */
        this.element.find('.ui-slider-handle').empty();
        this.element.find('.ui-slider-handle').append('<span class="value">' + value + '<span class="corner_sup"></span></span>');

        /* Update input values */
        this.element.find('input.percentage').val(percentage);
        this.element.find('input.amount').val(amount);
      },
      my_miles: function(event, ui) {
        var value;
        var amount;
        var redemptionFactor;
        var amountMiles;
        var max = parseInt(this.element.attr('data-max'));

        redemptionFactor = this.element.attr('data-redemption-factor')?this.element.attr('data-redemption-factor'):1;

        /* Calc percentage and amount */
        amountMiles = (ui && ui.value) || parseInt(this.element.attr('data-min'));

        if (amountMiles > max) {
          amountMiles = max;
        }
        
        amount = window.roundDecimals((redemptionFactor * amountMiles), 'ceil'); 
        value = '<span class="message">'+this.element.attr('data-tooltip-message')+'</span><span class="price">'+ formatCurrency(amount) + '<span class="coin">' + getCurrentCurrency() +'</span></span><span class="miles">'+amountMiles+' '+(lang('my_miles.activity_column_miles')).toLowerCase()+'</span>';

        /* Update tooltip */
        this.element.find('.ui-slider-handle').empty();
        this.element.find('.ui-slider-handle').append('<span class="value sliderTooltip">' + value + '<span class="corner_sup"></span></span>');

        /* Update input values */
        this.element.find('input.percentage').val(amountMiles);
        this.element.find('input.amount').val(amount);
  
        /* Set tooltip height and position */
        var span_alto = this.element.find('.ui-slider-handle').find('.sliderTooltip').height();
        if (span_alto > 0 ) {
          this.element.find('.ui-slider-handle').find('.sliderTooltip').css('top', '-'+(span_alto+8)+'px');
          this.element.find('.ui-slider-handle').find('.sliderTooltip').css('height', (span_alto+0)+'px');        
        }
      },
      miles_count: function(event, ui) {
        var value;
        var amount;

        /* Calc amount */
        amount = ui.value;

        /* Update tooltip */
        this.element.find('.ui-slider-handle').empty();
        this.element.find('.ui-slider-handle').append('<span class="value">' + amount + ' ' + lang('my_miles.unit_points') + '<span class="corner_sup"></span></span>');

        /* Update input values */
        this.element.find('input.amount').val(amount);
      },
      partner: function(event, ui) {
        var redemptionFactor = this.element.data('conversion-factor');
        var miles = ui.value;
        var points = redemptionFactor * miles;
        
        var value = '<span class="miles">' + formatCurrency(miles) + ' ' + lang('partners.suma_miles_unit') + '</span>';
        value += '<span class="line">------</span>';
        value += '<span class="points">' + formatCurrency(points) + ' ' + this.element.data('partner-points'); + '</span>';
      




        this.element.find('.ui-slider-handle').empty();
        this.element.find('.ui-slider-handle').append('<span class="value">' + value + '<span class="corner_sup"></span></span>');
      },
      simulator: function(event, ui) {
          updateSlider1(this, ui);
        },
      simulatorAnual: function(event, ui) {
          updateSlider2(this, ui);
      },



      },

    customInit: function() {
      this._super();
      this._startSlider();
      showPromoMiles();
    },

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.slider_field.instances.push(this.element);

      /* Super */
      this._super();

      /* Start slider */
      //this._startSlider();

      /* Add events */
      this._addEvents();

      /* Toggle first status */
      this._toggleStatus();
    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.slider_field.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.slider_field.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function() {
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.slider_field.instances, function(el) {
        return el !== element;
      });
    },

    _refresh: function() {
      /* Triggers validation to set the valid flag */
      this.element.trigger('validate');
    },

    /* Start */

    _startSlider: function() {
      var self = this;
      var val = this.element.find('input.percentage').val() || 0;
      var min = parseInt(this.element.attr('data-min')) || 0;
      var max = parseInt(this.element.attr('data-max')) || 100;
      var step = parseInt((max - min) / 100) || 100;
      var $rightLimit = this.element.find('.right_limit');

      /* Set the margin-right to the slider in case there's a right_limit element  
      if ($rightLimit.length > 0) {
        this.element.find('.slider_range').css('margin-right', $rightLimit.width() + parseInt($rightLimit.css('right').replace('px', '')) + 20);
      }*/

      /* Get the callback name */
      this.callbackName = this.element.attr('data-callback') || 'default';

      /* Start de jQuery UI slider */
      this.element.find('.slider_range').slider({
        range: "min",
        value: val,
        min: min,
        max: max,
        step: step
      });

      this.element.find('.slider_range').on('slide', function(event, ui) {
        self.callbacks[self.callbackName].apply(self, [event, ui]);
      });
    },

    /* Events */

    _addEvents: function() {
      this._on(this.element, {

      });
    },

    /* Toggle status */

    _toggleStatus: function() {

      /* Triggers refresh */
      this._refresh();
    },

    /* Validation methods */

    _testRequired: function() {


      return valid;
    }

  });

  $.extend($.ui.slider_field, {
    instances: []
  });

})(jQuery);
