// src/components/CropCard.js
// Tarjeta de cultivo/predio con humedad del aire y humedad del suelo

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, layout } from '../constants';

const emojiForTipo = (tipo = '') => {
  const t = tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (t.includes('tomate'))     return '🍅';
  if (t.includes('arandano'))   return '🫐';
  if (t.includes('limon'))      return '🍋';
  if (t.includes('maiz'))       return '🌽';
  if (t.includes('fresa'))      return '🍓';
  if (t.includes('uva'))        return '🍇';
  if (t.includes('naranja'))    return '🍊';
  if (t.includes('manzana'))    return '🍎';
  if (t.includes('platano') || t.includes('banana')) return '🍌';
  return '🌱';
};

const bgForTipo = (tipo = '') => {
  const t = tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (t.includes('tomate'))   return '#FEE2E2';
  if (t.includes('arandano')) return '#E0E7FF';
  if (t.includes('limon'))    return '#FEF9C3';
  if (t.includes('maiz'))     return '#FEF3C7';
  if (t.includes('fresa'))    return '#FCE7F3';
  return '#F0FDF4';
};

const MetricRow = ({ icon, label, value, unit, bg, iconColor }) => {
  const hasData = value !== null && value !== undefined;
  return (
    <View style={[styles.metricRow, { backgroundColor: bg }]}>
      <View style={[styles.metricIcon, { backgroundColor: iconColor + '22' }]}>
        <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      {hasData ? (
        <Text style={[styles.metricValue, { color: iconColor }]}>
          {value}<Text style={styles.metricUnit}> {unit}</Text>
        </Text>
      ) : (
        <View style={styles.noDataInline}>
          <MaterialCommunityIcons name="wifi-off" size={13} color="#9CA3AF" />
          <Text style={styles.noDataInlineText}>Próxima conexión</Text>
        </View>
      )}
    </View>
  );
};

const CropCard = ({ name, tipo, ubicacion, humedadAire, humedadSuelo, temperatura, tipoLectura }) => {
  const emoji   = emojiForTipo(tipo || name);
  const bgColor = bgForTipo(tipo || name);
  const isManual   = tipoLectura === 'manual';
  const hasLectura = tipoLectura !== null && tipoLectura !== undefined;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={[styles.cropHeader, { backgroundColor: bgColor }]}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.cropInfo}>
          <Text style={styles.cropName}>{name}</Text>
          {tipo ? <Text style={styles.cropTipo}>{tipo}</Text> : null}
          {ubicacion ? <Text style={styles.cropUbicacion}>{ubicacion}</Text> : null}
        </View>
        {/* Badge manual/automático */}
        {hasLectura ? (
          <View style={[styles.badge, { backgroundColor: isManual ? '#FEF3C7' : '#DCFCE7' }]}>
            <MaterialCommunityIcons
              name={isManual ? 'hand-back-right-outline' : 'robot-outline'}
              size={12}
              color={isManual ? '#92400E' : '#166534'}
            />
            <Text style={[styles.badgeText, { color: isManual ? '#92400E' : '#166534' }]}>
              {isManual ? 'Manual' : 'Auto'}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Métricas */}
      <View style={styles.metricsContainer}>
        <MetricRow icon="thermometer"   label="Temperatura"          value={temperatura}  unit="°C" bg="#FFF7ED" iconColor="#F97316" />
        <MetricRow icon="weather-windy" label="Humedad del Aire"     value={humedadAire}  unit="%"  bg="#EFF6FF" iconColor="#3B82F6" />
        <MetricRow icon="water"         label="Humedad del Suelo"    value={humedadSuelo} unit="%"  bg="#F0FDF4" iconColor="#16A34A" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: layout.borderRadiusCard,
    marginBottom: layout.marginElement,
    overflow: 'hidden',
    ...layout.shadowLight,
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
  },
  emoji: { fontSize: 36, marginRight: 12 },
  cropInfo: { flex: 1 },
  cropName: {
    fontSize: layout.fontSizeTitleCard,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cropTipo: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  cropUbicacion: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3,
    marginLeft: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },
  metricsContainer: {
    padding: layout.paddingCard,
    gap: 10,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 14,
  },
  metricIcon: {
    width: 34, height: 34,
    borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  metricLabel: {
    flex: 1,
    fontSize: layout.fontSizeBody,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metricValue: { fontSize: 16, fontWeight: '700' },
  metricUnit:  { fontSize: 12, fontWeight: '500' },
  noDataInline: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  noDataInlineText: {
    fontSize: 12, fontWeight: '600', color: '#9CA3AF',
  },
});

export default CropCard;
