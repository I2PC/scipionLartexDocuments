/* Rewrite config */
(function(window, undefined) {
  var marketConf = window.MarketConfig && window.MarketConfig[market];
  var localConf = window.LocalConfig;

  if (marketConf) {
    $.extend(true, window.AirEuropaConfig, marketConf);
  }

  if (localConf) {
    $.extend(true, window.AirEuropaConfig, localConf);
  }
})(window);