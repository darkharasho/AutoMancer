const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

let appVersion = '';
try {
  appVersion = fs.readFileSync(path.join(__dirname, 'version.txt'), 'utf8').trim();
} catch {}

contextBridge.exposeInMainWorld('env', { platform: process.platform });
contextBridge.exposeInMainWorld('appVersion', appVersion);

contextBridge.exposeInMainWorld('auto', {
    startClicker: (config) => ipcRenderer.send('start-clicker', config),
    stopClicker: () => ipcRenderer.send('stop-clicker'),
    startKeyPresser: (key, interval, mode) => ipcRenderer.send('start-key', { key, interval, mode }),
    stopKeyPresser: () => ipcRenderer.send('stop-key'),
    setClickHotkey: (accelerator) => ipcRenderer.invoke('set-click-hotkey', accelerator),
    setKeyHotkey: (accelerator) => ipcRenderer.invoke('set-key-hotkey', accelerator),
    getHotkeys: () => ipcRenderer.invoke('get-hotkeys'),
    onClickerToggled: (callback) => ipcRenderer.on('clicker-toggled', (_, state) => callback(state)),
    onKeyToggled: (callback) => ipcRenderer.on('key-toggled', (_, state) => callback(state)),
    pickPoint: () => ipcRenderer.invoke('pick-point'),
    resize: (height) => ipcRenderer.send('resize-window', height),
    updateClickConfig: (config) => ipcRenderer.send('update-click-config', config),
    suspendHotkeys: () => ipcRenderer.invoke('suspend-hotkeys'),
    resumeHotkeys: () => ipcRenderer.invoke('resume-hotkeys')
  });
