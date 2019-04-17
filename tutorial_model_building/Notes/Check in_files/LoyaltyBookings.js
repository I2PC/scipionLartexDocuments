Hydra.module.register('LoyaltyBookingsServices', function(Bus, Module, ErrorHandler, Api) {
  return {

    events: {
      'services': {
        'getBookings': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.userId) {
            this.getBookings(oNotify.success, oNotify.failure, oNotify.userId);
          }
          else {
            oNotify.failure();
          }
        },
        'getCheckinBookings': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.userId) {
            this.getCheckinBookings(oNotify.success, oNotify.failure, oNotify.userId);
          }
          else {
            oNotify.failure();
          }
        },
        'putBookingStatus': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.userId) {
            this.putBookingStatus(oNotify.success, oNotify.failure, oNotify.bookingId, oNotify.userId, oNotify.status);
          }
          else {
            oNotify.failure();
          }
        },
        'getBookingDetail': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.data.userId && oNotify.data.bookingId) {
            this.getBookingDetail(oNotify.success, oNotify.failure, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },
        'getExternalBooking': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.data.userId && oNotify.data.surname && oNotify.data.locator) {
            this.getExternalBooking(oNotify.success, oNotify.failure, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },
        'getBookingCards': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.cardsData) {
            this.getBookingCards(oNotify.success, oNotify.failure, oNotify.cardsData);
          }
          else {
            oNotify.failure();
          }
        },
        'getLoyaltyQrCode': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.qrCode) {
            this.getLoyaltyQrCode(oNotify.success, oNotify.failure, oNotify.qrCode);
          }
          else {
            oNotify.failure();
          }
        },
        'getBoardingPassTicket': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.locator && oNotify.userId) {
            this.getBoardingPassTicket(oNotify.success, oNotify.failure, oNotify.bookingData, oNotify.locator, oNotify.userId, oNotify.cards);
          }
          else {
            oNotify.failure();
          }
        },
        /* Share booking by email */
        'shareBooking': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.bookingId) {
            this.shareBooking(oNotify.success, oNotify.failure, oNotify.data, oNotify.bookingId);
          }
          else {
            oNotify.failure();
          }
        },
        'shareBookingCards': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.bookingId) {
            this.shareBookingCards(oNotify.success, oNotify.failure, oNotify.data, oNotify.bookingId);
          }
          else {
            oNotify.failure();
          }
        },
        'refreshBookingStatus': function(oNotify) {
            if (!oNotify.success) oNotify.success = function() {};
            if (!oNotify.failure) oNotify.failure = function() {};

            if (oNotify.userId) {
              this.refreshBookingStatus(oNotify.success, oNotify.failure, oNotify.locator, oNotify.userId, oNotify.surname);
            }
            else {
              oNotify.failure();
            }
        },
        'loginTwitterOAuthLoyalty': function(oNotify) {
            if (!oNotify.success) oNotify.success = function() {};
            if (!oNotify.failure) oNotify.failure = function() {};
            

            this.loginTwitterOAuthLoyalty(oNotify.success, oNotify.failure, oNotify.data);
           
        },

        'followUsTwitterLoyalty': function(oNotify) {
            if (!oNotify.success) oNotify.success = function() {};
            if (!oNotify.failure) oNotify.failure = function() {};

            this.followUsTwitterLoyalty(oNotify.success, oNotify.failure);
           
        },

        'followingUsTwitterLoyalty': function(oNotify) {
            if (!oNotify.success) oNotify.success = function() {};
            if (!oNotify.failure) oNotify.failure = function() {};

            
            this.followingUsTwitterLoyalty(oNotify.success, oNotify.failure);
                     
        },

        'notificationsTwitterLoyalty': function(oNotify) {
            if (!oNotify.success) oNotify.success = function() {};
            if (!oNotify.failure) oNotify.failure = function() {};
            
           
            this.notificationsTwitterLoyalty(oNotify.success, oNotify.failure, oNotify.data);
        
        }
      }
    },

    init: function() {},

    shareBooking: function(success, failure, data, bookingId) {
      var $this = $(this);
      var url = getServiceURL('loyalty_bookings.booking_share');

      /* Replace URL parameters with values */
      url = url.replace('{bookingId}', bookingId);

      Bus.publish('ajax', 'postToService', {
        path: url,
        data: data,
        success: function(data) {
          success(data);
        }
      });
    },

    shareBookingCards: function(success, failure, data, bookingId) {
      var $this = $(this);
      var url = getServiceURL('loyalty_bookings.booking_cards_share');

      /* Replace URL parameters with values */
      url = url.replace('{bookingId}', bookingId);

      Bus.publish('ajax', 'postToService', {
        path: url,
        data: data,
        success: function(data) {
          success(data);
        }
      });
    },

    getBookings: function(success, failure, userId) {
      /* Get service URL */
      var url = getServiceURL('loyalty_bookings.list');

      /* Replace URL parameters with values */
      url = url.replace('{userId}', userId);

      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    },

    getCheckinBookings: function(success, failure, userId) {
      /* Get service URL */
      var url = getServiceURL('loyalty_bookings.checkin_list');

      /* Replace URL parameters with values */
      url = url.replace('{userId}', userId);

      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    },

    putBookingStatus: function(success, failure, bookingId, userId, status) {
      /* Get service URL */
      var url = getServiceURL('loyalty_bookings.change_status');

      /* Call to putToService */
      Bus.publish('ajax', 'putToService', {
        path: url,
        data: {
          bookingId: bookingId,
          userId: userId,
          status: status
        },
        success: function(data) {
          success(data);
        }
      });
    },

    getBookingDetail: function(success, failure, data) {
      /* Get service URL */
      var url = getServiceURL('loyalty_bookings.detail');

      /* Replace URL parameters with values */
      url = url.replace('{bookingId}', data.bookingId);
      url = url.replace('{userId}', data.userId);

      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    },

    getExternalBooking: function(success, failure, data) {
      /* Get service URL */
      var url = getServiceURL('loyalty_bookings.add_booking');

      /* Replace URL parameters with values */
      url = url.replace('{userId}', data.userId);
      url = url.replace('{surname}', data.surname);
      url = url.replace('{locator}', data.locator);

      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    },

    getBookingCards: function(success, failure, cardsData) {
      /* Get service URL */
      var url = getServiceURL('loyalty_bookings.cards');

      /* Replace URL parameters with values */
      url = url.replace('{locator}', cardsData.locator);
      url = url.replace('{surname}', cardsData.surname);

      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    },

    getLoyaltyQrCode: function(success, failure, qrCode) {
      var $this = $(this);
      var url = getServiceURL('loyalty_bookings.qrcode');

      /* Replace URL parameters with values */
      url = url.replace('{qrCode}', qrCode);

      Bus.publish('ajax', 'getImage', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    },

    getBoardingPassTicket: function(success, failure, bookingData, locator, userId, cards) {
      var $this = $(this);
      // cambiar el servicio URL para que sea el de boarding
      var url = getServiceURL('loyalty_bookings.boardingpassticket');
      var data = {
        "departureDate": bookingData.flights[0].departure.date,
        "flightNumber": bookingData.flights[0].flightNumber,
        "userFlightIds": []
      };

      _.each(cards, function(item, index, list) {
        data.userFlightIds.push(item.passenger.userFlightId)
      });

      /* Replace URL parameters with values */
      url = url.replace('{locator}', locator);
      url = url.replace('{userId}', userId);

      Bus.publish('ajax', 'postToService', {
        path: url,
        data: data,
        success: function(data) {
          success(data);
        }
      });
    },
    
    refreshBookingStatus: function(success, failure, locator, userId, surname) {
    	/* Get service URL */
        var url = getServiceURL('loyalty_bookings.refresh');
        
        /* Replace URL parameters with values */
        url = url.replace('{userId}', userId);
        url = url.replace('{surname}', surname);
        url = url.replace('{locator}', locator);
        
        Bus.publish('ajax', 'putToService', {
            path: url,
            success: function(data) {
              success(data);
            }
          });
    },

    loginTwitterOAuthLoyalty: function(success, failure, data) {
      /* Get service URL */
        var url = getServiceURL('twitter.login_twitter_oauth');
        
        url = url.replace('{step}','loyalty');
        url = url.replace('{returnTo}', encodeURIComponent(data));

        Bus.publish('ajax', 'getFromService', {
            path: url,
            success: function(data) {
              success(data);
            }
          });
    },

    followingUsTwitterLoyalty: function(success, failure){

        var url = getServiceURL('twitter.following_us_twitter');

        Bus.publish('ajax', 'getFromService',{
            path:url,
            success: function(data){
              success(data);
            }

        });
     },

    followUsTwitterLoyalty: function(success, failure){

        var url = getServiceURL('twitter.follow_us_twitter');

        Bus.publish('ajax', 'getFromService',{
            path:url,
            success: function(data){
              success(data);
            }

        });
     },

     notificationsTwitterLoyalty: function(success, failure, data){

        var url = getServiceURL('twitter.notifications_twitter');

        //ReplaceAll (/)
        var departureDate = data.departureDate.replace(/\//g, '-');
        var arrivalDate = data.arrivalDate.replace(/\//g, '-');

        departureDate = moment(departureDate, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD HH:mm');
        arrivalDate = moment(arrivalDate, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD HH:mm');

        url = url.replace('{flightCode}', data.flightCode);
        url = url.replace('{departureAirport}', data.departureAirport);
        url = url.replace('{departureDate}', departureDate);
        url = url.replace('{arrivalAirport}', data.arrivalAirport);
        url = url.replace('{arrivalDate}', arrivalDate);

        Bus.publish('ajax', 'getFromService',{
            path:url,
            success: function(data){
              success(data);
            }
        });

     }

  };
});
