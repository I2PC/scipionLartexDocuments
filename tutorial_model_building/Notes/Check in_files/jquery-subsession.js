// Auxilar function endsWith...
if (typeof String.prototype.endsWith !== 'function') {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

(function($) {
	$.ajaxSetup({
		async : true,
		cache : false,
		beforeSend : function(xhr) {
			if(window.name != '') {
				setCookie('subsession', window.name, COOKIE_LIVE);
			}
		}
	});

	var subsession = '';
	var subsession_breadcrumb = '';

	// Delete a cookie, setting expires...
	function deleteCookie(name) {
		document.cookie = name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
	}

	// This runs when the page loads.
	$(document).ready(function() {
		// If new page, window.name is empty...
		if (window.name == '') {
			// Setting timestamp value...
			subsession = new Date().getTime();
			window.name = subsession;

			// Save old value to use in breadcrum...
			var old_subsession = getCookie('subsession');
			setCookie('subsession', subsession, COOKIE_LIVE);
			subsession_breadcrumb = getCookie('subsession_breadcrumb');

			// fist time without breadcrum...
			if (subsession_breadcrumb == '') {
				subsession_breadcrumb = subsession;
				setCookie('subsession_breadcrumb', subsession_breadcrumb, COOKIE_LIVE);
				// second time with breadcrum... and other tab...
			} else if (!subsession_breadcrumb.endsWith(subsession)) {
				subsession_breadcrumb = old_subsession + "/" + subsession;
				setCookie('subsession_breadcrumb', subsession_breadcrumb, COOKIE_LIVE);
			}
		}
	});

	// Refresh subsession value when focus...
	$(window).on("blur focus", function(e) {
		var prevType = $(this).data("prevType");

		if (prevType != e.type) { // reduce double fire issues
			switch (e.type) {
			case "blur":
				// do work
				break;
			case "focus":
				// do work
				if(window.name != '') {
					setCookie('subsession', window.name, COOKIE_LIVE);
				}
				break;
			}
		}

		$(this).data("prevType", e.type);
	});

})(jQuery);
