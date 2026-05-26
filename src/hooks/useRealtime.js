// src/hooks/useRealtime.js
// Polling de datos contra la API FastAPI en EC2.
// Endpoints usados:
//   GET /api/telemetry/latest  -> última lectura de cultivo
//   GET /api/predios           -> predios para vista de hectáreas
//   GET /api/alertas           -> alertas activas
//
// Comportamiento del botón "refrescar":
//   - Mientras no llegue ningún dato nuevo respecto a lo mostrado, el botón
//     queda en estado idle (color apagado, texto "Valores al día").
//   - Cuando el backend devuelve una lectura con created_at posterior a la
//     última aplicada, se pone en pendingTelemetry y el botón se vuelve verde
//     ("Nuevos valores - Toca para actualizar"). Al pulsarlo se aplica.
//   - Si el usuario pulsa cuando está idle, se hace un refresh manual.

import { useCallback, useEffect, useRef, useState } from 'react';
import { listPredios } from '../services/predios';
import { listAlertas } from '../services/alertas';
import { getLatestTelemetry } from '../services/telemetry';

const POLL_INTERVAL_MS = 15000;

const EMPTY_TELEMETRY = {
  humedadAire: null,
  humedadSuelo: null,
  temperatura: null,
  tipoLectura: null,
  ultimaLectura: null,
};

const mapLectura = (row) => {
  if (!row) return null;
  return {
    humedadAire:   row.humedad_aire ?? null,
    humedadSuelo:  row.humedad_suelo ?? null,
    temperatura:   row.temperatura ?? null,
    tipoLectura:   'automatico',
    ultimaLectura: row.created_at ?? null,
  };
};

export const useRealtime = () => {
  const [telemetry, setTelemetry] = useState(EMPTY_TELEMETRY);
  const [pendingTelemetry, setPendingTelemetry] = useState(null);
  const [cropData, setCropData] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);
  const lastAppliedTsRef = useRef(null);

  const hasPendingData = pendingTelemetry !== null;

  const applyPendingData = useCallback(() => {
    setPendingTelemetry((pending) => {
      if (pending) {
        setTelemetry(pending);
        lastAppliedTsRef.current = pending.ultimaLectura;
      }
      return null;
    });
  }, []);

  const fetchAll = useCallback(async ({ silent = false, applyTelemetryImmediately = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [latest, predios, alertasResp] = await Promise.all([
        getLatestTelemetry().catch(() => null),
        listPredios({ limit: 50, offset: 0 }).catch(() => []),
        listAlertas({ limit: 10, offset: 0 }).catch(() => []),
      ]);

      if (!mountedRef.current) return;

      const mapped = mapLectura(latest);

      if (mapped) {
        const ts = mapped.ultimaLectura;
        if (applyTelemetryImmediately || lastAppliedTsRef.current === null) {
          setTelemetry(mapped);
          setPendingTelemetry(null);
          lastAppliedTsRef.current = ts;
        } else if (ts && ts !== lastAppliedTsRef.current) {
          setPendingTelemetry(mapped);
        }
      }

      // Predios -> cropData. Si no hay predios pero hay lectura, sintetizamos
      // una "Hectárea 1" para que el usuario vea siempre al menos un cultivo.
      const next = {};
      const prediosArr = predios || [];
      if (prediosArr.length > 0) {
        prediosArr.forEach((p, idx) => {
          next[p.id] = {
            name: p.nombre || `Hectárea ${idx + 1}`,
            tipo: p.tipo_cultivo || '',
            ubicacion: p.ubicacion || '',
            humedadAire:  mapped?.humedadAire  ?? null,
            humedadSuelo: mapped?.humedadSuelo ?? null,
            temperatura:  mapped?.temperatura  ?? null,
          };
        });
      } else if (mapped) {
        next['hectarea-1'] = {
          name: 'Hectárea 1',
          tipo: 'Cultivo Principal',
          ubicacion: '',
          humedadAire:  mapped.humedadAire,
          humedadSuelo: mapped.humedadSuelo,
          temperatura:  mapped.temperatura,
        };
      }
      setCropData(next);
      setAlerts(alertasResp || []);
    } catch (e) {
      if (mountedRef.current) {
        setError(e.message || 'Error de conexión con el servidor.');
      }
    } finally {
      if (mountedRef.current && !silent) setLoading(false);
    }
  }, []);

  const refresh = useCallback(
    () => fetchAll({ silent: true, applyTelemetryImmediately: true }),
    [fetchAll],
  );

  useEffect(() => {
    mountedRef.current = true;
    fetchAll();
    const id = setInterval(() => {
      fetchAll({ silent: true });
    }, POLL_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchAll]);

  return {
    telemetry,
    cropData,
    alerts,
    loading,
    error,
    hasPendingData,
    applyPendingData,
    refresh,
  };
};
