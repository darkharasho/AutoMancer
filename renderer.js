const keySelect = document.getElementById('key');
if (window.env && window.env.platform === 'darwin') {
  document.querySelector('header').style.paddingLeft = '80px';
}
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

  const clickButtonSel = document.getElementById('clickButton');
  const clickTargetSel = document.getElementById('clickTarget');
  const coordFields = document.getElementById('coordFields');
  const coordX = document.getElementById('coordX');
  const coordY = document.getElementById('coordY');
  const pickCoordBtn = document.getElementById('pickCoord');

  function resizeToContent() {
    const h = document.documentElement.scrollHeight;
    window.auto.resize(h);
  }

  clickTargetSel.addEventListener('change', () => {
    coordFields.style.display = clickTargetSel.value === 'coords' ? 'flex' : 'none';
    resizeToContent();
  });

  pickCoordBtn.addEventListener('click', async () => {
    const point = await window.auto.pickPoint();
    if (point) {
      coordX.value = point.x;
      coordY.value = point.y;
    }
  });

  const toggleClickerBtn = document.getElementById('toggleClicker');
  toggleClickerBtn.addEventListener('click', () => {
    const running = toggleClickerBtn.classList.contains('running');
    if (running) {
      window.auto.stopClicker();
    } else {
      const interval = parseInt(document.getElementById('clickInterval').value, 10);
      const button = clickButtonSel.value;
      const target = clickTargetSel.value === 'coords'
        ? { type: 'coords', x: parseInt(coordX.value, 10), y: parseInt(coordY.value, 10) }
        : { type: 'current' };
      window.auto.startClicker({ interval, button, target });
    }
  });

const toggleKeyBtn = document.getElementById('toggleKey');
toggleKeyBtn.addEventListener('click', () => {
  const running = toggleKeyBtn.classList.contains('running');
  if (running) {
    window.auto.stopKeyPresser();
  } else {
    const key = document.getElementById('key').value;
    const interval = parseInt(document.getElementById('keyInterval').value, 10);
    window.auto.startKeyPresser(key, interval);
  }
});

window.auto.onClickerToggled((state) => {
  toggleClickerBtn.textContent = state ? 'Stop' : 'Start';
  toggleClickerBtn.classList.toggle('running', state);
});

window.auto.onKeyToggled((state) => {
  toggleKeyBtn.textContent = state ? 'Stop' : 'Start';
  toggleKeyBtn.classList.toggle('running', state);
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

function captureHotkey(button, setter) {
  const overlay = document.createElement('div');
  overlay.className = 'modal';
  overlay.innerHTML = '<div class="modal-content"><p>Press a key combination</p></div>';
  document.body.appendChild(overlay);

  function handler(e) {
    e.preventDefault();
    if (['Shift','Control','Alt','Meta'].includes(e.key)) return;
    const accel = toAccelerator(e);
    if (!accel) return;
    button.textContent = accel;
    setter(accel);
    cleanup();
  }

  function cleanup() {
    window.removeEventListener('keydown', handler, true);
    overlay.remove();
  }

  window.addEventListener('keydown', handler, true);
}

const clickHotkeyBtn = document.getElementById('clickHotkeyBtn');
clickHotkeyBtn.addEventListener('click', () => captureHotkey(clickHotkeyBtn, window.auto.setClickHotkey));

const keyHotkeyBtn = document.getElementById('keyHotkeyBtn');
keyHotkeyBtn.addEventListener('click', () => captureHotkey(keyHotkeyBtn, window.auto.setKeyHotkey));

window.auto.getHotkeys().then(({ clickHotkey, keyHotkey }) => {
  if (clickHotkey) clickHotkeyBtn.textContent = clickHotkey;
  if (keyHotkey) keyHotkeyBtn.textContent = keyHotkey;
  resizeToContent();
});
