// Crypto polyfills ENABLED for Solana wallet functionality
import './polyfills';
import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

// Quick crypto for better performance (optional)
try {
  const { install } = require('react-native-quick-crypto');
  install();
} catch (e) {
  console.log('react-native-quick-crypto not available, using polyfills');
}

import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);
