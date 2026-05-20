// src/context/AuthContext.js
// Contexto global de autenticación con backend EC2

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://ec2-100-24-12-31.compute-1.amazonaws.com:8000';
const TOKEN_KEY = '@auth_token';
const USER_KEY  = '@auth_user';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaurar sesión guardada al iniciar
    (async () => {
      try {
        const [token, userJson] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (token && userJson) {
          setSession(token);
          setUser(JSON.parse(userJson));
        }
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const signIn = async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, contrasena: password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Credenciales inválidas');
    await AsyncStorage.setItem(TOKEN_KEY, data.access_token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
    setSession(data.access_token);
    setUser(data.usuario);
    return data;
  };

  const signUp = async (email, password, nombre = 'Usuario') => {
    const res = await fetch(`${API_BASE}/api/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, contrasena: password, nombre, rol: 'usuario' }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Error al registrarse');
    return data;
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
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
