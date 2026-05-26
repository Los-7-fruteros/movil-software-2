# 🌱 AgroMonitor – Monitoreo Agrícola en Tiempo Real

Aplicación móvil nativa para iOS y Android (Expo + React Native) que consume el backend FastAPI desplegado en EC2.

**Backend único compartido con la web**:
`http://ec2-100-24-12-31.compute-1.amazonaws.com:8000` ([Swagger](http://ec2-100-24-12-31.compute-1.amazonaws.com:8000/docs))

---

## 📲 Descarga de la App

> El link único de instalación de EAS **solo funciona en Android**. Para iOS no se puede instalar un `.ipa` directamente sin Apple Developer Program, así que se ofrecen dos rutas separadas según el sistema operativo.

### 🤖 Android (APK directo)

1. Abre el siguiente link **desde tu teléfono Android**:

   **https://expo.dev/accounts/los-7-fruteros/projects/reservoir-monitor/builds**

   *(Reemplazar por la URL del último build APK una vez generado: `eas build -p android --profile preview`)*

2. Pulsa **Instalar APK** → habilita "Permitir instalación de fuentes desconocidas" si el sistema lo pide.
3. Abre AgroMonitor.

> Para generar un nuevo build firmado:
> ```bash
> npx eas build -p android --profile preview
> ```
> Al terminar, EAS muestra una URL de descarga directa del `.apk`. Esa es la URL que se comparte.

### 🍎 iOS

Sin cuenta Apple Developer ($99/año) **no es posible** distribuir un `.ipa` directo por link como en Android. Se usa **Expo Go**, que es la forma estándar y gratuita.

#### Opción A – Expo Go (recomendada, gratis)

1. Instala **Expo Go** desde el App Store:
   **https://apps.apple.com/app/expo-go/id982107779**
2. Publica el último update:
   ```bash
   npx eas update --branch preview --message "Build iOS"
   ```
3. Comparte el QR / link que muestra `eas update` (algo como `https://u.expo.dev/1fbe55a1-9166-49fb-b2fb-1943ebc087d2?channel-name=preview`).
4. En el iPhone, abre la **cámara**, escanea el QR y pulsa "Abrir en Expo Go".

#### Opción B – TestFlight (instalación nativa, requiere cuenta Apple Dev)

```bash
npx eas build -p ios --profile preview
npx eas submit -p ios --latest
```

Tras la aprobación de Apple (~15 min), invita testers desde [App Store Connect](https://appstoreconnect.apple.com) y comparte el link **public TestFlight**:

`https://testflight.apple.com/join/XXXXXXXX`

> Antes de usar esta opción, rellena `submit.production.ios` en [eas.json](eas.json) con tu `appleId`, `ascAppId` y `appleTeamId`.

---

## 🚀 Desarrollo local

```bash
cd reservoir-monitor
npm install
cp .env.example .env       # Edita EXPO_PUBLIC_API_URL si cambia el backend
npx expo start
```

Escanea el QR con **Expo Go** (funciona idéntico en iOS y Android).

### Verificar conectividad con el backend

```bash
npm run debug
```

---

## 📁 Estructura

```
reservoir-monitor/
├── App.js
├── app.json
├── eas.json                       # Perfiles de build EAS (android / ios)
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
    │   └── telemetry.js          # /api/telemetry (POST + GET latest/list)
    ├── context/AuthContext.js    # Login/registro con JWT en AsyncStorage
    ├── hooks/useRealtime.js      # Polling de telemetría, predios y alertas
    ├── screens/                  # LoginScreen, DashboardScreen
    ├── components/               # TelemetryCard, CropCard, AlertCard
    └── constants/                # colors, layout
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
| GET | `/api/telemetry/latest` | `services/telemetry.js` |
| GET | `/api/telemetry` | `services/telemetry.js` |
| POST | `/api/telemetry` | `services/telemetry.js` |
| GET | `/api/registro-sesion` (admin) | auditoría de sesiones |

El JWT obtenido en login se persiste en `AsyncStorage` y se añade automáticamente como `Authorization: Bearer <token>` a todas las llamadas autenticadas.

---

## 🧰 Stack

- **Framework:** React Native + Expo SDK 54
- **Navegación:** React Navigation
- **Estado global:** React Context
- **HTTP:** `fetch` nativo (sin axios)
- **Backend:** FastAPI en EC2 (compartido con el frontend web)
- **Auth:** JWT (`/api/auth/login`)
- **Datos en vivo:** polling cada 15 s a `/api/telemetry/latest`, `/api/predios` y `/api/alertas`
- **Build & distribución:** EAS Build (Android APK / iOS TestFlight) + Expo Go (universal)

---

## ⚙️ Variables de entorno

```
EXPO_PUBLIC_API_URL=http://ec2-100-24-12-31.compute-1.amazonaws.com:8000
```

Si no se define, el cliente cae al default hardcodeado en [src/config/api.js](src/config/api.js).
