Hydra.module.register('LoyaltyInfoServices', function (Bus, Module, ErrorHandler, Api) {
  return {
    loyaltyInfoLists: ['communities', 'countries', 'document_type', 'frequent_flyer', 'towns', 'large_family'],
    loyaltyInfoListsCache: {},
    loyaltyInfoPaymentList: ['user_payment_methods', 'payment_methods'],
    preconditionDocsType: 'LOYALTY',
    events: {
      'services': {
        'addFrequentPassengers': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          if (oNotify.userId && oNotify.data) {
            this.addFrequentPassengers(oNotify.success, oNotify.failure, oNotify.userId, oNotify.data);
          } else {
            oNotify.failure();
          }
        },
        'deleteFrequentPassengers': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          if (oNotify.userId && oNotify.passengerId) {
            this.deleteFrequentPassengers(oNotify.success, oNotify.failure, oNotify.userId, oNotify.passengerId);
          } else {
            oNotify.failure();
          }
        },
        'getFrequentPassengers': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          if (oNotify.userId) {
            this.getFrequentPassengers(oNotify.success, oNotify.failure, oNotify.userId);
          } else {
            oNotify.failure();
          }
        },
        'getLoyaltyInfoLists': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.getLoyaltyInfoLists(oNotify.success, oNotify.failure, oNotify.sessionId);
        },
        'getCategoriesLargeFamily': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.getCategoriesLargeFamily(oNotify.success, oNotify.failure);
        },
        'getCommunities': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.getCommunities(oNotify.success, oNotify.failure);
        },
        'getCountries': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.getCountries(oNotify.success, oNotify.failure);
        },
        'getRegionFromCountry': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          this.getRegionFromCountry(oNotify.success, oNotify.failure, oNotify.countryCode);
        },
        'getDocumentation': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.getDocumentation(oNotify.success, oNotify.failure);
        },
        'getUserPaymentMethods': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.getUserPaymentMethods(oNotify.success, oNotify.failure, oNotify.userId);
        },
        'getPreferences': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.getPreferences(oNotify.success, oNotify.failure, oNotify.userId);
        },
        'getTowns': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.getTowns(oNotify.success, oNotify.failure);
        },
        'getTypeFF': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.getTypeFF(oNotify.success, oNotify.failure);
        },
        'getUser': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.getUser(oNotify.success, oNotify.failure);
        },
        'unsubscribeUser': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.unsubscribeUser(oNotify.success, oNotify.failure, oNotify.frequentFlyerIdentity);
        },
        'updateFrequentPassengers': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          if (oNotify.userId && oNotify.passengerId) {
            this.updateFrequentPassengers(oNotify.success, oNotify.failure, oNotify.userId, oNotify.passengerId, oNotify.data);
          } else {
            oNotify.failure();
          }
        },
        'updatePreferences': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          if (oNotify.data) {
            this.updatePreferences(oNotify.success, oNotify.failure, oNotify.userId, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },
        'updateUser': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          if (oNotify.data && oNotify.userId) {
            this.updateUser(oNotify.success, oNotify.failure, oNotify.userId, oNotify.data);
          } else {
            oNotify.failure();
          }
        },
        'getPaymentList': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.getPaymentList(oNotify.success, oNotify.failure, oNotify.userId);
        },
        'savePaymentMethod': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          if (oNotify.data) {
            this.savePaymentMethod(oNotify.success, oNotify.failure, oNotify.userId, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },
        'deletePaymentMethod': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          if (oNotify.userId && oNotify.hashId) {
            this.deletePaymentMethod(oNotify.success, oNotify.failure, oNotify.userId, oNotify.hashId);
          } else {
            oNotify.failure();
          }
        },
        updatePaymentMethod: function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          if (oNotify.userId && oNotify.hashId && oNotify.data) {
            this.updatePaymentMethod(oNotify.success, oNotify.failure, oNotify.userId, oNotify.hashId, oNotify.data);
          } else {
            oNotify.failure();
          }
        },
        putChangePassword: function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.userId && oNotify.data.password && oNotify.data.newPassword && oNotify.data.newPasswordVerification) {
            this.putChangePassword(oNotify.success, oNotify.failure, oNotify.userId, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },
        getReasonsUnSuscribe: function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          this.getReasonsUnSuscribe(oNotify.success, oNotify.token);
        },
        unsubscribeNewsLetter: function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.unsubscribeNewsLetter(oNotify.success, oNotify.failure, oNotify.userId);
        },
        'getLanguages': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.getLanguages(oNotify.success, oNotify.failure);
        },
        'getUserPreferenceAirport': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.getUserPreferenceAirport(oNotify.success, oNotify.failure);
        }

      }
    },
    init: function () {
    },
    /* Adds a frequent passenger to user companion list */
    addFrequentPassengers: function (success, failure, userId, data) {
      var url = getServiceURL('loyalty_info.add_frequent_passengers');
      url = url.replace('{userId}', userId);

      Bus.publish('ajax', 'postToService', {
        data: data,
        path: url,
        success: function (response) {
          success(response);
        }
      });
    },
    /* Deletes a frequent passenger from user companion list */
    deleteFrequentPassengers: function (success, failure, userId, passengerId) {
      var url = getServiceURL('loyalty_info.delete_frequent_passengers');
      url = url.replace('{userId}', userId);
      url = url.replace('{passengerId}', passengerId);

      Bus.publish('ajax', 'deleteFromService', {
        path: url,
        success: function (response) {
          success(response);
        }
      });
    },
    /* Get list of frequent passengers for userId */
    getFrequentPassengers: function (success, failure, userId) {
      var url = getServiceURL('loyalty_info.frequent_passengers');
      url = url.replace('{userId}', userId);

      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function (response) {
          success(response);
        }
      });
    },
    getLoyaltyInfoLists: function (success, failure) {
      var self = this;
      var servicesLength = this.loyaltyInfoLists.length;
      var servicesLoaded = 0;
      var url;
      if (this.loyaltyInfoListsCache.communities
              && this.loyaltyInfoListsCache.countries
              && this.loyaltyInfoListsCache.document_type
              && this.loyaltyInfoListsCache.frequent_flyer
              && this.loyaltyInfoListsCache.towns
              && this.loyaltyInfoListsCache.large_family
              ) {
        //console.log("No llamamos a municipios porque ya los tenemos")
        success(this.loyaltyInfoListsCache);
      } else {
        //console.log("Llamamos a toda la lista de servicios");
        $.each(this.loyaltyInfoLists, function (index, list) {

          url = getServiceURL('loyalty_info.' + list);

          if (list == 'document_type') {
            url = url.replace('{preconditionDocsType}', 'NATIONAL');
          }

          Bus.publish('ajax', 'getJSON', {
            path: url,
            success: function (data) {
              /* Cache the data */
              self.loyaltyInfoListsCache[list] = data;
              /* Control when all services are loaded */
              servicesLoaded += 1;
              if (servicesLoaded == servicesLength) {
                success(self.loyaltyInfoListsCache);
              }
            }
          });
        });
      }

    },
    /* Call to [GET]categories/largefamily Rest API request */
    getCategoriesLargeFamily: function (success, failure) {
      if (this.loyaltyInfoListsCache.large_family) {
        success(this.loyaltyInfoListsCache.large_family);
      } else {
        var self = this;
        var url = getServiceURL('loyalty_info.largefamily');
        Bus.publish('ajax', 'getFromService', {
          path: url,
          success: function (data) {
            self.loyaltyInfoListsCache.large_family = data;
            success(data);
          }
        });
      }
    },
    /* Call to [GET]countries Rest API request */
    getCommunities: function (success, failure) {
      if (this.loyaltyInfoListsCache.communities) {
        success(this.loyaltyInfoListsCache.communities);
      } else {
        var self = this;
        /* Get service URL */
        var url = getServiceURL('loyalty_info.communities');
        /* Call to getFromService */
        Bus.publish('ajax', 'getFromService', {
          path: url,
          success: function (data) {
            self.loyaltyInfoListsCache.communities = data;
            success(data);
          }
        });
      }
    },
    /* Call to [GET]countries Rest API request */
    getCountries: function (success, failure) {
      if (this.loyaltyInfoListsCache.countries) {
        success(this.loyaltyInfoListsCache.countries);
      } else {
        var self = this;
        /* Get service URL */
        var url = getServiceURL('loyalty_info.countries');
        /* Call to getFromService */
        Bus.publish('ajax', 'getFromService', {
          path: url,
          success: function (data) {
            self.loyaltyInfoListsCache.countries = data;
            success(data);
          }
        });
      }
    },
    /* Call to [GET]countries Rest API request */
    getDocumentation: function (success, failure) {
      // if (this.loyaltyInfoListsCache.document_type) {
      //   success(this.loyaltyInfoListsCache.document_type);
      // } else {
        var self = this;
        /* Get service URL */
        var url = getServiceURL('loyalty_info.document_type');
        url = url.replace('{preconditionDocsType}', self.preconditionDocsType);
        /* Call to getFromService */
        Bus.publish('ajax', 'getFromService', {
          path: url,
          success: function (data) {
            self.loyaltyInfoListsCache.document_type = data;
            success(data);
          }
        });
      // }
    },

    /* Call to [GET]preferences Rest API request */
    getPreferences: function (success, failure, userId) {
      var url = getServiceURL('loyalty_info.preferences');

      url = url.replace('{userId}', userId);
      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },
    /* Call to [GET]towns Rest API request */
    getTowns: function (success, failure) {
      if (this.loyaltyInfoListsCache.towns) {
        success(this.loyaltyInfoListsCache.towns);
      } else {
        var self = this;
        /* Get service URL */
        var url = getServiceURL('loyalty_info.towns');
        /* Call to getFromService */
        Bus.publish('ajax', 'getFromService', {
          path: url,
          success: function (data) {
            self.loyaltyInfoListsCache.towns = data;
            success(data);
          }
        });
      }
    },

    /* Return object states from country code */
    getRegionFromCountry: function(success, failure, countryCode){
      var self = this;

      var url = getServiceURL('loyalty_info.country_region');
      url = url.replace('{countryCode}', countryCode);

      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function(data) {
          success(data);
        }
      });
    },

    /* Call to [GET]typeFF Rest API request */
    getTypeFF: function (success, failure) {
      if (this.loyaltyInfoListsCache.frequent_flyer) {
        success(this.loyaltyInfoListsCache.frequent_flyer);
      } else {
        var self = this;
        var url = getServiceURL('loyalty_info.frequent_flyer');
        Bus.publish('ajax', 'getFromService', {
          path: url,
          success: function (data) {
            self.loyaltyInfoListsCache.frequent_flyer = data;
            success(data);
          }
        });
      }
    },
    /* Call to [GET]user Rest API request */
    getUser: function (success, failure) {
      /* Get service URL */
      var url = getServiceURL('loyalty_info.get_user');
      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },
    unsubscribeUser: function (success, failure, frequentFlyerIdentity) {
      /* Get service URL */
      var url = getServiceURL('loyalty_info.unsubscribe_user');

      url = url.replace('{frequentFlyerIdentity}', frequentFlyerIdentity);
      /* Call to getFromService */
      Bus.publish('ajax', 'deleteFromService', {
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },
    updatePreferences: function (success, failure, userId, data) {
      /* Get service URL */
      var url = getServiceURL('loyalty_info.update_preferences');
      url = url.replace('{userId}', userId);
      /* Call to getFromService */
      Bus.publish('ajax', 'putToService', {
        path: url,
        data: data,
        success: function (data) {
          success(data);
        }
      });
    },
    updateUser: function (success, failure, userId, data) {
      /* Get service URL */
      var url = getServiceURL('loyalty_info.update_user');
      url = url.replace('{userId}', userId);
      /* Call to getFromService */
      Bus.publish('ajax', 'putToService', {
        path: url,
        data: data,
        success: function (data) {
          success(data);
        }
      });
    },
    getPaymentList: function (success, failure, userId) {
      var self = this;
      var servicesLength = this.loyaltyInfoPaymentList.length;
      var servicesLoaded = 0;
      var loyaltyInfoPaymentListCache = [];

      $.each(this.loyaltyInfoPaymentList, function (index, list) {

        var url = getServiceURL('loyalty_info.' + list);
        url = url.replace('{userId}', userId);

        Bus.publish('ajax', 'getFromService', {
          path: url,
          success: function (data) {
            /* Cache the data */
            loyaltyInfoPaymentListCache[list] = (data && data.body && data.body.data) ? data.body.data : [];
            /* Control when all services are loaded */
            servicesLoaded += 1;

            if (servicesLoaded == servicesLength) {
              success(loyaltyInfoPaymentListCache);
            }
          }
        });
      });

    },
    getUserPaymentMethods: function (success, failure, userId) {
      var self = this;

      var url = getServiceURL('loyalty_info.user_payment_methods');
      url = url.replace('{userId}', userId);

      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function (response) {
          success(response);
        }
      });
    },
    /* Updates a frequent passenger from user companion list */
    updateFrequentPassengers: function (success, failure, userId, passengerId, data) {
      var url = getServiceURL('loyalty_info.update_frequent_passengers');
      url = url.replace('{userId}', userId);
      url = url.replace('{passengerId}', passengerId);

      Bus.publish('ajax', 'putToService', {
        data: data,
        path: url,
        success: function (response) {
          success(response);
        }
      });
    },
    /* Save user payment method */
    savePaymentMethod: function (success, failure, userId, data) {
      var url = getServiceURL('loyalty_info.save_payment_method');

      url = url.replace('{userId}', userId);

      var parseObject = this.parsePaymentObject(data);

      Bus.publish('ajax', 'postToService', {
        path: url,
        data: parseObject,
        success: function (response) {
          success(response);
        }
      });
    },
    /* parsePaymentObject */
    parsePaymentObject: function (data) {
      var parseObject = {};
      var expirationDate = data.add_field_payment_credit_card_expiration;
      var completeDate = '';

      expirationDate = moment(expirationDate, 'MM/YY');
      completeDate = expirationDate.year() + '-' + (expirationDate.month() + 1) + '-01';

      parseObject = {
        'card': {
          'creditCardCodeType': {
            'identity': data.add_field_credit_card_type
          },
          'number': data.add_field_credit_card_number,
          'expiration': completeDate,
          'titular': data.add_field_credit_owner,
          'alias': (data.add_field_alias) ? data.add_field_alias : ''
        },
        'userName': data.userName
      };

      return parseObject;
    },
    /* Deletes a frequent passenger from user companion list */
    deletePaymentMethod: function (success, failure, userId, hashId) {
      var url = getServiceURL('loyalty_info.delete_payment_method');
      url = url.replace('{userId}', userId);
      url = url.replace('{hashId}', hashId);

      Bus.publish('ajax', 'deleteFromService', {
        path: url,
        success: function (response) {
          success(response);
        }
      });
    },
    putChangePassword: function (success, failure, userId, data) {
      /* Get service URL */
      var url = getServiceURL('loyalty_info.change_password');

      /* Replace URL parameters with values */
      url = url.replace('{userId}', userId);

      /* Call to putToService */
      Bus.publish('ajax', 'putToService', {
        path: url,
        data: data,
        success: function (data) {
          success(data);
        }
      });
    },
    getReasonsUnSuscribe: function (success, token) {
      /* Get service URL */
      var url = getServiceURL('loyalty_info.reasons_unsuscribe');

      /* Call to putToService */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        token: token,
        success: function (response) {
          success(response);
        }
      });
    },
    unsubscribeNewsLetter: function (success, failure, userId) {
      /* Get service URL */
      var url = getServiceURL('loyalty_info.unsubscribe_newsletter');

      url = url.replace('{userId}', userId);
      /* Call to getFromService */
      Bus.publish('ajax', 'deleteFromService', {
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },
    /* Call to [GET]languages Rest API request */
    getLanguages: function (success, failure) {
      if (this.loyaltyInfoListsCache.languages) {
        success(this.loyaltyInfoListsCache.languages);
      } else {
        var self = this;
        /* Get service URL */
        var url = getServiceURL('loyalty_info.languages');
        /* Call to getFromService */
        Bus.publish('ajax', 'getFromService', {
          path: url,
          success: function (data) {
            self.loyaltyInfoListsCache.languages = (data && data.body && data.body.data) ? data.body.data : [];
            success(self.loyaltyInfoListsCache.languages);
          }
        });
      }
    },
    /* Call to [GET]preference_airport Rest API request */
    getUserPreferenceAirport: function (success, failure) {
           
      if (this.loyaltyInfoListsCache.preferenceAirports) {
        success(this.loyaltyInfoListsCache.preferenceAirports);
      } else {
        var self = this;
        /* Get service URL */
        var url = getServiceURL('loyalty_info.preference_airport');
        /* Call to getFromService */
        Bus.publish('ajax', 'getFromService', {
          path: url,
          success: function (data) {      
            self.loyaltyInfoListsCache.preferenceAirports = (data && data.body && data.body.data) ? data.body.data : [];
            success(self.loyaltyInfoListsCache.preferenceAirports);
          }
        });
      }
    },

  };
});