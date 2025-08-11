const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('env', { platform: process.platform });

contextBridge.exposeInMainWorld('auto', {
    startClicker: (config) => ipcRenderer.send('start-clicker', config),
    stopClicker: () => ipcRenderer.send('stop-clicker'),
    startKeyPresser: (key, interval) => ipcRenderer.send('start-key', { key, interval }),
    stopKeyPresser: () => ipcRenderer.send('stop-key'),
    setClickHotkey: (accelerator) => ipcRenderer.send('set-click-hotkey', accelerator),
    setKeyHotkey: (accelerator) => ipcRenderer.send('set-key-hotkey', accelerator),
    getHotkeys: () => ipcRenderer.invoke('get-hotkeys'),
    onClickerToggled: (callback) => ipcRenderer.on('clicker-toggled', (_, state) => callback(state)),
    onKeyToggled: (callback) => ipcRenderer.on('key-toggled', (_, state) => callback(state)),
    pickPoint: () => ipcRenderer.invoke('pick-point'),
    resize: (height) => ipcRenderer.send('resize-window', height)
  });
