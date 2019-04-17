/* Application config */

var AirEuropaConfig = {
  activeLanguage: langCode,
  /* Debug mode for Hydra */

  debugMode: false,
  /* Default params for ajax calls */

  ajax: {
    defaultParams: {
      locale: langCode.toUpperCase(),
      marketCode: market.toUpperCase(),
      application: 'W',
      operatingSystem: 'WEB',
      versionNumber: 1
    }
  },
  /* Default time for warning message after blocking (in minutes) */

  warningBookingLimit: 15,
  warningBookingLimitCkin: 0,
  // marketIp: marketIp,

  channel: 3,
  zonesAvailable: ['NAC', 'EUR', 'AME', 'AMN', 'AMS', 'CAR', 'AFR', 'ASI'], /* Ordered by relevance */

  /* Default view for search results */
  results: {
    defaultResultsView: 'hour', /* price|hour|matriz */
    defaultRemoveNotDirectFlights : true,
    buttonByhourVisible : true,
    buttonBypriceVisible : false,
    buttonBymatrizVisible : true
  },
  /* Hosts */

  hosts: {
    host_1: '',
    host_2: ''
  },
  /* Proxy configuration */

  proxyUrl: '/_fake/proxy_2.php?url=',
  /* Service URLs */

  service: {
    /* Tokens service */

    tokens: {
      auth: {
        host: 'host_1',
        url: '/aireuropaauth/oauth/token',
        useProxy: false
      }
    },

    /* Twitter services */

    twitter:{
      login_twitter_oauth:{
        host: 'host_1',
        url: portalhref + '/rest/twitter-login/{step}?returnTo={returnTo}',
        useProxy: false 
      },
      follow_us_twitter:{
        host: 'host_1',
        url: portalhref + '/rest/twitter-follow-us',
        useProxy: false
      },
      following_us_twitter:{
        host: 'host_1',
        url: portalhref + '/rest/twitter-following-us',
        useProxy: false
      },
      notifications_twitter:{
        host: 'host_1',
        url: portalhref + '/rest/twitter-notifications/{flightCode}/{departureAirport}/{departureDate}/{arrivalAirport}/{arrivalDate}',
        useProxy: false 
      }
    },

    /* Account services */

    account: {
      /* get the token */
      login_oauth: {
        host: 'host_1',
        url: '/aireuropaauth/oauth/token',
        useProxy: false
      },
      login_user: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/extended',
        useProxy: false
      },
      login_user_extend: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/extend/confirmation',
        useProxy: false
      },
      login_session: {/* Get literals list */
        host: 'host_1',
        url: portalhref + '/rest/loginSuma?login={login}',
        useProxy: false
      },
      login_session_info: {/* Get literals list */
        host: 'host_1',
        url: portalhref + '/rest/loginSuma/info',
        useProxy: false
      },
      register: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/create',
        useProxy: false
      },
      /* Update user mobile */
      update_user: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/{userId}/migrate',
        useProxy: false
      },
      /* Get the countries in the register */
      countries: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/countries',
        useProxy: false
      },
      /* Get the countries in the register */
      preference_airport: {
        host: 'host_1',        
        url: '/aireuropaservice/rest/v3_0/airports/departure',
        useProxy: false
      },
      /* Get the documents in the register */
      document_type: {
        host: 'host_1',
        url:'/aireuropaservice/rest/v3_0/documentation/{preconditionDocsType}',
        useProxy: false
      },
      /* Put user loyalty confirmation */
      confirm_loyalty_user: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/confirm/{token}',
        // url: '/_fake/ajax/checkout/checkout_session_5_confirm.json',
        useProxy: false
      },
      /* Put user loyalty confirmation */
      confirm_loyalty_user_email: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/confirm/{token}/email',
        useProxy: false
      },
      /* Get user loyalty new password */
      recover_loyalty_user: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/password-recovery?email={email}',
        useProxy: false
      },
      /* Put user loyalty new password */
      restore_password_loyalty_user: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/password-recovery/{token}',
        useProxy: false
      },
      conditions_user: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/{userId}/condition/{conditionType}/client/{versionNumber}/{operatingSystem}',
        useProxy: false
      },
      accept_conditions_user: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/{userId}/condition/{conditionType}/client/{versionNumber}/{operatingSystem}',
        useProxy: false
      },
      confirm_unsuscribe:{
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/delete/confirm/{token}',
        useProxy: false
      },
      loyalty_status: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/status',
        useProxy: false
      },
      /* register the user distnace form submit */
      register_distnace_user: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/confirm/provider/{token}',
        useProxy: false
      },
      register_siebel_user: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/activate',
        useProxy: false
      }

    },
    /* Config */

    config: {
      defaultConfig: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/configuration/default',
        useProxy: false
      }
    },
    /* Airport autocomplete */

    airport: {
      origin: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/airports/departure',
        useProxy: false
      },
      destiny: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/airports/departure/{code}',
        useProxy: false
      },
      nearest: {
        host: 'host_1',
        url: '/' + productName + '/' + langCode + '/rest/secure/airport/nearest?latitude={latitude}&longitude={longitude}',
        useProxy: false
      }
    },
    /* Literals URLs */

    literals: {
      get_list: {/* Get literals list */
        host: 'host_1',
        url: portalhref + '/rest/secure/literalsjs',
        useProxy: false
      },
      get_anchors: {/* Get literals list */
        host: 'host_1',
        url: portalhref + '/rest/secure/literalsjs',
        useProxy: false
      },
      get_anchorsCms: {/* Get literals list */
        host: 'host_1',
        url: portalhref + '/rest/secure/urlsTranslateCms',
        useProxy: false
      }
    },
    /* Search results */

    results: {
      flights: {
        host: 'host_1',
        url: '/aireuropaavailability/rest/v3_0/checkout/availability',
        useProxy: false,
      },
      flights_provider: {
        host: 'host_1',
        url: '/aireuropaavailability/rest/v3_0/checkout/provider/{channel}/availability',
        useProxy: false,
      },
      USA_flights: {
        host: 'host_1',
        url: '/'+ productName +'/'+ langCode +'/rest/availability/search_new',
        useProxy: false,
      },
      interislas: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/joints/{departureCode}/{arrivalCode}/assistance',
        useProxy: false,
      },
      booking_block: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v2_6/checkout/{sessionId}/block?departureCode={departureCode}&arrivalCode={arrivalCode}&channel={channel}&recommendationId={recommendationId}&petitionId={petitionId}&currencyCode={currencyCode}',
        // url: '/_fake/ajax/checkout.json',
        useProxy: false
      },
      booking_block_usa: {
          host: 'host_1',
          url: '/aireuropaservice/rest/v3_0/checkout/{sessionId}/block?departure={departureCode}&arrival={arrivalCode}&channel={channel}&recommendationId={recommendationId}&availabilityId={petitionId}&currencyCode={currencyCode}',
          // url: '/_fake/ajax/checkout.json',
          useProxy: false
        },

      disable_departure_dates: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/availability/route/calendar/{departureAirport}/{arrivalAirport}',
        useProxy: false
      },

      disable_arrival_dates: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/availability/route/calendar/{departureAirport}/{arrivalAirport}/?date={departureDate}',
        useProxy: false
      }
    },
    /* Checkout services */

    checkout: {
      /* Session */
      session: {
        host: 'host_1',
        url: '/' + productName + '/' + langCode + '/rest/checkout-new',
        useProxy: false
      },
      /* General */
      itemization: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/{sessionId}/itemization?stepType={stepType}',
        useProxy: false
      },
      /* Passengers screen */
      communities: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/community/getCommunities',
        useProxy: false
      },
      countries: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/countries',
        useProxy: false
      },
      document_type: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/documentation/{preconditionDocsType}',
        useProxy: false
      },
      frequent_flyer: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/typeFF/getTypeProgramFrequentFlyer',
        useProxy: false
      },
      preference_airport: {
        host: 'host_1',        
        url: '/aireuropaservice/rest/v3_0/airports/departure',
        useProxy: false
      },
      large_family: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/categories/largefamily',
        useProxy: false
      },
      towns: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/{sessionId}/towns',
        useProxy: false
      },
      frequent_flyer_check: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/user/frequent-passengers/check?surname={surname}&frequentFlyerIdentity={frequentFlyerIdentity}&frequentFlyerProgram={frequentFlyerProgram}',
        useProxy: false
      },
      add_passengers: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/{sessionId}/passengers',
        useProxy: false
      },
      /* Extras screen */
      ancillaries: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/{sessionId}/ancillaries',
        // url: '/_fake/ajax/checkout/ancillaries_new_2.json',
        useProxy: false
      },
      post_ancillaries: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/{sessionId}/ancillaries',
        useProxy: false
      },
      plane: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/{sessionId}/seatmap/{segment}/{passenger}',
        useProxy: false
      },
      plane_premium_economy: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/{sessionId}/premium/seatmap/{segment}/{passenger}',
        useProxy: false
      },
      select_seat: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/{sessionId}/seatmap/{segment}/{passenger}/seat/{number}/{column}',
        useProxy: false
      },
      select_premium_seat: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/{sessionId}/seatmap/{segment}/{passenger}/premium/seat/{number}/{column}',
        useProxy: false
      },
      remove_seats: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/{sessionId}/aircraft/seatmap/{segment}/{passenger}/seat',
        useProxy: false
      },
      remove_premium_seats: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/{sessionId}/aircraft/seatmap/{segment}/{passenger}/premium/seat',
        useProxy: false
      },
      payment_methods: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/{sessionId}/payment/finalice/methods',
