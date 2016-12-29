//importScripts('node_modules/sw-toolbox/sw-toolbox.js');
var cacheKey = 'CACHE-ONLY'

//toolbox.options.debug = true;
//toolbox.precache([
  //'/',
  //'/index.html',
  //'/fonts/fontawesome-webfont.eot',
  //'/fonts/fontawesome-webfont.svg',
  //'/fonts/fontawesome-webfont.ttf',
  //'/fonts/fontawesome-webfont.woff',
  //'/fonts/fontawesome-webfont.woff2',
  //'/fonts/FontAwesome.otf',
  //'/app.js',
  //'/sw.js',
  //'/css/files.min.css',
  //'/css/font.css',
  //'/css/colors.css',
  //'/css/style.css',
  //'/node_modules/sw-toolbox/sw-toolbox.js',
  //'/node_modules/sw-toolbox/lib/helpers.js',
  //'/node_modules/sw-toolbox/companion.js'
//])
//toolbox.router.get('/', toolbox.cacheFirst)
//toolbox.router.get('/(.*)', toolbox.cacheFirst, {origin: 'http://gearboxdev.iandelacruz.me'})

self.addEventListener('install', function(evt) {
var links = [
  '/',
  'index.html',
  'fonts/fontawesome-webfont.eot',
  'fonts/fontawesome-webfont.svg',
  'fonts/fontawesome-webfont.ttf',
  'fonts/fontawesome-webfont.woff',
  'fonts/fontawesome-webfont.woff2',
  'fonts/FontAwesome.otf',
  'app.js',
  'sw.js',
  'css/files.min.css',
  'css/font.css',
  'css/colors.css',
  'css/style.css',
]
  evt.waitUntil(
    caches.open(cacheKey)
    .then(cache => {
      return cache.addAll(links)
    })
  )
})

var _cacheFirst = function(event) {
  caches.match(event.request)
  .then(function(resp) {
    if(resp) console.log('WHAT')
    return resp || fetch(event.request)
      .then(function(r) {
        console.log('HERE???')
        caches.open(cacheKey)
        .then(function(cache) {
          cache.put(event.request, r);
        });
      return r.clone();
    });
  })
  .catch(function() {
    console.log('NETWORK ERROR FAM')
  });
}

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
    .then(function(resp) {
      return resp || fetch(event.request)
        .then(function(r) {
          caches.open(cacheKey)
          .then(function(cache) {
            cache.put(event.request, r)
          })
          return r.clone();
        });
    })
    .catch(function() {
      console.log('NETWORK ERROR FAM')
    })
  )
})

var _fromCache = function(request) {
  return caches.open(cacheKey)
  .then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching || Promise.reject('no-match');
    });
  });
}
