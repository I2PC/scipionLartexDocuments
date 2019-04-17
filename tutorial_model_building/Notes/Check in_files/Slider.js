Hydra.module.register('Slider', function(Bus, Module, ErrorHandler, Api) {
  return {
    selector: '#slider',
    defaultFromAirport: undefined,
    nearestFromAirport: undefined,
    fastBrowser: !($('html').hasClass('ie8') || Modernizr.touch),

    events: {
      'slider': {
        'restart': function(oNotify) {
          this.customInit();
        }
      },
      'geolocation': {
        'success': function(oNotify) {
          var self = this;
          if (oNotify.position.coords.latitude && oNotify.position.coords.longitude) {
            self.getNearestAirport(oNotify.position);
          }
        }
      }
    },

    init: function() {
      this.customInit();
    },

    customInit: function() {
      /* Save jquery object reference */
      this.element = $(this.selector);

      if (!this.element.hasClass('dont_init')) {

        /* If there aren't any active slide, set it the first one */
        if (this.element.find('.slides .active').length == 0) {
          this.element.find('.slides > ul > li').eq(0).addClass('active');
        }

        /* Cache default from airport */
        this.cacheDefaultFromAirport();

        /* Prepare slider */
        this.prepareSlider();

        /* Add events */
        this.addEvents();
        this.addEventsTitle();

        /* Preload images */
        this.preload();

        /* Control search form inslide slider */
        this.searchForm();

      }
    },

    cacheDefaultFromAirport: function() {
      this.defaultFromAirport = {
        code: this.element.find('.airport.from input.code').val(),
        description: this.element.find('.airport.from input.helper').val()
      };
    },

    prepareSlider: function() {

      var $slides = this.element.find('.slides > ul > li');
      var $firstSlide = this.element.find('.slides > ul > li .slide_content').eq(0);

      $slides.each(function() {
        var $this = $(this);
        var code = $this.find('.slide_content').attr('data-code');

        /* Add class for titles with two lines */
        var $title = $this.find('.slide_title');

        if ($title.height() > 85) {
          $title.addClass('two_lines');
        }

        /* Add no_route class to slides without defined destiny */
        if (!code) {
          $this.find('.slide_content').addClass('no_route');
        }

        /* Add asterisk for slides with disclaimer */
        var $disclaimer = $this.find('.disclaimer');
        if ($disclaimer.length > 0 && $disclaimer.text() !== '') {
          $title.find('span').append('<span class="icon_asterisk"></span>');
        }
      });

      /* Copy the name of the city into the search field */
      var city = $firstSlide.attr('data-description');
      this.element.find('.search_trigger .airport.to .input .helper').val(city);

      /* Change fieldTo code value if it's emtpy */
      var newCode = $firstSlide.data('code');
      this.element.find('.search_trigger .airport.to .input .code').val(newCode);

    },

    getNearestAirport: function(position) {
      var self = this;

      /* Call AJAX module to get the json */
      Bus.publish('ajax', 'getJSON', {
        path: getServiceURL('airport.nearest').replace('{latitude}', position.coords.latitude).replace('{longitude}', position.coords.longitude),
        success: function(data) {

          if((data.code == "CDG") || (data.code == "ORY")) {
              for (var i = window.airports['from'].length - 1; i >= 0; i--) {
                if(window.airports['from'][i].code == "PAR") {
                  data = window.airports['from'][i];
                }
              };
          }

          /* Cache the nearest airport */
          self.nearestFromAirport = {
            code: data.code,
            description: data.description
          };

          /* Change the origin field if it's not focused when the to data comes */
          self.changeOrigin(data);
        }
      });
    },

    changeOrigin: function(airport) {
      var self = this;
      var $fieldFrom = this.element.find('.search_trigger .airport.from');
      var $fieldTo = this.element.find('.search_trigger .airport.to');

      /* Just change the airport origin if the slider doesn't have any previous activity */
      if (!$fieldFrom.hasClass('focused') && $fieldFrom.hasClass('suggested_data') &&
              !$fieldTo.hasClass('focused') && $fieldTo.hasClass('suggested_data')) {

        if (airports['to'][airport.code] == undefined) {
          /* Call AJAX module to get the json */
          Bus.publish('ajax', 'getJSON', {
            path: getServiceURL('airport.destiny').replace('{code}', airport.code),
            success: function(data) {
              /* Cache the data */
              airports['to'][airport.code] = data;

              self.changeValues(airport)
            }
          });
        }
        else {
          self.changeValues(airport);
        }
      }

      if (this.element.hasClass('mini_slider')) {

        /* Call AJAX module to get the json */
        Bus.publish('ajax', 'getJSON', {
          path: getServiceURL('airport.destiny').replace('{code}', airport.code),
          success: function(data) {
            /* Cache the data */
            airports['to'][airport.code] = data;

            self.checkRoutes(airport)
          }
        });

      }

    },

    changeValues: function(airport) {
      var self = this;
      var $fieldFrom = this.element.find('.search_trigger .airport.from');
      var $fieldTo = this.element.find('.search_trigger .airport.to');
      var data = airports['to'][airport.code];

      /* Set the right values */
      $fieldFrom.find('.input .code').val(airport.code);
      $fieldFrom.find('.input .helper').val(airport.description);
      $fieldFrom.trigger('validate');

      /* Set the no_route status to slides */
      this.checkRoutes(airport);

      var $currentSlide = self.element.find('.slides > ul > li.active .slide_content');
      var $fieldTo = self.element.find('.search_trigger .airport.to');
      var cleanToField = false;

      /* If the slide has no route, tell it to destiny field */
      if ($currentSlide.hasClass('no_route')) {
        $fieldTo.addClass('no_route');
        cleanToField = true;
      }
      else {
        $fieldTo.removeClass('no_route');
        $fieldTo.find('input.code').val($currentSlide.attr('data-code'));
        $fieldTo.find('input.helper').val($currentSlide.attr('data-description'));
      }

      /* Trigger the input onSelect method to get the to values */
      if ($fieldFrom.data('ui-airport_field')) {
        $fieldFrom.data('ui-airport_field').onSelect(airport.code, airport.description, airport.resident, airport.zone, false, cleanToField, false);
      }
      else {
        setTimeout(function() {
          $fieldFrom.data('ui-airport_field').onSelect(airport.code, airport.description, airport.resident, airport.zone, false, cleanToField, false);
        }, 300);
      }
    },

    checkRoutes: function(airport) {
      var data = airports['to'][airport.code];

      /* Loop over the slides to find if it's a route from the origin geolocated code to the slide destiny*/
      this.element.find('.slides > ul > li .slide_content').each(function() {
        var $slide = $(this);
        var slideCode = $slide.attr('data-code');
        var routeFound = false;

        /* Loop the destinys airport from geolocated origin to match the routes */
        if (slideCode) {
          $.each(data, function(index, destinyAirport) {
            if (destinyAirport.code == slideCode) {
              routeFound = true;
              return false;
            }
          });
        }

        /* Set the flag for this slide */
        if (!routeFound) {
          $slide.addClass('no_route');
        }

      });

    },

    addEvents: function() {
      var self = this;

      /* Change slide event */
      this.element.find('.ui_main_slider').on('change_slide', function() {

        /* Get next slide */
        var $nextSlide = self.element.find('.slides .animating');
        var noRoute = $nextSlide.find('.slide_content').hasClass('no_route');

        /* Fields */
        var $fieldFrom = self.element.find('.search_trigger .airport.from');
        var $fieldTo = self.element.find('.search_trigger .airport.to');

        /* If the slide has no route, tell it to destiny field */
        if (noRoute) {
          $fieldTo.addClass('no_route');
        }
        else {
          $fieldTo.removeClass('no_route');
        }

        /* Change fieldTo value with code and airport effect */
        if (!$fieldFrom.hasClass('focused') && $fieldFrom.hasClass('suggested_data') &&
                !$fieldTo.hasClass('focused') && $fieldTo.hasClass('suggested_data')) {

          /* Change fieldTo code value */
          var newCode = '';

          if (noRoute) {
            $fieldTo.find('.input .code').val('');
            $fieldTo.find('.input .helper').val('');
            $fieldTo.trigger('validate');
          }
          else {
            newCode = $nextSlide.find('.slide_content').attr('data-code');
            $fieldTo.find('.input .code').val(newCode);
            $fieldTo.trigger('validate');

            /* Airport effect */
            var newText = $nextSlide.find('.slide_content').attr('data-description') || '';
            var last = $fieldTo.find('.input .helper').val();

            //console.log("Cambiamos el destino a: " + newText);

            if (self.fastBrowser) {
              self.airportize(newText, last);
            }
            else {
              self.element.find('.search_trigger .airport.to .input .helper').val(newText);
            }

          }
        }

      });

      this.element.find('.search_trigger .airport input.helper').on('blur', function() {
        setTimeout(function() {
          /* Get vars */
          var $fieldFrom = self.element.find('.search_trigger .airport.from');
          var $fieldTo = self.element.find('.search_trigger .airport.to');
          var $fieldFromInput = $fieldFrom.find('input.helper');
          var $fieldToInput = $fieldTo.find('input.helper');
          //console.log($fieldFromInput);          // console.log("Salta el blur de la vista")

          /* If the placeholders are empty */
          if ($fieldFromInput.val() == '' && $fieldToInput.val() == '') {

            // console.log("Los aeropuertos del buscador están vacíos")

            if (self.nearestFromAirport != undefined) {
              // console.log("Pone los más cercanos");
              /* Add suggested_data classes to fields */
              $fieldFrom.addClass('suggested_data');
              $fieldTo.addClass('suggested_data');

              self.changeOrigin(self.nearestFromAirport);
            }
            else if (self.defaultFromAirport != undefined) {
              // console.log("Pone el por defecto del mercado");

              /* Add suggested_data classes to fields */
              $fieldFrom.addClass('suggested_data');
              $fieldTo.addClass('suggested_data');

              self.changeOrigin(self.defaultFromAirport);
            }

          }

        }, 210);

      });
    },

    addEventsTitle: function() {
      var self = this;
      this.element.find('.slides > ul > li .slide_content:not(.no_route) .slide_title').each(function() {
        var $title = $(this);
        $title.on('click', function(event) {

          var $title = $(this);
          var $parent = $title.closest('.slide_content');

          if (!$parent.hasClass('no_route')) {
            event.preventDefault();

            var searchProcessURL = getProcessUrl('search');
            var codeFrom = self.getFromAirportCode();
            var codeTo = $parent.attr('data-code');
            var urlParams = '/' + codeFrom + '/' + codeTo;

            /* Change hash to start the process */
            Bus.publish('hash', 'change', {hash: searchProcessURL + urlParams});
          }
        });
      });
    },

    preload: function() {
      var $slides = this.element.find('.slide_content');
      var totalPictures = $slides.length;
      var picturesLoaded = 0;
      var self = this;


      if($slides.closest('.landing_suma').length == 0){

        this.element.find('.ui_main_slider').addClass('start_loading');

        $slides.each(function() {
          var $slide = $(this);
          var $image = $slide.find('.image img').eq(0);
          picturesLoaded = picturesLoaded + 1;
            
          /* Process this image, add it to background property */
          if ($('html').hasClass('ie8') == false) {  
            var cadena = '<video loop="loop" id="video" width="100%" height="100%" autoplay>';
            var hasvideos = false;
            
            $slide.find('.videoSource').each(function() {
              var $video = $(this);
              hasvideos = true;
              cadena = cadena + '<source src="' + $video.attr("data-src") + '" type="' + $video.attr("data-type") + '" />';
            });

            cadena = cadena + '</video>';
            if(hasvideos){
              $slide.find('.background').remove();
              $slide.append(cadena);
            }

             /* Clean from DOM the .image element */
            $slide.find('.image').remove();
          }

          /* When all images are loaded */
          if (picturesLoaded === totalPictures) {
            /* Init slider */
            self.initSlider();

            /* Remove loading flag */
            self.element.find('.ui_main_slider').removeClass('loading start_loading');
          }

          /* Force load on IE */
          if (
                  $('html').hasClass('ie8') ||
                  $('html').hasClass('ie9') ||
                  $('html').hasClass('ie10') ||
                  $('html').hasClass('ie11') ||
                  $('html').hasClass('ios7')) {
            $image.attr("src", $image.attr("src"));
          }

          /* Fires load event in case images are cached */
          if ($image.get(0).complete) {
            $image.load();
          }
        });
      }
    },

    getFromAirportCode: function() {
      var code = '';
      if (typeof this.nearestFromAirport !== 'undefined') {
        code = this.nearestFromAirport.code;
      } else if (typeof this.defaultFromAirport !== 'undefined') {
        code = this.defaultFromAirport.code;
      }

      return code;
    },

    initSlider: function() {
      /* Main slider inside */
      this.element.find('.ui_main_slider').main_slider();

      /* Start background parallax */
      if (this.fastBrowser) {
        this.element.find('.ui_main_slider .slide_content .background').parallax('background', '50%', 0.25, false, function() {
          return $('#subnav').height()
        }, 0);
      }
    },

    searchForm: function() {
      var self = this;

      /* Toggle submit / to */
      this.element.find('.airport.to').on('mouseenter', function() {
        self.element.find('.form').addClass('to_hovered');
      });

      this.element.find('.airport.to').on('mouseleave', function() {
        self.element.find('.form').removeClass('to_hovered');
      });
    },

    airportize: function(newText, last) {
      var self = this;
      var chars = ['A', 'I', 'R', 'E', 'U', 'R', 'O', 'P', 'A'];

      var currentText = last;
      var currentCharPosition = 0;
      var cursorPosition = 0;
      var airportFxTimer;

      if (airportFxTimer)
        clearInterval(self.airportFxTimer);

      airportFxTimer = setInterval(function() {

        var resultString = '';

        /* Compound the result string */
        for (var i = 0; i < newText.length; i++) {

          if (i == cursorPosition) {

            if (currentCharPosition >= chars.length ||
                    chars[currentCharPosition] == newText.toLowerCase().charAt(cursorPosition)
                    ) {
              resultString += newText.charAt(i);
              currentCharPosition = 0;
              cursorPosition++;
            } else {
              resultString += chars[currentCharPosition];
              currentCharPosition++;
            }
          } else if (i > cursorPosition) {
            resultString += currentText.charAt(i) || '';
          } else {
            resultString += newText.charAt(i) || '';
          }

        }

        /* Append to field */
        self.element.find('.search_trigger .airport.to .input .helper').val(resultString);

        if (cursorPosition >= newText.length) {
          clearInterval(airportFxTimer);
        }

      }, 1);

    }

  };
});