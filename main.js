const { app, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const { MicaBrowserWindow } = require('mica-electron');
let robot;

// Disable GPU acceleration to avoid GPU process crashes on some systems
app.disableHardwareAcceleration();

let clickIntervalId = null;
let keyIntervalId = null;
let currentKey = 'a';
let clickInterval = 1000;
let keyInterval = 1000;

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
}

function stopClicker() {
  if (clickIntervalId) {
    clearInterval(clickIntervalId);
    clickIntervalId = null;
  }
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
}

function stopKeyPresser() {
  if (keyIntervalId) {
    clearInterval(keyIntervalId);
    keyIntervalId = null;
  }
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
  const win = new MicaBrowserWindow({
    width: 500,
    height: 400,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.setMicaEffect();

  win.loadFile('index.html');

  globalShortcut.register('F6', () => {
    toggleClicker();
    win.webContents.send('clicker-toggled', Boolean(clickIntervalId));
  });

  globalShortcut.register('F7', () => {
    toggleKeyPresser();
    win.webContents.send('key-toggled', Boolean(keyIntervalId));
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
