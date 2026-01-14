self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: data.icon || '/venux-push-icon.png',
            badge: data.badge || '/venux-badge.png',
            vibrate: [200, 100, 200],
            tag: data.id || 'venux-reminder',
            renotify: true,
            data: {
                url: data.url || '/'
            },
            actions: [
                {
                    action: 'open',
                    title: 'Abrir Venux',
                    icon: '/venux-badge.png'
                }
            ]
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const urlToOpen = event.notification.data.url || '/';
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(function (windowClients) {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
