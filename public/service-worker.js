
// Nombre y versión de la caché
const CACHE_NAME = 'seriessparkle-v1';

// Recursos que se cachearán al instalar el Service Worker
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/title.html',
  '/style.css',
  '/js/main.js',
  '/js/api.js',
  '/js/carousel.js',
  '/js/pagination.js',
  '/js/filters.js',
  '/js/search.js',
  '/js/favorites.js',
  '/placeholder.svg'
];

// Instalar el Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cacheando archivos estáticos');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activar el Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('[Service Worker] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de caché: Network First con fallback a Cache
self.addEventListener('fetch', event => {
  // Solo interceptamos peticiones GET
  if (event.request.method !== 'GET') return;
  
  const requestUrl = new URL(event.request.url);
  
  // Manejo especial para peticiones a la API
  if (requestUrl.pathname.includes('/api/')) {
    event.respondWith(
      // Intentar obtener de la red primero
      fetch(event.request)
        .then(response => {
          // Si la respuesta es válida, la guardamos en caché
          if (response && response.status === 200) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Si falla la red, intentamos recuperar de la caché
          console.log('[Service Worker] Recuperando de caché:', event.request.url);
          return caches.match(event.request);
        })
    );
  } else {
    // Para recursos estáticos: Cache First con fallback a Network
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si no está en caché, lo buscamos en la red
          return fetch(event.request)
            .then(response => {
              // Solo guardamos en caché si la respuesta es válida
              if (response && response.status === 200) {
                const clonedResponse = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, clonedResponse);
                });
              }
              return response;
            });
        })
    );
  }
});

// Evento para precachear recursos específicos
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_TRENDING_DATA') {
    const trendingData = event.data.trendingData;
    const trendingUrls = event.data.trendingUrls || [];
    
    if (trendingData) {
      // Guardar la respuesta de trending como un objeto en la caché
      caches.open(CACHE_NAME).then(cache => {
        const response = new Response(JSON.stringify(trendingData), {
          headers: {'Content-Type': 'application/json'}
        });
        cache.put('/api/trending', response);
      });
    }
    
    // Cachear también las URLs de las imágenes de poster y backdrop
    if (trendingUrls.length > 0) {
      caches.open(CACHE_NAME).then(cache => {
        Promise.all(trendingUrls.map(url => 
          fetch(url).then(response => {
            if (response.ok) {
              return cache.put(url, response);
            }
          }).catch(error => console.error('Error cacheando imagen:', error))
        )).then(() => console.log('[Service Worker] Imágenes cacheadas correctamente'));
      });
    }
  }
});
