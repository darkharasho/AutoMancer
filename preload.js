const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('auto', {
  startClicker: (interval) => ipcRenderer.send('start-clicker', interval),
  stopClicker: () => ipcRenderer.send('stop-clicker'),
  startKeyPresser: (key, interval) => ipcRenderer.send('start-key', { key, interval }),
  stopKeyPresser: () => ipcRenderer.send('stop-key'),
  onClickerToggled: (callback) => ipcRenderer.on('clicker-toggled', (_, state) => callback(state)),
  onKeyToggled: (callback) => ipcRenderer.on('key-toggled', (_, state) => callback(state))
});
