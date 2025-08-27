const { app, ipcMain, globalShortcut, BrowserWindow, screen, nativeImage, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { MicaBrowserWindow } = require('mica-electron');
const liquidGlass = process.platform === 'darwin' ? require('electron-liquid-glass') : null;
let robot;
let win;
let pickerWin;
let isQuitting = false;

// Disable GPU acceleration by default to avoid crashes on some systems.
// Set AUTOMANCER_ENABLE_GPU=1 to opt in to hardware acceleration.
if (process.env.AUTOMANCER_ENABLE_GPU !== '1') {
  app.disableHardwareAcceleration();
}

let clickIntervalId = null;
let keyIntervalId = null;
let currentKey = 'a';
let clickInterval = 100; // default 100ms
let clickJitter = 0; // default 0ms jitter
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
    updateClickConfig(config);
  }
  if (!robot) {
    robot = require('@jitsi/robotjs');
  }
  if (clickTarget.type === 'coords') {
    robot.moveMouse(clickTarget.x, clickTarget.y);
  }
  const scheduleClick = () => {
    const extra = Math.floor(Math.random() * (clickJitter + 1));
    const delay = clickInterval + extra;
    clickIntervalId = setTimeout(() => {
      if (!robot) {
        robot = require('@jitsi/robotjs');
      }
      robot.mouseClick(clickButton);
      if (clickTarget.type === 'coords') {
        robot.moveMouse(clickTarget.x, clickTarget.y);
      }
      scheduleClick();
    }, delay);
  };
  scheduleClick();
  notifyClickerState();
}

