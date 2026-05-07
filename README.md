# Sol Mate — Frontend

Mobile-responsive frontend for [Sol Mate Trust API](https://github.com/AINative-Studio/sol-mate-trust-api).

Stake USDC to DM, match, and meet. No-shows get slashed on Solana.

Built for the **EasyA × Consensus Miami Hackathon 2026**.

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | React Native / Expo (or React + Tailwind) |
| Wallet | Phantom / Solflare (Mobile Wallet Adapter) |
| Payments | Coinbase x402 (Base USDC) |
| State | Zustand / React Query |
| API | Sol Mate Trust API (`https://sol-mate-trust-api-production.up.railway.app`) |

---

## API

Backend is live at:

```
https://sol-mate-trust-api-production.up.railway.app
```

Interactive docs:

```
https://sol-mate-trust-api-production.up.railway.app/docs
```

### Key endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/auth/wallet/connect` | Wallet auth (challenge → signature) |
| `GET` | `/api/v1/rooms` | Discover rooms |
| `POST` | `/api/v1/stakes` | Create a stake (DM, room entry, meetup) |
| `POST` | `/api/v1/matches` | Request a match |
| `POST` | `/api/v1/messages` | Send a message |
| `POST` | `/api/v1/attestations` | Submit meetup attestation |
| `POST` | `/api/v1/transfers` | Gift SOL to another user |
| `POST` | `/api/v1/nfts/mint-moment` | Mint a Moment NFT |
| `GET` | `/api/v1/nfts/moments` | List Moment NFTs |

Full API reference: [`docs/api/API_REFERENCE.md`](https://github.com/AINative-Studio/sol-mate-trust-api/blob/main/docs/api/API_REFERENCE.md)

---

## Getting Started

```bash
git clone https://github.com/AINative-Studio/sol-mate-frontend.git
cd sol-mate-frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## Environment Variables

```env
# Required
NEXT_PUBLIC_API_URL=https://sol-mate-trust-api-production.up.railway.app

# Wallet
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Coinbase x402 (Base)
NEXT_PUBLIC_X402_ENABLED=false
NEXT_PUBLIC_BASE_NETWORK=base-mainnet
```

---

## Contributing

Branch naming: `feature/<issue>-slug`, `bug/<issue>-slug`

Issues: [sol-mate-trust-api issues](https://github.com/AINative-Studio/sol-mate-trust-api/issues)

---

## License

MIT
