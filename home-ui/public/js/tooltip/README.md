##Zebra_Tooltips

####A lightweight and highly configurable jQuery plugin for creating simple but smart and attractive tooltips

Zebra_Tooltips is a lightweight (around 6KB minified, 1.9KB gzipped) jQuery plugin for creating simple but smart and visually attractive tooltips, featuring nice transitions, and offering a wide range of configuration options. The plugin detects the edges of the browser window and makes sure that the tooltips always stay in the visible area of the browser window by placing them beneath or above the parent element, and shifting them left or right so that the tooltips are always visible.

Besides the default behavior of tooltips showing when user hovers the element, tooltips may also be shown and hidden programmatically using the API. When shown programmatically, the tooltips will feature a "close" button, and clicking it will be the only way of closing tooltips opened this way. This is very useful for drawing users' attention to specific areas of a website (like error messages after validating a form).

By default, the plugin will use the "title" attribute of the element for the tooltip's content, but the tooltip's content can also be specified via the "zebra-tooltip" data attribute, or programmatically. Tooltips' appearance can be easily customized both through JavaScript and/or CSS. Also, tooltips can be aligned left, center or right, relative to the parent element.

Zebra_Tooltips uses NO IMAGES (everything is handled from CSS), and falls back gracefully for browsers that don't support all the fancy stuff; also, tooltips can be attached to any element not just anchor tags!

Works in all major browsers (Firefox, Opera, Safari, Chrome, Internet Explorer 6+)

![Screenshot](https://raw.github.com/stefangabos/Zebra_Tooltips/master/examples/screenshot.png)

##Features

 - lightweight (around 6KB minified, 1.9KB gzipped)
 - features nice transitions
 - detects the edges of the browser window and makes sure that the tooltips always stay in the visible area of the browser window by placing them beneath or above the elements and shifting them left or right so that the tooltips are always visible
 - tooltips may also be shown and hidden using the API
 - appearance can be easily customized both through JavaScript and/or CSS
 - tooltips can be aligned left, center or right, relative to the parent element
 - makes use of NO IMAGES (everything is handled from CSS), and falls back gracefully for browsers that don't support all the fancy stuff
 - can be attached to any elements not just anchors
 - works in all major browsers (Firefox, Opera, Safari, Chrome, Internet Explorer 6+)

##Requirements

Zebra_Tooltips has no dependencies other than jQuery. The recommended jQuery version is 1.7+ (due to the fact that the library makes use of something that the previous versions of jQuery have done in a way that it it now deprecated in WebKit powered browsers)

##Installation

```
bower install zebra_tooltips
```

##How to use

First, load the latest version of jQuery from a CDN and provide a fallback to a local source, like:

```html
<script src="https://code.jquery.com/jquery-1.12.0.min.js"></script>
<script>window.jQuery || document.write('<script src="path/to/jquery-1.12.0.js"></script>')</script>
```

Load the Zebra_Tooltips plugin

```html
<script type="text/javascript" src="path/to/zebra_tooltips.js"></script>
```

Load the plugin’s stylesheet file

```html
<link rel="stylesheet" href="path/to/zebra_tooltips.css" type="text/css">
```

Now, within the DOM-ready event do

```javascript
$(document).ready(function() {

    // show tooltips for any element that has a class named "tooltips"
    // the content of the tooltip will be taken from the element's "title" attribute
    new $.Zebra_Tooltips($('.tooltips'));

});
```

Configuration options and demos on the **[project's homepage](http://stefangabos.ro/jquery/zebra-tooltips/)**
