const test = require('node:test');
const assert = require('node:assert');
const toAccelerator = require('../toAccelerator.js');

test('converts simple key', () => {
  assert.strictEqual(toAccelerator({ key: 'a' }), 'A');
});

test('converts modifiers with key', () => {
  const evt = { key: 'a', ctrlKey: true, shiftKey: true };
  assert.strictEqual(toAccelerator(evt), 'Ctrl+Shift+A');
});

test('handles special keys', () => {
  assert.strictEqual(toAccelerator({ key: ' ' }), 'Space');
  assert.strictEqual(toAccelerator({ key: 'ArrowLeft' }), 'Left');
});
