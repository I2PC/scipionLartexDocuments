Hydra.module.register('LoyaltyMiles', function (Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#content.loyalty_miles',
    element: undefined,
    events: {
      'loyalty_miles': {
        'custom_init': function () {
          this.customInit();
          Bus.publish('prerender', 'restart');
        },
        'show_loyalty_detail_miles': function (oNotify) {
          var callback = (oNotify && oNotify.callback) ? oNotify.callback : function () {
          };
          this.showLoyaltyDetail(callback);
        },
        'show_loyalty_activity_list': function (oNotify) {
          var callback = (oNotify && oNotify.callback) ? oNotify.callback : function () {
          };
          this.showLoyaltyActivityList(callback);
        }
      }
    },
    init: function () {
    },
    customInit: function () {
      /* Save jquery object reference */
      this.element = $(this.selector);

      /* Init forms */
      this.initForms();
      this.initFieldFlightDate();
      this.initFieldFilterDate();
      this.flightDateActions();
      this.filterDateActions();
    },
    initForms: function () {
      var self = this;
      var $formActivity = this.element.find('form.form_miles_activity');
      var $formClaim = this.element.find('form.form_claim_miles');
      var $formTransfer = this.element.find('form.form_transfer_miles');

      if (($formClaim.length === 0) && ($formActivity.length === 0) && ($formTransfer.length === 0)) {
        return;
      }

      /* Init activity table pagination */
      this.activityPagination();

      /* Init activity form */
      this.initActivityForm($formActivity);

      /* Init claim form */
      $formClaim.form({
        onError: function (form) {
          self.scrollFormError(form.element);
        },
        onSubmit: function (form) {
          var data = form.element.serializeObject();

          /* Avoid double click disabling the button */
          form.element.find('.submit .submit_button button').attr('disabled', 'disabled').addClass('loading');

          var putObject = {};
          /* Get the data from the user form */
          putObject = form.element.serializeObject();

          Bus.publish('services', 'claimMiles', {
            postData: putObject,
            frequentFlyerIdentity: localStorage.ly_frequentFlyerIdentity,
            success: function (response) {

              if (response.header.error) {
                form.element.find('.submit .submit_button button').removeAttr('disabled').removeClass('loading');
                var message = response.header.message;
                $('body').ui_dialog({
                  title: lang('general.info_error_title'),
                  error: true,
                  close: {
                    behaviour: 'close',
                    href: '#'
                  },
                  subtitle: message,
                  buttons: [
                    {
                      className: 'close',
                      href: '#',
                      label: lang('dialog.close_dialog')
                    }
                  ]
                });
              }

              else {
                form.element.find('.submit .submit_button button').removeAttr('disabled').removeClass('loading');

                $('body').ui_dialog({
                  title: lang('my_miles.claim_ok_title'),
                  error: false,
                  close: {
                    behaviour: 'close',
                    href: '#'
                  },
                  subtitle: lang('my_miles.claim_ok_subtitle'),
                  buttons: [
                    {
                      className: 'close',
                      href: '#',
                      label: lang('dialog.close_dialog')
                    }
                  ]
                });

                /* Clear form */
                form.element.trigger('reset');
                form.element.find('.select_field select').trigger('change');
                form.element.find('.field.checkbox input').trigger('change');
                form.element.find('.field').attr('data-init', 'restart').removeClass('filled');
                form.restartFields();
              }



            }
          });

        }
      });

      /* Init transfer form */
      $formTransfer.form({
        onSubmit: function (form) {
          var data = form.element.serializeObject();

          /* Avoid double click disabling the button */
          form.element.find('.submit .submit_button button').attr('disabled', 'disabled').addClass('loading');

          Bus.publish('services', 'transferMiles', {
            frequentFlyerIdentity: localStorage.ly_frequentFlyerIdentity,
            numMiles: data.field_num_miles,
            receiverFFIdentity: (data.field_loyalty_another_companion === '') ? data.field_loyalty_companion : data.field_loyalty_another_companion,
            receiverEmail: data.field_loyalty_email,
            success: function (response) {
              var error = response.header.error;
              var message = response.header.message;
              var newMilesNumber;

              if (error) {
                $('body').ui_dialog({
                  title: lang('general.info_error_title'),
                  error: true,
                  close: {
                    behaviour: 'close',
                    href: '#'
                  },
                  subtitle: message,
                  buttons: [
                    {
                      className: 'close',
                      href: '#',
                      label: lang('dialog.close_dialog')
                    }
                  ]
                });
              } else {
                /* Clear form */
                form.element.trigger('reset');
                form.element.find('.select_field select').trigger('change');
                form.element.find('.field').attr('data-init', 'restart').removeClass('filled');
                form.restartFields();

                newMilesNumber = response.body.data;


                $('body').ui_dialog({
                  title: lang('my_miles.transfer_title'),
                  error: false,
                  close: {
                    behaviour: 'close',
                    href: '#'
                  },
                  subtitle: lang('my_miles.transfer_miles_ok'),
                  buttons: [
                    {
                      className: 'close',
                      href: '#',
                      label: lang('dialog.close_dialog')
                    }
                  ]
                });

                if (newMilesNumber === 0) {
                  $('.lead').html('<p>' + lang('my_miles.no_miles_message') + '</p>');
                  $formTransfer.hide();
                }

                /* Update miles number */
                Bus.publish('account', 'update_miles', {newMilesNumber: newMilesNumber});
              }

              form.element.find('.submit .submit_button button').removeAttr('disabled').removeClass('loading');

            },
            failure: function () {
              form.element.find('.submit .submit_button button').removeAttr('disabled').removeClass('loading');
            }
          });
        }
      });

      if ($formTransfer.length > 0) {
        $formTransfer.find('#field_loyalty_companion').on('change', function (event) {
          var $anotherCompanion = $formTransfer.find('#field_loyalty_another_companion');
          var $anotherCompanionField = $anotherCompanion.closest('.text_field');
          if ($(event.target).val() === '0') {
            $anotherCompanionField.attr('data-required', 'true').removeClass('hidden');
          } else {
            $anotherCompanionField.attr('data-required', 'false').addClass('hidden');
            $anotherCompanion.val('');
          }
          $anotherCompanionField.attr('data-init', 'restart');
          $formTransfer.form('restartFields');
        });
        /* Check if user has miles to transfer */
        if (localStorage.ly_accumulatedMiles === '0') {
          $('.lead').html('<p>' + lang('my_miles.no_miles_message') + '</p>');
          $formTransfer.hide();
        }
      }

    },
    initFieldFlightDate: function () {
      var dayOptions   = '<option value=""></option>';
      var monthOptions = '<option value=""></option>';
      var yearOptions  = '<option value=""></option>';
      var currentyear  = (new Date).getFullYear();

      // day list
      var iaux = '';
      for (var i = 1; i < 32; i++) {
        if (i < 10) {
          iaux = "0" + i;
        } else {
          iaux = i;
        };

        dayOptions = dayOptions + '<option value="' + iaux + '">' + i + '</option>';
      };

      // month list
      var jaux = '';
      for (var j = 0; j < 12; j++) {
        if (j < 9) {
          jaux = "0" + (j+1);
        } else {
          jaux = (j+1);
        };

        monthOptions = monthOptions + '<option value="' + jaux + '">' + lang('dates.monthsNames_' + j) + '</option>';
      };

      // year list
      for (var i = currentyear; i > currentyear-131; i--) {
        yearOptions = yearOptions + '<option value="' + i + '">' + i + '</option>';
      };

      $(".date_day_input").html(dayOptions);
      $(".date_month_input").html(monthOptions);
      $(".date_year_input").html(yearOptions);

      // update combos if date is set
      var hiddenDateFieldList = $("[id$='field_loyalty_flight_date']");
      hiddenDateFieldList.each(function(){
        if($(this).val() != ""){
          var targetId  = $(this).attr("id");
          var dateParts = $("#"+targetId).val().split("/");

          $('.' + targetId + '.date_day_input').val(dateParts[2]).trigger('change', [true]);
          $('.' + targetId + '.date_month_input').val(dateParts[1]).trigger('change', [true]);
          $('.' + targetId + '.date_year_input').val(dateParts[0]).trigger('change', [true]);
        };
      });
    },
    initFieldFilterDate: function () {
      var dayOptions   = '<option value=""></option>';
      var monthOptions = '<option value=""></option>';
      var yearOptions  = '<option value=""></option>';
      var currentyear  = (new Date).getFullYear();

      // day list
      var iaux = '';
      for (var i = 1; i < 32; i++) {
        if (i < 10) {
          iaux = "0" + i;
        } else {
          iaux = i;
        };

        dayOptions = dayOptions + '<option value="' + iaux + '">' + i + '</option>';
      };

      // month list
      var jaux = '';
      for (var j = 0; j < 12; j++) {
        if (j < 9) {
          jaux = "0" + (j+1);
        } else {
          jaux = (j+1);
        };

        monthOptions = monthOptions + '<option value="' + jaux + '">' + lang('dates.monthsNames_' + j) + '</option>';
      };

      // year list
      for (var i = currentyear; i > currentyear-131; i--) {
        yearOptions = yearOptions + '<option value="' + i + '">' + i + '</option>';
      };

      $(".filter_date_day_input").html(dayOptions);
      $(".filter_date_month_input").html(monthOptions);
      $(".filter_date_year_input").html(yearOptions);

      // update combos if date is set
      var hiddenDateFieldList = $("[id$='activity_from']");
      hiddenDateFieldList.each(function(){
        if($(this).val() != ""){
          var targetId  = $(this).attr("id");
          var dateParts = $("#"+targetId).val().split("/");

          $('.' + targetId + '.filter_date_day_input').val(dateParts[2]).trigger('change', [true]);
          $('.' + targetId + '.filter_date_month_input').val(dateParts[1]).trigger('change', [true]);
          $('.' + targetId + '.filter_date_year_input').val(dateParts[0]).trigger('change', [true]);
        };
      });

      hiddenDateFieldList = $("[id$='activity_to']");
      hiddenDateFieldList.each(function(){
        if($(this).val() != ""){
          var targetId  = $(this).attr("id");
          var dateParts = $("#"+targetId).val().split("/");

          $('.' + targetId + '.filter_date_day_input').val(dateParts[2]).trigger('change', [true]);
          $('.' + targetId + '.filter_date_month_input').val(dateParts[1]).trigger('change', [true]);
          $('.' + targetId + '.filter_date_year_input').val(dateParts[0]).trigger('change', [true]);
        };
      });
    },
    flightDateActions: function() {
      $(".date_input").change(function() {
        var inputtarget = $(this).attr("data-input-target");

        // reset value of the hidden date input
        $("#" + inputtarget).val("");

        var dayValue   = $("." + inputtarget + ".date_day_input").val();
        var monthValue = $("." + inputtarget + ".date_month_input").val()
        var yearValue  = $("." + inputtarget + ".date_year_input").val()

        if (dayValue != "" && monthValue != "" && yearValue != "") {
          // set and validate hidden date input
          var finaldate = dayValue + "/" + monthValue + "/" + yearValue;
          $("#" + inputtarget).val(finaldate);

          $("#" + inputtarget).closest(".age").trigger('validate');
          $("#" + inputtarget).focus();

          // set/unset error class to all date combos
          if ($("#" + inputtarget).closest(".age").hasClass("error")) {
            $("." + inputtarget).closest('.select_field').addClass("errorper");
          } else {
            $("." + inputtarget).closest('.select_field').removeClass("errorper");

            /* Focus current element */
            $(this).focus();
          }
        }
      });
    },
    filterDateActions: function() {
      $(".filter_date_input").change(function() {
        var inputtarget = $(this).attr("data-input-target");

        // reset value of the hidden date input
        $("#" + inputtarget).val("");

        var dayValue   = $("." + inputtarget + ".filter_date_day_input").val();
        var monthValue = $("." + inputtarget + ".filter_date_month_input").val()
        var yearValue  = $("." + inputtarget + ".filter_date_year_input").val()

        if (dayValue != "" && monthValue != "" && yearValue != "") {
          // set and validate hidden date input
          var finaldate = dayValue + "/" + monthValue + "/" + yearValue;
          $("#" + inputtarget).val(finaldate);

          $("#" + inputtarget).closest(".age").trigger('validate');
          $("#" + inputtarget).closest(".age").focus();

          // set/unset error class to all date combos
          if ($("#" + inputtarget).closest(".age").hasClass("error")) {
            $("." + inputtarget).closest('.select_field').addClass("errorper");
          } else {
            $("." + inputtarget).closest('.select_field').removeClass("errorper");
          }
        }

        // trigger validate on the second date field (and set errors if it's needed)
        var originFieldId = $("#" + inputtarget).closest('form.standard_form').find('.compare_date input').attr('id');

        $("#" + originFieldId).closest(".age").trigger('validate');
        $("#" + originFieldId).closest(".age").focus();

        if ($("#" + originFieldId).closest(".age").hasClass("error")) {
          $("." + originFieldId).closest('.select_field').addClass("errorper");
          $("#" + originFieldId).closest(".age").addClass('focused');
        } else {
          $("." + originFieldId).closest('.select_field').removeClass("errorper");
          $("#" + originFieldId).closest(".age").removeClass('focused');
        }

        // update rest of selects and set require true or false depending on select value
        if ((dayValue != "" || monthValue != "" || yearValue != "") && ($("." + inputtarget).closest('.field[data-required=true]').length == 0)) {
          $("." + inputtarget).closest('.field').attr('data-required', 'true');
          $("." + inputtarget).closest('.field').attr('data-init', 'restart');

          $("#" + inputtarget).closest('form').form('restartFields');
        } else if (dayValue == "" && monthValue == "" && yearValue == "" && ($("." + inputtarget).closest('.field[data-required=true]').length != 0)) {
          $("." + inputtarget).closest('.field').attr('data-required', 'false');
          $("." + inputtarget).closest('.field').attr('data-init', 'restart');

          $("#" + inputtarget).closest('form').form('restartFields');
        }
      });
    },
    activityPagination: function () {
      this.element.find('.miles_activity table').dataTable({
        pagingType: "full_numbers",
        info: false,
        pageLength: 10,
        searching: false,
        ordering: false,
        lengthChange: false
      });
      this.table = this.element.find('.miles_activity table').DataTable();
    },
    initActivityForm: function ($formActivity) {
      var self = this;

      $formActivity.form({
        onSubmit: function (form) {
          /* Avoid double click disabling the button */
          form.element.find('.submit .submit_button button').attr('disabled', 'disabled').addClass('loading');

          var service = {
            data: {},
            userId: localStorage.ly_userId,
            success: function (response) {
              var data = {
                user: {
                  operation: []
                }
              };
              /* Check if header error */
              if (response.header && !response.header.error) {
                for (var i = 0; i < response.body.data.length; i++) {
                  var operation = response.body.data[i];
                  data.user.operation.push({
                    bookingClass: operation.bookingClass,
                    departure: (typeof operation.departure !== 'undefined') ? operation.departure.code : '',
                    description: operation.description,
                    destination: (typeof operation.arrival !== 'undefined') ? operation.arrival.code : '',
                    flight: operation.flightNumber,
                    miles: operation.miles,
                    levelMiles: operation.levelMiles,
                    partner: operation.partner,
                    transactionDate: operation.operationDate,
                    transactionTypeCode: operation.loyaltyOperationType.code,
                    transactionType: operation.loyaltyOperationType.description
                  });
                }
              } else {
                data = response;
              }
              self.table.destroy();
              self.clearActivity();
              self.fillActivity(data);

              form.element.find('.submit .submit_button button').removeAttr('disabled').removeClass('loading');
            }
          };

          service.data = self.getFormActivityData(service.data, form.element);

          Bus.publish('services', 'getLoyaltyOperations', service);
        }
      });

      $formActivity.find('#activity_from, #activity_to').on('change', function () {
        var $from = $('#activity_from');
        var $to = $('#activity_to');
        var $fromField = $from.closest('.field');
        var $toField = $to.closest('.field');

        if ($from.val() !== '' || $to.val() !== '') {
          if ($fromField.attr('data-required') !== 'true') {
            $fromField.attr('data-required', 'true').removeClass('valid filled');
          }
          if ($toField.attr('data-required') !== 'true') {
            $toField.attr('data-required', 'true').removeClass('valid filled');
          }
        } else {
          $fromField.attr('data-required', 'false');
          $toField.attr('data-required', 'false');
        }

        $fromField.attr('data-init', 'restart');
        $toField.attr('data-init', 'restart');

        /* Reassign forms to validate changes */
        $fromField.closest('form').form('restartFields');
      });

      $('#download_miles_pdf').on('click', function () {
        Bus.publish('services', 'getLoyaltyOperationsPdf', {
          data: self.getFormActivityData($formActivity, {}),
          userId: localStorage.ly_userId,
          success: function (response) {
          }
        });
        return false;
      });
      $('#download_miles_excel').on('click', function () {
        Bus.publish('services', 'getLoyaltyOperationsXls', {
          data: self.getFormActivityData($formActivity, {}),
          userId: localStorage.ly_userId,
          success: function (response) {
          }
        });
        return false;
      });
    },
    clearActivity: function () {
      var rows = this.element.find('.miles_activity table tbody tr');
      rows.remove();
    },
    getFormActivityData: function (data, $form) {
      if (typeof $form.serializeObject === 'undefined') {
        $form = $($form);
      }
      var source = $form.serializeObject();

      if (source.activity_partner !== '') {
        data.partner = source.activity_partner;
      }
      if (source.activity_from !== '') {
        data.startDate = source.activity_from;
      }
      if (source.activity_to !== '') {
        data.endDate = source.activity_to;
      }
      if (source.activity_from === '' && source.activity_partner === '' && source.activity_to === '') {
        data.numberRecords = AirEuropaConfig.miles.numResults;
      }

      return data;
    },
    fillActivity: function (data) {
      var self = this;

      var module = 'loyalty_miles';
      var page = 'activity_table';
      var templatePath = AirEuropaConfig.templates[module][page];

      /* Get the structure template */
      Bus.publish('ajax', 'getTemplate', {
        path: templatePath,
        success: function (template) {

          /* Render the template */
          var renderedHtml = template(data);
          var $html = $(renderedHtml);

          /* Append new inner content */
          self.element.find('.miles_activity table tbody').append($html);
          self.activityPagination();

          /* If data.header.error, show class and put message into table content */
          if (data.header && data.header.error) {
            $('.dataTables_empty').show();
            $('.dataTables_empty').html(data.header.message);
          }
        }
      });
    },
    showLoyaltyDetail: function (callback) {
      Bus.publish('scroll', 'scrollTo', {
        position: this.element.find('.inner_content #detail').offset().top - this.element.find('.nav_bar').outerHeight(),
        callback: function () {
          /* Execute callback if it's defined */
          if (callback) {
            callback();
          }
        }
      });
    },
    showLoyaltyActivityList: function (callback) {
      Bus.publish('scroll', 'scrollTo', {
        position: this.element.find('.inner_content #activity').offset().top - this.element.find('.nav_bar').outerHeight() + 2,
        callback: function () {
          /* Execute callback if it's defined */
          if (callback) {
            callback();
          }
        }
      });
    },
    scrollFormError: function ($form) {
      //var pos = $form.find('.fields').offset().top + $('.nav_bar').height();
      var $field = $form.find('.error').first();
      var pos = $field.offset().top - $('.nav_bar').height() - 70;

        /* Scroll to the first field with error */
        Bus.publish('scroll', 'scrollTo', {position: pos});
    }
  };
});