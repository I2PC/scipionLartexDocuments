(function($) {

  $.widget("ui.passengers_count_field", $.ui.form_field, {
    options: {
    },

    /* Create and destroy */

    _create: function() {
      /* Push this instance into the $.ui object */
      $.ui.passengers_count_field.instances.push(this.element);

      /* Super */
      this._super();

      /* Ger max */
      this.max = parseInt(this.element.attr('data-max')) || 9;

      /* Show/hide details */
      this._toggleDetails();

      /* Controls */
      this._addControls();

      /* Refresh controls with the initial value */
      this._refreshCounter('counter_adults', false);
      this._refreshCounter('counter_kids', false);
      this._refreshCounter('counter_babies', false);

      /* Refresh total number */
      this._refreshTotal();
    },

    _destroy: function() {
      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.passengers_count_field.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.passengers_count_field.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function() {
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.passengers_count_field.instances, function(el) {
        return el !== element;
      });
    },

    _refresh: function() {
      /* Triggers validation to set the valid flag */
      this.element.trigger('validate');
    },

    /* Toggle details */

    _toggleDetails: function() {
      this._on(this.element, {
        'touchend .passengers_count': function(event) {
          var self = this;

          this.element.addClass('viewing_details');
          $("input.hasDatepicker").datepicker("hide");

          $('body').off('touchend').on('touchend', function(event) {
            if ($(event.target).closest('.passengers_count').length <= 0) {
              self.element.removeClass('viewing_details');

              $('body').off('touchend');
            }
          });
        },
        'mouseenter .passengers_count': function(event) {
          this.element.addClass('viewing_details');
          $("input.hasDatepicker").datepicker("hide");
        },
        'mouseleave .passengers_count': function(event) {
          this.element.removeClass('viewing_details');
        }
      });
    },

    /* Controls */

    _addControls: function() {
      this._on(this.element, {
        'click .controls .plus': function(event) {
          event.preventDefault();

          var $counter_detail = $(event.currentTarget).closest('.counter_detail');
          var inputClass = $counter_detail.attr('data-input-class');
          var $input = this.element.find('.passengers_input').find('.' + inputClass);
          var inputValue = parseInt($input.val() || 0);
          var $passengersCounter = this.element.find('.passengers_counter');
          var $generalRate = $passengersCounter.find('.general_rate');
          var isGeneralRate = ($generalRate.hasClass('hidden')) ? false : true;
          var isDisabled = (this.element.find('.social_rate .social_list[data-input-class='+inputClass+']').hasClass('disabled')) ? true : false;



          if(!isDisabled){
            /* Limit the max of passengers adults+kids */
            if (inputClass == 'counter_adults' || inputClass == 'counter_kids') {
              var adults_number = parseInt(this.element.find('.passengers_input').find('.counter_adults').val() || 0);
              var kids_number  = parseInt(this.element.find('.passengers_input').find('.counter_kids').val() || 0);

              if (adults_number + kids_number < this.max) {
                $input.val(inputValue + 1);

                /* Refresh the counter with the new value */
                this._refreshCounter(inputClass, true);
                this._refreshTotal();
              }
            }

            /* Maximum same number of babies than adults */
            if (inputClass == 'counter_babies') {
              var adults_number = parseInt(this.element.find('.passengers_input').find('.counter_adults').val() || 0);

              if (inputValue < adults_number) {
                $input.val(inputValue + 1);

                /* Refresh the counter with the new value */
                this._refreshCounter(inputClass, true);
                this._refreshTotal();
              }
            }

            /*Add Disable class*/
            
            if(!isGeneralRate){
              this.element.find('.social_rate .social_list').addClass('disabled');
              this.element.find('.social_rate .social_list[data-input-class='+inputClass+']').removeClass('disabled');
            }


            /* Limit the max of passengers young */
            if (inputClass == 'counter_young') {
              var counterYoung = parseInt(this.element.find('.passengers_input').find('.counter_young').val() || 0);

              if (counterYoung < this.max) {
                $input.val(inputValue + 1);

                /* Refresh the counter with the new value */
                this._refreshCounter(inputClass, true);
                this._refreshTotal();
                this.element.trigger('validate');
              }

            }

            /* Limit the max of passengers Senior */
            if (inputClass == 'counter_senior') {
              var counterSenior = parseInt(this.element.find('.passengers_input').find('.counter_senior').val() || 0);

              if (counterSenior < this.max) {
                $input.val(inputValue + 1);

                /* Refresh the counter with the new value */
                this._refreshCounter(inputClass, true);
                this._refreshTotal();
                this.element.trigger('validate');
              }

            }

            /* Limit the max of passengers federated */
            if (inputClass == 'counter_federated') {
              var counterFederated = parseInt(this.element.find('.passengers_input').find('.counter_federated').val() || 0);

              if (counterFederated < this.max) {
                $input.val(inputValue + 1);

                /* Refresh the counter with the new value */
                this._refreshCounter(inputClass, true);
                this._refreshTotal();
                this.element.trigger('validate');
              }

            }

            /* Limit the max of passengers medical */
            if (inputClass == 'counter_medical') {
              var counterMedical = parseInt(this.element.find('.passengers_input').find('.counter_medical').val() || 0);

              if (counterMedical < this.max) {
                $input.val(inputValue + 1);

                /* Refresh the counter with the new value */
                this._refreshCounter(inputClass, true);
                this._refreshTotal();
                this.element.trigger('validate');

              }

            }


          }

        },
        'click .controls .less': function(event) {
          event.preventDefault();

          var $counter_detail = $(event.currentTarget).closest('.counter_detail');
          var inputClass = $counter_detail.attr('data-input-class');
          var $input = this.element.find('.passengers_input').find('.' + inputClass);
          var inputValue = parseInt($input.val() || 0);
          var minValue = parseInt($counter_detail.attr('data-min') || 0);
          var isDisabled = (this.element.find('.social_rate .social_list[data-input-class='+inputClass+']').hasClass('disabled')) ? true : false;


          if(!isDisabled){
            /* Input value -1 */
            if (inputValue > minValue) {
              $input.val(inputValue - 1);
              /*remove class disabled */
              if((inputValue - 1) == 0){
                this.element.find('.social_rate .social_list').removeClass('disabled');
              }

              /* Maximum same number of babies than adults */
              if (inputClass == 'counter_adults') {
                var babies_number = parseInt(this.element.find('.passengers_input').find('.counter_babies').val() || 0);

                if (inputValue <= babies_number) {
                  this.element.find('.passengers_input').find('.counter_babies').val(babies_number - 1);
                  this._refreshCounter('counter_babies', true);
                }
              }


              /* Refresh the counter with the new value */
              this._refreshCounter(inputClass, true);
              this._refreshTotal();

              this.element.trigger('validate');
            }
          }
          
        },

        'click .switch_detail': function(event) {
          event.preventDefault();
          var $passengersCounter = this.element.find('.passengers_counter');
          var $generalRate = $passengersCounter.find('.general_rate');
          var $socialRate = $passengersCounter.find('.social_rate');

          $generalRate.toggleClass('hidden');
          $socialRate.toggleClass('hidden');

          this._resetCounterByswitchDetail();

        },

        'click .resetPassengers':function(event){
          event.preventDefault();
          this._resetCounterByswitchDetail();
        },

        'update .passengers_counter ul li':function(event){
          event.preventDefault();

          var $counter_detail = $(event.currentTarget);
          var inputClass = $counter_detail.attr('data-input-class');
          var $input = this.element.find('.passengers_input').find('.' + inputClass);
          var inputValue = parseInt($input.val() || 0);


          /* Refresh the counter with the new value */
          this._refreshCounter(inputClass, true);
          this._refreshTotal();

          this.element.trigger('validate');

        }


      });
    },

    _resetCounterByswitchDetail: function($generalRate){
      var $passengersCounter = this.element.find('.passengers_counter');
      var $generalRate = $passengersCounter.find('.general_rate');

      var isGeneralRate = ($generalRate.hasClass('hidden')) ? false : true;

      //Reset adults
      if(!isGeneralRate){
        this.element.find('.passengers_input').find('.counter_adults').val(0);
        this.element.find('.social_rate li').removeClass('disabled');
      }else{
        this.element.find('.passengers_input').find('.counter_adults').val(1);
      }
      this._refreshCounter('counter_adults', true);

      //Reset Kids
      this.element.find('.passengers_input').find('.counter_kids').val(0);
      this._refreshCounter('counter_kids', true);

      //Reset Babies
      this.element.find('.passengers_input').find('.counter_babies').val(0);
      this._refreshCounter('counter_babies', true);

      //Reset young
      this.element.find('.passengers_input').find('.counter_young').val(0);
      this._refreshCounter('counter_young', true);

      //Reset senior
      this.element.find('.passengers_input').find('.counter_senior').val(0);
      this._refreshCounter('counter_senior', true);

      //Reset federated
      this.element.find('.passengers_input').find('.counter_federated').val(0);
      this._refreshCounter('counter_federated', true);

      //Reset medical
      this.element.find('.passengers_input').find('.counter_medical').val(0);
      this._refreshCounter('counter_medical', true);


      this._refreshTotal();

      this.element.trigger('validate');
    },

    _refreshCounter: function(inputClass, propagateChange) {
      var inputValue = parseInt(this.element.find('.passengers_input .' + inputClass).val() || 0);
      var $counter_detail = this.element.find('.counter_detail[data-input-class=' + inputClass + ']');
      var $number = $counter_detail.find('.number');
      var $list_element = this.element.find('.passengers_list .' + inputClass);
      var hideSpecificCounter = true;
      var adults_number = parseInt(this.element.find('.passengers_input').find('.counter_adults').val() || 0);
      var kids_number  = parseInt(this.element.find('.passengers_input').find('.counter_kids').val() || 0);
      var babies_number = parseInt(this.element.find('.passengers_input').find('.counter_babies').val() || 0);
      var isGeneralVisible = (this.element.find('.general_rate').hasClass('hidden')) ? false : true;

      /* Refresh the number of this counter */
      $number.text(inputValue);

      if(isGeneralVisible){
        /* Figure if we have to show the specific counter */
        if (inputClass == 'counter_adults') {
          if (inputValue <= 1) {
            hideSpecificCounter = true;
          }
          else {
            hideSpecificCounter = (kids_number + babies_number == 0);
          }
        }
        else {
          hideSpecificCounter = (inputValue <= 1);

          /* Update adult counter too */
          if (hideSpecificCounter) {
            if (kids_number + babies_number == 0) {
              this.element.find('.passengers_list .counter_adults span').hide();
            }
            else {
              if (adults_number > 1) {
                this.element.find('.passengers_list .counter_adults span').show();
              }
            }
          }
          else {
            if (adults_number > 1) {
              this.element.find('.passengers_list .counter_adults span').show();
            }
          }
        }

        /* Show hide span depending on the input value */
        if (hideSpecificCounter) {
          $list_element.find('span').hide();
        }
        else {
          $list_element.find('span').show();
        }

        /* Refresh the passengers list */
        $list_element.find('span').text(inputValue);

        /* Show hide passengers list element */
        if ($list_element.attr('data-visible') != true) {
          if (inputValue > 0) {
            $list_element.show();
          }
          else {
            $list_element.hide();
          }
        }
      } else {

        this.element.find('.passengers_list .counter_adults span').hide();
        this.element.find('.passengers_list .counter_kids').hide();
        this.element.find('.passengers_list .counter_babies').hide();

      }

      

      /* Notify the .process_wrapper parent, if exists, that the form has changed */
      if (propagateChange) {
        this.element.closest('.process_wrapper').addClass('form_changed');
      }

    },

    _refreshTotal: function() {
      var $inputs = this.element.find('.passengers_input input');
      var total = 0;

      $inputs.each(function() {
        var $input = $(this);
        var value = parseInt($input.val() || 0);
        total += value;
      });

      /* Refresh total */
      this.element.find('.passengers_total span').text(total);

      if (total > 1) {
        this.element.find('.passengers_total em.singular').hide();
        this.element.find('.passengers_total em.plural').show();
      }
      else {
        this.element.find('.passengers_total em.singular').show();
        this.element.find('.passengers_total em.plural').hide();
      }
    },

    /* Validation methods */

    _testRequired: function() {
      /* Local variables */
      var adults_number = parseInt(this.element.find('.passengers_input').find('.counter_adults').val()) || 0;
      var young_number = parseInt(this.element.find('.passengers_input').find('.counter_young').val()) || 0;
      var senior_number = parseInt(this.element.find('.passengers_input').find('.counter_senior').val()) || 0;
      var federated_number = parseInt(this.element.find('.passengers_input').find('.counter_federated').val()) || 0;
      var medical_number = parseInt(this.element.find('.passengers_input').find('.counter_medical').val()) || 0;
      var totalSocial = young_number + senior_number + federated_number + medical_number;
      
      var valid = false;

      if (adults_number > 0) {
        valid = true;
      }else if(totalSocial > 0){ 
        valid = true;
      }

      return valid;
    }

  });

  $.extend($.ui.passengers_count_field, {
    instances: []
  });

})(jQuery);