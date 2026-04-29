// metro.config.js
// Fix para Supabase en React Native: resuelve módulos Node.js vía browser exports
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Redirige el módulo 'ws' de Node.js al WebSocket nativo de React Native
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'ws') {
    return {
      filePath: path.resolve(__dirname, 'stubs/ws.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
