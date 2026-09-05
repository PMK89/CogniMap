'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { searchNodes } = require('../lib/search');
test('search ranks exact, prefix, substring then fuzzy and handles literal punctuation', () => {
  const docs = ['Orbital', 'Orbital theory', 'Molecular orbital', 'Organic biological theory', '[x]'].map((title, i) => ({ id: i + 1, title, types: ['a'] }));
  assert.deepEqual(searchNodes(docs, 'orbital').slice(0, 3).map(d => d.id), [1, 2, 3]);
  assert.equal(searchNodes(docs, '[')[0].id, 5);
  assert.deepEqual(searchNodes(docs, 'orbital', 'q'), []);
  assert.equal(searchNodes(docs, 'obt', '', 1).length, 1);
});
