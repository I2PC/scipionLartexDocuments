Hydra.module.register('H72Form', function (Bus, Module, ErrorHandler, Api) {
      return {
            selector: '#h72',
            element: undefined,

            /* H72 cache */
            h72FormCache: {},

            events: {
                  'h72Form': {
                        'custom_init': function () {
                              this.customInit();
                              Bus.publish('prerender', 'restart');
                        }
                  }
            },

            init: function () {
                  // this.customInit();
            },

            initJourneySummary: function () {
                  /*Evento que escucha las cabeceras del journey*/
                  this.element.find('.block_header.journey-summary').on('click', function (event) {
                        event.preventDefault();
                        var $this = $(this);

                        /*Comprobamos si ya esta visible la capa*/
                        if ($this.closest('.journey').hasClass('expanded')) {
                              $this.closest('.journey').find('.block_body').slideUp(300);
                              $this.closest('.journey').removeClass('expanded');
                              $this.removeClass('expanded');
                        } else {
                              $this.closest('.journey').find('.block_body').slideDown(300);
                              $this.closest('.journey').addClass('expanded');
                              $this.addClass('expanded');
                        }
                  });
            },
            /* Forms */
            initForm: function () {
                  var self = this;
                  var $mainForm = this.element.find('form').not('.subform');
                  var userData = {};
                  var step = this.element.find('.process_step').attr('data-step');

                  userData = $mainForm.serializeObject();

                  /* hide login box */
                  (step != 'passengers') ? $('.checkout_block.login').slideUp() : $('.checkout_block.login').slideDown();

                  var errorsForm = [];
                  $mainForm.form({
                        onError: function (form) {
                              /*check if is finnish step*/
                              errorsForm = (form.element.parent().hasClass('finish')) ? ['CondicionesCompra', 'ComunicacionesComerciales'] : self.getErrorsInForm(form.element);

                              /* gtm trace errors */
                              self.traceManager('error_form', self.h72FormCache, null, null, errorsForm, form.element.parent().attr('data-step'));

                              self.showFormError(form.element);
                        },
                        onSubmit: function (form) {
                              var nextStep = form.element.closest('.process_step').attr('data-next');
                              var postSessionURL = getPostURL('h72_payment');
                              var checkoutSession = {};
                              var doSubmit = true;

                              var checkoutProcessURL = getProcessUrl('h72_payment');
                              var $checkGroup = $mainForm.find('.check_group.payment_method.valid.opened');

                              //Si el usuario esta logado, comprobamos que la cuenta siga activa
                              if (User.isLoggedIn()) {
                                    Bus.publish('services', 'check_user_status', {
                                          failure: function () {

                                                self.element.find('.user_info_miles').addClass('hidden');

                                                /* Show the dialog error*/
                                                self.element.find('.process_wrapper').ui_dialog({
                                                      title: lang('general.info_error_title'),
                                                      error: true,
                                                      xxl: true,
                                                      subtitle: lang('h72.user_check_error'),
                                                      buttons: [{
                                                            className: 'close',
                                                            href: '#',
                                                            label: lang('h72.user_close')
                                                      }]
                                                });

                                          }
                                    });
                              }

                              /* Set selected payment method on form hidden input */
                              $mainForm.find('.payment_method_type').val($checkGroup.attr('data-method'));

                              if (step == "payment") {

                                    if ($checkGroup.hasClass("credit_card")) {
                                          var documentField = self.element.find('input#field_credit_card_document_number');
                                          var documentFieldDiv = documentField.closest(".field");
                                          var passengers = self.h72FormCache.passengers;
                                          var message = lang('h72.payment_document_child_error');
                                          var document = $(documentField).val();
                                          for (var i = 0; i < passengers.length; i++) {
                                                if (document.toUpperCase() == passengers[i].identificationDocument.identity.toUpperCase() && (passengers[i].passengerType == "CHILD" || passengers[i].passengerType == "INFANT")) {
                                                      /* Update error hints */
                                                      documentFieldDiv.trigger('show_error', [message]);

                                                      /* Set classes to show the error */
                                                      documentFieldDiv.addClass('error').removeClass('valid initial_status');

                                                      doSubmit = false;

                                                      /*check if is finnish step*/
                                                      errorsForm = self.getErrorsInForm(form.element);

                                                      /* gtm trace errors */
                                                      self.traceManager('error_form', self.h72FormCache, null, null, errorsForm, form.element.parent().attr('data-step'));

                                                      self.showFormError(form.element);
                                                }
                                          }
                                    }

                                    if ($checkGroup.hasClass("mymiles")) {
                                          var documentField = self.element.find('input#field_mymiles_card_document_number');
                                          var documentFieldDiv = documentField.closest(".field");
                                          var passengers = self.h72FormCache.calculatePassengers;
                                          var message = lang('h72.payment_document_child_error');
                                          var document = $(documentField).val();
                                          for (var i = 0; i < passengers.length; i++) {
                                                if (document.toUpperCase() == passengers[i].identificationDocument.identity.toUpperCase() && (passengers[i].passengerType == "CHILD" || passengers[i].passengerType == "INFANT")) {
                                                      /* Update error hints */
                                                      documentFieldDiv.trigger('show_error', [message]);

                                                      /* Set classes to show the error */
                                                      documentFieldDiv.addClass('error').removeClass('valid initial_status');

                                                      doSubmit = false;

                                                      /*check if is finnish step*/
                                                      errorsForm = self.getErrorsInForm(form.element);

                                                      /* gtm trace errors */
                                                      self.traceManager('error_form', self.h72FormCache, null, null, errorsForm, form.element.parent().attr('data-step'));

                                                      self.showFormError(form.element);
                                                }
                                          }
                                    }
                              }

                              if (doSubmit) {
                                    /* Start widget animation */
                                    self.element.find('.process_scroll').steps('showLoading', function () {

                                          if (step == 'payment') {
                                                /* Removing close button */
                                                self.element.find('.close_checkout').remove();
                                          }

                                          /* Compose post object */
                                          checkoutSession = self.addPaymentFormData(form.element);

                                          /* Call to services to send data, calc scoring... */
                                          self.addServiceData(step, checkoutSession, function (checkoutSession, goToNextStep, showScoring, message, errors) {

                                                for (var key in checkoutSession.data)
                                                      checkoutSession[key] = checkoutSession.data[key];
                                                delete checkoutSession.data;

                                                Bus.publish('ajax', 'postJson', {
                                                      path: postSessionURL,
                                                      data: {
                                                            h72: checkoutSession
                                                      },
                                                      success: function () {
                                                            if (!form.element.hasClass('standalone')) {
                                                                  /* Attribute to control sate error continue by submitting the form with the button */
                                                                  if (goToNextStep) {
                                                                        //console.log("Continuamos");
                                                                        /* Set the status bar as completed */
                                                                        self.element.find('.checkout_status .steps .' + step).addClass('completed');

                                                                        /* Change URL */
                                                                        Bus.publish('hash', 'change', {
                                                                              hash: checkoutProcessURL + '/' + nextStep
                                                                        });
                                                                  } else {
                                                                        if (showScoring) {
                                                                              /* Update GTM */
                                                                              self.traceManager('cko_callmeback', checkoutSession, null, null);

                                                                              self.showCallMeBack();
                                                                              self.element.find('.process_scroll').steps('showErrors');
                                                                        } else {
                                                                              if (errors) {
                                                                                    if (step == 'payment') {
                                                                                          if (errors.saraError) {
                                                                                                /* SARA error - show sara popup */
                                                                                                /* Download the popup template */
                                                                                                Bus.publish('ajax', 'getTemplate', {
                                                                                                      data: self.saraTemplateData,
                                                                                                      path: eval('AirEuropaConfig.templates.checkout.sara_error'),
                                                                                                      success: function (template) {

                                                                                                            /* Show the dialog error with the sara template */
                                                                                                            $('#h72').find('.process_wrapper').ui_dialog({
                                                                                                                  title: lang('general.error_title'),
                                                                                                                  error: false,
                                                                                                                  xxl: true,
                                                                                                                  with_scroll: true,
                                                                                                                  content: template,
                                                                                                                  title: lang('h72.sara_dialog_title'),
                                                                                                                  subtitle: lang('h72.sara_dialog_subtitle'),
                                                                                                                  buttons: [{
                                                                                                                        className: 'continue',
                                                                                                                        href: '#',
                                                                                                                        label: lang('h72.sara_dialog_verify')
                                                                                                                  }],
                                                                                                                  render: function ($dialog) {
                                                                                                                        /* By default, show the last step behind the popup */
                                                                                                                        self.element.find('.process_scroll').steps('showErrors');

                                                                                                                        /* Call the document type function to manage popup document type fields */
                                                                                                                        self.documentType(false);

                                                                                                                        /* Init the form inside the dialog */
                                                                                                                        $dialog.find('.standard_form').form({
                                                                                                                              onSubmit: function (form) {
                                                                                                                                    /* Save the data */
                                                                                                                                    self.saraData = $dialog.find('.standard_form').serializeObject();

                                                                                                                                    /* Submit again the main form */
                                                                                                                                    $mainForm.submit();

                                                                                                                                    /* Close this dialog */
                                                                                                                                    $dialog.fadeOut(300);
                                                                                                                              }
                                                                                                                        });

                                                                                                                        /* Trigger document_type change to start number validation */
                                                                                                                        $dialog.find('.standard_form .document_type select').change();
                                                                                                                        $dialog.find('.standard_form .document_number').addClass('filled');
                                                                                                                        $dialog.find('.standard_form .document_number input').trigger('validate');

                                                                                                                        /* Continue button */
                                                                                                                        $dialog.find('.continue a, .close_dialog a').click(function (event) {

                                                                                                                              $dialog.find('.standard_form').submit();

                                                                                                                              event.stopPropagation();
                                                                                                                              event.preventDefault();
                                                                                                                        });
                                                                                                                  }
                                                                                                            });
                                                                                                      }
                                                                                                });
                                                                                          } else if (errors.goToHome) {

                                                                                                $('#checkout').ui_dialog({
                                                                                                      title: lang('general.error_title'),
                                                                                                      error: true,
                                                                                                      subtitle: message,
                                                                                                      close: {
                                                                                                            behaviour: 'close',
                                                                                                            href: '#'
                                                                                                      },
                                                                                                      buttons: [{
                                                                                                            className: 'close',
                                                                                                            href: '#',
                                                                                                            label: lang('general.ok')
                                                                                                      }],
                                                                                                      render: function ($dialog) {
                                                                                                            /* By default, show the last step behind the popup */
                                                                                                            self.element.find('.process_scroll').steps('showErrors');

                                                                                                            /* Continue button */
                                                                                                            $dialog.find('.close a, .close_dialog a').click(function (event) {

                                                                                                                  /* Kill the session */
                                                                                                                  Bus.publish('ajax', 'postJson', {
                                                                                                                        path: postSessionURL,
                                                                                                                        data: {
                                                                                                                              h72: {}
                                                                                                                        },
                                                                                                                        success: function () { }
                                                                                                                  });

                                                                                                                  /* Kill process and go home */
                                                                                                                  Bus.publish('process', 'kill');

                                                                                                                  event.stopPropagation();
                                                                                                                  event.preventDefault();
                                                                                                            });
                                                                                                      }
                                                                                                });
                                                                                          } else if (errors.paypal) {
                                                                                                /* Paypal error - go back to payment screen */
                                                                                                Bus.publish('hash', 'change', {
                                                                                                      hash: checkoutProcessURL + '/payment'
                                                                                                });
                                                                                          } else {
                                                                                                /* Payment error - go back to payment screen */
                                                                                                //console.log("Deberíamos volver al paso anterior y sacar los mensajes de error");
                                                                                                Bus.publish('hash', 'change', {
                                                                                                      hash: checkoutProcessURL + '/payment'
                                                                                                });
                                                                                                self.lastStepErrors = errors;
                                                                                          }
                                                                                    } else if (step == 'passengers' && errors.invalidPassengers) {
                                                                                          var viewErrorsFinal = [];
                                                                                          var warningArray = [];
                                                                                          $.each(errors.invalidPassengers, function (errorIndex, errorData) {
                                                                                                var secondSurname = typeof (self.h72FormCache.passengers[(errorData.number - 1)].info.surname_2) != 'undefined' ? ' ' + self.h72FormCache.passengers[(errorData.number - 1)].info.surname_2 : '';
                                                                                                var passengerString = self.h72FormCache.passengers[(errorData.number - 1)].info.surname_1 + secondSurname + ', ' + self.h72FormCache.passengers[(errorData.number - 1)].info.name;
                                                                                                /* Remove SATE document number of passenger from session cache */
                                                                                                checkoutSession.passengers[(errorData.number - 1)].info.sate_document_number = null;
                                                                                                $.each(errorData.passengerWarningsType, function (indexWarning, dataWarning) {
                                                                                                      if (errors.codes[indexWarning].code == dataWarning) {
                                                                                                            warningArray.push(errors.codes[indexWarning].description);
                                                                                                      }
                                                                                                });
                                                                                                var lineMessage = warningArray.join(', ');
                                                                                                viewErrorsFinal[errorIndex] = {
                                                                                                      'passenger': passengerString,
                                                                                                      'description': lineMessage
                                                                                                };
                                                                                          });

                                                                                          /* Download the popup template */
                                                                                          Bus.publish('ajax', 'getTemplate', {
                                                                                                data: viewErrorsFinal,
                                                                                                path: eval('AirEuropaConfig.templates.checkout.add_passenger_error'),
                                                                                                success: function (template) {
                                                                                                      /* By default, show the last step behind the popup */
                                                                                                      self.element.find('.process_scroll').steps('showErrors');

                                                                                                      /* Show an error */
                                                                                                      $('#checkout').ui_dialog({
                                                                                                            title: lang('general.error_title'),
                                                                                                            error: true,
                                                                                                            content: template,
                                                                                                            subtitle: message,
                                                                                                            close: {
                                                                                                                  behaviour: 'close',
                                                                                                                  href: '#'
                                                                                                            },
                                                                                                            buttons: [{
                                                                                                                  className: 'cancel',
                                                                                                                  href: '#',
                                                                                                                  label: lang('general.back')
                                                                                                            }, {
                                                                                                                  className: 'continue',
                                                                                                                  href: '#',
                                                                                                                  label: lang('general.continue')
                                                                                                            }],
                                                                                                            render: function ($dialog) {
                                                                                                                  /* Buttons behaviour */
                                                                                                                  $dialog.find('.cancel a').on('click', function (event) {
                                                                                                                        event.preventDefault();
                                                                                                                        $dialog.find('.close_dialog').find('a').click();
                                                                                                                  });
                                                                                                                  $dialog.find('.continue a').on('click', function (event) {
                                                                                                                        event.preventDefault();
                                                                                                                        $dialog.find('.close_dialog').find('a').click();
                                                                                                                        /* Set the status bar as completed */
                                                                                                                        self.element.find('.checkout_status .steps .' + step).addClass('completed');
                                                                                                                        self.element.find('.process_scroll').steps('showLoading');
                                                                                                                        /* Change URL */
                                                                                                                        Bus.publish('hash', 'change', {
                                                                                                                              hash: checkoutProcessURL + '/' + nextStep
                                                                                                                        });
                                                                                                                  });
                                                                                                            }
                                                                                                      });
                                                                                                }
                                                                                          });
                                                                                    } else {
                                                                                          self.showFieldErrors(form.element, step, errors);
                                                                                          self.element.find('.process_scroll').steps('showErrors');
                                                                                    }
                                                                              } else {
                                                                                    // console.log("diálogo de error")
                                                                                    $('#checkout').ui_dialog({
                                                                                          title: lang('general.error_title'),
                                                                                          error: true,
                                                                                          subtitle: message,
                                                                                          close: {
                                                                                                behaviour: 'close',
                                                                                                href: '#'
                                                                                          },
                                                                                          buttons: [{
                                                                                                className: 'close',
                                                                                                href: '#',
                                                                                                label: lang('general.ok')
                                                                                          }]
                                                                                    });

                                                                                    self.element.find('.process_scroll').steps('showErrors');
                                                                              }

                                                                        }
                                                                  }
                                                            }

                                                            form.element.removeClass('standalone');
                                                      },
                                                      failure: function () {
                                                            /* Session error */
                                                            $('#checkout').ui_dialog({
                                                                  title: lang('general.error_title'),
                                                                  error: true,
                                                                  subtitle: lang('general.error_message'),
                                                                  close: {
                                                                        behaviour: 'close',
                                                                        href: '#'
                                                                  },
                                                                  buttons: [{
                                                                        className: 'close',
                                                                        href: '#',
                                                                        label: lang('general.ok')
                                                                  }]
                                                            });

                                                            self.element.find('.process_scroll').steps('showErrors');
                                                      }
                                                });
                                          });

                                    });
                              }
                        }
                  });

            },
            initPassengersSummary: function () {
                  /*Evento que escucha las cabeceras de pasajeros*/
                  this.element.find('.h72_block.passengers .block_header').on('click', function (event) {
                        event.preventDefault();
                        var $this = $(this);

                        /*Comprobamos si ya esta visible la capa*/
                        if ($this.hasClass('expanded')) {
                              $this.closest('.passengers').find('.block_body').slideUp(400);
                              $this.removeClass('expanded');
                        } else {
                              $this.closest('.passengers').find('.block_body').slideDown(400);
                              $this.addClass('expanded');
                        }
                  });
            },

            customInit: function () {
                  var self = this;

                  /* Save jquery object reference */
                  this.element = $(this.selector);

                  var destinyAddressObject = [];
                  this.destinyAddressObject = destinyAddressObject;

                  if (this.element.length > 0) {

                        Bus.publish('process', 'get_h72_data', {
                              callback: function (h72FormCache) {
                                    self.h72FormCache = h72FormCache;
                                    self.createItemization();
                              }
                        });

                        this.initJourneySummary();
                        this.initPassengersSummary();
                        this.initTabsPaymentMethods();

                        /* Control content height */
                        this.setContentHeight();
                        this.controlResize();

                        /* H72 status */
                        this.h72Status();

                        /* Form helpers */
                        this.setTabindex();
                        this.documentType(false);
                        this.preparePassengersForm();
                        this.creditCardCheck();
                        this.paymentMethods();
                        this.cardExpirationActions();

                        /* Init steps widgets */
                        this.initSteps();

                        /* Forms */
                        this.initForm();
                        this.registerForm();
                        this.initFieldCardExpiration();
                        this.initServiceaAssistance();
                        this.setVisualEffects();
                        // this.birthdateActions();

                        this.initServicesList();

                        /* Lightbox actions listener */
                        this.lightboxH72Listener();


                        var step = $('.process_step').data('step')
                        if (step === 'confirm') {
                              /* Listen Twitter Buttons */
                              this.listenTwitterButton()
                              this.listenFollowUsTwitterButtom()
                              this.listenNotificationsTwitterButton()
                              this.showNotificationsTwitterCheckout()
                        }
                  }

                  /* Close proccess recursive in all the navigation */
                  this.element.find('.close_process').find('a').on('click', function () {
                        /* Send void checkin session to clean the server session */
                        self.removeServerSession();

                        /* Back to HOME */
                        // Bus.publish('hash', 'change', { hash: '' });
                        window.location.href = '#';
                  });
            },

            /* Content height */
            setContentHeight: function () {
                  var $process_scroll = this.element.find('.process_scroll');
                  var $process_top_bar = this.element.find('.process_top_bar');
                  var $process_bottom_bar = this.element.find('.process_bottom_bar');
                  var $process_content = this.element.find('.process_content');

                  var availableHeight = $('body').height() - $process_bottom_bar.outerHeight();

                  /* Set the height */
                  $process_scroll.css('height', availableHeight);
                  $process_top_bar.css('width', $process_content.outerWidth());
            },

            controlResize: function () {
                  var self = this;

                  $(window).on('resize.ev_checkout', function () {
                        self.setContentHeight();
                  });

                  /* Adjust height because CSS callbacks don't work in IE8 */
                  setTimeout(function () {
                        self.setContentHeight();
                  }, 350);
            },

            /* Checkin status */
            h72Status: function () {
                  this.element.find('.h72_status ol li a').off('click');
                  this.element.find('.h72_status ol li a').on('click', function (event) {
                        var $this = $(this);
                        var $li = $this.closest('li');

                        if (!($li.hasClass('done') || $li.hasClass('completed'))) {
                              event.preventDefault();
                        }
                  });
            },

            /*
             * h72 lightbox listeners.
             */
            lightboxH72Listener: function () {
                  var self = this;

                  /* Open lightbox */
                  this.element.on('click.h72', '.more-info', function (event) {
                        event.preventDefault();
                        self.element.find('.h72_overlay').show();
                  });

                  /* Close lightbox */
                  this.element.on('click.h72', '.close_overlay', function (event) {
                        event.preventDefault();
                        self.element.find('.h72_overlay').hide();
                  });
            },

            creditCardCheck: function () {
                  var self = this;
                  var $creditCardType = this.element.find('.credit_card_type');
                  var $creditCardNumber = this.element.find('.credit_card_number');

                  $creditCardType.each(function () {
                        var $field = $(this);
                        var $paymentMethod = $field.closest('.payment_method');

                        $field.find('select').on('change', function (event, blockServiceValidation) {
                              if (!blockServiceValidation) {
                                    self.callToCreditCardCheck($paymentMethod);
                              }
                        });
                  });

                  $creditCardNumber.each(function () {
                        var $field = $(this)
                        var $paymentMethod = $field.closest('.payment_method');

                        $field.find('input').on('blur', function () {
                              self.callToCreditCardCheck($paymentMethod);
                        });
                  });
            },

            callToCreditCardCheck: function ($paymentMethod) {
                  var self = this;
                  var cardType = $paymentMethod.find('.credit_card_type select option:selected').attr('value');
                  var cardNumber = $paymentMethod.find('.credit_card_number input').val();
                  var cardObject = {};
                  var currentValue = cardType + '-' + cardNumber;

                  if (this.lastCheckCardValue == currentValue) {

                        if (!this.lastCheckCardValid) {
                              /* Set classes to show the error */
                              $paymentMethod.find('.credit_card_number').addClass('error').removeClass('valid initial_status');
                        }
                  }

                  if (cardType != '' && typeof (cardNumber) != 'undefined' && cardNumber != '' && cardNumber.length > 11 && cardNumber.length < 19 && this.lastCheckCardValue !== currentValue) {
                        /* Disable select to avoid multiple validations */
                        $paymentMethod.find('.credit_card_type select').attr('disabled', 'disabled');

                        /* Build post object */
                        cardObject = {
                              cardType: {
                                    identity: cardType
                              },
                              cardNumber: cardNumber
                        }

                        if (self.isPaymentSave) {
                              /* Set the valid flag to true */
                              self.lastCheckCardValid = true;

                              /* Mark the card number as valid */
                              $paymentMethod.find('.credit_card_number').trigger('set_valid', [true]);
                              $paymentMethod.find('.credit_card_number').removeClass('error').addClass('valid');

                              /* Enable select again */
                              $paymentMethod.find('.credit_card_type select').removeAttr('disabled');

                        } else {
                              /* Call AJAX module to validate the credit card */
                              Bus.publish('services', 'postH72CreditCardCheck', {
                                    data: cardObject,
                                    success: function (data) {
                                          var message = data.header.message;
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
                                                      $paymentMethod.find('.credit_card_number .error_hint').remove();
                                                      $paymentMethod.find('.credit_card_number').trigger('show_error', [message]).trigger('set_valid', [false]);

                                                      /* Set classes to show the error */
                                                      $paymentMethod.find('.credit_card_number').addClass('error').removeClass('valid initial_status');
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
                                                      $paymentMethod.closest('form').find('select').trigger('blur');
                                                      $('#h72').ui_dialog({
                                                            title: errorTitle,
                                                            error: errorType,
                                                            subtitle: message,
                                                            close: {
                                                                  behaviour: 'close',
                                                                  href: '#'
                                                            },
                                                            buttons: [{
                                                                  className: 'close',
                                                                  href: '#',
                                                                  label: lang('general.ok')
                                                            }]
                                                      });

                                                      /* Wrong identity, show the popup error and switch the identity */
                                                      if (code === 4050 || code === 4052 || code === 4054) {
                                                            /* Get the correct identity card for this number */
                                                            identityCard = data.body.data.identity;

                                                            /* Assign its option */
                                                            $correctIdentityCard = $paymentMethod.find('.credit_card_type option[value=' + identityCard + ']');

                                                            /* Clean the select and mark the right identity card */
                                                            if ($correctIdentityCard.length > 0) {

                                                                  /* Avoid triggering the validation again */
                                                                  self.lastCheckCardValue = identityCard + '-' + cardNumber;
                                                                  self.lastCheckCardValid = true;

                                                                  /* Select the correct identity */
                                                                  $paymentMethod.find('.credit_card_type option:selected').prop('selected', false);
                                                                  $correctIdentityCard.prop('selected', true);
                                                                  $correctIdentityCard.closest('select').trigger('change', [true]);

                                                                  /* Mark the card number as valid */
                                                                  $paymentMethod.find('.credit_card_number').trigger('set_valid', [true]);
                                                                  $paymentMethod.find('.credit_card_number').removeClass('error').addClass('valid');
                                                            }
                                                      } else {
                                                            /* Update error hints */
                                                            $paymentMethod.find('.credit_card_number .error_hint').remove();
                                                            $paymentMethod.find('.credit_card_number').trigger('show_error', [message]).trigger('set_valid', [false]);

                                                            /* Set classes to show the error */
                                                            $paymentMethod.find('.credit_card_number').addClass('error').removeClass('valid initial_status');
                                                      }

                                                }
                                          }
                                          /* Success control */
                                          else {
                                                /* Set the valid flag to true */
                                                self.lastCheckCardValid = true;

                                                /* Mark the card number as valid */
                                                $paymentMethod.find('.credit_card_number').trigger('set_valid', [true]);
                                                $paymentMethod.find('.credit_card_number').removeClass('error').addClass('valid');
                                          }

                                          /* Enable select again */
                                          $paymentMethod.find('.credit_card_type select').removeAttr('disabled');
                                    }
                              });
                        }

                  }

                  this.lastCheckCardValue = currentValue;
            },

            initServicesList: function () {
                  var self = this;
                  var step = self.element.find('.process_step');
                  var sessionId = step.attr('data-sessionId');
                  Bus.publish('services', 'getH72PaymentLists', {
                        sessionId: sessionId,
                        success: function (listsData) {
                              // console.log('LISTSDATA', listsData);
                        }
                  });
            },

            /* Init steps */
            initSteps: function () {
                  this.element.find('.process_scroll').steps();
            },

            /* Forms */

            initTabsPaymentMethods: function () {
                  var self = this;

                  /*En base a el numero de methos poner el width al .tab-list .li*/
                  //checkoutData.methods

                  var step = self.element.find('.process_step').attr('data-step');
                  var $milesBlock = self.element.find('.miles_block');

                  if (step == 'payment') {

                        /*Buscar el ultimo y poner el last*/
                        self.element.find('.tab-list li').last().addClass('ultimo');

                        /*Evento que escucha payment_method_tab y lanza el radio del group_header*/
                        this.element.find('.tab-list li').on('click', function (event) {
                              event.preventDefault();
                              var $this = $(this);
                              var $milesPoints = $this.find('a');

                              /*Comprobamos si el clicado ya estaba activo*/
                              if (!$this.hasClass('.active')) {
                                    var idInput = $this.find('a').attr('href');

                                    /*Eliminamos el que este activo*/
                                    $this.closest('ul').find('.active').removeClass('active');
                                    self.element.find('.check_group.payment_method').removeClass('expanded_method');

                                    /*poner activo el seleccionado*/
                                    $this.addClass('active');

                                    /*ponemos a checked el radio buton correspondiente*/
                                    self.element.find('.check_group.payment_method .group_header input' + idInput).prop('checked', true);
                                    self.element.find('.check_group.payment_method .group_header input' + idInput).change();
                              }

                              $milesBlock.hide();

                              if ($milesPoints.hasClass('points') && !self.element.find('.mymiles .slider_field').hasClass('disabled')) {
                                    $milesBlock.show();
                              }

                              /* if payment_miles is active and it's no available, hide ok-button and conditions blocks */
                              var isAvailablePayment = $this.attr('data-method-available');
                              var isSelectedPaymentMiles = (self.element.find('.check_group.payment_method .group_header input#field_payment_miles').prop('checked') == true);
                              var thereAreNoMiles = (self.element.find('.mymiles .slider_field').length == 0);

                              if (!isAvailablePayment || (isSelectedPaymentMiles && thereAreNoMiles)) {
                                    self.element.find('.checkout_block.conditions').hide();
                                    self.element.find('.submit.confirm').hide();
                              } else {
                                    self.element.find('.checkout_block.conditions').show();
                                    self.element.find('.submit.confirm').show();
                              }

                              if (isSelectedPaymentMiles) {
                                    self.element.find('.payment_method.mymiles .field.slider_field .slider_range').trigger('slide');
                              }
                        });

                        this.element.find('.tab-list li').first().trigger("click");
                  }
            },

            initFieldCardExpiration: function () {
                  var cadenameses = '';
                  var cadenaanyos = '';
                  var currentyear = (new Date).getFullYear();
                  var iaux = '';
                  var jaux = '';

                  cadenaanyos = '<option value=""></option>';
                  cadenameses = '<option value=""></option>';

                  // month list
                  for (var j = 0; j < 12; j++) {
                        if (j < 9) {
                              jaux = "0" + (j + 1);
                        } else {
                              jaux = (j + 1);
                        };
                        cadenameses = cadenameses + '<option value="' + jaux + '">' + lang('dates.monthsNames_' + j) + '</option>';
                  };

                  // year list
                  for (var i = currentyear; i < currentyear + 31; i++) {
                        var valyearaux = i % 100;
                        if (valyearaux < 10) {
                              valyearaux = "0" + valyearaux;
                        }
                        cadenaanyos = cadenaanyos + '<option value="' + valyearaux + '">' + i + '</option>';
                  };

                  $(".card_month_input").html(cadenameses);
                  $(".card_year_input").html(cadenaanyos);

                  // update combos if date is set
                  var idsnecesariosc = $(".expirationremember");
                  idsnecesariosc.each(function () {
                        if ($(this).val() != "") {
                              var targetId = $(this).attr("id");
                              var dateParts = $("#" + targetId).val().split("/");

                              $('.' + targetId + '.card_year_input').val(dateParts[1]).trigger('change', [true]);
                              $('.' + targetId + '.card_month_input').val(dateParts[0]).trigger('change', [true]);
                        };
                  });
            },

            initForm2: function () {
                  var self = this;

                  /* Set selected payment method on form hidden input */
                  // $mainForm.find('.payment_method_type').val($checkGroup.attr('data-method'));

                  // if(step == "payment") {

                  //   if($checkGroup.hasClass("credit_card")) {
                  //     var documentField = self.element.find('input#field_credit_card_document_number');
                  //     var documentFieldDiv = documentField.closest(".field");
                  //     var passengers = self.checkoutData.calculatePassengers;
                  //     var message = lang('h72.payment_document_child_error');
                  //     var document = $(documentField).val();
                  //     for(var i = 0; i < passengers.length;i++) {
                  //       if(document.toUpperCase() == passengers[i].identificationDocument.identity.toUpperCase() && (passengers[i].passengerType == "CHILD" || passengers[i].passengerType == "INFANT")) {
                  //         /* Update error hints */
                  //         documentFieldDiv.trigger('show_error', [message]);

                  //         /* Set classes to show the error */
                  //         documentFieldDiv.addClass('error').removeClass('valid initial_status');

                  //         doSubmit = false;

                  //         /*check if is finnish step*/
                  //         errorsForm = self.getErrorsInForm(form.element);

                  //         /* gtm trace errors */
                  //         self.traceManager('error_form', self.checkoutData, null, null, errorsForm, form.element.parent().attr('data-step'));

                  //         self.showFormError(form.element);
                  //       }
                  //     }
                  //   }

                  this.element.find('form').form({
                        onSubmit: function (form) {
                              var nextStep = form.element.closest('.process_step').attr('data-next');
                              var url = getPostURL('h72_payment');

                              /* check if, at least, one passenger has been selected */
                              numPassengersSelected = form.element.find('.group_header').find('input[type=checkbox].passenger_info_check:checked').length;
                              if (numPassengersSelected > 0) {

                                    /* check if WHEELCHAIR - SEAT is selected all checkboxes are checked with OK */
                                    var allChecked = true;
                                    $(".assistance_group_wrapper").each(function () {

                                          if ($(this).is(":visible")) {
                                                var $cases = $(this).find(".assistance_case");

                                                $cases.each(function () {
                                                      if ($(this).prop("checked") == true && $(this).hasClass('case_no')) {
                                                            allChecked = false;
                                                      }
                                                });

                                          }
                                    });

                                    if (allChecked) {
                                          /* Start widget animation */
                                          self.element.find('.process_scroll').steps('showLoading', function () {

                                                var jsonPath = getServiceURL('h72_payment.session');
                                                Bus.publish('ajax', 'getJSON', {
                                                      path: jsonPath,
                                                      success: function (data) {

                                                            if (data) {
                                                                  /* Add form info to h72 cache object */
                                                                  /* Get the data from the user form */
                                                                  // this.h72FormCache = data.h72;
                                                                  self.h72FormCache = self.addFormData(form.element, data.h72);
                                                                  self.element.find('.process_step.passengers').removeClass('incomplete');
                                                                  self.confirmH72(url, nextStep, self.h72FormCache);
                                                            } else { /* If there is not data, kill proccesses and back to home */
                                                                  /* Back to home */
                                                                  Bus.publish('process', 'kill');
                                                            }

                                                      }
                                                });
                                          });

                                    } else {

                                          /* Show an error */
                                          $('#h72').ui_dialog({
                                                title: lang('general.error_title'),
                                                error: true,
                                                subtitle: lang('h72_payment.conditional_error_msg'),
                                                close: {
                                                      behaviour: 'close',
                                                      href: '#'
                                                },
                                                buttons: [{
                                                      className: 'close',
                                                      href: '#',
                                                      label: lang('general.ok')
                                                }]
                                          });

                                    }

                              } else {
                                    /* Show an error */
                                    $('#h72').ui_dialog({
                                          title: lang('general.error_title'),
                                          error: true,
                                          subtitle: lang('h72_payment.must_select_passengers'),
                                          close: {
                                                behaviour: 'close',
                                                href: '#'
                                          },
                                          buttons: [{
                                                className: 'close',
                                                href: '#',
                                                label: lang('general.ok')
                                          }]
                                    });
                              }
                        },
                        onError: function (form) {
                              self.showFormError(form.element);
                        }
                  });
            },

            /* Helper for input fields dimensions */
            preparePassengersForm: function () {
                  var self = this;
                  var $this = $(document);
                  var howMuch = 0;

                  if (self.element.find('.process_step').attr('data-step') == 'passengers') {

                        /* Control number of cards will be generated */
                        $this.find('.group_header').find('input[type=checkbox]').change(function () {
                              var $this = $(this);

                              if ($this.attr('id').indexOf('field_help_flyer') == 0) {
                                    // help_info checkbox

                                    if ($this.is(':checked')) {

                                          $this.closest('.help_info').find('.assistance_type_add').attr('data-required', 'true');
                                          $this.closest('.help_info').find('.assistance_complement_add').attr('data-required', 'true');
                                    } else {
                                          $this.closest('.help_info').find('.assistance_type_add').attr('data-required', 'false');
                                          $this.closest('.help_info').find('.assistance_complement_add').attr('data-required', 'false');
                                    }

                                    $this.closest('.help_info').find('.assistance_type_add').attr('data-init', 'restart');
                                    $this.closest('.help_info').find('.assistance_complement_add').attr('data-init', 'restart');
                                    $this.closest('form').form('restartFields');

                              } else if ($this.attr('id').indexOf('field_help_wheelchair_base') == 0) {

                                    //wheelchair_info checkbox
                                    if ($this.is(':checked')) {
                                          $this.closest('.wheelchair_info').find('.wheelchair_type, .wheelchair_length, .wheelchair_width, .wheelchair_high, .wheelchair_kgs').attr('data-required', 'true');

                                    } else {
                                          $this.closest('.wheelchair_info').find('.wheelchair_type, .wheelchair_length, .wheelchair_width, .wheelchair_high, .wheelchair_kgs').attr('data-required', 'false');
                                    }

                                    $this.closest('.wheelchair_info').find('.wheelchair_type, .wheelchair_length, .wheelchair_width, .wheelchair_high, .wheelchair_kgs').attr('data-init', 'restart');
                                    $this.closest('form').form('restartFields');

                              } else if ($this.attr('id').indexOf('field_help_wheelchair_add') == 0) {

                                    //wheelchair_info_add checkbox
                                    if ($this.is(':checked')) {
                                          $this.closest('.wheelchair_info_add').find('.wheelchair_type_add, .wheelchair_length_add, .wheelchair_width_add, .wheelchair_high_add, .wheelchair_kgs_add').attr('data-required', 'true');

                                    } else {
                                          $this.closest('.wheelchair_info_add').find('.wheelchair_type_add, .wheelchair_length_add, .wheelchair_width_add, .wheelchair_high_add, .wheelchair_kgs_add').attr('data-required', 'false');
                                    }

                                    $this.closest('.wheelchair_info_add').find('.wheelchair_type_add, .wheelchair_length_add, .wheelchair_width_add, .wheelchair_high_add, .wheelchair_kgs_add').attr('data-init', 'restart');
                                    $this.closest('form').form('restartFields');

                              } else {
                                    // passenger_info checkbox
                                    if ($this.is(':checked')) {
                                          $this.closest('.passengers_info').addClass('opened');
                                          $this.closest('.passengers_info').addClass('expanded_method');
                                    } else {
                                          $this.closest('.passengers_info').removeClass('opened');
                                          $this.closest('.passengers_info').removeClass('expanded_method');
                                    }
                              }
                        });
                  }

            },

            addFormData: function ($form, h72Cache) {
                  var postObject = {};
                  var passengersListComplete = [];
                  var passengers = h72Cache.passengers;
                  var totalPassengers = passengers.length;

                  /* Get the data from the user form */
                  userData = $form.serializeObject();

                  _.each(passengers, function (passenger, index) {
                        if (userData.passengers[passenger.passengerNumber].field_passenger_active == 'on') {
                              var passenger_assistance = {};
                              var personContactInformation = {
                                    email: userData.passengers[passenger.passengerNumber].email,
                                    telephone: userData.passengers[passenger.passengerNumber].telephone,
                              }
                              passenger_assistance.passengerNumber = passenger.passengerNumber;
                              passenger_assistance.personContactInformation = personContactInformation;
                              passenger_assistance.personCompleteName = passenger.personCompleteName;
                              passenger_assistance.extraInfo = userData.passengers[passenger.passengerNumber].other_reasons;

                              var assistances = [];
                              var assistance = {};
                              assistance.assistance = userData.passengers[passenger.passengerNumber].assistance_type;
                              assistance.complement = (assistance.assistance == "UNDERSTANDING") ? "UNDERSTANDING" : userData.passengers[passenger.passengerNumber].complement;
                              assistance.add = false;
                              assistance.complement_text = $form.find('.assistance_label[data-passenger=' + passenger_assistance.passengerNumber + '] .assistance').text();
                              assistances.push(assistance);

                              if (userData.passengers[passenger.passengerNumber].wheelchair_length !== "") {
                                    var assistancewheelchair = {};
                                    assistancewheelchair.assistance = "OWN_WHEELCHAIR";
                                    assistancewheelchair.complement = userData.passengers[passenger.passengerNumber].wheelchair_type;
                                    assistancewheelchair.add = true;
                                    assistancewheelchair.complement_text = $form.find('.assistance_label[data-passenger=' + passenger_assistance.passengerNumber + '] .wheelchair-assistance').text().substr(2);
                                    assistances.push(assistancewheelchair);

                                    var assistancewheelchairsize = {};
                                    assistancewheelchairsize.length = userData.passengers[passenger.passengerNumber].wheelchair_length;
                                    assistancewheelchairsize.width = userData.passengers[passenger.passengerNumber].wheelchair_width;
                                    assistancewheelchairsize.high = userData.passengers[passenger.passengerNumber].wheelchair_high;
                                    assistancewheelchairsize.kgs = userData.passengers[passenger.passengerNumber].wheelchair_kgs;
                                    passenger_assistance.wheelChair = assistancewheelchairsize;
                              }
                              if (userData.passengers[passenger.passengerNumber].petc_weight !== "") {
                                    var assistancepetc = {};
                                    assistancepetc.code = userData.passengers[passenger.passengerNumber].petc_type;
                                    assistancepetc.kgs = userData.passengers[passenger.passengerNumber].petc_weight;
                                    passenger_assistance.petc = assistancepetc;
                              }
                              if ((userData.passengers[passenger.passengerNumber].deaf_blind_name !== "") && totalPassengers == 1) {
                                    var accompanist = {};
                                    accompanist.fullName = userData.passengers[passenger.passengerNumber].deaf_blind_name;
                                    accompanist.dni = userData.passengers[passenger.passengerNumber].deaf_blind_document_number;
                                    accompanist.telephone = userData.passengers[passenger.passengerNumber].deaf_blind_telephone;
                                    passenger_assistance.accompanist = accompanist;
                              }
                              if ((userData.passengers[passenger.passengerNumber].understanding_name !== "") && totalPassengers == 1) {
                                    var accompanist = {};
                                    accompanist.fullName = userData.passengers[passenger.passengerNumber].understanding_name;
                                    accompanist.dni = userData.passengers[passenger.passengerNumber].understanding_document_number;
                                    accompanist.telephone = userData.passengers[passenger.passengerNumber].understanding_telephone;
                                    passenger_assistance.accompanist = accompanist;
                              }

                              // Ayuda adicional
                              if (userData.passengers[passenger.passengerNumber].assistance_type_add !== "") {
                                    var assistanceAdd = {};
                                    assistanceAdd.assistance = userData.passengers[passenger.passengerNumber].assistance_type_add;
                                    assistanceAdd.complement = (assistanceAdd.assistance == "UNDERSTANDING") ? "UNDERSTANDING" : userData.passengers[passenger.passengerNumber].complement_add;
                                    assistanceAdd.add = true;
                                    assistanceAdd.complement_text = $form.find('.assistance_label[data-passenger=' + passenger_assistance.passengerNumber + '] .add-assistance').text().substr(2);
                                    assistances.push(assistanceAdd);

                                    if (userData.passengers[passenger.passengerNumber].wheelchair_type_add !== "") {
                                          var assistancewheelchair = {};
                                          assistancewheelchair.assistance = "OWN_WHEELCHAIR";
                                          assistancewheelchair.complement = userData.passengers[passenger.passengerNumber].wheelchair_type_add;
                                          assistancewheelchair.add = true;
                                          assistancewheelchair.complement_text = $form.find('.assistance_label[data-passenger=' + passenger_assistance.passengerNumber + '] .wheelchair-assistance').text().substr(2);
                                          assistances.push(assistancewheelchair);

                                          var assistancewheelchairsize = {};
                                          assistancewheelchairsize.length = userData.passengers[passenger.passengerNumber].wheelchair_length_add;
                                          assistancewheelchairsize.width = userData.passengers[passenger.passengerNumber].wheelchair_width_add;
                                          assistancewheelchairsize.high = userData.passengers[passenger.passengerNumber].wheelchair_high_add;
                                          assistancewheelchairsize.kgs = userData.passengers[passenger.passengerNumber].wheelchair_kgs_add;
                                          passenger_assistance.wheelChair = assistancewheelchairsize;
                                    }
                                    if (userData.passengers[passenger.passengerNumber].petc_weight_add !== "") {
                                          var assistancepetc = {};
                                          assistancepetc.code = userData.passengers[passenger.passengerNumber].petc_type_add;
                                          assistancepetc.kgs = userData.passengers[passenger.passengerNumber].petc_weight_add;
                                          passenger_assistance.petc = assistancepetc;
                                    }
                                    if ((userData.passengers[passenger.passengerNumber].deaf_blind_name_add !== "") && totalPassengers == 1) {
                                          var accompanist = {};
                                          accompanist.fullName = userData.passengers[passenger.passengerNumber].deaf_blind_name_add;
                                          accompanist.dni = userData.passengers[passenger.passengerNumber].deaf_blind_document_number_add;
                                          accompanist.telephone = userData.passengers[passenger.passengerNumber].deaf_blind_telephone_add;
                                          passenger_assistance.accompanist = accompanist;
                                    }
                                    if ((userData.passengers[passenger.passengerNumber].understanding_name_add !== "") && totalPassengers == 1) {
                                          var accompanist = {};
                                          accompanist.fullName = userData.passengers[passenger.passengerNumber].understanding_name_add;
                                          accompanist.dni = userData.passengers[passenger.passengerNumber].understanding_document_number_add;
                                          accompanist.telephone = userData.passengers[passenger.passengerNumber].understanding_telephone_add;
                                          passenger_assistance.accompanist = accompanist;
                                    }

                              }

                              passenger_assistance.assistances = assistances;

                              passengersListComplete.push(passenger_assistance);
                        }
                  });

                  postObject.passengers = passengersListComplete;
                  postObject.bookingId = h72Cache.bookingId;
                  postObject.internalService = h72Cache.internalService;

                  return postObject;
            },

            /* Function to confirm checkin */
            confirmH72: function (url, nextStep, h72FormCache) {
                  var self = this;

                  var internalService = h72FormCache.internalService;

                  if (internalService) {
                        /* Confirm checkin */
                        Bus.publish('services', 'confirmH72Booking', {
                              h72FormCache: h72FormCache,
                              bookingId: h72FormCache.bookingId,
                              success: function (data) {
                                    /* If response comes without data.header */
                                    if (!data.header) {
                                          data = {
                                                'header': {
                                                      'error': false
                                                },
                                                'body': {
                                                      'data': data
                                                }
                                          };
                                    }
                                    if (!data.header.error) {
                                          //Todo correcto
                                          //self.h72FormCache.confirm = data.body.data;
                                          self.continueStep(url, nextStep, true);
                                    } else {
                                          /* Check if error code is 1114, INVALID ESTA */
                                          self.element.find('.process_scroll').steps('showErrors');

                                          /* Show an error */
                                          $('#h72').ui_dialog({
                                                title: lang('general.error_title'),
                                                error: true,
                                                subtitle: data.header.message,
                                                close: {
                                                      behaviour: 'close',
                                                      href: '#'
                                                },
                                                buttons: [{
                                                      className: 'close',
                                                      href: '#',
                                                      label: lang('general.ok')
                                                }],
                                                render: function ($dialog) {
                                                      if (data.header.code == 1005) {
                                                            /* Buttons behaviour */
                                                            $dialog.find('.close a').on('click', function (event) {
                                                                  event.preventDefault();
                                                                  /* Remove server session */
                                                                  self.removeServerSession();
                                                                  /* Back to home */
                                                                  Bus.publish('process', 'kill');
                                                            });
                                                      }
                                                }
                                          });
                                    }
                              }
                        });

                  } else {
                        /* Confirm checkin */
                        Bus.publish('services', 'confirmH72', {
                              h72FormCache: h72FormCache,
                              bookingId: h72FormCache.bookingId,
                              success: function (data) {
                                    /* If response comes without data.header */
                                    if (!data.header) {
                                          data = {
                                                'header': {
                                                      'error': false
                                                },
                                                'body': {
                                                      'data': data
                                                }
                                          };
                                    }
                                    if (!data.header.error) {
                                          //Todo correcto
                                          //self.h72FormCache.confirm = data.body.data;
                                          self.continueStep(url, nextStep, true);
                                    } else {
                                          /* Check if error code is 1114, INVALID ESTA */
                                          self.element.find('.process_scroll').steps('showErrors');

                                          /* Show an error */
                                          $('#h72').ui_dialog({
                                                title: lang('general.error_title'),
                                                error: true,
                                                subtitle: data.header.message,
                                                close: {
                                                      behaviour: 'close',
                                                      href: '#'
                                                },
                                                buttons: [{
                                                      className: 'close',
                                                      href: '#',
                                                      label: lang('general.ok')
                                                }],
                                                render: function ($dialog) {
                                                      if (data.header.code == 1005) {
                                                            /* Buttons behaviour */
                                                            $dialog.find('.close a').on('click', function (event) {
                                                                  event.preventDefault();
                                                                  /* Remove server session */
                                                                  self.removeServerSession();
                                                                  /* Back to home */
                                                                  Bus.publish('process', 'kill');
                                                            });
                                                      }
                                                }
                                          });
                                    }
                              }
                        });
                  }
            },

            /* Remove server session object */
            removeServerSession: function () {
                  var postSessionURL = getPostURL('h72_payment');
                  var h72FormSession = {};

                  /* Post void checkoutSession object */
                  Bus.publish('ajax', 'postJson', {
                        path: postSessionURL,
                        data: {
                              h72: h72FormSession
                        },
                        success: function () { }
                  });
            },

            /* Function to continue with next step */
            continueStep: function (url, nextStep, finalStep) {
                  finalStep = typeof finalStep !== 'undefined' ? finalStep : false;

                  var self = this;

                  /* First show loading bar */
                  self.element.find('.process_scroll').steps('showLoading', function () {

                        var mode = self.element.find('.process_steps').attr('data-mode');

                        Bus.publish('ajax', 'postJson', {
                              path: url,
                              data: {
                                    h72: self.h72FormCache
                              },
                              success: function () {
                                    var step = self.element.find('.process_step').attr('data-step');

                                    /* Set the status bar as completed */
                                    self.element.find('.h72 .steps .' + step).addClass('completed');

                                    /* Change URL */
                                    var h72ProcessURL = getProcessUrl('h72_payment');

                                    Bus.publish('hash', 'change', {
                                          hash: h72ProcessURL + '/' + nextStep
                                    });

                              },
                              failure: function () {
                                    /* Show an error */
                                    $('#h72').ui_dialog({
                                          title: lang('general.error_title'),
                                          error: true,
                                          subtitle: lang('general.error_message'),
                                          close: {
                                                behaviour: 'close',
                                                href: '#'
                                          },
                                          buttons: [{
                                                className: 'close',
                                                href: '#',
                                                label: lang('general.ok')
                                          }]
                                    });
                                    self.element.find('.process_scroll').steps('showErrors');
                              }
                        });

                  });
            },

            initServiceaAssistance: function () {
                  var self = this;
                  var listAssistanceType = this.element.find('.field_assistance_type');
                  var listAssistanceAddType = this.element.find('.field_assistance_type_add');
                  var checkboxHelp = this.element.find('.field_help_flyer');
                  var checkboxWheelchair = this.element.find('.field_help_wheelchair');
                  var checkboxAssistance = this.element.find('.assistance_case');

                  $.each(listAssistanceType, function (index, assintiveSelect) {

                        var $assintiveSelect = $(assintiveSelect);
                        var passengerNumber = $assintiveSelect.closest('.passengers_info').data('passenger');
                        var $complementSelect = self.element.find('#field_assistance_complement_' + passengerNumber);
                        var $wheelchairSelect = self.element.find('#field_wheelchair_type_' + passengerNumber);
                        var $layerComplementInput = $complementSelect.closest('.assistance_complement');

                        var $layerComplementSelect = $complementSelect.closest('.select_field');
                        var $complementInput = $layerComplementInput.find('input');

                        $layerComplementSelect.removeClass('error valid filled');

                        // assign events to assintive select
                        $assintiveSelect.on('change', function () {
                              var $this = $(this);
                              var codAssintance = $this.val();

                              var $errorText = $('.error_text');
                              var $errorHead = $('.error_head');
                              var $formCond = $this.closest('.passengers_info').find('.form-cond');

                              var $infoAssistance = $this.closest('.group_body').find('.info_assistance');
                              var $infoAssistanceDescription = $infoAssistance.find('.description');

                              var $wheelchairInfo = $this.closest('.group_body').find('.check_group.wheelchair_info');
                              var $assistanceGroupWrapper = $this.closest('.group_body').find('.assistance_base');

                              var $deafBlindInfo = $this.closest('.group_body').find('.check_group.deaf_blind_info');
                              var $understandingInfo = $this.closest('.group_body').find('.check_group.understanding_info');
                              var $petcInfo = $this.closest('.group_body').find('.check_group.petc_info');
                              // var $pocsInfo = $this.closest('.group_body').find('.check_group.pocs_info');

                              var $assistanceComplement = $this.closest('.group_body').find('.assistance_complement');

                              var textValue = $this.find('option:selected').text();

                              $this.closest('.passengers_info').find('.assistance').text('');
                              $this.closest('.passengers_info').find('.assistance_label').hide();

                              if (codAssintance != '') {

                                    // Remove selected item from "Ayuda Adicional"
                                    var $assistanceAdd = $this.closest('.check_group_wrapper').find('.field_assistance_type_add');
                                    $assistanceAdd.find('option').each(function () {
                                          $(this).removeAttr('selected').show();
                                    });
                                    var currentAssistance = $assistanceAdd.find('[value="' + codAssintance + '"]').hide();
                                    $assistanceAdd.find('option:first').attr('selected', 'selected').trigger('change');
                                    $assistanceAdd.prev('.selected_value').empty();

                                    // Disable SEAT Checkbox required condition
                                    self.updateFormElement($assistanceGroupWrapper, '.radio', 'false');

                                    // Handle custom error message for this 3 cases
                                    if (codAssintance == "DEAF_BLIND" || codAssintance == "UNDERSTANDING") {
                                          $errorText.show().addClass('error_text_first');
                                          $errorHead.addClass('error_cond');
                                          $formCond.addClass('has-cond');
                                    } else {
                                          $errorText.hide().removeClass('error_text_first');
                                          $errorHead.removeClass('error_cond');
                                          $formCond.removeClass('has-cond');
                                    }

                                    // Toggle Deaf Blind    
                                    if (codAssintance == "DEAF_BLIND") {
                                          $deafBlindInfo.show();
                                          self.updateFormElement($deafBlindInfo, '.deaf_blind_name, .deaf_blind_document_number, .deaf_blind_telephone', 'true');
                                    } else {
                                          $deafBlindInfo.hide();
                                          self.updateFormElement($deafBlindInfo, '.deaf_blind_name, .deaf_blind_document_number, .deaf_blind_telephone', 'false');
                                    }

                                    // Toggle WheelChair        
                                    if (codAssintance == "WHEELCHAIR") {
                                          $wheelchairInfo.show();
                                          $assistanceGroupWrapper.hide();
                                    } else {
                                          $wheelchairInfo.hide();

                                          // reset wheelchair inputs in case you switch to another assistance
                                          var $wheelchairButton = $wheelchairInfo.find('.field_help_wheelchair');
                                          var $wheelchairBody = $wheelchairInfo.find('.group_body');
                                          if ($wheelchairBody.css("display") == 'block') {
                                                $wheelchairButton.click();
                                          }

                                    }

                                    // Toggle Understanding
                                    if (codAssintance == "UNDERSTANDING") {
                                          $understandingInfo.show();
                                          $complementSelect.val('').change();
                                          self.updateFormElement('', $assistanceComplement, 'false', true);
                                          self.updateFormElement($understandingInfo, '.understanding_name, .understanding_document_number, .understanding_telephone', 'true');
                                    } else {
                                          $understandingInfo.hide();
                                          self.updateFormElement('', $assistanceComplement, 'true', true);
                                          self.updateFormElement($understandingInfo, '.understanding_name, .understanding_document_number, .understanding_telephone', 'false');
                                    }

                                    // Toggle PETC
                                    if (codAssintance == "PETC") {
                                          $petcInfo.show();
                                          self.updateFormElement($petcInfo, '.petc_type, .petc_weight', 'true');
                                    } else {
                                          $petcInfo.hide();
                                          self.updateFormElement($petcInfo, '.petc_type, .petc_weight', 'false');
                                    }

                                    // Toggle POCS
                                    // (codAssintance == "POCS") ? $pocsInfo.show() : $pocsInfo.hide();

                                    $layerComplementSelect.removeClass('non_editable');

                                    // refresh info_assistance
                                    $infoAssistance.show();
                                    $infoAssistanceDescription.html(self.searchAssitanceDescription(codAssintance));

                                    Bus.publish('services', 'getAssistanceComplement', {
                                          assistance: codAssintance,
                                          success: function (data) {
                                                var optionsHtml = '';
                                                // if (!data || !data.header || !data.header.error || !data.body || !data.body.data) {
                                                if (!data.header.error) {
                                                      optionsHtml = '<option value=""></option>';
                                                      $.each(data.body.data, function (indexReg, dataReg) {
                                                            optionsHtml += '<option value="' + dataReg.code + '">' + dataReg.description + '</option>';
                                                      });
                                                      $complementSelect.html(optionsHtml);
                                                      $complementSelect.closest('label').text(lang('my_card.field_state'));
                                                      $layerComplementSelect.removeClass('hidden').removeClass('disabled');
                                                      $layerComplementSelect.removeClass('error valid filled');
                                                      $layerComplementSelect.attr('data-init', 'restart');
                                                      /* Hide input */
                                                      //$layerComplementInput.addClass('hidden').addClass('disabled');

                                                      /* Change tabindex */
                                                      var tabindex = $layerComplementInput.find('input').attr('tabindex');
                                                      $layerComplementSelect.find('select').attr('tabindex', tabindex);
                                                      $layerComplementInput.find('input').attr('tabindex', '');

                                                      // assign events to assintive select
                                                      $complementSelect.on('change', function () {
                                                            var $this = $(this);
                                                            var codAssintanceComplement = $this.val();

                                                            if (codAssintanceComplement == "SEAT") {
                                                                  $assistanceGroupWrapper.show();
                                                                  self.updateFormElement($assistanceGroupWrapper, '.radio', 'true');
                                                            } else {
                                                                  $assistanceGroupWrapper.hide();
                                                                  self.updateFormElement($assistanceGroupWrapper, '.radio', 'false');
                                                            }

                                                      });

                                                } else {
                                                      $layerComplementInput.removeClass('hidden').removeClass('disabled');
                                                      /* Hide select */
                                                      $layerComplementSelect.addClass('hidden').addClass('disabled');
                                                }
                                                /* Reassign forms to validate the added fields */
                                                $this.closest('form').form('restartFields');
                                          }
                                    });
                              } else {

                                    $infoAssistance.hide();
                                    $wheelchairInfo.hide();
                                    $assistanceGroupWrapper.hide();
                                    self.updateFormElement($assistanceGroupWrapper, '.radio', 'false');
                                    $deafBlindInfo.hide();
                                    $understandingInfo.hide();
                                    $petcInfo.hide();
                                    // $pocsInfo.hide();

                                    $layerComplementSelect.addClass('non_editable');
                                    $complementSelect.val('').change();
                              }
                        });

                        // assign events to complement select
                        $complementSelect.on('change', function () {
                              var $this = $(this);

                              var textValue1 = $assintiveSelect.find('option:selected').text();
                              var textValue2 = $this.find('option:selected').text();

                              if (textValue1 != '' && textValue2 != '') {
                                    $this.closest('.passengers_info').find('.assistance').text(textValue1 + ' - ' + textValue2);
                                    $this.closest('.passengers_info').find('.assistance_label').show();
                              } else if (textValue1 != '' && textValue2 == '') {
                                    $this.closest('.passengers_info').find('.assistance').text(textValue1);
                                    $this.closest('.passengers_info').find('.assistance_label').show();
                              } else {
                                    $this.closest('.passengers_info').find('.assistance').text('');
                                    $this.closest('.passengers_info').find('.assistance_label').hide();
                              }
                        });

                        $wheelchairSelect.on('change', function () {
                              var $this = $(this);

                              var textValue2 = $this.find('option:selected').text();

                              if (textValue2 != '') {
                                    $this.closest('.passengers_info').find('.wheelchair-assistance').text(', ' + textValue2);
                              } else {
                                    $this.closest('.passengers_info').find('.wheelchair-assistance').text('');
                              }
                        });

                  });

                  $.each(listAssistanceAddType, function (index, assintiveSelect) {

                        var $assintiveSelect = $(assintiveSelect);
                        var passengerNumber = $assintiveSelect.closest('.passengers_info').data('passenger');
                        var $fieldAssistanceType = self.element.find('#field_assistance_type_' + passengerNumber);
                        var $complementSelect = self.element.find('#field_assistance_complement_add_' + passengerNumber);
                        var $wheelchairSelect = self.element.find('#field_wheelchair_type_add' + passengerNumber);
                        var $layerComplementInput = $complementSelect.closest('.assistance_complement_add');

                        var $layerComplementSelect = $complementSelect.closest('.select_field');
                        var $complementInput = $layerComplementInput.find('input');

                        $layerComplementSelect.removeClass('error valid filled');

                        $assintiveSelect.on('change', function () {
                              var $this = $(this);
                              var codAssintance = $this.val();

                              var $errorText = $('.error_text');
                              var $errorHead = $('.error_head');
                              var $formCond = $this.closest('.passengers_info').find('.form-cond');

                              var $infoAssistance = $this.closest('.group_body').find('.info_assistance_add');
                              var $infoAssistanceDescription = $infoAssistance.find('.description');

                              var $wheelchairInfo = $this.closest('.group_body').find('.check_group.wheelchair_info_add');
                              var $assistanceGroupWrapper = $this.closest('.group_body').find('.assistance_add');

                              var $deafBlindInfo = $this.closest('.group_body').find('.check_group.deaf_blind_info_add');
                              var $understandingInfo = $this.closest('.group_body').find('.check_group.understanding_info_add');
                              var $petcInfo = $this.closest('.group_body').find('.check_group.petc_info_add');

                              var $assistanceComplement = $this.closest('.group_body').find('.assistance_complement');

                              var textValue = $this.find('option:selected').text();

                              $this.closest('.passengers_info').find('.add-assistance').text('');

                              if (codAssintance != '') {
                                    $layerComplementSelect.removeClass('non_editable');

                                    // Disable SEAT Checkbox required condition
                                    self.updateFormElement($assistanceGroupWrapper, '.radio', 'false');

                                    // Handle custom error message for this 3 cases
                                    if (!$errorText.hasClass("error_text_first")) {
                                          if (codAssintance == "DEAF_BLIND" || codAssintance == "UNDERSTANDING") {
                                                $errorText.show();
                                                $errorHead.addClass('error_cond');
                                                $formCond.addClass('has-cond');
                                          } else {
                                                $errorText.hide();
                                                $errorHead.removeClass('error_cond');
                                                $formCond.removeClass('has-cond');
                                          }
                                    }

                                    // Toggle Deaf Blind               
                                    if (codAssintance == "DEAF_BLIND") {
                                          if ($fieldAssistanceType.val() != "UNDERSTANDING") {
                                                $deafBlindInfo.show();
                                                self.updateFormElement($deafBlindInfo, '.deaf_blind_name_add, .deaf_blind_document_number_add, .deaf_blind_telephone_add', 'true');
                                          }
                                    } else {
                                          $deafBlindInfo.hide();
                                          self.updateFormElement($deafBlindInfo, '.deaf_blind_name_add, .deaf_blind_document_number_add, .deaf_blind_telephone_add', 'false');
                                    }

                                    // Toggle WheelChair        
                                    if (codAssintance == "WHEELCHAIR") {
                                          $wheelchairInfo.show();
                                          $assistanceGroupWrapper.hide();
                                    } else {
                                          $wheelchairInfo.hide();

                                          // reset wheelchair inputs in case you switch to another assistance
                                          var $wheelchairButton = $wheelchairInfo.find('.field_help_wheelchair');
                                          var $wheelchairBody = $wheelchairInfo.find('.group_body');
                                          if ($wheelchairBody.css("display") == 'block') {
                                                $wheelchairButton.click();
                                          }
                                    }

                                    // Toggle Understanding            
                                    if (codAssintance == "UNDERSTANDING") {
                                          if ($fieldAssistanceType.val() != "DEAF_BLIND") {
                                                $understandingInfo.show();
                                                self.updateFormElement($understandingInfo, '.understanding_name_add, .understanding_document_number_add, .understanding_telephone_add', 'true');
                                          }
                                          $complementSelect.val('').change();
                                          self.updateFormElement('', $assistanceComplement, 'false', true);
                                    } else {
                                          $understandingInfo.hide();
                                          self.updateFormElement('', $assistanceComplement, 'true', true);
                                          self.updateFormElement($understandingInfo, '.understanding_name_add, .understanding_document_number_add, .understanding_telephone_add', 'false');
                                    }

                                    // Toggle PETC            
                                    if (codAssintance == "PETC") {
                                          $petcInfo.show();
                                          self.updateFormElement($petcInfo, '.petc_type_add, .petc_weight_add', 'true');
                                    } else {
                                          $petcInfo.hide();
                                          self.updateFormElement($petcInfo, '.petc_type_add, .petc_weight_add', 'false');
                                    }

                                    $layerComplementSelect.removeClass('non_editable');

                                    // refresh info_assistance
                                    $infoAssistance.show();
                                    $infoAssistanceDescription.html(self.searchAssitanceDescription(codAssintance));

                                    Bus.publish('services', 'getAssistanceComplement', {
                                          assistance: $this.val(),
                                          success: function (data) {
                                                var optionsHtml = '';
                                                // if (!data || !data.header || !data.header.error || !data.body || !data.body.data) {
                                                if (!data.header.error) {
                                                      optionsHtml = '<option value=""></option>';

                                                      $.each(data.body.data, function (indexReg, dataReg) {
                                                            optionsHtml += '<option value="' + dataReg.code + '">' + dataReg.description + '</option>';
                                                      });
                                                      $complementSelect.html(optionsHtml);
                                                      $complementSelect.closest('label').text(lang('my_card.field_state'));
                                                      $layerComplementSelect.removeClass('hidden').removeClass('disabled');
                                                      $layerComplementSelect.removeClass('error valid filled');
                                                      $layerComplementSelect.attr('data-init', 'restart');
                                                      /* Hide input */
                                                      //$layerComplementInput.addClass('hidden').addClass('disabled');

                                                      /* Change tabindex */
                                                      var tabindex = $layerComplementInput.find('input').attr('tabindex');
                                                      $layerComplementSelect.find('select').attr('tabindex', tabindex);
                                                      $layerComplementInput.find('input').attr('tabindex', '');

                                                      // assign events to assintive select
                                                      $complementSelect.on('change', function () {
                                                            var $this = $(this);
                                                            var codAssintanceComplement = $this.val();

                                                            if (codAssintanceComplement == "SEAT") {
                                                                  $assistanceGroupWrapper.show();
                                                                  self.updateFormElement($assistanceGroupWrapper, '.radio', 'true');
                                                            } else {
                                                                  $assistanceGroupWrapper.hide();
                                                                  self.updateFormElement($assistanceGroupWrapper, '.radio', 'false');
                                                            }
                                                      });

                                                } else {
                                                      $layerComplementInput.removeClass('hidden').removeClass('disabled');
                                                      /* Hide select */
                                                      $layerComplementSelect.addClass('hidden').addClass('disabled');
                                                }
                                                /* Reassign forms to validate the added fields */
                                                $this.closest('form').form('restartFields');
                                          }
                                    });
                              } else {

                                    $infoAssistance.hide();
                                    $wheelchairInfo.hide();
                                    $assistanceGroupWrapper.hide();
                                    self.updateFormElement($assistanceGroupWrapper, '.radio', 'false');
                                    $deafBlindInfo.hide();
                                    $understandingInfo.hide();
                                    $petcInfo.hide();

                                    $layerComplementSelect.addClass('non_editable');
                                    $complementSelect.val('').change();
                              }
                        });

                        // assign events to complement select
                        $complementSelect.on('change', function () {
                              var $this = $(this);

                              var textValue1 = $assintiveSelect.find('option:selected').text();
                              var textValue2 = $this.find('option:selected').text();

                              if (textValue2 != '') {
                                    $this.closest('.passengers_info').find('.add-assistance').text(', ' + textValue1 + ' - ' + textValue2);
                              } else {
                                    $this.closest('.passengers_info').find('.add-assistance').text('');
                              }
                        });

                  });

                  $.each(checkboxHelp, function (index, checkbox) {
                        $(checkbox).on('change', function () {
                              var $this = $(this);

                              if (!$this.prop('checked')) {
                                    $this.closest('.passengers_info').find('.add-assistance').hide();
                              } else {
                                    $this.closest('.passengers_info').find('.add-assistance').show();
                              }
                        });
                  });

                  $.each(checkboxWheelchair, function (index, checkbox) {
                        $(checkbox).on('change', function () {
                              var $this = $(this);

                              if (!$this.prop('checked')) {
                                    $this.closest('.passengers_info').find('.wheelchair-assistance').hide();
                              } else {
                                    $this.closest('.passengers_info').find('.wheelchair-assistance').show();
                              }
                        });
                  });

                  $.each(checkboxAssistance, function (index, checkbox) {
                        $(checkbox).on('change', function () {
                              var $this = $(this);

                              if ($this.hasClass('case_yes')) {
                                    var check = $this.closest('.assistance_options').find('.case_no');
                                    check.attr('disabled', 'disabled');
                                    check.closest('.radio').addClass('disabled');
                              } else {
                                    var check = $this.closest('.assistance_options').find('.case_yes');
                                    check.attr('disabled', 'disabled');
                                    check.closest('.radio').addClass('disabled');
                              }
                        });
                  });

            },

            searchAssitanceDescription: function (codAsistance) {
                  var listAsistance = this.h72FormCache.services.list_assistance;
                  var descriptionAsistance;
                  $.each(listAsistance, function (index, assistance) {
                        if (assistance.code === codAsistance) {
                              descriptionAsistance = assistance.explanation;
                        }
                  });
                  return descriptionAsistance;
            },

            /* Helper for tabindex setup */
            setTabindex: function () {

                  /* Clean previous tab index */
                  $('body').find('input[tabindex], select[tabindex]').attr('tabindex', '');

                  var tabindex = 1;

                  this.element.find('input, select').each(function () {
                        if (this.type != "hidden") {
                              var $input = $(this);
                              if ($input.hasClass("ocult")) {
                                    $input.attr('tabindex', -1);
                              } else {
                                    $input.attr('tabindex', tabindex);
                                    tabindex++;
                              }
                        }
                  });
            },

            showFormError: function ($form) {
                  var $content = this.element.find('.process_scroll');
                  var $field = $form.find('.field.error').not('.disabled');
                  var $hasCond = false;
                  var errorCondition = ($field.closest('.understanding_info').length != 0 || $field.closest('.deaf_blind_info').length != 0) ? true : false

                  /* Show the messages */
                  $form.addClass('error');
                  if ($form.find('.block_body .form_error').length == 0) {
                        //check fields error are deaf_blind_info or understanding_info
                        if (!errorCondition) {
                              $form.find('.block_body').prepend('<div class="form_error"><div class="error_message error_head"><p>' + lang('general.formError') + '</p></div></div>');
                        } else {
                              $form.find('.block_body').prepend('<div class="form_error"><div class="error_message error_head"><p class="error_h72">' + lang('general.formError') + '</p><p class="error_h72">' + lang('h72_payment.conditional_error_msg') + '</p></div></div>');
                        }
                  } else {
                        if (!errorCondition) {
                              $form.find('.block_body .form_error').html('<div class="error_message error_head"><p>' + lang('general.formError') + '</p></div></div>');
                        } else {
                              $form.find('.block_body .form_error').html('<div class="error_message error_head"><p class="error_h72">' + lang('general.formError') + '</p><p class="error_h72">' + lang('h72_payment.conditional_error_msg') + '</p></div></div>');
                        }

                  }

                  $form.find('.initial_status').not('.disabled').removeClass('initial_status');

                  /* Scroll to the top of the form to show the error */
                  Bus.publish('scroll', 'scrollTo', {
                        element: $content.get(),
                        position: $field.position().top
                  });
            },

            /* Show field errors from passengers form */
            showFieldErrors: function ($form, errors) {
                  var self = this;
                  var techMessage = '';

                  $.each(errors, function (indexError, error) {
                        /* Get type and index */
                        var type = error.field.substr(0, error.field.indexOf('['));
                        var index = error.field.substr(error.field.indexOf('[') + 1, 1);
                        var field = error.field.substr(error.field.indexOf(']') + 2);

                        /* Convert type and index */
                        var passengerNumber;

                        if (index) {
                              passengerNumber = parseInt(index);
                        }

                        /* Generic technical warning */
                        if (typeof type == 'undefined') {
                              techMessage += ' / ' + error.field + ' > ' + error.message;
                        } else if (type == 'passengers' || type == 'frequentflyer') {
                              /* Get fieldset and field */
                              var $passengerFieldset = self.element.find('fieldset.passengers_info.opened').eq(passengerNumber);
                              var $errorField = $passengerFieldset.find('[data-service-name="' + field + '"]').closest('.field');

                              if (type == 'frequentflyer') {
                                    /* Check frequent flyer checkbox if not is opened */
                                    var $ffCheckbox = $passengerFieldset.find('.frequent_flyer_group').find('.field.checkbox').find('input[type=checkbox]');
                                    if (!$ffCheckbox.is(':checked')) {
                                          $ffCheckbox.prop('checked', true);
                                          $ffCheckbox.change();
                                    }
                              }

                              /* Show error and set message */
                              $errorField.trigger('show_error', [error.message]);
                              $errorField.addClass('error').removeClass('valid initial_status');

                              /* Show form error */
                              self.showFormError($form);
                        }

                  });

                  if (techMessage.length > 0) {
                        /* Show an error */
                        $('#h72').ui_dialog({
                              title: lang('general.error_title'),
                              error: true,
                              subtitle: techMessage,
                              close: {
                                    behaviour: 'close',
                                    href: '#'
                              },
                              buttons: [{
                                    className: 'close',
                                    href: '#',
                                    label: lang('general.ok')
                              }]
                        });
                  }
            },

            updateFormElement: function (parentElement, element, state, noParent) {
                  if (noParent) {
                        element.attr('data-required', state);
                        element.attr('data-init', 'restart');
                        element.closest('form').form('restartFields');
                  } else {

                        if (state === 'false') {
                              parentElement.find('input').val('');
                        }

                        parentElement.find(element).attr('data-required', state);
                        parentElement.find(element).attr('data-init', 'restart');
                        parentElement.closest('form').form('restartFields');
                  }
            },

            addServiceData: function (step, checkoutSession, callback) {
                  var self = this;

                  if (step == 'passengers') {
                        var sessionId = self.element.find('.process_step').attr('data-sessionId');
                        Bus.publish('services', 'postH72Passengers', {
                              checkoutSession: checkoutSession,
                              sessionId: sessionId,
                              success: function (data) {
                                    var goToNextStep = !(data.header.error == true);
                                    var code = data.header.code;
                                    var message = data.header.message;
                                    var errors;

                                    if (goToNextStep) {
                                          checkoutSession['passengers_added'] = true;
                                    } else {
                                          checkoutSession['passengers_added'] = false;

                                          if (code == 400 || code == 6001) {
                                                errors = data.body.data;

                                                /* Add passenger to true */
                                                if (code == 6001) {
                                                      checkoutSession['passengers_added'] = true;
                                                }
                                          }
                                    }

                                    callback(checkoutSession, goToNextStep, false, message, errors);
                              }
                        });
                  } else if (step == 'extras') {
                        Bus.publish('services', 'postH72Ancillaries', {
                              postObject: this.ancillariesServiceObject,
                              sessionId: self.element.find('.process_step').attr('data-sessionId'),
                              success: function (ancillariesData) {
                                    var goToNextStep = !(ancillariesData.header.error == true);
                                    var message = ancillariesData.header.message;

                                    /* The ancillaries are post successfully, so get the payment methods to evaluate scoring and go to the next step */
                                    if (goToNextStep) {
                                          callback(checkoutSession, goToNextStep, false, message, undefined);

                                          // Bus.publish('services', 'getPaymentMethods', {
                                          //   checkoutSession: checkoutSession,
                                          //   sessionId: self.element.find('.process_step').attr('data-sessionId'),
                                          //   success: function(data) {

                                          //     var goToNextStep = !(data.header.error == true);
                                          //     var showScoring = (data.header.code == 4025);
                                          //     var message = data.header.message;

                                          //     /* Save payment methods in checkoutSession object */
                                          //     if (goToNextStep) {
                                          //       checkoutSession['methods'] = data.body.data;
                                          //     }

                                          //     /* Save a scoring flag */
                                          //     if (showScoring) {
                                          //       checkoutSession['scoring1'] = false;
                                          //     }
                                          //     else {
                                          //       checkoutSession['scoring1'] = true;
                                          //     }

                                          //     callback(checkoutSession, goToNextStep, showScoring, message, undefined);
                                          //   }
                                          // });
                                    } else {
                                          self.element.find('.process_scroll').steps('showErrors');
                                          $('#checkout').ui_dialog({
                                                title: lang('general.error_title'),
                                                error: true,
                                                subtitle: message,
                                                close: {
                                                      behaviour: 'close',
                                                      href: '#'
                                                },
                                                buttons: [{
                                                      className: 'close',
                                                      href: '#',
                                                      label: lang('general.ok')
                                                }]
                                          });
                                    }

                              }
                        });
                  }
                  //      else if (step == 'payment') {
                  //        Bus.publish('services', 'postH72PaymentData', {
                  //          checkoutSession: checkoutSession,
                  //          sessionId: self.element.find('.process_step').attr('data-sessionId'),
                  //          success: function (data) {
                  //            var goToNextStep = !(data.header.error == true);
                  //            var showScoring = (data.header.code == 4025);
                  //            var code = data.header.code;
                  //            var message = data.header.message;
                  //            var errors;
                  //
                  //            /* Save payment info in checkoutSession object */
                  //            if (goToNextStep) {
                  //              checkoutSession['paymentInfo'] = data.body.data.paymentInfo;
                  ////              checkoutSession['calculatePassengers'] = data.body.data.passengerInfo;
                  //              checkoutSession['constraintESTA'] = data.body.data.journeyConstraint;
                  //
                  //              /* Get SATE document of checkoutSession object to put in passengerInfo service response */
                  //              // $.each(data.body.data.passengerInfo, function(indexP, dataP){
                  //              //   checkoutSession['calculatePassengers'][indexP]['sateDocument'] = checkoutSession.passengers[indexP].info.sate_document_number;
                  //              // });
                  //
                  //              /* Add extra and seats objects from servicePassengers global object, so they can be available in the next screen */
                  //              $.each(checkoutSession['calculatePassengers'], function (indexPassenger, passenger) {
                  //                if (passenger.identity != null) {
                  //                  var extrasPassenger = self.getExtraPassengersByIdentity(passenger.identity);
                  //
                  //                  checkoutSession['calculatePassengers'][indexPassenger].extras = extrasPassenger.extras;
                  //                  checkoutSession['calculatePassengers'][indexPassenger].seats = extrasPassenger.seats;
                  //                  checkoutSession['calculatePassengers'][indexPassenger].seatsLength = window.objectLength(extrasPassenger.seats.ow) + window.objectLength(extrasPassenger.seats.rt);
                  //                }
                  //              });
                  //            }
                  //
                  //            /* Save a scoring flag */
                  //            if (showScoring) {
                  //              checkoutSession['scoring2'] = false;
                  //            }
                  //            else {
                  //              checkoutSession['scoring2'] = true;
                  //
                  //              if (code == 400) {
                  //                errors = data.body.data;
                  //              }
                  //            }
                  //
                  //            callback(checkoutSession, goToNextStep, showScoring, message, errors);
                  //          }
                  //        });
                  //      }

                  //EPA
                  else if (step == 'payment') {
                        // console.log('payment', checkoutSession);
                        if (!checkoutSession.sendSaraData) {

                              var info = checkoutSession.payment;

                              var countryDescription = '';
                              var countryPhoneCode = '';
                              Bus.publish('ajax', 'getJSON', {
                                    path: getServiceURL('checkout.countries'),
                                    success: function (data) {
                                          data.forEach(function (country) {
                                                if (country.code === info.credit_card_country) {
                                                      countryDescription = country.description;
                                                      countryPhoneCode = country.phoneCode;
                                                }
                                          });

                                          var cardExpiration = info.credit_card_expiration
                                                .replace(/^(\d+)\/(\d+)$/, '20$2-$1-01');

                                          var paymentHolder = info.credit_card_name;
                                          if (/^\d+$/.test(info.credit_card_holder)) {
                                                var index = parseInt(info.credit_card_holder);
                                                var passenger = checkoutSession.passengers[index];
                                                if (passenger) {
                                                      paymentHolder = passenger.name + ' ' + passenger.surname;
                                                      if (passenger.surname2)
                                                            paymentHolder += ' ' + passenger.surname2;
                                                }
                                          }

                                          var paymentInfo = {
                                                paymentType: info.payment_method_type,
                                                number: info.credit_card_number,
                                                expiration: cardExpiration,
                                                cvv: info.credit_card_cvv,
                                                personContactInformation: {
                                                      email: info.credit_card_mail
                                                },
                                                buyerDocumentation: {
                                                      documentType: info.credit_card_document_type,
                                                      identity: info.credit_card_document_number
                                                },
                                                codeAirEuropaEnterprise: '',
                                                invoiceCountry: {
                                                      code: info.credit_card_country,
                                                      description: countryDescription,
                                                      phoneCode: countryPhoneCode
                                                },
                                                creditCardCodeType: {
                                                      identity: info.credit_card_type
                                                },
                                                holder: paymentHolder,
                                                newsletter: checkoutSession.sendComunication
                                          };

                                          // console.log('paymentInfo (g)', paymentInfo);

                                          // return;

                                          Bus.publish('services', 'postH72Payment', {
                                                checkoutSession: checkoutSession,
                                                paymentInfo: paymentInfo,
                                                success: function (data) {
                                                      var goToNextStep = !(data.header.error == true);
                                                      var message = data.header.message;
                                                      var code = data.header.code;
                                                      var showScoring = (data.header.code == 4025);
                                                      var errors;

                                                      /* Save a scoring flag */
                                                      if (showScoring) {
                                                            checkoutSession['scoring2'] = false;
                                                      } else {
                                                            checkoutSession['scoring2'] = true;

                                                            if (code == 400) {
                                                                  errors = data.body.data;
                                                            }
                                                      }

                                                      /* Save booking data */
                                                      if (goToNextStep) {
                                                            /* PayPal payment redirection */
                                                            if (code === 4055) {
                                                                  var postSessionURL = getPostURL('h72_payment');

                                                                  Bus.publish('ajax', 'postJson', {
                                                                        path: postSessionURL,
                                                                        data: {
                                                                              h72: checkoutSession
                                                                        },
                                                                        success: function () {
                                                                              window.location.href = data.body.data.redirectTo;
                                                                        }
                                                                  });

                                                                  return;
                                                            } else {

                                                                  checkoutSession['finalPaymentInfo'] = data.body.data.summary.paymentInfo;
                                                                  checkoutSession['booking'] = data.body.data.summary.booking;
                                                                  checkoutSession['finalPassengers'] = data.body.data.summary.passengers;
                                                                  checkoutSession['totalInEuros'] = data.body.data.summary.totalInEuros;
                                                                  checkoutSession['postConfirmEvents'] = data.body.data.postConfirmEvents;
                                                                  checkoutSession['loyaltyMiles'] = data.body.data.summary.loyaltyMiles;

                                                                  /* Get SATE document of checkoutSession object to put in passengerInfo service response */
                                                                  // $.each(data.body.data.summary.passengers, function(indexP, dataP){
                                                                  //   checkoutSession['finalPassengers'][indexP]['sateDocument'] = checkoutSession.passengers[indexP].info.sate_document_number;
                                                                  // });

                                                                  /* Add extra and seats objects from servicePassengers global object, so they can be available in the next screen */
                                                                  $.each(checkoutSession['finalPassengers'], function (indexPassenger, passenger) {
                                                                        if (passenger.identity != null) {
                                                                              var extrasPassenger = self.getExtraPassengersByIdentity(checkoutSession, passenger.identificationDocument.identity);

                                                                              checkoutSession['finalPassengers'][indexPassenger].extras = extrasPassenger.extras;
                                                                              checkoutSession['finalPassengers'][indexPassenger].seats = extrasPassenger.seats;
                                                                              checkoutSession['finalPassengers'][indexPassenger].seatsLength = window.objectLength(extrasPassenger.seats.ow) + window.objectLength(extrasPassenger.seats.rt);
                                                                        }
                                                                  });
                                                            }
                                                      } else {
                                                            if (code == 400) {
                                                                  errors = data.body.data;
                                                            } else if (code == 409 || code == 6023) {
                                                                  /* Get the error body, including all fields, to use in the callback method */
                                                                  errors = {};
                                                                  errors.saraError = true;
                                                                  self.saraTemplateData = data.body.data;
                                                            } else if (code == 4223 || code == 4224 || code == 4225 || code == 4230 || code == 4236 || code == 4048 || code == 4263) {
                                                                  /* Update GTM */
                                                                  self.traceManager('cko_error', checkoutSession, code, null);

                                                                  errors = {};
                                                                  errors.goToHome = true;
                                                            } else if (code === 4610) {
                                                                  /* Update GTM */
                                                                  self.traceManager('cko_error', checkoutSession, code.toString(), null);
                                                            }

                                                      }

                                                      callback(checkoutSession, goToNextStep, showScoring, message, errors);
                                                }
                                          });
                                    }
                              });
                        }
                        else {
                        // ----
                              Bus.publish('services', 'putH72PaymentWithSara', {
                                    checkoutSession: checkoutSession,
                                    // Missing sessionId
                                    sessionId: self.element.find('.process_step').attr('data-sessionId'),
                                    success: function (data) {
                                          var goToNextStep = !(data.header.error == true);
                                          var message = data.header.message;
                                          var code = data.header.code;
                                          var showScoring = (data.header.code == 4025);
                                          var errors;

                                          /* Save a scoring flag */
                                          if (showScoring) {
                                                checkoutSession['scoring2'] = false;
                                          }
                                          else {
                                                checkoutSession['scoring2'] = true;

                                                if (code == 400) {
                                                      errors = data.body.data;
                                                }
                                          }

                                          /* Save booking data */
                                          if (goToNextStep) {
                                                /* PayPal payment redirection */
                                                if (code === 4055) {
                                                      var postSessionURL = getPostURL('h72_payment');

                                                      Bus.publish('ajax', 'postJson', {
                                                            path: postSessionURL,
                                                            data: { h72: checkoutSession },
                                                            success: function () {
                                                                  window.location.href = data.body.data.redirectTo;
                                                                  return;
                                                            }
                                                      });
                                                }
                                                else {

                                                      checkoutSession['finalPaymentInfo'] = data.body.data.summary.paymentInfo;
                                                      checkoutSession['booking'] = data.body.data.summary.booking;
                                                      checkoutSession['finalPassengers'] = data.body.data.summary.passengers;
                                                      checkoutSession['totalInEuros'] = data.body.data.summary.totalInEuros;
                                                      checkoutSession['postConfirmEvents'] = data.body.data.postConfirmEvents;
                                                      checkoutSession['loyaltyMiles'] = data.body.data.summary.loyaltyMiles;

                                                      /* Add extra and seats objects from servicePassengers global object, so they can be available in the next screen */
                                                      $.each(checkoutSession['finalPassengers'], function (indexPassenger, passenger) {
                                                            if (passenger.identity != null) {
                                                                  var extrasPassenger = self.getExtraPassengersByIdentity(passenger.identity);

                                                                  checkoutSession['finalPassengers'][indexPassenger].extras = extrasPassenger.extras;
                                                                  checkoutSession['finalPassengers'][indexPassenger].seats = extrasPassenger.seats;
                                                                  checkoutSession['finalPassengers'][indexPassenger].seatsLength = 0;
                                                                  if(extrasPassenger.seats){
                                                                	  checkoutSession['finalPassengers'][indexPassenger].seatsLength = window.objectLength(extrasPassenger.seats.ow) + window.objectLength(extrasPassenger.seats.rt);
                                                                  }
                                                            }
                                                      });
                                                }

                                          }
                                          else {
                                                if (code == 400) {

                                                      /* A 400 code in revalidation service means there's an error in the fields, so we have to
                                                       show the sara popup again and show the info popup with the error message */
                                                      errors = {};
                                                      errors.saraError = true; /* Show the sara popup again */

                                                      /* Show the info message popup with the error */
                                                      $('#h72').ui_dialog({
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
                                                else if (code === 4056 || code === 4057) { // Paypal errors - user abandons or paypal refuses the payment
                                                      errors = {};
                                                      errors.paypal = true;

                                                      /* Show the info message popup with the error */
                                                      $('#h72').ui_dialog({
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
                                                else if (code == 409 || code == 6023) {
                                                      /* Get the error body, including all fields, to use in the callback method */
                                                      errors = {};
                                                      errors.saraError = true;
                                                      self.saraTemplateData = data.body.data;
                                                }
                                                else if (code == 4223 || code == 4224 || code == 4225 ||  code == 4230 || code == 4236 || code == 4048 || code == 4263) {
                                                      /* Update GTM */
                                                      self.traceManager('cko_error', checkoutSession, code, null);

                                                      errors = {};
                                                      errors.goToHome = true;
                                                }
                                          }

                                          callback(checkoutSession, goToNextStep, showScoring, message, errors);
                                    }
                              });

                        // -----
                        }
                  }
            },

            /* Itemization */

            createItemization: function () {
                  var self = this;
                  var itemization = {
                        adult: {
                              number: 0
                        },
                        kid: {
                              number: 0
                        },
                        baby: {
                              number: 0
                        },
                        tax: {},
                        ancillaries: {},
                        fees: {},
                        resident: {},
                        largeFamily: {},
                        discounts: {},
                        mymiles: {},
                        promotion: {},
                        discountResident: {},
                        discountLargeFamily: {}
                  };

                  var total;

                  var serviceItemization;
                  var step = 'payment';

                  // var serviceItemization = this.checkoutData['itemization'].itemization;
                  // var step = this.checkoutData['step'];

                  // if (step == 'finish') {

                  //   if ($("li.isseat").length){

                  //     $("li.isseat").parents().parents().siblings("dt.etiquetasientos").show();

                  //   };

                  //   $('.process_scroll').animate({scrollTop: $(document).height()}, 3000);

                  // }

                  if (this.h72FormCache.passengers != undefined && step == 'payment') {
                        serviceItemization = this.h72FormCache.passengers;
                  }

                  self.baseFare = 0;

                  $.each(serviceItemization, function (index, passenger) {
                        /* Adult passengers base */
                        if (passenger.passengerType == "ADULT") {
                              itemization.adult = {
                                    number: itemization.adult.number + 1,
                                    description: passenger.base.description,
                                    amount: passenger.base.amount + (itemization.adult.amount || 0)
                              };
                        }

                        /* Kid (child) passengers base */
                        if (passenger.passengerType == "CHILD") {
                              itemization.kid = {
                                    number: itemization.kid.number + 1,
                                    description: passenger.base.description,
                                    amount: passenger.base.amount + (itemization.kid.amount || 0)
                              };
                        }

                        /* Baby (infant) passengers base */
                        if (passenger.passengerType == "INFANT") {
                              itemization.baby = {
                                    number: itemization.baby.number + 1,
                                    description: passenger.base.description,
                                    amount: passenger.base.amount + (itemization.baby.amount || 0)
                              };
                        }

                        /* Sum base fare */
                        self.baseFare += passenger.base.amount;

                        /* Taxes */
                        itemization.tax = {
                              description: passenger.tax.description, // lang('general.taxes')
                              amount: passenger.tax.amount + (itemization.tax.amount || 0)
                        };

                        /* Ancillary */
                        if (passenger.ancillaryItemization && passenger.ancillaryItemization.length > 0) {
                              $.each(passenger.ancillaryItemization, function (ancIndex, ancillary) {
                                    itemization.ancillaries[ancillary.ancillaryType] = {
                                          type: ancillary.ancillaryType,
                                          description: ancillary.price.description,
                                          amount: ancillary.price.amount + (itemization.ancillaries[ancillary.ancillaryType] ? itemization.ancillaries[ancillary.ancillaryType].amount || 0 : 0)
                                    };
                              });
                        }

                        /* Fee */
                        if (passenger.feeItemization && passenger.feeItemization.length > 0) {
                              $.each(passenger.feeItemization, function (feeIndex, fee) {
                                    itemization.fees[fee.feeType] = {
                                          type: fee.feeType,
                                          description: fee.price.description,
                                          amount: fee.price.amount + (itemization.fees[fee.feeType] ? itemization.fees[fee.feeType].amount || 0 : 0)
                                    };
                              });
                        }

                        /* Discount */
                        if (passenger.discountItemization && passenger.discountItemization.length > 0) {
                              $.each(passenger.discountItemization, function (discountIndex, discount) {
                                    if (discount.discountType == 'RESIDENT') {
                                          itemization.resident = {
                                                description: lang('general.resident_discount'),
                                                amount: discount.price.amount + (itemization.resident.amount || 0)
                                          };
                                    } else if (discount.discountType == 'LARGEFAMILY_NORMAL') {
                                          itemization.largeFamily = {
                                                description: lang('general.large_family_discount'),
                                                amount: discount.price.amount + (itemization.largeFamily.amount || 0)
                                          };
                                    } else if (discount.discountType == 'LARGEFAMILY_SPECIAL') {
                                          itemization.largeFamily = {
                                                description: lang('general.large_family_discount'),
                                                amount: discount.price.amount + (itemization.largeFamily.amount || 0)
                                          };
                                    } else if (discount.discountType == 'PROMOTION') {
                                          itemization.promotion = {
                                                description: lang('general.promotional_discount'),
                                                amount: discount.price.amount + (itemization.promotion.amount || 0)
                                          };
                                    } else if (discount.discountType == 'MILES') {
                                          itemization.mymiles = {
                                                description: discount.price.description,
                                                amount: discount.price.amount + (itemization.mymiles.amount || 0)
                                          };
                                    } else if (discount.discountType == 'SERVICE_FEE_RESIDENT') {
                                          itemization.discountResident = {
                                                description: discount.price.description,
                                                amount: discount.price.amount + (itemization.discountResident.amount || 0)
                                          };
                                    } else if (discount.discountType == 'SERVICE_FEE_LARGEFAMILY') {
                                          itemization.discountLargeFamily = {
                                                description: discount.price.description,
                                                amount: discount.price.amount + (itemization.discountLargeFamily.amount || 0)
                                          };
                                    } else {
                                          itemization.discounts = {
                                                description: lang('general.discount'),
                                                amount: discount.price.amount + (itemization.discounts.amount || 0)
                                          };
                                    }
                              });
                        }

                        /* Total price */
                        total = {
                              description: passenger.total.description,
                              currency: passenger.total.currency.code,
                              //amount: Math.floor((passenger.total.amount + (total ? total.amount : 0)) * 100) / 100
                              amount: (passenger.total.amount + (total ? total.amount : 0))
                        };

                  });

                  /* Make discount negative */
                  itemization.resident.amount = itemization.resident.amount * -1;
                  itemization.discounts.amount = itemization.discounts.amount * -1;
                  itemization.largeFamily.amount = itemization.largeFamily.amount * -1;
                  itemization.mymiles.amount = itemization.mymiles.amount * -1;
                  itemization.promotion.amount = itemization.promotion.amount * -1;
                  itemization.discountLargeFamily.amount = itemization.discountLargeFamily.amount * -1;
                  itemization.discountResident.amount = itemization.discountResident.amount * -1;

                  // console.log("Objeto itemization");
                  // console.log(itemization);
                  // console.log(total);

                  /* Print itemization */
                  this.printItemization(itemization, total);
            },
            printItemization: function (itemization, total) {
                  var itemHtml;
                  var cacheHtml = '';

                  /* Adult */
                  if (itemization.adult.amount > 0) {
                        cacheHtml += '<li class="adults" data-value="' + itemization.adult.amount + '"><span>' + itemization.adult.description + ' (x' + itemization.adult.number + ')' + '</span> <strong>' + formatCurrency(itemization.adult.amount) + '</strong></li>';
                  }

                  /* Kid */
                  if (itemization.kid.amount > 0) {
                        cacheHtml += '<li class="kids" data-value="' + itemization.kid.amount + '"><span>' + itemization.kid.description + ' (x' + itemization.kid.number + ')' + '</span> <strong>' + formatCurrency(itemization.kid.amount) + '</strong></li>';
                  }

                  /* Baby */
                  if (itemization.baby.amount > 0) {
                        cacheHtml += '<li class="babies" data-value="' + itemization.baby.amount + '"><span>' + itemization.baby.description + ' (x' + itemization.baby.number + ')' + '</span> <strong>' + formatCurrency(itemization.baby.amount) + '</strong></li>';
                  }

                  /* Promotion */
                  if (itemization.promotion.amount < 0) { /* Negative value */
                        cacheHtml += '<li class="promotion" data-value="' + itemization.promotion.amount + '"><span>' + itemization.promotion.description + '</span> <strong>' + formatCurrency(itemization.promotion.amount) + '</strong></li>';
                  }

                  /* Resident discount */
                  if (itemization.resident.amount < 0) {
                        cacheHtml += '<li class="resident" data-value="' + itemization.resident.amount + '"><span>' + itemization.resident.description + '</span> <strong>' + formatCurrency(itemization.resident.amount) + '</strong></li>';
                  }

                  /* Large family discount */
                  if (itemization.largeFamily.amount < 0) {
                        cacheHtml += '<li class="large_family" data-value="' + itemization.largeFamily.amount + '"><span>' + itemization.largeFamily.description + '</span> <strong>' + formatCurrency(itemization.largeFamily.amount) + '</strong></li>';
                  }

                  /* Tax */
                  if (itemization.tax.amount > 0) {
                        cacheHtml += '<li class="tax" data-value="' + itemization.tax.amount + '"><span>' + itemization.tax.description + '</span> <strong>' + formatCurrency(itemization.tax.amount) + '</strong></li>';
                  }

                  /* Ancillaries */
                  $.each(itemization.ancillaries, function (ancIndex, ancillary) {
                        if (ancillary.amount > 0) {
                              cacheHtml += '<li class="' + ancillary.type + '" data-value="' + ancillary.amount + '"><span>' + ancillary.description + '</span> <strong>' + formatCurrency(ancillary.amount) + '</strong></li>';
                        }
                  });

                  /* Fee */
                  $.each(itemization.fees, function (feeIndex, fee) {
                        if (fee.amount > 0) {
                              cacheHtml += '<li class="' + fee.type + '" data-value="' + fee.amount + '"><span>' + fee.description + '</span> <strong>' + formatCurrency(fee.amount) + '</strong></li>';
                        }
                  });

                  /* Discount */
                  if (itemization.discounts.amount < 0) { /* Negative value */
                        cacheHtml += '<li class="discount" data-value="' + itemization.discounts.amount + '"><span>' + itemization.discounts.description + '</span> <strong>' + formatCurrency(itemization.discounts.amount) + '</strong></li>';
                  }

                  /* Miles Discount */
                  if (itemization.mymiles.amount < 0) { /* Negative value */
                        cacheHtml += '<li class="mymiles" data-value="' + itemization.mymiles.amount + '"><span>' + itemization.mymiles.description + '</span> <strong>' + formatCurrency(itemization.mymiles.amount) + '</strong></li>';
                  }

                  /* Large Family Discount */
                  if (itemization.discountLargeFamily.amount < 0) { /* Negative value */
                        cacheHtml += '<li class="fee_large_family" data-value="' + itemization.discountLargeFamily.amount + '"><span>' + itemization.discountLargeFamily.description + '</span> <strong>' + formatCurrency(itemization.discountLargeFamily.amount) + '</strong></li>';
                  }

                  /* Resident Discount */
                  if (itemization.discountResident.amount < 0) { /* Negative value */
                        cacheHtml += '<li class="fee_resident" data-value="' + itemization.discountResident.amount + '"><span>' + itemization.discountResident.description + '</span> <strong>' + formatCurrency(itemization.discountResident.amount) + '</strong></li>';
                  }

                  /* Append itemization to prices block */
                  this.element.find('.prices .body .price_block ul').empty().append(cacheHtml);

                  /* Update total */
                  if (total) {
                        this.element.find('.prices .body .price_total span').html(formatCurrency(total.amount));
                        this.element.find('.prices .body .price_total em').text(total.currency);
                  }
            },

            paymentMethods: function () {
                  var self = this;

                  /* Show card name field when card holder is not a passenger (value == 'other') */
                  this.element.find('.card_holder select').on('change', function () {
                        var $this = $(this);
                        var $option = $this.find('option:selected');
                        var value = $option.attr('value');
                        var $cardName = $this.closest('.group_body').find('.card_name');
                        var $documentType = $this.closest('.group_body').find('.document_block .document_type');
                        var $documentNumber = $this.closest('.group_body').find('.document_block .document_number');
                        var $email = $this.closest('.group_body').find('.document_block .email');
                        var passenger = undefined;

                        if (value == 'other' || value == '') {

                              if (value == 'other' && $cardName.find('input').val() == '') {
                                    $cardName.find('input').val('');
                                    $documentNumber.find('input').val('');
                                    $email.find('input').val('');
                                    setTimeout(function () {
                                          $('.field.text_field.third.email').addClass('initial_status');
                                          $('.field.select_field.third.document_type').addClass('initial_status');
                                          $('.field.text_field.third.document_number').addClass('initial_status');
                                    }, 0);
                                    $documentType.find('select').find('option:selected').prop('selected', false);
                              }

                              $cardName.attr('data-required', 'true');
                              $cardName.attr('data-init', 'restart').removeClass('valid filled');
                              $cardName.stop().slideDown(300);

                              /* Reassign forms to validate the added fields */
                              $cardName.closest('form').form('restartFields');

                              /* Clean document type, document number and email */
                              $documentType.removeClass('filled non_editable').find('select').find('option:selected').change();
                              $documentNumber.removeClass('filled non_editable').find('input').trigger('validate');
                              $email.removeClass('filled non_editable').find('input').trigger('validate');
                        } else {
                              $cardName.stop().slideUp(300, function () {
                                    $cardName.find('input').val('');
                                    $cardName.attr('data-required', 'false');
                                    $cardName.attr('data-init', 'restart');

                                    /* Reassign forms to validate the added fields */
                                    $cardName.closest('form').form('restartFields');
                              });
                              passenger = self.getPassengerByIndex(value);

                              /* Fill document type, document number and email with the saved data for this passenger */

                              $documentType.addClass('filled non_editable').find('select').find('option[value=' + passenger.identificationDocument.documentType.code + ']').prop('selected', true).change();
                              $documentNumber.addClass('filled non_editable').find('input').val(passenger.identificationDocument.identity).trigger('validate');
                              if (passenger.email) {
                                    $email.addClass('filled non_editable').find('input').val(passenger.email).trigger('validate');
                              } else {
                                    $email.removeClass('filled non_editable').find('input').val('').trigger('validate');
                              }
                        }
                  });

                  /* Trigger change in the first load */
                  this.element.find('.card_holder select').each(function () {
                        var $this = $(this);
                        var $option = $this.find('option:selected');

                        if ($option.attr('value') != '') {
                              $this.trigger('change');
                        }

                  });
            },

            getPassengerByIndex: function (passengerIndex) {
                  return this.h72FormCache.passengers[passengerIndex];
            },

            getErrorsInForm: function ($form) {
                  var result = [];
                  /* search for error in the form with not disabled class */
                  $.each($form.find('.field.error').not('.disabled'), function () {
                        /* search for data-service-name inputs and selects */
                        var inputError = $(this).find('input').attr('data-gtm-name');
                        var selectError = $(this).find('select').attr('data-gtm-name');

                        /* check specials forms */
                        if ((inputError == 'promotionCode') || (inputError == 'myaePassword')) {
                              result.push(inputError)
                              return false;
                        }

                        if (inputError) {
                              result.push(inputError)
                        }
                        if (selectError) {
                              result.push(selectError)
                        }
                  });

                  /* filter MyAe array */
                  if (result.length >= 2) {
                        if ((result[0] == 'myaeUser') && (result[1] == 'myaePassword')) {
                              result = result.slice(0, 2);
                        } else if ((result[0] == 'myaeUser') || (result[0] == 'myaePassword')) {
                              result = result.slice(0, 1);
                        }
                  }

                  return result;
            },

            traceManager: function () {
                  return;
            },

            cardExpirationActions: function () {
                  $(".date_card_expiration_input").change(function () {
                        var inputtarget = $(this).attr("data-input-target");

                        // reset value of the hidden date input
                        $("#" + inputtarget).val("");

                        var monthValue = $("." + inputtarget + ".card_expirationmonth").val();
                        var yearValue = $("." + inputtarget + ".card_expirationyear").val();

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

            addPaymentFormData: function ($form) {
                  var postObject = {};

                  /* Compose object to post to the object */
                  postObject = this.h72FormCache;

                  /* Get the data from the user form */
                  userData = $form.serializeObject();
                  step = userData.step;

                  /* Delete services to send to session */
                  postObject.services = null;
                  postObject.user_info = null;
                  postObject.frequent_payment = null;

                  /* frequent_passengers info will be deleted only is step is different than 'passengers', to avoid loose data if service returns error */
                  if (step != 'passengers') {
                        postObject.frequent_passengers = null;
                  }

                  /* Restart sendSaraData */
                  //postObject.sendSaraData = false;

                  /* Add the data needed in every step */
                  if (step == 'passengers') {

                        /* Name and surname of each passenger to uppercase */
                        _.each(userData.passengers, function (passenger, index, list) {
                              passenger.info.name = passenger.info.name.toUpperCase();
                              passenger.info.surname_1 = passenger.info.surname_1.toUpperCase();
                              passenger.info.surname_2 = passenger.info.surname_2.toUpperCase();
                        });

                        postObject.passengers = userData.passengers;
                  } else if (step == 'extras') {
                        //console.log("Post passengers");
                        //console.log(postObject.passengers);

                        //console.log(userData);

                        if (userData.servicePassengers) {
                              for (var index in userData.servicePassengers) {
                                    var servicePassenger = userData.servicePassengers[index];

                                    //console.log(index);
                                    // postObject.servicePassengers[index].seats = servicePassenger.seats;
                                    postObject.servicePassengers[index].extras = servicePassenger.extras;
                              }
                        }

                        postObject.extras = userData.extras;
                        postObject.ancillaries = this.ancillariesServiceObject;
                  } else if (step == 'payment') {

                        if (!window.paypalPayment) {
                              userData.payment.credit_card = (userData.payment_type == 'credit_card') ? 1 : 0;
                              userData.payment.ae_card = (userData.payment_type == 'ae_card') ? 1 : 0;
                              userData.payment.reserve = (userData.payment_type == 'reserve') ? 1 : 0;
                              userData.payment.myae = (userData.payment_type == 'myae') ? 1 : 0;
                              userData.payment.promotion = (userData.payment_type == 'promotion') ? 1 : 0;
                              userData.payment.paypal = (userData.payment_type == 'paypal') ? 1 : 0;
                              userData.payment.mymiles = (userData.payment_type == 'mymiles') ? 1 : 0;
                              userData.payment.promotion_paypal = (userData.payment_type == 'promotion_paypal') ? 1 : 0;

                              /* Clean card details if it's paid with a saved card */
                              if (userData.payment_type == 'credit_card') {
                                    if (userData.payment.credit_card_hashId) {
                                          userData.payment.credit_card_type = "";
                                          userData.payment.credit_card_number = "";
                                    }
                              }

                              if (userData.payment_type == 'mymiles') {
                                    if (userData.payment.mymiles_credit_card_hashId) {
                                          userData.payment.mymiles_card_type = "";
                                          userData.payment.mymiles_card_number = "";
                                    }
                              }

                              if (userData.payment_type == 'promotion') {
                                    if (userData.payment.promotion_card_hashId) {
                                          userData.payment.promotion_card_type = "";
                                          userData.payment.promotion_card_number = "";
                                    }
                              }

                              postObject.sendComunication = (userData.field_comunication == 'on') ? "NONE" : "ONLY_AIREUROPA";

                              postObject.sendSaraData = false;
                              postObject.payment = userData.payment;

                        } else {
                              postObject.sendSaraData = false;
                              // postObject.payment = checkoutSession.payment;
                        }

                        if (this.saraData != undefined) {
                              postObject.saraData = this.saraData;
                              postObject.sendSaraData = true;
                        }
                  }
                  //      else if (step == 'finish' && this.saraData != undefined) {
                  //        postObject.saraData = this.saraData;
                  //        postObject.sendSaraData = true;
                  //      }

                  return postObject;

            },

            getExtraPassengersByIdentity: function (data, identity) {
                  var foundPassenger = undefined;
                  var cleanSeats = {
                        ow: {},
                        rt: {}
                  };

                  //    console.log('DATA', data);

                  $.each(data['finalPassengers'], function (indexPassenger, passenger) {
                        if (identity == passenger.identificationDocument.identity) {
                              foundPassenger = $.extend({}, passenger); /* Clone the object */
                              return false;
                        }
                  });

                  /* Loop seats to clean void ones */
                  if (foundPassenger) {
                        if (foundPassenger.seats && foundPassenger.seats.ow) {
                              for (var segmentId in foundPassenger.seats.ow) {
                                    var segment = foundPassenger.seats.ow[segmentId];
                                    if (segment.number != '' && segment.column != '') {
                                          cleanSeats.ow[segmentId] = segment;
                                    }
                              }
                        }

                        if (foundPassenger.seats && foundPassenger.seats.rt) {
                              for (var segmentId in foundPassenger.seats.rt) {
                                    var segment = foundPassenger.seats.rt[segmentId];
                                    if (segment.number != '' && segment.column != '') {
                                          cleanSeats.rt[segmentId] = segment;
                                    }
                              }
                        }

                        foundPassenger.seats = cleanSeats;
                  }

                  return foundPassenger;
            },

            /*
             * Set visual effects of confirm page.
             */
            setVisualEffects: function () {
                  var self = this;

                  if (self.visualEffectsAlreadySet) return;
                  self.visualEffectsAlreadySet = true;

                  this.element.on('click.results', '.passenger .more_details', function (event) {
                        event.preventDefault();

                        var $this = $(this);

                        var isOpened = ($this.children().hasClass('open')) ? true : false;

                        var $infoBlock = $('.more_info_block');

                        if (isOpened) {
                              /* Collapse info */
                              $infoBlock.slideUp(300);
                              $this.children().removeClass('open');
                        } else {
                              /* Open info */
                              $infoBlock.slideDown(300);
                              $this.children().addClass('open');
                        };
                  });

                  this.element.on('click.results', '.register .register_header', function (event) {
                        event.preventDefault();

                        var $this = $(this);

                        var isOpened = ($this.hasClass('open')) ? true : false;

                        var $registerBody = $('.register_body');
                        var $registerBodyBtn = $('.register_header .register_btn');

                        if (isOpened) {
                              /* Collapse info */
                              $registerBody.slideUp(300);
                              $registerBodyBtn.show();
                              $this.removeClass('open');
                        } else {
                              /* Open info */
                              $registerBody.slideDown(300);
                              $registerBodyBtn.hide();
                              $this.addClass('open');

                              self.birthdateActions();
                        };
                  });
            },

            registerForm: function () {
                  var self = this;
                  /* If the user is not logged in, clone the register form */
                  if (!User.isLoggedIn()) {

                        Bus.publish('ajax', 'getTemplate', {
                              path: AirEuropaConfig.templates.account.register_form,
                              success: function (html) {

                                    Bus.publish('services', 'get_account_lists', {
                                          preconditionDocsType: 'LOYALTY',
                                          success: function (response) {
                                                var $registerForm = html(response);

                                                /* Append form */
                                                self.element.find('.register .register_body').append($registerForm);

                                                self.documentType(true);

                                                /* Reinit form */
                                                Bus.publish('account', 'init_register_form');

                                                self.setPreferenceAirport();
                                                self.completeRegisterData(self.h72FormCache.passengers[0]);

                                                /* password validation */
                                                //self.listenPassword('#field_cko_register_password', '#field_cko_register_password2');
                                                self.listenPassword('#field_cko_register_password_wrapper', '#field_cko_register_password_wrapper_2');

                                          }
                                    });
                              }
                        });
                  }
            },

            documentType: function (isRegister) {
                  var $documentBlocks = this.element.find('.document_block');
                  var self = this;

                  $documentBlocks.each(function () {
                        var $this = $(this);
                        var $type = $this.find('.document_type');
                        var $number = $this.find('.document_number');
                        var $country = $this.find('.document_country');
                        var $expiration = $this.find('.document_expiration');
                        var $expiration_selects = $this.find('.passport_accordeon');
                        var $expiration_selects_requierd = $this.find('.passport_accordeon .field.select_field');
                        var $fieldsetBody = $this.closest('.fieldset_body');
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
                              if (value == 'PP') {
                                    /* Required status */
                                    $number.attr('data-required', 'true').removeClass('valid filled');
                                    if (!isRegister) {
                                          $country.attr('data-required', 'true').removeClass('valid filled').slideDown();
                                          $expiration.attr('data-required', 'true').attr('data-format', 'expiration').addClass('half').removeClass('valid filled full').slideDown();
                                    }
                                    $country.attr('data-required', 'true').removeClass('valid filled').slideDown();
                                    $expiration.attr('data-required', 'true').attr('data-format', 'expiration').addClass('half').removeClass('valid filled full').slideDown();
                                    $expiration_selects_requierd.attr('data-required', 'true');
                                    $expiration_selects.slideDown();

                                    /* Format status */
                                    $number.attr('data-format', 'passport');

                                    /* Show large family checkbox */
                                    $fieldsetBody.find('.check_group.large_family').addClass('hidden');
                              }

                              /* DNI / Congress */
                              else if (value == 'NI' || value == 'GR') {
                                    /* Required status */
                                    $number.attr('data-required', 'true').removeClass('valid filled');
                                    if (!isRegister) {
                                          $country.attr('data-required', 'false').removeClass('valid filled').slideUp();
                                    }
                                    if (self.h72FormCache.journeyConstraintBlock) {
                                          $expiration.attr('data-required', 'true').attr('data-format', 'expiration').addClass('full').removeClass('valid filled half').slideDown();
                                          $expiration_selects_requierd.attr('data-required', 'true');
                                          $expiration_selects.slideDown();
                                    } else {
                                          $expiration.attr('data-required', 'false').removeAttr('data-format').removeClass('valid filled').slideUp();
                                          $expiration_selects_requierd.attr('data-required', 'false');
                                          $expiration_selects.slideUp();
                                    }

                                    /* Format status */
                                    $number.attr('data-format', 'dni');

                                    /* Show large family checkbox */
                                    $fieldsetBody.find('.check_group.large_family').removeClass('hidden');
                              }

                              /* European ID */
                              else if (value == 'DL') {
                                    /* Required status */
                                    $number.attr('data-required', 'true').removeClass('valid filled');
                                    if (!isRegister) {
                                          $country.attr('data-required', 'false').removeClass('valid filled').slideUp();
                                          $expiration.attr('data-required', 'false').removeAttr('data-format').removeClass('valid filled').slideUp();
                                          $expiration_selects.slideUp();
                                    }
                                    $country.attr('data-required', 'false').removeClass('valid filled').slideUp();
                                    $expiration.attr('data-required', 'false').removeAttr('data-format').removeClass('valid filled').slideUp();
                                    $expiration_selects_requierd.attr('data-required', 'false');
                                    $expiration_selects.slideUp();

                                    /* Format status */
                                    $number.attr('data-format', 'passport');

                                    /* Show large family checkbox */
                                    $fieldsetBody.find('.check_group.large_family').removeClass('hidden');
                              }

                              /* NIE */
                              else if (value == 'ID') {
                                    /* Required status */
                                    $number.attr('data-required', 'true').removeClass('valid filled');
                                    if (!isRegister) {
                                          $country.attr('data-required', 'false').removeClass('valid filled').slideUp();
                                          $expiration.attr('data-required', 'false').removeAttr('data-format').removeClass('valid filled').slideUp();
                                          $expiration_selects.slideUp();
                                    }
                                    $country.attr('data-required', 'false').removeClass('valid filled').slideUp();
                                    $expiration.attr('data-required', 'false').removeAttr('data-format').removeClass('valid filled').slideUp();
                                    $expiration_selects_requierd.attr('data-required', 'false');
                                    $expiration_selects.slideUp();

                                    /* Format status */
                                    $number.attr('data-format', 'nie');

                                    /* Show large family checkbox */
                                    $fieldsetBody.find('.check_group.large_family').removeClass('hidden');
                              }

                              /* Under 14, no ID */
                              else if (value == 'MN') {
                                    /* Required status */
                                    $number.attr('data-required', 'false');
                                    if (!isRegister) {
                                          $country.attr('data-required', 'false').slideUp();
                                          $expiration.attr('data-required', 'false').removeAttr('data-format').slideUp();
                                          $expiration_selects_requierd.attr('data-required', 'false');
                                          $expiration_selects.slideUp();
                                    }
                                    $country.attr('data-required', 'false').slideUp();
                                    $expiration.attr('data-required', 'false').removeAttr('data-format').slideUp();
                                    $expiration_selects_requierd.attr('data-required', 'false');
                                    $expiration_selects.slideUp();

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
                                    $country.attr('data-init', 'restart');
                                    $expiration.attr('data-init', 'restart');
                                    $expiration_selects_requierd.attr('data-init', 'restart');

                                    /* Reassign forms to validate the added fields */
                                    $select.closest('form').form('restartFields');
                              }

                        });

                        $type.find('select').trigger('change');

                        firstLoad = false;
                  });
            },

            setPreferenceAirport: function () {
                  var self = this;

                  Bus.publish('services', 'getH72PreferenceAirport', {
                        success: function (preference_airport) {

                              if (self.element.find('#field_cko_register_preference_airport option').length == 1) {
                                    // var ordered_airports = self.orderAirportsByZone(preference_airport);
                                    var ordered_airports = preference_airport;

                                    $.each(ordered_airports, function (indexGroup) {

                                          var optgroup = $('<optgroup>');
                                          optgroup.attr('label', ordered_airports[indexGroup].name);

                                          $.each(ordered_airports[indexGroup].airports, function (index, airport) {

                                                var option = $("<option></option>");
                                                option.val(airport.code);
                                                option.text(airport.description);

                                                optgroup.append(option);
                                          });
                                          self.element.find("#field_cko_register_preference_airport").append(optgroup);
                                    });

                              }

                        }
                  });
            },

            completeRegisterData: function (data) {
                  // console.log('data', data);

                  var self = this;
                  var honorific = data.addressAs;

                  /* update fields if they are needed */
                  self.updateField(self, data.email, 'field_register_email');
                  self.updateField(self, data.name, 'field_register_name');
                  self.updateField(self, data.surname, 'field_register_surname');
                  self.updateField(self, data.surname2, 'field_register_surname2');
                  self.updateField(self, data.birthday, 'field_register_birthdate');
                  self.updateField(self, data.identificationDocument.identity, 'field_register_document_number');
                  self.updateSelect(self, data.identificationDocument.expeditionCountry.code, 'field_register_document_nationality');
                  // self.updateSelect(self, data.preference_airport, 'field_register_preference_airport');
                  self.updateSelect(self, honorific, 'field_register_honorific');
                  self.updateSelect(self, data.identificationDocument.documentType.code, 'field_register_document_type');
            },
            updateField: function ($this, dataValue, serviceName) {
                  var $element = $this.element.find('.register_form input[name="' + serviceName + '"]');
                  $element.val(dataValue);
                  $element.trigger('blur').closest('.field').addClass('initial_status');
            },
            updateSelect: function ($this, dataValue, serviceName) {
                  var $element = $this.element.find('.register_form select[name="' + serviceName + '"]');
                  $element.val(dataValue);
                  $element.closest('.selected_value').val(dataValue)
                  $element.trigger('change', [true]);
            },

            listenPassword: function (fieldPassword, fieldPassword2) {
                  var self = this;
                  var $password = this.element.find(fieldPassword);
                  var $password2 = this.element.find(fieldPassword2);

                  var $passwordInput = $password.find('input');
                  var $passwordInput2 = $password2.find('input');

                  $passwordInput2.on('blur', function (event) {

                        if ($password2.closest('.field').hasClass('valid') && ($passwordInput2.val() != $passwordInput.val())) {
                              self.showPasswordError($password2.attr('data-service-name'), self.element);
                        }

                        if (!$password.closest('.field').hasClass('valid')) {
                              $password2.closest('.field').addClass('non_editable');
                              $passwordInput2.attr('readonly', true);
                              $passwordInput2.val('');
                              $password2.closest('.field').removeClass('valid');
                        }

                  });

                  $passwordInput.on('blur', function (event) {

                        if ($password.closest('.field').hasClass('valid') && ($passwordInput2.val() != $passwordInput.val())) {

                              self.showPasswordError($password2.attr('data-service-name'), self.element);
                              $password2.closest('.field').removeClass('non_editable');
                              $passwordInput2.attr('readonly', false);
                        }

                        if (($passwordInput.val() == '') && !($password2.closest('.field').hasClass('non_editable')) || (!$password.closest('.field').hasClass('valid'))) {
                              $password2.closest('.field').removeClass('valid');
                              $password2.closest('.field').addClass('non_editable');
                              $passwordInput2.attr('readonly', true);
                              $passwordInput2.val('');
                        }

                  });
            },

            showPasswordError: function (fieldName, $element) {
                  var $errorField = $element.find('[data-service-name = ' + fieldName + ']').closest('.field');

                  /* Show error and set message */
                  $errorField.trigger('show_error', lang('account.error_match_password2'));
                  $errorField.addClass('error').removeClass('valid initial_status');

                  /* Send the event to put the field invalid, so the user can't do the submit */
                  $errorField.trigger('set_valid', [false]);
            },

            birthdateActions: function () {
                  var self = this;

                  // get last departure flight date
                  var el = this.element.find('#first-flight-departure-date').last();
                  var depDate = el.attr('data-departure-date');
                  var lastFlightDepartureDate = depDate.slice(0, 10);
                  var lastFlightDepartureDateParts = lastFlightDepartureDate.split("/");

                  // yesterday date
                  var yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  var yesterdayDay = ("0" + yesterday.getDate()).slice(-2); // two digits format
                  var yesterdayMonth = ("0" + (yesterday.getMonth() + 1)).slice(-2); // two digits format

                  // flight date
                  var flight = new Date(lastFlightDepartureDateParts[2], lastFlightDepartureDateParts[1] - 1, lastFlightDepartureDateParts[0]);
                  var flightDay = ("0" + flight.getDate()).slice(-2); // two digits format
                  var flightMonth = ("0" + (flight.getMonth() + 1)).slice(-2); // two digits format

                  // next day of flight date
                  var flightNext = new Date(lastFlightDepartureDateParts[2], lastFlightDepartureDateParts[1] - 1, lastFlightDepartureDateParts[0]);
                  flightNext.setDate(flightNext.getDate() + 1);
                  var flightNextDay = ("0" + flightNext.getDate()).slice(-2); // two digits format
                  var flightNextMonth = ("0" + (flightNext.getMonth() + 1)).slice(-2); // two digits format

                  var maxDate = flight.getFullYear() - 130 + '-' + flightMonth + '-' + flightDay;
                  var minDate = flight.getFullYear() - 12 + '-' + flightMonth + '-' + flightDay;

                  // iterate over adult date fields and initialize data
                  self.element.find(".byear_input_adult").each(function () {
                        var targetInput = $(this).attr("data-input-target");

                        if ($(this).closest('.process_step').attr('data-step') == 'confirm') {
                              ComboDates.fillData(
                                    self.element.find("." + targetInput + ".bday_input"),
                                    self.element.find("." + targetInput + ".bmonth_input"),
                                    self.element.find("." + targetInput + ".byear_input_adult"),
                                    maxDate,
                                    minDate
                              );
                        } else {
                              ComboDates.fillData(
                                    self.element.find("." + targetInput + ".bday_input_adult"),
                                    self.element.find("." + targetInput + ".bmonth_input_adult"),
                                    self.element.find("." + targetInput + ".byear_input_adult"),
                                    maxDate,
                                    minDate
                              );
                        }
                  });

                  // iterate over kid date fields and initialize data
                  self.element.find(".byear_input_kid").each(function () {
                        var targetInput = $(this).attr("data-input-target");

                        var maxDate = flightNext.getFullYear() - 12 + '-' + flightNextMonth + '-' + flightNextDay;
                        var minDate = flight.getFullYear() - 2 + '-' + flightMonth + '-' + flightDay;

                        ComboDates.fillData(
                              self.element.find("." + targetInput + ".bday_input_kid"),
                              self.element.find("." + targetInput + ".bmonth_input_kid"),
                              self.element.find("." + targetInput + ".byear_input_kid"),
                              maxDate,
                              minDate
                        );
                  });

                  // iterate over baby date fields and initialize data
                  self.element.find(".byear_input_baby").each(function () {
                        var targetInput = $(this).attr("data-input-target");

                        var maxDate = flightNext.getFullYear() - 2 + '-' + flightNextMonth + '-' + flightNextDay;
                        var minDate = yesterday.getFullYear() + '-' + yesterdayMonth + '-' + yesterdayDay;

                        ComboDates.fillData(
                              self.element.find("." + targetInput + ".bday_input_baby"),
                              self.element.find("." + targetInput + ".bmonth_input_baby"),
                              self.element.find("." + targetInput + ".byear_input_baby"),
                              maxDate,
                              minDate
                        );
                  });

                  var dayFormElement = self.element.find(".register_form .bday");
                  var monthFormElement = self.element.find(".register_form .bmonth");
                  var yearFormElement = self.element.find(".register_form .byear");

                  ComboDates.fillData(
                        dayFormElement,
                        monthFormElement,
                        yearFormElement,
                        maxDate,
                        minDate
                  );

                  self.element.find('.date_birthday_input').on('change', function () {
                        var dayValue = self.element.find(".bday").val();
                        var monthValue = self.element.find(".bmonth").val();
                        var yearValue = self.element.find(".byear").val();

                        /* If age selected is under 18, show cepsa checkbox */
                        var userDate = yearValue + '-' + monthValue + '-' + dayValue;

                        if (self.calcularEdad(userDate) >= 18) {
                              self.element.find('#cepsa_checkout').removeClass('hidden');
                        } else {
                              self.element.find('#cepsa_checkout').addClass('hidden');
                        }
                  });

                  // iterate over all hidden date fields and update combo values if hidden data is set
                  self.element.find("[id$='_birthdate']").each(function () {
                        if ($(this).val() != "") {
                              var targetId = $(this).attr("id");

                              var dateParts = $("#" + targetId).val().split("/");

                              self.element.find('.' + targetId + '.byear').val(dateParts[2]).trigger('change', [true]);
                              self.element.find('.' + targetId + '.bmonth').val(dateParts[1]).trigger('change', [true]);
                              self.element.find('.' + targetId + '.bday').val(dateParts[0]).trigger('change', [true]);
                        };
                  });

                  // add listeners to update hidden date value when any of the combos changes
                  ComboDates.addListeners(self.element, "date_birthday_input", "byear", "bmonth", "bday");
            },

            calcularEdad: function (userDateString) {
                  var today = moment();
                  var userDate = moment(userDateString, "YYYY-MM-DD");

                  var userYears = today.diff(userDate, 'years', true);

                  return userYears;
            },

            showNotificationsTwitterCheckout: function(){

                  var divLoginTwitter = this.element.find('.twitter_sharing');
                    
                  //Data in JSImport to know if Twitter Social Login was already executed
                  // If so, we do not show Social Login option and show notifications.
                  // Same behaviour, if customer is already following AirEuropa Twitter account. 
                  if(executed){

                    var imageTwitter = this.element.find('div.content_foto_name img');
                    var imageUrl = "https://twitter.com/" + customerScreenName + "/profile_image?size=mini";
                    imageTwitter.attr('src', imageUrl);

                    var nameTwitter = this.element.find('div.content_foto_name .name');
                    nameTwitter.html(customerName);

                    var aliasTwitter = this.element.find('div.content_foto_name .alias');
                    aliasTwitter.html('@' + customerScreenName);

                      //Data in JSImport
                      if (following){
                          //Mostrar paso 3 
                          divLoginTwitter.removeClass('step_one step_two');
                          divLoginTwitter.addClass('step_three');         
                      } else {
                        //mostrar paso 2
                          divLoginTwitter.removeClass('step_one');
                          divLoginTwitter.addClass('step_two');

                       
                      }

                            
                  } else {
                    var content_info = this.element.find('div.sharing_text .content_info');
                    content_info.addClass('no_foto');
                    
                    var buttom = this.element.find('.sharing_button_checkout');
                  }
            },


                listenTwitterButton: function(unbind){
                    //paso 1 - login

                    var buttonClicked = this.element.find('div.sharing_button_checkout.one button');


                    if (typeof unbind !== 'undefined' && unbind === true) {
                        buttonClicked.unbind('click');
                    }

                    buttonClicked.on('click', function (event) {
                      event.preventDefault();
                      Bus.publish('services', 'loginTwitterOAuthCheckout', {
                            data: window.location.href,
                            success: function (data) {
                                window.location.href = data.authURL;

                            }
                      });

                    });
                  },

    listenFollowUsTwitterButtom: function(unbind){
      //Paso 2 - seguir a aireuropa
      var divLoginTwitter = this.element.find('.twitter_sharing');
      var buttonClicked = this.element.find('div.sharing_button_checkout.two button');
      var noFoto = this.element.find('div.content_info');
      noFoto.removeClass('no_foto');
      var self = this;
      if (typeof unbind !== 'undefined' && unbind === true) {
          buttonClicked.unbind('click');
      }

      buttonClicked.on('click', function (event) {
        event.preventDefault();

            Bus.publish('services', 'followUsTwitterCheckout', {
                  success: function (data) {   

                    if (data === true){
                        //Mostrar paso 3
                        divLoginTwitter.removeClass('step_one step_two');
                        divLoginTwitter.addClass('step_three');
                        var noFoto = this.element.find('div.content_info');
                        noFoto.removeClass('no_foto'); 
                      
                      }else{

                        /* Show popup error */
                        $('body').ui_dialog({
                          title: lang('general.error_title'),
                          error: true,
                          subtitle: lang('twitter.error_message'),
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
                        divLoginTwitter.removeClass('step_two step_three');
                        divLoginTwitter.addClass('step_one');
                        var content_info = self.element.find('div.sharing_text .content_info');
                        content_info.addClass('no_foto');

                        var buttom = this.element.find('.sharing_button_checkout');

                      }               
                  }             
            });
          
        });
    },

    listenNotificationsTwitterButton: function(unbind){
      //Paso 3 - Recibir infomacion vuelo
      var divLoginTwitter = this.element.find('.twitter_sharing');
      var buttonClicked = this.element.find('div.sharing_button_checkout.three button');

      var self = this;

      if (typeof unbind !== 'undefined' && unbind === true) {
          buttonClicked.unbind('click');
      }

      buttonClicked.on('click', function (event) {
        event.preventDefault();

         

            //Check if customer is following @AirEuropa
            Bus.publish('services', 'followingUsTwitterCheckin', {
                success: function (data) {
  
                  if (data === true){
                      //Data in JSImport
                      following = data;

                      self.callNotificationsTwitter();  

                  }else{

                    /* Show popup info */
                    $('body').ui_dialog({
                      title: lang('general.info_error_title'),
                      error: false,
                      close:  {
                        behaviour: 'close',
                        href: '#'
                      },
                      subtitle: lang('twitter.info_follow_us_message'),
                      buttons: [
                        {
                          className: 'close',
                          href: '#',
                          label: lang('general.ok')
                        }
                      ]
                    });
                    divLoginTwitter.removeClass('step_one step_three');
                    divLoginTwitter.addClass('step_two');

                  }
                } 

            });           
      });
    },

            callNotificationsTwitter: function () {
                  // debugger;
                  var self = this;
                  var numFlightsOneWay = 0;
                  var numFlightsReturn = 0;

                  // console.log('self', self)

                  //Calculate nummber of journeys, one way and return to register for twitter notifications
                  if (self.h72FormCache.booking.journey.oneWayFlights) {

                        numFlightsOneWay = self.h72FormCache.booking.journey.oneWayFlights.length;
                  }

                  if (self.h72FormCache.booking.journey.returnFlights) {

                        numFlightsReturn = self.h72FormCache.booking.journey.returnFlights.length;
                  }


                  //Number of calls done and calls returned ok.
                  var numOks = 0;
                  var numCalls = 0;

                  //Flights one way
                  for (var i = 0; i < numFlightsOneWay; i++) {

                        //Object with one way flight data needed to call twitter notifications service.
                        var flightObjectOneWay = {};

                        flightObjectOneWay['flightCode'] = self.h72FormCache.booking.journey.oneWayFlights[i].number;
                        flightObjectOneWay['departureDate'] = self.h72FormCache.booking.journey.oneWayFlights[i].dateDeparture;
                        flightObjectOneWay['arrivalDate'] = self.h72FormCache.booking.journey.oneWayFlights[i].dateArrival;
                        flightObjectOneWay['departureAirport'] = self.h72FormCache.booking.journey.oneWayFlights[i].airportDeparture.code;
                        flightObjectOneWay['arrivalAirport'] = self.h72FormCache.booking.journey.oneWayFlights[i].airportArrival.code;

                        Bus.publish('services', 'notificationsTwitterCheckout', {
                              data: flightObjectOneWay,
                              success: function (data) {

                                    ++numCalls;

                                    if (data.statusCode === '200') {

                                          ++numOks;

                                    } else {

                                          --numOks;
                                    }
                              }
                        });
                  }

                  //Flights return
                  for (var j = 0; j < numFlightsReturn; j++) {

                        //Object with one way flight data needed to call twitter notifications service.
                        var flightObjectReturn = {};

                        flightObjectReturn['flightCode'] = self.h72FormCache.booking.journey.returnFlights[j].number;
                        flightObjectReturn['departureDate'] = self.h72FormCache.booking.journey.returnFlights[j].dateDeparture;
                        flightObjectReturn['arrivalDate'] = self.h72FormCache.booking.journey.returnFlights[j].dateArrival;
                        flightObjectReturn['departureAirport'] = self.h72FormCache.booking.journey.returnFlights[j].airportDeparture.code;
                        flightObjectReturn['arrivalAirport'] = self.h72FormCache.booking.journey.returnFlights[j].airportArrival.code;

                        Bus.publish('services', 'notificationsTwitterCheckout', {
                              data: flightObjectReturn,
                              success: function (data) {

                                    ++numCalls;

                                    if (data.statusCode === '200') {

                                          ++numOks;

                                    } else {

                                          --numOks;
                                    }
                              }
                        });
                  }

                  //Function to wait calls done and check if they are ok to hide and show each component.
                  var checkComplete = function () {

                        if (numCalls === (numFlightsOneWay + numFlightsReturn)) {
                              if (numOks === (numFlightsOneWay + numFlightsReturn)) {

                                    var buttonClicked = self.element.find('div.sharing_button_checkout');

                                    buttonClicked.hide();

                              } else {

                                    /* Show popup error */
                                    $('body').ui_dialog({
                                          title: lang('general.error_title'),
                                          error: true,
                                          subtitle: lang('twitter.error_message'),
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

                        } else {
                              setTimeout(checkComplete, 100);
                        }
                  }

                  checkComplete();

            },
      };
});

