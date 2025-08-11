const keySelect = document.getElementById('key');
const keys = [
  'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
  '0','1','2','3','4','5','6','7','8','9',
  'enter','escape','tab','space','backspace','delete','home','end','pageup','pagedown','left','right','up','down',
  'shift','control','alt','command',
  'f1','f2','f3','f4','f5','f6','f7','f8','f9','f10','f11','f12'
];
keys.forEach(k => {
  const opt = document.createElement('option');
  opt.value = k;
  opt.textContent = k;
  keySelect.appendChild(opt);
});
keySelect.value = 'a';

document.getElementById('startClicker').addEventListener('click', () => {
  const interval = parseInt(document.getElementById('clickInterval').value, 10);
  window.auto.startClicker(interval);
});

document.getElementById('stopClicker').addEventListener('click', () => {
  window.auto.stopClicker();
});

document.getElementById('startKey').addEventListener('click', () => {
  const key = document.getElementById('key').value;
  const interval = parseInt(document.getElementById('keyInterval').value, 10);
  window.auto.startKeyPresser(key, interval);
});

document.getElementById('stopKey').addEventListener('click', () => {
  window.auto.stopKeyPresser();
});

window.auto.onClickerToggled((state) => {
  document.getElementById('clickerStatus').textContent = state ? 'Running' : 'Stopped';
});

window.auto.onKeyToggled((state) => {
  document.getElementById('keyStatus').textContent = state ? 'Running' : 'Stopped';
});

function toAccelerator(e) {
  const parts = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.shiftKey) parts.push('Shift');
  if (e.altKey) parts.push('Alt');
  if (e.metaKey) parts.push('Super');
  let key = e.key;
  if (key === ' ') key = 'Space';
  if (key.startsWith('Arrow')) key = key.replace('Arrow', '');
  if (key.length === 1) key = key.toUpperCase();
  else key = key[0].toUpperCase() + key.slice(1);
  if (!['Shift','Control','Alt','Super','Meta','Ctrl'].includes(key)) {
    parts.push(key);
  }
  return parts.join('+');
}

function setupHotkeyInput(id, setter) {
  const el = document.getElementById(id);
  el.addEventListener('keydown', (e) => {
    e.preventDefault();
    const accel = toAccelerator(e);
    el.value = accel;
    setter(accel);
  });
}

setupHotkeyInput('clickHotkey', window.auto.setClickHotkey);
setupHotkeyInput('keyHotkey', window.auto.setKeyHotkey);
