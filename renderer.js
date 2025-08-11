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
