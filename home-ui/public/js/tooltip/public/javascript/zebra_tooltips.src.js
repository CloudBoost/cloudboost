/**
 *  Zebra_Tooltips
 *
 *  Zebra_Tooltips is a lightweight (around 5KB minified, 1.6KB gzipped) jQuery plugin for creating simple but smart and
 *  visually attractive tooltips, featuring nice transitions, and offering a wide range of configuration options. The
 *  plugin detects the edges of the browser window and makes sure that the tooltips always stay in the visible area of
 *  the browser window by placing them beneath or above the parent element, and shifting them left or right so that the
 *  tooltips are always visible.
 *
 *  Besides the default behavior of tooltips showing when user hovers the element, tooltips may also be shown and hidden
 *  programmatically using the API. When shown programmatically, the tooltips will feature a "close" button, and clicking
 *  it will be the only way of closing tooltips opened this way. This is very useful for drawing users' attention to
 *  specific areas of a website (like error messages after validating a form).
 *
 *  By default, the plugin will use the "title" attribute of the element for the tooltip's content, but the tooltip's
 *  content can also be specified via the "zebra-tooltip" data attribute, or programmatically. Tooltips' appearance can be
 *  easily customized both through JavaScript and/or CSS. Also, tooltips can be aligned left, center or right, relative
 *  to the parent element.
 *
 *  Zebra_Tooltips uses NO IMAGES (everything is handled from CSS), and falls back gracefully for browsers that don't
 *  support all the fancy stuff; also, tooltips can be attached to any element not just anchor tags!
 *
 *  Works in all major browsers (Firefox, Opera, Safari, Chrome, Internet Explorer 6+)
 *
 *  Visit {@link http://stefangabos.ro/jquery/zebra-tooltips/} for more information.
 *
 *  For more resources visit {@link http://stefangabos.ro/}
 *
 *  @author     Stefan Gabos <contact@stefangabos.ro>
 *  @version    1.2.4 (last revision: January 20, 2016)
 *  @copyright  (c) 2012 - 2016 Stefan Gabos
 *  @license    http://www.gnu.org/licenses/lgpl-3.0.txt GNU LESSER GENERAL PUBLIC LICENSE
 *  @package    Zebra_Tooltips
 */
