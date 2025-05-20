import { useEffect } from 'react';

export default function Notificaciones() {
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  return null; // O un botón para activar notificaciones manualmente
}