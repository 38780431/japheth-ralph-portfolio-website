const CACHE_NAME = 'jrn-portfolio-v1';
const APP_FILES = [
    '',
    'index.html',
    'about.html',
    'portfolio.html',
    'services.html',
    'contact.html',
    'style.css',
    'script.js',
    'manifest.webmanifest',
    'JAPHETH RALPH. CV.pdf',
    'image of japheth ralph.jpg',
    'assets/favicon.svg',
    'assets/pwa-icon-192.png',
    'assets/pwa-icon-512.png',
    'assets/japheth-portfolio.png',
    'assets/nutri-haven.png',
    'assets/ralph-digital-solutions.png'
];

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(APP_FILES.map(file => new URL(file, self.registration.scope)));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames
            .filter(name => name.startsWith('jrn-portfolio-') && name !== CACHE_NAME)
            .map(name => caches.delete(name)));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', event => {
    const request = event.request;
    const requestUrl = new URL(request.url);

    if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const response = await fetch(request);
                if (response.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    await cache.put(request, response.clone());
                }
                return response;
            } catch {
                const cachedPage = await caches.match(request, { ignoreSearch: true });
                if (cachedPage) return cachedPage;

                const homePage = new URL('index.html', self.registration.scope);
                return await caches.match(homePage);
            }
        })());
        return;
    }

    event.respondWith((async () => {
        const cachedFile = await caches.match(request);
        if (cachedFile) return cachedFile;

        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
        }
        return response;
    })());
});
