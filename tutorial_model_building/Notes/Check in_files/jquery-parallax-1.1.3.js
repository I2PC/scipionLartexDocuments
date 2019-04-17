/*
Plugin: jQuery Parallax
Version 1.1.3
Author: Ian Lunn
Twitter: @IanLunn
Author URL: http://www.ianlunn.co.uk/
Plugin URL: http://www.ianlunn.co.uk/plugins/jquery-parallax/
Modified by Joaquin Marti - http://www.joaquinmarti.com

Dual licensed under the MIT and GPL licenses:
http://www.opensource.org/licenses/mit-license.php
http://www.gnu.org/licenses/gpl.html
*/

(function( $ ){
	var $window = $(window);
	var windowHeight = $window.height();

	$window.resize(function () {
		windowHeight = $window.height();
	});

	$.fn.parallax = function(mode, xpos, speedFactor, outerHeight, startAtPosition, opacityOffset) {
		var $this = $(this);
		var getHeight;
		var firstTop;
		var paddingTop = 0;

		//get the starting position of each element to have parallax applied to it
		$this.each(function(){
		   firstTop = $this.offset().top;
		});

		if (outerHeight) {
			getHeight = function(jqo) {
				return jqo.outerHeight(true);
			};
		} else {
			getHeight = function(jqo) {
				return jqo.height();
			};
		}

		// setup defaults if arguments aren't specified
		if (arguments.length < 1 || xpos === null) xpos = "50%";
		if (arguments.length < 2 || speedFactor === null) speedFactor = 0.1;
		if (arguments.length < 3 || outerHeight === null) outerHeight = true;

		// function to be called whenever the window is scrolled or resized
		function update(){
			var pos = $window.scrollTop();
			var startAtPositionPx = startAtPosition()

			if (pos > startAtPositionPx || pos < 0) {
				$this.each(function(){
					var $element = $(this);
					var top = $element.offset().top;
					var height = getHeight($element);

					firstTopModified = firstTop + startAtPositionPx;

					// Check if totally above or totally below viewport
					if (top + height < pos || top > pos + windowHeight) {
						return;
					}

					if (mode == 'background') {
						var translate = Math.round(((firstTopModified - pos) * speedFactor) * -1);
						if (translate < 0) translate = 0;
						//$this.css('backgroundPosition', xpos + " " + Math.round(((firstTopModified - pos) * speedFactor)) + "px");
						$this.css({
							'transform': 'translate3d(0, ' + translate + 'px, 0)',
							'margin-top': translate + 'px'
						});
					}
					else if (mode == 'translate') {
						var translate =  Math.round(((pos - startAtPositionPx) * speedFactor * -1));

						if (translate < 0) translate = 0;

						if (parseInt(opacityOffset) > 0) {
							var opacityValue = 1 - (1 / (opacityOffset / translate));
						}

						$this.css({
							'transform': 'translate(0, ' + translate + 'px)',
							'margin-top': translate + 'px',
							'opacity': opacityValue
						});
					}
				});
			}
			else {
					if (mode == 'background') {
						var translate = 0;
						//$this.css('backgroundPosition', xpos + " " + Math.round(((firstTopModified - pos) * speedFactor)) + "px");
						$this.css({
							'transform': 'translate3d(0, ' + translate + 'px, 0)',
							'margin-top': translate + 'px'
						});
					}
					else if (mode == 'translate') {

						var translate = 0;

						$this.css({
							'transform': 'translate(0, ' + translate + 'px)',
							'margin-top': translate + 'px',
							'opacity': '1'
						});
					}
			}

		}

		$window.bind('scroll', update).resize(update);
		update();
	};
})(jQuery);
