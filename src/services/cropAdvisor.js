// src/services/cropAdvisor.js
// Motor de diagnóstico tipo "IA" para los cultivos.
// Toma una lectura de telemetría + tipo de cultivo y devuelve diagnósticos
// claros con: problema detectado, severidad y acciones recomendadas.
//
// Es un motor de reglas (heurístico) — no requiere conexión a un modelo
// externo, así funciona también offline. Las reglas se pueden afinar
// rápidamente sin tocar la UI.

const normalize = (s = '') =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Rangos óptimos por cultivo. Los valores son aproximados y pensados para
// dar recomendaciones útiles al agricultor.
//   humedadSuelo (%): humedad volumétrica del suelo
//   humedadAire  (%): humedad relativa del ambiente
//   temperatura  (°C)
//   ph           : pH del suelo
const CROP_PROFILES = {
  default: {
    label: 'Cultivo',
    humedadSuelo: { min: 40, max: 70, criticalLow: 25 },
    humedadAire:  { min: 50, max: 85, criticalLow: 30 },
    temperatura:  { min: 15, max: 30, criticalLow: 5,  criticalHigh: 38 },
    ph:           { min: 6.0, max: 7.0, criticalLow: 5.0, criticalHigh: 8.0 },
  },
  tomate: {
    label: 'Tomate',
    humedadSuelo: { min: 50, max: 75, criticalLow: 30 },
    humedadAire:  { min: 60, max: 80, criticalLow: 40 },
    temperatura:  { min: 18, max: 28, criticalLow: 10, criticalHigh: 35 },
    ph:           { min: 6.0, max: 6.8, criticalLow: 5.2, criticalHigh: 7.5 },
  },
  arandano: {
    label: 'Arándano',
    humedadSuelo: { min: 50, max: 70, criticalLow: 30 },
    humedadAire:  { min: 60, max: 85, criticalLow: 40 },
    temperatura:  { min: 12, max: 25, criticalLow: 2,  criticalHigh: 32 },
    ph:           { min: 4.5, max: 5.5, criticalLow: 4.0, criticalHigh: 6.5 },
  },
  fresa: {
    label: 'Fresa',
    humedadSuelo: { min: 55, max: 75, criticalLow: 35 },
    humedadAire:  { min: 60, max: 80, criticalLow: 40 },
    temperatura:  { min: 14, max: 26, criticalLow: 5,  criticalHigh: 32 },
    ph:           { min: 5.5, max: 6.5, criticalLow: 5.0, criticalHigh: 7.0 },
  },
  maiz: {
    label: 'Maíz',
    humedadSuelo: { min: 45, max: 70, criticalLow: 25 },
    humedadAire:  { min: 50, max: 80, criticalLow: 30 },
    temperatura:  { min: 18, max: 32, criticalLow: 10, criticalHigh: 38 },
    ph:           { min: 5.8, max: 7.0, criticalLow: 5.0, criticalHigh: 7.8 },
  },
  limon: {
    label: 'Limón',
    humedadSuelo: { min: 40, max: 65, criticalLow: 25 },
    humedadAire:  { min: 50, max: 80, criticalLow: 35 },
    temperatura:  { min: 15, max: 30, criticalLow: 5,  criticalHigh: 38 },
    ph:           { min: 5.5, max: 6.5, criticalLow: 5.0, criticalHigh: 7.5 },
  },
};

const findProfile = (tipo = '') => {
  const t = normalize(tipo);
  for (const key of Object.keys(CROP_PROFILES)) {
    if (key !== 'default' && t.includes(key)) return CROP_PROFILES[key];
  }
  return CROP_PROFILES.default;
};

// severity: 'critica' | 'advertencia' | 'info' | 'ok'
const SEVERITY_RANK = { critica: 3, advertencia: 2, info: 1, ok: 0 };

const buildDiagnosis = ({ severity, icon, title, problem, action, metric, value, unit }) => ({
  severity,
  icon,
  title,
  problem,
  action,
  metric,
  value,
  unit,
});