function stopClicker() {
  if (clickIntervalId) {
    clearTimeout(clickIntervalId);
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

function updateClickConfig(config) {
  if (config) {
    if (Number.isFinite(config.interval)) clickInterval = config.interval;
    if (Number.isFinite(config.jitter)) clickJitter = Math.max(0, config.jitter);
    if (config.button) clickButton = config.button;
    if (config.target) clickTarget = config.target;
  }
}

function updateKeyConfig(config) {
  if (config) {
    if (typeof config.key === 'string') currentKey = config.key;
    if (Number.isFinite(config.interval)) keyInterval = config.interval;
  }
}

function getClickState() {
  return {
    interval: clickInterval,
    jitter: clickJitter,
    button: clickButton,
    target: clickTarget,
    running: Boolean(clickIntervalId)
  };
}

function getKeyState() {
  return {
    key: currentKey,
    interval: keyInterval,
    running: Boolean(keyIntervalId)
  };
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

function createPickerWindow() {
  if (pickerWin && !pickerWin.isDestroyed()) return;
  pickerWin = new BrowserWindow({
    show: false,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    acceptFirstMouse: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  pickerWin.loadFile(path.join(__dirname, 'picker.html'));
  pickerWin.on('closed', () => {
    pickerWin = null;
    // Preload a fresh picker for next use to avoid load delays
    if (!isQuitting) {
      createPickerWindow();
    }
  });
}

async function pickPoint() {
  createPickerWindow();
  if (pickerWin.webContents.isLoading()) {
    await new Promise(resolve => pickerWin.webContents.once('did-finish-load', resolve));
  }
  const displays = screen.getAllDisplays();
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const d of displays) {
    const b = d.bounds;
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  }
  pickerWin.setBounds({
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  });
  pickerWin.show();
  pickerWin.focus();

  return new Promise((resolve) => {
    const finish = () => {
      const pos = screen.getCursorScreenPoint();
      resolve(pos);
      pickerWin.hide();
      pickerWin.close();
    };

    ipcMain.once('picker-done', finish);
    pickerWin.once('closed', () => {
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
  const iconPath = path.join(
    __dirname,
    'images',
    isMac ? 'AutoMancer.icns' : isWin ? 'AutoMancer.ico' : 'AutoMancer.png'
  );
  const icon = nativeImage.createFromPath(iconPath);
  if (isMac) {
    app.dock.setIcon(icon);
  }
  const WindowClass = isWin ? MicaBrowserWindow : BrowserWindow;
  const windowOpts = {
    width: 360,
    height: 360,
    resizable: false,
    icon,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#00000000', symbolColor: '#ffffff' },
    autoHideMenuBar: true,
    show: false,
    alwaysOnTop: true,
    ...(isWin ? { roundedCorners: true } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  };
  win = new WindowClass(windowOpts);
  if (typeof win.setIcon === 'function') {
    win.setIcon(icon);
  }
  if (typeof win.setRoundedCorners === 'function') {
    win.setRoundedCorners(true);
  }

  win.loadFile(path.join(__dirname, 'index.html'));
  if (isMac && liquidGlass) {
    win.webContents.once('did-finish-load', () => {
      liquidGlass.addView(win.getNativeWindowHandle(), { cornerRadius: 16 });
      if (typeof win.setWindowButtonVisibility === 'function') {
        win.setWindowButtonVisibility(true);
      }
    });
  }
  win.once('ready-to-show', () => {
    if (isWin) {
      win.setDarkTheme();
      win.setMicaEffect();
      if (typeof win.setRoundedCorners === 'function') {
        win.setRoundedCorners(true);
      }
      // --- Force a tiny resize to trigger Mica ---
      setTimeout(() => {
        const [w, h] = win.getSize();
        win.setSize(w, h + 1);
        setTimeout(() => win.setSize(w, h), 10);
      }, 100);
    }
    win.show();
    if (!isWin && typeof win.setRoundedCorners === 'function') {
      win.setRoundedCorners(true);
    }
  });
  win.on('close', () => {
    isQuitting = true;
    if (pickerWin && !pickerWin.isDestroyed()) {
      pickerWin.destroy();
    }
  });
  win.on('closed', () => {
    win = null;
  });

  registerClickHotkey(clickHotkey);
  registerKeyHotkey(keyHotkey);
}

function compareVersions(a, b) {
  const pa = a.split('.').map(n => parseInt(n, 10) || 0);
  const pb = b.split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) {
      return diff > 0 ? 1 : -1;
    }
  }
  return 0;
}

async function checkForUpdates() {
  try {
    const res = await fetch('https://api.github.com/repos/darkharasho/AutoMancer/releases?per_page=1', {
      headers: {
        'User-Agent': 'AutoMancer',
        'Accept': 'application/vnd.github+json'
      }
    });
    if (!res.ok) return;
    let releases;
    try {
      releases = await res.json();
    } catch {
      return;
    }
    const latestRelease = releases[0];
    if (!latestRelease || !latestRelease.tag_name) return;
    const latest = latestRelease.tag_name.replace(/^v/, '');
    const current = app.getVersion();
    if (compareVersions(latest, current) > 0 && dialog) {
      const icon = nativeImage.createFromPath(
        path.join(__dirname, 'images', 'AutoMancer.png')
      );
      const { response } = await dialog.showMessageBox(win || null, {
        type: 'info',
        buttons: ['Download', 'Later'],
        defaultId: 0,
        cancelId: 1,
        title: 'Update available',
        message: `Version ${latest} is available.`,
        detail: 'Click "Download" to open the latest release.',
        icon
      });
      if (response === 0 && latestRelease.html_url && shell) {
        shell.openExternal(latestRelease.html_url);
      }
    }
  } catch (_) {
    // ignore errors
  }
}

if (process.env.NODE_ENV !== 'test') {
  app.whenReady().then(() => {
    settingsPath = path.join(app.getPath('userData'), 'settings.json');
    loadSettings();
    createWindow();
    createPickerWindow();
    checkForUpdates();
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    stopClicker();
    stopKeyPresser();
  });
  app.on('before-quit', () => {
    isQuitting = true;
  });
  app.on('window-all-closed', () => {
    app.quit();
  });
}

  ipcMain.on('start-clicker', (e, config) => startClicker(config));
  ipcMain.on('stop-clicker', stopClicker);
  ipcMain.on('start-key', (e, data) => startKeyPresser(data.key, data.interval));
  ipcMain.on('stop-key', stopKeyPresser);
  ipcMain.on('set-click-hotkey', (e, accelerator) => registerClickHotkey(accelerator));
  ipcMain.on('set-key-hotkey', (e, accelerator) => registerKeyHotkey(accelerator));
  ipcMain.handle('get-hotkeys', () => ({ clickHotkey, keyHotkey }));
  ipcMain.handle('pick-point', () => pickPoint());
  ipcMain.on('update-click-config', (e, config) => {
    updateClickConfig(config);
  });
  ipcMain.on('update-key-config', (e, config) => {
    updateKeyConfig(config);
  });
  ipcMain.on('resize-window', (e, height) => {
    if (win) {
      const [w] = win.getContentSize();
      win.setContentSize(w, Math.round(height));
    }
  });

module.exports = {
  startClicker,
  stopClicker,
  startKeyPresser,
  stopKeyPresser,
  updateClickConfig,
  updateKeyConfig,
  getClickState,
  getKeyState
};
