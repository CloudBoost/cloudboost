'use strict';

var cacheVersion = 1;
var currentCache = {
  offline: 'offline-cache' + cacheVersion,
};
const offlineUrl = 'offline-page.html';

this.addEventListener('install', event => {
  event.waitUntil(
    caches.open(currentCache.offline).then(function (cache) {
      return cache.addAll([
        '/images/background/bg-header-2.jpg',
        '/images/wifi.png',
        '/images/CLoudBoostLogo-White-250.png',
        offlineUrl,
        '/dist/css/applib.min.css',
        '/css/trendingBox.css',
        '/css/codemirror.css',
        '/js/codemirror.js',
        '/js/codemirror-javascript.js',
        "/controllers/trendingBoxController.js",
        "/vendors/slick-carousel/slick/slick.min.js",
        "/js/typed.js",
        "/controllers/indexController.js"
      ]);
    })
  );
});

this.addEventListener('fetch', event => {
  // request.mode = navigate isn't supported in all browsers
  // so include a check for Accept: text/html header.
  if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request.url).catch(error => {
        // Return the offline page
        return caches.match(offlineUrl);
      })
    );
  }
  else {
    // Respond with everything else if we can
    // fetch fresh data
    var networkUpdate = fetch('/data.json').then(function (response) {
      return response.json();
    }).then(function (data) {
      networkDataReceived = true;
      updatePage(data);
    });

    // fetch cached data
    caches.match(event.request).then(function (response) {
      if (!response) throw Error("No data");
      return response.json();
    }).then(function (data) {
      // don't overwrite newer network data
      if (!networkDataReceived) {
        updatePage(data);
      }
    }).catch(function () {
      // we didn't get cached data, the network is our last hope:
      return networkUpdate;
    }).catch(showErrorMessage);
  }
});