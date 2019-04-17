window.cachedTemplates = [];

window.getTemplate = function(path) {

  var template = '';

  $.each(cachedTemplates, function(index, cachedTemplate) {
    if (cachedTemplate.path == path) {
      template = cachedTemplate.tpl;
    }
  });

  return template;
};

window.getURLTemplate = function(template) {

  var url = '';
  var keys = template.split('.');

  /* Get the url from the template object */
  url = AirEuropaConfig.templates[keys[0]][keys[1]];

  return url;
};