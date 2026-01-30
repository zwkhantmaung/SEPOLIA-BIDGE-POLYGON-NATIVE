# SEPOLIA-BIDGE-POLYGON-NATIVE

Bridge system and demo app: **MEC Bridge** — Solidity contracts for bridging ZETH (Sepolia) ↔ wZETH (Polygon Amoy), plus a React Native dashboard.

## Repository structure

| Directory | Description |
|-----------|-------------|
| **MexcBridgeContracts/** | Hardhat Solidity project: ZETH, EthBridge, wZETH, PolyBridge. Deploy to Sepolia (source) and Amoy (destination). |
| **BridgeDemoRN/** | Expo + React Native app: bridge dashboard with ZETH / wZETH UI and simulated Mint, Lock, Burn, Reset. |

## Quick start

### Contracts (Sepolia / Amoy)

```bash
cd MexcBridgeContracts
npm install
cp .env.example .env   # set RPC URLs, PRIVATE_KEY, API keys
npm run compile
npm run test
npm run deploy:sepolia   # or deploy:amoy
```

See [MexcBridgeContracts](MexcBridgeContracts/) for contract details and deployment.

### Demo app (React Native)

```bash
cd BridgeDemoRN
npm install
npx expo start
# or: npx expo prebuild && npm run run:ios
```

See [BridgeDemoRN/README.md](BridgeDemoRN/README.md) for full run instructions (iOS/Android, standalone vs Expo Go).

## Requirements

- **Contracts:** Node.js, Hardhat; `.env` with Sepolia/Amoy RPC URLs and deployer private key.
- **App:** Node.js, Expo CLI; for native builds: Xcode (iOS) and/or Android Studio (Android).

## License

MIT (see each subproject for details.)
