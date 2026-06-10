// src/components/DiagnosisCard.js
// Tarjeta del Asistente IA: muestra el diagnóstico de un cultivo con
// problema detectado, métrica clave y acción recomendada.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, layout } from '../constants';

const SEVERITY_STYLES = {
  critica: {
    bg: '#FEF2F2', border: '#EF4444', accent: '#B91C1C',
    badgeBg: '#FEE2E2', badgeColor: '#B91C1C', label: 'Acción urgente',
  },
  advertencia: {
    bg: '#FFFBEB', border: '#F59E0B', accent: '#92400E',
    badgeBg: '#FEF3C7', badgeColor: '#92400E', label: 'Atención',
  },
  info: {
    bg: '#EFF6FF', border: '#3B82F6', accent: '#1D4ED8',
    badgeBg: '#DBEAFE', badgeColor: '#1D4ED8', label: 'Información',
  },
  ok: {
    bg: '#ECFDF5', border: '#10B981', accent: '#065F46',
    badgeBg: '#D1FAE5', badgeColor: '#065F46', label: 'Todo bien',
  },
};

const DiagnosisCard = ({ diagnosis }) => {
  if (!diagnosis) return null;
  const style = SEVERITY_STYLES[diagnosis.severity] || SEVERITY_STYLES.info;

  return (
    <View style={[styles.card, { backgroundColor: style.bg, borderLeftColor: style.border }]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrapper, { backgroundColor: style.border + '22' }]}>
          <MaterialCommunityIcons
            name={diagnosis.icon || 'robot-outline'}
            size={22}
            color={style.border}
          />
        </View>
        <View style={styles.titleBlock}>
          <View style={[styles.badge, { backgroundColor: style.badgeBg }]}>
            <Text style={[styles.badgeText, { color: style.badgeColor }]}>
              {style.label}
            </Text>
          </View>
          <Text style={[styles.title, { color: style.accent }]}>{diagnosis.title}</Text>
        </View>
      </View>

      <Text style={styles.problem}>{diagnosis.problem}</Text>

      {diagnosis.metric ? (
        <View style={styles.metricChip}>
          <MaterialCommunityIcons name="gauge" size={14} color={style.accent} />
          <Text style={[styles.metricText, { color: style.accent }]}>
            {diagnosis.metric}: {diagnosis.value}{diagnosis.unit ? ` ${diagnosis.unit}` : ''}
          </Text>
        </View>
      ) : null}

      {diagnosis.action ? (
        <View style={styles.actionBox}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color={colors.primary} />
          <Text style={styles.actionText}>{diagnosis.action}</Text>
        </View>
      ) : null}
    </View>
  );
};

const CropDiagnosisGroup = ({ cropLabel, cropName, diagnoses, overall }) => {
  const style = SEVERITY_STYLES[overall] || SEVERITY_STYLES.info;
  return (
    <View style={styles.group}>
      <View style={styles.groupHeader}>
        <MaterialCommunityIcons name="robot-happy-outline" size={18} color={colors.primary} />
        <Text style={styles.groupTitle}>
          {cropName || cropLabel}
          {cropLabel && cropName && cropLabel !== cropName ? ` · ${cropLabel}` : ''}
        </Text>
        <View style={[styles.overallBadge, { backgroundColor: style.badgeBg }]}>
          <Text style={[styles.overallBadgeText, { color: style.badgeColor }]}>
            {style.label}
          </Text>
        </View>
      </View>
      {diagnoses.map((d, i) => (
        <DiagnosisCard key={`${d.title}-${i}`} diagnosis={d} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  group: { marginBottom: 12 },
  groupHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 8, paddingHorizontal: 2,
  },
  groupTitle: {
    flex: 1, fontSize: 14, fontWeight: '700', color: colors.textPrimary,
  },
  overallBadge: {
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  overallBadgeText: {
    fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4,
  },

  card: {
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 10,
    ...layout.shadowLight,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 8,
  },
  iconWrapper: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  titleBlock: { flex: 1, gap: 4 },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  title: { fontSize: 15, fontWeight: '700' },
  problem: {
    fontSize: 13, color: colors.textPrimary, lineHeight: 19,
    marginBottom: 8,
  },
  metricChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    marginBottom: 8,
  },
  metricText: { fontSize: 12, fontWeight: '700' },
  actionBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 10, padding: 10,
  },
  actionText: {
    flex: 1, fontSize: 13, color: colors.textPrimary,
    lineHeight: 18, fontWeight: '600',
  },
});

export { CropDiagnosisGroup };
export default DiagnosisCard;
