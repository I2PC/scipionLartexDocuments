Hydra.module.register('Account', function(Bus, Module, ErrorHandler, Api) {

  return {
    selector: '.search_form',
    element: undefined,
    accountServiceObject: undefined,
    userData: undefined,
    migrateUser: false,
    loginCheckin: false,
    loginExtras: false,

    events: {
      'external_login': {
        'checkout_login': function(oNotify) {
          this.customInit(oNotify);
        }
      },
      'account': {
        'update_birthdate': function(oNotify) {
          if(oNotify.parentSelector) {
        	this.initFieldBirthdate(oNotify.parentSelector); 
          } else {
            this.initFieldBirthdate('.search_form .register_form');
          }
        },
        'update_miles': function(oNotify) {
          this.updateMilesNumber(oNotify.newMilesNumber);
        },
        'init_register_form': function(oNotify) {
          if (oNotify && oNotify.parentDivClass) {
            this.initRegisterForm('#checkout', oNotify.parentDivClass);
          } else {
            this.initRegisterForm('#checkout');
          }
        },
        'init_register_distnace_form': function(oNotify){
          this.initRegisterDistnaceForm(oNotify);
        },
        'init_restore_loyalty_user_form': function(oNotify){
          this.initRestoreLoyaltyUser(oNotify);
        }
      }
    },

    init: function() {
      this.customInit();
    },

    customInit: function(oNotify) {
      var self = this;

      /* Save jquery object reference */
      this.element = $(this.selector);

      /* Init Form */
      this.initFieldDocumentExpiration();
      this.initFieldBirthdate('.search_form .register_form');
      this.documentExpirationActions();
      this.birthdateActions('.search_form .register_form');
      this.initForm(oNotify);
      this.initRegisterForm('#search');
      this.initRegisterSiebelForm();
      this.initLogoutOnLanguageChange();

      /* Document types */
      this.documentType();
      this.phoneFields();
    },


    initForm: function(oNotify) {

      var self = this;
      var postObject = {};
      var $loginDialog = (oNotify) ? oNotify : this.element.find('form.login_form').closest('.dialog');
      var $unsuscribeForm = $('#content .unsuscribe_form');
      var $recoveryFormDialog = this.element.find('form.restore_form').closest('.dialog');
      var $emailLogin = this.element.find('form input#field_login_email');
      var checkinProcessURL = getProcessUrl('checkin');


      $loginDialog.find('input[name="field_login_email"]').focusout(function(){
        var valInputpassword =  $loginDialog.find('input[name="field_login_password"]').val();
          if((typeof valInputpassword !== 'undefined') || (valInputpassword != '')){
            $loginDialog.find('input[name="field_login_password"]').blur().focus();
          }
          $.cookie('email', $emailLogin.val());
      });

      /* Init login form */
      $loginDialog.find('form').form({
        onSubmit: function(form) {
          var $form = form.element;
          var $dialog = $form.closest('.dialog_content');

          /* Set the focus to html, to avoid sending again the login data after showing the welcome dialog */
          $('html').focus();

          /* scroll to top to see the dialog content ok */
          $dialog.scrollTop(0);

          /* Mostrar spinner */
          $dialog.append('<span class="dialog_spinner"><span class="spinner"></span><strong class="spinner_text">' + lang('inner.loading') + '</strong></span>').addClass('spinner');

          /* get the user name and password */
          postObject = self.composeLoginObject($form);
          Bus.publish('services', 'login_oauth', {
            data: postObject,
            success: function(data){
              var error = (data.error) ? true : false;
              var error_message = data.error_description;
              var access_token;

              /* Errors control */
              if (error === true) {

                /* set general message error */
                var errorMessage = error_message;

                /* if have an specific error, override message */
                var dataErrorService = error_message.toLowerCase();
                var dataError100     = lang('account.bad_credentials_100').toLowerCase();
                var dataError101     = lang('account.bad_credentials_101').toLowerCase();
                var dataError102     = lang('account.bad_credentials_102').toLowerCase();

                if ((dataErrorService == dataError100) ||
                    (dataErrorService == dataError101) ||
                    (dataErrorService == dataError102)) {

                  Bus.publish('services', 'login_user_extend', {
                    data: postObject,
                    success: function(data) {
                      var error = (data.header) ? data.header.error : '';

                      if (error === true) {
                        errorMessage = data.header.message;
                      } else {
                        errorMessage = lang('account.bad_credentials_extended');
                      }

                      /* remove spinner */
                      $dialog.removeClass('spinner').find('.dialog_spinner').remove();

                      /* Show popup error */
                      $('body').ui_dialog({
                        title: lang('general.info_error_title'),
                        error: false,
                        close:  {
                          behaviour: 'close',
                          href: '#'
                        },
                        subtitle: errorMessage,
                        buttons: [
                          {
                            className: 'close',
                            href: '#',
                            label: lang('general.ok')
                          }
                        ]
                      });
                    }
                  });

                } else {

                  /* remove spinner */
                  $dialog.removeClass('spinner').find('.dialog_spinner').remove();

                  /* Show popup error */
                  $('body').ui_dialog({
                    title: lang('general.info_error_title'),
                    error: false,
                    close:  {
                      behaviour: 'close',
                      href: '#'
                    },
                    subtitle: errorMessage,
                    buttons: [
                      {
                        className: 'close',
                        href: '#',
                        label: lang('general.ok')
                      }
                    ]
                  });

                }
                var pageArea = $form.hasClass('loguin-checkout') ? 'SUMA-checkout' : 'SUMA-MIcuenta';
                if(pageArea == 'SUMA-MIcuenta' && $('#content').hasClass('landing_suma')) {
                  pageArea = 'SUMA-Landing';
                }
                updateGtm({
                  'pageArea': pageArea,
                  'pageCategory': 'acceder',
                  'pageContent': 'error_'+errorMessage
                });

              } else {
                var pageArea = $form.hasClass('loguin-checkout') ? 'SUMA-checkout' : 'SUMA-MIcuenta';
                if(pageArea == 'SUMA-MIcuenta' && $('#content').hasClass('landing_suma')) {
                  pageArea = 'SUMA-Landing';
                }
                updateGtm({
                  'pageArea': pageArea,
                  'pageCategory': 'acceder',
                  'pageContent': 'login_ok'
                });

                /* Save the token in window */
                window.token = access_token = data.access_token;

                // call loginUser
                postObject = self.composeLoginObject($form);
                Bus.publish('services', 'login_user', {
                  data: postObject,
                  success: function(data){
                    var error = (data.header) ? data.header.error : '';
                    var error_message = (data.header) ? data.header.message : '';
                    var code = (data.header) ? data.header.code : '';
                    var keepInSession = false;

                    var loginCheckin = false;
                    var loginExtras = false;
                    var siebelIsDownCode = 12105;


                    if (error === true && code != siebelIsDownCode) {
                      if (code === 400) {
                        self.showFieldErrors(self.element.find('form'), data.body.data);
                      }
                      else{
                        /* Show popup error */
                        $('body').ui_dialog({
                          title: lang('general.info_error_title'),
                          error: false,
                          subtitle: error_message,
                          buttons: [
                            {
                              className: 'close',
                              href: '#',
                              label: lang('general.ok')
                            }
                          ],
                          render: function ($dialog_error) {
                            $dialog_error.find('.close a').on('click', function(event) {
                              event.preventDefault();
                              Bus.publish('process', 'kill');
                              User.logoff();
                              /* send to home */
                              window.location.href = '/';
                            });
                          }
                        });
                      }
                    }
                    else {

                      /* if Siebel is down, set the variable */
                      if ( code === siebelIsDownCode )
                      {
                        window.siebelIsDown = true;
                        $('body').addClass('siebel_is_down');
                        User.showLoyaltyTitle();
                      }

                      self.userData = (data.body.data.user) ? data.body.data.user : '';
                      if ( (self.userData) && (self.userData.userType != "LOYALTY"))
                      {
                        /* update flag register */
                        self.migrateUser = true;

                        if (self.userData.userType == "MOBILE") {
                          var subtitle = lang('account.suma_login_text_app');
                        } else {
                          var subtitle = lang('account.suma_login_text_myaea');
                        }

                        $('body').ui_dialog({
                          title: lang('account.suma_login'),
                          error: false,
                          subtitle: subtitle,
                          close: {
                            behaviour: 'close',
                            href: '#'
                          },
                          buttons: [
                            {
                              className: 'continue',
                              href: '#',
                              label: lang('general.continue')
                            },
                          ],
                          render: function($dialog) {
                            $dialog.find('.continue a').on('click', function(event) {
                              event.preventDefault();
                              $dialog.find('.close a').click();

                              /* Show register/migrate dialog */
                              Bus.publish('process', 'show_register', { userData: self.userData });
                            });
                          }
                        });

                        /* remove spinner */
                        $dialog.removeClass('spinner').find('.dialog_spinner').remove();
                      }
                      else {

                        /* save if user check keep in session */
                        keepInSession = $form.find('#field_login_remember').is(':checked');

                        /* Login the user */
                        User.login(keepInSession, access_token, self.userData);

                        window.updateGtmLogin();

                        /* check the flags */
                        loginCheckin = $('.search_form[data-process-name=login]').hasClass('ly_checkin');
                        loginExtras = $('.search_form[data-process-name=login]').hasClass('ly_ancillaries');

                        /* call event when login sucess */
                        if (typeof oNotify == 'undefined' && (! loginCheckin ) && (! loginExtras )){

                          // /* Call confirm user conditions */
                          Bus.publish('services', 'conditions_user', {
                            userId: localStorage.ly_userId,
                            success: function(data){
                              if ( data.header && data.header.error)
                              {
                                /* conditions not exist or error, so continue with the login process */
                                // self.showWellcomeDialog($loginDialog, $form);
                                window.location = urlCms('landing_suma');
                              }else{
                                //check is user conditions are accepted
                                if (!data.error && data.body.data.accepted == false)
                                {
                                  // the user must accept the new conditions.
                                  /* Show popup error */
                                  $loginDialog.closest('.search_form.active').find('.close a').click();
                                  User.conditions(data, function($initial_dialog, $second_dialog) {
                                    self.acceptConditions($initial_dialog, $second_dialog);
                                  });

                                  /* remove spinner */
                                  $dialog.removeClass('spinner').find('.dialog_spinner').remove();

                                }else{
                                  /* The login and conditions are correct */
                                  // self.showWellcomeDialog($loginDialog, $form);
                                   Bus.publish('account', 'login');
                                   Bus.publish('process', 'kill');
                                }
                              }
                            }
                          });

                        }
                        /* Is external login */
                        else {
                          /* remove spinner */
                          $dialog.removeClass('spinner').find('.dialog_spinner').remove();

                          if ( (!loginCheckin) && (!loginExtras)){
                            /* came from checkout - remove the current checkout page and call the process again*/
                            $('.process_page.checkout').remove();
                            Bus.publish('process', 'show_checkout', {step: 'passengers'});
                            Bus.publish('account', 'login');

                          } else {
                            /* remove active previous dialog */
                            $loginDialog.find('a.close').click();

                            if ( loginCheckin ){
                              /* Refresh logged user accesses */
                              Bus.publish('account', 'login');
                              // call checkin process
                              Bus.publish('hash', 'change', {hash: checkinProcessURL + '/bookings'});
                            } else {
                              // call extras process
                              Bus.publish('account', 'login');
                              Bus.publish('process', 'kill');
                            }
                          }

                        }
                      }
                    }
                  }
                });
              }
            }
          });
        }
      });

      /* Init dialog form */
      $recoveryFormDialog.find('form').form({
        onSubmit: function(form) {
          var $form = form.element;
          var $dialog = $form.closest('.dialog_content');
          var $recoveryEmail = $form.find('#field_email');
          $.cookie('email', $recoveryEmail.val());
          /* Set the focus to html, to avoid sending again the recovery password email after showing the welcome dialog */
          $('html').focus();

          /* scroll to top to see the dialog content ok */
          $dialog.scrollTop(0);
          //$('#search').find('.dialog_buttons .submit_restore a').blur();
          //$dialog.find('.dialog_buttons .close a').focus();

          /* Mostrar spinner */
          $dialog.append('<span class="dialog_spinner"><span class="spinner"></span><strong class="spinner_text">' + lang('inner.loading') + '</strong></span>').addClass('spinner');

          postObject = form.element.serializeObject();
          Bus.publish('services', 'recovery_user', {
            data: postObject,
            success: function(data){
              var error = (data.header) ? data.header.error : '';
              var code = data.header.code;

              /* remove spinner */
              $dialog.removeClass('spinner').find('.dialog_spinner').remove();

              if (error === true) {
                /* Show popup error */
                $('#search').ui_dialog({
                  title: lang('general.info_error_title'),
                  error: true,
                  subtitle: data.header.message,
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
              else{
                $('#search').ui_dialog({
                  title: lang('account.recovery_loyalty_user_title'),
                  error: false,
                  subtitle: data.header.message,
                  buttons: [
                    {
                      className: 'close',
                      href: '#',
                      label: lang('general.ok')
                    }
                  ],
                  render: function($dialog) {
                    /* Buttons behaviour */
                    $dialog.find('.close a').on('click', function(event) {
                      event.preventDefault();
                      Bus.publish('process', 'kill');

                      /* send to home */
                      window.location = urlCms('landing_suma');
                    });
                  }
                });
              }
            }
          });
        }
      });

      /* Get the events click in the forms to launch the submit */
      $loginDialog.find('.submit_login a').on('click', function(event) {
        event.preventDefault();
        $loginDialog.find('form').trigger('submit');
      });

      $recoveryFormDialog.find('.submit_restore a').on('click', function(event) {
        event.preventDefault();
        $recoveryFormDialog.find('form').trigger('submit');
      });


      /* Unsuscribe form */
      $unsuscribeForm.find('.unsuscribe_reason select').on('change', function() {

        /* Get select value and text */
        var $select = $(this);
        var $option = $select.find('option:selected');
        var value = $option.attr('value');
        var $textAreaField = $unsuscribeForm.find('.field.unsuscribe_other_reason');

        if (value === '3') {
          $textAreaField.attr('data-required', 'true').removeClass('valid filled');
          $textAreaField.slideDown();
        }
        else {
          $textAreaField.slideUp();
          $textAreaField.attr('data-required', 'false').removeClass('valid filled');
        }

        /* Restart fields */
        $textAreaField.attr('data-init', 'restart');

        /* Reassign forms to validate the added fields */
        $unsuscribeForm.find('form').form('restartFields');

      })

      $unsuscribeForm.find('form').form({
        onSubmit: function() {
          var frequentFlyerId = localStorage.ly_frequentFlyerIdentity;
          var optionSelected = $unsuscribeForm.find('#field_reason option:selected');
          var reasonDescription = (optionSelected.val() == 3) ? $unsuscribeForm.find('#field_other_reasons').val() : '';
          var postObject = {
            reasonCode : optionSelected.val(),
            otherReasonDescription : reasonDescription
          }
          /* add loading */
          $unsuscribeForm.find('.submit .submit_button button').attr('disabled', 'disabled').addClass('loading');

          Bus.publish('services', 'confirm_unsuscribe', {
            data: postObject,
            success: function(data){
              /* remove loading */
              $unsuscribeForm.find('.submit .submit_button button').removeAttr('disabled').removeClass('loading');

              var error = (data.header.error) ? true : false;
              /* Errors control */
              if (error === true) {
                $('body').ui_dialog({
                  title: lang('general.info_error_title'),
                  error: true,
                  subtitle: data.header.message,
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
              }else{
                $('body').ui_dialog({
                  title: lang('account.unsuscribe_correct_title'),
                  error: false,
                  subtitle: lang('account.unsuscribe_correct_subtitle'),
                  buttons: [
                    {
                      className: 'close',
                      href: '#',
                      label: lang('general.ok')
                    }
                  ],
                  render:function ($dialog_error) {
                    $dialog_error.find('.close a').on('click', function(event) {
                      event.preventDefault();
                      Bus.publish('process', 'kill');
                      User.logoff();
                      /* send to home */
                      window.location = urlCms('landing_suma');
                    });
                  }
                });
              }
            }
          });

        }
      });

    },

    initRegisterForm: function(parentId, parentDivClass) {

      var self = this;
      var $registerForm = $('form.register_form');
      if(parentDivClass) {
        $registerForm = $('div.' + parentDivClass + ' form.register_form');
      }
      var $registerDialog = $registerForm.closest('.dialog');
      
      var $countrySelect = $registerForm.find('select[name="field_register_card_country"]');
      var $regionSelect = $registerForm.find('#field_region');
      var $layerRegionInput = $registerForm.find('.region_input');
      var $layerCountrySelect = $regionSelect.closest('.select_field');
      var $regionInput = $layerRegionInput.find('input');

      /* Listen Password and password2 change*/
      //self.listenPassword('#field_register_password', '#field_register_password2', $registerForm);
      self.listenPassword('#field_register_password_wrapper', '#field_register_password_wrapper_2', $registerForm);
      
      self.phoneFields($registerForm);
      
      self.initFieldBirthdate('.register_form.finish_checkout');
      
      self.birthdateActions('.register_form.finish_checkout');
      
      self.initFieldBirthdate('.register_siebel');
      
      self.birthdateActions('.register_siebel');

      /* Trim value when document number changes */
      $registerForm.find('#field_register_document_number').on('change', function() {
        var value = $(this).val();
        $(this).val($.trim(value));
      });
      
      $registerForm.find('input[name="field_register_data_loyalty_phisical_card"]').on('change', function() {
    	  var $card = $registerForm.find('#phisical_card_address');
    	  var $fields = $card.find('.field');
    	  var $info = $card.find('#field_street_2').closest('.field');
    	  
    	  if($registerForm.find('input[name="field_register_data_loyalty_phisical_card"]').is(':checked')) {
    		  $card.removeClass('hidden');
    		  $fields.attr('data-required', 'true');
    		  $info.attr('data-required', 'false');
    		  $fields.attr('data-init', 'restart');
    	  } else {
    		  $card.addClass('hidden');
    		  $fields.attr('data-required', 'false');
    		  $fields.attr('data-init', 'restart');
    	  }
    	  $registerForm.form('restartFields');
      });
      
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

      /* Init register form */
      $registerForm.form({

        onSubmit: function(form) {
          var $form = form.element;
          var $dialog = $form.closest('.dialog_content');

          /* scroll to top to see the dialog content ok */
          $dialog.scrollTop(0);

          /* check the register or update flag to call the correct service */
          var registerServiceType = (self.migrateUser) ? 'update_user' : 'register_user';
          var title_process_ok = lang('account.register_complete_title');
          var subtitle_process_ok = lang('account.register_complete_subtitle');

          /* Mostrar spinner */
          $dialog.append('<span class="dialog_spinner"><span class="spinner"></span><strong class="spinner_text">' + lang('inner.loading') + '</strong></span>').addClass('spinner');

          postObject = self.composeRegisterObject(form.element);
          $.cookie('email', postObject.userInfo.field_register_email);

          Bus.publish('services', registerServiceType, {
            userId: self.userData && self.userData.identity ? self.userData.identity : undefined,
            data: postObject,
            userType: (self.migrateUser)? self.userData.userType : '',
            success: function(data){
              var error = (data.header) ? data.header.error : '';
              var code = data.header.code;
              var $form = form;

              /* remove spinner */
              $dialog.removeClass('spinner').find('.dialog_spinner').remove();

              /* Errors control */
              if (error === true) {
                var pageArea = $registerForm.hasClass('finish_checkout') ? 'SUMA-confirmacioncompra' : 'SUMA-MIcuenta';
                if(pageArea == 'SUMA-MIcuenta' && $('#content').hasClass('landing_suma')) {
                  pageArea = 'SUMA-Landing';
                }
                updateGtm({
                  'pageArea': pageArea,
                  'pageCategory': 'registrarse',
                  'pageContent': 'error_'+data.header.message
                });


                if (code == 400) {
                  /* remove spinner */
                  self.showFieldErrors($registerForm, data.body.data);
                }

                else if (code === 12009 || code === 12001) {
                  /* remove spinner */
                  /* Show popup error */
                  $(parentId).ui_dialog({
                    title: lang('general.info_error_title'),
                    error: false,
                    subtitle: data.header.message,
                    close: {
                      behaviour: 'close',
                      href: '#'
                    },
                    buttons: [
                      {
                        className: 'login',
                        href: '#',
                        label: lang('account.login_button_hint')
                      },
                      {
                        className: 'close',
                        href: '#',
                        label: lang('general.close_hint')
                      }
                    ],
                    render:function ($dialog_error) {
                      $dialog_error.find('.login a').on('click', function(event) {
                        event.preventDefault();
                        $dialog_error.find('.dialog_buttons .close a').click();
                        /* Show login dialog */
                        var loginUrl = getProcessUrl('login');
                        Bus.publish('hash', 'change', {hash: loginUrl});
                      });
                    }
                  });
                }

                else if (code === 12008 || code === 12002) {
                  /*
                    12002 - MyAE user
                    12008 - Mobile user

                    Dialog must show info and redirect to login
                  */
                  var titleText  = lang('account.recovery_complete_title');
                  var buttonText = lang('account.suma_activation');
                  var bodyText   = '';

                  if (code === 12008) {
                    bodyText = lang('account.suma_activation_app_text_1');
                    bodyText += ' '+lang('account.suma_activation_app_text_2');
                    bodyText += ' '+lang('account.suma_activation_app_text_3');
                  } else if (code === 12002) {
                    bodyText = lang('account.suma_activation_myaea_text_1');
                    bodyText += ' '+lang('account.suma_activation_myaea_text_2');
                    bodyText += ' '+lang('account.suma_activation_myaea_text_3');
                    bodyText += ' '+lang('account.suma_activation_myaea_text_4');
                  }

                  $(parentId).ui_dialog({
                    title: titleText,
                    error: false,
                    subtitle: bodyText,
                    close: {
                      behaviour: 'close',
                      href: '#'
                    },
                    buttons: [
                      {
                        className: 'login',
                        href: '#',
                        label: buttonText
                      },
                      {
                        className: 'close',
                        href: '#',
                        label: lang('general.close_hint')
                      }
                    ],
                    render:function ($dialog_error) {
                      $dialog_error.find('.login a').on('click', function(event) {
                        event.preventDefault();
                        $dialog_error.find('.dialog_buttons .close a').click();
                        /* Show login dialog */
                        var loginUrl = getProcessUrl('login');
                        Bus.publish('hash', 'change', {hash: loginUrl});
                      });
                    }
                  });
                }

                else{
                  /* remove spinner */
                  /* Show popup error */
                  $(parentId).ui_dialog({
                    title: lang('general.info_error_title'),
                    error: false,
                    subtitle: data.header.message,
                    close: {
                      behaviour: 'close',
                      href: '#'
                    },
                    buttons: [
                      {
                        className: 'close',
                        href: '#',
                        label: lang('general.close_hint')
                      }
                    ]
                  });
                }
              }
              /* Success control */
              else{
                var pageArea = $registerForm.hasClass('finish_checkout') ? 'SUMA-confirmacioncompra' : 'SUMA-MIcuenta';
                if(pageArea == 'SUMA-MIcuenta' && $('#content').hasClass('landing_suma')) {
                  pageArea = 'SUMA-Landing';
                }
                  updateGtm({
                  'pageArea': pageArea,
                  'pageCategory': 'registrarse',
                  'pageContent': 'registro_ok'
                });
                var isMigrate = self.migrateUser;

                /* get the title of the alert when everything is ok */
                if (isMigrate) {
                  title_process_ok = lang('account.recovery_complete_title');
                  subtitle_process_ok = lang('account.recovery_complete_subtitle');
                }

                /* reset update flag register */
                self.migrateUser = false;

                /* remove spinner */
                $(parentId).ui_dialog({
                  title: title_process_ok,
                  error: false,
                  subtitle: subtitle_process_ok,
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
                  render: function($dialog) {
                    /* Buttons behaviour */
                    $dialog.find('.close a').on('click', function(event) {
                      event.preventDefault();
                      if ($registerForm.hasClass('register_form_checkin') === true) {
                        var mode;
                        var step = 'passengers';

                        Bus.publish('process', 'show_checkin_step', {mode: mode, step: step});
                      } else if (isMigrate) {
                        Bus.publish('process', 'show_login');
                      } else {
                        event.stopImmediatePropagation();

                        window.location = urlCms('landing_suma');
                      }
                    });
                  }
                });
              }
            }
          });
        },
        onError: function(form) {
          self.showFormError(form.element);
        }
      });

      $registerDialog.find('.submit_register a').on('click', function(event) {
        event.preventDefault();
        $registerDialog.find('form').trigger('submit');
      });

    },

    documentType: function($externalForm) {
      var $documentBlocks = this.element.find('.document_block');
      var self = this;

      if (typeof $externalForm !== 'undefined') {
        $documentBlocks = $externalForm.find('.document_block');
      }

      $documentBlocks.each(function() {
        var $this = $(this);
        var $type = $this.find('.document_type');
        var $number = $this.find('.document_number');
        var $fieldsetBody = $this.closest('.fieldset_body');
        var firstLoad = true;

        /* Document type change event, depending on which document type the user selects we have to apply different rules */
        $type.find('select').on('change', function() {

          /* Get select value and text */
          var $select = $(this);
          var $option = $select.find('option:selected');
          var value = $option.attr('value');

          /* Document number text field with no background color by default */
          $number.find('input').closest('.field').removeClass('non_editable');

          /* DNI / Congress */
          if (value == 'NI' || value == 'GR') {
            /* Required status */
            $number.attr('data-required', 'true').removeClass('valid filled');

            /* Format status */
            $number.attr('data-format', 'dni');

          }

          /* Passport */
          else if (value == 'PP') {
            /* Required status */
            $number.attr('data-required', 'true').removeClass('valid filled');

            /* Format status */
            $number.attr('data-format', 'passport');
          }

          /* European ID */
          else if (value == 'DL') {
            /* Required status */
            $number.attr('data-required', 'true').removeClass('valid filled');

            /* Format status */
            $number.attr('data-format', 'passport');

            /* Show large family checkbox */
            $fieldsetBody.find('.check_group.large_family').removeClass('hidden');
          }

          /* NIE */
          else if (value == 'ID') {
            /* Required status */
            $number.attr('data-required', 'true').removeClass('valid filled');

            /* Format status */
            $number.attr('data-format', 'nie');

            /* Show large family checkbox */
            $fieldsetBody.find('.check_group.large_family').removeClass('hidden');
          }

          /* Under 14, no ID */
          else if (value == 'MN') {
            /* Required status */
            $number.attr('data-required', 'false');

            /* Format status */
            $number.removeAttr('data-format');

            /* Put document number text field in grey #dadada */
            $number.find('input').val('').closest('.field').addClass('non_editable').removeClass('filled valid');

            /* Hide large family checkbox */
            $fieldsetBody.find('.check_group.large_family').removeClass('hidden');
          }

          /* Uncheck large family checkbox */
          if ($fieldsetBody.find('.check_group.large_family').hasClass('hidden')) {
            $fieldsetBody.find('.large_family_check').prop('checked', false).change();
          }

          /* Restart fields */
          if (!firstLoad) {
            $number.attr('data-init', 'restart');

            /* Reassign forms to validate the added fields */
            $select.closest('form').form('restartFields');
          }

        });

        $type.find('select').trigger('change');

        firstLoad = false;
      });
    },

    initFieldDocumentExpiration: function () {
      var cadenadias = '';
      var cadenameses = '';
      var cadenaanyos = '';
      var currentyear = (new Date).getFullYear();
      var iaux = '';
      var jaux = '';

      cadenaanyos = '<option value=""></option>';
      cadenadias = '<option value=""></option>';
      cadenameses = '<option value=""></option>';

      // day list
      for (var i = 1; i < 32; i++) {
        if(i < 9){
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
      for (var i = currentyear; i < currentyear+31; i++) {
        cadenaanyos = cadenaanyos + '<option value="' + i + '">' + i + '</option>';
      };

      $(".day_input").html(cadenadias);
      $(".month_input").html(cadenameses);
      $(".year_input").html(cadenaanyos);

      // update combos if date is set
      var idsnecesariosp = $("[id$='_document_expiration']");
      idsnecesariosp.each(function(){
        if($(this).val() != ""){
          var targetId  = $(this).attr("id");
          var dateParts = $("#"+targetId).val().split("/");

          $('.' + targetId + '.passport_expirationyear').val(dateParts[2]).trigger('change', [true]);
          $('.' + targetId + '.passport_expirationmonth').val(dateParts[1]).trigger('change', [true]);
          $('.' + targetId + '.passport_expirationday').val(dateParts[0]).trigger('change', [true]);
        }

        $(".passport_accordeon").children(".passport_accordeon").addClass("passport_accordeonocult");
        $(".passport_accordeonocult").removeClass("passport_accordeon");
      });
    },

    initFieldBirthdate: function (parentSelector) {
      var cadenadias = '';
      var cadenameses = '';
      var cadenaanyosadult = '';
      var currentyear = (new Date).getFullYear();
      var iaux = '';
      var jaux = '';

      cadenaanyosadult = '<option value=""></option>';
      cadenadias = '<option value=""></option>';
      cadenameses = '<option value=""></option>';

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
      for (var i = currentyear-2; i > currentyear-131; i--) {
        cadenaanyosadult = cadenaanyosadult + '<option value="' + i + '">' + i + '</option>';
      };

      $(parentSelector).find(".bday_input").html(cadenadias);
      $(parentSelector).find(".byear_input_adult").html(cadenaanyosadult);
      $(parentSelector).find(".bmonth_input").html(cadenameses);

      // update combos if date is set
      var idsnecesarios = $("[id$='_birthdate']");
      idsnecesarios.each(function(){
        if($(this).val() != ""){
          var targetId  = $(this).attr("id");
          var dateParts = $("#"+targetId).val().split("/");

          $(parentSelector).find('.' + targetId + '.byear').val(dateParts[2]).trigger('change', [true]);
          $(parentSelector).find('.' + targetId + '.bmonth').val(dateParts[1]).trigger('change', [true]);
          $(parentSelector).find('.' + targetId + '.bday').val(dateParts[0]).trigger('change', [true]);
        };
      });
    },



    /*
     * Calculate birthdate of give date (in format YYYY-MM-DD)
     */
    calcularEdad: function(userDateString) {
      var today = moment();
      var userDate = moment(userDateString, "YYYY-MM-DD");

      var userYears = today.diff(userDate, 'years', true);

      return userYears;
    },



    documentExpirationActions: function () {
      $(".date_passport_expiration_input").change(function() {
        var inputtarget = $(this).attr("data-input-target");

        // reset value of the hidden date input
        $("#"+inputtarget).val("");

        var dayValue   = $("." + inputtarget + ".passport_expirationday").val();
        var monthValue = $("." + inputtarget + ".passport_expirationmonth").val();
        var yearValue  = $("." + inputtarget + ".passport_expirationyear").val();

        if (dayValue != "" && monthValue != "" && yearValue != "") {
          // set and validate hidden date input
          var finaldate = dayValue + "/" + monthValue + "/" + yearValue;

          $("#" + inputtarget).val(finaldate);
          $("#" + inputtarget).closest(".document_expiration").trigger('validate');
          $("#" + inputtarget).focus();

          // set/unset error class to all date combos
          if ($("#" + inputtarget).closest(".document_expiration").hasClass("error")) {
            $("." + inputtarget).closest('.select_field').addClass("errorper");
          } else {
            $("." + inputtarget).closest('.select_field').removeClass("errorper");
          }
        }
      });
    },

    birthdateActions: function(parentSelector) {
      var self = this;

      $(parentSelector).find(".date_birthday_input").change(function() {
        var inputtarget = $(this).attr("data-input-target");

        // reset value of the hidden date input
        $("#" + inputtarget).val("");

        var today = new Date();
        var todayDay = today.getDate();
        var todayMonth = today.getMonth()+1;
        var todayMonthReal = today.getMonth()+1;
        var todayYear  = today.getFullYear();
        var yearMin = (today.getFullYear()-2);

        var dayValue   = $(parentSelector).find("." + inputtarget + ".bday").val();
        var monthValue = $(parentSelector).find("." + inputtarget + ".bmonth").val();
        var yearValue  = $(parentSelector).find("." + inputtarget + ".byear").val();

        if(todayDay === 1 && todayMonth !== 1){
          todayMonth -=1;
        }

        if((todayMonthReal === 1) && (todayDay === 1)){
          $(parentSelector).find('.' + inputtarget + '.byear_input_adult option[value='+yearMin+']').hide();
        }

        if (yearMin == yearValue) {

           //Month
          $(parentSelector).find('.' + inputtarget + '.bmonth_input option').hide();
          $(parentSelector).find('.' + inputtarget + '.bmonth_input option:lt('+(todayMonth+1)+')').show();

          if ((monthValue != '') && (monthValue > todayMonth)) {
            $(parentSelector).find('#' + inputtarget).val('');
            $(parentSelector).find('.' + inputtarget + '.bmonth_input').val('').trigger('change');
            monthValue = '';
          }

          if ((monthValue != '') && (monthValue == todayMonthReal)){
          //Day
            $(parentSelector).find('.' + inputtarget + '.bday_input option').hide();
            $(parentSelector).find('.' + inputtarget + '.bday_input option:lt('+(todayDay)+')').show();

            if ((dayValue != '') && (dayValue >= todayDay)) {
              $(parentSelector).find('#' + inputtarget).val('');
              $(parentSelector).find('.' + inputtarget + '.bday_input').val('').trigger('change');
              dayValue = '';
            }
          }
        } else {
          $(parentSelector).find('.'+inputtarget + '.bmonth_input option').show();
          $(parentSelector).find('.'+inputtarget + '.bday_input option').show();
        }


        if (dayValue != "" && monthValue != "" && yearValue != "") {
          // set and validate hidden date input
          var finaldate = dayValue + "/" + monthValue + "/" + yearValue;
          $(parentSelector).find("#" + inputtarget).val(finaldate);

          $(parentSelector).find("#" + inputtarget).closest(".age").trigger('validate');
          $(parentSelector).find("#" + inputtarget).focus();

          // set/unset error class to all date combos
          if ($(parentSelector).find("#" + inputtarget).closest(".age").hasClass("error")) {
            $(parentSelector).find("." + inputtarget).closest('.select_field').addClass("errorper");
          } else {
            $(parentSelector).find("." + inputtarget).closest('.select_field').removeClass("errorper");

            /* Focus current element */
            $(this).focus();
          }

          /* If age selected is under 18, show cepsa checkbox */
          var userDate = yearValue +'-'+ monthValue +'-'+ dayValue;

          if (self.calcularEdad(userDate) >= 18) {
            self.element.find('#cepsa').removeClass('hidden');
          } else {
            self.element.find('#cepsa').addClass('hidden');
          }
        }
      });
    },

    composeRegisterObject: function($form) {
      var postObject = {};
      var notifications = 'ONLY_AIREUROPA';
      var userData = {};
      var preferenceAirport = $form.find('[name=field_register_document_preference_airport]').val();

      /* Get the data from the user form */
      userData = $form.serializeObject();

      if ($form.find('#field_register_comunication, #field_cko_register_comunication').is(':checked')){
        notifications = 'NONE';
      }

      userData.country = $form.find('[name=field_register_document_nationality]').val();

      if(preferenceAirport){
        userData.preferenceAirport = preferenceAirport;        
      }

      postObject.userInfo = userData;
      postObject.receiveNotifications = notifications;
      postObject.cepsa = $form.find('[name=field_register_data_cession_cepsa]').is(':checked');

      /* Cache the postObject to send it with checkout session */
      this.accountServiceObject = postObject;

      return postObject;
    },

    composeLoginObject: function($form){
      var postObject = {};

      /* Get the data from the user form */
      postObject = $form.serializeObject();

      return postObject;
    },

    showFormError: function($form) {
      var $content = $form.closest('.dialog_content');

      /* Show the messages */
      $form.addClass('error');
      if ($form.find('.block_body .form_error').length == 0) {
        $form.find('.block_body').prepend('<div class="form_error"><div class="error_message"><p>' + lang('general.formError') + '</p></div></div>');
      }
      $form.find('.initial_status').not('.disabled').removeClass('initial_status');

      /* Scroll to the top of the form to show the error */
      var $destinyBlock = $form.find('.error').eq(0);
      /* Send scroll to the form */
      Bus.publish('scroll', 'scrollTo', {element: $content.get(), position: ($destinyBlock.position().top + $content.scrollTop())});
    },

    /* Show field errors from user form */
    showFieldErrors: function($form, errors) {
      var self = this;

      $.each(errors, function(indexError, error) {
        /* Get type */
        var field = error.field.replace(/\./g, '_');

        /* Get error field */
        var $errorField = $form.find('[data-service-name=' + field + ']').closest('.field');

        /* Show error and set message */
        $errorField.trigger('show_error', [error.message]);
        $errorField.addClass('error').removeClass('valid initial_status');

        /* Show form error */
        self.showFormError($form);

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
          self.showPasswordError($passwordInput2.attr('data-service-name'), $element);
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

          self.showPasswordError($passwordInput2.attr('data-service-name'), $element);
          $password2.closest('.field').removeClass('non_editable');
          $passwordInput2.attr('readonly', false);
          $passwordInput2.focus();
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

    showPasswordError: function(fieldName, $element){
      var $errorField = $element.find('[data-service-name = '+ fieldName +']').closest('.field');

      /* Show error and set message */
      $errorField.trigger('show_error', lang('account.error_match_password2'));
      $errorField.addClass('error').removeClass('valid initial_status');

      /* Send the event to put the field invalid, so the user can't do the submit */
      $errorField.trigger('set_valid', [false]);
    },

    /* When user change the password, check the confirm password */
    listenEmail: function(fieldEmail, fieldEmail2, $element) {
    	var self = this;
        var $email = $element.find(fieldEmail);
        var $email2 = $element.find(fieldEmail2);

        var $emailInput = $email.find('input');
        var $emailInput2 = $email2.find('input');

        $emailInput2.on('blur', function(event) {

          if ($email2.closest('.field').hasClass('valid') && ($emailInput2.val() != $emailInput.val())){
            self.showEmailError($email2.attr('data-service-name'), $element);
          }

          if (! $email.closest('.field').hasClass('valid'))
          {
            $email2.closest('.field').addClass('non_editable');
            $emailInput2.attr('readonly', true);
            $emailInput2.val('');
            $email2.closest('.field').removeClass('valid');
          }

        });

        $emailInput.on('blur', function(event) {

          if ($email.closest('.field').hasClass('valid') && ($emailInput2.val() != $emailInput.val())){

            self.showEmailError($email2.attr('data-service-name'), $element);
            $email2.closest('.field').removeClass('non_editable');
            $emailInput2.attr('readonly', false);
          }

          if (($emailInput.val() == '') && !($email2.closest('.field').hasClass('non_editable'))
            || (! $email.closest('.field').hasClass('valid')))
          {
            $email2.closest('.field').removeClass('valid');
            $email2.closest('.field').addClass('non_editable');
            $emailInput2.attr('readonly', true);
            $emailInput2.val('');
          }

        });
    },

    showEmailError: function(fieldName, $element){
      var $errorField = $element.find('[data-service-name = '+ fieldName +']').closest('.field');

      /* Show error and set message */
      $errorField.trigger('show_error', lang('account.error_match_email2'));
      $errorField.addClass('error').removeClass('valid initial_status');

      /* Send the event to put the field invalid, so the user can't do the submit */
      $errorField.trigger('set_valid', [false]);
    },

    updateMilesNumber: function (newMilesNumber) {
      /* Check if it's a valid number */
      if (!(typeof newMilesNumber === "number" &&
            Math.floor(newMilesNumber) === newMilesNumber)) {
        return;
      }

      /* Update user data */
      User.updateMilesNumber(newMilesNumber);

      /* Update miles number on views with a jQuery selector */
      $('.user_miles').html(formatCurrency(newMilesNumber));

      /* Update miles number on sliders */
      $('.need_to_update_max').attr('data-max', newMilesNumber);

      /* Delete info bubble */
      $('.need_to_update_max').find('.ui-slider-handle .value').remove();

      /* Reinit the sliders and their parent forms */
      $('.need_to_update_max').attr('data-init', 'restart');
      $('.need_to_update_max').closest('form').form('restartFields');
    },

    acceptConditions: function($dialog, $dialogToClose){
      var self = this;
      /* Call accept conditions user conditions */
      Bus.publish('services', 'accept_conditions_user', {
        userId: localStorage.ly_userId,
        success: function(data, jqXHR){

          /* remove spinner */
          $dialog.find('.dialog_content').removeClass('spinner').find('.dialog_spinner').remove();

          /* The login and conditions are correct */
          var error = (jqXHR.status != 201 /*|| data.error || data.header.error*/) ? true : false;

          if ( error === true ){
            /* Show popup error */
            $dialog.closest('.dialog.visible').ui_dialog({
              title: lang('general.info_error_title'),
              error: false,
              subtitle: (data.error) ? lang('account.conditions_error_service') : data.header.message,
              buttons: [
                {
                  className: 'close',
                  href: '#',
                  label: lang('general.ok')
                }
              ],
              render: function ($dialog_error) {
                $dialog_error.find('.close a').on('click', function(event) {
                  event.preventDefault();
                  User.logoff();
                  /* send to home */
                  window.location.href = '/';
                });
              }
            });
          }else{
            /* all is correct */
            if ($dialogToClose){
              $dialogToClose.closest('.dialog.visible').hide();
            }
            // self.showWellcomeDialog($dialog, $form);
            window.location = urlCms('landing_suma');
          }
        }
      });
    },

    showWellcomeDialog: function($loginDialog, $form){
      var userFullName = '';
      var title = '';
      var subtitle = '';

      /* hide the login form */
      $form.hide();

      /* the conditions are ok, show the wellcome message */
      Bus.publish('account', 'login');

      /* remove active previous dialog */
      $loginDialog.closest('.search_form.active').find('.close a').click();

      /* set the ui_dialog title and subtitle with the user full name */
      userFullName = this.userData.personCompleteName.name
                     + ' ' + this.userData.personCompleteName.firstSurname
                     + ' ' + ((this.userData.personCompleteName.secondSurname)? this.userData.personCompleteName.secondSurname : '');

      title = lang('account.landing_welcome_title') + ' ' + userFullName;
      subtitle = lang('account.landing_welcome_subTitle');

      var href

      /* show wellcome dialog */
      $('body').ui_dialog({
        no_opacity: true,
        title: title,
        subtitle: subtitle,
        xxxl: true,
        plain_dialog: true,
        aux_class: 'login_landing',
        content: null,
        close: {
          behaviour: 'close',
          href: '#'
        },
        buttons: [
          {
            className: 'close',
            href: '#',
            label: lang('general.continue')
          },
          {
            className: 'myAccount',
            href: urlCms('my_bookings'),
            label: lang('account.landing_welcome_my_account')
          }
        ]
      });

      /* Hide the #search layer */
      $('#search').removeClass('visible finished');

      /* Set the focus to html, to avoid sending again the login after showing the welcome dialog */
      $('html').focus();

    },

    initRegisterDistnaceForm: function(oNotify){
      var self = this;
      var $register_distnace = $('#content .register_distnace').closest('.inner_form');
      
      //Fix change language urls to keep the anchor
      if(window.location.hash) {
  		$('.languages_list li a').each(function(){
  			var link = this.href + window.location.hash;
  			this.href = link;
  		});
  	}

      /* Listen Password in register distnace */
      //self.listenPassword('#new_password_distnace_1', '#new_password_distnace_2', $register_distnace);
      self.listenPassword('#new_password_distnace_wrapper', '#new_password_distnace_wrapper_2', $register_distnace);

      /* Init register distnace form */
      $register_distnace.find('form').form({
        onSubmit: function(form) {
          var $form = form.element;
          /* Avoid double click disabling the button */
          $form.find('.submit .submit_button button').attr('disabled', 'disabled').addClass('loading');
          postObject = form.element.serializeObject();

          /*get from url the token */
          postObject.token = oNotify.token;

          /* add loading */
          $form.find('.submit .submit_button button').attr('disabled', 'disabled').addClass('loading');

          Bus.publish('services', 'register_distnace_user', {
          data: postObject,
          success: function(data){
            var error = (data.header) ? data.header.error : '';
            var code = data.header.code;

            /* remove spinner */
            $form.find('.submit .submit_button button').removeAttr('disabled').removeClass('loading');

            if (error === true) {
              /* Show popup error */
              $('#content').ui_dialog({
                title: lang('general.info_error_title'),
                error: true,
                subtitle: data.header.message,
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
            else{
              $('#content').ui_dialog({
                title: lang('account.register_distnace_title'),
                error: false,
                subtitle: lang('account.register_distnace_subtitle'),
                buttons: [
                  {
                    className: 'close',
                    href: '#',
                    label: lang('general.ok')
                  }
                ],
                render: function($dialog) {
                  /* Buttons behaviour */
                  $dialog.find('.close a').on('click', function(event) {
                    event.preventDefault();
                    Bus.publish('process', 'kill');

                    /* send to home */
                    window.location = urlCms('landing_suma');
                  });
                }
              });
            }
          }
        });



          }
      });
    },
    initRegisterSiebelForm: function(){
        var self = this;
        var $form = $('#content form.register_siebel');
        if($form.lenght == 0) {
        	return;
        }

        var $register_siebel = $form.closest('.inner_form');

        /* Listen Password in register distnace */
        self.listenPassword('#new_password_distnace_wrapper', '#new_password_distnace_wrapper_2', $register_siebel);
        self.listenEmail('#field_register_email_wrapper', '#field_register_email_wrapper_2', $register_siebel);
        
        /* get from server all the list to add in the register select */
        Bus.publish('services', 'get_account_lists', {
          preconditionDocsType: 'LOYALTY',
          success: function (response) {

            if ($register_siebel.find('.register_siebel #field_register_document_nationality option').length == 1 )
            {
              $.each(response.countries, function(indexCountry, country) {
              	$register_siebel.find('.register_siebel #field_register_document_nationality').append('<option value="'+country.code+'">'+ country.description+'</option>');
              });
            }

            if ($register_siebel.find('.register_siebel #field_register_document_type option').length == 1 )
            {
              $.each(response.document_type, function(indexDocumentation, document) {
              	$register_siebel.find('.register_siebel #field_register_document_type').append('<option value="'+document.code+'">'+ document.description+'</option>');
              });
            }

          }
        });

        self.documentType($form);
        self.phoneFields($form);
        
        /* Init register siebel form */
        $form.form({
          onSubmit: function(form) {
        	 var notifications = 'ONLY_AIREUROPA';
            var $form = form.element;
            /* Avoid double click disabling the button */
            $form.find('.submit .submit_button button').attr('disabled', 'disabled').addClass('loading');
            postObject = form.element.serializeObject();

            if ($form.find('#field_siebel_register_comunication_no').is(':checked')){
                notifications = 'ONLY_AIREUROPA';
            }else if ($form.find('#field_siebel_register_comunication_yes_ae').is(':checked')){
                notifications = 'ONLY_AIREUROPA';
            }
            postObject.receiveNotifications = notifications;

            /* add loading */
            $form.find('.submit .submit_button button').attr('disabled', 'disabled').addClass('loading');

            Bus.publish('services', 'register_siebel_user', {
            data: postObject,
            success: function(data){
              var error = (data.header) ? data.header.error : '';
              var code = data.header.code;
              var message = data.header.message;

              /* Update Google Tag Manager */
              if (error === true) {
                updateGtm({
                  'pageArea': 'SUMA-prealta',
                  'pageCategory': 'confirmacion-empleados',
                  'pageContent': data.header.message
                });
                
              }else{
                updateGtm({
                  'pageArea': 'SUMA-prealta',
                  'pageCategory': 'confirmacion-empleados',
                  'pageContent': "alta_ok"
                });
              }

              /* remove spinner */
              $form.find('.submit .submit_button button').removeAttr('disabled').removeClass('loading');

              if (error === true) {

                if (code == 12701) {
                  /* Show popup error */
                  $('#content').ui_dialog({
                    title: lang('general.info_error_title'),
                    error: true,
                    subtitle: message,
                    close: {
                      behaviour: 'close',
                      href: '#'
                    },
                    buttons: [
                      {
                        className: 'login',
                        href: '#',
                        label: lang('account.login_button_hint')
                      },
                      {
                        className: 'close',
                        href: '#',
                        label: lang('general.close_hint')
                      }
                    ],
                    render:function ($dialog_error) {
                      $dialog_error.find('.login a').on('click', function(event) {
                        event.preventDefault();

                        $dialog_error.find('.dialog_buttons .close a').click();

                        /* Show login dialog */
                        var loginUrl = getProcessUrl('login');
                        Bus.publish('hash', 'change', {hash: loginUrl});
                      });
                    }
                  });
                } else {
                  /* Show popup error */
                  $('#content').ui_dialog({
                    title: lang('general.info_error_title'),
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
              else{
                $('#content').ui_dialog({
                  title: lang('account.register_siebel_title'),
                  error: false,
                  subtitle: lang('account.register_siebel_subtitle'),
                  buttons: [
                    {
                      className: 'close',
                      href: '/#/login',
                      label: lang('general.ok')
                    }
                  ],
                  render: function($dialog) {
                    /* Buttons behaviour */
                    $dialog.find('.close a').on('click', function(event) {
                      event.preventDefault();
                      Bus.publish('process', 'kill');

                      /* send to home */
                      window.location.href = '/#/login';
                    });
                  }
                });
              }
            }
          });



            }
        });
      },

    initRestoreLoyaltyUser: function(oNotify){
      var self = this;
      var $restorePasswordForm = $('#content .recover_user').closest('.inner_form');

      //self.listenPassword('#new_password_1', '#new_password_2',$restorePasswordForm);
      self.listenPassword('#new_password_wrapper', '#new_password_wrapper_2',$restorePasswordForm);

      /* Init dialog form */
      $restorePasswordForm.find('form').form({
        onSubmit: function(form) {
          var $form = form.element;
          /* Avoid double click disabling the button */
          $form.find('.submit .submit_button button').attr('disabled', 'disabled').addClass('loading');
          postObject = form.element.serializeObject();
          /*get from url the token */
          postObject.token = oNotify.token;

          Bus.publish('services', 'restore_password_user', {
            data: postObject,
            success: function(data){
              var error = (data.header) ? data.header.error : '';
              var code = data.header.code;

              /* remove spinner */
              $form.find('.submit .submit_button button').removeAttr('disabled').removeClass('loading');

              if (error === true) {
                /* Show popup error */
                $('#content').ui_dialog({
                  title: lang('general.info_error_title'),
                  error: true,
                  subtitle: data.header.message,
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
              else{
                $('#content').ui_dialog({
                  title: lang('account.recover_loyalty_user_title'),
                  error: false,
                  subtitle: lang('account.recover_loyalty_user_subtitle'),
                  buttons: [
                    {
                      className: 'close',
                      href: '#',
                      label: lang('general.ok')
                    }
                  ],
                  render: function($dialog) {
                    /* Buttons behaviour */
                    $dialog.find('.close a').on('click', function(event) {
                      event.preventDefault();
                      Bus.publish('process', 'kill');

                      /* send to home */
                      window.location = urlCms('landing_suma');
                    });
                  }
                });
              }
            }
          });
        }
      });
    },

    initLogoutOnLanguageChange: function() {
    	$(".languages_list li a[data-access-loyalty='false']").each(function() {
    		var $this = $(this);

    		$this.on('click', function() {
    			Bus.publish('account', 'logoff');
    		});
    	});
    },
    
    phoneFields: function($externalForm) {
    	var $phoneBlocks = this.element.find('.phone_block');
        var self = this;

        if (typeof $externalForm !== 'undefined') {
        	$phoneBlocks = $externalForm.find('.phone_block');
        }
        
        $phoneBlocks.each(function() {
        	var $this = $(this);
            var $type = $this.find('.phone_type');
            var $prefix = $this.find('.phone_prefix');
            var $number = $this.find('.phone');
            
            $type.find('select').on('change', function() {
            	self.checkPhoneFields($type, $prefix, $number);
            });
            
            $prefix.find('select').on('change', function() {
            	self.checkPhoneFields($type, $prefix, $number);
            });
            
            $number.find('input[type="text"]').on('change', function() {
            	self.checkPhoneFields($type, $prefix, $number);
            });
        });
    },
    
    checkPhoneFields: function($type, $prefix, $number) {
    	var self = this;
    	var someFilled = false;
    	var $registerForm = $type.closest('form');
    	
    	if($type.find('select').val() != '') {
    		someFilled = true;
    	}
    	
    	if($prefix.find('select').val() != '') {
    		someFilled = true;
    	}
    	
    	if($number.find('input[type="text"]').val() != '') {
    		someFilled = true;
    	}
    	
    	if(someFilled) {
    		$type.attr('data-required', 'true');
    		$prefix.attr('data-required', 'true');
    		$number.attr('data-required', 'true');

    		$type.attr('data-init', 'restart');
    		$prefix.attr('data-init', 'restart');
    		$number.attr('data-init', 'restart');
    		
    		$type.find('.helper').hide();
    		$prefix.find('.helper').hide();
    		$number.find('.helper').hide();
    	} else {
    		$type.attr('data-required', 'false');
    		$prefix.attr('data-required', 'false');
    		$number.attr('data-required', 'false');

    		$type.attr('data-init', 'restart');
    		$prefix.attr('data-init', 'restart');
    		$number.attr('data-init', 'restart');
    		
    		$type.find('.helper').show();
    		$prefix.find('.helper').show();
    		$number.find('.helper').show();
    	}
    	
    	$registerForm.form('restartFields');
    }

  };
});
