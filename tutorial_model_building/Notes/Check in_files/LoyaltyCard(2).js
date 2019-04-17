Hydra.module.register('LoyaltyCard', function (Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#content.loyalty_card',
    element: undefined,
    events: {
      'loyalty_card': {
        'custom_init': function () {
          this.customInit();
          Bus.publish('prerender', 'restart');
        },
        'show_card_passbook': function (oNotify) {
          var callback = (oNotify && oNotify.callback) ? oNotify.callback : function () {
          };
          this.showCardPassbook(callback);
        },
        'show_card_duplicate': function (oNotify) {
          var callback = (oNotify && oNotify.callback) ? oNotify.callback : function () {
          };
          this.showCardDuplicate(callback);
        },
        'show_card_print': function (oNotify) {
          var callback = (oNotify && oNotify.callback) ? oNotify.callback : function () {
          };
          this.showCardPrint(callback);
        }
      }
    },
    init: function () {
    },
    customInit: function () {
      /* Save jquery object reference */
      this.element = $(this.selector);

      /* Init card forms */
      this.initPassbookForm();
      this.initGetCardForm();
      this.initPrintCard();

    },
    initPassbookForm: function () {
      var self = this;
      var $passbookForm = this.element.find('.add_passbook');

      $passbookForm.form({
        onSubmit: function (form) {
          /* Avoid double click disabling the button */
          form.element.find('.submit .submit_button button').attr('disabled', 'disabled').addClass('loading');

          var data = form.element.serializeObject();
          var email = data.send_passbock_email;
          var emailArray = [];
          emailArray.push(email);

          Bus.publish('services', 'requestPassbookCard', {
            userId: localStorage.ly_userId,
            loyaltyId: localStorage.ly_frequentFlyerIdentity,
            emailData: emailArray,
            success: function(response) {
              /* If not response header, HTTP 200 OK */
              if (typeof(response.header)=='undefined') {
                var response = {
                  header: {
                    message: lang('my_card.request_physical_card_subtitle_ok'),
                    error: false
                  }
                };
              }
              var success = !response.header.error;

              form.element.find('.submit .submit_button button').removeAttr('disabled').removeClass('loading');

              var showDialog = function (subtitle) {
                self.element.ui_dialog({
                  title: lang('my_card.request_passbook_card_title'),
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
                      label: lang('dialog.close_dialog')
                    }
                  ]
                });
              };

              if (success) {
                /* Clear form */
                form.element.trigger('reset');
                form.element.find('.field').attr('data-init', 'restart').removeClass('filled');
                form.restartFields();
                showDialog(lang('my_card.request_physical_card_subtitle_ok'));
              } else {
                showDialog(response.header.message);
              }
            }
          });
        }
      });
    },
    initGetCardForm: function () {
      var self = this;
      var $getCardForm = this.element.find('.get_card');
      var $countrySelect = this.element.find('#field_country');
      var $regionSelect = this.element.find('#field_region');
      var $layerRegionInput = this.element.find('.region_input');

      var $layerCountrySelect = $regionSelect.closest('.select_field');
      var $regionInput = $layerRegionInput.find('input');

      $countrySelect.on('change', function(){
        var $this = $(this);

        if ($this.val()!=''){
          Bus.publish('services', 'getLoyaltyRegionFromCountry', {
            countryCode: $this.val(),
            success: function(data) {
              var optionsHtml = '';
              if (!data || !data.header || !data.header.error) {
                optionsHtml = '<option value=""></option>';
                $.each(data.body.data, function(indexReg, dataReg){
                  optionsHtml += '<option value="'+dataReg.description+'">'+dataReg.description+'</option>';
                });
                $regionSelect.html(optionsHtml);
                $regionSelect.closest('label').text(lang('my_card.field_state'));
                $layerCountrySelect.removeClass('hidden').removeClass('disabled');
                $layerCountrySelect.removeClass('error valid filled');
                $layerCountrySelect.attr('data-init', 'restart');
                /* Hide input */
                $layerRegionInput.addClass('hidden').addClass('disabled');

                /* Change tabindex */
                var tabindex = $layerRegionInput.find('input').attr('tabindex');
                $layerCountrySelect.find('select').attr('tabindex',tabindex);
                $layerRegionInput.find('input').attr('tabindex','');
              } else {
                $layerRegionInput.removeClass('hidden').removeClass('disabled');
                /* Hide select */
                $layerCountrySelect.addClass('hidden').addClass('disabled');
              }
              /* Reassign forms to validate the added fields */
              $this.closest('form').form('restartFields');
            }
          });
        }
      });

      $getCardForm.form({
        onError: function (form) {
          self.scrollFormError(form.element);
        },
        onSubmit: function (form) {
          /* Avoid double click disabling the button */
          form.element.find('.submit .submit_button button').attr('disabled', 'disabled').addClass('loading');
          var data = form.element.serializeObject();
          Bus.publish('services', 'requestPhysicalCard', {
            userId: localStorage.ly_userId,
            data: {
              address: {
                typeRoad: data.field_loyalty_address_type,
                street: data.field_street,
                streetNumber: data.field_street_number,
                additionalAddress: data.field_street_2,
                city: data.field_city,
                state: $layerRegionInput.hasClass('hidden')?data.field_region:data.field_state,
                postalCode: data.field_postal_code,
                country: {
                  code: data.field_country
                }
              },
              linkAddressToProfile: (data.field_link_profile === '1')
            },
            success: function (response) {

              /* If there is an access denied error or similar, create dummy response object */
              if (!response.header) {
                response.header = {
                  message: lang('my_card.request_physical_card_subtitle_error'),
                  error: true
                };
              }
              var success = !response.header.error;

              form.element.find('.submit .submit_button button').removeAttr('disabled').removeClass('loading');

              var showDialog = function (subtitle) {
                self.element.ui_dialog({
                  title: lang('my_card.request_physical_card_title'),
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
                      label: lang('dialog.close_dialog')
                    }
                  ]
                });
              };

              if (success) {
                /* Clear form */
                form.element.trigger('reset');
                form.element.find('.select_field select').trigger('change');
                form.element.find('.field').attr('data-init', 'restart').removeClass('filled');
                form.restartFields();
                showDialog(lang('my_card.request_physical_card_subtitle_ok'));
              } else {
                form.element.find('.submit .submit_button button').removeAttr('disabled').removeClass('loading');
                showDialog(response.header.message);
              }
            }
          });
        }
      });
    },
    initPrintCard:function(){
      var self = this;
      var $printCard = this.element.find('.print_card a');

      $printCard.on('click', function (event) {
         Bus.publish('services', 'getPrintCard', {
            userId: localStorage.ly_userId,
            success: function(data) {
            }
          });
        return false;
      });

    },
    showCardPassbook: function (callback) {
      this.element.find('.add_passbook_expandable').addClass('expanded');

      Bus.publish('scroll', 'scrollTo', {
        position: this.element.find('.add_passbook_expandable').offset().top - this.element.find('.nav_bar').outerHeight(),
        callback: function () {
          /* Execute callback if it's defined */
          if (callback) {
            callback();
          }
        }
      });
    },
    showCardDuplicate: function (callback) {
      this.element.find('.duplicate_expandable').addClass('expanded');

      Bus.publish('scroll', 'scrollTo', {
        position: this.element.find('.duplicate_expandable').offset().top - this.element.find('.nav_bar').outerHeight(),
        callback: function () {
          /* Execute callback if it's defined */
          if (callback) {
            callback();
          }
        }
      });
    },
    showCardPrint: function (callback) {
      Bus.publish('scroll', 'scrollTo', {
        position: this.element.find('.print_card').offset().top - this.element.find('.nav_bar').outerHeight(),
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