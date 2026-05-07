# Known Issues

## 🔴 CRITICAL: Crypto Polyfill Error on Android

**Status**: Not fixed yet
**Priority**: High
**Affects**: Android emulator and devices

### Error Message
```
Cannot read property 'create' of undefined
```

### Root Cause
The `react-native-quick-crypto` native module is not properly built/linked. This happens because:
1. The native modules need to be prebuilt for Expo
2. OR needs to use `expo prebuild --clean` to generate native code

### Current Workaround Attempts
- ✅ Added polyfills in `polyfills.js`
- ✅ Set up `metro.config.js` to resolve crypto/stream modules
- ✅ Correct import order in `index.js`
- ❌ Still need to run `npx expo prebuild --clean`

### Dependencies Installed
```json
{
  "crypto-browserify": "^3.12.1",
  "react-native-crypto": "^2.2.1",
  "react-native-quick-crypto": "^1.1.2",
  "stream-browserify": "^3.0.0",
  "buffer": "^6.0.3",
  "process": "^0.11.10",
  "react-native-get-random-values": "^2.0.0"
}
```

### Files Modified
- `index.js` - Added polyfill imports in correct order
- `polyfills.js` - Added process, stream polyfills
- `metro.config.js` - Added resolver for crypto and stream modules

### Next Steps to Fix
1. Run `npx expo prebuild --clean` to generate native iOS/Android code
2. Rebuild the app with `npx expo run:android`
3. Test on Android emulator/device

### Alternative Solutions
1. Switch to `react-native-crypto` only (remove quick-crypto)
2. Use Expo development build with native modules
3. Downgrade to older crypto packages that don't need native modules

---

## Mobile Wallet Adapter (MWA) Integration

**Status**: Partially implemented
**Priority**: Medium

### Missing Configuration
- Need to add `solana-wallet` URI scheme to `AndroidManifest.xml`
- Need comprehensive transaction service
- Need reauthorization handling

### See
- `src/services/walletService.ts` - Basic MWA implementation exists
- `src/contexts/WalletContext.tsx` - Wallet state management
- Reference: `../solana-app-kit-main` for complete implementation example
