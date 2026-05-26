// src/config/api.js
// Cliente HTTP para la API FastAPI desplegada en EC2.
// Endpoints documentados en: http://ec2-100-24-12-31.compute-1.amazonaws.com:8000/docs

import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'http://ec2-100-24-12-31.compute-1.amazonaws.com:8000';

const TOKEN_KEY = '@agromonitor:token';

export const tokenStorage = {
  get: () => AsyncStorage.getItem(TOKEN_KEY),
  set: (t) => AsyncStorage.setItem(TOKEN_KEY, t),
  clear: () => AsyncStorage.removeItem(TOKEN_KEY),
};

async function request(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const finalHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  };

  if (auth) {
    const token = await tokenStorage.get();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
  }

  const text = await response.text();
  const data = text ? safeJson(text) : null;

  if (!response.ok) {
    const detail =
      (data && (data.detail || data.message)) ||
      response.statusText ||
      'Error en la solicitud';
    const msg = typeof detail === 'string' ? detail : JSON.stringify(detail);
    const err = new Error(msg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};
