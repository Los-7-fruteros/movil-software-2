# 🌱 AgroMonitor – Monitoreo Agrícola en Tiempo Real

Aplicación móvil nativa para iOS y Android, desarrollada con **Expo + React Native + Supabase**.  
Permite visualizar telemetría agrícola en tiempo real: humedad, temperatura y pH del cultivo principal y de hectáreas individuales.

---

## 📁 Estructura del Proyecto

```
reservoir-monitor/
├── App.js                         # Punto de entrada
├── app.json                       # Configuración Expo
├── package.json
├── babel.config.js
├── .env.example                   # Variables de entorno de ejemplo
├── README.md
└── src/
    ├── config/
    │   └── supabase.js            # Cliente Supabase
    ├── screens/
    │   ├── LoginScreen.js         # Pantalla de login
    │   └── DashboardScreen.js     # Dashboard principal
    ├── components/
    │   ├── TelemetryCard.js       # Tarjeta de telemetría (humedad, temperatura, pH)
    │   ├── CropCard.js            # Tarjeta de cultivo por hectárea
    │   └── AlertCard.js           # Tarjeta de alerta del sistema
    ├── hooks/
    │   ├── useAuth.js             # Hook de autenticación
    │   └── useRealtime.js         # Hook de datos en tiempo real
    ├── context/
    │   └── AuthContext.js         # Contexto global de autenticación
    └── constants/
        ├── colors.js              # Paleta de colores
        ├── layout.js              # Constantes de diseño
        └── index.js               # Exportaciones centralizadas
```

---

## 🚀 Instalación y Configuración

### 1. Instalar dependencias

```bash
cd reservoir-monitor
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y completa con tus credenciales de Supabase:

```bash
cp .env.example .env
```

Edita `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_AQUI
```

> Obtén estas claves en tu proyecto Supabase → **Settings → API**.

### 3. Ejecutar la aplicación

```bash
npx expo start
```

Escanea el código QR con **Expo Go** en tu dispositivo iOS o Android.

---

## 🗄️ Configuración de Supabase

### Tablas SQL

Ejecuta el siguiente SQL en el **SQL Editor** de tu proyecto Supabase:

```sql
-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de telemetría principal
CREATE TABLE IF NOT EXISTS telemetry_data (
  id SERIAL PRIMARY KEY,
  humidity DECIMAL(5,2),
  temperature DECIMAL(5,2),
  ph DECIMAL(3,2),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Tabla de datos por cultivo
CREATE TABLE IF NOT EXISTS crop_data (
  id SERIAL PRIMARY KEY,
  crop_name TEXT NOT NULL,
  humidity DECIMAL(5,2),
  temperature DECIMAL(5,2),
  ph DECIMAL(3,2),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Tabla de alertas
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('critical', 'warning', 'info')),
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);
```

### Habilitar Realtime

En Supabase → **Database → Replication**, habilita las tablas:
- `telemetry_data`
- `crop_data`
- `alerts`

---

## 🔄 Datos Simulados vs. Datos Reales

La app incluye un modo de simulación local que actualiza los datos cada 3 segundos sin necesitar Supabase configurado.

**Para activar/desactivar la simulación:**

Abre `src/hooks/useRealtime.js` y modifica la variable:

```js
// true  → usa datos simulados locales (modo demo)
// false → usa Supabase Realtime
const USE_MOCK_DATA = true;
```

Cuando `USE_MOCK_DATA = false`, la app se suscribe automáticamente a los canales de Supabase Realtime y actualiza la UI al recibir cambios en las tablas `telemetry_data`, `crop_data` y `alerts`.

---

## 🔐 Autenticación

### Email / Contraseña
La autenticación principal usa Supabase Auth con email y contraseña.

### Proveedores OAuth (pendiente de configuración)
Los botones de **Google**, **Apple** y **Microsoft** están listos en la UI.  
Para activarlos, configura cada proveedor en Supabase → **Authentication → Providers**.

---

## 📱 Funcionalidades

| Funcionalidad | Estado |
|---|---|
| Login con email/password | ✅ Funcional |
| Botones OAuth (Google, Apple, Microsoft) | ⚙️ Listos, requieren config. Supabase |
| Dashboard con navegación toggle | ✅ Funcional |
| Telemetría en tiempo real (Humedad, Temperatura, pH) | ✅ Funcional |
| Vista de Hectáreas (Tomates, Arándanos, Limones) | ✅ Funcional |
| Alertas del sistema por prioridad | ✅ Funcional |
| Simulación de datos cada 3s | ✅ Funcional |
| Supabase Realtime | ✅ Preparado |
| Cerrar sesión | ✅ Funcional |
| Mantener sesión activa | ✅ Funcional |

---

## 🎨 Stack Tecnológico

- **Framework:** React Native + Expo SDK 51
- **Navegación:** React Navigation 6
- **Estado global:** React Context API
- **UI:** Componentes nativos personalizados + expo-linear-gradient
- **Iconos:** @expo/vector-icons
- **Backend:** Supabase (Auth + PostgreSQL + Realtime)
- **Autenticación:** Supabase Auth
- **Variables de entorno:** `.env` con prefijo `EXPO_PUBLIC_`

---

## 🏗️ Preparación para Kotlin Multiplatform

La arquitectura está organizada por capas (`hooks`, `context`, `config`) para facilitar la futura integración con **Kotlin Multiplatform**:
- La lógica de negocio puede migrar a módulos compartidos KMP.
- La capa de datos (Supabase) puede reemplazarse con repositorios KMP.
- Los componentes UI permanecen en React Native.

---

## ⚙️ Comandos útiles

```bash
# Iniciar en desarrollo
npx expo start

# Solo iOS
npx expo start --ios

# Solo Android
npx expo start --android

# Limpiar caché
npx expo start --clear
```

