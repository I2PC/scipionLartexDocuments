(function(jQuery) {
  jQuery.fn.serializeObject = function() {
    var o = {},
    a = this.serializeArray(),
    i = 0,
    len = a.length;
    for (; i < len; i++) {
        o = addNestedPropToObj(o, a[i].name, a[i].value);
    }
    return o;
  };

  function addNestedPropToObj(obj, name, value) {
    var path = name.split('.'),
    current = obj,
    len = path.length - 1,
    i = 0;
    for (; i < len; i++) {
        current[path[i]] = current[path[i]] || {};
        current = current[path[i]];
    }
    if ( 0 < path[i].indexOf( "[]" ) ) {
        name = path[i].replace('[]', '');
        current[name] = current[name] || [];
        current[name].push(value);
    } else {
        current[path[i]] = value;
    }
    return obj;
  }
}($));