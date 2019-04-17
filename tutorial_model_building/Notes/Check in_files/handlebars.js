var handlebarsCounter;
var handlebarsCounter2;

Handlebars.registerHelper('trimName', function(passedString) {
  var theString = '';

  if (passedString.length > 10 && passedString.indexOf(' ') === -1){
    theString = passedString.substring(0,7)+'...';
  } else {
    theString = passedString;
  }

  return new Handlebars.SafeString(theString);
});

Handlebars.registerHelper("foreach", function (arr, options) {
  if (options.inverse && !arr.length)
    return options.inverse(this);

  return jQuery.map(arr, function (item, index) {
    item.$index = index;
    item.$first = index === 0;
    item.$last = index === arr.length - 1;
    return options.fn(item);
  }).join('');
});

Handlebars.registerHelper("stringEach", function (cabinClass, compatibleJourneys, options) {
  var string = '';

  if (compatibleJourneys) {
    if (compatibleJourneys.length > 0) {
      for (n = 0; n < compatibleJourneys.length; n++) {
        string += cabinClass + "_" + compatibleJourneys[n];

        if (n < compatibleJourneys.length - 1) {
          string += ',';
        }
      }
    }
  }

  return string;
});


Handlebars.registerHelper("eachPlaneColumn", function (arr, options) {
  if ((arr[0].name && arr[0].name == "A") || (arr[0].column && arr[0].column == "A")) {
    arr = arr.reverse()
  }

  return jQuery.map(arr, function (item, index) {
    return options.fn(item);
  }).join('');
});

Handlebars.registerHelper('compare', function (lvalue, rvalue, options) {

  if (arguments.length < 3)
    throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

  operator = options.hash.operator || "==";

  var operators = {
    '==': function (l, r) {
      return l == r;
    },
    '===': function (l, r) {
      return l === r;
    },
    '!=': function (l, r) {
      return l != r;
    },
    '<': function (l, r) {
      return l < r;
    },
    '>': function (l, r) {
      return l > r;
    },
    '<=': function (l, r) {
      return l <= r;
    },
    '>=': function (l, r) {
      return l >= r;
    },
    'typeof': function (l, r) {
      return typeof l == r;
    },
    'stringToLower': function (l, r) {
      return l.toLowerCase() == r.toLowerCase();
    },
    'toInt': function (l, r) {
      return parseInt(l) == parseInt(r);
    }
  }

  if (!operators[operator])
    throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);

  var result = operators[operator](lvalue, rvalue);

  if (result) {

    return options.fn(this);
  } else {

    return options.inverse(this);
  }
});

Handlebars.registerHelper('compareLessOne', function (lvalue, rvalue, options) {

  if (arguments.length < 3)
    throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

  operator = options.hash.operator || "==";

  var operators = {
    '==': function (l, r) {
      return l == r;
    },
    '===': function (l, r) {
      return l === r;
    },
    '!=': function (l, r) {
      return l != r;
    },
    '<': function (l, r) {
      return l < r;
    },
    '>': function (l, r) {
      return l > r;
    },
    '<=': function (l, r) {
      return l <= r;
    },
    '>=': function (l, r) {
      return l >= r;
    },
    'typeof': function (l, r) {
      return typeof l == r;
    },
    'stringToLower': function (l, r) {
      return l.toLowerCase() == r.toLowerCase();
    }
  }

  if (!operators[operator])
    throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);

  rvalue = parseInt(rvalue) + 1;

  var result = operators[operator](lvalue, rvalue);

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});


