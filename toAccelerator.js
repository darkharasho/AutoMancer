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

if (typeof module !== 'undefined') {
  module.exports = toAccelerator;
}
