Hydra.module.register('PmrFormServices', function (Bus, Module, ErrorHandler, Api) {
  return {
    pmrFormLists: ['list_assistance', 'asistance_type_wheelchair', 'asistance_type_petcs'],
    pmrFormListsCache: [],


    events: {
      'services': {
        'getPmrFormLists': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          this.getPmrFormLists(oNotify.success, oNotify.failure);
        },
        'getPassengersData': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.data.locator) {
            this.getPassengersData(oNotify.success, oNotify.failure, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },
        'getPassengersDataBooking': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.data.bookingId) {
            this.getPassengersDataBooking(oNotify.success, oNotify.failure, oNotify.data);
          }
          else {
            oNotify.failure();
          }
        },
        'postPmrForm': function(oNotify) {
          if (!oNotify.success) oNotify.success = function() {};
          if (!oNotify.failure) oNotify.failure = function() {};

          if (oNotify.sessionId) {
            this.postPmrForm(oNotify.success, oNotify.failure, oNotify.sessionId, oNotify.postObject);
          }
          else {
            oNotify.failure();
          }
        },
        'getAssistanceComplement': function(oNotify){
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          this.getAssistanceComplement(oNotify.success, oNotify.failure, oNotify.assistance);
        },
        'confirmPmr': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.bookingId) {
            this.confirmPmr(oNotify.success, oNotify.failure, oNotify.pmrFormCache, oNotify.bookingId);
          }
          else {
            oNotify.failure();
          }
        },
        'confirmPmrBooking': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.bookingId) {
            this.confirmPmrBooking(oNotify.success, oNotify.failure, oNotify.pmrFormCache, oNotify.bookingId);
          }
          else {
            oNotify.failure();
          }
        }

      }
    },


    getPassengersData: function (success, failure, data) {
      /* Get service URL */
      var url = getServiceURL('pmr_form.passengers_external');

      /* Replace URL parameters with values */
      url = url.replace('{locator}', data.locator);
      url = url.replace('{surname}', data.surname);

      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },

     getPassengersDataBooking: function (success, failure, data) {
      /* Get service URL */
      var url = getServiceURL('pmr_form.passengers');

      /* Replace URL parameters with values */
      url = url.replace('{bookingId}', data.bookingId);

      Bus.publish('ajax', 'getFromService', {
        path: url,
        success: function (data) {
          success(data);
        }
      });
    },

    getPmrFormLists: function (success, failure) {
      var self = this;
      var servicesLength = this.pmrFormLists.length;
      var servicesLoaded = 0;

      $.each(this.pmrFormLists, function (index, list) {

        Bus.publish('ajax', 'getJSON', {
          path: getServiceURL('pmr_form.' + list),
          success: function (data) {
            /* Cache the data */
            self.pmrFormListsCache[list] = data;

            /* Control when all services are loaded */
            servicesLoaded += 1;

            if (servicesLoaded == servicesLength) {
              success(self.pmrFormListsCache);
            }
          },
          failure: function() {
            console.log('failure');
            /* Session error */
            $('#pmr').ui_dialog({
              title: lang('general.error_title'),
              error: true,
              subtitle: lang('general.error_message'),
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
              ],
              render: function ($dialog) {

                    /* Buttons behaviour */
                    $dialog.find('.close a').on('click', function (event) {
                      event.preventDefault();
                      /* Back to home */
                       Bus.publish('process', 'kill');
                    });
                  }
            });
          }
        });

      });
    },
    postPmrForm: function(success, failure, bookingId, postObject) {
      Bus.publish('ajax', 'postToService', {
        path: getServiceURL('pmr_form.confirm_external').replace('{bookingId}', bookingId),
        data: postObject, /* The object is already formatted by ancillaries view */
        success: function(data) {
          success(data);
        }
      });
    },

    getAssistanceComplement:function(success, failure, assistance){
      Bus.publish('ajax', 'getFromService', {
        path: getServiceURL('pmr_form.assistance_type').replace('{assistanceType}', assistance),
        success: function(data) {
          success(data);
        }
      });
    },

     confirmPmr: function (success, failure, pmrFormCache, bookingId) {
      var $this = $(this);
      var url = getServiceURL('pmr_form.confirm_external');

      /* Confirm checkin */
      var passengersTempObject = [];
      var postObject = {
        "bookingId" : pmrFormCache.bookingId,
        "passengers": pmrFormCache.passengers
      };

      //Replace checkinId in URL
      url = url.replace('{bookingId}', bookingId);

      Bus.publish('ajax', 'postToService', {
        path: url,
        data: postObject,
        success: function (data) {
          success(data);
        }
      });
    },

    confirmPmrBooking: function (success, failure, pmrFormCache, bookingId) {
      var $this = $(this);
      var url = getServiceURL('pmr_form.confirm');

      /* Confirm checkin */
      var passengersTempObject = [];
      var postObject = {
        "bookingId" : pmrFormCache.bookingId,
        "passengers": pmrFormCache.passengers
      };

      //Replace checkinId in URL
      url = url.replace('{bookingId}', bookingId);

      Bus.publish('ajax', 'postToService', {
        path: url,
        data: postObject,
        success: function (data) {
          success(data);
        }
      });
    }

  };
});




