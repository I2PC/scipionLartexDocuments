Hydra.module.register('Inner', function (Bus, Module, ErrorHandler, Api) {

  return {
    selector: '.inner #content',
    element: undefined,
    navBarTop: undefined,
    /* Inner cache */
    innerCache: {},
    maxFlights: 2,
    events: {
      'inner': {
        'custom_init': function () {
          this.customInit();
        },
        'reloadExpandableBlocks': function(){
          this.expandableBlocks();
        }
      },
      'subnav': {
        'opened': function (oNotify) {
          var self = this;
          var $indexContent;
          if (this.element.find('.nav_bar').length > 0) {
            setTimeout(function () {
              self.updateNavBarTop();
            }, 650);
          }
        },
        'closed': function (oNotify) {
          var self = this;
          var $indexContent;
          if (this.element.find('.nav_bar').length > 0) {
            setTimeout(function () {
              self.updateNavBarTop();
            }, 650);
          }
        }
      }
    },
    init: function () {
      this.customInit();
    },
    customInit: function () {
      var self = this;

      /* Save jquery object reference */
      this.element = $(this.selector);

      if (this.element.length > 0) {

        this.loadSimulator();

        /* Check if info_header is present */
        if (self.element.find('.info_header').length > 0) {
          $('body').addClass('with_info_header');
        }

        /* Get inner data */
        if (this.element.find('.contact_form').length > 0) {
          Bus.publish('proccess', 'get_inner_data', {callback: function (responseData) {
              self.innerCache = responseData;
              /* Start form set data before other proccesses */
              self.setFormData();
            }});
        }
        else {
          this.startFormsInteractions();
        }

        /* Cache navbar top position*/
        this.updateNavBarTop();
        this.generalOffset = this.element.find('.nav_bar').height();

        /* If there's a helpdesk phone number, get it from the services */
        if (this.element.find('.hero.helpesk_phone').length > 0) {
          this.getHelpdeskPhone();
        }

        /* Nav bar events */
        this.navBarScrollListener();
        this.bindNavBarEvents();

        /* Text elements */
        this.expandableBlocks();

        /* Content index events */
        if (this.element.find('.inner_content_index').length > 0) {
          this.indexScrollListener();
          this.scrollSpy();
          this.indexEvents();
        }

        self.setTabindex();
      }

      /* Update navbartop on resize */
      $(window).on('resize.ev_inner', function () {
        if (self.element.find('.inner_content_index').length > 0) {
          self.updateNavBarTop();
        }
      });

      /* Touch events */
      this.touchEvents();
      
      $("body").scroll();
      
      this.wrapTables();
    },
    wrapTables: function(){
      $('div.expandable table').wrap('<div class="wrapTable"></div>');
    },
    /* Helper for tabindex setup */
    setTabindex: function () {

      /* Clean previous tab index */
      $('body').find('input[tabindex], select[tabindex], textarea[tabindex], .submit_button > button[tabindex]').attr('tabindex', '');

      var tabindex = 1;

      this.element.find('input, select, textarea, .submit_button > button').each(function () {
        if (this.type != "hidden") {
          var $input = $(this);
          if ((!$input.parent().parent().hasClass('hidden')) && (!$input.hasClass('ocult')) && (!$input.parent().parent().hasClass('takeleft'))) {
            $input.attr('tabindex', tabindex);
            tabindex++;
          }
          
        }
      });

      /* Put negative index for hint close links */
      this.element.find('.hint').find('a').attr('tabindex', '-1');

    },
    updateNavBarTop: function () {
      if (this.element.find('.inner_content').length > 0 && this.element.find('.nav_bar').length > 0) {
        this.navBarTop = this.element.find('.inner_content').offset().top;
        this.navBarTop -= this.element.find('.nav_bar').height();
      }
    },
    navBarScrollListener: function () {
      var self = this;
      var $navBar = this.element.find('.nav_bar');

      /* Add to scroll manager the fixed bar callback */
      Bus.publish('scroll', 'bindScrollListener', {events: [
          {
            condition: function (scrollTop) {
              if (self.navBarTop <= 0 || !self.navBarTop) {
                self.updateNavBarTop();
                return true;
              }
              return scrollTop < self.navBarTop
            },
            yep: function () {

              if ($navBar.hasClass('fixed')) { /* Just do it once, when the navbar is fixed */
                $navBar.removeClass('fixed');
                self.element.removeClass('nav_bar_fixed');

                /* Collapse the bar with animation in case it's showing the menu */
                if ($navBar.hasClass('moving') || $navBar.hasClass('hovered')) {
                  /* Remove hovered class */
                  $navBar.removeClass('hovered');

                  /* Add class to control overflow */
                  $navBar.addClass('moving');

                  /* Animate the top of the nav bar wrapper */
                  $navBar.find('.nav_bar_wrapper').stop().animate({
                    top: '-55px'
                  }, 300, 'easeInOutExpo', function () {
                    $navBar.removeClass('moving');
                    self.element.removeClass('nav_bar_fixed');
                  });
                }
                else { /* If it's not show the menu, just unfix it */

                }
              }
            },
            nope: function () {
              if (!$navBar.hasClass('fixed')) {
                $navBar.addClass('fixed');
                self.element.addClass('nav_bar_fixed');
              }
            }
          }
        ]});

    },
    bindNavBarEvents: function () {
      var self = this;
      var $navBar = this.element.find('.nav_bar');

      /* Menu trigger hover event */
      $navBar.find('.menu_trigger a').hover(function () {

        if ($navBar.hasClass('fixed')) {
          /* Add class to control overflow */
          $navBar.addClass('moving');

          /* Animate the top of the nav bar wrapper */
          $navBar.find('.nav_bar_wrapper').stop().animate({
            top: '0'
          }, 300, 'easeInOutExpo', function () {
            /* Remove overflow class */
            $navBar.addClass('hovered');
            $navBar.removeClass('moving');
          });
        }

      }, function () {
      });

      /* Nav bar out event */
      $navBar.hover(function () {
      }, function () {

        if ($navBar.hasClass('fixed')) {
          /* Add class to control overflow */
          $navBar.addClass('moving');

          /* Remove hovered class */
          $navBar.removeClass('hovered');

          /* Animate the top of the nav bar wrapper */
          $navBar.find('.nav_bar_wrapper').stop().animate({
            top: '-55px'
          }, 300, 'easeInOutExpo', function () {
            /* Remove overflow class */
            $navBar.removeClass('moving');
          });
        }
      });

      /* Back to top event */
      $navBar.find('.back_to_top a').on('click', function (event) {
        event.preventDefault();

        Bus.publish('scroll', 'scrollTo', {});
      });
    },
    getHelpdeskPhone: function () {
      var self = this;

      /* Call SERVICE module to get the json */
      Bus.publish('services', 'getHelpeskPhone', {
        success: function (data) {
          if (data) {
            self.element.find('.hero.helpesk_phone .main_hero_content span').text(data);
          }
        }
      });
    },
    expandableBlocks: function () {
      this.element.find('.inner_block_content .expandable > a, .inner_block_content .expandable .expandable_header a').off('click').on('click', function (event) {
        event.preventDefault();

        var $this = $(this);
        var $expandableBlock = $this.closest('.expandable');

        /* Toggle class */
        if ($expandableBlock.hasClass('expanded')) {
          $expandableBlock.removeClass('expanded');
        }
        else {
          $expandableBlock.addClass('expanded');
          
          /* If the actual page is faqs, track questions on gtm */
          if(restofurl === 'preguntas_frecuentes') {
        	  var $innerBlock = $expandableBlock.closest('.inner_block');
        	  var blockId = $innerBlock.attr('id');
        	  var pageContent = '';
        	  switch(blockId) {
        	  case 'programa-suma':
        		  pageContent = 'programa_';
        		  break;
        	  case 'tarjeta-suma':
        		  pageContent = 'tarjeta_';
        		  break;
        	  case 'niveles-suma':
        		  pageContent = 'niveles_';
        		  break;
        	  case 'operaciones-millas':
        		  pageContent = 'operaciones-con-millas_';
        		  break;
        	  case 'datos-personales':
        		  pageContent = 'datos-personales_';
        		  break;
        	  case 'myaea':
        		  pageContent = 'myaireuropa_';
        		  break;
        	  case 'flying blue':
        		  pageContent = 'flyingblue_';
        		  break;
        	  }
        	  if(pageContent !== '') {
        		  pageContent += $this.find('span').text();
        		  updateGtm({
                      'pageArea': 'SUMA-informacion',
                      'pageCategory': 'preguntas-frecuentes',
                      'pageContent': pageContent
                    });

        	  }
          }
          
          /* If the actual page is loyalty, track questions on gtm */
          if(restofurl === 'fidelizacion' && $expandableBlock.closest('.inner_block').attr('data-anchor') === 'preguntas-frecuentes') {
        	  var $title = $expandableBlock.prevAll('div:not([class])').first().find('.sub_section_title span');
        	  var blockTitle = $title.text().trim();
        	  var pageContent = '';
        	  switch(blockTitle) {
        	  case 'Programa Air Europa SUMA':
        		  pageContent = 'programa_';
        		  break;
        	  case 'Tarjeta Air Europa SUMA':
        		  pageContent = 'tarjeta_';
        		  break;
        	  case 'NIVELES SUMA':
        		  pageContent = 'niveles_';
        		  break;
        	  case 'OPERACIONES CON MILLAS':
        		  pageContent = 'operaciones-con-millas_';
        		  break;
        	  case 'DATOS PERSONALES':
        		  pageContent = 'datos-personales_';
        		  break;
        	  case 'MYAIREUROPA':
        		  pageContent = 'myaireuropa_';
        		  break;
        	  case 'FLYING BLUE':
        		  pageContent = 'flyingblue_';
        		  break;
        	  }
        	  if(pageContent !== '') {
        		  pageContent += $this.find('span').text();
        		  updateGtm({
                      'pageArea': 'SUMA-informacion',
                      'pageCategory': 'preguntas-frecuentes',
                      'pageContent': pageContent
                    });

        	  }
          }
        }
      });
    },
    startForms: function () {
      var self = this;
      var errorFieldTopPos = 0;

      /* Start contact forms */
      this.element.find('.inner_block.contact_form form').form({
        onError: function (form) {
          form.element.find('.initial_status').not('.disabled').removeClass('initial_status');

          /* Get first field error and scroll */
          var $destinyBlock = form.element.find('.error').eq(0);
          var blockPaddingTop = parseInt($destinyBlock.css('padding-top').replace('px', ''));
          var blockOffset = (blockPaddingTop == 0) ? 30 : -30;
          /* Send scroll to the form */
          Bus.publish('scroll', 'scrollTo', {position: $destinyBlock.offset().top - self.generalOffset + 1 - blockOffset});
        },
        onSubmit: function (form) {
          self.slideStep('2', form.element.attr('data-block'));
        }
      });

      /* Start filter forms */
      this.element.find('.inner_block.offices form').form();

    },
    startFormsInteractions: function () {
      var self = this;

      /* Edit - back button in data validation */
      this.element.find('.inner_block_content.step2').find('.back_edit').on('click', function (e) {
        e.preventDefault();
        self.putDataIntoValidation($(this).attr('data-block'));
        self.slideStep('1', $(this).attr('data-block'));
      });

      /* Send form action for suggestions */
      this.element.find('.inner_block_content.step2').find('.submit_data').on('click', function (e) {
        e.preventDefault();
        var $this = $(this);
        self.sendData($this.attr('data-block'), $this);
      });

      /* Radio inline behaviour */
      this.element.find('.inner_block form .radio_inline .radio input').on('change', function () {
        var $this = $(this);
        var label = $this.closest('.field_wrapper').find('label').text();
        var $destinyBlock = $this.closest('.inner_block')
        var $submitLabel = $this.closest('form').find('.submit button strong');
        var $extra = $this.closest('form').find('.extra');
        var $toggleObjects = self.element.find('.inner_block_content.step1').find('.toggle_visible');
        var blockPaddingTop = parseInt($destinyBlock.css('padding-top').replace('px', ''));
        var blockOffset = (blockPaddingTop == 0) ? 30 : -30;

        /* Update the submit label if it exists */
        $submitLabel.text(label);

        /* Send scroll to the form */
        Bus.publish('scroll', 'scrollTo', {position: $destinyBlock.offset().top - self.generalOffset + 1 - blockOffset});

        /* Show extra fieldset */
        $extra.slideDown({
          duration: 500,
          easing: 'easeInOutExpo'
        });

        /* If claim 'R', put required fields */
        self.checkRequiredFields($this);

        if ($this.hasClass('invoice')) {
          if ($this.val() == 'PERSONAL') {
            self.element.find('.inner_block_content.step1').find('[name="field_name"]').attr('placeholder', lang('general.name'));
            $toggleObjects.show();
            $toggleObjects.attr('data-required', 'true').removeClass('valid filled');
            self.element.find('.inner_block_content.step1').find('#field_secondname').closest('.toggle_visible').attr('data-required', 'false');
          } else {
            self.element.find('.inner_block_content.step1').find('[name="field_name"]').attr('placeholder', lang('general.name_social'));
            $toggleObjects.hide();
            $toggleObjects.attr('data-required', 'false').removeClass('valid filled');
          }
          $toggleObjects.attr('data-init', 'restart');
        }

      });

      /* Reason select change behaviour */
      this.element.find('.reason').find('select').on('change', function () {
        var $this = $(this);
        self.checkRequiredFields($this);
      });

      /* Docuemnt type select change behaviour */
      this.element.find('.document_type_validation').find('select').on('change', function () {
        var $this = $(this);
        self.documentTypeValidation($this);
      });

      /* Add another flight */
      this.element.find('.inner_block form .flights .add a').on('click', function (event) {
        event.preventDefault();

        var $this = $(this);
        var $flightModel = $this.closest('.flights').find('.flight').eq(0).clone();
        var newIndex = $this.closest('.flights').find('.flight').length;

        if (newIndex < self.maxFlights) {
          /* Loop over fields */
          $flightModel.find('.field').each(function () {
            var $this = $(this);
            var $field = $this.find('select, input');
            var $label = $this.find('label');

            var idField = $field.attr('id');
            var newId = idField.replace('field_0_', 'field_' + newIndex + '_');

            /* Change input names */
            $field.attr('id', newId);
            $field.attr('name', newId);
            $label.attr('for', newId);

            /* Change class attr and data-input-target, for date fields */
            var classField = $field.attr('class');
            if (typeof classField !== 'undefined') {
              var newClass = classField.replace('field_0_', 'field_' + newIndex + '_');
              $field.attr('class', newClass);
            }

            var dataInputTargetField = $field.attr('data-input-target');
            if (typeof dataInputTargetField !== 'undefined') {
              var newClass = dataInputTargetField.replace('field_0_', 'field_' + newIndex + '_');
              $field.attr('data-input-target', newClass);
            }

            /* Clean data-service-name attribute and make it unrequired */
            $this.attr('data-service-name', '');
            $this.attr('data-required', '');

            /* Clean fields */
            $field.val('').find('option').prop('selected', false).change();

            /* Clean validation status */
            $this.addClass('initial_status').removeClass('error valid filled errorper');

            /* Clean init flag */
            $this.removeAttr('data-init');
          });

          /* Append to flights */
          $this.closest('.flights').find('.flights_list').append($flightModel);

          /* Restart flight date actions */
          $(".flight_date_input").unbind('change');
          self.flightDateActions();

          /* Reassign forms to validate the added fields */
          // console.log("Vamos a llamar a restar fields");
          $this.closest('.inner_block form').form('restartFields');
        }
      });

      /* Filter forms */
      this.element.find('.inner_block.offices .cities_filter select').on('change', function (event) {
        var $select = $(this);
        var $option = $select.find('option:selected');
        var value = $option.attr('value');
        var $infoBlock;

        if (value != '') {
          /* Get the info block */
          $infoBlock = $('#' + value);

          /* Send scroll to the section */
          if(self.element.find('.nav_bar').hasClass('fixed')) {
        	  Bus.publish('scroll', 'scrollTo', {position: $infoBlock.offset().top - self.element.find('.nav_bar').height() + 1});
          } else {
        	  Bus.publish('scroll', 'scrollTo', {position: $infoBlock.offset().top - (self.element.find('.nav_bar').height()*2) + 2});
          }

          /* Reset scroll selects */
          self.element.find('.field.select_field select').find('option').prop('selected', false).change();
        }
      });

      /* Add action for country select to filter provinces */
      this.element.find('.select_field.country').find('select').on('change', function(){
        var $this = $(this);
        var $regionSelect = self.element.find('.select_field.region');
        var $regionSelectEl = $regionSelect.find('select');
        var $regionSelectLabel = $regionSelect.find('label');

        /* Loading region select */
        $regionSelectEl.attr('disabled', 'disabled');

        if ($this.val() == '') {
          $regionSelectLabel.text(lang('inner.province'));
        } else {
          $regionSelectLabel.text(lang('inner.loading'));

          Bus.publish('services', 'getRegionFromCountry', {
            countryCode: $this.val(),
            success: function(data) {
              var optionsHtml = '';
              if (!data.header.error) {
                optionsHtml = '<option value=""></option>';
                $regionSelectEl.removeAttr('disabled');
                $.each(data.body.data, function(indexReg, dataReg){
                  optionsHtml += '<option value="'+dataReg.code+'">'+dataReg.description+'</option>';
                });
                $regionSelectEl.html(optionsHtml);
                $regionSelectLabel.text(lang('inner.province'));
              } else {
                optionsHtml = '<option value="UNK" selected="selected">'+data.header.message+'</option>';
                $regionSelectEl.html(optionsHtml);
                $regionSelectLabel.text(data.header.message);
                $regionSelect.find('span.selected_value').text(data.header.message);
                $regionSelectEl.val('UNK');
              }
              if ($regionSelect.hasClass('error') || $regionSelect.hasClass('valid') || $regionSelect.hasClass('filled')) {
                $regionSelect.removeClass('error valid filled');
                $regionSelect.attr('data-init', 'restart');
                /* Reassign forms to validate the added fields */
                $this.closest('form').form('restartFields');
              }
            }
          });
        }
      });
        
        this.element.find('.select_field.airports.from').find('select').on('change', function(){
        var $this = $(this);
        var $airportSelect = ($this.closest('.select_field').hasClass('origin'))? self.element.find('.airports.to.origin') : self.element.find('.airports.to.destiny');
        var $airportSelectEl = $airportSelect.find('select');
        var $airportSelectLabel = $airportSelect.find('label');
        $airportSelect.find('.field_wrapper').removeClass('desactive');

        $airportSelectEl.attr('disabled', 'disabled');

        if ($this.val() == '') {
          optionsHtml = '<option value=""></option>';
          $airportSelectEl.html(optionsHtml);
          $airportSelectEl.trigger('blur');
          $airportSelect.find('.field_wrapper').addClass('desactive');
          $airportSelect.addClass('initial_status');
        }else{
          Bus.publish('services', 'getAirportFrom',{
            airportCode: $this.val(),
            success: function(data) {
              var optionsHtml = '';
              if(!data.header.error) {
                optionsHtml = '<option value=""></option>';
                $airportSelectEl.removeAttr('disabled');
                $.each(data.body.data, function(indexReg, dataReg){
                  optionsHtml += '<option value="'+dataReg.code+'">'+dataReg.description+'</option>';
                });
                $airportSelectEl.html(optionsHtml);
                $airportSelectEl.trigger('blur');
                $airportSelect.addClass('initial_status');
              }else{
                $('.support').ui_dialog({
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
                  ]
                });
              }
            }
          });
        }
      });   

      /* Add action when FFtype changes, to fill FFlevel select */
      this.element.find('.select_field.frequent_flyer_program').find('select').on('change', function() {
        var $this = $(this);
        var selectedValue = $this.val();

        /* Field and select info */
        var $levelField = self.element.find('.select_field.frequent_flyer_level');
        var $levelSelect = $levelField.find('select');
        $levelSelect.attr('disabled', 'disabled');

        /* Label info */
        var $levelLabel = $levelField.find('label');
        var levelLabelDefaultValue = $levelLabel.attr('data-default-value');

        if ($this.val() == '') {
          /* Empty value selected */
          $levelLabel.text(levelLabelDefaultValue);
        } else {
          /* Call service to get level list */
          $levelLabel.text(lang('inner.loading'));

          if (selectedValue === 'UX') {
            Bus.publish('services', 'getFFlevelSuma', {
              success: function(data) {
                var optionsHtml = '';

                if (!data.header.error) {
                  /* Set options */
                  optionsHtml = '<option value=""></option>';
                  $levelSelect.removeAttr('disabled');
                  $.each(data.body.data, function(indexReg, dataReg){
                    optionsHtml += '<option value="'+dataReg.loyaltyTier.type+'">'+dataReg.loyaltyTier.description+'</option>';
                  });
                  $levelSelect.html(optionsHtml);
                  $levelLabel.text(levelLabelDefaultValue);
                } else {
                  /* Unknown value */
                  optionsHtml = '<option value="UNK" selected="selected">'+data.header.message+'</option>';
                  $levelSelect.html(optionsHtml);
                  $levelLabel.text(data.header.message);
                  $levelField.find('span.selected_value').text(data.header.message);
                  $levelSelect.val('UNK');
                }

                /* Reassign forms to validate the added fields */
                if ($levelField.hasClass('error') || $levelField.hasClass('valid') || $levelField.hasClass('filled')) {
                  $levelField.removeClass('error valid filled');
                  $levelField.attr('data-init', 'restart');

                  $this.closest('form').form('restartFields');
                }
              }
            });
          } else {
            Bus.publish('services', 'getFFleveFromFFtype', {
              frequentFlyerTypeCode: selectedValue,
              success: function(data) {
                var optionsHtml = '';

                if (!data.header.error) {
                  /* Set options */
                  optionsHtml = '<option value=""></option>';
                  $levelSelect.removeAttr('disabled');
                  $.each(data.body.data, function(indexReg, dataReg){
                    optionsHtml += '<option value="'+dataReg.code+'">'+dataReg.name+'</option>';
                  });
                  $levelSelect.html(optionsHtml);
                  $levelLabel.text(levelLabelDefaultValue);
                } else {
                  /* Unknown value */
                  optionsHtml = '<option value="UNK" selected="selected">'+data.header.message+'</option>';
                  $levelSelect.html(optionsHtml);
                  $levelLabel.text(data.header.message);
                  $levelField.find('span.selected_value').text(data.header.message);
                  $levelSelect.val('UNK');
                }

                /* Reassign forms to validate the added fields */
                if ($levelField.hasClass('error') || $levelField.hasClass('valid') || $levelField.hasClass('filled')) {
                  $levelField.removeClass('error valid filled');
                  $levelField.attr('data-init', 'restart');

                  $this.closest('form').form('restartFields');
                }
              }
            });
          }
        }
      });

      /* Countdown for textareas */
      this.lengthRestriction(this.element.find('.field_message'), this.element.find('.maxlength'));

      /* Vip room filters - It's in a delegate on body since it's a lightbox content */
      $('body').on('change', '.rooms_filter select', function (event) {
        event.preventDefault();

        var $select = $(this);
        var $option = $select.find('option:selected');
        var value = $option.attr('value');
        var $roomsBlock = $select.closest('.rooms_block');
        var $infoBlock;

        if (value != '') {
          /* Get the info block */
          $infoBlock = $roomsBlock.find('#' + value);

          /* Hide other room items */
          $roomsBlock.find('.rooms_list .rooms_item').hide();

          /* Show current one */
          $infoBlock.show();
        }
      });

      $('body').find('.rooms_filter select').change();

    },
    sendData: function (block, $button) {
      var self = this;
      var $currentBlock = self.element.find('form[data-block='+block+']').closest('.inner_block');
      var $form = $currentBlock.find('form');

      $button.addClass('loading');

      var formData = $form.serializeObject();

      /* SUGGESTIONS BLOCK */
      if (block == '#suggestions') {
        var flightsNumber = self.element.find('.inner_block_content.step1').find('.flights_list').children().length;
        if (flightsNumber == 1 && formData.field_0_airline.length == 0) {
          flightsNumber = 0;
        }

        Bus.publish('services', 'createClaim', {
          data: formData,
          numberOfFlights: flightsNumber,
          success: function (data) {

            $button.removeClass('loading');

            if (!data.header.error) {

              /* Send confirmation */
              Bus.publish('services', 'confirmClaim', {
                data: data.body.data,
                success: function (data) {

                  $button.removeClass('loading');

                  if (!data.header.error) {

                    self.innerCache.claimConfirm = data.body.data

                    /* Back to step 3 if success */
                    self.slideStep('3', block);

                  }
                  else {
                    $('.support').ui_dialog({
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
                      ]
                    });
                  }
                }
              });

            }
            else {
              if (data.header.code == 400) {
                self.showFieldErrors($form, data.body.data);
              }
              else {
                $('.support').ui_dialog({
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
                  ]
                });
              }

              /* Back to step 1 anyway */
              self.slideStep('1', block);
            }
          }
        });
      } /* END SUGGESTIONS BLOCK */

      /* INVOICE BLOCK */
      if (block == '#invoices') {
        Bus.publish('services', 'createInvoice', {
          data: formData,
          success: function (data) {

            $button.removeClass('loading');

            if (!data.header.error) {

              /* Back to step 3 if success */
              self.slideStep('3', block);

            } else {
              if (data.header.code == 400) {
                self.showFieldErrors($form, data.body.data);
              }
              else {
                $('.support').ui_dialog({
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
                  ]
                });
              }

              /* Back to step 1 anyway */
              self.slideStep('1', block);
            }
          }
        });
      } /* END INVOICE BLOCK */

      /* GROUPS BLOCK */
      if (block == '#block_group_form') {
        var availableTimes = $currentBlock.find('.inner_block_content.step1 form .field select[name="field_origin_available_times"] option[value=' + formData.field_origin_available_times + ']').text();
        formData.field_origin_available_times_string = availableTimes;
        var availableTimes = $currentBlock.find('.inner_block_content.step1 form .field select[name="field_return_available_times"] option[value=' + formData.field_return_available_times + ']').text();
        formData.field_return_available_times_string = availableTimes;
        Bus.publish('services', 'createGroupRequest', {
          data: formData,
          success: function (data) {

            $button.removeClass('loading');

            if (!data.header.error) {

              /* Back to step 3 if success */
              self.slideStep('3', block);

            } else {
              if (data.header.code == 400) {
                self.showFieldErrors($form, data.body.data);
              }
              else {
                $('.support').ui_dialog({
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
                  ]
                });
              }

              /* Back to step 1 anyway */
              self.slideStep('1', block);
            }
          }
        });
      } /* END GROUPS BLOCK */

    },
    showFieldErrors: function ($form, errors) {
      var self = this;
      var counter = 0;

      $.each(errors, function (indexError, error) {
        /* Get type */
        var field = error.field.replace(/\./g, '_');
        var $errorField = $form.find('[data-service-name*=' + field + ']').closest('.field');

        /* Scroll to first error field */
        if (counter==0) {
          setTimeout(function(){ Bus.publish('scroll', 'scrollTo', {position: $errorField.offset().top - self.generalOffset - 10}); }, 1000);
        }

        /* Show error and set message */
        $errorField.trigger('show_error', [error.message]);
        $errorField.addClass('error').removeClass('valid initial_status');
        $errorField.closest('.field').removeClass('hidden');
        counter++;
      });
    },
    cleanFormAfterSend: function (block) {
      var self = this;
      var $currentBlock = self.element.find('form[data-block='+block+']').closest('.inner_block');

      /* Clean fields of all forms */
      $currentBlock.find('.field input').val('').change();
      $currentBlock.find('.field.select_field select').find('option').prop('selected', false).change();
      $currentBlock.find('.field.textarea_field textarea').val('').text('').change();
      $currentBlock.find('.field.radio').prop('checked', false).change();

      /* Reset fields status */
      $currentBlock.find('.field').addClass('initial_status').removeClass('error valid filled');

      /* Hide extra fieldsets */
      $currentBlock.find('form .extra').hide();
    },
    putDataIntoValidation: function (block) {
      var self = this;
      var $currentBlock = self.element.find('form[data-block='+block+']').closest('.inner_block');

      var data = $currentBlock.find('.inner_block_content.step1').find('form').serializeObject();

      /* SUGGESTIONS BLOCK */
      if (block == '#suggestions') {

        var numberOfFlights = $currentBlock.find('.inner_block_content.step1').find('.flights_list').children().length;
        if (numberOfFlights == 1 && data.field_0_airline.length == 0) {
          numberOfFlights = 0;
        }

        /* Type */
        var typeId = $currentBlock.find('.inner_block_content.step1 form .radio_inline .radio input[value=' + data.field_suggestions_type + ']').attr('id');
        var typeValue = $currentBlock.find('.inner_block_content.step1 form .radio_inline .radio label[for=' + typeId + '] span').text();
        $currentBlock.find('.inner_block_content.step2').find('.confirm.type').find('span').text(typeValue);

        /* Reason */
        var reasonValue = '';
        var reasonArray = [];
        $.each(data.field_reason, function (indexReason, dataReason) {
          self.element.find('.inner_block_content.step1 form .field.reason select option').each(function () {
            if ($(this).attr('value') == dataReason) {
              reasonArray.push($(this).text());
              return false;
            }
          });
        });
        reasonValue = reasonArray.join(", ");
        $currentBlock.find('.inner_block_content.step2').find('.confirm.reason').text(reasonValue);

        /* Country and province data */
        var countryCode = data.field_country;
        var provinceCode = data.field_region;
        var ffCode = data.field_ff_type;
        var countryValue, provinceValue, ffValue = '';

        self.element.find('.inner_block_content.step1 form .field.country select option').each(function () {
          if ($(this).attr('value') == countryCode) {
            countryValue = $(this).text();
            return false;
          }
        });

        self.element.find('.inner_block_content.step1 form .field.region select option').each(function () {
          if ($(this).attr('value') == provinceCode) {
            provinceValue = $(this).text();
            return false;
          }
        });

        self.element.find('.inner_block_content.step1 form .field.frequent_flyer_program select option').each(function() {
          if ($(this).attr('value') == ffCode) {
            ffValue = $(this).text();
            return false;
          }
        });

        if (provinceValue.length > 0) {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.province').text(provinceValue);
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.province').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.province').show();
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.province').hide();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.province').hide();
        }
        if (countryValue.length > 0) {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.country').text(countryValue);
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.country').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.country').show();
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.country').hide();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.country').hide();
        }

        /* Personal data */
        var nameField = data.field_name + ' ' + data.field_surname + ' ' + data.field_second_surname;
        $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.f_name').text(nameField);
        var documentType = $currentBlock.find('.inner_block_content.step1 form .field.document_type select option[value=' + data.field_document_type + ']').text();
        $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.nid').text(documentType);
        $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.nid').text(data.field_document_number);
        $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.email').text(data.field_email);
        var languageType = $currentBlock.find('.inner_block_content.step1 form .field.languages select option[value=' + data.field_language + ']').text();
        $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.language').text(languageType);
        var honorificType = $currentBlock.find('.inner_block_content.step1 form .field.honorific select option[value=' + data.field_honorific + ']').text();
        $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.honorific').text(honorificType);
        if (data.field_phone.length > 0) {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.phone').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.phone').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.phone').text((data.field_phone_prefix!='null'?'+ '+data.field_phone_prefix:'')+' '+data.field_phone);
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.phone').hide();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.phone').hide();
        }
        $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.address').text(data.field_address);
        if (data.field_pir.length > 0) {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.cpir').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.cpir').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.cpir').text(data.field_pir);
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.cpir').hide();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.cpir').hide();
        }
        if ((typeof data.field_ff != "undefined") && (data.field_ff === "1")) {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.fflyer_type').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.fflyer_type').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.fflyer_type').text(ffValue);
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.fflyer_number').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.fflyer_number').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.fflyer_number').text(data.field_ff_number);
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.fflyer_type').hide();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.fflyer_type').hide();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.fflyer_number').hide();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.fflyer_number').hide();
        }
        if (data.field_message.length > 0) {
          $currentBlock.find('.inner_block_content.step2').find('.message_block').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.message').text(data.field_message);
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.message_block').hide();
        }
        if (data.field_locator.length > 0) {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.locator').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.locator').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.locator').text(data.field_locator);
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.locator').hide();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.locator').hide();
        }
        if (data.field_ticket_number.length > 0) {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.ticket_number').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.ticket_number').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.ticket_number').text(data.field_ticket_number);
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.ticket_number').hide();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.ticket_number').hide();
        }

        /* Flights */
        var flightContent = '';
        if (numberOfFlights > 0) {
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').show();
          for (var key = 0; key < numberOfFlights; key++) {
            flightContent += '<h5 class="confirm flight"><span>Datos del vuelo ' + (key + 1) + '</span></h5>';
            flightContent += '<dl class="confirm flight_data">';
            flightContent += '<dt class="company">Compañia</dt>';
            flightContent += '<dd class="company">' + self.element.find('.inner_block_content.step1').find('.field.companies select option[value=' + data['field_' + key + '_airline'] + ']').html() + '</dd>';
            flightContent += '<dt class="flight">Vuelo</dt>';
            flightContent += '<dd class="flight">' + data['field_' + key + '_flight_number'] + '</dd>';
            flightContent += '<dt class="date">Fecha vuelo</dt>';
            flightContent += '<dd class="date">' + data['field_' + key + '_flight_date'] + '</dd>';
            flightContent += '<dt class="departure">Origen</dt>';
            flightContent += '<dd class="departure">' + self.element.find('.inner_block_content.step1').find('.field.departure_airports select option[value=' + data['field_' + key + '_origin_airport'] + ']').html() + '</dd>';
            flightContent += '<dt class="arrival">Destino</dt>';
            flightContent += '<dd class="arrival">' + self.element.find('.inner_block_content.step1').find('.field.arrival_airports select option[value=' + data['field_' + key + '_destiny_airport'] + ']').html() + '</dd>';
            flightContent += '<dt class="cabin_class">Clase</dt>';
            flightContent += '<dd class="cabin_class">' + self.element.find('.inner_block_content.step1').find('.field.cabin_class select option[value=' + data['field_' + key + '_class'] + ']').html() + '</dd>';
            flightContent += '</dl>';
          }
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').html(flightContent);
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').hide();
        }

      } /* END SUGGESTIONS BLOCK */

      /* INVOICES BLOCK */
      if (block == '#invoices') {
        /* Type */
        var typeId = $currentBlock.find('.inner_block_content.step1 form .radio_inline .radio input[value=' + data.field_invoice_type + ']').attr('id');
        var typeValue = $currentBlock.find('.inner_block_content.step1 form .radio_inline .radio label[for=' + typeId + '] span').text();
        $currentBlock.find('.inner_block_content.step2').find('.confirm.type').find('span').text(typeValue);

        $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.f_name').text(data.field_name);
        $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.email').text(data.field_email);
        var documentType = $currentBlock.find('.inner_block_content.step1 form .field.document_type_invoice select option[value=' + data.field_document_type + ']').text();
        $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.nid').text(documentType);
        $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.nid').text(data.field_document_number);
        $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.address').text(data.field_address);
        if (data.field_cp.length > 0) {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.zip').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.zip').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.zip').text(data.field_cp);
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.zip').hide();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.zip').hide();
        }
        if (data.field_region.length > 0) {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.region').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.region').show();
          var region = $currentBlock.find('.inner_block_content.step1 form .field.region select option[value=' + data.field_region + ']').text();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.region').text(region);
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.region').hide();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.region').hide();
        }
        if (data.field_city.length > 0) {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.city').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.city').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.city').text(data.field_city);
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.city').hide();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.city').hide();
        }
        if (data.field_ticket_number.length > 0) {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.ticket_number').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.ticket_number').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.ticket_number').text(data.field_ticket_number);
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.ticket_number').hide();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.ticket_number').hide();
        }
        if (data.field_locator.length > 0) {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.locator').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.locator').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.locator').text(data.field_locator);
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.locator').hide();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.locator').hide();
        }
        if (data.field_invoice_type == 'PERSONAL') {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.f_name').text(lang('general.name'));
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.f_firstname').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.f_firstname').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.f_firstname').text(data.field_firstname);
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.f_secondname').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.f_secondname').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.f_secondname').text(data.field_secondname);
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.f_name').text(lang('general.name_social'));
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.f_firstname').hide();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.f_firstname').hide();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.f_secondname').hide();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.f_secondname').hide();
        }
      }

      /* GROUPS BLOCK */
      if (block == '#block_group_form') {
        $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.contact_person').text(data.field_contact_person);
        $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.email').text(data.field_email);
        $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.phone').text(data.field_phone);
        var originCountry = $currentBlock.find('.inner_block_content.step1 form .field select[name="field_origin_country"] option[value=' + data.field_origin_country + ']').text();
        $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.origin_country').text(originCountry);
        if (data.field_message.length > 0) {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.observations').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.observations').show();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.observations').text(data.field_message);
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dt.observations').hide();
          $currentBlock.find('.inner_block_content.step2').find('.confirm.personal').find('dd.observations').hide();
        }
        /* Flights */
        $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_origin').find('dd.date').text(data.field_flight_date);
        var originCountry = $currentBlock.find('.inner_block_content.step1 form .field select[name="field_origin_country_departure"] option[value=' + data.field_origin_country_departure + ']').text();
        $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_origin').find('dd.departure').text(originCountry);
        var arrivalCountry = $currentBlock.find('.inner_block_content.step1 form .field select[name="field_origin_country_arrival"] option[value=' + data.field_origin_country_arrival + ']').text();
        $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_origin').find('dd.arrival').text(arrivalCountry);
        var availableTimes = $currentBlock.find('.inner_block_content.step1 form .field select[name="field_origin_available_times"] option[value=' + data.field_origin_available_times + ']').text();
        $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_origin').find('dd.times').text(availableTimes);
        $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_origin').find('dd.adults').text(data.field_adults);
        if (data.field_kids.length > 0) {
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_origin').find('dt.kids').show();
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_origin').find('dd.kids').show();
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_origin').find('dd.kids').text(data.field_kids);
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_origin').find('dt.kids').hide();
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_origin').find('dd.kids').hide();
        }
        if (data.field_kids_age.length > 0) {
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_origin').find('dt.kids_age').show();
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_origin').find('dd.kids_age').show();
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_origin').find('dd.kids_age').text(data.field_kids_age);
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_origin').find('dt.kids_age').hide();
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_origin').find('dd.kids_age').hide();
        }

        $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_return').find('dd.date').text(data.field_return_flight_date);
        var originCountry = $currentBlock.find('.inner_block_content.step1 form .field select[name="field_return_country_departure"] option[value=' + data.field_return_country_departure + ']').text();
        $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_return').find('dd.departure').text(originCountry);
        var arrivalCountry = $currentBlock.find('.inner_block_content.step1 form .field select[name="field_return_country_arrival"] option[value=' + data.field_return_country_arrival + ']').text();
        $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_return').find('dd.arrival').text(arrivalCountry);
        var availableTimes = $currentBlock.find('.inner_block_content.step1 form .field select[name="field_return_available_times"] option[value=' + data.field_return_available_times + ']').text();
        $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_return').find('dd.times').text(availableTimes);
        $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_return').find('dd.adults').text(data.field_return_adults);
        if (data.field_return_kids.length > 0) {
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_return').find('dt.kids').show();
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_return').find('dd.kids').show();
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_return').find('dd.kids').text(data.field_return_kids);
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_return').find('dt.kids').hide();
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_return').find('dd.kids').hide();
        }
        if (data.field_return_kids.length > 0) {
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_return').find('dt.kids_age').show();
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_return').find('dd.kids_age').show();
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_return').find('dd.kids_age').text(data.field_return_kids_age);
        } else {
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_return').find('dt.kids_age').hide();
          $currentBlock.find('.inner_block_content.step2').find('.flight_info').find('.flight_data_return').find('dd.kids_age').hide();
        }
      }
    },
    slideStep: function (step, block) {
      var self = this;
      var $currentBlock = self.element.find('form[data-block='+block+']').closest('.inner_block');
      var leftBlock = $currentBlock.position();

      /* Put data into correct fields */
      self.putDataIntoValidation(block);

      $('html, body').animate({scrollTop: $($currentBlock).offset().top - 75}, function () {
        if (step == "3") {
          $currentBlock.find('.inner_block_content.step2').fadeOut(300, function () {
            //Put claim ID data in success message
            if (block == '#suggestions') {
              $currentBlock.find('.success_subtitle').text(lang('general.claim_number') + ' ' + self.innerCache.claimConfirm.crmRelationId);
            }
            $currentBlock.find('.inner_block_content.step3').fadeIn(500);
          });
        }
        if (step == "2") {
          $currentBlock.find('.inner_block_content.step1').fadeOut(300, function () {
            //console.log("REVISO DATOS");
            $currentBlock.find('.inner_block_content.step2').fadeIn(500);
          });
        }
        if (step == "1") {
          $currentBlock.find('.inner_block_content.step3').fadeOut(300);
          $currentBlock.find('.inner_block_content.step2').fadeOut(300, function () {
            //console.log("EDITO DATOS");
            $currentBlock.find('.inner_block_content.step1').fadeIn(500);
          });
        }
      });
    },
    /* Function to check if are required fields in form */
    checkRequiredFields: function (obj) {
      var self = this;
      var $this = obj;
      var requiredFor = 0;
      var validateFlightDates = false;

      /* Cache fields */
      var $pir = this.element.find('.text_field.field_pir');
      var $firstFlight = this.element.find('.flight_fields').eq(0);
      var $ticketNumber = this.element.find('.text_field.ticket_number');
      var $field_reason = $('#field_reason');
      var $flightDates = this.element.find('.flight_date');

      /* if reason is not only 7 or 8 */
      if ($field_reason.val()) {
        if ($field_reason.val().indexOf('7') != -1 && $field_reason.val().length == 1) {
          requiredFor = 2;
        }
        if ($field_reason.val().indexOf('8') != -1 && $field_reason.val().length == 1) {
          requiredFor = 2;
        }
        if (($field_reason.val().indexOf('7') != -1 && $field_reason.val().indexOf('8') != -1) && $field_reason.val().length == 2) {
          requiredFor = 2;
        }
        if ($field_reason.val().indexOf('E')!=-1){
          requiredFor = 1;
        }
      }

      switch ($this.attr('id')) {

        case 'suggestion_R': /* Rules applied to field suggestion */

          /* Make pir required/unrequired */
          if (requiredFor == 1) {
            $pir.attr('data-required', 'true').removeClass('valid filled');
            $pir.removeClass('hidden');
          } else {
            $pir.attr('data-required', 'false').removeClass('valid filled');
            $pir.addClass('hidden');
          }
          $pir.attr('data-init', 'restart');

          /* Optional helper */
          $firstFlight.find('.text_field').find('span.helper').text('opt.');
          $ticketNumber.find('span.helper').text('opt.');

          /* First flight and ticket number logic */
          if (requiredFor != 2) {
            $firstFlight.find('.text_field').attr('data-required', 'true').removeClass('valid filled');
            $firstFlight.find('.select_field').attr('data-required', 'true').removeClass('valid filled');
            $ticketNumber.attr('data-required', 'true').removeClass('valid filled');
            $firstFlight.find('.text_field').find('span.helper').text('');
            $ticketNumber.find('span.helper').text('');
          } else {
            $firstFlight.find('.text_field').attr('data-required', 'false').removeClass('valid filled');
            $firstFlight.find('.select_field').attr('data-required', 'false').removeClass('valid filled');
            $ticketNumber.attr('data-required', 'false').removeClass('valid filled');
          }

          /* Restart fields */
          $firstFlight.find('.text_field').attr('data-init', 'restart');
          $firstFlight.find('.select_field').attr('data-init', 'restart');
          $ticketNumber.attr('data-init', 'restart');
          break;

        case 'field_reason': /* Rules applied to field reasons */

          /* Update flight date fields format */
          /* If reason #1 is selected, flight date doesn't have to be less-or-equal than today */
          if ($field_reason.val() && $field_reason.val().indexOf('1') != -1) {
            $flightDates.attr('data-format', 'ddmmyyyy').attr('data-init', 'restart');
          } else {
            $flightDates.attr('data-format', 'ddmmyyyy_le_today').attr('data-init', 'restart');
          }

          validateFlightDates = true;

          /* Make pir required/unrequired */
          if ($('#suggestion_R').is(':checked') && requiredFor == 1) {
            $pir.attr('data-required', 'true').removeClass('valid filled');
            $pir.removeClass('hidden');
          } else {
            $pir.attr('data-required', 'false').removeClass('valid filled');
            $pir.addClass('hidden');
          }
          $pir.attr('data-init', 'restart');

          /* Optional helper */
          $firstFlight.find('.text_field').find('span.helper').text('opt.');
          $ticketNumber.find('span.helper').text('opt.');

          /* First flight and ticket number logic */
          if ($('#suggestion_R').is(':checked') && requiredFor != 2) {
            $firstFlight.find('.text_field').attr('data-required', 'true').removeClass('valid filled');
            // $firstFlight.find('.select_field').attr('data-required', 'true').removeClass('valid filled');
            $firstFlight.find('.select_field').attr('data-required', 'true');
            $flightDates.removeClass('optional_date');
            $ticketNumber.attr('data-required', 'true').removeClass('valid filled');
            $firstFlight.find('.text_field').find('span.helper').text('');
            $ticketNumber.find('span.helper').text('');
          } else {
            $firstFlight.find('.text_field').attr('data-required', 'false').removeClass('valid filled');
            // $firstFlight.find('.select_field').attr('data-required', 'false').removeClass('valid filled');
            $firstFlight.find('.select_field').attr('data-required', 'false');
            $flightDates.addClass('optional_date');
            $ticketNumber.attr('data-required', 'false').removeClass('valid filled');
          }

          /* Restart fields */
          $firstFlight.find('.text_field').attr('data-init', 'restart');
          $firstFlight.find('.select_field').attr('data-init', 'restart');
          $ticketNumber.attr('data-init', 'restart');
          break;

        default:
          /* By default, if is claim, flight fields are required */
          if ($('#suggestion_R').is(':checked')) {
            $firstFlight.find('.text_field').attr('data-required', 'true').removeClass('valid filled');
            $firstFlight.find('.select_field').attr('data-required', 'true').removeClass('valid filled');
            $ticketNumber.attr('data-required', 'true').removeClass('valid filled');
            $firstFlight.find('.text_field').find('span.helper').text('');
            $ticketNumber.find('span.helper').text('');
          }
      }

      /* Reassign forms to validate the added fields */
      $this.closest('form').form('restartFields');

      if (validateFlightDates === true) {
        $(".flight_date_input").unbind('change');
        self.flightDateActions();

        $(".flight_date_input").trigger('change', [{ disableFocus: true }]);
      }
    },
    documentTypeValidation: function ($select) {
      /* Get select value and text */
      var $option = $select.find('option:selected');
      var value = $option.attr('value');
      var $number = $select.closest('form').find('.document_number');
      var $numberInput = $number.find('input');

      /* DNI / Congress */
      if (value == 'DN') {
        /* Format status */
        $number.attr('data-format', 'dni');
      }
      else {
        /* Format status */
        $number.removeAttr('data-format');
      }

      /* Modify max length of document number dependes on document type */
      var inputMaxlength = undefined;
      switch (value) {
        case 'DN':
        case 'DE':
        case 'NIF':
        case 'CIF':
          inputMaxlength = 9;
          break;
      }
      /* Empty document number input */
      if ($numberInput.attr('maxlength')!=inputMaxlength) {
        $numberInput.val('');
      }
      if (typeof inputMaxlength!='undefined') {
        $numberInput.attr('maxlength', inputMaxlength);
      } else {
        $numberInput.removeAttr('maxlength');
      }

      /* Restart fields */
      $number.attr('data-init', 'restart');

      /* Reassign forms to validate the added fields */
      $select.closest('form').form('restartFields');
    },
    /* Set form data (selects) with services loaded */
    setFormData: function () {
      var self = this;
      var $blockSuggestions = self.element.find('form[data-block=#suggestions]').closest('.inner_block');
      var $blockGroups = self.element.find('form[data-block=#block_group_form]').closest('.inner_block');

      /* Suggestions block */
      if ($blockSuggestions.length > 0 && self.innerCache.services) {

        /* First, type */
        var radioOptions = '';
        $.each(self.innerCache.services.master_services.types, function (indexType, dataType) {
          radioOptions += '<div class="field radio"><div class="field_wrapper"><label for="suggestion_' + dataType.code + '"><span>' + dataType.name + '</span></label><input type="radio" id="suggestion_' + dataType.code + '" name="field_suggestions_type" value="' + dataType.code + '" /></div></div>';
        });
        this.element.find('form').find('.radio_inline').find('.suggestions_options').html(radioOptions);
        this.element.find('form').find('.suggestions_options').css('display', 'block');

        /* Put data into objects */
        for (var key in self.innerCache.services) {
          var htmlContent = '<option value=""></option>';
          var htmlContentForCountry = '<option value=""></option>';
          var htmlContentForFF = '<option value=""></option>';
          $.each(self.innerCache.services[key], function (indexData, dataData) {
            var dataValue = dataData.code;
            var dataDesc = dataData.name;
            /* For countries, data keys are different */
            if (key == 'countries') {
              dataValue = dataData.phoneCode;
              var dataValueForCountry = dataData.code;
              dataDesc = dataData.description;
            }
            /* For departure, arrival airports, cabin class, data keys are different */
            if (key == 'departure_airports' || key == 'arrival_airports' || key == 'region' || key == 'document_type_invoice') {
              dataValue = dataData.code;
              dataDesc = dataData.description;
            }
            htmlContent += '<option value="' + dataValue + '">' + dataDesc + '</option>';
            if (key == 'countries') {
              htmlContentForCountry += '<option value="' + dataValueForCountry + '">' + dataDesc + '</option>';
            }
            if (key == 'frequent_flyer') {
              htmlContentForFF += '<option value="' + dataData.code + '">' + dataData.description + '</option>';
            }
          });
          self.element.find('.dynamic.' + key).find('select').html(htmlContent);

          /* Put countries in another country select */
          if (key == 'countries') {
            self.element.find('.dynamic.country').find('select').html(htmlContentForCountry);
          }

          /* Set FF select values */
          else if (key == 'frequent_flyer') {
            self.element.find('.dynamic.frequent_flyer_program').find('select').html(htmlContentForFF);
          }
        }

        /* Put master data into objects */
        for (var key in self.innerCache.services.master_services) {
          var htmlContent = '<option value=""></option>';
          $.each(self.innerCache.services.master_services[key], function (indexData, dataData) {
            var dataValue = dataData.code;
            var dataDesc = dataData.name;
            /* For departure, arrival airports, cabin class, data keys are different */
            if (key == 'cabinClass') {
              dataValue = dataData.code;
              dataDesc = dataData.description;
            }
            htmlContent += '<option value="' + dataValue + '">' + dataDesc + '</option>';
          });
          var finalKey = key;
          switch (key) {
            case 'addressForms':
              finalKey = 'honorific';
              break;
            case 'airlines':
              finalKey = 'companies';
              break;
            case 'cabinClass':
              finalKey = 'cabin_class';
              break;
            case 'documentTypes':
              finalKey = 'document_type';
              break;
            case 'reasons':
              finalKey = 'reason';
              break;
          }
          self.element.find('.dynamic.' + finalKey).find('select').html(htmlContent);
        }

      }

      /* Group form */
      if ($blockGroups.length > 0 && self.innerCache.services) {
        for (var key in self.innerCache.services.groups_services) {
          var htmlContent = '<option value=""></option>';
          $.each(self.innerCache.services.groups_services[key], function (indexData, dataData) {
            var dataValue = dataData.code;
            var dataDesc = dataData.description;
            /* For departure, arrival airports, cabin class, data keys are different */
            if (key == 'availableTimes') {
              dataValue = dataData.code;
              dataDesc = dataData.timeDescription;
            }
            htmlContent += '<option value="' + dataValue + '">' + dataDesc + '</option>';
          });
          var finalKey = key;
          switch (key) {
            case 'availableCountries':
              finalKey = 'countries';
              break;
            case 'availableTimes':
              finalKey = 'available_times';
              break;
          }
          self.element.find('.dynamic.' + finalKey).find('select').html(htmlContent);
        }

        var htmlContent = '<option value=""></option>';
        $.each(self.innerCache.services.departure_airports, function (indexData, dataData) {
            var dataValue = dataData.code;
            var dataDesc = dataData.description;
            htmlContent += '<option value="' + dataValue + '">' + dataDesc + '</option>';
        })
        self.element.find('.airports.from').find('select').html(htmlContent);
      }

      /* Flight date fields */
      self.initFieldFlightDate();
      self.flightDateActions();

      /* Start forms */
      self.startForms();
      self.startFormsInteractions();

      /* Listen hash to start the page opening of the claim forms - mark the radio button by default */
      if (window.location.hash.indexOf('#/suggestion_') == 0) {
        var radioId = window.location.hash.substring(2);
        var $openThisRadio = this.element.find('form .suggestions_options #' + radioId);

        if ($openThisRadio.length > 0) {
          $openThisRadio.prop('checked', true).change();
        }
      }

    },
    /* Length restriction for countdown */

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
      for (var i = currentyear+1; i > currentyear-131; i--) {
        yearOptions = yearOptions + '<option value="' + i + '">' + i + '</option>';
      };

      $(".flight_date_day_input").html(dayOptions);
      $(".flight_date_month_input").html(monthOptions);
      $(".flight_date_year_input").html(yearOptions);

      // update combos if date is set
      var hiddenDateFieldList = $("[id$='_flight_date']");
      hiddenDateFieldList.each(function(){
        if ($(this).val() != "") {
          var targetId  = $(this).attr("id");
          var dateParts = $("#"+targetId).val().split("/");

          $('.' + targetId + '.flight_date_day_input').val(dateParts[2]).trigger('change', [true]);
          $('.' + targetId + '.flight_date_month_input').val(dateParts[1]).trigger('change', [true]);
          $('.' + targetId + '.flight_date_year_input').val(dateParts[0]).trigger('change', [true]);
        };
      });
    },

    flightDateActions: function() {
      $(".flight_date_input").change(function(e, data) {
        var inputtarget = $(this).attr("data-input-target");
        var disableFocus = (typeof data !== 'undefined' && data.disableFocus === true);

        // reset value of the hidden date input
        $("#" + inputtarget).val("");

        var dayValue   = $("." + inputtarget + ".flight_date_day_input").val();
        var monthValue = $("." + inputtarget + ".flight_date_month_input").val()
        var yearValue  = $("." + inputtarget + ".flight_date_year_input").val()

        if (dayValue != "" && monthValue != "" && yearValue != "") {
          // set and validate hidden date input
          var finaldate = dayValue + "/" + monthValue + "/" + yearValue;
          $("#" + inputtarget).val(finaldate);

          $("#" + inputtarget).closest(".flight_date").trigger('validate');

          if (disableFocus === false) {
            $("#" + inputtarget).focus();
          }

          // set/unset error class to all date combos
          if ($("#" + inputtarget).closest(".flight_date").hasClass("error")) {
            $("." + inputtarget).closest('.select_field').addClass("errorper");
          } else {
            $("." + inputtarget).closest('.select_field').removeClass("errorper");

            if (disableFocus === false) {
              /* Focus current element */
              $(this).focus();
            }
          }
        }

        // if date is optional, update rest of selects and set require true or false depending on select value
        /*if ($("#" + inputtarget).hasClass('optional_date')) {
          if ((dayValue != "" || monthValue != "" || yearValue != "") && ($("." + inputtarget).closest('.field[data-required=true]').length == 0)) {
            $("." + inputtarget).closest('.field').attr('data-required', 'true');
            $("." + inputtarget).closest('.field').attr('data-init', 'restart');

            $("#" + inputtarget).closest('form').form('restartFields');
          } else if (dayValue == "" && monthValue == "" && yearValue == "" && ($("." + inputtarget).closest('.field[data-required=true]').length != 0)) {
            $("." + inputtarget).closest('.field').attr('data-required', 'false');
            $("." + inputtarget).closest('.field').attr('data-init', 'restart');

            $("#" + inputtarget).closest('form').form('restartFields');
          }
        }*/
      });
    },

    lengthRestriction : function($inputElement, $maxLengthElement) {
        // read maxChars from counter display initial text value
        var maxChars = parseInt($maxLengthElement.text(), 10),
        charsLeft = 0,

           // internal function does the counting and sets display value
           countCharacters = function() {
             var numChars = $inputElement.val().length;
             if(numChars > maxChars) {
                   // get current scroll bar position
                   var currScrollTopPos = $inputElement.scrollTop();
                   // trim value to max length
                   $inputElement.val($inputElement.val().substring(0, maxChars));
                   $inputElement.scrollTop(currScrollTopPos);
                 }
                 charsLeft = maxChars - numChars;
                 if( charsLeft < 0 )
                   charsLeft = 0;

               // set counter text
               $maxLengthElement.text(charsLeft);
             };

       // bind events to this element
       // setTimeout is needed, cut or paste fires before val is available
       $($inputElement).bind('keydown keyup keypress focus blur',  countCharacters )
       .bind('cut paste', function(){ setTimeout(countCharacters, 100); } ) ;



    },
    indexScrollListener: function () {
      var self = this;
      var $indexContent = this.element.find('.inner_content_index');

      /* Add to scroll manager the fixed bar callback */
      Bus.publish('scroll', 'bindScrollListener', {events: [
          {
            condition: function (scrollTop) {
              return scrollTop < $('#topbar').height() + $('#subnav').height() + $('.info_header').height();
            },
            yep: function () {

              if ($indexContent.hasClass('fixed')) {
                $indexContent.removeClass('fixed');
              }
            },
            nope: function () {
              if (!$indexContent.hasClass('fixed')) {
                $indexContent.addClass('fixed');
              }
            }
          }
        ]});

    },
    scrollSpy: function () {
      var self = this;
      var $window = $(window);
      var $scrollItems = this.element.find('.inner_content .inner_block');
      var $indexContent = this.element.find('.inner_content_index');
      var $indexLinks = this.element.find('.inner_content_index li');
      var $activeItem, activeId;
      var lastId = 'first';

      /* Set the first item as active */
      if (!$indexLinks.eq(0).closest('li').hasClass('static')) {
        $indexLinks.eq(0).addClass('active');
      }

      /* Bind scroll */
      $window.on('scroll', function () {
        var scrollTop = $window.scrollTop(); /* Current scroll position */

        /* Get the active item */
        $activeItem = $scrollItems.map(function () {
          if ($(this).offset().top - self.generalOffset < scrollTop) {
            return this;
          }
        });

        /* Get the last active item */
        $activeItem = $activeItem.last();

        /* Get the id active item */
        activeId = $activeItem.attr('id');

        if (lastId != activeId) {
          if ($activeItem.hasClass('blue')) {
            $indexContent.addClass('over_blue');
          }
          else {
            $indexContent.removeClass('over_blue');
          }

          /* Clean active links */
          $indexLinks.not('.static').removeClass('active');

          /* Set active link */
          if (activeId) {
            if (!$indexLinks.find('a[href=#' + activeId + ']').closest('li').hasClass('static')) {
              $indexLinks.find('a[href=#' + activeId + ']').closest('li').addClass('active');
            }
          }
          else {
            if (!$indexLinks.eq(0).closest('li').hasClass('static')) {
              $indexLinks.eq(0).addClass('active');
            }
          }

        }

        /* Save the last id */
        lastId = activeId;

      });
    },
    indexEvents: function () {
      var self = this;
      var $indexContent = this.element.find('.inner_content_index');

      $indexContent.find('a').on('click', function (event) {
        var $this = $(this);
        var $parent = $this.parent();
        if (!$parent.hasClass('static')) {
          event.preventDefault();

          var id = $this.attr('href');
          var dataAnchor = $this.attr('data-anchor');
          var $destinyBlock = $(id);
          var blockPaddingTop = parseInt($destinyBlock.css('padding-top').replace('px', ''));
          var blockOffset = (blockPaddingTop == 0) ? 0 : -30;

          Bus.publish('scroll', 'scrollTo', {position: $destinyBlock.offset().top - self.generalOffset + 1 - blockOffset});
          if ((restofurl === 'suma' || restofurl === 'fidelizacion') && dataAnchor !== 'quienes-somos'){
        	  if(dataAnchor === 'nuestros-partners') {
          		updateGtm({
                    'pageArea': 'SUMA-informacion',
                    'pageCategory': 'colaboradores',
                    'pageContent': 'home'
                  });
        	  } else if(dataAnchor === 'faq') {
      			updateGtm({
    	            'pageArea': 'SUMA-informacion',
    	            'pageCategory': 'preguntas-frecuentes',
    	            'pageContent': 'home'
    	          });
        	  } else {
        		updateGtm({
                  'pageArea': 'SUMA-informacion',
                  'pageCategory': dataAnchor
                });
        	  }
          }
        }
      });
    },
    touchEvents: function () {

      var $baggageTable = this.element.find('.baggage_table .baggage_type .text');

      if (Modernizr.touch) {
        $baggageTable.on('touchend', function (event) {

          $baggageTable.removeClass('hover_effect');
          $(this).addClass('hover_effect');

          $('#content').off('touchstart').on('touchstart', function (event) {
            if ($(event.target).closest('.baggage_table .baggage_type .text').length <= 0) {
              $baggageTable.removeClass('hover_effect');

              $('#content').off('touchstart');
            }
          });

        });
      }
    },
    loadSimulator : function() {
      this.loadSimulatorMiles();
      this.loadSimulatorMilesAnual();
      $('#simulator-form').form();
    },
    loadSimulatorMiles : function() {
      var self = this;
      
      $('#monthly-expenditure').slider_field();
      $('#monthly-expenditure').slider_field('customInit').trigger('validate');
      $('#monthly-expenditure').slider('option', 'step', 1);
      $('#monthly-expenditure').slider('option', 'value', $('#monthly-expenditure').data('min'));
      
    },
    loadSimulatorMilesAnual : function() {
      var self = this;
      
      $('#anual-expenditure').slider_field();
      $('#anual-expenditure').slider_field('customInit').trigger('validate');
      $('#anual-expenditure').slider('option', 'step', 1);
      $('#anual-expenditure').slider('option', 'value', $('#anual-expenditure .slider_field').data('min'));
      
    }

  };
});
