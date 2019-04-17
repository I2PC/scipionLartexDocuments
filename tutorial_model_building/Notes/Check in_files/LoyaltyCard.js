Hydra.module.register('LoyaltyCardServices', function (Bus, Module, ErrorHandler, Api) {
  return {
    loyaltyCardLists: ['countries'],
    loyaltyCardListsCache: {},
    events: {
      'services': {
        'getLoyaltyCardInfo': function (oNotify) {
          if (!oNotify.success) {
            oNotify.success = function () {
            };
          }
          if (!oNotify.failure) {
            oNotify.failure = function () {
            };
          }
          this.getLoyaltyCardInfo(oNotify.success, oNotify.failure, oNotify.sessionId);
        },
        'requestPhysicalCard': function (oNotify) {
          if (!oNotify.success) {
            oNotify.success = function () {
            };
          }
          if (!oNotify.failure) {
            oNotify.failure = function () {
            };
          }
          if (oNotify.userId) {
            this.requestPhysicalCard(oNotify.success, oNotify.failure, oNotify.userId, oNotify.data);
          } else {
            oNotify.failure();
          }
        },
        'getLoyaltyRegionFromCountry': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          this.getLoyaltyRegionFromCountry(oNotify.success, oNotify.failure, oNotify.countryCode);
        },
        'requestPassbookCard': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.userId && oNotify.loyaltyId) {
            this.requestPassbookCard(oNotify.success, oNotify.failure, oNotify.userId, oNotify.loyaltyId, oNotify.emailData);
          } else {
            oNotify.failure();
          }
        },
        'getPrintCard': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          this.getPrintCard(oNotify.success, oNotify.failure, oNotify.userId);
        }
      }
    },
    init: function () {
    },
    getLoyaltyCardInfo: function (success, failure) {
      var self = this;
      var servicesLength = this.loyaltyCardLists.length;
      var servicesLoaded = 0;

      if (this.loyaltyCardListsCache.countries) {
        success(this.loyaltyCardListsCache);
      } else {
        //console.log("Llamamos a toda la lista de servicios");
        $.each(this.loyaltyCardLists, function (index, list) {

          Bus.publish('ajax', 'getJSON', {
            path: getServiceURL('loyalty_card.' + list),
            success: function (data) {
              /* Cache the data */
              self.loyaltyCardListsCache[list] = data;
              /* Control when all services are loaded */

              servicesLoaded += 1;
              if (servicesLoaded == servicesLength) {
                success(self.loyaltyCardListsCache);
              }
            }
          });
        });
      }

    },
    /* PUT to /loyalty/user/physical/card */
    requestPhysicalCard: function (success, failure, userId, data) {
      /* Get service URL */
      var url = getServiceURL('loyalty_card.request_physical_card');
      url = url.replace('{userId}', userId);
      Bus.publish('ajax', 'putToService', {
        data: data,
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },

    /* Return object states from country code */
    getLoyaltyRegionFromCountry: function(success, failure, countryCode){
      var self = this;

      var url = getServiceURL('loyalty_card.country_region');
      url = url.replace('{countryCode}', countryCode);

      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    },

    getPrintCard: function(success, failure, userId){
      var self = this;

      var url = getServiceURL('loyalty_card.print_card');
      url = url.replace('{userId}', userId);

      Bus.publish('ajax', 'downloadFromService', {
        path: url,
        success: function () {
          success();
        },
        failure: function () {
          failure();
        },
        headerAccept: 'application/pdf'
      });
    },


    /* Request passbook card */
    requestPassbookCard: function (success, failure, userId, loyaltyId, emailData) {
      /* Get service URL */
      var url = getServiceURL('loyalty_card.request_passbook_card');

      /* Create post object data */
      var data = {
        userId: userId,
        loyaltyId: loyaltyId,
        sharingType: 'PASSBOOK',
        emails: emailData
      };

      Bus.publish('ajax', 'postToService', {
        data: data,
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },
  };
});