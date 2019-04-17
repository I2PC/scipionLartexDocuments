window.getServiceURL = function (object) {
  var hostReference = eval('AirEuropaConfig.service.' + object + '.host');
  var url = eval('AirEuropaConfig.service.' + object + '.url');
  var host = eval('AirEuropaConfig.hosts.' + hostReference);
  var proxy = eval('AirEuropaConfig.service.' + object + '.useProxy');
  var altProxy = eval('AirEuropaConfig.service.' + object + '.altProxy');
  var serviceURL;

  if (proxy) {
    if (altProxy) {
      serviceURL = AirEuropaConfig.proxyUrlAlt + host + url;
    }
    else {
      serviceURL = AirEuropaConfig.proxyUrl + host + url;
    }
  }
  else {
    serviceURL = host + url;
  }
  return serviceURL;
};

window.getPostURL = function (object) {
  var hostReference = eval('AirEuropaConfig.post.' + object + '.host');
  var url = eval('AirEuropaConfig.post.' + object + '.url');
  var host = eval('AirEuropaConfig.hosts.' + hostReference);
  var proxy = eval('AirEuropaConfig.post.' + object + '.useProxy');
  var serviceURL;

  if (proxy) {
    serviceURL = AirEuropaConfig.proxyUrl + host + url;
  }
  else {
    serviceURL = host + url;
  }
  return serviceURL;
};

window.getURLParameter = function (param) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');

  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] === param) {
      return sParameterName[1];
    }
  }
};