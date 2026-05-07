// Global polyfills that must run before anything else
if (typeof global.require === 'undefined') {
  global.require = require;
}

// Ensure process exists
if (typeof global.process === 'undefined') {
  global.process = require('process');
} else {
  const bProcess = require('process');
  for (const p in bProcess) {
    if (!(p in global.process)) {
      global.process[p] = bProcess[p];
    }
  }
}

global.process.browser = false;
global.process.env = global.process.env || {};

// Stream polyfill
global.stream = require('stream-browserify');

// Crypto polyfill - THIS IS CRITICAL
global.crypto = require('crypto-browserify');

// Ensure crypto has all necessary methods
if (!global.crypto.getRandomValues) {
  global.crypto.getRandomValues = (array) => {
    const randomBytes = require('react-native-get-random-values');
    return randomBytes.getRandomValues(array);
  };
}
