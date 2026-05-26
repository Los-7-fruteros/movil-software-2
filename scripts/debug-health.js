#!/usr/bin/env node
/* eslint-disable no-console */
// Diagnóstico de conectividad contra el backend FastAPI (EC2).
// Uso: node scripts/debug-health.js

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TIMEOUT_MS = 8000;

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
};
const ok = (m) => console.log(`${c.green}✔${c.reset} ${m}`);
const warn = (m) => console.log(`${c.yellow}⚠${c.reset} ${m}`);
const fail = (m) => console.log(`${c.red}✘${c.reset} ${m}`);
const info = (m) => console.log(`${c.cyan}ℹ${c.reset} ${m}`);
const head = (m) => console.log(`\n${c.bold}${c.magenta}── ${m} ──${c.reset}`);

const results = { pass: 0, warn: 0, fail: 0 };
const mark = (kind, msg) => { results[kind]++; ({ pass: ok, warn, fail })[kind](msg); };

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return {};
  const out = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

async function tfetch(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const t0 = Date.now();
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    return { res, ms: Date.now() - t0 };
  } finally {
    clearTimeout(t);
  }
}

function checkEnvironment() {
  head('1. Entorno local');
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  if (nodeMajor >= 18) mark('pass', `Node ${process.versions.node} (fetch nativo OK)`);
  else mark('fail', `Node ${process.versions.node} — se requiere Node 18+`);

  const nm = path.join(ROOT, 'node_modules');
  if (fs.existsSync(nm)) mark('pass', 'node_modules presente');
  else mark('fail', 'Falta node_modules — corre: npm install');

  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  info(`Proyecto: ${pkg.name} v${pkg.version}`);
}

function checkFiles() {
  head('2. Archivos clave');
  const files = [
    'App.js',
    'src/config/api.js',
    'src/services/auth.js',
    'src/services/predios.js',
    'src/services/alertas.js',
    'src/context/AuthContext.js',
    'src/hooks/useRealtime.js',
    'src/screens/LoginScreen.js',
    'src/screens/DashboardScreen.js',
  ];
  for (const f of files) {
    fs.existsSync(path.join(ROOT, f))
      ? mark('pass', f)
      : mark('fail', `Falta archivo: ${f}`);
  }
}

async function checkBackend(apiBase) {
  head('3. Backend FastAPI (EC2)');
  info(`Base: ${apiBase}`);

  try {
    const { res, ms } = await tfetch(`${apiBase}/`);
    if (res.ok) mark('pass', `Root responde HTTP ${res.status} en ${ms} ms`);
    else mark('warn', `Root responde HTTP ${res.status} en ${ms} ms`);
  } catch (e) {
    mark('fail', `No se pudo conectar al backend (${e.message})`);
    return;
  }

  // OpenAPI
  try {
    const { res, ms } = await tfetch(`${apiBase}/openapi.json`);
    if (res.ok) {
      const spec = await res.json();
      const paths = Object.keys(spec.paths || {});
      mark('pass', `OpenAPI OK (${paths.length} endpoints, ${ms} ms)`);
    } else {
      mark('warn', `OpenAPI HTTP ${res.status}`);
    }
  } catch (e) {
    mark('fail', `OpenAPI no accesible (${e.message})`);
  }

  // /api/auth/login con credenciales inválidas → 401
  try {
    const { res, ms } = await tfetch(`${apiBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'debug@healthcheck.invalid', contrasena: 'invalid' }),
    });
    if ([400, 401, 403, 422].includes(res.status)) {
      mark('pass', `/api/auth/login responde correctamente (HTTP ${res.status} en ${ms} ms)`);
    } else if (res.status >= 500) {
      mark('fail', `/api/auth/login devuelve error de servidor (HTTP ${res.status})`);
    } else {
      mark('warn', `/api/auth/login responde HTTP ${res.status} inesperado`);
    }
  } catch (e) {
    mark('fail', `/api/auth/login no accesible (${e.message})`);
  }

  // /api/predios y /api/alertas
  for (const ep of ['/api/predios?limit=1', '/api/alertas?limit=1']) {
    try {
      const { res, ms } = await tfetch(`${apiBase}${ep}`);
      if (res.ok) mark('pass', `GET ${ep} → ${res.status} (${ms} ms)`);
      else mark('warn', `GET ${ep} → ${res.status}`);
    } catch (e) {
      mark('fail', `GET ${ep} no accesible (${e.message})`);
    }
  }

  if (apiBase.startsWith('http://')) {
    mark('warn', 'Backend usa HTTP sin cifrar — recomendado migrar a HTTPS para producción');
  }
}

function summary() {
  head('Resumen');
  console.log(`${c.green}OK:${c.reset} ${results.pass}   ${c.yellow}WARN:${c.reset} ${results.warn}   ${c.red}FAIL:${c.reset} ${results.fail}`);
  if (results.fail > 0) {
    console.log(`\n${c.red}${c.bold}Hay fallos.${c.reset} Revisa los puntos con ✘ antes de probar la app.`);
    process.exitCode = 1;
  } else if (results.warn > 0) {
    console.log(`\n${c.yellow}${c.bold}Con advertencias.${c.reset} La app debería funcionar.`);
  } else {
    console.log(`\n${c.green}${c.bold}Todo en verde.${c.reset} Listo para: npx expo start`);
  }
}

(async () => {
  console.log(`${c.bold}${c.blue}AgroMonitor · Debug de estado del proyecto${c.reset}`);
  console.log(`${c.dim}${new Date().toISOString()}${c.reset}`);

  const env = loadEnv();
  const apiBase = env.EXPO_PUBLIC_API_URL || 'http://ec2-100-24-12-31.compute-1.amazonaws.com:8000';

  checkEnvironment();
  checkFiles();
  await checkBackend(apiBase);
  summary();
})().catch((e) => {
  console.error(`\n${c.red}Error inesperado:${c.reset}`, e);
  process.exit(1);
});
