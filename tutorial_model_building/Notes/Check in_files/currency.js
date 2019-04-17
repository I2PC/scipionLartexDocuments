window.formatCurrency = function(number) {
  var decimals = 2;

  /* Figure out decimals */
  if (number % 1 == 0) decimals = 0;

  var formated = accounting.formatNumber(number, decimals);
  if(decimals > 0 && formated.indexOf(accounting.settings.number.decimal) != -1)
  {
	  formated = formated.substring(0, formated.indexOf(accounting.settings.number.decimal)+1) + "<i class='price_decimal'>" + formated.substr(formated.indexOf(accounting.settings.number.decimal)+1, decimals) + "</i>";
  }
  
  return formated;
}

window.getCurrentCurrency = function() {
  return window.appConfig.currentCurrency.description;
}

window.roundDecimals = function(number, type) {
  if (typeof(type)=='undefined') type = 'floor';
  switch (type) {
    case 'ceil':
      number = Math.ceil(number * 100) / 100;
      break;
    case 'floor':
    default:
      number = Math.floor(number * 100) / 100;
  }
  return number;
}