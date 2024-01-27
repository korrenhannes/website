// Basic service worker for PWA
self.addEventListener('install', e => {
    console.log('Service Worker: Installed');
});

self.addEventListener('fetch', e => {
    console.log('Service Worker: Fetching');
    // Here you can add caching strategies
});
