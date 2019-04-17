/* Airports global vars */
window.airports = [];
window.airports['from'] = [];
window.airports['to'] = [];

/* Airports global vars for info flights */
window.airportsInfo = [];
window.airportsInfo['from'] = [];
window.airportsInfo['to'] = [];

/* Airports global vars for checkin flights */
window.airportsCheckin = [];
window.airportsCheckin['from'] = [];

window.getAirportName = function(code) {

  var airportName = '';

  $.each(airports['from'], function(index, airport) {
    if (airport.code == code) {
      airportName = airport.description;
    }
  });

  return airportName;
}

window.getData = function(code) {

  var airportFound;

  $.each(airports['from'], function(index, airport) {
    if (airport.code == code) {
      airportFound = airport;
    }
  });

  return airportFound;
}