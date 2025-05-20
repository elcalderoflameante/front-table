import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(url = import.meta.env.VITE_SOCKET_URL) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketIo = io(url, {
      reconnection: true, // Intentar reconexión automática
      reconnectionAttempts: 5, // Número máximo de intentos
      reconnectionDelay: 2000, // Tiempo entre intentos
      transports: ['websocket'], // Usar solo WebSocket
    });

    setSocket(socketIo);

    socketIo.on('connect', () => {
      console.log('Conectado al WebSocket');
    });

    socketIo.on('connect_error', (err) => {
      console.error('Error de conexión al WebSocket:', err.message);
    });

    socketIo.on('disconnect', (reason) => {
      console.warn('Desconectado del WebSocket:', reason);
    });

    return () => {
      if (socketIo.connected) {
        socketIo.disconnect(); // Desconectar solo si está conectado
        console.log('WebSocket desconectado correctamente');
      }
    };
  }, [url]);

  return socket;
}