// ── Reglas por métrica ──────────────────────────────────────────────
const checkHumedadSuelo = (val, range) => {
  if (val == null) return null;
  if (val <= range.criticalLow) {
    return buildDiagnosis({
      severity: 'critica',
      icon: 'water-off',
      title: 'Le falta agua al cultivo',
      problem: `La humedad del suelo está muy baja (${val}%). El cultivo está en estrés hídrico severo y puede sufrir daño irreversible.`,
      action: 'Riega ahora mismo de forma profunda y revisa el sistema de goteo. Vuelve a medir en 1 hora.',
      metric: 'Humedad del suelo', value: val, unit: '%',
    });
  }
  if (val < range.min) {
    return buildDiagnosis({
      severity: 'advertencia',
      icon: 'water-alert',
      title: 'Suelo más seco de lo recomendado',
      problem: `La humedad del suelo (${val}%) está por debajo del rango óptimo (${range.min}–${range.max}%).`,
      action: 'Programa un riego ligero en las próximas horas y revisa la frecuencia del goteo.',
      metric: 'Humedad del suelo', value: val, unit: '%',
    });
  }
  if (val > range.max) {
    return buildDiagnosis({
      severity: 'advertencia',
      icon: 'water',
      title: 'Posible exceso de agua',
      problem: `La humedad del suelo (${val}%) supera el rango óptimo (${range.min}–${range.max}%). Riesgo de pudrición de raíz y enfermedades fúngicas.`,
      action: 'Suspende el riego, verifica el drenaje y airea el sustrato antes del próximo ciclo.',
      metric: 'Humedad del suelo', value: val, unit: '%',
    });
  }
  return null;
};

const checkHumedadAire = (val, range) => {
  if (val == null) return null;
  if (val <= range.criticalLow) {
    return buildDiagnosis({
      severity: 'critica',
      icon: 'weather-sunny-alert',
      title: 'Aire muy seco',
      problem: `La humedad del aire es críticamente baja (${val}%). La planta transpira más de lo que puede absorber.`,
      action: 'Activa nebulización o riego foliar y considera mallas de sombra para reducir la evaporación.',
      metric: 'Humedad del aire', value: val, unit: '%',
    });
  }
  if (val < range.min) {
    return buildDiagnosis({
      severity: 'advertencia',
      icon: 'weather-windy',
      title: 'Humedad ambiental baja',
      problem: `La humedad del aire (${val}%) está por debajo de lo ideal (${range.min}–${range.max}%).`,
      action: 'Refuerza el riego en las horas más calurosas y evalúa nebulización para mantener la humedad.',
      metric: 'Humedad del aire', value: val, unit: '%',
    });
  }
  if (val > range.max) {
    return buildDiagnosis({
      severity: 'advertencia',
      icon: 'weather-fog',
      title: 'Humedad ambiental muy alta',
      problem: `La humedad del aire (${val}%) supera el rango ideal (${range.min}–${range.max}%). Riesgo de hongos y mildiu.`,
      action: 'Mejora la ventilación, evita riegos en horas frías y revisa hojas en busca de manchas.',
      metric: 'Humedad del aire', value: val, unit: '%',
    });
  }
  return null;
};

const checkTemperatura = (val, range) => {
  if (val == null) return null;
  if (val <= range.criticalLow) {
    return buildDiagnosis({
      severity: 'critica',
      icon: 'snowflake-alert',
      title: 'Riesgo de helada',
      problem: `La temperatura es muy baja (${val}°C). Puede haber daño por frío en hojas y flores.`,
      action: 'Activa cubiertas térmicas o riego anti-helada antes del amanecer y revisa daño en brotes.',
      metric: 'Temperatura', value: val, unit: '°C',
    });
  }
  if (val >= range.criticalHigh) {
    return buildDiagnosis({
      severity: 'critica',
      icon: 'thermometer-alert',
      title: 'Calor extremo',
      problem: `La temperatura es muy alta (${val}°C). El cultivo está en estrés térmico severo.`,
      action: 'Coloca malla de sombra, riega temprano en la mañana y aumenta nebulización si es posible.',
      metric: 'Temperatura', value: val, unit: '°C',
    });
  }
  if (val < range.min) {
    return buildDiagnosis({
      severity: 'advertencia',
      icon: 'thermometer-low',
      title: 'Temperatura por debajo del óptimo',
      problem: `La temperatura (${val}°C) está bajo el rango ideal (${range.min}–${range.max}°C). El crecimiento puede frenarse.`,
      action: 'Si baja más, prepara cobertura térmica nocturna; reduce riegos de noche.',
      metric: 'Temperatura', value: val, unit: '°C',
    });
  }
  if (val > range.max) {
    return buildDiagnosis({
      severity: 'advertencia',
      icon: 'thermometer-high',
      title: 'Temperatura por encima del óptimo',
      problem: `La temperatura (${val}°C) supera el rango ideal (${range.min}–${range.max}°C).`,
      action: 'Riega en las primeras horas del día y considera sombra parcial en las horas pico.',
      metric: 'Temperatura', value: val, unit: '°C',
    });
  }
  return null;
};

