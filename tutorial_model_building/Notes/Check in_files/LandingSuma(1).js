Hydra.module.register('Landing', function(Bus, Module, ErrorHandler, Api) {

  return {

    selector: '#content.landing_suma',
    element: undefined,
    sliderSelector: '#slider.landing_suma',

    events: { },

    init: function() {
       /* Save jquery object reference */
      this.element = $(this.selector);

      if(this.element.length > 0) {
	      this.init_video();
	      this.sliderResize();
	      this.iframe_video();
        this.createGtmEvents();
        // console.log('init');
        updateGtm({
        'pageArea' : 'SUMA-Landing',
        'pageCategory' : 'home',
        'PageContent' : ''
      });
      }
      
    },

    iframe_video: function() {
      var iframe = $('.iframevideo');
      var styles320 = {
        width: '1024px',
        height: '100%',
        position: 'relative',
        margin: '0 auto',
        display: 'block'
      };
      var styles1400 = {
        width: '1280px',
        height: '100%',
        position: 'relative',
        margin: '0 auto',
        display: 'block'
      };
      $(document).ready(function() {
        if ($(window).width() < 1380){
            $( iframe ).css( styles320 );
         } else{
            $( iframe ).css( styles1400 );
         }
       });
      $( window ).resize(function() {
        if ($(window).width() < 1380){
            $( iframe ).css( styles320 );
         } else{
            $( iframe ).css( styles1400 );
         }
      });
    },

    init_video: function() {
    	// var slider = $(this.sliderSelector);

        var videoSrc = lang('landing.video_yt_src');
        var videoHtml = '<iframe id="iframevideo" class="iframevideo" src="https://www.youtube.com/embed/'+videoSrc+'?controls=1&showinfo=0&rel=0&wmode=transparent&enablejsapi=1" frameborder="0" allowfullscreen=""></iframe>';
        var imagenHtml = '<img class="imagevideo" src="/airstatic/assets/graphic/loyalty/landing_image1024x380.png" />';
        var videoCookie = $.cookie('videoEnded');
        var ytvideo;
        var $expandable = $("#expandable_video");
        
        if(videoSrc === 'ieoI8ZaRN_I'){

           $('#expandable_video').addClass('disabled');
           $('.suma #slider').addClass('disabled-slide');

        } else{

          if ($('html').is('.ie6, .ie7, .ie8')) {
            $('#video_landing_suma').html(imagenHtml);
            $expandable.hide();
          } else {
          //Cargamos API js de youtube
          $.getScript("https://www.youtube.com/iframe_api");
          
            $('#video_landing_suma').append(videoHtml);
            //Cuando la API de youtube este cargada, preparamos los eventos
            window.onYouTubeIframeAPIReady = function() {
              ytvideo = new YT.Player("iframevideo");

              //Cuando el video esta listo, lanzamos la reproducción si el video se ha mostrado y creamos la cookie que indica que se ha visto
              ytvideo.addEventListener("onReady", function(event) {
                if(videoCookie == undefined) {
                  event.target.playVideo();
                  $.cookie('videoEnded', 'videoEnded', {expires: AirEuropaConfig.cookies.expiration });
                }
                $('a[rel=process]').on('click', function() {
                  ytvideo.pauseVideo();
                });
              });
            };
            
            //Añadimos evento para mostrar y ocultar el video
            $("#expandable_video a").on("click", function(event) {
              event.preventDefault();
              
              if($expandable.hasClass('expanded')) {
                //Si el video esta reproduciendose lo pausamos
                if(ytvideo.getPlayerState() == YT.PlayerState.PLAYING) {
                  ytvideo.pauseVideo();
                }
                  $("#slider.landing_suma").hide();
                  $expandable.removeClass('expanded');
              } else {
                  $("#slider.landing_suma").show();
                  $expandable.addClass('expanded');
                  //Reproducimos el video
                  ytvideo.playVideo();
                  
                  updateGtm({
                    'pageArea' : User.isLoggedIn() ? 'SUMA-logueado' : 'SUMA-Landing',
                    'pageCategory' : 'ver_video'
                  });
              }

            });

            if(videoCookie == undefined) {
              //Si la cookie no existe mostramos el video
              $("#slider.landing_suma").show();
              $expandable.addClass('expanded');
            } else {
                //Si la cookie existe, ocultamos el video
              $("#slider.landing_suma").hide();
              $expandable.removeClass('expanded');
            }
          }

        }

        
    },


    sliderResize: function(){
      //Initial static variable
      var slider = $(this.sliderSelector);
      var video = slider.find('#Video1');
      var videoMarginTop = 114;
      var propotionalHeidht = 0.405;
      var propotionalWidth =  40.5;
      var heightMinContent = 50;

      //Initial variable
      var videoWidthInitial = video.width();
      var videoHeightProportional = (videoWidthInitial * propotionalHeidht);
      var windowHeight = $(window).height();

      if ($('html').is('.ie6, .ie7, .ie8')) {

        slider.height(400);

      } else {
        if ((videoHeightProportional + heightMinContent + videoMarginTop) >= windowHeight) {

          var heightMore = (videoHeightProportional + heightMinContent + videoMarginTop);
          heightMore = heightMore - windowHeight;
          videoHeightProportional  = videoHeightProportional - heightMore;

          var videoWightProportional = (videoHeightProportional * 100) / propotionalWidth;

          var border = videoWidthInitial - videoWightProportional;

          if (border > 0) {
            video.css( "padding-left", border/2);
          }

          video.width(videoWightProportional);
          slider.height(videoHeightProportional + videoMarginTop);
        } else {
          slider.height(videoHeightProportional + videoMarginTop);
        }
      }

      //Function Resize window
      $( window ).resize(function() {

        //initial video
        video.width('100%');
        video.css( "padding-left", 0);

        videoWidthInitial = video.width();
        videoHeightProportional = (videoWidthInitial * propotionalHeidht);
        windowHeight = $(window).height();

        if ($('html').is('.ie6, .ie7, .ie8')) {

          slider.height(400);

        } else {
          if ((videoHeightProportional + heightMinContent + videoMarginTop) >= windowHeight) {

            heightMore = (videoHeightProportional + heightMinContent + videoMarginTop);
            heightMore = heightMore - windowHeight;
            videoHeightProportional  = videoHeightProportional - heightMore;

            videoWightProportional = (videoHeightProportional * 100) / propotionalWidth;

            border = videoWidthInitial - videoWightProportional;

            if (border > 0) {
              video.css( "padding-left", border/2);
            }
            video.width(videoWightProportional);
            slider.height(videoHeightProportional + videoMarginTop);
          } else {
            slider.height(videoHeightProportional + videoMarginTop);
          }
        }
      });

    },

    createGtmEvents: function() {
      this.element.find('.block_feature a[data-process=register]').on('click', function() {
        updateGtm({
          'pageArea' : 'SUMA-Landing',
          'pageCategory' : 'acceder',
          'pageContent' : 'formulario'
        });
      });


      this.element.find('.block_feature a[data-process=login]').on('click', function() {
        updateGtm({
          'pageArea' : 'SUMA-Landing',
          'pageCategory' : 'acceder',
          'pageContent' : 'formulario'
        });
      });
    }





  }
});