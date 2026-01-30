# BridgeDemoRN

Bridge dashboard (Expo + React Native): live ZETH / wZETH values and simulated Mint, Lock & Mint wZETH, Burn wZETH, and Reset actions. No real blockchain calls — pure `useState` simulation.

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

**iPhone 15 (simulator or device):** Use `npm run run:ios` so the app builds and runs with Metro. On a physical iPhone 15, ensure the device and Mac are on the same Wi‑Fi so the app can load the bundle. If the app crashes on launch, run `npx expo prebuild --clean` then `npm run run:ios` again.

**“No script URL provided” when you stop Metro:** The default iOS run is a *development* build: it loads the JavaScript from Metro. When you stop Metro (e.g. stop the terminal), the app has no bundle and shows “No script URL provided”. That’s expected. To run the app **without** Metro (e.g. after closing the terminal), use a Release build with the bundle embedded:

```bash
npm run run:ios:release
```

Keep Metro running only when you use `npm run run:ios` (development).

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
