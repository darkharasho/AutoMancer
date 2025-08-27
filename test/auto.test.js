const test = require('node:test');
const assert = require('node:assert');
const { mock } = require('node:test');
const { setTimeout: delay } = require('node:timers/promises');
const Module = require('module');

process.env.NODE_ENV = 'test';

const mouseClick = mock.fn();
const moveMouse = mock.fn();
const keyTap = mock.fn();

const originalLoad = Module._load;
Module._load = (request, parent, isMain) => {
  if (request === 'electron') {
    return {
      app: {
        disableHardwareAcceleration: () => {},
        whenReady: () => Promise.resolve(),
        on: () => {},
        getPath: () => '.',
        dock: { setIcon: () => {} }
      },
      ipcMain: { on: () => {}, handle: () => {}, once: () => {}, removeListener: () => {} },
      globalShortcut: { unregister: () => {}, unregisterAll: () => {}, register: () => {} },
      BrowserWindow: class {},
      screen: { getAllDisplays: () => [], getCursorScreenPoint: () => ({ x: 0, y: 0 }) },
      nativeImage: { createFromPath: () => ({}) }
    };
  }
  if (request === 'mica-electron') {
    return { MicaBrowserWindow: class {} };
  }
  if (request === '@jitsi/robotjs') {
    return { mouseClick, moveMouse, keyTap };
  }
  return originalLoad(request, parent, isMain);
};

const {
  startClicker,
  stopClicker,
  updateClickConfig,
  getClickState,
  startKeyPresser,
  stopKeyPresser,
  getKeyState,
  updateKeyConfig
} = require('../main.js');

test('auto clicker config and toggling', async () => {
  const before = mouseClick.mock.calls.length;
  startClicker({ interval: 1, jitter: 0, button: 'left', target: { type: 'current' } });
  await delay(5);
  const after = mouseClick.mock.calls.length;
  assert.ok(after > before);
  let state = getClickState();
  assert.strictEqual(state.interval, 1);
  assert.strictEqual(state.button, 'left');
  assert.deepStrictEqual(state.target, { type: 'current' });
  assert.ok(state.running);

  updateClickConfig({ interval: 5, jitter: 2, button: 'right', target: { type: 'coords', x: 10, y: 20 } });
  state = getClickState();
  assert.strictEqual(state.interval, 5);
  assert.strictEqual(state.jitter, 2);
  assert.strictEqual(state.button, 'right');
  assert.deepStrictEqual(state.target, { type: 'coords', x: 10, y: 20 });

  stopClicker();
  assert.ok(!getClickState().running);
});

test('auto key presser config and toggling', async () => {
  const before = keyTap.mock.calls.length;
  startKeyPresser('x', 1);
  await delay(5);
  const after = keyTap.mock.calls.length;
  assert.ok(after > before);
  let state = getKeyState();
  assert.strictEqual(state.key, 'x');
  assert.strictEqual(state.interval, 1);
  assert.ok(state.running);
  stopKeyPresser();

  updateKeyConfig({ key: 'y', interval: 2 });
  startKeyPresser();
  state = getKeyState();
  assert.strictEqual(state.key, 'y');
  assert.strictEqual(state.interval, 2);

  stopKeyPresser();
  assert.ok(!getKeyState().running);
});
