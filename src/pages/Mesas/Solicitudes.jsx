import { useState, useEffect } from 'react';
import { getSolicitudesActivas, procesarSolicitud, finalizarSolicitud } from '../../services/api';
import useSocket from '../../hooks/useSocket';
import Notificaciones from '../../components/Notificaciones';
import Login from '../Login/Login';
import CoreUILayout from '../../layouts/CoreUILayout';
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CButton, CBadge,
  CToast, CToastBody, CToaster
} from '@coreui/react';

const audio = new Audio('/sonidos/owler.mp3');

function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getBadgeColor(estado) {
  switch (estado) {
    case 'nuevo': return 'warning';
    case 'proceso': return 'info';
    case 'atendido': return 'success';
    default: return 'secondary';
  }
}

function getTiempoTranscurrido(fecha_creacion, ahora) {
  const creada = new Date(fecha_creacion);
  const diffMs = ahora - creada;
  const minutos = Math.floor(diffMs / 60000);
  const segundos = Math.floor((diffMs % 60000) / 1000);
  return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [ahora, setAhora] = useState(new Date());
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [toasts, setToasts] = useState([]);
  const socket = useSocket();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  useEffect(() => {
    const timer = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token) return;
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
          console.warn('Notificaciones no habilitadas');
        }
      });
    }
    getSolicitudesActivas().then(res => setSolicitudes(res.data));
    if (socket) {
      socket.on('nueva_solicitud', (nuevaSolicitud) => {
        setSolicitudes(prev => [...prev, nuevaSolicitud]);
        setToasts(prev => [
          ...prev,
          {
            id: Date.now(),
            body: `Nueva solicitud en la mesa ${nuevaSolicitud.mesa}: ${nuevaSolicitud.tipo}`,
          }
        ]);
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
  }, [socket, token]);

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

  const solicitudesOrdenadas = [...solicitudes].sort((a, b) => {
    const ordenEstado = { nuevo: 0, proceso: 1, atendido: 2 };
    if (ordenEstado[a.estado] !== ordenEstado[b.estado]) {
      return ordenEstado[a.estado] - ordenEstado[b.estado];
    }
    return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
  });

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return (
    <CoreUILayout
      onLogout={handleLogout}
      title="Solicitudes"
      breadcrumbs={[
        { label: 'Mesas', to: '/meseros' },
        { label: 'Solicitudes' }
      ]}
    >
      <Notificaciones />
      <CTable striped hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">Hora</CTableHeaderCell>
            <CTableHeaderCell scope="col">Mesa</CTableHeaderCell>
            <CTableHeaderCell scope="col">Tipo</CTableHeaderCell>
            <CTableHeaderCell scope="col">Estado</CTableHeaderCell>
            <CTableHeaderCell scope="col">Tiempo Transcurrido</CTableHeaderCell>
            <CTableHeaderCell scope="col">Acción</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {solicitudesOrdenadas.map(solicitud => (
            <CTableRow key={solicitud.id}>
              <CTableDataCell>{formatearFecha(solicitud.fecha_creacion)}</CTableDataCell>
              <CTableDataCell><b>{solicitud.mesa}</b></CTableDataCell>
              <CTableDataCell>{solicitud.tipo}</CTableDataCell>
              <CTableDataCell>
                <CBadge color={getBadgeColor(solicitud.estado)}>
                  {solicitud.estado}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell>
                {(solicitud.estado === 'nuevo' || solicitud.estado === 'proceso') ? (
                  <span style={{ fontFamily: 'monospace' }}>
                    {getTiempoTranscurrido(solicitud.fecha_creacion, ahora)}
                  </span>
                ) : '-'}
              </CTableDataCell>
              <CTableDataCell>
                {solicitud.estado === 'nuevo' && (
                  <CButton color="info" size="sm" onClick={() => handleProcesar(solicitud.id)}>
                    Iniciar
                  </CButton>
                )}
                {solicitud.estado === 'proceso' && (
                  <CButton color="success" size="sm" onClick={() => handleFinalizar(solicitud.id)}>
                    Finalizar
                  </CButton>
                )}
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
      <CToaster position="top-end">
        {toasts.map(toast => (
          <CToast key={toast.id} autohide={true} visible={true} color="info" className="mb-2">
            <CToastBody>{toast.body}</CToastBody>
          </CToast>
        ))}
      </CToaster>
    </CoreUILayout>
  );
}