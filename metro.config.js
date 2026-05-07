const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'crypto') {
    return context.resolveRequest(context, 'react-native-quick-crypto', platform);
  }
  if (moduleName === 'stream') {
    return context.resolveRequest(context, 'stream-browserify', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
