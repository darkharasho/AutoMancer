<p align="center">
   <img width="150" alt="AutoMancer" src="https://github.com/user-attachments/assets/f5ebac14-0e91-4a38-bcc5-51a28243f47b" />
</p>

# AutoMancer

AutoMancer is a basic Windows & MacOS app that automates mouse clicks and keyboard presses.
It showcases a modern design on each platform and provides global hotkeys to toggle automation.

<p align="center">
   <img width="673" height="394" alt="automancer screenshot" src="https://github.com/user-attachments/assets/8224d2d9-37c0-43eb-93ac-ae75d3dd564c" />
   <img width="640" height="368" alt="image" src="https://github.com/user-attachments/assets/0f45aaf9-2a3c-409b-8906-4def05e63e35" />
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
3. Package the app
   ```bash
   npm run package
   ```
   Use `npm run package:win` or `npm run package:mac` to build for a single platform.
4. Create an installer
   ```bash
   npm run dist:win
   npm run dist:mac
   ```
   Run the command appropriate for your host OS. DMG installers must be built on macOS.
   Windows builds may require Administrator rights or Developer Mode to allow symlink creation during extraction.

## Notes

- Hotkeys toggle the automation globally.
- Intervals and keys can be adjusted in the UI.
- Set `AUTOMANCER_DISABLE_GPU=1` before launching if you need to disable hardware acceleration.

### Troubleshooting

If you encounter the error `Electron failed to install correctly`, remove the `node_modules` folder and rerun `npm install`.
If Electron logs repeated GPU process crashes, start the app with `AUTOMANCER_DISABLE_GPU=1 npm start` and ensure your GPU drivers are up to date.
If macOS warns that "AutoMancer is damaged and can't be opened," the `dist:mac` script now removes the quarantine attribute automatically. For an existing copy, run `xattr -cr /Applications/AutoMancer.app` to clear the attribute manually.

## License

This project is licensed under the MIT License.