;(function($) {

    'use strict';

    $.Zebra_Tooltips = function(elements, options) {

        var defaults = {

            animation_speed:    250,            //  The speed (in milliseconds) of the animation used to show/hide tooltips.
                                                //
                                                //  Default is 250

            animation_offset:   20,             //  The number of pixels the tooltips should use to "slide" into position.
                                                //
                                                //  Set to 0 for no sliding.
                                                //
                                                //  Default is 20

            background_color:   '#000',         //  Tooltip's background color.
                                                //
                                                //  May be a hexadecimal color (like #BADA55) or a supported named color
                                                //  (like "limegreen")
                                                //
                                                //  Default is #000

            close_on_click:     true,           //  By default, if the users clicks when over a tooltip, the tooltip will
                                                //  close (if the tooltip was not open using the API, that is)
                                                //
                                                //  Set this property to FALSE to prevent this behaviour.
                                                //
                                                //  Default is TRUE

            color:              '#FFF',         //  Tooltip's text color.
                                                //
                                                //  May be a hexadecimal color (like #FFF) or a supported named color
                                                //  (like "white")
                                                //
                                                //  Default is #FFF

            content:            false,          //  The content of the tooltip.
                                                //
                                                //  Usually, the content of the tooltip is given in the "title" attribute
                                                //  or as the "zebra-tooltip" data attribute of the element the tooltip
                                                //  is attached to.
                                                //
                                                //  Setting this property to FALSE will use the property's value as the
                                                //  content of all the tooltips rather than using the values of the "title"
                                                //  or the data attribute.
                                                //
                                                //  Default is FALSE

            default_position:   'above',        //  By default, tooltips are shown above the elements they are attached to
                                                //  and are shown below only if there isn't enough space above.
                                                //
                                                //  Set the value of this property to "below" if you want to reverse the
                                                //  default behavior so that tooltips will be shown below the elements
                                                //  they are attached to and will be shown above only there isn't enough
                                                //  space below.
                                                //
                                                //  Possible values are "above" and "below".
                                                //
                                                //  Default is "above"

            hide_delay:         100,            //  The delay (in milliseconds) after which to hide the tooltip once the
                                                //  mouse moves away from the trigger element or the tooltip.
                                                //
                                                //  Default is 100

            keep_visible:       true,           //  Should tooltips remain visible also when the mouse cursor is over
                                                //  the tooltips or should the tooltips be visible strictly when the mouse
                                                //  cursor is over the parent elements.
                                                //
                                                //  Default is TRUE

            max_width:          250,            //  Maximum width of the tooltip's content;
                                                //
                                                //  Default is 250

            opacity:            '.95',          //  The tooltip's opacity.
                                                //
                                                //  Must be a value between 0 (completely transparent) and 1 (completely
                                                //  opaque)
                                                //
                                                //  Default is .85

            position:           'center',       //  The tooltip's position, relative to the trigger element.
                                                //
                                                //  Can be 'center', 'left' or 'right'.
                                                //
                                                //  Default is 'center'

            prerender:          false,          //  If set to TRUE, tooltips will be created on document load, rather than
                                                //  only when needed.
                                                //
                                                //  Default is FALSE

            show_delay:         100,            //  The delay (in milliseconds) after which to show the tooltip once the
                                                //  mouse is over the trigger element.
                                                //
                                                //  Default is 100

            vertical_offset:    0,              //  How close (in pixels) should the tip of the tooltip be relative to
                                                //  the parent element.
                                                //
                                                //  Default is 0

            onBeforeHide:       null,           //  Event fired before a tooltip is hidden.
                                                //
                                                //  The callback function (if any) receives as arguments the
                                                //  element the tooltip is attached to, and the tooltip element.

            onHide:             null,           //  Event fired after a tooltip is hidden.
                                                //
                                                //  The callback function (if any) receives as arguments the
                                                //  element the tooltip is attached to, and the tooltip element.

            onBeforeShow:       null,           //  Event fired before a tooltip is shown.
                                                //
                                                //  The callback function (if any) receives as arguments the
                                                //  element the tooltip is attached to, and the tooltip element.

            onShow:             null            //  Event fired after a tooltip is shown.
                                                //
                                                //  The callback function (if any) receives as arguments the
                                                //  element the tooltip is attached to, and the tooltip element.

        },

        // to avoid confusions, we use "plugin" to reference the current instance of the object
        plugin = this,

        // private variables used throughout the script
        window_width, window_height, horizontal_scroll, vertical_scroll;

        plugin.settings = {};

        /**
         *  Hides the tooltips attached to the element(s) given as argument.
         *
         *  @param  jQuery  elements    A jQuery selector of element(s) for which to hide the attached tooltips.
         *
         *  @param  boolean destroy     If set to TRUE, once hidden, the tooltip will be "muted" and will *not* be
         *                              shown again when the user hovers the parent element with the mouse.
         *
         *                              In this case, the tooltip can be shown again only by calling the {@link show()}
         *                              method.
         *
         *                              Default is FALSE
         *
         *  @return void
         */
        plugin.hide = function(elements, destroy) {

            // iterate through the elements given as argument
            elements.each(function() {

                var

                    // the current element
                    $element = $(this),

                    // get a reference to the attached tooltip and its components
                    tooltip_info = $element.data('Zebra_Tooltip');

                // if there is a tooltip attached
                if (tooltip_info) {

                    // set this flag to FALSE so we can hide the tooltip
                    tooltip_info.sticky = false;

                    // set a flag if tooltip needs to be "muted" after hiding it
                    if (destroy) tooltip_info.destroy = true;

                    // cache updated tooltip data
                    $element.data('Zebra_Tooltip', tooltip_info);

                    // show the tooltip
                    _hide($element);

                }

            });

        };

        /**
         *  Shows the tooltips attached to the element(s) given as argument.
         *
         *  When showing a tooltip using this method, the tooltip can only be closed by the user clicking on the "close"
         *  icon on the tooltip (which is automatically added when using this method) or by calling the {@link hide()}
         *  method.
         *
         *  @param  jQuery  elements    A jQuery selector of element(s) for which to show the attached tooltips.
         *
         *  @param  boolean destroy     If set to TRUE, once the user clicks the "close" button, the tooltip will be
         *                              "muted" and will *not* be shown when the user hovers the parent element with
         *                              the mouse.
         *
         *                              In this case, the tooltip can be shown again only by calling this method.
         *
         *                              If set to FALSE, the tooltip will be shown whenever the user hovers the parent
         *                              element with the mouse, only it will not have the "close" button anymore.
         *
         *                              Default is FALSE.
         *
         *  @return void
         */
        plugin.show = function(elements, destroy) {

            // iterate through the elements given as argument
            elements.each(function() {

                var

                    // the current element
                    $element = $(this),

                    // get a reference to the attached tooltip and its components
                    tooltip_info = $element.data('Zebra_Tooltip');

                // if there is a tooltip attached
                if (tooltip_info) {

                    // when shown using the API, the tooltip can be hidden only by clicking on the "close" button
                    tooltip_info.sticky = true;

                    // set this to FALSE so we can show the tooltip
                    tooltip_info.muted = false;

                    // set a flag if tooltip needs to "muted" after hiding
                    if (destroy) tooltip_info.destroy = true;

                    // cache updated tooltip data
                    $element.data('Zebra_Tooltip', tooltip_info);

                    // show the tooltip
                    _show($element);

                }

            });

        };

        /**
         *  Constructor method
         *
         *  @return void
         *
         *  @access private
         */
        var _init = function() {

            // the plugin's final properties are the merged default and user-provided options (if any)
            plugin.settings = $.extend({}, defaults, options);

            // iterate through the elements we need to attach the plugin to
            elements.each(function() {

                var

                    // reference to the jQuery version of the element
                    $element = $(this),

                    // the element's title attribute (if any)
                    title = $element.attr('title'),

                    // the element's data attribute
                    data_attribute = $element.data('zebra-tooltip');

                // if
                if (

                    // element has a "title" attribute and is not empty OR
                    (title && title !== '') ||

                    // element has the proper data attribute set, and is not empty OR
                    (data_attribute && data_attribute !== '') ||

                    // content is given via the "content" property
                    undefined !== plugin.settings.content

                ) {

                    // handlers for some of the element's events
                    $element.bind({

                        // when mouse cursor enters the parent element
                        'mouseenter': function() {

                            // clear the "title" attribute (if present) to prevent browser's default behavior
                            if (title) $(this).attr('title', '');

                            // show the attached tooltip 
                            _show($element);

                        },

                        // when mouse cursor leaves the parent element
                        'mouseleave': function() {

                            // hide the attached tooltip
                            _hide($element);

                            // if "title" attribute was present, set it back to its original state
                            if (title) $(this).attr('title', title);

                        }

                    });

                    // initialize and cache tooltip data
                    $element.data('Zebra_Tooltip', {
                        'tooltip':              null,
                        'content':              data_attribute || title || '',
                        'window_resized':       true,
                        'window_scrolled':      true,
                        'show_timeout':         null,
                        'hide_timeout':         null,
                        'animation_offset':     plugin.settings.animation_offset,
                        'sticky':               false,
                        'destroy':              false,
                        'muted':                false
                    });

                    // if tooltips are to be pre-generated, generate them now
                    if (plugin.settings.prerender) _create_tooltip($element);

                }

            });

            // if the browser's window is resized or scrolled, we need to recompute the tooltips' positions
            $(window).bind('scroll resize', function(event) {

                // iterate through the elements that have tooltips attached
                elements.each(function() {

                    // get a reference to the attached tooltip and its components
                    var tooltip_info = $(this).data('Zebra_Tooltip');

                    // if element has a tooltip attached
                    // (it may not have if it had no "title" attribute or the attribute was empty)
                    if (tooltip_info) {

                        // if window was scrolled, set a flag
                        if (event.type == 'scroll') tooltip_info.window_scrolled = true;

                        // if window was resized, set a flag
                        else tooltip_info.window_resized = true;

                        // cache updated tooltip data
                        $(this).data('Zebra_Tooltip', tooltip_info);

                    }

                });

            });

        };

        /**
         *  Generates a tooltip's HTML code and inserts it into the DOM.
         *  It returns an object containing references to the tooltip's components.
         *
         *  If the tooltip already exists, the method will simply return the object with references to the tooltip's
         *  components.
         *
         *  @param  jQuery  $element    The jQuery version of a DOM element to which to attach the tooltip to.
         *
         *  @return object              Returns an object containing references to the tooltip's components.
         *
         *  @access private
         */
		var _create_tooltip = function($element) {

            // get a reference to the tooltip and its components, if available
            var tooltip_info = $element.data('Zebra_Tooltip');

            // if tooltip's HTML was not yet created
            if (!tooltip_info.tooltip) {

                var

                    // create the tooltip's main container
                    tooltip = jQuery('<div>', {

                        'class': 'Zebra_Tooltip',

                        css: {
                            'opacity':   0,
                            'display':  'block'
                        }

                    }),

                    // create the tooltip's message container
                    message = jQuery('<div>', {

                        'class': 'Zebra_Tooltip_Message',

                        css: {
                            'max-width':        plugin.settings.max_width,
                            'background-color': plugin.settings.background_color,
                            'color':            plugin.settings.color
                        }

                    // add the content of the tooltip
                    // using either the message given as argument when instantiating the object,
                    // or the message contained in the "title" attribute of the parent element
                    }).html(plugin.settings.content ? plugin.settings.content : tooltip_info.content)

                    // append the element to the main container
                    .appendTo(tooltip),

                    // create the tooltip's arrow container
                    arrow_container = jQuery('<div>', {

                        'class': 'Zebra_Tooltip_Arrow'

                    // append the element to the main container
                    }).appendTo(tooltip),

                    // create the actual arrow
                    // and append it to the arrow container
                    arrow = jQuery('<div>').appendTo(arrow_container);

                // if tooltip is to be kept visible when mouse cursor is over the tooltip
                if (plugin.settings.keep_visible) {

                    // when mouse leaves the tooltip's surface or the tooltip is clicked
                    tooltip.bind('mouseleave' + (plugin.settings.close_on_click ? ' click' : ''), function() {

                        // hide the tooltip
                        _hide($element);

                    });

                    // when mouse enters the tooltip's surface
                    tooltip.bind('mouseenter', function() {

                        // keep the tooltip visible
                        _show($element);

                    });

                }

                // inject the tooltip into the DOM
                // (so that we can get its dimensions)
                tooltip.appendTo('body');

                var

                    // get tooltip's width and height
                    tooltip_width = tooltip.outerWidth(),
                    tooltip_height = tooltip.outerHeight(),

                    // get arrow's width and height
                    arrow_width = arrow.outerWidth(),
                    arrow_height = arrow.outerHeight(),

                    // in IE9, after hardcoding the width (see below), the box's actual width changes with a few pixels,
                    // but enough to sometimes trigger the wrapping of the text; this results in the "message" element having
                    // a greater actual height than the one we're just about to hard-coded and this, in turn, results in the
                    // arrow not being visible; therefore, save the values now
                    tmp_width = message.outerWidth(),
                    tmp_height = message.outerHeight();

                // group all data together
                tooltip_info = {
                    'tooltip':          tooltip,
                    'tooltip_width':    tooltip_width,
                    'tooltip_height':   tooltip_height + (arrow_height / 2),
                    'message':          message,
                    'arrow_container':  arrow_container,
                    'arrow_width':      arrow_width,
                    'arrow_height':     arrow_height,
                    'arrow':            arrow
                };


                // hardcode the tooltip's width and height so it doesn't gets broken due to word wrapping when the
                // tooltip is too close to the edges of the browser's window
                tooltip.css({
                    'width':    tooltip_info.tooltip_width,
                    'height':   tooltip_info.tooltip_height
                });

                // adjust, if needed, the values representing the toolip's width/height
                tooltip_info.tooltip_width = tooltip_info.tooltip_width + (message.outerWidth() - tmp_width);
                tooltip_info.tooltip_height = tooltip_info.tooltip_height + (message.outerHeight() - tmp_height);

                // adjust, if needed, the toolip's width/height, and hide it for now
                tooltip.css({
                    'width':    tooltip_info.tooltip_width,
                    'height':   tooltip_info.tooltip_height,
                    'display':  'none'
                });

                // merge new tooltip data with tooltip data created when instantiating the library
                tooltip_info = $.extend($element.data('Zebra_Tooltip'), tooltip_info);

                // cache updated tooltip data
                $element.data('Zebra_Tooltip', tooltip_info);

            }

            // if tooltip was triggered through the API and the "close" button was not yet added
            if (tooltip_info.sticky && !tooltip_info.close) {

                // create the "close" button
                jQuery('<a>', {

                        'class':    'Zebra_Tooltip_Close',
                        'href':     'javascript:void(0)'

                // when the button is clicked
                }).html('x').bind('click', function(e) {

                    e.preventDefault();

                    // get a reference to the attached tooltip and its components
                    var tooltip_info = $element.data('Zebra_Tooltip');

                    // set this flag to FALSE so we can hide the tooltip
                    tooltip_info.sticky = false;

                    // cache updated tooltip data
                    $element.data('Zebra_Tooltip', tooltip_info);

                    // hide the tooltip
                    _hide($element);

                // add the "close" button to the tooltip
                }).appendTo(tooltip_info.message);

                // make sure we only create the "close" button once
                tooltip_info.close = true;

                // update tooltip data
                tooltip_info = $.extend($element.data('Zebra_Tooltip'), tooltip_info);

                // cache updated tooltip data
                $element.data('Zebra_Tooltip', tooltip_info);

            }

            // if browser window was resized or scrolled
            if (tooltip_info.window_resized || tooltip_info.window_scrolled) {

                // reference to the browser window
                var browser_window = $(window);

                // if the browser window was resized
                if (tooltip_info.window_resized) {

                    // get the browser window's width
                    window_width = browser_window.width();

                    // get the browser window's height
                    window_height = browser_window.height();

                    // get the element's position, relative to the document
                    var element_position = $element.offset();

                    // cache element's position and size
                    $.extend(tooltip_info, {

                        'element_left':     element_position.left,
                        'element_top':      element_position.top,
                        'element_width':    $element.outerWidth(),
                        'element_height':   $element.outerHeight()

                    });

                }

                // get the browser window's horizontal and vertical scroll offsets
                vertical_scroll = browser_window.scrollTop();
                horizontal_scroll = browser_window.scrollLeft();

                // compute tooltip's and the arrow's positions
                var tooltip_left =  plugin.settings.position == 'left' ? tooltip_info.element_left - tooltip_info.tooltip_width + tooltip_info.arrow_width :
                                    (plugin.settings.position == 'right' ? tooltip_info.element_left + tooltip_info.element_width - tooltip_info.arrow_width :
                                    (tooltip_info.element_left + (tooltip_info.element_width - tooltip_info.tooltip_width) / 2)),

                    tooltip_top =   tooltip_info.element_top - tooltip_info.tooltip_height,

                    arrow_left =    plugin.settings.position == 'left' ? tooltip_info.tooltip_width - tooltip_info.arrow_width - (tooltip_info.arrow_width / 2) :
                                    (plugin.settings.position == 'right' ? (tooltip_info.arrow_width / 2) :
                                    ((tooltip_info.tooltip_width - tooltip_info.arrow_width) / 2));

                // if tooltip's right side is outside te visible part of the browser's window
                if (tooltip_left + tooltip_info.tooltip_width > window_width + horizontal_scroll) {

                    // adjust the arrow's position
                    arrow_left -= (window_width + horizontal_scroll) - (tooltip_left + tooltip_info.tooltip_width) - 6;

                    // adjust the tooltip's position
                    tooltip_left = (window_width + horizontal_scroll) - tooltip_info.tooltip_width - 6;

                    // if after the adjustment, the arrow still needs to be adjusted
                    if (arrow_left + tooltip_info.arrow_width > tooltip_info.tooltip_width - 6)

                        // adjust the arrow's position
                        arrow_left = tooltip_info.tooltip_width - 6 - tooltip_info.arrow_width;

                    // if there is no space to show the arrow, hide it
                    if (tooltip_left + arrow_left + (tooltip_info.arrow_width / 2) < tooltip_info.element_left) arrow_left = -10000;

                }

                // if tooltip's left side is outside te visible part of the browser's window
                if (tooltip_left < horizontal_scroll) {

                    // adjust the arrow's position
                    arrow_left -= horizontal_scroll - tooltip_left;

                    // adjust the tooltip's position
                    tooltip_left = horizontal_scroll + 2;

                    // if after the adjustment, the arrow still needs to be adjusted
                    if (arrow_left < 0)

                        // adjust the arrow's position
                        arrow_left = (tooltip_info.arrow_width / 2);

                    // if there is no space to show the arrow, hide it
                    if (tooltip_left + arrow_left + (tooltip_info.arrow_width / 2) > tooltip_info.element_left + tooltip_info.element_width) arrow_left = -10000;

                }

                // by default, we assume the tooltip is centered above the element and therefore the arrow is at bottom of the tooltip
                // (we remove everything that might have been set on a previous iteration)
                tooltip_info.arrow_container.removeClass('Zebra_Tooltip_Arrow_Top');
                tooltip_info.arrow_container.addClass('Zebra_Tooltip_Arrow_Bottom');
                tooltip_info.message.css('margin-top', '');

                // set the arrow's color (we set it for different sides depending if it points upwards or downwards)
                tooltip_info.arrow.css('borderColor', plugin.settings.background_color + ' transparent transparent');

                // if 
                if (

                    // top of the tooltip is outside the visible part of the browser's window OR
                    tooltip_top < vertical_scroll ||

                    // tooltips are to be shown from below the element, and there is enough space below the element to show the tooltip
                    (plugin.settings.default_position == 'below' && tooltip_info.element_top + tooltip_info.element_height + plugin.settings.vertical_offset + tooltip_info.tooltip_height + tooltip_info.animation_offset < window_height + vertical_scroll)

                ) {

                    // place the tooltip beneath the element, rather than above, also account for the offset
                    tooltip_top = tooltip_info.element_top + tooltip_info.element_height - plugin.settings.vertical_offset;

                    // the tooltip will slide upwards, rather than downwards
                    tooltip_info.animation_offset = Math.abs(tooltip_info.animation_offset);

                    // the body of the tooltip needs to be vertically aligned at the bottom
                    tooltip_info.message.css('margin-top', (tooltip_info.arrow_height / 2));

                    // in this case, the arrow need to point upwards rather than downwards
                    // and be placed above the body of the tooltip and not beneath
                    tooltip_info.arrow_container.removeClass('Zebra_Tooltip_Arrow_Bottom');
                    tooltip_info.arrow_container.addClass('Zebra_Tooltip_Arrow_Top');

                    // set the arrow's color (we set it for different sides depending if it points upwards or downwards)
                    tooltip_info.arrow.css('borderColor', 'transparent transparent ' + plugin.settings.background_color);

                // if top of the tooltip is inside the visible part of the browser's window
                } else {

                    // the tooltip will slide downwards
                    tooltip_info.animation_offset = -Math.abs(tooltip_info.animation_offset);

                    // account for the offset
                    tooltip_top += plugin.settings.vertical_offset;

                }

                // set the arrow's horizontal position within the tooltip
                tooltip_info.arrow_container.css('left', arrow_left);

                // set the tooltip's final position
                tooltip_info.tooltip.css({
                    'left': tooltip_left,
                    'top':  tooltip_top
                });

                // update tooltip data
                $.extend(tooltip_info, {

                    'tooltip_left': tooltip_left,
                    'tooltip_top':  tooltip_top,
                    'arrow_left':   arrow_left

                });

                // we set these two properties to FALSE so that no further computation takes place, unless the browser
                // window is resized or scrolled
                tooltip_info.window_resized = false;
                tooltip_info.window_scrolled = false;

                // update tooltip data
                tooltip_info = $.extend($element.data('Zebra_Tooltip'), tooltip_info);

                // cache updated tooltip data
                $element.data('Zebra_Tooltip', tooltip_info);

            }

            // return an object with tooltip data
            return tooltip_info;

		};

        /**
         *  Hides the tooltip attached to the element given as argument.
         *
         *  @param  jQuery  $element    The jQuery version of a DOM element for which to hide the attached plugin
         *
         *  @return void
         *
         *  @access private
         */
        var _hide = function($element) {

            // get information about the tooltip attached to the element given as argument
            var tooltip_info = $element.data('Zebra_Tooltip');

            // if there is already a timeout for hiding the tooltip, cancel it
            clearTimeout(tooltip_info.hide_timeout);

            // if tooltip is not sticky (when it can only be closed by the user)
            if (!tooltip_info.sticky) {

                // clear the timeout for showing the tooltip (if any)
                clearTimeout(tooltip_info.show_timeout);

                // hide the tooltip, using the specified delay (if any)
                tooltip_info.hide_timeout = setTimeout(function() {

                    // if there is a tooltip attached to the element
                    // (as one can call the hide() method method prior of the tooltip being ever shown)
                    if (tooltip_info.tooltip) {

                        // if a callback function exists to be run before hiding a tooltip
                        if (plugin.settings.onBeforeHide && typeof plugin.settings.onBeforeHide == 'function')

                            // execute the callback function
                            plugin.settings.onBeforeHide($element, tooltip_info.tooltip);

                        // set this flag to FALSE so that the script knows that it has to add the "close" button again
                        // if the tooltip is shown using the API
                        tooltip_info.close = false;

                        // if tooltip needs to be destroyed once it fades out
                        if (tooltip_info.destroy)

                            // set this flag now so that the tooltip is not shown again if the user quickly hovers
                            // the element while if fades out
                            tooltip_info.muted = true;

                        // cache updated tooltip data
                        $element.data('Zebra_Tooltip', tooltip_info);

                        // remove the "close" button
                        $('a.Zebra_Tooltip_Close', tooltip_info.tooltip).remove();

                        // if the tooltip was in the midst of an animation, stop that
                        tooltip_info.tooltip.stop();

                        // animate the tooltip
                        tooltip_info.tooltip.animate({

                            'opacity':  0,
                            'top':      tooltip_info.tooltip_top + tooltip_info.animation_offset

                        // using the specified speed
                        }, plugin.settings.animation_speed, function() {

                            // set the tooltip's "display" property to "none"
                            $(this).css('display', 'none');

                            // if a callback function exists to be run after hiding a tooltip
                            if (plugin.settings.onHide && typeof plugin.settings.onHide == 'function')

                                // execute the callback function
                                plugin.settings.onHide($element, tooltip_info.tooltip);

                        });

                    }

                // the delay after which to hide the plugin
                }, plugin.settings.hide_delay);

            }

        };

        /**
         *  Shows the tooltip attached to the element given as argument.
         *
         *  @param  jQuery  $element    The jQuery version of a DOM element for which to show the attached plugin
         *
         *  @return void
         *
         *  @access private
         */
        var _show = function($element) {

            // get a reference to the attached tooltip and its components
            var tooltip_info = $element.data('Zebra_Tooltip');

            // if there is already a timeout for showing the tooltip, cancel it
            clearTimeout(tooltip_info.show_timeout);

            // if tooltip is not "muted" (case in which can only be shown using the API)
            if (!tooltip_info.muted) {

                // clear the timeout for hiding the tooltip (if any)
                clearTimeout(tooltip_info.hide_timeout);

                // show the tooltip, using the specified delay (if any)
                tooltip_info.show_timeout = setTimeout(function() {

                    // if not already created, create the tooltip
                    tooltip_info = _create_tooltip($element);

                    // if a callback function exists to be run before showing a tooltip
                    if (plugin.settings.onBeforeShow && typeof plugin.settings.onBeforeShow == 'function')

                        // execute the callback function
                        plugin.settings.onBeforeShow($element, tooltip_info.tooltip);

                    // if tooltip is not already being animated
                    if (tooltip_info.tooltip.css('display') != 'block')

                        // set the tooltip's top so we can "slide" it in
                        tooltip_info.tooltip.css({
                            'top':  tooltip_info.tooltip_top + tooltip_info.animation_offset
                        });

                    // set the tooltip's "display" property to "block"
                    tooltip_info.tooltip.css('display', 'block');

                    // if the tooltip was in the midst of an animation, stop that
                    tooltip_info.tooltip.stop();

                    // animate the tooltip
                    tooltip_info.tooltip.animate({

                        'top':      tooltip_info.tooltip_top,
                        'opacity':  plugin.settings.opacity

                    // using the specified speed
                    }, plugin.settings.animation_speed, function() {

                        // if a callback function exists to be run after showing a tooltip
                        if (plugin.settings.onShow && typeof plugin.settings.onShow == 'function')

                            // execute the callback function
                            plugin.settings.onShow($element, tooltip_info.tooltip);

                    });

                // the delay after which to show the plugin
                }, plugin.settings.show_delay);

            }

        };

        // fire it up!
        _init();

    };

})(jQuery);