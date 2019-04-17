Hydra.module.register('AccountServices', function (Bus, Module, ErrorHandler, Api) {
  return {
    accountInfoLists: ['countries', 'document_type'],
    accountInfoListsCache: {},
    events: {
      'services': {
        'register_user': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          // if (oNotify.data && oNotify.data.sessionId) {
          if (oNotify.data) {
            this.register_user('account.register', oNotify.success, oNotify.failure, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },
        'update_user': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.data) {
            this.update_user('account.update_user', oNotify.success, oNotify.failure, oNotify.userId, oNotify.data, oNotify.userType);
          }
          else {
            oNotify.failure();
          }
        },
        'login_user': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          // if (oNotify.data && oNotify.data.sessionId) {
          if (oNotify.data) {
            this.login_user(oNotify.success, oNotify.failure, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },
        'login_user_extend': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          // if (oNotify.data && oNotify.data.sessionId) {
          if (oNotify.data) {
            this.login_user_extend(oNotify.success, oNotify.failure, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },
        'login_oauth': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          // if (oNotify.data && oNotify.data.sessionId) {
          if (oNotify.data) {
            this.login_oauth(oNotify.success, oNotify.failure, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },
        'restore_password_user': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.data) {
            this.restore_password_user(oNotify.success, oNotify.failure, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },
        'recovery_user': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.data) {
            this.recovery_user(oNotify.success, oNotify.failure, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },
        'confirm_loyalty_user': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.confirm_loyalty_user(oNotify.success, oNotify.failure, oNotify.data);
        },
        'confirm_loyalty_user_email': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.confirm_loyalty_user_email(oNotify.success, oNotify.failure, oNotify.data);
        },
        'get_account_lists': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.get_account_lists(oNotify.success, oNotify.failure, oNotify.preconditionDocsType);
        },
        'conditions_user': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.userId) {
            this.conditions_user(oNotify.success, oNotify.failure, oNotify.userId);
          }

        },
        'accept_conditions_user': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.userId) {
            this.accept_conditions_user(oNotify.success, oNotify.failure, oNotify.userId);
          }
        },
        'confirm_unsuscribe': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.data) {
            this.confirm_unsuscribe(oNotify.success, oNotify.data);
          }
        },
        /* Check loyalty status*/
        'check_loyalty_status': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };
          this.checkLoyaltyStatus(oNotify.success, oNotify.failure);
        },

        'register_distnace_user': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.data) {
            this.register_distnace_user(oNotify.success, oNotify.failure, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },

        'register_siebel_user': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.data) {
            this.register_siebel_user(oNotify.success, oNotify.failure, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },
        
        'check_user_status': function (oNotify) {
        	if (!oNotify.success)
        		oNotify.success = function () {
        	};
        	if (!oNotify.failure)
        		oNotify.failure = function () {
        	};

        	this.check_user_status(oNotify.success, oNotify.failure);
        }
      }
    },
    init: function () {
    },
    /* Checks loyalty provider status */
    checkLoyaltyStatus: function(success, failure){
      /* Get service URL */
      var url = getServiceURL('account.loyalty_status');
      /* Call to get from service */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function (data) {
          var status = false;
          if (typeof data.body.data.status !== 'undefined'){
            status = (data.body.data.status === 'OK');
          }
          status ? success() : failure();
        }
      });
    },
    register_user: function (service, success, failure, data) {
      /* Get service URL */
      var url = getServiceURL(service);
      var postObject = {};

      /* get post info */
      postObject = this.compose_register_post_object(data);

      /* Call to post To Service */
      Bus.publish('ajax', 'postToService', {
        data: postObject,
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },
    update_user: function (service, success, failure, userId, data, userType) {
      /* Get service URL */
      var url = getServiceURL(service);
      var postObject = {};

      /* get post info */
      postObject = this.compose_update_post_object(data);

      /* add the userType */
      postObject.userType = userType;

      /* send password and revalidation if is MAEA user */
      if (userType == 'MYAIREUROPA')
      {
        postObject.password = data.userInfo.field_register_password;
        postObject.revalidationPassword = data.userInfo.field_register_password2;
      }

      /* Replace userId */
      url = url.replace('{userId}', userId);

      /* Call to postToService */
      Bus.publish('ajax', 'postToService', {
        data: postObject,
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },
    login_user_extend: function (success, failure, data) {
      /* Get service URL */
      var url = getServiceURL('account.login_user_extend');
      var postObject = {};

      /* Create post object */
      postObject = {
        "email": data.field_login_email,
        "password": data.field_login_password
      };

      /* Call to getJSON */
      Bus.publish('ajax', 'putToService', {
        path: url,
        data: postObject,
        success: function (data) {
          success(data);
        }
      });

    },
    login_user: function (success, failure, data) {
      /* Get service URL */
      var url = getServiceURL('account.login_user');

      /* Call to getJSON */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function (data) {
          success(data);
        }
      });

    },
    login_oauth: function (success, failure, data) {
      /* Get service URL */
      var url = getServiceURL('account.login_oauth');

      var defaultData = {
        grant_type: 'password',
        client_id: 'aeaweb',
        scope: 'user,availability,checkout,checkin,infoflight,booking,partners',
        username: data.field_login_email,
        password: data.field_login_password
      };

      $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        data: $.extend({}, AirEuropaConfig.ajax.defaultParams, defaultData),
        contentType: 'application/x-www-form-urlencoded',
        cache: false,
        async: true,
        // timeout: 5000,

        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Basic YWVhd2ViOnczYjQzNGZyMG50");
        },
        error: function (jqXHR, textStatus, errorThrown) {
          success(jqXHR.responseJSON);
        },
        success: function (data, textStatus) {
          success(data);
        }
      });


    },
    restore_password_user: function (success, failure, data) {
      /* Get service URL */
      var url = getServiceURL('account.restore_password_loyalty_user');
      var postObject = {};

      // /* Replace URL parameters with values */
      url = url.replace('{token}', data.token);

      postObject = {
        "newPassword": data.new_password_1,
        "newPasswordVerification": data.new_password_2
      };

      /* Call to putToService */
      Bus.publish('ajax', 'putToService', {
        path: url,
        data: postObject,
        success: function (data) {
          success(data);
        }
      });

    },
    recovery_user: function (success, failure, data) {
      /* Get service URL */
      var url = getServiceURL('account.recover_loyalty_user');
      var postObject = {};

      // /* Replace URL parameters with values */
      url = url.replace('{email}', data.field_email);

      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function (data) {
          success(data);
        }
      });

    },
    confirm_loyalty_user: function (success, failure, data) {
      /* Get service URL */
      var url = getServiceURL('account.confirm_loyalty_user');
      var token = (data.alToken) ? data.alToken : '';

      /* Replace URL parameters with values */
      url = url.replace('{token}', token);

      /* Call to getFromService */
      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function (data) {
          success(data);
        }
      });

    },
    confirm_loyalty_user_email: function (success, failure, data) {
      /* Get service URL */
      var url = getServiceURL('account.confirm_loyalty_user_email');
      var token = (data.confirmationToken) ? data.confirmationToken : '';

      /* Replace URL parameters with values */
      url = url.replace('{token}', token);

      /* Call to putToService */
      Bus.publish('ajax', 'putToService', {
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },
    get_identification_document_object: function (data) {
      var identificationDocument = {
        documentType: data.field_register_document_type,
        identity: data.field_register_document_number
      }

      return identificationDocument;
    },
    compose_register_post_object: function (data) {
      var userInfo = {};
      var postObject = {};
      var honorific = this.get_honorific(data.userInfo.field_register_honorific);

      userInfo = {
        personCompleteName: {
          name: data.userInfo.field_register_name,
          firstSurname: data.userInfo.field_register_surname,
          secondSurname: data.userInfo.field_register_surname2
        },
        title: honorific,
        born: data.userInfo.field_register_birthdate,
        citizenship: data.userInfo.country,        
        identificationDocument: this.get_identification_document_object(data.userInfo),
        email: data.userInfo.field_register_email
      }

      /* get rest of information */
      postObject = {
        userInfo: userInfo,
        password: data.userInfo.field_register_password,
        revalidationPassword: data.userInfo.field_register_password2,
        loyaltySubscriptionType: data.receiveNotifications,
        preferenceAirport: data.userInfo.preferenceAirport,
        cepsa: data.cepsa,
        postalCode: data.userInfo.field_register_postal_code,
      }
      
      //If telephone was introduced, get its data
      if(data.userInfo.field_register_phone_type != "") {
    	  var telephone = {
    		type: data.userInfo.field_register_phone_type,
    		prefix: data.userInfo.field_register_phone_prefix,
    		number: data.userInfo.field_register_phone
    	  };
    	  postObject.telephone = telephone;
      } 
      
      //If receive phisical card was selected, get the address data
      if(data.userInfo.field_register_data_loyalty_phisical_card === "on") {
	      var cardShippingAddress = {
	    	typeRoad: data.userInfo.field_register_card_address_type,
	    	street: data.userInfo.field_street,
	    	streetNumber: data.userInfo.field_street_number,
	    	additionalAddress: data.userInfo.field_street_2,
	    	city: data.userInfo.field_city,
	    	state: data.userInfo.field_register_card_country,
	    	postalCode: data.userInfo.field_address_postal_code,
	    	country: {
	    		code: data.userInfo.field_register_card_country
	    	}
	      };
	      
	      postObject.loyaltyCardShippingAddress = cardShippingAddress;
      }

      return postObject;

    },
    /*Object to send in the update, */
    compose_update_post_object: function (data) {
      var postObject = {};
      var honorific = this.get_honorific(data.userInfo.field_register_honorific);

      userInfo = {
        personCompleteName: {
          name: data.userInfo.field_register_name,
          firstSurname: data.userInfo.field_register_surname,
          secondSurname: data.userInfo.field_register_surname2,
        },
        title: honorific,
        born: data.userInfo.field_register_birthdate,
        country: data.userInfo.country,
        identificationDocument: this.get_identification_document_object(data.userInfo)
      }

      /* get rest of information */
      postObject = {
        user: userInfo,
        loyaltySubscriptionType: data.receiveNotifications,
        cepsa: data.cepsa
      }

      return postObject;

    },
    get_honorific: function (title) {
      var honorific = title;

      if (title == "sr") {
        honorific = "MR";
      } else if (title == "sra") {
        honorific = "MRS";
      } else if (title == "srta") {
        honorific = "MISS";
      }
      return honorific;
    },
    get_account_lists: function (success, failure, preconditionDocsType) {
      var self = this;
      var servicesLength = this.accountInfoLists.length;
      var servicesLoaded = 0;
      var url;

      if (this.accountInfoListsCache.countries && this.accountInfoListsCache.document_type && this.accountInfoListsCache.preference_airport)
      {
        success(this.accountInfoListsCache);
      }
      else {
        $.each(this.accountInfoLists, function (index, list) {

          /*get url to set parameters in document type */
          url = getServiceURL('account.' + list);

          if (list == 'document_type') {
            url = url.replace('{preconditionDocsType}', preconditionDocsType);
          }

          Bus.publish('ajax', 'getJSON', {
            path: url,
            success: function (data) {
              /* Cache the data */
              self.accountInfoListsCache[list] = data;
              /* Control when all services are loaded */
              servicesLoaded += 1;
              if (servicesLoaded == servicesLength) {
                success(self.accountInfoListsCache);
              }
            }
          });
        });
      }
    },
    conditions_user: function (success, failure, userId) {
      var url = getServiceURL('account.conditions_user');
      url = url.replace('{userId}', userId);
      url = url.replace('{conditionType}', 'USE');
      url = url.replace('{operatingSystem}', 'WEB');
      url = url.replace('{versionNumber}', '1');

      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function (response) {
          success(response);
        }
      });
    },
    accept_conditions_user: function (success, failure, userId) {
      var url = getServiceURL('account.accept_conditions_user');
      url = url.replace('{userId}', userId);
      url = url.replace('{conditionType}', 'USE');
      url = url.replace('{operatingSystem}', 'WEB');
      url = url.replace('{versionNumber}', '1');

      Bus.publish('ajax', 'putToService', {
        path: url,
        success: function (response, jqXHR) {
          success(response, jqXHR);
        }
      });
    },
    confirm_unsuscribe: function (success, data) {
      var url = getServiceURL('account.confirm_unsuscribe');
      var token = window.location.hash.split("token/")[1];
      url = url.replace('{token}', token);

      Bus.publish('ajax', 'postToService', {
        path: url,
        data: data,
        success: function (response) {
          success(response);
        }
      });
    },
    register_distnace_user: function (success, failure, data) {
      /* Get service URL */
      var url = getServiceURL('account.register_distnace_user');
      var postObject = {};

      // /* Replace URL parameters with values */
      url = url.replace('{token}', data.token);

      postObject = {
        "password": data.new_password_distnace_1,
        "passwordVerification": data.new_password_distnace_2,
        "cepsa": data.field_register_data_cession_cepsa_siebel == 'on' ? true : false
      };

      /* Call to putToService */
      Bus.publish('ajax', 'putToService', {
        path: url,
        data: postObject,
        success: function (data) {
          success(data);
        }
      });

    },
    register_siebel_user: function (success, failure, data) {
        /* Get service URL */
        var url = getServiceURL('account.register_siebel_user');
        
        var postObject = {};

        postObject = {
          //TODO Campos que faltan
          "frequentFlyerIdentity": data.loyalty_number,
          "born": data.field_register_siebel_birthdate,
          "nationality": data.field_register_document_nationality,
          "email": data.field_register_email,
          "loyaltySubscriptionType": data.receiveNotifications,
          "password": data.new_password_distnace_1,
          "cepsaPTV": data.field_register_data_cession_cepsa_siebel == 'on' ? true : false,
          "documentation": {
        	  "documentType": data.field_register_document_type,
        	  "identity": data.field_register_document_number
          }
        };

        /* Call to putToService */
        Bus.publish('ajax', 'postToService', {
          path: url,
          data: postObject,
          success: function (data) {
            success(data);
          }
        });

    },
    check_user_status: function (success, failure) {
    	console.log("Comprobando estado de cuenta de usuario");
    	$.ajax({
            url: getServiceURL('account.login_user'),
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            data: AirEuropaConfig.ajax.defaultParams,
            cache: false,
            async: true,
            // timeout: AirEuropaConfig.preloadService.timeout,

            beforeSend: function (xhr) {
              xhr.setRequestHeader("Authorization", "Bearer " + window.token);
            },
            success: function (userData) {

              if (userData.body && userData.body.data && userData.body.data.user && userData.body.data.user.active) {
            	  success(userData);
              }else{
            	User.logoff();
                failure();
              }
              
            }
          });
    }
    
  };
});