//        url: '/_fake/ajax/checkout/payment_methods_FF.json',
        //url: '/_fake/ajax/checkout/payment_methods_promo_paypal.json',
        //url: '/_fake/ajax/checkout/payment_methods_visa_suma.json',
        useProxy: false
      },
      /* Payment screen */
      credit_card_check: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/payment/card/match',
        useProxy: false
      },
      login_myae: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/{sessionId}/myaireuropa/login',
        useProxy: false
      },
      promo_code: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/{sessionId}/promotion?code={promoCode}&paymentMethodType={paymentMethodType}',
        useProxy: false
      },
//      post_payment: {
//        host: 'host_1',
//        url: '/aireuropaservice/rest/v2_3/checkout/{sessionId}/payment/calculate',
//        useProxy: false
//      },

      /* Finish screen */
      payment: {
        host: 'host_1',
        url:   '/aireuropaservice/rest/v3_0/checkout/{sessionId}/payment/finalize',
        //url:   '/_fake/ajax/checkout/payment_finalize_visa_suma.json',
//        url:   '/_fake/ajax/checkout/payment_finalize_FF.json',
        useProxy: false
      },
      /* Call me back screen */
      callmeback: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/{sessionId}/payment/callmeback?currencyCode={currencyCode}',
        useProxy: false
      },
      /* Insert hotel nights */
      hotel_nights: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/confirm/{bookingId}/nightsHotel/{nightsHotels}',
        useProxy: false
      },
      banner_europcar: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/{sessionId}/partner/europcar',
        useProxy: false
      }

    },
    /* Checkin services */

    checkin: {
      /* Session */
      session : {
        host : 'host_1',
        url : '/' + productName + '/' + langCode + '/rest/checkin',
        useProxy : false
      },
      origin : {
        host : 'host_1',
        url : '/aireuropacheckin/rest/v2_5/checkin/airports/departure',
        useProxy : false
      },
      flights : {
        host : 'host_1',
        url : '/aireuropacheckin/rest/v2_5/checkin/{locator}/{surname}',
        useProxy : false
      },
      flights_provider : {
        host : 'host_1',
        url : '/aireuropacheckin/rest/v2_5/checkin/{locator}/{surname}/{channel}',
        useProxy : false
      },
      frequent_flyer_check : {
        host : 'host_1',
        url : '/aireuropacheckin/rest/v2_5/checkin/user/frequent-passengers/check?surname={surname}&frequentFlyerIdentity={frequentFlyerIdentity}&frequentFlyerProgram={frequentFlyerProgram}',
        useProxy : false
      },
      select_seat : {
        host : 'host_1',
        url : '/aireuropacheckin/rest/v2_5/checkin/{checkinId}/seat',
        useProxy : false
      },
      re_select_seat : {
        host : 'host_1',
        url : '/aireuropacheckin/rest/v2_5/checkin/{checkinId}/seat',
        useProxy : false
      },
      countries : {
        host : 'host_1',
        url : '/aireuropaservice/rest/v3_0/countries',
        useProxy : false
      },
      frequent_flyer : {
        host : 'host_1',
        url : '/aireuropaservice/rest/v3_0/typeFF/getTypeProgramFrequentFlyer',
        useProxy : false
      },
      document_type: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/documentation/{preconditionDocsType}',
        useProxy: false
      },
      aircraft_map : {
        host : 'host_1',
        url : '/aireuropacheckin/rest/v2_5/checkin/{checkinId}/aircraft/seatmap',
        useProxy : false
      },
      update_passengers : {
        host : 'host_1',
        url : '/aireuropacheckin/rest/v2_5/checkin/{checkinId}/passengers',
        useProxy : false
      },
      confirm_checkin : {
        host : 'host_1',
        url: '/aireuropacheckin/rest/v2_5/checkin/{checkinId}/confirmation',
        useProxy: false
      },
      checkin_qrcode: {
        host: 'host_1',
        url: '/aireuropacheckin/rest/v2_5/checkin/qr/{qrCode}',
        useProxy: false
      },
      checkin_share: {
        host: 'host_1',
        url: '/aireuropacheckin/rest/v2_5/checkin/{checkinId}/boardingpass/sharing',
        useProxy: false
      },
      finish_checkin: {
        host: 'host_1',
        url: '/aireuropacheckin/rest/v2_5/checkin/{checkinId}/finish',
        useProxy: false
      },
      cancel_checkin: {
        host: 'host_1',
        url: '/aireuropacheckin/rest/v2_5/checkin/{checkinId}/cancelation',
        useProxy: false
      },
      address_countries: {
        host: 'host_1',
        url: '/aireuropacheckin/rest/v2_5/checkin/{country}/states',
        useProxy: false
      },
      boardingpassticket: {
        host: 'host_1',
        url: '/aireuropacheckin/rest/v2_5/checkin/{checkinId}/boardingpassticket',
        useProxy: false
      },
      bookings: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/user/{userId}/checkin/bookings',
        useProxy: false
      },
      boardingpass: {
        host: 'host_1',
        url: '/aireuropacheckin/rest/v2_5/checkin/{checkinId}/ticket/{ticket}/boardingpass/pdf',
        useProxy: false
      },
      boardingpassPasbook: {
        host: 'host_1',
        url: '/aireuropacheckin/rest/v2_5/checkin/{checkinId}/ticket/{ticket}/boardingpass/passbook/{passengerId}',
        useProxy: false
      }
    },
    /* Ancillaries services */

    ancillaries: {
      session: {
        host: 'host_1',
        url: '/' + productName + '/' + langCode + '/rest/checkout/ancillaries',
        useProxy: false
      },
      luggage: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/extras/baggage/{locator}/{surname}',
           // url: '/_fake/ajax/ancillaries/flight_norwegian.json',
        useProxy: false
      },
      luggage_provider: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/extras/baggage/{locator}/{surname}/{channel}',
        useProxy: false
      },
      seats: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/extras/seat/{locator}/{surname}',
        useProxy: false
      },
      seats_provider: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/extras/seat/{locator}/{surname}/{channel}',
        useProxy: false
      },
      premium_seats: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/extras/premium/seat/{locator}/{surname}',
        useProxy: false
      },
      post_ancillaries: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/extras/{sessionId}/baggage',
        useProxy: false
      },
      plane: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/extras/{sessionId}/aircraft/seatmap/{segment}/{passenger}',
        useProxy: false
      },
      premium_plane: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/extras/{sessionId}/aircraft/premium/seatmap/{segment}/{passenger}',
        useProxy: false
      },
      select_seat: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/extras/{sessionId}/aircraft/{segment}/{passenger}/seat/{number}/{column}',
        useProxy: false
      },
      select_premium_seat: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/extras/{sessionId}/aircraft/{segment}/{passenger}/premium/seat/{number}/{column}',
        useProxy: false
      },
      remove_seats: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/extras/{sessionId}/aircraft/{segment}/{passenger}/seat',
        useProxy: false
      },
      remove_premium_seats: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/extras/{sessionId}/aircraft/{segment}/{passenger}/premium/seat',
        useProxy: false
      },
      countries: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/countries',
        useProxy: false
      },
      document_type: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/documentation/{preconditionDocsType}',
        useProxy: false
      },
      luggage_payment_methods: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/extras/{sessionId}/baggage/payment/methods',
        useProxy: false
      },
      seat_payment_methods: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/extras/{sessionId}/seat/payment/methods',
        useProxy: false
      },
      premium_seat_payment_methods: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/extras/{sessionId}/premium/seat/payment/methods',
        useProxy: false
      },
      luggage_payment: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/extras/{sessionId}/baggage/confirm',
        useProxy: false
      },
      seat_payment: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/extras/{sessionId}/seat/confirm',
        useProxy: false
      },
      premium_seat_payment: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/extras/{sessionId}/premium/seat/confirm',
        useProxy: false
      }
    },
    /* Info flight services */

    info: {
      origin: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/infoFlight/airports/departure',
        useProxy: false
      },
      destiny: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/infoFlight/airports/departure/{code}',
        useProxy: false
      },
      route: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/infoFlight/route/{from}/{to}/status',
        useProxy: false
      },
      flight_number: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/infoFlight/flights/{flight}/status',
        useProxy: false
      }
    },
    /* Helpdesk services */

    helpdesk: {
      phone: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/helpDesk/phoneNumber',
        useProxy: false
      }
    },
    /* Inner services */

    inner: {
      master_services: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/customer/claim/masters',
        useProxy: false
      },
      countries: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/countries',
        useProxy: false
      },
      country_region: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/customer/claim/{countryCode}/provinces',
        useProxy: false
      },
      document_type_invoice: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/invoice/document-types',
        useProxy: false
      },
      region: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/invoice/provinces',
        useProxy: false
      },
      departure_airports: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/airports/departure',
        useProxy: false
      },
      arrival_airports: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/airports/arrival',
        useProxy: false
      },
      groups_services: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/groups',
        useProxy: false
      },
      contact_request: {/* Post to send a contact request */
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/customer/claim',
        useProxy: false
      },
      contact_confirm: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/customer/claim/{claimId}/session/{idsession}/confirm',
        useProxy: false
      },
      invoice_request: {/* Post to send a contact request */
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/invoice/request',
        useProxy: false
      },
      group_request: {/* Post to send a contact request */
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/checkout/groups/request',
        useProxy: false
      },
      frequent_flyer: {
        host : 'host_1',
        url : '/aireuropaservice/rest/v3_0/typeFF/getTypeProgramFrequentFlyer',
        useProxy : false
      },
      frequent_flyer_level: {
        host : 'host_1',
        url : '/aireuropaservice/rest/v3_0/customer/claim/levels/ff-type/{frequentFlyerTypeCode}',
        useProxy : false
      },
      frequent_flyer_level_suma: {
        host : 'host_1',
        url : '/aireuropaservice/rest/v3_0/loyalty/tiers',
        useProxy : false
      }
    },
    /* Loyalty Bookings services */

    loyalty_bookings: {
      list: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/user/{userId}/bookings',
        useProxy: false
      },
      checkin_list: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/user/{userId}/checkin/bookings',
        useProxy: false
      },
      detail: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/user/{userId}/booking/{bookingId}/summary',
        // url: '/_fake/ajax/loyalty_bookings/fake_misReservas-4237.json',
        useProxy: false
      },
      add_booking: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/user/{userId}/{surname}/booking/{locator}',
        useProxy: false
      },
      change_status: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/booking/visualization',
        useProxy: false
      },
      cards: {
        host: 'host_1',
        url: '/aireuropacheckin/rest/v2_5/checkin/boarding-pass/{locator}',
        useProxy: false
      },
      qrcode: {
        host: 'host_1',
        url: '/aireuropacheckin/rest/v2_5/checkin/qr/{qrCode}',
        useProxy: false
      },
      boardingpassticket: {
        host: 'host_1',
        url: '/aireuropacheckin/rest/v2_5/checkin/{userId}/{locator}/boardingpassticket',
        useProxy: false
      },
      boardingpassticketpdf: {
        host: 'host_1',
        url: '/aireuropacheckin/rest/v2_5/checkin/locata/{locator}/ticket/{ticket}/boardingpass/pdf',
        useProxy: false
      },
      booking_share: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/booking/{bookingId}/sharing',
        useProxy: false
      },
      booking_cards_share: {
        host: 'host_1',
        url: '/aireuropacheckin/rest/v2_5/boardingpass/sharing',
        useProxy: false
      },
      refresh: {
    	  host: 'host_1',
    	  url: '/aireuropaservice/rest/v2_0/user/{userId}/{surname}/booking/{locator}',
    	  useProxy: false
      }
    },
    /* Loyalty my data, info services */

    loyalty_info: {
      add_frequent_passengers: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/user/{userId}/frequent-passengers',
        useProxy: false
      },
      large_family: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/categories/largefamily',
        useProxy: false
      },
      communities: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/community/getCommunities',
        useProxy: false
      },
      country_region: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/country/{countryCode}/states',
        useProxy: false
      },
      countries: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/countries',
        useProxy: false
      },
      delete_frequent_passengers: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/user/{userId}/frequent-passengers/{passengerId}',
        useProxy: false
      },
      document_type: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/documentation/{preconditionDocsType}',
        useProxy: false
      },
      frequent_passengers: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/user/{userId}/frequent-passengers',
        useProxy: false
      },
      preferences: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/extended',
        useProxy: false
      },
      towns: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/town/getTowns',
        useProxy: false
      },
      frequent_flyer: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/tiers',
        useProxy: false
      },
      preference_airport: {
        host: 'host_1',        
        url: '/aireuropaservice/rest/v3_0/airports/departure',
        useProxy: false
      },
      get_user: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/extended',
        useProxy: false
      },
      unsubscribe_user: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/delete/{frequentFlyerIdentity}',
        useProxy: false
      },
      unsubscribe_newsletter:{
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/{userId}/newsletter/unsubscribe',
        useProxy: false
      },
      update_preferences: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/{userId}/preferences',
        useProxy: false
      },
      update_user: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/{userId}/update',
        useProxy: false
      },
      update_frequent_passengers: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/user/{userId}/frequent-passengers/{passengerId}',
        useProxy: false
      },
      payment_methods: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/payment/creditcard/types/active',
        useProxy: false
      },
      user_payment_methods: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/{userId}/cards',
        useProxy: false
      },
      save_payment_method: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/{userId}/card',
        useProxy: false
      },
      delete_payment_method: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/{userId}/card/{hashId}',
        useProxy: false
      },
      change_password: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/{userId}/changePassword',
        useProxy: false
      },
      reasons_unsuscribe:{
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/unsubscribe/reasons',
        useProxy: false
      },
      languages:{
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/language/loyalty/languages',
        useProxy: false
      }
    },
    /* Loyalty my card services */

    loyalty_card: {
      countries: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/countries',
        useProxy: false
      },
      country_region : {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/country/{countryCode}/states',
        useProxy: false
      },
      request_physical_card: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/{userId}/physical/card',
        useProxy: false
      },
      request_passbook_card: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/v1/pass/sharing',
        useProxy: false
      },
      user_miles: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/{userId}/miles',
        useProxy: false
      },
      print_card:{
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/{userId}/card',
        useProxy: false
      }
    },
    /* Loyalty miles services */

    loyalty_miles: {
      airlines: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/retroClaim/companies',
        useProxy: false
      },
      loyalty_tiers: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/tiers',
        useProxy: false
      },
      miles_partners: {
        host: 'host_1',
        url: '', /* @todo */
        useProxy: false
      },
      user_miles: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/{userId}/miles',
        useProxy: false
      },
      user_operations: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/{userId}/operations',
        useProxy: false
      },
      departure_airports: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/airports/departure',
        useProxy: false
      },
      arrival_airports: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/airports/arrival',
        useProxy: false
      },
      user_operations_report_pdf: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/{userId}/operations/report/pdf',
        useProxy: false
      },
      user_operations_report: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/{userId}/operations/report',
        useProxy: false
      },
      transfer_miles: {
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/miles/{frequentFlyerIdentity}/transfer',
        useProxy: false
      },
      claim_miles:{
        host: 'host_1',
        url: '/aireuropaservice/rest/v3_0/loyalty/user/{frequentFlyerIdentity}/claim/miles',
        useProxy: false
      }
    },
    /* Partners services */
    partners: {
      partners: {
        host: 'host_1',
        url: '/aireuropapartners/rest/v1_0/users/{frequentFlyerIdentity}/partners',
        useProxy: false
      },
      redeem: {
        host: 'host_1',
        url: '/aireuropapartners/rest/v1_0/users/{frequentFlyerIdentity}/redemption/{virtualResourceId}',
        useProxy: false
      },
      virtualResource: {
        host: 'host_1',
        url: '/aireuropapartners/rest/v1_0/users/{frequentFlyerIdentity}/redemption',
        useProxy: false
      },
      token: {
        host: 'host_1',
        url: '/aireuropapartners/rest/v1_0/users/{frequentFlyerIdentity}/partners/token',
        useProxy: false
      },
      transaction: {
        host: 'host_1',
        url: '/aireuropapartners/rest/v1_0/users/{frequentFlyerIdentity}/partners/{partner}/transaction/{productType}',
        useProxy: false
      },
      europcarFormUrl: {
        host: 'host_1',
        //url: 'https://europcar.centprod.com/aireuropa_test/DoLogin',
        url: 'https://www.drivemymiles.com/aireuropa/DoLogin',
        useProxy: false
      }
    },

    /*Pmr services*/
    pmr_form: {
      session: {
        host: 'host_1',
        url: '/' + productName + '/' + langCode + '/rest/checkout/pmr',
        useProxy: false
      },
      passengers : {
        host : 'host_1',
        url : '/aireuropaservice/rest/v3_0/checkout/{bookingId}/assistance',
        useProxy : false
      },
      passengers_external : {
        host : 'host_1',
        url : '/aireuropaservice/rest/v3_0/extras/assistance/{locator}/{surname}',
        // url: '/_fake/ajax/pmr/info_booking.json',
        useProxy : false
      },
      list_assistance: {
        host : 'host_1',
        url : '/aireuropaservice/rest/v3_0/assistance/types',
        // url: '/_fake/ajax/pmr/types.json',
        useProxy : false
      },
      assistance_type: {
        host : 'host_1',
        url : '/aireuropaservice/rest/v3_0/assistance/types/{assistanceType}',
        // url: '/_fake/ajax/pmr/types/{assistanceType}.json',
        useProxy : false
      },
      asistance_type_wheelchair:{
        host : 'host_1',
        url : '/aireuropaservice/rest/v3_0/assistance/types/OWN_WHEELCHAIR',
        useProxy : false
      },
      asistance_type_petcs:{
        host : 'host_1',
        url : '/aireuropaservice/rest/v3_0/assistance/petcs',
        // url: '/_fake/ajax/pmr/petcs.json',
        useProxy : false
      },
      confirm : {
        host : 'host_1',
        url : '/aireuropaservice/rest/v3_0/checkout/{bookingId}/assistance',
        useProxy : false
      },
      confirm_external : {
        host : 'host_1',
        url : '/aireuropaservice/rest/v3_0/extras/assistance/{bookingId}',
        // url : '/aireuropaservice/rest/v3_0/extras/assistance/99900000000000000000000002053641',
        useProxy : false
      }
    },
    
    /*H72 services*/
    h72_payment: {
      session: {
        host: 'host_1',
        url: '/' + productName + '/' + langCode + '/rest/checkout/h72',
        useProxy: false
      },
      booking : {
        host : 'host_1',
        url : '/aireuropaservice/rest/v3_0/external/payment/pending/{locator}/{surname}',
        //url: '/_fake/ajax/h72/booking.json',
        useProxy : false
      },
      payment : {
        host : 'host_1',
        url : '/aireuropaservice/rest/v3_0/external/payment/pending/{bookingId}/methods',
        //url: '/_fake/ajax/h72/payment.json',
        useProxy : false
      },
      finalize : {
        host : 'host_1',
        url : '/aireuropaservice/rest/v3_0/external/payment/pending/{bookingId}/finalize',
        //url: '/_fake/ajax/h72/finalize.json',
        useProxy : false
      }
    }
  },

  /* Post URLs */
  post: {
    newsletter: {/* Post emails from newsletter form */
      host: 'host_1',
      url: '/_fake/ajax/home/post_newsletter.json',
      useProxy: false
    },
    results: {/* Post results values selected by users to have them inside the checkout */
      host: 'host_1',
      url: '/' + productName + '/' + langCode + '/rest/checkout-new/first',
      useProxy: false
    },
    USA_results: {
      host: 'host_1',
      url: '/' + productName + '/' + langCode + '/rest/checkout-new/first-usa',
      useProxy: false
    },
    checkout: {/* Post checkout_session */
      host: 'host_1',
      url: '/' + productName + '/' + langCode + '/rest/checkout-new',
      useProxy: false
    },
    checkin: {/* Post checkin form values */
      host: 'host_1',
      url: '/' + productName + '/' + langCode + '/rest/checkin',
      useProxy: false
    },
    ancillaries_luggage: {/* Post ancillary luggage session */
      host: 'host_1',
      url: '/' + productName + '/' + langCode + '/rest/checkout/ancillaries/luggage',
      useProxy: false
    },
    ancillaries_seats: {/* Post ancillary seats session */
      host: 'host_1',
      url: '/' + productName + '/' + langCode + '/rest/checkout/ancillaries/seats',
      useProxy: false
    },
    ancillaries_premium: {/* Post ancillary seats Premium Economy session */
      host: 'host_1',
      url: '/' + productName + '/' + langCode + '/rest/checkout/ancillaries/seats',
      useProxy: false
    },
    pmr_form : {/* Post Pmr Form session */
      host: 'host_1',
      url: '/' + productName + '/' + langCode + '/rest/checkout/pmr',
      useProxy: false
    },
    h72_payment : {/* Post H72 Form session */
      host: 'host_1',
      url: '/' + productName + '/' + langCode + '/rest/checkout/h72',
      useProxy: false
    }
  },
  /* Templates */
  templates: {
    airport: {
      routes: '/airstatic/assets/tpl/airports/routes.html'
    },
    search: {
      social_rate: '/airstatic/assets/tpl/search/social_rate.html'
    },
    results: {
      structure: '/airstatic/assets/tpl/results/results.html',
      by_price: '/airstatic/assets/tpl/results/by_price_new.html',
      by_hour: '/airstatic/assets/tpl/results/by_hour_new.html',
      by_matriz: '/airstatic/assets/tpl/results/by_matriz_new.html',
      farefamily: '/airstatic/assets/tpl/results/farefamily_new.html',
      flight_detail: '/airstatic/assets/tpl/results/flight_detail.html'
    },
    checkout: {
      structure: '/airstatic/assets/tpl/checkout/checkout.html',
      passengers: '/airstatic/assets/tpl/checkout/passengers_new.html',
      extras: '/airstatic/assets/tpl/checkout/extras.html',
      payment: '/airstatic/assets/tpl/checkout/payment.html',
      finish: '/airstatic/assets/tpl/checkout/finish.html',
      confirm: '/airstatic/assets/tpl/checkout/confirm.html',
      plane: '/airstatic/assets/tpl/checkout/plane.html',
      callmeback: '/airstatic/assets/tpl/checkout/callmeback.html',
      add_passenger_error: '/airstatic/assets/tpl/checkout/add_passenger_error.html',
      sara_error: '/airstatic/assets/tpl/checkout/sara_error.html',
      login_loyalty: '/airstatic/assets/tpl/checkout/login_loyalty.html',
      banner_fijo_europcar: '/airstatic/assets/tpl/checkout/banner_fijo_europcar.html',
      banner_dinamico_europcar: '/airstatic/assets/tpl/checkout/banner_dinamico_europcar.html'
    },
    checkin: {
      structure: '/airstatic/assets/tpl/checkin/checkin.html',
      flights: '/airstatic/assets/tpl/checkin/flights.html',
      passengers: '/airstatic/assets/tpl/checkin/passengers.html',
      plane: '/airstatic/assets/tpl/checkin/plane.html',
      cards: '/airstatic/assets/tpl/checkin/cards.html',
      dangerousgoods: '/airstatic/assets/tpl/checkin/dangerousgoods.html',
      passengers_seats: '/airstatic/assets/tpl/checkin/passengers_seats.html',
      cards_sharing: '/airstatic/assets/tpl/checkin/cards_sharing.html',
      confirm_error: '/airstatic/assets/tpl/checkin/confirm_error.html',
      update_passengers_error: '/airstatic/assets/tpl/checkin/update_passengers_error.html',
      bookings: '/airstatic/assets/tpl/checkin/bookings.html',
      bookings_flights: '/airstatic/assets/tpl/checkin/bookings_flights.html'
    },
    ancillaries: {
      structure: '/airstatic/assets/tpl/ancillaries/ancillaries.html',
      luggage: '/airstatic/assets/tpl/ancillaries/luggage.html',
      seats: '/airstatic/assets/tpl/ancillaries/seats.html',
      premium_seats: '/airstatic/assets/tpl/ancillaries/premium_seats.html',
      payment: '/airstatic/assets/tpl/ancillaries/payment.html',
      confirm: '/airstatic/assets/tpl/ancillaries/confirm.html',
      plane: '/airstatic/assets/tpl/ancillaries/plane.html'
    },
    info: {
      structure: '/airstatic/assets/tpl/info/info.html',
      details: '/airstatic/assets/tpl/info/info_details.html'
    },
    widgets: {
      dialog: '/airstatic/assets/tpl/widgets/dialog.html'
    },
    account: {
      subnav: '/airstatic/assets/tpl/account/subnav.html',
      register_form: '/airstatic/assets/tpl/account/register_form.html'
    },
    loyalty_bookings: {
      home: '/airstatic/assets/tpl/loyalty_bookings/home.html',
      booking_detail: '/airstatic/assets/tpl/loyalty_bookings/booking_detail.html',
      booking_share: '/airstatic/assets/tpl/loyalty_bookings/booking_share.html',
      booking_card: '/airstatic/assets/tpl/loyalty_bookings/booking_card.html',
      booking_documentation: '/airstatic/assets/tpl/loyalty_bookings/booking_documentation.html',
      booking_flight: '/airstatic/assets/tpl/loyalty_bookings/booking_flight.html',
      add_booking_dialog: '/airstatic/assets/tpl/loyalty_bookings/add_booking_dialog.html',
      single_card: '/airstatic/assets/tpl/loyalty_bookings/single_card.html',
      cards_sharing: '/airstatic/assets/tpl/loyalty_bookings/cards_sharing.html'
    },
    loyalty_info: {
      my_info: '/airstatic/assets/tpl/loyalty_info/my_info.html',
      change_password: '/airstatic/assets/tpl/loyalty_info/change_password.html',
      companion: '/airstatic/assets/tpl/loyalty_info/companion.html',
      companion_row: '/airstatic/assets/tpl/loyalty_info/companion_row.html',
      preferences: '/airstatic/assets/tpl/loyalty_info/preferences.html',
      payment_method_row: '/airstatic/assets/tpl/loyalty_info/payment_method_row.html',
      payment_methods: '/airstatic/assets/tpl/loyalty_info/payment_methods.html',
      unsubscribe: '/airstatic/assets/tpl/loyalty_info/unsubscribe.html'
    },
    loyalty_card: {
      card: '/airstatic/assets/tpl/loyalty_card/card.html'
    },
    loyalty_miles: {
      activity: '/airstatic/assets/tpl/loyalty_miles/activity.html',
      activity_table: '/airstatic/assets/tpl/loyalty_miles/activity_table.html',
      spend: '/airstatic/assets/tpl/loyalty_miles/spend.html',
      transfer: '/airstatic/assets/tpl/loyalty_miles/transfer.html',
      claim: '/airstatic/assets/tpl/loyalty_miles/claim.html'
    },
    /* Partners templates */
    partners: {
      partners: '/airstatic/assets/tpl/partners/partners.html',
      confirm_redeem_dialog : '/airstatic/assets/tpl/partners/partners_confirm_redeem.html',
      confirm_redeem_success : '/airstatic/assets/tpl/partners/partners_redeem_success.html',
      basic_dialog : '/airstatic/assets/tpl/partners/partners_basic_dialog.html',
      error: '/airstatic/assets/tpl/partners/error.html'
    },
    landing:{
      suma_private : '/airstatic/assets/tpl/landing/suma_private.html',
      suma_anonymous : '/airstatic/assets/tpl/landing/suma_anonymous.html'
    },
    pmr:{
      structure: '/airstatic/assets/tpl/pmr_form/pmr_form.html',
      confirm: '/airstatic/assets/tpl/pmr_form/confirm.html',
      passengers: '/airstatic/assets/tpl/pmr_form/passengers.html'
    },
    h72:{
      structure: '/airstatic/assets/tpl/h72_payment/h72_payment.html',
      confirm: '/airstatic/assets/tpl/h72_payment/confirm.html',
      payment: '/airstatic/assets/tpl/h72_payment/payment.html'
    }
  },
  /* Service preload */
  preloadService: {
    timeout: 15000 /* ms */
  },
  /* Links to preload */
  preloadLinks: [
    'app',
    'condiciones#privacy',
    'condiciones#booking_conditions',
    'condiciones#ticket_conditions',
    'condiciones#transport_conditions',
    'condiciones#dangerous_goods_conditions',
    'condiciones',
    'condiciones#derecho-retracto',
    'home',
    'condiciones#anac',
    'my_info',
    'my_bookings',
    'my_miles',
    'my_card',
    'documentacion',
    'partners',
    'suma',
    'preguntas_frecuentes',
    'landing_suma',
    'condiciones_suma#condiciones-cepsa',
    'pasajeros#people_disabilities',
    'suma#nuestros-partners',
    'suma#obtener-millas-suma',
    'suma#nuestras-promociones',
    'fidelizacion#nuestras-promociones',
    'fidelizacion#obtener-millas-suma',
    'nuestros-partners/amazon',
    'nuestros-partners/cepsa',
    'nuestros-partners/belive',
    'nuestros-partners/nh',
    'nuestros-partners/halcon_viajes',
    'nuestros-partners/europcar',
    'nuestros-partners/skyteam',
    'equipaje#baggage'
  ],
  /* Graphic config */

  graphic: {
    comparedJourneys: {
      maxWidth: 100, /* percentage value */
      minWidth: 90 /* percentage value */
    },
    minFlightWidth: 20, /* percentage value */
    minTransferWidth: 4, /* percentage value */
    maxTransferWidth: 60, /* percentage value */

    highlights: ['#00beff', '#ffbe00', '#ff00be']
  },
  /* Seats map */

  seats: {
    seatsToJump: 5
  },
  /* Preloaded templates */

  preloadTemplates: [
    'widgets.dialog'
  ],
  cookies: {
    messageTimeout: 30000,
    expiration: 365 /* Days */
  },
  ds: {
    cookieExpiration: 3 /* Minutes */
  },
  currency: {
    defaultFormat: {
      thousand: ".",
      decimal: ","
    },
    EUR: {
      thousand: ".",
      decimal: ","
    },
    DOL: {
      thousand: ",",
      decimal: "."
    }
  },
  miles: {
    numResults: null
  }
};
