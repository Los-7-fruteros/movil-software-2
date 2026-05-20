// src/screens/LoginScreen.js
// Pantalla de inicio de sesión con diseño profesional

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { colors, gradients, layout } from '../constants';

const LoginScreen = () => {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (val) => {
    if (!val) return 'El email es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Email no válido.';
    return '';
  };
  const validatePassword = (val) => {
    if (!val) return 'La contraseña es obligatoria.';
    if (val.length < 6) return 'Mínimo 6 caracteres.';
    return '';
  };

  const switchMode = (m) => {
    setMode(m);
    setErrors({});
    setEmail('');
    setNombre('');
    setPassword('');
    setConfirmPass('');
  };

  const handleSubmit = async () => {
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confirmErr = mode === 'register' && password !== confirmPass
      ? 'Las contraseñas no coinciden.' : '';
    const nombreErr = mode === 'register' && !nombre.trim() ? 'El nombre es obligatorio.' : '';

    if (emailErr || passErr || confirmErr || nombreErr) {
      setErrors({ email: emailErr, password: passErr, confirm: confirmErr, nombre: nombreErr });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, nombre.trim());
        Alert.alert(
          '✅ Cuenta creada',
          'Tu cuenta fue creada. Ahora puedes iniciar sesión.',
          [{ text: 'OK', onPress: () => switchMode('login') }]
        );
      }
    } catch (error) {
      Alert.alert(
        mode === 'login' ? 'Error al iniciar sesión' : 'Error al registrarse',
        error.message || 'Ocurrió un error. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <LinearGradient colors={gradients.login} style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ─── Logo ─────────────────────────────── */}
            <View style={styles.logoSection}>
              <LinearGradient colors={gradients.logo} style={styles.logoCircle}>
                <MaterialCommunityIcons name="sprout" size={40} color="#fff" />
              </LinearGradient>
              <Text style={styles.appTitle}>AgroMonitor</Text>
              <Text style={styles.appSubtitle}>Monitoreo Agrícola en Tiempo Real</Text>
            </View>

            {/* ─── Tarjeta de login ─────────────────── */}
            <View style={styles.card}>

              {/* Toggle login / registro */}
              <View style={styles.modeRow}>
                <TouchableOpacity
                  style={[styles.modeBtn, isLogin && styles.modeBtnActive]}
                  onPress={() => switchMode('login')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modeBtnText, isLogin && styles.modeBtnTextActive]}>
                    Iniciar Sesión
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeBtn, !isLogin && styles.modeBtnActive]}
                  onPress={() => switchMode('register')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modeBtnText, !isLogin && styles.modeBtnTextActive]}>
                    Registrarse
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.cardSubtitle}>
                {isLogin
                  ? 'Ingresa con tu cuenta para continuar'
                  : 'Crea tu cuenta para acceder al sistema'}
              </Text>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo electrónico</Text>
                <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
                  <Ionicons
                    name="mail-outline" size={20}
                    color={errors.email ? colors.error : colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="usuario@empresa.com"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={(v) => { setEmail(v); setErrors(p => ({ ...p, email: validateEmail(v) })); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              </View>

              {/* Nombre (solo registro) */}
              {!isLogin ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nombre completo</Text>
                  <View style={[styles.inputWrapper, errors.nombre ? styles.inputError : null]}>
                    <Ionicons
                      name="person-outline" size={20}
                      color={errors.nombre ? colors.error : colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Tu nombre"
                      placeholderTextColor={colors.textSecondary}
                      value={nombre}
                      onChangeText={(v) => { setNombre(v); setErrors(p => ({ ...p, nombre: '' })); }}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                  {errors.nombre ? <Text style={styles.errorText}>{errors.nombre}</Text> : null}
                </View>
              ) : null}

              {/* Contraseña */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña</Text>
                <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
                  <Ionicons
                    name="lock-closed-outline" size={20}
                    color={errors.password ? colors.error : colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={(v) => { setPassword(v); setErrors(p => ({ ...p, password: validatePassword(v) })); }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              </View>

              {/* Confirmar contraseña (solo registro) */}
              {!isLogin ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirmar contraseña</Text>
                  <View style={[styles.inputWrapper, errors.confirm ? styles.inputError : null]}>
                    <Ionicons
                      name="shield-checkmark-outline" size={20}
                      color={errors.confirm ? colors.error : colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor={colors.textSecondary}
                      value={confirmPass}
                      onChangeText={setConfirmPass}
                      secureTextEntry={!showConfirm}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
                      <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  {errors.confirm ? <Text style={styles.errorText}>{errors.confirm}</Text> : null}
                </View>
              ) : null}

              {/* Botón principal */}
              <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                <LinearGradient colors={gradients.button} style={styles.submitButton}>
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Pie */}
              <Text style={styles.footerNote}>
                {isLogin
                  ? '¿No tienes cuenta? '
                  : '¿Ya tienes cuenta? '}
                <Text
                  style={styles.footerLink}
                  onPress={() => switchMode(isLogin ? 'register' : 'login')}
                >
                  {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                </Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  keyboardView: { flex: 1 },
  scroll: {
    flexGrow: 1, justifyContent: 'center',
    paddingHorizontal: 24, paddingVertical: 32,
  },
  logoSection: { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12, ...layout.shadowMedium,
  },
  appTitle: { fontSize: 28, fontWeight: '800', color: colors.primary, letterSpacing: 0.5 },
  appSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },

  card: {
    backgroundColor: colors.card,
    borderRadius: layout.borderRadiusCard,
    padding: layout.paddingCard + 4,
    ...layout.shadowMedium,
  },

  // Toggle
  modeRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12, padding: 4, marginBottom: 20, gap: 4,
  },
  modeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  modeBtnActive: { backgroundColor: colors.card, ...layout.shadowLight },
  modeBtnText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  modeBtnTextActive: { color: colors.primary },

  cardSubtitle: { fontSize: 13, color: colors.textSecondary, marginBottom: 20 },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 14, backgroundColor: '#F9FAFB',
    paddingHorizontal: 14, height: 52,
  },
  inputError: { borderColor: colors.error, backgroundColor: '#FFF5F5' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary },
  eyeButton: { padding: 4 },
  errorText: { fontSize: 12, color: colors.error, marginTop: 4, marginLeft: 2 },

  submitButton: {
    height: 54, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 8, marginBottom: 16, ...layout.shadowMedium,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  footerNote: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  footerLink: { color: colors.primary, fontWeight: '700' },
});

export default LoginScreen;

