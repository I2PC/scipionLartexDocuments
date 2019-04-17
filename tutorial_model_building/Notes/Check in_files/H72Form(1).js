Hydra.module.register('H72FormController', function(Bus, Module, ErrorHandler, Api) {
   return {
      selector: '#process',
      element: undefined,

      /* Results helpers */
      finishedLoadingBar: false,
      finishedHtmlLoad: false,

      /* Results cache */
      resultsData: undefined,
      /* Cache the last data results */
      resultsTemplate: undefined,
      /* Cache the last template results */

      /* H72 cache */
      h72FormCache: {},

      events: {
         'process': {
            'show_h72form': function(oNotify) {
               this.showH72form();
            },
            'show_h72form_deeplink': function(oNotify) {
               this.showH72FormDeeplink(oNotify.locator, oNotify.surname);
            },
            'show_h72form_step': function(oNotify) {
               if (oNotify.step == 'payment' ||
                  oNotify.step == 'confirm') {
                  var self = this;
                  this.callToServices(oNotify.step, function() {
                     self.showH72FormStep(oNotify.step);
                  });

                  if (window.warningBookingIntervalId) {
                     clearTimeout(window.warningBookingIntervalId);
                  }
               }
            },
            'get_h72_data': function(oNotify) {
               this.getH72Data(oNotify.callback);
            }
         }
      },

      init: function() {
         /* Save jquery object reference */
         this.element = $(this.selector);
      },

      getH72Data: function(callback) {
         callback(this.h72FormCache);
      },

      processPaymentMethods: function() {
         var self = this;
         /* Save payment methods info */
         var passengerList = self.h72FormCache.data.passengers;
         var paymentMethodList = self.h72FormCache.data.methods;

         $.each(paymentMethodList, function(paymentMethodIndex, paymentMethodInfo) {
            /* Save in array all document types that are available in current payment method */
            var availableDocumentTypeList = [];
            $.each(paymentMethodInfo.documentTypes, function(documentTypeIndex, documentTypeInfo) {
               availableDocumentTypeList.push(documentTypeInfo.code);
            });

            /* Save in array all passengers whose document type is available in current payment method */
            var availablePassengerList = [];
            $.each(passengerList, function(passengerIndex, passengerInfo) {
               var documentCode = passengerInfo.identificationDocument.documentType.code;

               if (($.inArray(documentCode, availableDocumentTypeList) != -1) && (passengerInfo.passengerType == 'ADULT')) {
                  passengerInfo.passengerIndex = passengerIndex;
                  availablePassengerList.push(passengerInfo);
               }
            });

            paymentMethodList[paymentMethodIndex]['availablePassengers'] = availablePassengerList;
         });

      },

      /* H72Form process */
      showH72form: function() {
         var self = this;
         var h72formProcessURL = getProcessUrl('form_h72');

         /* Prepare the process */
         Bus.publish('process', 'start', {
            process: 'h72',
            screenName: 'form'
         });

         /* Make the search form active */
         this.element.find('.search_form[data-process-name=h72]').addClass('active');

         /* Make the search visible */
         this.element.find('#search').addClass('visible');

         /* Make the search visible */
         setTimeout(function() { /* Needed because the transition callback doesn't fire properly on webkit */
            $('body').addClass('processing');
            self.element.find('#search').addClass('finished');
         }, 400);

         /* Show form title */
         this.element.find('.search_form[data-process-name=h72]').find('.search_form_title.h72').show();

         /* Add the process start flag */
         this.element.find('.search_form[data-process-name=h72]').attr('data-process-start', 'h72');

         /* Activate links */
         $('a[data-process=h72]').closest('p, li').addClass('active');

         /* Append h72 close if it isn't defined */
         if (this.element.find('#search .search_form .h72_close').length == 0) {
            this.element.find('#search .search_form').append('<div class="h72_close"><p><a href="/"><span>Cerrar</span></a></p></div>');
         }

         /* If the user is viewing any processing level */
         if ($('body').hasClass('processing')) {
            /* Animate process wrapper to show the search */
            this.element.find('.process_page_wrapper').animate({
               'top': '0'
            }, 500, 'easeInOutExpo', function() {
               self.element.find('.process_page.h72').remove();
            });
         }

         /* Update Google Tag Manager */
         updateGtm({
            'mercado': window.market,
            'pageArea': 'Mis vuelos',
            'pageCategory': 'Buscador H72',
            'pageContent': 'Localizar vuelo'
         });
      },

      showH72FormDeeplink: function(locator, surname) {
         //console.log('showH72FormDeeplink', locator, surname);

         var self = this;

         /* Prepare the process */
         Bus.publish('process', 'start', {
            process: 'h72',
            screenName: 'form'
         });

         /* Make the search form active */
         this.element.find('.search_form[data-process-name=h72]').addClass('active');

         /* Make the search visible */
         this.element.find('#search').addClass('visible');

         /* Make the search visible */
         setTimeout(function() { /* Needed because the transition callback doesn't fire properly on webkit */
            $('body').addClass('processing');
            self.element.find('#search').addClass('finished');
         }, 400);

         /* Show form title */
         this.element.find('.search_form[data-process-name=h72]').find('.search_form_title.h72').show();

         /* Add the process start flag */
         this.element.find('.search_form[data-process-name=h72]').attr('data-process-start', 'h72');

         /* Activate links */
         $('a[data-process=h72]').closest('p, li').addClass('active');

         /* Append checkin close if it isn't defined */
         if (this.element.find('#search .search_form .close').length == 0) {
            this.element.find('#search .search_form').append('<div class="close"><p><a href="/"><span>Cerrar</span></a></p></div>');
         }

         /* If the user is viewing any processing level */
         if ($('body').hasClass('processing')) {
            /* Animate process wrapper to show the search */
            this.element.find('.process_page_wrapper').animate({
               'top': '0'
            }, 500, 'easeInOutExpo', function() {
               self.element.find('.process_page.h72').remove();
            });
         }

         /* Update Google Tag Manager */
         updateGtm({
            'mercado': window.market,
            'pageArea': 'Mis vuelos',
            'pageCategory': 'Buscador H72',
            'pageContent': 'Localizar vuelo'
         });

         //add data form
         var $form = this.element.find('#search .search_form.active');

         $form.find('.reserve_field input').val(locator).trigger('validate');
         $form.find('.text_field input').val(surname).trigger('validate');

         //Submit form
         $('.search_form.active').find('form.h72_payment .submit_button button').click();
      },

      showH72FormStep: function(step) {

         var self = this;
         var dataToTemplate = self.h72FormCache;

         /* Prepare the process */
         Bus.publish('process', 'start', {
            process: 'h72',
            screenName: 'results'
         });

         /* If the page already exists from results page, don't need to create it */
         if (this.element.find('.process_page.h72').length > 0) { /* Download template and append process_scroll and process_bottom_bar */

            if (this.element.find('.process_page.h72 .process_scroll').length == 0) {
               /* Get the structure template */
               Bus.publish('ajax', 'getTemplate', {
                  data: dataToTemplate,
                  path: AirEuropaConfig.templates.h72.structure,
                  success: function(html) {
                     var $html = $(html);

                     /* Append the new page to the process */
                     self.element.find('.process_page.h72 .process_wrapper_content').append($html.find('.process_scroll'));
                     self.element.find('.process_page.h72 .process_wrapper_content').append($html.find('.process_bottom_bar'));
                     self.element.find('.process_page.h72 .process_wrapper_content').append($html.find('.h72_overlay'));
                     /* Proload flights */
                     self.prepareH72Structure(step);
                  }
               });
            } else {
               this.prepareH72Structure(step);
            }
         } else { /* Download template and append it */
            /* Create new process page */
            var $newPage = $('<div class="process_page h72"></div>');

            /* Get the structure template */
            Bus.publish('ajax', 'getTemplate', {
               data: dataToTemplate,
               path: AirEuropaConfig.templates.h72.structure,
               success: function(html) {
                  /* Append the template to the new page */
                  $newPage.append(html);
                  $newPage.find('.process_wrapper_content').addClass('loading');

                  /* Append the new page to the process */
                  self.element.find('.process_page_wrapper').append($newPage);

                  /* Proload flights */
                  self.prepareH72Structure(step); 
               }
            });
         }
         
      },

      prepareH72Structure: function(step) {

         var self = this;
         var offsetTop = this.element.find('.process_page.h72').index() * 100 * -1;

         /* Check if the process_page_wrapper is already at 100%, so we don't need to animate it */
         if (false && this.element.find('.process_page_wrapper').attr('data-view') == 'h72') {
            this.loadH72Form(step);
         } else { /* Animate process wrapper to show the new page */
            this.element.find('.process_page_wrapper').animate({
               'top': offsetTop + '%'
            }, 500, 'easeInOutExpo', function() {
               self.loadH72Form(step);
            });
         }
      },

      loadH72Form: function(step) {
         var self = this;

         this.finishedHtmlLoad = false;
         this.finishedLoadingBar = false;

         /* Add checkin view flag */
         this.element.find('.process_page_wrapper').attr('data-view', '').attr('data-view', 'h72');

         /* Call to services */
         this.callToServices(step);

         /* Global checkout warning booking listener */
         checkWarningBookingMessage(self.h72FormCache.warningBookingLimit, lang('general.booking_limit_message'));

         /* Animate searching bar */
         self.element.find('.loading_topbar').not('.process_scroll .loading_topbar').animate({
            'margin-left': '0'
         }, 400, 'linear', function() {});

         self.element.find('.searching_bar').not('.process_scroll .searching_bar').animate({
            'width': '100%'
         }, 2000, 'easeInOutExpo', function() {

            /* Finished the load bar */
            self.finishedLoadingBar = true;

            /* Show blinking dot */
            self.element.find('.loading_content .spinner').show();
            self.element.find('.loading_content .text_spinner').show();

            if (self.finishedHtmlLoad && self.finishedLoadingBar) {
               self.finishedLoadingBar = false;
               self.appendH72Form(step);
            }
         });
      },

      appendH72Form: function(step) {
         var self = this;
         var after, movingStepsPosition, newStepsPosition;
         var $process_scroll = self.element.find('.process_scroll');

         // console.log('self.h72FormCache', self.h72FormCache);

         /* Render the template */
         var renderedHtml = self.resultsTemplate(self.h72FormCache);
         var $renderedHtml = $(renderedHtml);

         /* Get the template partials */
         var $top_bar = $renderedHtml.find('.process_top_bar');
         var $step = $renderedHtml.find('.process_step');
         var $bottom_bar = $renderedHtml.find('.process_bottom_bar');
         var $currentStep = self.element.find('.process_step');
         var $prices = $renderedHtml.find('.process_content > .prices');

         /* Step stuff, get the new step number and the current one */
         var stepNumber = parseInt($step.attr('data-order'));
         var currentStepNumber = parseInt($currentStep.attr('data-order'));
         var showExitAnimation = false;
         var direction = 'top';

         /* 1) Bottom bar */

         /* Add the new class to change height and background color */
         self.element.find('.process_bottom_bar').removeClass('final normal').addClass($bottom_bar.attr('data-class'));

         /* Change bottom bar if it's defined */
         if ($bottom_bar.length > 0) {
            /* Destroy the content and put the new one */
            self.element.find('.process_bottom_bar .bottom_bar_content').hide();

            /* Append the new bar content */
            self.element.find('.process_bottom_bar').append($bottom_bar.find('.bottom_bar_content').hide().fadeIn());
         } else {
            self.element.find('.process_bottom_bar .bottom_bar_content.final').hide();
            self.element.find('.process_bottom_bar .bottom_bar_content').not('.final').fadeIn();
         }

         /* Update the status bar */
         self.element.find('.breadcrumb .steps li').removeClass('active done');
         self.element.find('.breadcrumb .steps .' + step).addClass('active');
         setTimeout(function() {
            self.element.find('.breadcrumb .steps .' + step).prevAll().addClass('done');
         }, 0);

         /* 2) Content step */

         /* Add a class to #h72 */
         self.element.find('#h72').attr('class', '').addClass(step);

         if (self.element.find('.process_page.checkout .process_content > .prices').length == 0) {
            var container = self.element.find('.process_page.h72 .process_content');
            container.append($prices);
         }

         /* h72 content full flag */
         if ($renderedHtml.hasClass('full')) {
            self.element.find('.process_wrapper_content').addClass('full');
         } else {
            setTimeout(function() {
               self.element.find('.process_wrapper_content').removeClass('full');
            }, 1520);

         }

         /* If the element doesn't exist */
         if (self.element.find('.process_step.' + step).length == 0) {

            /* Hide step to append it hidden */
            $step.hide();

            /* Figure out if the new step is after or before */
            after = (stepNumber > currentStepNumber);

            /* Append step - First load, no previous step loaded */
            if ($currentStep.length == 0) {
               self.element.find('.process_steps').append($step);
               showExitAnimation = false;
            }

            /* After first load */
            else {
               showExitAnimation = (self.element.find('.process_scroll').attr('data-exit-animation-shown') != 'true');
               if (after) {
                  self.element.find('.process_steps').append($step);
                  direction = 'top';
               } else {
                  self.element.find('.process_steps').prepend($step);
                  direction = 'bottom';
               }
            }

            /* Initialize steps widget */
            self.element.find('.process_scroll').steps();

            /* The user comes directly from URL change (broswer arrows or click on breadcrumb) so we have
            to show the exit animation of the current step. In the other case, the exit animation was shown
            in the submit event*/
            if (showExitAnimation) {

               self.element.find('.process_scroll').steps('showLoading', function() { /* Exit animation */

                  /* 3) Top bar - Change the topbar when the plane bar is covering it */
                  /* Add the new class to change height and background color */
                  var topBarClassName = $top_bar.attr('data-class');
                  self.element.find('.process_top_bar').removeClass('warning normal confirm').addClass(topBarClassName);

                  /* Append top_bar if there's a new topbar in the incoming content */
                  if ($top_bar.length > 0) {
                     /* If there's no top bar, append the current one */
                     if (self.element.find('.process_top_bar').length == 0) {
                        self.element.find('.process_wrapper_content .process_scroll').prepend($top_bar);
                     }
                     /* If there's a top bar, check if it's new or already exists */
                     else {
                        if (self.element.find('.process_top_bar .top_bar_content.' + topBarClassName).length == 0) {
                           /* Destroy the content and put the new one */
                           self.element.find('.process_top_bar .top_bar_content').hide();

                           /* Append the new bar content */
                           self.element.find('.process_top_bar').append($top_bar.find('.top_bar_content'));
                        } else {
                           /* Destroy the content and show the new one */
                           self.element.find('.process_top_bar .top_bar_content').hide();
                           self.element.find('.process_top_bar .top_bar_content.' + topBarClassName).show();
                        }
                     }
                  }

                  self.element.find('.process_scroll').steps('showNextStep', function() { /* Enter animation */
                     /* Remove current step */
                     $currentStep.remove();

                     /* Fadeout the process_page_loading if it's visible */
                     self.element.find('.loading_content').fadeOut(800, function() {
                        self.element.find('.process_wrapper_content').removeClass('loading local_loading');
                        self.element.find('.loading_content').attr('style', '');
                     });

                     /* Init checkin process */
                     Bus.publish('h72', 'custom_init');
                  }, after, $step, $currentStep);
               }, direction);
            }
            /* The exit animation was shown in the submit event, so we just need to execute the enter
            animation for the next step */
            else {

               /* 3) Top bar - Change the topbar when the plane bar is covering it */
               /* Add the new class to change height and background color */
               var topBarClassName = $top_bar.attr('data-class');
               self.element.find('.process_top_bar').removeClass('warning normal confirm').addClass(topBarClassName);

               /* Append top_bar if there's a new topbar in the incoming content */
               if ($top_bar.length > 0) {
                  /* If there's no top bar, append the current one */
                  if (self.element.find('.process_top_bar').length == 0) {
                     self.element.find('.process_wrapper_content .process_scroll').prepend($top_bar);
                  }
                  /* If there's a top bar, check if it's new or already exists */
                  else {
                     self.element.find('.process_top_bar .top_bar_content').remove();

                     /* Append the new bar content */
                     self.element.find('.process_top_bar').append($top_bar.find('.top_bar_content'));

                  }
               }

               self.element.find('.process_scroll').steps('showNextStep', function() { /* Enter animation */
                  /* Remove current step */
                  $currentStep.remove();

                  /* Fadeout the process_page_loading if it's visible */
                  self.element.find('.loading_content').fadeOut(800, function() {
                     self.element.find('.process_wrapper_content').removeClass('loading local_loading');
                     self.element.find('.loading_content').attr('style', '');
                  });

                  if (step == 'confirm') {
                        self.loadEuropcarTemplate()
                  }

                  /* Init checkin process */
                  Bus.publish('h72Form', 'custom_init');
               }, after, $step, $currentStep);
            }

         }

         
      },

      loadEuropcarTemplate: function() {
            var self = this;
            if (false && window.dynamic_europcar) {
                  var sessionId = self.element.find('.process_step').attr('data-sessionId')
                  // console.log('sessionId', sessionId)
                  Bus.publish('services', 'getH72EuropCarAutos', {
                        sessionId: sessionId,
                        success: function (europCarAutos) {
                              // console.log('europCarAutos', europCarAutos)
                              if (!europCarAutos.header.error) {
                                    self.checkoutCache['serviceEuropCarAutos'] = europCarAutos.body.data;

                                    Bus.publish('ajax', 'getTemplate', {
                                          path: AirEuropaConfig.templates.checkout.banner_dinamico_europcar,
                                          success: function (template) {
                                                var renderedHtmlBanner = template($.extend(true, {}, self.checkoutCache));
                                                var $renderedHtmlBanner = $(renderedHtmlBanner);
                                                var $europcarContainer = self.element.find('.checkout_block.europcar_container');
                                                $europcarContainer.append($renderedHtmlBanner);

                                                /* Init swiper banner europcar */
                                                Bus.publish('checkout', 'init_swiper');
                                          }
                                    });

                              } else {
                                    //Error service "Cross Selling no disponible",
                                    Bus.publish('ajax', 'getTemplate', {
                                          path: AirEuropaConfig.templates.checkout.banner_fijo_europcar,
                                          success: function (template) {
                                                var renderedHtmlBanner = template($.extend(true, {}, self.checkoutCache));
                                                var $renderedHtmlBanner = $(renderedHtmlBanner);
                                                var $europcarContainer = self.element.find('.checkout_block.europcar_container');
                                                $europcarContainer.append($renderedHtmlBanner);

                                          }
                                    });
                              }

                        }
                  });

            } else {
                  //Banner static
                  Bus.publish('ajax', 'getTemplate', {
                        path: AirEuropaConfig.templates.checkout.banner_fijo_europcar,
                        success: function (template) {
                              var renderedHtmlBanner = template($.extend(true, {}, self.checkoutCache));
                              var $renderedHtmlBanner = $(renderedHtmlBanner);
                              var $europcarContainer = self.element.find('.checkout_block.europcar_container');
                              $europcarContainer.append($renderedHtmlBanner);

                        }
                  });

            }

      },

      callToServices: function(step, cb) {
         var self = this;
         var jsonPath = getServiceURL('h72_payment.session');
         var templatePath = eval('AirEuropaConfig.templates.h72.' + step);
         var temporalH72FormCacheServices = {};

         /* Call AJAX module to get the results json */
         Bus.publish('ajax', 'getJSON', {
            path: jsonPath,
            success: function(data) {
               if (data) {

                  /* Check data checkin parent object */
                  if (data.h72) {
                     data = data.h72;

                     /* If there isn't a session */
                     if (data.bookingId) {

                        self.loadH72FormData(function() {

                           /* Cache services */
                           self.temporalH72FormCacheServices = self.h72FormCache['services'];
                           self.h72FormCache = data;

                           /* If there are results, ask for template */
                           if (data.passengers) {

                              /* Order and calc flights */
                              if (step == 'payment') {
                                 self.h72FormCache = data;
                                 self.h72FormCache['services'] = self.temporalH72FormCacheServices;
                                 self.processPaymentMethods();
                                 self.loadH72FormTemplate(templatePath, step);
                              } else if (step == 'confirm') {
                                 self.h72FormCache = data;
                                 self.loadH72FormTemplate(templatePath, step);
                              }
                           }

                           /* If there are no results, go back to the search */
                           else {
                              /* Back to search */
                              self.backToSearch();
                           }

                           /* Update GTM */
                           if (step == "payment") {

                              updateGtm({
                                 'mercado': window.market,
                                 'pageArea': 'Mis vuelos',
                                 'pageCategory': 'H72',
                                 'pageContent': 'Pago'
                              });

                           }

                        });

                     } else {
                        /* Back to home */
                        Bus.publish('process', 'kill');
                     }

                  }

               } else { /* If there is not data, kill proccesses and back to home */
                  /* Back to home */
                  Bus.publish('process', 'kill');
               }

               if (cb !== undefined)
                  cb();
            }
         });
      },

      loadH72FormData: function(callback) {

         var self = this;

         Bus.publish('services', 'getH72PaymentLists', {
            success: function(listsData) {
               self.h72FormCache['services'] = listsData;
               callback();
            }
         });
      },

      //Load checkin template
      loadH72FormTemplate: function(templatePath, step) {

         var self = this;

         /* Get the template */
         Bus.publish('ajax', 'getTemplate', {
            path: templatePath,
            success: function(template) {
               self.finishedHtmlLoad = true;
               self.resultsTemplate = template;

               if (self.finishedHtmlLoad && self.finishedLoadingBar) {
                  self.finishedHtmlLoad = false;
                  self.appendH72Form(step);
               }
            }
         });
      }

   };
});
