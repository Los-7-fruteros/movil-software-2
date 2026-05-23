// src/screens/DashboardScreen.js
// Dashboard principal: Cultivo Principal | Hectáreas

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../hooks/useRealtime';
import TelemetryCard from '../components/TelemetryCard';
import CropCard from '../components/CropCard';
import AlertCard from '../components/AlertCard';
import { colors, gradients, layout } from '../constants';

const DashboardScreen = () => {
  const { signOut, user } = useAuth();
  const { telemetry, cropData, alerts, loading, error, hasPendingData, applyPendingData, refresh } = useRealtime();
  const [activeView, setActiveView] = useState('principal');
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    Alert.alert('Cerrar sesión', '¿Deseas cerrar tu sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOut();
          } catch (e) {
            Alert.alert('Error', 'No se pudo cerrar la sesión.');
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  // Predios como array
  const predios = Object.entries(cropData || {}).map(([id, data]) => ({
    id,
    ...data,
  }));

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* ── Header ─────────────────────────────────── */}
      <LinearGradient colors={gradients.header} style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <MaterialCommunityIcons name="sprout" size={22} color="#fff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Dashboard</Text>
                <Text style={styles.headerSubtitle}>Monitoreo en Tiempo Real</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="notifications-outline" size={22} color="#fff" />
                {alerts.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{alerts.length > 9 ? '9+' : alerts.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={handleSignOut} disabled={signingOut}>
                {signingOut
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Ionicons name="log-out-outline" size={22} color="#fff" />
                }
              </TouchableOpacity>
            </View>
          </View>

          {/* Toggle */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => setActiveView('principal')}
              activeOpacity={0.85}
            >
              {activeView === 'principal' ? (
                <LinearGradient colors={gradients.button} style={styles.toggleActive}>
                  <MaterialCommunityIcons name="chart-line" size={15} color="#fff" />
                  <Text style={styles.toggleActiveText}>Cultivo Principal</Text>
                </LinearGradient>
              ) : (
                <View style={styles.toggleInactive}>
                  <MaterialCommunityIcons name="chart-line" size={15} color={colors.textSecondary} />
                  <Text style={styles.toggleInactiveText}>Cultivo Principal</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => setActiveView('hectareas')}
              activeOpacity={0.85}
            >
              {activeView === 'hectareas' ? (
                <LinearGradient colors={gradients.button} style={styles.toggleActive}>
                  <MaterialCommunityIcons name="map-marker-multiple" size={15} color="#fff" />
                  <Text style={styles.toggleActiveText}>Hectáreas</Text>
                </LinearGradient>
              ) : (
                <View style={styles.toggleInactive}>
                  <MaterialCommunityIcons name="map-marker-multiple" size={15} color={colors.textSecondary} />
                  <Text style={styles.toggleInactiveText}>Hectáreas</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Contenido ──────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="wifi-off" size={40} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : activeView === 'principal' ? (
          <PrincipalView
            telemetry={telemetry}
            alerts={alerts}
            hasPendingData={hasPendingData}
            applyPendingData={applyPendingData}
            refresh={refresh}
          />
        ) : (
          <HectareasView
            telemetry={telemetry}
            alerts={alerts}
            hasPendingData={hasPendingData}
            applyPendingData={applyPendingData}
            refresh={refresh}
          />
        )}
      </ScrollView>
    </View>
  );
};

// ── Vista: Cultivo Principal ─────────────────────────
const PrincipalView = ({ telemetry, alerts, hasPendingData, applyPendingData, refresh }) => (
  <>
    {/* Telemetría */}
    <View style={styles.section}>
      {/* Botón SIEMPRE visible — verde con nuevos datos, gris sin ellos */}
      <TouchableOpacity
        style={[styles.newDataBtn, hasPendingData ? styles.newDataBtnActive : styles.newDataBtnIdle]}
        onPress={hasPendingData ? applyPendingData : refresh}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name={hasPendingData ? 'arrow-up-circle' : 'refresh'}
          size={16}
          color={hasPendingData ? '#fff' : colors.textSecondary}
        />
        <Text style={[styles.newDataBtnText, !hasPendingData && { color: colors.textSecondary }]}>
          {hasPendingData ? '⚡ Nuevos valores · Toca para actualizar' : 'Valores al día · Toca para refrescar'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>📊 Lecturas en Tiempo Real</Text>
      <TelemetryCard metric="temperatura"  value={telemetry.temperatura}  unit="°C" tipoLectura={telemetry.tipoLectura} ultimaLectura={telemetry.ultimaLectura} progressMax={50} />
      <TelemetryCard metric="humedadAire"  value={telemetry.humedadAire}  unit="%" tipoLectura={telemetry.tipoLectura} ultimaLectura={telemetry.ultimaLectura} />
      <TelemetryCard metric="humedadSuelo" value={telemetry.humedadSuelo} unit="%" tipoLectura={telemetry.tipoLectura} ultimaLectura={telemetry.ultimaLectura} />
    </View>

    {/* Alertas */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚠️ Alertas del Sistema</Text>
      {alerts.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="check-circle-outline" size={32} color={colors.success} />
          <Text style={styles.emptyText}>Sin alertas activas</Text>
        </View>
      ) : (
        alerts.map((a, i) => (
          <AlertCard
            key={a.id || i}
            type={a.tipo || a.type}
            message={a.mensaje || a.message}
            timestamp={a.created_at || a.timestamp}
          />
        ))
      )}
    </View>
  </>
);

// ── Vista: Hectáreas ─────────────────────────────────
const HectareasView = ({ telemetry, alerts, hasPendingData, applyPendingData, refresh }) => (
  <>
    {/* Telemetría */}
    <View style={styles.section}>
      <TouchableOpacity
        style={[styles.newDataBtn, hasPendingData ? styles.newDataBtnActive : styles.newDataBtnIdle]}
        onPress={hasPendingData ? applyPendingData : refresh}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name={hasPendingData ? 'arrow-up-circle' : 'refresh'}
          size={16}
          color={hasPendingData ? '#fff' : colors.textSecondary}
        />
        <Text style={[styles.newDataBtnText, !hasPendingData && { color: colors.textSecondary }]}>
          {hasPendingData ? '⚡ Nuevos valores · Toca para actualizar' : 'Valores al día · Toca para refrescar'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>📊 Hectaria 1 — Lecturas en Tiempo Real</Text>
      <TelemetryCard metric="temperatura"  value={telemetry.temperatura}  unit="°C" tipoLectura={telemetry.tipoLectura} ultimaLectura={telemetry.ultimaLectura} progressMax={50} />
      <TelemetryCard metric="humedadAire"  value={telemetry.humedadAire}  unit="%" tipoLectura={telemetry.tipoLectura} ultimaLectura={telemetry.ultimaLectura} />
      <TelemetryCard metric="humedadSuelo" value={telemetry.humedadSuelo} unit="%" tipoLectura={telemetry.tipoLectura} ultimaLectura={telemetry.ultimaLectura} />
    </View>

    {/* Alertas */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚠️ Alertas del Sistema</Text>
      {alerts.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="check-circle-outline" size={32} color={colors.success} />
          <Text style={styles.emptyText}>Sin alertas activas</Text>
        </View>
      ) : (
        alerts.map((a, i) => (
          <AlertCard
            key={a.id || i}
            type={a.tipo || a.type}
            message={a.mensaje || a.message}
            timestamp={a.created_at || a.timestamp}
          />
        ))
      )}
    </View>
  </>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  // Header
  header: { paddingBottom: 12 },
  headerInner: { paddingHorizontal: 20 },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: {
    width: 40, height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  badge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: colors.error,
    borderRadius: 8, minWidth: 16, height: 16,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  toggleBtn: { flex: 1 },
  toggleActive: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: 10, paddingVertical: 10,
  },
  toggleActiveText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  toggleInactive: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: 10, paddingVertical: 10,
    backgroundColor: '#fff',
  },
  toggleInactiveText: { color: colors.textSecondary, fontWeight: '600', fontSize: 13 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },

  // Botón nuevos valores
  newDataBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 12, marginBottom: 12,
    ...layout.shadowLight,
  },
  newDataBtnActive: { backgroundColor: colors.successDark },
  newDataBtnIdle:   { backgroundColor: colors.backgroundMuted, borderWidth: 1, borderColor: colors.border },
  newDataBtnText: { fontWeight: '700', fontSize: 13, color: '#fff' },

  // Secciones
  section: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: colors.textPrimary,
    marginBottom: 12, marginTop: 4,
  },

  // Loading / Error / Empty
  loadingBox: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  loadingText: { color: colors.textSecondary, fontSize: 14 },
  errorBox: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  errorText: { color: colors.error, fontSize: 14, textAlign: 'center' },
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  emptySubText: { fontSize: 12, color: colors.textMuted },
});

export default DashboardScreen;

