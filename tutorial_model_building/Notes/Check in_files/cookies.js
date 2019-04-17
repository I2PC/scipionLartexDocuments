var COOKIE_LIVE = 60 * 30; // 30 minutes

// For static pages only


// Funciones para cookies
function setCookie(c_name, value, exsecs) {
	var exdate = new Date();
	exdate.setSeconds(exdate.getSeconds() + exsecs);
	var c_value = escape(value) + ((exsecs == null) ? ";path=/;domain=" + cookieDomain + "" : "; expires=" + exdate.toUTCString()) + ";path=/;domain=" + cookieDomain + "";
	document.cookie = c_name + "=" + c_value;
}

// Gets a cookie.
function getCookie(c_name) {
	var i, x, y, ARRcookies = document.cookie.split(";");
	for (i = 0; i < ARRcookies.length; i++) {
		x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
		y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
		x = x.replace(/^\s+|\s+$/g, "");
		if (x == c_name) {
			return unescape(y);
		}
	}
	return '';
}

// Delete a cookie, setting expires...
function deleteCookie(name) {
	document.cookie = name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
}