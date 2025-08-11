const { app, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const { MicaBrowserWindow } = require('mica-electron');
let robot;
let win;

// Allow disabling GPU acceleration via environment variable if needed
if (process.env.AUTOMANCER_DISABLE_GPU === '1') {
  app.disableHardwareAcceleration();
}

let clickIntervalId = null;
let keyIntervalId = null;
let currentKey = 'a';
let clickInterval = 1000;
let keyInterval = 1000;

function notifyClickerState() {
  if (win) {
    win.webContents.send('clicker-toggled', Boolean(clickIntervalId));
  }
}

function notifyKeyState() {
  if (win) {
    win.webContents.send('key-toggled', Boolean(keyIntervalId));
  }
}

function startClicker(interval) {
  stopClicker();
  clickInterval = interval || clickInterval;
  clickIntervalId = setInterval(() => {
    if (!robot) {
      robot = require('@jitsi/robotjs');
    }
    const mouse = robot.getMousePos();
    robot.mouseClick();
    robot.moveMouse(mouse.x, mouse.y); // ensure position remains
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
    startClicker(clickInterval);
  }
}

function toggleKeyPresser() {
  if (keyIntervalId) {
    stopKeyPresser();
  } else {
    startKeyPresser(currentKey, keyInterval);
  }
}

function createWindow() {
  win = new MicaBrowserWindow({
    width: 520,
    height: 300,
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#00000000', symbolColor: '#ffffff' },
    autoHideMenuBar: true,
    backgroundColor: '#00000000',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));
  win.once('ready-to-show', () => {
    win.setDarkTheme();
    win.setMicaEffect();
    win.show();
  });

  globalShortcut.register('F6', () => {
    toggleClicker();
  });

  globalShortcut.register('F7', () => {
    toggleKeyPresser();
  });
}

app.whenReady().then(createWindow);

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  stopClicker();
  stopKeyPresser();
});

ipcMain.on('start-clicker', (e, interval) => startClicker(interval));
ipcMain.on('stop-clicker', stopClicker);
ipcMain.on('start-key', (e, data) => startKeyPresser(data.key, data.interval));
ipcMain.on('stop-key', stopKeyPresser);
