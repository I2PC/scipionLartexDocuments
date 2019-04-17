Hydra.module.register('PmrFormController', function(Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#process',
    element: undefined,

    /* Results helpers */
    finishedLoadingBar: false,
    finishedHtmlLoad: false,

    /* Results cache */
    resultsData: undefined, /* Cache the last data results */
    resultsTemplate: undefined, /* Cache the last template results */

    /* Pmr cache */
    pmrFormCache: {},


    events: {
      'process': {
        'show_pmrform': function(oNotify) {
          this.showPmrform();
        },
        'show_pmrform_deeplink': function(oNotify) {
          this.showPmrFormDeeplink(oNotify.locator, oNotify.surname);
        },
        'show_pmrform_step': function(oNotify) {
          if (oNotify.step == 'passengers' ||
            oNotify.step == 'confirm' ) {
            this.showPmrFormStep(oNotify.step);

            if (window.warningBookingIntervalId) {
              clearTimeout(window.warningBookingIntervalId);
            }
          }
        },
        'init_passengers_step': function() {
          this.initPassengersStep();
        },
        'get_pmr_data': function(oNotify) {
          this.getPmrData(oNotify.callback);
        }
      }
    },

    init: function() {
      /* Save jquery object reference */
      this.element = $(this.selector);
    },

    initPassengersStep: function() {
      this.showPmrformStep();
    },

    getPmrData: function(callback) {
      callback(this.pmrFormCache);
    },

    /* PmrForm process */
    showPmrform: function() {
      var self = this;
      var pmrformProcessURL = getProcessUrl('form_pmr');

      /* Prepare the process */
      Bus.publish('process', 'start', {process: 'pmr', screenName: 'form'});

      /* Make the search form active */
      this.element.find('.search_form[data-process-name=pmr]').addClass('active');

      /* Make the search visible */
      this.element.find('#search').addClass('visible');

      /* Make the search visible */
      setTimeout(function() { /* Needed because the transition callback doesn't fire properly on webkit */
        $('body').addClass('processing');
        self.element.find('#search').addClass('finished');
      }, 400);

      /* Show form title */
      this.element.find('.search_form[data-process-name=pmr]').find('.search_form_title.pmr').show();

      /* Add the process start flag */
      this.element.find('.search_form[data-process-name=pmr]').attr('data-process-start', 'pmr');

      /* Activate links */
      $('a[data-process=pmr]').closest('p, li').addClass('active');

      /* Append pmr close if it isn't defined */
      if (this.element.find('#search .search_form .close').length == 0) {
        this.element.find('#search .search_form').append('<div class="close"><p><a href="/"><span>Cerrar</span></a></p></div>');
      }

      /* If the user is viewing any processing level */
      if ($('body').hasClass('processing')) {
        /* Animate process wrapper to show the search */
        this.element.find('.process_page_wrapper').animate({
          'top': '0'
        }, 500, 'easeInOutExpo', function() {
          self.element.find('.process_page.pmr').remove();
        });
      }

      /* Update Google Tag Manager */
      updateGtm({
        'mercado': window.market,
        'pageArea': 'Mis vuelos',
        'pageCategory': 'Buscador Pmr',
        'pageContent': 'Localizar vuelo'
      });
    },

    showPmrFormDeeplink: function(locator, surname) {
      var self = this;

      /* Prepare the process */
      Bus.publish('process', 'start', {process: 'pmr', screenName: 'form'});

      /* Make the search form active */
      this.element.find('.search_form[data-process-name=pmr]').addClass('active');

      /* Make the search visible */
      this.element.find('#search').addClass('visible');

      /* Make the search visible */
      setTimeout(function() { /* Needed because the transition callback doesn't fire properly on webkit */
        $('body').addClass('processing');
        self.element.find('#search').addClass('finished');
      }, 400);

      /* Show form title */
      this.element.find('.search_form[data-process-name=pmr]').find('.search_form_title.pmr').show();

      /* Add the process start flag */
      this.element.find('.search_form[data-process-name=pmr]').attr('data-process-start', 'pmr');

      /* Activate links */
      $('a[data-process=pmr]').closest('p, li').addClass('active');

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
          self.element.find('.process_page.pmr').remove();
        });
      }

      /* Update Google Tag Manager */
      updateGtm({
        'mercado': window.market,
        'pageArea': 'Mis vuelos',
        'pageCategory': 'Buscador Checkin',
        'pageContent': 'Localizar vuelo'
      });

      //add data form
      var $form = this.element.find('#search .search_form.active');

      $form.find('.reserve_field input').val(locator).trigger('validate');
      $form.find('.text_field input').val(surname).trigger('validate');

      //Submit form
      $('.search_form.active').find('form.pmr_form .submit_button button').click();
    },

    showPmrFormStep: function(step) {
      //if (typeof(step)=='undefined') step = 'passengers';
      var self = this;
      var dataToTemplate = {};

      /* Prepare the process */
      Bus.publish('process', 'start', {process: 'pmr', screenName: 'results'});

      /* If the page already exists from results page, don't need to create it */
      if (this.element.find('.process_page.pmr').length > 0) { /* Download template and append process_scroll and process_bottom_bar */

        if (this.element.find('.process_page.pmr .process_scroll').length == 0) {
          /* Get the structure template */
          Bus.publish('ajax', 'getTemplate', {
            data: dataToTemplate,
            path: AirEuropaConfig.templates.pmr.structure,
            success: function(html) {
              var $html = $(html);

              /* Append the new page to the process */
              self.element.find('.process_page.pmr .process_wrapper_content').append($html.find('.process_scroll'));
              self.element.find('.process_page.pmr .process_wrapper_content').append($html.find('.process_bottom_bar'));
              self.element.find('.process_page.pmr .process_wrapper_content').append($html.find('.pmr_overlay'));
              /* Proload flights */
              self.preparePmrStructure(step);
            }
          });
        }
        else {
          this.preparePmrStructure(step);
        }

      }
      else { /* Download template and append it */
        /* Create new process page */
        var $newPage = $('<div class="process_page pmr"></div>');

        /* Get the structure template */
        Bus.publish('ajax', 'getTemplate', {
          data: dataToTemplate,
          path: AirEuropaConfig.templates.pmr.structure,
          success: function(html) {
            /* Append the template to the new page */
            $newPage.append(html);
            $newPage.find('.process_wrapper_content').addClass('loading');

            /* Append the new page to the process */
            self.element.find('.process_page_wrapper').append($newPage);

            /* Proload flights */
            self.preparePmrStructure(step);
          }
        });
      }
    },

    preparePmrStructure: function(step) {
      var self = this;
      var offsetTop = this.element.find('.process_page.pmr').index() * 100 * -1;

      /* Check if the process_page_wrapper is already at 100%, so we don't need to animate it */
      if (this.element.find('.process_page_wrapper').attr('data-view') == 'pmr') {
        this.loadPmrForm(step);
      }
      else { /* Animate process wrapper to show the new page */
        this.element.find('.process_page_wrapper').animate({
          'top': offsetTop + '%'
        }, 500, 'easeInOutExpo', function() {
          self.loadPmrForm(step);
        });
      }
    },

    loadPmrForm: function(step) {
      var self = this;

      this.finishedHtmlLoad = false;
      this.finishedLoadingBar = false;

      /* Add checkin view flag */
      this.element.find('.process_page_wrapper').attr('data-view', '').attr('data-view', 'pmr');

      /* Call to services */
      this.callToServices(step);

      /* Global checkout warning booking listener */
      checkWarningBookingMessage(self.pmrFormCache.warningBookingLimit, lang('general.booking_limit_message_pmr'));

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
          self.appendPmrForm(step);
        }
      });
    },

    appendPmrForm: function(step) {
      var self = this;
      var after, movingStepsPosition, newStepsPosition;
      var $process_scroll = self.element.find('.process_scroll');

      /* Render the template */
      var renderedHtml = self.resultsTemplate(self.pmrFormCache);
      var $renderedHtml = $(renderedHtml);

      /* Get the template partials */
      var $top_bar = $renderedHtml.find('.process_top_bar');
      var $step = $renderedHtml.find('.process_step');
      var $bottom_bar = $renderedHtml.find('.process_bottom_bar');
      var $currentStep = self.element.find('.process_step');

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
      }
      else {
        self.element.find('.process_bottom_bar .bottom_bar_content.final').hide();
        self.element.find('.process_bottom_bar .bottom_bar_content').not('.final').fadeIn();
      }

      /* Update the status bar */
      self.element.find('.breadcrumb .steps li').removeClass('active done');
      self.element.find('.breadcrumb .steps .' + step).addClass('active');
      setTimeout(function(){
        self.element.find('.breadcrumb .steps .' + step).prevAll().addClass('done');
      },0);

      /* 2) Content step */

      /* Add a class to #pmr */
      self.element.find('#pmr').attr('class' ,'').addClass(step);

      /* Pmr content full flag */
      if ($renderedHtml.hasClass('full')) {
        self.element.find('.process_wrapper_content').addClass('full');
      }
      else {
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
          }
          else {
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
                }
                else {
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
              Bus.publish('pmr', 'custom_init');
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

            /* Init checkin process */
            Bus.publish('pmrForm', 'custom_init');
          }, after, $step, $currentStep);
        }

      }
    },

    callToServices: function(step) {
      var self = this;
      var jsonPath = getServiceURL('pmr_form.session');
      var templatePath = eval('AirEuropaConfig.templates.pmr.' + step);
      var temporalPmrFormCacheServices = {};

      /* Call AJAX module to get the results json */
      Bus.publish('ajax', 'getJSON', {
        path: jsonPath,
        success: function(data) {

          if (data) {

            /* Check data checkin parent object */
            if (data.pmr) {
              data = data.pmr;

              /* If there isn't a session */
              if (data.bookingId) {

                self.loadPmrFormData(function(){

                  /* Cache services */
                  self.temporalPmrFormCacheServices = self.pmrFormCache['services'];
                  self.pmrFormCache = data;

                  /* If there are results, ask for template */
                  if (data.passengers) {

                    /* Order and calc flights */
                    if (step == 'passengers') {

                      self.pmrFormCache = data;
                      self.pmrFormCache['services'] = self.temporalPmrFormCacheServices;

                      self.loadPmrFormTemplate(templatePath, step);
                    }else if(step == 'confirm'){
                      self.pmrFormCache = data;

                      self.loadPmrFormTemplate(templatePath, step);
                    }
                  }

                  /* If there are no results, go back to the search */
                  else {
                    /* Back to search */
                    self.backToSearch();
                  }

                  /* Update GTM */
                  if ( step == "passengers") {

                    updateGtm({
                       'mercado': window.market,
                       'pageArea': 'Mis vuelos',
                       'pageCategory': 'Pmr',
                       'pageContent': 'Listado de pasajeros'
                    });

                  }

                });

              } else {
                /* Back to home */
                Bus.publish('process', 'kill');
              }

            }

          }
          else { /* If there is not data, kill proccesses and back to home */
            /* Back to home */
            Bus.publish('process', 'kill');
          }
        }
      });
    },

    loadPmrFormData: function(callback) {
      var self = this;

      Bus.publish('services', 'getPmrFormLists', {
        success: function(listsData) {
          self.pmrFormCache['services'] = listsData;
          callback();
        }
      });
    },

     //Load checkin template
    loadPmrFormTemplate: function(templatePath, step) {
      var self = this;

      /* Get the template */
      Bus.publish('ajax', 'getTemplate', {
        path: templatePath,
        success: function(template) {
          self.finishedHtmlLoad = true;
          self.resultsTemplate = template;

          if (self.finishedHtmlLoad && self.finishedLoadingBar) {
            self.finishedHtmlLoad = false;
            self.appendPmrForm(step);
          }
        }
      });
    }

  };
});