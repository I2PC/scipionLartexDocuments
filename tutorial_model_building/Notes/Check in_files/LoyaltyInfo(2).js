Hydra.module.register('LoyaltyInfo', function (Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#content.loyalty_info',
    element: undefined,
    lastCheckCardValue: '',
    events: {
      'loyalty_info': {
        'custom_init': function () {
          this.customInit();
          Bus.publish('prerender', 'restart');
        }
      }
    },

    sqlEscape: function (str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; 
        }
    });
  },

    strEscapeObject: function(object) {
      var self = this;
      _.each(object, function (value, key) {
            if(typeof (value) == 'string'){
              object[key] = self.sqlEscape(value);
            }else if(typeof (value) == 'object'){
              self.strEscapeObject(value);
            }
          });
    },


    init: function () {
      //this.customInit();
    },
    customInit: function () {
      var self = this;

      Bus.publish('loyalty', 'loyalty_info_data_list', {callback: function (listsData) {
          self.listsData = listsData;
        }});

      /* Save jquery object reference */
      this.element = $(this.selector);

      /* Init forms */
      this.initForms();
      this.documentType();
      this.phoneType();
      this.initFieldBirthdate();
      this.initFieldCardExpiration();
      this.birthdateActions();
      this.cardExpirationActions();

      /* Control unsubscribe confirm buttons */
      this.initConfirmUnsubscribe('.my_info_unsubscribe', 'my_info_unsubscribe.confirm_title', 'my_info_unsubscribe.dialog_body', 'my_info_unsubscribe.unsubscribe_confirm', 'my_info_unsubscribe.close_dialog', function ($dialog) {
        self.onUnsubscribeConfirmed(self, $dialog);
      });

      this.initConfirmUnsubscribe('.my_info_unsubscribe_newsletter', 'my_info_unsubscribe.confirm_title_newsletter', 'my_info_unsubscribe.dialog_body_newsletter', 'my_info_unsubscribe.unsubscribe_confirm_newsletter', 'my_info_unsubscribe.close_dialog_newsletter', this.onUnsubscribeNewsletterConfirmed);
      /* listen when user remove the payment method */

      /* Change password dialog */
      this.listenChangePasswordTrigger();

      this.frequentFlyerCheck();
      this.listenAddressChange();
      
      this.checkAgeCepsa();

    },
    /* Uses document type in order to display fields */
    documentType: function () {
      var $documentBlocks = this.element.find('.document_block');
      var self = this;

      $documentBlocks.each(function () {
        var $this = $(this);
        var $type = $this.find('.document_type').not('.non_editable');
        var $number = $this.find('.document_number');
        var $country = $this.find('.document_country');
        var $expiration = $this.find('.document_expiration');
        var $expiration_selects = $this.find('.passport_accordeon');
        var $expiration_selects_requierd = $this.find('.passport_accordeon .field.select_field.small');
        var firstLoad = true;

        /* Document type change event, depending on which document type the user selects we have to apply different rules */
        $type.find('select').on('change', function () {

          /* Get select value and text */
          var $select = $(this);
          var $option = $select.find('option:selected');
          var value = $option.attr('value');

          /* Document number text field with no background color by default */
          $number.find('input').closest('.field').removeClass('non_editable');

          /* Passport */
          if (value === 'PP') {
            /* Required status */
            $number.attr('data-required', 'true').removeClass('valid filled');
            $number.removeAttr('data-format');
            $country.attr('data-required', 'true').removeClass('valid filled').slideDown();
            $expiration.attr('data-required', 'true').attr('data-format', 'expiration').addClass('half').removeClass('valid filled full').slideDown();
            $expiration_selects_requierd.attr('data-required', 'true');
            $expiration_selects.slideDown();

            /* Format status */
            $number.removeAttr('data-format');
          }

          /* DNI / Congress */
          else if (value === 'NI' || value === 'GR') {
            /* Required status */
            $number.attr('data-required', 'true').removeClass('valid filled');
            $number.attr('data-format', 'dni');
            $country.attr('data-required', 'false').removeClass('valid filled').slideUp();

            $expiration.attr('data-required', 'false').removeAttr('data-format').removeClass('valid filled').slideUp();
            $expiration_selects_requierd.attr('data-required', 'false');
            $expiration_selects.slideUp();

            /* Format status */
            $number.attr('data-format', 'dni');
          }

          /* European ID */
          else if (value == 'DL') {
            /* Required status */
            $number.attr('data-required', 'true').removeClass('valid filled');
            $country.attr('data-required', 'false').removeClass('valid filled').slideUp();
            $expiration.attr('data-required', 'false').removeAttr('data-format').removeClass('valid filled').slideUp();
            $expiration_selects_requierd.attr('data-required', 'false');
            $expiration_selects.slideUp();

            /* Format status */
            $number.attr('data-format', 'passport');
          }

          /* NIE */
          else if (value == 'ID') {
            /* Required status */
            $number.attr('data-required', 'true').removeClass('valid filled');
            $number.attr('data-format', 'nie');
            $country.attr('data-required', 'false').removeClass('valid filled').slideUp();
            $expiration.attr('data-required', 'false').removeAttr('data-format').removeClass('valid filled').slideUp();
            $expiration_selects_requierd.attr('data-required', 'false');
            $expiration_selects.slideUp();

            /* Format status */
            $number.attr('data-format', 'nie');
          }

          /* Under 14, no ID */
          else if (value == 'MN') {
            /* Required status */
            $number.attr('data-required', 'false');
            $country.attr('data-required', 'false').slideUp();
            $expiration.attr('data-required', 'false').removeAttr('data-format').slideUp();
            $expiration.attr('data-required', 'false').removeAttr('data-format').slideUp();
            $expiration_selects.slideUp();

            /* Format status */
            $number.removeAttr('data-format');

            /* Put document number text field in grey #dadada */
            $number.find('input').closest('.field').addClass('non_editable');
          }

          /* Restart fields */
          if (!firstLoad) {
            $number.attr('data-init', 'restart');
            $country.attr('data-init', 'restart');
            $expiration.attr('data-init', 'restart');
            $expiration_selects_requierd.attr('data-init', 'restart');

            /* Reassign forms to validate the added fields */
            $select.closest('form').form('restartFields');
          }

        });

        if($type.find('select').val()){
          $number.attr('data-init', 'restart');
          $type.find('select').trigger('change');
          $number.closest('form').form('restartFields');
        }

        firstLoad = false;
      });
    },

    phoneType: function() {
      this.element.find('.phone_type select, .phone_prefix select, .phone_number input').on('change', function() {
        var $this = $(this);
        var $mainForm = $this.closest('form');

        var $phoneType = $mainForm.find('.phone_type');
        var $phoneTypeOption = $this.find('option:selected');
        var typeValue = $phoneTypeOption.attr('value');

        var $phonePrefix = $mainForm.find('.phone_prefix');
        var $phonePrefixOption = $phonePrefix.find('option:selected');
        var prefixValue = $phonePrefixOption.attr('value');

        var $phoneNumber = $mainForm.find('.phone_number');
        var numberValue = $phoneNumber.find('input').val();

        if (typeValue || prefixValue || numberValue) {
          $phoneType.attr('data-required', 'true').trigger('validate');
          $phonePrefix.attr('data-required', 'true').trigger('validate');
          $phoneNumber.attr('data-required', 'true').trigger('validate').find('.helper').hide();
        }
        else {
          $phoneType.attr('data-required', 'false').removeClass('error');
          $phonePrefix.attr('data-required', 'false').removeClass('error');
          $phoneNumber.attr('data-required', 'false').removeClass('error valid').find('.helper').show();
        }

        $phoneType.attr('data-init', 'restart');
        $phonePrefix.attr('data-init', 'restart');
        $phoneNumber.attr('data-init', 'restart');
        $mainForm.form('restartFields');
      });

      this.element.find('.phone_type select, .phone_prefix select, .phone_number input').trigger('change');
    },

    /* Extract form data and prepare frequent passenger object */
    getFrequentPassenger: function (data, getIndex) {
      if (typeof getIndex === 'undefined') {
        getIndex = false;
      }
      var index = (getIndex) ? data.companion_index : 'add';
      data = data.companion[index];
      var honorific = (getIndex) ? parseInt(data.field_honorific) : data.field_honorific;
      var object = {
        'identity': data.field_id,
        'name': data.field_name,
        'surname': data.field_surname,
        'surname2': data.field_second_surname,
        'addressAs': honorific,
        //"user": false, /* @todo check: documented but not in form */
        'email': data.field_email,
        'identificationDocument': {
          'documentType': {
            'code': data.field_document_type
          },
          'identity': data.field_document_number
        },
        'country': {
          'code': data.field_document_nationality
        },
        'telephone': data.field_phone,
        'birthday': data.field_birthdate,
        'resident': (data.field_resident_discount === '1'),
        'residentTown': {
          'code': data.field_resident_discount_city
        },
        'frequentFlyer': (data.field_frequent_flyer === '1'),
        'frequentFlyerType': data.field_frequent_flyer_type, /* @todo check: not documented */
        'frequentFlyerIdentity': data.field_frequent_flyer_number /* @todo check: not documented */
      };

      if ((data.field_large_family === '1')) {
        object.largeFamily = (data.field_large_family === '1');
        object.largeFamilyCommunity = data.field_large_family_region;
        object.largeFamilyTypeSubvention = data.field_large_family_type;
        object.largeFamilyIdentity = data.field_large_family_number;
      }

      return object;
    },
    /* Extract communicationTypes from $formPreferences data */
    getPreferenceCommunication: function (data) {
      var preferenceCommunication = [];

      if ((data.field_communication_app === '1')) {
        preferenceCommunication.push('APP');
      }

      if ((data.field_communication_mail === '1')) {
        preferenceCommunication.push('MAIL');
      }

      if ((data.field_communication_phone === '1')) {
        preferenceCommunication.push('PHONE');
      }

      if ((data.field_communication_mobile === '1')) {
        preferenceCommunication.push('MOBILE');
      }

      if ((data.field_communication_app_social === '1')) {
        preferenceCommunication.push('APP_SOCIAL');
      }

      if ((data.field_communication_web === '1')) {
        preferenceCommunication.push('WEB');
      }

      return preferenceCommunication;
    },
    /* Extracts user from form data */
    getUser: function (data) {
      var addressType = (data.field_loyalty_address_type === '') ? null : data.field_loyalty_address_type;
      var phone = (data.field_loyalty_phone === '') ? null : data.field_loyalty_phone;
      var phonePrefix = (data.field_loyalty_phone_prefix === '') ? null : data.field_loyalty_phone_prefix;
      var phoneType = (data.field_loyalty_phone_type === '') ? null : data.field_loyalty_phone_type;
      var object = {
        telephone: {
          type: phoneType,
          prefix: phonePrefix,
          number: phone
        },
        loyaltyAddress: {
          typeRoad: addressType,
          street: data.field_loyalty_street,
          streetNumber: data.field_loyalty_street_number,
          additionalAddress: data.field_loyalty_additional_address,
          city: data.field_loyalty_address_city,
          state: data.field_loyalty_address_state,
          postalCode: data.field_loyalty_zip_code,
          country: {
            code: data.field_loyalty_address_country
          }
        },
        title: data.field_loyalty_honorific,
        citizenship: {
          code: data.field_loyalty_document_nationality
        },
        emergencyTelephone: data.field_loyalty_emergency_contact_phone,
        emergencyName: data.field_loyalty_emergency_contact_name        
      };

      if (data.field_loyalty_resident_discount === '1') {
        object.resident = {
          resident: true,
          residentTown: {
            code: data.field_loyalty_resident_discount_city
          }
        };
      }
      else {
        object.resident = {
          resident: false,
          residentTown: {
            code: null
          }
        };
      }

      if (data.field_loyalty_large_family === '1') {

        object.largeFamily = {
          largeFamily: true, // (data.field_loyalty_large_family === '1'),
          largeFamilyCommunity: {
            code: data.field_loyalty_large_family_region
          },
          largeFamilyTypeSubvention: data.field_loyalty_large_family_type,
          largeFamilyIdentity: data.field_loyalty_large_family_number
        };
      }
      else {
        object.largeFamily = {
          largeFamily: false
        };
      }

      return object;
    },
    /* Confirm unsubscribe button */
    initConfirmUnsubscribe: function (link, title, subtitle, confirm, close, processConfirmed) {
      var self = this;
      /* Show confirm window on click event */
      var $linkElement = this.element.find(link + ' a');
      $linkElement.off('click');
      $linkElement.on('click', function (event) {
        event.preventDefault();
        self.element.ui_dialog({
          title: lang(title),
          error: false,
          subtitle: lang(subtitle),
          close: {
            behaviour: 'close',
            href: '#'
          },
          buttons: [
            {
              className: 'close',
              href: '#',
              label: lang(close)
            },
            {
              className: 'unsubscribe_process return',
              href: '#',
              label: lang(confirm)
            }
          ],
          render: function ($dialog) {
            $dialog.on('click', '.unsubscribe_process a', function (event) {
              event.preventDefault();
              $dialog.find('.dialog_content').append('<span class="dialog_spinner"><span class="spinner"></span><strong class="spinner_text">' + lang('inner.loading') + '</strong></span>').addClass('spinner');

              processConfirmed($dialog);
            });
          }
        });
      });
    },
    /* Init forms */
    initForms: function () {
      var self = this;
      var $formInfo = this.element.find('form.form_my_info');
      var $formCompanionAdd = this.element.find('form.form_add_companion');
      var $formPreferences = this.element.find('form.form_preferences');
      var $formMobilePreferences = this.element.find('form.form_mobile_preferences');
      var $formAddPayment = this.element.find('form.add_payment_form');

      var $countrySelect = this.element.find('#field_loyalty_adddress_country');

      var $regionSelect = this.element.find('#field_region');


      var $layerCountrySelect = $countrySelect.closest('.select_field');

      var $regionInput = this.element.find('#field_loyalty_address_state');
      var $layerRegionInput = $regionInput.closest('.text_field');

      var $regionSelect = this.element.find('#field_region');
      var $layerRegionSelect = $regionSelect.closest('.select_field');
      

      var $documentNationality = this.element.find('#field_loyalty_document_nationality');
      var $initialCountry = '';
      var $initialState = true;



      $countrySelect.on('change', function(){
        var $this = $(this);

        $regionSelect.parent().find('label').text(lang('my_card.field_state'));
        $regionSelect.closest('label').text(lang('my_card.field_state'));

        if ($this.val()!=''){



          Bus.publish('services', 'getRegionFromCountry', {
            countryCode: $this.val(),
            success: function(data) {
              var optionsHtml = '';
              if (!data || !data.header || !data.header.error) {
                optionsHtml = '<option value=""></option>';
                $.each(data.body.data, function(indexReg, dataReg){
                  optionsHtml += '<option value="'+dataReg.description+'">'+dataReg.description+'</option>';
                });
                $regionSelect.html(optionsHtml);


                $layerRegionSelect.removeClass('hidden').removeClass('disabled');
                $layerRegionSelect.removeClass('error valid filled');
                $layerRegionSelect.attr('data-init', 'restart');

                if($initialState && $regionInput.val() != ''){
                  $regionSelect.parent().find('label').text($regionInput.val());
                  $initialState = false;
                } else {
                  //$regionSelect.parent().find('label').text(lang('my_card.field_state'));
                }

                /* Hide input */
                $layerRegionInput.addClass('hidden').addClass('disabled');
                $layerRegionInput.find('input').val('');




                /* Change tabindex */
                var tabindex = $layerRegionInput.find('input').attr('tabindex');
                $layerRegionSelect.find('select').attr('tabindex',tabindex);
                $layerRegionInput.find('input').attr('tabindex','');



              } else {
                $layerRegionInput.removeClass('hidden').removeClass('disabled');
                $layerRegionSelect.addClass('hidden').addClass('disabled');

                if($initialState != true) {
                  $layerRegionInput.find('input').val('');
                }

              }
              $this.closest('form').form('restartFields');

            }
          });
        }
          
      });

      $regionSelect.on('change', function(){
        var $this = $(this);
        $regionInput.val($this.val());
      });

      // Forzamos el change del pais para que carge el combo de las provincias
      $countrySelect.val() != '' ? $initialCountry = $countrySelect.val() : $initialCountry = $documentNationality.val();
      $countrySelect.val($initialCountry).trigger('change');


      if (($formInfo.length === 0)
              && ($formPreferences.length === 0)
              && ($formMobilePreferences.length === 0)
              && ($formCompanionAdd.length === 0)
              && ($formAddPayment.length === 0)) {
        return;
      }

      /* Init info form */
      $formInfo.form({
    	onError: function (form) {
    		self.showFormError(form.element);
    	},
        onSubmit: function (form) {
          var data = form.element.serializeObject();
          var object = self.getUser(data);

          /* Avoid double click disabling the button */
          form.element.find('.submit .submit_button button').attr('disabled', 'disabled').addClass('loading');

           //postObject.streetNumber = "' and 1=1--";

          self.strEscapeObject(object);

          Bus.publish('services', 'updateUser', {
            userId: localStorage.ly_userId,
            data: object,
            success: function (response) {
              if (!response.header.error) {
                self.element.ui_dialog({
                  title: lang('my_info.update_title'),
                  error: false,
                  subtitle: lang('my_info.update_message'),
                  close: {
                    behaviour: 'close',
                    href: '#'
                  },
                  buttons: [
                    {
                      className: 'close',
                      href: '#',
                      label: lang('my_info.update_close_dialog')
                    }
                  ],
                  render: function ($dialog) {
                    $dialog.on('click', 'a', function (event) {
                      event.preventDefault();
                    });
                  }
                });
              } else {
                self.element.ui_dialog({
                  title: lang('general.error_title'),
                  error: true,
                  subtitle: response.header.message,
                  close: {
                    behaviour: 'close',
                    href: '#'
                  },
                  buttons: [
                    {
                      className: 'close',
                      href: '#',
                      label: lang('my_info.update_close_dialog')
                    }
                  ],
                  render: function ($dialog) {
                    $dialog.on('click', 'a', function (event) {
                      event.preventDefault();
                    });
                  }
                });
              }

              form.element.find('.submit .submit_button button').removeAttr('disabled').removeClass('loading');
            }
          });
        }
      });

      this.initFormCompanionCurrent();

      this.initFormPaymentMethods();

      /* Delete current actions */
      this.initDeleteButtons();

      /* Init add companion form */
      $formCompanionAdd.form({
        onError: function (form) {
          self.scrollFormError(form.element);
        },
        onSubmit: function (form) {
          var data = form.element.serializeObject();
          var object = self.getFrequentPassenger(data);

          /* Avoid double click disabling the button */
          form.element.find('.submit .submit_button button').attr('disabled', 'disabled').addClass('loading');

          Bus.publish('services', 'addFrequentPassengers', {
            userId: localStorage.ly_userId,
            data: object,
            success: function (response) {
              var subtitle;
              var success = !response.header.error;

              form.element.find('.submit .submit_button button').removeAttr('disabled').removeClass('loading');

              if (success) {
                /* Clear form */
                form.element.trigger('reset');
                form.element.find('.select_field select').trigger('change');
                form.element.find('.field.checkbox input').trigger('change');
                form.element.find('.field').attr('data-init', 'restart').removeClass('filled');
                form.restartFields();

                var passengerId = response.body.data.identity;
                subtitle = lang('my_info_companion.add_subtitle_ok');

                /* scroll to top */
                Bus.publish('scroll', 'scrollTo', { position : 0 });
              } else {
                subtitle = response.header.message || lang('my_info_companion.add_subtitle_ko');
              }
              self.element.ui_dialog({
                title: lang('my_info_companion.add_title'),
                error: response.header.error,
                subtitle: subtitle,
                close: {
                  behaviour: 'close',
                  href: '#'
                },
                buttons: [
                  {
                    className: 'close',
                    href: '#',
                    label: lang('my_info_companion.add_close')
                  }
                ],
                render: function ($dialog) {
                  $dialog.on('click', 'a', function (event) {
                    event.preventDefault();
                    if (success) {
                      var $itemList = $('#item_list');
                      object.index = parseInt($itemList.attr('data-index'));
                      object.identity = passengerId;
                      Bus.publish('ajax', 'getTemplate', {
                        data: {
                          frequent_passenger: object,
                          listsData: self.listsData
                        },
                        path: AirEuropaConfig.templates.loyalty_info.companion_row,
                        success: function (template) {
                          $itemList.attr('data-index', object.index + 1).append(template);
                          Bus.publish('inner', 'reloadExpandableBlocks');

                          var $documentBlocks = self.element.find('.document_block');
                          $documentBlocks.each(function () {
                            var $this = $(this);
                            var $type = $this.find('.document_type').not('.non_editable');

                            /* Document type change event, depending on which document type the user selects we have to apply different rules */
                            $type.find('select').unbind('change');
                          });
                          
                          self.initFormCompanionCurrent();
                          
                          self.documentType();
                          self.initDeleteButtons();
                          /* Init adult check comprobation in form */
                          self.initAdultCheck($formCompanionAdd);
                          $("form.form_current_companion").each(function() {
                        	  self.initAdultCheckEdit($(this));
                          })
                          /* Init date info */
                          self.initFieldBirthdate();
                          self.birthdateActions();
                        }
                      });

                    }
                  });
                }
              });
            }
          });

        }
      });

      /* Init adult check comprobation in form */
      self.initAdultCheck($formCompanionAdd);
      $("form.form_current_companion").each(function() {
    	  self.initAdultCheckEdit($(this));
      })

      //self.listenCepsa('#field_register_data_cession_cepsa_wrapper','#field_register_data_cession_cepsa_conditions_wrapper', $formPreferences);

      /* Init preferences form */
      $formPreferences.form({
        onSubmit: function (form) {
          var data = form.element.serializeObject();

          /* Avoid double click disabling the button */
          form.element.find('.submit .submit_button button').attr('disabled', 'disabled').addClass('loading');

          Bus.publish('services', 'updatePreferences', {
            userId: localStorage.ly_userId,
            data: {
              language: data.field_loyalty_language,
              loyaltySubscriptionType: (data.field_preferences_comunication === 'on') ? 'NONE' : 'ONLY_AIREUROPA',
              communicationTypes: self.getPreferenceCommunication(data),
              appPreference: {
                historySearch: (data.save_search === '1'),
                contactAccess: (data.field_contact_access === '1'),
                geolocation: (data.field_geolocation === '1'),
                alert: (data.field_alert === '1'),
                allowAnalytics: (data.field_allow_analytics === '1'),
                timelinePreference: {
                  timeLineBaggageBelt: (data.field_baggage_belt === '1'),
                  timeLineBookings: (data.recover_booking === '1'),
                  timeLineCloseCki: (data.closing_checkin === '1'),
                  timeLineHelp: (data.help === '1'),
                  timeLineOpenCki: (data.opening_checkin === '1'),
                  timeLineParkingRemainder: (data.field_parking_reminder === '1'),
                  timeLineStartBoarding: (data.init_boarding === '1'),
                  timeLineWelcome: (data.welcome === '1'),
                  timeLineLoyaltyWelcome: (data.field_loyalty_welcome === '1'),
                  timeLineLoyaltyMiles: (data.field_loyalty_miles === '1')
                }
              },
              cepsaPTV: (data.field_cepsa_ptv === '1'),
              preferenceAirport: data.field_loyalty_preference_airport
            },
            success: function (response) {

              if (!response.header.error) {
                self.element.ui_dialog({
                  title: lang('my_info.update_preferences_title'),
                  error: false,
                  subtitle: lang('my_info.update_preferences_message'),
                  close: {
                    behaviour: 'close',
                    href: '#'
                  },
                  buttons: [
                    {
                      className: 'close',
                      href: '#',
                      label: lang('my_info.update_close_dialog')
                    }
                  ],
                  render: function ($dialog) {
                    $dialog.on('click', 'a', function (event) {
                      event.preventDefault();

                      if (data.field_cepsa_ptv === '1') {
                        form.element.find('#field_register_cepsa_active_wrapper').removeClass('hidden');

                        form.element.find('#field_register_data_cession_cepsa_wrapper').addClass('hidden');
                        //form.element.find('#field_register_data_cession_cepsa_conditions_wrapper').addClass('hidden');
                      }
                    });
                  }
                });
              } else {
                self.element.ui_dialog({
                  title: lang('general.error_title'),
                  error: true,
                  subtitle: response.header.message,
                  close: {
                    behaviour: 'close',
                    href: '#'
                  },
                  buttons: [
                    {
                      className: 'close',
                      href: '#',
                      label: lang('my_info.update_preferences_close_dialog')
                    }
                  ],
                  render: function ($dialog) {
                    $dialog.on('click', 'a', function (event) {
                      event.preventDefault();
                    });
                  }
                });
              }

              form.element.find('.submit .submit_button button').removeAttr('disabled').removeClass('loading');
            }
          });
        }
      });
      /* Init mobile preferences form */
      $formMobilePreferences.form({
        onSubmit: function (form) {
        }
      });

      /* Init add payment form */
      $formAddPayment.form({
        onError: function (form) {
          self.scrollFormError(form.element);
        },
        onSubmit: function (form) {
          var object = form.element.serializeObject();
          /* complete object data to send to the service */
          object.userName = localStorage.ly_userName;

          /* Avoid double click disabling the button */
          form.element.find('.submit .submit_button button').attr('disabled', 'disabled').addClass('loading');

          Bus.publish('services', 'savePaymentMethod', {
            userId: localStorage.ly_userId,
            data: object,
            success: function (response) {
              /* @todo Get alias and hashId from response */
              var code = response.header.code;
              var error = response.header.error;
              var message = response.header.message;
              var hashId;

              if (error && code !== 12105) {

                if (code === undefined){
                  self.element.ui_dialog({
                    title: lang('general.info_error_title'),
                    error: false,
                    subtitle: response.header.message,
                    close: {
                      behaviour: 'close',
                      href: '#'
                    },
                    buttons: [
                      {
                        href: urlCms('home'),
                        label: lang('my_info.close_home_dialog')
                      }
                    ]
                  });
                }
                else if (code === 400) {

                  /* Quitar spinner */
                  self.showFieldErrors($formAddPayment, response.body.data);

                } else {
                  self.element.ui_dialog({
                    title: lang('general.info_error_title'),
                    error: false,
                    subtitle: response.header.message,
                    close: {
                      behaviour: 'close',
                      href: '#'
                    },
                    buttons: [
                      {
                        className: 'close',
                        href: '#',
                        label: lang('my_info.update_close_dialog')
                      }
                    ]
                  });
                  /* If credit card type is incorrect */
                  if (code === 4050 || code === 4052 || code === 4054) {
                    var identityCard = response.body.data.identity;

                    $correctIdentityCard = form.element.find('.credit_card_type option[value='+ identityCard +']');

                    /* Clean the select and mark the right identity card */
                    if ($correctIdentityCard.length > 0) {
                      form.element.find('.credit_card_type option:selected').prop('selected', false);

                      $correctIdentityCard.prop('selected', true);
                      $correctIdentityCard.closest('select').trigger('change', [true]);
                    }
                  }
                }

              } else {
                hashId = (response.body.data) ? response.body.data.hashId : '';

                /* Clear form */
                form.element.trigger('reset');
                form.element.find('.select_field select').trigger('change');
                form.element.find('.field.checkbox input').trigger('change');
                form.element.find('.field').attr('data-init', 'restart').removeClass('filled');
                form.restartFields();

                /* Reload payment_methods */
                Bus.publish('services', 'getUserPaymentMethods', {
                  userId: localStorage.ly_userId,
                  success: function (paymentMethods) {
                    paymentMethods = paymentMethods.body.data;
                    var numCards = 0;
                    var $itemList = $('#item_list');
                    $itemList.empty();
                    for (var i = 0; i < paymentMethods.length; i++) {
                      Bus.publish('ajax', 'getTemplate', {
                        data: {
                          payment_method: paymentMethods[i],
                          listsData: self.listsData,
                          hashId: hashId
                        },
                        path: AirEuropaConfig.templates.loyalty_info.payment_method_row,
                        success: function (template) {
                          $itemList.append(template);
                          numCards++;
                          if (numCards === paymentMethods.length) {
                            Bus.publish('inner', 'reloadExpandableBlocks');
                            self.initFormPaymentMethods();
                            self.initDeleteButtons();
                          }
                        }
                      });
                    }

                  }
                });

                /**/

                self.element.ui_dialog({
                  title: lang('my_info_payment.add_payment_exit_title'),
                  error: false,
                  subtitle: lang('my_info_payment.add_payment_exit_subtitle'),
                  close: {
                    behaviour: 'close',
                    href: '#'
                  },
                  buttons: [
                    {
                      className: 'close',
                      href: '#',
                      label: lang('my_info.update_close_dialog')
                    }
                  ],
                  render: function ($dialog) {
                    /* Buttons behaviour */
                    $dialog.find('.close a').on('click', function (event) {
                      event.preventDefault();
                    });
                  }
                });

              }

              form.element.find('.submit .submit_button button').removeAttr('disabled').removeClass('loading');
            }
          });

        }
      });
    },

    initAdultCheck: function($formCompanionAdd){
      /* Add birthday validation to do email field required or not ( <18 not requiered - >18 required ) */
    	$formCompanionAdd.find('select.companionAddFieldBirthdate').on('blur', function(){
        var $this = $(this);
        var $emailFieldLayer = $formCompanionAdd.find('.companionAddFieldEmail').closest('.field.text_field');
        var now = moment();
        var inputtarget = $this.attr("data-input-target");
        var birthdateInput = $formCompanionAdd.find("#" + inputtarget);
        if(birthdateInput.val() != '') {
	        var birthDay = moment(birthdateInput.val(), 'DD/MM/YYYY');
	        if (now.diff(birthDay, 'years') >= 18){
	          $emailFieldLayer.attr('data-required', 'true').removeClass('valid filled');
	          $emailFieldLayer.find('span.helper').hide();
	        }
	        else {
	          $emailFieldLayer.removeAttr('data-required', 'false').removeClass('valid filled');
	          $emailFieldLayer.find('span.helper').show();
	        }
	        $emailFieldLayer.attr('data-init', 'restart');
	        $formCompanionAdd.form('restartFields');
        }
      });
    },

    initAdultCheckEdit: function($formCompanionAdd){
      /* Add birthday validation to do email field required or not ( <18 not requiered - >18 required ) */
    	$formCompanionAdd.find('select.companionEditFieldBirthdate').on('blur', function(){
        var $this = $(this);
        var $emailFieldLayer = $formCompanionAdd.find('.companionAddFieldEmail').closest('.field.text_field');
        var now = moment();
        var inputtarget = $this.attr("data-input-target");
        var birthdateInput = $formCompanionAdd.find("#" + inputtarget);
        if(birthdateInput.val() != '') {
	        var birthDay = moment(birthdateInput.val(), 'DD/MM/YYYY');
	        if (now.diff(birthDay, 'years') >= 18){
	          $emailFieldLayer.attr('data-required', 'true').removeClass('valid filled');
	          $emailFieldLayer.find('span.helper').hide();
	        }
	        else {
	          $emailFieldLayer.removeAttr('data-required', 'false').removeClass('valid filled');
	          $emailFieldLayer.find('span.helper').show();
	        }
	        $emailFieldLayer.attr('data-init', 'restart');
	        $formCompanionAdd.form('restartFields');
        }
      });
    },

    /*listenCepsa: function(fieldCepsa, fieldCepsaConditions, $element){
      var $cepsa = $element.find(fieldCepsa);
      var $cepsaConditions = $element.find(fieldCepsaConditions);
      var $cepsaInput = $cepsa.find('input');

      $cepsaInput.on('click',function(event){

        if(!$(this).closest(fieldCepsa).hasClass('checked-cepsa')){
          $cepsaConditions.addClass('visible');
          $(this).closest(fieldCepsa).addClass('checked-cepsa');
          $cepsaConditions.attr('data-required', 'true');
        } else {
          $cepsaConditions.removeClass('visible').removeClass('checked');
          $(this).closest(fieldCepsa).removeClass('checked-cepsa');
          $cepsaConditions.find('input').prop('checked', false);
          $cepsaConditions.attr('data-required', 'false');
        }
        $cepsaConditions.attr('data-init', 'restart');
        $element.form('restartFields');
      });
    },*/

    initFieldCardExpiration: function () {
      var cadenameses = '';
      var cadenaanyos = '';
      var currentyear = (new Date).getFullYear();
      var currentmonth = (new Date).getMonth()+1;
      var iaux = '';
      var jaux = '';

      cadenaanyos = '<option value=""></option>';
      cadenameses = '<option value=""></option>';

      // month list
      for (var j = 0; j < 12; j++) {
        if(j < 10){
          jaux = "0" + (j+1);
        }else{
          jaux = (j+1);
        };

        cadenameses = cadenameses + '<option value="' + jaux + '">' + lang('dates.monthsNames_' + j) + '</option>';
      };

      // year list
      if (currentmonth == 12) {
        currentyear += 1;
      }
      for (var i = currentyear; i < currentyear+20; i++) {
        var valyearaux = i % 100;
        if(valyearaux < 10 ){
          valyearaux = "0" + valyearaux;
        }

        cadenaanyos = cadenaanyos + '<option value="' + valyearaux + '">' + i + '</option>';
      };

      $(".bmonth_input:not(.date-select-loaded)").html(cadenameses).addClass('date-select-loaded');
      $(".byear_input:not(.date-select-loaded)").html(cadenaanyos).addClass('date-select-loaded');

      // update combos if date is set
      var idsnecesariosc = $(".edate:not(.date-select-loaded)");
      idsnecesariosc.each(function(){
        if($(this).val() != ""){
          var targetId  = $(this).attr("id");
          var dateParts = $("#"+targetId).val().split("/");

          $('.' + targetId + '.byear_input').val(dateParts[1]).trigger('change', [true]);
          $('.' + targetId + '.bmonth_input').val(dateParts[0]).trigger('change', [true]);

          $(this).addClass('date-select-loaded');
        };
      });
    },

    initFieldBirthdate: function () {
      var cadenadias = '';
      var cadenameses = '';
      var cadenaanyosadult = '';
      var currentyear = (new Date).getFullYear();
      var iaux = '';
      var jaux = '';

      cadenaanyosadult = '<option value=""></option>';
      cadenadias       = '<option value=""></option>';
      cadenameses      = '<option value=""></option>';

      // day list
      for (var i = 1; i < 32; i++) {
        if(i < 10){
          iaux = "0" + i;
        }else{
          iaux = i;
        };

        cadenadias = cadenadias + '<option value="' + iaux + '">' + i + '</option>';
      };

      // month list
      for (var j = 0; j < 12; j++) {
        if(j < 9){
          jaux = "0" + (j+1);
        }else{
          jaux = (j+1);
        };
        cadenameses = cadenameses + '<option value="' + jaux + '">' + lang('dates.monthsNames_' + j) + '</option>';
      };

      // year list
      for (var i = currentyear; i > currentyear-131; i--) {
        cadenaanyosadult = cadenaanyosadult + '<option value="' + i + '">' + i + '</option>';
      };

      $(".bday_input:not(.date-select-loaded)").html(cadenadias).addClass('date-select-loaded');
      $(".bmonth_input:not(.date-select-loaded)").html(cadenameses).addClass('date-select-loaded');
      $(".byear_input_adult:not(.date-select-loaded)").html(cadenaanyosadult).addClass('date-select-loaded');

      // update combos if date is set
      var idsnecesarios = $("[id$='FieldBirthdate']:not(.date-select-loaded)");
      idsnecesarios.each(function() {
        if ($(this).val() != "") {
          var targetId  = $(this).attr("id");
          var dateParts = $("#"+targetId).val().split("/");

          $('.' + targetId + '.byear').val(dateParts[2]).trigger('change', [true]);
          $('.' + targetId + '.bmonth').val(dateParts[1]).trigger('change', [true]);
          $('.' + targetId + '.bday').val(dateParts[0]).trigger('change', [true]);

          $(this).addClass('date-select-loaded');
        };
      });
    },

    cardExpirationActions: function () {
      $(".date_expiration_input").change(function(){
        var inputtarget = $(this).attr("data-input-target");

        // reset value of the hidden date input
        $("#"+inputtarget).val("");

        var today      = new Date();
        var todayMonth = today.getMonth()+1;
        var todayYear  = (today.getFullYear().toString()).substr(2);

        var monthValue = $("." + inputtarget + ".bmonth_input").val();
        var yearValue  = $("." + inputtarget + ".byear_input").val();

        if (todayYear == yearValue) {
          $('.'+inputtarget+'.bmonth_input option:lt('+(todayMonth+1)+')').hide();

          if ((monthValue != '') && (monthValue <= todayMonth)) {
            $('#' + inputtarget).val('');
            $('.' + inputtarget + '.bmonth_input').val('').trigger('change');
            monthValue = '';
          }
        } else {
          $('.'+inputtarget + '.bmonth_input option').show();
        }

        if (monthValue != "" && yearValue != "") {
          // set and validate hidden date input
          var finaldate = monthValue + "/" + yearValue;

          $("#" + inputtarget).val(finaldate);
          $("#" + inputtarget).closest(".document_expiration").trigger('validate');
          $("#" + inputtarget).focus();

          // set/unset error class to all date combos
          if ($("#" + inputtarget).closest(".document_expiration").hasClass("error")) {
            $("." + inputtarget).closest('.select_field').addClass("errorper");
          } else {
            $("." + inputtarget).closest('.select_field').removeClass("errorper");

            /* Focus current element */
            $(this).focus();
          }

        }
      });
    },

    birthdateActions: function () {
      $(".date_birthday_input").change(function() {
        var inputtarget = $(this).attr("data-input-target");
        // reset value of the hidden date input
        $("#" + inputtarget).val("");

        var dayValue   = $("." + inputtarget + ".bday").val();
        var monthValue = $("." + inputtarget + ".bmonth").val()
        var yearValue  = $("." + inputtarget + ".byear").val()

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

    /* Init current companion forms */
    initFormCompanionCurrent: function () {
      var self = this;
      var $formCompanionCurrent = this.element.find('form.form_current_companion');

      $formCompanionCurrent.form({
    	onError: function (form) {
          self.scrollFormError(form.element);
        },
        onSubmit: function (form) {
          var $row = $(form.element).closest('.expandable.expanded');
          var passengerId = $row.find('.companion_id').val();
          var data = form.element.serializeObject();
          var object = self.getFrequentPassenger(data, true);

          /* Avoid double click disabling the button */
          form.element.find('.submit .submit_button button').attr('disabled', 'disabled').addClass('loading');

          Bus.publish('services', 'updateFrequentPassengers', {
            data: object,
            userId: localStorage.ly_userId,
            passengerId: passengerId,
            success: function (response) {
              var subtitle;

              form.element.find('.submit .submit_button button').removeAttr('disabled').removeClass('loading');

              if (!response.header.error) {
                $row.removeClass('expanded');
                subtitle = lang('my_info_companion.update_subtitle_ok');
              } else {
                subtitle = response.header.message || lang('my_info_companion.update_subtitle_ko');
              }
              self.element.ui_dialog({
                title: lang('my_info_companion.update_title'),
                error: response.header.error,
                subtitle: subtitle,
                close: {
                  behaviour: 'close',
                  href: '#'
                },
                buttons: [
                  {
                    className: 'close',
                    href: '#',
                    label: lang('my_info_companion.update_close')
                  }
                ],
                render: function ($dialog) {
                  $dialog.on('click', 'a', function (event) {
                    event.preventDefault();
                    $row.find('a span').html(object.name + ' ' + object.surname + ' ' + object.surname2);
                  });
                }
              });
            },
            failure: function () {
              /* @todo */
            }
          });
        }
      });
    },
    /* Init payment methods forms */
    initFormPaymentMethods: function () {
      // this.creditCardCheck();

      /* init user payment forms */
      this.element.find('.user_payment_method_form').form({
        onSubmit: function (form) {
        }
      });
    },
    /* Delete buttons for companion */
    initDeleteButtons: function () {
      var self = this;
      var $deleteButton = this.element.find('.delete_button');
      var title = title = lang('my_info_companion.delete_confirm_title');
      var subtitle = subtitle = lang('my_info_companion.delete_confirm_subtitle');
      var isPaymentMethod = $deleteButton.closest('.inner_content').attr('data-name') == 'payment_methods';

      if (isPaymentMethod) {
        title = lang('my_info_payment.delete_confirm_title');
        subtitle = lang('my_info_payment.delete_confirm_subtitle');
      }

      $deleteButton.off('click').on('click', function (event) {
        var $row = $(event.target).closest('.deletable');
        self.element.ui_dialog({
          title: title,
          error: false,
          subtitle: subtitle,
          close: {
            behaviour: 'close',
            href: '#'
          },
          buttons: [
            {
              className: 'delete_companion',
              href: '#',
              label: lang('my_info_companion.delete_confirm_ok')
            },
            {
              className: 'close',
              href: '#',
              label: lang('my_info_companion.delete_confirm_close')
            }
          ],
          render: function ($dialog) {
            $dialog.on('click', '.delete_companion a', function (event) {
              event.preventDefault();
              $dialog.find('.dialog_content').append('<span class="dialog_spinner"><span class="spinner"></span><strong class="spinner_text">' + lang('inner.loading') + '</strong></span>').addClass('spinner');

              if (isPaymentMethod) {
                self.onRemovePaymentMethod($row, $dialog);
              } else {
                self.onRemoveCompanion($row, $dialog);
              }

            });
          }
        });
        return false;
      });
    },

    /* Check frequent flyer */

    frequentFlyerCheck: function () {
      var self = this;

      this.element.find('.surname_1').on('blur', function () {
        var $this = $(this);
        var $passenger = $this.closest('form');

        if ($passenger.find('.frequent_flyer_group .group_header input').is(':checked')) {
          self.callToFrequentFlyerCheck($passenger);
        }
      });

      this.element.find('.frequent_flyer_program select').on('change', function () {
        var $this = $(this);
        var $passenger = $this.closest('form');

        self.callToFrequentFlyerCheck($passenger);
      });

      this.element.find('.frequent_flyer_number input').on('blur', function () {
        var $this = $(this);
        var $passenger = $this.closest('form');

        self.callToFrequentFlyerCheck($passenger);
      });
    },

    callToFrequentFlyerCheck: function ($passenger) {
      var surname = $passenger.find('.surname_1').val();
      var frequentFlyerProgram = $passenger.find('.frequent_flyer_program option:selected').attr('value');
      var frequentFlyerIdentity = $passenger.find('.frequent_flyer_number input').val();
      var flyerData;

      if (surname != '' && frequentFlyerProgram != '' && frequentFlyerIdentity != '') {
        flyerData = {
          surname: surname,
          frequentFlyerProgram: frequentFlyerProgram,
          frequentFlyerIdentity: frequentFlyerIdentity
        };

        /* Call AJAX module to get the json */
        Bus.publish('services', 'getFrequentFlyerCheck', {
          data: flyerData,
          success: function (data) {
            var message = data.header.message;

            if (data.header.error == true) {
              /* Update error hints */
              $passenger.find('.frequent_flyer_program').trigger('show_error', [message]);
              $passenger.find('.frequent_flyer_program').trigger('set_valid', [false]);
              $passenger.find('.frequent_flyer_number').trigger('show_error', [message]);
              $passenger.find('.frequent_flyer_number').trigger('set_valid', [false]);

              /* Set classes to show the error */
              $passenger.find('.frequent_flyer_program').addClass('error').removeClass('valid initial_status');
              $passenger.find('.frequent_flyer_number').addClass('error').removeClass('valid initial_status');
            }
            else {
              $passenger.find('.frequent_flyer_program').removeClass('error initial_status').addClass('valid');
              $passenger.find('.frequent_flyer_program').trigger('set_valid', [true]);
              $passenger.find('.frequent_flyer_number').removeClass('error initial_status').addClass('valid');
              $passenger.find('.frequent_flyer_number').trigger('set_valid', [true]);
            }
          }
        });
      }
    },

    /* User has confirmed companion deletion */
    onRemoveCompanion: function ($row, $dialog) {
      var passengerId = $row.find('.companion_id').val();

      Bus.publish('services', 'deleteFrequentPassengers', {
        userId: localStorage.ly_userId,
        passengerId: passengerId,
        success: function (response) {
          $row.remove();
          $dialog.find('.close_dialog').find('a').click();
        }
      });


    },
    /* User has confirmed unsubscription */
    onUnsubscribeConfirmed: function (self, $dialog) {
      /* Call to unsubscribe service */
      Bus.publish('services', 'unsubscribeUser', {
        frequentFlyerIdentity: localStorage.ly_frequentFlyerIdentity,
        success: function (response) {
          $dialog.find('.close_dialog').find('a').click();
          self.onUnsubscribedUser((response.header.error === false));
        }
      });
      //});
    },
    /* Users has confirmed newsletetter unsubscription */
    onUnsubscribeNewsletterConfirmed: function ($dialog) {
      /* set loading */
      $dialog.find('.dialog_content').append('<span class="dialog_spinner"><span class="spinner"></span><strong class="spinner_text">' + lang('inner.loading') + '</strong></span>').addClass('spinner');

      Bus.publish('services', 'unsubscribeNewsLetter', {
        userId: localStorage.ly_userId,
        success: function (response) {

          var code = response.header.code;
          var error = response.header.error;
          var message = response.header.message;

          /* remove spinner */
          $dialog.find('.dialog_content .dialog_spinner').remove();
          $dialog.find('.dialog_content').addClass('success').removeClass('spinner');
          /* close the dialog */
          $dialog.find('.close_dialog').find('a').click();

          $('body').ui_dialog({/* Append to body because another dialog could be already present */
            title: (error == true) ? lang('general.error_title') : lang('my_info_unsubscribe.newsletetter_unsubscribe_title'),
            error: error,
            subtitle: (error == true) ? message : lang('my_info_unsubscribe.newsletetter_unsubscribe_subtitle'),
            close: {
              behaviour: 'close',
              href: '#'
            },
            buttons: [
              {
                className: 'close',
                href: '#',
                label: lang('dialog.close_dialog')
              }
            ]
          });
        }
      });

    },
    /* User was successfully unsubscribed */
    onUnsubscribedUser: function (success) {
      var subtitle = (success) ? lang('my_info_unsubscribe.unsubscribed_subtitle') : lang('my_info_unsubscribe.unsubscribe_error_subtitle');

      $('body').ui_dialog({/* Append to body because another dialog could be already present */
        title: lang('my_info_unsubscribe.unsubscribed_title'),
        error: !success,
        subtitle: subtitle,
        close: {
          behaviour: 'close',
          href: '#'
        },
        buttons: [
          {
            className: 'close',
            href: '#',
            label: lang('my_info_unsubscribe.close_dialog')
          }
        ],
        render: function ($dialog) {
          $dialog.on('click', 'a', function (event) {
            event.preventDefault();
            if (success) {
              window.location.href = '/';
            }
          });
        }
      });
    },
    /* Listen remove payment Method */
    onRemovePaymentMethod: function ($row, $dialog) {
      var hashId = $row.attr('data-hashId');

      Bus.publish('services', 'deletePaymentMethod', {
        userId: localStorage.ly_userId,
        hashId: hashId,
        success: function (response) {
          var error = response.header.error;
          var message = response.header.message;

          if (error) {
            $dialog.find('.close_dialog').find('a').click();

            $('body').ui_dialog({/* Append to body because another dialog could be already present */
              title: lang('general.error_title'),
              error: true,
              subtitle: message,
              close: {
                behaviour: 'close',
                href: '#'
              },
              buttons: [
                {
                  className: 'close',
                  href: '#',
                  label: lang('dialog.close_dialog')
                }
              ],
              render: function ($dialog) {
                $dialog.on('click', 'a', function (event) {
                  event.preventDefault();
                  if (success) {
                    window.location.href = '/';
                  }
                });
              }
            });
          }
          else {
            $row.remove();
            $dialog.find('.close_dialog').find('a').click();
          }
        }
      });


    },
    /* Change pasword */
    listenChangePasswordTrigger: function () {
      var self = this;

      this.element.find('.change_password a').on('click', function (event) {
        event.preventDefault();

        /* Get the template */
        Bus.publish('ajax', 'getTemplate', {
          path: AirEuropaConfig.templates.loyalty_info.change_password,
          success: function (template) {

            self.element.ui_dialog({
              title: lang('general.change_password'),
              error: false,
              with_scroll: true,
              close: {
                behaviour: 'close',
                href: '#'
              },
              content: template,
              buttons: [
                {
                  className: 'change',
                  href: '#',
                  label: lang('general.change_password')
                }
              ],
              render: function ($dialog) {
                var $form = $dialog.find('form');
                var $link = $dialog.find('.change a');

                /* Buttons behaviour */
                $dialog.find('.change a').on('click', function (event) {
                  event.preventDefault();
                  var $this = $(this);

                  if (!$this.hasClass('disabled')) {
                    $form.trigger('submit');


                  }
                });

                /* Form behaviour */
                $form.form({
                  onSubmit: function (form) {

                    $dialog.find('.dialog_content').append('<span class="dialog_spinner"><span class="spinner"></span><strong class="spinner_text">' + lang('inner.loading') + '</strong></span>').addClass('spinner');

                    var password = form.element.find('#password').val();
                    var newPassword = form.element.find('#new_password_1').val();
                    var newPasswordVerification = form.element.find('#new_password_2').val();

                    /* Call to add booking service */
                    Bus.publish('services', 'putChangePassword', {
                      userId: localStorage.ly_userId,
                      data: {
                        password: password,
                        newPassword: newPassword,
                        newPasswordVerification: newPasswordVerification
                      },
                      success: function (changePasswordData) {

                        /* Get info from json */
                        var code = changePasswordData.header.code;
                        var error = changePasswordData.header.error;
                        var message = changePasswordData.header.message;

                        if (error) {
                          if (code === 400) {
                            /* Quitar spinner */
                            self.showFieldErrors($form, changePasswordData.body.data);
                          }
                          else {
                            $('body').ui_dialog({
                              title: lang('general.error_title'),
                              error: true,
                              subtitle: message,
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
                              ]
                            });
                          }

                        }
                        else {

                          $dialog.find('.close_dialog .close a').trigger('click');

                          $('body').ui_dialog({
                            title: lang('general.change_password_success_title'),
                            error: false,
                            subtitle: lang('general.change_password_success_message'),
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
                            ]
                          });

                        }

                        $dialog.find('.dialog_content').removeClass('spinner').find('.dialog_spinner').remove();
                      }
                    });

                  }
                });
              }
            });

            //self.listenPassword('#new_password_1', '#new_password_2', self.element);
            self.listenPassword('#new_password_wrapper', '#new_password_wrapper_2', self.element);
          }
        });
      });
    },
    /* When user change the password, check the confirm password */
    listenPassword: function(fieldPassword, fieldPassword2, $element) {
      var self = this;
      var $password = $element.find(fieldPassword);
      var $password2 = $element.find(fieldPassword2);

      var $passwordInput = $password.find('input');      
      var $passwordInput2 = $password2.find('input');

      $passwordInput2.on('blur', function(event) {

        if ($password2.closest('.field').hasClass('valid') && ($passwordInput2.val() != $passwordInput.val())){
          self.showPasswordError($password2.attr('data-service-name'), $element);
        }

        if (! $password.closest('.field').hasClass('valid'))
        {
          $password2.closest('.field').addClass('non_editable');
          $passwordInput2.attr('readonly', true);
          $passwordInput2.val('');
          $password2.closest('.field').removeClass('valid');
        }

      });

      $passwordInput.on('blur', function(event) {

        if ($password.closest('.field').hasClass('valid') && ($passwordInput2.val() != $passwordInput.val())){

          self.showPasswordError($password2.attr('data-service-name'), $element);
          $password2.closest('.field').removeClass('non_editable');
          $passwordInput2.attr('readonly', false);
        }

        if (($passwordInput.val() == '') && !($password2.closest('.field').hasClass('non_editable'))
          || (! $password.closest('.field').hasClass('valid')))
        {
          $password2.closest('.field').removeClass('valid');
          $password2.closest('.field').addClass('non_editable');
          $passwordInput2.attr('readonly', true);
          $passwordInput2.val('');
        }

      });
    },
    /*listenPassword: function (fieldPassword, fieldPassword2, $element) {
      var self = this;
      var $password = $element.find(fieldPassword);
      var $password2 = $element.find(fieldPassword2);

      $password2.on('blur', function(event) {

        if ($password2.closest('.field').hasClass('valid') && ($password2.val() != $password.val())){
          self.showPasswordError($password2.attr('data-service-name'), this.element);
        }

        if (! $password.closest('.field').hasClass('valid'))
        {
          $password2.closest('.field').addClass('non_editable');
          $password2.val('');
          $password2.closest('.field').removeClass('valid');
        }

      });

      $password.on('blur', function(event) {

        if ($password.closest('.field').hasClass('valid') && ($password2.val() != $password.val())){
          self.showPasswordError($password2.attr('data-service-name'), this.element);
          $password2.closest('.field').removeClass('non_editable');
        }

        if (($password.val() == '') && !($password2.closest('.field').hasClass('non_editable'))
          || (! $password.closest('.field').hasClass('valid')))
        {
          $password2.closest('.field').removeClass('valid');
          $password2.closest('.field').addClass('non_editable');
          $password2.val('');
        }

      });

    },*/
    showPasswordError: function (fieldName, $element) {
      var $errorField = $element.find('[data-service-name = ' + fieldName + ']').closest('.field');

      /* Show error and set message */
      $errorField.trigger('show_error', lang('account.error_match_password2'));
      $errorField.addClass('error').removeClass('valid initial_status');

      /* Send the event to put the field invalid, so the user can't do the submit */
      $errorField.trigger('set_valid', [false]);
    },
    /* Show field errors from user form */
    showFieldErrors: function ($form, errors) {
      var self = this;

      $.each(errors, function (indexError, error) {
        /* Get type */
        var field = error.field.replace(/\./g, '_');

        /* Get error field */
        var $errorField = $form.find('[data-service-name="' + field + '"]').closest('.field');

        /* Show error and set message */
        $errorField.trigger('show_error', [error.message]);
        $errorField.addClass('error').removeClass('valid initial_status');
      });
    },
    showFormError: function ($form) {
    	var $content = $form.find('.error');

        /* Scroll to the first field with error */
        Bus.publish('scroll', 'scrollTo', {position: $content.position().top});
    },
    scrollFormError: function ($form) {
      //var pos = $form.find('.fields').offset().top + $('.nav_bar').height();
      var $field = $form.find('.error').first();
      var pos = $field.offset().top - $('.nav_bar').height() - 70;

        /* Scroll to the first field with error */
        Bus.publish('scroll', 'scrollTo', {position: pos});
    },

    creditCardCheck: function() {
      var self = this;
      var $creditCardType = this.element.find('.credit_card_type');
      var $creditCardNumber = this.element.find('.credit_card_number');

      $creditCardType.each(function() {
        var $field = $(this);
        var $form = $field.closest('form.standard_form');

        $field.find('select').on('change', function (event, blockServiceValidation) {
          if (!blockServiceValidation) {
            self.callToCreditCardCheck($form);
          }
        });
      });

      $creditCardNumber.each(function() {
        var $field = $(this)
        var $form = $field.closest('form.standard_form');

        $field.find('input').on('blur', function () {
          self.callToCreditCardCheck($form);
        });
      });
    },

    callToCreditCardCheck: function ($formPayment) {
      var self = this;
      var cardType = $formPayment.find('.credit_card_type select option:selected').attr('value');
      var cardNumber = $formPayment.find('.credit_card_number input').val();
      var cardObject = {};
      var currentValue = cardType + '-' + cardNumber;

      if (this.lastCheckCardValue == currentValue) {

        if (!this.lastCheckCardValid) {
          /* Set classes to show the error */
          $formPayment.find('.credit_card_number').addClass('error').removeClass('valid initial_status');
        }
      }

      if (cardType != '' && typeof (cardNumber) != 'undefined' && cardNumber != '' && cardNumber.length > 11 && cardNumber.length < 19 && this.lastCheckCardValue !== currentValue) {
        /* Disable select to avoid multiple validations */
        $formPayment.find('.credit_card_type select').attr('disabled', 'disabled');

        /* Build post object */
        cardObject = {
          cardType: {
            identity: cardType
          },
          cardNumber: cardNumber
        }

        /* Call AJAX module to validate the credit card */
        Bus.publish('services', 'postCreditCardCheck', {
          data: cardObject,
          success: function (data) {
            // var message = data.header.message;
            var message = lang('my_info_payment.incorrect_type');
            var error = data.header.error;
            var code = data.header.code;
            var identityCard = '';
            var $correctIdentityCard = null;
            var errorType;
            var errorTitle = lang('general.error_title');

            /* Errors control */
            if (error === true) {

              // console.log("Se produce error: ", code, message);

              /* Set the valid flag to false */
              self.lastCheckCardValid = false;

              /* Show specific field error */
              if (code == 400) {
                message = data.body.data[0].message;

                /* Update error hints */
                $formPayment.find('.credit_card_number .error_hint').remove();
                $formPayment.find('.credit_card_number').trigger('show_error', [message]).trigger('set_valid', [false]);

                /* Set classes to show the error */
                $formPayment.find('.credit_card_number').addClass('error').removeClass('valid initial_status');
              }

              /* Generic error, show the popup error */
              else {
                errorType = true;

                /* check if the ui_dialog is an advise and not an error */
                if (code === 4050 || code === 4052 || code === 4054) {
                  errorType = false;
                  errorTitle = lang('general.info_error_title');
                }

                /* Show popup error */
                $formPayment.find('select').trigger('blur');
                $('body').ui_dialog({
                  title: errorTitle,
                  error: errorType,
                  subtitle: message,
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
                  ]
                });

                /* Wrong identity, show the popup error and switch the identity */
                if (code === 4050 || code === 4052 || code === 4054) {
                  /* Get the correct identity card for this number */
                  identityCard = data.body.data.identity;

                  /* Assign its option */
                  $correctIdentityCard = $formPayment.find('.credit_card_type option[value=' + identityCard + ']');

                  /* Clean the select and mark the right identity card */
                  if ($correctIdentityCard.length > 0) {

                    /* Avoid triggering the validation again */
                    self.lastCheckCardValue = identityCard + '-' + cardNumber;
                    self.lastCheckCardValid = true;

                    /* Select the correct identity */
                    $formPayment.find('.credit_card_type option:selected').prop('selected', false);
                    $correctIdentityCard.prop('selected', true);
                    $correctIdentityCard.closest('select').trigger('change', [true]);

                    /* Mark the card number as valid */
                    $formPayment.find('.credit_card_number').trigger('set_valid', [true]);
                    $formPayment.find('.credit_card_number').removeClass('error').addClass('valid');
                  }
                }
                else {
                  /* Update error hints */
                  $formPayment.find('.credit_card_number .error_hint').remove();
                  $formPayment.find('.credit_card_number').trigger('show_error', [message]).trigger('set_valid', [false]);

                  /* Set classes to show the error */
                  $formPayment.find('.credit_card_number').addClass('error').removeClass('valid initial_status');
                }

              }
            }
            /* Success control */
            else {
              /* Set the valid flag to true */
              self.lastCheckCardValid = true;

              /* Mark the card number as valid */
              $formPayment.find('.credit_card_number').trigger('set_valid', [true]);
              $formPayment.find('.credit_card_number').removeClass('error').addClass('valid');
            }

            /* Enable select again */
            $formPayment.find('.credit_card_type select').removeAttr('disabled');
          }
        });

      }

      this.lastCheckCardValue = currentValue;
    },

    listenAddressChange: function (){
      var self = this;
      var $addressGroup = $('.address_group input, .address_group select');
      var $loyaltyStreet = $('#field_loyalty_street');
      var $loyaltyStreetType = $('#field_loyalty_address_type');
      var $layaltyStreetField = $loyaltyStreet.closest('.text_field');
       var $layaltyStreetTypeField = $loyaltyStreetType.closest('.text_field');
      
      $addressGroup.on('change', function(){
        if($(this).val() != ""){
          $layaltyStreetField.attr('data-required','true').removeClass('valid filled');
          $layaltyStreetField.attr('data-init', 'restart');
          $layaltyStreetField.find('.helper').hide();

          $layaltyStreetTypeField.attr('data-required','true').removeClass('valid filled');
          $layaltyStreetTypeField.attr('data-init', 'restart');

          $(this).closest('form').form('restartFields');

        }
        else{
          if(self.checkAllValAddressGroup()){

            $layaltyStreetField.removeAttr('data-required');
            $layaltyStreetField.attr('data-init', 'restart');
            $layaltyStreetField.find('.helper').show();

            $layaltyStreetTypeField.removeAttr('data-required');
            $layaltyStreetTypeField.attr('data-init', 'restart');

            $(this).closest('form').form('restartFields');
          }
        }
      });
    },

    checkAllValAddressGroup: function (){
      var $addressGroup = $('.address_group input, .address_group select');
      var valuesNull = true;
      $addressGroup.each(function () {
        if($(this).val() != ""){
          valuesNull = false;
        }
      });
      return valuesNull;
    },
    checkAgeCepsa:function(){
      var self = this;
      var userAge = localStorage.ly_userAge;

      if (userAge >= 18) {
            self.element.find('.fields.group.cepsa-block').removeClass('hidden');
          } else {
            self.element.find('.fields.group.cepsa-block').addClass('hidden');
          }
    }

  };
});