# Android Setup for Phantom Wallet Connection

## Quick Start

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Configure API URL

Edit `src/config/api.ts` and update the BASE_URL:

**For Android Emulator:**
```typescript
BASE_URL: 'http://10.0.2.2:8000'
```

**For Physical Android Device:**
```typescript
BASE_URL: 'http://YOUR_COMPUTER_IP:8000'  // e.g., http://192.168.1.100:8000
```

To find your computer's IP:
- macOS: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig`
- Linux: `ip addr show`

### 3. Start Backend
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0
```

The `--host 0.0.0.0` is important so the backend is accessible from your Android device.

### 4. Run Mobile App
```bash
cd mobile
npm run android
```

### 5. Install Phantom Wallet

Make sure Phantom wallet is installed on your Android device:
- Download from Google Play Store
- Or install from [phantom.app](https://phantom.app/download)

## What Was Changed

### New Files
- `src/config/api.ts` - API configuration

### Modified Files
- `src/contexts/WalletContext.tsx` - Added backend verification
- `src/services/walletService.ts` - Fetches nonce from backend
- `package.json` - Added `@react-native-async-storage/async-storage` and `bs58`

## Auth Flow

1. User clicks "Connect Phantom"
2. App calls `GET /v1/users/challenge?wallet_address=<pubkey>` to get nonce
3. Phantom wallet signs the nonce message
4. App calls `POST /v1/users/onboard` with signature
5. Backend verifies signature and returns JWT token
6. Token stored in AsyncStorage for future API calls

## Troubleshooting

**"Connection Failed"**
- Check backend is running on `http://0.0.0.0:8000`
- Verify API URL in `src/config/api.ts` matches your setup
- For physical device, make sure your phone and computer are on same WiFi

**"No wallet app installed"**
- Install Phantom from Google Play Store

**"Wallet authorization was rejected"**
- User cancelled the connection in Phantom
- Try again and approve the connection

**Backend not accessible from device**
- Make sure backend is running with `--host 0.0.0.0`
- Check firewall settings
- Verify both devices on same network (for physical device)
