$(function(){

	// =================================
	// init SHJS (syntax highlither)
	// =================================
	window.sh_highlightDocument();
	$('pre.sh_sourceCode').parent()
		.hover(function(){
			var $div = $(this);
			if ($div.data('hideTimeout')) {
				clearTimeout($div.data('hideTimeout'));
				$div.data('hideTimeout', 0);
			}
			if (!$div.data('active')) {
				$div.data('showTimeout',
					setTimeout(function(){
						var $pre = $div.children().eq(-1),
							scrollBarFix = 30,
							width = $pre[0].scrollWidth > $pre.outerWidth() ?
								Math.min($pre[0].scrollWidth + scrollBarFix, $(window).width() - scrollBarFix - $div.offset().left) :
								$pre.outerWidth(),
							height = document.defaultView && document.defaultView.getComputedStyle && parseFloat(document.defaultView.getComputedStyle($div[0], null).height) || $div.height();
						$div.wrap('<div class="code-placeholder" style="position:relative;height:' + (height + parseInt($div.css('padding-top')) + parseInt($div.css('padding-bottom'))) + 'px;margin:' + $div.css('margin-top') + ' ' + $div.css('margin-right') + ' ' + $div.css('margin-bottom') + ' ' + $div.css('margin-left') + ';"></div>')
						.css({position: 'absolute', width: width, height: height}).data('active', true)
							.find('> a').fadeIn(500);
					}, 500)
				);
			}
		}, function(){
			var $div = $(this);
			if ($div.data('showTimeout')) {
				clearTimeout($div.data('showTimeout'));
				$div.data('showTimeout', 0);
			}
			if ($div.data('active') && !$div.data('plainView')) {
				$div.data('hideTimeout',
					setTimeout(function(){
						$div.unwrap().css({position: 'relative', width: '', height: ''}).data('active', false)
							.find('> a').hide();
					}, 500)
				);
			}
		})
		.prepend('<a/>').find('> a').addClass('view-plain').attr('href', '#').text('View plain code')
		.click(function(){
			var $link = $(this),
				$div = $link.parent(),
				$pre = $link.next(),
				$window = $(window),
				scrollPos = [$window.scrollLeft(), $window.scrollTop()],
				value = $pre.text(),
				height = $pre.outerHeight() + (window.opera && window.opera.version && window.opera.version() < 10.5 ? $pre[0].scrollHeight / ((value.replace(/\r\n/g, '\n').match(/\n/g) || '').length + 1) : 0);
			$('<textarea wrap="off"/>').css({width: $div.width(), height: height, '-moz-box-shadow': '0 5px 15px #888', '-webkit-box-shadow': '0 5px 15px #888', 'box-shadow': '0 5px 15px #888'})
				.val(value).attr('readonly', 'readonly').insertBefore($pre).blur(function(){
					$(this).next()/* pre */.css('visibility', 'inherit').prev()/* textarea */.remove();
					$div.data('plainView', false).mouseleave();
				});
			$link.hide().next().next()/* pre */.css('visibility', 'hidden').prev()/* textarea */.focus();
			// some browsers (like IE < 8) may mess up the scroll position when the textarea is focused
			if (window.scrollTo)
				window.scrollTo(scrollPos[0], scrollPos[1]);
			$div.data('plainView', true);
			return false;
		});

});
