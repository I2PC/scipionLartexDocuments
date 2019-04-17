Hydra.module.register('PmrForm', function(Bus, Module, ErrorHandler, Api) {

  return {
    selector: '#pmr',
    element: undefined,

    /* Pmr cache */
    pmrFormCache: {},


    events: {
      'pmrForm': {
        'custom_init': function() {
          this.customInit();
          Bus.publish('prerender', 'restart');
        }
      }
    },

    init: function() {
      this.customInit();
    },

    customInit: function() {
      var self = this;

      /* Save jquery object reference */
      this.element = $(this.selector);

      var destinyAddressObject = [];
      this.destinyAddressObject = destinyAddressObject;

      if (this.element.length > 0) {

        Bus.publish('process', 'get_pmr_data', {callback: function(pmrCache) {
          self.pmrFormCache = pmrCache;
        }});
       
        /* Control content height */
        this.setContentHeight();
        this.controlResize();

        /* Pmr status */
        this.pmrStatus();


        /* Form helpers */
        this.setTabindex();
        this.preparePassengersForm();

        /* Init steps widgets */
        this.initSteps();

        /* Forms */
        this.initForm();

        this.initServiceaAssistance();

        /* Lightbox actions listener */
        this.lightboxPmrListener();

      }

      /* Close proccess recursive in all the navigation */
      this.element.find('.close_process').find('a').on('click', function(){
        /* Send void checkin session to clean the server session */
        self.removeServerSession();

        /* Back to HOME */
        // Bus.publish('hash', 'change', { hash: '' });
        window.location.href = '#';
      });
    },

    /* Content height */
    setContentHeight: function() {
      var $process_scroll = this.element.find('.process_scroll');
      var $process_top_bar = this.element.find('.process_top_bar');
      var $process_bottom_bar = this.element.find('.process_bottom_bar');
      var $process_content = this.element.find('.process_content');

      var availableHeight = $('body').height() - $process_bottom_bar.outerHeight();

      /* Set the height */
      $process_scroll.css('height', availableHeight);
      $process_top_bar.css('width', $process_content.outerWidth());
    },

    controlResize: function() {
      var self = this;

      $(window).on('resize.ev_checkout', function() {
        self.setContentHeight();
      });

      /* Adjust height because CSS callbacks don't work in IE8 */
      setTimeout(function(){
        self.setContentHeight();
      }, 350);
    },

    /* Checkin status */
    pmrStatus: function() {
      this.element.find('.pmr_status ol li a').off('click');
      this.element.find('.pmr_status ol li a').on('click', function(event) {
        var $this = $(this);
        var $li = $this.closest('li');

        if (!($li.hasClass('done') || $li.hasClass('completed'))) {
          event.preventDefault();
        }
      });
    },

    /*
     * pmr lightbox listeners.
     */
    lightboxPmrListener: function() {
      var self = this;

      /* Open lightbox */
      this.element.on('click.pmr', '.more-info', function(event) {
        event.preventDefault();
        self.element.find('.pmr_overlay').show();
      });

      /* Close lightbox */
      this.element.on('click.pmr', '.close_overlay', function(event) {
        event.preventDefault();
        self.element.find('.pmr_overlay').hide();
      });
    },

    /* Init steps */
    initSteps: function() {
      this.element.find('.process_scroll').steps();
    },

    /* Forms */

    initForm: function() {
      var self = this;

      this.element.find('form').form({
        onSubmit: function(form) {
          var nextStep = form.element.closest('.process_step').attr('data-next');
          var url = getPostURL('pmr_form');

          /* check if, at least, one passenger has been selected */
          numPassengersSelected = form.element.find('.group_header').find('input[type=checkbox].passenger_info_check:checked').length;
          if (numPassengersSelected > 0) {

            /* check if WHEELCHAIR - SEAT is selected all checkboxes are checked with OK */
            var allChecked = true;
            $(".assistance_group_wrapper").each(function() {                      
              
              if($(this).is(":visible")){
                var $cases = $(this).find(".assistance_case");

                $cases.each(function() {                      
                  if($(this).prop("checked") == true && $(this).hasClass('case_no')){
                      allChecked = false;
                  }        
                });

              }
            }); 
            
            if(allChecked){
              /* Start widget animation */
              self.element.find('.process_scroll').steps('showLoading', function() {

                var jsonPath = getServiceURL('pmr_form.session');
                Bus.publish('ajax', 'getJSON', {
                  path: jsonPath,
                  success: function(data) {

                    if (data) {
                      /* Add form info to pmr cache object */
                      /* Get the data from the user form */
                      // this.pmrFormCache = data.pmr;
                      self.pmrFormCache = self.addFormData(form.element, data.pmr);
                      self.element.find('.process_step.passengers').removeClass('incomplete');
                      self.confirmPmr(url, nextStep, self.pmrFormCache);
                    } else { /* If there is not data, kill proccesses and back to home */
                      /* Back to home */
                      Bus.publish('process', 'kill');
                    }

                  }
                });
              });   

            }else{

              /* Show an error */
              $('#pmr').ui_dialog({
                title: lang('general.error_title'),
                error: true,
                subtitle: lang('pmr_form.conditional_error_msg'),                
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
            /* Show an error */
            $('#pmr').ui_dialog({
              title: lang('general.error_title'),
              error: true,
              subtitle: lang('pmr_form.must_select_passengers'),
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
        }, 
        onError: function (form) {
          self.showFormError(form.element);
        }
      });
    },

     /* Helper for input fields dimensions */
    preparePassengersForm: function(){
      var self = this;
      var $this = $(document);
      var howMuch = 0;

      if (self.element.find('.process_step').attr('data-step')=='passengers') {

        /* Control number of cards will be generated */
        $this.find('.group_header').find('input[type=checkbox]').change(function(){
          var $this = $(this);

          if ($this.attr('id').indexOf('field_help_flyer')==0) {
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
            
          } else if ($this.attr('id').indexOf('field_help_wheelchair_base')==0) {

            //wheelchair_info checkbox
            if ($this.is(':checked')) {
              $this.closest('.wheelchair_info').find('.wheelchair_type, .wheelchair_length, .wheelchair_width, .wheelchair_high, .wheelchair_kgs').attr('data-required', 'true');

            } else {
              $this.closest('.wheelchair_info').find('.wheelchair_type, .wheelchair_length, .wheelchair_width, .wheelchair_high, .wheelchair_kgs').attr('data-required', 'false');
            }

            $this.closest('.wheelchair_info').find('.wheelchair_type, .wheelchair_length, .wheelchair_width, .wheelchair_high, .wheelchair_kgs').attr('data-init', 'restart');
            $this.closest('form').form('restartFields');

          } else if ($this.attr('id').indexOf('field_help_wheelchair_add')==0) {

            //wheelchair_info_add checkbox
            if ($this.is(':checked')) {
              $this.closest('.wheelchair_info_add').find('.wheelchair_type_add, .wheelchair_length_add, .wheelchair_width_add, .wheelchair_high_add, .wheelchair_kgs_add').attr('data-required', 'true');

            } else {
              $this.closest('.wheelchair_info_add').find('.wheelchair_type_add, .wheelchair_length_add, .wheelchair_width_add, .wheelchair_high_add, .wheelchair_kgs_add').attr('data-required', 'false');
            }

            $this.closest('.wheelchair_info_add').find('.wheelchair_type_add, .wheelchair_length_add, .wheelchair_width_add, .wheelchair_high_add, .wheelchair_kgs_add').attr('data-init', 'restart');
            $this.closest('form').form('restartFields');

          }else{
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

    addFormData: function ($form, pmrCache) {
      var postObject = {};
      var passengersListComplete = [];
      var passengers = pmrCache.passengers;
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
          assistance.complement_text = $form.find('.assistance_label[data-passenger='+passenger_assistance.passengerNumber+'] .assistance').text();
          assistances.push(assistance);

          if(userData.passengers[passenger.passengerNumber].wheelchair_length !==""){
            var assistancewheelchair= {};
            assistancewheelchair.assistance = "OWN_WHEELCHAIR";
            assistancewheelchair.complement = userData.passengers[passenger.passengerNumber].wheelchair_type;
            assistancewheelchair.add = true;
            assistancewheelchair.complement_text = $form.find('.assistance_label[data-passenger='+passenger_assistance.passengerNumber+'] .wheelchair-assistance').text().substr(2);
            assistances.push(assistancewheelchair);

            var assistancewheelchairsize = {};
            assistancewheelchairsize.length = userData.passengers[passenger.passengerNumber].wheelchair_length;
            assistancewheelchairsize.width = userData.passengers[passenger.passengerNumber].wheelchair_width;
            assistancewheelchairsize.high = userData.passengers[passenger.passengerNumber].wheelchair_high;
            assistancewheelchairsize.kgs = userData.passengers[passenger.passengerNumber].wheelchair_kgs;            
            passenger_assistance.wheelChair = assistancewheelchairsize;
          }
          if(userData.passengers[passenger.passengerNumber].petc_weight !==""){
            var assistancepetc = {};
            assistancepetc.code = userData.passengers[passenger.passengerNumber].petc_type;
            assistancepetc.kgs = userData.passengers[passenger.passengerNumber].petc_weight;                     
            passenger_assistance.petc = assistancepetc;
          }
          if((userData.passengers[passenger.passengerNumber].deaf_blind_name !=="") && totalPassengers == 1){
            var accompanist = {};
            accompanist.fullName = userData.passengers[passenger.passengerNumber].deaf_blind_name;
            accompanist.dni = userData.passengers[passenger.passengerNumber].deaf_blind_document_number;                     
            accompanist.telephone = userData.passengers[passenger.passengerNumber].deaf_blind_telephone;                     
            passenger_assistance.accompanist = accompanist;
          }
          if((userData.passengers[passenger.passengerNumber].understanding_name !=="") && totalPassengers == 1){
            var accompanist = {};
            accompanist.fullName = userData.passengers[passenger.passengerNumber].understanding_name;
            accompanist.dni = userData.passengers[passenger.passengerNumber].understanding_document_number;                     
            accompanist.telephone = userData.passengers[passenger.passengerNumber].understanding_telephone;                     
            passenger_assistance.accompanist = accompanist;
          }

          // Ayuda adicional
          if(userData.passengers[passenger.passengerNumber].assistance_type_add !== ""){
            var assistanceAdd = {};
            assistanceAdd.assistance = userData.passengers[passenger.passengerNumber].assistance_type_add;
            assistanceAdd.complement = (assistanceAdd.assistance == "UNDERSTANDING") ? "UNDERSTANDING" : userData.passengers[passenger.passengerNumber].complement_add;
            assistanceAdd.add = true;
            assistanceAdd.complement_text = $form.find('.assistance_label[data-passenger='+passenger_assistance.passengerNumber+'] .add-assistance').text().substr(2);
            assistances.push(assistanceAdd);

            if(userData.passengers[passenger.passengerNumber].wheelchair_type_add !==""){
              var assistancewheelchair= {};
              assistancewheelchair.assistance = "OWN_WHEELCHAIR";
              assistancewheelchair.complement = userData.passengers[passenger.passengerNumber].wheelchair_type_add;
              assistancewheelchair.add = true;
              assistancewheelchair.complement_text = $form.find('.assistance_label[data-passenger='+passenger_assistance.passengerNumber+'] .wheelchair-assistance').text().substr(2);
              assistances.push(assistancewheelchair);

              var assistancewheelchairsize = {};
              assistancewheelchairsize.length = userData.passengers[passenger.passengerNumber].wheelchair_length_add;
              assistancewheelchairsize.width = userData.passengers[passenger.passengerNumber].wheelchair_width_add;
              assistancewheelchairsize.high = userData.passengers[passenger.passengerNumber].wheelchair_high_add;
              assistancewheelchairsize.kgs = userData.passengers[passenger.passengerNumber].wheelchair_kgs_add;            
              passenger_assistance.wheelChair = assistancewheelchairsize;
            }
            if(userData.passengers[passenger.passengerNumber].petc_weight_add !==""){
              var assistancepetc = {};
              assistancepetc.code = userData.passengers[passenger.passengerNumber].petc_type_add;
              assistancepetc.kgs = userData.passengers[passenger.passengerNumber].petc_weight_add;                     
              passenger_assistance.petc = assistancepetc;
            }
            if((userData.passengers[passenger.passengerNumber].deaf_blind_name_add !=="") && totalPassengers == 1){
              var accompanist = {};
              accompanist.fullName = userData.passengers[passenger.passengerNumber].deaf_blind_name_add;
              accompanist.dni = userData.passengers[passenger.passengerNumber].deaf_blind_document_number_add;                     
              accompanist.telephone = userData.passengers[passenger.passengerNumber].deaf_blind_telephone_add;                     
              passenger_assistance.accompanist = accompanist;
            }
            if((userData.passengers[passenger.passengerNumber].understanding_name_add !=="") && totalPassengers == 1){ 
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
      postObject.bookingId = pmrCache.bookingId;
      postObject.internalService = pmrCache.internalService;

      return postObject;
    },

    /* Function to confirm checkin */
    confirmPmr: function(url, nextStep, pmrFormCache){
      var self = this;

      var internalService = pmrFormCache.internalService;

      if(internalService){
         /* Confirm checkin */
        Bus.publish('services', 'confirmPmrBooking', {
          pmrFormCache: pmrFormCache,
          bookingId: pmrFormCache.bookingId,
          success: function(data) {
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
              //self.pmrFormCache.confirm = data.body.data;
              self.continueStep(url, nextStep, true);
            }
            else {
              /* Check if error code is 1114, INVALID ESTA */
              self.element.find('.process_scroll').steps('showErrors');

              /* Show an error */
              $('#pmr').ui_dialog({
                title: lang('general.error_title'),
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
                ],
                render: function($dialog) {
                  if (data.header.code==1005) {
                    /* Buttons behaviour */
                    $dialog.find('.close a').on('click', function(event) {
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

      }else{
        /* Confirm checkin */
        Bus.publish('services', 'confirmPmr', {
          pmrFormCache: pmrFormCache,
          bookingId: pmrFormCache.bookingId,
          success: function(data) {
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
              //self.pmrFormCache.confirm = data.body.data;
              self.continueStep(url, nextStep, true);
            }
            else {
              /* Check if error code is 1114, INVALID ESTA */
              self.element.find('.process_scroll').steps('showErrors');

              /* Show an error */
              $('#pmr').ui_dialog({
                title: lang('general.error_title'),
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
                ],
                render: function($dialog) {
                  if (data.header.code==1005) {
                    /* Buttons behaviour */
                    $dialog.find('.close a').on('click', function(event) {
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
    removeServerSession: function(){
      var postSessionURL = getPostURL('pmr_form');
      var pmrFormSession = {};

      /* Post void checkoutSession object */
      Bus.publish('ajax', 'postJson', {
        path: postSessionURL,
        data: {pmr: pmrFormSession},
        success: function() {}
      });
    },

    /* Function to continue with next step */
    continueStep: function(url, nextStep, finalStep) {
      finalStep = typeof finalStep !== 'undefined' ? finalStep : false;

      var self = this;

      /* First show loading bar */
      self.element.find('.process_scroll').steps('showLoading', function() {

        var mode = self.element.find('.process_steps').attr('data-mode');

        Bus.publish('ajax', 'postJson', {
          path: url,
          data: { pmr: self.pmrFormCache },
          success: function() {
            var step = self.element.find('.process_step').attr('data-step');

            /* Set the status bar as completed */
            self.element.find('.pmr .steps .' + step).addClass('completed');

            /* Change URL */
            var pmrProcessURL = getProcessUrl('pmr_form');

            Bus.publish('hash', 'change', { hash: pmrProcessURL + '/' + nextStep });

          },
          failure: function() {
            /* Show an error */
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
              ]
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

      $.each(listAssistanceType, function(index, assintiveSelect){

        var $assintiveSelect = $(assintiveSelect);
        var passengerNumber = $assintiveSelect.closest('.passengers_info').data('passenger');
        var $complementSelect = self.element.find('#field_assistance_complement_'+passengerNumber);
        var $wheelchairSelect = self.element.find('#field_wheelchair_type_'+passengerNumber);
        var $layerComplementInput =  $complementSelect.closest('.assistance_complement');

        var $layerComplementSelect = $complementSelect.closest('.select_field');
        var $complementInput = $layerComplementInput.find('input');


        $layerComplementSelect.removeClass('error valid filled');

        // assign events to assintive select
        $assintiveSelect.on('change', function(){
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

          if (codAssintance != ''){

            // Remove selected item from "Ayuda Adicional"
             var $assistanceAdd = $this.closest('.check_group_wrapper').find('.field_assistance_type_add');
             $assistanceAdd.find('option').each(function() {
                  $(this).removeAttr('selected').show();
             });
             var currentAssistance = $assistanceAdd.find('[value="' + codAssintance + '"]').hide();
             $assistanceAdd.find('option:first').attr('selected','selected').trigger('change');
             $assistanceAdd.prev('.selected_value').empty();
    
            // Disable SEAT Checkbox required condition
            self.updateFormElement($assistanceGroupWrapper, '.radio', 'false');

            // Handle custom error message for this 3 cases
            if(codAssintance == "DEAF_BLIND" || codAssintance == "UNDERSTANDING"){
              $errorText.show().addClass('error_text_first');
              $errorHead.addClass('error_cond');
              $formCond.addClass('has-cond');  
            }else{
              $errorText.hide().removeClass('error_text_first');
              $errorHead.removeClass('error_cond');
              $formCond.removeClass('has-cond');  
            }

            // Toggle Deaf Blind    
            if(codAssintance == "DEAF_BLIND"){              
              $deafBlindInfo.show();               
              self.updateFormElement($deafBlindInfo, '.deaf_blind_name, .deaf_blind_document_number, .deaf_blind_telephone', 'true');
            }else{              
              $deafBlindInfo.hide();
              self.updateFormElement($deafBlindInfo, '.deaf_blind_name, .deaf_blind_document_number, .deaf_blind_telephone', 'false');
            }

            // Toggle WheelChair        
            if(codAssintance == "WHEELCHAIR"){
              $wheelchairInfo.show(); 
              $assistanceGroupWrapper.hide();              
            }else{
              $wheelchairInfo.hide();

              // reset wheelchair inputs in case you switch to another assistance
              var $wheelchairButton = $wheelchairInfo.find('.field_help_wheelchair');
              var $wheelchairBody = $wheelchairInfo.find('.group_body');
              if($wheelchairBody.css("display") == 'block'){
                $wheelchairButton.click();
              }
            
            }
      
            // Toggle Understanding
            if(codAssintance == "UNDERSTANDING"){
              $understandingInfo.show();  
              $complementSelect.val('').change();             
              self.updateFormElement('', $assistanceComplement, 'false', true);
              self.updateFormElement($understandingInfo, '.understanding_name, .understanding_document_number, .understanding_telephone', 'true');
            }else{              
              $understandingInfo.hide();
              self.updateFormElement('', $assistanceComplement, 'true', true);
              self.updateFormElement($understandingInfo, '.understanding_name, .understanding_document_number, .understanding_telephone', 'false');
            }
        
            // Toggle PETC
            if(codAssintance == "PETC"){
              $petcInfo.show();               
              self.updateFormElement($petcInfo, '.petc_type, .petc_weight', 'true');
            }else{              
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
              success: function(data) {
                var optionsHtml = '';
                // if (!data || !data.header || !data.header.error || !data.body || !data.body.data) {
                if (!data.header.error) {
                  optionsHtml = '<option value=""></option>';
                  $.each(data.body.data, function(indexReg, dataReg){
                    optionsHtml += '<option value="'+dataReg.code+'">'+dataReg.description+'</option>';
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
                  $layerComplementSelect.find('select').attr('tabindex',tabindex);
                  $layerComplementInput.find('input').attr('tabindex','');

                  // assign events to assintive select
                  $complementSelect.on('change', function(){
                    var $this = $(this);
                    var codAssintanceComplement = $this.val();

                    if(codAssintanceComplement == "SEAT"){
                      $assistanceGroupWrapper.show();              
                      self.updateFormElement($assistanceGroupWrapper, '.radio', 'true');
                    }else{              
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
        $complementSelect.on('change', function() {
          var $this = $(this);

          var textValue1 = $assintiveSelect.find('option:selected').text();
          var textValue2 = $this.find('option:selected').text();

          if (textValue1 != '' && textValue2 != '') {
            $this.closest('.passengers_info').find('.assistance').text(textValue1+' - '+textValue2);
            $this.closest('.passengers_info').find('.assistance_label').show();
          } else if(textValue1 != '' && textValue2 == '') {
            $this.closest('.passengers_info').find('.assistance').text(textValue1);
            $this.closest('.passengers_info').find('.assistance_label').show();
          } else {
            $this.closest('.passengers_info').find('.assistance').text('');
            $this.closest('.passengers_info').find('.assistance_label').hide();
          }
        });

        $wheelchairSelect.on('change', function(){
          var $this = $(this);

          var textValue2 = $this.find('option:selected').text();

          if (textValue2 != '') {
            $this.closest('.passengers_info').find('.wheelchair-assistance').text(', ' +textValue2);
          } else {
            $this.closest('.passengers_info').find('.wheelchair-assistance').text('');
          }
        });

      });

      $.each(listAssistanceAddType, function(index, assintiveSelect){

        var $assintiveSelect = $(assintiveSelect);
        var passengerNumber = $assintiveSelect.closest('.passengers_info').data('passenger');
        var $fieldAssistanceType = self.element.find('#field_assistance_type_'+passengerNumber);
        var $complementSelect = self.element.find('#field_assistance_complement_add_'+passengerNumber);
        var $wheelchairSelect = self.element.find('#field_wheelchair_type_add'+passengerNumber);
        var $layerComplementInput = $complementSelect.closest('.assistance_complement_add');

        var $layerComplementSelect = $complementSelect.closest('.select_field');
        var $complementInput = $layerComplementInput.find('input');

        $layerComplementSelect.removeClass('error valid filled');

        $assintiveSelect.on('change', function(){
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


          if (codAssintance!= ''){
            $layerComplementSelect.removeClass('non_editable');

            // Disable SEAT Checkbox required condition
            self.updateFormElement($assistanceGroupWrapper, '.radio', 'false');

            // Handle custom error message for this 3 cases
            if(!$errorText.hasClass("error_text_first")){
              if(codAssintance == "DEAF_BLIND" || codAssintance == "UNDERSTANDING"){
                $errorText.show();
                $errorHead.addClass('error_cond');
                $formCond.addClass('has-cond');  
              }else{
                $errorText.hide();
                $errorHead.removeClass('error_cond');
                $formCond.removeClass('has-cond');  
              }
            }

            // Toggle Deaf Blind               
            if(codAssintance == "DEAF_BLIND"){
              if($fieldAssistanceType.val() != "UNDERSTANDING"){
                $deafBlindInfo.show();                          
                self.updateFormElement($deafBlindInfo, '.deaf_blind_name_add, .deaf_blind_document_number_add, .deaf_blind_telephone_add', 'true');
              }
            }else{              
              $deafBlindInfo.hide();
              self.updateFormElement($deafBlindInfo, '.deaf_blind_name_add, .deaf_blind_document_number_add, .deaf_blind_telephone_add', 'false');
            }

            // Toggle WheelChair        
            if(codAssintance == "WHEELCHAIR"){
              $wheelchairInfo.show(); 
              $assistanceGroupWrapper.hide();              
            }else{
              $wheelchairInfo.hide();

              // reset wheelchair inputs in case you switch to another assistance
              var $wheelchairButton = $wheelchairInfo.find('.field_help_wheelchair');
              var $wheelchairBody = $wheelchairInfo.find('.group_body');
              if($wheelchairBody.css("display") == 'block'){
                $wheelchairButton.click();
              }
            }

            // Toggle Understanding            
            if(codAssintance == "UNDERSTANDING"){
              if($fieldAssistanceType.val() != "DEAF_BLIND"){
                $understandingInfo.show();               
                self.updateFormElement($understandingInfo, '.understanding_name_add, .understanding_document_number_add, .understanding_telephone_add', 'true');
              }
              $complementSelect.val('').change();  
              self.updateFormElement('', $assistanceComplement, 'false', true);
            }else{              
              $understandingInfo.hide();
              self.updateFormElement('', $assistanceComplement, 'true', true);
              self.updateFormElement($understandingInfo, '.understanding_name_add, .understanding_document_number_add, .understanding_telephone_add', 'false');
            }

            // Toggle PETC            
            if(codAssintance == "PETC"){
              $petcInfo.show();               
              self.updateFormElement($petcInfo, '.petc_type_add, .petc_weight_add', 'true');
            }else{              
              $petcInfo.hide();
              self.updateFormElement($petcInfo, '.petc_type_add, .petc_weight_add', 'false');
            }

            $layerComplementSelect.removeClass('non_editable');

            // refresh info_assistance
            $infoAssistance.show();
            $infoAssistanceDescription.html(self.searchAssitanceDescription(codAssintance)); 

            Bus.publish('services', 'getAssistanceComplement', {
              assistance: $this.val(),
              success: function(data) {
                var optionsHtml = '';
                // if (!data || !data.header || !data.header.error || !data.body || !data.body.data) {
                if (!data.header.error) {
                  optionsHtml = '<option value=""></option>';
  
                  $.each(data.body.data, function(indexReg, dataReg){
                    optionsHtml += '<option value="'+dataReg.code+'">'+dataReg.description+'</option>';
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
                  $layerComplementSelect.find('select').attr('tabindex',tabindex);
                  $layerComplementInput.find('input').attr('tabindex','');

                  // assign events to assintive select
                  $complementSelect.on('change', function(){
                    var $this = $(this);
                    var codAssintanceComplement = $this.val();

                    if(codAssintanceComplement == "SEAT"){
                      $assistanceGroupWrapper.show();              
                      self.updateFormElement($assistanceGroupWrapper, '.radio', 'true');
                    }else{              
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
          }else{

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
        $complementSelect.on('change', function() {
          var $this = $(this);

          var textValue1 = $assintiveSelect.find('option:selected').text();
          var textValue2 = $this.find('option:selected').text();

          if (textValue2 != '') {
            $this.closest('.passengers_info').find('.add-assistance').text(', '+textValue1+' - '+textValue2);
          } else {
            $this.closest('.passengers_info').find('.add-assistance').text('');
          }
        });

      });

      $.each(checkboxHelp, function(index, checkbox){
        $(checkbox).on('change', function() {
          var $this = $(this);

          if (!$this.prop('checked')) {
            $this.closest('.passengers_info').find('.add-assistance').hide();
          } else {
            $this.closest('.passengers_info').find('.add-assistance').show();
          }
        });
      });

      $.each(checkboxWheelchair, function(index, checkbox){
        $(checkbox).on('change', function() {
          var $this = $(this);

          if (!$this.prop('checked')) {
            $this.closest('.passengers_info').find('.wheelchair-assistance').hide();
          } else {
            $this.closest('.passengers_info').find('.wheelchair-assistance').show();
          }
        });
      });

      $.each(checkboxAssistance, function(index, checkbox){
        $(checkbox).on('change', function() {
          var $this = $(this);       

          if($this.hasClass('case_yes')){
              var check = $this.closest('.assistance_options').find('.case_no');
              check.attr('disabled', 'disabled');
              check.closest('.radio').addClass('disabled');
          }else{
              var check = $this.closest('.assistance_options').find('.case_yes');
              check.attr('disabled', 'disabled');
              check.closest('.radio').addClass('disabled');
          }
        });
      });
      
    },

    searchAssitanceDescription: function(codAsistance){
      var listAsistance = this.pmrFormCache.services.list_assistance;
      var descriptionAsistance;
      $.each(listAsistance, function(index, assistance){
        if(assistance.code === codAsistance){
          descriptionAsistance = assistance.explanation;
        }
      });
      return descriptionAsistance;
    },

    /* Helper for tabindex setup */
    setTabindex: function() {

      /* Clean previous tab index */
      $('body').find('input[tabindex], select[tabindex]').attr('tabindex', '');

      var tabindex = 1;

      this.element.find('input, select').each(function() {
        if (this.type != "hidden") {
          var $input = $(this);
          if($input.hasClass("ocult")){
            $input.attr('tabindex', -1);
          }else{
            $input.attr('tabindex', tabindex);
            tabindex++;
          }
        }
      });
    },


    showFormError: function($form) {
      var $content = this.element.find('.process_scroll');
      var $field = $form.find('.field.error').not('.disabled');
      var $hasCond = false;
      var errorCondition = ($field.closest('.understanding_info').length != 0 || $field.closest('.deaf_blind_info').length != 0)? true :false
     
      /* Show the messages */
      $form.addClass('error');
      if ($form.find('.block_body .form_error').length == 0) {
        //check fields error are deaf_blind_info or understanding_info
        if(!errorCondition){
          $form.find('.block_body').prepend('<div class="form_error"><div class="error_message error_head"><p>' + lang('general.formError') + '</p></div></div>');  
        }else{
          $form.find('.block_body').prepend('<div class="form_error"><div class="error_message error_head"><p class="error_pmr">' + lang('general.formError') + '</p><p class="error_pmr">' + lang('pmr_form.conditional_error_msg') + '</p></div></div>');
        }
      }else{
        if(!errorCondition){
          $form.find('.block_body .form_error').html('<div class="error_message error_head"><p>' + lang('general.formError') + '</p></div></div>');  
        }else{
          $form.find('.block_body .form_error').html('<div class="error_message error_head"><p class="error_pmr">' + lang('general.formError') + '</p><p class="error_pmr">' + lang('pmr_form.conditional_error_msg') + '</p></div></div>');
        }

      } 
      


      $form.find('.initial_status').not('.disabled').removeClass('initial_status');

      /* Scroll to the top of the form to show the error */
      Bus.publish('scroll', 'scrollTo', {element: $content.get(), position: $field.position().top});
    },

    /* Show field errors from passengers form */
    showFieldErrors: function($form, errors) {
      var self = this;
      var techMessage = '';

      $.each(errors, function(indexError, error) {
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
          techMessage += ' / '+error.field+' > '+error.message;
        }
        else if (type == 'passengers' || type == 'frequentflyer') {
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
        $('#pmr').ui_dialog({
          title: lang('general.error_title'),
          error: true,
          subtitle: techMessage,
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
    },

    updateFormElement: function(parentElement, element, state, noParent){
        if(noParent){
          element.attr('data-required', state);
          element.attr('data-init', 'restart');
          element.closest('form').form('restartFields');
        }else{
         
          if(state === 'false'){
            parentElement.find('input').val('');
          }

          parentElement.find(element).attr('data-required', state);
          parentElement.find(element).attr('data-init', 'restart');
          parentElement.closest('form').form('restartFields');
        }
    }

  };
});