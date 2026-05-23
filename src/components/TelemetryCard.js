// src/components/TelemetryCard.js
// Tarjeta para humedad del aire y humedad del suelo

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, layout } from '../constants';

const ICON_MAP = {
  temperatura:  { name: 'thermometer' },
  humedadAire:  { name: 'weather-windy' },
  humedadSuelo: { name: 'water' },
};

const COLOR_MAP = {
  temperatura:  { bg: '#FFF7ED', bar: '#F97316', icon: '#F97316', text: '#C2410C' },
  humedadAire:  { bg: '#EEF5F0', bar: '#2D5A3D', icon: '#2D5A3D', text: '#1A3D2B' },
  humedadSuelo: { bg: '#F0FDF4', bar: '#16A34A', icon: '#16A34A', text: '#15803D' },
};

const TITLES = {
  temperatura:  'Temperatura',
  humedadAire:  'Humedad del Aire',
  humedadSuelo: 'Humedad del Suelo',
};

const TelemetryCard = ({ metric, value, unit, tipoLectura, ultimaLectura, progressMax = 100 }) => {
  const icon    = ICON_MAP[metric]  || { name: 'chart-bar' };
  const palette = COLOR_MAP[metric] || { bg: '#EEF5F0', bar: '#6B7280', icon: '#6B7280', text: '#374151' };
  const title   = TITLES[metric]    || metric;

  const hasData    = value !== null && value !== undefined;
  const progress   = hasData ? Math.min(Math.max((value / progressMax) * 100, 0), 100) : 0;
  const isManual   = tipoLectura === 'manual';
  const hasLectura = tipoLectura !== null && tipoLectura !== undefined;

  return (
    <View style={[styles.card, { backgroundColor: palette.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconWrapper, { backgroundColor: palette.bar + '22' }]}>
          <MaterialCommunityIcons name={icon.name} size={22} color={palette.icon} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {/* Badge manual/automático */}
          {hasLectura ? (
            <View style={[styles.badge, { backgroundColor: isManual ? '#FEF3C7' : '#DCFCE7' }]}>
              <MaterialCommunityIcons
                name={isManual ? 'hand-back-right-outline' : 'robot-outline'}
                size={11}
                color={isManual ? '#92400E' : '#166534'}
              />
              <Text style={[styles.badgeText, { color: isManual ? '#92400E' : '#166534' }]}>
                {isManual ? 'Manual' : 'Automático'}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={[styles.statusDot, { backgroundColor: hasData ? '#22C55E' : '#D1D5DB' }]} />
      </View>

      {/* Valor o sin conexión */}
      {hasData ? (
        <>
          <View style={styles.valueRow}>
            <Text style={[styles.value, { color: palette.text }]}>{value}</Text>
            <Text style={[styles.unit, { color: palette.icon }]}>{unit}</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: palette.bar }]} />
          </View>
          {ultimaLectura ? (
            <Text style={styles.lastSeen}>
              Última lectura: {new Date(ultimaLectura).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
            </Text>
          ) : null}
        </>
      ) : (
        <View style={styles.noDataBox}>
          <MaterialCommunityIcons name="wifi-off" size={20} color="#9CA3AF" />
          <Text style={styles.noDataText}>Próxima conexión</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: layout.borderRadiusCard,
    padding: layout.paddingCard,
    marginBottom: 12,
    ...layout.shadowLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 44, height: 44,
    borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  headerText: { flex: 1 },
  title: {
    fontSize: layout.fontSizeTitleCard,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    alignSelf: 'flex-start',
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
    marginTop: 3,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },
  statusDot: {
    width: 10, height: 10, borderRadius: 5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  value: { fontSize: 38, fontWeight: '800', lineHeight: 42 },
  unit:  { fontSize: 18, fontWeight: '600', marginBottom: 4, marginLeft: 4 },
  progressBg: {
    height: 8, backgroundColor: colors.border,
    borderRadius: 4, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  lastSeen: {
    fontSize: 10, color: colors.textMuted, marginTop: 6, textAlign: 'right',
  },
  noDataBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    backgroundColor: colors.backgroundMuted,
    borderRadius: 12,
    gap: 8,
  },
  noDataText: {
    fontSize: 14, fontWeight: '600', color: colors.textMuted,
  },
});

export default TelemetryCard;
