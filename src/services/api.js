import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Funciones para Meseros.jsx
export const getSolicitudesActivas = () => api.get('/solicitudes/activas');
export const procesarSolicitud = (id) => api.patch(`/solicitudes/${id}/procesar`);
export const finalizarSolicitud = (id) => api.patch(`/solicitudes/${id}/finalizar`);

// Funciones para Mesa.jsx
export const getEstadoMesa = (mesaId) => api.get(`/solicitudes/mesa/${mesaId}`);
export const crearSolicitud = (data) => api.post('/solicitudes', data);