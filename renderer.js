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
