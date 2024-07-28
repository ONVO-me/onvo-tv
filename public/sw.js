self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('my-cache').then(function(cache) {
            // Optionally, you can pre-cache some default assets here
        })
    );
});

self.addEventListener('fetch', function(event) {
    // Only handle GET requests
    if (event.request.method === 'GET') {
        event.respondWith(
            caches.match(event.request).then(function(response) {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(function(networkResponse) {
                    return caches.open('my-cache').then(function(cache) {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    } else {
        // If it's not a GET request, just fetch it from the network
        event.respondWith(fetch(event.request));
    }
});

self.addEventListener('message', function(event) {
    if (event.data.action === 'cache') {
        caches.open('my-cache').then(function(cache) {
            cache.add(event.data.url);
        });
    }
});