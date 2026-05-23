// src/components/AlertCard.js
// Tarjeta reutilizable para alertas del sistema (critical, warning, info)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { layout } from '../constants';
import { colors } from '../constants';

const ALERT_STYLES = {
  critical:     { bg: '#FEF2F2', border: '#EF4444', icon: 'alert-circle',  iconColor: '#EF4444', label: 'Crítico',      labelBg: '#FEE2E2', labelColor: '#B91C1C' },
  critica:      { bg: '#FEF2F2', border: '#EF4444', icon: 'alert-circle',  iconColor: '#EF4444', label: 'Crítico',      labelBg: '#FEE2E2', labelColor: '#B91C1C' },
  alta:         { bg: '#FEF2F2', border: '#EF4444', icon: 'alert-circle',  iconColor: '#EF4444', label: 'Alta',         labelBg: '#FEE2E2', labelColor: '#B91C1C' },
  warning:      { bg: '#FFFBEB', border: '#F59E0B', icon: 'alert',         iconColor: '#F59E0B', label: 'Advertencia',  labelBg: '#FEF3C7', labelColor: '#92400E' },
  advertencia:  { bg: '#FFFBEB', border: '#F59E0B', icon: 'alert',         iconColor: '#F59E0B', label: 'Advertencia',  labelBg: '#FEF3C7', labelColor: '#92400E' },
  media:        { bg: '#FFFBEB', border: '#F59E0B', icon: 'alert',         iconColor: '#F59E0B', label: 'Media',        labelBg: '#FEF3C7', labelColor: '#92400E' },
  info:         { bg: '#EEF5F0', border: '#52B788', icon: 'information',   iconColor: '#52B788', label: 'Información',  labelBg: '#D4EAD9', labelColor: '#1A3D2B' },
  informativa:  { bg: '#EEF5F0', border: '#52B788', icon: 'information',   iconColor: '#52B788', label: 'Información',  labelBg: '#D4EAD9', labelColor: '#1A3D2B' },
  baja:         { bg: '#EEF5F0', border: '#52B788', icon: 'information',   iconColor: '#52B788', label: 'Baja',         labelBg: '#D4EAD9', labelColor: '#1A3D2B' },
};

const formatTime = (timestamp) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const AlertCard = ({ type, message, timestamp }) => {
  // Normaliza el tipo (acepta español e inglés, mayúsculas/minúsculas)
  const key = (type || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const style = ALERT_STYLES[key] || ALERT_STYLES.info;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: style.bg, borderLeftColor: style.border },
      ]}
    >
      {/* Icono */}
      <View style={[styles.iconWrapper, { backgroundColor: style.border + '22' }]}>
        <MaterialCommunityIcons name={style.icon} size={22} color={style.iconColor} />
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: style.labelBg }]}>
            <Text style={[styles.badgeText, { color: style.labelColor }]}>
              {style.label}
            </Text>
          </View>
          <Text style={styles.time}>{formatTime(timestamp)}</Text>
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 10,
    alignItems: 'flex-start',
    ...layout.shadowLight,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  message: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 19,
    fontWeight: '500',
  },
});

export default AlertCard;



