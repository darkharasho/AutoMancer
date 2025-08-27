const keySelect = document.getElementById('keySelect');
const header = document.querySelector('header');
const platform = window.env && window.env.platform;
if (platform) {
  document.body.classList.add(platform);
  document.documentElement.classList.add(platform);
}
if (platform === 'darwin') {
  header.style.justifyContent = 'flex-end';
} else {
  header.style.justifyContent = 'flex-start';
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
  const clickIntervalInput = document.getElementById('clickInterval');
  const clickJitterInput = document.getElementById('clickJitter');

  const tabButtons = document.querySelectorAll('.tab');
  const tabs = document.querySelectorAll('.tab-content');
  function resizeToContent() {
    const height = Math.ceil(document.documentElement.scrollHeight);
    window.auto.resizeWindow(height);
  }
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
      resizeToContent();
    });
  });

  function getClickConfig() {
    const interval = parseInt(clickIntervalInput.value, 10);
    const jitter = parseInt(clickJitterInput.value, 10);
    const button = clickButtonSel.value;
    const target = clickTargetSel.value === 'coords'
      ? { type: 'coords', x: parseInt(coordX.value, 10), y: parseInt(coordY.value, 10) }
      : { type: 'current' };
    return {
      interval: Number.isFinite(interval) ? interval : 0,
      jitter: Number.isFinite(jitter) ? Math.max(0, jitter) : 0,
      button,
      target
    };
  }

  function sendClickConfig() {
    window.auto.updateClickConfig(getClickConfig());
  }

  clickTargetSel.addEventListener('change', () => {
    coordFields.style.display = clickTargetSel.value === 'coords' ? 'flex' : 'none';
    resizeToContent();
    sendClickConfig();
  });

  pickCoordBtn.addEventListener('click', async () => {
    const point = await window.auto.pickPoint();
    if (point) {
      coordX.value = point.x;
      coordY.value = point.y;
      sendClickConfig();
    }
  });

  [clickIntervalInput, clickJitterInput, clickButtonSel, coordX, coordY].forEach(el => {
    el.addEventListener('change', sendClickConfig);
  });

  const toggleClickerBtn = document.getElementById('toggleClicker');
  toggleClickerBtn.addEventListener('click', () => {
    const running = toggleClickerBtn.classList.contains('running');
    if (running) {
      window.auto.stopClicker();
    } else {
      window.auto.startClicker(getClickConfig());
    }
  });

const toggleKeyBtn = document.getElementById('toggleKey');
toggleKeyBtn.addEventListener('click', () => {
  const running = toggleKeyBtn.classList.contains('running');
  if (running) {
    window.auto.stopKeyPresser();
  } else {
    const key = keySelect.value;
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

function captureHotkey(button, setter) {
  const overlay = document.createElement('div');
  overlay.className = 'modal';
  overlay.innerHTML = '<div class="modal-content"><p>Press a key combination</p></div>';
  document.body.appendChild(overlay);
  document.body.classList.add('modal-open');

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
    document.body.classList.remove('modal-open');
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
});

sendClickConfig();
resizeToContent();
