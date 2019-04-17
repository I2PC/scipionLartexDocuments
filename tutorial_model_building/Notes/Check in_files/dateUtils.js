var DateUtils = (function(window, $, localStorage, AirEuropaConfig, undefined) {



  return {

    getMonthString: function(moment, returnShortFormat) {
      var date = moment;
      var monthName = lang("dates.monthsNames_"+ date.month());

      return (returnShortFormat === true) ? monthName.substr(0, 3) : monthName;
    },

    getWeekdayString: function(moment, returnShortFormat) {
      var date = moment;
      var weekdayName = lang("dates.dayNames_"+ date.day());

      return (returnShortFormat === true) ? weekdayName.substr(0, 3) : weekdayName;
    }

  }



})(window, jQuery, localStorage, AirEuropaConfig);