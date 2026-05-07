# SOLmate 💕⚡

**Date like it's worth something.**

A Solana-powered dating app where you stake crypto to show up. No more ghosting—put your SOL where your heart is.

🔥 **Ghost = stakes burn forever**
✨ **Show up = get it back + mint Moment NFTs**

---

## 🎯 The Problem

- **Ghosting** is epidemic in online dating
- **No-shows** waste everyone's time
- **Catfishing** and low commitment are rampant
- **Zero consequences** for bad behavior

## 💡 The Solution

SOLmate introduces **financial accountability** through blockchain:

1. **Stake to Match** - Both parties lock SOL in escrow to confirm a date
2. **Show Up or Burn** - If you ghost, your stake burns forever
3. **Proof of Meeting** - Proximity verification using GPS + blockchain
4. **Mint Moments** - Successful dates become NFTs on Solana
5. **Heart Score** - Build on-chain reputation through verified meetups

---

## 🎮 Try the Demo

**👉 [Interactive Web Demo](../solmate-complete-demo.html)** - Open in browser, no installation required

Experience the full user flow:
- Browse profiles with compatibility scores
- Stake & message matches
- Check-in with proximity verification
- Mint Moment NFTs

---

## 🏗️ Architecture

### Frontend (This Repo)
- **React Native** - Cross-platform mobile app
- **Expo** - Development and build tooling
- **Mobile Wallet Adapter** - Native Solana wallet integration

### Blockchain
- **Solana** - Fast, low-cost transactions
- **Escrow Program** - Custom smart contract for stake management
- **Metaplex** - NFT minting for Moment tokens

### Backend
- **FastAPI** - Python REST API
- **PostgreSQL** - User data and matches
- **WebSocket** - Real-time messaging

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on Android (Solana Seeker)
npx expo start --android

# Run on iOS
npx expo start --ios
```

### Clear Cache (if encountering crypto errors)

```bash
rm -rf .expo node_modules/.cache
npx expo start --clear
```

---

## 📱 Optimized for Solana Seeker

- Portrait orientation only
- Dark mode UI
- Mobile Wallet Adapter integration
- Required permissions: Location, Camera, Bluetooth

---

## 🛠️ Tech Stack

### Crypto & Blockchain
- `@solana-mobile/mobile-wallet-adapter-protocol-web3js` - Wallet integration
- `crypto-browserify` - Node.js crypto polyfills for React Native
- `react-native-quick-crypto` - Fast native crypto operations
- `bs58` - Base58 encoding for Solana addresses

### UI & Navigation
- `@react-navigation/native` - Screen navigation
- `expo-linear-gradient` - Gradient backgrounds
- `expo-blur` - Blur effects
- `@expo-google-fonts/nunito` - Custom typography

### Location & Verification
- `expo-location` - GPS proximity verification
- `react-native-maps` - Map visualization

### State & Storage
- `@react-native-async-storage/async-storage` - Persistent storage
- `@react-native-community/netinfo` - Network status

---

## 📂 Project Structure

```
mobile/
├── src/
│   ├── screens/          # App screens
│   │   ├── SplashScreen.tsx
│   │   ├── WalletConnectScreen.tsx
│   │   ├── ProfileSetupScreen.tsx
│   │   ├── BrowseScreen.tsx
│   │   ├── MessagesScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── CheckInScreen.tsx
│   │   └── MintNFTScreen.tsx
│   ├── contexts/         # React contexts
│   │   └── WalletContext.tsx
│   ├── services/         # API & wallet services
│   │   └── walletService.ts
│   ├── config/           # Configuration
│   │   └── api.ts
│   └── constants/        # Theme & constants
│       └── theme.ts
├── polyfills.js          # Crypto polyfills for React Native
├── index.js              # App entry point
├── App.tsx               # Root component
└── metro.config.js       # Metro bundler config
```

---

## 🎨 Features

### ✅ Implemented
- Animated splash screen with 3-page gallery
- Wallet connection (Phantom, Backpack, social login)
- Profile setup with interests and stake requirements
- Browse profiles with compatibility scores
- Real-time messaging with stake countdown
- Proximity-based check-in system
- NFT minting for successful meetups

### 🚧 Coming Soon
- Push notifications for matches
- Video chat integration
- Group dates & events
- Advanced filtering
- Heart score leaderboard

---

## 🔐 Security & Privacy

- **Wallet addresses never shown publicly** - Only display names visible
- **End-to-end encrypted messaging** - Messages stored encrypted
- **Proximity verification** - GPS + blockchain attestation
- **No personal data collection** - Self-custodial wallet model

---

## 📄 License

ISC

---

## 🤝 Contributing

Built for [EasyA Consensus Miami Hackathon 2024](https://easya.io/hackathons/consensus-miami)

---

## 💬 Support

For questions or issues:
- Email: thenextwaveapp@gmail.com
- Twitter: [@thenextwaveapp](https://twitter.com/thenextwaveapp)

---

**SOLmate** - Where trust is programmable and accountability is automatic. 🔥
