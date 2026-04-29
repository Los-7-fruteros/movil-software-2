// src/hooks/useRealtime.js
// Datos en tiempo real desde Supabase
// Tabla principal: lecturas_cultivo (humedad_aire, humedad_suelo, tipo_lectura)

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../config/supabase';

// false → Supabase real (Arduino → Supabase → App)
// true  → modo demo local sin hardware
const USE_MOCK_DATA = false;

export const useRealtime = () => {
  // Datos actualmente MOSTRADOS en pantalla
  const [telemetry, setTelemetry] = useState({
    humedadAire:  null,
    humedadSuelo: null,
    temperatura:  null,
    tipoLectura:  null,
    ultimaLectura: null,
  });

  // Datos NUEVOS recibidos por Realtime (pendientes de mostrar)
  const [pendingTelemetry, setPendingTelemetry] = useState(null);
  const hasPendingData = pendingTelemetry !== null;

  // Predios/cultivos — forma: { [predio_id]: { name, tipo, humedadAire, humedadSuelo, tipoLectura } }
  const [cropData, setCropData] = useState({});

  // Alertas desde tabla `alertas`
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // El usuario pulsa "Cargar nuevos valores"
  const applyPendingData = useCallback(() => {
    if (pendingTelemetry) {
      setTelemetry(pendingTelemetry);
      setPendingTelemetry(null);
    }
  }, [pendingTelemetry]);

  // Función de refresco manual — re-fetches últimos valores de Supabase
  const refresh = useCallback(async () => {
    try {
      const { data: rows } = await supabase
        .from('lecturas_cultivo')
        .select('humedad_aire, humedad_suelo, temperatura, created_at')
        .order('created_at', { ascending: false })
        .limit(1);
      const lec = rows?.[0];
      if (lec) {
        setTelemetry({
          humedadAire:   lec.humedad_aire  ?? null,
          humedadSuelo:  lec.humedad_suelo ?? null,
          temperatura:   lec.temperatura   ?? null,
          ultimaLectura: lec.created_at    ?? null,
        });
        setPendingTelemetry(null);
      }
    } catch (e) {
      console.error('[refresh]', e);
    }
  }, []);

  // ─── Carga inicial ────────────────────────────────────────────
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Última lectura global — sin .single() para evitar error si tabla vacía
      const { data: rows, error: lecErr } = await supabase
        .from('lecturas_cultivo')
        .select('humedad_aire, humedad_suelo, temperatura, created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      if (lecErr) console.warn('[useRealtime] lecturas_cultivo error:', JSON.stringify(lecErr));

      const lec = rows?.[0];
      if (lec) {
        setTelemetry({
          humedadAire:  lec.humedad_aire  ?? null,
          humedadSuelo: lec.humedad_suelo ?? null,
          temperatura:  lec.temperatura   ?? null,
          ultimaLectura: lec.created_at   ?? null,
        });
      }

      // 2. Predios (cultivos)
      const { data: predios, error: predioErr } = await supabase
        .from('predio')
        .select('id, nombre, tipo_cultivo, ubicacion')
        .order('created_at', { ascending: true });

      if (!predioErr && predios && predios.length > 0) {
        const updates = {};

        for (const predio of predios) {
          // Sensores de este predio
          const { data: sensores } = await supabase
            .from('sensores')
            .select('id')
            .eq('predio_id', predio.id);

          let aire = null, suelo = null, temp = null, tipo = null;

          if (sensores && sensores.length > 0) {
            const ids = sensores.map(s => s.id);
            const { data: latLec } = await supabase
              .from('lecturas_cultivo')
              .select('humedad_aire, humedad_suelo, temperatura')
              .in('sensor_id', ids)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (latLec) {
              aire  = latLec.humedad_aire  ?? null;
              suelo = latLec.humedad_suelo ?? null;
              temp  = latLec.temperatura   ?? null;
            }
          }

          updates[predio.id] = {
            name: predio.nombre || 'Sin nombre',
            tipo: predio.tipo_cultivo || '',
            ubicacion: predio.ubicacion || '',
            humedadAire:  aire,
            humedadSuelo: suelo,
            temperatura:  temp,
          };
        }

        setCropData(updates);
      }

      // 3. Últimas 10 alertas
      const { data: alertData, error: alertErr } = await supabase
        .from('alertas')
        .select('id, tipo, mensaje, valor, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!alertErr && alertData) {
        setAlerts(alertData);
      }
    } catch (err) {
      setError('Error de conexión con Supabase.');
      console.error('[useRealtime]', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Suscripciones Realtime ───────────────────────────────────
  const subscribeSupabase = () => {
    // Nuevas lecturas de lecturas_cultivo
    const lecChannel = supabase
      .channel('rt:lecturas_cultivo')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'lecturas_cultivo' },
        (payload) => {
          const n = payload.new;
          if (!n) return;

          setPendingTelemetry({
            humedadAire:  n.humedad_aire  ?? null,
            humedadSuelo: n.humedad_suelo ?? null,
            temperatura:  n.temperatura   ?? null,
            ultimaLectura: n.created_at   ?? new Date().toISOString(),
          });
        }
      )
      .subscribe();

    // Nuevas alertas
    const alertChannel = supabase
      .channel('rt:alertas')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alertas' },
        (payload) => {
          if (payload.new) {
            setAlerts(prev => [payload.new, ...prev].slice(0, 20));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(lecChannel);
      supabase.removeChannel(alertChannel);
    };
  };

  // Actualiza el predio en estado cuando llega una nueva lectura Realtime
  const refreshPredioForSensor = async (sensorId, metrics) => {
    const { data: sensor } = await supabase
      .from('sensores')
      .select('predio_id')
      .eq('id', sensorId)
      .single();

    if (sensor?.predio_id) {
      setCropData(prev => {
        if (!prev[sensor.predio_id]) return prev;
        return {
          ...prev,
          [sensor.predio_id]: {
            ...prev[sensor.predio_id],
            ...metrics,
          },
        };
      });
    }
  };

  // ─── Mock data (modo demo) ────────────────────────────────────
  const runMock = () => {
    setLoading(false);
    setTelemetry({ humedadAire: 68.5, humedadSuelo: 42.3, temperatura: 24.1, tipoLectura: 'automatico', ultimaLectura: new Date().toISOString() });
    setCropData({
      mock1: { name: 'Tomates',   tipo: 'Tomate',   humedadAire: 72.3, humedadSuelo: 38.1, temperatura: 26.5, tipoLectura: 'automatico' },
      mock2: { name: 'Arándanos', tipo: 'Arándano', humedadAire: 65.1, humedadSuelo: 55.4, temperatura: 22.3, tipoLectura: 'manual'     },
    });
    setAlerts([
      { id: 1, tipo: 'critica',     mensaje: 'Humedad del suelo crítica.',       created_at: new Date().toISOString() },
      { id: 2, tipo: 'advertencia', mensaje: 'Temperatura del aire elevada.',     created_at: new Date().toISOString() },
    ]);

    const iv = setInterval(() => {
      setPendingTelemetry({
        humedadAire:  Number((60 + Math.random() * 15).toFixed(1)),
        humedadSuelo: Number((35 + Math.random() * 20).toFixed(1)),
        temperatura:  Number((20 + Math.random() * 10).toFixed(1)),
        tipoLectura:     Math.random() > 0.5 ? 'automatico' : 'manual',
        ultimaLectura:   new Date().toISOString(),
      });
    }, 5000);

    return () => clearInterval(iv);
  };

  useEffect(() => {
    let cleanup;
    if (USE_MOCK_DATA) {
      cleanup = runMock();
    } else {
      fetchInitialData();
      cleanup = subscribeSupabase();
    }
    return cleanup;
  }, []);

  return { telemetry, cropData, alerts, loading, error, hasPendingData, applyPendingData, refresh };
};
