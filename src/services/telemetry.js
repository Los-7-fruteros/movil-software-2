// src/services/telemetry.js
import { api } from '../config/api';

// POST /api/telemetry
// body: { deveui, humedad, temperatura, ph, voltaje, humedad_aire, humedad_suelo }
export const sendTelemetry = (data) => api.post('/api/telemetry', data);

// GET /api/telemetry/latest -> última lectura de lecturas_cultivo (o null)
export const getLatestTelemetry = () => api.get('/api/telemetry/latest');

// GET /api/telemetry?limit=&offset=
export const listTelemetry = (params = {}) => api.get('/api/telemetry', params);