Handlebars.registerHelper('compareType', function (lvalue, rvalue, options) {

  var types = {
    'adult': 'ADULT',
    'kid': 'CHILD',
    'baby': 'INFANT'
  };

  if (arguments.length < 2)
    throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

  var result = (types[rvalue] == lvalue);

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('in_array', function (array, value, options) {

  if (typeof (array) === 'undefined')
    return false;

  if (arguments.length < 3)
    throw new Error("Handlerbars Helper 'in_array' needs 2 parameters");

  var result = (array.indexOf(value) > -1);

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('setIndex', function (value) {
  this.index = Number(value);
});

Handlebars.registerHelper('setVisible', function (value) {
  this.visible = Boolean(value);
});

Handlebars.registerHelper('setMaxBaggageNumber', function(value) {
  this.segmentMaxBaggageNumber = Number(value);
});

Handlebars.registerHelper('setCalculatedPassengerType', function(fflevel, type) {
  var calculatedPassengerType = type;

  if (fflevel == 'ELITE_PLUS') {
    calculatedPassengerType = 'ELITE_PLUS';
  }

  this.calculatedPassengerType = calculatedPassengerType;
});

Handlebars.registerHelper('date', function (value, format) {
  if (typeof format !== 'string') {
    format = 'YYYY-MM-DD';
  }
  var dateMoment = moment(value, format);
  var date = dateMoment.toDate();

  var day = date.getDate();
  var month = lang('dates.monthsNames_' + date.getMonth());
  var year = date.getFullYear();

  return lang('dates.humanDate').replace('{day}', day).replace('{month}', month).replace('{year}', year);
});

Handlebars.registerHelper('shortDate', function (value, format) {
  if (typeof format !== 'string') {
    format = 'YYYY-MM-DD';
  }
  var dateMoment = moment(value, format);
  var date = dateMoment.toDate();

  var day = date.getDate();
  var month = lang('dates.monthsNames_' + date.getMonth()).substr(0, 3);
  var year = date.getFullYear();

  return day + ' ' + month + ' ' + year;
});

Handlebars.registerHelper('datetransers', function(value){
  var dateMoment = moment(value, 'DD-MM-YYYY HH:mm:ss');
  var date = dateMoment.toDate();

  var day = date.getDate();
  var month = lang('dates.monthsNames_' + date.getMonth());
  var year = date.getFullYear();

  return day + " " + month.slice(0, 3).toUpperCase();
});

Handlebars.registerHelper('dateTime', function(value){
  var dateMoment = moment(value, 'DD/MM/YYYY HH:mm:ss');
  var date = dateMoment.toDate();

  var day = date.getDate();
  var month = lang('dates.monthsNames_' + date.getMonth());
  var year = date.getFullYear();
  var hours = date.getHours();
  var minutes = date.getMinutes();

  if (hours < 10) {
    hours = "0" + hours;
  }

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  return lang('dates.humanDateTime').replace('{day}', day).replace('{month}', month).replace('{year}', year).replace('{hours}', hours).replace('{minutes}', minutes);
});

Handlebars.registerHelper('expirationDate', function (value, format) {
  if (typeof format !== 'string') {
    format = 'YYYY-MM-DD';
  }
  var dateMoment = moment(value, format);
  var date = dateMoment.toDate();

  var day = date.getDate();
  var month = ("0" + (date.getMonth() +　1)).slice(-2);
  var year = date.getFullYear();

  return month + '/' + year;
});

Handlebars.registerHelper('loyaltyTierPercentage', function (fromMiles, toMiles, leftMiles) {
  var percentage = 100 - (100 * (leftMiles / (toMiles - fromMiles)));

  return percentage;
});

Handlebars.registerHelper('set', function (options) {
  for (var key in options.hash) {
    this[key] = options.hash[key];
  }
});

Handlebars.registerHelper('setCounter', function (value) {
  handlebarsCounter = Number(value);
  handlebarsCounter2 = Number(value - 1);
});

Handlebars.registerHelper('sumCounter', function (value) {
  this.counter = ++handlebarsCounter;
  this.counter2 = ++handlebarsCounter2;
});

Handlebars.registerHelper('getReservedSeatsBySegment', function (reservedSeats, segment, options) {
  var foundSeat;

  // console.log(reservedSeats);

  if (reservedSeats && reservedSeats.length > 0) {
    $.each(reservedSeats, function (seatIndex, seat) {
      if (seat.segmentId == segment) {
        foundSeat = seat;
        return false;
      }
    });
  }

  return options.fn(foundSeat);
});

Handlebars.registerHelper('getInfoFlight', function (segmentId, journeys, options) {
  var foundSegment;

  // console.log("<-----------------------------------")
  // console.log(journeys);
  // console.log(journeys.ow);
  // console.log(journeys.ow.fragments.length)

  if (journeys.ow && journeys.ow.fragments && journeys.ow.fragments.length > 0) {
    // console.log("PASA AL EACH");
    $.each(journeys.ow.fragments, function (fragmentIndex, fragment) {
      // console.log("recorremos el fragment: " + fragment.identity);
      if (fragment.identity == segmentId) {
        // console.log("ENCONTRADO!!! " + segmentId);
        foundSegment = fragment;
        return false;
      }
    });
  }

  if (journeys.rt && journeys.rt.fragments && journeys.rt.fragments.length > 0) {
    $.each(journeys.rt.fragments, function (fragmentIndex, fragment) {
      if (fragment.identity == segmentId) {
        foundSegment = fragment;
        return false;
      }
    });
  }

  // console.log("----------------------------------->")

  return options.fn(foundSegment);
});


Handlebars.registerHelper('getInfoFlightFromSummary', function (segmentId, journeys, options) {
  var foundSegment;

  // console.log("<-----------------------------------")
  // console.log(journeys);
  // console.log(journeys.ow);
  // console.log(journeys.ow.fragments.length)

  if (journeys && journeys.length > 0) {
    // console.log("PASA AL EACH");
    $.each(journeys, function (fragmentIndex, fragment) {
      // console.log("recorremos el fragment: " + fragment.identity);
      if (fragment.segmentId == segmentId) {
        // console.log("ENCONTRADO!!! " + segmentId);
        foundSegment = fragment;
        return false;
      }
    });
  }

  // console.log("----------------------------------->")

  return options.fn(foundSegment);
});


Handlebars.registerHelper('getFlightClass', function (Journey, index, options) {
  var insideFlightClass;

  if (Journey && Journey[index]) {
    insideFlightClass = Journey[index].flightClass;
  }
  if (typeof (insideFlightClass) == 'undefined') {
    return false;
  }
  return options.fn(insideFlightClass);
});

Handlebars.registerHelper('seatType', function (object, identity, evalValue, options) {
  var returnedType;

  if (object && object[identity]) {
    if (object[identity].seat_type==evalValue) {
      returnedType = options.fn(this);
    } else {
      returnedType = options.inverse(this);
    }
  }
  return returnedType;
});

Handlebars.registerHelper('isSegmentBlocked', function (supportedFlights, segmentId, options) {
  var isBlocked;

  //console.log(segmentId);

  if (supportedFlights && supportedFlights.length > 0) {
    $.each(supportedFlights, function (segmentIndex, segment) {
      if (segment.segmentId == segmentId) {
        isBlocked = segment.blocked;
        return false;
      }
    });
  }

  // console.log("Está bloqueado?")
  // console.log(isBlocked);

  if (isBlocked) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('tolower', function (options) {
  return options.fn(this).toLowerCase();
});

Handlebars.registerHelper('toLowerCase', function(value) {
    if(value) {
        return new Handlebars.SafeString(value.toLowerCase());
    } else {
        return '';
    }
});

Handlebars.registerHelper('sum', function () {
  var sum = 0, v;
  for (var i = 0; i < arguments.length; i++) {
    v = parseFloat(arguments[i]);
    if (!isNaN(v))
      sum += v;
  }
  return sum;
});

Handlebars.registerHelper('lang', function (key1, key2) {
  var key = key1 + '.' + key2;
  return lang(key);
});

Handlebars.registerHelper('langCase', function (key1, key2, options) {
  var key = key1 + '.' + key2;
  var value = lang(key);

  caseTransform = options.hash.caseTransform || "capitalize";

  switch (caseTransform) {
    case 'uppercase':
      value = value.toUpperCase();
      break;
    case 'lowercase':
      value = value.toLowerCase();
      break;
    case 'capitalize':
      value = value.substr(0,1).toUpperCase() + value.substr(1).toLowerCase();
      break;
  }

  return value;
});

Handlebars.registerHelper('processURL', function (key) {
  return getProcessUrl(key);
});

Handlebars.registerHelper('urlCms', function (key1, key2) {

  var key = '';

    if (typeof key2 == 'string') key = key1 + '#' + key2;
    else key = key1;

  return urlCms(key);
});

Handlebars.registerHelper('eval', function (object, options) {

  // console.log("<-----------------------------");
  // console.log("OBJECT INICIAL: ");
  // console.log(object);
  // console.log("OPTIONS key 1: " + options.hash.key);
  // console.log("OPTIONS key 2: " + options.hash.key_2);
  // console.log("OPTIONS key 3: " + options.hash.key_3);


  if (options.hash.key != undefined && object && object[options.hash.key] != undefined) {
    // console.log("PRIMER KEY: " + options.hash.key)
    object = object[options.hash.key];

    if (options.hash.key_2 != undefined && object[options.hash.key_2] != undefined) {
      // console.log("SEGUNDO KEY: " + options.hash.key_2)
      object = object[options.hash.key_2];

      if (options.hash.key_3 != undefined && object[options.hash.key_3] != undefined) {
        // console.log("TERCER KEY: " + options.hash.key_3)
        object = object[options.hash.key_3];

        if (options.hash.key_4 != undefined && object[options.hash.key_4] != undefined) {
          // console.log("CUARTO KEY: " + options.hash.key_4)
          object = object[options.hash.key_4];
        }

      }
    }
  }

  /* Return void string if the result is an object */
  if (typeof object == 'object') {
    object = '';
  }

  // console.log(object);
  // console.log("----------------------------->");

  return object;
});

Handlebars.registerHelper('evalCompare', function (lvalue, rvalue, options) {

  // console.log("<-----------------------------");
  // console.log("LVALUE INICIAL: " + lvalue);
  // console.log("RVALUE INICIAL: " + rvalue);
  // console.log("OPTIONS key 1: " + options.hash.key);
  // console.log("OPTIONS key 2: " + options.hash.key_2);
  // console.log("OPTIONS key 3: " + options.hash.key_3);

  if (lvalue == undefined) {
    return options.inverse(this);
  }


  if (arguments.length < 3)
    throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

  operator = options.hash.operator || "==";

  var operators = {
    '==': function (l, r) {
      return l == r;
    },
    '===': function (l, r) {
      return l === r;
    },
    '!=': function (l, r) {
      return l != r;
    },
    '<': function (l, r) {
      return l < r;
    },
    '>': function (l, r) {
      return l > r;
    },
    '<=': function (l, r) {
      return l <= r;
    },
    '>=': function (l, r) {
      return l >= r;
    },
    'typeof': function (l, r) {
      return typeof l == r;
    }
  }

  if (!operators[operator])
    throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);

  if (options.hash.key != undefined && lvalue && lvalue[options.hash.key] != undefined) {
    // console.log("PRIMER KEY: " + options.hash.key)
    lvalue = lvalue[options.hash.key];

    if (options.hash.key_2 != undefined && lvalue[options.hash.key_2] != undefined) {
      // console.log("SEGUNDO KEY: " + options.hash.key_2)
      lvalue = lvalue[options.hash.key_2];

      if (options.hash.key_3 != undefined && lvalue[options.hash.key_3] != undefined) {
        // console.log("TERCER KEY: " + options.hash.key_3)
        lvalue = lvalue[options.hash.key_3];

        if (options.hash.key_4 != undefined && lvalue[options.hash.key_4] != undefined) {
          // console.log("CUARTO KEY: " + options.hash.key_4)
          lvalue = lvalue[options.hash.key_4];
        }

      }
    }
  }

  // console.log("LVALUE: " + lvalue);
  // console.log("RVALUE: " + rvalue);
  // console.log("----------------------------->");

  var result = operators[operator](lvalue, rvalue);

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});


Handlebars.registerHelper('currency', function(number) {
  return new Handlebars.SafeString(formatCurrency(number));
});

Handlebars.registerHelper('debug', function (object) {
  // console.log(object);
});

Handlebars.registerHelper('printCardFee', function (unitFee, passengers) {
  var total = 0;

  for (var i = 0; i < passengers.length; i++) {

    if (passengers[i].type == 'ADULT' || passengers[i].type == 'CHILD') {
      total = total + 1;
    }
  }

  return total * unitFee;
});

Handlebars.registerHelper("math", function (lvalue, operator, rvalue, options) {
  lvalue = parseFloat(lvalue);
  rvalue = parseFloat(rvalue);

  return {
    "+": lvalue + rvalue,
    "-": lvalue - rvalue,
    "*": lvalue * rvalue,
    "/": lvalue / rvalue,
    "%": lvalue % rvalue
  }[operator];
});

Handlebars.registerHelper("isLoggedIn", function (options) {
  var result = User.isLoggedIn();

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper("isNotLoggedIn", function (options) {
  var result = User.isLoggedIn();

  if (!result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper("hasFrequentFlyers", function (frequentFlyers, options) {
  var result = ((User.isLoggedIn()) && frequentFlyers && frequentFlyers.length > 0) || false;

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper("hasPaymentMethods", function (paymentMethods, options) {
  var result = ((User.isLoggedIn()) && paymentMethods && paymentMethods.length > 0) || false;

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper("hasCreditCards", function (paymentMethods, options) {
  var result;

  if ((User.isLoggedIn()) && paymentMethods && paymentMethods.length > 0) {
    _.each(paymentMethods, function(paymentMethod, index, list) {
      if (paymentMethod.creditCardCodeType.identity !== 'VA') {
        result = true;
        return false;
      }
    });
  }

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper("hasAeCreditCards", function (paymentMethods, options) {
  var result;

  if ((User.isLoggedIn()) && paymentMethods && paymentMethods.length > 0) {
    _.each(paymentMethods, function(paymentMethod, index, list) {
      if (paymentMethod.creditCardCodeType.identity === 'VA') {
        result = true;
        return false;
      }
    });
  }

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper("isSiebelDown", function (options) {
  var result = window.siebelIsDown;

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper("hasNoMiles", function (options) {

  var result = (parseInt(localStorage.getItem('ly_accumulatedMiles')) == 0)

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper("hasMiles", function (options) {

  var result = (parseInt(localStorage.getItem('ly_accumulatedMiles')) != 0)

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('formatNumber', function (number, decimals) {
  return accounting.formatNumber(number, decimals);
});

Handlebars.registerHelper("getLocalStorage", function (key, type) {
  var localStorageValue = localStorage.getItem(key);

  if (localStorageValue && (key == "ly_loyaltyTierType") && (type == 'class'))
  {
    localStorageValue = localStorageValue.toLowerCase();
  }

  if (localStorageValue && (key == "ly_loyaltyTierType") && (type == 'literal'))
  {
    localStorageValue = lang('my_miles.level_title_'+localStorageValue.toLowerCase());
  }

  if (localStorageValue && (key == "ly_accumulatedMiles") && (type == 'currency'))
  {
    localStorageValue =  new Handlebars.SafeString(formatCurrency(localStorageValue));
  }

  return localStorageValue;

});

Handlebars.registerHelper('optionButtonVisible', function (button) {
  return optionButtonVisible(button);
});

Handlebars.registerHelper('getClassVisible', function(position) {
	if(position < 6){
		return 'visible';
	}else if(position == 6){
		return 'visible last';
	}
});

Handlebars.registerHelper('getClassNoDispo', function(price) {
	if(price == null){
		return 'no_dispo';
	}else{
		return '';
	}
});

Handlebars.registerHelper('getResultMinWidth', function(journeysView) {
	  return getResultMinWidth(journeysView);
});

Handlebars.registerHelper('getClassDisclaimer', function(journeys) {
	if(!journeys.rt){
		return 'nounderline';
	}else{
		return '';
	}
});

Handlebars.registerHelper('getNumberCol', function(journeys) {
	if(journeys.rt.length > 7){
		return "col7";
	}else{
		return "col" + journeys.rt.length;
	}
});

Handlebars.registerHelper('cellClass', function(length, index) {
	if(length-1 == index){
		return 'last';
	}else if(length-2 == index){
		return 'before-last';
	}else{
		return '';
	}
});

Handlebars.registerHelper('stringLength', function(lvalue, rvalue, length, options){
  var result = false;

  switch (rvalue) {
    case '<':
      result = (lvalue.length < length) ? true : false;
      break;
    case '>':
      result = (lvalue.length > length) ? true : false;
      break;
    case '<=':
      result = (lvalue.length <= length) ? true : false;
      break;
    case '>=':
      result = (lvalue.length >= length) ? true : false;
      break;
  }

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('checkBusCompatible', function(cabinClass, compatible) {
	if(cabinClass === 'BUS' &&  compatible !== true){
	  return 'busNotCompatible';
	}
	return'';
});

Handlebars.registerHelper('checkSeatsArrays', function(seatsOw, seatsRt, options) {
	for(seat in seatsOw) {
		if(seatsOw[seat].column) {
			return options.fn(this);
		}
	}
	
	for(seat in seatsRt) {
		if(seatsRt[seat].column) {
			return options.fn(this);
		}
	}
	return options.inverse(this);
});

Handlebars.registerHelper("isAccessLoyalty", function (options) {
  var access = window.accessLoyalty;
    if (access) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper("checkMarket", function (code, options) {
  var marketCode = window.market;

  if (marketCode.toUpperCase() == code.toUpperCase()) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper("isNull", function (variable, options) {

	  if (variable == null) {
	    return options.fn(this);
	  } else {
	    return options.inverse(this);
	  }
	});

Handlebars.registerHelper("compareLang", function (variable, options) {
    var locale = window.langCode.toUpperCase();
    if (variable == locale) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

Handlebars.registerHelper("freeBaggageExists", function(baggageSegmentDistribution, direction, options) {
	var exists = false;
	$.each(baggageSegmentDistribution, function(index, baggage) {
		if(baggage.segmentType == direction && baggage.baggageDistribution.free.number > 0) {
			exists = true;
		}
	});
	if(exists) {
		return options.fn(this);
	} else  {
		return options.inverse(this);
	}
});

