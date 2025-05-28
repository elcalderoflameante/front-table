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