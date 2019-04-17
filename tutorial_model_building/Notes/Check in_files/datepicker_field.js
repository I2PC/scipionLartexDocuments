(function($) {

  $.widget("ui.datepicker_field", $.ui.form_field, {
    options: {
    },

    /* Create and destroy */

    _create: function() {

      /* Push this instance into the $.ui object */
      $.ui.datepicker_field.instances.push(this.element);

      /* Super */
      this._super();

      /* Get behaviour */
      this.behaviour = this.element.data('behaviour');

      /* Start the calendar for this field */
      this._startCalendar();

      /* Control resize */
      this._controlResize();
    },

    _destroy: function() {

      /* The DOM element associated with this instance */
      var element = this.element;

      /* The index, or location of this instance in the instances array */
      var position = $.inArray(element, $.ui.datepicker_field.instances);

      /* If this instance was found, splice it off */
      if(position > -1){
        $.ui.datepicker_field.instances.splice(position, 1);
      }
    },

    /* Helper methods */

    _getOtherInstances: function() {
      var element = this.element;

      /* Return the other instances of this widget */
      return $.grep($.ui.datepicker_field.instances, function(el) {
        return el !== element;
      });
    },

    _refresh: function() {
      /* Triggers validation to set the valid flag */
      this.element.trigger('validate');
    },

    /* Start calendar */

    _startCalendar: function() {
      
      var self = this;
      var $input = this.element.find('.input input');
      var dayNamesMin = [
        lang('dates.dayNamesMin_0'),
        lang('dates.dayNamesMin_1'),
        lang('dates.dayNamesMin_2'),
        lang('dates.dayNamesMin_3'),
        lang('dates.dayNamesMin_4'),
        lang('dates.dayNamesMin_5'),
        lang('dates.dayNamesMin_6')
      ];
  
      var monthsNames = [
        lang('dates.monthsNames_0'),
        lang('dates.monthsNames_1'),
        lang('dates.monthsNames_2'),
        lang('dates.monthsNames_3'),
        lang('dates.monthsNames_4'),
        lang('dates.monthsNames_5'),
        lang('dates.monthsNames_6'),
        lang('dates.monthsNames_7'),
        lang('dates.monthsNames_8'),
        lang('dates.monthsNames_9'),
        lang('dates.monthsNames_10'),
        lang('dates.monthsNames_11')
      ];

      $input.datepicker({
        numberOfMonths: 2,
        minDate: 0,
        maxDate: '+360d',
        dateFormat: 'mm-dd-yy',
        firstDay: lang('dates.firstDayOfWeek'),
        dayNamesMin: dayNamesMin,
        monthNames: monthsNames,
        beforeShow: function(input, inst) {
        	       
          var className;
          var $calendar = $('#ui-datepicker-div');
          var calendar = inst.dpDiv;

          /* If it's set inside the mini_search set it to active */
          if (self.element.closest('.mini_search').length > 0) {
            self.element.closest('.mini_search').addClass('active');
          }

          /* Add a class to know if it's ow or rt*/
          if (self.behaviour == 'ow') {
            className = 'ow';
          }
          else if (self.behaviour == 'rt') {
            className = 'rt';
          }

          $calendar.removeClass('rt ow').addClass(className);

          /* Add class if it's a reduced calendar */
          if (self.element.closest('.mini_search').length > 0) {
            $calendar.addClass('reduced');
          }
          else {
            $calendar.removeClass('reduced');
          }

          setTimeout(function() {
            /* Append corner sub */
            $calendar.append('<div class="corner_sub"></div>');

            /* Position the calendar in the left top corner */
            if (self.element.closest('.mini_search').length == 0) {

              /* Reset the position of the calendar in order to reposition it always at the same point */
              calendar.css({
                'top': '0',
                'left': '0'
              });

              calendar.position({
                my: 'left-100 bottom+8',
                at: 'left top',
                collision: 'fit',
                of: input
              });
            }
            else {

              /* Reset the position of the calendar in order to reposition it always at the same point */
              calendar.css({
                'top': '0',
                'left': '0'
              });

              calendar.position({
                my: 'left-20 top',
                at: 'left bottom',
                collision: 'fit',
                of: input
              });
            }

          }, 0);
        },
        beforeShowDay: function (date) {
          var className = '';
          var owInput, rtInput;
          var owDate, rtDate;
          var lastDayWeek, lasdDayMonth;
          var disableddatesDirection = [];

          /* Fill input values */
          if (self.element.closest('.dates').find('.calendar.ow').find('.input input').length > 0) {
            owInput = self.element.closest('.dates').find('.calendar.ow').find('.input input').val().replace(/\-/g, '/');
          }
          if (self.element.closest('.dates').find('.calendar.rt').find('.input input').length > 0) {
            rtInput = self.element.closest('.dates').find('.calendar.rt').find('.input input').val().replace(/\-/g, '/');
          }

          /* Mark first and last day of month and week */
          lasdDayMonth = (new Date((new Date(date.getFullYear(), date.getMonth()+1,1))-1)).getDate();

          if (lang('dates.firstDayOfWeek') == 0) lastDayWeek = 6;
          else lastDayWeek = lang('dates.firstDayOfWeek') - 1;

          if (date.getDate() == 1) className += 'first_day_month ';
          if (date.getDate() == lasdDayMonth) className += 'last_day_month ';
          if (date.getDay() == lang('dates.firstDayOfWeek')) className += 'first_day_week ';
          if (date.getDay() == lastDayWeek) className += 'last_day_week ';

          /* In rt calendar, mark ow date */
          if (owInput) {
            owDate = new Date(owInput);
            if (date.getTime() == owDate.getTime()) className += 'ow_date ';
          }

          /* In both calendars, mark range */
          if (owInput && rtInput) {
            owDate = new Date(owInput);
            rtDate = new Date(rtInput);

            if (date.getTime() == owDate.getTime()) className += 'range range_first_day ';
            if (date.getTime() > owDate.getTime() && date.getTime() < rtDate.getTime()) className += 'range ';
            if (date.getTime() == rtDate.getTime()) className += 'range range_last_day ';
          }
          
          if(self.behaviour == 'ow'){
        	  disableddatesDirection = window.disableddatesOW;
          }else{
        	  disableddatesDirection = window.disableddatesRT;
          }
        	  
          if(typeof disableddatesDirection !== 'undefined' && disableddatesDirection.length > 0) {
            var arrblockdates = disableddatesDirection.toString();
            var bDisable = arrblockdates.indexOf(date.getTime()) !=-1;
            if (bDisable){
              return [false, className];
            }else{            
              return [true, className];
            }
          }else{
             return [true, className];
            
          } 
        },
        
        onChangeMonthYear: function(year, month, inst) {
           var $calendar = $('#ui-datepicker-div'),
            	lastDayMonth = '01/' + month + '/' + year;
//            	calendarDirection = (inst.id === 'search_form_ow' || inst.id === 'mini_search_form_ow') ? '.dates .ow' : '.dates .rt';

           /*Trigger block dates*/
           $('.dates .ow').trigger('need_dates',lastDayMonth);
 		       $('.dates .rt').trigger('need_dates',lastDayMonth);
           
           setTimeout(function() {
            /* Append corner sub */
            $calendar.append('<div class="corner_sub"></div>');

            if (self.element.closest('.mini_search').length == 0) {
              if ($calendar.height() > 270) {
                $calendar.css('margin-top', '0px');
              }
              else {
                $calendar.css('margin-top', '0');
              }
            }
          }, 0);

        },
        onSelect: function(selectedDate) {
          self.onSelect(selectedDate, true);  
        },
        onClose: function() {
          /* If it's set inside the mini_search set it to non active */
          if (self.element.closest('.mini_search').length > 0) {
            self.element.closest('.mini_search').removeClass('active');
          }
        }
      });

      /* Click event */
      this.element.on('click', function(event) {
    	  if (!self.element.hasClass('off')) {
    		  
             /*Trigger block dates*/
              $('.dates .ow').trigger('need_dates');
    		  $('.dates .rt').trigger('need_dates');
             
             /*Remove active calendar*/
             $('.dates').find('.activeCalendar').removeClass('activeCalendar');
             
             /*Add class active calendar*/
             self.element.addClass('activeCalendar');
             
             /*Show Calendar*/
        	 $input.datepicker('show');
              
            }
      });

      /* Set the default value */
      if ($input.val() == '') {
        this.element.find('.placeholder').text(this.element.data('default') || '');
      }
      else {
        setTimeout(function() { /* Wait some ms in order to give time to the other field to be started */
          self.onSelect($input.val(), false);
        }, 300);
      }
    },

    /* External on Select */

    onSelect: function(selectedDate, propagateChange) {
      var day = new Date(selectedDate.replace(/\-/g, '/'));
      var $rtField = this.element.closest('.dates').find('.calendar.rt');
      var rtInput;
      var formattedDate;

      if ($rtField.length > 0) {
        rtInput = $rtField.find('.input input').val().replace(/\-/g, '/');
      }

      /* Set status to filled */
      if (selectedDate != '') {
        this.element.addClass('filled');
      }
      else {
        this.element.removeClass('filled');
      }

      /* Format date for placeholder */
      if (this.element.closest('.mini_search').length > 0) {
        /* Format date for results calendar */
        formattedDate = day.getDate() + ' ' + lang('dates.monthsNames_' + day.getMonth());
      }
      else {
        /* Format date for normal calendar */
        formattedDate = lang('dates.dayNamesMin_' + day.getDay()) + ' ' + day.getDate() + ' ' + lang('dates.monthsNames_' + day.getMonth()).substr(0, 3);
      }

      /* Refresh the placeholder value */
      this.element.find('.placeholder').text(formattedDate);

      /* Change the behaviour of the other field */
      if (this.behaviour == 'ow') {

        if ($rtField.length > 0) {
          /* Pass this date to rtField */
          $rtField.find('.input input').datepicker('option', 'minDate', selectedDate);

          /* Remove off class to enable it */
          $rtField.removeClass('off');

          /* If new ow date is bigger than rt date, disable that one */
          if (rtInput) {
            if (day.getTime() > (new Date(rtInput)).getTime()) {

              $rtField.find('.input input').datepicker('setDate', '');
              $rtField.find('.placeholder').text($rtField.data('default') || '');
              $rtField.removeClass('filled');
            }
          }
        }
      }
      else if (this.behaviour == 'rt') {

        /* If it's the same date as the previous seleceted one, clean the field */
        if (selectedDate === this.element.find('.placeholder').data('helper')) {

          this.element.find('.input input').datepicker('setDate', '');
          this.element.find('.placeholder').text(this.element.data('default') || '');
          this.element.removeClass('filled');

          /* Clean the selectedDate too, so the placeholder helper will be clean */
          selectedDate = '';
        }
      }

      /* Save the placeholder helper */
      this.element.find('.placeholder').data('helper', selectedDate);

      /* Notify the .process_wrapper parent, if exists, that the form has changed */
      if (propagateChange) {
        this.element.closest('.process_wrapper').addClass('form_changed');
      }

      /* Trigger validation again */
      this._refresh();
    },

    /* Control resize */

    _controlResize: function() {
      var self = this;

      $(window).resize(function() {
        self.element.find('.input input').datepicker('hide');
      });
    },

    /* Validation methods */

    _testRequired: function() {
      /* Local variables */
      var value = this.element.find('.input input').val();
      var valid = false;

      if (value != '') {
        valid = true;
      }

      return valid;
    }

  });

  $.extend($.ui.datepicker_field, {
    instances: []
  });

})(jQuery);