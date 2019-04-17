var User = (function( window, $, localStorage, AirEuropaConfig, undefined) {

  var loginLi;
  var myAccountLi;

  return {
    isLoggedIn: function() {

//     this.saveSession((($.cookie('sumaSession')) && (typeof localStorage.ly_token != 'undefined')) || false);
//     this.saveSessionLocalStorage((($.cookie('sumaSession')) && (typeof localStorage.ly_token != 'undefined')) || false);
     return (($.cookie('sumaSession')) && (typeof localStorage.ly_token != 'undefined')) || false;

    },

    login: function(keepInSession, token, userData) {
      /* Set the cookie */

      if ($.cookie('sumaSession'))
      {
        $.removeCookie('sumaSession', { path: '/' });
        /* For security remove with the same config */
        $.removeCookie('sumaSession', { expires : AirEuropaConfig.cookies.expiration, path: '/' });
      }

      if (keepInSession){
        $.cookie('sumaSession', 'keep', { expires : AirEuropaConfig.cookies.expiration, path: '/' });
      }
      else {
        $.cookie('sumaSession', 'session', { path: '/' });
      }

      /* save in local Storage */
      if (token) {
        localStorage.ly_token = token;
        this.saveStatus(userData);
      }

      this.saveSession(true);
      this.saveSessionLocalStorage();

    },

    logoff: function() {
      this.cleanStorage();
      $.removeCookie('sumaSession', { path: '/' });
      /* For security remove with the same config */
      $.removeCookie('sumaSession', { expires : AirEuropaConfig.cookies.expiration, path: '/' });

      this.saveSession(false);
      this.removeSessionLocalStorage();
    },

    saveStatus: function(userData) {
      localStorage.ly_userId = userData.identity;
      localStorage.ly_userName = userData.personCompleteName.name;
      localStorage.ly_firstSurname = userData.personCompleteName.firstSurname;
      localStorage.ly_secondSurname = (userData.personCompleteName.secondSurname) ? userData.personCompleteName.secondSurname : '';
      localStorage.ly_accumulatedMiles =  (userData.frequentFlyerInformation.miles) ? userData.frequentFlyerInformation.miles.miles : '';
      localStorage.ly_loyaltyTierType = (userData.frequentFlyerInformation.frequentFlyerLevel) ? userData.frequentFlyerInformation.frequentFlyerLevel.frequentFlyerLevel : '';
      localStorage.ly_frequentFlyerIdentity = (userData.frequentFlyerInformation.frequentFlyerIdentity) ? userData.frequentFlyerInformation.frequentFlyerIdentity : '';
      localStorage.ly_userAge = (userData.born) ? this.calcularEdad(userData.born) : '';
    },

    cleanStorage: function() {
      localStorage.removeItem('ly_token');
      localStorage.removeItem('ly_userId');
      localStorage.removeItem('ly_userName');
      localStorage.removeItem('ly_firstSurname');
      localStorage.removeItem('ly_secondSurname');
      localStorage.removeItem('ly_loyaltyTierType');
      localStorage.removeItem('ly_accumulatedMiles');
      localStorage.removeItem('ly_frequentFlyerIdentity');
      localStorage.removeItem('ly_userAge');
    },

    saveSession:function(login){
      Hydra.bus.publish('ajax', 'postJson', {
        data: login,
        path: getServiceURL('account.login_session').replace('{login}', login),
        async: true,
        success: function(data) {
          // success(data);
        }
      });
    },

     saveSessionLocalStorage:function(){
      var info ={
        ly_userId:localStorage.ly_userId,
        ly_userName:localStorage.ly_userName,
        ly_firstSurname:localStorage.ly_firstSurname,
        ly_secondSurname:localStorage.ly_secondSurname,
        ly_loyaltyTierType:localStorage.ly_loyaltyTierType,
        ly_frequentFlyerIdentity:localStorage.ly_frequentFlyerIdentity,
        ly_accumulatedMiles:localStorage.ly_accumulatedMiles
      }
      Hydra.bus.publish('ajax', 'postJson', {
        data: info,
        path: getServiceURL('account.login_session_info'),
        async: false,
        success: function(data) {
          // success(data);
        }
      });
    },

    removeSessionLocalStorage: function(){
      Hydra.bus.publish('ajax', 'deleteFromService', {
        path: getServiceURL('account.login_session_info'),
        async: false,
        success: function(data) {
          // success(data);
        }
      });
    },

    updateMilesNumber: function(newMilesNumber) {
      /* Check if it's a valid number */
      if (!(typeof newMilesNumber === "number" &&
            Math.floor(newMilesNumber) === newMilesNumber)) {
        return;
      }

      /* Update localStorage */
      localStorage.ly_accumulatedMiles = newMilesNumber;
    },

    conditions: function(data, callback){
      var conditionsTemplate = window.getTemplate('dialog.conditions');

      $('body').ui_dialog({
        title: lang('account.conditions_title'),
        error: false,
        xxxl: true,
        with_scroll: true,
        content: conditionsTemplate({conditions_content: data.body.data.content}),
        aux_class: 'dialog_conditions',
        buttons: [
          {
            className: 'cancel',
            href: '#',
            label: lang('account.conditions_reject')
          },
          {
            className: 'accept ok',
            href: '#',
            label: lang('account.conditions_accept')
          },
        ],
        render: function ($dialog) {
          $dialog.find('form').form({
        	  onSubmit: function(form) {
        		  $dialog.find('.dialog_content').append('<span class="dialog_spinner"><span class="spinner"></span><strong class="spinner_text">' + lang('inner.loading') + '</strong></span>').addClass('spinner');
                  /* The login and conditions are accepted */
                  // self.accept_conditions();
                  callback($dialog, $dialog);
        	  }
          });
          $dialog.find('.cancel a').on('click', function(event) {
            /* show ultimate advise */
            $dialog.ui_dialog({
              title: 'Aviso',
              error: false,
              subtitle: lang('account.conditions_title_second_advise'),
              close: {
                behaviour: 'close',
                href: '#'
              },
              buttons: [
                {
                  className: 'cancel',
                  href: '#',
                  label: lang('account.conditions_reject')
                },
                {
                  className: 'close',
                  href: '#',
                  label: lang('account.conditions_accept')
                },
              ],
              render: function ($dialog_second_level) {

                $dialog_second_level.find('.cancel a').on('click', function(event) {
                  event.preventDefault();
                  User.logoff();
                  /* send to home */
                  window.location.href = '/';
                });
              }
            });
          });

          $dialog.find('.accept a').on('click', function(event) {
            event.preventDefault();
            /* Mostrar spinner */
            $dialog.find("form").trigger("submit");
          });
        }
      });
    },

    showLoyaltyLink: function() {
      var $loginLi = $('.main_nav a[data-process=suma]').closest('li');
      if($loginLi.length > 0){
    	  loginLi = $loginLi[0].outerHTML;
    	  myAccountLi = '<li class="my_account"><a href="#my_account"><span>' + lang('general.my_account') + '<span class="line"></span></span></a></li>';

    	  $loginLi.remove();
    	  $('.main_nav ul').append(myAccountLi);
      }
    },

    showLoyaltyTitle: function(){
      var $titleNav = $('.main_bar .login--info');
      var millesUser=localStorage.ly_accumulatedMiles;
      var tierType = localStorage.ly_loyaltyTierType;
      var nameUser = localStorage.ly_userName;

      if (tierType) {
        tierType = tierType.toLowerCase();
      }

      if (window.siebelIsDown == true) {
        var title = lang('general.mainbar_title_1') + lang('general.mainbar_title_2_siebeldown');
      } else if (millesUser != 0) {
        var title = lang('general.mainbar_title_1') + nameUser + lang('general.mainbar_title_2') + '<span class="user_miles">'+millesUser +'</span>'+ lang('general.mainbar_title_3');
      } else {
        var title = lang('general.mainbar_title_1') + nameUser + lang('general.mainbar_title_4');
      }

      $titleNav.show();
      $titleNav.addClass(tierType);
      $titleNav.find('.message a').html(title);
      // $titleNav.find('.message .back_suma').show();
    },


    removeLoyaltyLink: function() {
      var $myAccountLi = $('.main_nav li.my_account');

      $myAccountLi.remove();
      $('.main_nav ul').append(loginLi);
    },

    removeLoyaltyTitle: function() {
      /* Replace welcome message with anonymous text instead of removing it */
      var $titleNav = $('.main_bar .login--info');
      var $messageTitle = $('.main_bar .login--info .message a');
      $messageTitle.text(lang('general.mainbar_anonymous_suma'));
    },

    showLogoff: function() {
      /* Remove logoff link so it isn't duplicated */
      this.removeLogoff();
      	
      /* Append logoff link */
      var $logoffLink = '<div class="logoff"><p><a href="#"><span>' + lang('general.exit') + '<span class="line"></span></span></a></p></div>';
      if($('.main_bar .nav .logoff').length === 0){
        $('.main_bar .nav').append($logoffLink);
      }

      /* Listen logoff click */
      $('.logoff a').click(function (event) {
        event.preventDefault();

        window.updateGtmLoginOut();
        /* Remove localStorage and cookies */
        User.logoff();

        /* Redirect to home */
        window.location.href = urlCms('home');
      });
    },

    removeLogoff: function() {
      var $logoffLink = $('.logoff');
      $logoffLink.remove();
    },

    displayLogin: function() {
    	$('.main_nav ul li').css('display', '');
    },

    /*
     * Calculate birthdate of give date (in format YYYY-MM-DD)
     */
    calcularEdad: function(userDateString) {
      var today = moment();
      var userDate = moment(userDateString, "DD/MM/YYYY");

      var userYears = today.diff(userDate, 'years', true);

      return userYears;
    },

  }

})(window, jQuery, localStorage, AirEuropaConfig);