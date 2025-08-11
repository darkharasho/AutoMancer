# AutoMancer

AutoMancer is a basic Electron app that automates mouse clicks and keyboard presses.
It showcases Windows 11 style using Mica effects and provides global hotkeys to toggle automation.
Automation is powered by the `@jitsi/robotjs` library, which ships prebuilt binaries so it installs without Visual Studio or other build tools.

## Features

- Configurable auto clicker and key presser
- Automation via prebuilt `@jitsi/robotjs`
- Windows 11 Mica effect via `mica-electron`
- Global hotkeys (F6 for clicker, F7 for key presser)

## Getting Started

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

- Hotkeys toggle the automation globally.
- Intervals and keys can be adjusted in the UI.

### Troubleshooting

If you encounter the error `Electron failed to install correctly`, remove the `node_modules` folder and rerun `npm install`.

## License

This project is licensed under the MIT License.
