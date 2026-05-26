// src/services/umbrales.js
import { api } from '../config/api';

export const getUmbralesByPredio = (predioId) =>
  api.get(`/api/umbrales/predio/${predioId}`);
export const getUmbralById = (id) => api.get(`/api/umbrales/${id}`);
export const createUmbral = (predioId, data) =>
  api.post(`/api/umbrales/predio/${predioId}`, data);
export const updateUmbral = (predioId, data) =>
  api.put(`/api/umbrales/predio/${predioId}`, data);
export const deleteUmbral = (predioId) =>
  api.del(`/api/umbrales/predio/${predioId}`);
