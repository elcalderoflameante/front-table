import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor para agregar el token a cada petición si existe
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Funciones para Meseros.jsx
export const getSolicitudesActivas = () => api.get('/solicitudes/activas');
export const procesarSolicitud = (id) => api.patch(`/solicitudes/${id}/procesar`);
export const finalizarSolicitud = (id) => api.patch(`/solicitudes/${id}/finalizar`);

// Funciones para Mesa.jsx
export const getEstadoMesa = (mesaId) => api.get(`/solicitudes/mesa/${mesaId}`);
export const crearSolicitud = (data) => api.post('/solicitudes', data);

// Función para Login.jsx
export const login = (data) => api.post('/auth/login', data);

export default api;