# 🌱 AgroMonitor – Monitoreo Agrícola en Tiempo Real

Aplicación móvil nativa para iOS y Android (Expo + React Native) que consume el backend FastAPI desplegado en EC2.

**Backend único compartido con la web**:
`http://ec2-100-24-12-31.compute-1.amazonaws.com:8000` ([Swagger](http://ec2-100-24-12-31.compute-1.amazonaws.com:8000/docs))

---

## 📁 Estructura

```
reservoir-monitor/
├── App.js
├── app.json
├── package.json
├── .env.example
└── src/
    ├── config/
    │   └── api.js                # Cliente HTTP (fetch + JWT)
    ├── services/                 # Wrappers por endpoint
    │   ├── auth.js               # /api/auth/*  /api/usuarios/me
    │   ├── predios.js            # /api/predios
    │   ├── alertas.js            # /api/alertas
    │   ├── sensores.js           # /api/sensores
    │   ├── umbrales.js           # /api/umbrales
    │   └── telemetry.js          # /api/telemetry
    ├── context/AuthContext.js    # Login/registro con JWT en AsyncStorage
    ├── hooks/useRealtime.js      # Polling de predios y alertas
    ├── screens/                  # LoginScreen, DashboardScreen
    ├── components/               # TelemetryCard, CropCard, AlertCard
    └── constants/                # colors, layout
```

---

## 🚀 Instalación

```bash
cd reservoir-monitor
npm install
cp .env.example .env       # Edita EXPO_PUBLIC_API_URL si cambia el backend
npx expo start
```

Escanea el QR con **Expo Go**.

### Verificar conectividad con el backend

```bash
npm run debug
```

---

## 🔌 Endpoints consumidos

| Método | Ruta | Servicio |
|---|---|---|
| POST | `/api/auth/login` | `services/auth.js` |
| POST | `/api/auth/registro` | `services/auth.js` |
| GET | `/api/usuarios/me` | `services/auth.js` |
| GET | `/api/predios` | `services/predios.js` |
| GET | `/api/predios/usuario/{usuario_id}` | `services/predios.js` |
| CRUD | `/api/predios/{id}` | `services/predios.js` |
| GET | `/api/alertas` | `services/alertas.js` |
| GET | `/api/alertas/predio/{predio_id}` | `services/alertas.js` |
| CRUD | `/api/alertas/{id}` | `services/alertas.js` |
| CRUD | `/api/sensores` | `services/sensores.js` |
| CRUD | `/api/umbrales/predio/{predio_id}` | `services/umbrales.js` |
| POST | `/api/telemetry` | `services/telemetry.js` |

El JWT obtenido en login se persiste en `AsyncStorage` y se añade automáticamente como `Authorization: Bearer <token>` a todas las llamadas autenticadas.

---

## 🧰 Stack

- **Framework:** React Native + Expo SDK 54
- **Navegación:** React Navigation
- **Estado global:** React Context
- **HTTP:** `fetch` nativo (sin axios)
- **Backend:** FastAPI en EC2 (compartido con el frontend web)
- **Auth:** JWT (`/api/auth/login`)
- **Datos en vivo:** polling cada 15 s a `/api/predios` y `/api/alertas`

---

## ⚙️ Variables de entorno

```
EXPO_PUBLIC_API_URL=http://ec2-100-24-12-31.compute-1.amazonaws.com:8000
```

Si no se define, el cliente cae al default hardcodeado en [src/config/api.js](src/config/api.js).
