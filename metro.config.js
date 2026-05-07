const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

// Crypto resolvers ENABLED for Solana wallet functionality
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'crypto') {
    // Try quick-crypto first, fallback to crypto-browserify
    try {
      return context.resolveRequest(context, 'react-native-quick-crypto', platform);
    } catch (e) {
      return context.resolveRequest(context, 'crypto-browserify', platform);
    }
  }
  if (moduleName === 'stream') {
    return context.resolveRequest(context, 'stream-browserify', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
