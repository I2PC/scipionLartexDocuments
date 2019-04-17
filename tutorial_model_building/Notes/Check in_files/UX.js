/**
Air Europa (UX) script
Dependencies (provided by the website):
- jQuery (as $ global variable)
**/
$(function(){
	var tac = window[window.TravelAudienceConnect];
	var selection = undefined;
	var resultsData = undefined;

	var findFirst = function(array, func) {
		for (var i = 0; i < array.length; i++) {
			if (func(array[i]))
				return array[i];
		};

		return undefined;
	};

	var parseFlight = function(flightNumber) {
	    return {
            code: flightNumber.slice(0, 2),
            number: parseInt(flightNumber.slice(2), 10)
        };
	};

	var buildFlightListNewSite = function(resultData, type) {
	    var recommendations = [];
	    var journeys = resultsData.templateData.journeyList[type];

	    for (var idx in journeys) {
	        var cffDict = journeys[idx].journeyList;

	        for (var fareFamily in cffDict) {
	            var fareOptions = cffDict[fareFamily];
	            for(var fareOptionIndex in fareOptions) {
	                var fareOption = fareOptions[fareOptionIndex];
                    var flightList = fareOption.flightList;
                    var segments = [];

                    for (var flightIdx in flightList) {
                        var flightNumber = flightList[flightIdx].flightNumber;
                        segments.push(parseFlight(flightNumber));
                    }

                    var curReco = {
                        id: fareOption.identify,
                        recommendationId: fareOption.recommendationId,
                        fareFamily: fareOption.fareFamilyCode,
                        flights: segments
                    };
                    recommendations.push(curReco);
	            }
	        }
	    }

        return recommendations;
	};

	var findAll = function(array, func) {
	    var output = [];
		for (var i = 0; i < array.length; i++) {
			if (func(array[i])) {
				output.push(array[i]);
			}
		};

		return output;
	};

	var findAllFlightsNewSite = function(recommendationsArray, tanSegments) {

		var len = tanSegments.length;

		return findAll(recommendationsArray, function(flight) {
			var segments = flight.flights;
			if (segments != undefined && segments.length == len) {
				for(var i=0; i<len; i++) {
					var seg = segments[i];
					var tanSeg = tanSegments[i];
					var tanAirlineCode = tanSeg.flightNumber.slice(0, 2);
					var tanFlightNumber = parseInt(tanSeg.flightNumber.slice(2), 10);

					if (seg.code != tanAirlineCode || seg.number != tanFlightNumber || flight.fareFamily != tanSeg.fareFamily)
						return false;
				}

				return true;
			}

			return false;
		});
	}

	var selectFlightNewSite = function(recommendationId, type, fareFamily, identifier) {
		var selector = ".flight[data-direction='" + type.toLowerCase() + 
                       "'][data-recommendation-id='" + recommendationId + 
                       "'][data-farefamily='" + fareFamily.toLowerCase() + 
                       "'][data-identify='" + identifier + "']";
		console.log(selector);
		var choice = $(selector); //.not(".hidden");

        if (choice.length > 0) {
            choice.click();
            return true;
        } else {
            return false;
        }
	};

	var retrieveSelectedPriceNewSite = function() {
		var priceText = trimElementText(".prices_header_result .price_total span");
		return filterPriceText(priceText);
	};

	var retrieveCurrencyNewSite = function() {
		return trimElementText(".prices_header_result .price_total em");
	};

    var buildFlightsListOther = function(views, type, datastore) {

        // Each row represents a schedule (including all classes)
		views.each(function(i, item) {
			var $item = $(item);

            // First, get the flight numbers
			var segments = [];
			$item.find(".journey-summary").each(function(i,e) {
			    var li = $(e).find("li");
			    if (li.length > 0) {
                    var fnum = $(li[0]).text().split(" ", 1);
                    console.log(fnum);
                    segments.push(parseFlight(fnum));
			    }
			});

			// Then get the various classes
            var recos = $item.find("[data-direction=" + type + "]").not(".hidden");
            recos.each(function(i, reco) {
                var $reco = $(reco);
                var fareFamily = $reco.attr("data-farefamily");
    			var dataId = $reco.attr('data-identify');


                var curReco = datastore[dataId];
                if (curReco === undefined) {
                    curReco = {
                        id: dataId,
                        fareFamily: fareFamily
                    };
                    datastore[dataId] = curReco;
                }

                curReco[type] = segments;
            });
		});
	};

	var buildRecommendationArrayOther = function(typeCode, type) {
        var getViewsRecommendations = function(type) {
            return $(".journeys_table." + type + " .journey_row");
        }

		var recommendations = {};
		buildFlightsListOther(getViewsRecommendations(typeCode), type, recommendations);
		return $.map(recommendations, function(value, index) { return value; });
	};

	var parseExternalCompany = function($item, segments) {
        // Operated by someone else
        var str = $item.find(".externalcompany").text();
        var re = /^UX[0-9]{1,4}/gi;
        var m = re.exec(str);
        if (m !== null && m.length > 0) {
            var flightNumber = m[0];
            segments.push(parseFlight(flightNumber));
        }
	};

	var buildFlightsList = function(views, type, datastore) {

		views.each(function(i, item) {
			var $item = $(item);
			var dataId = $item.attr('data-id');

			var segments = [];

			// Search for the segments
			if ($item.find(".partial_flights").length > 0) {
			    // Connecting flights
			    var $flights = $item.find(".partial_flights .flight");

			    $flights.each(function(i, e) {
                    var $e = $(e);
                    if ($e.find(".externalcompany").length > 0) {
    			        // Operated by someone else
                        parseExternalCompany($e, segments);
                    } else {
                        // Operated by UX
                        var str = $e.find(".subinfotransfer").text();
                        var re = /UX[0-9]{1,4}/gi;
                        var m = re.exec(str);
                        if (m !== null && m.length > 0) {
                            var flightNumber = m[0];
                            segments.push(parseFlight(flightNumber));
                        }
                    }
			    });
			} else {
			    // Direct flight
			    if ($item.find(".code").length > 0) {
			        // Operated by UX
                    $item.find(".code").each(function(i,e){
                        var flightNumber = $(e).text();
                        segments.push(parseFlight(flightNumber));
                    });
			    } else {
			        // Operated by someone else
                    parseExternalCompany($item, segments);
			    }
			}

			var curReco = datastore[dataId];
			if (curReco == undefined) {
				curReco = {
					id: dataId
				};
				datastore[dataId] = curReco;
			}

			curReco[type] = segments;
		});
	};

	var buildRecommendationArray = function(typeCode, type) {
        var getViewsRecommendations = function(type) {
            return $("." + type + " .TUR").not(".disabled");
        }

		var recommendations = {};
		buildFlightsList(getViewsRecommendations(typeCode), type, recommendations);
		return $.map(recommendations, function(value, index) { return value; });
	};

	var findFlight = function(recommendationsArray, type, tanSegments) {

		var len = tanSegments.length;

		return findFirst(recommendationsArray, function(flight) {
			var segments = flight[type];
			if (segments != undefined && segments.length == len) {
				for(var i=0; i<len; i++) {
					var seg = segments[i];
					var tanSeg = tanSegments[i];
					var tanAirlineCode = tanSeg.flightNumber.slice(0, 2);
					var tanFlightNumber = parseInt(tanSeg.flightNumber.slice(2), 10);

					if (seg.code != tanAirlineCode || seg.number != tanFlightNumber)
						return false;
				}

				return true;
			}

			return false;
		});
	}

	var selectFlight = function(dataId, type) {
		var selector = "." + type + " .TUR[data-id='" + dataId + "']";
		var radio = $(selector).not(".disabled");

        if (radio.length > 0) {
            radio.click();
            return true;
        } else {
            return false;
        }
	};

	var currentFilter = function() {
	    var filters = $(".expand_transfers .selected");
	    if (filters.length > 0) {
            var filterName = filters.attr("id");
            var indexFilterValue = ('transfer_').length;
            return parseInt(filterName.substring(indexFilterValue));
        } else {
            return 0;
        }
	};

	var selectFilter = function(maxNumberOfSegments) {
	    console.log("Selecting filter: " + maxNumberOfSegments);
	    var numberOfTransfers = maxNumberOfSegments - 1;
	    $("#transfer_" + numberOfTransfers).click();
	};

	var determineFilter = function(selection, handler) {

        // We need to find the number of segments, in order to activate the corrct filter in Air  Europa's website
        var maxNumberOfSegments = 0;
        var numFlights = selection.flights.length;

        for (var i=0; i<numFlights; i++) {
            var curNumSegments = selection.flights[i].segments.length;
            if (maxNumberOfSegments < curNumSegments) {
                maxNumberOfSegments = curNumSegments;
            }
        }

        var currentMaxSegments = currentFilter() + 1;
        if (maxNumberOfSegments > currentMaxSegments) {
            Hydra.bus.subscribeTo('prerender', 'restart', prerenderHandler, this);
            selectFilter(maxNumberOfSegments);
        } else {
            handler(selection);
        }
    }

	var checkPrice = function(selection, handler) {
        try {
            var foundPrice = true;
            var outboundFlight = undefined;
            var inboundFlight = undefined;
            var message = '';

            var numFlights = selection.flights.length;

            if (numFlights >= 1) {

                var outboundRecommendationsArray = buildRecommendationArray("ow", "outbound");
                outboundFlight = findFlight(outboundRecommendationsArray, "outbound", selection.flights[0].segments);
                if (outboundFlight !== undefined) {
                    foundPrice &= selectFlight(outboundFlight.id, "ow");
                } else {
                    console.debug("outboundFlight not found");
                    message += 'outboundFlight not found';
                    foundPrice = false;
                }

                if (numFlights >= 2) {
                    var inboundRecommendationsArray = buildRecommendationArray("rt", "inbound");

                    inboundFlight = findFlight(inboundRecommendationsArray, "inbound", selection.flights[1].segments);
                    if (inboundFlight !== undefined) {
                        foundPrice &= selectFlight(inboundFlight.id, "rt");
                    } else {
					    console.debug("inboundFlight not found");
                        message += 'inboundFlight not found';
                        foundPrice = false;
                    }
                }
            }

            var airPrice = foundPrice ? retrieveSelectedPrice() : undefined;
            var airCurrency = retrieveCurrency();

            tac('quality', airPrice, airCurrency, message);
            if (foundPrice && tac('get_preferred_landing_page') == 'passenger_details') {
                if (isSelectionBusinessClass(selection)) {
                    $(".price_block.business a")[0].click();
                } else {
                    $(".price_block.economy a")[0].click();
                }
            }
        } catch (e) {
            tac('exception', e);
        }
    };

	var checkPriceNewSite = function(selection) {
        try {
            var foundPrice = true;
            var outboundFlights = [];
            var inboundFlights = [];
            var message = '';

            var numFlights = selection.flights.length;

            if (numFlights >= 1) {
                var outboundRecommendationsArray = buildFlightListNewSite(resultsData, "ow");
                outboundFlights = findAllFlightsNewSite(outboundRecommendationsArray, selection.flights[0].segments);

                if (outboundFlights.length <= 0) {
                    console.debug("outboundFlight not found");
                    message += 'outboundFlight not found';
                    foundPrice = false;
                } else if (numFlights >= 2) {
                    var inboundRecommendationsArray = buildFlightListNewSite(resultsData, "rt");

                    inboundFlights = findAllFlightsNewSite(inboundRecommendationsArray, selection.flights[1].segments);
                    if (inboundFlights.length <= 0) {
					    console.debug("inboundFlight not found");
                        message += 'inboundFlight not found';
                        foundPrice = false;
                    }
                }

                if (outboundFlights.length > 0 && inboundFlights.length > 0) {
                    // Find the recommendation id which matches both ways
                    var recoOW = [], recoRT  = {};
                    for (var k in inboundFlights) {
                        recoRT[inboundFlights[k].recommendationId] = inboundFlights[k];
                    }

                    for (var k in outboundFlights) {
                        var matchingReco = recoRT[outboundFlights[k].recommendationId];
                        if (matchingReco !== undefined) {
                            outboundFlights = [outboundFlights[k]];
                            inboundFlights = [matchingReco];
                            break;
                        }
                    }
                }

                if (outboundFlights.length > 0) {
                    var outboundFlight = outboundFlights[0];
                    var flightSelected = selectFlightNewSite(outboundFlight.recommendationId, "ow", outboundFlight.fareFamily, outboundFlight.id);
					foundPrice &= flightSelected;
					if (!flightSelected) {
                        console.debug("outboundFlight not selected");
                        message += 'outboundFlight not selected ';
					}
                }

                if (inboundFlights.length > 0) {
                    var inboundFlight = inboundFlights[0];
                    var flightSelected = selectFlightNewSite(inboundFlight.recommendationId, "rt", inboundFlight.fareFamily, inboundFlight.id);
                    foundPrice &= flightSelected;
                    if (!flightSelected) {
                        console.debug("inboundFlight not selected");
                        message += 'inboundFlight not selected ';
                    }
                }

            }

            var airPrice = foundPrice ? retrieveSelectedPriceNewSite() : undefined;
            var airCurrency = retrieveCurrencyNewSite();

            tac('quality', airPrice, airCurrency, message);
            if (foundPrice && tac('get_preferred_landing_page') == 'passenger_details') {
                $(".block_booking")[0].click();
            }
        } catch (e) {
            tac('exception', e);
        }
    };

    var isSelectionBusinessClass = function(selection) {
        for (var i in selection.flights) {
            var flight = selection.flights[i];
            for (var j in flight.segments) {
                if (flight.segments[j].fareFamily != "BUSINESS") {
                    return false;
                }
            }
        }
        return true;
    }

	var filterPriceText = function(priceText) {
        return priceText.replace('.','').replace(',', '.');
    };

    var trimElementText = function(selector) {
        return $(selector).text().trim();
    };

	var retrieveSelectedPrice = function() {
		var priceText = trimElementText(".price_block.economy .price span");
		return filterPriceText(priceText);
	};

	var retrieveCurrency = function() {
		return trimElementText(".price_block.economy .price em");
	};

    var retrieveBookingInformation = function() {
        var amount = filterPriceText(trimElementText(".total_price.price_total span"));
        var currency = trimElementText(".total_price.price_total em");
        var pnr = trimElementText(".locator_number dd");
        tac('booking_unconditional', amount, currency, pnr, true);
    };

    var performTask = function(selection, priceCheckHandler) {
        if ($(".process_page_wrapper[data-view=results]").length > 0) {
            // Search page
            console.log("Checking price");

            determineFilter(selection, priceCheckHandler);
        } else if ($(".locator_number dd").length > 0) {
            // Booking confirmation page
            retrieveBookingInformation();
        }
    };

    var prepareTask = function(selection) {
        Hydra.bus.unsubscribeFrom('prerender', 'restart', prerenderHandler);

        // Determine the flavor of the site
        if (resultsData !== undefined) {
            performTask(selection, checkPriceNewSite);
        } else {
            performTask(selection, checkPrice);
        }
    };

	var logInfo = function() {
	    var message = '';
        tac('info', message);
	};

	var prerenderHandler = function() { window.setTimeout(function() { prepareTask(selection); }, 800); };

	var resultDataHandler = function(data) {
	    resultsData = data;
	    window.tacresultdata = data;
	};

	var subscribeToEvents = function() {
        Hydra.bus.subscribeTo('results', 'set_results_data', resultDataHandler, this);
        Hydra.bus.subscribeTo('prerender', 'restart', prerenderHandler, this);
	};

    var getTanselFromCookie = function() {
        $.getJSON("https://track.connect.travelaudience.com/dlv/tansel/?code=UX&callback=?")
          .done(function(json) {
            if (json.tansel != undefined) {
                selection = tac('set_selection', json.tansel);
                subscribeToEvents();
            }
          })
          .fail(function(jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Request Failed: " + err);
        });
    };

	$(document).ready(function() {
		try {
			selection = tac('get_selection');

			if (selection !== undefined) {
			    subscribeToEvents();
            } else {
                // Last chance: try to get it from the track.connect.travelaudience.com cookie via a JSONP call
                getTanselFromCookie();
            }
		} catch (e) {
			tac('exception', e);
		}

        logInfo();
	});
});
