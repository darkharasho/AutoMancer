# AutoMancer

AutoMancer is a basic Electron app that automates mouse clicks and keyboard presses.
It showcases Windows 11 style using Mica effects and provides global hotkeys to toggle automation.
Automation is powered by the `@jitsi/robotjs` library, which ships prebuilt binaries so it installs without Visual Studio or other build tools.

## Features

 - Configurable auto clicker and key presser
 - Choose left/middle/right mouse button and click at the cursor or fixed coordinates
- Automation via prebuilt `@jitsi/robotjs`
- Windows 11 Mica effect via `mica-electron` (falls back to macOS vibrancy)
- User-configurable global hotkeys for clicker and key presser (persist between launches)

## Getting Started

Use **Node.js 18** with **npm 9+**. Newer releases such as Node 20+ are currently unsupported and may fail during dependency installation.

If you manage versions with `nvm`, the project ships an `.nvmrc` file; run `nvm use` to switch to the recommended Node version.

1. Install dependencies
   ```bash
   npm install
   ```
2. Run the app
   ```bash
   npm start
   ```
3. Package the app (Windows 64-bit example)
   ```bash
   npm run package
   ```

## Notes

- Hotkeys toggle the automation globally and can be changed via set-hotkey popups.
- Intervals (default 100ms) and keys can be adjusted in the UI.
- Toggle buttons turn green while their automation is running.
- Hardware acceleration is disabled by default. Launch with `AUTOMANCER_ENABLE_GPU=1 npm start` to turn it on.
- On macOS the window uses vibrancy instead of Mica and the title is offset to avoid overlapping system controls.
 - Use the Pick button to grab screen coordinates; press Esc or click to confirm the position.

### Troubleshooting

If you encounter the error `Electron failed to install correctly`, remove the `node_modules` folder and rerun `npm install`.
If you experiment with GPU acceleration and encounter crashes, remove `AUTOMANCER_ENABLE_GPU=1` and ensure your GPU drivers are up to date.

## License

This project is licensed under the MIT License.
