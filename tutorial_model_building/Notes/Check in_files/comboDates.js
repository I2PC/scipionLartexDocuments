var ComboDates = (function(window, $, localStorage, AirEuropaConfig, undefined) {



  var DEFAULT_MAXDAY = 31;
  var DEFAULT_MINDAY = 1;

  var DEFAULT_MAXMONTH = 12;
  var DEFAULT_MINMONTH = 1;

  var DEFAULT_MAXYEAR = 2020;
  var DEFAULT_MINYEAR = 1990;



  _getDayList = function(min, max) {
    var result = '<option value=""></option>';

    min = (typeof min !== "undefined") ? min : DEFAULT_MINDAY;
    max = (typeof max !== "undefined") ? max : DEFAULT_MAXDAY;

    for (var i = min; i <= max; i++) {
      result = result + '<option value="'+ ("0"+i).slice(-2) +'">'+ i +'</option>';
    };

    return result;
  };

  _getMonthList = function(min, max) {
    var result = '<option value=""></option>';

    min = (typeof min !== "undefined") ? min : DEFAULT_MINMONTH;
    max = (typeof max !== "undefined") ? max : DEFAULT_MAXMONTH;

    for (var i = min; i <= max; i++) {
      result = result + '<option value="'+ ("0"+i).slice(-2) +'">'+ lang('dates.monthsNames_' + (i-1)) +'</option>';
    };

    return result;
  };

  _getYearList = function(min, max) {
    var result = '<option value=""></option>';

    min = (typeof min !== "undefined") ? min : DEFAULT_MINYEAR;
    max = (typeof max !== "undefined") ? max : DEFAULT_MAXYEAR;

    for (var i = max; i >= min; i--) {
      result = result + '<option value="'+ i +'">'+ i +'</option>';
    };

    return result;
  };



  return {

    fillData: function($day, $month, $year, minDate, maxDate) {
      // get max and min values
      var minYear  = parseInt(minDate.slice(0, 4));
      var minMonth = parseInt(minDate.slice(5, 7));
      var minDay   = parseInt(minDate.slice(8, 10));

      var maxYear  = parseInt(maxDate.slice(0, 4));
      var maxMonth = parseInt(maxDate.slice(5, 7));
      var maxDay   = parseInt(maxDate.slice(8, 10));

      // get default values
      var dayList   = _getDayList();
      var monthList = _getMonthList();
      var yearList  = _getYearList(minYear, maxYear);

      // set data in combo
      $day.html(dayList);
      $month.html(monthList);
      $year.html(yearList);

      // set events
      $month.change(function() {
        var monthValue = $(this).val();
        var dayValue = ($day.val() != null) ? $day.val() : '';
        var yearValue = ($year.val() != null) ? $year.val() : '';

        if (monthValue == minMonth && yearValue == minYear) {
          var dayList = _getDayList(minDay, DEFAULT_MAXDAY);
        } else if (monthValue == maxMonth && yearValue == maxYear) {
          var dayList = _getDayList(DEFAULT_MINDAY, maxDay);
        } else {
          var dayList = _getDayList();
        }

        $day.html(dayList);

        // set old value
        if ($day.find('option[value='+dayValue+']').length == 0) {
          dayValue = '';
        }

        $day.val(dayValue).trigger('change');
      });

      $year.change(function() {
        var yearValue = $(this).val();
        var monthValue = ($month.val() != null) ? $month.val() : '';

        if (yearValue == minYear) {
          var monthList = _getMonthList(minMonth, DEFAULT_MAXMONTH);
        } else if (yearValue == maxYear) {
          var monthList = _getMonthList(DEFAULT_MINMONTH, maxMonth);
        } else {
          var monthList = _getMonthList();
        }

        $month.html(monthList);

        // set old value
        if ($month.find('option[value='+monthValue+']').length == 0) {
          monthValue = '';
        }

        $month.val(monthValue).trigger('change');
      });
    },

    addListeners: function(context, comboClass, yearClass, monthClass, dayClass) {
      context.find("."+ comboClass).change(function() {
        var inputtarget = $(this).attr("data-input-target");

        // reset value of the hidden date input
        context.find("#"+ inputtarget).val("");

        var dayValue   = context.find("."+ inputtarget +"."+ dayClass).val();
        var monthValue = context.find("."+ inputtarget +"."+ monthClass).val()
        var yearValue  = context.find("."+ inputtarget +"."+ yearClass).val()

        if (dayValue != "" && monthValue != "" && yearValue != "") {
          // set and validate hidden date input
          var finaldate = dayValue +"/"+ monthValue +"/"+ yearValue;
          context.find("#" + inputtarget).val(finaldate);

          context.find("#"+ inputtarget).closest(".hidden_date").trigger('validate');
          context.find("#"+ inputtarget).focus();

          // set/unset error class to all date combos
          if (context.find("#"+ inputtarget).closest(".hidden_date").hasClass("error")) {
            context.find("."+ inputtarget).closest('.select_field').addClass("errorper");
          } else {
            context.find("."+ inputtarget).closest('.select_field').removeClass("errorper");

            /* Focus current element */
            $(this).focus();
          }
        }
      });
    }

  }



})(window, jQuery, localStorage, AirEuropaConfig);