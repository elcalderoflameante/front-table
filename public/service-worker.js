self.addEventListener('push', function(event) {
  const data = event.data.json();
  const title = data.title || 'Nueva Solicitud';
  const options = {
    body: data.body,
    icon: '/imagenes/notificacion-icono.png',
    badge: '/imagenes/notificacion-icono.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  // Cambia la URL por la ruta de tu pantalla de solicitudes
  const urlToOpen = '/solicitudes';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Si ya hay una pestaña abierta con la app, enfócala y navega a la ruta
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      // Si no hay ninguna, abre una nueva
      return clients.openWindow(urlToOpen);
    })
  );
});