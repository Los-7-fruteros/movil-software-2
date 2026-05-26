// src/services/sensores.js
import { api } from '../config/api';

export const listSensores = () => api.get('/api/sensores');
export const listSensoresByPredio = (predioId) =>
  api.get(`/api/sensores/predio/${predioId}`);
export const getSensor = (id) => api.get(`/api/sensores/${id}`);
export const createSensor = (data) => api.post('/api/sensores', data);
export const updateSensor = (id, data) => api.put(`/api/sensores/${id}`, data);
export const deleteSensor = (id) => api.del(`/api/sensores/${id}`);
