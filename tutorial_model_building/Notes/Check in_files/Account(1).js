Hydra.module.register('AccountController', function(Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#process',
    unsuscribeSelector: '#content.unsuscribe',
    element: undefined,

    /* Results helpers */
    finishedLoadingBar: false,
    finishedHtmlLoad: false,

    /* Results cache */
    resultsData: undefined, /* Cache the last data results */
    resultsTemplate: undefined, /* Cache the last template results */

    events: {
      'process': {
        'show_login': function(oNotify) {
          this.showLogin();
        },
        'show_register': function(oNotify) {
          this.showRegister(oNotify);
        },
        'show_confirmation': function(oNotify){
          this.showConfirmation(oNotify);
        },
        'show_confirmation_email': function(oNotify){
          this.showConfirmationEmail(oNotify);
        },
        'show_restore': function(oNotify){
          this.show_restore();
        },
        'show_suma': function(oNotify) {
            this.showSuma();
         }
      },
      'account':{
        'logoff': function(oNotify){
          this.logoff();
        },
        'unsuscribe': function (oNotifiy) {
          this.unsuscribe(oNotifiy);
        }
      }
    },

    init: function() {
      /* Save jquery object reference */
      this.element = $(this.selector);
    },

    /*Clear localStorage and cookie when logoff*/
    logoff: function(){
      User.logoff();
    },

    /* Login process */

    showLogin: function() {
      var self = this;

      /* Prepare the process */
      Bus.publish('process', 'start', {process: 'login', screenName: 'form'});

      var $email = this.element.find('#field_login_email')[0];
      var savedEmail = $.cookie('email');
      if (savedEmail)
        $email.value = savedEmail;

      /* Make the search form active */
      this.element.find('.search_form[data-process-name=login]').addClass('active');

      /* Make the search visible */
      this.element.find('#search').addClass('visible');

      /* Make the search visible */
      setTimeout(function() { /* Needed because the transition callback doesn't fire properly on webkit */
        $('body').addClass('processing');
        self.element.find('#search').addClass('finished');
      }, 400);

      /* Activate links */
      $('a[data-process=login]').closest('p, li').addClass('active');

      /* Append login close if it isn't defined */
      if (this.element.find('#search .search_form .close').length == 0) {
        this.element.find('#search .search_form').append('<div class="close"><p><a href="/"><span>Cerrar</span></a></p></div>');
      }

      /* If the user is viewing any processing level */
      if ($('body').hasClass('processing')) {
        /* Animate process wrapper to show the search */
        this.element.find('.process_page_wrapper').animate({
          'top': '0'
        }, 500, 'easeInOutExpo', function() {
          self.element.find('.process_page.login').remove();
        });
      }

      // this.element.find('.search_form[data-process-name=login] input').blur();
      this.element.find('.search_form[data-process-name=login] input[type=text]').each(function(index, element) {
        var inputValue = $(element).val();

        if ((typeof inputValue !== 'undefined') && (inputValue != '')) {
          $(element).blur();
        }
      });
    },

    /* Register process */
    showRegister: function(data) {
      var self = this;

      /* Prepare the process */
      Bus.publish('process', 'start', {process: 'register', screenName: 'form'});

      /* Make the search form active */
      this.element.find('.search_form[data-process-name=register]').addClass('active');
      
      /* Focus first field of the form */
      this.element.find('.search_form[data-process-name=register] input').focus();

      var $email = this.element.find('#field_register_email')[0];
      var savedEmail = $.cookie('email');
      if (savedEmail)
        $email.value = savedEmail;

      if (self.element.find('#search #field_register_document_preference_airport option').length == 1 )
          {
            var ordered_airports = self.orderAirportsByZone(window.airports['from']);
     
            $.each(ordered_airports, function (indexGroup) {
              
                var optgroup = $('<optgroup>');
                optgroup.attr('label',ordered_airports[indexGroup].name);

                 $.each(ordered_airports[indexGroup].airports, function (index, airport) {

                    var option = $("<option></option>");
                    option.val(airport.code);
                    option.text(airport.description);
              
                    optgroup.append(option);
                 });
                 self.element.find("#search #field_register_document_preference_airport").append(optgroup);
            });

          }



      /* get from server all the list to add in the register select */
      Bus.publish('services', 'get_account_lists', {
        preconditionDocsType: 'LOYALTY',
        success: function (response) {

          if (self.element.find('#search #field_register_document_nationality option').length == 1 )
          {
            $.each(response.countries, function(indexCountry, country) {
     
              self.element.find('#search #field_register_document_nationality').append('<option value="'+country.code+'">'+ country.description+'</option>');
            });
          }
          
          if (self.element.find('#search #field_register_phone_prefix option').length == 1 )
          {
            $.each(response.countries, function(indexCountry, country) {
              self.element.find('#search #field_register_phone_prefix').append('<option value="'+country.phoneCode+'">'+ country.description + ' (' + country.phoneCode + ')</option>');
            });
          }
          
          if (self.element.find('#search #field_register_card_country option').length == 1 )
          {
            $.each(response.countries, function(indexCountry, country) {
              self.element.find('#search #field_register_card_country').append('<option value="'+country.code+'">'+ country.description+'</option>');
            });
          }

          if (self.element.find('#search #field_register_document_type option').length == 1 )
          {
            $.each(response.document_type, function(indexDocumentation, document) {
              self.element.find('#search #field_register_document_type').append('<option value="'+document.code+'">'+ document.description+'</option>');
            });
          }

          if ((typeof data != 'undefined') && (typeof data.userData != 'undefined' )) {

            /* password & password2 field is nor required when user is mobile */
            if (data.userData.userType == 'MOBILE'){
              var $password = self.element.find('#field_register_password').closest('.field');
              var $password2 = self.element.find('#field_register_password2').closest('.field');
              var $email = self.element.find('#field_register_email').closest('.field');
              var $name = self.element.find('#field_register_name').closest('.field');
              var $form = self.element.find('.register_form');
              var $secondSurname = $form.find('#field_register_surname2').closest('.field');
              //var $cepsaConditions = $form.find('#field_register_data_cession_cepsa_conditions').closest('.field');


              $password.attr('data-required', 'false').addClass('hidden');
              $password2.attr('data-required', 'false').addClass('hidden');
              $email.attr('data-required', 'false').addClass('hidden');
              $secondSurname.attr('data-required', 'false');
              //$cepsaConditions.attr('data-required', 'false');

              $form.find('.field').attr('data-init', 'restart');

              /*set name field class full*/
              $name.removeClass('half').addClass('full');

              $form.form('restartFields');

            }else{
              self.defaultValuesRegisterForm();
            }

            /* update fields if they are needed */
            if (data.userData.contactInformation) self.updateField(self,data.userData.contactInformation.email ,'field_register_email');
            if (data.userData.personCompleteName)
            {
              self.updateField(self,data.userData.personCompleteName.name ,'field_register_name');
              self.updateField(self,data.userData.personCompleteName.firstSurname ,'field_register_surname');
              self.updateField(self,data.userData.personCompleteName.secondSurname ,'field_register_surname2');
            }

            if (data.userData.born) {
              self.updateField(self,data.userData.born ,'field_register_birthdate');

              // Must update birthdate fields
              Bus.publish('account', 'update_birthdate', {
            	  parentSelector: '.search_form .register_form'
              });
            }
            if (data.userData.citizenship) self.updateSelect(self,data.userData.citizenship.code ,'field_register_document_nationality');
            if (data.userData.title) self.updateSelect(self,data.userData.title ,'field_register_honorific');
            if (data.userData.identificationDocument){
              var value = data.userData.identificationDocument.documentType.code;
              var $fieldDocument = self.element.find('#field_register_document_number').closest('.field');

              self.updateSelect(self,data.userData.identificationDocument.documentType.code ,'field_register_document_type');
              self.updateField(self,data.userData.identificationDocument.identity ,'field_register_document_number');

              /* check documentType */
              if (value == 'NI' || value == 'GR') {
                $fieldDocument.attr('data-format', 'dni');
              }
              else if (value == 'ID') {
                $fieldDocument.attr('data-format', 'nie');
              }

              $form.find('.field').attr('data-init', 'restart');
              $form.form('restartFields');
            }

          }else{
            self.defaultValuesRegisterForm();
          }

          /* Make the search visible */
          self.element.find('#search').addClass('visible');

          /* Make the search visible */
          setTimeout(function() { /* Needed because the transition callback doesn't fire properly on webkit */
            $('body').addClass('processing');
            self.element.find('#search').addClass('finished');
          }, 400);

          /* Activate links */
          $('a[data-process=register]').closest('p, li').addClass('active');

          /* Append register close if it isn't defined */
          if (self.element.find('#search .search_form .close').length == 0) {
            self.element.find('#search .search_form').append('<div class="close"><p><a href="/"><span>Cerrar</span></a></p></div>');
          }

          /* Check if register form has been loaded from checkin */
          if ((typeof data != 'undefined') && (data.checkin === true)) {
            // add class to form
            self.element.find('.register_form').addClass('register_form_checkin');

            self.element.find('#search .search_form .close p a').on('click', function(event) {
              event.preventDefault();
              event.stopImmediatePropagation();

              var mode;
              var step = 'passengers';

              Bus.publish('process', 'show_checkin_step', {mode: mode, step: step});
            });
          }

          /* If the user is viewing any processing level */
          if ($('body').hasClass('processing')) {
            /* Animate process wrapper to show the search */
            self.element.find('.process_page_wrapper').animate({
              'top': '0'
            }, 500, 'easeInOutExpo', function() {
              self.element.find('.process_page.register').remove();
            });
          }
        }
      });

    },

    /* Confirmation process */
    showConfirmation: function(oNotify) {
      var self = this;

      $('#content').addClass('start_loading');

      Bus.publish('services', 'confirm_loyalty_user', {
        data: {
          alToken: oNotify.token
        },
        success: function(data){
          var error = (data.header.error) ? true : false;
          /* Errors control */
          if (error === true) {
            /* Quitar spinner */
            $('#content').addClass('loading_finished');

            updateGtm({
                  'pageArea': 'SUMA-prealta' ,
                  'pageCategory': 'confirmacion-usuarios',
                  'pageContent': data.header.message
                });

            /* set the content with the error message */
            var $message = $('#content .expired_message');
            $message.find('.expired_title span').html(data.header.message);
            $message.show();
          }
          else {
            $('#content').addClass('loading_finished');
            $('#content .success_message').show();

            updateGtm({
                  'pageArea': 'SUMA-prealta',
                  'pageCategory': 'confirmacion-usuarios',
                  'pageContent': 'alta_ok'
                });

            /* add the init button the proper link to show the login */
            $('#content .link_block a').on('click', function(event) {
              
              event.preventDefault();
              /* Refresh logged user accesses */
              window.location.href =  urlCms('home') + '#/' + getProcessUrl('login');
            });
          }
        }
      });
    },

    /* Confirmation chenge email process */
    showConfirmationEmail: function(oNotify) {
      var self = this;

      $('#content').addClass('start_loading');

      Bus.publish('services', 'confirm_loyalty_user_email', {
        data: {
          confirmationToken: oNotify.token
        },
        success: function(data){
          var error = (data.header.error) ? true : false;

          /* Quitar spinner */
          $('#content').addClass('loading_finished');

          /* Errors control */
          if (error === true) {
            /* set the content with the error message */
            var $message = $('#content .expired_message');
            $message.find('.expired_title span').html(data.header.message);
            $message.show();

            /* Hide success message to avoid showing both messages if user change token without reloading */
            $('#content .success_message').hide();
          } else {
            /* set the content with the success message */
            var successText = lang('account.email_confirm.success_title');
            var $message = $('#content .success_message');
            $message.find('.success_title span').html(successText);
            $message.show();

            /* Hide error message to avoid showing both messages if user change token without reloading */
            $('#content .expired_message').hide();

            /* add the init button the proper link to show the login */
            $('#content .link_block a').on('click', function(event) {
              event.preventDefault();
              /* Refresh logged user accesses */
              window.location.href = urlCms('home') + '#/' + getProcessUrl('login');
            });
          }
        }
      });
    },

    /* restore process */
    show_restore: function() {
      var self = this;

      var $email = this.element.find('#field_email')[0];
      var savedEmail = $.cookie('email');
      if (savedEmail)
        $email.value = savedEmail;

      /* Prepare the process */
      Bus.publish('process', 'start', {process: 'restore-password', screenName: 'form'});

      /* Make the search form active */
      this.element.find('.search_form[data-process-name=restore-password]').addClass('active');

      /* Make the search visible */
      this.element.find('#search').addClass('visible');

      /* Make the search visible */
      setTimeout(function() { /* Needed because the transition callback doesn't fire properly on webkit */
        $('body').addClass('processing');
        self.element.find('#search').addClass('finished');
      }, 400);

      /* Activate links */
      $('a[data-process=restore-password]').closest('p, li').addClass('active');

      /* Append login close if it isn't defined */
      if (this.element.find('#search .search_form .close').length == 0) {
        this.element.find('#search .search_form').append('<div class="close"><p><a href="/"><span>Cerrar</span></a></p></div>');
      }

      /* If the user is viewing any processing level */
      if ($('body').hasClass('processing')) {
        /* Animate process wrapper to show the search */
        this.element.find('.process_page_wrapper').animate({
          'top': '0'
        }, 500, 'easeInOutExpo', function() {
          self.element.find('.process_page.restore-password').remove();
        });
      }

    },


    /* SUMA process */

    showSuma: function() {
      var self = this;

      /* Prepare the process */
      Bus.publish('process', 'start', {process: 'suma', screenName: 'form'});

      /* Make the search form active */
      this.element.find('.search_form[data-process-name=suma]').addClass('active');

      /* Make the search visible */
      this.element.find('#search').addClass('visible');

      /* Make the search visible */
      setTimeout(function() { /* Needed because the transition callback doesn't fire properly on webkit */
        $('body').addClass('processing');
        self.element.find('#search').addClass('finished');
      }, 400);

      /* Activate links */
      $('a[data-process=login]').closest('p, li').addClass('active');

      /* Append login close if it isn't defined */
      if (this.element.find('#search .search_form .close').length == 0) {
        this.element.find('#search .search_form').append('<div class="close"><p><a href="/"><span>Cerrar</span></a></p></div>');
      }

      /* If the user is viewing any processing level */
      if ($('body').hasClass('processing')) {
        /* Animate process wrapper to show the search */
        this.element.find('.process_page_wrapper').animate({
          'top': '0'
        }, 500, 'easeInOutExpo', function() {
          self.element.find('.process_page.login').remove();
        });
      }

    },

    updateField: function($this, dataValue, serviceName){
      var $element = $this.element.find('.register_form input[name="'+ serviceName +'"]');
      $element.val(dataValue);
      $element.trigger('blur');
    },

    updateSelect: function($this, dataValue, serviceName){
      var $element = $this.element.find('.register_form select[name="'+ serviceName +'"]');
      $element.val(dataValue);
      $element.closest('.selected_value').val(dataValue)
      $element.trigger('blur');
    },

    defaultValuesRegisterForm: function(){
      var $form = this.element.find('.register_form');
      var $name = $form.find('#field_register_name').closest('.field');
      var $secondSurname = $form.find('#field_register_surname2').closest('.field');
      var $preferenceAirport = $form.find('#field_register_document_preference_airport').closest('.field');
      //var $cepsaConditions = $form.find('#field_register_data_cession_cepsa_conditions').closest('.field');
      var $cepsa = $form.find('#field_register_data_cession_cepsa').closest('.field');
      var $comunication = $form.find('#field_register_comunication_yes_ae').closest('.field');
      var $phisicalCard = $form.find('#field_register_data_loyalty_phisical_card').closest('.field');
      var $state = $form.find('#field_region').closest('.field');
      var $postalCode = $form.find('#field_register_postal_code').closest('.field');

      /* reset select values */
      $form.find('#field_register_honorific').val('').change();
      $form.find('#field_register_document_nationality').val('').change();
      $form.find('#field_register_document_type').val('').change();
       /*reset select date*/
      // this.element.find('.field.select_field.small.date .selected_value').text('');
      $form.find('.select_field.small.date select').val('').change();

      $form.find('.field').attr('data-required', 'true');

      $form.find('.field.hidden').removeClass('hidden');

      $secondSurname.attr('data-required', 'false');
      $preferenceAirport.attr('data-required', 'false');
      //$cepsaConditions.attr('data-required', 'false');
      $cepsa.attr('data-required', 'false');
      //$comunication.attr('data-required', 'false');
      $phisicalCard.attr('data-required', 'false');
      $state.addClass('hidden');
      $form.find('#phisical_card_address .field').attr('data-required', 'false');
      $form.find('.phone_block .field').attr('data-required', 'false');
      $postalCode.attr('data-required', 'false');
      $form.find('#field_register_comunication, #field_cko_register_comunication').closest('.field').attr('data-required', 'false');

      $form.find('.field').attr('data-init', 'restart');

      /*set name field class full*/
      $name.removeClass('full').addClass('half');

      $form.form('restartFields');
    },

    unsuscribe:function (oNotify) {
      var self = this;
      self.element = $(this.unsuscribeSelector);
      var $formContent = self.element.find('.unsuscribe_form');

      /* Start loading */
      self.startPromiseLoading();

      /* Call to loyalty preferences service */
      Bus.publish('services', 'getReasonsUnSuscribe', {
        token: oNotify.token,
        success: function (data) {
          var error = (data.error) ? true : false;
          var reasons = (data.body.data) ? data.body.data: [];
          var $reasonsForm = self.element.find('.unsuscribe_form form');
          /* Hide loading screen */
          $.when(self.loadingPromise)
                  .done(function () {
                    self.resolvePromiseLoading();
                  });
          /* Errors control */
          if (error === true) {

            $('body').ui_dialog({
              title: lang('general.info_error_title'),
              error: false,
              close:  {
                behaviour: 'close',
                href: '#'
              },
              subtitle: (error_message) ? error_message : lang('account.invalid_reasons'),
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
                    /* send to home */
                    window.location.href = '/';
                  });
                }
            });


          }else{

            /* append in the select the reasons for unsuscribe */
            $.each(reasons, function (indexReason, reason) {
              self.element.find('#field_reason').append('<option value="'+reason.code+'">'+ reason.description+'</option>');
            });
          }
        }
      });
    },

    startPromiseLoading: function () {
      var self = this;
      this.loadingPromise = $.Deferred();

      /* Show loading */
      self.element.addClass('loading');

      /* Start loading animation, it's in a setTimeout to fix the animation */
      setTimeout(function () {
        self.element.addClass('start_loading');
      }, 1);

      /* Reset scroll */
      $(window).scrollTop(0);

      /* Resolve the promise after animation */
      setTimeout(function () {
        self.loadingPromise.resolve();
      }, 2500);
    },
    resolvePromiseLoading: function () {
      var self = this;

      /* Fade out loading screen */
      this.element.addClass('loading_finished');

      /* After 500ms, reste all loading classes to get it ready for the next click */
      setTimeout(function () {
        self.element.removeClass('loading start_loading loading_finished');
      }, 500);
    },

    orderAirportsByZone: function (airports) {
      var results = new Array();
      var airportsPerZone = {};
      var orderedAirportsPerZone = {};

      /* Order the airports per zone */
      $.each(airports, function (index, airport) {
        if (airport.zone) { /* If the airport is classified by zone */
          if (airportsPerZone[airport.zone] == undefined) {
            airportsPerZone[airport.zone] = [];
          }

          airportsPerZone[airport.zone].push({
            description: airport.description,
            code: airport.code,
            resident: airport.resident,
            zone: airport.zone
          });
        }
        else { /* If it doesn't have, save it in a generic category */
          if (airportsPerZone['generic'] == undefined) {
            airportsPerZone['generic'] = [];
          }

          airportsPerZone['generic'].push({
            description: airport.description,
            code: airport.code,
            resident: airport.resident,
            zone: airport.zone
          });

        }
      });

      /* Order the zones like in the config */
      if (AirEuropaConfig.zonesAvailable != undefined) {
        $.each(AirEuropaConfig.zonesAvailable, function (index, zone) {

          /* If the zone has some results, save it on the new array */
          if (airportsPerZone[zone]) {
            orderedAirportsPerZone[zone] = airportsPerZone[zone];
          }
        });
      }

      /* Append at the end the generic category if it's needed */
      if (airportsPerZone['generic']) {
        orderedAirportsPerZone['generic'] = airportsPerZone['generic'];
      }

      /* Create the array to loop through Handlebars */
      $.each(orderedAirportsPerZone, function (index, zone) {

        results.push({
          code: index,
          name: (index != 'generic') ? lang('zones.' + index) : undefined,
          airports: zone
        });
      });

      return results;
    }

  };
});
