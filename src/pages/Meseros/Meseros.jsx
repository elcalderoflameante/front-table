import { useState, useEffect } from 'react';
import { getSolicitudesActivas, procesarSolicitud, finalizarSolicitud } from '../../services/api';
import useSocket from '../../hooks/useSocket';
import Notificaciones from '../../components/Notificaciones';
import styles from './Meseros.module.css';

const audio = new Audio('/sonidos/owler.mp3');

function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// Componente de fecha
function Fecha() {
  const [hoy, setHoy] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setHoy(new Date()), 60000); // Actualiza cada minuto
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.fecha}>
      {hoy.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })}
    </div>
  );
}

// Componente de reloj
function Reloj() {
  const [hora, setHora] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.reloj}>
      {hora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
}

// Devuelve la clase del círculo de prioridad según el tiempo transcurrido
function getCirculoClass(fecha_creacion, estado, ahora) {
  if (estado === 'atendido') return '';
  const creada = new Date(fecha_creacion);
  const minutos = (ahora - creada) / 60000;
  if (minutos < 2) return `${styles.circuloPrioridad} ${styles.circuloVerde}`;
  if (minutos < 4) return `${styles.circuloPrioridad} ${styles.circuloAmarillo}`;
  return `${styles.circuloPrioridad} ${styles.circuloRojo}`;
}

// Calcula el tiempo transcurrido en formato mm:ss
function getTiempoTranscurrido(fecha_creacion, ahora) {
  const creada = new Date(fecha_creacion);
  const diffMs = ahora - creada;
  const minutos = Math.floor(diffMs / 60000);
  const segundos = Math.floor((diffMs % 60000) / 1000);
  return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

export default function Meseros() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [ahora, setAhora] = useState(new Date());
  const socket = useSocket();

  // Actualiza el tiempo cada segundo para refrescar colores y tiempos
  useEffect(() => {
    const timer = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
        s.id === id ? { ...s, estado: 'atendido' } : s
      ));

      if (socket) {
        socket.emit('solicitud_actualizada', { id, estado: 'atendido' });
      }
    } catch (err) {
      console.error('Error al finalizar la solicitud:', err.message);
    }
  };

  // Ordenar primero por estado (nuevo, proceso, atendido) y luego por fecha de creación descendente
  const solicitudesOrdenadas = [...solicitudes].sort((a, b) => {
    const ordenEstado = { nuevo: 0, proceso: 1, atendido: 2 };
    if (ordenEstado[a.estado] !== ordenEstado[b.estado]) {
      return ordenEstado[a.estado] - ordenEstado[b.estado];
    }
    return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
  });

  return (
    <div className={styles.container} style={{ position: 'relative' }}>
      <Fecha />
      <Reloj />
      <header className={styles.header}>
        <h1 className={styles.title}>Pantalla de Meseros</h1>
      </header>
      <Notificaciones />
      <ul className={styles.list}>
        {solicitudesOrdenadas.map(solicitud => (
          <li
            key={solicitud.id}
            className={styles.item}
          >
            <span>
              {(solicitud.estado === 'nuevo' || solicitud.estado === 'proceso') && (
                <span className={getCirculoClass(solicitud.fecha_creacion, solicitud.estado, ahora)}></span>
              )}
              <b>{formatearFecha(solicitud.fecha_creacion)}</b> — Mesa <b>{solicitud.mesa}</b>: {solicitud.tipo} (
              <span>
                {solicitud.estado}
              </span>
              )
              {(solicitud.estado === 'nuevo' || solicitud.estado === 'proceso') && (
                <> — <span style={{ fontFamily: 'monospace' }}>
                  {getTiempoTranscurrido(solicitud.fecha_creacion, ahora)}
                </span></>
              )}
            </span>
            {solicitud.estado === 'nuevo' && (
              <button className={styles.button} onClick={() => handleProcesar(solicitud.id)}>Iniciar</button>
            )}
            {solicitud.estado === 'proceso' && (
              <button className={styles.button} onClick={() => handleFinalizar(solicitud.id)}>Finalizar</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}