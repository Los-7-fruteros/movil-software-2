// src/services/alertas.js
import { api } from '../config/api';

export const listAlertas = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/api/alertas${qs ? `?${qs}` : ''}`);
};

export const listAlertasByPredio = (predioId, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/api/alertas/predio/${predioId}${qs ? `?${qs}` : ''}`);
};

export const getAlerta = (id) => api.get(`/api/alertas/${id}`);
export const createAlerta = (data) => api.post('/api/alertas', data);
export const deleteAlerta = (id) => api.del(`/api/alertas/${id}`);
