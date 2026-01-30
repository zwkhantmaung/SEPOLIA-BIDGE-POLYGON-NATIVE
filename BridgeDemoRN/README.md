# BridgeDemoRN

Burn wZETH and Reset Bridge UI (Expo + React Native).

## Run as standalone app (no Expo Go)

The app runs as its own native binary on simulator/device, not inside Expo Go.

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Generate native projects** (first time only; creates `ios/` and `android/`)

   ```bash
   npx expo prebuild
   ```

3. **Run on iOS** (builds and launches the standalone app in the iOS Simulator)

   ```bash
   npm run run:ios
   ```
   Or: `npx expo run:ios`

4. **Run on Android** (builds and launches on emulator or connected device)

   ```bash
   npm run run:android
   ```
   Or: `npx expo run:android`

You need **Xcode** (iOS) and/or **Android Studio** (Android) installed. The first build can take several minutes.

## Development with Expo Go (optional)

To use the dev server and Expo Go instead:

```bash
npm start
```

Then scan the QR code with Expo Go, or press `i` / `a` for iOS/Android simulator (with Expo Go installed in the simulator).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

- [Expo documentation](https://expo.dev/docs)
- [Expo Router](https://expo.dev/router/introduction)