const checkPh = (val, range) => {
  if (val == null) return null;
  if (val <= range.criticalLow) {
    return buildDiagnosis({
      severity: 'critica',
      icon: 'flask-empty-remove',
      title: 'pH muy ácido',
      problem: `El pH del suelo (${val}) está muy bajo. Hay bloqueo de nutrientes (P, Ca, Mg) y toxicidad por aluminio.`,
      action: 'Aplica encalado (cal agrícola o dolomita) según análisis y vuelve a medir en 7 días.',
      metric: 'pH del suelo', value: val, unit: '',
    });
  }
  if (val >= range.criticalHigh) {
    return buildDiagnosis({
      severity: 'critica',
      icon: 'flask-empty-plus',
      title: 'pH muy alcalino',
      problem: `El pH del suelo (${val}) está muy alto. Bloqueo de hierro, manganeso y fósforo — riesgo de clorosis.`,
      action: 'Aplica azufre elemental o sulfato de amonio y revisa la calidad del agua de riego.',
      metric: 'pH del suelo', value: val, unit: '',
    });
  }
  if (val < range.min) {
    return buildDiagnosis({
      severity: 'advertencia',
      icon: 'flask-minus',
      title: 'pH bajo',
      problem: `El pH (${val}) está bajo el rango óptimo (${range.min}–${range.max}). Disponibilidad de nutrientes reducida.`,
      action: 'Aplica una corrección ligera con cal agrícola y monitorea cada semana.',
      metric: 'pH del suelo', value: val, unit: '',
    });
  }
  if (val > range.max) {
    return buildDiagnosis({
      severity: 'advertencia',
      icon: 'flask-plus',
      title: 'pH alto',
      problem: `El pH (${val}) supera el rango óptimo (${range.min}–${range.max}). Puede aparecer clorosis férrica.`,
      action: 'Acidifica el suelo con azufre o materia orgánica ácida (turba, compost de pino).',
      metric: 'pH del suelo', value: val, unit: '',
    });
  }
  return null;
};

// Combinaciones que dan pistas adicionales
const checkCombined = (t, profile) => {
  const out = [];
  if (
    t.humedadSuelo != null && t.humedadAire != null && t.temperatura != null &&
    t.humedadSuelo < profile.humedadSuelo.min &&
    t.humedadAire < profile.humedadAire.min &&
    t.temperatura > profile.temperatura.max
  ) {
    out.push(buildDiagnosis({
      severity: 'critica',
      icon: 'fire-alert',
      title: 'Estrés hídrico generalizado',
      problem: 'Suelo seco + aire seco + calor alto a la vez. El cultivo está perdiendo agua mucho más rápido de lo que puede reponer.',
      action: 'Riego inmediato + sombra + nebulización. Repite medición en 30–60 minutos.',
    }));
  }
  return out;
};

/**
 * Analiza una hectárea / cultivo y devuelve un objeto con:
 *   - cropLabel
 *   - overall: 'ok' | 'info' | 'advertencia' | 'critica'
 *   - diagnoses: array de diagnósticos ordenados por severidad
 */
export const analyzeCrop = ({ tipo, telemetry } = {}) => {
  const profile = findProfile(tipo);
  const t = telemetry || {};

  const checks = [
    checkHumedadSuelo(t.humedadSuelo, profile.humedadSuelo),
    checkHumedadAire(t.humedadAire,   profile.humedadAire),
    checkTemperatura(t.temperatura,    profile.temperatura),
    checkPh(t.ph,                       profile.ph),
    ...checkCombined(t, profile),
  ].filter(Boolean);

  const hasAnyReading =
    t.humedadSuelo != null ||
    t.humedadAire  != null ||
    t.temperatura  != null ||
    t.ph           != null;

  if (!hasAnyReading) {
    return {
      cropLabel: profile.label,
      overall: 'info',
      diagnoses: [buildDiagnosis({
        severity: 'info',
        icon: 'wifi-off',
        title: 'Sin lecturas recientes',
        problem: 'Aún no llegan datos del sensor para analizar el cultivo.',
        action: 'Verifica que el dispositivo esté encendido y con cobertura.',
      })],
    };
  }

  if (checks.length === 0) {
    return {
      cropLabel: profile.label,
      overall: 'ok',
      diagnoses: [buildDiagnosis({
        severity: 'ok',
        icon: 'check-decagram',
        title: 'Cultivo en condiciones óptimas',
        problem: 'Todas las variables monitoreadas están dentro del rango ideal para este cultivo.',
        action: 'Mantén el plan de riego y monitoreo actuales.',
      })],
    };
  }

  checks.sort(
    (a, b) => (SEVERITY_RANK[b.severity] || 0) - (SEVERITY_RANK[a.severity] || 0),
  );

  const overall = checks[0].severity;
  return { cropLabel: profile.label, overall, diagnoses: checks };
};
