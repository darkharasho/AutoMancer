const { app, ipcMain, globalShortcut, BrowserWindow, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { MicaBrowserWindow } = require('mica-electron');
let robot;
let win;

// Disable GPU acceleration by default to avoid crashes on some systems.
// Set AUTOMANCER_ENABLE_GPU=1 to opt in to hardware acceleration.
if (process.env.AUTOMANCER_ENABLE_GPU !== '1') {
  app.disableHardwareAcceleration();
}

let clickIntervalId = null;
let keyIntervalId = null;
let currentKey = 'a';
let clickInterval = 100; // default 100ms
let keyInterval = 100; // default 100ms
let clickButton = 'left';
let clickTarget = { type: 'current' };

let clickHotkey = 'F6';
let keyHotkey = 'F7';
let settingsPath;

function loadSettings() {
  try {
    const data = fs.readFileSync(settingsPath, 'utf8');
    const cfg = JSON.parse(data);
    if (cfg.clickHotkey) clickHotkey = cfg.clickHotkey;
    if (cfg.keyHotkey) keyHotkey = cfg.keyHotkey;
  } catch (_) {
    // ignore
  }
}

function saveSettings() {
  if (!settingsPath) return;
  try {
    fs.writeFileSync(settingsPath, JSON.stringify({ clickHotkey, keyHotkey }));
  } catch (_) {
    // ignore
  }
}

function notifyClickerState() {
  if (win && !win.isDestroyed()) {
    win.webContents.send('clicker-toggled', Boolean(clickIntervalId));
  }
}

function notifyKeyState() {
  if (win && !win.isDestroyed()) {
    win.webContents.send('key-toggled', Boolean(keyIntervalId));
  }
}

function startClicker(config) {
  stopClicker();
  if (config) {
    clickInterval = config.interval || clickInterval;
    clickButton = config.button || clickButton;
    clickTarget = config.target || clickTarget;
  }
  clickIntervalId = setInterval(() => {
    if (!robot) {
      robot = require('@jitsi/robotjs');
    }
    if (clickTarget.type === 'coords') {
      robot.moveMouse(clickTarget.x, clickTarget.y);
    }
    robot.mouseClick(clickButton);
    if (clickTarget.type === 'coords') {
      robot.moveMouse(clickTarget.x, clickTarget.y);
    }
  }, clickInterval);
  notifyClickerState();
}

function stopClicker() {
  if (clickIntervalId) {
    clearInterval(clickIntervalId);
    clickIntervalId = null;
  }
  notifyClickerState();
}

function startKeyPresser(key, interval) {
  stopKeyPresser();
  currentKey = key || currentKey;
  keyInterval = interval || keyInterval;
  keyIntervalId = setInterval(() => {
    if (!robot) {
      robot = require('@jitsi/robotjs');
    }
    robot.keyTap(currentKey);
  }, keyInterval);
  notifyKeyState();
}

function stopKeyPresser() {
  if (keyIntervalId) {
    clearInterval(keyIntervalId);
    keyIntervalId = null;
  }
  notifyKeyState();
}

function toggleClicker() {
  if (clickIntervalId) {
    stopClicker();
  } else {
    startClicker();
  }
}

function toggleKeyPresser() {
  if (keyIntervalId) {
    stopKeyPresser();
  } else {
    startKeyPresser(currentKey, keyInterval);
  }
}

function pickPoint() {
  return new Promise((resolve) => {
    const isMac = process.platform === 'darwin';
    const picker = new BrowserWindow({
      fullscreen: !isMac,
      simpleFullscreen: isMac,
      transparent: true,
      frame: false,
      show: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      backgroundColor: '#00000000',
      hasShadow: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    picker.loadFile(path.join(__dirname, 'picker.html'));
    picker.once('ready-to-show', () => picker.show());

    const finish = () => {
      const pos = screen.getCursorScreenPoint();
      resolve(pos);
      picker.close();
    };

    ipcMain.once('picker-done', finish);
    picker.on('closed', () => {
      ipcMain.removeListener('picker-done', finish);
    });
  });
}

function registerClickHotkey(accelerator) {
  if (clickHotkey) {
    globalShortcut.unregister(clickHotkey);
  }
  clickHotkey = accelerator;
  if (clickHotkey) {
    globalShortcut.register(clickHotkey, () => {
      toggleClicker();
    });
  }
  saveSettings();
}

function registerKeyHotkey(accelerator) {
  if (keyHotkey) {
    globalShortcut.unregister(keyHotkey);
  }
  keyHotkey = accelerator;
  if (keyHotkey) {
    globalShortcut.register(keyHotkey, () => {
      toggleKeyPresser();
    });
  }
  saveSettings();
}

function createWindow() {
  const isWin = process.platform === 'win32';
  const isMac = process.platform === 'darwin';
  const WindowClass = isWin ? MicaBrowserWindow : BrowserWindow;
    win = new WindowClass({
      width: 640,
      height: 360,
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#00000000', symbolColor: '#ffffff' },
    autoHideMenuBar: true,
    backgroundColor: '#01000000',
    show: false,
    ...(isMac ? { vibrancy: 'under-window', visualEffectState: 'active' } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));
  win.once('ready-to-show', () => {
    if (isWin) {
      win.setDarkTheme();
      win.setMicaEffect();
    }
    win.show();
  });
  win.on('closed', () => {
    win = null;
  });

  registerClickHotkey(clickHotkey);
  registerKeyHotkey(keyHotkey);
}

app.whenReady().then(() => {
  settingsPath = path.join(app.getPath('userData'), 'settings.json');
  loadSettings();
  createWindow();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  stopClicker();
  stopKeyPresser();
});

  ipcMain.on('start-clicker', (e, config) => startClicker(config));
  ipcMain.on('stop-clicker', stopClicker);
  ipcMain.on('start-key', (e, data) => startKeyPresser(data.key, data.interval));
  ipcMain.on('stop-key', stopKeyPresser);
  ipcMain.on('set-click-hotkey', (e, accelerator) => registerClickHotkey(accelerator));
  ipcMain.on('set-key-hotkey', (e, accelerator) => registerKeyHotkey(accelerator));
  ipcMain.handle('get-hotkeys', () => ({ clickHotkey, keyHotkey }));
  ipcMain.handle('pick-point', () => pickPoint());
