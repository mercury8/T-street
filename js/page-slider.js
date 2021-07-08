(function($) {

	$.fn.pageSlider = function(options) {
		
		// Default Settings
		var settings = $.extend({
		
			$content: ".section",
			$slidesContainer: "",
			$parentContainer: "",
			
			slideShowTime: '5000',
			
			slideShow: true,
			slideShowFollow: true,
			slideShowDirection: 'next',
			navigator: true, 
			mouseScroll: true, // scroll onmouse middle button
			barScroll: true, // activate or not scrolling via bar
			scrollBehaviour: false, // depends on barScroll (simulates bar as scroll)
			resume: true, // allows to restore to last page when browser is re-opned
			
			debounceTime: 200
			
		}, options);
		
		items = $(settings.$content);
		total_items = items.size();
		currentIndex = 0; 
	
		interval = 0;
		slideShowTime = settings.slideShowTime;
		content_class = settings.$content;
		
		sectionSize = parseInt($(settings.$slidesContainer).find('.section').size());
		
		var firstContent = $(settings.$content).eq(0).find('img');
		var secondContent = $(settings.$content).eq(1).find('img');
		var beforeFirstContent = $(settings.$content).eq(total_items-1).find('img');
		
		lazyLoad(firstContent);
		lazyLoad(secondContent);
		lazyLoad(beforeFirstContent);
		
		$(window).on("resize", function () {
			var w = document.documentElement.clientWidth;
	
			var sw = parseFloat($(settings.$slidesContainer).find('.section')[0].getBoundingClientRect().width);
			var tw = sw * sectionSize;
			$(settings.$slidesContainer).width(tw);
			$(settings.$slidesContainer).css('transform', 'translate3d(-'+sw*currentIndex+'px, 0px, 0px)');
		}).resize();
		
		function cycle(goTo)
		{
			if(goTo)
			{
				var item = $(settings.$content).eq(goTo);
				currentIndex = parseInt(goTo);
				
				// lazyLoad Current Section
				lazyLoad(item.find('img'));
			} else {
				var item = $(settings.$content).eq(currentIndex);
				var item_plus1 = $(settings.$content).eq(currentIndex+1);
				var item_minus1 = $(settings.$content).eq(currentIndex-1);
				
				// lazyLoad Next/Prev Section
				lazyLoad(item_plus1.find('img'));
				lazyLoad(item_minus1.find('img'));
			}
			
			var t3d = currentIndex * parseFloat($(settings.$slidesContainer).find('.section')[0].getBoundingClientRect().width);
			$(settings.$slidesContainer).css('transform', 'translate3d(-'+t3d+'px, 0px, 0px)');
			
			if ($.isFunction(window.onCurrentPage))
			{
				onCurrentPage(currentIndex);
			}
			
			if(settings.resume)
			{
				localStorage.setItem('ps-resume-index', currentIndex);
			}
			
			sessionStorage.setItem('ps-index', currentIndex);
			
			if(settings.navigator)
			{
				navigatorUpdate(currentIndex);
			}
		}
		
		(function() {
			var	nextPrevHtml = '<a href="#" class="next ps-next">Next</a><a href="#" class="prev ps-prev">Prev</a>';
			$(settings.$slidesContainer).append(nextPrevHtml);
			
			if(settings.navigator)
			{
				var pHtml = '<div class="ps-progress-bar"><div class="ps-line-wrap"><div class="ps-line"><div class="ps-indicator"></div></div></div></div>';
				$(settings.$slidesContainer).after(pHtml);
			}
			
			if(settings.mouseScroll)
			{
				var MouseWheelHandler_ = debounce(MouseWheelHandler, settings.debounceTime);

				var scrollContent = document.querySelector(settings.$slidesContainer);
				if (scrollContent.addEventListener)
				{
					scrollContent.addEventListener("mousewheel", MouseWheelHandler_, false);
					scrollContent.addEventListener("DOMMouseScroll", MouseWheelHandler_, false);
				} else {
					scrollContent.attachEvent("onmousewheel", MouseWheelHandler_);
				}
			}

		})();
		
		function debounce(func, wait, immediate) 
		{
			var timeout;
			return function() {
				var context = this, args = arguments;
				var later = function() {
					timeout = null;
					if (!immediate) func.apply(context, args);
				};
				var callNow = immediate && !timeout;
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
				if (callNow) func.apply(context, args);
			};
		};
		
		function MouseWheelHandler(e)
		{
			e.preventDefault();

			var e = window.event || e;
			var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
			
			if(delta == 1)
			{
				$('.prev').trigger("click");
			} else {
				$('.next').trigger("click");
			}
			
			return false;
		}

		function navigatorUpdate(currentIndex)
		{
			if(settings.navigator)
			{
				currentIndex = currentIndex;
				
				var currentPoint = (currentIndex / total_items) * 100;
				
				$('.ps-indicator').css('left', currentPoint+'%');
			}	
		}
		
		$('.next').on('click', function() {
			startClearTimer();
			
			if(currentIndex < (total_items-1)) 
			{
				currentIndex += 1;
			} else {
				currentIndex = 0;
			}
			cycle();
		});
		
		
		$('.prev').on('click', function() {
			startClearTimer();
			
			if(currentIndex < total_items) 
			{
				currentIndex -= 1;
				if(currentIndex < 0)
				{
					currentIndex = (total_items - 1);
				}
			} 
			cycle();
		});
		
		startTimer();
		
		function startTimer()
		{
			if(settings.slideShow == true)
			{
				if(settings.slideShowDirection == 'next')
				{
					interval = setInterval(function(){ $('.next').trigger( "click" ); }, slideShowTime);
				} else if(settings.slideShowDirection == 'prev') {
					interval = setInterval(function(){ $('.prev').trigger( "click" ); }, slideShowTime);
				}
			} 
		}
		
		function startClearTimer()
		{
			if(settings.slideShow == true)
			{
				if(settings.slideShowFollow == false)
				{
					clearInterval(interval);
					if(settings.slideShowDirection == 'next')
					{
						interval = setInterval(function(){ $('.next').trigger( "click" ); }, slideShowTime);
					} else if(settings.slideShowDirection == 'prev') {
						interval = setInterval(function(){ $('.prev').trigger( "click" ); }, slideShowTime);
					}
				} else if(settings.slideShowFollow == true) {
					clearInterval(interval);
					direction = $(document.activeElement).attr('class');
					if(!direction && settings.slideShowDirection == 'next' || direction == 'next')
					{
						interval = setInterval(function(){ $('.next').trigger( "click" ); }, slideShowTime);
					} else if (!direction && settings.slideShowDirection == 'prev' || direction == 'prev') {
						interval = setInterval(function(){ $('.prev').trigger( "click" ); }, slideShowTime);
					}
				}
			}
		}
		
		$('.goTo').on('click',function() {
			var index = $(this).attr('data-index');
			cycle(index);
		});
		
		$.goTo = function(index) 
		{
			cycle(index);
		}
		
		$(window).on('load', function() {
			if(settings.resume)
			{
				var index = localStorage.getItem('ps-resume-index');
				cycle(index);
			}
		});
		
		function lazyLoad(item)
		{
			if(item.length > 0)
			{
				var images = item;
				if(images.length > 0)
				{
					for(var i = 0; i < images.length; i++) 
					{
						loadImage(images[i]);
					};
					
				}
			}
		}
		
		function loadImage(el, fn) 
		{
			var thisRef = $(el).data('lazyLoaded');
			if(typeof thisRef == 'undefined')
			{
				var src = $(el).attr('data-src');
				
				// load if not loaded
				if($(el).attr('src').indexOf("blank.gif") >= 0)
				{
					// replace only if found blank.gif 
					$(el).attr('src', src);
					$(el).data('lazyLoaded', 'true');
					$(el).css('visibility', 'hidden');
					
					el.onload = function(e) {
						$(el).css('visibility', 'visible');
					}
				}
			}
		}
		
		function isImageOk(img) 
		{
			if (!img.complete) 
			{
				return false;
			}

			if (typeof img.naturalWidth != "undefined" && img.naturalWidth == 0) {
				return false;
			}

			return true;
		}
		
		if(settings.barScroll)
		{
			if(settings.scrollBehaviour)
			{
				var posEvent = '.ps-line';
			} else {
				var posEvent = '.ps-indicator';
			}
			
			var pressed, pressX, pressY, dragged, offset = 1;
			var startIndPos = jQuery('.ps-indicator').offset().left;
			var lineSize;
			var fullBar, halfBar;
			var thisResizeOffset = 0;
			var limit, cIndex, fullPageWidth, totalWidth = 0;
			var result;
			var timeout;
			var pressedOffset;
			var endPos;
			var distance;
			var indicatorX;
			
			$(window).resize(function() {		
				// Calculate the end position of the line
				endPos = jQuery('.ps-line').width();
				
				// update positions on resize
				lineSize = jQuery('.ps-line').width();
				fullBar = jQuery('.ps-indicator').width();
				halfBar = (fullBar / 2);
				
				// maintain indicator position (onResize)
				thisResizeOffset = jQuery('.ps-indicator').offset().left; 
				
				// dont go over the endPos
				if((thisResizeOffset + fullBar) >= endPos)
				{
					thisResizeOffset = endPos - fullBar;
				} 
				
				// Apply indicator position
				jQuery('.ps-indicator').offset({left: thisResizeOffset});
				
				// Update Scroll onResize
				if(settings.resume)
				{
					cycle(localStorage.getItem('ps-resume-index'));
				} else {
					cycle(sessionStorage.getItem('ps-index'));
				}	
			});
			
			jQuery('.ps-progress-bar').on('mousedown', posEvent, function(e) {
				e.preventDefault();
				
				pressedOffset = '';
				e = e || window.event;
				pressX = e.pageX;
				scrollTo = '';
				pressed = true;
				
				if(settings.scrollBehaviour)
				{
					// update indicator position based on first click
					// case clicked on line or on indicator
					if($(e.target).hasClass('ps-indicator'))
					{
						// click on indicator
						result = e.pageX;
					} else {
						// click somewhere on line (push indicator to position)
						// position indicator in the middle while clicking somewhere on line
						result = e.pageX - halfBar;
						
						// if next to startPost
						if(e.pageX < (startIndPos + fullBar))
						{
							// position mouse on start of the indicator (reset position)
							result = startIndPos;
						}
						
						// if next to endPost
						if(e.pageX > (lineSize + startIndPos - fullBar))
						{
							// position mouse on end of the indicator (finishLine)
							result = startIndPos + lineSize - fullBar;
						}
						
						// Update positions
						jQuery('.ps-indicator').offset({left: result});
						
					}
						
					// Set pressedOffset after all updates
					pressedOffset = result;
				} else {
					indicatorX = jQuery('.ps-indicator').offset().left;
				}
				
				$('#fullpage').addClass('no-transition');
				$('.ps-indicator').addClass('no-transition');
				
			}).on('mousemove', '.ps-line', function(e) {
				e.preventDefault();
				e = e || window.event;
				if (!pressed) return;
				
				dragged = Math.abs(e.pageX - pressX) > offset || Math.abs(e.pageY - pressY) > offset;
				
				distance = e.pageX - pressX;
				
				if(settings.scrollBehaviour)
				{
					result = pressedOffset + distance;
				} else {
					result = indicatorX + distance;
				}
				
				// Limit drag over the line
				if(result >= (lineSize - fullBar + startIndPos) || result <= (startIndPos))
				{
					return false;
				} else {
					// Update indicator
					jQuery('.ps-indicator').offset({left: result});

					// Content move
					totalWidth = $(settings.$slidesContainer).width();
					fullPageWidth = $(settings.$slidesContainer).width() - jQuery('.section:first-of-type').width();
					scrollTo = (fullPageWidth * (result - startIndPos)) / (jQuery('.ps-line').width() - fullBar);
					cIndex = (fullPageWidth * (result - startIndPos)) / (jQuery('.ps-line').width() - fullBar);
					cIndex = (cIndex / jQuery('.section:first-of-type').width());
					cIndex = Math.round(cIndex);
					
					if(scrollTo < (fullPageWidth))
					{
						sessionStorage.setItem('ps-index', cIndex);
						$(settings.$slidesContainer).css('transform', 'translate3d(-'+scrollTo+'px, 0px, 0px)');
					}
				}
				
			}).on('mouseup', function(e) {
				e.preventDefault();
				
				scrollTo = '';
				pressedOffset = '';
				cIndex = '';
				
				$('#fullpage').removeClass('no-transition');
				$('.ps-indicator').removeClass('no-transition');
				cycle(sessionStorage.getItem('ps-index'));
				pressed = dragged = false;
			});
			
		}
		
	};
	
}(jQuery));