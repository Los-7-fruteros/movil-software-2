// src/context/AuthContext.js
// Contexto global de autenticación contra la API FastAPI en EC2.
// Endpoints: /api/auth/login, /api/auth/registro, /api/usuarios/me

import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, registro as apiRegistro, logout as apiLogout, getMe } from '../services/auth';
import { tokenStorage } from '../config/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrate = async () => {
    try {
      const saved = await tokenStorage.get();
      if (saved) {
        setToken(saved);
        try {
          const me = await getMe();
          setUser(me);
        } catch (e) {
          await tokenStorage.clear();
          setToken(null);
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrate();
  }, []);

  const signIn = async (email, password) => {
    const data = await apiLogin(email, password);
    setToken(data.access_token);
    if (data.usuario) {
      setUser(data.usuario);
    } else {
      try {
        const me = await getMe();
        setUser(me);
      } catch {}
    }
    return data;
  };

  const signUp = async (email, password, nombre = 'Usuario', rol = 'agronomo') => {
    await apiRegistro({ email, contrasena: password, nombre, rol });
    return await signIn(email, password);
  };

  const signOut = async () => {
    await apiLogout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session: token ? { access_token: token } : null,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
