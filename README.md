<p align="center">
   <img width="150" alt="AutoMancer" src="https://github.com/user-attachments/assets/f5ebac14-0e91-4a38-bcc5-51a28243f47b" />
</p>

# AutoMancer

AutoMancer is a basic Windows & MacOS app that automates mouse clicks and keyboard presses.
It showcases a modern design on each platform and provides global hotkeys to toggle automation.

<p align="center">
   <img width="640" height="392" alt="image" src="https://github.com/user-attachments/assets/0fabf98f-e691-4609-92ed-63912a8c50fc" />
</p>

## Features

- Configurable auto clicker and key presser
- Automation via prebuilt `@jitsi/robotjs`
- Windows 11 Mica effect via `mica-electron`
- Global hotkeys (F6 for clicker, F7 for key presser)

## Getting Started

Use **Node.js 18 or 20** with **npm 9+**. Newer releases such as Node 22 are currently unsupported and may fail during dependency installation.

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
4. Create an installer for your current platform
   ```bash
   npm run dist
   ```
   Building the macOS DMG must be done on macOS; cross‑platform mac builds are not supported.

## Notes

- Hotkeys toggle the automation globally.
- Intervals and keys can be adjusted in the UI.
- Set `AUTOMANCER_DISABLE_GPU=1` before launching if you need to disable hardware acceleration.

### Troubleshooting

If you encounter the error `Electron failed to install correctly`, remove the `node_modules` folder and rerun `npm install`.
If Electron logs repeated GPU process crashes, start the app with `AUTOMANCER_DISABLE_GPU=1 npm start` and ensure your GPU drivers are up to date.

## License

This project is licensed under the MIT License.
