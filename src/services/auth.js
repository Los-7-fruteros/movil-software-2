// src/services/auth.js
import { api, tokenStorage } from '../config/api';

// POST /api/auth/login -> { access_token, token_type, usuario }
export async function login(email, contrasena) {
  const data = await api.post(
    '/api/auth/login',
    { email, contrasena },
    { auth: false }
  );
  if (data?.access_token) {
    await tokenStorage.set(data.access_token);
  }
  return data;
}

// POST /api/auth/registro -> UsuarioOutput
export async function registro({ email, contrasena, nombre, rol = 'usuario', num_telefono = null }) {
  return api.post(
    '/api/auth/registro',
    { email, contrasena, nombre, rol, num_telefono },
    { auth: false }
  );
}

// GET /api/usuarios/me
export async function getMe() {
  return api.get('/api/usuarios/me');
}

export async function logout() {
  await tokenStorage.clear();
}
