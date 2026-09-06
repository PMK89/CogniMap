'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { codeSvg } = require('../../src/app/widgets/codeeditor/code-serialization');
test('code serialization includes offscreen lines and escapes executable markup', () => {
  const source = Array.from({ length: 1000 }, (_, i) => 'line ' + i).join('\n') + '\n<script>alert(1)</script>';
  const result = codeSvg(source, (text, token) => token(text, 'string'));
  assert.ok(result.svg.includes('line 999'));
  assert.ok(result.svg.includes('&lt;script&gt;'));
  assert.ok(!result.svg.includes('<script>'));
  assert.equal(result.height, 4096);
  assert.ok(result.svg.includes('overflow:auto'));
});
