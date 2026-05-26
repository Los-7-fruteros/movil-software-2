// src/services/predios.js
import { api } from '../config/api';

export const listPredios = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/api/predios${qs ? `?${qs}` : ''}`);
};

export const listPrediosByUsuario = (usuarioId) =>
  api.get(`/api/predios/usuario/${usuarioId}`);

export const getPredio = (id) => api.get(`/api/predios/${id}`);

export const createPredio = (data) => api.post('/api/predios', data);

export const updatePredio = (id, data) => api.put(`/api/predios/${id}`, data);

export const deletePredio = (id) => api.del(`/api/predios/${id}`);
