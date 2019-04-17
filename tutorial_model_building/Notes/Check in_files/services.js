window.convertTypeToWeb = function(serviceType) {
  var types = {
    'ADULT': 'adult',
    'CHILD': 'kid',
    'INFANT': 'baby'
  };

  return types[serviceType];
};

window.convertTypeToService = function(webType) {
  var types = {
    'adult': 'ADULT',
    'kid': 'CHILD',
    'baby': 'INFANT'
  };

  return types[webType];
};

window.convertLargeFamilyType = function(serviceType) {
  var types = {
    'F1': 'LARGEFAMILY_NORMAL',
    'F2': 'LARGEFAMILY_SPECIAL'
  };

  return types[serviceType];
};

window.convertCabinType = function(cabinType) {
  var types = {
    'economy': 'TUR',
    'business': 'BUS'
  };

  return types[cabinType];
};


window.objectLength = function(obj) {
  if (!obj) return 0;

  var size = 0, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

window.cleanSpaces = function(str) {
  return str.replace(/\s+/g, '');
};
window.optionButtonVisible = function(button_type){
	var key = 'button' + button_type + 'Visible';
	var isVisible = AirEuropaConfig.results[key];

	if (isVisible){
		return 'block';
	}else{
		return 'none';
	}
};


window.getClassMatriz = function(journeysView){
	if (journeysView.rt.length != 0){
		return 'results_by_hour';
	}else{
		return 'results_by_price';
	}
};
window.getClassSize = function(journeysView){
	if (journeysView.rt.length == 1){
		return 'one';
	}else if(journeysView.rt.length == 2){
		return 'two';
	}else if(journeysView.rt.length == 3){
		return 'three';
	}
};
window.getClassVisible = function(position){
	if(position < 4){
		return 'visible';
	}else if(position == 4){
		return 'visible last';
	}
};
window.getClassNoDispo = function(price){
	if(price == null){
		return 'no_dispo';
	}
};

window.checkWarningBookingMessage = function(warningLimit, message) {
  var now = moment();
  if (typeof message=='undefined') message = lang('general.booking_limit_message');
  /* minutes * 60 (to convert to seconds) * 1000 (to convert to timestamp) + now */
  var calculatedWarningBookingLimit = (warningLimit-now.valueOf());

  if (calculatedWarningBookingLimit>0) {
    /* seTimeout of global intervalId */
    window.warningBookingIntervalId = window.setTimeout(function(){

      /* Show warning message */
      $('#process').ui_dialog({
        title: lang('general.booking_limit_title'),
        error: true,
        subtitle: message,
        close: {
          behaviour: 'close',
          href: '#'
        },
        buttons: [
          {
            className: 'close',
            href: '#',
            label: lang('general.ok')
          }
        ]
      });

      clearTimeout(window.warningBookingIntervalId);

    }, calculatedWarningBookingLimit);
  }
};

window.getResultMinWidth = function(journeysView){
	if (journeysView.rt != null && journeysView.rt.length > 0){
		return 'min-width: 985px;';
	}
};

Object.byString = function(o, s) {
  try {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
      var k = a[i];
      if (k in o) {
        o = o[k];
      } else {
        return;
      }
    }
  }
  catch (error) {
    o = null;
  }

  return o;
}

/*
  Deprecated:
  For now it's no longer used, but it could be interesting in future developments
 */
window.convertToDatabaseString = function(stringInput) {
  // replace accents
  var stringInput  = stringInput.split('');
  var stringOutput = new Array();
  var stringLength = stringInput.length;

  var charIn  = "ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž";
  var charOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";

  for (var y = 0; y < stringLength; y++) {
    if (charIn.indexOf(stringInput[y]) != -1) {
      stringOutput[y] = charOut.substr(charIn.indexOf(stringInput[y]), 1);
    } else {
      stringOutput[y] = stringInput[y];
    }
  }

  stringOutput = stringOutput.join('');

  // remove special chars
  stringOutput = stringOutput.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

  return stringOutput;
}