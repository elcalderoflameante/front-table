import { useState, useEffect } from 'react';
import { getSolicitudesActivas, procesarSolicitud, finalizarSolicitud } from '../services/api';
import useSocket from '../hooks/useSocket';
import Notificaciones from '../components/Notificaciones';

const audio = new Audio('/sonidos/owler.mp3');

export default function Meseros() {
  const [solicitudes, setSolicitudes] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    // Pedir permiso para notificaciones
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
          console.warn('Notificaciones no habilitadas');
        }
      });
    }

    // Cargar solicitudes al inicio
    getSolicitudesActivas().then(res => setSolicitudes(res.data));

    // Escuchar nuevas solicitudes via WebSocket
    if (socket) {
      socket.on('nueva_solicitud', (nuevaSolicitud) => {
        setSolicitudes(prev => [...prev, nuevaSolicitud]);

        if (Notification.permission === 'granted') {
          new Notification(`Mesa ${nuevaSolicitud.mesa}`, {
            body: `Solicitó ${nuevaSolicitud.tipo}`,
            icon: '/imagenes/notificacion-icono.png'
          });

          audio.play().catch(err => {
            console.log('No se pudo reproducir el sonido:', err);
          });
        }
      });

      socket.on('solicitud_actualizada', (actualizada) => {
        setSolicitudes(prev => prev.map(s => 
          s.id === actualizada.id ? actualizada : s
        ));
      });
    }
  }, [socket]);

  const handleProcesar = async (id) => {
    try {
      await procesarSolicitud(id);
      setSolicitudes(prev => prev.map(s => 
        s.id === id ? { ...s, estado: 'proceso' } : s
      ));

      // Emitir evento al WebSocket
      if (socket) {
        socket.emit('solicitud_actualizada', { id, estado: 'proceso' });
      }
    } catch (err) {
      console.error('Error al procesar la solicitud:', err.message);
    }
  };

  const handleFinalizar = async (id) => {
    try {
      await finalizarSolicitud(id);
      setSolicitudes(prev => prev.map(s => 
        s.id === id ? { ...s, estado: 'finalizado' } : s
      ));

      // Emitir evento al WebSocket
      if (socket) {
        socket.emit('solicitud_actualizada', { id, estado: 'finalizado' });
      }
    } catch (err) {
      console.error('Error al finalizar la solicitud:', err.message);
    }
  };

  return (
    <div>
      <h1>Pantalla de Meseros</h1>
      <Notificaciones />
      <ul>
        {solicitudes.map(solicitud => (
          <li key={solicitud.id}>
            Mesa {solicitud.mesa}: {solicitud.tipo} ({solicitud.estado})
            {solicitud.estado === 'nuevo' && (
              <button onClick={() => handleProcesar(solicitud.id)}>Iniciar</button>
            )}
            {solicitud.estado === 'proceso' && (
              <button onClick={() => handleFinalizar(solicitud.id)}>Finalizar</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}