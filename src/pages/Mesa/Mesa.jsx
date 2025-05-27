import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';
import styles from './Mesa.module.css';
import Overlay from '../../components/Overlay/Overlay';
import { getEstadoMesa, crearSolicitud } from '../../services/api';
import { GiChecklist, GiKetchup, GiMagicSwirl, GiSpellBook, GiSaltShaker, GiGlassShot, GiChiliPepper, GiHoodedFigure } from 'react-icons/gi';
import logo from '../../assets/logo-caldero.png';
import { encriptar, desencriptar } from '../../utils/cryptoUtils';

const solicitudes = [
  { tipo: 'ordenar', icono: <GiChecklist />, clase: styles.servilletas },
  { tipo: 'mayonesa', icono: <GiKetchup />, clase: styles.servilletas },
  { tipo: 'servilletas', icono: <GiMagicSwirl />, clase: styles.servilletas },
  { tipo: 'sal', icono: <GiSaltShaker />, clase: styles.sal },
  { tipo: 'aji', icono: <GiChiliPepper />, clase: styles.aji },
  { tipo: 'vasos', icono: <GiGlassShot />, clase: styles.vasos },
  { tipo: 'cuenta', icono: <GiSpellBook />, clase: styles.cuenta },
  { tipo: 'mesero', icono: <GiHoodedFigure />, clase: styles.otro }
];

export default function Mesa() {
  const { mesaId } = useParams();
  const mesaNumber = desencriptar(mesaId);
  const [estadoSolicitud, setEstadoSolicitud] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [errorBanner, setErrorBanner] = useState(null);
  const socket = useSocket();

  // Verificar el estado actual de la mesa al cargar la página
  useEffect(() => {
    const verificarEstadoMesa = async () => {
      try {
        const { data } = await getEstadoMesa(mesaNumber);
        if (data && (data.estado === 'nuevo' || data.estado === 'proceso')) {
          setEstadoSolicitud(data.estado);
          setTipoSeleccionado(data.tipo);
        }
      } catch (err) {
        console.error('Error al verificar el estado de la mesa:', err.message);
        setErrorBanner(err.message);
        setTimeout(() => setErrorBanner(null), 6000);
      }
    };

    verificarEstadoMesa();
  }, [mesaNumber]);

  // Escuchar eventos del WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleNuevaSolicitud = (nuevaSolicitud) => {
      if (nuevaSolicitud.mesa === parseInt(mesaNumber)) {
        setEstadoSolicitud('nuevo');
        setTipoSeleccionado(nuevaSolicitud.tipo);
      }
    };

    const handleSolicitudActualizada = (actualizada) => {
      if (actualizada.mesa === parseInt(mesaNumber)) {
        setEstadoSolicitud(actualizada.estado);
        setTipoSeleccionado(actualizada.tipo);
      }
    };

    socket.on('nueva_solicitud', handleNuevaSolicitud);
    socket.on('solicitud_actualizada', handleSolicitudActualizada);

    return () => {
      socket.off('nueva_solicitud', handleNuevaSolicitud);
      socket.off('solicitud_actualizada', handleSolicitudActualizada);
    };
  }, [socket, mesaNumber]);

  const solicitar = async (tipo) => {
    if (estadoSolicitud === 'nuevo' || estadoSolicitud === 'proceso') {
      alert('Ya tienes una solicitud en proceso. Espera a que sea atendida.');
      return;
    }

    try {
      await crearSolicitud({ mesa: parseInt(mesaNumber), tipo });
      setTipoSeleccionado(tipo);
      setEstadoSolicitud('nuevo');
    } catch (err) {
      let mensaje = 'Error al enviar la solicitud.';
      if (err.response && err.response.status === 403) {
        mensaje = 'Solo se puede hacer solicitudes dentro del restaurante.';
      } else if (err.message) {
        mensaje = err.message;
      }
      setErrorBanner(mensaje);
      setTimeout(() => setErrorBanner(null), 6000);
      console.error('Error al enviar la solicitud:', err.message);
    }
  };

  return (
    <div className={styles.container}>
      {errorBanner && (
        <div className={styles.error_banner} role="alert">
          {errorBanner}
        </div>
      )}
      <header className={styles.header}>
        <img
          src={logo}
          alt="Logo de El Caldero Flameante"
          className={styles.logo}
        />
      </header>

      <div className={styles.mesaContainer}>
        <span className={styles.mesaNumber}>Mesa {mesaNumber}</span>
      </div>

      <div className={styles.buttonGrid}>
        {solicitudes.map((item) => (
          <button
            key={item.tipo}
            onClick={() => solicitar(item.tipo)}
            className={`${styles.magicButton} ${item.clase}`}
            aria-label={`Solicitar ${item.tipo}`}
          >
            {item.icono}
            <span>{item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}</span>
          </button>
        ))}
      </div>

      <Overlay estado={estadoSolicitud} tipo={tipoSeleccionado} />
    </div>
  );
}