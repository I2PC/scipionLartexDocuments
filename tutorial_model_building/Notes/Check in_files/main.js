/* Google tag manager initial dataLayer status */
var dataLayer = [];

/* Main module */
(function(window, Modernizr, $, Hydra, Shadowbox, FastClick, accounting, ready, preload, undefined) {

  /* Avoid warnings when window.console doesn't exist */
  window.console = window.console || {
      log: function() {},
      error: function() {}
  };

  /* Modernizr test for retina screens, adds retina/no-reina class to html */
  Modernizr.addTest('retina', function () {
    return (window.devicePixelRatio > 1.5);
  });

  /* Modernizr test to detect android devices */
  Modernizr.addTest('android', function(){
    var ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("android") > -1;
  });

  /* Modernizr test to detect IE10 */
  Modernizr.addTest('ie10', function() {
    return (!!document.documentMode && document.documentMode === 10);
  });

  /* Modernizr test to detect IE11 */
  Modernizr.addTest('ie11', function() {
    return (!!document.documentMode && document.documentMode === 11);
  });

  /* Modernizr test to detect Safari 5 devices */
  Modernizr.addTest('safari', function(){
    var ua = navigator.userAgent.toLowerCase();
    return (ua.indexOf("safari") > -1) && (ua.indexOf("chrome") <= -1);
  });

  /* Modernizr test to detect Safari 5 devices */
  Modernizr.addTest('safari5', function(){
    var ua = navigator.userAgent.toLowerCase();
    var version = navigator.appVersion;
    return (ua.indexOf("safari") > -1) && (version.indexOf("Version/5") > -1 || version.indexOf("Version/4") > -1);
  });

  /* Modernizr test to detect iOS<6 devices */
  Modernizr.addTest('iosold', function(){
    var ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("iphone os 3") > -1 || ua.indexOf("cpu os 3") > -1
        || ua.indexOf("iphone os 4") > -1 || ua.indexOf("cpu os 4") > -1
        || ua.indexOf("iphone os 5") > -1 || ua.indexOf("cpu os 5") > -1;
  });

  /* Modernizr test to detecto iOS 7 devices */
  Modernizr.addTest('ios7', function(){
    var ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("iphone os 7") > -1 || ua.indexOf("cpu os 7") > -1;
  });

  /* Modernizr test for complex swipe methods: touch events and GPU accelerated CSS3 */
  Modernizr.addTest('swipable', function () {
    return !Modernizr.android && Modernizr.touch && Modernizr.csstransitions && Modernizr.csstransforms && Modernizr.cssanimations;
  });

  /* Hide address bar in mobile */
  if (Modernizr.touch) { /* Only in touch screens */
    window.addEventListener('load', function() {
      if (document.body.scrollTop === 0) {
        setTimeout(scrollTo, 0, 0, 1);
      }

    }, false);
  }

  /* Init Shadowbox */
  Shadowbox.init( {
    overlayOpacity: '0.9',
    onOpen: function() {
      cb=document.getElementById('sb-nav-close');
      tb=document.getElementById('sb-container');

      if(tb) {
        tb.appendChild(cb);
      }
    },
    onFinish: function() {
      tb=document.getElementById('sb-container');

      if ($(tb).find('form').length > 0) {
        $(tb).find('form').form({});
      }
    }
  });

  /* Main configuration for accounting library */
  if (!window.appConfig) {
    accounting.settings.number.thousand = '.';
    accounting.settings.number.decimal = ',';
  }

  /* Browser modules flag, used to fire these modules once */
  var browserModulesLoaded = false;

  /* Starts smart banner for old IOS, Android and WindowsPhone */
  var loadSmartBanner = function() {
    var androidStoreText = lang('smartbanner.app_pricetext_android');
    var iosStoreText = lang('smartbanner.app_pricetext_ios');
    var windowsStoreText = lang('smartbanner.app_pricetext_windows_rt');
    var windowsPhoneStoreText = lang('smartbanner.app_pricetext_windows_phone');

    $.smartbanner({
      androidConfig: {
        inGooglePlay: androidStoreText,
        priceText: androidStoreText
      },
      androidTabsConfig: {
        priceText: androidStoreText,
        inGooglePlay: androidStoreText
      },
      author: lang('smartbanner.app_company'),
      button: lang('smartbanner.store_button'),
      iosPattern: /iPhone/i,
      iosRequireSafari: false,
      ipadConfig: {
        inAppStore: iosStoreText,
        priceText: iosStoreText
      },
      iphoneConfig: {
        inAppStore: iosStoreText,
        priceText: iosStoreText
      },
      price: lang('smartbanner.app_price'),
      title: lang('smartbanner.app_title'),
      useWindowsPhoneForWindows: true,
      windowsPhoneConfig: {
        inWindowsStore: windowsPhoneStoreText,
        priceText: windowsPhoneStoreText
      },
      windowsRtConfig: {
        inWindowsStore: windowsStoreText,
        priceText: windowsStoreText
      }
    });
  };

  /* Browser modules block */
  var startBrowserModules = function() {

    /* Start Browser modules once */
    if (!browserModulesLoaded) {

      browserModulesLoaded = true;

      /* Start FastClick plugin */
      FastClick.attach(document.body);

      /* Set debug mode from config vars */
      Hydra.setDebug(AirEuropaConfig.debugMode);

      /* Set configuration */
      Hydra.module.setVars({
        config: AirEuropaConfig
      });

      /* Browser modules */
      Hydra.module.start('Ajax', 'Ajax');
      Hydra.module.start('Scroll', 'Scroll');
      Hydra.module.start('Prerender', 'Prerender');
      Hydra.module.start('Cookies', 'Cookies');
      Hydra.module.start('DarkSite', 'DarkSite');
    }

  };

  /* Main entry of the application */
  var startApp = function() {

    /* Start browser modules */
    startBrowserModules();

    /* Geolocation - will call to nearest service */
    Hydra.module.start('Geolocation', 'Geolocation');

    /* Start services */
    Hydra.module.start('ResultServices', 'ResultServices');
    Hydra.module.start('USAResultServices', 'USAResultServices');
    Hydra.module.start('CheckinServices', 'CheckinServices');
    Hydra.module.start('CheckoutServices', 'CheckoutServices');
    Hydra.module.start('AncillariesServices', 'AncillariesServices');
    Hydra.module.start('FlightinfoServices', 'FlightinfoServices');
    Hydra.module.start('HelpdeskServices', 'HelpdeskServices');
    Hydra.module.start('SeatMapServices', 'SeatMapServices');
    Hydra.module.start('InnerServices', 'InnerServices');
    Hydra.module.start('AccountServices', 'AccountServices');
    Hydra.module.start('LoyaltyBookingsServices', 'LoyaltyBookingsServices');
    Hydra.module.start('LoyaltyInfoServices', 'LoyaltyInfoServices');
    Hydra.module.start('LoyaltyCardServices', 'LoyaltyCardServices');
    Hydra.module.start('LoyaltyMilesServices', 'LoyaltyMilesServices');
    Hydra.module.start('PartnersServices', 'PartnersServices');
    Hydra.module.start('PmrFormServices', 'PmrFormServices');
    Hydra.module.start('H72FormServices', 'H72FormServices');

    /* Start Controllers */
    Hydra.module.start('SearchController', 'SearchController');
    Hydra.module.start('USASearchController', 'USASearchController');
    Hydra.module.start('CheckoutController', 'CheckoutController');
    Hydra.module.start('CheckinController', 'CheckinController');
    Hydra.module.start('AncillariesController', 'AncillariesController');
    Hydra.module.start('FlightInfoController', 'FlightInfoController');
    Hydra.module.start('InnerController', 'InnerController');
    Hydra.module.start('AccountController', 'AccountController');
    Hydra.module.start('LandingController', 'LandingController');
    Hydra.module.start('LoyaltyBookingsController', 'LoyaltyBookingsController');
    Hydra.module.start('LoyaltyInfoController', 'LoyaltyInfoController');
    Hydra.module.start('LoyaltyCardController', 'LoyaltyCardController');
    Hydra.module.start('LoyaltyMilesController', 'LoyaltyMilesController');
    Hydra.module.start('PartnersController', 'PartnersController');
    Hydra.module.start('PmrFormController', 'PmrFormController');
    Hydra.module.start('H72FormController', 'H72FormController');

    /* Start Views */
    Hydra.module.start('Footer', 'Footer'); /* Helpesk phone */
    Hydra.module.start('Inner', 'Inner'); /* Helpesk phone */
    Hydra.module.start('Search', 'Search');
    Hydra.module.start('Results', 'Results');
    Hydra.module.start('USAResults', 'USAResults');
    Hydra.module.start('Checkout', 'Checkout');
    Hydra.module.start('Checkin', 'Checkin');
    Hydra.module.start('Ancillaries', 'Ancillaries');
    Hydra.module.start('Flightinfo', 'Flightinfo');
    Hydra.module.start('WidgetsManager', 'WidgetsManager');
    Hydra.module.start('Account', 'Account');
    Hydra.module.start('Landing', 'Landing');
    Hydra.module.start('LoyaltyBookings', 'LoyaltyBookings');
    Hydra.module.start('LoyaltyInfo', 'LoyaltyInfo');
    Hydra.module.start('LoyaltyCard', 'LoyaltyCard');
    Hydra.module.start('LoyaltyMiles', 'LoyaltyMiles');
    Hydra.module.start('Partners', 'Partners');
    Hydra.module.start('PmrForm', 'PmrForm');
    Hydra.module.start('H72Form', 'H72Form');

    /* Start Hash manager */
    Hydra.module.start('Hash', 'Hash');

    /* Add SmartBanner plugin */
    loadSmartBanner();
  };

  /* UI modules block, these modules don't need services previous calls */
  var startUIModules = function() {

    /* Start browser modules */
    startBrowserModules();

    /* Start Views */
    Hydra.module.start('Slider', 'Slider');
    Hydra.module.start('Topbar', 'Topbar');
    Hydra.module.start('BrowserWarningOverlay', 'BrowserWarningOverlay');
    Hydra.module.start('Subnav', 'Subnav');
    Hydra.module.start('Process', 'Process');

  };

  /* Resolve the ready promise and fire UI Modules */
  $(document).ready(function() {
    var itsProcessing = (window.location.hash.indexOf('#/') == 0);
    var gtmPageData = {};

    startUIModules();
    ready.resolve();

    /* Update Google Tag Manager */
    if (!itsProcessing) {
      gtmPageData = window.getGTMPageData(restofurl);
      updateGtm({
        'mercado': window.market,
        'pageArea': gtmPageData.pageArea,
        'pageCategory': gtmPageData.pageCategory,
        'pageContent': gtmPageData.pageContent
      });
    }

  });

  /* When preload promise and document ready are resolved start the app,
  we need both events (ajax data and dom loaded) to start the modules */
  $.when(preload, ready)
  .done(function() {
    startApp();
  });

})(window, Modernizr, jQuery, Hydra, Shadowbox, FastClick, accounting, ready, preload);